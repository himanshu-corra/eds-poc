import { render as provider } from '@dropins/storefront-cart/render.js';
import MiniCart from '@dropins/storefront-cart/containers/MiniCart.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { bridgeApi } from '../../scripts/bridge/api.js';
import { getConfigValue } from '../../scripts/configs.js';

export default async function decorate(block) {
  const {
    'start-shopping-url': startShoppingURL = '',
    'cart-url': cartURL = '',
    // 'checkout-url': checkoutURL = '',
  } = readBlockConfig(block);

  block.innerHTML = '';
  const baseUrl = await getConfigValue('commerce-store-url');
  return provider.render(MiniCart, {
    routeEmptyCartCTA: startShoppingURL ? () => startShoppingURL : undefined,
    routeCart: cartURL ? () => cartURL : undefined,
    routeCheckout: () => bridgeApi.getRedirectUrl('checkout', baseUrl),
    routeProduct: (product) => `/products/${product.url.urlKey}/${product.sku}`,
  })(block);
}
