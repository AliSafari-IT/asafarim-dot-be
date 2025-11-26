package be.asafarim.rms.service;

import be.asafarim.rms.api.order.dto.*;
import be.asafarim.rms.domain.order.*;
import be.asafarim.rms.exception.OrderNotFoundException;
import be.asafarim.rms.exception.InvalidOrderStateException;
import be.asafarim.rms.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    // In a real implementation, you'd inject MenuService, InventoryService, etc.

    private static final BigDecimal DEFAULT_TAX_RATE = new BigDecimal("0.09"); // 9% VAT

    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        log.info("Placing order for restaurant: {}", request.restaurantId());

        // Generate order number
        String orderNumber = generateOrderNumber(request.restaurantId());

        // Create order entity
        Order order = Order.builder()
                .restaurantId(request.restaurantId())
                .locationId(request.locationId())
                .orderNumber(orderNumber)
                .type(request.type())
                .tableId(request.tableId())
                .customerId(request.customerId())
                .discountCode(request.discountCode())
                .loyaltyPointsUsed(request.loyaltyPointsToUse() != null ? request.loyaltyPointsToUse() : 0)
                .notes(request.notes())
                .source(OrderSource.POS)
                .status(OrderStatus.PENDING)
                .build();

        // Process order items
        for (OrderItemRequest itemRequest : request.items()) {
            OrderItem orderItem = createOrderItem(itemRequest);
            order.addItem(orderItem);
        }

        // Calculate totals
        order.calculateTotals();

        // Calculate loyalty points earned (1 point per euro)
        int pointsEarned = order.getTotalAmount().intValue();
        order.setLoyaltyPointsEarned(pointsEarned);

        // Set estimated ready time (15 mins from now for demo)
        order.setEstimatedReadyAt(Instant.now().plusSeconds(900));

        // Add initial status to history
        order.updateStatus(OrderStatus.PENDING, null, "Order created");

        // Save order
        Order savedOrder = orderRepository.save(order);

        log.info("Order placed successfully: {}", savedOrder.getOrderNumber());

        // In a real system, publish OrderPlacedEvent to Kafka here
        // kafkaTemplate.send("orders.placed", new OrderPlacedEvent(savedOrder));

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrders(UUID restaurantId, Pageable pageable) {
        return orderRepository.findByRestaurantId(restaurantId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByStatus(UUID restaurantId, OrderStatus status, Pageable pageable) {
        return orderRepository.findByRestaurantIdAndStatus(restaurantId, status, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, UpdateStatusRequest request, UUID changedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        validateStatusTransition(order.getStatus(), request.status());

        order.updateStatus(request.status(), changedBy, request.notes());

        Order savedOrder = orderRepository.save(order);

        log.info("Order {} status updated to {}", savedOrder.getOrderNumber(), request.status());

        // In a real system, publish OrderStatusChangedEvent to Kafka
        // kafkaTemplate.send("orders.status-changed", new OrderStatusChangedEvent(savedOrder));

        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(UUID orderId, String reason, UUID cancelledBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException(
                    "Cannot cancel order in status: " + order.getStatus());
        }

        order.setCancellationReason(reason);
        order.updateStatus(OrderStatus.CANCELLED, cancelledBy, reason);

        Order savedOrder = orderRepository.save(order);

        log.info("Order {} cancelled: {}", savedOrder.getOrderNumber(), reason);

        return mapToResponse(savedOrder);
    }

    // Helper methods

    private String generateOrderNumber(UUID restaurantId) {
        String prefix = "ORD-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
        
        return orderRepository.findLastOrderNumber(restaurantId, prefix)
                .map(lastNumber -> {
                    String seqPart = lastNumber.substring(prefix.length());
                    int nextSeq = Integer.parseInt(seqPart) + 1;
                    return prefix + String.format("%04d", nextSeq);
                })
                .orElse(prefix + "0001");
    }

    private OrderItem createOrderItem(OrderItemRequest itemRequest) {
        // In a real implementation, fetch menu item from MenuService
        BigDecimal unitPrice = new BigDecimal("12.50"); // Demo price

        OrderItem orderItem = OrderItem.builder()
                .menuItemId(itemRequest.menuItemId())
                .quantity(itemRequest.quantity())
                .unitPrice(unitPrice)
                .notes(itemRequest.notes())
                .status(OrderItemStatus.PENDING)
                .build();

        // Process modifiers
        if (itemRequest.modifiers() != null) {
            for (ModifierRequest modRequest : itemRequest.modifiers()) {
                OrderItemModifier modifier = OrderItemModifier.builder()
                        .modifierOptionId(modRequest.modifierOptionId())
                        .name("Extra Cheese") // In real impl, fetch from DB
                        .priceAdjustment(new BigDecimal("2.00")) // In real impl, fetch from DB
                        .build();
                orderItem.addModifier(modifier);
            }
        }

        orderItem.calculateTotals(DEFAULT_TAX_RATE);
        return orderItem;
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus target) {
        boolean valid = switch (current) {
            case PENDING -> target == OrderStatus.CONFIRMED || target == OrderStatus.CANCELLED;
            case CONFIRMED -> target == OrderStatus.IN_PROGRESS || target == OrderStatus.CANCELLED;
            case IN_PROGRESS -> target == OrderStatus.READY || target == OrderStatus.CANCELLED;
            case READY -> target == OrderStatus.COMPLETED;
            case COMPLETED, CANCELLED, REFUNDED -> false;
        };

        if (!valid) {
            throw new InvalidOrderStateException(
                    String.format("Invalid status transition from %s to %s", current, target));
        }
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::mapItemToResponse)
                .toList();

        List<StatusHistoryResponse> historyResponses = order.getStatusHistory().stream()
                .map(h -> StatusHistoryResponse.builder()
                        .status(h.getStatus())
                        .notes(h.getNotes())
                        .createdAt(h.getCreatedAt())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .type(order.getType())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .discountAmount(order.getDiscountAmount())
                .tipAmount(order.getTipAmount())
                .deliveryFee(order.getDeliveryFee())
                .totalAmount(order.getTotalAmount())
                .loyaltyPointsUsed(order.getLoyaltyPointsUsed())
                .loyaltyPointsEarned(order.getLoyaltyPointsEarned())
                .estimatedReadyAt(order.getEstimatedReadyAt())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .statusHistory(historyResponses)
                .build();
    }

    private OrderItemResponse mapItemToResponse(OrderItem item) {
        List<ModifierResponse> modifierResponses = item.getModifiers().stream()
                .map(m -> ModifierResponse.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .priceAdjustment(m.getPriceAdjustment())
                        .build())
                .toList();

        return OrderItemResponse.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItemId())
                .menuItemName("Menu Item") // In real impl, fetch from MenuService
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .taxAmount(item.getTaxAmount())
                .total(item.getTotal())
                .notes(item.getNotes())
                .status(item.getStatus())
                .modifiers(modifierResponses)
                .build();
    }
}
