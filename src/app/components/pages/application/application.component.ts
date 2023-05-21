import { ShoppingCartService } from "./../../shared/services/shopping-cart.service";
import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { HostedpaymentDialogComponent } from "../../shared/model/hostedpayment-dialog/hostedpayment-dialog.component";
import { NotificationService } from "../../shared/services/notification.service";
import { PaymentService } from "../../shared/services/payment.service";
import { ProductService } from "../../shared/services/product.service";
import { RestApiService } from "../../shared/services/restapi.service";
import { UserService } from "../../shared/services/user.service";
import * as _ from "lodash";
import * as moment from "moment";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { ApplicantAddress, Enrollment } from "src/app/modals/enrollment.model";
import { EnrollmentResponse } from "src/app/modals/enrollmentrespnse.modal";
import { Title } from "@angular/platform-browser";
import { ConfigService } from "../../shared/services/config.service";
import { State } from "src/app/modals/state.modal";
import { UtilityService } from "../../shared/services/utility.service";
import { FindEnrollerComponent } from "../../shared/model/findenroller/findenroller.component";
import { Cart1Service } from "../../shared/services/cart1.service";
import { UserServiceModal } from "src/app/modals/userservice.modal";
import { OrderService } from "../../shared/services/order.service";
import { DSProduct } from "src/app/modals/dsproduct.modal";
import { ValidateKeywordService } from "../../shared/services/validatekeyword.service";
import { ItemsListService } from "../../shared/services/itemsList.service";
import $ from "jquery";
import { Location } from "@angular/common";
import { RegexService } from "../../shared/services/regex.service";
import { AllowCvvComponent } from "../../shared/model/allow-cvv/allow-cvv.component";
import { AutoshipConfigurationService } from "../../shared/services/autoshipConfiguration.service";
import { CompanyService } from "../../shared/services/company.service";
import { AccountService } from "../../shared/services/account.service";
import { PersistentService } from "../../shared/services/persistent.service";
declare function OnIFrameSave(e): any;
@Component({
  selector: "app-application",
  templateUrl: "./application.component.html",
  styleUrls: ["./application.component.scss"],
})
export class ApplicationComponent implements OnInit, OnDestroy {
  userService: UserServiceModal;
  enrollmentForm: Enrollment;
  ageError: boolean = false;
  legacyGuestCheckout: boolean = false;
  IsSubmitDisable: boolean = false;
  loadingDetails: boolean = true;
  SubmitApplicationResponse: any = {};
  submitApplicationRequest: Enrollment;
  frequencyTypeID: number = 0;
  AutoshipItemRequired: Array<number> = [1, 3];
  IsAllowKitItems: boolean = true;
  OrderItemRequired: boolean = true;
  allowedCountries: any = [];
  selectedCountry: string = "us";
  shippingAddressGroup: FormGroup;
  accountInfoGroup: FormGroup;
  paymentMethodGroup: FormGroup;
  shippingNewAddressGroup: FormGroup;
  isShowKit: boolean = false;
  public country: any;
  public userType: any;
  selectedLanguageCode: any;
  states: Array<State> = [];
  selectedState: string = "UT";
  model: any = {};
  days = [];
  months = [];
  years = [];
  selectedStateControl = new FormControl(this.selectedState);
  panelShippingAddress: boolean = true;
  panelAccountInfo: boolean = false;
  panelPaymentMethod: boolean = false;
  noOfStepsVerified: number = 0;
  UserNameCheck: any;
  ApplicationSteps: any = {};
  public currentStep: any;
  isShowUpDown: any[] = [];
  CurrentSection: any = {};
  finalStep: any;
  typeSelected: any;
  scrollDuration: number = 2;
  scrollPosition: number = 0;
  paddleMargin: number = 24;
  lastQuantity: 0;
  public commonData: any;
  public AutoshipMinDate: Date;
  public AutoshipMaxDate: Date;
  selectedfrequencyTypeID: 0;
  ReplicatedSiteUrl: string = "udb.ziplingo.com";
  checkboxes: any = {};
  StatesResponse: [];
  StateNameToggel: boolean = false;
  isPanelOpen: boolean = false;
  productsAutoshipStore: Array<DSProduct> = [];
  productskitStore: Array<DSProduct> = [];
  productswholesaleStore: Array<DSProduct> = [];
  productsRetailPriceAutoship: Array<DSProduct> = [];
  productsRetailPriceKit: Array<DSProduct> = [];
  productsRetailPriceWholesale: Array<DSProduct> = [];
  RegionIDForRequest: number;
  constructor(
    public utilityService: UtilityService,
    private titleService: Title,
    public configService: ConfigService,
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public itemsService: ProductService,
    public apiService: RestApiService,
    public user: UserService,
    public notificationService: NotificationService,
    public paymentService: PaymentService,
    public translate: TranslateService,
    public cart1Service: Cart1Service,
    public orderService: OrderService,
    public validateKeyword: ValidateKeywordService,
    public itemsListService: ItemsListService,
    public location: Location,
    public regexService: RegexService,
    public router: Router,
    public autoshipConfigurationService: AutoshipConfigurationService,
    public companyService: CompanyService,
    public accountService: AccountService,
    public shoppingCartService: ShoppingCartService,
    public persistentService: PersistentService
  ) {
    this.userService = this.user.userServiceModal;
    this.utilityService.isShowSimplifiedheader = true;
    this.allowedCountries = JSON.parse(
      sessionStorage.getItem("allowedCountries")
    );
    const selectedCountry =
      sessionStorage.getItem("selectedCountry") === "undefined" ? 'US' : sessionStorage.getItem("selectedCountry");
    const selectedCustomerTypeID =
      sessionStorage.getItem("selectedCustomerTypeID") === "undefined" ? '1' : sessionStorage.getItem("selectedCustomerTypeID");
    this.selectedLanguageCode = sessionStorage.getItem("selectedLanguageCode");

    const userType = _.find(
      configService.commonSettings.CustomerTypes,
      (customerType) => {
        return (
          customerType.ID ===
          (parseInt(this.route.snapshot.queryParams.type, 10) ||
            this.typeSelected ||
            parseInt(selectedCustomerTypeID, 10) ||
            2)
        );
      }
    );
    const country = _.find(this.allowedCountries, (item) => {
      return item.CountryCode.toLowerCase() === (selectedCountry || "us");
    });
    this.country = country;
    this.configService
      .getCommonSetting(
        this.country.CountryCode,
        this.selectedLanguageCode || this.commonData.selectedLanguage
      )
      .then(() => {
        this.RegionIDForRequest = this.companyService.getRegionID(
          this.country.CountryCode
        );

        if (this.userService.customerTypeID == 3 || this.userService.customerTypeID == 2) {
          this.itemsForCustomerPC();
        } else if (this.userService.customerTypeID == 1) {
          this.itemsForCustomerIBO();
        }
        // replace this if api accept string instead of integer
        // this.paymentService.getPaymentType(this.enrollmentForm.ShippingAddress?.CountryCode?.toLowerCase() == 'us' ? 'ut' : this.enrollmentForm.ShippingAddress?.Region, this.enrollmentForm.ShippingAddress?.CountryCode).then(() => {
        this.paymentService
          .getPaymentType(
            this.RegionIDForRequest,
            this.enrollmentForm.ShippingAddress?.CountryCode
          )
          .then(() => {
            this.userService.paymentMethods =
              this.userService.paymentMethods || [];
            this.userService.couponInfo.promoCodeValid = undefined;
            this.paymentService.PaymentDataResponse =
              this.paymentService.PaymentDataResponse || {};
            // If they've already set up a split payment and try to add autoship items, only allow one payment method
            if (this.countPaymentMethods() > 1) {
              this.userService.paymentMethods = [
                this.userService.paymentMethods[0],
              ];
            }
          });
      });
    this.userType = userType;
    if (this.userType) {
      this.userService.customerTypeID = this.userType.ID;
    }
    this.typeSelected = this.userType.ID || "0";

    this.enrollmentForm = {} as Enrollment;
    this.enrollmentForm.ApplicantAddress =
      this.enrollmentForm.ApplicantAddress || ({} as ApplicantAddress);
    this.enrollmentForm.billingAddressSame = true;
    this.commonData = this.configService.getConfig();
    this.selectedfrequencyTypeID =
      this.persistentService.retailData.Autoship.FrequencyTypeID;
    this.AutoshipMinDate = moment()
      .add(this.configService.localSettings.Autoship.AutoshipMinDate, "days")
      .toDate();
    this.AutoshipMaxDate = moment()
      .add(this.configService.localSettings.Autoship.AutoshipMaxDate, "days")
      .toDate();

    // Maipulating formdata from sessionstorage when page changes
    this.router.events.subscribe((event) => {
      if (
        event instanceof NavigationEnd &&
        event.url.indexOf("complete") == -1 &&
        event.url.indexOf("join") == -1
      ) {
        sessionStorage.setItem("FormData", JSON.stringify(this.enrollmentForm));
      } else if (event instanceof NavigationEnd && event.url == "/join") {
        this.setFormData();
      } else if (event instanceof NavigationEnd && event.url == "/complete") {
        sessionStorage.removeItem("FormData");
      }
    });
  }

