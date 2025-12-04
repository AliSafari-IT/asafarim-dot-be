package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.admin.AuditLogDto;
import be.asafarim.learn.javanotesapi.dto.admin.SystemSettingDto;
import be.asafarim.learn.javanotesapi.dto.admin.SystemStatsDto;
import be.asafarim.learn.javanotesapi.services.AdminSystemService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSystemController {

    private final AdminSystemService adminSystemService;

    public AdminSystemController(AdminSystemService adminSystemService) {
        this.adminSystemService = adminSystemService;
    }

    // ============ Dashboard / Stats ============

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('SYSTEM_ANALYTICS')")
    public ResponseEntity<SystemStatsDto> getSystemStats() {
        return ResponseEntity.ok(adminSystemService.getSystemStats());
    }

    // ============ System Settings ============

    @GetMapping("/settings")
    @PreAuthorize("hasAuthority('SYSTEM_SETTINGS')")
    public ResponseEntity<List<SystemSettingDto>> getAllSettings() {
        return ResponseEntity.ok(adminSystemService.getAllSettings());
    }

    @GetMapping("/settings/by-category")
    @PreAuthorize("hasAuthority('SYSTEM_SETTINGS')")
    public ResponseEntity<Map<String, List<SystemSettingDto>>> getSettingsByCategory() {
        return ResponseEntity.ok(adminSystemService.getSettingsByCategory());
    }

    @GetMapping("/settings/{key}")
    @PreAuthorize("hasAuthority('SYSTEM_SETTINGS')")
    public ResponseEntity<SystemSettingDto> getSetting(@PathVariable String key) {
        return adminSystemService.getSetting(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/settings/{key}")
    @PreAuthorize("hasAuthority('SYSTEM_SETTINGS')")
    public ResponseEntity<SystemSettingDto> updateSetting(
            @PathVariable String key,
            @RequestBody SystemSettingDto.UpdateSettingRequest request) {
        return ResponseEntity.ok(adminSystemService.updateSetting(key, request));
    }

    // ============ Maintenance Mode ============

    @PostMapping("/maintenance")
    @PreAuthorize("hasAuthority('SYSTEM_MAINTENANCE')")
    public ResponseEntity<Void> setMaintenanceMode(@RequestBody SystemSettingDto.MaintenanceModeRequest request) {
        adminSystemService.setMaintenanceMode(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> getMaintenanceStatus() {
        Map<String, Object> status = Map.of(
            "maintenanceMode", adminSystemService.isMaintenanceMode(),
            "announcement", adminSystemService.getSystemAnnouncement()
        );
        return ResponseEntity.ok(status);
    }

    // ============ Audit Logs ============

    @GetMapping("/logs")
    @PreAuthorize("hasAuthority('SYSTEM_LOGS')")
    public ResponseEntity<Page<AuditLogDto>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminSystemService.getAuditLogs(pageable));
    }

    @GetMapping("/logs/search")
    @PreAuthorize("hasAuthority('SYSTEM_LOGS')")
    public ResponseEntity<Page<AuditLogDto>> searchAuditLogs(
            @RequestParam String query,
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminSystemService.searchAuditLogs(query, severity, pageable));
    }

    @GetMapping("/logs/by-severity/{severity}")
    @PreAuthorize("hasAuthority('SYSTEM_LOGS')")
    public ResponseEntity<Page<AuditLogDto>> getAuditLogsBySeverity(
            @PathVariable String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminSystemService.getAuditLogsBySeverity(severity, pageable));
    }

    @GetMapping("/logs/actions")
    @PreAuthorize("hasAuthority('SYSTEM_LOGS')")
    public ResponseEntity<List<String>> getAuditLogActions() {
        return ResponseEntity.ok(adminSystemService.getAuditLogActions());
    }

    @GetMapping("/logs/entity-types")
    @PreAuthorize("hasAuthority('SYSTEM_LOGS')")
    public ResponseEntity<List<String>> getAuditLogEntityTypes() {
        return ResponseEntity.ok(adminSystemService.getAuditLogEntityTypes());
    }
}
