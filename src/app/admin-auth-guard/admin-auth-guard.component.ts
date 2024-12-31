import { Component, EventEmitter, Injectable, Input, Output, input } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-auth-guard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-auth-guard.component.html',
  styleUrl: './admin-auth-guard.component.css'
})

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuardComponent {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    } else {
      this.router.navigate(['/home']); // Redirige a la página de inicio de sesión si el usuario no está autenticado
      return false;
    }
  }
}