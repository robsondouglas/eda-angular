import { Component } from '@angular/core';
import { finalize } from 'rxjs';
import {ApiService, IOpcao, IQtd} from './api.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Votação';

  public opcoes : IOpcao[] = [ ];
  constructor(private svc: ApiService){

    svc.listarOpcoes().subscribe((opcs:IOpcao[])=>  this.opcoes = opcs);
      
  }


  vote(itm:IOpcao){
    itm.loading = true;
      this.svc.vote(itm.id)
      .pipe( finalize(()=>itm.loading = false) )
      .subscribe(()=>console.log('OK'));
  }
}


