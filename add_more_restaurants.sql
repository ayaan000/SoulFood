-- Add popular Downtown Toronto restaurants with realistic menu items and prices
-- Based on typical Downtown Toronto pricing

-- Note: First merchant will be used for all restaurants
-- In production, each restaurant would have its own merchant account

INSERT INTO restaurants (merchant_id, name, category, description, image_url, rating, delivery_time, delivery_fee, offers_pickup, offers_delivery, is_active) VALUES
-- Get first merchant
((SELECT id FROM merchants LIMIT 1), 'Banh Mi Boys', 'asian', 'Vietnamese-inspired banh mi sandwiches and poutine fusion', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=1000', 4.7, '20-30 min', 2.99, true, true, true),
((SELECT id FROM merchants LIMIT 1), 'King Taps', 'burger', 'Craft beer and gourmet burgers in the Financial District', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1000', 4.5, '25-35 min', 3.99, true, false, true),
((SELECT id FROM merchants LIMIT 1), 'Pizzeria Libretto', 'pizza', 'Neapolitan-style wood-fired pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1000', 4.8, '30-40 min', 4.50, true, true, true),
((SELECT id FROM merchants LIMIT 1), 'Fresh on Crawford', 'healthy', 'Plant-based bowls and smoothies near Trinity Bellwoods', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000', 4.6, '15-25 min', 2.50, true, false, true),
((SELECT id FROM merchants LIMIT 1), 'Khao San Road', 'asian', 'Authentic Thai street food on Adelaide', 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&q=80&w=1000', 4.7, '25-35 min', 3.50, true, true, true),
((SELECT id FROM merchants LIMIT 1), 'Big Smoke Burger', 'burger', 'Custom-built burgers in Yonge-Dundas area', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=1000', 4.4, '20-30 min', 2.99, true, true, true),
((SELECT id FROM merchants LIMIT 1), 'Rolltation', 'healthy', 'Build-your-own sushi burritos and poke bowls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=1000', 4.6, '15-25 min', 2.00, true, false, true),
((SELECT id FROM merchants LIMIT 1), 'The Carbon Bar', 'burger', 'Alberta beef burgers and cocktails on King West', 'https://images.unsplash.com/photo-1551782450-17144efb9c50?auto=format&fit=crop&q=80&w=1000', 4.5, '25-35 min', 4.00, true, true, true);

-- Add menu items for Banh Mi Boys
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Banh Mi Boys' LIMIT 1), 'Five Spice Pork Banh Mi', 'Slow-roasted pork with pickled daikon and cilantro', 9.99),
((SELECT id FROM restaurants WHERE name = 'Banh Mi Boys' LIMIT 1), 'Grilled Chicken Banh Mi', 'Marinated chicken with fresh vegetables', 9.50),
((SELECT id FROM restaurants WHERE name = 'Banh Mi Boys' LIMIT 1), 'Bahn Mi Poutine', 'Crispy fries topped with banh mi ingredients', 12.99);

-- Add menu items for King Taps
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
((SELECT id FROM restaurants WHERE name = 'King Taps' LIMIT 1), 'The King Burger', 'Double patty, aged cheddar, bacon, special sauce', 16.99),
((SELECT id FROM restaurants WHERE name = 'King Taps' LIMIT 1), 'Crispy Chicken Sandwich', 'Buttermilk fried chicken, spicy mayo, pickles', 14.99),
((SELECT id FROM restaurants WHERE name = 'King Taps' LIMIT 1), 'Truffle Parmesan Fries', 'Hand-cut fries with truffle oil and parmesan', 8.99);

-- Add menu items for Pizzeria Libretto
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Pizzeria Libretto' LIMIT 1), 'Margherita DOC', 'San Marzano tomatoes, fior di latte, basil', 15.00),
((SELECT id FROM restaurants WHERE name = 'Pizzeria Libretto' LIMIT 1), 'Salsiccia', 'Fennel sausage, rapini, chili, mozzarella', 18.00),
((SELECT id FROM restaurants WHERE name = 'Pizzeria Libretto' LIMIT 1), 'Burrata Salad', 'Fresh burrata, heirloom tomatoes, basil', 14.00);

-- Add menu items for Fresh on Crawford
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Fresh on Crawford' LIMIT 1), 'Buddha Bowl', 'Quinoa, chickpeas, kale, tahini dressing', 14.50),
((SELECT id FROM restaurants WHERE name = 'Fresh on Crawford' LIMIT 1), 'Green Energy Smoothie', 'Spinach, mango, banana, spirulina', 8.50),
((SELECT id FROM restaurants WHERE name = 'Fresh on Crawford' LIMIT 1), 'Veggie Burger', 'House-made black bean patty with sweet potato fries', 15.99);

-- Add menu items for Khao San Road
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Khao San Road' LIMIT 1), 'Pad Thai', 'Rice noodles, tamarind sauce, peanuts, lime', 13.99),
((SELECT id FROM restaurants WHERE name = 'Khao San Road' LIMIT 1), 'Green Curry', 'Coconut curry with vegetables and jasmine rice', 14.50),
((SELECT id FROM restaurants WHERE name = 'Khao San Road' LIMIT 1), 'Mango Sticky Rice', 'Sweet sticky rice with fresh mango', 7.99);

-- Add menu items for Big Smoke Burger
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Big Smoke Burger' LIMIT 1), 'Big Smoke Original', 'Angus beef, lettuce, tomato, signature sauce', 12.99),
((SELECT id FROM restaurants WHERE name = 'Big Smoke Burger' LIMIT 1), 'The Inferno', 'Spicy beef, jalapeños, hot sauce, pepper jack', 13.99),
((SELECT id FROM restaurants WHERE name = 'Big Smoke Burger' LIMIT 1), 'Onion Rings', 'Beer-battered onion rings', 6.99);

-- Add menu items for Rolltation
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Rolltation' LIMIT 1), 'Spicy Tuna Burrito', 'Sushi rice, spicy tuna, avocado, cucumber', 13.50),
((SELECT id FROM restaurants WHERE name = 'Rolltation' LIMIT 1), 'Salmon Poke Bowl', 'Fresh salmon, edamame, seaweed, sesame', 15.99),
((SELECT id FROM restaurants WHERE name = 'Rolltation' LIMIT 1), 'California Roll Burrito', 'Crab, avocado, cucumber, sushi rice', 12.50);

-- Add menu items for The Carbon Bar
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Carbon Bar' LIMIT 1), 'Alberta Beef Burger', 'AAA Alberta beef, aged cheddar, bacon', 17.99),
((SELECT id FROM restaurants WHERE name = 'The Carbon Bar' LIMIT 1), 'Nashville Hot Chicken', 'Crispy chicken, hot sauce, pickles', 16.50),
((SELECT id FROM restaurants WHERE name = 'The Carbon Bar' LIMIT 1), 'Mac & Cheese', 'Five-cheese blend, breadcrumb topping', 9.99);
