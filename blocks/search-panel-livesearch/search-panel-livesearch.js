import { loadScript } from '../../scripts/aem.js';
import { getConfigValue } from '../../scripts/configs.js';

export default async function decorate(block) {
  const searchForm = document.createRange().createContextualFragment(`
  <div>
    <form action="/search" method="GET">
      <input id="search" type="search" name="q" placeholder="Search" />
      <div id="search_autocomplete" class="search-autocomplete"></div>
    </form>
  </div>
`);
  block.replaceWith(searchForm);

  const widgetProd = '/scripts/widgets/LiveSearchAutocomplete.js';
  await loadScript(widgetProd);

  const storeDetails = {
    environmentId: await getConfigValue('commerce-environment-id'),
    environmentType: (await getConfigValue('commerce-endpoint')).includes('sandbox') ? 'testing' : '',
    apiKey: await getConfigValue('commerce-x-api-key'),
    websiteCode: await getConfigValue('commerce-website-code'),
    storeCode: await getConfigValue('commerce-store-code'),
    storeViewCode: await getConfigValue('commerce-store-view-code'),
    config: {
      pageSize: 8,
      perPageConfig: {
        pageSizeOptions: '12,24,36',
        defaultPageSizeOption: '24',
      },
      minQueryLength: '2',
      currencySymbol: '$',
      currencyRate: '1',
      displayOutOfStock: true,
      allowAllProducts: false,
    },
    context: {
      customerGroup: await getConfigValue('commerce-customer-group'),
    },
    route: ({ sku, urlKey }) => `/products/${urlKey}/${sku}`,
    searchRoute: {
      route: '/search',
      query: 'q',
    },
  };

  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (window.LiveSearchAutocomplete) {
        clearInterval(interval);
        resolve();
      }
    }, 200);
  });

  // eslint-disable-next-line no-new
  new window.LiveSearchAutocomplete(storeDetails);

  // Focus on the search input field on search load
  const searchInput = block.querySelector('input');
  searchInput.focus();
}
