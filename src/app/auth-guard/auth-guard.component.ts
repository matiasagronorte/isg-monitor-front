import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import {  Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-guard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-guard.component.html',
  styleUrl: './auth-guard.component.css'
})

@Injectable({
  providedIn: 'root'
})
export class AuthGuardComponent {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/auth']); // Redirige a la página de inicio de sesión si el usuario no está autenticado
      return false;
    }
  }
}