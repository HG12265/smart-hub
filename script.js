/* =================== Config =================== */
const TAX_MAP = { mobile:0.12, tablet:0.12, accessory:0.18, laptop:0.18, tv:0.18 };
const DEFAULT_TAX_RATE = 0.18;
const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_FEE = 199;
const COUPONS = {
  "DISCOUNT10": { type:"percent", value:0.10, label:"10% off" },
  "FREESHIP": { type:"freeship", label:"Free Shipping" }
};

/* ========= Products (extended) ========= */
let products = [
  {id:1,name:"Smartphone",price:15000,category:"mobile",img:"images/smartphone.jpg",rating:4.6,desc:"Sleek phone with great battery and camera."},
  {id:2,name:"Tablet",price:20000,category:"tablet",img:"images/tablet.jpg",rating:4.4,desc:"10-inch tablet for study, binge & games."},
  {id:3,name:"Power Bank",price:1200,category:"accessory",img:"images/powerbank.jpeg",rating:4.2,desc:"10000mAh fast charging power bank."},
  {id:4,name:"Charger",price:800,category:"accessory",img:"images/charger.jpeg",rating:4.0,desc:"18W fast charger with cable."},
  {id:5,name:"Bluetooth Headphones",price:2500,category:"accessory",img:"images/headphone.jpeg",rating:4.3,desc:"Wireless, comfy, long battery life."},
  {id:6,name:"Back Cover",price:400,category:"accessory",img:"images/backcover.webp",rating:4.1,desc:"Shockproof TPU cover."},
  {id:7,name:"Smart Watch",price:5000,category:"accessory",img:"images/smartwatch.jpeg",rating:4.5,desc:"Fitness tracking & notifications."},
  {id:8,name:"Wireless Charger",price:1500,category:"accessory",img:"images/wirelesscharger.jpeg",rating:4.0,desc:"Qi-compatible wireless charging pad."},
  {id:9,name:"Screen Protector",price:300,category:"accessory",img:"images/screenprotector.jpeg",rating:3.9,desc:"Tempered glass, bubble-free."},
  {id:10,name:"Earbuds",price:2000,category:"accessory",img:"images/earbuds.jpeg",rating:4.2,desc:"True wireless earbuds with mic."},
  {id:11,name:"Gaming Laptop",price:55000,category:"laptop",img:"images/gaminglaptop.jpeg",rating:4.7,desc:"Powerful laptop with dedicated GPU for gaming & dev."},
  {id:12,name:"iPhone 15 Pro",price:120000,category:"mobile",img:"images/iphone.jpeg",rating:4.8,desc:"Flagship performance, premium camera."},
  {id:13,name:"AirPods Pro 2",price:25000,category:"accessory",img:"images/airbudspro.jpeg",rating:4.6,desc:"Active Noise Cancellation, improved sound."},
  {id:14,name:"Smart TV 55\"",price:45000,category:"tv",img:"images/tv.jpeg",rating:4.5,desc:"4K UHD Smart TV with HDR & streaming apps."}
];
/* ===== Mobile Nav Toggle ===== */
function toggleMenu(){
  document.querySelector(".nav").classList.toggle("show");
}

/* ========== Helpers ========== */
const $ = (sel) => document.querySelector(sel);
const byId = (id) => document.getElementById(id);

function formatINR(n){ return "₹" + Number(n).toLocaleString("en-IN"); }

function getCart(){ return JSON.parse(localStorage.getItem("cart")) || []; }
function saveCart(c){ localStorage.setItem("cart", JSON.stringify(c)); }

function getWishlist(){ return JSON.parse(localStorage.getItem("wishlist")) || []; }
function saveWishlist(w){ localStorage.setItem("wishlist", JSON.stringify(w)); }

function getAppliedCoupon(){ return localStorage.getItem("appliedCoupon") || null; }
function setAppliedCoupon(code){ if(code) localStorage.setItem("appliedCoupon", code); else localStorage.removeItem("appliedCoupon"); }

