package be.asafarim.rms.api.order.dto;

import be.asafarim.rms.domain.order.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record OrderRequest(
        @NotNull(message = "Restaurant ID is required")
        UUID restaurantId,

        @NotNull(message = "Location ID is required")
        UUID locationId,

        @NotNull(message = "Order type is required")
        OrderType type,

        UUID tableId,
        UUID customerId,

        @NotEmpty(message = "At least one item is required")
        @Valid
        List<OrderItemRequest> items,

        String discountCode,
        Integer loyaltyPointsToUse,
        String notes,
        String paymentMethod
) {
}
