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
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import  * as L from 'leaflet';

import { GoogleChartsModule, ChartType } from 'angular-google-charts';
import { formatearFechaHora } from '../services/functions';
import { ModalComponent } from "../widgets/modal/modal.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [NavbarComponent, HttpClientModule,
        CommonModule,
        FontAwesomeModule, KazeFormInputComponent, KazeFormInputComponent, FormsModule, ReactiveFormsModule, GoogleChartsModule, NgbAccordionModule, ModalComponent]
})

export class HomeComponent {

  collapsedNav = false
  formatearFechaHora = formatearFechaHora

  faFilter = faFilter

  form_filtrar_fecha_home: FormGroup

  ChartType = ChartType
  nombre = ""
  email = ""

  enviando_nueva_pass = false
  verificando = false
  enviando_email = false

  lista_representados = <any>[]
  lista_representados_nueva = <any>[]

  alertsData: [string, number][] = [
    ['Urgentes', 1],
    ['Importantes', 1],
    ['Primarias', 1]
  ];

  // filteredDataDisplay = [
  //   ['datos',2,'red']
  // ]

  filteredDataDisplay = <any>[]

  filteredDataDisplayUrgentes = <any>[]
  filteredDataDisplayImportantes = <any>[]
  filteredDataDisplayPrimarias = <any>[]

  columnsFilteredChart = [
    { type: 'string' },
    { type: 'number' },
    { role: 'style' }

  ]

  PieCharOptions = {
    colors: ['#dc3912', '#ff9900', '#3366cc'],
    is3D: false
  };

  vistaGeneral = true

  //////Objeto general de resumen de monitoreo

  dataResumenMonitor: any

  totalUrgentes = 0
  totalImportantes = 0
  totalPrimarias = 0

  inicializarDataResumenMonitor() {

    this.dataResumenMonitor = {
      redCard: {
        en_proceso: 0,
        pendientes: 0,
        resueltos: 0,
        no_resueltos: 0,
        derivados: 0,
        otros_estados: 0,
      },
      yellowCard: {
        en_proceso: 0,
        pendientes: 0,
        resueltos: 0,
        no_resueltos: 0,
        derivados: 0,
        otros_estados: 0,
      },
      blueCard: {
        en_proceso: 0,
        pendientes: 0,
        resueltos: 0,
        no_resueltos: 0,
        derivados: 0,
        otros_estados: 0,
      },
    }


    this.totalUrgentes = 0
    this.totalImportantes = 0
    this.totalPrimarias = 0

    this.filteredDataDisplay = <any>[]

    this.filteredDataDisplayUrgentes = <any>[]
    this.filteredDataDisplayImportantes = <any>[]
    this.filteredDataDisplayPrimarias = <any>[]

  }

  data_casos_accordion = <any>[]


  navigate(path: string){
    this.router.navigate([path])  
  }

  constructor(public appSession: SessionService,  private router: Router, private formBuilder: FormBuilder, private snackbarService: SnackbarService, private apiService: ApiServiceService, private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver) {

    this.apiService.token = this.appSession.appToken

    if(this.appSession.id_responsable_servicios > 0) this.navigate('coordinacion_servicios');

    this.nombre = appSession.nombre
    this.email = appSession.email
    this.lista_representados = appSession.accountList

    let yourDate = new Date()
    let f_date = yourDate.toISOString().split('T')[0]

    this.form_filtrar_fecha_home = this.formBuilder.group({
      fechadesde: f_date,
      fechahasta: f_date,
    })

    /////OBTENER MONITOR

    this.obtenerDatosPrincipales()

  }

