import { getCookie } from '../../../../../scripts/configs.js';
import { performMonolithGraphQLQuery } from '../../../../../scripts/commerce.js';
import { removeFromWishlistFragment } from '../../../api/getCustomer.js';

const removeProductsFromWishlist = async (variables) => {
  const query = `mutation removeProductsFromWishlist($wishlistId: ID!, $wishlistItemsIds: [ID!]!, $pageSize: Int, $currentPage: Int) {
    removeProductsFromWishlist(
      wishlistId: $wishlistId,
      wishlistItemsIds: $wishlistItemsIds
    ) {
      ...WishlistsFragment
    }
  }
  ${removeFromWishlistFragment.replace('wishlistData: wishlists', 'wishlistData: wishlist')}
  `;

  const token = getCookie('auth_dropin_user_token');

  try {
    const {
      data: {
        removeProductsFromWishlist: response,
      },
      errors,
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

export default removeProductsFromWishlist;
