import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShoppingCart.css';

function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();  

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || 1;

    fetch(`http://localhost:5000/cart?user_id=${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }
        return response.json();
      })
      .then(data => setCartItems(data))
      .catch(error => console.error('Error fetching cart items:', error));  
  }, []);

  const removeFromCart = async (itemId) => {
    const userId = localStorage.getItem('user_id') || 1;

    const response = await fetch(`http://localhost:5000/cart/remove/${itemId}?user_id=${userId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } else {
      console.error('Failed to remove item from cart');
    }
  };

  const removeAllFromCart = async () => {
    const userId = localStorage.getItem('user_id') || 1;

    const response = await fetch(`http://localhost:5000/cart/clear?user_id=${userId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setCartItems([]);
    } else {
      console.error('Failed to remove all items from cart');
    }
  };

  const increaseQuantity = async (itemId) => {
    const userId = localStorage.getItem('user_id') || 1;

    const response = await fetch(`http://localhost:5000/cart/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, item_id: itemId, change: 1 })
    });

    if (response.ok) {
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      console.error('Failed to increase item quantity');
    }
  };

  const decreaseQuantity = async (itemId) => {
    const userId = localStorage.getItem('user_id') || 1;
    const item = cartItems.find(item => item.id === itemId);

    if (item.quantity > 1) {
      const response = await fetch(`http://localhost:5000/cart/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, item_id: itemId, change: -1 })
      });

      if (response.ok) {
        setCartItems(cartItems.map(item => 
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        ));
      } else {
        console.error('Failed to decrease item quantity');
      }
    } else {
      removeFromCart(itemId);
    }
  };

  // פונקציה לחישוב המחיר לאחר הנחה של 50% על פריט שני מאותה קטגוריה
const calculateDiscountedTotal = () => {
  const categoryItems = {};

  // קיבוץ פריטים לפי קטגוריה
  cartItems.forEach(item => {
    if (!categoryItems[item.category_id]) {
      categoryItems[item.category_id] = [];
    }
    for (let i = 0; i < item.quantity; i++) {
      categoryItems[item.category_id].push({ ...item, quantity: 1 });
    }
  });

  let totalPrice = 0;

  // חישוב מחיר כולל לאחר הנחה
  Object.values(categoryItems).forEach(items => {
    // מיון פריטים לפי מחיר מהגבוה לנמוך
    items.sort((a, b) => b.price - a.price);
    items.forEach((item, index) => {
      if (index % 2 === 1) {
        // הנחה של 50% על הפריט השני בכל זוג
        totalPrice += item.price * 0.5;
      } else {
        totalPrice += item.price;
      }
    });
  });

  return totalPrice;
};


  const handleBuy = async () => {
    const userId = localStorage.getItem('user_id') || 1;
    
    const response = await fetch(`http://localhost:5000/cart/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, items: cartItems })
    });

    const data = await response.json();
    if (response.ok) {
      setErrorMessage('');
      setCartItems([]);  
    } else {
      setErrorMessage(data.message);
    }
  };

  return (
    <div>
      <h1>Shopping Cart</h1>
      <div className="product-grid">
        {cartItems.map(item => (
          <div key={item.id} className="product-card">
            <h2>{item.name}</h2>
            <p>Quantity: {item.quantity}</p>
            <p>Price: {item.price}$</p>
            <button onClick={() => decreaseQuantity(item.id)}>-</button>
            <button onClick={() => increaseQuantity(item.id)}>+</button>
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </div>
        ))}
      </div>
      <p>Total: ${calculateDiscountedTotal()}</p>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {cartItems.length > 0 && (
        <>
          <div className="remove-all-container">
            <button onClick={removeAllFromCart} className="remove-all-button">
              Remove All
            </button>
          </div>

          <div className="buy-button-container">
            <button onClick={handleBuy} className="buy-button">
              Buy Now
            </button>
          </div>
        </>
      )}

      <div className="back-button-container">
        <button onClick={() => navigate('/products')} className="back-button">
          Back to Products
        </button>
      </div>
    </div>
  );
}

export default ShoppingCart;
