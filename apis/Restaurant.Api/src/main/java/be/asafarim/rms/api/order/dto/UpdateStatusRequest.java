package be.asafarim.rms.api.order.dto;

import be.asafarim.rms.domain.order.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record UpdateStatusRequest(
        @NotNull(message = "Status is required")
        OrderStatus status,
        String notes
) {
}
