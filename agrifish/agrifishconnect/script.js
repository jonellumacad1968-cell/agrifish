// script.js
// Handles modal logic and database integration for Agrifish Connect marketplace

// --- Global variables ---
let products = [];
let currentProductId = null;
let currentPricePerKilo = 0;

// Utility: Format price as PHP currency
function formatPrice(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return "₱0.00"; // fallback if price is missing or invalid
  return "₱" + num.toFixed(2);
}

// Get modal elements
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalTotal = document.getElementById("modal-total");
const quantityInput = document.getElementById("quantity");
const confirmBtn = document.getElementById("confirm-btn");
const cancelBtn = document.getElementById("cancel-btn");
const modalOverlay = document.querySelector(".modal-overlay");

// --- Fetch products from database ---
async function fetchProducts() {
  try {
    const response = await fetch("http://localhost/agrifish/agrifishconnect/api/products.php");
    const result = await response.json();

    if (result.success) {
      products = result.data;
      renderProducts();
    } else {
      showError("Failed to load products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    showError("Unable to connect to server. Please check your connection.");
  }
}

// --- Render products on the marketplace ---
function renderProducts() {
  const cardGrid = document.getElementById("card-grid");

  if (products.length === 0) {
    cardGrid.innerHTML =
      '<div class="no-products">No products available at the moment.</div>';
    return;
  }

  cardGrid.innerHTML = products
    .map(
      (product) => `
        <article class="card" data-id="${product.id}" data-name="${
        product.name
      }" data-price="${product.price}" data-quantity="${product.quantity}">
            <img class="card-img" src="${product.image}" alt="${
        product.name
      }" onerror="this.src='https://via.placeholder.com/300x180/f0f0f0/999?text=No+Image'">
            <div class="card-content">
                <h2 class="card-title">${product.name}</h2>
                <div class="card-details">
                    <span>Available: <strong>${
                      product.quantity
                    } kg</strong></span>
                    <span class="price">${formatPrice(product.price)}/kg</span>
                </div>
                ${
                  product.quantity > 0
                    ? '<button class="btn buy-btn">Buy</button>'
                    : '<button class="btn buy-btn disabled" disabled>Out of Stock</button>'
                }
            </div>
        </article>
    `
    )
    .join("");

  // Add event listeners to buy buttons
  addBuyButtonListeners();
}

// --- Add event listeners to buy buttons ---
function addBuyButtonListeners() {
  document.querySelectorAll(".buy-btn:not(.disabled)").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      // Get parent card and its data attributes
      const card = e.target.closest(".card");
      const id = card.getAttribute("data-id");
      const name = card.getAttribute("data-name");
      const price = parseFloat(card.getAttribute("data-price"));
      const availableQuantity = parseFloat(card.getAttribute("data-quantity"));

      // Set modal content
      currentProductId = id;
      modalTitle.textContent = `Buy ${name}`;
      modalPrice.textContent = `Price per kilo: ${formatPrice(price)}`;
      quantityInput.value = 1;
      quantityInput.max = availableQuantity; // Set max to available quantity
      currentPricePerKilo = price;
      updateTotal();

      // Show modal
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      quantityInput.focus();
    });
  });
}

// Update total price live as quantity changes
quantityInput.addEventListener("input", updateTotal);

function updateTotal() {
  // Get quantity (default to 1 if invalid)
  let qty = parseFloat(quantityInput.value);
  if (isNaN(qty) || qty <= 0) qty = 1;

  // Check if quantity exceeds available stock
  const maxQty = parseFloat(quantityInput.max);
  if (qty > maxQty) {
    qty = maxQty;
    quantityInput.value = maxQty;
  }

  // Calculate total
  const total = qty * currentPricePerKilo;
  modalTotal.textContent = formatPrice(total);
}

// --- Submit order to database ---
async function submitOrder() {
  const qty = parseFloat(quantityInput.value) || 1;
  const total = qty * currentPricePerKilo;

  try {
    const response = await fetch("http://localhost/agrifish/agrifishconnect/api/orders.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: currentProductId,
        quantity: qty,
        total_amount: total,
        customer_name: "Guest Customer", // In a real app, you'd get this from login
      }),
    });

    const result = await response.json();

    if (result.success) {
      showSuccess(
        `Thank you for purchasing ${qty} kg!\nTotal: ${formatPrice(
          total
        )}\nOrder ID: ${result.order_id}`
      );
      // Refresh products to update available quantities
      fetchProducts();
    } else {
      showError("Failed to process order. Please try again.");
    }
  } catch (error) {
    console.error("Error submitting order:", error);
    showError("Unable to process order. Please check your connection.");
  }
}

// Confirm purchase
confirmBtn.addEventListener("click", function () {
  const qty = parseFloat(quantityInput.value) || 1;

  if (qty <= 0) {
    showError("Please enter a valid quantity.");
    return;
  }

  submitOrder();
  closeModal();
});

// Cancel button closes modal
cancelBtn.addEventListener("click", closeModal);

// Clicking overlay closes modal
modalOverlay.addEventListener("click", closeModal);

// Keyboard accessibility: ESC closes modal
document.addEventListener("keydown", function (e) {
  if (modal.classList.contains("active") && e.key === "Escape") {
    closeModal();
  }
});

// Close modal function
function closeModal() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  currentProductId = null;
}

// --- Notification functions ---
function showSuccess(message) {
  showNotification(message, "success");
}

function showError(message) {
  showNotification(message, "error");
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <span style="white-space: pre-line;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;margin-left:10px;">×</button>
    `;

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : "#ef4444"};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Add CSS animation for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .loading {
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
        color: #666;
    }
    
    .no-products {
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
        color: #666;
        grid-column: 1 / -1;
    }
    
    .btn.disabled {
        background: #ccc !important;
        cursor: not-allowed !important;
        opacity: 0.6;
    }
`;
document.head.appendChild(style);

// --- Initialize marketplace ---
document.addEventListener("DOMContentLoaded", function () {
  fetchProducts(); // Load products from database
});

// Accessibility: trap focus inside modal when open
modal.addEventListener("keydown", function (e) {
  if (!modal.classList.contains("active")) return;
  const focusable = modal.querySelectorAll("input, button");
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.key === "Tab") {
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
});
