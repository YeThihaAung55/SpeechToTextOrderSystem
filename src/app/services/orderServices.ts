import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductModel } from '../models/products';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://192.168.0.114:5269/api/Order';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetAllOrders`);
  }

   getProducts(): Observable<ProductModel[]> {
      return this.http.get<ProductModel[]>( `http://192.168.0.114:5269/api/Product/GetAllProducts`);
    }

  getOrderById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetOrderById/${id}`);
  }

  checkProductQty(productId: number, productQty: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/CheckProductQty/${productId}/${productQty}`);
  }

  createOrder(order: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/CreateOrder`, order);
  }
}