  // Setting formdata from session storage to page
  setFormData() {
    if (sessionStorage.getItem("FormData")) {
      this.enrollmentForm = JSON.parse(sessionStorage.getItem("FormData"));
    }
  }
  //

  // Setting formdata into session before reload event starts
  @HostListener("window:beforeunload", ["$event"]) saveFormData(event: Event) {
    sessionStorage.setItem("FormData", JSON.stringify(this.enrollmentForm));
  }
  //

  ngOnInit(): void {
    this.translate.get("global_Company_Title").subscribe((text: string) => {
      this.titleService.setTitle("Join" + " | " + text);
    });
    this.apiService
      .getStates(this.configService.commonData.selectedCountry || "us")
      .subscribe((result) => {
        sessionStorage.setItem(
          (this.configService.commonData.selectedCountry || "us") + "State",
          JSON.stringify(result.Data)
        );
        this.states = result.Data;
      });

    this.days = this.utilityService.birthDays();
    this.months = this.utilityService.birthMonths();
    this.years = this.utilityService.birthYears();
    sessionStorage.setItem("IsEnrollment", "true");
    this.setSteps(1);

    this.autoshipConfigurationService.autoshipDate = this
      .autoshipConfigurationService.autoshipDate
      ? this.autoshipConfigurationService.autoshipDate
      : $("#startdate").val();

    if (this.autoshipConfigurationService.autoshipDate) {
      $("#startdate").val(this.autoshipConfigurationService.autoshipDate);
    }

    // Enable Disable Steps
    if (this.userService.customerTypeID == 1) {
      setTimeout(() => {
        $(".card")
          .find(".toggle-ul.step_" + 1)
          .slideDown(200);
      }, 2500);
    } else {
      setTimeout(() => {
        $(".card")
          .find(".toggle-ul.step_" + 1)
          .slideDown(200);
      }, 200);
    }

    $("#ds_application2").on("click", (event) => {
      const $target = $(event.target);
      for (let index = 1; index <= this.userService.TotalSteps; index++) {
        if (
          !$target.closest("#step_" + index).length &&
          $("#step_" + index + " .step_" + index + ".toggle-ul").length &&
          $("#step_" + index + " .step_" + index + ".toggle-ul").css(
            "display"
          ) != "none"
        ) {
          $("#step_" + index + " .step_" + index + ".toggle-ul").slideToggle(
            "slow",
            "swing",
            () => {}
          );
        }
      }
    });
    this.isShowUpDown[3] = true;
    this.finalStep = this.userService.customerTypeID == 1 ? 6 : 5;

    setTimeout(() => {
      $("html,body").animate({ scrollTop: 0 }, "slow");
      $(() => {
        this.CurrentSection = {};
        this.CurrentSection[3] = true;
        let countDefault = 0;
        $("#step_3")
          .find('input[type="tel"],input[type="text"]')
          .each(() => {
            if (!$(this).val() && countDefault == 0) {
              $(this).trigger("focus");
              $(this).trigger("select");
              countDefault++;
            }
          });
      });
    }, 1000);
    this.getStates();

    if (sessionStorage.getItem("FormData")) {
      this.enrollmentForm = JSON.parse(sessionStorage.getItem("FormData"));
    }
  }

  itemsForCustomerIBO() {
    if (this.userService.customerTypeID == 1) {
      const requestForkit = {
        CurrencyCode:
          this.companyService.selectedCurrency?.CurrencyCode || "USD",
        LanguageCode: this.configService.commonData.selectedLanguage || "en",
        RegionID: this.RegionIDForRequest,
        PriceGroup: this.userService.customerTypeID,
        StoreID: 4,
        CategoryId: 0,
      };
      this.itemsService.getProducts(requestForkit).subscribe((p: any[]) => {
        this.productskitStore = p;
      });
    }
  }
  doberror(event) {
    if (this.enrollmentForm.BirthDay && this.enrollmentForm.BirthMonth && this.enrollmentForm.BirthYear) {
      let day = this.enrollmentForm.BirthDay
      let month = this.enrollmentForm.BirthMonth
      let year = this.enrollmentForm.BirthYear
      let dateString = year.toString() + '-' + month.toString() + '-' + day.toString();
      let today = new Date();
      let birthDate = new Date(dateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      let m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;

      }
      if (age < 18) {

        this.ageError = true;
      } else {
        this.ageError = false;
      }
    }
  }

