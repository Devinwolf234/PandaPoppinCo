// Custom color dropdown logic
function initCustomColorSelect() {
  let select = document.getElementById('modal-color-select');
  if (!select) return;
  // Replace the node to ensure no duplicate event listeners exist
  const fresh = select.cloneNode(true);
  select.parentNode.replaceChild(fresh, select);
  select = fresh;
  const selected = select.querySelector('.selected-option');
  const options = select.querySelector('.custom-options');
  const hiddenInput = select.querySelector('input[type="hidden"]');
  let currentValue = '';

  function closeAll() {
    select.classList.remove('open');
    document.removeEventListener('click', outsideClick);
  }
  function outsideClick(e) {
    if (!select.contains(e.target)) closeAll();
  }

  select.addEventListener('click', function (e) {
    e.stopPropagation();
    select.classList.toggle('open');
    if (select.classList.contains('open')) {
      document.addEventListener('click', outsideClick);
    } else {
      document.removeEventListener('click', outsideClick);
    }
  });

  options.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', function (e) {
      e.stopPropagation();
      options.querySelectorAll('li').forEach(opt => opt.classList.remove('selected'));
      li.classList.add('selected');
      currentValue = li.getAttribute('data-value');
      hiddenInput.value = currentValue;
      // Always show the color swatch and name in the selected option
      const swatch = li.querySelector('.color-swatch');
      const colorName = li.childNodes[1] ? li.childNodes[1].textContent.trim() : li.textContent.trim();
      selected.innerHTML = '';
      if (swatch) selected.appendChild(swatch.cloneNode(true));
      selected.appendChild(document.createTextNode(' ' + colorName));
      closeAll();
    });
  });

  // Keyboard navigation
  select.addEventListener('keydown', function (e) {
    const items = Array.from(options.querySelectorAll('li'));
    let idx = items.findIndex(li => li.classList.contains('selected'));
    if (e.key === 'ArrowDown') {
      idx = (idx + 1) % items.length;
      items.forEach(li => li.classList.remove('selected'));
      items[idx].classList.add('selected');
      selected.innerHTML = items[idx].innerHTML;
      hiddenInput.value = items[idx].getAttribute('data-value');
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      idx = (idx - 1 + items.length) % items.length;
      items.forEach(li => li.classList.remove('selected'));
      items[idx].classList.add('selected');
      selected.innerHTML = items[idx].innerHTML;
      hiddenInput.value = items[idx].getAttribute('data-value');
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      select.classList.toggle('open');
      e.preventDefault();
    } else if (e.key === 'Escape') {
      closeAll();
      e.preventDefault();
    }
  });
}
// Helper: product images for modal carousel
const productCarousels = {
  'Hunting Hoodie': [
    'assets/images/hoodie.png',
    'assets/images/hoodie2.jpg',
    'assets/images/hoodie3.jpg',
    'assets/images/hoodie4.jpg'
  ],
  'Hunting Hat': [
    'assets/images/hat.png',
    'assets/images/hat.png'
  ],
  'Hunting tee': [
    'assets/images/tee.png',
    'assets/images/tee.png'
  ]
};
// Modal logic for product options
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('product-modal');
  const closeModal = modal.querySelector('.close-modal');
  const productNameElem = document.getElementById('modal-product-name');
  const optionsForm = document.getElementById('product-options-form');
  let currentProduct = null;
  let currentPrice = null;

  // Open modal on View More click
  document.querySelectorAll('.view-more-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      currentProduct = btn.getAttribute('data-product');
      currentPrice = btn.getAttribute('data-price');
      productNameElem.textContent = currentProduct;
      // Insert carousel for this product
      const carouselImages = productCarousels[currentProduct] || [];
      const carouselHtml = `
        <div class="carousel modal-carousel">
          <button class="carousel-btn prev" aria-label="Previous image">◀</button>
          <div class="carousel-track">
            ${carouselImages.map(src => `<img src="${src}" alt="${currentProduct}">`).join('')}
          </div>
          <button class="carousel-btn next" aria-label="Next image">▶</button>
        </div>
      `;
      document.getElementById('modal-carousel-container').innerHTML = carouselHtml;
      // Set product price and reset form
      const priceEl = document.getElementById('modal-price');
      if (priceEl) priceEl.textContent = Number(currentPrice).toFixed(2);
      optionsForm.reset();
      // Render simple color swatches (explicit, reliable)
      const colors = [
        { name: 'Black', color: '#000' },
        { name: 'Green', color: '#008000' },
        { name: 'Camo', color: 'rgb(120,134,107)' },
        { name: 'White', color: '#ffffff' }
      ];
      const colorsContainer = document.getElementById('modal-colors');
      if (colorsContainer) {
        colorsContainer.innerHTML = '';
        colors.forEach(c => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'swatch-button' + (c.name === 'White' ? ' white' : '');
          btn.setAttribute('data-color', c.name);
          btn.setAttribute('aria-label', c.name);
          btn.style.background = c.color;
          btn.addEventListener('click', function() {
            // toggle selection
            document.querySelectorAll('#modal-colors .swatch-button').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            const hidden = document.getElementById('modal-color');
            if (hidden) hidden.value = c.name;
          });
          colorsContainer.appendChild(btn);
        });
      }

      // Show modal then init carousel so image widths are measurable
      modal.style.display = 'block';
      setTimeout(() => initCarousels(), 60);
    });
  });

  // Close modal
  closeModal.onclick = function () { modal.style.display = 'none'; };
  window.onclick = function (event) { if (event.target === modal) modal.style.display = 'none'; };

  // Add to cart from modal
  optionsForm.onsubmit = function (e) {
    e.preventDefault();
    const size = document.getElementById('modal-size').value;
    const color = document.getElementById('modal-color').value;
    const qty = parseInt(document.getElementById('modal-qty').value, 10) || 1;
    if (!size || !color) return;
    const image = (productCarousels[currentProduct] && productCarousels[currentProduct].length)
      ? productCarousels[currentProduct][0]
      : 'assets/images/logo.jpg';
    addToCart(`${currentProduct} (${size}, ${color})`, Number(currentPrice), image, qty);
    modal.style.display = 'none';
  };
});
// Store the cart in local storage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(productName, price, image, qty) {
  const product = { name: productName, price: price, qty: qty && qty > 0 ? qty : 1, image: image || 'assets/images/logo.jpg' };
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart)); // Save cart to localStorage
  alert(`${productName} has been added to your cart!`);
}

