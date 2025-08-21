'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import {
  Person,
  LocationOn,
  Payment,
  ShoppingCart,
  ArrowBack,
  CheckCircle,
} from '@mui/icons-material';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { createOrder } from '@/store/orderSlice';
import { clearCart } from '@/store/cartSlice';

const steps = [
  { label: 'Customer Info', labelAr: 'معلومات العميل', icon: <Person /> },
  { label: 'Delivery Address', labelAr: 'عنوان التوصيل', icon: <LocationOn /> },
  { label: 'Payment Method', labelAr: 'طريقة الدفع', icon: <Payment /> },
  { label: 'Order Review', labelAr: 'مراجعة الطلب', icon: <ShoppingCart /> },
];

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.settings);
  const { items: cartItems, subtotal, totalAmount } = useAppSelector(
    (state) => state.cart
  );
  const { selectedRestaurant } = useAppSelector((state) => state.restaurant);
  const { estimates } = useAppSelector((state) => state.pricing);
  const { loading, error } = useAppSelector((state) => state.order);

  const [activeStep, setActiveStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    instructions: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }

    // Get selected provider from estimates
    const selectedEstimate = estimates.find(e => e.isCheapest);
    if (selectedEstimate) {
      setSelectedProvider(selectedEstimate.providerId);
    }
  }, [cartItems.length, router, estimates]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleDeliveryAddressChange = (field: string, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return customerInfo.firstName && customerInfo.lastName && customerInfo.phone;
      case 1:
        return deliveryAddress.address && deliveryAddress.city;
      case 2:
        return paymentMethod;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedRestaurant || !selectedProvider) return;

    const selectedProviderInfo = estimates.find(e => e.providerId === selectedProvider);
    if (!selectedProviderInfo) return;

    const orderData = {
      restaurantId: selectedRestaurant.id,
      items: cartItems,
      customerInfo,
      deliveryAddress: `${deliveryAddress.address}, ${deliveryAddress.city}`,
      deliveryInstructions: deliveryAddress.instructions,
      paymentMethod,
      deliveryProvider: selectedProvider,
      deliveryFee: selectedProviderInfo.totalPrice - subtotal,
      subtotal,
      totalAmount,
    };

    try {
      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      router.push('/order-success');
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const getSelectedProviderInfo = () => {
    return estimates.find(e => e.providerId === selectedProvider);
  };

  const selectedProviderInfo = getSelectedProviderInfo();

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
            onClick={() => router.push('/delivery-comparison')}
            sx={{ mb: 2 }}
          >
            {language === 'ar' ? 'العودة لمقارنة التوصيل' : 'Back to Delivery Comparison'}
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {language === 'ar' ? 'إتمام الطلب' : 'Complete Order'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Stepper and Form */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel icon={step.icon}>
                        {language === 'ar' ? step.labelAr : step.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Step Content */}
                <Box sx={{ mt: 4 }}>
                  {activeStep === 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={language === 'ar' ? 'الاسم الأول' : 'First Name'}
                            value={customerInfo.firstName}
                            onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                            value={customerInfo.lastName}
                            onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                            value={customerInfo.phone}
                            onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {activeStep === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label={language === 'ar' ? 'العنوان' : 'Address'}
                            value={deliveryAddress.address}
                            onChange={(e) => handleDeliveryAddressChange('address', e.target.value)}
                            required
                            multiline
                            rows={3}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={language === 'ar' ? 'المدينة' : 'City'}
                            value={deliveryAddress.city}
                            onChange={(e) => handleDeliveryAddressChange('city', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                            value={deliveryAddress.postalCode}
                            onChange={(e) => handleDeliveryAddressChange('postalCode', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label={language === 'ar' ? 'تعليمات إضافية' : 'Additional Instructions'}
                            value={deliveryAddress.instructions}
                            onChange={(e) => handleDeliveryAddressChange('instructions', e.target.value)}
                            multiline
                            rows={2}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {activeStep === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                      </Typography>
                      <FormControl component="fieldset">
                        <FormLabel component="legend">
                          {language === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                        </FormLabel>
                        <RadioGroup
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <FormControlLabel
                            value="cash"
                            control={<Radio />}
                            label={language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                          />
                          <FormControlLabel
                            value="card"
                            control={<Radio />}
                            label={language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}
                          />
                          <FormControlLabel
                            value="mada"
                            control={<Radio />}
                            label="Mada Card"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  )}

                  {activeStep === 3 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {language === 'ar' ? 'مراجعة الطلب' : 'Order Review'}
                      </Typography>
                      
                      {/* Restaurant Info */}
                      {selectedRestaurant && (
                        <Card variant="outlined" sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {language === 'ar' ? selectedRestaurant.nameAr : selectedRestaurant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {language === 'ar' ? selectedRestaurant.address : selectedRestaurant.address}
                            </Typography>
                          </CardContent>
                        </Card>
                      )}

                      {/* Order Items */}
                      <Typography variant="subtitle1" gutterBottom>
                        {language === 'ar' ? 'المنتجات المطلوبة' : 'Order Items'}
                      </Typography>
                      {cartItems.map((item) => (
                        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            {language === 'ar' ? item.menuItem.nameAr : item.menuItem.name} x {item.quantity}
                          </Typography>
                          <Typography variant="body2">
                            {item.totalPrice} {language === 'ar' ? 'ريال' : 'SAR'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    {language === 'ar' ? 'السابق' : 'Back'}
                  </Button>
                  
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handlePlaceOrder}
                      disabled={!isStepValid(activeStep)}
                      startIcon={<CheckCircle />}
                    >
                      {language === 'ar' ? 'إتمام الطلب' : 'Place Order'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(activeStep)}
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                    </Button>
                  )}
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
                      {language === 'ar' ? 'مجموع الطلب' : 'Order Total'}
                    </Typography>
                    <Typography variant="body1">
                      {subtotal} {language === 'ar' ? 'ريال' : 'SAR'}
                    </Typography>
                  </Box>
                  
                  {selectedProviderInfo && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">
                        {language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}
                      </Typography>
                      <Typography variant="body1">
                        {selectedProviderInfo.totalPrice} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                      {language === 'ar' ? 'المجموع الإجمالي' : 'Total Amount'}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {totalAmount} {language === 'ar' ? 'ريال' : 'SAR'}
                    </Typography>
                  </Box>
                </Box>

                {selectedProviderInfo && (
                  <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" color="primary.main" gutterBottom>
                      {language === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {language === 'ar' 
                        ? `الوقت المتوقع: ${selectedProviderInfo.etaMinutes} دقيقة`
                        : `Estimated time: ${selectedProviderInfo.etaMinutes} minutes`
                      }
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
