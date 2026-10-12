<?php
// filepath: C:\xampp\htdocs\agrifishconnect\api\orders.php
<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'POST':
        createOrder($input);
        break;
    case 'GET':
        getOrders();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Create new order
function createOrder($data) {
    global $pdo;
    try {
        // First, create orders table if it doesn't exist
        $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            quantity DECIMAL(10,2) NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            customer_name VARCHAR(255) DEFAULT 'Guest Customer',
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Start transaction
        $pdo->beginTransaction();
        
        // Check if product has enough stock
        $stmt = $pdo->prepare("SELECT quantity FROM products WHERE id = ?");
        $stmt->execute([$data['product_id']]);
        $product = $stmt->fetch();
        
        if (!$product) {
            throw new Exception("Product not found");
        }
        
        if ($product['quantity'] < $data['quantity']) {
            throw new Exception("Insufficient stock available");
        }
        
        // Create order
        $stmt = $pdo->prepare("INSERT INTO orders (product_id, quantity, total_amount, customer_name, order_date) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([
            $data['product_id'],
            $data['quantity'],
            $data['total_amount'],
            $data['customer_name'] ?? 'Guest Customer'
        ]);
        
        $orderId = $pdo->lastInsertId();
        
        // Update product quantity
        $newQuantity = $product['quantity'] - $data['quantity'];
        $stmt = $pdo->prepare("UPDATE products SET quantity = ?, status = ? WHERE id = ?");
        $status = getStockStatus($newQuantity);
        $stmt->execute([$newQuantity, $status, $data['product_id']]);
        
        // Commit transaction
        $pdo->commit();
        
        echo json_encode([
            'success' => true, 
            'order_id' => $orderId,
            'message' => 'Order created successfully'
        ]);
        
    } catch(Exception $e) {
        $pdo->rollback();
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Get all orders
function getOrders() {
    global $pdo;
    try {
        $stmt = $pdo->query("
            SELECT o.*, p.name as product_name 
            FROM orders o 
            JOIN products p ON o.product_id = p.id 
            ORDER BY o.order_date DESC
        ");
        $orders = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $orders]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch orders: ' . $e->getMessage()]);
    }
}

// Helper function to determine stock status
function getStockStatus($quantity) {
    if ($quantity == 0) return 'out-of-stock';
    if ($quantity <= 10) return 'low-stock';
    return 'in-stock';
}
?>