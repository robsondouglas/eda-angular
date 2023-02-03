import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { ApiService, ICaptcha } from '../api.service';

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss']
})
export class CaptchaComponent  {

  public hash:string
  public captcha:string
  public code:FormControl

  refreshCaptcha(){
      this.svc.getCaptcha()
      //.pipe( takeUntil( this._unsubAll ) )
      .subscribe(({hash, img}:ICaptcha)=>{
        this.hash = hash;
        this.captcha = `data:image/png;base64,${img}`;
      });
    
  }

  constructor(private svc: ApiService,private dialogRef: MatDialogRef<CaptchaComponent>) { 
    this.code = new FormControl('', [Validators.required])
    this.refreshCaptcha();
  }

  close(){
    this.dialogRef.close({ 
      hash: this.hash, 
      code: this.code.value 
    })
  }

}
