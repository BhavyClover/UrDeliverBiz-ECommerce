import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-ship-methods',
  templateUrl: './ship-methods.component.html',
  styleUrls: ['./ship-methods.component.scss']
})
export class ShipMethodsComponent {
  IsDialogMax: boolean = false;
  hostHeight: any;
  hostWidth: any;
  cvvCode: any;
  public shipMethods: any;
  userService: UserServiceModal;
  public selectedShippingMethod: number;
  constructor(
    public dialogRef: MatDialogRef<any>,
    public matDialogRef: MatDialogRef<ShipMethodsComponent>, @Inject(MAT_DIALOG_DATA) public dialogData: any, public user: UserService, public companyService: CompanyService) {
    this.shipMethods = this.dialogData;
    this.userService = this.user.userServiceModal;
    this.selectedShippingMethod = this.userService.selectedShippingMethod;
  }

  updateShipMethod() {
    this.dialogRef.close({ shipMethod: this.selectedShippingMethod });
  }
}
