package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.admin.AdminUserDto;
import be.asafarim.learn.javanotesapi.entities.AuditLog;
import be.asafarim.learn.javanotesapi.entities.Role;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.AuditLogRepository;
import be.asafarim.learn.javanotesapi.repositories.RoleRepository;
import be.asafarim.learn.javanotesapi.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public AdminUserService(UserRepository userRepository, RoleRepository roleRepository,
                           AuditLogRepository auditLogRepository, PasswordEncoder passwordEncoder,
                           AuthService authService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    public Page<AdminUserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
    }

    public Page<AdminUserDto> getLockedUsers(Pageable pageable) {
        return userRepository.findByLockedTrue(pageable).map(this::toDto);
    }

    public Page<AdminUserDto> getDisabledUsers(Pageable pageable) {
        return userRepository.findByEnabledFalse(pageable).map(this::toDto);
    }

    public Page<AdminUserDto> getUsersByRole(String roleName, Pageable pageable) {
        return userRepository.findByRoleName(roleName.toUpperCase(), pageable).map(this::toDto);
    }

    public Page<AdminUserDto> searchUsers(String query, Pageable pageable) {
        return userRepository.searchUsers(query, pageable).map(this::toDto);
    }

    public Optional<AdminUserDto> getUserById(UUID id) {
        return userRepository.findByIdWithRoles(id).map(this::toDto);
    }

    @Transactional
    public AdminUserDto createUser(AdminUserDto.CreateUserRequest request) {
        User currentAdmin = authService.getCurrentUser();

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName() != null ? request.getDisplayName() : request.getUsername());

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> roles = request.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName.toUpperCase()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
            user.setRoles(roles);
        } else {
            roleRepository.findByName("USER").ifPresent(role -> user.getRoles().add(role));
        }

        User savedUser = userRepository.save(user);

        // Audit log
        AuditLog log = AuditLog.userCreated(savedUser.getId(), savedUser.getUsername(), 
            currentAdmin.getId(), currentAdmin.getUsername());
        auditLogRepository.save(log);

        return toDto(savedUser);
    }

    @Transactional
    public AdminUserDto updateUser(UUID userId, AdminUserDto.UpdateUserRequest request) {
        User currentAdmin = authService.getCurrentUser();
        User user = userRepository.findByIdWithRoles(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String oldRoles = user.getRoles().stream().map(Role::getName).collect(Collectors.joining(", "));

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getRoles() != null) {
            Set<Role> newRoles = request.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName.toUpperCase()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
            user.setRoles(newRoles);

            String newRolesStr = newRoles.stream().map(Role::getName).collect(Collectors.joining(", "));
            if (!oldRoles.equals(newRolesStr)) {
                AuditLog log = AuditLog.roleChanged(user.getId(), user.getUsername(), 
                    oldRoles, newRolesStr, currentAdmin.getId(), currentAdmin.getUsername());
                auditLogRepository.save(log);
            }
        }

        return toDto(userRepository.save(user));
    }

    @Transactional
    public AdminUserDto lockUser(UUID userId, AdminUserDto.LockUserRequest request) {
        User currentAdmin = authService.getCurrentUser();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getId().equals(currentAdmin.getId())) {
            throw new RuntimeException("Cannot lock your own account");
        }

        user.setLocked(true);
        user.setLockReason(request.getReason());
        user.setLockedAt(LocalDateTime.now());
        user.setLockedBy(currentAdmin.getId());

        AuditLog log = AuditLog.userLocked(user.getId(), user.getUsername(), 
            currentAdmin.getId(), currentAdmin.getUsername());
        log.setDetails("Lock reason: " + request.getReason());
        auditLogRepository.save(log);

        return toDto(userRepository.save(user));
    }

    @Transactional
    public AdminUserDto unlockUser(UUID userId) {
        User currentAdmin = authService.getCurrentUser();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLocked(false);
        user.setLockReason(null);
        user.setLockedAt(null);
        user.setLockedBy(null);
        user.resetFailedLoginAttempts();

        AuditLog log = new AuditLog("USER_UNLOCKED", "USER", user.getId(), 
            currentAdmin.getId(), currentAdmin.getUsername());
        log.setDetails("User '" + user.getUsername() + "' was unlocked");
        auditLogRepository.save(log);

        return toDto(userRepository.save(user));
    }

    @Transactional
    public AdminUserDto enableUser(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(true);
        return toDto(userRepository.save(user));
    }

    @Transactional
    public AdminUserDto disableUser(UUID userId) {
        User currentAdmin = authService.getCurrentUser();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getId().equals(currentAdmin.getId())) {
            throw new RuntimeException("Cannot disable your own account");
        }

        user.setEnabled(false);
        return toDto(userRepository.save(user));
    }

    @Transactional
    public void resetPassword(UUID userId, AdminUserDto.ResetPasswordRequest request) {
        User currentAdmin = authService.getCurrentUser();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.resetFailedLoginAttempts();
        userRepository.save(user);

        AuditLog log = new AuditLog("PASSWORD_RESET", "USER", user.getId(), 
            currentAdmin.getId(), currentAdmin.getUsername());
        log.setDetails("Password reset for user '" + user.getUsername() + "'");
        log.setSeverity("WARN");
        auditLogRepository.save(log);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User currentAdmin = authService.getCurrentUser();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getId().equals(currentAdmin.getId())) {
            throw new RuntimeException("Cannot delete your own account");
        }

        AuditLog log = AuditLog.userDeleted(user.getId(), user.getUsername(), 
            currentAdmin.getId(), currentAdmin.getUsername());
        auditLogRepository.save(log);

        userRepository.delete(user);
    }

    @Transactional
    public String generateImpersonationToken(UUID userId) {
        User currentAdmin = authService.getCurrentUser();
        User targetUser = userRepository.findByIdWithRoles(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Log impersonation
        AuditLog log = AuditLog.impersonationStarted(targetUser.getId(), targetUser.getUsername(),
            currentAdmin.getId(), currentAdmin.getUsername());
        auditLogRepository.save(log);

        // Generate temporary token for the target user
        // This would integrate with your JWT service
        return "IMPERSONATION_TOKEN_" + targetUser.getId(); // Placeholder
    }

    private AdminUserDto toDto(User user) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getDisplayName());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setLocked(user.isLocked());
        dto.setEnabled(user.isEnabled());
        dto.setLockReason(user.getLockReason());
        dto.setLockedAt(user.getLockedAt());
        dto.setLastLogin(user.getLastLogin());
        dto.setLastLoginIp(user.getLastLoginIp());
        dto.setFailedLoginAttempts(user.getFailedLoginAttempts());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
        return dto;
    }
}
