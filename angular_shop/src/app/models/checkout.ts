export interface CheckoutItemDto {
  productId: number;
  quantity: number;
}

export interface CheckoutRequest {
  firstName: string;
  lastName: string;
  email: string;

  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;

  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  billingCountry: string;

  orderItems: CheckoutItemDto[];

  paymentMethod: string;
}

export interface OrderResponse {
  orderTrackingNumber: string;
  message: string;
}
