import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, finalize, map, retry, Subject } from 'rxjs';
import * as socket from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private totalColorUpdated: Subject<{id:string, qtd:number}>; 
  private totalMinuteUpdated: Subject<{id:string, qtd:number}>; 

  constructor(private http: HttpClient){
    let ws = socket.io('ws://localhost:4002');
    this.totalColorUpdated  = new Subject<{id:string, qtd:number}>();
    this.totalMinuteUpdated = new Subject<{id:string, qtd:number}>();

    ws.on('connect', ()=>{
      console.log('WS ON');
    });

    ws.on('disconnect', ()=>{
      console.log('WS OFF');
    });

    ws.on('QTD_CHANGED', (res)=>{
      const itm = JSON.parse(res);
      console.log('QTD_CHANGED', itm);
      this.totalColorUpdated.next(itm.totalCor);
      this.totalMinuteUpdated.next(itm.totalMinutoCor);
    });

  }

  listarTotais(){
    return this.http.get('http://localhost:4003/votes')
      .pipe( 
         map((itms:any[]) => itms.map( (itm:any) => ({
           id: itm.key, 
           qtd: itm.value.qtd
         }) as IQtd)),
        retry(2),
        catchError(err=>{
          console.log('Erro ao carregar as opções');
          return err;
        }) 
      )
  }

  listarTotaisMinuto(){
    return this.http.get('http://localhost:4003/votesminutes')
      .pipe( 
         map((itms:any[]) => itms.map( (itm:any) => ({
           id: itm.key, 
           qtd: itm.value.qtd
         }) as IQtd)),
        retry(2),
        catchError(err=>{
          console.log('Erro ao carregar as opções');
          return err;
        }) 
      )
  }

  listarOpcoes (){
      return this.http.get('http://localhost:4003/opcoes')
      .pipe( 
         map((itms:any[]) => itms.map( (itm:any) => ({
           id: itm.id, 
           label: itm.nome,
           rgb: itm.cor,
         }) as IOpcao)),
        retry(2),
        catchError(err=>{
          console.log('Erro ao carregar as opções');
          return err;
        }) 
      )
  }

  OnTotalColorChanged() { return this.totalColorUpdated.asObservable() }
  OnTotalMinuteChanged() { return this.totalMinuteUpdated.asObservable() }

  vote(id){
    const httpHeader = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'}),
    };
    return this.http.post('http://localhost:4003/vote', { id: id })
    .pipe( 
      retry({count: 3, delay: 500}),
      catchError((err:any, res:any)=>{console.log('Erro', err); return res}),
    );
  }
}

export interface IOpcao {
  id:string
  label:string
  rgb:string
  loading: boolean
}

export interface IQtd{
  id: string,
  qtd: number
}