  obtenerDatosPrincipales() {

    this.vistaGeneral = true

    this.inicializarDataResumenMonitor()
    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      module: 'isg',
      method: 'obtener_resumen_monitor',
      payload: JSON.stringify({

        fechadesde: this.form_filtrar_fecha_home.value.fechadesde,
        fechahasta: this.form_filtrar_fecha_home.value.fechahasta,

      })
    }).subscribe((data: any) => {

      let miniAlertsData: [string, number][] = [
        ['Urgentes', 0],
        ['Importantes', 0],
        ['Primarias', 0]
      ];

      ///iterar
      data.forEach((element: any) => {

        switch (parseInt(element.filtroscsc_id)) {
          case 3:
            //red
            miniAlertsData[0][1] += parseInt(element.total_alerts)
            this.totalUrgentes += parseInt(element.total_alerts)

            this.filteredDataDisplayUrgentes.push([element.nombre_clasificacion, parseInt(element.total_alerts), 'red'])

            switch (parseInt(element.idclasificacion)) {
              case 1:
                // sin asignar
                this.dataResumenMonitor.redCard.pendientes += parseInt(element.total_alerts)
                break;
              case 2:
                //asignados
                this.dataResumenMonitor.redCard.pendientes += parseInt(element.total_alerts)

                break;
              case 3:
                //derivado a usuario
                this.dataResumenMonitor.redCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 4:
                //atendiendo
                this.dataResumenMonitor.redCard.en_proceso += parseInt(element.total_alerts)
                break;
              case 5:
                //pausado telef
                this.dataResumenMonitor.redCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 6:
                //pausado otro
                this.dataResumenMonitor.redCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 7:
                //resuelto
                this.dataResumenMonitor.redCard.resueltos += parseInt(element.total_alerts)
                break;
              case 8:
                //derivado
                this.dataResumenMonitor.redCard.derivados += parseInt(element.total_alerts)
                break;
              case 9:
                //no resuelto
                this.dataResumenMonitor.redCard.no_resueltos += parseInt(element.total_alerts)
                break;
              case 10:
                //cerrado fuera hora
                this.dataResumenMonitor.redCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 11:
                //pocas repes
                this.dataResumenMonitor.redCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 12:
                //sin paquete
                this.dataResumenMonitor.redCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 13:
                //no coincide crit inter
                this.dataResumenMonitor.redCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 14:
                //falla anterior no resuelta
                this.dataResumenMonitor.redCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 15:
                //no coincide crit inter
                this.dataResumenMonitor.redCard.no_resueltos += parseInt(element.total_alerts)
                break;
              default:
                break;
            }

            break;
          case 2:
            //red
            miniAlertsData[1][1] += parseInt(element.total_alerts)

            this.filteredDataDisplayImportantes.push([element.nombre_clasificacion, parseInt(element.total_alerts), '#c89607'])


            this.totalImportantes += parseInt(element.total_alerts)
            switch (parseInt(element.idclasificacion)) {
              case 1:
                // sin asignar
                this.dataResumenMonitor.yellowCard.pendientes += parseInt(element.total_alerts)
                break;
              case 2:
                //asignados
                this.dataResumenMonitor.yellowCard.pendientes += parseInt(element.total_alerts)
                break;
              case 3:
                //derivado a usuario
                this.dataResumenMonitor.yellowCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 4:
                //atendiendo
                this.dataResumenMonitor.yellowCard.en_proceso += parseInt(element.total_alerts)
                break;
              case 5:
                //pausado telef
                this.dataResumenMonitor.yellowCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 6:
                //pausado otro
                this.dataResumenMonitor.yellowCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 7:
                //resuelto
                this.dataResumenMonitor.yellowCard.resueltos += parseInt(element.total_alerts)
                break;
              case 8:
                //derivado
                this.dataResumenMonitor.yellowCard.derivados += parseInt(element.total_alerts)
                break;
              case 9:
                //no resuelto
                this.dataResumenMonitor.yellowCard.no_resueltos += parseInt(element.total_alerts)
                break;
              case 10:
                //cerrado fuera hora
                this.dataResumenMonitor.yellowCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 11:
                //pocas repes
                this.dataResumenMonitor.yellowCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 12:
                //sin paquete
                this.dataResumenMonitor.yellowCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 13:
                //no coincide crit inter
                this.dataResumenMonitor.yellowCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 14:
                //falla anterior no resuelta
                this.dataResumenMonitor.yellowCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 15:
                //no coincide crit inter
                this.dataResumenMonitor.yellowCard.no_resueltos += parseInt(element.total_alerts)
                break;
              default:
                break;
            }
            break;
          case 1:
            //blue
            miniAlertsData[2][1] += parseInt(element.total_alerts)
            this.filteredDataDisplayPrimarias.push([element.nombre_clasificacion, parseInt(element.total_alerts), '#0d6efd'])

            this.totalPrimarias += parseInt(element.total_alerts)

            switch (parseInt(element.idclasificacion)) {
              case 1:
                // sin asignar
                this.dataResumenMonitor.blueCard.pendientes += parseInt(element.total_alerts)
                break;
              case 2:
                //asignados
                this.dataResumenMonitor.blueCard.pendientes += parseInt(element.total_alerts)
                break;
              case 3:
                //derivado a usuario
                this.dataResumenMonitor.blueCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 4:
                //atendiendo
                this.dataResumenMonitor.blueCard.en_proceso += parseInt(element.total_alerts)
                break;
              case 5:
                //pausado telef
                this.dataResumenMonitor.blueCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 6:
                //pausado otro
                this.dataResumenMonitor.blueCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 7:
                //resuelto
                this.dataResumenMonitor.blueCard.resueltos += parseInt(element.total_alerts)
                break;
              case 8:
                //derivado
                this.dataResumenMonitor.blueCard.derivados += parseInt(element.total_alerts)
                break;
              case 9:
                //no resuelto
                this.dataResumenMonitor.blueCard.no_resueltos += parseInt(element.total_alerts)
                break;
              case 10:
                //cerrado fuera hora
                this.dataResumenMonitor.blueCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 11:
                //pocas repes
                this.dataResumenMonitor.blueCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 12:
                //sin paquete
                this.dataResumenMonitor.blueCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 13:
                //no coincide crit inter
                this.dataResumenMonitor.blueCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 14:
                //falla anterior no resuelta
                this.dataResumenMonitor.blueCard.otros_estados += parseInt(element.total_alerts)
                break;
              case 15:
                //no coincide crit inter
                this.dataResumenMonitor.blueCard.no_resueltos += parseInt(element.total_alerts)
                break;
              default:
                break;
            }

            break;

          default:
            break;
        }

      });

      // console.log("eu")
      this.alertsData = miniAlertsData


    })
  }

  updateCollapse($value: boolean) {
    this.collapsedNav = $value

  }

  prevIndex = -1

  setGraph(index: number) {

    // if(index == this.prevIndex){
    //   this.prevIndex = -1
    
    this.vistaGeneral = false

    // }
    // else{
    //   this.vistaGeneral = false
    // }

    if (this.prevIndex == index) {
      this.prevIndex = -1;
      this.vistaGeneral = true
      return
    }

    this.prevIndex = index

    this.listarCasosFiltro(index)

    switch (index) {
      case 3:
        this.filteredDataDisplay = this.filteredDataDisplayUrgentes
        break;
      case 2:
        this.filteredDataDisplay = this.filteredDataDisplayImportantes
        break;
      case 1:
        this.filteredDataDisplay = this.filteredDataDisplayPrimarias
        break;
      default:
        break;
    }

  }

  listarCasosFiltro(filtro_csc: number){

    this.data_casos_accordion

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'isg',
      method: 'listar_casos',
      payload: JSON.stringify({
        idusuario_csc: 0,
        fechadesde: this.form_filtrar_fecha_home.value.fechadesde,
        fechahasta: this.form_filtrar_fecha_home.value.fechahasta,
        prioridad: filtro_csc
      })
    }).subscribe((data: any)=>{

      let ultima_clasificacion = ''

      let index_data = -1
      this.data_casos_accordion = <any>[]

      data.forEach((element: any) => {
        
        if(ultima_clasificacion == '' || ultima_clasificacion != element.nombreclasificacion){
          ultima_clasificacion = element.nombreclasificacion
          index_data++

          this.data_casos_accordion.push({
            nombreclasificacion: ultima_clasificacion,
            filtro_csc: filtro_csc,
            lista_casos: []
          })

        }

        this.data_casos_accordion[index_data].lista_casos.push(element)

      });

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

  aplicarFiltroFechas() {



  }

  dataAlertaSeleccionada: any
  mostrarModalDetalleAlerta = false;

//////////////////////////////////
  //DATOS MAQUINARIAS

  dataMaquinarias = <any>[]

  private centroid: L.LatLngExpression = [42.3601, -71.0589]; //
  private map?: L.Map 

  private locationPin?: L.Marker

  private initMap(): void {
    // this.map = undefined

    this.centroid = [this.dataAlertaSeleccionada.latitude, this.dataAlertaSeleccionada.longitude]; //

    try {

      this.map = L.map('map', {
        center: this.centroid,
        zoom: 12
      });
        
    } catch (error) {

    }

    if(this.dataAlertaSeleccionada.latitude == undefined || this.dataAlertaSeleccionada.longitude==undefined || this.map == undefined) return

    this.map!.panTo(new L.LatLng(this.dataAlertaSeleccionada.latitude, this.dataAlertaSeleccionada.longitude));

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 4,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    // create 5 random jitteries and add them to map

    let pinIcon = L.icon({
      iconSize: [40,40],
      iconUrl: "./assets/location-pin.png"
    })

    if(this.locationPin != undefined)
      this.map?.removeLayer(this.locationPin!)

    this.locationPin = L.marker(this.centroid,{icon: pinIcon})

    this.locationPin.addTo(this.map!)

    tiles.addTo(this.map!);
  
  }

  ////////////////////////REPRESENTACIONES

  abrirAlertaFiltrada(index: number,index_maquina: number){
    this.dataAlertaSeleccionada = this.data_casos_accordion[index_maquina].lista_casos[index]
    this.mostrarModalDetalleAlerta = true;
    setTimeout(() => {
      this.initMap()
    }, 500);
  }

  indexMaquinaSeleccionada = 0

  modalDetalleAlertaChange(e: boolean){
    this.mostrarModalDetalleAlerta = e
  }

  descargarInstructivo(){

    this.snackbarService.mostrarMensaje("Descargando instructivo...", 4000)
    this.mostrarModalDetalleAlerta = false;

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      method: 'descargar_documento',
      module: 'isg',
      payload: JSON.stringify({
        file_name: this.dataAlertaSeleccionada["link_instructivo"],
        generar_aleatorio: 1

      })
    }).subscribe((data: any)=>{

      // console.log(data.file_path)
      window.location.href = data.file_path
    })

  }

}
