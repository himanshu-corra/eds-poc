import {
  InLineAlert,
  Icon,
  provider as UI,
} from '@dropins/tools/components.js';

export default async function Actions(ctx, _block, { alertWrapper }) {
  //  TODO: check how this can be utilized on the parent function
  let inlineAlert;
  // Add to Cart Button
  ctx.appendButton((next, state) => {
    const adding = state.get('adding');
    return {
      text: adding
        ? next.dictionary.Custom.AddingToCart?.label
        : next.dictionary.PDP.Product.AddToCart?.label,
      icon: 'Cart',
      variant: 'primary',
      disabled: adding || !next.data?.inStock || !next.valid,
      onClick: async () => {
        try {
          state.set('adding', true);
          const { addProductsToCart } = await import('@dropins/storefront-cart/api.js');
          await addProductsToCart([{ ...next.values }]);
          // reset any previous alerts if successful
          inlineAlert?.remove();
        } catch (error) {
          // add alert message
          inlineAlert = await UI.render(InLineAlert, {
            heading: 'Error',
            description: error.message,
            icon: Icon({ source: 'Warning' }),
            'aria-live': 'assertive',
            role: 'alert',
            onDismiss: () => {
              inlineAlert.remove();
            },
          })(alertWrapper);
          // Scroll the alertWrapper into view
          alertWrapper.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        } finally {
          state.set('adding', false);
        }
      },
    };
  });

  ctx.appendButton((next, state) => {
    const adding = state.get('adding');
    return ({
      disabled: adding,
      icon: 'Heart',
      variant: 'secondary',
      ariaLabel: next.dictionary.Custom.AddToWishlist?.label,
      onClick: async () => {
        try {
          state.set('adding', true);
          const { addToWishlist } = await import('../../../scripts/wishlist/api.js');
          await addToWishlist(next.values.sku);
        } finally {
          state.set('adding', false);
        }
      },
    });
  });
}
