import { Component, OnInit } from '@angular/core';
import { ApiService, IQtd } from 'src/app/api.service';

@Component({
  selector: 'app-kpi',
  templateUrl: './kpi.component.html',
  styleUrls: ['./kpi.component.scss']
})
export class KpiComponent  {
  public total = 0;
  private totais:IQtd[] = [];  
  constructor(private svc: ApiService) { 
    
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
 }

 updateChart(){
  this.total = this.totais.reduce((prev, itm)=>itm.qtd+prev, 0 )
}
  

}
