// src/app/order-confirmation/order-confirmation.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {

  orderTrackingNumber!: string | null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Citește parametrul de rută 'orderTrackingNumber'
    // paramMap returnează un Observable, deci trebuie să te subscrii
    this.route.paramMap.subscribe(params => {
      this.orderTrackingNumber = params.get('orderTrackingNumber');
    });
  }
}
