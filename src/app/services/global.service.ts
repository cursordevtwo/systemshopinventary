import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  activeRoute = 'login';
  constructor() { }
  setRoute(route: string) {
    this.activeRoute = route;
  }
  
}
