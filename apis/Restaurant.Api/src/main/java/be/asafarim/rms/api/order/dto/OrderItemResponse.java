package be.asafarim.rms.api.order.dto;

import be.asafarim.rms.domain.order.OrderItemStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Builder
public record OrderItemResponse(
        UUID id,
        UUID menuItemId,
        String menuItemName,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal,
        BigDecimal taxAmount,
        BigDecimal total,
        String notes,
        OrderItemStatus status,
        List<ModifierResponse> modifiers
) {
}
