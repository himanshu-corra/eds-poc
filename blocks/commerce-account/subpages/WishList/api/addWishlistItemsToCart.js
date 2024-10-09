import { getCookie } from '../../../../../scripts/configs.js';
import { performMonolithGraphQLQuery } from '../../../../../scripts/commerce.js';
import { addWishlisttoCartFragment } from '../../../api/getCustomer.js';

const addWishlistItemsToCart = async (variables) => {
  const query = `mutation addWishlistItemsToCart($wishlistId: ID!, $wishlistItemsIds: [ID!], $pageSize: Int, $currentPage: Int) {
    addWishlistItemsToCart(
      wishlistId: $wishlistId,
      wishlistItemIds: $wishlistItemsIds
    ) {
      status
      ...WishlistsFragment
    }
  }
  ${addWishlisttoCartFragment.replace('wishlistData: wishlists', 'wishlistData: wishlist')}
  `;

  const token = getCookie('auth_dropin_user_token');

  try {
    const {
      data: {
        addWishlistItemsToCart: response,
      }, errors,
    } = await performMonolithGraphQLQuery(
      query,
      variables,
      false,
      token,
    );
    if (errors) return errors;
    return {
      pages: Math.max(response?.wishlistData?.items_v2.page_info.total_pages, 1),
      totalItems: response?.wishlistData.items_count,
      wishlistId: response?.wishlistData.id,
      items: response?.wishlistData?.items_v2?.items ?? [],
      loading: false,
    };
  } catch (error) {
    return null;
  }
};

export default addWishlistItemsToCart;
