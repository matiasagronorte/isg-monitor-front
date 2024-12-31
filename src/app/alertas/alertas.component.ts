import { Component, OnInit, Renderer2 } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-alertas',
  standalone: true,
  // providers: [{ provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } }, { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } }
  // ],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css',
  imports: [NavbarComponent, HttpClientModule,
    CommonModule,
    FontAwesomeModule, KazeFormInputComponent, KazeFormInputComponent, FormsModule, ReactiveFormsModule, AutocompleteLibModule, ModalComponent, KazeFormSelectComponent]
})
export class AlertasComponent implements OnInit {
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

  options_categorias = <any>[]

  criteriosAlertas = <any>[]
  modosAlertas = [
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

  formAlertas: FormGroup;
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
  resultados_alertas = <any>[]

  pagina_actual = 0
  cantidad_paginas = 0;
  cargandoAlertas = false

  fileReader = new FileReader();

  file_array = <any>[]
  file_index = 0;
  files_count = 3;

  linkDescargaContrato = ""
  linkDescargaCOR = ""
  linkDescargaFactura = ""

  mapEstadosAlertas = [
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

  enviandoFormulario = false

  ////////////////////////////////////////////////////////////////

  raizDocumentos = ''
  navigate(path: string){
    this.router.navigate([path])  
  }

  constructor(private route: ActivatedRoute,public appSession: SessionService,private router: Router, private formBuilder: FormBuilder, public snackbarService: SnackbarService, private apiService: ApiServiceService, private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver) {

    if(this.appSession.id_responsable_servicios > 0) this.navigate('coordinacion_servicios');


    this.raizDocumentos = AppSettings.CLIENT_DOCUMENTS_URL

    this.apiService.token = this.appSession.appToken
    this.formAlertas = this.formBuilder.group({

      id: '',
      codigo: '',
      color: '',
      tipo: '',
      descripcion: '',
      filtrarcsc: '',
      idcategoria_alerta: '',
      idcategoria_alerta_tope: '',
      tiempoestimadoresolucion: '',
      diasatencionderivacion: '',
      diasresolucionderivacion: '',
      repeticionesaviso: '',
      rangodiasrepeticionesaviso: '',
      segundosduracionaviso: ''

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

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: "listar_categorias_alertas",
      module: "isg",
      payload: JSON.stringify({

      })
    }).subscribe((data: any) => {

      this.options_categorias = data

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
        reg: 'alertasmaquinas'
      })
    }).subscribe((data: any)=>{

      this.criteriosAlertas = data.map((e: any)=>{
        return {
          value: e,
          text: e
        }
      })

      //console.log(this.criteriosAlertas)

    })

    this.obtenerListaAlertas()

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      
      if(params['id'] != undefined)
      this.getSingleAlerta(params['id'])

    })
  }

  getSingleAlerta(id: number){

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

      module: 'isg',
      method: 'obtener_single_alerta',
      payload: JSON.stringify({
        id: id
      })

    }).subscribe((data: any)=>{

      ///obtener array

      this.resultados_alertas = data
      this.editar(0)

    })

  }

  obtenerListaAlertas() {
    this.cargandoAlertas = true;

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'listar_alertas',
      module: 'isg',
      payload: JSON.stringify({
        page: this.pagina_actual,
        search: this.formularioBusqueda.value.search,
        crit: this.formularioBusqueda.value.crit,
        mode: this.formularioBusqueda.value.mode
      })
    }).subscribe((data: any) => {

      this.cargandoAlertas = false;

      this.resultados_alertas = data.contenido
      this.cantidad_paginas = data.cantidadpaginas

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

    this.formAlertas.get("idmaquina")?.setValue(item.id)
    this.formAlertas.get("nombremaquina")?.setValue(item.vin + ". " + item.marca + " " + item.modelo + ". " + item.nombre)
    this.formAlertas.get("pin")?.setValue(item.vin)

    
  }

  selectOrganizacionEvent(item: any) {

    console.log(item)
    this.mostrarModalOrganizaciones = false

    this.formAlertas.get("idorganizacion")?.setValue(item.id)
    this.formAlertas.get("nombreorganizacion")?.setValue(item.nombre)

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
        idorganizacion: this.formAlertas.value.idorganizacion
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
        //this.formAlertas.
        // console.log(file)  

        this.file_array[index]["name"] = store_data
        this.file_array[index]["value"] = file.name

        this.fileReader.readAsDataURL(file);

      }
    }
  }

  verificarFormato(cadena: string): boolean {
    // Expresión regular para el formato AAA nnnnnn.nn
    const regex = /^[a-zA-Z0-9]{3}\s\d{6}\.\d{2}$/;
    return regex.test(cadena);
  }


  onSubmitFormAlertas(event: Event) {

    event.preventDefault()

    if(this.enviandoFormulario) return

    if (!this.verificarFormato(this.formAlertas.value.codigo)) {
      this.snackbarService.mostrarMensaje("Debe indicar un codigo de alerta en el formato establecido", 2000)
      return
    }

    if(this.formAlertas.value.color == ""){
      this.snackbarService.mostrarMensaje("Debe seleccionar un color", 2000)
      return
    }
    
    if(this.formAlertas.value.descripcion == ""){
      this.snackbarService.mostrarMensaje("Debe ingresar una descripción", 2000)
      return
    }
    
    if(this.formAlertas.value.filtrarcsc == ""){
      this.snackbarService.mostrarMensaje("Debe seleccionar una opción de filtro para el CSC", 2000)
      return
    }
    
    if(this.formAlertas.value.tiempoestimadoresolucion == ""){
      this.snackbarService.mostrarMensaje("Debe indicar un tiempo estimado de resolución", 2000)
      return
    }

    if(this.formAlertas.value.diasatencionderivacion == ""){
      this.snackbarService.mostrarMensaje("Debe indicar los días dentro de los que se debe atender el caso", 2000)
      return
    }

    if(this.formAlertas.value.diasresolucionderivacion == ""){
      this.snackbarService.mostrarMensaje("Debe indicar los días dentro de los que se debe finalizar el caso", 2000)
      return
    }

    let objeto_formulario = this.formAlertas.value

    this.enviandoFormulario = true

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'registro_alertas',
      module: 'isg',
      payload: JSON.stringify(objeto_formulario)
    }).subscribe((data: any) => {

      this.enviandoFormulario = false

      console.log(data)
      if (data.resultado == "success") {
        this.limpiarFormulario()
        this.snackbarService.mostrarMensaje("Alerta registrada correctamente.", 3000)
      }
      else {
        this.snackbarService.mostrarMensaje("Ocurrió un error al intentar registrar la alerta. Intente nuevamente más tarde.", 2000);
      }

      this.obtenerListaAlertas()

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
    this.formAlertas = this.formBuilder.group({

      id: '',
      codigo: '',
      color: '',
      descripcion: '',
      filtrarcsc: '',
      tiempoestimadoresolucion: '',
      diasresolucionderivacion: '',
      diasatencionderivacion: '',
      idcategoria_alerta: '',
      idcategoria_alerta_tope: '',
      repeticionesaviso: '',
      rangodiasrepeticionesaviso: '',
      segundosduracionaviso: ''

    })

    this.contactosPaquete = []

    this.linkDescargaContrato = ''
    this.linkDescargaCOR = ''
    this.linkDescargaFactura = ''

  }

  editar(index: number) {

    this.limpiarFormulario()

    let alerta = this.resultados_alertas[index]

    this.formAlertas = this.formBuilder.group({

      id: alerta.id,
      codigo: alerta.codigo,
      color: alerta.color,
      descripcion: alerta.descripcion,
      filtrarcsc: alerta.filtrarcsc,
      tiempoestimadoresolucion: alerta.tiempoestimadoresolucion,
      idcategoria_alerta: alerta.idcategoria_alerta,
      idcategoria_alerta_tope: alerta.idcategoria_alerta_tope,
      diasresolucionderivacion: alerta.diasresolucionderivacion,
      diasatencionderivacion: alerta.diasatencionderivacion,
      repeticionesaviso: alerta.repeticionesaviso,
      rangodiasrepeticionesaviso: alerta.rangodiasrepeticionesaviso,
      segundosduracionaviso: alerta.segundosduracionaviso

      // archivocontrato: paquete.archivocontrato != undefined ? paquete.archivocontrato : '',
      // archivofactura: paquete.archivofactura != undefined ? paquete.archivofactura : ''

    })

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
      this.obtenerListaAlertas()
    }


  }



}
