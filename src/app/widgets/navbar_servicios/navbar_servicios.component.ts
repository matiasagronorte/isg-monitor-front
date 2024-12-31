import { Component, EventEmitter, Input, Output, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faHome, faUser, faLock, faBagShopping, faPhone ,faBell, faWrench, faDesktop } from '@fortawesome/free-solid-svg-icons';
import { ModalComponent } from "../modal/modal.component";
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../schema/session';

@Component({
  selector: 'app-navbar-servicios',
  standalone: true,
  templateUrl: './navbar_servicios.component.html',
  styleUrl: './navbar_servicios.component.css',
  imports: [FontAwesomeModule, ModalComponent,CommonModule]
})
export class NavbarServiciosComponent {
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
  
  constructor(private authService: AuthService, private router: Router, private appSession: SessionService){
    this.appSession = new SessionService()
  }

  @Input() isNavCollapsed: boolean = false;
  @Output() collapseChange = new EventEmitter<any>();
  mostrarModalCerrarSesion: any;
  data: any;
  keyword: any;

  handleNavCollapse(): void {
    this.isNavCollapsed = !this.isNavCollapsed
    this.collapseChange.emit(this.isNavCollapsed)
  }

  
  abrirModalCerrarSesion(){

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
