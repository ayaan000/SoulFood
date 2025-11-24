import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ChefHat,
  MapPin,
  DollarSign,
  Info,
  Search,
  Star,
  Clock,
  ArrowRight,
  Heart,
  Store,
  Truck,
  X,
  Plus,
  Minus,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import MerchantDashboard from './components/MerchantDashboard';
import FeeComparison from './components/FeeComparison';
import { supabase } from './lib/supabase';

// --- Mock Data ---

const CATEGORIES = [
  { id: 'all', name: 'All', icon: null },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'asian', name: 'Asian', icon: '🍜' },
  { id: 'burger', name: 'Burgers', icon: '🍔' },
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
];

const RESTAURANTS = [
  {
    id: 1,
    name: "Mama Lena's Trattoria",
    category: "pizza",
    rating: 4.8,
    deliveryTime: "25-35 min",
    deliveryFee: 3.99, // Goes to driver
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=1000",
    description: "Family owned since 1985. We define our own prices.",
    menu: [
      { id: 101, name: "Margherita Classico", price: 14.00, desc: "San Marzano tomato sauce, fresh mozzarella, basil." },
      { id: 102, name: "Truffle Mushroom", price: 18.50, desc: "Wild mushrooms, truffle oil, thyme, parmesan." },
      { id: 103, name: "Homemade Tiramisu", price: 8.00, desc: "Espresso soaked ladyfingers, mascarpone cream." }
    ]
  },
  {
    id: 2,
    name: "Burger Collective",
    category: "burger",
    rating: 4.5,
    deliveryTime: "15-25 min",
    deliveryFee: 2.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1000",
    description: "100% grass-fed beef. No platform fees added.",
    menu: [
      { id: 201, name: "The OG Smash", price: 12.00, desc: "Double patty, american cheese, house sauce." },
      { id: 202, name: "Spicy Crispy Chicken", price: 13.50, desc: "Buttermilk fried chicken, spicy slaw, pickles." },
      { id: 203, name: "Cajun Fries", price: 4.50, desc: "Hand-cut fries with cajun seasoning." }
    ]
  },
  {
    id: 3,
    name: "Zen Bowl",
    category: "healthy",
    rating: 4.9,
    deliveryTime: "30-40 min",
    deliveryFee: 4.50,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
    description: "Plant-based goodness. Profits stay local.",
    menu: [
      { id: 301, name: "Buddha Bowl", price: 15.00, desc: "Quinoa, roasted chickpeas, avocado, tahini dressing." },
      { id: 302, name: "Miso Glazed Eggplant", price: 14.00, desc: "Japanese eggplant, sesame seeds, scallions." },
      { id: 303, name: "Green Detox Juice", price: 7.00, desc: "Kale, apple, cucumber, ginger." }
    ]
  }
];

