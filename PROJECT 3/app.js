// 1. Data Store: Nocturne Catalog
const menuData = [
  {
    id: 1,
    name: "Nitro Cold Brew Reserve",
    category: "coffee",
    price: 239,
    tag: "Infused Draft",
    diet: "🌱 100% Vegan",
    desc: "Slow-steeped single-origin Arabica charged with nitrogen for a creamy, stout-like head.",
    img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    name: "Dark Velvet Cortado",
    category: "coffee",
    price: 219,
    tag: "Double Ristretto",
    diet: "☕ Oat/Dairy",
    desc: "1:1 ratio of intense double espresso cut with silky textured steamed milk.",
    img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    name: "Charcoal Truffle Sourdough",
    category: "mains",
    price: 369,
    tag: "Signature Bake",
    diet: "🌱 Vegetarian",
    desc: "Hand-stretched sourdough toast layered with sautéed oyster mushrooms and truffle glaze.",
    img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Whipped Ricotta Toast",
    category: "mains",
    price: 339,
    tag: "Kitchen Pick",
    diet: "🌱 Vegetarian",
    desc: "Herb-whipped creamy ricotta, sun-dried tomatoes, toasted pine nuts, and balsamic reduction.",
    img: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    name: "Midnight Basque Cheesecake",
    category: "desserts",
    price: 289,
    tag: "Limited Crumb",
    diet: "🥚 Contains Egg",
    desc: "Deeply caramelized burnt top with an ultra-creamy molten vanilla bean core.",
    img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    name: "Smoked Sea Salt Lava Tart",
    category: "desserts",
    price: 249,
    tag: "80% Cocoa",
    diet: "🥚 Contains Egg",
    desc: "Dark chocolate ganache baked in a crisp butter crust, finished with Maldon smoked sea salt.",
    img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"
  }
];

// 2. Application State & Configuration
let cart = JSON.parse(localStorage.getItem('nocturne_cart')) || [];
const PACKAGING_FEE = 30;
const GST_RATE = 0.05;

// DOM Selectors
const menuGrid = document.getElementById('menu-grid');
const categoryFilters = document.getElementById('category-filters');
const floatingCartBar = document.getElementById('floating-cart-bar');
const floatItemCount = document.getElementById('float-item-count');
const floatTotalPrice = document.getElementById('float-total-price');
const viewTrayBtn = document.getElementById('view-tray-btn');
const navCartBtn = document.getElementById('nav-cart-btn');
const navCartBadge = document.getElementById('nav-cart-badge');

const cartDrawer = document.getElementById('cart-drawer');
const cartBackdrop = document.getElementById('cart-drawer-backdrop');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartDrawerCount = document.getElementById('cart-drawer-count');

const calcSubtotal = document.getElementById('calc-subtotal');
const calcTax = document.getElementById('calc-tax');
const calcTotal = document.getElementById('calc-total');
const proceedPaymentBtn = document.getElementById('proceed-payment-btn');

// 3. Render Menu Cards
function renderMenu(category = 'all') {
  menuGrid.innerHTML = '';
  const filtered = category === 'all' ? menuData : menuData.filter(i => i.category === category);

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = "group bg-surface border border-zinc-800/90 hover:border-violet-500/50 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300";
    card.innerHTML = `
      <div>
        <div class="relative overflow-hidden h-48">
          <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <span class="absolute top-3 left-3 bg-obsidian/85 backdrop-blur-md text-violet-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border border-violet-500/30">
            ${item.tag}
          </span>
          <span class="absolute bottom-3 left-3 text-[11px] font-semibold text-zinc-300 bg-zinc-900/80 backdrop-blur-md px-2 py-0.5 rounded-md">
            ${item.diet}
          </span>
        </div>
        <div class="p-6">
          <h3 class="font-display font-bold text-lg text-zinc-100">${item.name}</h3>
          <p class="text-zinc-400 text-xs mt-2 leading-relaxed">${item.desc}</p>
        </div>
      </div>
      <div class="p-6 pt-0">
        <div class="pt-4 border-t border-zinc-800/70 flex items-center justify-between">
          <span class="text-lg font-black text-zinc-100 font-display">₹${item.price}</span>
          <button onclick="addToCart(${item.id})" class="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition active:scale-95 shadow-md shadow-violet-600/30">
            + Add to Tray
          </button>
        </div>
      </div>
    `;
    menuGrid.appendChild(card);
  });
}

