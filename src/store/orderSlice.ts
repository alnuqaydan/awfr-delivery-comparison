import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus, PaymentStatus, CartItem } from '@/types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

// إنشاء طلب جديد
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData: {
    restaurantId: string;
    items: CartItem[];
    deliveryAddress: string;
    deliveryInstructions?: string;
    paymentMethod: string;
    customerInfo: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    };
    deliveryProvider: string;
    deliveryFee: number;
    subtotal: number;
    totalAmount: number;
  }) => {
    // محاكاة إنشاء الطلب
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      userId: 'user-1', // في التطبيق الحقيقي سيتم جلبها من نظام المصادقة
      restaurantId: orderData.restaurantId,
      orderNumber: `ORD-${Date.now()}`,
      status: 'pending',
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      taxAmount: orderData.subtotal * 0.15, // 15% ضريبة
      totalAmount: orderData.totalAmount,
      deliveryProvider: orderData.deliveryProvider,
      deliveryAddress: orderData.deliveryAddress,
      deliveryInstructions: orderData.deliveryInstructions,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 دقيقة
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newOrder;
  }
);

// تحديث حالة الطلب
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
    // محاكاة تحديث حالة الطلب
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { orderId, status };
  }
);

// جلب طلبات المستخدم
export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (userId: string) => {
    // محاكاة جلب الطلبات
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // بيانات تجريبية للطلبات
    const mockOrders: Order[] = [
      {
        id: 'order-1',
        userId,
        restaurantId: 'restaurant-1',
        orderNumber: 'ORD-001',
        status: 'delivered',
        items: [],
        subtotal: 45,
        deliveryFee: 10,
        taxAmount: 6.75,
        totalAmount: 61.75,
        deliveryProvider: 'provider-1',
        deliveryAddress: 'King Fahd Road, Riyadh',
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // يوم واحد مضى
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // ساعتين مضتا
        actualDeliveryTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'order-2',
        userId,
        restaurantId: 'restaurant-2',
        orderNumber: 'ORD-002',
        status: 'out_for_delivery',
        items: [],
        subtotal: 32,
        deliveryFee: 8,
        taxAmount: 4.8,
        totalAmount: 44.8,
        deliveryProvider: 'provider-2',
        deliveryAddress: 'Olaya Street, Riyadh',
        paymentMethod: 'card',
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 دقيقة مضت
        updatedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 دقائق مضت
        estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000), // 15 دقيقة
      },
    ];
    
    return mockOrders;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetOrderState: (state) => {
      state.currentOrder = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createOrder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'فشل في إنشاء الطلب';
      })
      
      // updateOrderStatus
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId, status } = action.payload;
        
        // تحديث الطلب في القائمة
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = status;
          state.orders[orderIndex].updatedAt = new Date();
        }
        
        // تحديث الطلب الحالي إذا كان هو نفسه
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.status = status;
          state.currentOrder.updatedAt = new Date();
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'فشل في تحديث حالة الطلب';
      })
      
      // fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'فشل في جلب الطلبات';
      });
  },
});

export const { setCurrentOrder, clearError, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