function AppContent() {
  const [view, setView] = useState('home'); // home, restaurant, cart, merchant
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login');
  const [isMerchantAuth, setIsMerchantAuth] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, profile, signOut } = useAuth();

  // Load restaurants from database
  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          menu_items (*)
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Format restaurants to match expected structure
      const formattedRestaurants = (data || []).map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        rating: r.rating || 0,
        deliveryTime: r.delivery_time || '25-35 min',
        deliveryFee: parseFloat(r.delivery_fee) || 0,
        image: r.image_url || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=1000',
        description: r.description || '',
        offersPickup: r.offers_pickup ?? true,
        offersDelivery: r.offers_delivery ?? false,
        menu: (r.menu_items || []).map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          desc: item.description || ''
        }))
      }));

      setRestaurants(formattedRestaurants);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      // Fall back to mock data if database fails
      setRestaurants(RESTAURANTS);
    } finally {
      setLoading(false);
    }
  };

  // --- Logic ---

  const addToCart = (item, restaurant) => {
    // Basic check to ensure cart only has items from one restaurant
    if (cart.length > 0 && cart[0].restaurantId !== restaurant.id) {
      if (!confirm("Start a new basket? You can only order from one restaurant at a time.")) return;
      setCart([{ ...item, qty: 1, restaurantId: restaurant.id, restaurantName: restaurant.name, deliveryFee: restaurant.deliveryFee }]);
      return;
    }

    const existing = cart.find(x => x.id === item.id);
    if (existing) {
      setCart(cart.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
    } else {
      setCart([...cart, { ...item, qty: 1, restaurantId: restaurant.id, restaurantName: restaurant.name, deliveryFee: restaurant.deliveryFee }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existing = cart.find(x => x.id === itemId);
    if (existing.qty === 1) {
      setCart(cart.filter(x => x.id !== itemId));
    } else {
      setCart(cart.map(x => x.id === itemId ? { ...x, qty: x.qty - 1 } : x));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  const getDeliveryFee = () => {
    return cart.length > 0 ? cart[0].deliveryFee : 0;
  };

  const placeOrder = async () => {
    if (!user) {
      alert('Please sign in to place an order');
      setAuthModalOpen(true);
      return;
    }

    if (profile?.type === 'merchant') {
      alert('Merchants cannot place orders. Please sign in as a customer.');
      return;
    }

    if (cart.length === 0) return;

    try {
      const subtotal = getCartTotal();
      const deliveryFee = getDeliveryFee();
      const total = subtotal + deliveryFee;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          restaurant_id: cart[0].restaurantId,
          status: 'pending',
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total: total
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.qty,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Success!
      alert(`Order placed successfully! Total: $${total.toFixed(2)}\n\nThe restaurant will review your order shortly.`);
      setCart([]);
      setView('home');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order: ' + error.message);
    }
  };

  // --- Components ---

  const Header = () => (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => { setView('home'); setSelectedRestaurant(null); }}
        >
          <div className="bg-green-600 text-white p-1.5 rounded-lg">
            <Store size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-gray-900 leading-none">Soul Food</h1>
            <span className="text-[10px] text-green-600 font-medium uppercase tracking-wider">Fair Delivery</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <button
                onClick={() => setView('merchant')}
                className="hidden md:flex text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
              >
                Restaurant Owner?
              </button>
              <button
                onClick={() => {
                  setAuthModalView('login');
                  setIsMerchantAuth(false);
                  setAuthModalOpen(true);
                }}
                className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              >
                <LogIn size={18} />
                Sign In
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <UserIcon size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{profile?.name || user.email}</span>
                {profile?.type === 'merchant' && (
                  <>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">MERCHANT</span>
                    <button
                      onClick={() => setView('merchantDashboard')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Dashboard
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={signOut}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} className="text-gray-500" />
              </button>
            </div>
          )}
          <div
            className="relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setView('cart')}
          >
            <ShoppingBag size={24} className="text-gray-700" />
            {cart.length > 0 && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const Hero = () => (
    <div className="bg-green-50 px-4 py-8 md:py-12 mb-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
              <DollarSign size={14} />
              Zero Commissions. 100% to Restaurants.
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              Order directly. <br />
              <span className="text-green-600">Save your favorite spots.</span>
            </h2>
            <p className="text-gray-600">
              Big delivery apps take up to 30% from local restaurants. We take 0%.
              Pay the restaurant directly and support your community.
            </p>
          </div>
          <div className="hidden md:block bg-white p-4 rounded-xl shadow-lg -rotate-2 w-64">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Commission Paid</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-bold text-green-600 text-lg">
              <span>Restaurant Profit</span>
              <span>100%</span>
            </div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const RestaurantList = () => {
    const filtered = activeCategory === 'all'
      ? restaurants
      : restaurants.filter(r => r.category === activeCategory);

    if (loading) {
      return (
        <div className="max-w-4xl mx-auto px-4 pb-20 text-center py-12">
          <div className="text-gray-500">Loading restaurants...</div>
        </div>
      );
    }

    if (restaurants.length === 0) {
      return (
        <div className="max-w-4xl mx-auto px-4 pb-20 text-center py-12">
          <div className="text-gray-500">No restaurants available yet. Check back soon!</div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* Categories */}
        <div className="flex overflow-x-auto gap-3 pb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items - center gap - 2 px - 4 py - 2 rounded - full whitespace - nowrap text - sm font - medium transition - all ${activeCategory === cat.id
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                } `}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(restaurant => (
            <div
              key={restaurant.id}
              onClick={() => { setSelectedRestaurant(restaurant); setView('restaurant'); }}
              className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                  <Clock size={12} className="text-gray-400" />
                  {restaurant.deliveryTime}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-gray-900">{restaurant.name}</h3>
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-bold">
                    <Star size={10} fill="currentColor" />
                    {restaurant.rating}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-1">{restaurant.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1">
                    <Truck size={12} />
                    ${restaurant.deliveryFee} fee
                  </div>
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <DollarSign size={12} />
                    No Markup
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RestaurantDetail = () => (
    <div className="max-w-4xl mx-auto pb-20 bg-white min-h-screen">
      <div className="h-64 relative">
        <img src={selectedRestaurant.image} className="w-full h-full object-cover" />
        <button
          onClick={() => setView('home')}
          className="absolute top-4 left-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
        >
          <ArrowRight className="rotate-180" size={20} />
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{selectedRestaurant.name}</h1>
          <div className="flex items-center gap-4 text-sm font-medium opacity-90">
            <span className="flex items-center gap-1"><Star size={14} fill="currentColor" /> {selectedRestaurant.rating}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {selectedRestaurant.deliveryTime}</span>
            <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs">Direct Partner</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">Menu</h2>
        <div className="space-y-6">
          {selectedRestaurant.menu.map(item => (
            <div key={item.id} className="flex justify-between items-center group">
              <div className="pr-4">
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
                <div className="font-medium text-gray-900">${item.price.toFixed(2)}</div>
              </div>
              <button
                onClick={() => addToCart(item, selectedRestaurant)}
                className="bg-gray-100 hover:bg-green-600 hover:text-white text-gray-900 p-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CartView = () => {
    const subtotal = getCartTotal();
    const delivery = getDeliveryFee();
    const total = subtotal + delivery;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <button onClick={() => setView('home')}><ArrowRight className="rotate-180 text-gray-400" /></button>
          Your Order
        </h2>

        {cart.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
            <p>Your basket is empty.</p>
            <button
              onClick={() => setView('home')}
              className="mt-4 text-green-600 font-medium hover:underline"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Store size={14} />
                Ordering from <span className="font-bold text-gray-900">{cart[0].restaurantName}</span>
              </div>

              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-50 w-8 h-8 flex items-center justify-center rounded text-sm font-bold text-gray-700">
                        {item.qty}x
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-medium">${(item.price * item.qty).toFixed(2)}</div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Minus size={14} /></button>
                        <button onClick={() => addToCart(item, selectedRestaurant)} className="text-gray-400 hover:text-green-500 p-1"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Comparison */}
            <FeeComparison subtotal={subtotal} />

            {/* The "Fair Breakdown" Section */}
            <div className="bg-gray-50 p-6 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1"><Truck size={14} /> Driver Fee (100% to driver)</span>
                <span>${delivery.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-700 font-medium py-2 border-y border-gray-200 border-dashed">
                <span className="flex items-center gap-1"><Info size={14} /> Platform Service Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-6 bg-white">
              <button
                onClick={placeOrder}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
              >
                Place Order
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                By ordering here, you saved this restaurant approx ${(subtotal * 0.30).toFixed(2)} in commission fees.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const MerchantPortal = () => (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={() => setView('home')}
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-900"
      >
        <ArrowRight className="rotate-180" size={16} /> Back to App
      </button>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
            For Restaurants
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Stop paying 30% to access your own customers.</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-green-100 p-3 rounded-lg h-fit text-green-700"><DollarSign /></div>
              <div>
                <h3 className="font-bold text-lg">Keep 100% of Revenue</h3>
                <p className="text-gray-600">We don't touch your food prices. You charge what you want, you keep what you earn.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-purple-100 p-3 rounded-lg h-fit text-purple-700"><Truck /></div>
              <div>
                <h3 className="font-bold text-lg">Flexible Delivery</h3>
                <p className="text-gray-600">Use our network of independent drivers (paid by the customer) or use your own staff.</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setAuthModalView('signup');
              setIsMerchantAuth(true);
              setAuthModalOpen(true);
            }}
            className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800"
          >
            Join the Network
          </button>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-center">Earnings Comparison (Monthly)</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="text-gray-500 text-xs uppercase font-bold mb-1">Standard Apps</div>
              <div className="text-2xl font-bold text-gray-900">$10,000</div>
              <div className="text-red-500 text-sm font-medium">-$3,000 Fees</div>
              <div className="mt-2 pt-2 border-t border-red-200 font-bold text-gray-900">$7,000 Net</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">US</div>
              <div className="text-gray-500 text-xs uppercase font-bold mb-1">Soul Food</div>
              <div className="text-2xl font-bold text-gray-900">$10,000</div>
              <div className="text-green-600 text-sm font-medium">$0 Fees</div>
              <div className="mt-2 pt-2 border-t border-green-200 font-bold text-green-700">$10,000 Net</div>
            </div>
          </div>

          <p className="text-xs text-center text-gray-400">Based on $10k gross delivery sales.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      <Header />
      {view === 'home' && (
        <>
          <Hero />
          <RestaurantList />
        </>
      )}
      {view === 'restaurant' && selectedRestaurant && <RestaurantDetail />}
      {view === 'cart' && <CartView />}
      {view === 'merchant' && <MerchantPortal />}
      {view === 'merchantDashboard' && <MerchantDashboard />}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authModalView}
        isMerchant={isMerchantAuth}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
