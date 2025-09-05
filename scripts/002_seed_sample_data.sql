-- Insert sample customers
INSERT INTO customers (name, email, phone, address) VALUES
('John Smith', 'john.smith@email.com', '+1-555-0101', '123 Main St, Anytown, ST 12345'),
('Sarah Johnson', 'sarah.j@email.com', '+1-555-0102', '456 Oak Ave, Somewhere, ST 67890'),
('Mike Wilson', 'mike.wilson@email.com', '+1-555-0103', '789 Pine Rd, Elsewhere, ST 54321'),
('Emily Davis', 'emily.davis@email.com', '+1-555-0104', '321 Elm St, Nowhere, ST 98765'),
('Robert Brown', 'robert.brown@email.com', '+1-555-0105', '654 Maple Dr, Anywhere, ST 13579');

-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, low_stock_threshold, category, sku) VALUES
('Wireless Headphones', 'High-quality Bluetooth headphones with noise cancellation', 99.99, 25, 5, 'Electronics', 'WH-001'),
('Coffee Mug', 'Ceramic coffee mug with company logo', 12.50, 50, 10, 'Merchandise', 'MUG-001'),
('Laptop Stand', 'Adjustable aluminum laptop stand', 45.00, 15, 3, 'Accessories', 'LS-001'),
('USB Cable', 'USB-C to USB-A cable, 6ft length', 8.99, 100, 20, 'Electronics', 'USB-001'),
('Notebook', 'Spiral-bound notebook, 200 pages', 5.99, 75, 15, 'Office Supplies', 'NB-001'),
('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 29.99, 30, 8, 'Electronics', 'WM-001'),
('Water Bottle', 'Stainless steel water bottle, 32oz', 19.99, 40, 10, 'Merchandise', 'WB-001'),
('Phone Case', 'Protective phone case for iPhone', 24.99, 60, 12, 'Accessories', 'PC-001');

-- Fixed column/value mismatch by adding total_amount with default value 0.00
-- Insert sample orders
INSERT INTO orders (customer_id, total_amount, status, payment_method, notes) 
SELECT 
  c.id,
  0.00 as total_amount, -- Will be updated after order items are inserted
  CASE 
    WHEN random() < 0.7 THEN 'completed'
    WHEN random() < 0.9 THEN 'pending'
    ELSE 'cancelled'
  END as status_val,
  (ARRAY['cash', 'credit_card', 'debit_card'])[floor(random() * 3 + 1)] as payment_method,
  'Sample order for ' || c.name
FROM customers c
CROSS JOIN generate_series(1, 2) -- 2 orders per customer
LIMIT 10;

-- Insert sample order items (this is a simplified version - in real app, this would be more complex)
WITH order_data AS (
  SELECT 
    o.id as order_id,
    p.id as product_id,
    p.price,
    (1 + floor(random() * 3))::integer as quantity -- 1-3 items
  FROM orders o
  CROSS JOIN products p
  WHERE random() < 0.3 -- 30% chance of each product being in each order
)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
SELECT 
  order_id,
  product_id,
  quantity,
  price as unit_price,
  (quantity * price) as total_price
FROM order_data;

-- Update order totals based on order items
UPDATE orders 
SET total_amount = (
  SELECT COALESCE(SUM(total_price), 0)
  FROM order_items 
  WHERE order_items.order_id = orders.id
);

-- Insert some inventory transactions for restocking
INSERT INTO inventory_transactions (product_id, transaction_type, quantity_change, notes)
SELECT 
  id as product_id,
  'restock' as transaction_type,
  stock_quantity as quantity_change,
  'Initial stock setup'
FROM products;
