import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(() => {
        const stored = localStorage.getItem('checkoutItems');
        try {
            return stored ? { items: JSON.parse(stored) } : null;
        } catch {
            return null;
        }
    });

    // Load cart from localStorage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem('pendingOrders');
        if (storedCart) {
            try {
                const orders = JSON.parse(storedCart);
                setCartItems(orders);
            } catch (error) {
                console.error('Error parsing cart data:', error);
                localStorage.removeItem('pendingOrders');
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('pendingOrders', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = useCallback((item) => {
        setCartItems(prevItems => {
            // Check if item already exists
            const existingIndex = prevItems.findIndex(i => i.id === item.id);

            if (existingIndex >= 0) {
                // Update quantity if exists
                const updated = [...prevItems];
                updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + 1;
                return updated;
            }

            // Add new item
            return [...prevItems, { ...item, quantity: 1, addedAt: new Date().toISOString() }];
        });
    }, []);

    const removeFromCart = useCallback((itemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const createPendingOrder = useCallback((items) => {
        localStorage.setItem('checkoutItems', JSON.stringify(items));
        setCurrentOrder({ items });
    }, []);

    const refundCartItem = useCallback((itemId) => {
        setCartItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, refunded: true, depositPaid: false } : item
        ));
    }, []);

    const getCartTotal = useCallback(() => {
        return cartItems.reduce((total, item) => {
            const price = item.startingPrice || item.winningBid || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    }, [cartItems]);

    const getCartCount = useCallback(() => {
        return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
    }, [cartItems]);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        createPendingOrder,
        refundCartItem,
        currentOrder,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
