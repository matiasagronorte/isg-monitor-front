import { Component, Renderer2 } from '@angular/core';
import { NavbarComponent } from '../widgets/navbar/navbar.component';
import { ApiServiceService } from '../services/api-service.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBroom, faFilter, faPrint, faClose, faCheck } from '@fortawesome/free-solid-svg-icons';
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

import { ModalComponent } from '../widgets/modal/modal.component';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-servicios',
    standalone: true,
    templateUrl: './servicios.component.html',
    styleUrl: './servicios.component.css',
    imports: [NavbarComponent, HttpClientModule,
        CommonModule,
        FontAwesomeModule, KazeFormInputComponent, KazeFormInputComponent, FormsModule, ReactiveFormsModule, ModalComponent]
})

export class ServiciosComponent {

  collapsedNav = false

  // form_recuperapass: FormGroup
  // cuit_form: FormGroup

  nombre = ""
  email = ""

  enviando_nueva_pass = false
  verificando = false
  enviando_email = false

  lista_corsvap = <any>[]
  mostrarModalEditarCorsvap = false

  item_actual: any

  confirmarProgramarFecha = false

  faClose = faClose
  faCheck = faCheck

  formProgramarServicio: FormGroup

  constructor(public appSession: SessionService, private formBuilder: FormBuilder, private snackbarService: SnackbarService, private apiService: ApiServiceService,private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver) {

    this.apiService.token = this.appSession.appToken

    // this.form_recuperapass = this.formBuilder.group({
    //   pass_actual: '',
    //   nueva_pass: '',
    //   repetir_nueva_pass: '',
    //   id: appSession.userId
    // })

    // this.cuit_form = this.formBuilder.group({
    //   cuit: '',
    // });

    this.obtenerCORSVAP()

    this.formProgramarServicio = this.formBuilder.group({

      fechainiciotrabajo: ''

    })

  }

  obtenerCORSVAP(){
    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      method: 'listar_corsvap_derivadas',
      module: 'isg',
      payload: JSON.stringify({
        id_responsable_servicios: this.appSession.id_responsable_servicios
      })
    }).subscribe((data: any)=>{

      let contador = 0

      while(contador < data.length){
        this.formatearItem(data,contador)
        contador++
      }

      this.lista_corsvap = data

    })

    
  }

  updateCollapse($value: boolean) {
    this.collapsedNav = $value

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

  modalEditarCorsvapChange(e: boolean){

    this.mostrarModalEditarCorsvap = e

  }

  formatearItem(data: any, index: number){

    let fechahora_comps = data[index].fechahora.split(" ")
    let fecha_comps = fechahora_comps[0].split("-")

    data[index].fechahora = fecha_comps[2]+"/"+fecha_comps[1]+"/"+fecha_comps[0]+" "+fechahora_comps[1]

    let fechaesperada_comps = data[index].fechavencimiento.split("-")

    data[index].fechavencimiento = fechaesperada_comps[2]+"/"+fechaesperada_comps[1]+"/"+fechaesperada_comps[0]

    if(data[index].fechainiciotrabajo == null){
      data[index].fechainiciotrabajo = 'No iniciado'
    }
    else{
      let fechainiciotrabajo_comps = data[index].fechainiciotrabajo.split("-")
      data[index].fechainiciotrabajo = fechainiciotrabajo_comps[2]+"/"+fechainiciotrabajo_comps[1]+"/"+fechainiciotrabajo_comps[0]  
    }


  }

  mostrarModalConfirmarProgramacion = false

  modalConfirmarProgramacionChange(e: boolean){
    this.mostrarModalConfirmarProgramacion = e
  }

  errorProgramarFecha = ""

  verificarProgramarFecha(){

    let fecha = this.formProgramarServicio.value.fechainiciotrabajo

    if(fecha == "" || !this.fechaEsMayorQueHoy(fecha)){
      this.errorProgramarFecha = "Debe indicar una fecha válida para la programación del servicio"
      return
    }

    this.mostrarModalConfirmarProgramacion = true;
    this.mostrarModalEditarCorsvap = false

  }

  fechaEsMayorQueHoy(fechaString: string): boolean {
    // Obtener la fecha actual
    const hoy = new Date();
    hoy.setUTCHours(hoy.getUTCHours() - 3);
    hoy.setUTCHours(0, 0, 0, 0); // Configurar la hora a las 00:00:00

    // Convertir la fecha en formato de cadena a un objeto Date en UTC-3
    const fecha = new Date(fechaString);
    fecha.setUTCHours(fecha.getUTCHours() + 3);
    fecha.setUTCHours(0, 0, 0, 0); // Configurar la hora a las 00:00:00

    // Verificar si la fecha es mayor o igual al día de hoy
    return fecha >= hoy;
  }

  programarFechaInicioTrabajo(){

    this.mostrarModalConfirmarProgramacion = false

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/", {
      module: 'isg',
      method: 'programar_inicio_trabajo',
      payload: JSON.stringify({

        idusuario_csc: this.appSession.userId,
        id_derivacion_corsvap: this.item_actual.id,
        fechainiciotrabajo: this.formProgramarServicio.value.fechainiciotrabajo

      })
    }).subscribe((data: any)=>{
      if(data.resultado == "success"){
        this.snackbarService.mostrarMensaje("Fecha programada correctamente", 2000)
        this.obtenerCORSVAP()
      }
    })

  }

}
