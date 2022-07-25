
import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import * as moment from 'moment';
import { ApiService, IOpcao, IQtd } from 'src/app/api.service';

import { timer } from 'rxjs';

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.scss']
})
export class LineComponent implements OnInit {
  voteData: ChartData<'bar'> = {
    labels: [],
    datasets: [] 
  };

  chartOptions: ChartOptions = {
    responsive: true,
    animation: {duration: 0},
    plugins: {
      title: { display: true, text: 'Votos por minuto' },
    },
  };
  
  private totais : IQtd[] = [];
  private options : IOpcao[];
  public  colors : string[];
  
  constructor(private svc: ApiService) { 
    this.fillMinutes();
     svc.listarOpcoes().subscribe((opcs:IOpcao[])=>  {
      this.options = opcs;
      this.colors = opcs.map(m=>m.rgb);
      svc.listarTotaisMinuto().subscribe((qtds:IQtd[]) => {
        this.totais = qtds;
        this.updateChart();
        
        timer(0,1000)
        .subscribe(()=>{
          this.fillMinutes();
          this.updateChart();
        });

      });
    
      
      svc.OnTotalMinuteChanged().subscribe(
        res => { 
          this.fillMinutes();    
          let itm = this.totais.find( f=> f.id === res.id )
          if(itm == null)
          { 
            itm = {id: res.id, qtd: 0}
            this.totais.push(itm) 
          }
          
          itm.qtd = res.qtd;

          this.updateChart();
        }
      )
     });
  }

  minutes = []
  getMinute = (prev:number) => (Math.floor((new Date()).valueOf()/60000) * 60000) - (prev)*60000; 
  fillMinutes = () =>  {
    this.minutes = Array.from({length:5}).map( (itm, idx, arr)=> this.getMinute(arr.length-idx-1) )
     
  } 
    

  private updateChart(){
    let ds = this.options.map(opt=>({
      label: opt.label,
      backgroundColor: opt.rgb,
      stack: 'a', 
      data: this.minutes.map(min=> this.totais.find(f=>f.id === `min_${min}_${opt.id}`)?.qtd || 0) 
    }));
    
    this.voteData= {
      labels: this.minutes.map(m=> moment(new Date(m)).format('HH:mm') ),
      datasets: ds 
    };
    
  }

  ngOnInit(): void {
  }

}
