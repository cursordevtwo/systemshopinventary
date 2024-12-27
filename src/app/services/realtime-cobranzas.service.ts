import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RealtimeCobranzasService implements OnDestroy {
  private pb: PocketBase;
  private cobranzasSubject = new BehaviorSubject<any[]>([]);

  // Esta es la propiedad que expondrá el Observable para que los componentes puedan suscribirse a ella
  public cobranzas$: Observable<any[]> =
    this.cobranzasSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.com:8095');
    this.subscribeToCobranzas();
  }

  private async subscribeToCobranzas() {
    // (Opcional) Autenticación
    await this.pb
      .collection('users')
      .authWithPassword('admin@email.com', 'admin1234');

    this.pb.collection('cobranzas').subscribe('*', (e) => {
      this.handleRealtimeEvent(e);
    });

    this.updateCobranzasList();
  }

  private handleRealtimeEvent(event: any) {
    // Aquí puedes manejar las acciones 'create', 'update' y 'delete'
    console.log(event.action);
    console.log(event.record);

    this.updateCobranzasList();
  }

  private async updateCobranzasList() {
    const records = await this.pb
      .collection('cobranzas')
      .getFullList(200 /* cantidad máxima de registros */, {
        sort: '-created', // Ordenar por fecha de creación
      });
    this.cobranzasSubject.next(records);
  }

  ngOnDestroy() {
    // Desuscribirse cuando el servicio se destruye
    this.pb.collection('cobranzas').unsubscribe('*');
  }
}
