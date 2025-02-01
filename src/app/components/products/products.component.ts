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
import { RealtimeVentasService } from '../../services/realtime-ventas.service';
import { UploadService } from '../../services/upload.service';
import { from } from 'rxjs';
import { BarcodeComponent } from '../barcode/barcode.component';
import JsBarcode from 'jsbarcode'; // Use default import

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    BarcodeComponent
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
  showFilter = false;
  ventas: any[] = [];
  imagePreview: string | null = null; // Para mostrar la vista previa de la imagen
  selectedFile: File | null = null;
  selectedCategory: string = ''; // Default category
  searchQuery: string = ''; // Default search query
  productosFiltrados: any[] = [];
  productos$: any;
  searchTerm: string = '';

  constructor(
    public global: GlobalService,
    private fb: FormBuilder,
    public auth: AuthPocketbaseService,
    public realtimeProducts: RealtimeProductsService,
    public dataApiService: DataApiService,
    public realtimeCategorias: RealtimeCategoriasService,
    private dialog: MatDialog,
    public realtimeVentas: RealtimeVentasService,
    public uploadService: UploadService


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
      stock: [0, [Validators.required, Validators.min(0)]],
      file: [null],
      color: ['', Validators.required],
      /* codeBarra:['', Validators.required],
      codeBar: [123, Validators.required] */

    });
  }
  ngOnInit() {
    this.loadProducts();
    this.global.applyFilters(this.selectedCategory, this.searchQuery); // Initial call to set up default view
}
  loadProducts() {
    this.realtimeProducts.products$.subscribe((products: any[]) => {
      // Load products if needed
    });
  }
  onFilterChange() {
    this.global.applyFilters(this.selectedCategory, this.searchQuery);
  }
  
  
  openNewCategoryModal() {
    const dialogRef = this.dialog.open(NewCategoryModalComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Actualizar las categorías si se agregó una nueva
        this.realtimeCategorias.categorias$;
      }
    });
  }
  /* showNewProduct() {
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
          stock: 0,
          color: '',
          codeBar: 123,
          codeBarra:''
        });
    }
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
          stock: 0,
          color: '', // Reiniciar el campo "color"
        });
      }
    }
 
    addProduct() {
      if (this.productForm.valid) {
        const file = this.productForm.get('image')?.value;
        const initialStock = parseInt(this.productForm.get('unity')?.value);
        const productCode = this.productForm.get('code')?.value;
    
        // Generar el código de barras automáticamente
        const codeBarra = this.generateBarcode(productCode);
    
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
                unity: initialStock,
                price: parseFloat(this.productForm.get('price')?.value),
                code: productCode, // Usar el código directamente
                idCategoria: this.productForm.get('idCategoria')?.value,
                color: this.productForm.get('color')?.value, // Incluir el campo "color"
                collection: 'productsInventory',
                file: fileResponse['file'],
                stock: initialStock,
                initialStock: initialStock,
                codeBarra: codeBarra // Incluir el código de barras generado
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
            unity: initialStock,
            price: parseFloat(this.productForm.get('price')?.value),
            code: productCode, // Usar el código directamente
            idCategoria: this.productForm.get('idCategoria')?.value,
            collection: 'productsInventory',
            stock: initialStock,
            initialStock: initialStock,
            file: this.productForm.get('file')?.value,
            color: this.productForm.get('color')?.value, // Incluir el campo "color"
            codeBarra: codeBarra // Incluir el código de barras generado
          };
    
          this.saveProduct(productData);
        }
      } else {
        console.log('Formulario inválido');
      }
    }
  async saveProduct(productData: any) {
    try {
      // Enviar los datos a PocketBase
      const record = await this.uploadService.pb.collection('productsInventory').create(productData);
  
      console.log('Producto guardado correctamente:', record);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Producto guardado correctamente'
      });
  
      // Resetear el formulario y ocultarlo
      this.productForm.reset();
      this.showForm = false;
      this.selectedFile = null;
      this.imagePreview = null;
  
      // Actualizar la lista de productos
      this.realtimeProducts.products$ = from(this.uploadService.pb.collection('productsInventory').getFullList());
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el producto. Por favor, intente nuevamente.'
      });
    }
  }
  generateBarcode(code: string): string {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, code, {
        format: 'CODE128',
        displayValue: true,
        fontSize: 16,
        lineColor: '#000',
        width: 2,
        height: 100
      });
  
      return canvas.toDataURL('image/png'); // Retorna la imagen del código de barras en formato base64
    } catch (error) {
      console.error('Error generating barcode:', error);
      return ''; // Retorna una cadena vacía si la generación falla
    }
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
          idCategoria: product.idCategoria,
          stock: product.stock,
          color: product.color,
          file: product.file,
          codeBar: product.codeBar,
          codeBarra: product.codeBarra
        });

        if (product.image) {
          this.imagePreview = product.image;
        }
      }
    });
  }
  async saveupdateProduct(productData: any) {
    try {
      // Crear un FormData para enviar el producto
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('price', productData.price);
      formData.append('code', productData.code);
      formData.append('unity', productData.unity);
      formData.append('description', productData.description);
      formData.append('idCategoria', productData.idCategoria);
      formData.append('stock', productData.stock);
      formData.append('color', productData.color); // Incluir el campo "color"
      formData.append('codeBar', productData.codeBar);
      formData.append('codeBarra', productData.codeBarra);
  
      // Si existe un archivo, lo agregamos al FormData
      if (productData.file) {
        formData.append('file', productData.file);
      }
  
      // Intentar actualizar el producto
      const record = await this.uploadService.pb.collection('productsInventory').update(this.currentProductId, formData);
  
      // Actualizar la lista de productos en tiempo real si es necesario
      this.realtimeProducts.products$ = from(this.uploadService.pb.collection('productsInventory').getFullList());
  
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Producto actualizado correctamente'
      });
  
      // Actualizar los datos en el formulario para reflejar los cambios
      this.productForm.patchValue({
        name: productData.name,
        price: productData.price,
        code: productData.code,
        unity: productData.unity,
        description: productData.description,
        idCategoria: productData.idCategoria,
        stock: productData.stock,
        color: productData.color, // Incluir el campo "color"
        codeBar: productData.codeBar,
        codeBarra: productData.codeBarra
      });
  
      // Cerrar el formulario de edición
      this.productForm.reset();
      this.showForm = false;
      this.isEditing = false;
  
    } catch (error) {
      console.error('Error al actualizar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el producto. Por favor, intente nuevamente.'
      });
    }
  }
  
  cancelEdit() {
    this.showForm = false;
    this.isEditing = false;
    this.productForm.reset();
    this.imagePreview = '';
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
          next: async (response) => {
            console.log('Producto eliminado exitosamente:', response);
            this.realtimeProducts.products$ = from(this.uploadService.pb.collection('productsInventory').getFullList());
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
  calculateStock(productId: string) {
    const product = this.products.find((p: any) => p.id === productId);
    if (product) {
      // Obtener el stock inicial del producto
      const initialStock = product.stock;
      
      // Calcular el total de unidades vendidas para este producto
      const totalSold = this.ventas
        .filter((ventas: any) => ventas.productId === productId)
        .reduce((total: number, ventas: any) => total + ventas.quantity, 0);
      
      // Retornar el stock actual (stock inicial - ventas totales)
      return initialStock - totalSold;
    }
    return 0;
  }

  onImageSelect(event: any) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result; // For preview
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

async uploadImageToServer(): Promise<{ url: string }> {
try {
  if (!this.selectedFile) {
    throw new Error('No image selected');
  }

  const formData = new FormData();
  formData.append('file', this.selectedFile);

  const response = await this.uploadService.pb.collection('files').create(formData);

  if (response && response['file']) {
    return { url: this.uploadService.pb.files.getUrl(response, response['file']) };
  } else {
    throw new Error('Failed to upload image');
  }
} catch (error) {
  console.error('Error uploading image:', error);
  throw error;
}
}

async uploadImageToServerCorrected(): Promise<{ url: string }> {
try {
  if (!this.selectedFile) {
    throw new Error('No image selected');
  }

  const formData = new FormData();
  formData.append('file', this.selectedFile);

  const response = await this.uploadService.pb.collection('files').create(formData);

  if (response && response['file']) {
    return { url: this.uploadService.pb.files.getUrl(response, response['file']) };
  } else {
    throw new Error('Failed to upload image');
  }
} catch (error) {
  console.error('Error uploading image:', error);
  throw error;
}
}
}
