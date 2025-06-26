import { Product } from "./product";

export interface OrderItem {
  id: number;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  product: Product;
}
