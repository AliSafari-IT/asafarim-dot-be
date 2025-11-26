package be.asafarim.rms.api.order.dto;

import be.asafarim.rms.domain.order.OrderStatus;
import lombok.Builder;

import java.time.Instant;

@Builder
public record StatusHistoryResponse(
        OrderStatus status,
        String notes,
        Instant createdAt
) {
}
