import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Product1233 } from 'src/app/modals/product.model';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.sass']
})
export class ErrorPageComponent implements OnInit {

  constructor(private titleService: Title, public translate: TranslateService) { }

  ngOnInit() {
    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle(this.translate.instant('pagetitle_404') + ' | ' + text);
    });
    this.filterdata();
  }
  filterdata() {
    const json: Product1233[] = ([{
      Id: 340,
      Sku: '30FCD',
      KitLevel: 0,
      Category: {
        Id: 14,
        Name: 'Energy',
        Description: '',
        DisplayIndex: 2,
        ImageUrl: null,
        ParentId: 0,
        ProductLineId: 1,
        ShortDescription: '',
        StoreIds: [
          1,
          2,
          3,
          4,
          5
        ],
        HasChildren: false
      },
      ChargeShipping: true,
      Disabled: false,
      Height: 0,
      Image: '/focus_30_nobackground.png',
      Length: 0,
      LengthUnitOfMeasure: 'cm',
      ManufacturerPartNum: '',
      OutOfStockStatus: 1,
      PackCount: 0,
      PackageGroupId: 1,
      PreferedVendorId: 0,
      SortOrder: 8,
      TaxClassId: 18,
      ProductClass: 1,
      TrackStock: true,
      UnitOfMeasure: '',
      Upc: '',
      Weight: 12,
      WeightUnitOfMeasure: 'oz',
      Width: 0,
      FlagCancer: false,
      FlagBirthDefects: false,
      HasKitGroups: false,
      HsCode: '',
      Custom: {
        ItemId: 0,
        Field1: '',
        Field2: '',
        Field3: '',
        Field4: '',
        Field5: ''
      },
      FastStart: {
        Gen1: 0,
        Gen2: 0,
        Gen3: 0,
        Gen4: 0,
        Gen5: 0,
        Gen6: 0,
        Gen7: 0,
        Gen8: 0,
        Gen9: 0,
        Gen10: 0
      },
      Images: [
        {
          Description: '/Focus_Single_Serve-Web-Top.png',
          Path: '/Focus_Single_Serve-Web-Top.png'
        },
        {
          Description: '/Focus-Stick_Pack-Front.png',
          Path: '/Focus-Stick_Pack-Front.png'
        },
        {
          Description: '/Focus-Stick_Pack-Back2.png',
          Path: '/Focus-Stick_Pack-Back2.png'
        }
      ],
      Languages: [
        {
          Description: `<p><strong>Energy* / Clarity* / Memory*</strong></p>\n<p><strong>Focus is a proprietary, nootropic blend made with clean, natural energy sources to help you achieve a zen-like state of concentration.&nbsp;</strong><strong>Incorporate Focus into your daily routine to help battle distractions and stay on top of your game all day long.&nbsp;</strong></p>\n<ul>\n<li>ALPHASIZE&reg; - Helps maintain and improve memory, concentration, focus &amp; helps to increase peak force &amp; power output, strength &amp; agility*</li>\n<li>Beet Root Powder - Promotes improved natural energy and stamina*</li>\n<li>Natural Green Tea Extract + L-Theanine - Combination promotes heightened focus, awareness, energy and mental endurance*</li>\n<li>L-Tyrosine - Supports learning, memory, and alertness*</li>\n<li>Naturally flavored, no added sugars - Dragon Fruit</li>\n<li>Informed-Sport &amp; Informed-Choice Certified**</li>\n</ul>`,
          LanguageCode: 'en',
          ProductName: 'Focus Single Serves (30)',
          SeoKeywords: '',
          Specifications: `<p dir=\'ltr\'><strong>Directions:<br /></strong>1 stick pack + 8 oz of water</p>\n<p dir=\'ltr\'>Non-GMO - Dairy Free - Preservative Free - No Gluten, Wheat, Yeast, or Diary - No Added Preservatives or Colors - Vegan &amp; Vegetarian friendly</p>\n<p dir=\'ltr\'>**This product has been tested by Informed-Choice &amp; Informed-Sport. Informed-Choice &amp; Informed-Sport are&nbsp; quality assurance programs for sports nutrition products which certifies that a supplement or product has been \'skip-lot\' tested (tested at least on a monthly basis) for banned substances by LGC's world class sports anti-doping lab. Verify your product:&nbsp;<a href=\'https://informed-choice.org\' target=\'_blank\' rel=\'noopener\'>click here</a>&nbsp;to search your lot numberto confirm certification.</p>\n<p dir=\'ltr\'>*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure or prevent any disease.</p>`
        }
      ],
      Options: [],
      OptionsMap: [],
      Discounts: [
        {
          Id: 32184,
          Bonus: 7.4,
          End: null,
          Price: 66.5,
          PriceCurrency: 'USD',
          Cv: 37,
          Qv: 37,
          RewardPointsEarned: 0,
          Start: null,
          Type: 1,
          Stores: [
            3,
            5
          ],
          OrderType: [
            1,
            2
          ],
          PriceGroups: [
            2,
            7
          ],
          Regions: [
            4,
            1
          ]
        },
        {
          Id: 32185,
          Bonus: null,
          End: null,
          Price: 49.95,
          PriceCurrency: 'USD',
          Cv: 37,
          Qv: 37,
          RewardPointsEarned: 0,
          Start: null,
          Type: 1,
          Stores: [
            1,
            2,
            5
          ],
          OrderType: [
            1,
            2
          ],
          PriceGroups: [
            1,
            3,
            4,
            5,
            6
          ],
          Regions: [
            1
          ]
        },
        {
          Id: 32186,
          Bonus: null,
          End: null,
          Price: 50,
          PriceCurrency: 'RWD',
          Cv: 0,
          Qv: null,
          RewardPointsEarned: 0,
          Start: null,
          Type: 1,
          Stores: [
            1,
            2
          ],
          OrderType: [
            1
          ],
          PriceGroups: [
            1,
            3,
            4,
            5,
            6
          ],
          Regions: [
            1
          ]
        }
      ]
    }]);
    try {
      json.filter((poiDataArray: Product1233) => {
        return poiDataArray.Discounts.some((discount) => {
          return discount.Regions.indexOf(1) > -1 && discount.PriceCurrency === 'USD' && discount.PriceGroups.indexOf(2) > -1 && discount.Stores.indexOf(3) > -1;
        });
      });
    } catch (e) {
    }
  }
}