  itemsForCustomerPC() {
    if (this.userService.customerTypeID == 3 || this.userService.customerTypeID == 2) {
      const requestforInitial = {
        CurrencyCode:
          this.companyService.selectedCurrency?.CurrencyCode || "USD",
        LanguageCode: this.configService.commonData.selectedLanguage || "en",
        RegionID: this.RegionIDForRequest,
        PriceGroup: this.userService.customerTypeID,
        StoreID: 2,
        CategoryId: 0,
      };

      // third call
      this.itemsService.getProducts(requestforInitial).subscribe((p: any[]) => {
        this.productswholesaleStore = p;
      });
    }
  }

  changeAffiliate() {
    this.dialog.open(FindEnrollerComponent, {
      disableClose: true,
      panelClass: "findenroller-dialog",
      autoFocus: false,
    });
  }

  customerTypeDescription() {
    if (!this.configService.commonSettings.CustomerTypes) {
      return "";
    }
    return _.find(
      this.configService.commonSettings.CustomerTypes,
      (customerType) => {
        return this.userService.customerTypeID == customerType.ID;
      }
    ).Description;
  }

  setSteps(type) {
    this.ApplicationSteps = {
      step1: { currentStep: type == 1 ? 2 : 1 },
      step2: { currentStep: type == 1 ? 3 : 2 },
      step3: { currentStep: type == 1 ? 4 : 3 },
      step4: { currentStep: type == 1 ? 5 : 4 },
      step5: { currentStep: type == 1 ? 6 : 5 },
    };
  }

  getpaymentMethodIframe() {
    this.dialog.open(HostedpaymentDialogComponent, {
      panelClass: "hosted_payment-Dialog",
    });
  }
  saveApplicationDetail() {
    if (
      !this.userService.commissionPayment &&
      this.userService.customerTypeID == 1
    ) {
      this.notificationService.error(
        "error_",
        this.translate.instant("unifiedapplication_add_ssn_required")
      );
      return;
    }
    if (this.orderService.calculateOrderResponse.Result) {
      if (this.orderService.calculateOrderResponse.Result.Status !== 0) {
        this.notificationService.error(
          "error_",
          this.orderService.calculateOrderResponse.Result.Errors
        );
        return;
      }
    } else {
      this.notificationService.error(
        "error_",
        this.translate.instant("unifiedapplication_error_occured_try_again")
      );
      return;
    }

    if (this.userService.paymentMethods.length > 0) {
      if (
        this.userService.paymentMethods[0].Last4 ||
        this.userService.paymentMethods[0].Last4 === undefined
      ) {
        this.scrollTo(this.ApplicationSteps.step4.currentStep);
      } else {
        this.notificationService.error(
          "error_",
          this.translate.instant("unifiedapplication_add_payment_error")
        );
        return;
      }
    } else {
      this.notificationService.error(
        "error_",
        this.translate.instant("unifiedapplication_add_payment_error")
      );
      return;
    }
  }

  getShipName(shipmethodID) {
    this.userService.selectedShippingMethod = shipmethodID;
    this.orderService.calculateOrder();
    if (this.itemsService.selectedAutoOrderItems.length > 0) {
      this.orderService.calculateAutoOrder();
    }
  }

  clearApplicationData(element) {
    const id = "#" + element.target.id;
    if ($(id).is(":checked")) {
      $(id).closest(".control-group").find(".has-error.help-block").remove();
      $(id).closest(".control-group").removeClass("has-error");
    }
  }

  countPaymentMethods() {
    const paymentMethods = this.userService.paymentMethods;
    return paymentMethods ? paymentMethods.length : 0;
  }

  scrollTo(num) {
    $("html, body").animate(
      {
        scrollTop: $("#step_" + parseInt(num, 10).toString()).offset().top,
      },
      50
    );
  }

  scrollToSection(num) {
    $("html, body").animate(
      {
        scrollTop:
          $("#step_" + parseInt(num, 10).toString()).offset().top - 100,
      },
      1000
    );
  }

  collapseExpendSteps(num) {
    this.CurrentSection[num] = true;
    for (let index = 1; index <= this.userService.TotalSteps; index++) {
      if (!this.isShowUpDown[index] || num == index) {
        $("#step_" + index)
          .find(":input")
          .each((i, e) => {
            const element = $(e);
            element.closest(".control-group").removeClass("has-error");
            element.closest(".control-group").find(".has-error").remove();
          });
      }
    }

    setTimeout(() => {
      if (this.UserNameCheck) {
        this.noOfStepsVerified = num;
        for (let index = 1; index <= this.userService.TotalSteps; index++) {
          if (index != num) {
            if (
              $("#step_" + index + " .control-group.has-error").length > 0 ||
              (this.isShowUpDown[index] && !this.isStepValidated(index))
            ) {
              $(".card")
                .find(".step_" + index)
                .slideDown(500);
              this.isShowUpDown[index] = true;
            } else {
              $(".card")
                .find(".step_" + index)
                .slideUp(500);
              this.isShowUpDown[index] = false;
            }
          } else {
            $(".card")
              .find(".step_" + index)
              .slideDown(500);
            this.isShowUpDown[index] = true;
          }
        }
        if (num) {
          setTimeout(() => {
            if (this.finalStep < num) {
              this.scrollToSection(num);
            }
            let count = 0;
            $("#step_" + num)
              .find(":input")
              .each(() => {
                if (!$(this).val() && count == 0) {
                  $(this).trigger("focus");
                  $(this).trigger("select");
                  count++;
                }
              });
          }, 500);
        }
      }
    }, 50);
  }

  stepCollapsed(index) {
    return (
      $("#step_" + index + " .step_" + index + ".toggle-ul").css("display") ==
      "none"
    );
  }

  isStepValidated(index) {
    if ($("#step_" + index + " .control-group.has-error").length > 0) {
      return false;
    } else {
      const required = $("#step_" + index + " .control-group [validate]");
      let validated = true;
      _.each(required, (field) => {
        if (field.hasAttribute("validate-select")) {
          const value = $(field).find("option:selected").text();
          if (value.match(/Select/) || value === "") {
            validated = false;
            return;
          }
        } else if (field.hasAttribute("checkbox-validate")) {
          if (!$(field).is(":checked")) {
            validated = false;
            return;
          }
        } else if (!field.value) {
          validated = false;
          return;
        }
      });
      return validated;
    }
  }