// Load the cart on the cart page
function loadCart() {
  const cartContainer = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('subtotal');
  const totalPriceContainer = document.getElementById('total-price');
  if (!cartContainer) return;
  cartContainer.innerHTML = ''; // Clear the cart container first

  // Helper: try to infer an image for items that don't have one
  function inferImageFor(item) {
    if (item.image) return item.image;
    // Try to match product name before parentheses
    const base = (item.name || '').split('(')[0].trim();
    // Exact match first
    if (productCarousels[base] && productCarousels[base].length) return productCarousels[base][0];
    // Case-insensitive match
    const key = Object.keys(productCarousels).find(k => k.toLowerCase() === base.toLowerCase());
    if (key) return productCarousels[key][0];
    return null;
  }

  if (!cart || cart.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'cart-item-card empty-state';
    empty.innerHTML = '<p>Your cart is empty. <a href="index.html#shop">Continue shopping</a></p>';
    cartContainer.appendChild(empty);
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (totalPriceContainer) totalPriceContainer.textContent = '$0.00';
    return;
  }

  let totalPrice = 0;

  cart.forEach((item, idx) => {
    // Ensure item has an image (handle legacy cart items)
    if (!item.image) {
      const inferred = inferImageFor(item);
      if (inferred) {
        item.image = inferred;
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    }
    const card = document.createElement('div');
    card.className = 'cart-item-card';

    const imgSrc = item.image || 'assets/images/logo.jpg';
    card.innerHTML = `
      <img src="${imgSrc}" alt="${item.name}">
      <div class="cart-item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">$${item.price.toFixed(2)}</p>
      </div>
      <div class="item-controls">
        <input class="qty-input" type="number" min="1" value="${item.qty || 1}" data-idx="${idx}">
        <button class="remove-link" data-idx="${idx}">Remove</button>
      </div>
    `;

    // Quantity change handler
    const qtyInput = card.querySelector('.qty-input');
    qtyInput.addEventListener('change', function (e) {
      const val = parseInt(e.target.value, 10) || 1;
      cart[idx].qty = val;
      localStorage.setItem('cart', JSON.stringify(cart));
      loadCart();
    });

    // Remove handler
    const removeBtn = card.querySelector('.remove-link');
    removeBtn.addEventListener('click', function () {
      cart.splice(idx, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      loadCart();
    });

    cartContainer.appendChild(card);
    totalPrice += (item.price * (item.qty || 1));
  });

  // Update subtotal and total display (shipping currently free)
  if (subtotalEl) subtotalEl.textContent = `$${totalPrice.toFixed(2)}`;
  if (totalPriceContainer) totalPriceContainer.textContent = `$${totalPrice.toFixed(2)}`;
}

// Run loadCart() when cart page is loaded
if (window.location.pathname.includes('cart.html')) {
  loadCart();
}

// Initialize simple carousels for product images
function initCarousels() {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.querySelectorAll('img'));
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    let index = 0;

    function update() {
      const slideWidth = slides[0].clientWidth || carousel.clientWidth;
      track.style.transform = `translateX(${-index * slideWidth}px)`;
    }

    prevBtn.addEventListener('click', () => {
      index = (index - 1 + slides.length) % slides.length;
      update();
    });

    nextBtn.addEventListener('click', () => {
      index = (index + 1) % slides.length;
      update();
    });

    // Allow swipe on touch devices
    let startX = 0;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
    track.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;
      if (Math.abs(dx) > 30) {
        if (dx < 0) { index = (index + 1) % slides.length; } else { index = (index - 1 + slides.length) % slides.length; }
        update();
      }
    });

    // Update on resize
    window.addEventListener('resize', update);
    update();
  });
}

