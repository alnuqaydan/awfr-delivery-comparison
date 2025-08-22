'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ArrowBack,
  CompareArrows,
  ExpandMore,
  Receipt,
} from '@mui/icons-material';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  calculateCartTotals,
} from '@/store/cartSlice';
import { CartItem } from '@/types';

export default function CartPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.settings);
  const { items: cartItems, subtotal, deliveryFee, totalAmount, loading } = useAppSelector(
    (state) => state.cart
  );
  const { selectedRestaurant } = useAppSelector((state) => state.restaurant);

  // Calculate cart totals whenever cart items change
  const cartTotals = calculateCartTotals(cartItems);

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(updateCartItemQuantity({ itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleContinueShopping = () => {
    if (selectedRestaurant) {
      router.push(`/restaurant/${selectedRestaurant.id}`);
    } else {
      router.push('/');
    }
  };

  const handleProceedToDelivery = () => {
    if (cartItems.length > 0) {
      router.push('/delivery-comparison');
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getMinimumOrderMet = () => {
    if (!selectedRestaurant) return true;
    return cartTotals.subtotal >= selectedRestaurant.minimumOrder;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        direction: language === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      <Header />
      
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleContinueShopping}
            sx={{ mb: 2 }}
          >
            {language === 'ar' ? 'العودة للتسوق' : 'Continue Shopping'}
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {language === 'ar' 
              ? `لديك ${getTotalItems()} منتج في السلة`
              : `You have ${getTotalItems()} items in your cart`
            }
          </Typography>
        </Box>

        {cartItems.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {language === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {language === 'ar' 
                ? 'ابدأ بإضافة بعض المنتجات من قائمة الطعام'
                : 'Start by adding some items from the menu'
              }
            </Typography>
            <Button
              variant="contained"
              onClick={handleContinueShopping}
              sx={{ mt: 2 }}
            >
              {language === 'ar' ? 'تصفح المطاعم' : 'Browse Restaurants'}
            </Button>
          </Card>
        ) : (
          <Grid container spacing={4}>
            {/* Cart Items */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      {language === 'ar' ? 'المنتجات المختارة' : 'Selected Items'}
                    </Typography>
                    <Button
                      color="error"
                      onClick={handleClearCart}
                      size="small"
                    >
                      {language === 'ar' ? 'مسح السلة' : 'Clear Cart'}
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {cartItems.map((item) => (
                      <Card key={item.id} variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={3} sm={2}>
                              <CardMedia
                                component="img"
                                height="80"
                                image={item.menuItem.image}
                                alt={language === 'ar' ? item.menuItem.nameAr : item.menuItem.name}
                                sx={{ borderRadius: 1 }}
                              />
                            </Grid>
                            
                            <Grid item xs={9} sm={6}>
                              <Typography variant="h6" component="h3" gutterBottom>
                                {language === 'ar' ? item.menuItem.nameAr : item.menuItem.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {language === 'ar' ? item.menuItem.descriptionAr : item.menuItem.description}
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {item.menuItem.price} {language === 'ar' ? 'ريال' : 'SAR'}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Remove />
                                  </IconButton>
                                  <Typography variant="body1" sx={{ minWidth: '30px', textAlign: 'center' }}>
                                    {item.quantity}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Add />
                                  </IconButton>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="h6" color="primary">
                                    {item.totalPrice} {language === 'ar' ? 'ريال' : 'SAR'}
                                  </Typography>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleRemoveItem(item.id)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">
                        {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                      </Typography>
                      <Typography variant="body1">
                        {cartTotals.subtotal.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">
                        {language === 'ar' ? 'الضريبة (15%)' : 'Tax (15%)'}
                      </Typography>
                      <Typography variant="body1">
                        {cartTotals.taxAmount.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">
                        {language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}
                      </Typography>
                      <Typography variant="body1">
                        {cartTotals.deliveryFee.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">
                        {language === 'ar' ? 'المجموع الإجمالي' : 'Total'}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {cartTotals.totalAmount.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Minimum Order Warning */}
                  {selectedRestaurant && !getMinimumOrderMet() && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {language === 'ar' 
                        ? `الحد الأدنى للطلب: ${selectedRestaurant.minimumOrder} ريال`
                        : `Minimum order: ${selectedRestaurant.minimumOrder} SAR`
                      }
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<CompareArrows />}
                    onClick={handleProceedToDelivery}
                    disabled={cartItems.length === 0 || !getMinimumOrderMet()}
                    sx={{ mb: 2 }}
                  >
                    {language === 'ar' ? 'مقارنة خدمات التوصيل' : 'Compare Delivery Services'}
                  </Button>

                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                    {language === 'ar' 
                      ? 'سيتم حساب رسوم التوصيل بناءً على موقعك'
                      : 'Delivery fees will be calculated based on your location'
                    }
                  </Typography>
                </CardContent>
              </Card>

              {/* Price Breakdown Accordion */}
              <Card sx={{ mt: 2 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Receipt />
                      <Typography variant="body2">
                        {language === 'ar' ? 'تفاصيل الأسعار' : 'Price Breakdown'}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                        </Typography>
                        <Typography variant="body2">
                          {cartTotals.subtotal.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {language === 'ar' ? 'الضريبة (15%)' : 'Tax (15%)'}
                        </Typography>
                        <Typography variant="body2">
                          {cartTotals.taxAmount.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}
                        </Typography>
                        <Typography variant="body2">
                          {cartTotals.deliveryFee.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {language === 'ar' ? 'المجموع الإجمالي' : 'Total'}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {cartTotals.totalAmount.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
