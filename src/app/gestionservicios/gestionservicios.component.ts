import { Component, Renderer2 } from '@angular/core';
import { NavbarComponent } from '../widgets/navbar/navbar.component';
import { ApiServiceService } from '../services/api-service.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBroom, faFilter, faPrint, faPlus,faClose, faSearch,} from '@fortawesome/free-solid-svg-icons';
import { AppSettings } from '../appsettings';
import { SessionService } from '../schema/session';
import { KazeFormInputComponent } from "../widgets/kaze-form-input/kaze-form-input.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SnackbarService } from '../services/snackbar.service';
import { ModalComponent } from "../widgets/modal/modal.component";
import { Router } from '@angular/router';

@Component({
    selector: 'app-gestion-servicios',
    standalone: true,
    templateUrl: './gestionservicios.component.html',
    styleUrl: './gestionservicios.component.css',
    imports: [NavbarComponent, HttpClientModule,
        CommonModule,
        FontAwesomeModule, KazeFormInputComponent, KazeFormInputComponent, FormsModule, ReactiveFormsModule, ModalComponent]
})

export class GestionServiciosComponent {

  faPlus = faPlus
  faClose = faClose
  faSearch = faSearch
  faFilter = faFilter
  faBroom = faBroom

  Object = Object

  collapsedNav = false

  options_sucursales = <any>[]
  criteriosResponsables = <any>[]
  resultados_responsables = <any>[]

  formSucursalMapa: FormGroup
  formResponsables: FormGroup

  formularioBusquedaResponsables: FormGroup
  pagina_actual = 0

  cargandoResponsables = false
  cantidad_paginas = 0

  mostrarModalBuscarResponsables = false

