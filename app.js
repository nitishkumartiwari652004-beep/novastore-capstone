const API_URL = "https://fakestoreapi.com/products";
const $ = (selector) => document.querySelector(selector);

const state = {
  products: [],
  category: "all",
  search: "",
  maxPrice: 1000,
  minRating: false,
  inStock: false,
  sort: "featured",
  cart: JSON.parse(localStorage.getItem("novastore-cart") || "{}")
};

const ui = {
  grid: $("#productGrid"), status: $("#status"), categories: $("#categoryFilters"),
  summary: $("#resultSummary"), search: $("#searchInput"), sort: $("#sortSelect"),
  price: $("#priceRange"), priceValue: $("#priceValue"), rating: $("#ratingFilter"),
  stock: $("#inStockFilter"), cart: $("#cartDrawer"), backdrop: $("#cartBackdrop"),
  cartItems: $("#cartItems"), cartCount: $("#cartCount"), subtotal: $("#cartSubtotal"),
  toast: $("#toast"), dialog: $("#productDialog")
};

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

async function fetchProducts() {
  ui.status.textContent = "Loading the collection…";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Product service returned ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Unexpected product data received.");
    state.products = data;
    renderCategories();
    renderProducts();
    ui.status.textContent = "";
  } catch (error) {
    ui.status.textContent = `${error.message}. Check your internet connection and refresh.`;
    ui.status.classList.add("error");
  }
}

function renderCategories() {
  const categories = ["all", ...new Set(state.products.map(product => product.category))];
  ui.categories.replaceChildren();
  categories.forEach(category => {
    const label = document.createElement("label");
    label.className = "category-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "category";
    input.value = category;
    input.checked = state.category === category;
    input.addEventListener("change", () => {
      state.category = category;
      renderProducts();
    });
    const text = document.createElement("span");
    text.textContent = category === "all" ? "All products" : category;
    label.append(input, text);
    ui.categories.append(label);
  });
}

function getVisibleProducts() {
  let products = state.products.filter(product => {
    const matchesCategory = state.category === "all" || product.category === state.category;
    const matchesSearch = `${product.title} ${product.description} ${product.category}`
      .toLowerCase().includes(state.search);
    const matchesPrice = product.price <= state.maxPrice;
    const matchesRating = !state.minRating || product.rating.rate >= 4;
    // Fake Store API does not provide inventory, so this demo treats all returned items as available.
    const matchesStock = !state.inStock || true;
    return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesStock;
  });

  switch (state.sort) {
    case "price-asc": products.sort((a, b) => a.price - b.price); break;
    case "price-desc": products.sort((a, b) => b.price - a.price); break;
    case "rating": products.sort((a, b) => b.rating.rate - a.rating.rate); break;
    case "name": products.sort((a, b) => a.title.localeCompare(b.title)); break;
  }
  return products;
}

