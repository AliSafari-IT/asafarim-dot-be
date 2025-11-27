package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.dto.JwtResponse;
import be.asafarim.learn.javanotesapi.dto.LoginRequest;
import be.asafarim.learn.javanotesapi.dto.MessageResponse;
import be.asafarim.learn.javanotesapi.dto.RegisterRequest;
import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.security.JwtUtils;
import be.asafarim.learn.javanotesapi.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    AuthService authService;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authService.authenticate(
                loginRequest.getUsername(), 
                loginRequest.getPassword()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User userDetails = (User) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        try {
            User user = authService.registerUser(
                    signUpRequest.getUsername(),
                    signUpRequest.getEmail(),
                    signUpRequest.getPassword()
            );

            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            User user = authService.getCurrentUser();
            List<String> roles = user.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(null,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    roles));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
