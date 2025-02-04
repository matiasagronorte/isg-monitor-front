import { Component, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../widgets/navbar/navbar.component';
import { ApiServiceService } from '../services/api-service.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { EmailAlertItem } from '../interfaces/email_alert_item';
import { interval, Subscription } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faInfoCircle, faBell, faTractor, faClose, faEdit, faFilter, faRefresh ,faCheck} from '@fortawesome/free-solid-svg-icons';
import { ModalComponent } from "../widgets/modal/modal.component";
import { SnackbarService } from '../services/snackbar.service';
import { AppSettings } from '../appsettings';
import { SessionService } from '../schema/session';
import { formatDate } from '../lib/functions';
import { KazeFormSelectComponent } from "../widgets/kaze-form-select/kaze-form-select.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KazeFormInputComponent } from "../widgets/kaze-form-input/kaze-form-input.component";
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { Router } from '@angular/router';

@Component({
    selector: 'app-monitor',
    standalone: true,
    templateUrl: './monitor.component.html',
    styleUrl: './monitor.component.css',
    imports: [
        NavbarComponent,
        HttpClientModule,
        CommonModule,
        FontAwesomeModule,
        ModalComponent,
        KazeFormSelectComponent,
        FormsModule,
        ReactiveFormsModule,
        KazeFormInputComponent,
        AutocompleteLibModule
    ]
})
export class MonitorComponent implements OnDestroy {
  faInfoCircle = faInfoCircle;
  faBell = faBell
  faTractor = faTractor
  faClose = faClose
  faEdit = faEdit
  faFilter = faFilter
  faRefresh = faRefresh
  faCheck = faCheck

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef;

  data: Array<any> = []
  prevData: Array<any> = []

  // private subscription: Subscription;
  intervalId: any;

  mostrarModalDetalleAlerta = false;

  filtroPaquetesOperador = false
  filtroPaquetes = false

  collapsedNav = false
  
  formFiltroAlertas: FormGroup
  formDescartarAlertas: FormGroup
  
  /////loaders

  cargandoPaquetesVendidos = false
  indexCargandoAlertaPrimaria = -1
  indexCargandoAlertaSecundaria = -1
  codigoErrorAlertaCierre = ''
  organizacionAlertaCierre = ''
  fechahoraAlertaCierre = ''

  auth = 0;

  mensajeErrorAlerta = ""
  
  optionsUnidadesNegocio = [
    {
      value: 'AG-CF',
      text: 'AGRICOLA Y CONSTRUCCION'
    },
    {
      value: 'AG',
      text: 'AGRICOLA'
    },
    {
      value: 'CF',
      text: 'CONSTRUCCION'
    }
  ]

  ////////////////////////////
  //AUTOCOMPLETADO
  ////////////////////////////

  keywordOrganizaciones = "nombre"
  

  dataOrganizaciones = <any>[]

  navigate(path: string){
    this.router.navigate([path])  
  }


  constructor(public appSession: SessionService, private router: Router, private apiService: ApiServiceService, private cdr: ChangeDetectorRef, private snackbarService: SnackbarService, private formBuilder: FormBuilder) {

    this.apiService.token = this.appSession.appToken

    if(this.appSession.id_responsable_servicios > 0) this.navigate('coordinacion_servicios');


    this.formFiltroAlertas = this.formBuilder.group({
      hours: this.hours,
      lineanegocio: this.optionsUnidadesNegocio[0].value
    })
    this.formDescartarAlertas = this.formBuilder.group({
      detalle: ''
    })

    // this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
    //   module: 'isg',
    //   method: 'auth_guard',
    //   payload: JSON.stringify({

    //     id: this.appSession.email,
    //     set: 0

    //   })
    // }).subscribe((data: any)=>{

    //   if(data.resultado == "success"){
    //     window.location.reload()
    //   }
    //   else{

    //     this.auth = 1
    //     this.cargandoPaquetesVendidos = true

    //     this.intervalId = setInterval(() => {
    //       this.obtenerDatos();
    //       // this.reproducirSonido()
    //     }, 30000);
    
    this.obtenerDatos();
    
    
    //   }
    // })


  }

  
  ngOnDestroy(){
    clearInterval(this.intervalId)
  }


