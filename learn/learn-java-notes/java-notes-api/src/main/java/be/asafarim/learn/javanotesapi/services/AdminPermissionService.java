package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.admin.PermissionDto;
import be.asafarim.learn.javanotesapi.entities.AuditLog;
import be.asafarim.learn.javanotesapi.entities.Permission;
import be.asafarim.learn.javanotesapi.entities.Role;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.AuditLogRepository;
import be.asafarim.learn.javanotesapi.repositories.PermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminPermissionService {

    private final PermissionRepository permissionRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;

    public AdminPermissionService(PermissionRepository permissionRepository,
                                  AuditLogRepository auditLogRepository,
                                  AuthService authService) {
        this.permissionRepository = permissionRepository;
        this.auditLogRepository = auditLogRepository;
        this.authService = authService;
    }

    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAllOrderedByCategoryAndName().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public Map<String, List<PermissionDto>> getPermissionsByCategory() {
        return permissionRepository.findAllOrderedByCategoryAndName().stream()
            .map(this::toDto)
            .collect(Collectors.groupingBy(p -> p.getCategory() != null ? p.getCategory() : "OTHER"));
    }

    public List<String> getAllCategories() {
        return permissionRepository.findAllCategories();
    }

    public List<PermissionDto> getPermissionsByCategory(String category) {
        return permissionRepository.findByCategory(category).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public Optional<PermissionDto> getPermissionById(UUID id) {
        return permissionRepository.findById(id).map(this::toDto);
    }

    @Transactional
    public PermissionDto createPermission(PermissionDto.CreatePermissionRequest request) {
        User currentAdmin = authService.getCurrentUser();

        String normalizedName = request.getName().toUpperCase().replace(" ", "_");
        if (permissionRepository.existsByName(normalizedName)) {
            throw new RuntimeException("Permission already exists");
        }

        Permission permission = new Permission();
        permission.setName(normalizedName);
        permission.setDescription(request.getDescription());
        permission.setCategory(request.getCategory() != null ? request.getCategory().toUpperCase() : "CUSTOM");

        Permission saved = permissionRepository.save(permission);

        AuditLog log = new AuditLog("PERMISSION_CREATED", "PERMISSION", saved.getId(),
            currentAdmin.getId(), currentAdmin.getUsername());
        log.setDetails("Permission '" + saved.getName() + "' was created");
        auditLogRepository.save(log);

        return toDto(saved);
    }

    @Transactional
    public void deletePermission(UUID permissionId) {
        User currentAdmin = authService.getCurrentUser();
        Permission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new RuntimeException("Permission not found"));

        long roleCount = permissionRepository.countRolesUsingPermission(permissionId);
        if (roleCount > 0) {
            throw new RuntimeException("Cannot delete permission used by " + roleCount + " roles. Remove from roles first.");
        }

        AuditLog log = new AuditLog("PERMISSION_DELETED", "PERMISSION", permission.getId(),
            currentAdmin.getId(), currentAdmin.getUsername());
        log.setDetails("Permission '" + permission.getName() + "' was deleted");
        log.setSeverity("WARN");
        auditLogRepository.save(log);

        permissionRepository.delete(permission);
    }

    private PermissionDto toDto(Permission permission) {
        PermissionDto dto = new PermissionDto();
        dto.setId(permission.getId());
        dto.setName(permission.getName());
        dto.setDescription(permission.getDescription());
        dto.setCategory(permission.getCategory());
        dto.setCreatedAt(permission.getCreatedAt());
        dto.setRoleCount(permissionRepository.countRolesUsingPermission(permission.getId()));
        dto.setUsedByRoles(permission.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toList()));
        return dto;
    }
}