  readyForCheckout() {
    let validated = true;
    for (let index = 1; index <= this.userService.TotalSteps; index++) {
      validated = !!this.isStepValidated(index);
      if (!validated) {
        break;
      }
    }
    return validated;
  }

  submitApplication(cvv?: any) {
    if (
      this.itemsService.selectedAutoOrderItems.length > 0 &&
      this.persistentService.retailData.Autoship.FrequencyTypeID <= 0
    ) {
      this.notificationService.error(
        "error_",
        this.translate.instant("unifiedapplication_choose_frequency_sidecart")
      );
      return;
    }
    // if (this.itemsService.selectedOrderItems.length == 0 && this.configService.localSettings.Global.OrderItemRequired[this.userService.customerTypeID]) {
    //   this.notificationService.error('error_', this.translate.instant('unifiedapplication_order_item_required'));
    //   return;
    // }

    // if (this.userService.customerTypeID == 1 && this.IsAllowKitItems && this.itemsService.selectedPacks.length == 0) {
    //   this.notificationService.error('error_', 'unifiedapplication_kit_item_required');
    //   return;
    // }

    this.IsSubmitDisable = true;
    const productdetails = [];
    _.each(this.itemsService.selectedOrderItems, (item) => {
      productdetails.push({
        ItemID: item.ItemID,
        Quantity: item.Quantity,
        IsKit: false,
        CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
      });
    });

    _.each(this.itemsService.selectedPacks, (item) => {
      productdetails.push({
        ItemID: item.ItemID,
        Quantity: item.Quantity,
        IsKit: item.IsKitItem,
        CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
      });
    });

    const autoshipproductdetails = [];
    _.each(this.itemsService.selectedAutoOrderItems, (item) => {
      autoshipproductdetails.push({
        ItemID: item.ItemID,
        Quantity: item.Quantity,
        IsKit: false,
        CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
      });
    });

    if (autoshipproductdetails.length > 0) {
      this.submitApplicationRequest.AutoShip = {
        StartDate: this.autoshipConfigurationService.autoshipDate,
        Frequency:
          this.persistentService.retailData.Autoship.FrequencyTypeID.toString(),
        ShipMethodID: this.userService.selectedShippingMethod || 1,
        Items: autoshipproductdetails,
      };
    }

    if (
      this.userService.customerTypeID == 1 &&
      this.itemsService.selectedAutoOrderItems.length == 0 &&
      this.itemsService.selectedPacks.length == 0 &&
      this.itemsService.selectedOrderItems.length == 0
    ) {
      this.submitApplicationRequest = {
        AssociateID: this.paymentService.PaymentDataResponse.customerId || 0,
        AcceptTerms: true,
        billingAddressSame: false,
        FirstName: this.enrollmentForm.FirstName,
        LastName: this.enrollmentForm.LastName,
        RomanizedFirstName: "",
        RomanizedLastName: "",
        LegalFirstName: "",
        LegalLastName: "",
        TaxID: this.enrollmentForm.TaxID,
        BirthDate: ((this.enrollmentForm.BirthYear || 2000) + '-' + (this.enrollmentForm.BirthMonth || 1) + '-' + (this.enrollmentForm.BirthDay || 1)).toString(),
        PrimaryPhone: this.enrollmentForm.PrimaryPhone,
        SecondaryPhone: "",
        TextNumber: "",
        Email: this.enrollmentForm.Email,
        Username: this.enrollmentForm.Username,
        Password: this.enrollmentForm.Password,
        LanguageCode: this.enrollmentForm.LanguageCode || "en",
        ApplicantAddress: {
          Street1: this.enrollmentForm.ApplicantAddress.Street1,
          Street2: this.enrollmentForm.ApplicantAddress.Street2,
          Street3: this.enrollmentForm.ApplicantAddress.Street3,
          City: this.enrollmentForm.ApplicantAddress.City,
          Region: this.enrollmentForm.ApplicantAddress.Region,
          PostalCode: this.enrollmentForm.ApplicantAddress.PostalCode,
          CountryCode: this.enrollmentForm.ApplicantAddress.CountryCode || "us",
        },
        ShippingAddress: {
          Street1: this.enrollmentForm.ApplicantAddress.Street1,
          Street2: this.enrollmentForm.ApplicantAddress.Street2,
          Street3: this.enrollmentForm.ApplicantAddress.Street3,
          City: this.enrollmentForm.ApplicantAddress.City,
          Region: this.enrollmentForm.ApplicantAddress.Region,
          PostalCode: this.enrollmentForm.ApplicantAddress.PostalCode,
          CountryCode: this.enrollmentForm.ApplicantAddress.CountryCode || "us",
        },
        AssociateTypeID: this.userService.customerTypeID,
        AssociateBaseType: this.userService.customerTypeID,
        SponsorID: this.userService.enrollerInfo.CustomerId,
        WebPageURL:
          this.userService.customerTypeID === 1
            ? this.enrollmentForm.Username
            : "",
        WebPageItemID: 0,
        SendEmails: this.enrollmentForm.SendEmails || false,
        AssociateCustom: null,
        PlacementOverrides: null,
      };
    } else {
      this.submitApplicationRequest = {
        AssociateID: this.paymentService.PaymentDataResponse.customerId || 0,
        AcceptTerms: true,
        billingAddressSame: false,
        FirstName: this.enrollmentForm.FirstName,
        LastName: this.enrollmentForm.LastName,
        RomanizedFirstName: "",
        RomanizedLastName: "",
        LegalFirstName: "",
        LegalLastName: "",
        TaxID: this.enrollmentForm.TaxID,
        BirthDate: ((this.enrollmentForm.BirthYear || 2000) + '-' + (this.enrollmentForm.BirthMonth || 1) + '-' + (this.enrollmentForm.BirthDay || 1)).toString(),
        PrimaryPhone: this.enrollmentForm.PrimaryPhone,
        SecondaryPhone: "",
        TextNumber: "",
        Email: this.enrollmentForm.Email,
        Username: this.enrollmentForm.Username,
        Password: this.enrollmentForm.Password,
        LanguageCode: this.enrollmentForm.LanguageCode || "en",
        ApplicantAddress: {
          Street1: this.enrollmentForm.ApplicantAddress.Street1,
          Street2: this.enrollmentForm.ApplicantAddress.Street2,
          Street3: this.enrollmentForm.ApplicantAddress.Street3,
          City: this.enrollmentForm.ApplicantAddress.City,
          Region: this.enrollmentForm.ApplicantAddress.Region,
          PostalCode: this.enrollmentForm.ApplicantAddress.PostalCode,
          CountryCode: this.enrollmentForm.ApplicantAddress.CountryCode || "us",
        },
        ShippingAddress: {
          Street1: this.enrollmentForm.ApplicantAddress.Street1,
          Street2: this.enrollmentForm.ApplicantAddress.Street2,
          Street3: this.enrollmentForm.ApplicantAddress.Street3,
          City: this.enrollmentForm.ApplicantAddress.City,
          Region: this.enrollmentForm.ApplicantAddress.Region,
          PostalCode: this.enrollmentForm.ApplicantAddress.PostalCode,
          CountryCode: this.enrollmentForm.ApplicantAddress.CountryCode || "us",
        },
        AssociateTypeID: this.userService.customerTypeID,
        AssociateBaseType: this.userService.customerTypeID,
        SponsorID: this.userService.enrollerInfo.CustomerId,
        WebPageURL:
          this.userService.customerTypeID === 1
            ? this.enrollmentForm.Username
            : "",
        WebPageItemID: 0,
        SendEmails: this.enrollmentForm.SendEmails || false,
        AssociateCustom: null,
        PlacementOverrides: null,
        Order: {
          ShipMethodID: this.userService.selectedShippingMethod || 1,
          StoreID: this.shoppingCartService.getShoppingCart(-1)[0]?.StoreID,
          CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
          Items: productdetails,
          CouponCodes: this.userService.couponInfo.Allcoupons || [],
          Payments: [
            {
              SavePaymentMethodId: this.userService.paymentMethods[0].token,
              OnFileCard: "",
              CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
              MerchantId: this.userService.paymentMethods[0].MerchantId,
              SavePayment: true,
              OrderRewardPoints: null,
              OrderCreditCard: {
                CardToken: this.userService.paymentMethods[0].token,
                NameOnCard:
                  (this.userService.paymentMethods[0].billingInfo &&
                    this.userService.paymentMethods[0].billingInfo.fullName) ||
                  "",
                Last4: this.userService.paymentMethods[0].lastFour,
                CardType: this.userService.paymentMethods[0].CardType,
                ExpirationMonth:
                  this.userService.paymentMethods[0].expireMonth || 1,
                ExpirationYear: this.userService.paymentMethods[0].expireYear,
              },
              AuthorizationNumber: cvv,
            },
          ],
          RequireSuccess: true,
        },
      };
    }

    this.apiService
      .submitEnrollmentForm(this.submitApplicationRequest)
      .subscribe(
        (result: EnrollmentResponse) => {
          if (result.Message === "Success" && result.ErrorDescription == "") {
            localStorage.setItem(
              "SubmitApplication",
              JSON.stringify(result.Data)
            );
            sessionStorage.removeItem("statusVerified");
            this.userService.webOffice.UserName = this.enrollmentForm.Username;
            this.userService.webOffice.Password = this.enrollmentForm.Password;
            this.loginFunction(
              this.enrollmentForm.Username,
              this.enrollmentForm.Password
            );
            this.notificationService.success(
              "success",
              this.translate.instant("unifiedapplication_successfully_enrolled")
            );
            sessionStorage.removeItem("FormData");
          } else {
            this.notificationService.error("error_", result.Message);
            try {
              this.IsSubmitDisable = false;
              this.loadingDetails = false;
              document
                .getElementById("placeorder")
                .setAttribute("disabled", "");
              // Check for payment error
              const error = result.Message;
              if (error && error.length && !!~error.indexOf("Failed Payment")) {
                const cardNumberText = "Index:";
                if (error.indexOf(cardNumberText) > -1) {
                  const cardNumberIndex =
                    error.indexOf(cardNumberText) + cardNumberText.length;
                  const cardNumber =
                    Number(error.slice(cardNumberIndex, cardNumberIndex + 1)) +
                    1;
                  const cardAmountText = "Amount:";
                  const cardAmountIndex =
                    error.indexOf(cardAmountText) + cardAmountText.length;
                  const cardAmountEndIndex = error.indexOf(
                    " ",
                    cardAmountIndex
                  );
                  const cardAmount = error.slice(
                    cardAmountIndex,
                    cardAmountEndIndex
                  );
                  this.notificationService.error(
                    "error_",
                    this.translate.instant(
                      "unifiedapplication_enrollment_invalid_card",
                      {
                        cardNumber: cardNumber.toString(),
                        cardAmount: this.currencyFilter(cardAmount),
                      }
                    )
                  );
                } else {
                  this.notificationService.error("error_", result.Message);
                }
                return;
              }

              this.SubmitApplicationResponse = {};
              sessionStorage.removeItem("FormData");
              localStorage.removeItem("SubmitApplication");
              localStorage.setItem(
                "SubmitApplication",
                JSON.stringify(result.Data)
              );
              this.SubmitApplicationResponse = result.Data;
            } catch (ex) {
              console.warn("ex", ex);
              document
                .getElementById("placeorder")
                .setAttribute("disabled", "");
              this.notificationService.error(
                "error_",
                this.translate.instant(
                  "unifiedapplication_error_occured_try_again"
                )
              );
              this.IsSubmitDisable = false;
            }
          }
        },
        (err) => {
          document.getElementById("placeorder").setAttribute("disabled", "");
          this.IsSubmitDisable = false;
          this.loadingDetails = false;
          console.error(err);
          this.notificationService.error(
            "error_",
            this.translate.instant("unifiedapplication_error_occured_try_again")
          );
        }
      );
  }
  currencyFilter(amount) {
    return amount;
  }
  togglePanel() {
    this.userService.sponsorSectionPanel =
      !this.userService.sponsorSectionPanel;
  }
  verifyUsername(username: string) {
    if (username) {
      const blockword = ["test,abuse"];
      const isValidPost = this.validateKeyword.CheckValidation(
        blockword,
        this.userService.webOffice.UserName
      );
      if (isValidPost && !isValidPost.isvalid) {
        this.notificationService.error(
          "error_",
          this.translate.instant("username_not_available_")
        );
        const UserNameCheck = false;
        this.enrollmentForm.Username = "";
      } else {
        this.apiService.validateUsername(username).subscribe((result) => {
          try {
            if (result.Status == 1 && !result.Data) {
              this.notificationService.success(
                "success",
                this.translate.instant("username_available_")
              );
            } else {
              this.enrollmentForm.Username = "";
              this.notificationService.error(
                "error_",
                this.translate.instant("username_not_available_")
              );
            }
          } catch (ex) {
            this.notificationService.error(
              "error_",
              this.translate.instant("error_occured_try_again")
            );
          }
        });
      }
    }
  }

