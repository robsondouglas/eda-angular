import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ApiService, IOpcao, IQtd } from 'src/app/api.service';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit {

  voteData: ChartData<'pie'> = {
    labels: [],
    datasets: [] 
  }; 

  chartOptions: ChartOptions = {
    responsive: true,
    animation: {duration: 0},
    plugins: {
      title: {
        display: true,
        text: 'Distribuição dos votos',
      },
      // legend: {
      //   position: 'left'
      // }
    },
  };

  private totais : IQtd[] = [];
  private options : IOpcao[];
  
  constructor(private svc: ApiService) { 
     svc.listarOpcoes().subscribe((opcs:IOpcao[])=>  {
      this.options = opcs;
      
      svc.listarTotais().subscribe((qtds:IQtd[]) => {
        this.totais = qtds;
        this.updateChart();
      });
    
      svc.OnTotalColorChanged().subscribe(
        res => {
          let itm = this.totais.find( f=> f.id === res.id );
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

  private updateChart(){
    this.voteData= {
      labels: this.options.map(m=>m.label),
      datasets: [{ label: 'total', backgroundColor: this.options.map(m=>m.rgb), data: this.options.map(m=>this.totais.find(f=>f.id === m.id)?.qtd || 0)}] 
    };
    
  }
  
  ngOnInit(): void {
  }

}
