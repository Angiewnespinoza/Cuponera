// IndexedDB setup with Dexie
const db = new Dexie('CuponeraDB');

db.version(1).stores({
  coupons: '++id, title, description, remainingUses, starLevel, imageId, pinned',
  images: '++id, name, data',
  starLevels: 'level, description',
  admin: 'key, value'
});

// Data models
class Coupon {
  constructor(id, title, description, remainingUses, starLevel, imageId, pinned = false) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.remainingUses = remainingUses;
    this.starLevel = starLevel;
    this.imageId = imageId;
    this.pinned = pinned;
  }
}

class Image {
  constructor(id, name, data) {
    this.id = id;
    this.name = name;
    this.data = data; // base64 string
  }
}

class StarLevel {
  constructor(level, description) {
    this.level = level;
    this.description = description;
  }
}

// DB Services
class DBService {
  static async getAllCoupons() {
    return await db.coupons.toArray();
  }

  static async addCoupon(coupon) {
    return await db.coupons.add(coupon);
  }

  static async updateCoupon(coupon) {
    return await db.coupons.put(coupon);
  }

  static async deleteCoupon(id) {
    return await db.coupons.delete(id);
  }

  static async getAllImages() {
    return await db.images.toArray();
  }

  static async addImage(image) {
    return await db.images.add(image);
  }

  static async deleteImage(id) {
    return await db.images.delete(id);
  }

  static async getStarLevels() {
    const levels = await db.starLevels.toArray();
    return levels.sort((a, b) => a.level - b.level);
  }

  static async updateStarLevel(level, description) {
    return await db.starLevels.put({ level, description });
  }

  static async getAdminSetting(key) {
    const item = await db.admin.get(key);
    return item ? item.value : null;
  }

  static async setAdminSetting(key, value) {
    return await db.admin.put({ key, value });
  }
}

// Initialization
async function initializeDB() {
  const coupons = await DBService.getAllCoupons();
  if (coupons.length === 0) {
    // Seed with sample data
    // Sample images (base64 placeholders, in real app load from files)
    const sampleImages = [
      { name: 'helado.png', data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }, // dummy
      { name: 'pantallas.png', data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' } // dummy
    ];
    for (const img of sampleImages) {
      await DBService.addImage(new Image(null, img.name, img.data));
    }
    const images = await DBService.getAllImages();
    const heladoId = images.find(i => i.name === 'helado.png').id;
    const pantallasId = images.find(i => i.name === 'pantallas.png').id;

    const sampleCoupons = [
      new Coupon(null, 'Vale por un helado', 'Un helado a elección.', 3, 3, heladoId, false),
      new Coupon(null, '1 hora de pantalla', 'Videojuegos / tablet / compu 1 hora.', 5, 4, pantallasId, false)
    ];
    for (const coupon of sampleCoupons) {
      await DBService.addCoupon(coupon);
    }

    // Star levels
    const sampleStars = [
      new StarLevel(1, 'Básico'),
      new StarLevel(2, 'Intermedio'),
      new StarLevel(3, 'Avanzado'),
      new StarLevel(4, 'Experto'),
      new StarLevel(5, 'Maestro')
    ];
    for (const star of sampleStars) {
      await DBService.updateStarLevel(star.level, star.description);
    }

    // Admin password: default 'admin' hashed
    const salt = 'randomsalt'; // in real app generate random
    const hash = await hashPassword('admin', salt);
    await DBService.setAdminSetting('passwordHash', hash);
    await DBService.setAdminSetting('salt', salt);
  }
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// App state
let currentMode = 'kid'; // 'kid' or 'admin'
let coupons = [];
let starLevels = [];

// UI elements
const couponList = document.getElementById('coupon-list');

// Load data
async function loadData() {
  coupons = await DBService.getAllCoupons();
  starLevels = await DBService.getStarLevels();
}

// Render kid mode
function renderKidMode() {
  couponList.innerHTML = '';
  // Sort: pinned first, then by star level desc
  const sortedCoupons = [...coupons].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.starLevel - a.starLevel;
  });

  sortedCoupons.forEach(coupon => {
    const card = document.createElement('article');
    card.className = 'coupon-card';

    const img = document.createElement('img');
    img.className = 'coupon-image';
    // Get image data
    DBService.getAllImages().then(images => {
      const image = images.find(i => i.id === coupon.imageId);
      if (image) img.src = image.data;
    });

    const content = document.createElement('div');
    content.className = 'coupon-content';

    const title = document.createElement('h3');
    title.textContent = coupon.title;

    const uses = document.createElement('p');
    uses.textContent = `Usos restantes: ${coupon.remainingUses}`;

    const stars = document.createElement('div');
    stars.className = 'stars';
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.textContent = i <= coupon.starLevel ? '★' : '☆';
      star.className = 'star';
      star.addEventListener('click', () => showStarModal(coupon.starLevel));
      stars.appendChild(star);
    }

    content.appendChild(title);
    content.appendChild(uses);
    content.appendChild(stars);

    const redeemBtn = document.createElement('button');
    redeemBtn.textContent = 'Canjear';
    redeemBtn.disabled = coupon.remainingUses <= 0;
    redeemBtn.addEventListener('click', () => redeemCoupon(coupon));

    card.appendChild(img);
    card.appendChild(content);
    card.appendChild(redeemBtn);

    couponList.appendChild(card);
  });
}

// Modals
function showStarModal(level) {
  const desc = starLevels.find(s => s.level === level)?.description || 'Sin descripción';
  alert(`Nivel ${level}: ${desc}`);
}

async function redeemCoupon(coupon) {
  if (confirm(`¿Canjear "${coupon.title}"?`)) {
    coupon.remainingUses -= 1;
    await DBService.updateCoupon(coupon);
    await loadData();
    renderKidMode();
    showConfetti();
    showCelebrationModal(coupon.title);
  }
}

function showConfetti() {
  // Simple confetti animation
  const confetti = document.createElement('div');
  confetti.className = 'confetti';
  document.body.appendChild(confetti);
  setTimeout(() => document.body.removeChild(confetti), 3000);
}

function showCelebrationModal(title) {
  alert(`¡Cupón canjeado: ${title}!`);
  // Share
  if (navigator.share) {
    navigator.share({
      title: 'Cupón canjeado',
      text: `He canjeado: ${title}`,
      url: window.location.href
    });
  }
}

// Admin mode
function renderAdminMode() {
  couponList.innerHTML = '<h2>Modo Admin</h2><button id="back-to-kid">Volver a modo niño</button>';
  document.getElementById('back-to-kid').addEventListener('click', () => {
    currentMode = 'kid';
    render();
  });
  // Add sections for image manager, coupon manager, etc.
  // For brevity, placeholder
}

// Render
function render() {
  if (currentMode === 'kid') {
    renderKidMode();
  } else {
    renderAdminMode();
  }
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  await initializeDB();
  await loadData();
  render();
});
