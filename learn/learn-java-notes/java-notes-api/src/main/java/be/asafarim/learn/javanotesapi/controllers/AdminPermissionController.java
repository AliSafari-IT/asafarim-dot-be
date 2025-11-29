package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.admin.PermissionDto;
import be.asafarim.learn.javanotesapi.services.AdminPermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/permissions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPermissionController {

    private final AdminPermissionService adminPermissionService;

    public AdminPermissionController(AdminPermissionService adminPermissionService) {
        this.adminPermissionService = adminPermissionService;
    }

    @GetMapping
    public ResponseEntity<List<PermissionDto>> getAllPermissions() {
        return ResponseEntity.ok(adminPermissionService.getAllPermissions());
    }

    @GetMapping("/by-category")
    public ResponseEntity<Map<String, List<PermissionDto>>> getPermissionsByCategory() {
        return ResponseEntity.ok(adminPermissionService.getPermissionsByCategory());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(adminPermissionService.getAllCategories());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<PermissionDto>> getPermissionsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(adminPermissionService.getPermissionsByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermissionDto> getPermissionById(@PathVariable UUID id) {
        return adminPermissionService.getPermissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSIONS_CREATE')")
    public ResponseEntity<PermissionDto> createPermission(@RequestBody PermissionDto.CreatePermissionRequest request) {
        return ResponseEntity.ok(adminPermissionService.createPermission(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSIONS_DELETE')")
    public ResponseEntity<Void> deletePermission(@PathVariable UUID id) {
        adminPermissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }
}
