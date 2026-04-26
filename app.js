// app.js

// Mock Data Source
const productsData = [
    {
        id: 'p1',
        title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
        price: 29990,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'p2',
        title: 'Apple Watch Ultra - Titanium Case',
        price: 89900,
        category: 'wearables',
        image: 'https://images.unsplash.com/photo-1662973715316-c73708a3d3c8?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'p3',
        title: 'Nomad Base Station Pro - Wireless Charger',
        price: 15499,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1596740645672-026ccfd50352?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'p4',
        title: 'MacBook Pro 16-inch M3 Max',
        price: 249900,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'p5',
        title: 'Keychron Q1 Pro Mechanical Keyboard',
        price: 18999,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'p6',
        title: 'Oura Ring Gen3 Horizon',
        price: 26999,
        category: 'wearables',
        image: 'https://images.unsplash.com/photo-1620601335272-9bd7ce837134?auto=format&fit=crop&q=80&w=600' 
    },
    {
        id: 'p7',
        title: 'Logitech MX Master 3S Wireless Mouse',
        price: 8995,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd11b4aa171?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 'p8',
        title: 'Samsung Galaxy S24 Ultra - 512GB',
        price: 129999,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=600'
    }
];

// App State
let cart = []; // Array of { product: {}, quantity: 1 }
let activeFilter = 'all';
let searchQuery = '';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const filterContainer = document.getElementById('filterContainer');
const searchInput = document.getElementById('searchInput');
const cartCount = document.getElementById('cartCount');
const cartOverlay = document.getElementById('cartOverlay');
const cartSidebar = document.getElementById('cartSidebar');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalSum = document.getElementById('cartTotalSum');

const cartOpenBtn = document.getElementById('cartOpenBtn');
const cartCloseBtn = document.getElementById('cartCloseBtn');

// Initialize App
function initApp() {
    renderProducts();
    setupEventListeners();
    loadCartFromStorage();
}

// ---------------------------
// Render Flow
// ---------------------------

// Format Currency
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}

// Render Products to DOM based on state
function renderProducts() {
    // Determine filtered products
    const filteredProducts = productsData.filter(product => {
        // filter by category
        const matchesCategory = activeFilter === 'all' || product.category === activeFilter;
        // filter by search
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesCategory && matchesSearch;
    });

    productGrid.innerHTML = ''; // clear grid

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <h3>No items found matching your criteria.</h3>
            </div>
        `;
        return;
    }

    filteredProducts.forEach((product, index) => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.05}s`; // Stagger animation
        
        card.innerHTML = `
            <div class="product-image-container">
                <span class="category-badge">${product.category}</span>
                <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title" title="${product.title}">${product.title}</h3>
                <div class="price-row">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <button class="add-to-cart-btn" onclick="handleAddToCart('${product.id}')" aria-label="Add ${product.title} to cart">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// ---------------------------
// Cart Logic
// ---------------------------

window.handleAddToCart = function(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const existingCartItem = cart.find(item => item.product.id === productId);
    
    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        cart.push({ product, quantity: 1 });
    }

    updateCartState();
    
    // Visual feedback
    cartCount.style.transform = 'scale(1.5)';
    setTimeout(() => { cartCount.style.transform = 'scale(1)'; }, 200);
}

window.adjustCartQuantity = function(productId, amount) {
    const itemIndex = cart.findIndex(item => item.product.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += amount;
        
        // Remove if 0
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        updateCartState();
    }
}

function updateCartState() {
    renderCartItems();
    updateCartIconCount();
    saveCartToStorage();
}

function updateCartIconCount() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty. Discover premium products today.</div>';
        cartTotalSum.textContent = formatPrice(0);
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        total += (item.product.price * item.quantity);
        
        const cartEl = document.createElement('div');
        cartEl.className = 'cart-item';
        cartEl.innerHTML = `
            <img src="${item.product.image}" alt="${item.product.title}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title" title="${item.product.title}">${item.product.title}</div>
                <div class="cart-item-price">${formatPrice(item.product.price)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="adjustCartQuantity('${item.product.id}', -1)">-</button>
                <span class="item-qty">${item.quantity}</span>
                <button class="qty-btn" onclick="adjustCartQuantity('${item.product.id}', 1)">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartEl);
    });
    
    cartTotalSum.textContent = formatPrice(total);
}

// ---------------------------
// UI Interactions & Event Listeners
// ---------------------------

function setupEventListeners() {
    // Filters
    filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            // update UI
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // update State
            activeFilter = e.target.getAttribute('data-category');
            renderProducts();
        }
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderProducts();
    });

    // Cart Open/Close
    cartOpenBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent bg scroll
    });

    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
}

function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ---------------------------
// LocalStorage Persistence
// ---------------------------
function saveCartToStorage() {
    localStorage.setItem('auraCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('auraCart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
            updateCartState();
        } catch (e) {
            console.error('Failed to parse cart data');
        }
    }
}

// Run app
document.addEventListener('DOMContentLoaded', initApp);
