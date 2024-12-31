import { Component, EventEmitter, Input, Output, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faHome, faUser, faLock, faBagShopping, faPhone ,faBell, faWrench, faDesktop, faTractor } from '@fortawesome/free-solid-svg-icons';
import { ModalComponent } from "../modal/modal.component";
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../schema/session';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  imports: [FontAwesomeModule, ModalComponent,CommonModule]
})
export class NavbarComponent {
  modalChange($event: Event) {

    this.mostrarModalCerrarSesion = $event

  }

  faBars = faBars
  faHome = faHome
  faUser = faUser
  faLock = faLock
  faDesktop = faDesktop
  faBagShopping = faBagShopping
  faPhone = faPhone
  faBell = faBell
  faWrench = faWrench
  faTractor = faTractor
  
  constructor(private authService: AuthService, private router: Router, public appSession: SessionService, private snackbarService: SnackbarService){
    this.appSession = new SessionService()
  }

  @Input() isNavCollapsed: boolean = false;
  @Input() atendiendoCaso: boolean = false;

  @Output() collapseChange = new EventEmitter<any>();
  mostrarModalCerrarSesion: any;
  data: any;
  keyword: any;

  handleNavCollapse(): void {
    this.isNavCollapsed = !this.isNavCollapsed
    this.collapseChange.emit(this.isNavCollapsed)
  }

  
  
  abrirModalCerrarSesion(){

    ///pero si está atendiendo un caso entonces no

    if(this.atendiendoCaso){
      this.snackbarService.mostrarMensaje("No se permite cerrar sesión si está atendiendo un caso.",3000)
      return
    }
    
    this.mostrarModalCerrarSesion = true

  }

  cerrarSesion(){

    this.authService.logout()
    this.router.navigate(['auth'])  

  }

  navigate(path: string){
    this.router.navigate([path])  
  }

  isAdmin(): boolean{
    return this.appSession.adminToken != undefined && this.appSession.adminToken.length == 257
  }

}
