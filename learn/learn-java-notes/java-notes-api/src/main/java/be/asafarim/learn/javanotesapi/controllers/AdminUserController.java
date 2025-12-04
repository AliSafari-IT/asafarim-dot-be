package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.admin.AdminUserDto;
import be.asafarim.learn.javanotesapi.services.AdminUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminUserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminUserService.getAllUsers(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AdminUserDto>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminUserService.searchUsers(query, pageable));
    }

    @GetMapping("/locked")
    public ResponseEntity<Page<AdminUserDto>> getLockedUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminUserService.getLockedUsers(pageable));
    }

    @GetMapping("/disabled")
    public ResponseEntity<Page<AdminUserDto>> getDisabledUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminUserService.getDisabledUsers(pageable));
    }

    @GetMapping("/by-role/{roleName}")
    public ResponseEntity<Page<AdminUserDto>> getUsersByRole(
            @PathVariable String roleName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminUserService.getUsersByRole(roleName, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserDto> getUserById(@PathVariable UUID id) {
        return adminUserService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AdminUserDto> createUser(@RequestBody AdminUserDto.CreateUserRequest request) {
        return ResponseEntity.ok(adminUserService.createUser(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUserDto> updateUser(
            @PathVariable UUID id,
            @RequestBody AdminUserDto.UpdateUserRequest request) {
        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<AdminUserDto> lockUser(
            @PathVariable UUID id,
            @RequestBody AdminUserDto.LockUserRequest request) {
        return ResponseEntity.ok(adminUserService.lockUser(id, request));
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<AdminUserDto> unlockUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.unlockUser(id));
    }

    @PostMapping("/{id}/enable")
    public ResponseEntity<AdminUserDto> enableUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.enableUser(id));
    }

    @PostMapping("/{id}/disable")
    public ResponseEntity<AdminUserDto> disableUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.disableUser(id));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable UUID id,
            @RequestBody AdminUserDto.ResetPasswordRequest request) {
        adminUserService.resetPassword(id, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/impersonate")
    @PreAuthorize("hasAuthority('USERS_IMPERSONATE')")
    public ResponseEntity<String> impersonateUser(@PathVariable UUID id) {
        String token = adminUserService.generateImpersonationToken(id);
        return ResponseEntity.ok(token);
    }
}
