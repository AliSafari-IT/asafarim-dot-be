package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.entities.Role;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.repositories.RoleRepository;
import be.asafarim.learn.javanotesapi.repositories.UserRepository;
import be.asafarim.learn.javanotesapi.security.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@Transactional
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    public Authentication authenticate(String username, String password) {
        return authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );
    }

    public User registerUser(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(username, email, encoder.encode(password));

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            
            // Get username from principal
            String username;
            if (principal instanceof User) {
                username = ((User) principal).getUsername();
            } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            } else {
                username = principal.toString();
            }
            
            // Fetch user with roles eagerly loaded
            return userRepository.findByUsernameWithRoles(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
        }
        throw new RuntimeException("No authenticated user found");
    }
}
