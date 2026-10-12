<?php
require_once '../config/database.php';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        getProducts();
        break;
    case 'POST':
        createProduct($input);
        break;
    case 'PUT':
        updateProduct($input);
        break;
    case 'DELETE':
        deleteProduct($input);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Get all products
function getProducts() {
    global $pdo;
    try {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
        $products = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $products]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch products: ' . $e->getMessage()]);
    }
}

// Create new product
function createProduct($data) {
    global $pdo;
    try {
        $quantity = floatval($data['quantity']);
        $status = getStockStatus($quantity);
        
        $stmt = $pdo->prepare("INSERT INTO products (name, quantity, price, image, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $quantity,
            floatval($data['price']),
            $data['image'],
            $status
        ]);
        
        $newId = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Product created successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create product: ' . $e->getMessage()]);
    }
}

// Update product
function updateProduct($data) {
    global $pdo;
    try {
        $quantity = floatval($data['quantity']);
        $status = getStockStatus($quantity);
        
        $stmt = $pdo->prepare("UPDATE products SET name=?, quantity=?, price=?, image=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?");
        $stmt->execute([
            $data['name'],
            $quantity,
            floatval($data['price']),
            $data['image'],
            $status,
            intval($data['id'])
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update product: ' . $e->getMessage()]);
    }
}

// Delete product
function deleteProduct($data) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id=?");
        $stmt->execute([intval($data['id'])]);
        
        echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete product: ' . $e->getMessage()]);
    }
}

// Helper function to determine stock status
function getStockStatus($quantity) {
    if ($quantity == 0) return 'out-of-stock';
    if ($quantity <= 10) return 'low-stock';
    return 'in-stock';
}
?>