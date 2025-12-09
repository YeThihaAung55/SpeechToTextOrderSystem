import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/orderServices';
import { ProductModel } from '../../models/products';
import { OrderItemModel } from '../../models/productItems';
import { OrderModel } from '../../models/orders';
import Fuse from 'fuse.js';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  // products: ProductModel[] = [];

  // ngOnInit(): void {
  //   this.getAllProducts();
  // }

  // items = [{ productId: null, quantity: 1, available: true }];
  // orders: any[] = [];
  // foundOrder: any;
  // searchId: number = 0;

  // constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  // getAllProducts() {
  //   return this.orderService.getProducts().subscribe(res => {
  //     this.products = res;
  //     this.cdr.detectChanges(); 
  //   });
  // }

  // getAllOrders() {
  //   this.orderService.getAllOrders().subscribe(res => this.orders = res);
  // }

  // checkAvailability(i: number) {
  //   const id = this.items[i].productId;
  //   if (!id) return;

  //   this.orderService.checkProductQty(id).subscribe((res: boolean) => {
  //     this.items[i].available = res;
  //   });
  // }

  // addItem() {
  //   this.items.push({ productId: null, quantity: 1, available: true });
  // }

  // removeItem(i: number) {
  //   this.items.splice(i, 1);
  // }

  // createOrder() {
  //   const order = {
  //     orderDate: new Date(),
  //     orderItems: this.items.map(x => ({ productId: x.productId, quantity: x.quantity }))
  //   };

  //   this.orderService.createOrder(order).subscribe(() => {
  //     alert("Order created!");
  //     this.getAllOrders();
  //     this.items = [{ productId: null, quantity: 1, available: true }];
  //   });
  // }

  // searchOrder() {
  //   if (!this.searchId) return;

  //   this.orderService.getOrderById(this.searchId).subscribe({
  //     next: res => this.foundOrder = res,
  //     error: () => alert("Order not found")
  //   });
  // }

  orderItems: OrderItemModel[] = [];
  orderItemsList: OrderItemModel[] = [];
  isListening = false;
  recognition: any;
  products: ProductModel[] = [];
  numberMap: Record<string, number> = {
  "၁": 1, "တစ်": 1, "one": 1, "ဝမ်း": 1, // add common mis-recognitions
  "၂": 2, "နှစ်": 2, "two": 2, "တူး": 2,
  "၃": 3, "သုံး": 3, "three": 3,
  "၄": 4, "လေး": 4, "four": 4, "ဖေါ်": 4, "ဖို့" : 4,
  "၅": 5, "ငါး": 5, "five": 5, "ဖိုင်": 5,"ဖိုက်": 5,
  "၆": 6, "ခြောက်": 6, "six": 6,  "ချောက်": 6,
  "၇": 7, "ခုနှစ်": 7, "seven": 7, "ခွန်": 7, "ခွမ်": 7,
  // add more as needed
};

   constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getAllProducts();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    // this.recognition.lang = 'en-US';
    this.recognition.lang = "my-MM";

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      this.recognition.stop();
      this.isListening = false;
      this.handleVoiceCommand(transcript);
    };

    this.recognition.onerror = (event: any) => console.error("Speech recognition error", event);
  }

  // Voice Controls
  startListening() {
    if (this.recognition) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Handle voice command and check product availability
  // handleVoiceCommand(command: string) {
  //   console.log(command, "This is actual command.");

  //   const lower = command.toLowerCase();
  //   if(lower.includes("မှာမည်") || lower.includes("မှာမယ်") || lower.includes("မာမယ်") || lower.includes("မာမည်")) {
  //     this.submitOrder();
  //   }
    
  //   const parts = lower.toLowerCase().split(' ');
  //   if (parts.length < 2) return;

  //   const quantity = parseInt(parts[parts.length - 1]);
  //   if (isNaN(quantity)) return;

  //   const productName = parts.slice(0, parts.length - 1).join(' ');

  //   // Find product from list
  //   const product = this.products.find(p => p.name.toLowerCase() === productName);
    
  //   if (!product) {
  //     alert(`Product "${productName}" not found`);
  //     return;
  //   }

  //   // Check product availability via API
  //   this.orderService.checkProductQty(product.id, quantity).subscribe((available: boolean) => {
  //     if (available) {
  //       this.orderItems.push({ productId: product.id, product: product, quantity, totalPrice: product.price * quantity });
  //       alert(`Added ${quantity} ${product.name}(s) to order`);
  //       this.cdr.detectChanges();
  //     } else {
  //       alert(`${product.name} is not available in required quantity`);
  //     }
  //   });
  // }



 extractQuantity(text: string): number | null {
  const match = text.match(/\d+/);
  if (match) return parseInt(match[0]);

  for (const key in this.numberMap) {
    if (text.includes(key)) return this.numberMap[key];
  }
  return null;
}

handleVoiceCommand(command: string) {
  console.log(command, "Recognized command");
  const lower = command.toLowerCase();
  if (lower.includes("မှာမည်") || lower.includes("မှာမယ်") || lower.includes("မှမယ်") || lower.includes("မာမယ်") || lower.includes("မာမည်")) {
    this.submitOrder();
    return;
  }

  const items = lower.split(/,|and/);

  const fuse = new Fuse(this.products, {
    keys: ["name"],
    threshold: 0.4, 
    ignoreLocation: true
  });

  items.forEach(itemRaw => {
    const item = itemRaw.trim();
    const quantity = this.extractQuantity(item);

    if (!quantity) {
      alert(`No quantity detected in "${item}"`);
      return;
    }

    let productName = item;
    Object.keys(this.numberMap).forEach(k => {
      productName = productName.replace(new RegExp(k, "g"), "");
    });
    productName = productName.replace(/\d+/g, "").trim();

   
    const results = fuse.search(productName);
    if (results.length === 0) {
      alert(`Product "${productName}" not found`);
      return;
    }

    const product = results[0].item;

    this.orderService.checkProductQty(product.id, quantity).subscribe((available: boolean) => {
      if (available) {
        this.orderItems.push({
          productId: product.id,
          product: product,
          quantity,
          totalPrice: product.price * quantity
        });
        alert(`Added ${quantity} ${product.name}(s)`);
        this.cdr.detectChanges();
      } else {
        alert(`${product.name} not available in required quantity`);
      }
    });
  });
}

  get totalAmount(): number {
  return (this.orderItems ?? []).reduce(
    (sum, item) => sum + (item?.totalPrice || 0),
    0
  );
}

  removeItem(index: number) {
    this.orderItems.splice(index, 1);
  }

  // Submit Order to Backend
  submitOrder() {
    if (this.orderItems.length === 0) {
      alert("Add items before submitting order");
      return;
    }

    const order: OrderModel = {
      orderDate: new Date(),
      orderItems: this.orderItems
    };

    this.orderService.createOrder(order).subscribe({
      next: () => {
        alert("Order created successfully!");
        this.orderItems = [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

    getAllProducts() {
    return this.orderService.getProducts().subscribe(res => {
      this.products = res;
      this.cdr.detectChanges(); 
    });
  }
}
