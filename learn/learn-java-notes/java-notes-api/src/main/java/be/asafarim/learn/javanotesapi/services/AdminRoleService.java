package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.admin.AdminRoleDto;
import be.asafarim.learn.javanotesapi.entities.AuditLog;
import be.asafarim.learn.javanotesapi.entities.Permission;
import be.asafarim.learn.javanotesapi.entities.Role;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.AuditLogRepository;
import be.asafarim.learn.javanotesapi.repositories.PermissionRepository;
import be.asafarim.learn.javanotesapi.repositories.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminRoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;

    public AdminRoleService(RoleRepository roleRepository, PermissionRepository permissionRepository,
                           AuditLogRepository auditLogRepository, AuthService authService) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.auditLogRepository = auditLogRepository;
        this.authService = authService;
    }

    public List<AdminRoleDto> getAllRoles() {
        return roleRepository.findAllWithPermissions().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public Optional<AdminRoleDto> getRoleById(UUID id) {
        return roleRepository.findByIdWithPermissions(id).map(this::toDto);
    }

    public Optional<AdminRoleDto> getRoleByName(String name) {
        return roleRepository.findByName(name.toUpperCase())
            .map(role -> {
                AdminRoleDto dto = toDto(role);
                dto.setUserCount(roleRepository.countUsersWithRole(role.getId()));
                return dto;
            });
    }

    @Transactional
    public AdminRoleDto createRole(AdminRoleDto.CreateRoleRequest request) {
        User currentAdmin = authService.getCurrentUser();

        if (roleRepository.existsByName(request.getName().toUpperCase())) {
            throw new RuntimeException("Role already exists");
        }

        Role role = new Role();
        role.setName(request.getName().toUpperCase());
        role.setDescription(request.getDescription());
        role.setColor(request.getColor() != null ? request.getColor() : "#6366f1");
        role.setSystem(false);

        if (request.getPermissions() != null) {
            Set<Permission> permissions = request.getPermissions().stream()
                .map(permName -> permissionRepository.findByName(permName.toUpperCase()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);

        // Audit log
        AuditLog log = new AuditLog("ROLE_CREATED", "ROLE", savedRole.getId(),
            currentAdmin.getId(), currentAdmin.getUsername());
        log.setDetails("Role '" + savedRole.getName() + "' was created");
        auditLogRepository.save(log);

        return toDto(savedRole);
    }

    @Transactional
    public AdminRoleDto updateRole(UUID roleId, AdminRoleDto.UpdateRoleRequest request) {
        User currentAdmin = authService.getCurrentUser();
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new RuntimeException("Role not found"));

        if (role.isSystem()) {
            throw new RuntimeException("Cannot modify system roles");
        }

        String oldName = role.getName();

        if (request.getName() != null && !request.getName().equalsIgnoreCase(role.getName())) {
            if (roleRepository.existsByName(request.getName().toUpperCase())) {
                throw new RuntimeException("Role name already exists");
            }
            role.setName(request.getName().toUpperCase());
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getColor() != null) {
            role.setColor(request.getColor());
        }

        Role savedRole = roleRepository.save(role);

        if (!oldName.equals(savedRole.getName())) {
            AuditLog log = new AuditLog("ROLE_RENAMED", "ROLE", savedRole.getId(),
                currentAdmin.getId(), currentAdmin.getUsername());
            log.setOldValue(oldName);
            log.setNewValue(savedRole.getName());
            log.setDetails("Role renamed from '" + oldName + "' to '" + savedRole.getName() + "'");
            auditLogRepository.save(log);
        }

        return toDto(savedRole);
    }

    @Transactional
    public AdminRoleDto updateRolePermissions(UUID roleId, AdminRoleDto.UpdatePermissionsRequest request) {
        User currentAdmin = authService.getCurrentUser();
        Role role = roleRepository.findByIdWithPermissions(roleId)
            .orElseThrow(() -> new RuntimeException("Role not found"));

        String oldPermissions = role.getPermissions().stream()
            .map(Permission::getName)
            .sorted()
            .collect(Collectors.joining(", "));

        Set<Permission> newPermissions = request.getPermissions().stream()
            .map(permName -> permissionRepository.findByName(permName.toUpperCase()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toSet());

        role.setPermissions(newPermissions);
        Role savedRole = roleRepository.save(role);

        String newPermissionsStr = newPermissions.stream()
            .map(Permission::getName)
            .sorted()
            .collect(Collectors.joining(", "));

        AuditLog log = AuditLog.permissionChanged(role.getId(), role.getName(),
            oldPermissions, newPermissionsStr, currentAdmin.getId(), currentAdmin.getUsername());
        auditLogRepository.save(log);

        return toDto(savedRole);
    }

    @Transactional
    public void deleteRole(UUID roleId) {
        User currentAdmin = authService.getCurrentUser();
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new RuntimeException("Role not found"));

        if (role.isSystem()) {
            throw new RuntimeException("Cannot delete system roles");
        }

        long userCount = roleRepository.countUsersWithRole(roleId);
        if (userCount > 0) {
            throw new RuntimeException("Cannot delete role that is assigned to " + userCount + " users");
        }

        AuditLog log = new AuditLog("ROLE_DELETED", "ROLE", role.getId(),
            currentAdmin.getId(), currentAdmin.getUsername());
        log.setDetails("Role '" + role.getName() + "' was deleted");
        log.setSeverity("WARN");
        auditLogRepository.save(log);

        roleRepository.delete(role);
    }

    private AdminRoleDto toDto(Role role) {
        AdminRoleDto dto = new AdminRoleDto();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setColor(role.getColor());
        dto.setSystem(role.isSystem());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setPermissions(role.getPermissions().stream()
            .map(Permission::getName)
            .collect(Collectors.toList()));
        dto.setUserCount(roleRepository.countUsersWithRole(role.getId()));
        return dto;
    }
}
