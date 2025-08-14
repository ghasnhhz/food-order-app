import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, addOrder } from '../api';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Address form state
  const [address, setAddress] = useState({
    district: '',
    street: '',
    apartmentNo: '',
    telNo: ''
  });

  useEffect(() => {
    // Check authentication
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    // Load cart from localStorage
    const savedCart = localStorage.getItem('foodCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [navigate]);

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem('foodCart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedCart = cart.map(item =>
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);
  };

  const removeItem = (itemId) => {
    const updatedCart = cart.filter(item => item._id !== itemId);
    updateCart(updatedCart);
  };

  const calculateItemTotal = (item) => {
    const price = parseFloat(item.price.replace('$', '').trim());
    return (price * item.quantity).toFixed(2);
  };

  const calculateGrandTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', '').trim());
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!address.district.trim()) return 'District is required';
    if (!address.street.trim()) return 'Street is required';
    if (!address.apartmentNo || address.apartmentNo < 0) return 'Valid apartment number is required';
    if (!address.telNo || address.telNo.toString().length < 9) return 'Valid phone number is required (minimum 9 digits)';
    return null;
  };

  const handlePlaceOrder = async () => {
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Place orders for each item (your backend accepts one item per order)
      const orderPromises = cart.map(item => 
        addOrder({
          menuItem: item._id,
          count: item.quantity,
          totalCost: `$ ${calculateItemTotal(item)}`,
          address: {
            ...address,
            apartmentNo: parseInt(address.apartmentNo),
            telNo: parseInt(address.telNo)
          }
        })
      );

      const results = await Promise.all(orderPromises);
      
      // Check if all orders were successful
      const failedOrders = results.filter(result => !result.success);
      if (failedOrders.length > 0) {
        setError('Some orders failed. Please try again.');
        return;
      }

      // Clear cart and navigate to confirmation
      localStorage.removeItem('foodCart');
      navigate('/order-confirmation', { 
        state: { 
          orders: results.map(r => r.data),
          totalAmount: calculateGrandTotal(),
          itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
        }
      });

    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '3rem',
          borderRadius: '15px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ color: '#666', marginBottom: '1rem' }}>Your Cart is Empty</h2>
          <p style={{ color: '#999', marginBottom: '2rem' }}>
            Add some delicious items to your cart to get started!
          </p>
          <button
            onClick={() => navigate('/menu')}
            style={{
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '25px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff5252'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff6b6b'}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              color: '#ff6b6b',
              fontSize: '1.8rem',
              fontWeight: 'bold'
            }}>
              🛒 Your Cart
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>
              Review your order, {user?.username}
            </p>
          </div>
          <button
            onClick={() => navigate('/menu')}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
          >
            ← Back to Menu
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '2rem',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          
          {/* Cart Items */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Order Items</h2>
            
            {cart.map((item) => (
              <div 
                key={item._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #eee',
                  marginBottom: '1rem'
                }}
              >
                {/* Food Icon */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ff6b6b, #ffa500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginRight: '1rem'
                }}>
                  🍽️
                </div>

                {/* Item Details */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#333' }}>{item.name}</h4>
                  <p style={{ margin: 0, color: '#ff6b6b', fontWeight: 'bold' }}>{item.price} each</p>
                </div>

                {/* Quantity Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginRight: '1rem'
                }}>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      border: '1px solid #ddd',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    −
                  </button>
                  <span style={{
                    minWidth: '40px',
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      border: '1px solid #ddd',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Item Total */}
                <div style={{ minWidth: '80px', textAlign: 'right' }}>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem',
                    color: '#28a745'
                  }}>
                    $ {calculateItemTotal(item)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item._id)}
                  style={{
                    marginLeft: '1rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary & Address */}
          <div>
            {/* Order Summary */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '15px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Order Summary</h3>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #eee'
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total:</span>
                <span style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 'bold',
                  color: '#28a745'
                }}>
                  $ {calculateGrandTotal()}
                </span>
              </div>
            </div>

            {/* Delivery Address */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '15px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Delivery Address</h3>
              
              {error && (
                <div style={{
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  padding: '0.75rem',
                  borderRadius: '5px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  border: '1px solid #f5c6cb'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={address.district}
                    onChange={handleAddressChange}
                    placeholder="Enter your district"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Street *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    placeholder="Enter your street"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Apartment Number *
                  </label>
                  <input
                    type="number"
                    name="apartmentNo"
                    value={address.apartmentNo}
                    onChange={handleAddressChange}
                    placeholder="Enter apartment number"
                    min="0"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="telNo"
                    value={address.telNo}
                    onChange={handleAddressChange}
                    placeholder="Enter your phone number"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#218838';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#28a745';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '20px',
                    height: '20px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem'
                  }}></span>
                  Placing Order...
                </>
              ) : (
                `Place Order - $ ${calculateGrandTotal()}`
              )}
            </button>

            <p style={{
              textAlign: 'center',
              marginTop: '1rem',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              Estimated delivery: 30-45 minutes
            </p>
          </div>
        </div>
      </main>

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .cart-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Cart;