  verifyUserNameAndEmail(email: string) {
    if (email) {
      this.enrollmentForm.Email = email.replace(/\s/g, "");
      const filter = new RegExp(
        "^([\\w-\\.+]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([\\w-]+\\.)+))([a-zA-Z]{2,10}|[0-9]{1,3})(\\]?)$"
      );
      if (this.enrollmentForm.Email && filter.test(this.enrollmentForm.Email)) {
        this.apiService
          .validateEmailAddress({ EmailAddress: email })
          .subscribe((result) => {
            if (!result.Data) {
              this.userService.personalInfo.Email = email;
              this.notificationService.success("success", "email_available_");
            } else {
              this.notificationService.error("error_", "error_email_exists");
              this.enrollmentForm.Email = "";
            }
          });
      }
    }
  }

  public updatecountry(country, languagecode) {
    this.cart1Service.updateCountry(country, languagecode, false, false);
  }

  // Mailing Address

  getShippingTypes(statecall, isMailingAddress, zipCode?) {
    if (this.checkAddress()) {
      const filter = new RegExp(
        this.regexService.getRegex(
          this.configService.commonData.selectedCountry.toUpperCase()
        )
      );
      if (statecall || filter.test(zipCode)) {
        this.orderService.calculateOrderCall = true;
        this.userService.shippingAddress.Street1 =
          this.enrollmentForm.ApplicantAddress.Street1;
        this.userService.shippingAddress.Street2 =
          this.enrollmentForm.ApplicantAddress.Street2;
        this.userService.shippingAddress.City =
          this.enrollmentForm.ApplicantAddress.City;
        this.userService.shippingAddress.PostalCode =
          this.enrollmentForm.ApplicantAddress.PostalCode;
        this.userService.shippingAddress.Region =
          this.enrollmentForm.ApplicantAddress.Region;
        this.orderService.calculateOrder().then(() => {
          let shipM = "";
          _.each(this.userService.shippingMethods, (shipmethod) => {
            if (
              this.userService.selectedShippingMethod &&
              this.userService.selectedShippingMethod == shipmethod.ShipMethodID
            ) {
              shipM = shipmethod.ShipMethodID;
            }
          });
          if (shipM == "") {
            shipM =
              this.userService.shippingMethods &&
              (this.userService.shippingMethods[0].ShipMethodID ||
                this.userService.shippingMethods[0].ShipMethodId);
          }
          this.userService.selectedShippingMethod = Number(shipM);
        });
        if (this.itemsService.selectedAutoOrderItems.length > 0) {
          this.orderService.calculateAutoOrder();
        }
      }
    }
  }

