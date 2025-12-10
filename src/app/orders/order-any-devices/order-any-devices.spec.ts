import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAnyDevices } from './order-any-devices';

describe('OrderAnyDevices', () => {
  let component: OrderAnyDevices;
  let fixture: ComponentFixture<OrderAnyDevices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderAnyDevices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderAnyDevices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
