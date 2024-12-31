import { Component, Renderer2 } from '@angular/core';
import { NavbarComponent } from '../widgets/navbar/navbar.component';
import { ApiServiceService } from '../services/api-service.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBroom, faFilter, faPrint, faPlus, faSearch, faClose, faEdit } from '@fortawesome/free-solid-svg-icons';
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
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

import { ModalComponent } from '../widgets/modal/modal.component';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialog } from '@angular/material/dialog';
import { KazeFormSelectComponent } from "../widgets/kaze-form-select/kaze-form-select.component";
import { primeraFechaEsMenor , formatearFechaHora} from '../services/functions';

@Component({
  selector: 'app-admin',
  standalone: true,
  // providers: [{ provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } }, { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } }
  // ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  imports: [NavbarComponent, HttpClientModule,
    CommonModule,
    FontAwesomeModule, KazeFormInputComponent, KazeFormInputComponent, FormsModule, ReactiveFormsModule, AutocompleteLibModule, ModalComponent, KazeFormSelectComponent]
})
export class AdminComponent {
  Object = Object;
  collapsedNav = false

  faBroom = faBroom
  faFilter = faFilter
  faPrint = faPrint
  faPlus = faPlus
  faSearch = faSearch
  faClose = faClose
  faEdit = faEdit

  lista_maquinarias = <any>[]
  vendedoresOptions = <any>[]

  criteriosAdmin = <any>[]
  modosAdmin = [
    {
      value: 'PARECIDO A',
      text: 'PARECIDO A',
    },
    {
      value: 'IGUAL A',
      text: 'IGUAL A',
    },
    {
      value: 'MAYOR O IGUAL QUE',
      text: 'MAYOR O IGUAL QUE',
    },
    {
      value: 'MENOR O IGUAL QUE',
      text: 'MENOR O IGUAL QUE',
    },
    {
      value: 'EMPIEZA CON',
      text: 'EMPIEZA CON',
    },
    {
      value: 'TERMINA CON',
      text: 'TERMINA CON',
    },
    {
      value: 'DISTINTO A',
      text: 'DISTINTO A',
    },
  ]

  mostrarModalMaquinarias = false
  mostrarModalOrganizaciones = false
  mostrarModalElegirAgente = false

  formatearFechaHora = formatearFechaHora

  keyword = 'name';
  dataMaq = [

  ];

  keywordOrganizaciones = 'name'
  dataOrg = []

  formUsuariosCSC: FormGroup;
  formularioBusqueda: FormGroup
  formHorarioNoDisponible: FormGroup

  archivocontrato = ''
  archivofactura = ''

  zonasMonitoreo = [
    {
      value: 1,
      text: "ZONA 1"
    },
    {
      value: 2,
      text: "ZONA 2"
    },
  ]

  contactosPaquete = <any>[]
  resultados_usuarios_csc = <any>[]
  listaAgentes = <any>[]

  pagina_actual = 0
  cantidad_paginas = 0;
  cargandoAdmin = false

  fileReader = new FileReader();

  file_array = <any>[]
  file_index = 0;
  files_count = 3;

  linkDescargaContrato = ""
  linkDescargaCOR = ""
  linkDescargaFactura = ""

  mapEstadosAdmin = [
    {
      estado: "CONTRATO Y FACTURA PENDIENTE",
      class: "alert alert-warning"
    },
    {
      estado: "CONTRATO REALIZADO, FACTURA PENDIENTE",
      class: "alert alert-info"
    },
    {
      estado: "FACTURA EMITIDA, CONTRATO PENDIENTE",
      class: "alert alert-info"
    },
    {
      estado: "CONTRATO REALIZADO Y FACTURA EMITIDA",
      class: "alert alert-success"
    },
    {
      estado: "INFORMADO A JOHN DEERE",
      class: "alert alert-success"
    },
    {
      estado: "EXPIRADO",
      class: "alert alert-danger"
    },
    {
      estado: "RENOVADO",
      class: "alert alert-success"
    }
  ]

  coloresOptions = [
    {
      value: '1',
      text: 'AZUL'
    },
    {
      value: '2',
      text: 'AMARILLO'
    },
    {
      value: '3',
      text: 'ROJO'
    },
    {
      value: '99',
      text: 'OTHER'
    }
  ]

  raizDocumentos = ''
  form_indicar_guardia: FormGroup

