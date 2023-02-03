import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, finalize, Subject, takeUntil } from 'rxjs';
import {ApiService, ICaptcha, IOpcao, IQtd, IUX} from './api.service';
import { CaptchaComponent } from './captcha/captcha.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'Votação';

  
  private _unsubAll : Subject<void>; 
  public opcoes : IOpcao[] = [ ];
  
  public loading:boolean = false;
  public waiting:number = 0;
  public nav : Telas; 
  public ux : IUX = undefined;
  public Telas = Telas;
  public hash:string;
  public captcha:string;

  public code:string;

  public showNav(t:Telas){
    return (this.nav & t) === t
  }

  wait(timeout:number){
    return new Promise<void>(resolve => {
        let tmr = setInterval(()=>{ 
            clearInterval(tmr)
            resolve()
        }, timeout)
    })
  }


  async countDown(v:number){
    this.waiting = v;
    while(this.waiting>0)
    {  
        await this.wait(1000)
        this.waiting--;
    } 
  }

  async showCaptcha(){
    return new Promise((resolve, reject)=>{
      const dialogRef = this.dialog.open(CaptchaComponent);

      dialogRef.afterClosed()
      .subscribe(result => {
        if(result)
        {resolve(result)}
        else
        { reject() }
      });
    })
    
  }

  

  constructor(private svc: ApiService, public dialog: MatDialog){
    this._unsubAll = new Subject();
    svc.listarOpcoes()
      .pipe( takeUntil( this._unsubAll ) )
      .subscribe((opcs:IOpcao[])=>  this.opcoes = opcs);
      
    svc.getLayout()
    .pipe( 
      takeUntil( this._unsubAll ) 
    )
    .subscribe((ux:IUX)=>  {
      this.ux = ux
      this.nav = this.ux.layout === 'single' ? Telas.voto : Telas.voto | Telas.resultado; 
    });  
  }

  ngOnDestroy(): void {
    this._unsubAll.next();
    this._unsubAll.complete();
  }


  async sendVote(itm:IOpcao&{ code?:string, hash?:string }){
    return new Promise<void>((resolve, reject)=>{
      this.svc.vote(itm)
      .pipe( 
        takeUntil( this._unsubAll ),
        catchError(async()=> reject() )
      )
      .subscribe( ()=> resolve());
    }) 
    
  }

  vote(itm:IOpcao){
    this.loading = true;

    if(this.ux.captcha)
    {
      this.showCaptcha()
      .then( (res:any) => 
        this.sendVote( { ...itm, ...res })
          .then(()=>{
            this.countDown(this.ux.waitNext)
            this.loading = false;          
            if(this.ux.layout === 'single')
            { this.nav = Telas.resultado }
          })
          .catch(()=>{
            this.vote(itm)
          })
      )
      .catch(()=>{
        this.vote(itm)
      })
    }
    else{
      this.sendVote(itm)
      .finally(()=>{
        this.countDown(this.ux.waitNext)
        this.loading = false;          
        if(this.ux.layout === 'single')
        { this.nav = Telas.resultado }
      })
    }
  }

  back(){
    if(this.ux.layout === 'single')
    { this.nav = Telas.voto }
  }
}

export enum Telas{
  voto = 1,
  resultado = 2
}