  getStates() {
    this.apiService
      .getStates(this.country.CountryCode || "US")
      .subscribe((result) => {
        sessionStorage.setItem(
          JSON.stringify(this.country.CountryCode),
          JSON.stringify(result.Data)
        );
        if (result.Data && result.Data.length > 0) {
          this.StatesResponse = result.Data;
          this.enrollmentForm.ApplicantAddress.Region =
            result.Data[0].StateCode;
          this.userService.mailingAddress.StateName =
            this.userService.mailingAddress.StateName ||
            result.Data[0].StateName;
          if (!this.StateNameToggel) {
            this.getStateName(false);
            this.StateNameToggel = true;
          }
        }
      });
  }

  getStateName(isMailingAddress) {
    if (isMailingAddress) {
      this.userService.mailingAddress.StateName = _.filter(
        this.StatesResponse,
        (state: any) => {
          return (
            state.StateCode ===
            (this.userService.mailingAddress.State ||
              this.userService.defaultState)
          );
        }
      )[0]?.StateName;
      if (this.userService.paymentMethods.length > 0) {
        this.userService.paymentMethods = [];
        this.notificationService.warning(
          "warn_",
          "unifiedapplication_fill_payment_again_state"
        );
      }
    } else {
      this.userService.shippingAddress.Region = _.filter(
        this.StatesResponse,
        (state: any) => {
          return (
            state.StateCode ===
            (this.userService.shippingAddress.Region ||
              this.userService.defaultState)
          );
        }
      )[0]?.StateName;
    }
    // update this to shipping address when field available in UI and remove parse from session
    let country = sessionStorage.getItem("selectedCountry");
    this.enrollmentForm.ApplicantAddress.CountryCode = country;
    // this.paymentService.getPaymentType(this.enrollmentForm.ApplicantAddress?.CountryCode?.toLowerCase() == 'us' ? 'ut' : this.enrollmentForm.ApplicantAddress?.Region, this.enrollmentForm.ApplicantAddress?.CountryCode).then(() => {
    this.paymentService
      .getPaymentType(
        this.RegionIDForRequest,
        this.enrollmentForm.ApplicantAddress?.CountryCode
      )
      .then(() => {
        this.userService.paymentMethods = this.userService.paymentMethods || [];
        this.userService.couponInfo.promoCodeValid = undefined;
        this.paymentService.PaymentDataResponse =
          this.paymentService.PaymentDataResponse || {};
        // If they've already set up a split payment and try to add autoship items, only allow one payment method
        if (this.countPaymentMethods() > 1) {
          this.userService.paymentMethods = [
            this.userService.paymentMethods[0],
          ];
        }
      });

    this.getShippingTypes(false, isMailingAddress);
  }

  checkAddress() {
    if (this.enrollmentForm.ApplicantAddress.PostalCode) {
      return true;
    }
    return false;
  }

  getQuanity() {
    let quantity = 0;
    _.each(this.itemsService.selectedPacks, (item) => {
      quantity += item.Quantity ? parseInt(item.Quantity, 10) : 0;
    });

    _.each(this.itemsService.selectedOrderItems, (item) => {
      if (!item.UsePoints) {
        quantity += item.Quantity ? parseInt(item.Quantity, 10) : 0;
      }
      if (item.UsePoints) {
        quantity += item.rewardQuantity ? parseInt(item.rewardQuantity, 10) : 0;
      }
    });
    _.each(this.itemsService.selectedAutoOrderItems, (item) => {
      quantity += item.Quantity ? parseInt(item.Quantity, 10) : 0;
    });
    return quantity;
  }

  getOrderQuanity() {
    let quantity = 0;
    _.each(this.itemsService.selectedOrderItems, (item) => {
      if (!item.UsePoints) {
        quantity += item.Quantity ? parseInt(item.Quantity, 10) : 0;
      }
      if (item.UsePoints) {
        quantity += item.rewardQuantity ? parseInt(item.rewardQuantity, 10) : 0;
      }
    });
    return quantity;
  }

  getPacksQuanity() {
    let quantity = 0;
    _.each(this.itemsService.selectedPacks, (item) => {
      quantity += item.Quantity ? parseInt(item.Quantity, 10) : 0;
    });
    return quantity;
  }

