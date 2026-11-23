const CART_KEY = "futflex_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, size, qty) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === product.id && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size: size,
      qty: qty,
    });
  }
  saveCart(cart);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateCartQty(index, qty) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, qty);
  saveCart(cart);
}

function cartTotalItems() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartTotalValue() {
  return getCart().reduce((sum, i) => sum + i.qty * i.price, 0);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

async function saveOrder(order) {
  const ref = await db.collection("orders").add({
    ...order,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  const items = order.itensDetalhe || [];
  await Promise.allSettled(items.map((i) =>
    db.collection("products").doc(i.id).update({ sold: firebase.firestore.FieldValue.increment(i.qty) })
  ));
  return "#" + ref.id.slice(-6).toUpperCase();
}

function onOrdersChange(callback) {
  return db.collection("orders").orderBy("createdAt", "desc").onSnapshot(
    (snap) => callback(snap.docs.map((d) => ({ docId: d.id, ...d.data() }))),
    (err) => console.error("Erro ao carregar pedidos:", err)
  );
}

async function updateOrderStatus(docId, status) {
  await db.collection("orders").doc(docId).update({ status });
}

function maskPhoneBR(digits) {
  digits = digits.slice(0, 11);
  const len = digits.length;
  if (len === 0) return "";
  if (len <= 2) return `(${digits}`;
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (len <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCEP(digits) {
  digits = digits.slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function attachMask(input, maskFn) {
  if (!input) return;
  input.addEventListener("input", () => {
    const digits = input.value.replace(/\D/g, "");
    input.value = maskFn(digits);
  });
}

function updateCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    const n = cartTotalItems();
    el.textContent = n;
    el.style.display = n > 0 ? "flex" : "none";
  });
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg><span></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector("span").textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

const CATEGORIES_DATA = [
  { name: "Brasil",  image: "img/logobrasileiro.jfif", link: "produtos.html?categoria=brasil"},
  { name: "Europa",  image: "img/logochampions.jpg", link: "produtos.html?categoria=europa"},
  { name: "Seleções", image: "img/images.png", link: "produtos.html?categoria=selecoes"}
];

function renderCategories() {
  const track = document.getElementById("category-track");
  if (!track) return;
  
  track.innerHTML = CATEGORIES_DATA.map(cat => `
    <a href="${cat.link}" class="category-card">
      <div class="ph" style="background:#fff; padding:0; overflow:hidden;">
        <img src="${cat.image}" alt="${cat.name}" style="width:100%; height:190px; object-fit:contain; display:block;">
      </div>
      <h3>${cat.name}</h3>
    </a>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderCategories();

  const burger = document.querySelector(".burger");
  const navLinks = document.querySelector(".nav-links");

  if (burger && navLinks) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinks.classList.toggle("nav-open");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navLinks.classList.remove("nav-open"));
    });

    document.addEventListener("click", (e) => {
      if (navLinks.classList.contains("nav-open") && !navLinks.contains(e.target) && e.target !== burger) {
        navLinks.classList.remove("nav-open");
      }
    });
  }
});

function initCarousels() {
  document.querySelectorAll(".carousel").forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const prev = carousel.querySelector(".carousel-arrow.prev");
    const next = carousel.querySelector(".carousel-arrow.next");
    if (!track) return;
    const scrollAmount = () => Math.min(track.clientWidth * 0.8, 500);
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -scrollAmount(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left: scrollAmount(), behavior: "smooth" }));
  });
}

function initMobileNav() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  if (!burger || !nav) return;
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.toggle("nav-open");
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("nav-open"));
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("nav-open") && !nav.contains(e.target) && e.target !== burger) {
      nav.classList.remove("nav-open");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("feedback-modal");
  const btnOpen = document.getElementById("btn-open-feedback");
  const btnClose = document.getElementById("btn-close-feedback");
  const form = document.getElementById("feedback-form");
  const stars = document.querySelectorAll(".star-rating-picker .star");
  const ratingInput = document.getElementById("feedback-rating");

  if (!modal || !btnOpen || !form) return;

  btnOpen.addEventListener("click", () => {
    const user = firebase.auth().currentUser;
    if (!user) {
      showToast("Faça login para deixar um feedback!");
      return;
    }
    modal.classList.add("show");
  });

  btnClose.addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("show");
  });

  function highlightStars(count) {
    stars.forEach((s, i) => {
      s.classList.toggle("active", i < count);
    });
  }

  stars.forEach((star) => {
    star.addEventListener("mouseenter", () => highlightStars(Number(star.dataset.value)));
    star.addEventListener("click", () => {
      ratingInput.value = star.dataset.value;
      highlightStars(Number(ratingInput.value));
    });
  });

  document.getElementById("star-picker")?.addEventListener("mouseleave", () => {
    highlightStars(Number(ratingInput.value));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) {
      showToast("Você precisa estar logado!");
      return;
    }

    const message = document.getElementById("feedback-message").value.trim();
    const rating = Number(ratingInput.value) || 5;

    if (!message) return;

    try {
      await db.collection("feedbacks").add({
        userId: user.uid,
        email: user.email,
        message: message,
        rating: rating,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showToast("Feedback enviado com sucesso!");
      form.reset();
      ratingInput.value = "5";
      highlightStars(5);
      modal.classList.remove("show");
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
      showToast("Erro ao enviar feedback. Tente novamente.");
    }
  });
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".toggle-pass");
  if (!btn) return;

  e.preventDefault();
  const targetId = btn.dataset.target;
  const input = document.getElementById(targetId) || btn.parentElement.querySelector("input");

  if (input) {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    btn.style.opacity = isPassword ? "0.6" : "1";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".section").forEach(section => {
    const title = section.querySelector(".section-title");
    if (title && title.textContent.trim().toUpperCase().includes("FEEDBACKS")) {
      const track = section.querySelector(".carousel-track");
      const prevBtn = section.querySelector(".carousel-arrow.prev");
      const nextBtn = section.querySelector(".carousel-arrow.next");

      if (track && prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
          track.scrollBy({ left: -356, behavior: "smooth" });
        });

        nextBtn.addEventListener("click", () => {
          track.scrollBy({ left: 356, behavior: "smooth" });
        });
      }
    }
  });
});

function formatPriceBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function renderProductCard(p) {
  const imgHTML = p.images && p.images.length > 0
    ? `<img class="product-photo" src="${p.images[0]}" alt="${p.name}">`
    : `<div class="ph" data-label="Sem foto"></div>`;

  const tagHTML = p.tag ? `<span class="product-tag">${p.tag}</span>` : "";
  const oldPriceHTML = p.oldPrice ? `<span class="old">${formatPriceBRL(p.oldPrice)}</span>` : "";

  return `
    <a href="produto.html?id=${p.id}" class="product-card">
      <div class="img-wrap">
        ${tagHTML}
        ${imgHTML}
      </div>
      <div class="product-price">
        ${formatPriceBRL(p.price)} ${oldPriceHTML}
      </div>
      <div class="product-name">${p.name}</div>
    </a>
  `;
}

function showAuthPopup(mensagem = "Você precisa fazer login para continuar com a compra.") {
  const existente = document.getElementById("futflex-modal");
  if (existente) existente.remove();

  const overlay = document.createElement("div");
  overlay.id = "futflex-modal";
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(6, 18, 36, 0.8);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 9999; padding: 20px;
  `;

  overlay.innerHTML = `
    <div style="
      background: #0d2847; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px; padding: 28px 24px; max-width: 380px; width: 100%;
      text-align: center; color: #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.45);
      font-family: 'Barlow', sans-serif;
    ">
      <div style="
        width: 52px; height: 52px; border-radius: 50%; background: rgba(124, 212, 42, 0.15);
        color: #7cd42a; display: flex; align-items: center; justify-content: center;
        margin: 0 auto 14px;
      ">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h3 style="font-family: 'Barlow Condensed', sans-serif; font-size: 1.5rem; margin: 0 0 8px; text-transform: uppercase;">
        Login necessário
      </h3>
      <p style="color: #b7c8de; font-size: 0.95rem; line-height: 1.45; margin: 0 0 22px;">
        ${mensagem}
      </p>
      <div style="display: flex; gap: 10px;">
        <button id="modal-btn-cancel" style="
          flex: 1; padding: 11px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);
          background: transparent; color: #fff; font-weight: 600; cursor: pointer;
        ">Voltar</button>
        <button id="modal-btn-login" style="
          flex: 1; padding: 11px; border-radius: 8px; border: none;
          background: #7cd42a; color: #07192e; font-weight: 700; cursor: pointer;
        ">Fazer login</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("modal-btn-login").addEventListener("click", () => {
    location.href = "login.html";
  });

  document.getElementById("modal-btn-cancel").addEventListener("click", () => {
    overlay.remove();
   
    if (location.pathname.includes("checkout.html")) {
      location.href = "index.html";
    }
  });
}


function showPaymentSentPopup() {
  const existente = document.getElementById("futflex-modal");
  if (existente) existente.remove();

  const overlay = document.createElement("div");
  overlay.id = "futflex-modal";
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(6, 18, 36, 0.85);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 9999; padding: 20px;
  `;

  overlay.innerHTML = `
    <div style="
      background: #0d2847; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px; padding: 28px 24px; max-width: 400px; width: 100%;
      text-align: center; color: #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.45);
      font-family: 'Barlow', sans-serif;
    ">
      <div style="
        width: 56px; height: 56px; border-radius: 50%; background: rgba(245, 158, 11, 0.15);
        color: #f59e0b; display: flex; align-items: center; justify-content: center;
        margin: 0 auto 14px;
      ">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <h3 style="font-family: 'Barlow Condensed', sans-serif; font-size: 1.55rem; margin: 0 0 10px; text-transform: uppercase;">
        Pagamento enviado!
      </h3>
      <p style="color: #b7c8de; font-size: 0.98rem; line-height: 1.5; margin: 0 0 24px;">
        Pagamento enviado! Aguardando o dono confirmar e liberar...
      </p>
      <button id="modal-btn-home" style="
        width: 100%; padding: 12px; border-radius: 8px; border: none;
        background: #7cd42a; color: #07192e; font-weight: 700; font-size: 0.95rem;
        cursor: pointer; text-transform: uppercase;
      ">Voltar para o início</button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("modal-btn-home").addEventListener("click", () => {
    location.href = "index.html";
  });
}

auth.onAuthStateChanged((user) => {
  if (user) {
    const loginElements = document.querySelectorAll("a[href='login.html'], .user-auth-link, #header-login-btn");
    loginElements.forEach((el) => {
      el.outerHTML = `
        <a href="minha-conta.html" title="Minha Conta" style="display: inline-flex; align-items: center; text-decoration: none;">
          <img src="img/foto.perfil.jpg" alt="Perfil" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #7cd42a; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        </a>
      `;
    });
  }
});