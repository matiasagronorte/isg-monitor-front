import { Component, EventEmitter, HostListener, Input, Output, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  // showModal = false

  @Input() showModal!: boolean;
  @Input() title!: string

  @Output() modalChange = new EventEmitter<any>();


  constructor() {}

  cerrarModal(event?: MouseEvent) {
    // Verificar si el clic fue fuera del modal
    if (event && (event.target === event.currentTarget || this.esBotonCerrar(event.target))) {
      this.showModal = false;
      this.modalChange.emit(false)
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    this.showModal = false;
    this.modalChange.emit(false)  
  }

  esBotonCerrar(element: any): boolean {
    return element.classList.contains('kaze-btn') && element.classList.contains('kaze-btn-danger');
    
  }

}

// @Component({
//   selector: 'app-root',
//   templateUrl: 'modal.component.html',
//   styleUrls: ['modal.component.css']
// })
// export class AppComponent {
//   constructor(public dialog: MatDialog) {}

  

// }
