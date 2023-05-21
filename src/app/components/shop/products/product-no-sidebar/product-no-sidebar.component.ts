import { Component, OnInit } from "@angular/core";
import { ProductService } from "src/app/components/shared/services/product.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ColorFilter } from "src/app/modals/product.model";
import { FormGroup } from "@angular/forms";
import { ConfigService } from "src/app/components/shared/services/config.service";
import { DSProduct } from "src/app/modals/dsproduct.modal";
import { UtilityService } from "src/app/components/shared/services/utility.service";
import { TranslateService } from "@ngx-translate/core";
import { Title } from "@angular/platform-browser";
import * as _ from "lodash";
import { ItemsListService } from "src/app/components/shared/services/itemsList.service";
import { CompanyService } from "src/app/components/shared/services/company.service";
import { Cart1Service } from "src/app/components/shared/services/cart1.service";
import { environment } from "src/environments/environment";
import { LoaderService } from "src/app/components/shared/services/loader.service";

@Component({
  selector: "app-product-no-sidebar",
  templateUrl: "./product-no-sidebar.component.html",
  styleUrls: ["./product-no-sidebar.component.scss"],
  animations: [],
})
export class ProductNoSidebarComponent implements OnInit {
  env: any;
  searchFormGroup: FormGroup;
  categoryTypeGroup: FormGroup;
  sortByFormGroup: FormGroup;
  productSearchText: string = "";
  public sidenavOpen: boolean = true;
  public animation: any; // Animation
  public sortByOrder: any; // sorting
  public page: any;
  public tagsFilters: any[] = [];
  public viewType: string = "grid";
  public viewCol: number = 34;
  public filterForm: FormGroup;
  public colorFilters: ColorFilter[] = [];
  public searchProduct: any;
  public items: Array<DSProduct> = [];
  public products: Array<DSProduct> = [];
  public allItems: { Category: any; CategoryId: any }[] = [];
  public featuredCollection: Array<DSProduct> = [];
  public tags: any[] = [];
  public colors: any[] = [];
  customCssCheckBox: any;
  Checkedall: boolean = false;
  Checkedmagnetic: boolean = false;
  CheckedwhatsHot: boolean = false;
  Checkedenrollment: boolean = false;
  Checkedlips: boolean = false;
  Checkedeyes: boolean = false;
  slides: Array<any> = [];
  sortKeys: Array<any> = [];
  selectedCategory: any = { Category: "all", CategoryId: -1 };
  isAllunselect: boolean;
  regularDistribution = 100 / 3 + "%";
  RegionIDForRequest: number;
  public OrderQuantityCount: any;
  showNoProductsError: boolean = false;
  showIsLoading: boolean = true;
  constructor(
    private translate: TranslateService,
    private titleService: Title,
    private productService: ProductService,
    private route: ActivatedRoute,
    public configService: ConfigService,
    public utilityService: UtilityService,
    public itemsListService: ItemsListService,
    public companyService: CompanyService,
    public cart1Service: Cart1Service,
    public router: Router,
    private loader: LoaderService
  ) {
    // new functionality
    this.configService
      .getCommonSetting(
        sessionStorage.getItem("selectedCountry"),
        sessionStorage.getItem("SelectedLanguage")
      )
      .then(() => {
        this.RegionIDForRequest = this.companyService.getRegionID(
          sessionStorage.getItem("selectedCountry")
        );
        if (sessionStorage.getItem("CommonSettings")) {
          this.RegionIDForRequest = this.companyService.getRegionID(
            this.configService.commonData.selectedCountry
          );

          // either call function this.getAllProductItems(this.RegionIDForRequest); but in this base code case we are using routing params for getting products so below is that functionality

          this.route.params.subscribe((params: Params) => {
            this.selectedCategory = { CategoryId: params["category"] || "all" };
            this.productService
              .getProductByCategory(this.selectedCategory.CategoryId)
              .subscribe((products) => {
                this.productService.orders = products.map((item) => {
                  item.Price =
                    item.Price ||
                    (item.Prices && item.Prices[0] && item.Prices[0].Price);
                  return item;
                });

                const uniqueItems = _.uniqBy(products, (x) => x.CategoryId);
                let uniqueRequireProduct = [];
                if (
                  this.configService.localSettings.Global.CategoriesToFetch
                    ?.length > 0
                ) {
                  uniqueItems.filter((x) => {
                    if (
                      this.configService.localSettings.Global.CategoriesToFetch.indexOf(
                        x.Category
                      ) > -1
                    ) {
                      uniqueRequireProduct.push(x);
                    }
                  });
                } else {
                  uniqueRequireProduct = [...uniqueItems];
                }

                this.itemsListService.selectedCategories = {};
                if (this.selectedCategory.CategoryId == "all") {
                  this.itemsListService.selectedCategories["all"] = true;
                }
                this.itemsListService.categoryList = _.map(
                  uniqueRequireProduct,
                  (object) => {
                    return _.pick(object, ["CategoryId", "Category"]);
                  }
                );

                this.products = [];
                const product = (this.itemsListService.products =
                  this.productService.orders);
                if (
                  this.configService.localSettings.Global.CategoriesToFetch
                    ?.length > 0
                ) {
                  product.filter((x) => {
                    if (
                      this.configService.localSettings.Global.CategoriesToFetch.indexOf(
                        x.Category
                      ) > -1
                    ) {
                      this.products.push(x);
                    }
                  });
                } else {
                  this.products = [...product];
                }
                this.itemsListService.products = this.products;
                this.itemsListService.type = "order";
                let category;
                this.itemsListService.categoryList.filter((x) => {
                  if (x.CategoryId == this.selectedCategory.CategoryId) {
                    category = x.Category;
                  }
                });
                if (this.selectedCategory.CategoryId == "all") {
                  this.itemsListService.getItemsByCategory("all");
                } else {
                  this.itemsListService.getItemsByCategory(category);
                }
              });
            this.slides =
              this.configService.localSettings.Product.PrimaryBanner;
          });
          this.sortKeys = utilityService.getSortKey();
          this.env = environment;
        } else {
          // can use else for commonsetting not found in storage
        }
      });

    // somtimes common setting loaded in time then items are called otherwise no items called

    this.sortByOrder = this.utilityService.getSortKey()[6];
    this.translate.get("global_Company_Title").subscribe((text: string) => {
      this.titleService.setTitle(
        this.translate.instant("pagetitle_product") + " | " + text
      );
    });

    this.loader.isLoading.subscribe((v) => {
      this.showIsLoading = v;
      if (v == false) {
        this.showNoProductsError = true;
      }
    });
  }

