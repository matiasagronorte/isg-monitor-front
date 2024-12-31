import { Component, Renderer2, OnDestroy, HostListener } from '@angular/core';
import { NavbarComponent } from '../widgets/navbar/navbar.component';
import { ApiServiceService } from '../services/api-service.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBroom, faFilter, faPrint, faClose, faPhone, faUser, faClock, faWrench, faPlus, faBellSlash } from '@fortawesome/free-solid-svg-icons';
import { AppSettings } from '../appsettings';
import { SessionService } from '../schema/session';
import { KazeFormInputComponent } from "../widgets/kaze-form-input/kaze-form-input.component";
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { formatDate } from '../lib/functions';
import { SnackbarService } from '../services/snackbar.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ModalComponent } from '../widgets/modal/modal.component';
import { Router } from '@angular/router';
import { obtenerFechaMasXDias, formatearFechaHoraEstandar, formatearFechaHora } from '../services/functions';
import { AccionSeguimiento } from '../interfaces/acciones_seguimiento';

@Component({
  selector: 'app-atencion',
  standalone: true,
  templateUrl: './atencion.component.html',
  styleUrl: './atencion.component.css',
  imports: [NavbarComponent, HttpClientModule,
    CommonModule,
    FontAwesomeModule, KazeFormInputComponent, KazeFormInputComponent, FormsModule, ReactiveFormsModule, ModalComponent, AutocompleteLibModule,DragDropModule]
})

export class AtencionComponent implements OnDestroy {

  collapsedNav = false

  atendiendoParaCierreSesion = false

  faClose = faClose
  faPhone = faPhone
  faUser = faUser
  faClock = faClock
  faWrench = faWrench
  faPlus = faPlus
  faBellSlash = faBellSlash

  atendiendo = false
  tiempo_extendido = 0

  tickets = <any>[]

  formExtender: FormGroup
  form_crear_caso: FormGroup

  formPosponer: FormGroup

  parseInt = parseInt
  formatearFechaHoraEstandar = formatearFechaHoraEstandar
  formatearFechaHora = formatearFechaHora

  formCierreAlerta: FormGroup
  formDerivarAlerta: FormGroup
  formDerivarAlertaServicios: FormGroup
  formSilenciar: FormGroup

  optionsClasificaciones = <any>[];
  options_categorias = <any>[]


  interval_atendiendo: any
  interval_get_atendiendo: any
  notificator: any
  mostrarModalDerivarAlerta = false
  mostrarModalCrearCaso = false
  mostrarModalDerivarServicios = false

  keywordOrganizaciones = 'name'
  dataOrg = []
  
  keyword = 'name';
  dataMaq = [

  ];

  objeto_formulario_caso_limpio = {
    idcategoria_alerta: '',
    idorganizacion: '',
    nombreorganizacion: '',
    idmaquina:'',
    nombremaquinaria:'',
    pin:'',
    tiempoestimadoresolucion: '',
    descripcionCompleta: '',
    codigo_format: ''
  }

  fileReader = new FileReader();

  file_array = <any>[]
  file_index = 0;
  files_count = 1;

  constructor(public appSession: SessionService, private formBuilder: FormBuilder, private snackbarService: SnackbarService, private apiService: ApiServiceService, private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver,private router: Router) {

    this.apiService.token = this.appSession.appToken

    if(this.appSession.id_responsable_servicios > 0) this.navigate('coordinacion_servicios');

    this.interval_get_atendiendo = setInterval(()=>{
      this.getAtencion()
    },10000)
    this.getAtencion()

    this.formExtender = this.formBuilder.group({
      tiempo_extension: ''
    })

    this.formSilenciar = this.formBuilder.group({
      id_alerta: '',
      motivo: '',
      fecha_limite: ''
    })

    this.formPosponer = this.formBuilder.group({
      tiempo: ''
    })

    this.formDerivarAlerta = this.formBuilder.group({
      idalerta: '',
      idusuario_csc_destino: '',

    })

    this.formCierreAlerta = this.formBuilder.group({

      idclasificacion: '',
      detalle: '',
      idalerta: 0,
      archivo: '',
      comentario_archivo: '',
      link: '',
      link_manual_diagnostico: '',
      link_manual_reparacion: '',
      link_manual_operador: '',
      idmaquina: ''

    })

    this.formAgregarAccion = this.formBuilder.group({

      comentario: '',
      nombre_accion_nueva: ''

    })

    this.form_crear_caso = this.formBuilder.group(this.objeto_formulario_caso_limpio)

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {

      module: 'isg',
      method: 'clasificaciones_alertas',
      payload: JSON.stringify({
      })

    }).subscribe((data: any) => {

      this.optionsClasificaciones = data

    })

