import { Component, inject, OnInit } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RealtimeVentasService } from '../../services/realtime-ventas.service';
import { RealtimeProductsService } from '../../services/realtime-productos.service';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../services/global.service';
import { RealtimeGastosService } from '../../services/realtime-gastos.service';
import { RealtimeCobranzasService } from '../../services/realtime-cobranzas.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DataApiService } from '../../services/data-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contabilidad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './contabilidad.component.html',
  styleUrl: './contabilidad.component.css'
})
export class ContabilidadComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private modalInstance: any;
  nuevaCuenta: any = {};
  cuentasPorPagar: any[] = [];
  cuentasPorCobrar: any[] = [];
  cuentasPorPagarModal: any = {};
  cuentasxpagar: FormGroup;
  totalVentas: number = 0;
  totalGastos: number = 0;
  totalCobranzas: number = 0;
  totalCajaChica: number = 0;
constructor(
  public realtimeVentas: RealtimeVentasService,
  public realtimeProductos: RealtimeProductsService,
  public global: GlobalService,
  public realtimeGastos: RealtimeGastosService,
  public realtimeCobranzas: RealtimeCobranzasService,
  private fb: FormBuilder,
  private http: HttpClient,
  public dataApiService: DataApiService,
)
{
  this.realtimeVentas.ventas$.subscribe((ventas) => {
    this.totalVentas = ventas.reduce((total, venta) => total + venta.total, 0);
  });
  this.realtimeGastos.gastos$.subscribe((gastos) => {
    this.totalGastos = gastos.reduce((total, gasto) => total + gasto.cost, 0);
  });
  this.realtimeCobranzas.cobranzas$.subscribe((cobranzas) => {
    this.totalCobranzas = cobranzas.reduce((total, cobranza) => total + cobranza.total, 0);
  });
  this.cuentasxpagar = this.fb.group({
    proveedor: ['', Validators.required],
    monto: ['', [Validators.required, Validators.min(0)]],
    fechaVencimiento: ['', Validators.required],
    nota: [''],
    metodoPago: ['', Validators.required]
  });
}

ngOnInit() {
  if (isPlatformBrowser(this.platformId)) {
    import('bootstrap').then((bootstrap) => {
      const modalElement = document.querySelector('.modal');
      if (modalElement) {
        this.modalInstance = new bootstrap.Modal(modalElement);
      }
    });
  }
}

async guardarCuentaPorPagar() {
  try {
    // Validación inicial del formulario
    console.log('Form validity:', this.cuentasxpagar.valid);
    console.log('Form values:', this.cuentasxpagar.value);

    if (!this.cuentasxpagar.valid) {
      console.log('Formulario inválido. Errores:', this.cuentasxpagar.errors);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor complete todos los campos requeridos',
      });
      return;
    }

    // Mostrar un mensaje de carga mientras se procesa la solicitud
    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Preparar los datos para enviar al backend
    const nuevaCuentaPorPagar = {
      ...this.cuentasxpagar.value,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
      tipo: 'cuenta_por_pagar',
    };
    console.log('Datos a guardar:', nuevaCuentaPorPagar);

    // Llamada al servicio para guardar los datos
    try {
      const respuesta = await this.dataApiService.addCobranza(nuevaCuentaPorPagar).toPromise();
      console.log('Guardado exitoso:', respuesta);

      // Restablecer el formulario y mostrar un mensaje de éxito
      this.cuentasxpagar.reset();
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Cuenta por pagar guardada exitosamente',
        timer: 1500,
      });

      // Cerrar el modal si está disponible
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
    } catch (saveError) {
      // Manejo de errores específicos durante la llamada al servicio
      console.error('Error específico al guardar:', saveError);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la cuenta por pagar. Intente nuevamente.',
      });
    }
  } catch (error) {
    // Manejo de errores generales
    console.error('Error general al guardar la cuenta por pagar:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error inesperado al guardar la cuenta por pagar.',
    });
  }
}


}
