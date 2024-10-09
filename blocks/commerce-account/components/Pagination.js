/* eslint-disable object-curly-spacing, class-methods-use-this */
import { h } from '../../../scripts/preact.js';
import htm from '../../../scripts/htm.js';

const html = htm.bind(h);

function Pagination(props) {
  if (props.loading) {
    return html`<div class="pagination shimmer"></div>`;
  }

  return html`<div class="pagination">
    <div>
      <label for="select-pagesize">Show:</label>
      <select
        id="select-pagesize"
        name="pageSize"
        value=${props.currentPageSize}
        onChange=${(e) => props.onPageSizeChange?.(parseInt(e.target.value, 10))}
      >
        ${props.pageSizeOptions.map(
    (size) => html`<option value=${size}>${size} Items</option>`,
  )}
      </select>
    </div>
    <div>
      <label for="select-page">Page:</label>
      <select
        id="select-page"
        name="page"
        value=${props.currentPage}
        onChange=${(e) => props.onPageChange?.(parseInt(e.target.value, 10))}
      >
        ${Array(props.pages)
    .fill(0)
    .map((_, i) => html`<option value=${i + 1}>${i + 1}</option>`)}
      </select>
      <span>of ${props.pages}</span>
    </div>
    <div>
      ${props.currentPage > 1
    ? html`<button
            class="previous"
            onClick=${() => props.onPageChange?.(props.currentPage - 1)}
          >
            Previous
          </button>`
    : ''}
      ${props.currentPage < props.pages
    ? html`<button
            class="next"
            onClick=${() => props.onPageChange?.(props.currentPage + 1)}
          >
            Next
          </button>`
    : ''}
    </div>
  </div>`;
}

export default Pagination;
