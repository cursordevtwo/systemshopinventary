import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { RealtimeProductsService } from '../../services/realtime-productos.service';
import Swal from 'sweetalert2';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { DataApiService } from '../../services/data-api.service';
import { RealtimeVentasService } from '../../services/realtime-ventas.service';
export interface VentaInterface {
  cliente: string;
  fecha: string;
  hora: string;
  metodoPago: string;
  subtotal: number;
  iva: number;
  total: number;
  idEmpleado: string;
  productos: {
    idProducto: string;
    cantidad: number;
    precio: number;
    subtotal: number;
  }[];
}

@Component({
  selector: 'app-cash',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cash.component.html',
  styleUrl: './cash.component.css'
})

export class CashComponent {
  terminoBusqueda: string = '';
  productosEncontrados: any[] = [];
  metodoPago: string = 'efectivo';
  fechaActual: string = '';
  horaActual: string = '';
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  productos: any[] = [];
  productosFiltrados: any[] = [];
  pasoActual: number = 1; 
  productosSeleccionados: any[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;
  cliente: string = '';
  cantidad: number = 0;
  currentUser: any = null;
  pb: any;
  authStore: any;
  showForm: boolean = false;
  productosVenta: {
    idProducto: string;
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
  }[] = []; 
  
  constructor
  (public global: GlobalService,
    public realtimeProducts: RealtimeProductsService,
    public authPocketbase: AuthPocketbaseService,
    public dataApiService: DataApiService,
    public realtimeVentas: RealtimeVentasService,
    
  ) 
  {
    this.fechaActual = new Date().toLocaleDateString();
    this.horaActual = new Date().toLocaleTimeString();
    this.currentUser = this.authPocketbase.getCurrentUser();
    this.pb = this.authPocketbase.getCurrentUser();
    this.authStore = this.pb?.authStore;
    
  
  }
  ngOnInit() {
    this.fechaActual = new Date().toLocaleDateString();
    this.horaActual = new Date().toLocaleTimeString();
    
    this.realtimeProducts.products$.subscribe((products: any) => {
      this.productos = products;
      this.productosFiltrados = [...products]; // Inicialmente muestra todos los productos
      console.log('Productos cargados:', this.productos); // Para debugging
    });
  }
  deleteSale(saleId: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataApiService.deleteSale(saleId).subscribe(
          () => {
            Swal.fire(
              'Eliminado!',
              'La venta ha sido eliminada.',
              'success'
            );
          },
          error => {
            console.error('Error al eliminar la venta:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar la venta.',
              'error'
            );
          }
        );
      }
    });
  }
  onSearchChange(event: any) {
    const termino = event.target.value;
    console.log('Término de búsqueda:', termino); // Para debugging
    this.filtrarProductos(termino);
  }

  filtrarProductos(termino: string) {
    if (!termino) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    termino = termino.toLowerCase();
    this.productosFiltrados = this.productos.filter(producto => 
      producto.name.toLowerCase().includes(termino) || 
      producto.code.toLowerCase().includes(termino)
    );
    console.log('Productos filtrados:', this.productosFiltrados); // Para debugging
  }


    seleccionarProducto(producto: any) {
      this.productosSeleccionados.push({
        ...producto,
        cantidad: 1
      });
      this.searchTerm = '';
      this.calcularTotal();
      this.pasoActual = 2; // Avanzamos al siguiente paso
    }
  
    eliminarProducto(producto: any) {
      // Primero mostrar confirmación
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar ${producto.name} de la lista?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, eliminar el producto
          const index = this.productosSeleccionados.findIndex(p => p.code === producto.code);
          
          if (index !== -1) {
            this.productosSeleccionados.splice(index, 1);
            this.calcularTotal();
  
            // Mostrar mensaje de éxito
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El producto ha sido eliminado correctamente',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
  
            // Si no quedan productos, volver al paso 1
            if (this.productosSeleccionados.length === 0) {
              this.irAPaso(1);
            }
          }
        }
      });
    }
  
    calcularTotal() {
      // Calcular subtotal
      this.subtotal = this.productosSeleccionados.reduce((total, producto) => {
        return total + (producto.price * producto.cantidad);
      }, 0);
  
      // Calcular IVA (16%)
      this.iva = this.subtotal * 0.16;
  
      // Calcular total
      this.total = this.subtotal + this.iva;
    }
  
    // Funciones para navegar entre pasos
    irAPaso(paso: number) {
      this.pasoActual = paso;
    }
 
  actualizarFechaHora() {
    const ahora = new Date();
    
    // Formato más corto
    this.fechaActual = ahora.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    this.horaActual = ahora.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Para formato 24 horas
    });
  } 
  
  procesarVenta() {
    console.log('Procesando venta...');
    console.log('Productos seleccionados:', this.productosSeleccionados);
    console.log('Subtotal:', this.subtotal);
    console.log('IVA:', this.iva);
    console.log('Total:', this.total);
  }

  finalizarVenta() {
    console.log('Finalizando venta...');
    console.log('Productos seleccionados:', this.productosSeleccionados);
    console.log('Subtotal:', this.subtotal);
    console.log('IVA:', this.iva);
    console.log('Total:', this.total);
  }

  imprimirFactura() {
    console.log('Imprimiendo factura...');
    console.log('Productos seleccionados:', this.productosSeleccionados);
    console.log('Subtotal:', this.subtotal);
    console.log('IVA:', this.iva);
    console.log('Total:', this.total);
  }

  cancelarVenta() {
    console.log('Cancelando venta...');
    console.log('Productos seleccionados:', this.productosSeleccionados);
    console.log('Subtotal:', this.subtotal);
    console.log('IVA:', this.iva);
    console.log('Total:', this.total);
  }

