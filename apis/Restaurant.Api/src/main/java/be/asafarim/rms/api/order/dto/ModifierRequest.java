package be.asafarim.rms.api.order.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.UUID;

@Builder
public record ModifierRequest(
        @NotNull(message = "Modifier option ID is required")
        UUID modifierOptionId
) {
}
