/** All valid order status values returned by the API. */
export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS);
