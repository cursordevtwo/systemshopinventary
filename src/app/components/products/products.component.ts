import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { DataApiService } from '../../services/data-api.service';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RealtimeProductsService } from '../../services/realtime-productos.service';
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  showForm: boolean = false;
  productForm: FormGroup;
  previewImage: string = 'assets/images/thumbs/setting-profile-img.jpg';
  products: any[] = []; // Changed Product to any[] since Product type is not defined
  products$: any;
  isEditing: boolean = false; 
  currentProductId: string = '';
  constructor(
    public global: GlobalService,
    private fb: FormBuilder,
    public auth: AuthPocketbaseService,
    public realtimeProducts: RealtimeProductsService,
    public dataApiService: DataApiService,
  ) { 
    this.realtimeProducts.products$;

    // Configurar el formulario con validadores
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      unity: ['', Validators.required],
      price: ['', Validators.required],
      code: ['', Validators.required],
      image: [null]
    });
  }

  // Alternar la visibilidad del formulario
  showNewProduct() {
    this.showForm = !this.showForm;
  }

  // Manejar la selección de archivo e imagen de vista previa
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.productForm.patchValue({ image: file });
      this.previewImage = URL.createObjectURL(file);
    }
  }

  addProduct() {
    if (this.productForm.valid) {
      const request = {
        name: this.productForm.get('name')?.value || '',
        collection: 'productsInventory',
        description: this.productForm.get('description')?.value || '',
        unity: this.productForm.get('unity')?.value || '',
        price: this.productForm.get('price')?.value || '',
        code: this.productForm.get('code')?.value || '',
      };

      this.dataApiService.addProduct(request).subscribe(
        response => {
          console.log('Producto guardado exitosamente:', response);
          
          // Ocultar el formulario y mostrar la lista de productos
          this.showForm = false;
          
          // Actualizar la lista de productos (asumiendo que tienes un método para esto)
          this.realtimeProducts.products$;

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'El producto ha sido guardado exitosamente.',
            confirmButtonText: 'Aceptar'
          });

          this.productForm.reset();
        },
        error => {
          console.error('Error al guardar el producto:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al guardar el producto. Por favor, inténtalo de nuevo.',
            confirmButtonText: 'Aceptar'
          });
        }
      );
    }
  }

  updateProduct() {
    this.dataApiService.updateProduct(this.currentProductId, this.productForm.value).subscribe(
      response => {
        console.log('Producto actualizado exitosamente:', response);
      }
    );
  }

  /* async editProduct(product: any) {
    this.isEditing = true;
    this.showForm = true;
    
    this.productForm.patchValue({
      name: product.name,
      code: product.code,
      description: product.description,
      unity: product.unity,
      price: product.price
    });
    this.previewImage = product.image;
  } */

  cancelEdit() {
    this.showForm = false;
    this.isEditing = false;
    this.productForm.reset();
    this.previewImage = '';
  }

}
