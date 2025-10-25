-- Database Schema for Chiryani POS System
-- Run these queries in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    order_source VARCHAR(20) NOT NULL CHECK (order_source IN ('dine-in', 'zomato', 'swiggy', 'call')),
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily stats table
CREATE TABLE daily_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    zomato_orders INTEGER NOT NULL DEFAULT 0,
    swiggy_orders INTEGER NOT NULL DEFAULT 0,
    call_orders INTEGER NOT NULL DEFAULT 0,
    dine_in_orders INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_source ON orders(order_source);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_daily_stats_date ON daily_stats(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at 
    BEFORE UPDATE ON daily_stats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your authentication needs)
CREATE POLICY "Allow all operations on orders" ON orders
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on daily_stats" ON daily_stats
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample orders data
INSERT INTO orders (order_number, customer_name, order_source, items, total_amount, tax_amount, status, created_at) VALUES
('CHB-001001', 'Rahul Sharma', 'dine-in', '[{"id": "1", "name": "Chicken Biryani", "price": 250, "quantity": 2}]', 500, 25, 'delivered', NOW() - INTERVAL '2 hours'),
('CHB-001002', 'Priya Singh', 'zomato', '[{"id": "2", "name": "Mutton Biryani", "price": 350, "quantity": 1}, {"id": "3", "name": "Raita", "price": 80, "quantity": 1}]', 430, 21.5, 'delivered', NOW() - INTERVAL '3 hours'),
('CHB-001003', 'Amit Kumar', 'swiggy', '[{"id": "1", "name": "Chicken Biryani", "price": 250, "quantity": 1}, {"id": "4", "name": "Lassi", "price": 60, "quantity": 2}]', 370, 18.5, 'delivered', NOW() - INTERVAL '4 hours'),
('CHB-001004', null, 'call', '[{"id": "5", "name": "Veg Biryani", "price": 200, "quantity": 3}]', 600, 30, 'ready', NOW() - INTERVAL '30 minutes'),
('CHB-001005', 'Sneha Patel', 'dine-in', '[{"id": "2", "name": "Mutton Biryani", "price": 350, "quantity": 2}]', 700, 35, 'preparing', NOW() - INTERVAL '15 minutes'),
('CHB-001006', 'Vikash Gupta', 'zomato', '[{"id": "1", "name": "Chicken Biryani", "price": 250, "quantity": 1}, {"id": "6", "name": "Naan", "price": 40, "quantity": 4}, {"id": "3", "name": "Raita", "price": 80, "quantity": 2}]', 570, 28.5, 'pending', NOW() - INTERVAL '5 minutes'),
('CHB-001007', 'Kavita Mehta', 'call', '[{"id": "7", "name": "Egg Biryani", "price": 220, "quantity": 2}]', 440, 22, 'delivered', NOW() - INTERVAL '1 day'),
('CHB-001008', 'Ravi Agarwal', 'swiggy', '[{"id": "2", "name": "Mutton Biryani", "price": 350, "quantity": 1}, {"id": "4", "name": "Lassi", "price": 60, "quantity": 1}]', 410, 20.5, 'delivered', NOW() - INTERVAL '1 day'),
('CHB-001009', null, 'dine-in', '[{"id": "5", "name": "Veg Biryani", "price": 200, "quantity": 2}, {"id": "8", "name": "Papad", "price": 30, "quantity": 3}]', 490, 24.5, 'delivered', NOW() - INTERVAL '1 day'),
('CHB-001010', 'Arjun Reddy', 'zomato', '[{"id": "1", "name": "Chicken Biryani", "price": 250, "quantity": 3}]', 750, 37.5, 'delivered', NOW() - INTERVAL '2 days');

-- Insert daily stats for today
INSERT INTO daily_stats (date, total_orders, total_revenue, zomato_orders, swiggy_orders, call_orders, dine_in_orders) VALUES
(CURRENT_DATE, 6, 3170, 2, 1, 1, 2),
(CURRENT_DATE - INTERVAL '1 day', 3, 1340, 1, 1, 1, 0),
(CURRENT_DATE - INTERVAL '2 days', 1, 750, 1, 0, 0, 0),
(CURRENT_DATE - INTERVAL '3 days', 8, 4200, 3, 2, 2, 1),
(CURRENT_DATE - INTERVAL '4 days', 5, 2650, 1, 1, 1, 2),
(CURRENT_DATE - INTERVAL '5 days', 7, 3850, 2, 2, 1, 2),
(CURRENT_DATE - INTERVAL '6 days', 4, 2100, 1, 1, 1, 1);

-- Verify the data
SELECT 'Orders created: ' || COUNT(*) as result FROM orders
UNION ALL
SELECT 'Daily stats created: ' || COUNT(*) as result FROM daily_stats;
