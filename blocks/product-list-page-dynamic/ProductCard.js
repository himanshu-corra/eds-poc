/* eslint-disable object-curly-spacing, class-methods-use-this */
import { useState } from '../../scripts/preact-hooks.js';
import {
  h, Fragment,
} from '../../scripts/preact.js';
import htm from '../../scripts/htm.js';
import {
  performCatalogServiceQuery,
  renderPrice,
  getRefineProductQuery,
} from '../../scripts/commerce.js';
import Icon from '../../components/Icon.js';

const html = htm.bind(h);

function canPerformAction(product, selection, requireInStock = false) {
  // eslint-disable-next-line no-underscore-dangle
  if (product?.__typename === 'SimpleProductView') {
    return requireInStock ? !!product && product?.inStock : !!product;
  }

  // eslint-disable-next-line max-len
  const hasRequiredSelections = !!product && Object.keys(selection)?.length === product?.options?.length;

  return requireInStock ? product?.inStock && hasRequiredSelections : hasRequiredSelections;
}

async function getVariantDetails(variantIds, sku) {
  const result = await performCatalogServiceQuery(
    getRefineProductQuery(variantIds, sku),
    {
      sku: sku.toUpperCase(),
      variantIds,
    },
  );

  const options = [];
  Object.keys(result).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(result, key) && key.startsWith('varientType')) {
      options.push(result[key].options?.[0]);
    }
  });

  return {
    images: result.refineProduct?.images,
    price: result.refineProduct?.price,
    options,
    inStock: result.refineProduct?.inStock,
    sku: result.refineProduct?.sku,
  };
}

function ProductCardShimmer() {
  return html`
    <li>
      <div class="picture shimmer"></div>
      <div class="variants"></div>
      <div class="name">
        <div class="shimmer shimmer-text"></div>
        <div class="shimmer shimmer-text" style="max-width: 70%"></div>
      </div>
      <div class="price">
        <div class="shimmer shimmer-text" style="max-width: 30%"></div>
      </div>
      <div class="rating"></div>
    </li>`;
}

function CartSection({
  onAddToCart, onAddToWishlist, product, selection,
}) {
  return html`<div class="card-section action">
    <button disabled=${!canPerformAction(product, selection, true)} onclick=${onAddToCart} class="button primary cart-button">Add to Bag</button>
    <button disabled=${!canPerformAction(product, selection)} onclick=${onAddToWishlist} class="button secondary secondary-action wishlist-button">
      <span class="sr-only">Add To Wishlist</span>
      <${Icon} c="span" name="heart" />
    </button>
  </div>`;
}

function Options({ product, updateSelection, selection }) {
  const options = product?.options;
  if (!options) {
    return null;
  }

  const renderSwatches = (option) => {
    const { values } = option;
    const selectedValue = selection?.[option.id]?.id;
    return values.map((value) => {
      const attr = {};
      if (value.type === 'COLOR_HEX') {
        attr.style = {
          backgroundColor: value.value,
        };
      }
      const isColor = option?.id?.includes('color');

      return html`<li key=${value.id} class="swatch ${option.id}${value.id === selectedValue ? ' selected' : ''}">
          <span class="swatch-strike ${!value.inStock ? 'block' : 'hidden'}"></span>
          <button
            ...${attr}
            class="swatch-button"
            disabled=${!value.inStock}
            onClick=${() => updateSelection({ [option.id]: value })}> <span class=${isColor ? 'sr-only' : ''}>${value.title}</span>  </button>
        </li>`;
    });
  };

  return options.map((option) => {
    const selectedTitle = selection?.[option.id]?.title;
    const isColor = option?.id?.includes('color');
    return html`
      <fieldset class="card-section ${option.id}-selector ${isColor ? 'color-selector' : 'size-selector'}">
          <legend class="sr-only">${selectedTitle ? `${option.title}: ${selectedTitle}` : option.title}</legend>
          <ul class="swatches swatches-regular">${renderSwatches(option)}</ul>
      </fieldset>`;
  });
}

