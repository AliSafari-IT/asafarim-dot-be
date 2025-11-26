package be.asafarim.rms.domain.order;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "menu_item_id", nullable = false)
    private UUID menuItemId;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    private String notes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderItemStatus status = OrderItemStatus.PENDING;

    @Column(name = "prepared_at")
    private Instant preparedAt;

    @OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItemModifier> modifiers = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public void addModifier(OrderItemModifier modifier) {
        modifiers.add(modifier);
        modifier.setOrderItem(this);
    }

    public void calculateTotals(BigDecimal taxRate) {
        BigDecimal modifierTotal = modifiers.stream()
                .map(OrderItemModifier::getPriceAdjustment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.subtotal = unitPrice.add(modifierTotal).multiply(BigDecimal.valueOf(quantity));
        this.taxAmount = subtotal.multiply(taxRate).setScale(2, java.math.RoundingMode.HALF_UP);
        this.total = subtotal.add(taxAmount).subtract(discountAmount);
    }
}
