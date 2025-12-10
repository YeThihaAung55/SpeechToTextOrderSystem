import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Products } from './products/products';
import { Orders } from './orders/orders/orders';
import { OrderAnyDevices } from './orders/order-any-devices/order-any-devices';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: Products } ,
  { path: 'orders', component: Orders },
  { path: 'order-any-devices', component: OrderAnyDevices }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
