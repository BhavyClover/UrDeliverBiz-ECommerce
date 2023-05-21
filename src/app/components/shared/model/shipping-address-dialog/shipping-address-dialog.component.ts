import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ShippingAddress, UserServiceModal } from 'src/app/modals/userservice.modal';
import { State } from 'src/app/modals/state.modal';
import { RestApiService } from '../../services/restapi.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-shipping-address-dialog',
  templateUrl: './shipping-address-dialog.component.html',
  styleUrls: ['./shipping-address-dialog.component.scss']
})
export class ShippingAddressDialogComponent implements OnInit {
  IsDialogMax: boolean = false;
  hostHeight: any;
  hostWidth: any;
  differentAddressShow: boolean = false;
  public newShipping: ShippingAddress = {} as ShippingAddress;
  newAddressSelected: boolean = false;
  defaultAddress: any = {};
  userService: UserServiceModal;
  public allowedCountries: any = [];
  states: Array<State> = [];
  constructor(
    public dialogRef: MatDialogRef<any>,
    public matDialogRef: MatDialogRef<ShippingAddressDialogComponent>,
    public user: UserService,
    public apiService: RestApiService
  ) {
    this.defaultAddress = this.user.userServiceModal.shippingAddress;
    this.userService = this.user.userServiceModal;
  }

  ngOnInit(): void {
      this.allowedCountries = JSON.parse(sessionStorage.getItem('allowedCountries'));
      this.getCountryState(this.newShipping.CountryCode || 'US');

  }
  getCountryState(country?: string) {
    this.apiService.getStates(country || 'US').subscribe((result) => {
      sessionStorage.setItem((country || 'US') + 'State', JSON.stringify(result.Data));
      this.states = result.Data;
    },
      (error) => {
      }, () => {

      });
  }
  onClickDifferentAddress(checked) {
    this.differentAddressShow = checked;
    this.newAddressSelected = checked;
  }
  saveNewAddress() {
    this.matDialogRef.close({ address: this.newShipping, isReplacement: true });
  }
  close() {
    this.matDialogRef.close({ address: this.newShipping, isReplacement: false });
  }

}
