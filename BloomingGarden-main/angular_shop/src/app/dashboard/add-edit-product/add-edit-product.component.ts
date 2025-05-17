import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {ProductService} from "../../services/product.service";
import {NgIf} from "@angular/common";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";

@Component({
  selector: 'app-add-edit-product',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    NgIf,
    MatOptionModule,
    MatSelectModule
  ],
  templateUrl: './add-edit-product.component.html',
  styleUrl: './add-edit-product.component.css'
})
export class AddEditProductComponent implements OnChanges {
  @Input("product") product: any;

  id: string = "";
  name = new FormControl('', [Validators.required]);
  description = new FormControl('', [Validators.required]);
  price = new FormControl('', [Validators.required]);
  image1 = new FormControl('', [Validators.required]);
  image2 = new FormControl('', [Validators.required]);
  image3 = new FormControl('', [Validators.required]);
  image4 = new FormControl('', [Validators.required]);
  productType = new FormControl('', [Validators.required]);

  constructor(private productService: ProductService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.product);
    if (this.product != null) {
      this.id = this.product.id;
      this.name = new FormControl(this.product.name, [Validators.required]);
      this.description = new FormControl(this.product.description, [Validators.required]);
      this.price = new FormControl(this.product.price, [Validators.required]);
      this.image1 = new FormControl(this.product.image1, [Validators.required]);
      this.image2 = new FormControl(this.product.image2, [Validators.required]);
      this.image3 = new FormControl(this.product.image3, [Validators.required]);
      this.image4 = new FormControl(this.product.image4, [Validators.required]);
      this.productType = new FormControl(this.product.productType, [Validators.required]);
    }
  }

  getErrorMessage(input: FormControl): string {
    if (input.hasError('required')) {
      return 'You must enter a value';
    }
    return '';
  }

  onSave(): void {
    let productData = {
      id: this.id,
      name: this.name.getRawValue()!,
      description: this.description.getRawValue()!,
      price: this.price.getRawValue()!,
      image1: this.image1.getRawValue()!,
      image2: this.image2.getRawValue()!,
      image3: this.image3.getRawValue()!,
      image4: this.image4.getRawValue()!,
      productType: this.productType.getRawValue()!,
    };
    console.log();
    if (productData.id == "") {
      this.productService.createProduct(productData);
    } else {
      this.productService.updateProduct(productData);
    }
    this.resetForm();
  }

  resetForm() {
    this.product = null;
    this.id = "";
    this.name = new FormControl('', [Validators.required]);
    this.description = new FormControl('', [Validators.required]);
    this.price = new FormControl('', [Validators.required]);
    this.image1 = new FormControl('', [Validators.required]);
    this.image2 = new FormControl('', [Validators.required]);
    this.image3 = new FormControl('', [Validators.required]);
    this.image4 = new FormControl('', [Validators.required]);
    this.productType = new FormControl('', [Validators.required]);
  }
}
