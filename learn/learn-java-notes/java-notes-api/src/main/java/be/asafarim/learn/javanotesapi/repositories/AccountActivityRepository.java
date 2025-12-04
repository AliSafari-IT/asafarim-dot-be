package be.asafarim.learn.javanotesapi.repositories;

import be.asafarim.learn.javanotesapi.entities.AccountActivity;
import be.asafarim.learn.javanotesapi.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AccountActivityRepository extends JpaRepository<AccountActivity, UUID> {

    List<AccountActivity> findByUserOrderByCreatedAtDesc(User user);

    Page<AccountActivity> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    @Query("SELECT a FROM AccountActivity a WHERE a.user = :user AND a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<AccountActivity> findRecentActivityByUser(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT a FROM AccountActivity a WHERE a.user = :user AND a.type = :type ORDER BY a.createdAt DESC")
    List<AccountActivity> findByUserAndType(@Param("user") User user, @Param("type") AccountActivity.ActivityType type);

    @Query("SELECT COUNT(a) FROM AccountActivity a WHERE a.user = :user AND a.type = 'FAILED_LOGIN' AND a.createdAt >= :since")
    long countFailedLoginsSince(@Param("user") User user, @Param("since") LocalDateTime since);
}
