// Ultra Premium E-commerce Script - English Version
const products = [
  { id: 1, name: 'Basic Discord Bot', price: 200, image: 'Basic Discord Bot.jpg', category: 'Discord', desc: 'Custom Discord bot with basic moderation and welcome features.', stock: 999 },
  { id: 2, name: 'Advanced Discord Bot', price: 500, image: 'Advanced Discord Bot.jpg', category: 'Discord', desc: 'Full-featured bot with music, tickets, economy and custom commands.', stock: 999 },
  { id: 3, name: 'Discord Server Setup', price: 150, image: 'Discord Server Setup.jpg', category: 'Servers', desc: 'Complete Discord server setup with roles, channels and permissions.', stock: 999 },
  { id: 4, name: 'Simple Website', price: 400, image: 'Simple Website.jpg', category: 'Websites', desc: 'Responsive landing page or portfolio site with modern design.', stock: 999 },
  { id: 5, name: 'E-commerce Store', price: 800, image: 'store images/sikin.jpg', category: 'Stores', desc: 'Complete online store with cart, payments and admin panel.', stock: 999 },
  { id: 6, name: 'Custom Discord Bot', price: 350, image: 'Basic Discord Bot.jpg', category: 'Discord', desc: 'Bespoke Discord bot for your specific needs and integrations.', stock: 999 },
  { id: 7, name: 'Website + Hosting', price: 600, image: 'Simple Website.jpg', category: 'Websites', desc: 'Professional website with domain, hosting and SSL setup.', stock: 999 },
  { id: 8, name: 'Premium Store Setup', price: 1200, image: 'store images/sikin.jpg', category: 'Stores', desc: 'Advanced e-commerce store with custom features and SEO.', stock: 999 }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let visibleProducts = 4;

document.addEventListener('DOMContentLoaded', initStore);

function initStore() {
  emailjs.init('1YmOMEAnC6v_JZ-Wc');
  renderProducts();
  updateCart();
  setupEventListeners();
  setupSearch();
  observeScrollAnimations();
}

function setupEventListeners() {
  document.getElementById('cartBtn').addEventListener('click', toggleCart);
  document.getElementById('checkoutBtn').addEventListener('click', toggleCheckout);
  document.getElementById('orderForm').addEventListener('submit', handleOrder);
  document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', () => {
    btn.closest('.modal').style.display = 'none';
  }));
  window.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
  });
}

function renderProducts(filteredProducts = products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = filteredProducts.slice(0, visibleProducts).map(product => `
    <div class="product-card loading" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" loading="lazy" onclick="quickView(${product.id})">
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.desc || 'Premium handmade product'}</p>
        <div class="product-price">${product.price} DH</div>
        <div class="product-meta">
          <span class="stock">${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
          <div class="product-buttons">
            <button class="buy-now" onclick="buyNow(${product.id})">Buy Now</button>
            <button class="add-cart" onclick="addToCart(${product.id})">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function buyNow(id) {
  // Clear cart and add only this product (quantity 1)
  cart = [];
  const product = products.find(p => p.id === id);
  if (product) {
    cart.push({...product, quantity: 1});
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    // Directly open checkout (skip cart modal)
    toggleCheckout();
    showToast('Service added to direct order!');
  }
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query)
    );
    renderProducts(filtered);
  });
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const cartItem = cart.find(item => item.id === id);
  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({...product, quantity: 1});
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  showToast('Service added to cart!');
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = count;
}

function toggleCart() {
  document.getElementById('cartModal').style.display = 'flex';
  const items = document.getElementById('cartItems');
  items.innerHTML = cart.length ? cart.map(item => `
    <div class="cart-item">
      <div>
        <h4>${item.name}</h4>
        <div>Qty: <button onclick="changeQty(${item.id}, -1)" class="qty-btn">-</button> ${item.quantity} <button onclick="changeQty(${item.id}, 1)" class="qty-btn">+</button></div>
      </div>
        <div class="cart-price">
        ${item.price * item.quantity} DH
        <button onclick="removeFromCart(${item.id})" class="remove-btn">Remove</button>
      </div>
    </div>
  `).join('') : '<p class="empty-cart">Your cart is empty</p>'; 
  document.getElementById('cartTotal').textContent = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + ' DH';
}

function changeQty(id, delta) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    toggleCart();
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  toggleCart();
  showToast('Service removed from cart!');
}

function toggleCheckout() {
  document.getElementById('cartModal').style.display = 'none';
  document.getElementById('checkoutModal').style.display = 'flex';
}

async function handleOrder(e) {
  e.preventDefault();
  const formData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    city: document.getElementById('city').value,
    neighborhood: document.getElementById('neighborhood').value,
    cart: cart.map(item => `${item.name} x${item.quantity} = ${item.price * item.quantity} DH`).join('\\n'),
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + ' DH'
  };

  const message = document.getElementById('orderMessage');
  message.innerHTML = '<div class="loading">Sending...</div>';

  try {
    await emailjs.send('service_vkoy0wo', 'template_q3f7syc', formData);
    message.innerHTML = '<div class="success">✅ Order sent successfully! We will contact you soon</div>';
    cart = [];
    localStorage.removeItem('cart');
  } catch (error) {
    message.innerHTML = '<div class="error">Send error, try WhatsApp</div>';
  }
}

function quickView(id) {
  const product = products.find(p => p.id === id);
  document.getElementById('quickViewContent').innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div>
      <h2>${product.name}</h2>
      <div class="big-price">${product.price} DH</div>
      <p>${product.desc || 'Premium handmade product'}</p>
      <button onclick="addToCart(${product.id})" class="btn-quick">Add to Cart</button>
    </div>
  `;
  document.getElementById('quickViewModal').style.display = 'flex';
}

function scrollTo(section) {
  const el = document.getElementById(section);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function observeScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  });
  
  document.querySelectorAll('.loading').forEach(el => observer.observe(el));
}

// Smooth scrolling for all buttons and links
document.addEventListener('click', function(e) {
  if (e.target.matches('[onclick*="scrollTo"]') || e.target.closest('[onclick*="scrollTo"]')) {
    e.preventDefault();
    const section = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
});

// Navbar links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