function updateCartCount(){
  const count = getCart().reduce((s,i)=> s + (i.qty||0), 0);
  const el = byId("cartCount");
  if(el) el.textContent = count;
}
function updateWishCount(){
  const count = getWishlist().length;
  const el = byId("wishCount");
  if(el) el.textContent = count;
}

function starsHTML(rating){
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

/* ========= Theme ========= */
(function initTheme(){
  const btn = byId("themeToggle");
  const apply = (mode) => document.body.classList.toggle("dark", mode==="dark");
  let mode = localStorage.getItem("theme") || "light";
  apply(mode);
  if(btn){
    btn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    btn.onclick = ()=>{
      mode = document.body.classList.contains("dark") ? "light" : "dark";
      localStorage.setItem("theme", mode);
      apply(mode);
      btn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    };
  }
})();

/* ========= Products Rendering ========= */
function renderProducts(list){
  const container = byId("productContainer");
  if(!container) return;
  const wishlist = getWishlist();
  container.innerHTML = "";
  list.forEach((item, index)=>{
    const badge = index < 3 ? `<div class="badge">10% OFF</div>` : "";
    const wished = wishlist.includes(item.id) ? "wish active" : "wish";
    container.innerHTML += `
      <div class="product">
        ${badge}
        <button class="${wished}" title="Add to wishlist" onclick="toggleWishlist(${item.id})">♥</button>
        <img src="${item.img}" alt="${item.name}" onclick="openModal(${item.id})"/>
        <h3>${item.name}</h3>
        <div class="stars" aria-label="Rating ${item.rating}">${starsHTML(item.rating)}</div>
        <p class="price">${formatINR(item.price)}</p>
        <button class="btn" onclick="addToCartById(${item.id})">Add to Cart</button>
      </div>
    `;
  });
}

/* ========= Filter/Search/Sort ========= */
function filterCategory(){
  const cat = byId("categoryFilter")?.value || "all";
  const list = cat==="all" ? products : products.filter(p => p.category===cat);
  renderProducts(list);
}
function searchProduct(){
  const keyword = byId("searchBar").value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
  renderProducts(filtered);
}
function sortProducts(){
  const mode = byId("sortSelect").value;
  let list = [...products];
  if(mode==="price-asc") list.sort((a,b)=>a.price-b.price);
  if(mode==="price-desc") list.sort((a,b)=>b.price-a.price);
  if(mode==="rating-desc") list.sort((a,b)=>b.rating-a.rating);
  renderProducts(list);
}

/* ========= Modal (with wishlist) ========= */
function openModal(id){
  const modal = byId("productModal");
  const prod = products.find(p=>p.id===id);
  if(!modal || !prod) return;
  byId("modalImg").src = prod.img;
  byId("modalName").textContent = prod.name;
  byId("modalPrice").textContent = formatINR(prod.price);
  byId("modalDesc").textContent = prod.desc || "";
  byId("modalRating").innerHTML = starsHTML(prod.rating || 0);
  const btn = byId("modalAddBtn");
  btn.onclick = ()=> addToCartById(prod.id);
  const wbtn = byId("modalWishBtn");
  wbtn.onclick = ()=> { toggleWishlist(prod.id); updateModalWish(prod.id); };
  updateModalWish(prod.id);
  modal.style.display = "block";
}
function updateModalWish(id){
  const w = getWishlist();
  const el = byId("modalWishBtn");
  if(!el) return;
  el.textContent = w.includes(id) ? "♥ Wishlisted" : "♥ Wishlist";
}
function closeModal(){ const m = byId("productModal"); if(m) m.style.display="none"; }
window.onclick = function(e){ const m = byId("productModal"); if(e.target===m) closeModal(); };

/* ========= Wishlist ========= */
function toggleWishlist(id){
  let w = getWishlist();
  if(w.includes(id)) { w = w.filter(x=>x!==id); }
  else { w.push(id); }
  saveWishlist(w);
  updateWishCount();
  // update product cards UI if present
  document.querySelectorAll(".product").forEach(card=>{
    const btn = card.querySelector(".wish");
    if(!btn) return;
    // try to infer id from add button onclick attribute (safe fallback)
  });
  // refresh current product list or wishlist page if visible
  if(document.title.includes("Products")) filterCategory();
  if(document.title.includes("Wishlist")) renderWishlist();
  updateModalWish(id);
}

/* ========= Cart Logic ========= */
function addToCartById(id){
  const prod = products.find(p=>p.id===id);
  if(!prod) { alert("Product not found"); return; }
  let cart = getCart();
  let exists = cart.find(item => item.id === id);
  if(exists){
    exists.qty += 1;
    exists.total = exists.price * exists.qty;
  } else {
    cart.push({id: prod.id, product: prod.name, price: prod.price, img: prod.img, qty:1, total:prod.price});
  }
  saveCart(cart);
  updateCartCount();
  alert(prod.name + " added to cart!");
}

/* ========= Utility: product lookup for cart items ========= */
function getProductForCartItem(item){
  if(item.id) {
    const p = products.find(x => x.id === item.id);
    if(p) return p;
  }
  return products.find(x => x.name === item.product) || null;
}

/* ========= Totals & Coupons & Shipping ========= */
function computeTotals(cart){
  let subtotal = 0;
  cart.forEach(it => subtotal += (it.total || it.price * (it.qty||1)));
  const appliedCoupon = getAppliedCoupon();
  let discountRate = 0;
  let isFreeShipCoupon = false;
  if(appliedCoupon && COUPONS[appliedCoupon]){
    const c = COUPONS[appliedCoupon];
    if(c.type === "percent") discountRate = c.value;
    if(c.type === "freeship") isFreeShipCoupon = true;
  }
  const discountAmount = Math.round(subtotal * discountRate);

  // tax - distribute discount proportionally across items
  let taxSum = 0;
  cart.forEach(item=>{
    const itemTotal = (item.total || item.price * (item.qty||1));
    const share = subtotal > 0 ? (itemTotal / subtotal) : 0;
    const itemDiscount = Math.round(discountAmount * share);
    const itemEffective = itemTotal - itemDiscount;
    const prod = getProductForCartItem(item);
    const rate = prod ? (TAX_MAP[prod.category] ?? DEFAULT_TAX_RATE) : DEFAULT_TAX_RATE;
    taxSum += itemEffective * rate;
  });
  const tax = Math.round(taxSum);

  // shipping: free if (subtotal - discount) >= threshold OR FREESHIP coupon applied
  const taxableAfterDiscount = Math.max(0, subtotal - discountAmount);
  let shipping = 0;
  if(taxableAfterDiscount >= FREE_SHIPPING_THRESHOLD || isFreeShipCoupon) shipping = 0;
  else shipping = (subtotal === 0 ? 0 : SHIPPING_FEE);

  const grand = Math.max(0, subtotal - discountAmount + tax + shipping);
  return { subtotal, discount: discountAmount, tax, shipping, grand, appliedCoupon: getAppliedCoupon() };
}

function updateTotalsUI(sub, discount, tax, shipping, grand){
  if(byId("subtotal")) byId("subtotal").textContent = formatINR(sub);
  if(byId("discount")) byId("discount").textContent = "-"+formatINR(discount);
  if(byId("tax")) byId("tax").textContent = formatINR(tax);
  if(byId("shipping")) byId("shipping").textContent = formatINR(shipping);
  if(byId("grandTotal")) byId("grandTotal").textContent = formatINR(grand);

  if(byId("coSubtotal")) byId("coSubtotal").textContent = formatINR(sub);
  if(byId("coDiscount")) byId("coDiscount").textContent = "-"+formatINR(discount);
  if(byId("coTax")) byId("coTax").textContent = formatINR(tax);
  if(byId("coShipping")) byId("coShipping").textContent = formatINR(shipping);
  if(byId("coGrand")) byId("coGrand").textContent = formatINR(grand);

  if(byId("cnSubtotal")) byId("cnSubtotal").textContent = formatINR(sub);
  if(byId("cnDiscount")) byId("cnDiscount").textContent = "-"+formatINR(discount);
  if(byId("cnTax")) byId("cnTax").textContent = formatINR(tax);
  if(byId("cnShipping")) byId("cnShipping").textContent = formatINR(shipping);
  if(byId("cnGrand")) byId("cnGrand").textContent = formatINR(grand);
}

/* ========= Cart Page Load ========= */
function loadCart(){
  const cartDiv = byId("cartItems");
  if(!cartDiv) return;
  let cart = getCart();
  cartDiv.innerHTML = "";
  if(cart.length===0){
    cartDiv.innerHTML = `<p class="muted center">Your cart is empty 🛒</p>`;
    const totals = computeTotals(cart);
    updateTotalsUI(totals.subtotal, totals.discount, totals.tax, totals.shipping, totals.grand);
    updateFreeShippingBanner(totals.subtotal, totals.appliedCoupon);
    return;
  }
  cart.forEach((item, idx)=>{
    cartDiv.innerHTML += `
      <div class="cart-item">
        <img src="${item.img || 'images/placeholder.png'}" alt="${item.product}" />
        <div class="info">
          <h4>${item.product}</h4>
          <p class="muted">${formatINR(item.price)}</p>
        </div>
        <div class="qty">
          <input type="number" min="1" value="${item.qty}" onchange="updateQty(${idx}, this.value)" />
        </div>
        <div class="line-total">${formatINR(item.total)}</div>
        <button class="icon-btn" title="Remove" onclick="removeItem(${idx})">✖</button>
      </div>
    `;
  });
  const totals = computeTotals(cart);
  updateTotalsUI(totals.subtotal, totals.discount, totals.tax, totals.shipping, totals.grand);
  updateFreeShippingBanner(totals.subtotal, totals.appliedCoupon);
}

/* ========= Qty/Remove/Clear ========= */
function updateQty(index, value){
  let cart = getCart();
  cart[index].qty = Math.max(1, parseInt(value||1,10));
  cart[index].total = cart[index].price * cart[index].qty;
  saveCart(cart);
  loadCart();
  updateCartCount();
}
function removeItem(index){
  let cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
  loadCart();
  updateCartCount();
}
function clearCart(){
  localStorage.removeItem("cart");
  loadCart();
  updateCartCount();
}

/* ========= Checkout Load ========= */
function loadCheckout(){
  const summaryDiv = byId("cartSummary");
  if(!summaryDiv) return;
  let cart = getCart();
  summaryDiv.innerHTML = "";
  if(cart.length===0){
    summaryDiv.innerHTML = `<p class="muted">Your cart is empty 🛒</p>`;
    const totals = computeTotals(cart);
    updateTotalsUI(totals.subtotal, totals.discount, totals.tax, totals.shipping, totals.grand);
    updateFreeShippingBanner(totals.subtotal, totals.appliedCoupon);
    displayAppliedCoupon();
    return;
  }
  cart.forEach(item=>{
    summaryDiv.innerHTML += `<p>${item.product} × ${item.qty} <span class="right">${formatINR(item.total)}</span></p>`;
  });
  const totals = computeTotals(cart);
  updateTotalsUI(totals.subtotal, totals.discount, totals.tax, totals.shipping, totals.grand);
  updateFreeShippingBanner(totals.subtotal, totals.appliedCoupon);
  displayAppliedCoupon();
}

/* ========= Coupons ========= */
function applyCoupon(){
  const code = (byId("couponCode")?.value || "").trim().toUpperCase();
  if(!code){ alert("Please enter a coupon code"); return; }
  if(!COUPONS[code]){ alert("Invalid coupon"); return; }
  setAppliedCoupon(code);
  alert("Coupon applied: " + code);
  loadCheckout();
  loadCart();
}
function removeCoupon(){
  setAppliedCoupon(null);
  if(byId("couponCode")) byId("couponCode").value = "";
  alert("Coupon removed");
  loadCheckout();
  loadCart();
}
function displayAppliedCoupon(){
  const code = getAppliedCoupon();
  const msgEl = byId("couponMsg");
  if(!msgEl) return;
  if(code && COUPONS[code]) msgEl.textContent = `Applied: ${code} — ${COUPONS[code].label}`;
  else msgEl.textContent = "";
}

/* ========= Free shipping banner ========= */
function updateFreeShippingBanner(subtotal, appliedCoupon){
  const bannerEls = document.querySelectorAll("#freeShippingBanner");
  bannerEls.forEach(b => {
    if(!b) return;
    if(subtotal >= FREE_SHIPPING_THRESHOLD || (appliedCoupon && COUPONS[appliedCoupon] && COUPONS[appliedCoupon].type === "freeship")){
      b.innerHTML = `<div class="free-qualify">🎉 You qualify for free shipping!</div>`;
    } else {
      b.innerHTML = `<div class="free-info">🚚 Free shipping above ${formatINR(FREE_SHIPPING_THRESHOLD)}. Use coupon FREESHIP or reach the threshold.</div>`;
    }
  });
}

/* ========= Payment / Order ========= */
function generateOrderNumber(){ return "ORD" + Math.floor(100000 + Math.random()*900000); }

function payNow(event){
  event.preventDefault();
  const name = byId("name").value.trim();
  const email = byId("email").value.trim();
  const phone = byId("phone").value.trim();
  const address = byId("address").value.trim();
  const notes = byId("notes") ? byId("notes").value.trim() : "";
  const payment = (document.querySelector("input[name='payment']:checked")||{}).value;

  if(!name || !email || !phone || !address){
    alert("Please fill all required fields!");
    return;
  }
  const cart = getCart();
  if(cart.length===0){
    alert("Your cart is empty!");
    return;
  }

  // simulate payment success
  const success = Math.random() < 0.95;
  if(!success){ alert("Payment Failed! ❌ Please try again."); return; }

  const totals = computeTotals(cart);
  const order = {
    orderNumber: generateOrderNumber(),
    name, email, phone, address, payment, notes,
    items: cart,
    totals,
    coupon: getAppliedCoupon(),
    date: new Date().toISOString()
  };
  localStorage.setItem("lastOrder", JSON.stringify(order));
  localStorage.setItem("checkoutName", name);
  localStorage.setItem("checkoutEmail", email);

  // cleanup cart & coupon
  localStorage.removeItem("cart");
  setAppliedCoupon(null);

  alert(`Payment Successful! 🎉\nThank you, ${name}!`);
  window.location.href = "confirm.html";
}

/* ========= Confirmation ========= */
function showConfirmation(){
  const data = JSON.parse(localStorage.getItem("lastOrder") || "null");
  const name = localStorage.getItem("checkoutName") || (data?.name || "Customer");
  const email = localStorage.getItem("checkoutEmail") || (data?.email || "your email");
  const orderNum = data?.orderNumber || generateOrderNumber();

  const orderNumEl = byId("orderNumber");
  const emailMsgEl = byId("emailMessage");
  if(orderNumEl) orderNumEl.textContent = "Your Order Number: " + orderNum;
  if(emailMsgEl) emailMsgEl.textContent = "A confirmation email has been sent to " + email;

  if(data){
    const list = byId("orderItems");
    if(list){
      list.innerHTML = "";
      data.items.forEach(i=>{
        list.innerHTML += `<p>${i.product} × ${i.qty} <span class="right">${formatINR(i.total)}</span></p>`;
      });
    }
    if(byId("cnSubtotal")) byId("cnSubtotal").textContent = formatINR(data.totals.subtotal);
    if(byId("cnDiscount")) byId("cnDiscount").textContent = "-"+formatINR(data.totals.discount);
    if(byId("cnTax")) byId("cnTax").textContent = formatINR(data.totals.tax);
    if(byId("cnShipping")) byId("cnShipping").textContent = formatINR(data.totals.shipping);
    if(byId("cnGrand")) byId("cnGrand").textContent = formatINR(data.totals.grand);
    if(byId("couponUsed")) byId("couponUsed").textContent = data.coupon ? "Coupon used: " + data.coupon : "";
  }
  launchConfetti();
}

/* ========= Confetti ========= */
function launchConfetti(){
  const c = byId("confetti");
  if(!c) return;
  c.innerHTML = "";
  const pieces = 80;
  for(let i=0;i<pieces;i++){
    const s = document.createElement("span");
    s.className = "confetti-piece";
    s.style.left = Math.random()*100 + "vw";
    s.style.animationDelay = Math.random()*1 + "s";
    s.style.fontSize = (12 + Math.random()*12) + "px";
    s.textContent = ["🎉","🎊","✨","🟦","🟥","🟨"][i%6];
    c.appendChild(s);
  }
  setTimeout(()=> c.innerHTML="", 4000);
}

/* ========= Wishlist page render ========= */
function renderWishlist(){
  const container = byId("wishlistContainer");
  if(!container) return;
  const w = getWishlist();
  container.innerHTML = "";
  if(w.length===0){ container.innerHTML = `<p class="muted center">Your wishlist is empty ❤️</p>`; return; }
  w.forEach(id=>{
    const p = products.find(x=>x.id===id);
    if(!p) return;
    container.innerHTML += `
      <div class="product">
        <button class="wish active" onclick="toggleWishlist(${p.id})">♥</button>
        <img src="${p.img}" alt="${p.name}" onclick="openModal(${p.id})"/>
        <h3>${p.name}</h3>
        <p class="muted">${formatINR(p.price)}</p>
        <div style="display:flex;gap:8px;justify-content:center;">
          <button class="btn" onclick="addToCartById(${p.id}); toggleWishlist(${p.id});">Add to Cart</button>
          <button class="btn ghost" onclick="toggleWishlist(${p.id})">Remove</button>
        </div>
      </div>
    `;
  });
}

/* ========= Navigation helpers ========= */
function goHome(){ window.location.href = "index.html"; }

/* ========= Slider (fade + swipe) ========= */
let currentSlide = 0;
let autoSlideInterval;
function showSlide(index){
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dots button");
  if(slides.length===0) return;
  if(index >= slides.length) currentSlide = 0;
  else if(index < 0) currentSlide = slides.length - 1;
  else currentSlide = index;
  slides.forEach((s,i)=> s.classList.toggle("active", i===currentSlide));
  dots.forEach((d,i)=> d.classList.toggle("active", i===currentSlide));
}
function changeSlide(step){ showSlide(currentSlide + step); resetAutoSlide(); }
function goToSlide(i){ showSlide(i); resetAutoSlide(); }
function resetAutoSlide(){ clearInterval(autoSlideInterval); autoSlideInterval = setInterval(()=> showSlide(currentSlide+1), 4000); }

/* ===== Init on DOM ready ===== */
document.addEventListener("DOMContentLoaded", ()=>{
  // year in footer
  if(byId("year")) byId("year").textContent = new Date().getFullYear();

  updateCartCount();
  updateWishCount();

  // page-specific
  const title = document.title;
  if(title.includes("Products")) renderProducts(products);
  if(title.includes("Cart")) loadCart();
  if(title.includes("Checkout")) { loadCheckout(); displayAppliedCoupon(); }
  if(title.includes("Order Confirmation")) showConfirmation();
  if(title.includes("Wishlist")) renderWishlist();

  // init slider dots and autoplay if present
  if(document.querySelector(".hero-slider")){
    const slides = document.querySelectorAll(".slide");
    const dotsContainer = document.getElementById("sliderDots");
    slides.forEach((_,i)=>{
      const b = document.createElement("button");
      b.onclick = ()=> goToSlide(i);
      dotsContainer.appendChild(b);
    });
    showSlide(0);
    autoSlideInterval = setInterval(()=> showSlide(currentSlide+1), 4000);

    /* Swipe support */
    let startX = 0, endX = 0;
    const slider = document.querySelector(".hero-slider");
    slider.addEventListener("touchstart", e=> startX = e.touches[0].clientX);
    slider.addEventListener("touchmove", e=> endX = e.touches[0].clientX);
    slider.addEventListener("touchend", ()=>{
      let diff = endX - startX;
      if(Math.abs(diff) > 50){ if(diff < 0) changeSlide(1); else changeSlide(-1); }
      startX = 0; endX = 0;
    });
  }
});
