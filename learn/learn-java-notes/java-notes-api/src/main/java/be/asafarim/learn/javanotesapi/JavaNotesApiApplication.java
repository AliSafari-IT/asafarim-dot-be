package be.asafarim.learn.javanotesapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Java Notes API.
 * 
 * @SpringBootApplication combines:
 * - @Configuration: Marks this as a source of bean definitions
 * - @EnableAutoConfiguration: Tells Spring Boot to auto-configure based on dependencies
 * - @ComponentScan: Scans for components in this package and sub-packages
 */
@SpringBootApplication
public class JavaNotesApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavaNotesApiApplication.class, args);
    }

}