  formatDate(dates: string): string {
    // Crear un objeto Date a partir de la cadena ISO
    let fecha = new Date(dates);

    // Extraer los componentes de la fecha y hora
    let dia: number = fecha.getDate();
    let mes: number = fecha.getMonth() + 1; // Los meses en JavaScript son indexados desde 0
    let anio: number = fecha.getFullYear();
    let horas: number = fecha.getHours();
    let minutos: number = fecha.getMinutes();

    // Agregar un cero al principio si el día o el mes son menores que 10
    let diaStr: string = dia < 10 ? '0' + dia : dia.toString();
    let mesStr: string = mes < 10 ? '0' + mes : mes.toString();
    let minutosStr: string = minutos < 10 ? '0' + minutos : minutos.toString();

    // Formatear la cadena de fecha y hora
    let fechaFormateada: string = `${diaStr}/${mesStr}/${anio} ${horas}:${minutosStr}`;

    return fechaFormateada;
  }

  reproducirSonido(): void {
    const audioPlayer: HTMLAudioElement = this.audioPlayerRef.nativeElement;
    audioPlayer.play();
  }



  compararArreglosDeObjetos(arreglo1: any[], arreglo2: any[]): boolean {
    // Verifica si los arreglos tienen la misma longitud
    if (arreglo1.length !== arreglo2.length) {
      return false;
    }

    // Verifica si cada elemento de arreglo1 está presente en arreglo2
    return arreglo1.every(item1 => arreglo2.some(item2 => this.sonIguales(item1, item2)));
  }

