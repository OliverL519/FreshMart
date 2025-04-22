// script.js

// 1. Sub‑category definitions
const SUBCATEGORIES = {
  Snacks:    ["Chips", "Savory"],
  Beverages: ["Dairy", "Hot Drinks"],
  Pantry:    ["Oils", "Grains"],
  Fruit:     ["Melons", "Citrus"]
};

// 2. Product catalog (with subcategory)
const products = [
  { id: 1, name: "Chips",      unit: "75g",  price: 3.50,  stock: 30, img: "images/Chips.jpg",      category: "Snacks",    subcategory: "Chips"  },
  { id: 2, name: "Milk",       unit: "1L",    price: 2.50,  stock: 20, img: "images/Milk.jpg",       category: "Beverages", subcategory: "Dairy"  },
  { id: 3, name: "Oil",  unit: "500ml", price: 10.00, stock: 15, img: "images/oil.jpg",       category: "Pantry",    subcategory: "Oils"   },
  { id: 4, name: "Watermelon", unit: "Whole", price: 7.00,  stock:  5, img: "images/Watermelon.jpg",category: "Fruit",     subcategory: "Melons" }
];

// 3. Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("fm_cart") || "[]");

// 4. Initialize everything on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  renderProducts(products);
  updateCartUI();
  attachSearchHandlers();
  attachCartHandlers();
  attachDeliveryFormHandler();
});

// 5. Render main categories with sub‑category dropdown
function renderCategories() {
  const navList = document.getElementById("category-list");
  navList.innerHTML = "";
  const cats = [...new Set(products.map(p => p.category))];
  cats.forEach(cat => {
    const li = document.createElement("li");
    li.className = "nav-item";

    // Main category link
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = cat;
    a.addEventListener("click", e => {
      e.preventDefault();
      filterByCategory(cat);
    });
    li.appendChild(a);

    // Sub‑category dropdown
    const subs = SUBCATEGORIES[cat] || [];
    if (subs.length) {
      const dropdown = document.createElement("ul");
      dropdown.className = "dropdown";
      subs.forEach(sub => {
        const li2 = document.createElement("li");
        const a2 = document.createElement("a");
        a2.href = "#";
        a2.textContent = sub;
        a2.addEventListener("click", e => {
          e.preventDefault();
          filterBySubcategory(cat, sub);
        });
        li2.appendChild(a2);
        dropdown.appendChild(li2);
      });
      li.appendChild(dropdown);
    }

    navList.appendChild(li);
  });
}

function filterByCategory(cat) {
  const list = products.filter(p => p.category === cat);
  renderProducts(list);
  updateCartUI();
}

function filterBySubcategory(cat, sub) {
  const list = products.filter(p => p.category === cat && p.subcategory === sub);
  renderProducts(list);
  updateCartUI();
}

// 6. Render products in the grid
function renderProducts(list) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="card-content">
        <h3>${p.name}</h3>
        <p class="price">$${p.price.toFixed(2)}</p>
        <p class="unit-stock">${p.unit} • ${p.stock} in stock</p>
        <button class="btn add-to-cart" data-id="${p.id}" ${p.stock===0?"disabled":""}>
          Add to Cart
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", addToCart);
  });
}

// 7. Search functionality
function attachSearchHandlers() {
  console.log("Initializing search handlers…");
  const box = document.getElementById("search-box");
  const btn = document.getElementById("search-button");
  if (!box || !btn) {
    console.error("Search elements missing:", box, btn);
    return;
  }

  const doSearch = () => {
    const term = box.value.trim().toLowerCase();
    console.log("Searching for:", term);
    const results = products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.subcategory.toLowerCase().includes(term)
    );
    renderProducts(results);
    updateCartUI();
  };

  btn.addEventListener("click", doSearch);
  box.addEventListener("keyup", e => {
    if (e.key === "Enter") doSearch();
  });
}

// 8. Cart operations
function addToCart(e) {
  const id = +e.target.dataset.id;
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else       cart.push({ id, qty: 1 });
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("fm_cart", JSON.stringify(cart));
}

function updateCartUI() {
  document.getElementById("cart-count").textContent = cart.reduce((sum, i) => sum + i.qty, 0);
  renderCartItems();
  const orderBtn = document.getElementById("order-button");
  if (orderBtn) {
    orderBtn.disabled = cart.length === 0;
    orderBtn.classList.toggle("disabled", cart.length === 0);
  }
}

// 9. Render cart popup items
function renderCartItems() {
  const container = document.getElementById("cart-items");
  container.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    total += p.price * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-inner">
        <img class="cart-thumb" src="${p.img}" alt="${p.name}">
        <div class="cart-info">
          <h4>${p.name}</h4>
          <p>${p.unit}</p>
          <p>$${p.price.toFixed(2)} each</p>
        </div>
        <div class="cart-controls">
          <input type="number"
                 class="cart-qty-input"
                 data-id="${p.id}"
                 min="1"
                 max="${p.stock}"
                 value="${item.qty}" />
          <button class="remove-item" data-id="${p.id}">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  document.getElementById("total-price").textContent = total.toFixed(2);

  container.querySelectorAll(".cart-qty-input").forEach(input => {
    input.addEventListener("change", e => {
      const id = +e.target.dataset.id;
      let v = +e.target.value;
      v = Math.max(1, Math.min(v, +e.target.max));
      cart = cart.map(i => i.id === id ? { id, qty: v } : i);
      saveCart();
      updateCartUI();
    });
  });

  container.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = +e.target.dataset.id;
      cart = cart.filter(i => i.id !== id);
      saveCart();
      updateCartUI();
    });
  });
}

// 10. Cart popup controls
function attachCartHandlers() {
  document.getElementById("cart-button").addEventListener("click", () => {
    document.getElementById("shopping-cart").classList.toggle("hidden");
  });
  document.getElementById("close-cart").addEventListener("click", () => {
    document.getElementById("shopping-cart").classList.add("hidden");
  });
  document.getElementById("clear-cart").addEventListener("click", () => {
    cart = [];
    saveCart();
    updateCartUI();
  });
  document.getElementById("order-button").addEventListener("click", () => {
    window.location.href = "/delivery.html";
  });
}

// 11. Delivery form handler (validation + stock check)
function attachDeliveryFormHandler() {
  const form = document.getElementById("delivery-form");
  const submitBtn = document.getElementById("submit-order");
  if (!form || !submitBtn) return;

  // Enable/disable submit button on input
  form.addEventListener("input", () => {
    const valid = form.checkValidity();
    submitBtn.disabled = !valid;
    submitBtn.classList.toggle("disabled", !valid);
  });

  // On submit, re‑check stock and let form action proceed to confirmation.html
  form.addEventListener("submit", e => {
    const outOfStock = cart.some(i => i.qty > products.find(p => p.id === i.id).stock);
    if (outOfStock) {
      e.preventDefault();
      alert("One or more items are out of stock. Please adjust your cart.");
      window.location.href = "/";
    }
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("delivery-form");
  const submitBtn = document.getElementById("submit-order");

 
  form.addEventListener("input", () => {
    if (form.checkValidity()) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("disabled");
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.add("disabled");
    }
  });

  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const params = new URLSearchParams(new FormData(form)).toString();
   
    window.location.href = `../confirmation.html?${params}`;
  });
});
