import { Component, OnInit } from '@angular/core';
import { KazeFormInputComponent } from '../widgets/kaze-form-input/kaze-form-input.component';
import { FormGroup, FormBuilder } from '@angular/forms'; // Importa FormGroup y FormBuilder
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as sha512 from 'js-sha512';

import { AppSettings } from '../appsettings';
import { ApiServiceService } from '../services/api-service.service';
import { SessionService } from '../schema/session';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../services/snackbar.service';
import { ModalComponent } from "../widgets/modal/modal.component";
import { environment } from '../../environments/environment.development';

@Component({
    selector: 'app-auth',
    standalone: true,
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.css',
    imports: [KazeFormInputComponent, FormsModule, ReactiveFormsModule, CommonModule, ModalComponent]
})

export class AuthComponent implements OnInit {
 
  login_form: FormGroup;
  register_form: FormGroup;
  verification_form: FormGroup;
  recuperapass_form: FormGroup;

  // mostrarIngreso = true
  // mostrarCodeSection = false

  mostrarIngreso = true
  mostrarCodeSection = false
  enviando_email = false

  verificando = false

  mostrarModalRecuperarPass = false

  lista_representados = <any>[]

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private apiService: ApiServiceService, private router: Router, private authService: AuthService, private snackbarService: SnackbarService,) {
    // Inicializa el formulario en el constructor
    this.login_form = this.formBuilder.group({
      email: '',
      pass: '',
    });


    this.register_form = this.formBuilder.group({
      nombre: '',
      email: '',
      cuit: ''
    })

    this.verification_form = this.formBuilder.group({
      codigo: '',
      token: ''
    })

    this.recuperapass_form = this.formBuilder.group({
      email: ''
    })

  }

  onSubmit(event: Event) {
    // console.log("CHEE")
    event.preventDefault()
    this.verificando = true

    this.authService.login(this.login_form.value.email, this.login_form.value.pass).then(data => {

      if (data.resultado == 'success') {
        // Inicio de sesión exitoso

        
        // this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
        //   module: 'isg',
        //   method: 'auth_guard',
        //   payload: JSON.stringify({
        //     id: this.login_form.value.email,
        //     set: 1
        //   })
        // }).subscribe((d: any)=>{

          if(data.servicios == 1){
            this.router.navigate(['coordinacion_servicios'])
          }
          else{
            this.router.navigate(['home'])
          }

          setTimeout(() => {
            window.location.reload();
          }, 500);

          this.verificando = false

        // })


      } else {
        // Inicio de sesión fallido
        // alert("Credenciales incorrectas")
        this.snackbarService.mostrarMensaje("Credenciales incorrectas",2000)
        this.verificando = false
      }
    }).catch(error => {
      // Manejar errores
    });

  }

  onRegisterSubmit(event: Event) {
    // console.log("CHEE")
    event.preventDefault()

    this.enviando_email = true
    //this.verificando = true

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'autogestion',
      method: 'solicitar_acceso',
      payload: JSON.stringify({

        email: this.register_form.value.email,
        nombre: this.register_form.value.nombre,
        lista_representados: JSON.stringify(this.lista_representados)

      })
    }).subscribe((data: any)=>{


      this.enviando_email = false;

      if(data.resultado == "success"){

        this.verification_form.get("token")?.setValue(data.token);
        this.mostrarCodeSection = true

      }
      else{
        if(data.resultado == "email"){
          this.snackbarService.mostrarMensaje("Ya hay una cuenta con este mail asociado. Por favor ingrese con sus credenciales o recupere la contraseña.", 6000)
        }
        else{
          this.snackbarService.mostrarMensaje('Ocurrió un problema. Verifique sus datos.', 2000)
        }
      }

    })
  }

  onFormChange(value: any) {

    console.log(value)

  }

  toggleIngreso() {

    this.mostrarIngreso = !this.mostrarIngreso

  }

  onRegisterFormChange(event: Event) {
    console.log(event)
  }

  agregarCuitRepresentar() {

    if(this.register_form.value.cuit.length != 11){
      this.snackbarService.mostrarMensaje('El CUIT proporcionado no es válido', 2000)
      return
    }

    let valid = true

    this.lista_representados.forEach((element: any) => {
      if(element["cuit"] == this.register_form.value.cuit)
      valid = false
    });

    if(!valid){
      this.snackbarService.mostrarMensaje('El CUIT proporcionado ya está en lista', 2000)
      return
    }

    this.obtenerCuitIndividual()

  }

  obtenerCuitIndividual() {

    this.verificando = true

    this.apiService.APIPost(AppSettings.API_ENDPOINT + '/', {
      module: 'autogestion',
      method: 'cuit_individual',
      payload: JSON.stringify({ cuit: this.register_form.value.cuit })
    }).subscribe((data: any) => {

      // console.log(data)
      this.verificando = false

      if(data["resultado"] == "error"){
        this.snackbarService.mostrarMensaje('El CUIT proporcionado no es válido', 2000)
        return
      }

      data.contenido.forEach((element: any) => {
        this.lista_representados.push({
          id: element["id"],
          nombre: element["nombre"]+" - "+element["tipo"],
          cuit: element["cuit"]
        })
      });

    

      this.register_form.get("cuit")?.setValue("")

    })

  }

  onVerificationSubmit(event: Event){
    event.preventDefault()

    // console.log(this.verification_form)

    // console.log(this.register_form.value.email)
    this.verificando = true

    this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{
      module: 'autogestion',
      method: 'finalizar_solicitud',
      payload: JSON.stringify({
        email: this.register_form.value.email,
        token: this.verification_form.value.token,
        codigo: this.verification_form.value.codigo 
      })
    }).subscribe((data: any)=>{
      this.verificando = false

      if(data.resultado == "success"){

        this.mostrarCodeSection = false
        this.mostrarIngreso = true

        this.snackbarService.mostrarMensaje('Hemos recibido tu solicitud correctamente, te avisaremos el resultado en las próximas horas.', 6000)

      }
      else{
        
        this.snackbarService.mostrarMensaje('El código ingresado no es correcto.', 6000)

      }

    })

  }

  /////////////////////
  ///Recuperar pass

  modalRecuperarPassChange(value: boolean){

    this.mostrarModalRecuperarPass = value

  }

  recuperarPass(){
    this.mostrarModalRecuperarPass = true

  }

  ///////////////////////////
  onRecuperarPassSubmit(event: Event){

    event.preventDefault()

    if(this.recuperapass_form.value.email == ''){

      this.snackbarService.mostrarMensaje("Ingrese una dirección de correo válida",2000)
      return

    }

    this.mostrarModalRecuperarPass = false
    this.snackbarService.mostrarMensaje("Estamos procesando la solicitud...",5000)

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/",{
      method: 'recuperar_pass',
      module: 'autogestion',
      payload: JSON.stringify(this.recuperapass_form.value)
    }).subscribe((data: any)=>{

      if(data.resultado == 'success'){

        this.snackbarService.mostrarMensaje("Hemos enviado a tu correo las instrucciones para la recuperación de contraseña", 6000)

      }
      else{
        this.snackbarService.mostrarMensaje("El correo ingresado no es válido. Verificá e intentá nuevamente.", 6000)

      }

    })

  }

  // getParam1 = ""
  // getParam2 = ""
  
  deepLinking = false

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      if(params['der'] != undefined && params['auth'] != undefined){

        ///DERIVACION DE SERVICIOS, VISTA AUTENTICADA PARA EL USUARIO COORDINADOR
        //con el id de derivacion tengo el id de responsable, y de idusuario csc

        this.deepLinking = true
        this.verificando = true

        this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

          module: 'isg',
          method: 'deeplink_derivacion_servicios',
          payload: JSON.stringify({

            auth: params["auth"],
            id_derivacion: params["der"],

          })
        }).subscribe((data_d: any)=>{


          if(data_d.resultado == "success"){
            ///iniciar sesion

            this.authService.login(data_d.email, data_d.pass,false).then(data => {

              if (data.resultado == 'success') {
                // Inicio de sesión exitoso
        
                  // if(data.servicios == 1){
                  
                  this.router.navigateByUrl('coordinacion_servicios?der='+params["der"])

                  // }
                  // else{
                  //   this.router.navigate(['home'])
                  // }
        
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
        
                  this.verificando = false
        
                // })
        
        
              } else {
                // Inicio de sesión fallido
                // alert("Credenciales incorrectas")
                // this.snackbarService.mostrarMensaje("Credenciales incorrectas",2000)
                this.verificando = false
              }
            }).catch(error => {
              // Manejar errores
            });
        

          }

        })

      }

      /////ACCESO A UNA ALERTA DTC EN CASO DE GUARDIA

      
      if(params['dtc'] != undefined && params['auth'] != undefined){

        this.deepLinking = true
        this.verificando = true

        this.apiService.APIPost(AppSettings.API_ENDPOINT+"/",{

          module: 'isg',
          method: 'deeplink_dtc_alert',
          payload: JSON.stringify({

            auth: params["auth"],
            id_dtc_alert: params["dtc"],

          })
        }).subscribe((data_d: any)=>{

          if(data_d.resultado == "success"){
            ///iniciar sesion

            this.authService.login(data_d.email, data_d.pass,false).then(data => {

              if (data.resultado == 'success') {
                // Inicio de sesión exitoso
        
                  // if(data.servicios == 1){
                  
                  this.router.navigateByUrl('atencion?dtc='+params["dtc"])

                  // }
                  // else{
                  //   this.router.navigate(['home'])
                  // }
        
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
        
                  this.verificando = false
        
                // })
        
        
              } else {
                // Inicio de sesión fallido
                // alert("Credenciales incorrectas")
                // this.snackbarService.mostrarMensaje("Credenciales incorrectas",2000)
                this.verificando = false
              }
            }).catch(error => {
              // Manejar errores
            });
        

          }

        })

      }

    });
  }

}
