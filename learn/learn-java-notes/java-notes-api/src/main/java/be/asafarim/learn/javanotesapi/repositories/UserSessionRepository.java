package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.User;
import be.asafarim.learn.javanotesapi.entities.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    List<UserSession> findByUserOrderByLastActiveDesc(User user);

    Optional<UserSession> findByTokenHash(String tokenHash);

    @Query("SELECT s FROM UserSession s WHERE s.user = :user AND s.expiresAt > :now ORDER BY s.lastActive DESC")
    List<UserSession> findActiveSessionsByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.user = :user")
    void deleteAllByUser(@Param("user") User user);

    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.expiresAt < :now")
    void deleteExpiredSessions(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(s) FROM UserSession s WHERE s.user = :user AND s.expiresAt > :now")
    long countActiveSessionsByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    boolean existsByUserAndTokenHash(User user, String tokenHash);
}
