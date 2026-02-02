
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        return [];
      }
    }
    return [];
  });
  
  const { toast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (product, variant = null, quantity = 1, maxQuantity = null) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.variantId === (variant?.id || null)
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        const currentQty = newItems[existingItemIndex].quantity;
        const newQty = currentQty + quantity;

        if (maxQuantity !== null && newQty > maxQuantity) {
          toast({
            title: "Limit reached",
            description: `Sorry, we only have ${maxQuantity} of these in stock.`,
            variant: "destructive"
          });
          return prevItems;
        }

        newItems[existingItemIndex].quantity = newQty;
        
        toast({
          title: "Cart updated",
          description: `${product.name} quantity updated.`,
        });
        return newItems;
      } else {
        if (maxQuantity !== null && quantity > maxQuantity) {
          toast({
            title: "Limit reached",
            description: `Sorry, we only have ${maxQuantity} of these in stock.`,
            variant: "destructive"
          });
          return prevItems;
        }

        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });

        return [...prevItems, { 
          ...product, 
          variantId: variant?.id || null,
          variantName: variant?.name || null,
          price: variant?.price || product.price,
          image: variant?.image || product.image,
          quantity 
        }];
      }
    });
  };

  const removeFromCart = (productId, variantId = null) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => !(item.id === productId && item.variantId === variantId))
    );
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const updateQuantity = (productId, variantId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && item.variantId === variantId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