function renderProducts() {
  const products = getVisibleProducts();
  ui.grid.replaceChildren();
  ui.summary.textContent = `${products.length} products`;
  $("#emptyState").hidden = products.length !== 0;

  products.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image-wrap" role="button" tabindex="0" aria-label="View ${escapeHTML(product.title)}">
        <img class="product-image" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.title)}" loading="lazy">
      </div>
      <p class="product-category">${escapeHTML(product.category)}</p>
      <h3 class="product-title" tabindex="0">${escapeHTML(product.title)}</h3>
      <p class="product-rating" aria-label="${product.rating.rate} out of 5 stars">★ ${product.rating.rate} <span>(${product.rating.count} reviews)</span></p>
      <div class="product-bottom"><strong class="product-price">${money(product.price)}</strong><button class="add-button" type="button">Add to bag +</button></div>`;
    const imageWrap = card.querySelector(".product-image-wrap");
    const title = card.querySelector(".product-title");
    [imageWrap, title].forEach(target => {
      target.addEventListener("click", () => openProduct(product.id));
      target.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openProduct(product.id); }
      });
    });
    card.querySelector(".add-button").addEventListener("click", () => addToCart(product.id));
    ui.grid.append(card);
  });
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveCart();
  renderCart();
  showToast("Added to your bag");
}

function saveCart() {
  localStorage.setItem("novastore-cart", JSON.stringify(state.cart));
}

function cartProducts() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => ({ product: state.products.find(item => item.id === Number(id)), quantity }))
    .filter(item => item.product && item.quantity > 0);
}

function renderCart() {
  const items = cartProducts();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  ui.cartCount.textContent = count;
  $("#drawerCount").textContent = `(${count})`;
  ui.subtotal.textContent = money(subtotal);
  ui.cartItems.replaceChildren();

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Your bag is empty. Find something you love!";
    ui.cartItems.append(empty);
  }

  items.forEach(({ product, quantity }) => {
    const line = document.createElement("div");
    line.className = "cart-line";
    line.innerHTML = `
      <img src="${escapeHTML(product.image)}" alt="">
      <div><h4>${escapeHTML(product.title)}</h4><p>${money(product.price)} each</p>
        <div class="quantity-controls">
          <button type="button" data-action="minus" aria-label="Decrease quantity">−</button>
          <span>${quantity}</span>
          <button type="button" data-action="plus" aria-label="Increase quantity">+</button>
        </div>
        <button class="remove-button" type="button" data-action="remove">Remove</button>
      </div><strong>${money(product.price * quantity)}</strong>`;
    line.querySelector('[data-action="minus"]').addEventListener("click", () => changeQuantity(product.id, -1));
    line.querySelector('[data-action="plus"]').addEventListener("click", () => changeQuantity(product.id, 1));
    line.querySelector('[data-action="remove"]').addEventListener("click", () => {
      delete state.cart[product.id]; saveCart(); renderCart();
    });
    ui.cartItems.append(line);
  });
}

function changeQuantity(id, delta) {
  state.cart[id] = (state.cart[id] || 0) + delta;
  if (state.cart[id] <= 0) delete state.cart[id];
  saveCart();
  renderCart();
}

function openCart() {
  ui.cart.classList.add("open");
  ui.cart.setAttribute("aria-hidden", "false");
  ui.backdrop.hidden = false;
  $("#closeCart").focus();
}
function closeCart() {
  ui.cart.classList.remove("open");
  ui.cart.setAttribute("aria-hidden", "true");
  ui.backdrop.hidden = true;
  $("#cartToggle").focus();
}

function openProduct(id) {
  const product = state.products.find(item => item.id === id);
  if (!product) return;
  $("#dialogContent").innerHTML = `
    <div class="dialog-product">
      <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.title)}">
      <div><p class="product-category">${escapeHTML(product.category)}</p>
        <h2>${escapeHTML(product.title)}</h2>
        <p>★ ${product.rating.rate} · ${product.rating.count} reviews</p>
        <p>${escapeHTML(product.description)}</p>
        <strong class="product-price">${money(product.price)}</strong>
        <button id="dialogAdd" class="primary-button" type="button">Add to bag</button>
      </div>
    </div>`;
  $("#dialogAdd").addEventListener("click", () => { addToCart(product.id); ui.dialog.close(); });
  ui.dialog.showModal();
}

let toastTimer;
function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove("show"), 1800);
}

$("#searchForm").addEventListener("submit", event => { event.preventDefault(); state.search = ui.search.value.trim().toLowerCase(); renderProducts(); });
ui.search.addEventListener("input", () => { state.search = ui.search.value.trim().toLowerCase(); renderProducts(); });
ui.sort.addEventListener("change", () => { state.sort = ui.sort.value; renderProducts(); });
ui.price.addEventListener("input", () => { state.maxPrice = Number(ui.price.value); ui.priceValue.textContent = money(state.maxPrice); renderProducts(); });
ui.rating.addEventListener("change", () => { state.minRating = ui.rating.checked; renderProducts(); });
ui.stock.addEventListener("change", () => { state.inStock = ui.stock.checked; renderProducts(); });
function resetFilters() {
  state.category = "all"; state.search = ""; state.maxPrice = 1000; state.minRating = false; state.inStock = false; state.sort = "featured";
  ui.search.value = ""; ui.price.value = 1000; ui.priceValue.textContent = money(1000); ui.rating.checked = false; ui.stock.checked = false; ui.sort.value = "featured";
  renderCategories(); renderProducts();
}
$("#clearFilters").addEventListener("click", resetFilters);
$("#resetEmpty").addEventListener("click", resetFilters);
$("#cartToggle").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#continueShopping").addEventListener("click", closeCart);
ui.backdrop.addEventListener("click", closeCart);
$("#closeDialog").addEventListener("click", () => ui.dialog.close());
$("#checkoutButton").addEventListener("click", () => showToast("Demo checkout — no payment is processed."));
$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("novastore-theme", dark ? "dark" : "light");
  $("#themeToggle").textContent = dark ? "☀" : "☾";
});
if (localStorage.getItem("novastore-theme") === "dark") {
  document.body.classList.add("dark"); $("#themeToggle").textContent = "☀";
}
document.addEventListener("keydown", event => { if (event.key === "Escape" && ui.cart.classList.contains("open")) closeCart(); });

renderCart();
fetchProducts();
