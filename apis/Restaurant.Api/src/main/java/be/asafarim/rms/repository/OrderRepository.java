package be.asafarim.rms.repository;

import be.asafarim.rms.domain.order.Order;
import be.asafarim.rms.domain.order.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByRestaurantId(UUID restaurantId, Pageable pageable);

    Page<Order> findByRestaurantIdAndStatus(UUID restaurantId, OrderStatus status, Pageable pageable);

    List<Order> findByRestaurantIdAndStatusIn(UUID restaurantId, List<OrderStatus> statuses);

    @Query("SELECT o FROM Order o WHERE o.restaurantId = :restaurantId " +
            "AND o.createdAt BETWEEN :start AND :end")
    List<Order> findByRestaurantIdAndDateRange(
            @Param("restaurantId") UUID restaurantId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId ORDER BY o.createdAt DESC")
    Page<Order> findByCustomerId(@Param("customerId") UUID customerId, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurantId = :restaurantId " +
            "AND FUNCTION('DATE', o.createdAt) = CURRENT_DATE")
    long countTodayOrders(@Param("restaurantId") UUID restaurantId);

    @Query("SELECT MAX(o.orderNumber) FROM Order o WHERE o.restaurantId = :restaurantId " +
            "AND o.orderNumber LIKE :prefix%")
    Optional<String> findLastOrderNumber(
            @Param("restaurantId") UUID restaurantId,
            @Param("prefix") String prefix
    );
}
