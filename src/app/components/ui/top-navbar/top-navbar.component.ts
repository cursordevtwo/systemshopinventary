import { Component } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { AuthPocketbaseService } from '../../../services/auth-pocketbase.service';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [],
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.css'
})
export class TopNavbarComponent {
  constructor (
    public auth:AuthPocketbaseService,
    public global: GlobalService
  ){
    this.auth.permision();

  }
}
