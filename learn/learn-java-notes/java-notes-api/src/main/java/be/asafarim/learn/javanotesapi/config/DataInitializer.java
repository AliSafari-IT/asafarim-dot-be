package be.asafarim.learn.javanotesapi.config;

import be.asafarim.learn.javanotesapi.entities.Role;
import be.asafarim.learn.javanotesapi.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize default roles
        if (!roleRepository.findByName("USER").isPresent()) {
            Role userRole = new Role("USER");
            roleRepository.save(userRole);
            System.out.println("Created default USER role");
        }

        if (!roleRepository.findByName("ADMIN").isPresent()) {
            Role adminRole = new Role("ADMIN");
            roleRepository.save(adminRole);
            System.out.println("Created default ADMIN role");
        }
    }
}
