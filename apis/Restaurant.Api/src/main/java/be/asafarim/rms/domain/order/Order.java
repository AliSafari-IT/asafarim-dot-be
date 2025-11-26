package be.asafarim.rms.domain.order;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "restaurant_id", nullable = false)
    private UUID restaurantId;

    @Column(name = "location_id", nullable = false)
    private UUID locationId;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "table_id")
    private UUID tableId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderSource source = OrderSource.POS;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tip_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal tipAmount = BigDecimal.ZERO;

    @Column(name = "delivery_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "discount_code")
    private String discountCode;

    @Column(name = "loyalty_points_used")
    @Builder.Default
    private Integer loyaltyPointsUsed = 0;

    @Column(name = "loyalty_points_earned")
    @Builder.Default
    private Integer loyaltyPointsEarned = 0;

    private String notes;

    @Column(name = "special_instructions")
    private String specialInstructions;

    @Column(name = "estimated_ready_at")
    private Instant estimatedReadyAt;

    @Column(name = "ready_at")
    private Instant readyAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "staff_id")
    private UUID staffId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    public void updateStatus(OrderStatus newStatus, UUID changedBy, String notes) {
        this.status = newStatus;
        var history = OrderStatusHistory.builder()
                .order(this)
                .status(newStatus)
                .changedBy(changedBy)
                .notes(notes)
                .build();
        this.statusHistory.add(history);

        switch (newStatus) {
            case READY -> this.readyAt = Instant.now();
            case COMPLETED -> this.completedAt = Instant.now();
            case CANCELLED -> this.cancelledAt = Instant.now();
            default -> {}
        }
    }

    public void calculateTotals() {
        this.subtotal = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.taxAmount = items.stream()
                .map(OrderItem::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalAmount = subtotal
                .add(taxAmount)
                .add(deliveryFee)
                .add(tipAmount)
                .subtract(discountAmount);
    }
}
