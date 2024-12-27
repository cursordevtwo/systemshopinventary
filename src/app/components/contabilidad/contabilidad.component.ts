import { Component } from '@angular/core';
import { RealtimeVentasService } from '../../services/realtime-ventas.service';
import { RealtimeProductsService } from '../../services/realtime-productos.service';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../services/global.service';
import { RealtimeGastosService } from '../../services/realtime-gastos.service';
import { RealtimeCobranzasService } from '../../services/realtime-cobranzas.service';

@Component({
  selector: 'app-contabilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contabilidad.component.html',
  styleUrl: './contabilidad.component.css'
})
export class ContabilidadComponent {
  totalVentas: number = 0;
  totalGastos: number = 0;
  totalCobranzas: number = 0;
constructor(
  public realtimeVentas: RealtimeVentasService,
  public realtimeProductos: RealtimeProductsService,
  public global: GlobalService,
  public realtimeGastos: RealtimeGastosService,
  public realtimeCobranzas: RealtimeCobranzasService
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
}

}
