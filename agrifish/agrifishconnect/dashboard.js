// Dashboard logic for Agrifish Connect
// Enhanced macOS-inspired admin dashboard with database integration

// --- Global variables ---
let inventory = [];

// --- Utility functions ---
function formatPrice(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return "₱0.00"; // fallback if price is missing or invalid
  return "₱" + num.toFixed(2);
}

function getStockStatus(quantity) {
  if (quantity === 0) return "out-of-stock";
  if (quantity <= 10) return "low-stock";
  return "in-stock";
}

function getStatusText(status) {
  switch (status) {
    case "in-stock":
      return "In Stock";
    case "low-stock":
      return "Low Stock";
    case "out-of-stock":
      return "Out of Stock";
    default:
      return "Unknown";
  }
}

// --- API functions ---
async function fetchProducts() {
  try {
    const response = await fetch("http://localhost/agrifish/agrifishconnect/api/products.php");
    const result = await response.json();
    if (result.success) {
      inventory = result.data;
      renderInventory();
    } else {
      showNotification("Failed to fetch products", "error");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    showNotification("Error connecting to server", "error");
  }
}

async function createProduct(productData) {
  try {
    const response = await fetch("http://localhost/agrifish/agrifishconnect/api/products.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    const result = await response.json();
    if (result.success) {
      showNotification("Product added successfully!");
      fetchProducts(); // Refresh the list
    } else {
      showNotification("Failed to add product", "error");
    }
  } catch (error) {
    console.error("Error creating product:", error);
    showNotification("Error connecting to server", "error");
  }
}

async function updateProduct(productData) {
  try {
    const response = await fetch("http://localhost/agrifish/agrifishconnect/api/products.php", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    const result = await response.json();
    if (result.success) {
      showNotification("Product updated successfully!");
      fetchProducts(); // Refresh the list
    } else {
      showNotification("Failed to update product", "error");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    showNotification("Error connecting to server", "error");
  }
}

async function deleteProductFromDB(id) {
  try {
    const response = await fetch("http://localhost/agrifish/agrifishconnect/api/products.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id }),
    });
    const result = await response.json();
    if (result.success) {
      showNotification("Product deleted successfully!");
      fetchProducts(); // Refresh the list
    } else {
      showNotification("Failed to delete product", "error");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    showNotification("Error connecting to server", "error");
  }
}

// --- Render inventory table ---
function renderInventory() {
  const tbody = document.getElementById("inventory-body");
  tbody.innerHTML = "";

  inventory.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><input type="checkbox" class="row-select" data-id="${
              item.id
            }"></td>
            <td><img src="${item.image}" alt="${
      item.name
    }" onerror="this.src='https://via.placeholder.com/48x48/f0f0f0/999?text=IMG'"></td>
            <td>
                <div style="font-weight: 600; color: #1d1d1f; margin-bottom: 2px;">${
                  item.name
                }</div>
                <div style="font-size: 12px; color: #6b7280;">SKU: ${item.id
                  .toString()
                  .padStart(4, "0")}</div>
            </td>
            <td>
                <div style="font-weight: 600; color: #1d1d1f;">${
                  item.quantity
                } kg</div>
            </td>
            <td>
                <div style="font-weight: 600; color: #1d1d1f;">${formatPrice(
                  item.price
                )}</div>
            </td>
            <td>
                <span class="status-badge ${item.status}">${getStatusText(
      item.status
    )}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="table-btn edit" onclick="openEditModal(${
                      item.id
                    })" title="Edit">✏️</button>
                    <button class="table-btn delete" onclick="deleteFish(${
                      item.id
                    })" title="Delete">🗑️</button>
                </div>
            </td>
        `;
    tbody.appendChild(tr);
  });

  updateSummary();
}

// --- Update summary section ---
function updateSummary() {
  // Total stock
  const totalStock = inventory.reduce(
    (sum, item) => sum + parseFloat(item.quantity),
    0
  );
  document.getElementById("total-stock").textContent = totalStock + " kg";

  // Total value
  const totalValue = inventory.reduce(
    (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.price),
    0
  );
  document.getElementById("total-value").textContent = formatPrice(totalValue);

  // Recent orders (placeholder, replace with real data)
  document.getElementById("recent-orders").textContent = "24";

  // Active users (placeholder)
  document.getElementById("active-users").textContent = "42";
}

// --- Modal logic for Add/Edit Fish ---
const dashboardModal = document.getElementById("dashboard-modal");
const fishForm = document.getElementById("fish-form");
const modalActionTitle = document.getElementById("modal-action-title");
const cancelDashboardModal = document.getElementById("cancel-dashboard-modal");

let editId = null;

// Open Add Fish modal
document.getElementById("add-fish-btn").addEventListener("click", () => {
  modalActionTitle.textContent = "Add New Product";
  fishForm.reset();
  editId = null;
  dashboardModal.classList.add("active");
  dashboardModal.setAttribute("aria-hidden", "false");
  document.getElementById("fish-name").focus();
});

// Open Edit Fish modal
window.openEditModal = function (id) {
  const item = inventory.find((f) => f.id == id);
  if (!item) return;

  modalActionTitle.textContent = "Edit Product";
  document.getElementById("fish-name").value = item.name;
  document.getElementById("fish-quantity").value = item.quantity;
  document.getElementById("fish-price").value = item.price;
  document.getElementById("fish-image").value = item.image;
  editId = id;
  dashboardModal.classList.add("active");
  dashboardModal.setAttribute("aria-hidden", "false");
  document.getElementById("fish-name").focus();
};

// Save/Add Fish
fishForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("fish-name").value.trim();
  const quantity = parseFloat(document.getElementById("fish-quantity").value);
  const price = parseFloat(document.getElementById("fish-price").value);
  const image = document.getElementById("fish-image").value.trim();

  if (!name || isNaN(quantity) || isNaN(price) || !image) return;

  const productData = { name, quantity, price, image };

  if (editId) {
    // Edit existing
    productData.id = editId;
    updateProduct(productData);
  } else {
    // Add new
    createProduct(productData);
  }

  closeDashboardModal();
});

// Delete Fish
window.deleteFish = function (id) {
  if (confirm("Are you sure you want to delete this product?")) {
    deleteProductFromDB(id);
  }
};

// Cancel modal
cancelDashboardModal.addEventListener("click", closeDashboardModal);

// Overlay click closes modal
dashboardModal
  .querySelector(".modal-overlay")
  .addEventListener("click", closeDashboardModal);

// ESC key closes modal
document.addEventListener("keydown", function (e) {
  if (dashboardModal.classList.contains("active") && e.key === "Escape") {
    closeDashboardModal();
  }
});

// Close modal function
function closeDashboardModal() {
  dashboardModal.classList.remove("active");
  dashboardModal.setAttribute("aria-hidden", "true");
  fishForm.reset();
  editId = null;
}

// --- Notification system ---
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
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
        align-items: center;
        gap: 12px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
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
`;
document.head.appendChild(style);

// --- Initialize dashboard ---
document.addEventListener("DOMContentLoaded", function () {
  fetchProducts(); // Load products from database
});

// --- Export functionality ---
const exportBtn = document.getElementById("export-btn");
if (exportBtn) {
  exportBtn.addEventListener("click", function () {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Name,Quantity,Price,Status\n" +
      inventory
        .map(
          (item) =>
            `${item.id},"${item.name}",${item.quantity},${
              item.price
            },"${getStatusText(item.status)}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("Inventory exported successfully!");
  });
}

// --- Logout functionality ---
document.querySelector(".logout-btn").addEventListener("click", function () {
  if (confirm("Are you sure you want to logout?")) {
    showNotification("Logging out...");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  }
});
