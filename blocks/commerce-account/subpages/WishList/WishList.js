/* eslint-disable object-curly-spacing, class-methods-use-this */
import * as cartApi from '@dropins/storefront-cart/api.js';
import { h } from '../../../../scripts/preact.js';
import htm from '../../../../scripts/htm.js';
import addWishlistItemsToCart from './api/addWishlistItemsToCart.js';
import getCustomer from '../../api/getCustomer.js';
import { useState, useEffect } from '../../../../scripts/preact-hooks.js';
import {
  parseQueryParams,
  updateQueryParams,
} from '../../helpers/queryParams.js';
import Pagination from '../../components/Pagination.js';
import WishListItem from './WishListItem.js';

const html = htm.bind(h);

async function loadCustomer(state) {
  try {
    const response = await getCustomer({
      includeWishlist: true,
      pageSize: state.currentPageSize,
      currentPage: state.currentPage,
    });

    return {
      pages: Math.max(response?.customer?.wishlistData[0]?.items_v2.page_info.total_pages, 1),
      totalItems: response?.customer?.wishlistData[0].items_count,
      wishlistId: response?.customer?.wishlistData[0].id,
      items: response?.customer?.wishlistData[0]?.items_v2?.items ?? [],
      loading: false,
    };
  } catch (e) {
    console.error('Error loading customer wishlist', e);
    return {
      pages: 1,
      totalItems: 0,
      wishlistId: '',
      items: [],
      loading: false,
    };
  }
}

function WishList() {
  const queryParams = parseQueryParams();
  const basePageSize = 12;
  queryParams.currentPageSize = queryParams?.pageSize || basePageSize;
  const [state, setState] = useState({
    pages: 0,
    currentPage: 1,
    currentPageSize: basePageSize,
    basePageSize,
    loading: true,
    totalItems: 0,
    wishlistId: '',
    items: [],
    ...queryParams,
  });

  useEffect(async () => {
    updateQueryParams({
      page: state.currentPage,
      basePageSize: state.basePageSize,
      pageSize: state.currentPageSize,
    });
    const newState = await loadCustomer(state);
    setState({...state, ...newState});
  }, [state.currentPage, state.currentPageSize]);

  if (state.loading) {
    return html`<main class="content">
  <h1>My Wish List</h1>
  <span>Loading...</span>
</main>`;
  }

  const addItemToCart = async (item, itemId = '', addAll = false) => {
    if (window && !addAll && item?.typename !== ('ConfigurableWishlistItem' || 'SimpleWishlistItem')) {
      window?.location.replace(`${window?.location?.origin}/products/${item?.urlKey}/${item?.sku?.toLowerCase()}`);
      return;
    }

    const options = {
      wishlistId: state.wishlistId,
      pageSize: state.currentPageSize,
      currentPage: state.currentPage,
    };
    if (!addAll) {
      options.wishlistItemsIds = [itemId];
    }
    const newState = await addWishlistItemsToCart(options);
    cartApi.refreshCart().catch(console.error);
    setState({...state, ...newState});
  };

  const onPageChange = (currentPage) => {
    setState({ ...state, currentPage });
  };

  const onPageSizeChange = (currentPageSize) => {
    setState({
      ...state,
      currentPageSize,
      currentPage: 1,
    });
  };

  const updateWishlist = async () => {
    setState({ ...state, loading: true });
    const newState = await loadCustomer(state);
    setState({...state, ...newState});
  };

  const getItemsCount = () => {
    const { items, totalItems } = state;
    if (state?.pages > 1) {
      const { currentPageSize, currentPage } = state;
      const startIndex = (currentPage - 1) * currentPageSize + 1;
      const endIndex = Math.min(startIndex + currentPageSize - 1, totalItems);
      return html`Items ${startIndex} to ${endIndex} of ${totalItems} total`;
    }
    if (!items?.length) return null;
    return html`${items?.length} Item${items?.length > 1 && '(s)'}`;
  };

  const renderWishlist = () => {
    const { items } = state;

    if (!items?.length) {
      return html`<tr>
          <td colspan="5">There are no items on your wishlist.</td>
        </tr>
        <tr></tr>`;
    }

    return items.map(
      (wishlistItem) => {
        const {
          id,
          quantity,
          description,
          configurable_options: configurableOptions,
          product: {
            small_image: smallImage,
            name,
            sku,
            price_range: {
              minimum_price: {
                regular_price: regularPrice,
              },
            },
            url_key: urlKey,
          },
          __typename: typename,
        } = wishlistItem;
        return html`<${WishListItem} 
          item=${{
    id,
    quantity,
    description,
    smallImage,
    name,
    sku,
    regularPrice,
    urlKey,
    configurableOptions,
    typename,
  }}
        state=${state}
        setState=${setState}
        addItemToCart=${addItemToCart}
        />`;
      },
    );
  };

  const content = html`<main class="content">
    <h1>My Wish List</h1>
    ${state.items.length
    ? html` <span class="item-count">${getItemsCount()}</span>
          <section class="account-info">
            <form class="form form-wishlist-items" id="wishlist-view-form">
              <div class="products-grid wishlist">
                <ol class="product-items">
                  ${renderWishlist()}
                </ol>
              </div>
            </form>
          </section>
          <div class="wishlist-action">
            <button onclick=${() => updateWishlist()} data-variant="secondary" aria-label="secondary" class="button secondary btn-sm" type="button">
              <span>Update Wish List</span>
            </button>
            <button onclick=${() => addItemToCart('', '', true)} data-variant="primary" aria-label="primary" class="button primary btn-sm" type="button">
              <span>Add All to Cart</span>
            </button>
          </div>
          <${Pagination}
            pages=${state.pages}
            currentPage=${state.currentPage}
            pageSizeOptions=${[state.basePageSize, 24, 36]}
            currentPageSize=${state.currentPageSize}
            loading=${state.loading}
            onPageChange=${onPageChange}
            onPageSizeChange=${onPageSizeChange}
          />`
    : html`<span>You have no items in your wish list.</span>`}
  </main>`;

  return html`${content}`;
}

export default WishList;
