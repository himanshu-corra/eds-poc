import { render as provider } from '@dropins/storefront-cart/render.js';
import OrderSummary from '@dropins/storefront-cart/containers/OrderSummary.js';
import EstimateShipping from '@dropins/storefront-cart/containers/EstimateShipping.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { bridgeApi } from '../../scripts/bridge/api.js';
import { getConfigValue } from '../../scripts/configs.js';

export default async function decorate(block) {
  const {
    // 'checkout-url': checkoutURL = '',
    'enable-estimate-shipping': enableEstimateShipping = 'false',
  } = readBlockConfig(block);

  block.innerHTML = '';

  const baseUrl = await getConfigValue('commerce-store-url');
  return provider.render(OrderSummary, {
    routeProduct: (product) => `/products/${product.url.urlKey}/${product.sku}`,
    routeCheckout: () => bridgeApi.getRedirectUrl('checkout', baseUrl),
    slots: {
      EstimateShipping: async (ctx) => {
        if (enableEstimateShipping === 'true') {
          const wrapper = document.createElement('div');
          await provider.render(EstimateShipping, {})(wrapper);
          ctx.replaceWith(wrapper);
        }
      },
    },
  })(block);
}
