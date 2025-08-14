import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../api';

function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Get order data from navigation state
  const { orders, totalAmount, itemCount } = location.state || {};

  useEffect(() => {
    // Check authentication
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    // If no order data, redirect to menu
    if (!orders || !totalAmount) {
      navigate('/menu');
      return;
    }
  }, [navigate, orders, totalAmount]);

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  const handleViewOrders = () => {
    // This could navigate to an orders history page in the future
    navigate('/menu');
  };

  if (!orders || !totalAmount) {
    return null; // Will redirect in useEffect
  }

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '3rem',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Success Animation Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.05), rgba(255, 107, 107, 0.05))',
          zIndex: 0
        }}></div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Success Icon */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#28a745',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '3rem',
            animation: 'bounce 0.6s ease-in-out'
          }}>
            ✅
          </div>

          {/* Success Message */}
          <h1 style={{
            color: '#28a745',
            fontSize: '2.5rem',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            Order Confirmed!
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            Thank you, <strong>{user?.username}</strong>! Your delicious order has been received and is being prepared with love.
          </p>

          {/* Order Summary */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ 
              color: '#333', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              Order Summary
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              textAlign: 'left'
            }}>
              <div>
                <p style={{ 
                  margin: '0.5rem 0',
                  color: '#666'
                }}>
                  <strong>Order IDs:</strong>
                </p>
                <div style={{ 
                  fontSize: '0.9rem',
                  color: '#007bff',
                  fontFamily: 'monospace',
                  backgroundColor: '#fff',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  border: '1px solid #dee2e6'
                }}>
                  {orders.map((order, index) => (
                    <div key={index}>#{order.orderId}</div>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ 
                  margin: '0.5rem 0',
                  color: '#666'
                }}>
                  <strong>Items:</strong> {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
                <p style={{ 
                  margin: '0.5rem 0',
                  color: '#666'
                }}>
                  <strong>Total Amount:</strong>
                </p>
                <p style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#28a745',
                  margin: 0
                }}>
                  $ {totalAmount}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <p style={{
              margin: 0,
              color: '#856404',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '1.1rem'
            }}>
              <strong>Estimated Delivery:</strong> 30-45 minutes
            </p>
          </div>

          {/* Order Status */}
          <div style={{
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              fontSize: '0.9rem',
              color: '#0c5460'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#28a745'
                }}></div>
                Order Received
              </div>
              <div style={{ color: '#ccc' }}>→</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#ffc107',
                  animation: 'pulse 1.5s infinite'
                }}></div>
                Preparing
              </div>
              <div style={{ color: '#ccc' }}>→</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#6c757d'
                }}></div>
                On the way
              </div>
              <div style={{ color: '#ccc' }}>→</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#6c757d'
                }}></div>
                Delivered
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleBackToMenu}
              style={{
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#ff5252';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ff6b6b';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Order More Food
            </button>

            <button
              onClick={handleViewOrders}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#0056b3';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Track Order
            </button>
          </div>

          {/* Thank You Message */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 107, 107, 0.2)'
          }}>
            <p style={{
              margin: 0,
              color: '#d63384',
              fontSize: '1rem',
              fontStyle: 'italic'
            }}>
              "Thank you for choosing FoodieDelight! We're cooking up something special just for you!"
            </p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0, -10px, 0);
            }
            70% {
              transform: translate3d(0, -5px, 0);
            }
            90% {
              transform: translate3d(0, -2px, 0);
            }
          }

          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

export default OrderConfirmation;