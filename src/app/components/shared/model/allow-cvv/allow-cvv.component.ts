import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-allow-cvv',
  templateUrl: './allow-cvv.component.html',
  styleUrls: ['./allow-cvv.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AllowCvvComponent implements OnInit {
  cvvCode: any;
  constructor(private dialogRef: MatDialogRef<AllowCvvComponent>) { }

  ngOnInit(): void {
  }
  save(cvvCode){
    this.dialogRef.close(cvvCode);
  }
  close(){
    this.dialogRef.close(false);
  }
}
