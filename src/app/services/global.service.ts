import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  activeRoute = 'login';
  constructor() { }
  setRoute(route: string) {
    this.activeRoute = route;
  }
  showToast(message: string, type: string) {
    const title = type === 'error' ? 'Error' : 
                  type === 'success' ? 'Éxito' :
                  type === 'warning' ? 'Advertencia' : 'Información';
                  
    Swal.fire({   
      title: title,
      text: message,
      icon: type as any,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
}
