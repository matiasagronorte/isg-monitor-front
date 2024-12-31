// snackbar.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  mostrarMensaje(mensaje: string, duracion: number = 1000): void {
    this.snackBar.open(mensaje, 'X', {
      duration: duracion,
      panelClass: 'kaze-snackbar'
    });
  }
}
