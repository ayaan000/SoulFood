import React, { useState, useEffect } from 'react';
import { Store, Menu as MenuIcon, ShoppingBag, TrendingUp, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function MerchantDashboard() {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Restaurant form states
    const [restaurantForm, setRestaurantForm] = useState({
        name: '',
        category: 'pizza',
        description: '',
        image_url: '',
        delivery_time: '25-35 min',
        delivery_fee: '3.99',
        offers_pickup: true,
        offers_delivery: false,
    });

    // Menu item form states
    const [showMenuForm, setShowMenuForm] = useState(false);
    const [editingMenuItem, setEditingMenuItem] = useState(null);
    const [menuForm, setMenuForm] = useState({
        name: '',
        description: '',
        price: '',
    });

    useEffect(() => {
        loadRestaurant();
    }, [profile]);

    const loadRestaurant = async () => {
        if (!profile?.id) return;

        try {
            // Load restaurant
            const { data: restaurantData } = await supabase
                .from('restaurants')
                .select('*')
                .eq('merchant_id', profile.id)
                .single();

            if (restaurantData) {
                setRestaurant(restaurantData);
                setRestaurantForm({
                    name: restaurantData.name,
                    category: restaurantData.category,
                    description: restaurantData.description || '',
                    image_url: restaurantData.image_url || '',
                    delivery_time: restaurantData.delivery_time || '25-35 min',
                    delivery_fee: restaurantData.delivery_fee?.toString() || '3.99',
                    offers_pickup: restaurantData.offers_pickup ?? true,
                    offers_delivery: restaurantData.offers_delivery ?? false,
                });

                // Load menu items
                const { data: menuData } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('restaurant_id', restaurantData.id);
                setMenuItems(menuData || []);

                // Load orders
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select(`
            *,
            users:user_id (name, email, phone),
            order_items (*, menu_items (name, price))
          `)
                    .eq('restaurant_id', restaurantData.id)
                    .order('created_at', { ascending: false });
                setOrders(ordersData || []);
            }
        } catch (error) {
            console.error('Error loading restaurant:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRestaurant = async () => {
        try {
            const restaurantData = {
                merchant_id: profile.id,
                name: restaurantForm.name,
                category: restaurantForm.category,
                description: restaurantForm.description,
                image_url: restaurantForm.image_url || `https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=1000`,
                delivery_time: restaurantForm.delivery_time,
                delivery_fee: parseFloat(restaurantForm.delivery_fee),
                offers_pickup: restaurantForm.offers_pickup,
                offers_delivery: restaurantForm.offers_delivery,
                rating: restaurant?.rating || 0,
            };

            if (restaurant) {
                // Update existing
                const { error } = await supabase
                    .from('restaurants')
                    .update(restaurantData)
                    .eq('id', restaurant.id);

                if (error) throw error;
                alert('Restaurant updated successfully!');
            } else {
                // Create new
                const { data, error } = await supabase
                    .from('restaurants')
                    .insert([restaurantData])
                    .select()
                    .single();

                if (error) throw error;
                setRestaurant(data);
                alert('Restaurant created successfully!');
            }

            loadRestaurant();
        } catch (error) {
            console.error('Error saving restaurant:', error);
            alert('Error saving restaurant: ' + error.message);
        }
    };

    const handleSaveMenuItem = async () => {
        try {
            if (!restaurant) {
                alert('Please create a restaurant first');
                return;
            }

            const itemData = {
                restaurant_id: restaurant.id,
                name: menuForm.name,
                description: menuForm.description,
                price: parseFloat(menuForm.price),
            };

            if (editingMenuItem) {
                // Update
                const { error } = await supabase
                    .from('menu_items')
                    .update(itemData)
                    .eq('id', editingMenuItem.id);

                if (error) throw error;
                alert('Menu item updated!');
            } else {
                // Create
                const { error } = await supabase
                    .from('menu_items')
                    .insert([itemData]);

                if (error) throw error;
                alert('Menu item added!');
            }

            setShowMenuForm(false);
            setEditingMenuItem(null);
            setMenuForm({ name: '', description: '', price: '' });
            loadRestaurant();
        } catch (error) {
            console.error('Error saving menu item:', error);
            alert('Error: ' + error.message);
        }
    };

    const handleDeleteMenuItem = async (id) => {
        if (!confirm('Delete this menu item?')) return;

        try {
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadRestaurant();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            loadRestaurant();
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome, {profile?.name}</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    {['overview', 'restaurant', 'menu', 'orders'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium capitalize ${activeTab === tab
                                    ? 'border-b-2 border-green-600 text-green-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <ShoppingBag className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Orders</p>
                                    <p className="text-2xl font-bold">{orders.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <MenuIcon className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Menu Items</p>
                                    <p className="text-2xl font-bold">{menuItems.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <TrendingUp className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending Orders</p>
                                    <p className="text-2xl font-bold">
                                        {orders.filter(o => o.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Restaurant Tab */}
                {activeTab === 'restaurant' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">Restaurant Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Restaurant Name</label>
                                <input
                                    type="text"
                                    value={restaurantForm.name}
                                    onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Your Restaurant Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    value={restaurantForm.category}
                                    onChange={e => setRestaurantForm({ ...restaurantForm, category: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="pizza">Pizza</option>
                                    <option value="asian">Asian</option>
                                    <option value="burger">Burgers</option>
                                    <option value="healthy">Healthy</option>
                                    <option value="dessert">Dessert</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={restaurantForm.description}
                                    onChange={e => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows="3"
                                    placeholder="Tell customers about your restaurant..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={restaurantForm.image_url}
                                    onChange={e => setRestaurantForm({ ...restaurantForm, image_url: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="https://... (optional)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Estimated Time</label>
                                    <input
                                        type="text"
                                        value={restaurantForm.delivery_time}
                                        onChange={e => setRestaurantForm({ ...restaurantForm, delivery_time: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="25-35 min"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Delivery Fee ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={restaurantForm.delivery_fee}
                                        onChange={e => setRestaurantForm({ ...restaurantForm, delivery_fee: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="3.99"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={restaurantForm.offers_pickup}
                                        onChange={e => setRestaurantForm({ ...restaurantForm, offers_pickup: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">Offer Pickup</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={restaurantForm.offers_delivery}
                                        onChange={e => setRestaurantForm({ ...restaurantForm, offers_delivery: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">Offer Own Delivery</span>
                                </label>
                            </div>

                            <button
                                onClick={handleSaveRestaurant}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                            >
                                {restaurant ? 'Update Restaurant' : 'Create Restaurant'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Menu Tab */}
                {activeTab === 'menu' && (
                    <div>
                        {!restaurant ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                <p className="text-yellow-800">Please create your restaurant first in the Restaurant tab</p>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setShowMenuForm(true);
                                        setEditingMenuItem(null);
                                        setMenuForm({ name: '', description: '', price: '' });
                                    }}
                                    className="mb-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                >
                                    <Plus size={20} /> Add Menu Item
                                </button>

                                {showMenuForm && (
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
                                        <h3 className="font-bold mb-4">{editingMenuItem ? 'Edit' : 'Add'} Menu Item</h3>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={menuForm.name}
                                                onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="Item Name"
                                            />
                                            <textarea
                                                value={menuForm.description}
                                                onChange={e => setMenuForm({ ...menuForm, description: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                rows="2"
                                                placeholder="Description"
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={menuForm.price}
                                                onChange={e => setMenuForm({ ...menuForm, price: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="Price"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveMenuItem}
                                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowMenuForm(false);
                                                        setEditingMenuItem(null);
                                                    }}
                                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-4">
                                    {menuItems.map(item => (
                                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold">{item.name}</h3>
                                                <p className="text-sm text-gray-500">{item.description}</p>
                                                <p className="font-medium text-green-600 mt-1">${parseFloat(item.price).toFixed(2)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingMenuItem(item);
                                                        setMenuForm({
                                                            name: item.name,
                                                            description: item.description,
                                                            price: item.price.toString(),
                                                        });
                                                        setShowMenuForm(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMenuItem(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl text-center text-gray-500">
                                No orders yet
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-lg">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                                            <p className="text-sm text-gray-700 mt-1">
                                                Customer: {order.users?.name} ({order.users?.phone})
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-green-100 text-green-800'
                                                }`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mb-4">
                                        <p className="font-medium mb-2">Items:</p>
                                        {order.order_items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm mb-1">
                                                <span>{item.quantity}x {item.menu_items?.name}</span>
                                                <span>${(item.quantity * parseFloat(item.price)).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {order.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                                                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                            >
                                                <Check size={18} /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                            >
                                                <X size={18} /> Reject
                                            </button>
                                        </div>
                                    )}

                                    {order.status === 'accepted' && (
                                        <button
                                            onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                                        >
                                            Mark as Ready
                                        </button>
                                    )}

                                    {order.status === 'ready' && (
                                        <button
                                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                        >
                                            Mark as Completed
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
