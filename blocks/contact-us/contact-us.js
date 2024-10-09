/**
 * Loads and decorates the Contact Us
 * @param {Element} block The contact us block element
 */
export default async function decorate(block) {
  block.firstElementChild?.classList.add('contact-details');
  // Create the iframe element for the Google Map
  const mapIframe = document.createElement('iframe');
  const mapContainer = document.createElement('div');
  mapContainer.classList.add('location-map');

  // Set the attributes for the iframe
  mapIframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3020.4509913811967!2d-73.95217192360526!3d40.796082371381075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2f61b695de427%3A0x977ba594be95b6e2!2s1274%205th%20Ave%2C%20New%20York%2C%20NY%2010029%2C%20USA!5e0!3m2!1sen!2sin!4v1725248936575!5m2!1sen!2sin';
  mapIframe.width = '600';
  mapIframe.height = '450';
  mapIframe.style.border = '0';
  mapIframe.allowFullscreen = true;
  mapIframe.loading = 'lazy';
  mapIframe.referrerPolicy = 'no-referrer-when-downgrade';

  block.append(mapContainer);

  // Append the iframe to the block element
  setTimeout(() => {
    mapContainer.appendChild(mapIframe);
  }, 200);
}