// 4. Cart State Management
function addToCart(itemId) {
  const existing = cart.find(i => i.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    const product = menuData.find(i => i.id === itemId);
    cart.push({ ...product, qty: 1 });
  }
  updateCartState();
}

function updateQuantity(itemId, delta) {
  const item = cart.find(i => i.id === itemId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== itemId);
  updateCartState();
}

function updateCartState() {
  localStorage.setItem('nocturne_cart', JSON.stringify(cart));
  
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  navCartBadge.textContent = totalItems;
  cartDrawerCount.textContent = `(${totalItems} items)`;

  // Show floating bar only when items are selected
  if (totalItems > 0) {
    floatingCartBar.classList.remove('hidden');
    floatItemCount.textContent = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'} Selected`;
  } else {
    floatingCartBar.classList.add('hidden');
    closeCart();
  }

  renderCartDrawer();
  updateTotals();
}

function renderCartDrawer() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="text-center py-16 text-zinc-500">
        <div class="text-3xl mb-2">🍽️</div>
        <p class="text-xs">Your tray is empty.</p>
      </div>`;
    return;
  }

  cartItemsContainer.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = "flex items-center justify-between bg-obsidian/70 p-3.5 rounded-2xl border border-zinc-800/80";
    row.innerHTML = `
      <div>
        <h4 class="text-xs font-bold text-zinc-200 font-display">${item.name}</h4>
        <div class="text-xs text-zinc-400 mt-0.5">₹${item.price} × ${item.qty} = <span class="text-violet-400 font-bold">₹${item.price * item.qty}</span></div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="updateQuantity(${item.id}, -1)" class="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center">−</button>
        <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
        <button onclick="updateQuantity(${item.id}, 1)" class="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center">+</button>
      </div>
    `;
    cartItemsContainer.appendChild(row);
  });
}

function updateTotals() {
  if (cart.length === 0) {
    calcSubtotal.textContent = '₹0';
    calcTax.textContent = '₹0';
    calcTotal.textContent = '₹0';
    floatTotalPrice.textContent = '₹0';
    return;
  }

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const tax = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + tax + PACKAGING_FEE;

  calcSubtotal.textContent = `₹${subtotal}`;
  calcTax.textContent = `₹${tax}`;
  calcTotal.textContent = `₹${grandTotal}`;
  floatTotalPrice.textContent = `₹${grandTotal}`;
}

// 5. Drawer Controls
function openCart() {
  cartDrawer.classList.remove('translate-x-full');
  cartBackdrop.classList.remove('hidden');
}

function closeCart() {
  cartDrawer.classList.add('translate-x-full');
  cartBackdrop.classList.add('hidden');
}

viewTrayBtn.addEventListener('click', openCart);
navCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);

// 6. Navigation Guard for Empty Cart
if (proceedPaymentBtn) {
  proceedPaymentBtn.addEventListener('click', (e) => {
    if (cart.length === 0) {
      e.preventDefault();
      alert("Please add at least one item to your tray before proceeding to payment.");
    }
  });
}

// 7. Category Filters
categoryFilters.addEventListener('click', (e) => {
  const btn = e.target.closest('.cat-btn');
  if (!btn) return;
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.remove('bg-violet-600', 'text-white', 'shadow-md', 'shadow-violet-600/30');
    b.classList.add('bg-surface', 'text-zinc-400');
  });
  btn.classList.add('bg-violet-600', 'text-white', 'shadow-md', 'shadow-violet-600/30');
  btn.classList.remove('bg-surface', 'text-zinc-400');
  renderMenu(btn.getAttribute('data-category'));
});

// Initial Load
renderMenu();
updateCartState();