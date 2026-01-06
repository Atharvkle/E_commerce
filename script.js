// Sample product data
const products = [
    { id: 1, name: "Laptop", price: 999.99, image: "https://via.placeholder.com/250x200?text=Laptop", description: "High-performance laptop" },
    { id: 2, name: "Smartphone", price: 699.99, image: "https://via.placeholder.com/250x200?text=Phone", description: "Latest smartphone" },
    { id: 3, name: "Headphones", price: 199.99, image: "https://via.placeholder.com/250x200?text=Headphones", description: "Wireless headphones" },
    { id: 4, name: "Tablet", price: 399.99, image: "https://via.placeholder.com/250x200?text=Tablet", description: "10-inch tablet" },
    { id: 5, name: "Watch", price: 299.99, image: "https://via.placeholder.com/250x200?text=Watch", description: "Smart watch" },
    { id: 6, name: "Camera", price: 799.99, image: "https://via.placeholder.com/250x200?text=Camera", description: "Digital camera" }
];

// Cart and order data
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentOrder = null;
let isLoggedIn = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

// Login functionality
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            isLoggedIn = true;
            localStorage.setItem('userEmail', email);
            document.getElementById('main-header').style.display = 'block';
            displayProducts();
            updateCartCount();
            loadCartFromStorage();
            showSection('products');
        } else {
            alert('Login failed: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    });
}

// Logout functionality
function logout() {
    isLoggedIn = false;
    localStorage.removeItem('userEmail');
    document.getElementById('main-header').style.display = 'none';
    showSection('login');
    // Clear forms
    document.getElementById('login-form').reset();
}

// Check login status
function checkLoginStatus() {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        isLoggedIn = true;
        document.getElementById('main-header').style.display = 'block';
        displayProducts();
        updateCartCount();
        loadCartFromStorage();
        showSection('products');
    } else {
        showSection('login');
    }
}

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="price">$${product.price.toFixed(2)}</div>
            <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCartToStorage();
    updateCartCount();
    showNotification('Product added to cart!');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartCount();
    displayCart();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCartToStorage();
            displayCart();
        }
    }
}

// Display cart
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="quantity-controls">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div>
                <p>$${(item.price * item.quantity).toFixed(2)}</p>
                <button class="btn-secondary" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// Toggle cart visibility
function toggleCart() {
    displayCart();
    showSection('cart');
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    displayOrderSummary();
    showSection('order');
}

// Display order summary
function displayOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    orderSummary.innerHTML = `
        <h3>Order Summary</h3>
        ${cart.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                <span>${item.name} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('')}
        <hr>
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;
}

// Proceed to payment
function proceedToPayment() {
    const form = document.getElementById('order-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('payment-total').textContent = total.toFixed(2);
    
    showSection('payment');
}

// Toggle payment form based on method
function togglePaymentForm() {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const cardDetails = document.getElementById('card-details');
    
    if (paymentMethod === 'cod') {
        cardDetails.style.display = 'none';
    } else {
        cardDetails.style.display = 'block';
    }
}

// Process payment
function processPayment() {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Validate card details only if card payment is selected
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;
        
        if (!cardNumber || !expiryDate || !cvv) {
            alert('Please fill in all card details');
            return;
        }
    }
    
    // Create order object
    currentOrder = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        customer: {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            address: document.getElementById('customer-address').value
        },
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        payment: {
            method: paymentMethod,
            cardNumber: paymentMethod === 'card' ? '**** **** **** ' + document.getElementById('card-number').value.slice(-4) : null,
            status: 'Completed'
        }
    };
    
    // Save order to storage
    saveOrderToStorage(currentOrder);
    
    // Clear cart
    cart = [];
    saveCartToStorage();
    updateCartCount();
    
    // Show success page
    displayOrderConfirmation();
    showSection('success');
}

// Display order confirmation
function displayOrderConfirmation() {
    const orderDetails = document.getElementById('order-details');
    const paymentText = currentOrder.payment.method === 'cod' ? 'Cash on Delivery' : `Card Payment (${currentOrder.payment.cardNumber})`;
    
    orderDetails.innerHTML = `
        <div class="order-summary">
            <h3>Order #${currentOrder.id}</h3>
            <p><strong>Date:</strong> ${currentOrder.date}</p>
            <p><strong>Customer:</strong> ${currentOrder.customer.name}</p>
            <p><strong>Email:</strong> ${currentOrder.customer.email}</p>
            <p><strong>Payment Method:</strong> ${paymentText}</p>
            <p><strong>Total:</strong> $${currentOrder.total.toFixed(2)}</p>
            <h4>Items:</h4>
            ${currentOrder.items.map(item => `
                <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Show orders history
function showOrders() {
    fetch('/api/orders')
        .then(response => response.json())
        .then(orders => {
            displayOrdersList(orders);
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            displayOrdersList(orders);
        });
    
    showSection('orders');
}

// Display orders list
function displayOrdersList(orders) {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No orders found.</p>';
    } else {
        ordersList.innerHTML = orders.map(order => {
            const orderId = order.orderId || order.id;
            const paymentText = order.payment.method === 'cod' ? 'Cash on Delivery' : `Card Payment`;
            return `
                <div class="order-card">
                    <div class="order-header">
                        <h3>Order #${orderId}</h3>
                        <div>
                            <span class="order-status status-completed">Completed</span>
                            <button class="delete-btn" onclick="deleteOrder(${orderId})">Delete</button>
                        </div>
                    </div>
                    <p><strong>Date:</strong> ${order.date}</p>
                    <p><strong>Customer:</strong> ${order.customer.name}</p>
                    <p><strong>Payment:</strong> ${paymentText}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <div class="order-items">
                        <h4>Items:</h4>
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span>${item.name} x ${item.quantity}</span>
                                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Delete order
function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        fetch(`/api/orders/${orderId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showOrders();
                showNotification('Order deleted successfully!');
            }
        })
        .catch(error => {
            console.error('Error deleting order:', error);
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders = orders.filter(order => (order.id || order.orderId) !== orderId);
            localStorage.setItem('orders', JSON.stringify(orders));
            showOrders();
            showNotification('Order deleted successfully!');
        });
    }
}

// Start over
function startOver() {
    showSection('products');
    // Clear forms
    document.getElementById('order-form').reset();
    document.getElementById('payment-form').reset();
}

// Show section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Storage functions
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

function saveOrderToStorage(order) {
    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            orderId: order.id,
            date: order.date,
            customer: order.customer,
            items: order.items,
            total: order.total,
            payment: order.payment
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Order saved to database:', data);
    })
    .catch(error => {
        console.error('Error saving order:', error);
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
    });
}

// Utility functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 1000;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}