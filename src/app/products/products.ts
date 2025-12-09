import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductModel } from '../models/products';
import { ProductServices } from '../services/productServices';

@Component({
  selector: 'app-products',
  // imports: [],
  standalone: false,
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  products: ProductModel[] = [];
  product: ProductModel = { id: 0, name: '', price: 0, qty: 0 };
  isEditMode: boolean = false;

  constructor(private service:ProductServices, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getAllProducts();
  }

  getAllProducts(): void {
    this.service.getProducts().subscribe((data) => {
      this.products = data;
      this.cdr.detectChanges(); 
    });
  }

  getProductById(id: number): void {
    this.service.getProductById(id).subscribe((data) => {
      this.product = data;
    }); 
  }

  addProduct(): void {
    if(this.product.name === '' || this.product.price <= 0 || this.product.qty < 0) {
      return alert('Please provide valid product details.');
    }
    this.service.addProduct(this.product).subscribe(() => {
      this.clearProduct();
      this.getAllProducts();
    }); 
    this.getAllProducts();
  }

  updateProduct(product: ProductModel): void {
    this.service.updateProduct(product).subscribe(() => {
      this.getAllProducts();
    });
    this.clearProduct();
  }

  editProduct(product: ProductModel): void {
    this.product = product;
    this.isEditMode = true;
  }

  deleteProduct(id: number): void {
    this.service.deleteProduct(id).subscribe(() => {
      this.getAllProducts();
    });
  }

  clearProduct(): void {
    this.product = { id: 0, name: '', price: 0, qty: 0 };
    this.isEditMode = false;
  }
}