// Only initialize if there are carousels on the page
if (document.querySelector('.carousel')) {
  initCarousels();
}

async function submitOrder(order) {
  const url = "https://script.google.com/macros/s/AKfycbxsjjZ19UaZKMtA1SBGRurzJOk66g41p-xYqcAB0I8MXo_x8Ol7U8jEygDlhg0vEdZ5/exec"; // replace with your Apps Script Web App URL

  if (url.includes("AKfycbxoHc6y-h-J-esV2IAvpw5LzAqeEYeQbv_f7CTrmCkTOHdQK0ngep21KMEBVQ7vGSUO")) {
    console.warn("submitOrder: using placeholder Apps Script URL. Update to your deployed Web App URL in scripts/app.js");
  }

  function setOrderError(message) {
    const el = document.getElementById('order-error');
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
  }

  function clearOrderError() {
    const el = document.getElementById('order-error');
    if (!el) return;
    el.style.display = 'none';
    el.textContent = '';
  }

  clearOrderError();

  try {
    console.log('submitOrder: sending to', url);
    console.log('submitOrder: order body', order);

    const response = await fetch(url, {
      method: "POST",
      mode: "no-cors", // avoids CORS preflight failures
      body: JSON.stringify(order)
    });

    // When using no-cors, the response is opaque and cannot be read; assume success.
    if (response.type === 'opaque' || response.ok) {
      clearOrderError();
      alert("Order submitted! Thank you!");
      return true;
    }

    const text = await response.text();
    console.error("submitOrder: non-2xx response", response.status, text);
    setOrderError(`Error sending order (HTTP ${response.status}):\n${text}`);
    alert(`Error sending order (HTTP ${response.status}). See page for details.`);
    return false;
  } catch (err) {
    console.error("Error sending order to sheet:", err);

    // Common browser failure: blocked by CORS/origin (file://) or network.
    const msg = err && err.message ? err.message : String(err);
    setOrderError(`Error sending order:\n${msg}`);

    if (msg.toLowerCase().includes('failed to fetch')) {
      alert(
        "Error sending order: Failed to fetch.\n" +
        "1) Make sure you are running the site via http://localhost (not file://).\n" +
        "2) Confirm your Apps Script Web App is deployed for 'Anyone' / 'Anyone with link'.\n" +
        "3) Check the console Network tab for more details."
      );
    } else {
      alert(`Error sending order: ${msg}`);
    }

    return false;
  }
}

async function checkout() {
  if (window.location.protocol === 'file:') {
    alert(
      'Please run the site through a local server (e.g. `python -m http.server`)\n' +
      'and open via http://localhost, otherwise the order request will be blocked.'
    );
    return;
  }

  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const name = prompt('Enter your name (for order confirmation):');
  if (!name) {
    alert('Name is required to place an order.');
    return;
  }

  const email = prompt('Enter your email (for order confirmation):');
  if (!email) {
    alert('Email is required to place an order.');
    return;
  }

  const order = {
    submittedAt: new Date().toISOString(),
    customerName: name,
    customerEmail: email,
    items: cart.map(item => ({
      name: item.name,
      quantity: item.qty,
      unitPrice: item.price
    })),
    total: cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0)
  };

  const sent = await submitOrder(order);
  if (sent) {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'index.html';
  }
}