/* procesarPago() {
  const ventaData = {
      cliente: "Cliente General",
      total: this.total,
      unity: this.calculateTotalUnits(),
      subTotal: this.subtotal.toString(),
      statusVenta: "completed",
      descuento: "0",
      iva: this.iva.toString(),
      metodoPago: this.metodoPago,
      date: new Date().toISOString(),
      hora: this.horaActual,
      idProduct: JSON.stringify(this.productosSeleccionados),
      idUser: "current_user_id" // Replace with actual user ID
  };

  // Call your service to save the sale
  this.dataApiService.saveVenta(ventaData).subscribe(
      response => {
          console.log('Venta guardada exitosamente', response);
          // Handle success
      },
      error => {
          console.error('Error al guardar la venta', error);
          // Handle error
      }
  );
} */
procesarPago() {
  // Validate payment method
  if (!this.metodoPago) {
    Swal.fire({
      title: 'Error',
      text: 'Por favor seleccione un método de pago',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
    return;
  }

  // Show confirmation dialog
  Swal.fire({
    title: '¿Confirmar venta?',
    text: `Total a pagar: ${this.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, procesar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const ventaData = {
        cliente: "Cliente General",
        total: this.total,
        unity: this.calculateTotalUnits(),
        subTotal: this.subtotal.toString(),
        statusVenta: "completed",
        descuento: "0",
        iva: this.iva.toString(),
        metodoPago: this.metodoPago,
        date: new Date().toISOString(),
        hora: this.horaActual,
        idProduct: JSON.stringify(this.productosSeleccionados),
        idUser: "current_user_id" // Replace with actual user ID
      };

      this.dataApiService.saveVenta(ventaData).subscribe(
        response => {
          Swal.fire({
            title: '¡Venta exitosa!',
            text: 'La venta ha sido procesada correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.reiniciarVenta();
          });
        },
        error => {
          console.error('Error al guardar la venta', error);
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al procesar la venta. Por favor, intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Ok'
          });
        }
      );
    }
  });
}

private calculateTotalUnits(): number {
  return this.productosSeleccionados.reduce((total, producto) => total + producto.cantidad, 0);
}
/* procesarPago() {
  // Validar si se seleccionó un método de pago
  if (!this.metodoPago) {
    Swal.fire({
      title: 'Error',
      text: 'Por favor seleccione un método de pago',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
    return;
  }

  // Mostrar mensaje de confirmación
  Swal.fire({
    title: '¿Confirmar venta?',
    text: `Total a pagar: ${this.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, procesar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Preparar los datos de la venta
      const venta = {
        cliente: "Cliente General", // Puedes cambiar según tus necesidades
        fecha: this.fechaActual,    // Variable con la fecha actual
        hora: this.horaActual,      // Variable con la hora actual
        metodoPago: this.metodoPago,
        subtotal: this.subtotal,
        iva: this.iva,
        total: this.total,
        productos: this.productosSeleccionados.map(producto => ({
          idProducto: producto.id,  // Suponiendo que cada producto tiene un campo `id`
          nombre: producto.name,
          cantidad: producto.cantidad,
          precio: producto.price,
          subtotal: producto.cantidad * producto.price
        }))
      };

      // Guardar en la base de datos usando el servicio
      this.dataApiService.saveVenta(venta).subscribe(
        (response) => {
          Swal.fire({
            title: '¡Venta exitosa!',
            text: 'La venta ha sido procesada correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            // Reiniciar el componente para una nueva venta
            this.reiniciarVenta();
          });
        },
        (error) => {
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al procesar la venta. Por favor, intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Ok'
          });
        }
      );
    }
  });
} */

reiniciarVenta() {
    this.productosSeleccionados = [];
    this.subtotal = 0;
    this.iva = 0;
    this.total = 0;
    this.metodoPago = '';
    this.pasoActual = 1;
  }

  private getCurrentUserInfo() {
    const user = this.authPocketbase.getCurrentUser();
    const userId = this.authPocketbase.getUserId();

    return {
      userId,
      userType: user?.type,
      fullName: user?.full_name,
      isAuthenticated: !!userId
    };
  }

}