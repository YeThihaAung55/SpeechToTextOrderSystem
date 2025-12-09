import { OrderItemModel } from "./productItems";

export interface OrderModel {
  id?: number;
  orderDate: Date;
  orderItems: OrderItemModel[];
}
