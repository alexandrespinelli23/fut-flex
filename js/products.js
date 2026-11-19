
const CATEGORY_LABELS = {
  europa: "Europa",
  brasil: "Brasil",
  selecoes: "Seleções",
};

const SIZES = ["P", "M", "G", "GG"];


let PRODUCTS_CACHE = [];
let productsLoaded = false;
const productListeners = [];

function onProductsChange(callback) {
  productListeners.push(callback);
  if (productsLoaded) callback(PRODUCTS_CACHE);
}

db.collection("products").onSnapshot(
  (snap) => {
    PRODUCTS_CACHE = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    productsLoaded = true;
    productListeners.forEach((cb) => cb(PRODUCTS_CACHE));
  },
  (err) => {
    console.error("Erro ao carregar catálogo do Firestore:", err);
  }
);

function getAllProducts() {
  return PRODUCTS_CACHE;
}

function getActiveProducts() {
  return PRODUCTS_CACHE.filter((p) => p.status === "ativo");
}

function getProductById(id) {
  return PRODUCTS_CACHE.find((p) => p.id === id);
}

async function addProduct(data) {
  await db.collection("products").add({
    status: "ativo",
    oldPrice: null,
    tag: null,
    launch: false,
    bestseller: false,
    sold: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    ...data,
  });
}

async function updateProduct(id, changes) {
  await db.collection("products").doc(id).update(changes);
}

async function setProductStatus(id, status) {
  return updateProduct(id, { status });
}

async function deleteProductPermanently(id) {
  await db.collection("products").doc(id).delete();
}

async function importSeedCatalog() {
  const batch = db.batch();
  SEED_PRODUCTS.forEach((p) => {
    const ref = db.collection("products").doc();
    batch.set(ref, { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  });
  await batch.commit();
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------- Alias de compatibilidade para o painel do vendedor ---------- */
async function createProduct(data) {
  return addProduct(data);
}