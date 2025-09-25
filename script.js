/* RR Crackers – Dynamic products + cart (compat version) */

/* ------- SELECTORS (data-* hooks) ------- */
var SEL = {
  productList:  "[data-product-list]",
  cartDrawer:   "[data-cart-drawer]",
  cartBackdrop: "[data-cart-backdrop]",
  cartItems:    "[data-cart-items]",
  cartTotal:    "[data-cart-total]",
  cartCount:    "[data-cart-count]",
  openCart:     "[data-open-cart]",
  closeCart:    "[data-close-cart]",
  checkout:     "[data-checkout-btn]"
};

/* ------- CATALOG (replace with your real items/images) ------- */
/* NOTE: If your image filename contains spaces, encode them as %20 */
var products = [
  {
    id: 101,
    name: "10 CM Crackling Sparklers",
    unit: "[5 BOX] (10 Pcs)",
    price: 80,
    mrp: 400,
    image: "asserts/product_image_22_08_2024_05_26_25%202.png"
  },
  {
    id: 102,
    name: "Flower Pots (Medium)",
    unit: "[3 BOX] (6 Pcs)",
    price: 299,
    mrp: 699,
    image: "asserts/flowerpots.png"
  },
  {
    id: 103,
    name: "Ground Chakkar",
    unit: "[1 BOX] (10 Pcs)",
    price: 249,
    mrp: 499,
    image: "asserts/chakkars.png"
  },
  {
    id: 104,
    name: "Kids Combo Box",
    unit: "[1 BOX]",
    price: 499,
    mrp: 999,
    image: "asserts/kids.png"
  },{
    id: 101,
    name: "10 CM Crackling Sparklers",
    unit: "[5 BOX] (10 Pcs)",
    price: 80,
    mrp: 400,
    image: "asserts/product_image_22_08_2024_05_26_25%202.png"
  },
  {
    id: 102,
    name: "Flower Pots (Medium)",
    unit: "[3 BOX] (6 Pcs)",
    price: 299,
    mrp: 699,
    image: "asserts/flowerpots.png"
  },
  {
    id: 103,
    name: "Ground Chakkar",
    unit: "[1 BOX] (10 Pcs)",
    price: 249,
    mrp: 499,
    image: "asserts/chakkars.png"
  },
  {
    id: 104,
    name: "Kids Combo Box",
    unit: "[1 BOX]",
    price: 499,
    mrp: 999,
    image: "asserts/kids.png"
  }
];

/* ------- STATE ------- */
var cart = []; // [{ id, name, unit, price, mrp, image, qty }]

/* ------- UTILS ------- */
function $(sel) { return document.querySelector(sel); }
function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(n);
}
function offPct(p) {
  return (p.mrp && p.mrp > p.price) ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
}
function saveCart() {
  try { localStorage.setItem("rr_cart", JSON.stringify(cart)); } catch (e) {}
}
function loadCart() {
  try {
    var saved = localStorage.getItem("rr_cart");
    if (saved) {
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) cart = parsed;
    }
  } catch (e) {}
}
function totalQty()  { return cart.reduce(function(n, i){ return n + i.qty; }, 0); }
function totalPrice(){ return cart.reduce(function(s, i){ return s + i.price * i.qty; }, 0); }

/* ------- RENDER: PRODUCTS ------- */
function renderProducts() {
  var grid = $(SEL.productList);
  if (!grid) return;
  var html = products.map(function(p){
    var off = offPct(p);
    return '' +
      '<div class="product-card" data-id="'+p.id+'">' +
        (off ? '<div class="discount-badge">'+off+'% OFF</div>' : '') +
        '<img src="'+p.image+'" alt="'+p.name+'">' +
        '<h3>'+p.name+'</h3>' +
        (p.unit ? '<p class="subtext">'+p.unit+'</p>' : '') +
        '<div class="price">' +
          '<span class="sale">'+formatINR(p.price)+'</span>' +
          (p.mrp && p.mrp > p.price ? '<span class="original">'+formatINR(p.mrp)+'</span>' : '') +
        '</div>' +
        '<button class="add-to-cart" data-action="add" data-id="'+p.id+'">Add to cart</button>' +
      '</div>';
  }).join("");
  grid.innerHTML = html;
}

/* ------- CART OPS ------- */
function addToCart(id) {
  var prod = products.find(function(p){ return p.id === id; });
  if (!prod) return;
  var existing = cart.find(function(i){ return i.id === id; });
  if (existing) existing.qty += 1;
  else cart.push(Object.assign({}, prod, { qty: 1 }));
  persistAndRender();
  openCart();
}
function removeFromCart(id) {
  cart = cart.filter(function(i){ return i.id !== id; });
  persistAndRender();
}
function setQty(id, qty) {
  var item = cart.find(function(i){ return i.id === id; });
  if (!item) return;
  var q = parseInt(qty, 10);
  if (isNaN(q) || q < 1) q = 1;
  item.qty = q;
  persistAndRender();
}
function persistAndRender() {
  saveCart();
  renderCart();
  updateBadge();
}