  getAutoOrderQuanity() {
    let quantity = 0;
    _.each(this.itemsService.selectedAutoOrderItems, (item) => {
      quantity += item.Quantity ? parseInt(item.Quantity, 10) : 0;
    });
    return quantity;
  }

  getItems(type: string) {
    return this.itemsService[
      type == "pack"
        ? "selectedPacks"
        : type == "autoship"
        ? "selectedAutoOrderItems"
        : "selectedOrderItems"
    ];
  }

  getImage(item) {
    return (
      (item.OptionsImage &&
        item.ImageUrl.substr(0, item.ImageUrl.lastIndexOf("/")).concat(
          item.OptionsImage
        )) ||
      item.ImageUrl
    );
  }

  increaseQuantiy(type, item) {
    this.cart1Service.increaseQuantiy(item, type == "autoship", type == "pack");
  }

  decreaseQuantiy(type, item) {
    if (
      this.getQuantityModel(type, item)[item.ItemID] == 1 &&
      this.userService.customerTypeID === 1
    ) {
      this.notificationService.error(
        "error_",
        this.translate.instant("unifiedapplication_cannot_delete_item")
      );
    } else {
      this.cart1Service.decreaseQuantiy(
        item,
        type == "autoship",
        type == "pack"
      );
    }
  }

  removeFromCart(type, item) {
    item.Quantity = 0;
    this.cart1Service.removeFromCart(
      item,
      type == "autoship",
      type == "pack",
      true
    );
  }

  getQuantityModel(type, item): any {
    return this.cart1Service[
      type == "pack"
        ? "packQuantity"
        : type == "autoship"
        ? "autoshipQuantity"
        : item && item.UsePoints
        ? "orderRewardQuantity"
        : "orderQuantity"
    ];
  }

  checkQuantity(type, item) {
    const quantity = this.getQuantityModel(type, item)[item.ItemID];
    if (!Number(quantity)) {
      this.cart1Service.removeFromCart(
        item,
        type == "autoship",
        type == "pack",
        true
      );
    } else {
      item.Quantity = quantity;
      if (type == "autoship") {
        localStorage.setItem(
          "cart.autoship",
          JSON.stringify(this.itemsService.selectedAutoOrderItems)
        );
        this.orderService.calculateAutoOrder();
      } else {
        localStorage.setItem(
          type == "pack" ? "cart.packs" : "cart.order",
          JSON.stringify(
            type == "pack"
              ? this.itemsService.selectedPacks
              : this.itemsService.selectedOrderItems
          )
        );
        this.orderService.calculateOrder();
      }
    }
  }

  getLastQuantity(type, item) {
    this.lastQuantity = this.getQuantityModel(type, item)[item.ItemID];
  }

  getCvv(result) {
    if (result) {
      this.submitApplication(result);
    }
  }

  checkPayment() {
    if (this.userService.paymentMethods.length > 0) {
      if (
        this.userService.paymentMethods[0].Last4 ||
        this.userService.paymentMethods[0].Last4 === undefined
      ) {
        return true;
      } else {
        this.notificationService.error(
          "error_",
          this.translate.instant("unifiedapplication_add_payment_error")
        );
        return false;
      }
    } else {
      this.notificationService.error(
        "error_",
        this.translate.instant("unifiedapplication_add_payment_error")
      );
      return false;
    }
  }

  // Payment Section
  addSavePayment(paymentData) {
    if (this.enrollmentForm.ApplicantAddress.Region) {
      if (
        !this.utilityService.isEmptyObject(
          this.paymentService.SelectedPaymentTypes
        ) &&
        this.paymentService.SelectedPaymentTypes.MerchantId !==
          paymentData.MerchantId
      ) {
        this.userService.paymentMethods = [];
      }
      this.paymentService.SelectedPaymentTypes = paymentData;
      this.paymentService.selectedPaymentTypeName =
        this.paymentService.SelectedPaymentTypes.DisplayName;
      if (this.paymentService.SelectedPaymentTypes.CanSavePayments) {
        this.paymentService.OldSelectedPaymentType =
          this.paymentService.SelectedPaymentTypes;
        this.paymentService.getPaymentData(paymentData, undefined, true);
      } else {
        this.paymentService.oldSelectedPaymentTypeName =
          this.paymentService.selectedPaymentTypeName;
        this.userService.paymentMethods = [];
        const selectpay = {
          CardType:
            this.paymentService.SelectedPaymentTypes.CardType ||
            this.paymentService.SelectedPaymentTypes.Name,
          Last4: this.paymentService.SelectedPaymentTypes.Ending,
          ExpireMonth: this.paymentService.SelectedPaymentTypes.Expires
            ? moment(this.paymentService.SelectedPaymentTypes.Expires).format(
                "M"
              )
            : 0,
          ExpireYear: this.paymentService.SelectedPaymentTypes.Expires
            ? moment(this.paymentService.SelectedPaymentTypes.Expires).format(
                "YYYY"
              )
            : 0,
          Token: this.paymentService.SelectedPaymentTypes.PaymentMethodId
            ? this.paymentService.SelectedPaymentTypes.PaymentMethodId
            : "",
          MerchantId: this.paymentService.SelectedPaymentTypes.MerchantId,
        };
        this.userService.paymentMethods.push(selectpay);
        this.userService.isPaymentChanged = true;
      }
      localStorage.setItem("userService", JSON.stringify(this.userService));
    } else {
      this.notificationService.error("error_", "please_enter_your_address");
    }
  }

