package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.admin.AdminRoleDto;
import be.asafarim.learn.javanotesapi.services.AdminRoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRoleController {

    private final AdminRoleService adminRoleService;

    public AdminRoleController(AdminRoleService adminRoleService) {
        this.adminRoleService = adminRoleService;
    }

    @GetMapping
    public ResponseEntity<List<AdminRoleDto>> getAllRoles() {
        return ResponseEntity.ok(adminRoleService.getAllRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminRoleDto> getRoleById(@PathVariable UUID id) {
        return adminRoleService.getRoleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-name/{name}")
    public ResponseEntity<AdminRoleDto> getRoleByName(@PathVariable String name) {
        return adminRoleService.getRoleByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLES_CREATE')")
    public ResponseEntity<AdminRoleDto> createRole(@RequestBody AdminRoleDto.CreateRoleRequest request) {
        return ResponseEntity.ok(adminRoleService.createRole(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLES_EDIT')")
    public ResponseEntity<AdminRoleDto> updateRole(
            @PathVariable UUID id,
            @RequestBody AdminRoleDto.UpdateRoleRequest request) {
        return ResponseEntity.ok(adminRoleService.updateRole(id, request));
    }

    @PutMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('ROLES_PERMISSIONS')")
    public ResponseEntity<AdminRoleDto> updateRolePermissions(
            @PathVariable UUID id,
            @RequestBody AdminRoleDto.UpdatePermissionsRequest request) {
        return ResponseEntity.ok(adminRoleService.updateRolePermissions(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLES_DELETE')")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        adminRoleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