  constructor(public appSession: SessionService, private formBuilder: FormBuilder, public snackbarService: SnackbarService, private apiService: ApiServiceService, private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver) {

    this.raizDocumentos = AppSettings.CLIENT_DOCUMENTS_URL

    this.apiService.token = this.appSession.appToken
    this.formUsuariosCSC = this.formBuilder.group({

      id: '',
      email: '',
      nombre: '',
      pass: '',
      usersysid: '',
      activo: '',
      supervisor: '',
      admin: '',
      whatsapp: ''

    })

    this.formularioBusqueda = this.formBuilder.group({
      crit: '',
      search: '',
      mode: ''
    })

    this.formHorarioNoDisponible = this.formBuilder.group({
      fechahorainicio: '',
      fechahorafin: '',

    })

    
    this.form_indicar_guardia = this.formBuilder.group({
      fechahorainicio: '',
      fechahorafin: '',
    });

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      method: 'criteria',
      module: 'isg',
      payload: JSON.stringify({
        reg: 'usuarios_csc'
      })
    }).subscribe((data: any)=>{

      this.criteriosAdmin = data.map((e: any)=>{
        return {
          value: e,
          text: e
        }
      })

      // console.log(this.criteriosAdmin)

    })

    this.obtenerListaUsuariosCSC()

  }

  obtenerListaUsuariosCSC() {

    this.cargandoAdmin = true;

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'listar_usuarios_csc',
      module: 'isg',
      payload: JSON.stringify({
        page: this.pagina_actual,
        search: this.formularioBusqueda.value.search,
        crit: this.formularioBusqueda.value.crit,
        mode: this.formularioBusqueda.value.mode
      })
    }).subscribe((data: any) => {

      this.cargandoAdmin = false;

      this.resultados_usuarios_csc = data.contenido
      this.cantidad_paginas = data.cantidadpaginas

    })
  }

  agregarAgente(index: number){

    this.mostrarModalElegirAgente = false
    this.listaAgentes.push(this.resultados_usuarios_csc[index])

  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  updateCollapse($value: boolean) {
    this.collapsedNav = $value
  }

  modalElegirAgenteChange(value: boolean) {
    this.mostrarModalElegirAgente = value
  }

  formatearFecha(fecha: string) {
    let comps = fecha.split("-")
    return comps[2] + "/" + comps[1] + "/" + comps[0]
  }

  verificarFormato(cadena: string): boolean {
    // Expresión regular para el formato AAA nnnnnn.nn
    const regex = /^[a-zA-Z0-9]{3}\s\d{6}\.\d{2}$/;
    return regex.test(cadena);
  }

  onSubmitFormUsuariosCSC(event: Event) {

    event.preventDefault()


    if(this.formUsuariosCSC.value.nombre == ""){
      this.snackbarService.mostrarMensaje("Debe indicar un nombre", 2000)
      return
    }

    if(this.formUsuariosCSC.value.email == ""){
      this.snackbarService.mostrarMensaje("Debe indicar un email para acceso y comunicaciones", 2000)
      return
    }
    
    if(this.formUsuariosCSC.value.usersysid == ""){
      this.snackbarService.mostrarMensaje("Debe indicar un número de autológica", 2000)
      return
    }

    if(this.formUsuariosCSC.value.activo == ""){
      this.snackbarService.mostrarMensaje("Debe indicar si el usuario está activo o no", 2000)
      return
    }

    if(this.formUsuariosCSC.value.supervisor == ""){
      this.snackbarService.mostrarMensaje("Debe indicar si el usuario es supervisor o no", 2000)
      return
    }

    if(this.formUsuariosCSC.value.administrador == ""){
      this.snackbarService.mostrarMensaje("Debe indicar si el usuario es administrador o no", 2000)
      return
    }

    let objeto_formulario = this.formUsuariosCSC.value

    objeto_formulario["agentes"] = JSON.stringify(this.listaAgentes);

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'registro_usuarios_csc',
      module: 'isg',
      payload: JSON.stringify(objeto_formulario)
    }).subscribe((data: any) => {

      console.log(data)

      if (data.resultado == "success") {
        this.limpiarFormulario()
        this.snackbarService.mostrarMensaje("Usuario registrado correctamente.", 3000)
        this.listaAgentes = []

      }
      else {
        this.snackbarService.mostrarMensaje("Ocurrió un error al intentar registrar el usuario. Intente nuevamente más tarde.", 2000);
      }

      this.obtenerListaUsuariosCSC()

    })

  }

  updateNombreContacto(value: Event, index: number) {
    this.contactosPaquete[index].nombre = (value.target as HTMLInputElement).value
  }

  updateTelefonoContacto(value: Event, index: number) {
    this.contactosPaquete[index].telefono = (value.target as HTMLInputElement).value

  }
  updateEmailContacto(value: Event, index: number) {
    this.contactosPaquete[index].email = (value.target as HTMLInputElement).value
  }

  limpiarFormulario() {
    this.formUsuariosCSC = this.formBuilder.group({

      id: '',
      email: '',
      nombre: '',
      pass: '',
      usersysid: '',
      activo: '',
      supervisor: '',
      admin: '',
      whatsapp: ''

    })

    this.contactosPaquete = []
    this.listaAgentes = []

    this.linkDescargaContrato = ''
    this.linkDescargaCOR = ''
    this.linkDescargaFactura = ''

    this.formHorarioNoDisponible.get('fechahorainicio')?.setValue('')
    this.formHorarioNoDisponible.get('fechahorafin')?.setValue('')

  }

  editar(index: number) {

    this.limpiarFormulario()

    let usuario = this.resultados_usuarios_csc[index]

    this.formUsuariosCSC = this.formBuilder.group({

      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      pass: usuario.pass,
      admin: usuario.admin,
      supervisor: usuario.supervisor,
      activo: usuario.activo,
      usersysid: usuario.usersysid,
      whatsapp: usuario.whatsapp

      // archivocontrato: paquete.archivocontrato != undefined ? paquete.archivocontrato : '',
      // archivofactura: paquete.archivofactura != undefined ? paquete.archivofactura : ''

    })

    if(usuario.supervisor == 1){
      this.listaAgentes = usuario.lista_agentes
    }

    window.scrollTo(0, 0)

  }

  pageHandler(p: string) {

    var updateSearch = true

    var minicurrent = this.pagina_actual

    // console.log("primero curr es "+minicurrent+" total es "+totalPages+" y p es "+p)

    switch (p) {
      case "<<":
        if (minicurrent == 0) updateSearch = false
        else minicurrent = 0

        break;
      case "<":
        if ((minicurrent - 1) >= 0)
          minicurrent--
        else updateSearch = false

        break;
      case ">":
        if ((minicurrent + 1) < this.cantidad_paginas)
          minicurrent++
        else updateSearch = false

        break;
      case ">>":
        if (minicurrent == this.cantidad_paginas - 1) updateSearch = false
        minicurrent = this.cantidad_paginas - 1
        break;
      default:
        updateSearch = false
        break;
    }

    // console.log("ahora curr es "+minicurrent+" total es "+totalPages)

    // setCurrentPage(minicurrent)

    this.pagina_actual = minicurrent

    if (updateSearch) {
      // this.revelarDesmarcarTodos = false
      this.obtenerListaUsuariosCSC()

    }


  }

  enviarHorarioNoDisponible(){

    let obj_form = this.formHorarioNoDisponible.value;

    if(this.formUsuariosCSC.value.id == ""){
      this.snackbarService.mostrarMensaje("Debe seleccionar un usuario del CSC para indicar el horario de no disponibilidad",3000)
      return
    }

    if(!primeraFechaEsMenor(obj_form.fechahorainicio,obj_form.fechahorafin)){
      this.snackbarService.mostrarMensaje("Las fechas/horas indicadas no son válidas",2000)
      return
    }

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

      module: 'isg',
      method: 'indicar_horario_no_disponible',
      payload: JSON.stringify({

        fechahorainicio: obj_form.fechahorainicio,
        fechahorafin: obj_form.fechahorafin,
        idusuario_csc: this.formUsuariosCSC.value.id

      })
    }).subscribe((data: any)=>{

      if(data.resultado == "success"){
        this.snackbarService.mostrarMensaje("El horario de no disponibilidad del operador fue cargado correctamente",3000)
        this.formHorarioNoDisponible.get('fechahorainicio')?.setValue('')
        this.formHorarioNoDisponible.get('fechahorafin')?.setValue('')
      }
      else{
        this.snackbarService.mostrarMensaje("No se pudo cargar el horario de no disponiblidad. Intente nuevamente más tarde",3000)
      }

    })

  }

  enviarDatosGuardia(){

    if(this.form_indicar_guardia.value.fechahorainicio == "" || this.form_indicar_guardia.value.fechahorafin == ""){
      this.snackbarService.mostrarMensaje("Debe indicar una fecha y hora de inicio/fin válidas",2000)
      return
    }

    let objeto_formulario = this.form_indicar_guardia.value
    objeto_formulario.idusuario_csc = this.appSession.userId

    if(primeraFechaEsMenor(this.form_indicar_guardia.value.fechahorainicio,this.form_indicar_guardia.value.fechahorafin)){

      this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
        module: 'isg',
        method: 'indicar_guardia',
        payload: JSON.stringify(objeto_formulario)
      }).subscribe((data: any) => {

        if(data.resultado == "success"){
          this.snackbarService.mostrarMensaje("Las fechas de guardia fueron cargadas con éxito",2000)

          this.form_indicar_guardia = this.formBuilder.group({
            fechahorainicio: '',
            fechahorafin: '',
          });
          
          this.obtenerGuardias();

        }
        else{
          this.snackbarService.mostrarMensaje("Ocurrió un problema al indicar la guardia. Intente nuevamente.",2000)

        }

      })

    }
    else{
      this.snackbarService.mostrarMensaje("Las fechas horas no son válidas")
      return
    }

  }

  lista_guardias = <any>[]

  obtenerGuardias(){

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'isg',
      method: 'obtener_guardias',
      payload: JSON.stringify({
        idusuario_csc: this.appSession.userId
      })
    }).subscribe((data: any)=>{

      this.lista_guardias = data.contenido

    })

  }

}
