package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.UserPreference;
import be.asafarim.learn.javanotesapi.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, UUID> {

    Optional<UserPreference> findByUser(User user);

    Optional<UserPreference> findByUserId(UUID userId);

    boolean existsByUser(User user);

    void deleteByUser(User user);
}