    this.formDerivarAlertaServicios = this.formBuilder.group({
      numero_corsvap: '',
      fechavencimiento: '',
      fechaestimadafinalizacion: '',
      mensajeoperador: '',
      datoscontacto: ''
    })

    /////notificarse

    this.notificator = setInterval(()=>{

      this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
        method: 'get_notification',
        module: 'isg',
        payload: JSON.stringify({
          idusuario_csc: this.appSession.userId
        })
      }).subscribe((data: any)=>{

        if(data.notify == 0){

          this.notified = false

          this.obtenerTickets()
          this.obtenerTicketActual()

          this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

            module: 'isg',
            method: 'update_notify',
            payload: JSON.stringify({
              notify: 1,
              idusuario_csc: this.appSession.userId
            })

          }).subscribe((data_n: any)=>{
            console.log(data_n)
          })

        }

      })

    },2500)

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

    this.listaAccionesCaso = []

    //////////////////////////////////////////////////
    ///FINAL DE SETEO
    this.notified = false
    this.obtenerTicketActual()

  }

  optionsUsuariosAtendiendo = <any>[]

  window = window

  ngOnDestroy() {
    clearInterval(this.interval_atendiendo)
    clearInterval(this.timeoutTimerSeconds)
    clearInterval(this.notificator)
  }

  drop(event: CdkDragDrop<AccionSeguimiento[]>) {
    moveItemInArray(this.listaAccionesCaso, event.previousIndex, event.currentIndex);

    this.reorganizarListaAcciones(true)

  }

  getAtencion(){

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      module: 'isg',
      method: 'usuario_atencion',
      payload: JSON.stringify({
        idusuario_csc: this.appSession.userId,
        atendiendo: 0,
        accion: 'get'
      })
    }).subscribe((data: any) => {

      this.atendiendo = data.atendiendo == '1'

      if (this.atendiendo) {

        clearInterval(this.interval_atendiendo)
        this.interval_atendiendo = setInterval(() => {

          this.obtenerTickets()
        }, 30000)

        this.obtenerTickets()
      }
      else {
        clearInterval(this.interval_atendiendo)
        this.item_actual = undefined
      }

    })

  }

  reorganizarListaAcciones(refrescar: boolean = false, insertar: number = 0){

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/", {

      method: 'reorganizar_lista_acciones',
      module: 'isg',
      payload: JSON.stringify({
        lista: JSON.stringify(this.listaAccionesCaso),
        insertar: insertar
      })

    }).subscribe((data: any)=>{
      // console.log(data)

      if(refrescar){
        this.notified = false
        this.obtenerTicketActual()
        // this.obtenerlist
      }

    })
  }

  obtenerUsuariosAtendiendo() {
    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      module: 'isg',
      method: 'usuarios_atendiendo',
      payload: JSON.stringify({

      })
    }).subscribe((data: any) => {

      this.mostrarModalDerivarAlerta = true;
      this.optionsUsuariosAtendiendo = data

    })
  }

  updateCollapse($value: boolean) {
    this.collapsedNav = $value

  }

  mensajeErrorDerivar = ""

  onSubmitFormDerivarAlerta(event: Event) {

    event.preventDefault()

    if (this.formDerivarAlerta.value.idusuario_csc_destino == "") {
      this.mensajeErrorDerivar = "Debe seleccionar un usuario"
      return
    }

    this.mostrarModalDerivarAlerta = false

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {

      module: 'isg',
      method: 'derivar_alerta',
      payload: JSON.stringify({
        idusuario_csc: this.appSession.userId,
        idusuario_csc_destino: this.formDerivarAlerta.value.idusuario_csc_destino,
        idalerta: this.formDerivarAlerta.value.idalerta,
      })
    }).subscribe((data: any) => {

      if (data.resultado == "success") {
        this.snackbarService.mostrarMensaje("Has derivado el caso correctamente", 2000)
        this.timeStampTicketActual = ""
        
        ///no estoy atendiendo
        this.item_actual = undefined
        this.atendiendoParaCierreSesion = false

        this.obtenerTickets()
        clearInterval(this.timeoutTimerSeconds)

      }
      else {
        this.snackbarService.mostrarMensaje("No se pudo derivar el caso. Intente nuevamente más tarde", 2000)
      }

    })

  }

  setAtendiendo(atendiendo: boolean) {

    if (!atendiendo && this.timeStampTicketActual != '') {
      this.snackbarService.mostrarMensaje("Debe finalizar la revisión del ticket actual antes de finalizar la sesión", 4000)
      return
    }

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      module: 'isg',
      method: 'usuario_atencion',
      payload: JSON.stringify({

        idusuario_csc: this.appSession.userId,
        atendiendo: atendiendo ? '1' : '0',
        accion: 'set'
      })
    }).subscribe((data: any) => {

      if (data.resultado == 'error') {
        this.snackbarService.mostrarMensaje("No autorizado, reloguear", 1000)
        return
      }
      this.atendiendo = atendiendo
      if (atendiendo) {

        // this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
        //   method: 'asignar_alertas',
        //   module: 'isg',
        //   payload: JSON.stringify({})
        // }).subscribe((data: any)=>{
          this.interval_atendiendo = setInterval(() => {
            this.obtenerTickets()
            
          }, 30000)
  
          this.obtenerTickets()
        // })

      }
      else {
        clearInterval(this.interval_atendiendo)
        this.tickets = []
      }

    })

  }

  formatedTimestamp = () => {
    const d = new Date()
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0].replace(/:/g, ':');
    return `${date} ${time}`
  }

  temporizadorActual = "--h:--m:--s"
  item_actual: any

  infourgentes = ""
  infoimportantes = ""
  infoprimarios = ""

  timeStampTicketPausado = ""

  ya_solicito_extension = false

  ////////debo obtener el ticket individual por mi cuenta

  notified = false

  obtenerTicketActual(){

    if(this.notified) return 

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

      module: 'isg',
      method: 'ticket_actual',
      payload: JSON.stringify({
        idusuario_csc: this.appSession.userId
      })

    }).subscribe((data:any) => {

      this.notified = true

      let index_item = -1

      if (data.length > 0 && data[0].fechahorarevision != null) {
        index_item = 0
      }

      if(data.length > 1){
        index_item = 1
      }

      if(index_item >= 0){
        this.timeStampTicketActual = data[index_item].fechahorarevision
        
        ///estoy atendiendo un caso
        this.item_actual = data[index_item]
        this.atendiendoParaCierreSesion = true

        this.listaAccionesCaso = data[index_item].acciones


        this.actualPausadoLlamada = data[index_item].pausado == 1
        this.segundosPausa = data[index_item].segundospausado
      }

      if (data.length > 1 ) {
        
        this.actualPausadoOtro = data[0].pausado == 1

        // if(data[1].pausado == 1)
        //   this.actualPausadoOtro = true;



      }

      if(index_item == -1) {
        this.item_actual = undefined
        this.atendiendoParaCierreSesion = false

      }

      if (this.timeStampTicketActual != "") {

        this.timeoutTimerSeconds = setInterval(() => {

          if (this.actualPausadoLlamada || this.timeStampTicketActual == "") return;

          // console.log(this.calcularDiferenciaEnSegundos(this.timeStampTicketActual, this.formatedTimestamp()) - this.segundosPausa)
          // console.log(this.segundosPausa)

          let seconds = this.calcularDiferenciaEnSegundos(this.timeStampTicketActual, this.formatedTimestamp()) - this.segundosPausa

          // seconds = seconds+(800*4)

          if(seconds < 0){
            this.segundosPausa = 0;
            seconds = this.calcularDiferenciaEnSegundos(this.timeStampTicketActual, this.formatedTimestamp())
          }

          if(seconds == 0){
            console.log("bueno");
          }

          // console.log(seconds)

          let horas = Math.floor(seconds / 3600)

          let segundosminutos = seconds - horas * 3600

          let minutos = Math.floor(segundosminutos / 60)

          let segundossegundos = segundosminutos - minutos * 60

          this.temporizadorActual = horas + "h:" + minutos + "m:" + segundossegundos + "s"

          // if (this.item_actual != undefined && !this.ya_solicito_extension && !isNaN(this.tiempo_extendido) && !isNaN(this.tiempo_extendido_otro) && ((seconds + 30) / 60 ) > parseInt(this.item_actual.tiempoestimado) ) {
          //   let eventx: any
          //   this.ya_solicito_extension = true
          //   this.formExtender.get("tiempo_extension")?.setValue(5)

          //   this.onSubmitFormExtender(eventx);
          // }

        }, 1000);

        if(this.listaAccionesCaso.length == 0 && !this.notified)
          this.obtenerAnalisisResoluciones(this.item_actual.data_maquina.idmodelo,this.item_actual.codigo_format,true)

      }

    })

  }

  nivelMaximaPrioridad = 0

  obtenerTickets() {

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      module: 'isg',
      method: 'obtener_tickets_central',
      payload: JSON.stringify({
        idusuario_csc: this.appSession.userId
      })
    }).subscribe((data: any) => {

      // console.log(data)

      this.tickets = data

      // clearInterval(this.timeoutTimerSeconds)

      
      
      let contadorurgentes = 0
      let contadorprimarios = 0
      let contadorimportantes = 0

      let primero = true

      if (data.length > 0) {
        
        data.forEach((element: any) => {
          
          if(primero){
            try {
              this.nivelMaximaPrioridad = parseInt(element.data_categoria_alerta.id)
            } catch (error) {
              this.nivelMaximaPrioridad = 0
            }
            primero = false
          }
        
          element.filtrarcsc == 3 ? contadorurgentes++ : element.filtrarcsc == 2 ? contadorimportantes++ : contadorprimarios++

        });
      }

      this.infourgentes = "Urgentes: " + contadorurgentes.toString()
      this.infoimportantes = "Importantes: " + contadorimportantes.toString() 
      this.infoprimarios = "Primarias: " +contadorprimarios.toString() 

    });

  }

  timeoutTimerSeconds: any

  timeStampTicketActual = ""
  actualPausadoOtro = false

  mostrarModalAtenderOtro = false;

  modalAtenderOtroChange(e: boolean) {
    this.mostrarModalAtenderOtro = e
  }

  modalCrearCasoChange(e: boolean){
    this.mostrarModalCrearCaso = e
  }

  idAlertaInicioSeleccionada = 0

  iniciarAtencion(idalert_email: number,index: number) {

    if(this.tickets[index].data_categoria_alerta != null && this.nivelMaximaPrioridad > this.tickets[index].data_categoria_alerta.id){
      this.snackbarService.mostrarMensaje("No se permite iniciar la revisión de un caso con prioridad menor a la del caso con mayor prioridad disponible",5000)
      return
    }

    if (this.timeStampTicketActual != "" && !this.actualPausadoOtro) {

      // confirm("Deseas pausar el caso actual en revisión y atender este?")

      this.mostrarModalAtenderOtro = true;
      this.idAlertaInicioSeleccionada = idalert_email
      return;

    }

    if (this.timeStampTicketActual != "" && this.actualPausadoOtro) {
      this.snackbarService.mostrarMensaje("Estás revisando un caso actualmente", 2000)
      return
    }

    this.iniciarAtencionSelected(idalert_email)

  }

  iniciarAtencionSelected(idalert_email: number) {

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'iniciar_resolucion',
      module: 'isg',
      payload: JSON.stringify({
        idemail_alert: idalert_email,
        idusuario_csc: this.appSession.userId,
        idalert_email_pausar: this.item_actual == undefined ? 0 : this.item_actual.id
      })
    }).subscribe((data: any) => {

      this.idcasorevision = idalert_email

      ////////Obtener estadísiticamente datos



      this.obtenerTickets()
      
      this.notified = false

      this.obtenerTicketActual()
      window.scrollTo(0, 0)

    })

  }

  lista_acciones_estadisticas = <any>[]

  obteniendo_analisis_resoluciones = false

  obtenerAnalisisResoluciones(idmodelo: number, codigo_falla: string, precargar: boolean = false){

    this.obteniendo_analisis_resoluciones = true
    ////solo sobre el item actual

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

      method: 'obtener_analisis_resoluciones',
      module: 'isg',
      payload: JSON.stringify({

        idmodelo: idmodelo,
        codigo_falla: codigo_falla

      })

    }).subscribe((data: any)=>{

      this.lista_acciones_estadisticas = data
      this.obteniendo_analisis_resoluciones = false

      if(precargar){
        this.precargarAcciones()
      }
      else{
        this.mostrarModalAgregarAccion = true
      }

    })

  }

  precargarAcciones(){

    this.lista_acciones_estadisticas.forEach((element: any) => {

      // {
      //   cantidad_veces: "1",
      //   descripcion: "Comprobar parámetros de configuración del cabezal o la máquina en la configuración del equipo del GS3",
      //   id: "46",
      //   porcentaje: 100,
      //   porcentaje_str: "100.00",
      // }

      let item: AccionSeguimiento =  {
      
        id: "0",
        idaccion: element.id,
        idaccion_seguimiento: element.id,
        descripcion: element.descripcion,
        comentario: '',
        fechahora: this.formatearFechaHoraEstandar(new Date()),
        idemail_alert: this.item_actual.id,
        idalerta: this.item_actual.id,
        idusuario_csc: this.appSession.userId,
        orden: (this.listaAccionesCaso.length + 1).toString()
  
      }

      this.listaAccionesCaso.push(item)

    });

    this.reorganizarListaAcciones(true,1)

  }

  comenzarNuevaRevision(event: Event) {
    event.preventDefault()

    this.mostrarModalAtenderOtro = false;
    this.actualPausadoOtro = true;

    this.timeStampTicketPausado = this.timeStampTicketActual

    this.iniciarAtencionSelected(this.idAlertaInicioSeleccionada)

  }

  calcularDiferenciaEnSegundos(fechaHora1: string, fechaHora2: string): number {
    // Convertir las cadenas de fecha y hora en objetos de fecha
    const fecha1 = new Date(fechaHora1);
    const fecha2 = new Date(fechaHora2);

    // Calcular la diferencia en milisegundos
    const diferenciaMs = fecha2.getTime() - fecha1.getTime();

    // Convertir la diferencia de milisegundos a segundos y redondear al entero más cercano
    const diferenciaSegundos = Math.round(diferenciaMs / 1000);

    return diferenciaSegundos;

  }

  mostrarModalExtender = false

  modalExtenderChange(event: boolean) {
    this.mostrarModalExtender = event
  }

  modalDerivarAlertaChange(event: boolean) {
    this.mostrarModalDerivarAlerta = event
  }

  idcasorevision = 0

  tiempo_extendido_otro = 0

  onSubmitFormExtender(event: Event) {
    try {
      event.preventDefault()
    }
    catch (e) {
      
    }

    if (this.actualPausadoOtro) {
      this.tiempo_extendido_otro += parseInt(this.formExtender.value.tiempo_extension)
    }
    else {
      this.tiempo_extendido += parseInt(this.formExtender.value.tiempo_extension)
    }

    this.mostrarModalExtender = false

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {

      method: "extender_tiempo",
      module: "isg",
      payload: JSON.stringify({
        idalerta: this.item_actual.id,
        tiempo: this.formExtender.value.tiempo_extension,
        idusuario_csc: this.appSession.userId
      })

    }).subscribe((data: any) => {
      this.snackbarService.mostrarMensaje("Se ha extendido el tiempo de atención en " + this.formExtender.value.tiempo_extension + " minutos", 2000)
      // setTimeout(() => {
        this.formExtender.get("tiempo_extension")?.setValue('')
        
        this.obtenerTickets()
        
        this.notified = false

        this.obtenerTicketActual()
        
        setTimeout(() => {
          this.ya_solicito_extension = false
        }, 5000);

      // }, 5000);
    })

  }

  onSubmitFormPosponer(event: Event) {
    try {
      event.preventDefault()
    }
    catch (e) {

    }

    // if (this.actualPausadoOtro) {
    //   this.tiempo_extendido_otro += parseInt(this.formExtender.value.tiempo_extension)
    // }
    // else {
    //   this.tiempo_extendido += parseInt(this.formExtender.value.tiempo_extension)
    // }

    this.mostrarModalPosponer = false

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {

      method: "posponer_alerta",
      module: "isg",
      payload: JSON.stringify({
        idalerta: this.item_actual.id,
        tiempo: this.formPosponer.value.tiempo,
        idusuario_csc: this.appSession.userId
      })

    }).subscribe((data: any) => {
      this.snackbarService.mostrarMensaje("Se ha pospuesto la revisión para dentro de " + this.formPosponer.value.tiempo + " hora/s", 3000)
        
        // // setTimeout(() => {
        //   this.formExtender.get("tiempo_extension")?.setValue('')
        
        this.obtenerTickets()
        
        this.notified = false

        this.obtenerTicketActual()
        
        //   setTimeout(() => {
        //     this.ya_solicito_extension = false
        //   }, 5000);

        // // }, 5000);
    })

  }

  mostrarModalCerrarTicket = false

  modalCerrarTicketChange(event: boolean) {
    this.mostrarModalCerrarTicket = event
  }

  mensajeErrorFinalizar = ""

  //////////////////////////////////

  // finalizarRevision(opt: number){



  // }

  continuarAtencion = 1

  /////////////////////////////////

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

  navigate(path: string){
    this.router.navigate([path])  
  }

  recuperarLinksMaquina(){

    // link_manual_diagnostico

    this.formCierreAlerta.get("link_manual_diagnostico")?.setValue(this.item_actual.data_maquina.link_manual_diagnostico) 
    this.formCierreAlerta.get("link_manual_operador")?.setValue(this.item_actual.data_maquina.link_manual_operador) 
    this.formCierreAlerta.get("link_manual_reparacion")?.setValue(this.item_actual.data_maquina.link_manual_reparacion) 

    this.formCierreAlerta.get("idmaquina")?.setValue(this.item_actual.data_maquina.id)

  }

  onSubmitFormCerrarTicket(event: Event) {
    event.preventDefault()

    if (this.formCierreAlerta.value.detalle == "" || this.formCierreAlerta.value.idalerta == '') {
      this.mensajeErrorFinalizar = 'Debe ingresar una clasificación y un detalle de cierre'
      return
    }

    this.mostrarModalCerrarTicket = false

    let objeto_formulario = this.formCierreAlerta.value

    this.file_array.forEach((element: any) => {

      objeto_formulario[element["name"]] = element["value"];
      objeto_formulario[element["name"] + "_data"] = element["base64rep"]

    });

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      module: 'isg',
      method: 'finalizar_revision',
      payload: JSON.stringify({

        idusuario_csc: this.appSession.userId,
        idalerta: objeto_formulario.idalerta,
        idclasificacion: objeto_formulario.idclasificacion,
        detalle: objeto_formulario.detalle,
        link: objeto_formulario.link,
        archivo: objeto_formulario.archivo,
        data_archivo: objeto_formulario.archivo_data,
        comentario_archivo: objeto_formulario.comentario_archivo,
        link_manual_diagnostico: objeto_formulario.link_manual_diagnostico,
        link_manual_operador: objeto_formulario.link_manual_operador,
        link_manual_reparacion: objeto_formulario.link_manual_reparacion,
        idmaquina: objeto_formulario.idmaquina,
        lista: JSON.stringify(this.listaAccionesCaso)

      })
    }).subscribe((data: any) => {

      if (data.resultado == "success") {
        this.snackbarService.mostrarMensaje("Ticket cerrado correctamente", 2000)
        this.actualPausadoOtro = false;
      }

      this.timeStampTicketActual = ''

      this.formCierreAlerta.get("idclasificacion")?.setValue('')
      this.formCierreAlerta.get("detalle")?.setValue('')
      this.formCierreAlerta.get("archivo")?.setValue('')

      this.temporizadorActual = ''
      this.item_actual = undefined
      this.atendiendoParaCierreSesion = false

      // this.tickets = []

      clearInterval(this.timeoutTimerSeconds)

      setTimeout(() => {
        
        if(this.continuarAtencion == 1){

          if(this.tickets.length > 0){
            this.iniciarAtencion(this.tickets[0].id,0)
          }

        }
        // this.obtenerTickets()
        // this.obtenerTicketActual()

        
        
      }, 1000);

    })

  }

  actualPausadoLlamada = false
  segundosPausa = 0

  pausarRevision(idalerta: number) {

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'pausar_alerta',
      module: 'isg',
      payload: JSON.stringify({
        pausado: this.actualPausadoLlamada ? 0 : 1,
        idalerta: idalerta,
        idusuario_csc: this.appSession.userId
      })
    }).subscribe((data: any) => {

      if (data.resultado == "success") {
        this.actualPausadoLlamada = !this.actualPausadoLlamada

        if (this.actualPausadoLlamada) {
          this.snackbarService.mostrarMensaje("Pausaste la revisión", 2000)
          clearInterval(this.timeoutTimerSeconds)
        }
        else {
          this.snackbarService.mostrarMensaje("Revisión resumida", 2000)
          this.segundosPausa = this.parseInt(data.segundos)
        }
      }
      else {

      }

    })

  }

  nombreResponsableServicios = ""

  obtenerDatosDerivacion(id: number) {

    ///sumar los dias para prest

  }

  modalDerivarServiciosChange(e: boolean) {
    this.mostrarModalDerivarServicios = e
  }

  datosCorsvap: any
  coincidePIN = -1;

  obtenerDatosCorsvap() {

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      module: 'isg',
      method: 'obtener_datos_corsvap',
      payload: JSON.stringify({
        DOC_SYSID: this.formDerivarAlertaServicios.value.numero_corsvap
      })
    }).subscribe((data: any) => {
      // console.log(data)
      this.datosCorsvap = data
      if (this.datosCorsvap.datos_maquinaria.seriechasis.trim() == this.item_actual.pin) this.coincidePIN = 1

      this.formDerivarAlertaServicios.get('fechavencimiento')?.setValue(obtenerFechaMasXDias(this.item_actual.diasatencionderivacion))
      this.formDerivarAlertaServicios.get('fechaestimadafinalizacion')?.setValue(obtenerFechaMasXDias(this.item_actual.diasresolucionderivacion))

      this.formDerivarAlertaServicios.get('datoscontacto')?.setValue(this.datosCorsvap.contacto)

    })

  }

  onSubmitFormDerivarAlertaServicios(event: any) {

  }



  derivandoServicios = false

  confirmarDerivacionServicios(event: Event) {

    if (this.datosCorsvap == undefined) {

      this.snackbarService.mostrarMensaje("Debe indicar los datos de la CORSVAP", 2000);
      return;

    }

    var datos_formulario = this.formDerivarAlertaServicios.value
    datos_formulario["idalerta"] = this.item_actual.id
    datos_formulario["idresponsable"] = this.datosCorsvap.responsable.id
    datos_formulario["idcorsvap"] = this.formDerivarAlertaServicios.value.numero_corsvap
    datos_formulario["idusuario_csc"] = this.appSession.userId
    datos_formulario["numero_corsvap"] = this.datosCorsvap.numbocacomp + "-" + this.datosCorsvap.numcomp


    this.mostrarModalDerivarServicios = false
    this.snackbarService.mostrarMensaje("Derivando caso de revisión a Servicios. Esto puede demorar unos segundos...",5000);

    this.derivandoServicios = true

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      // $idalerta = $_POST["idalerta"];
      // $fechavencimiento = $_POST["fechavencimiento"];
      // $id_corsvap = $_POST["idcorsvap"];
      // $idresponsable = $_POST["idresponsable"];
      // $mensajeoperador = $_POST["mensajeoperador"];

      module: 'isg',
      method: 'derivar_alerta_servicios',
      payload: JSON.stringify(datos_formulario)

    }).subscribe((data: any) => {

      // console.log(data)

      this.derivandoServicios = false

      if(data.resultado == "success"){
        this.snackbarService.mostrarMensaje("El caso fue derivado correctamente",2000);

        this.item_actual = undefined
        this.atendiendoParaCierreSesion = false

        this.tickets = []

        this.obtenerTickets()

      }
      else{
        this.snackbarService.mostrarMensaje("No se pudo derivar la orden. Intente nuevamente",2000);
      }

    })

  }

  selectOrganizacionEvent(item: any) {

    // console.log(item)
    // this.mostrarModalOrganizaciones = false

    this.form_crear_caso.get("idorganizacion")?.setValue(item.id)
    this.form_crear_caso.get("nombreorganizacion")?.setValue(item.nombre)

  }

  selectMaquinariaEvent(item: any) {

    console.log(item)

    this.form_crear_caso.get("idmaquina")?.setValue(item.id)
    this.form_crear_caso.get("nombremaquina")?.setValue(item.vin + ". " + item.marca + " " + item.modelo + ". " + item.nombre)
    this.form_crear_caso.get("pin")?.setValue(item.vin)

    
  }

  timeoutOrgId: any
  timeoutId: any

  onOrganizacionChangeSearch(val: string) {

    try {
      clearTimeout(this.timeoutOrgId)

      this.timeoutOrgId = setTimeout(() => {

        this.getOrganizaciones(val)

      }, 200);

    } catch (error) {

    }

  }

  onMaquinariaChangeSearch(val: string) {

    try {
      clearTimeout(this.timeoutId)

      this.timeoutId = setTimeout(() => {

        this.getMaquinarias(val)

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
        idorganizacion: this.form_crear_caso.value.idorganizacion
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

  mostrar_mensaje_error = false
  mensaje_error = ""

  crearCasoManual(){

    ///validar campos
    if(this.form_crear_caso.value.descripcionCompleta.length<10){

      this.mostrar_mensaje_error = true
      this.mensaje_error = "Debe ingresar un detalle descriptivo"
      return

    }

    if(this.form_crear_caso.value.idcategoria_alerta == ""){

      this.mostrar_mensaje_error = true
      this.mensaje_error = "Debe seleccionar una categoría de alerta"
      return

    }

    if(this.form_crear_caso.value.idorganizacion == 0){

      this.mostrar_mensaje_error = true
      this.mensaje_error = "Debe seleccionar una organización de la lista"
      return

    }

    if(this.form_crear_caso.value.tiempoestimadoresolucion == ""){

      this.mostrar_mensaje_error = true
      this.mensaje_error = "Debe indicar un tiempo estimado de resolucion"
      return

    }
    
    
    this.mostrar_mensaje_error = false
    this.mensaje_error = "Debe indicar un tiempo estimado de resolucion"

    this.mostrarModalCrearCaso = false
    this.snackbarService.mostrarMensaje("Creando y asignando caso",2000)

    let objeto_formulario_crear = this.form_crear_caso.value

    objeto_formulario_crear["idusuario_csc"] = this.appSession.userId

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

      module: 'isg',
      method: 'crear_caso_manual',
      payload: JSON.stringify(objeto_formulario_crear)

    }).subscribe((data: any) => {

      console.log(data)

      this.form_crear_caso = this.formBuilder.group(this.objeto_formulario_caso_limpio)
      
      this.notified = false

      this.obtenerTicketActual()

    })

  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ///DIARIO DE SEGUIMIENTO DEL CASO

  listaAccionesCaso: AccionSeguimiento[]
  mostrarModalAgregarAccion = false
  mostrarModalSilenciarAlerta = false
  formAgregarAccion: FormGroup

  modalAtenderAgregarAccion(e: boolean){
    this.mostrarModalAgregarAccion = e
  }

  mostrarModalPosponer = false

  modalPosponerChange(e: boolean){
    this.mostrarModalPosponer = e
  }

  onAccionChangeSearch(val: string) {

    try {
      clearTimeout(this.timeoutOrgId)

      this.timeoutOrgId = setTimeout(() => {

        this.getAcciones(val)

      }, 200);

    } catch (error) {

    }

  }

  itemAccionSeleccionada: any

  selectAccionEvent(item: any) {

    // console.log(item)
    
    this.itemAccionSeleccionada = item

    // this.mostrarModalOrganizaciones = false

    // this.form_crear_caso.get("idorganizacion")?.setValue(item.id)
    // this.form_crear_caso.get("nombreorganizacion")?.setValue(item.nombre)

  }

  dataAcciones = <any>[]

  onAccionesFocused(e: any) {

  }

  getAcciones(searchField: string) {
    this.apiService.APIPost(AppSettings.API_ENDPOINT + '/', {
      module: 'isg',
      method: 'acciones_seguimiento',
      payload: JSON.stringify({
        campo: searchField,
        codigo_falla: this.item_actual.codigo_format,
        idmodelo: this.item_actual.data_maquina.idmodelo
      })
    }).subscribe((data_a: any) => {

      // console.log(datao)

      // var conv = (datao as any)

      this.dataAcciones = data_a

    });
  }

  crearAccionNueva = false

  ultimo_orden = 0

  agregarAccion(){

    if(this.itemAccionSeleccionada == undefined && !this.crearAccionNueva){
      return
    }

    let obj_accion: AccionSeguimiento =  {
      
      id: "0",
      idaccion: this.itemAccionSeleccionada == undefined ? 0 : this.itemAccionSeleccionada.id,
      idaccion_seguimiento: this.itemAccionSeleccionada == undefined ? 0 : this.itemAccionSeleccionada.id,
      descripcion: this.itemAccionSeleccionada == undefined ? this.formAgregarAccion.value.nombre_accion_nueva : this.itemAccionSeleccionada.descripcion,
      comentario: this.formAgregarAccion.value.comentario,
      fechahora: this.formatearFechaHoraEstandar(new Date()),
      idemail_alert: this.item_actual.id,
      idalerta: this.item_actual.id,
      idusuario_csc: this.appSession.userId,
      orden: (this.listaAccionesCaso.length + 1).toString()

    }

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'isg',
      method:'agregar_accion_seguimiento',
      payload: JSON.stringify(obj_accion)
    }).subscribe((data: any)=>{
      
      obj_accion["id"] = data.id; 
      this.ultimo_orden = this.parseInt(obj_accion["orden"]); 

      this.listaAccionesCaso.push(obj_accion)
      this.itemAccionSeleccionada = undefined
      this.crearAccionNueva = false

      this.formAgregarAccion.get('nombre_accion_nueva')?.setValue('')
      this.formAgregarAccion.get('comentario')?.setValue('')

      this.reorganizarListaAcciones()

    })

    this.mostrarModalAgregarAccion = false;

  }

  quitarAccion(index: number){

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

      module: 'isg',
      method: 'quitar_accion_seguimiento',
      payload: JSON.stringify({

        id: this.listaAccionesCaso[index].id

      })
    }).subscribe((data: any)=>{

      this.listaAccionesCaso.splice(index,1)

      this.reorganizarListaAcciones(true)

    })

  }

  editarDefinicionAlerta(alert_id: number){

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'isg',
      method: 'obtener_id_definicion',
      payload: JSON.stringify({
        id_dtc_alert: alert_id
      })
    }).subscribe((data: any)=>{

      // console.log(data)
      this.router.navigateByUrl('alertas?id='+data.id)

    })

  }

  @HostListener('window:beforeunload', ['$event'])
  showAlertMessageWhenClosingTab($event: any) {
      if(this.atendiendoParaCierreSesion){
        $event.returnValue = 'Estás revisando un caso, ¿Realmente deseas cerrar la ventana?';
      }
      // else{

      // }
  }

  abrirModalSilenciarAlerta(id_alerta: any){

    this.mostrarModalSilenciarAlerta = true


  }

  onSubmitFormSilenciar(event: any){

    let fechaComparar = new Date(this.formSilenciar.get('fecha_limite')?.value);

    // Obtener la fecha actual
    let fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    if(fechaComparar < fechaActual){
      this.snackbarService.mostrarMensaje("La fecha proporcionada no es correcta",2000)
      return
    }

    this.snackbarService.mostrarMensaje("Enviando datos...",2000)

    this.mostrarModalSilenciarAlerta = false

    this.apiService.APIPost(AppSettings.API_ENDPOINT + '/', {
      module: 'isg',
      method: 'silenciar_alerta',
      payload: JSON.stringify({
        idusuario_csc: this.appSession.userId,
        codigo: this.item_actual.codigo_format,
        pin: this.item_actual.pin,
        motivo: this.formSilenciar.get('motivo')?.value,
        fecha_limite: this.formSilenciar.get('fecha_limite')?.value,
        id_alerta: this.item_actual.id
      })
    }).subscribe((data: any) => {

      // console.log(datao)
      // var conv = (datao as any)

      if(data.resultado == 'success'){
        this.snackbarService.mostrarMensaje("Se ha silenciado la alerta. Códigos "+this.item_actual.codigo_format+" para esta máquina serán cerrados automáticamente",5000)

        this.item_actual = undefined
        this.tickets = []

        this.obtenerTickets()
        this.obtenerTicketActual()

      }
      else{
        this.snackbarService.mostrarMensaje("No se pudo silenciar la alerta",2000)
      }

    });
  }

}
