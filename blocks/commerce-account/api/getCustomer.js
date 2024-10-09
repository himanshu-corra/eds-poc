import { getCookie } from '../../../scripts/configs.js';
import { useState, useEffect } from '../../../scripts/preact-hooks.js';
import { performMonolithGraphQLQuery } from '../../../scripts/commerce.js';

const wishlist = `wishlistData: wishlists {
  id
  items_count
  name
  __typename
  items_v2(pageSize: $pageSize, currentPage: $currentPage) {
    page_info {
      current_page
      page_size
      total_pages
    }
    items {
        id
        description
        quantity
        __typename
        product {
            stock_status
            id
            url_key
            name
            __typename
            price_range {
              __typename
              minimum_price {
                __typename
                regular_price {
                  __typename
                  value
                  currency
                }
              }
            }
            small_image {
              __typename
              url
              label
            }
            sku
        }
    ... on ConfigurableWishlistItem {
        configurable_options {
          __typename
          configurable_product_option_uid
          configurable_product_option_value_uid
          id
          value_id
          option_label
          value_label
        }
      }
    }
  }
}`;

export const removeFromWishlistFragment = `fragment WishlistsFragment on RemoveProductsFromWishlistOutput {
  ${wishlist}
}`;

export const addWishlisttoCartFragment = `fragment WishlistsFragment on AddWishlistItemsToCartOutput {
  ${wishlist}
}`;

const fragments = {
  wishlistsFragment: `    
  fragment WishlistsFragment on Customer {
    ${wishlist}
  }`,
  addressesFragment: `
    fragment AddressesFragment on Customer {
      addresses {
        firstname
        lastname
        city
        company
        country_code
        region {
          region
          region_code
          region_id
        }
        region_id
        telephone
        id
        vat_id
        postcode
        street
        default_shipping
        default_billing
      }
    }
  `,
  ordersFragment: `
    fragment OrdersFragment on Customer {
      orders(pageSize: $pageSize, currentPage: $currentPage, filter: $filter, sort: $sort) {
        page_info {
          current_page
          page_size
          total_pages
        }
        items {
          id
          status
          order_date
          number
          shipping_method
          payment_methods {
            type
            name
          }
          billing_address {
            firstname
            lastname
            city
            country_code
            region
            telephone
            postcode
            telephone
            street
          }
          shipping_address {
            region
            firstname
            lastname
            city
            country_code
            region_id
            telephone
            postcode
            street
          }
          items {
            product_name
            product_type
            product_url_key
            id
            quantity_invoiced
            quantity_canceled
            quantity_ordered
            quantity_refunded
            quantity_returned
            quantity_shipped
            status
            product_sku
            product_sale_price {
              currency
              value
            }
            selected_options {
              value
              label
            }
          }
          total {
            subtotal {
              currency
              value
            }
            shipping_handling {
              amount_excluding_tax {
                currency
                value
              }
              amount_including_tax {
                currency
                value
              }
            }
            grand_total {
              currency
              value
            }
          }
          ...InvoiceFragment @include(if: $includeInvoice)
          ...ShipmentFragment @include(if: $includeShipment)
        }
      }
    }
  `,
  invoiceFragment: `
    fragment InvoiceFragment on CustomerOrder {
      invoices {
        id
        number
        items {
          __typename
          id
          product_name
          product_sku
          quantity_invoiced
          order_item {
            quantity_ordered
            product_sku
            product_name
            selected_options{
              __typename
              label
              value
            }
          }
          product_sale_price{
            value
            currency
          }
        }
        total {
          subtotal {
            currency
            value
          }
          shipping_handling {
            amount_excluding_tax {
              currency
              value
            }
            amount_including_tax {
              currency
              value
            }
          }
          grand_total {
            currency
            value
          }
        }
      }
    }
  `,
  shipmentFragment: `
    fragment ShipmentFragment on CustomerOrder {
      shipments {
        id
        number
        items{
          product_name
          product_sku
          quantity_shipped
          order_item {
            selected_options{
              value
              label
            }
          }
        }
        tracking{
          title
          number
        }
      }
    }
  `,
};

const createQuery = () => `
    query getCustomerData(
      $includeWishlist: Boolean!,
      $includeAddresses: Boolean!,
      $includeOrders: Boolean!,
      $includeInvoice: Boolean!,
      $includeShipment: Boolean!,
      $pageSize: Int,
      $currentPage: Int,
      $filter: CustomerOrdersFilterInput,
      $sort: CustomerOrderSortInput
    ) {
      customer {
        firstname
        lastname
        email
        is_subscribed
        ...WishlistsFragment @include(if: $includeWishlist)
        ...AddressesFragment @include(if: $includeAddresses)
        ...OrdersFragment @include(if: $includeOrders)
      }
    }
    ${fragments.wishlistsFragment}
    ${fragments.addressesFragment}
    ${fragments.ordersFragment}
    ${fragments.invoiceFragment}
    ${fragments.shipmentFragment}
  `;

const getCustomer = async (props) => {
  const query = createQuery();
  const token = getCookie('auth_dropin_user_token');
  const variables = {
    includeWishlist: props?.includeWishlist || false,
    includeAddresses: props?.includeAddresses || false,
    includeOrders: props?.includeOrders || false,
    includeInvoice: props?.includeInvoice || false,
    includeShipment: props?.includeShipment || false,
    pageSize: props?.pageSize || 1,
    currentPage: props?.currentPage || 1,
    ...props,
  };

  try {
    const { data, errors } = await performMonolithGraphQLQuery(
      query,
      variables,
      false,
      token,
    );
    if (errors) return errors;
    return data;
  } catch (error) {
    return null;
  }
};

export const useCustomerData = (variables) => {
  const [customer, setCustomer] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCustomer(variables);
        if (data === null || !Object.keys(data?.customer).length) {
          window.location.href = '/';
        }

        setCustomer(data?.customer);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, []);

  return { customer, loading };
};

export default getCustomer;