  modosResponsables = [
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
  navigate(path: string){
    this.router.navigate([path])  
  }

  constructor(public appSession: SessionService,  private router: Router, private formBuilder: FormBuilder, private snackbarService: SnackbarService, private apiService: ApiServiceService) {
    if(this.appSession.id_responsable_servicios > 0) this.navigate('coordinacion_servicios');

    this.apiService.token = this.appSession.appToken

    this.formSucursalMapa = this.formBuilder.group({
      id_sucursal: ''
    })

    this.formResponsables = this.formBuilder.group({
      id: '',
      nombre: '',
      email: '',
      whatsapp: '',
      idsucursal: '',
      descripcion_puesto: ''
    })

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'isg',
      method: 'sucursales',
      payload: JSON.stringify({

      })
    }).subscribe((data: any)=>{

      this.options_sucursales = data

    })

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'isg',
      method: 'tipos_maquinas',
      payload: JSON.stringify({})
    }).subscribe((data: any) => {

      this.tipos_maquinas = data
      data.forEach((element: any) => {
        this.index_maquinas_seleccionadas.push({
          id_tipomaquina: element.id,
          seleccionada: 0
        })
      });

    })

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      method: 'criteria',
      module: 'isg',
      payload: JSON.stringify({
        reg: 'responsables_servicio'
      })
    }).subscribe((data: any)=>{

      this.criteriosResponsables = data.map((e: any)=>{
        return {
          value: e,
          text: e
        }
      })

      //console.log(this.criteriosAlertas)

    })

    this.formularioBusquedaResponsables = this.formBuilder.group({
      crit: '',
      search: '',
      mode: ''
    })

  }

  updateCollapse($value: boolean) {
    this.collapsedNav = $value

  }

  ////////////////////////////////////////////////////
  //FORMS

  data_responsables = <any>[]
  tipos_maquinas = <any>[]
  index_maquinas_seleccionadas = <any>[]

  index_responsable_seleccionado = -1;

  onSubmitFormSucursalMapa(event: any){
    
    /////Buscar responsables con sus maquinas de la sucursal seleccionada

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'isg',
      method: 'responsables_sucursal',
      payload: JSON.stringify({

        id_sucursal: this.formSucursalMapa.value.id_sucursal

      })
    }).subscribe((data: any) => {

      let c = 0;

      while(c < this.index_maquinas_seleccionadas.length){
        this.index_maquinas_seleccionadas[c].seleccionada = 0
        c++
      }

      this.data_responsables = data
      this.index_responsable_seleccionado = -1

    })

  }

  seleccionarResponsable(index: number){

    this.index_responsable_seleccionado = index

    let c = 0;

    /////DESELECCIONAR TODAS LAS MAQUINAS

    while(c < this.index_maquinas_seleccionadas.length){
      this.index_maquinas_seleccionadas[c].seleccionada = 0
      c++
    }

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'isg',
      method: 'tiposmaquinas_responsables',
      payload: JSON.stringify({
        id_responsable: this.data_responsables[index].idresponsable
      })
    }).subscribe((data: any) => {

      data.forEach((element: any) => {
        
        let contador = 0

        ///SELECCIONO LOS TIPOS DE MAQUINAS QUE TIENE EL RESPONSABLE SELECCIOANDO

        this.index_maquinas_seleccionadas.forEach((element_tipomaquina: any) => {
          
          if(element_tipomaquina.id_tipomaquina == element.id){
            this.index_maquinas_seleccionadas[contador].seleccionada = 1;
          }

          contador++

        });

      });

    })

  }

  changeSeleccionarTipoMaquina(index: number){

    this.index_maquinas_seleccionadas[index].seleccionada = this.index_maquinas_seleccionadas[index].seleccionada  == 1 ? 0 : 1

  }

  guardarCambiosMapaResponsablesTiposMaquinas(){

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

      module: 'isg',
      method: 'guardar_cambios_responsable_tiposmaquinas',
      payload: JSON.stringify({
        id_responsable: this.data_responsables[this.index_responsable_seleccionado].idresponsable,
        tipos_maquinas: JSON.stringify(this.index_maquinas_seleccionadas)
      })

    }).subscribe((data: any)=>{

      if(data.resultado == "success"){
        this.snackbarService.mostrarMensaje("Actualizaste los datos del responsable correctamente",2000)
      }
      else{
        this.snackbarService.mostrarMensaje("No se pudieron actualizar los datos del responsable.",2000)

      }

    })

  }

  onSubmitFormResponsables(event: any){

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'isg',
      method: 'registro_responsables',
      payload: JSON.stringify(this.formResponsables.value)
    }).subscribe((data: any)=>{

      if(data.resultado == "success"){
        this.snackbarService.mostrarMensaje("El responsable fue registrado correctamente",2000)
        this.limpiar()
        this.obtenerListaResponsables()
      }
      else{
        this.snackbarService.mostrarMensaje("No se pudo registrar el responsable. Intente nuevamente más tarde",2000)
      }

    })

  }

  modalBuscarResponsablesChange(e: boolean){
    this.mostrarModalBuscarResponsables = e
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
      this.obtenerListaResponsables()
    }


  }

  obtenerListaResponsables() {
    this.cargandoResponsables = true;

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'search_api',
      module: 'isg',
      payload: JSON.stringify({
        page: this.pagina_actual,
        table: 'responsables_servicio',
        search: this.formularioBusquedaResponsables.value.search,
        crit: this.formularioBusquedaResponsables.value.crit,
        mode: this.formularioBusquedaResponsables.value.mode
      })
    }).subscribe((data: any) => {

      this.cargandoResponsables = false;

      this.resultados_responsables = data.contenido
      this.cantidad_paginas = data.cantidadpaginas

    })
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  limpiar(){
    this.formResponsables = this.formBuilder.group({
      id: '',
      nombre: '',
      descripcion_puesto: '',
      email: '',
      whatsapp: '',
      idsucursal: ''

    })
  }

  editar(index: number){
    this.mostrarModalBuscarResponsables = false

    let item = this.resultados_responsables[index]

    this.formResponsables = this.formBuilder.group({
      id: item.id,
      nombre: item.nombre,
      descripcion_puesto: item.descripcion_puesto,
      email: item.email,
      whatsapp: item.whatsapp,
      idsucursal: item.idsucursal

    })

  }

}
