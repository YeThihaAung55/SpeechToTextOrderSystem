import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Products } from './products/products';
import { AppComponent } from './app';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routes';
import { CommonModule } from '@angular/common';
import { Orders } from './orders/orders/orders';

@NgModule({
  declarations: [
    AppComponent,
    Products,
    Orders
  ],

  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}