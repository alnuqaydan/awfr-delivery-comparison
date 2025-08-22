import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartState, CartItem, MenuItem } from '@/types';

const initialState: CartState = {
  items: [],
  restaurantId: null,
  subtotal: 0,
  deliveryFee: 0,
  totalAmount: 0,
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ item: MenuItem; quantity: number; specialInstructions?: string }>) => {
      const { item, quantity, specialInstructions } = action.payload;
      
      // Check if we're adding items from a different restaurant
      if (state.restaurantId && state.restaurantId !== item.restaurantId) {
        // Clear cart if adding from different restaurant
        state.items = [];
        state.restaurantId = item.restaurantId;
      } else if (!state.restaurantId) {
        state.restaurantId = item.restaurantId;
      }

      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(cartItem => cartItem.menuItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const existingItem = state.items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        state.items[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: item.price * newQuantity,
          specialInstructions: specialInstructions || existingItem.specialInstructions,
        };
      } else {
        // Add new item
        const newCartItem: CartItem = {
          id: `${item.id}-${Date.now()}`, // Generate unique ID
          menuItem: item,
          quantity,
          specialInstructions,
          totalPrice: item.price * quantity,
        };
        state.items.push(newCartItem);
      }

      // Recalculate totals
      cartSlice.caseReducers.calculateTotals(state);
    },

    updateCartItemQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items.splice(itemIndex, 1);
        } else {
          // Update quantity
          const item = state.items[itemIndex];
          state.items[itemIndex] = {
            ...item,
            quantity,
            totalPrice: item.menuItem.price * quantity,
          };
        }
      }

      // Clear restaurant if cart is empty
      if (state.items.length === 0) {
        state.restaurantId = null;
      }

      // Recalculate totals
      cartSlice.caseReducers.calculateTotals(state);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.id !== itemId);

      // Clear restaurant if cart is empty
      if (state.items.length === 0) {
        state.restaurantId = null;
      }

      // Recalculate totals
      cartSlice.caseReducers.calculateTotals(state);
    },

    updateCartItemInstructions: (state, action: PayloadAction<{ itemId: string; specialInstructions: string }>) => {
      const { itemId, specialInstructions } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        state.items[itemIndex].specialInstructions = specialInstructions;
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.totalAmount = 0;
    },

    setDeliveryFee: (state, action: PayloadAction<number>) => {
      state.deliveryFee = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
    },

    calculateTotals: (state) => {
      state.subtotal = state.items.reduce((total, item) => total + item.totalPrice, 0);
      state.totalAmount = state.subtotal + state.deliveryFee;
    },

    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  updateCartItemInstructions,
  clearCart,
  setDeliveryFee,
  setCartLoading,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartSubtotal = (state: { cart: CartState }) => state.cart.subtotal;
export const selectCartDeliveryFee = (state: { cart: CartState }) => state.cart.deliveryFee;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.totalAmount;
export const selectCartRestaurantId = (state: { cart: CartState }) => state.cart.restaurantId;
export const selectCartItemCount = (state: { cart: CartState }) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading;

// Enhanced pricing calculation with tax and delivery logic
export const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((total, item) => total + item.totalPrice, 0);
  
  // Calculate delivery fee based on subtotal
  let deliveryFee = 0;
  if (subtotal > 0) {
    if (subtotal >= 100) {
      deliveryFee = 0; // Free delivery for orders over 100 SAR
    } else if (subtotal >= 50) {
      deliveryFee = 5; // Reduced delivery fee for orders over 50 SAR
    } else {
      deliveryFee = 15; // Standard delivery fee
    }
  }
  
  // Calculate VAT (15% in Saudi Arabia)
  const taxAmount = subtotal * 0.15;
  
  // Calculate total amount
  const totalAmount = subtotal + deliveryFee + taxAmount;
  
  return {
    subtotal,
    deliveryFee,
    taxAmount,
    totalAmount,
  };
};

// Calculate delivery fee based on distance and order value
export const calculateDeliveryFee = (distance: number, subtotal: number) => {
  let baseFee = 0;
  
  // Base fee based on distance
  if (distance <= 5) {
    baseFee = 10;
  } else if (distance <= 10) {
    baseFee = 15;
  } else if (distance <= 15) {
    baseFee = 20;
  } else {
    baseFee = 25;
  }
  
  // Discount based on order value
  if (subtotal >= 100) {
    baseFee = 0; // Free delivery
  } else if (subtotal >= 50) {
    baseFee = Math.max(0, baseFee - 5); // 5 SAR discount
  }
  
  return baseFee;
};

// Calculate minimum order requirements
export const checkMinimumOrder = (subtotal: number, minimumOrder: number) => {
  return {
    isMet: subtotal >= minimumOrder,
    remaining: Math.max(0, minimumOrder - subtotal),
    percentage: Math.min(100, (subtotal / minimumOrder) * 100),
  };
};

export default cartSlice.reducer;