  checkCvvModal() {
    if (!this.checkPayment()) {
      return;
    }
    if (
      this.userService.paymentMethods[0].MerchantId != "13" &&
      this.configService.localSettings.Global.AllowCVVModel
    ) {
      const dialogdata = this.dialog.open(AllowCvvComponent, {
        disableClose: true,
        panelClass: "allowCvvModel-dialog",
        autoFocus: false,
      });
      dialogdata.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this.getCvv(dialogResult);
        }
      });
    } else {
      this.submitApplication();
    }
  }

  validatePromoCode() {
    if (this.userService.couponInfo.promoCode) {
      if (this.userService.couponInfo.availableRewards.length) {
        _.each(
          this.userService.couponInfo.availableRewards,
          (awailablereward) => {
            if (
              awailablereward.Code.toLowerCase() ==
              this.userService.couponInfo.promoCode.toLowerCase()
            ) {
              this.userService.couponInfo.RewardsForUse.push(awailablereward);
            }
          }
        );
      }
    }
    this.userService.couponInfo.IsAppliedcode = true;
    this.orderService.calculateOrder().then((result) => {
      if (result && this.userService.couponInfo.promoCode) {
        _.each(
          this.orderService.calculateOrderResponse.CouponResults,
          (item) => {
            const isInCart = this.userService.couponInfo.Allcoupons.some(
              (code) => {
                if (code.toLowerCase() == item.Code.toLowerCase()) {
                  return true;
                }
                return false;
              }
            );

            if (item.IsValid) {
              if (!isInCart) {
                this.userService.couponInfo.Allcoupons.push(item.Code);
              }
              if (this.userService.couponInfo.promoCode == item.Code) {
                this.notificationService.success(
                  "success",
                  "coupon_added_success"
                );
              }
              this.userService.couponInfo.promoCodeValid = true;
              this.userService.couponInfo.promoCode = "";
            } else {
              this.userService.couponInfo.promoCodeValid = false;
              this.userService.couponInfo.IsAppliedcode = false;
              this.userService.couponInfo.promoCode = "";
              if (isInCart && this.itemsService.selectedOrderItems.length) {
                this.userService.couponInfo.Allcoupons =
                  this.userService.couponInfo.Allcoupons.filter((code) => {
                    return code.toLowerCase() != item.Code.toLowerCase();
                  });
                this.userService.couponInfo.RewardsForUse =
                  this.userService.couponInfo.RewardsForUse.filter((e) => {
                    return e.Code.toLowerCase() != item.Code.toLowerCase();
                  });
              }
            }
          }
        );
      }
    });
  }

  isCouponCode(Coupon) {
    const NewCustomerPromo =
      "NewCustomerPromo_" + this.userService.customerData.BackOfficeId;
    if (
      Coupon &&
      (Coupon.Code === NewCustomerPromo ||
        Coupon.Code === this.userService.DynamicCouponCode.promoCode)
    ) {
      return false;
    } else {
      return true;
    }
  }

  removePromo(code) {
    this.userService.couponInfo.RewardsForUse = _.reject(
      this.userService.couponInfo.RewardsForUse,
      (e) => {
        return e.Code.toLowerCase() == code.toLowerCase();
      }
    );
    this.userService.couponInfo.promoCode = "";
    this.userService.couponInfo.promoCodeValid = true;
    this.userService.couponInfo.IsAppliedcode = false;
    this.userService.couponInfo.Allcoupons = _.without(
      this.userService.couponInfo.Allcoupons,
      code
    );
    this.orderService.calculateOrder();
  }

  loginFunction(userName, pass) {
    this.loadingDetails = true;
    const loginrequest = {
      granttype: "password",
      scope: "office",
      username: userName,
      password: pass,
    };
    this.apiService.Login(loginrequest).subscribe(
      (result) => {
        if (result && result.status == 200 && result.body.Status != 1) {
          const res: any = result.body;
          try {
            localStorage.setItem("isLoggedIn", "true");
            this.accountService
              .getCustomerData(res.CustomerId)
              .then((data: any) => {
                if (data && data.Data) {
                  localStorage.setItem("user", JSON.stringify(data.Data));
                  this.userService.customerData = data.Data;

                  this.userService.customerTypeID =
                    this.userService.customerData.CustomerType;
                  this.userService.customerData.shippingAddress = {};
                  if (
                    this.userService.customerData.DefaultShippingAddress &&
                    !this.utilityService.isEmptyObject(
                      this.userService.customerData.DefaultShippingAddress
                    )
                  ) {
                    this.user.setShippingAddress();
                  } else {
                    this.userService.shippingAddress = null;
                  }
                  this.userService.customerTypeID =
                    this.userService.customerData.CustomerType;
                  if (this.userService.customerData.WebAlias) {
                    this.apiService
                      .validateWebAlias(this.userService.customerData.WebAlias)
                      .subscribe(
                        (res: any) => {
                          if (res.Data) {
                            this.userService.WebAlias =
                              this.userService.customerData.WebAlias;
                            this.router.navigate(["/complete"]);
                            this.userService.paymentMethods = [];
                          }
                        },
                        (error) => {
                          if (error.Data && !error.Data.WebAlias) {
                            this.notificationService.error(
                              "error_",
                              "webalias_not_exists"
                            );
                            return false;
                          }
                        }
                      );
                  } else if (
                    this.userService.customerData.SponsorId ||
                    this.userService.customerData.EnrollerId
                  ) {
                    this.apiService
                      .getSearchCustomerDetail(
                        this.userService.customerData.SponsorId ||
                          this.userService.customerData.EnrollerId
                      )
                      .subscribe(
                        (resp: any) => {
                          if (resp.Data) {
                            this.apiService
                              .validateWebAlias(resp.Data.WebAlias)
                              .subscribe(
                                (res: any) => {
                                  if (res.Data) {
                                    this.userService.WebAlias =
                                      resp.Data.WebAlias;
                                    this.router.navigate(["/complete"]);
                                    this.userService.paymentMethods = [];
                                  }
                                },
                                (error) => {
                                  if (error.Data && !error.Data) {
                                    this.notificationService.error(
                                      "error_",
                                      "webalias_not_exists"
                                    );
                                    return false;
                                  }
                                }
                              );
                          }
                        },
                        (error) => {
                          if (error.Data && !error.Data.WebAlias) {
                            this.notificationService.error(
                              "error_",
                              "webalias_not_exists"
                            );
                            return false;
                          }
                        }
                      );
                  }
                } else {
                  this.router.navigate(["/complete"]);
                  this.userService.paymentMethods = [];
                }
              });
          } catch (successEx) {
            this.notificationService.error("error_", "error_occured_try_again");
            console.error("ex", successEx);
          }
        } else {
          this.notificationService.error("error_", "Authentication Failed");
        }
      },
      (err) => {
        this.notificationService.error("error_", "error_occured_try_again");
      }
    );
  }

  setFrequency() {
    this.commonData.FrequencyTypes.some((freq) => {
      if (
        freq.ID == this.persistentService.retailData.Autoship.FrequencyTypeID
      ) {
        this.persistentService.retailData.Autoship.FrequencyTypeID = freq.ID;
        this.persistentService.retailData.Autoship.FrequencyTypeID = freq.ID;
        this.persistentService.retailData.Autoship.FrequencyTypeDescription =
          freq.Description;
        this.persistentService.retailData.isChanged = true;
        return;
      }
    });
  }
  frequencyDescription(id) {
    let Description: string;
    this.commonData.FrequencyTypes.forEach((element) => {
      if (element.ID == id) {
        Description = element.Description;
      }
    });
    return Description;
  }
  ngOnDestroy() {
    this.utilityService.isShowSimplifiedheader = false;
    sessionStorage.setItem("IsLegacyUnifiedEnrollment", null);
  }
}
