package be.asafarim.rms.api.order.dto;

import be.asafarim.rms.domain.order.OrderStatus;
import be.asafarim.rms.domain.order.OrderType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record OrderResponse(
        UUID id,
        String orderNumber,
        OrderStatus status,
        OrderType type,
        BigDecimal subtotal,
        BigDecimal taxAmount,
        BigDecimal discountAmount,
        BigDecimal tipAmount,
        BigDecimal deliveryFee,
        BigDecimal totalAmount,
        Integer loyaltyPointsUsed,
        Integer loyaltyPointsEarned,
        Instant estimatedReadyAt,
        Instant createdAt,
        List<OrderItemResponse> items,
        List<StatusHistoryResponse> statusHistory
) {
}
