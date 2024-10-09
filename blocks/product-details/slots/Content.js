import { loadScript } from '../../../scripts/aem.js';
import { getConfigValue } from '../../../scripts/configs.js';
import yotpoConfig from '../../../scripts/yotpo/config.js';

/**
 * Renders Yotpo reviews on the page when the element becomes visible.
 *
 * @param {HTMLElement} element - The HTML element where the reviews will be rendered.
 * @returns {void}
 */
async function renderReviewsOnVisible(element) {
  const apiKey = await getConfigValue('yotpo-api-key');
  if (!apiKey) {
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !window?.yotpo?.initialized) {
        loadScript(yotpoConfig.getWidgetUrl(apiKey), { id: 'yotpo-script-loader', async: true, defer: true });
        obs.unobserve(entry.target);
      }
    });
  });

  observer.observe(element);
}

export default function Content(ctx) {
  const wrapper = document.createElement('div');
  wrapper.className = 'yotpo yotpo-main-widget';
  wrapper.setAttribute('data-name', 'Endeavor Daytrip Backpack');
  wrapper.setAttribute('data-product-id', '2250');
  wrapper.setAttribute('data-product-id', '2250');
  wrapper.setAttribute('data-url', 'spacedye-hi-lo-tank-updated');
  wrapper.setAttribute('data-description', '');
  wrapper.setAttribute('data-yotpo-element-id', '1');
  wrapper.setAttribute('data-image-url', 'http://integration-5ojmyuq-7yvbzwvtkgerq.us-4.magentosite.cloud/media/catalog/product/w/b/wb06-red-0.jpg?auto=webp&quality=80&crop=false&fit=cover&width=960');
  const skeleton = document.createElement('div');
  skeleton.className = 'skeleton-wrapper';
  skeleton.style.width = '100%';
  skeleton.style.height = '400px';
  wrapper.appendChild(skeleton);
  ctx.appendChild(wrapper);
  renderReviewsOnVisible(wrapper);
}
