import { Component, Renderer2 } from '@angular/core';
import { NavbarComponent } from '../widgets/navbar/navbar.component';
import { ApiServiceService } from '../services/api-service.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBroom, faFilter, faPrint } from '@fortawesome/free-solid-svg-icons';
import { AppSettings } from '../appsettings';
import { SessionService } from '../schema/session';
import { KazeFormInputComponent } from "../widgets/kaze-form-input/kaze-form-input.component";
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { formatDate } from '../lib/functions';
import { SnackbarService } from '../services/snackbar.service';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import * as sha512 from 'js-sha512';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { primeraFechaEsMenor, formatearFechaHora } from '../services/functions';

import { ModalComponent } from '../widgets/modal/modal.component';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',

  imports: [NavbarComponent, HttpClientModule,
    CommonModule,
    FontAwesomeModule, KazeFormInputComponent, KazeFormInputComponent, FormsModule, ReactiveFormsModule],
})

export class AccountComponent {

  collapsedNav = false

  form_recuperapass: FormGroup
  form_indicar_guardia: FormGroup

  nombre = ""
  email = ""

  enviando_nueva_pass = false
  verificando = false
  enviando_email = false
  formatearFechaHora = formatearFechaHora


  info_ultima_guardia = ""

  constructor(public appSession: SessionService, private formBuilder: FormBuilder, private snackbarService: SnackbarService, private apiService: ApiServiceService,private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver) {

    this.apiService.token = this.appSession.appToken

    this.nombre = appSession.nombre
    this.email = appSession.email

    this.form_recuperapass = this.formBuilder.group({
      pass_actual: '',
      nueva_pass: '',
      repetir_nueva_pass: '',
      id: appSession.userId
    })

    this.form_indicar_guardia = this.formBuilder.group({
      fechahorainicio: '',
      fechahorafin: '',
    });


  }


  

  updateCollapse($value: boolean) {
    this.collapsedNav = $value

  }

  verificarActualizarPass() {

    // console.log(this.form_recuperapass.value)

    if (this.form_recuperapass.value.pass_actual == "" || this.form_recuperapass.value.nueva_pass == "" || this.form_recuperapass.value.repetir_nueva_pass == "") {

      this.snackbarService.mostrarMensaje("Debe completar todos los campos de contraseña.", 2000)
      return

    }

    if (this.form_recuperapass.value.nueva_pass.length < 4) {

      this.snackbarService.mostrarMensaje("Ingresa una contraseña de al menos 4 caracteres.", 2000)
      return

    }

    if (this.form_recuperapass.value.nueva_pass != this.form_recuperapass.value.repetir_nueva_pass) {

      this.snackbarService.mostrarMensaje("Las contraseñas nuevas no coinciden.", 2000)
      return

    }

    this.enviando_nueva_pass = true

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      module: 'isg',
      method: 'actualizar_pass',
      payload: JSON.stringify({ 
        pass_actual: sha512.sha512(this.form_recuperapass.value.pass_actual), 
        nueva_pass: sha512.sha512(this.form_recuperapass.value.nueva_pass), 
        repetir_nueva_pass: sha512.sha512(this.form_recuperapass.value.repetir_nueva_pass), 
        id: this.form_recuperapass.value.id
      })
    }).subscribe((data: any) => {
      this.enviando_nueva_pass = false

      // console.log(data)
      if(data.resultado == "success"){

        this.snackbarService.mostrarMensaje("Actualizaste tu contraseña correctamente.",3000);

        this.form_recuperapass.get("pass_actual")?.setValue('')
        this.form_recuperapass.get("nueva_pass")?.setValue('')
        this.form_recuperapass.get("repetir_nueva_pass")?.setValue('')

      }
      else{
        this.snackbarService.mostrarMensaje(data.motivo,3000);

      }

    })

  }



  ngOnInit(): void {

    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      // this.isSmallScreen = result.matches;
      this.collapsedNav = result.matches
    });
  
  }


}
