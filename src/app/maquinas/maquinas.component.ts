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
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

import { ModalComponent } from '../widgets/modal/modal.component';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-maquinas',
  standalone: true,
  templateUrl: './maquinas.component.html',
  styleUrl: './maquinas.component.css',

  imports: [NavbarComponent, HttpClientModule,
    CommonModule,
    FontAwesomeModule, KazeFormInputComponent, KazeFormInputComponent, FormsModule, ReactiveFormsModule, AutocompleteLibModule],
})

export class MaquinasComponent {



  collapsedNav = false

  formMaquinas: FormGroup
  formMapaCodigosModelos: FormGroup

  nombre = ""
  email = ""

  enviando_nueva_pass = false
  verificando = false
  enviando_email = false

  formatearFechaHora = formatearFechaHora

  info_ultima_guardia = ""

  dataCodigosFalla = <any>[];
  dataModelos: any

  keyword: any;

  archivoinstructivo = ''
  fileReader = new FileReader();

  file_array = <any>[]
  file_index = 0;
  files_count = 1;

  constructor(public appSession: SessionService, private formBuilder: FormBuilder, private snackbarService: SnackbarService, private apiService: ApiServiceService,private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver) {

    this.apiService.token = this.appSession.appToken

    this.nombre = appSession.nombre
    this.email = appSession.email

    this.formMaquinas = this.formBuilder.group({
      id: '',
      lineanegocio: '',
      nombre_organizacion: '',
      idorganizacion: '',
      marca: '',
      modelo: '',
      link_manual_diagnostico: '',
      link_manual_reparacion: '',
      link_manual_operador: '',
    })

    this.formMapaCodigosModelos = this.formBuilder.group({
      porcentaje_filtro_acciones: '',
      link_manual: '',
      archivo: ''
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

  selectedCodigoFalla: any
  selectedModeloMaquina: any

  selectCodigoFallaEvent($event: Event) {
    this.selectedCodigoFalla = $event
    this.verificarCodigoModeloExistente()
  }

  onCodigoFallaFocused(event: any) {
  
  }

  timeoutId: any

  onCodigoFallaChangeSearch(val: string) {

    try {
      clearTimeout(this.timeoutId)

      this.timeoutId = setTimeout(() => {

        this.getCodigoFalla(val)

      }, 200);

    } catch (error) {

    }

  }

  getCodigoFalla(searchField: string) {
    this.apiService.APIPost(AppSettings.API_ENDPOINT + '/', {
      module: 'isg',
      method: 'directorio_codigos_falla',
      payload: JSON.stringify({
        campo: searchField
      })
    }).subscribe((datao: any) => {

      console.log(datao)

      var conv = (datao as any)

      this.dataCodigosFalla = conv

    });

  }

  selectModeloEvent($event: any) {
    this.selectedModeloMaquina = $event
    this.verificarCodigoModeloExistente()
  }
  
  timeoutModelo: any
  
  onModeloChangeSearch(val: string) {
    try {
      clearTimeout(this.timeoutModelo)

      this.timeoutModelo = setTimeout(() => {

        this.getModelo(val)

      }, 200);

    } catch (error) {

    }
  }

  getModelo(searchField: string) {
    this.apiService.APIPost(AppSettings.API_ENDPOINT + '/', {
      module: 'isg',
      method: 'directorio_modelos_maquina',
      payload: JSON.stringify({
        campo: searchField
      })
    }).subscribe((datao: any) => {

      console.log(datao)

      var conv = (datao as any)

      this.dataModelos = conv

    });

  }

  onModeloFocused($event: void) {

  }

  verificarCodigoModeloExistente(){

    if(this.selectedCodigoFalla == undefined || this.selectedModeloMaquina == undefined) return

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

      module: 'isg',
      method: 'verificar_mapa_codigo_modelo',
      payload: JSON.stringify({

        codigo: this.selectedCodigoFalla.codigo,
        idmodelo: this.selectedModeloMaquina.id,

      })

    }).subscribe((data: any)=>{

      if(data.resultado == "success"){
        this.formMapaCodigosModelos.get("porcentaje_filtro_acciones")?.setValue(data.porcentaje_filtro_acciones)
        this.formMapaCodigosModelos.get("link_manual")?.setValue(data.link_manual)
        this.snackbarService.mostrarMensaje("Porcentaje encontrado",1000)
      }

    })

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

  guardarMapaCodigosModelos(){

    if(this.selectedCodigoFalla == undefined || this.selectedModeloMaquina == undefined) return

    let objeto_formulario = this.formMapaCodigosModelos.value

    this.file_array.forEach((element: any) => {

      objeto_formulario[element["name"]] = element["value"];
      objeto_formulario[element["name"] + "_data"] = element["base64rep"]

    });

    objeto_formulario["idmodelo"] =  this.selectedModeloMaquina.id
    objeto_formulario["codigo"] = this.selectedCodigoFalla.codigo

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

      module: 'isg',
      method: 'cargar_mapa_codigos_modelos',
      payload: JSON.stringify(objeto_formulario)

    }).subscribe((data: any)=>{

      if(data.resultado == "success"){
        this.snackbarService.mostrarMensaje("Mapa código-modelo cargado correctamente")
        return
      }
      else{
        this.snackbarService.mostrarMensaje("No se pudo cargar el mapa código-modelo. Itnente nuevamente más tarde")
        return
      }

    })

  }

  limpiarFormularioMapaCodigosModelos(){
    
    this.formMapaCodigosModelos.get("porcentaje_filtro_acciones")?.setValue('')
    this.formMapaCodigosModelos.get("link_manual")?.setValue('')

  }

}
