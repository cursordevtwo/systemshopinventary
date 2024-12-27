import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { DataApiService } from '../../services/data-api.service';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RealtimeProductsService } from '../../services/realtime-productos.service';
import { RealtimeCategoriasService } from '../../services/realtime-categorias.service';
import { NewCategoryModalComponent } from '../new-category-modal/new-category-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,

  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  showForm = false;
  productForm: FormGroup;
  previewImage: string = 'assets/images/thumbs/setting-profile-img.jpg';
  products: any[] = []; // Changed Product to any[] since Product type is not defined
  products$: any;
  isEditing = false;
  currentProductId: string = '';
  constructor(
    public global: GlobalService,
    private fb: FormBuilder,
    public auth: AuthPocketbaseService,
    public realtimeProducts: RealtimeProductsService,
    public dataApiService: DataApiService,
    public realtimeCategorias: RealtimeCategoriasService,
    private dialog: MatDialog

  ) {
    this.realtimeProducts.products$;

    // Configurar el formulario con validadores
    this.productForm = this.fb.group({
      idCategoria: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      unity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      code: [123, Validators.required],
      image: [null],
      stock: [0, [Validators.required, Validators.min(0)]]

    });
  }
  openNewCategoryModal() {
    const dialogRef = this.dialog.open(NewCategoryModalComponent, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Actualizar las categorías si se agregó una nueva
        this.realtimeCategorias.categorias$;
      }
    });
  }

  // Alternar la visibilidad del formulario
/*   showNewProduct() {
    this.showForm = !this.showForm;
  } */
    showNewProduct() {
      this.showForm = !this.showForm;
      if (this.showForm) {
        this.isEditing = false;
        this.productForm.reset();
        this.previewImage = 'assets/images/thumbs/setting-profile-img.jpg';
        // Set default values if needed
        this.productForm.patchValue({
          unity: 1,
          price: 0,
          code: 123,
          stock: 0
        });
    }
  }


  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Store the file in the form and create preview
      this.productForm.patchValue({ image: file });
      this.previewImage = URL.createObjectURL(file);
    }
  }

  addProduct() {
    if (this.productForm.valid) {
      const file = this.productForm.get('image')?.value;

      // First upload the image if it exists
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        this.dataApiService.uploadImage(file).subscribe({
          next: (fileResponse: any) => {
            // Create product with file reference
            const productData = {
              name: this.productForm.get('name')?.value,
              description: this.productForm.get('description')?.value,
              unity: parseInt(this.productForm.get('unity')?.value),
              price: parseFloat(this.productForm.get('price')?.value),
              code: parseInt(this.productForm.get('code')?.value),
              idCategoria: this.productForm.get('idCategoria')?.value,
              collection: 'productsInventory',
              imageId: fileResponse.id // Add reference to uploaded file
            };

            // Continue with product creation
            this.saveProduct(productData);
          },
          error: (error) => {
            console.error('Error uploading file:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al subir la imagen. Por favor, intente nuevamente.'
            });
          }
        });
      } else {
        // If no image, create product without image reference
        const productData = {
          name: this.productForm.get('name')?.value,
          description: this.productForm.get('description')?.value,
          unity: parseInt(this.productForm.get('unity')?.value),
          price: parseFloat(this.productForm.get('price')?.value),
          code: parseInt(this.productForm.get('code')?.value),
          idCategoria: this.productForm.get('idCategoria')?.value,
          collection: 'productsInventory',
          stock: parseInt(this.productForm.get('stock')?.value),
          image: this.productForm.get('image')?.value
        };

        this.saveProduct(productData);
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  private saveProduct(productData: any) {
    this.dataApiService.addProduct(productData).subscribe({
      next: (response) => {
        console.log('Respuesta exitosa:', response);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Producto guardado correctamente'
        });
        this.productForm.reset();
        this.showForm = false;
        this.realtimeProducts.products$;
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el producto. Por favor, intente nuevamente.'
        });
      }
    });
  }

  updateProduct(productId: string) {
    this.currentProductId = productId;
    this.showForm = true;
    this.isEditing = true;

    // Obtener el producto actual y llenar el formulario
    this.realtimeProducts.products$.subscribe(products => {
      const product = products.find((p: any) => p.id === productId);
      if (product) {
        this.productForm.patchValue({
          name: product.name,
          code: product.code,
          description: product.description,
          unity: product.unity,
          price: product.price,
          idCategoria: product.idCategoria
        });

        if (product.image) {
          this.previewImage = product.image;
        }
      }
    });
  }
  private saveUpdatedProduct(productData: any) {
    this.dataApiService.updateProduct(this.currentProductId, productData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Producto actualizado correctamente'
        });
        this.productForm.reset();
        this.showForm = false;
        this.isEditing = false;
        this.realtimeProducts.products$;
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el producto. Por favor, intente nuevamente.'
        });
      }
    });
  }
  cancelEdit() {
    this.showForm = false;
    this.isEditing = false;
    this.productForm.reset();
    this.previewImage = '';
  }
  deleteProduct(productId: string) {
    Swal.fire({
      title: '¿Está seguro?',
      text: "No podrá revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataApiService.deleteProduct(productId).subscribe({
          next: (response) => {
            console.log('Producto eliminado exitosamente:', response);
            this.realtimeProducts.products$;
            this.cancelEdit();
            Swal.fire(
              '¡Eliminado!',
              'El producto ha sido eliminado.',
              'success'
            );
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar el producto.',
              'error'
            );
          }
        });
      }
    });
  }



}
