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
import { Router } from '@angular/router';

@Component({
  selector: 'app-paquetes',
  standalone: true,
  // providers: [{ provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } }, { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } }
  // ],
  templateUrl: './paquetes.component.html',
  styleUrl: './paquetes.component.css',
  imports: [NavbarComponent, HttpClientModule,
    CommonModule,
    FontAwesomeModule, KazeFormInputComponent, KazeFormInputComponent, FormsModule, ReactiveFormsModule, AutocompleteLibModule, ModalComponent, KazeFormSelectComponent]
})
export class PaquetesComponent {
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

  criteriosPaquetes = <any>[]
  modosPaquetes = [
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

  keyword = 'name';
  dataMaq = [

  ];

  keywordOrganizaciones = 'name'
  dataOrg = []

  formPaquetes: FormGroup;
  formularioBusqueda: FormGroup

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
  resultados_paquetes = <any>[]

  pagina_actual = 0
  cantidad_paginas = 0;
  cargandoPaquetes = false

  fileReader = new FileReader();

  file_array = <any>[]
  file_index = 0;
  files_count = 3;

  linkDescargaContrato = ""
  linkDescargaCOR = ""
  linkDescargaFactura = ""

  mapEstadosPaquetes = [
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

  raizDocumentos = ''
  
  navigate(path: string){
    this.router.navigate([path])  
  }

  constructor(public appSession: SessionService,private router: Router, private formBuilder: FormBuilder, public snackbarService: SnackbarService, private apiService: ApiServiceService, private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver) {

    if(this.appSession.id_responsable_servicios > 0) this.navigate('coordinacion_servicios');
    
    this.raizDocumentos = AppSettings.CLIENT_DOCUMENTS_URL

    this.apiService.token = this.appSession.appToken
    this.formPaquetes = this.formBuilder.group({

      id: '',
      idvendedor: '',
      idorganizacion: '',
      razonsocial: '',
      nombreorganizacion: '',
      idmaquina: '',
      pin: '',
      nombremaquina: '',
      zonamonitoreo: '',
      fechadesde: '',
      fechafacturacion: '',
      fechahasta: '',
      horas: '',
      horasconsumidas: '',
      archivoorden: '',
      archivofactura: '',
      archivocontrato: '',
      estado: ''

    })

    this.formularioBusqueda = this.formBuilder.group({
      crit: '',
      search: '',
      mode: ''
    })


    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: "usuarios_csc",
      module: "isg",
      payload: JSON.stringify({

      })
    }).subscribe((data: any) => {

      this.vendedoresOptions = data.map((e: any) => {
        return {
          value: e.id,
          text: e.nombre
        }
      })

      //console.log(this.vendedoresOptions)

    })

    this.fileReader.onload = (event) => {
      // El contenido del archivo se encuentra en event.target.result
      const base64String = event.target?.result as string;

      // Aquí puedes enviar la cadena base64 a través de tu API
      //console.log(base64String);

      this.file_array[this.file_index]["base64rep"] = base64String

    };

    for (let index = 0; index < this.files_count; index++) {

      this.file_array.push({
        name: '',
        value: '',
        base64rep: ''
      })

    }

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      method: 'criteria',
      module: 'isg',
      payload: JSON.stringify({
        reg: 'paquetesisg'
      })
    }).subscribe((data: any)=>{

      this.criteriosPaquetes = data.map((e: any)=>{
        return {
          value: e,
          text: e
        }
      })

      //console.log(this.criteriosPaquetes)

    })

    this.obtenerListaPaquetes()

  }



  obtenerListaPaquetes() {
    this.cargandoPaquetes = true;

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'listar_paquetes',
      module: 'isg',
      payload: JSON.stringify({
        page: this.pagina_actual,
        search: this.formularioBusqueda.value.search,
        crit: this.formularioBusqueda.value.crit,
        mode: this.formularioBusqueda.value.mode
      })
    }).subscribe((data: any) => {

      this.cargandoPaquetes = false;

      this.resultados_paquetes = data.contenido
      this.cantidad_paginas = data.cantidadpaginas

      // console.log(1)

    })
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  updateCollapse($value: boolean) {
    this.collapsedNav = $value
  }

  modalMaquinariasChange(value: boolean) {
    this.mostrarModalMaquinarias = value
  }

  modalOrganizacionesChange(value: boolean) {
    this.mostrarModalOrganizaciones = value
  }

  selectMaquinariaEvent(item: any) {

    console.log(item)
    this.mostrarModalMaquinarias = false

    this.formPaquetes.get("idmaquina")?.setValue(item.id)
    this.formPaquetes.get("nombremaquina")?.setValue(item.vin + ". " + item.marca + " " + item.modelo + ". " + item.nombre)
    this.formPaquetes.get("pin")?.setValue(item.vin)

    
  }

  selectOrganizacionEvent(item: any) {

    console.log(item)
    this.mostrarModalOrganizaciones = false

    this.formPaquetes.get("idorganizacion")?.setValue(item.id)
    this.formPaquetes.get("nombreorganizacion")?.setValue(item.nombre)

  }

  timeoutId: any
  timeoutOrgId: any

  onMaquinariaChangeSearch(val: string) {

    try {
      clearTimeout(this.timeoutId)

      this.timeoutId = setTimeout(() => {

        this.getMaquinarias(val)

      }, 200);

    } catch (error) {

    }

  }

  formatearFecha(fecha: string) {
    let comps = fecha.split("-")
    return comps[2] + "/" + comps[1] + "/" + comps[0]
  }

  onOrganizacionChangeSearch(val: string) {

    try {
      clearTimeout(this.timeoutOrgId)

      this.timeoutOrgId = setTimeout(() => {

        this.getOrganizaciones(val)

      }, 200);

    } catch (error) {

    }

  }

  getMaquinarias(searchField: string) {

    // this.cargandoComprobantes = true
    //this.keyword = searchField;

    this.apiService.APIPost(AppSettings.API_ENDPOINT + '/', {
      module: 'isg',
      method: 'maquinarias',
      payload: JSON.stringify({
        campo: searchField,
        idorganizacion: this.formPaquetes.value.idorganizacion
      })
    }).subscribe((data: any) => {

      console.log(data)

      var conv = (data as any)

      this.dataMaq = conv["lista"]

    });
  }

  getOrganizaciones(searchField: string) {
    this.apiService.APIPost(AppSettings.API_ENDPOINT + '/', {
      module: 'isg',
      method: 'organizaciones',
      payload: JSON.stringify({
        campo: searchField
      })
    }).subscribe((datao: any) => {

      console.log(datao)

      var conv = (datao as any)

      this.dataOrg = conv["lista"]

    });
  }

  onMaquinariaFocused(e: any) {

  }

  onOrganizacionFocused(e: any) {

  }



  agregarContacto() {
    this.contactosPaquete.push({
      nombre: '',
      telefono: '',
      email: '',
    })
  }

  eliminarContacto(index: number) {
    this.contactosPaquete.splice(index, 1)
  }

  onFileChanged(event: Event, store_data: string, index: number) {

    this.file_index = index
    var files = (event.target as HTMLInputElement).files

    if (files != null) {
      if (files?.length > 0) {
        const file = files[0];
        //this.certEscolar = file;
        //this.formPaquetes.
        // console.log(file)  

        this.file_array[index]["name"] = store_data
        this.file_array[index]["value"] = file.name

        this.fileReader.readAsDataURL(file);

      }
    }
  }

  onSubmitFormPaquetes(event: Event) {

    event.preventDefault()

    if (this.formPaquetes.value.idvendedor == "") {
      this.snackbarService.mostrarMensaje("Debe seleccionar un vendedor", 2000)
      return
    }
    if (this.formPaquetes.value.razonsocial == "") {
      this.snackbarService.mostrarMensaje("Debe ingresar la razón social", 2000)
      return
    }
    if (this.formPaquetes.value.idorganizacion == "") {
      this.snackbarService.mostrarMensaje("Debe seleccionar una organización", 2000)
      return
    }
    if (this.formPaquetes.value.idmaquina == "") {
      this.snackbarService.mostrarMensaje("Debe seleccionar una maquinaria", 2000)
      return
    }
    if (this.formPaquetes.value.fechadesde == "") {
      this.snackbarService.mostrarMensaje("Debe indicar una fecha de inicio del paquete", 2000)
      return
    }
    if (this.formPaquetes.value.fechahasta == "") {
      this.snackbarService.mostrarMensaje("Debe indicar una fecha de finalización del paquete", 2000)
      return
    }
    if (this.formPaquetes.value.zonamonitoreo == "") {
      this.snackbarService.mostrarMensaje("Debe indicar una zona de monitoreo", 2000)
      return
    }

    let objeto_formulario = this.formPaquetes.value

    objeto_formulario["idclientes_sistema"] = '0'

    let ok = true

    this.contactosPaquete.forEach((element: any) => {
      if(!this.tieneOnceDigitosNumericos(element.telefono)){
        this.snackbarService.mostrarMensaje("El número de teléfono provisto debe tener 11 caracteres y comenzar con 9",2000)
        ok = false
        return
      }
    });

    if(!ok) return

    objeto_formulario["contactos"] = JSON.stringify(this.contactosPaquete)

    this.file_array.forEach((element: any) => {

      objeto_formulario[element["name"]] = element["value"];
      objeto_formulario[element["name"] + "_data"] = element["base64rep"]

    });

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'registro_paquetes',
      module: 'isg',
      payload: JSON.stringify(objeto_formulario)
    }).subscribe((data: any) => {

      console.log(data)
      if (data.resultado == "success") {
        this.limpiarFormulario()
        this.snackbarService.mostrarMensaje("Paquete registrado correctamente.", 3000)
      }
      else {
        this.snackbarService.mostrarMensaje("Ocurrió un error al intentar registrar el paquete. Intente nuevamente más tarde.", 2000);
      }

      this.obtenerListaPaquetes()

    })

  }

  updateNombreContacto(value: Event, index: number) {
    this.contactosPaquete[index].nombre = (value.target as HTMLInputElement).value
  }

  updateTelefonoContacto(value: Event, index: number) {
    this.contactosPaquete[index].telefono = (value.target as HTMLInputElement).value

  }
  updateReferenciaContacto(value: Event, index: number) {
    this.contactosPaquete[index].referencia = (value.target as HTMLInputElement).value
  }

  updateHoraInicioContacto(value: Event, index: number){
    this.contactosPaquete[index].horainicioavisos = (value.target as HTMLInputElement).value

  }

  updateHoraFinContacto(value: Event, index: number){
    this.contactosPaquete[index].horafinavisos = (value.target as HTMLInputElement).value
  }

  tieneOnceDigitosNumericos(valor: string) {
    // Expresión regular para verificar si el string tiene 11 dígitos numéricos
    const regex = /^9\d{10}$/;
    return regex.test(valor);
  }

  limpiarFormulario() {
    this.formPaquetes = this.formBuilder.group({

      id: '',
      idvendedor: '',
      idorganizacion: '',
      razonsocial: '',
      nombreorganizacion: '',
      idmaquina: '',
      pin: '',
      nombremaquina: '',
      zonamonitoreo: '',
      fechadesde: '',
      fechafacturacion: '',
      fechahasta: '',
      horas: '',
      horasconsumidas: '',
      archivocontrato: '',
      archivofactura: '',
      archivoorden: '',
      estado: ''

    })

    this.contactosPaquete = []

    this.linkDescargaContrato = ''
    this.linkDescargaCOR = ''
    this.linkDescargaFactura = ''

  }

  editar(index: number) {

    this.limpiarFormulario()

    let paquete = this.resultados_paquetes[index]

    this.formPaquetes = this.formBuilder.group({

      id: paquete.id,
      idvendedor: paquete.idvendedor,
      idorganizacion: paquete.idorganizacion,
      razonsocial: paquete.razonsocial,
      nombreorganizacion: paquete.nombreorganizacion,
      idmaquina: paquete.idmaquina,
      pin: paquete.pin,
      nombremaquina: paquete.nombremaquina,
      zonamonitoreo: paquete.zonamonitoreo,
      fechadesde: paquete.fechadesde,
      fechafacturacion: paquete.fechafacturacion,
      fechahasta: paquete.fechahasta,
      horas: paquete.horas,
      horasconsumidas: paquete.horasconsumidas,
      // archivocontrato: paquete.archivocontrato != undefined ? paquete.archivocontrato : '',
      // archivofactura: paquete.archivofactura != undefined ? paquete.archivofactura : ''

    })

    

    paquete.lista_contactos.forEach((element: any) => {

      this.contactosPaquete.push({
        nombre: element.nombre,
        referencia: element.referencia,
        telefono: element.telefono,
        predeterminado: element.predeterminado,
        horainicioavisos: element.horainicioavisos,
        horafinavisos: element.horafinavisos
      })

    });

    ///Poner links de archivos

    this.linkDescargaContrato = paquete.archivocontrato
    this.linkDescargaCOR = paquete.archivoorden
    this.linkDescargaFactura = paquete.archivofactura

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
      this.obtenerListaPaquetes()
    }


  }

  marcar_predeterminado(index: number){

    let contador = 0

    while(contador < this.contactosPaquete.length){
      
      this.contactosPaquete[contador].predeterminado = 0
      
      contador++
    }

    this.contactosPaquete[index].predeterminado = 1

  }

}
