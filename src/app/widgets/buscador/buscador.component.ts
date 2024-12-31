import { Component, Renderer2, Input } from '@angular/core';
import { ApiServiceService } from '../../services/api-service.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBroom, faFilter, faPrint, faPlus, faSearch, faClose, faEdit } from '@fortawesome/free-solid-svg-icons';
import { AppSettings } from '../../appsettings';
import { SessionService } from '../../schema/session';
import { KazeFormInputComponent } from "../kaze-form-input/kaze-form-input.component";
import { SnackbarService } from '../../services/snackbar.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ModalComponent } from '../modal/modal.component';
import { FormBuilder, FormGroup ,ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-buscador',
  standalone: true,
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css',
  imports: [HttpClientModule,
    CommonModule,
    FontAwesomeModule, KazeFormInputComponent, ModalComponent, ReactiveFormsModule ]
})
export class BuscadorComponent  {
  
  @Input() tabla!: string;
  @Input() criterios!: any[];

  Object = Object;
  faSearch = faSearch

  formularioBusqueda: FormGroup

  pagina_actual = 0
  cantidad_paginas = 0;
  cargandoPaquetes = false

  // criterios = <any>[]
  modos = [
    {
      value: "PARECIDO A",
      text: "PARECIDO A"
    },
    {
      value: "IGUAL QUE",
      text: "IGUAL QUE"
    },
    {
      value: "MAYOR O IGUAL QUE",
      text: "MAYOR O IGUAL QUE"
    },
    {
      value: "MENOR O IGUAL QUE",
      text: "MENOR O IGUAL QUE"
    },
    {
      value: "EMPIEZA CON",
      text: "EMPIEZA CON"
    },
    {
      value: "TERMINA CON",
      text: "TERMINA CON"
    },
  ]

  resultados = <any>[]

  constructor(public appSession: SessionService, private formBuilder: FormBuilder, public snackbarService: SnackbarService, private apiService: ApiServiceService, private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver) {

    this.formularioBusqueda = this.formBuilder.group({
      crit: '',
      mode: '',
      search: ''
    })

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
      this.obtenerLista()
    }

  }

  obtenerLista() {
    this.cargandoPaquetes = true;

    this.apiService.APIPost(AppSettings.API_ENDPOINT + "/", {
      method: 'buscador',
      module: 'isg',
      payload: JSON.stringify({
        page: this.pagina_actual,
        search: this.formularioBusqueda.value.search,
        crit: this.formularioBusqueda.value.crit,
        mode: this.formularioBusqueda.value.mode
      })
    }).subscribe((data: any) => {

      this.cargandoPaquetes = false;

      this.resultados = data.contenido
      this.cantidad_paginas = data.cantidadpaginas

    })
  }

}
