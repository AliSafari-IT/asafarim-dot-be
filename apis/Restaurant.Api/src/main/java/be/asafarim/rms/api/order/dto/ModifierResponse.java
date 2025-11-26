package be.asafarim.rms.api.order.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record ModifierResponse(
        UUID id,
        String name,
        BigDecimal priceAdjustment
) {
}
