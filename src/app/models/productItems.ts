import { ProductModel } from "./products";

export interface OrderItemModel {
  productId?: number;  
  product: ProductModel   
  quantity: number;
  totalPrice?: number;     
}