import { OrderItem } from "./order-item";

export interface Order {
  id: number;
  orderTrackingNumber: string;
  totalQuantity: number;
  totalAmount: number;
  status: string;
  dateCreated: string;
  lastUpdated: string;
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
  orderItems: OrderItem[];
}