  ngOnInit() {
    this.sortByOrder = this.utilityService.getSortKey()[0];
    this.translate.get("global_Company_Title").subscribe((text: string) => {
      this.titleService.setTitle(
        this.translate.instant("pagetitle_product") + " | " + text
      );
    });
  }

  // can use this function in case of calling from oninit or constructor
  getAllProductItems(RegionID?) {
    this.selectedCategory = { CategoryId: "all" };
    const request = {
      RegionID: RegionID || 1,
      CategoryId: "all",
    };
    // main request for api calling
    this.productService.getProductByCategory(request).subscribe((products) => {
      this.productService.orders = products.map((item) => {
        item.Price =
          item.Price || (item.Prices && item.Prices[0] && item.Prices[0].Price);
        return item;
      });

      // filling unique products according to category
      const uniqueRequireProduct = ([] = _.uniqBy(
        products,
        (x) => x.CategoryId
      ));

      // selected category data filling
      this.itemsListService.selectedCategories = {};
      if (this.selectedCategory.CategoryId == "all") {
        this.itemsListService.selectedCategories["all"] = true;
      }
      // itemlistservice categorylist data filling
      this.itemsListService.categoryList = _.map(
        uniqueRequireProduct,
        (object) => _.pick(object, ["CategoryId", "Category"])
      );

      // empty product array
      this.products = [];

      const product = (this.itemsListService.products =
        this.productService.orders);

      product.filter((x) => {
        if (x.Category) {
          this.products.push(x);
        }
      });
      // filling products here in the html use to display products
      this.itemsListService.products = this.products;
      this.itemsListService.type = "order";

      // displaying according to category
      let category;
      this.itemsListService.categoryList.filter((x) => {
        if (x.CategoryId == this.selectedCategory.CategoryId) {
          category = x.Category;
        }
      });
      if (this.selectedCategory.CategoryId == "all") {
        this.itemsListService.getItemsByCategory("all");
      } else {
        this.itemsListService.getItemsByCategory(category);
      }
    });
    this.slides = this.configService.localSettings.Product.PrimaryBanner;
    this.sortKeys = this.utilityService.getSortKey();
    this.env = environment;
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.id === o2.id;
  }

  // sorting type ASC / DESC / A-Z / Z-A etc.
  onChangeSorting($event) {
    this.sortByOrder = $event.value;
  }

  public onPageChanged(event) {
    this.page = event;
    window.scrollTo(0, 0);
  }

  onChange(selectedCategories, id) {
    let result = true;
    for (const i in selectedCategories) {
      if (selectedCategories[i] === false) {
        if (i !== "all") {
          result = false;
          break;
        }
      } else {
        result = true;
      }
    }

    if (result) {
      this.itemsListService.selectedCategories["all"] = true;
    } else {
      this.isAllunselect = true;
      for (const k in selectedCategories) {
        if (selectedCategories[k] === true) {
          this.isAllunselect = false;
          break;
        }
      }
      if (this.isAllunselect) {
        this.itemsListService.selectedCategories["all"] = false;
        this.itemsListService.selectedCategories[id] = true;
      } else {
        this.itemsListService.selectedCategories["all"] = false;
      }
    }
    if (!this.isAllunselect) {
      this.itemsListService.getItemsByCategory(selectedCategories);
    }
  }

  mouseEnter(index) {
    if (screen.width > 960) {
      document.getElementById("btn" + index).classList.add("faded-in");
      document.getElementById("btn" + index).classList.remove("faded-out");
      setTimeout(() => {
        document.getElementById("btn" + index).style.opacity = "1";
      }, 590);
    }
  }
  mouseOut(index) {
    if (screen.width > 960) {
      document.getElementById("btn" + index).classList.add("faded-out");
      document.getElementById("btn" + index).classList.remove("faded-in");
    }
  }

  handleProduct(item) {
    if (item.ItemOptions.length > 0) {
      this.router.navigate(["/product", item.ItemID]);
    } else {
      this.OrderQuantityCount = item && item.Quantity ? item.Quantity : 1;
      if (this.cart1Service["orderQuantity"][item.ItemID] >= 1) {
        this.increaseQuantiy("order", item);
      } else {
        this.cart1Service["orderQuantity"][item.ItemID] =
          this.OrderQuantityCount;
        this.cart1Service.addToCart(
          item,
          true,
          item.ItemID,
          false,
          false,
          false,
          true
        );
      }
    }
  }
  increaseQuantiy(type, item) {
    this.cart1Service.increaseQuantiy(item, type == "autoship", type == "pack");
  }

  goToShop(id) {
    this.router.navigate(["/product", id]);
  }
}
