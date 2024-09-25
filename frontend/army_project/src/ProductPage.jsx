import React, { useState, useEffect } from 'react';
import "./ProductPage.css";

function ProductPage() {
  const [products, setProducts] = useState([]); //שמירת רשימת המוצרים בכל קטגוריה
  const [category, setCategory] = useState(''); // שמירה של הקטגוריה שנבחרה
  const [lowStockItems, setLowStockItems] = useState([]); // שמירת רשימת המוצרים בהם הכמות נמוכה מ- 5 על מנת להקפיץ אותם בהודעה
  const [showModal, setShowModal] = useState(false); // הצגת ההודעה הקופצת עבור מלאי נמוך
  const userId = localStorage.getItem('user_id') || 1; //מאחסן את היוזר באתר

  //מעלה את המוצרים שבאתר
  useEffect(() => {
    if (category) {
      fetch(`http://localhost:5000/items?category=${category}`) // בקשה לשרת לקבלת המוצרים מהקטגוריה
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch products');
          }
          return response.json();
        })
        .then((data) => {
          setProducts(data);
          
          // חיפוש פריטים שהכמות שלהם קטנה מ-5
          const lowStock = data.filter(product => product.quantity < 5);
          if (lowStock.length > 0) {
            setLowStockItems(lowStock);
            setShowModal(true); // להציג את ההודעה הקופצת
          }
        })
        .catch((error) => console.error('Error fetching products:', error));
    }
  }, [category]);

    // הוספת מוצר לעגלה
  const addToCart = async (productId) => {
    try {
      const response = await fetch('http://localhost:5000/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          item_id: productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add product to cart');
      }

      alert('Product added to cart');
    } catch (error) {
      alert('Failed to add product to cart: ' + error.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (!category) {
    return (
      <div>
        <h1>Welcome to USOS!</h1>
        <div>
          <img className='icon' src="icon_Usos.png" alt="USOS Icon" />
        </div>
        <h2>Let's start shopping!</h2>
        <div className="category-grid">
          <div className="category-card" onClick={() => setCategory('clothing')}>
            <img className='pic' src="/public/Sbf55c5307f4c4031ade5a46d1071d0f6D_f17af38b-0019-4a55-90a7-3406ee98781f_1600x.svg" alt="Clothing" />
            <h2>Clothing</h2>
          </div>
          <div className="category-card" onClick={() => setCategory('footwear')}>
            <img className='pic' src="/public/women-She-Love-It-KAMILA__119-2W-1-225x300.svg" alt="Footwear" />
            <h2>Footwear</h2>
          </div>
          <div className="category-card" onClick={() => setCategory('accessories')}>
            <img className='pic' src="/public/Women_Accessories_APP_PLP_Banner_copy.svg" alt="Accessories" />
            <h2>Accessories</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>&times;</span>
            <h2>Low Stock Items</h2>
            <ul>
              {lowStockItems.map(item => (
                <li key={item.id}>{item.name} - Only {item.quantity} left!</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="back-button-container">
        <button className="back-button" onClick={() => setCategory('')}>
          Back to Categories
        </button>
      </div>

      <h1>Products in {category.charAt(0).toUpperCase() + category.slice(1)}</h1>
      {products.length === 0 ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <h2>{product.name}</h2>
              <p>Price: ${product.price}</p>
              <p>Size: {product.size}</p>
              <p>Color: {product.color}</p>
              <p>{product.in_stock ? 'In Stock' : 'Out of Stock'}</p>
              {product.image_url && (
                <img
                  src={`${product.image_url}`}
                  alt={product.name}
                  style={{ width: '150px', height: '150px' }}
                />
              )}
              <button
                onClick={() => addToCart(product.id)}
                disabled={!product.in_stock}
              >
                {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductPage;
