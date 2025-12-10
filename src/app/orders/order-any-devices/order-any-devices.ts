import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductModel } from '../../models/products';
import { OrderItemModel } from '../../models/productItems';
import { OrderService } from '../../services/orderServices';
import Fuse from 'fuse.js';
import { OrderModel } from '../../models/orders';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';


@Component({
  selector: 'app-order-any-devices',
  // imports: [],
  standalone: false,
  templateUrl: './order-any-devices.html',
  styleUrl: './order-any-devices.css',
})
export class OrderAnyDevices implements OnInit {
@ViewChild('dictationInput') dictationInput!: ElementRef;

  products: ProductModel[] = [];
  orderItems: OrderItemModel[] = [];

  isListening = false;
  recognition: any;
  isNative = false;
  isIOSBrowser = false;

  statusText = "";

  numberMap: Record<string, number> = {
    "၁": 1, "တစ်": 1, "one": 1, "ဝမ်း": 1,
    "၂": 2, "နှစ်": 2, "two": 2, "တူး": 2,
    "၃": 3, "သုံး": 3, "three": 3,
    "၄": 4, "လေး": 4, "four": 4, "ဖေါ်": 4, "ဖို့": 4,
    "၅": 5, "ငါး": 5, "five": 5, "ဖိုင်": 5, "ဖိုက်": 5,
    "၆": 6, "ခြောက်": 6, "six": 6, "ချောက်": 6,
    "၇": 7, "ခုနှစ်": 7, "seven": 7, "ခွန်": 7, "ခွမ်": 7,
  };

  constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getAllProducts();

    // Detect Native Capacitor App
    this.isNative = !!window.Capacitor?.isNativePlatform;

    // Detect iOS Browser
    this.isIOSBrowser = this.detectIOS() && !this.isNative;

    // Setup Web Speech API only if not iOS browser
    if (!this.isNative && !this.isIOSBrowser) {
      this.setupWebSpeech();
    }

    // Setup Native STT for iOS/Android Apps
    if (this.isNative) {
      this.setupNativeSpeech();
    }
  }

  /* ==============================
        DEVICE DETECTION
  =============================== */
  detectIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /* ==============================
        WEB SPEECH API
  =============================== */
  setupWebSpeech() {
    const API =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!API) return;

    this.recognition = new API();
    this.recognition.lang = "my-MM";
    this.recognition.continuous = false;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      this.stopListening();
      this.handleVoiceCommand(transcript);
    };
  }

  /* ==============================
        NATIVE APP (IOS + ANDROID)
  =============================== */
  async setupNativeSpeech() {
    const { SpeechRecognition } = await import("@capacitor-community/speech-recognition");

    const perm = await SpeechRecognition.checkPermissions();
    if (!perm.speechRecognition || perm.speechRecognition !== 'granted') {
      await SpeechRecognition.requestPermissions();
    }
  }

  async startNativeSpeech() {
    const { SpeechRecognition } = await import("@capacitor-community/speech-recognition");

    this.isListening = true;
    this.statusText = "Listening (App)...";

    SpeechRecognition.start({
      language: "my-MM",
      partialResults: true
    });

    SpeechRecognition.addListener("partialResults", (data: any) => {
      const text = data.matches[0];
      if (text) {
        this.stopListening();
        this.handleVoiceCommand(text);
      }
    });
  }

  async stopNativeSpeech() {
    const { SpeechRecognition } = await import("@capacitor-community/speech-recognition");
    SpeechRecognition.stop();
  }

  /* ==============================
        IOS BROWSER — KEYBOARD INPUT
  =============================== */
  startIOSDictation() {
    this.isListening = true;
    this.statusText = "Tap the keyboard microphone…";
    this.dictationInput.nativeElement.focus();
  }

  onDictationInput(value: string) {
    if (value.trim()) {
      this.stopListening();
      this.handleVoiceCommand(value);
    }
  }

  /* ==============================
        MAIN START LISTEN
  =============================== */
  startListening() {
    if (this.isNative) {
      this.startNativeSpeech();
    } else if (this.isIOSBrowser) {
      this.startIOSDictation();
    } else if (this.recognition) {
      this.statusText = "Listening (Browser)…";
      this.isListening = true;
      this.recognition.start();
    }
  }

  /* ==============================
        MAIN STOP LISTEN
  =============================== */
  stopListening() {
    this.isListening = false;
    this.statusText = "";

    if (this.isNative) this.stopNativeSpeech();
    else if (this.recognition) this.recognition.stop();
  }

  /* ==============================
        VOICE COMMAND PROCESSING
  =============================== */

  extractQuantity(text: string): number | null {
    const match = text.match(/\d+/);
    if (match) return parseInt(match[0]);

    for (const key in this.numberMap) {
      if (text.includes(key)) return this.numberMap[key];
    }
    return null;
  }

  handleVoiceCommand(command: string) {
    console.log("Voice:", command);

    const lower = command.toLowerCase();

    // Submit order voice
    if (lower.includes("မှာမည်") || lower.includes("မှာမယ်") ||
        lower.includes("မှမယ်") || lower.includes("မာမယ်") ||
        lower.includes("မာမည်")) {
      this.submitOrder();
      return;
    }

    const fuse = new Fuse(this.products, {
      keys: ["name"],
      threshold: 0.4,
      ignoreLocation: true
    });

    const items = lower.split(/,|and/);

    items.forEach(raw => {
      const item = raw.trim();
      const quantity = this.extractQuantity(item);

      if (!quantity) return alert(`Quantity missing in "${item}"`);

      let name = item;

      Object.keys(this.numberMap).forEach(k => {
        name = name.replace(new RegExp(k, "g"), "");
      });

      name = name.replace(/\d+/g, "").trim();

      const match = fuse.search(name);

      if (match.length === 0) return alert(`Product "${name}" not found`);

      const product = match[0].item;

      this.orderService.checkProductQty(product.id, quantity).subscribe((available: boolean) => {
        if (!available) return alert(`${product.name} does not have enough stock`);

        this.orderItems.push({
          productId: product.id,
          product: product,
          quantity,
          totalPrice: product.price * quantity
        });

        this.cdr.detectChanges();
        alert(`Added ${quantity} × ${product.name}`);
      });
    });
  }

  /* ==============================
        ORDERS
  =============================== */
  get totalAmount(): number {
    return this.orderItems.reduce((sum, x) => sum + (x.totalPrice ?? 0), 0);
  }

  removeItem(i: number) {
    this.orderItems.splice(i, 1);
  }

  submitOrder() {
    if (this.orderItems.length === 0) return alert("No items added");

    const order: OrderModel = {
      orderDate: new Date(),
      orderItems: this.orderItems
    };

    this.orderService.createOrder(order).subscribe(() => {
      alert("Order successful!");
      this.orderItems = [];
      this.cdr.detectChanges();
    });
  }

  getAllProducts() {
    this.orderService.getProducts().subscribe(res => {
      this.products = res;
      this.cdr.detectChanges();
    });
  }
}
