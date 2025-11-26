package be.asafarim.rms.api.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record OrderItemRequest(
        @NotNull(message = "Menu item ID is required")
        UUID menuItemId,

        @Min(value = 1, message = "Quantity must be at least 1")
        int quantity,

        String notes,
        List<ModifierRequest> modifiers
) {
    public OrderItemRequest {
        if (quantity <= 0) {
            quantity = 1;
        }
    }
}
