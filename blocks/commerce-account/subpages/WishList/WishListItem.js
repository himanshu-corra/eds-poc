/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../../scripts/preact.js';
import htm from '../../../../scripts/htm.js';
import removeProductsFromWishlist from './api/removeProductsFromWishlist.js';
import { useState } from '../../../../scripts/preact-hooks.js';
import { formatPrice } from '../../../../scripts/scripts.js';
import { createModal } from '../../../modal/modal.js';

const html = htm.bind(h);

function WishListItem({
  item, state, setState, addItemToCart,
}) {
  const [quality, setQuality] = useState(item.quantity);
  let modal = null;

  const removeItem = async (itemId) => {
    const modalContent = `
        <div class="remove-product">
            <p>Are you sure you want to delete item "Product Test Gallery"? This action can't be undone.</p>
            <div class="modal-action">
                <button class="secondary cancel">Cancel</button>
                <button class="primary delete">OK</button>
            </div>
        </div>
  `;
    const template = document.createElement('template');
    template.innerHTML = modalContent.trim();

    const elementsArray = Array.from(template.content.childNodes);
    modal = await createModal(elementsArray);
    modal.showModal();

    const cancelButton = elementsArray[0].querySelector('button.cancel');
    const deleteButton = elementsArray[0].querySelector('button.delete');
    if (cancelButton && deleteButton) {
      cancelButton.onclick = () => {
        modal.removeModal();
      };

      deleteButton.onclick = async () => {
        const newState = await removeProductsFromWishlist({
          wishlistId: state.wishlistId,
          wishlistItemsIds: [itemId],
          pageSize: state.currentPageSize,
          currentPage: state.currentPage,
        });
        setState({ ...state, ...newState });

        modal.removeModal();
      };
    }
  };

  const content = html`<li data-row="product-item" class="product-item">
    <div class="product-item-info" data-container="product-grid">
      <a
        class="product-item-photo"
        tabindex="-1"
        href="/products/${item?.urlKey}/${item?.sku?.toLowerCase()}"
        title="Fusion Backpack"
      >
        <span class="product-image-container product-image-container-6">
          <span class="product-image-wrapper">
            <img
              src="${item?.smallImage?.url}"
              alt="${item?.name}"
              loading="eager"
            />
          </span>
        </span>
      </a>
      <strong class="product-item-name">
        <a href="#" title="${item?.name}" class="product-item-link"
          >${item?.name}</a
        >
      </strong>
      <div class="price-box price-configured_price" data-role="priceBox">
        <p class="price-as-configured">
          <span class="price-container price-configured_price tax weee">
            <span
              id="product-price-6"
              data-price-amount="59"
              data-price-type="finalPrice"
              class="price-wrapper "
            >
              <span class="price">
                ${formatPrice(
    item?.regularPrice.value,
    item?.regularPrice.currency,
  )}
              </span>
            </span>
          </span>
        </p>
      </div>
      <div class="selected-options">
        ${item?.configurableOptions?.map(
    (option) => html`<span
                ><strong>${option?.option_label}: </strong>
                ${option?.value_label}</span
              ><br />`,
  )}
      </div>
      <div class="product-item-inner">
        <div class="box-tocart">
          <fieldset class="fieldset">
            <div class="field qty">
              <label class="label" for="qty">
                <span>Qty</span>
              </label>
              <div class="control">
                <input
                  key=${item.id}
                  type="number"
                  data-role="qty"
                  id="qty"
                  class="input-text qty"
                  name="qty"
                  value=${quality}
                  onChannge=${(e) => setQuality(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <div class="product-item-actions">
              <div class="actions-primary">
                <button
                  type="button"
                  onClick=${() => addItemToCart({
    typename: item?.typename,
    sku: item?.sku,
    urlKey: item?.urlKey,
  }, item?.id)}
                  data-role="tocart"
                  title="Add to Cart"
                  class="button primary cart-button"
                >
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </fieldset>
        </div>
        <div class="product-item-actions">
          <a
            href="/products/${item?.urlKey}/${item?.sku?.toLowerCase()}"
            data-role="remove"
            title="Edit Item"
            class="btn-edit action edit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 12 16"
              class="edit-icon"
            >
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g
                  transform="translate(-1398.000000, -315.000000)"
                  fill="currentColor"
                >
                  <g transform="translate(975.000000, 0.000000)">
                    <g transform="translate(0.000000, 38.000000)">
                      <g transform="translate(17.000000, 239.000000)">
                        <path
                          d="M416.883378,39.8868696 L409.67893,47.0910435 L408.916015,46.3281304 L416.113551,39.1174348 C416.177725,39.053 416.252594,39.0434783 416.291595,39.0434783 C416.330464,39.0434783 416.405334,39.053 416.469638,39.1173043 L416.883378,39.5310435 C416.981465,39.6291304 416.981465,39.7887826 416.883378,39.8868696 L416.883378,39.8868696 Z M407.926666,47.3477391 L408.65971,48.0807826 L407.448491,48.5550435 L407.926666,47.3477391 Z M417.62138,38.7933043 L417.207509,38.3795652 C416.962944,38.1347391 416.637769,38 416.291725,38 L416.291464,38 C415.945159,38.0001304 415.619724,38.1351304 415.375028,38.3802174 L407.130751,46.6396087 C407.080403,46.6898261 407.041142,46.7499565 407.014925,46.816087 L406.036662,49.2861304 C405.960227,49.4793043 406.005488,49.6993478 406.152097,49.8463478 C406.25188,49.9466522 406.385576,50 406.52188,50 C406.585793,50 406.650228,49.9882609 406.712055,49.964 L409.190059,48.9938261 C409.257103,48.9676087 409.317886,48.9276957 409.368755,48.8769565 L417.621249,40.6247391 C418.126163,40.120087 418.126294,39.2984783 417.62138,38.7933043 L417.62138,38.7933043 Z"
                        ></path>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
            <span class="sr-only">Edit item</span>
          </a>
          <a
            href="javascript:;"
            data-role="remove"
            onClick=${() => removeItem(item?.id)}
            title="Remove Item"
            class="btn-remove action delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-trash-2"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span class="sr-only">Remove item</span>
          </a>
        </div>
      </div>
    </div>
  </li>`;

  return html`${content}`;
}

export default WishListItem;