  sonIguales(obj1: any, obj2: any): boolean {
    // Aquí debes implementar la lógica para comparar dos objetos
    // Por ejemplo, podrías comparar si las propiedades de los objetos son iguales
    // o si el contenido de los objetos es igual

    // Este es solo un ejemplo simple. Debes ajustarlo según tus necesidades
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  forceupdate = false

  redFilter = true
  yellowFilter = true
  blueFilter = true

  hours = 2
  oportunidades_venta = 0;

  obtenerDatos() {

    if(!this.redFilter && !this.yellowFilter && !this.blueFilter) {
      this.data = []
      return
    }

    this.apiService.APIPost(AppSettings.API_ISG_AGRONORTE+'/api/email_alerts_dtc.php', {
      red: this.redFilter ? "1" : "0",
      yellow: this.yellowFilter ? "1" : "0",
      blue: this.blueFilter ? "1" : "0",
      hours: this.hours,
      filtroPaquetesOperador: this.filtroPaquetesOperador ? '1' : '0',
      filtroPaquetes: this.filtroPaquetes ? '1' : '0',
      idusuario_csc: this.appSession.userId,
      oportunidades_venta: this.oportunidades_venta,
      lineanegocio: this.formFiltroAlertas.value.lineanegocio

    }).subscribe((data: any) => {

      // console.log(data)

      //   {
      //     "color": "YELLOW",
      //     "tipo": "CHC",
      //     "codigo": "521195.12",
      //     "descripcionCompleta": "YELLOW CHC 521195.12 Foreign Object Detection Fault - Self test of upper stone detector failed. No protection against stones. Please contact your John Deere dealer.",
      //     "infoExtra": "Marca -  - JOHN DEERE Tipo -  - Hay &amp; Forage Modelo -  - 8400 PIN -  - 1Z08400YJHF517015 Repeticiones -  Duracion -  ",
      //     "organization": "Ensilados Margaria",
      //     "date": "26 feb 2024 2:22 p.m."
      // }

      if (this.forceupdate) {
        this.forceupdate = false
        this.prevData = data

        // this.reproducirSonido()

        this.data = data

      }

      if (!this.compararArreglosDeObjetos(this.prevData, data)) {
        try {
          // this.reproducirSonido()
        }
        catch (e) {

        }
      }

      this.prevData = data

      this.data = data
      this.cdr.detectChanges();
      this.cargandoPaquetesVendidos = false

    });
  }

  obtenerTextoDesdeTercerEspacio(texto: string): string {
    return '';
    const partes = texto.split(' ');

    if (partes.length >= 4) {
      return partes.slice(3).join(' ');
    } else {
      return '';
    }
  }

  itemAlertaDetalle: any = {}

  obtenerAlerta(item: EmailAlertItem) {

    if(this.indexCargandoAlertaSecundaria!=-1 || this.indexCargandoAlertaSecundaria!=-1) return

    this.snackbarService.mostrarMensaje("Recuperando datos de alerta...", 2000);

    this.apiService.APIGet(AppSettings.API_ISG_AGRONORTE+'/api/notificaciones_maquina.php?pin_maquina=' + item.pin + "&codigoerror=" + this.formatCodigoError(item.descripcionCompleta) ).subscribe((data_alert: any) => {

      let data = data_alert

      // console.log(item);
      this.indexCargandoAlertaPrimaria = -1
      this.indexCargandoAlertaSecundaria = -1

      if (data_alert.length != undefined) {

        let processed = item.codigo

        let filteredfull = item["codigo_format"]
        let filtered = filteredfull.split(" ")[1]

        data_alert.forEach((element: any) => {

          if (item["codigo_format"] == filteredfull && item.infoExtra.includes(element.machinePin)) {
            data = element
          }

        });

      }

      if(data.length == 0){
        this.snackbarService.mostrarMensaje("No se encontraron mensajes de esta organización en API",3000)
        return
      }

      this.mensajeErrorAlerta = ""

      if(data.eceLocalizedText == undefined){
        // this.snackbarService.mostrarMensaje("No es posible procesar el mensaje",2000)
        
        //return
      }

      let marca = ""
      let modelo = ""
      let tipoMaquina = ""
      let horasMotor = ""

      if(data.eceLocalizedText != undefined){
        data.eceLocalizedText = data.eceLocalizedText.replace("  ", "")
      }
      else{
        
        marca = data.length > 0 ? data[0].machineMake : ""
        modelo = data.length > 0 ? data[0].machineModel : ""
        tipoMaquina = data.length > 0 ? data[0].machineType : ""
        horasMotor = data.length > 0 ? data[0].engineHours : ""

        this.mensajeErrorAlerta = "No obtenido por Alerts API";
      }

      const palabras = data.eceLocalizedText != undefined ? data.eceLocalizedText.split(" ") : [];



      // Unir las primeras tres palabras con un espacio
      const primeraParte = palabras.length > 0 ? palabras.slice(0, 3).join(" ") : "";

      // Unir el resto de la cadena a partir del cuarto espacio
      const segundaParte = palabras.length > 0 ?  palabras.slice(3).join(" ") : "";

      // Devolver un objeto con las dos partes
      // return {
      // primeraParte: primeraParte,
      // segundaParte: segundaParte
      // };

      this.itemAlertaDetalle["id"] = item.id
      this.itemAlertaDetalle["idalerta"] = item.idalerta
      this.itemAlertaDetalle["codigo"] = item.codigo
      this.itemAlertaDetalle["tipoalerta"] = item.tipo

      this.itemAlertaDetalle["codigoerror"] = primeraParte

      this.itemAlertaDetalle["color"] = item.color
      this.itemAlertaDetalle["titulo"] = item.descripcionCompleta
      this.itemAlertaDetalle["fechahora"] = item.date

      this.itemAlertaDetalle["marca"] = marca != "" ? marca : data.machineMake
      this.itemAlertaDetalle["tipo"] = tipoMaquina != "" ? tipoMaquina : data.machineType
      this.itemAlertaDetalle["modelo"] = modelo != "" ? modelo : data.machineModel
      this.itemAlertaDetalle["pin"] = item.pin
      this.itemAlertaDetalle["repeticiones"] = data.occurrenceCount
      this.itemAlertaDetalle["duracion"] = data.durationSeconds != undefined ? data.durationSeconds + "s" : ""
      this.itemAlertaDetalle["horasmotor"] = horasMotor != "" ? "Aprox: "+ horasMotor : data.engineHours
      this.itemAlertaDetalle["cliente"] = item.organization
      this.itemAlertaDetalle["filtrarcsc"] = item.filtrarcsc

      this.abrirModalDetalleAlerta(data)

    })

  }

  modalChange(value: boolean) {
    this.mostrarModalDetalleAlerta = value
  }

  modalDescartarAlertaChange(value: boolean) {
    this.mostrarModalDescartarAlerta = value
    if(!value){
      this.formDescartarAlertas.get('detalle')?.setValue('')
    }
  }


  abrirModalDetalleAlerta(item: any) {
    // console.log(item)
    this.mostrarModalDetalleAlerta = true

  }
  updateCollapse($value: boolean) {
    this.collapsedNav = $value
  }

  marcarAlerta(id: number, filtrar: number, item: any) {

    let filtrar_param = filtrar > 0 ? 0 : 1

    let str_end_query = ""

    if (id == 0) {

      str_end_query = '&descripcion=' + encodeURIComponent(item["titulo"]) + '&codigo=' + item["codigo"] + '&tipo=' + item["tipoalerta"] + '&color=' + item["color"]

    }

    // descripcion
    // codigo
    // tipo
    // color

    this.mostrarModalDetalleAlerta = false
    this.snackbarService.mostrarMensaje(filtrar_param > 0 ? "Agregando a lista primaria" : "Quitando de lista primaria", 2000)

    this.apiService.APIGet(AppSettings.API_ISG_AGRONORTE+"/api/marcar_alerta.php?id=" + id + "&filtrarcsc=" + filtrar_param + str_end_query).subscribe((data: any) => {

      setTimeout(() => {
        this.snackbarService.mostrarMensaje(filtrar_param > 0 ? "Agregado" : "Removido", 1000)

      }, 2000);
      if (data.resultado == "success") {
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });

        this.forceupdate = true
        this.obtenerDatos()

      }

    })

  }

  toggleColorFilter(color: string) {
    switch (color) {
      case 'red':
        this.redFilter = !this.redFilter;
        break;

      case 'yellow':
        this.yellowFilter = !this.yellowFilter;
        break;

      case 'blue':
        this.blueFilter = !this.blueFilter;
        break;

      default:
        break;
    }
    this.forceupdate = true;
    this.prevData = []
    this.obtenerDatos()
  }

  mostrarModalDescartarAlerta = false;
  id_alertaseleccionada = "";

  descartarAlerta() {

    this.mostrarModalDescartarAlerta = false;

    if(this.formDescartarAlertas.value.detalle == ""){
      this.snackbarService.mostrarMensaje("Debes ingresar un detalle de cierre", 2000)
      return
    }

    // this.snackbarService.mostrarMensaje("Descartando alerta...", 2000)

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      module: "isg",
      method: "descartar_alerta",
      payload: JSON.stringify({
        idalerta: this.id_alertaseleccionada,
        detalle: this.formDescartarAlertas.value.detalle,
        idusuario_csc: this.appSession.userId
      })
    }).subscribe((data: any) => {

      if (data.resultado == "success") {

        this.snackbarService.mostrarMensaje("Alerta cerrada", 1500)
        this.forceupdate = true
        this.formDescartarAlertas.get('detalle')?.setValue('')
        
        this.obtenerDatos()
      
      }

    })

  }

  cargandoNotificacionesOrganizacion = false
  showingNotificacionesOrganizacion = false

  nombreOrganizacionSeleccionada = ""

  lista_notificaciones_organizacion = <any>[]

  obtenerNotificacionesOrganizacion(nombre_organizacion: string) {

    this.cargandoNotificacionesOrganizacion = true

    this.nombreOrganizacionSeleccionada = nombre_organizacion

    let url = AppSettings.API_ISG_AGRONORTE+"/api/notificaciones_organizacion.php?idorganizacion=1&nombre_organizacion=" + nombre_organizacion;

    this.lista_notificaciones_organizacion = []

    this.apiService.APIGet(url).subscribe((data: any) => {

      this.cargandoNotificacionesOrganizacion = false
      this.showingNotificacionesOrganizacion = true;

      this.lista_notificaciones_organizacion = data



    })

  }

  configurarAlerta(item: any, cliente: string) {

    this.itemAlertaDetalle["codigoerror"] = this.formatCodigoError(item["eceLocalizedText"]);
    this.itemAlertaDetalle["fechahora"] = this.formatDate(item["alertCreatedTimestamp"])
    this.itemAlertaDetalle["titulo"] = item["title"]
    this.itemAlertaDetalle["marca"] = item["machineMake"]
    this.itemAlertaDetalle["tipo"] = item["machineType"]
    this.itemAlertaDetalle["modelo"] = item["machineModel"]
    this.itemAlertaDetalle["pin"] = item["machinePin"]
    this.itemAlertaDetalle["repeticiones"] = item["occurrenceCount"]
    this.itemAlertaDetalle["duracion"] = item["durationSeconds"]
    this.itemAlertaDetalle["horasmotor"] = item["engineHours"]
    this.itemAlertaDetalle["cliente"] = cliente

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'comprobar_alerta',
      module: 'isg',
      payload: JSON.stringify({
        codigoerror: this.itemAlertaDetalle["codigoerror"],
        tipo: item["threeLetterAcronym"],
        color: item["eceLocalizedText"].split(" ")[0],
        descripcion: item["title"]
      })
    }).subscribe((data: any) => {

      //console.log(data)

      this.itemAlertaDetalle["idalerta"] = data.idalerta
      this.itemAlertaDetalle["filtrarcsc"] = data.filtrarcsc

      this.mostrarModalDetalleAlerta = true

    })

    // <li><b>Marca:</b>  {{ itemAlertaDetalle["marca"] }} </li>
    // <li><b>Tipo: </b> {{ itemAlertaDetalle["tipo"] }} </li>
    // <li><b>Modelo:</b>  {{ itemAlertaDetalle["modelo"] }} </li>
    // <li><b>PIN: </b> {{ itemAlertaDetalle["pin"] }} </li>
    // <li><b>Repeticiones: </b> {{ itemAlertaDetalle["repeticiones"] }} </li>
    // <li><b>Duración: </b> {{ itemAlertaDetalle["duracion"] }} </li>
    // <li><b>Horas del motor: </b> {{ itemAlertaDetalle["horasmotor"] }} </li>
  }

  filtrarOrganizacionCSC = false

  formatCodigoError(desc: string) {


    let processed = desc.replace(/\s/g, ' ')
    processed = processed.replace("    ", " ")
    processed = processed.replace("   ", " ")
    processed = processed.replace("  ", " ")

    let comps = processed.split(" ");

    return (comps[1] + " " + comps[2]).trim()
    // "OTRO   CAB 523961.02    Freno de estacionamiento  -  Freno de estacionamiento activado"
    // "OTRO   CAB 523961.02    Freno de estacionamiento  -  Freno de estacionamiento activado"
  }

  onSubmitFormFiltroAlertas(event: Event){
    
    //event.preventDefault()

    // this.cargandoPaquetesVendidos = true
    let value = (event.target as HTMLInputElement).value
    if(value == '') return
    // this.hours = value == '' ? 2 : parseInt(value) 

    this.cargandoPaquetesVendidos = true

    this.hours = this.formFiltroAlertas.value.hours
    // this.formFiltroAlertas.get('hours')?.setValue(value.toString())

    this.obtenerDatos()

    this.snackbarService.mostrarMensaje("Filtro aplicado",500)

  }


  optionsHours = [
    {
      value: 2,
      text: '2'
    },
    {
      value: 4,
      text: '4'
    },
    {
      value: 8,
      text: '8'
    },
    {
      value: 12,
      text: '12'
    },
    {
      value: 16,
      text: '16'
    },
    {
      value: 24,
      text: '24'
    },
  ]

  selectOrganizacionEvent(event: any){
    // console.log(event)

    this.obtenerNotificacionesOrganizacion(event.nombre)

  }

  timeoutId: any
  timeoutOrgId: any

  onOrganizacionChangeSearch(val: string) {

    try {
      clearTimeout(this.timeoutId)

      this.timeoutId = setTimeout(() => {

        this.getOrganizaciones(val)

      }, 200);

    } catch (error) {

    }

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

      this.dataOrganizaciones = conv["lista"]

    });
  }

  onOrganizacionFocused(){

  }

}
