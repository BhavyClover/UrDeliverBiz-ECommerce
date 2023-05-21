export const environment = {
  production: true,
  apiUrl: location.host.match(/.*zenyge\.com/) ? 'https://retailapi.zenyge.com' : 'https://udbapi.ziplingo.com/',
  productUrl: location.host.match(/.*zenyge\.com/) ? 'https://retailapi.zenyge.com' : 'https://udbapi.ziplingo.com/',
  imageUrl: 'https://udb.corpadmin.directscalestage.com/CMS/Images/Inventory',
  siteImageUrl: location.origin
};
