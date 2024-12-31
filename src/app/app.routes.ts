import { Routes } from '@angular/router';
import { MonitorComponent } from './monitor/monitor.component';
import { AuthComponent } from './auth/auth.component';
import { AccountComponent } from './account/account.component';
import { PaquetesComponent } from './paquetes/paquetes.component';
import { AtencionComponent } from './atencion/atencion.component';
import { AlertasComponent } from './alertas/alertas.component';
import { AuthGuardComponent } from './auth-guard/auth-guard.component';
import { GestionServiciosComponent } from './gestionservicios/gestionservicios.component';
import { AdminComponent } from './admin/admin.component';
import { AdminAuthGuardComponent } from './admin-auth-guard/admin-auth-guard.component';
import { HomeComponent } from './home/home.component';
import { ServiciosComponent } from './servicios/servicios.component';
import { MaquinasComponent } from './maquinas/maquinas.component';
import { PerformanceComponent } from './performance/performance.component';

export const routes: Routes = [
    {path: 'monitor', component: MonitorComponent, canActivate: [AuthGuardComponent]},
    {path: 'home', component: HomeComponent, canActivate: [AuthGuardComponent]},
    {path: 'auth', component: AuthComponent},
    {path: 'account', component: AccountComponent, canActivate: [AuthGuardComponent]},
    {path: 'paquetes', component: PaquetesComponent, canActivate: [AuthGuardComponent]},
    {path: 'atencion', component: AtencionComponent, canActivate: [AuthGuardComponent]},
    {path: 'alertas', component: AlertasComponent, canActivate: [AuthGuardComponent]},
    {path: 'servicios', component: GestionServiciosComponent, canActivate: [AuthGuardComponent]},
    {path: 'maquinas', component: MaquinasComponent, canActivate: [AuthGuardComponent]},
    {path: 'admin', component: AdminComponent, canActivate: [AdminAuthGuardComponent]},
    {path: 'performance', component: PerformanceComponent, canActivate: [AdminAuthGuardComponent]},

    {path: 'coordinacion_servicios', component: ServiciosComponent, canActivate: [AuthGuardComponent]},

    {path: ':der:auth',component: AuthComponent},
    {path: '',component: AuthComponent}

];
