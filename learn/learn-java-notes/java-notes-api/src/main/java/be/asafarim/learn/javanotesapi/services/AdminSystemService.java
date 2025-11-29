package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.admin.AuditLogDto;
import be.asafarim.learn.javanotesapi.dto.admin.SystemSettingDto;
import be.asafarim.learn.javanotesapi.dto.admin.SystemStatsDto;
import be.asafarim.learn.javanotesapi.entities.AuditLog;
import be.asafarim.learn.javanotesapi.entities.SystemSetting;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminSystemService {

    private final UserRepository userRepository;
    private final StudyNoteRepository noteRepository;
    private final TagRepository tagRepository;
    private final AttachmentRepository attachmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final SystemSettingRepository settingRepository;
    private final AuthService authService;

    public AdminSystemService(UserRepository userRepository, StudyNoteRepository noteRepository,
                             TagRepository tagRepository, AttachmentRepository attachmentRepository,
                             AuditLogRepository auditLogRepository, SystemSettingRepository settingRepository,
                             AuthService authService) {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.tagRepository = tagRepository;
        this.attachmentRepository = attachmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.settingRepository = settingRepository;
        this.authService = authService;
    }

    public SystemStatsDto getSystemStats() {
        SystemStatsDto stats = new SystemStatsDto();
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);

        // User stats
        stats.setTotalUsers(userRepository.count());
        stats.setActiveUsers(userRepository.countActiveUsersSince(oneWeekAgo));
        stats.setNewUsersThisWeek(userRepository.countNewUsersSince(oneWeekAgo));
        stats.setLockedUsers(userRepository.countLockedUsers());
        stats.setDisabledUsers(userRepository.countDisabledUsers());

        // Note stats
        stats.setTotalNotes(noteRepository.count());
        stats.setPublicNotes(noteRepository.countByIsPublicTrue());
        stats.setPrivateNotes(noteRepository.countByIsPublicFalse());
        stats.setFeaturedNotes(noteRepository.countByVisibility(be.asafarim.learn.javanotesapi.enums.NoteVisibility.FEATURED));

        // Tag stats
        stats.setTotalTags(tagRepository.count());
        List<Object[]> topTagsData = tagRepository.findTopTags(PageRequest.of(0, 5));
        stats.setTopTags(topTagsData.stream()
            .map(arr -> new SystemStatsDto.TagCount((String) arr[0], ((Number) arr[1]).longValue()))
            .collect(Collectors.toList()));

        // Activity stats
        stats.setFailedLoginAttempts(auditLogRepository.countFailedLoginsSince(oneWeekAgo));

        // Most active users
        List<User> activeUsers = userRepository.findMostRecentlyActiveUsers(PageRequest.of(0, 5));
        stats.setMostActiveUsers(activeUsers.stream().map(user -> {
            SystemStatsDto.UserActivity activity = new SystemStatsDto.UserActivity();
            activity.setUsername(user.getUsername());
            activity.setDisplayName(user.getDisplayName());
            activity.setNoteCount(noteRepository.countByUserId(user.getId()));
            activity.setLastLogin(user.getLastLogin() != null ? 
                user.getLastLogin().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null);
            return activity;
        }).collect(Collectors.toList()));

        // Storage stats
        stats.setTotalAttachments(attachmentRepository.count());
        stats.setTotalStorageBytes(attachmentRepository.getTotalStorageSize());

        // User growth chart data (last 30 days)
        List<Object[]> growthData = userRepository.getUserGrowthStats(oneMonthAgo);
        stats.setUserGrowth(growthData.stream()
            .map(arr -> new SystemStatsDto.TimeSeriesPoint(arr[0].toString(), ((Number) arr[1]).longValue()))
            .collect(Collectors.toList()));

        // Visibility distribution
        Map<String, Long> visibility = new HashMap<>();
        visibility.put("PRIVATE", stats.getPrivateNotes());
        visibility.put("PUBLIC", stats.getPublicNotes());
        visibility.put("FEATURED", stats.getFeaturedNotes());
        stats.setVisibilityDistribution(visibility);

        return stats;
    }

    // System Settings
    public List<SystemSettingDto> getAllSettings() {
        return settingRepository.findAllByOrderByCategoryAscKeyAsc().stream()
            .map(this::toSettingDto)
            .collect(Collectors.toList());
    }

    public Map<String, List<SystemSettingDto>> getSettingsByCategory() {
        return settingRepository.findAllByOrderByCategoryAscKeyAsc().stream()
            .map(this::toSettingDto)
            .collect(Collectors.groupingBy(s -> s.getCategory() != null ? s.getCategory() : "OTHER"));
    }

    public Optional<SystemSettingDto> getSetting(String key) {
        return settingRepository.findByKey(key).map(this::toSettingDto);
    }

    @Transactional
    public SystemSettingDto updateSetting(String key, SystemSettingDto.UpdateSettingRequest request) {
        User currentAdmin = authService.getCurrentUser();
        SystemSetting setting = settingRepository.findByKey(key)
            .orElseThrow(() -> new RuntimeException("Setting not found"));

        String oldValue = setting.getValue();
        setting.setValue(request.getValue());
        setting.setUpdatedBy(currentAdmin.getId());

        SystemSetting saved = settingRepository.save(setting);

        AuditLog log = new AuditLog("SETTING_CHANGED", "SYSTEM", setting.getId(),
            currentAdmin.getId(), currentAdmin.getUsername());
        log.setOldValue(oldValue);
        log.setNewValue(request.getValue());
        log.setDetails("Setting '" + key + "' changed from '" + oldValue + "' to '" + request.getValue() + "'");
        auditLogRepository.save(log);

        return toSettingDto(saved);
    }

    @Transactional
    public void setMaintenanceMode(SystemSettingDto.MaintenanceModeRequest request) {
        User currentAdmin = authService.getCurrentUser();

        // Update maintenance mode
        SystemSetting maintenance = settingRepository.findByKey("MAINTENANCE_MODE")
            .orElse(SystemSetting.maintenanceMode(request.isEnabled()));
        maintenance.setValue(String.valueOf(request.isEnabled()));
        maintenance.setUpdatedBy(currentAdmin.getId());
        settingRepository.save(maintenance);

        // Update announcement
        if (request.getAnnouncement() != null) {
            SystemSetting announcement = settingRepository.findByKey("SYSTEM_ANNOUNCEMENT")
                .orElse(SystemSetting.systemAnnouncement(request.getAnnouncement()));
            announcement.setValue(request.getAnnouncement());
            announcement.setUpdatedBy(currentAdmin.getId());
            settingRepository.save(announcement);
        }

        AuditLog log = new AuditLog("MAINTENANCE_MODE", "SYSTEM", null,
            currentAdmin.getId(), currentAdmin.getUsername());
        log.setDetails("Maintenance mode " + (request.isEnabled() ? "enabled" : "disabled"));
        log.setSeverity(request.isEnabled() ? "WARN" : "INFO");
        auditLogRepository.save(log);
    }

    public boolean isMaintenanceMode() {
        return settingRepository.getBooleanSetting("MAINTENANCE_MODE", false);
    }

    public String getSystemAnnouncement() {
        return settingRepository.getSettingValue("SYSTEM_ANNOUNCEMENT", "");
    }

    // Audit Logs
    public Page<AuditLogDto> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toAuditLogDto);
    }

    public Page<AuditLogDto> getAuditLogsBySeverity(String severity, Pageable pageable) {
        return auditLogRepository.findBySeverity(severity, pageable).map(this::toAuditLogDto);
    }

    public Page<AuditLogDto> searchAuditLogs(String query, String severity, Pageable pageable) {
        if (severity != null && !severity.isEmpty()) {
            return auditLogRepository.searchLogsBySeverity(query, severity, pageable).map(this::toAuditLogDto);
        }
        return auditLogRepository.searchLogs(query, pageable).map(this::toAuditLogDto);
    }

    public List<String> getAuditLogActions() {
        return auditLogRepository.findAllActions();
    }

    public List<String> getAuditLogEntityTypes() {
        return auditLogRepository.findAllEntityTypes();
    }

    private SystemSettingDto toSettingDto(SystemSetting setting) {
        SystemSettingDto dto = new SystemSettingDto();
        dto.setId(setting.getId());
        dto.setKey(setting.getKey());
        dto.setValue(setting.getValue());
        dto.setDescription(setting.getDescription());
        dto.setCategory(setting.getCategory());
        dto.setValueType(setting.getValueType());
        dto.setUpdatedAt(setting.getUpdatedAt());
        return dto;
    }

    private AuditLogDto toAuditLogDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setUserId(log.getUserId());
        dto.setUserName(log.getUserName());
        dto.setIpAddress(log.getIpAddress());
        dto.setUserAgent(log.getUserAgent());
        dto.setDetails(log.getDetails());
        dto.setOldValue(log.getOldValue());
        dto.setNewValue(log.getNewValue());
        dto.setSeverity(log.getSeverity());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