function Image({ loading = 'lazy', product }) {
  // Placeholder as fallback
  let image;

  // Use base image if available
  if (product.images && product.images.length > 0) {
    image = product.images[0].url;
  }

  if (!image) {
    return html`<div class="no-image"></div>`;
  }
  const url = new URL(image);
  url.protocol = 'https:';
  url.search = '';

  return html`<picture>
    <source type="image/webp" srcset="${url}?width=163&bg-color=255,255,255&format=webply&optimize=medium 1x,${url}?width=326&bg-color=255,255,255&format=webply&optimize=medium 2x, ${url}?width=489&bg-color=255,255,255&format=webply&optimize=medium 3x" media="(max-width: 900px)" />
    <source type="image/webp" srcset="${url}?width=330&bg-color=255,255,255&format=webply&optimize=medium 1x, ${url}?width=660&bg-color=255,255,255&format=webply&optimize=medium 2x, ${url}?width=990&bg-color=255,255,255&format=webply&optimize=medium 3x" />
    <img class="product-image-photo" src="${url}?width=330&quality=100&bg-color=255,255,255" max-width="330" max-height="396" alt=${product.name} loading=${loading} />
  </picture>`;
}

const ProductCard = ({
  product: initialProduct, loading, index, secondLastProduct,
}) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const [product, setProduct] = useState({ ...initialProduct });
  const [selection, setSelection] = useState({});

  function onProductClick(selectedProduct) {
    window.adobeDataLayer.push((dl) => {
      // TODO: Remove eventInfo once collector is updated
      dl.push({ event: 'search-product-click', eventInfo: { ...dl.getState(), searchUnitId: 'searchUnitId', sku: selectedProduct.sku } });
    });
  }

  const onAddToCart = async () => {
    if (Object.keys(selection).length === (product.options?.length || 0)) {
      const optionsUIDs = Object.values(selection).map((option) => option.id);
      const values = [{
        optionsUIDs,
        quantity: 1,
        sku: product.sku,
      }];
      const { addProductsToCart } = await import('@dropins/storefront-cart/api.js');
      addProductsToCart(values);
    }
  };

  const getOptions = (options, updatedOption) => {
    const newOptions = options.map((option) => {
      if (option.id === updatedOption?.id) {
        return updatedOption;
      }
      return option;
    });

    return newOptions;
  };

  const onSelectionChanged = (fragment) => {
    // update selection value
    setSelection((oldSelection) => ({
      ...oldSelection,
      ...fragment,
    }));
    // fetch new images and prices
    const variantIds = Object.values({ ...selection, ...fragment })
      .map((currSelection) => currSelection.id);
    getVariantDetails(variantIds, product.sku).then(({
      images,
      inStock,
      options,
      sku,
    }) => {
      if (sku) {
        setProduct((prev) => ({
          ...prev,
          images,
          inStock,
          options: getOptions(prev.options, options?.[0]),
          variantSku: sku,
        }));
      }
    });
  };

  const onAddToWishlist = async () => {
    const { addToWishlist } = await import('../../scripts/wishlist/api.js');
    const selectedOptions = [];
    Object.values(selection)?.forEach((item) => selectedOptions.push(item?.id));
    const wishlistItems = [{
      quantity: 1,
      selected_options: selectedOptions,
      parent_sku: product.sku,
      sku: product?.variantSku,
    }];
    // eslint-disable-next-line no-underscore-dangle
    const isSimpleProduct = product?.__typename === 'SimpleProductView';
    const data = await addToWishlist(product.sku, isSimpleProduct ? '' : wishlistItems);
    console.debug(data, 'onAddToWishlist', product.sku);
  };

  if (loading) {
    return html`<${ProductCardShimmer} />`;
  }

  const isMobile = window.matchMedia('only screen and (max-width: 900px)').matches;
  const numberOfEagerImages = isMobile ? 2 : 4;

  return html`
    <li index=${index} ref=${secondLastProduct}>
      <div class="picture">
        <a onClick=${() => onProductClick(product)} href="/products/${product.urlKey}/${product.sku.toLowerCase()}">
          <${Image} loading=${index < numberOfEagerImages ? 'eager' : 'lazy'} product=${product} />
        </a>
      </div>
      <div class="product-detail">
        <div class="name">
          <a onClick=${() => onProductClick(product)} href="/products/${product.urlKey}/${product.sku.toLowerCase()}" dangerouslySetInnerHTML=${{ __html: product.name }} />
        </div>
        <div class="price">${renderPrice(product, formatter.format, html, Fragment)}</div>
        <${Options} product=${product} updateSelection=${onSelectionChanged} selection=${selection} />
        <${CartSection} onAddToWishlist=${onAddToWishlist} onAddToCart=${onAddToCart} product=${product} selection=${selection}/>
      </div>
    </li>`;
};

export default ProductCard;
