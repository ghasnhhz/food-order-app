import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenu, logoutUser, getCurrentUser } from './api';

function Menu() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Get current user info
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

    // Fetch menu
    fetchMenu();
  }, [navigate]);

  useEffect(() => {
    // Filter menu based on search term
    if (searchTerm) {
      const filtered = menu.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMenu(filtered);
    } else {
      setFilteredMenu(menu);
    }
  }, [searchTerm, menu]);

  const fetchMenu = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getMenu();
      
      if (result.success) {
        setMenu(result.data);
        setFilteredMenu(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map(cartItem =>
        cartItem._id === item._id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    } else {
      updatedCart = [...cart, { ...item, quantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('foodCart', JSON.stringify(updatedCart));
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('foodCart'); // Clear cart on logout
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/login');
    }
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #ff6b6b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <h3 style={{ color: '#666' }}>Loading delicious menu...</h3>
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
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              color: '#ff6b6b',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              FoodieDelight
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Welcome back, {user?.username}!
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Cart Button */}
            <button
              onClick={handleViewCart}
              style={{
                position: 'relative',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#ff5252'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ff6b6b'}
            >
              🛒 Cart
              {getCartItemCount() > 0 && (
                <span style={{
                  backgroundColor: '#fff',
                  color: '#ff6b6b',
                  borderRadius: '50%',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  minWidth: '1.5rem',
                  textAlign: 'center'
                }}>
                  {getCartItemCount()}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
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
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <input
            type="text"
            placeholder="Search for your favorite food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '1rem 1.5rem',
              fontSize: '1.1rem',
              border: '2px solid #e9ecef',
              borderRadius: '50px',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            textAlign: 'center',
            border: '1px solid #f5c6cb'
          }}>
            <strong>Oops!</strong> {error}
            <button 
              onClick={fetchMenu}
              style={{
                marginLeft: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#721c24',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Menu Grid */}
        {filteredMenu.length > 0 ? (
          <>
            <h2 style={{ 
              textAlign: 'center', 
              marginBottom: '2rem',
              color: '#333',
              fontSize: '2rem'
            }}>
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Our Delicious Menu'}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {filteredMenu.map((item) => (
                <div 
                  key={item._id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Food Image Placeholder */}
                  <div style={{
                    height: '200px',
                    background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem'
                  }}>
                    🍽️
                  </div>

                  {/* Food Info */}
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.5rem',
                      color: '#333',
                      fontWeight: '600'
                    }}>
                      {item.name}
                    </h3>
                    
                    <p style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: 'bold', 
                      color: '#ff6b6b',
                      margin: '0 0 1.5rem 0'
                    }}>
                      {item.price}
                    </p>

                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#218838';
                        e.target.style.transform = 'scale(1.02)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#28a745';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          !loading && !error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              backgroundColor: '#fff',
              borderRadius: '15px',
              margin: '2rem 0'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>
                {searchTerm ? 'No food found' : 'No menu items available'}
              </h3>
              <p style={{ color: '#999' }}>
                {searchTerm 
                  ? `Try searching for something else`
                  : 'Please check back later for our delicious offerings'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          )
        )}
      </main>

      {/* Floating Cart Button for Mobile */}
      {getCartItemCount() > 0 && (
        <button
          onClick={handleViewCart}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          🛒
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#fff',
            color: '#ff6b6b',
            borderRadius: '50%',
            width: '25px',
            height: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            {getCartItemCount()}
          </span>
        </button>
      )}

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Menu;