/* ------- RENDER: CART ------- */
function renderCart() {
  var list = $(SEL.cartItems);
  var totalEl = $(SEL.cartTotal);
  if (!list || !totalEl) return;

  if (!cart.length) {
    list.innerHTML = '<li class="cart-empty" style="padding:16px;color:#666;">Your cart is empty.</li>';
    totalEl.textContent = formatINR(0);
    return;
  }

  var html = cart.map(function(i){
    return '' +
      '<li class="cart-item" data-id="'+i.id+'">' +
        '<img class="cart-thumb" src="'+i.image+'" alt="'+i.name+'">' +
        '<div class="cart-info">' +
          '<p class="cart-name">'+i.name+'</p>' +
          (i.unit ? '<p class="cart-unit">'+i.unit+'</p>' : '') +
          '<p class="cart-price">'+formatINR(i.price)+'</p>' +
          '<div class="cart-qty">' +
            '<button class="qty-btn" data-action="dec" data-id="'+i.id+'">−</button>' +
            '<input class="qty-input" type="number" min="1" value="'+i.qty+'" data-id="'+i.id+'">' +
            '<button class="qty-btn" data-action="inc" data-id="'+i.id+'">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-line">' +
          '<button class="cart-remove" data-action="remove" data-id="'+i.id+'" title="Remove">×</button>' +
          '<p class="line-total">'+formatINR(i.price * i.qty)+'</p>' +
        '</div>' +
      '</li>';
  }).join("");
  list.innerHTML = html;

  totalEl.textContent = formatINR(totalPrice());
}

function updateBadge() {
  var badge = $(SEL.cartCount);
  if (!badge) return;
  var q = totalQty();
  badge.textContent = String(q);
  badge.setAttribute("aria-label", q + " item" + (q !== 1 ? "s" : ""));
  badge.style.display = q ? "" : "none";
}

/* ------- DRAWER ------- */
function openCart() {
  var drawer = $(SEL.cartDrawer);
  var backdrop = $(SEL.cartBackdrop);
  if (drawer) drawer.classList.add("open");
  if (backdrop) backdrop.classList.add("show");
}
function closeCart() {
  var drawer = $(SEL.cartDrawer);
  var backdrop = $(SEL.cartBackdrop);
  if (drawer) drawer.classList.remove("open");
  if (backdrop) backdrop.classList.remove("show");
}

/* ------- EVENTS ------- */
function wireEvents() {
  // mobile nav toggle (moved from inline)
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function(){
      nav.classList.toggle("open");
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
    });
  }

  // hero CTA scroll to products
  var heroBtn = document.querySelector(".hero-cta");
  if (heroBtn) {
    heroBtn.addEventListener("click", function(){
      var target = document.querySelector("[data-product-list]");
      if (target && target.scrollIntoView) target.scrollIntoView({ behavior: "smooth" });
    });
  }

  // product grid: add to cart (delegation)
  var grid = $(SEL.productList);
  if (grid) {
    grid.addEventListener("click", function(e){
      var btn = e.target && e.target.closest ? e.target.closest("[data-action='add']") : null;
      if (!btn) return;
      var id = parseInt(btn.getAttribute("data-id"), 10);
      addToCart(id);
    });
  }

  // cart list: inc/dec/remove + qty input
  var list = $(SEL.cartItems);
  if (list) {
    list.addEventListener("click", function(e){
      var el = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
      if (!el) return;
      var id = parseInt(el.getAttribute("data-id"), 10);
      var action = el.getAttribute("data-action");
      if (action === "inc") {
        var item1 = cart.find(function(x){ return x.id === id; });
        if (item1) setQty(id, item1.qty + 1);
      } else if (action === "dec") {
        var item2 = cart.find(function(x){ return x.id === id; });
        if (item2) setQty(id, Math.max(1, item2.qty - 1));
      } else if (action === "remove") {
        removeFromCart(id);
      }
    });

    list.addEventListener("change", function(e){
      var input = e.target && e.target.classList && e.target.classList.contains("qty-input") ? e.target : null;
      if (!input) return;
      var id = parseInt(input.getAttribute("data-id"), 10);
      setQty(id, input.value);
    });
  }

  // open/close
  var openBtn = $(SEL.openCart);
  if (openBtn) openBtn.addEventListener("click", function(e){ e.preventDefault(); openCart(); });

  var closeBtn = $(SEL.closeCart);
  if (closeBtn) closeBtn.addEventListener("click", closeCart);

  var backdrop = $(SEL.cartBackdrop);
  if (backdrop) backdrop.addEventListener("click", closeCart);

  document.addEventListener("keydown", function(e){
    if (e.key === "Escape") closeCart();
  });

  // checkout (demo)
  var checkout = $(SEL.checkout);
  if (checkout) {
    checkout.addEventListener("click", function(){
      if (!cart.length) { alert("Your cart is empty."); return; }
      alert("Checkout (demo)\nItems: " + totalQty() + "\nTotal: " + formatINR(totalPrice()) + "\n\nReplace with your real checkout flow.");
      cart = [];
      persistAndRender();
      closeCart();
    });
  }
}

/* ------- BOOT ------- */
document.addEventListener("DOMContentLoaded", function(){
  loadCart();
  renderProducts();
  renderCart();
  updateBadge();
  wireEvents();
});
