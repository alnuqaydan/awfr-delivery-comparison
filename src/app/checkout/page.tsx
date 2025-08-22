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
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  Payment,
  CheckCircle,
  LocationOn,
  Phone,
  Person,
  ArrowBack,
  OpenInNew,
  Info,
  Warning,
  Receipt,
} from '@mui/icons-material';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { clearCart } from '@/store/cartSlice';
import { CartItem, Provider } from '@/types';
import { getProviderById } from '@/utils/pricing';

const steps = [
  { label: 'Cart Review', labelAr: 'مراجعة السلة', icon: ShoppingCart },
  { label: 'Delivery Details', labelAr: 'تفاصيل التوصيل', icon: LocalShipping },
  { label: 'Order Confirmation', labelAr: 'تأكيد الطلب', icon: CheckCircle },
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

  const [activeStep, setActiveStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Riyadh',
    postalCode: '',
    instructions: '',
  });
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const [redirectingProvider, setRedirectingProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }
  }, [cartItems.length, router]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleUserInfoChange = (field: string, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCompleteOrder = () => {
    if (selectedProvider) {
      const provider = getProviderById(selectedProvider);
      if (provider) {
        setRedirectingProvider(provider);
        setShowRedirectDialog(true);
      }
    }
  };

  const handleRedirectToDeliveryApp = () => {
    if (redirectingProvider && redirectingProvider.deepLinkUrl) {
      // Prepare complete order data
      const orderData = {
        id: `order-${Date.now()}`,
        restaurant: selectedRestaurant,
        items: cartItems,
        userInfo,
        subtotal,
        deliveryFee: estimates.find(e => e.providerId === selectedProvider)?.totalPrice || 0,
        totalAmount: totalAmount + (estimates.find(e => e.providerId === selectedProvider)?.totalPrice || 0),
        provider: redirectingProvider,
        status: 'pending',
        createdAt: new Date(),
      };

      // Store order data
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      localStorage.setItem('orderHistory', JSON.stringify([
        ...JSON.parse(localStorage.getItem('orderHistory') || '[]'),
        orderData
      ]));

      // Clear cart
      dispatch(clearCart());

      // Redirect to delivery app
      window.open(redirectingProvider.deepLinkUrl, '_blank');
      
      // Close dialog and redirect to success page
      setShowRedirectDialog(false);
      setRedirectingProvider(null);
      router.push('/order-success');
    }
  };

  const handleCancelRedirect = () => {
    setShowRedirectDialog(false);
    setRedirectingProvider(null);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const formatOrderItems = (items: CartItem[]) => {
    return items.map(item => 
      `${item.quantity}x ${language === 'ar' ? item.menuItem.nameAr : item.menuItem.name}`
    ).join(', ');
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return cartItems.length > 0;
      case 1:
        return selectedProvider && userInfo.name && userInfo.phone && userInfo.address;
      case 2:
        return true;
      default:
        return false;
    }
  };

  if (cartItems.length === 0) {
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
            onClick={() => router.push('/cart')}
            sx={{ mb: 2 }}
          >
            {language === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Checkout Steps */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        icon={<step.icon />}
                        optional={
                          index === 2 ? (
                            <Typography variant="caption" color="primary">
                              {language === 'ar' ? 'الخطوة الأخيرة' : 'Final Step'}
                            </Typography>
                          ) : null
                        }
                      >
                        {language === 'ar' ? step.labelAr : step.label}
                      </StepLabel>
                      <StepContent>
                        {index === 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {language === 'ar' ? 'مراجعة الطلب' : 'Order Review'}
                            </Typography>
                            <List dense>
                              {cartItems.map((item) => (
                                <ListItem key={item.id}>
                                  <ListItemText
                                    primary={`${item.quantity}x ${language === 'ar' ? item.menuItem.nameAr : item.menuItem.name}`}
                                    secondary={`${item.totalPrice.toFixed(2)} ${language === 'ar' ? 'ريال' : 'SAR'}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="h6">
                                {language === 'ar' ? 'المجموع' : 'Total'}
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {subtotal.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {index === 1 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {language === 'ar' ? 'تفاصيل التوصيل' : 'Delivery Details'}
                            </Typography>
                            
                            {/* Delivery Provider Selection */}
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                {language === 'ar' ? 'اختر خدمة التوصيل' : 'Select Delivery Service'}
                              </Typography>
                              <Grid container spacing={2}>
                                {estimates.map((estimate) => {
                                  const provider = getProviderById(estimate.providerId);
                                  if (!provider) return null;

                                  return (
                                    <Grid item xs={12} sm={6} key={estimate.providerId}>
                                      <Card
                                        sx={{
                                          cursor: 'pointer',
                                          border: selectedProvider === estimate.providerId ? 2 : 1,
                                          borderColor: selectedProvider === estimate.providerId ? 'primary.main' : 'divider',
                                        }}
                                        onClick={() => handleProviderSelect(estimate.providerId)}
                                      >
                                        <CardContent>
                                          <Typography variant="h6">
                                            {language === 'ar' ? provider.nameAr : provider.name}
                                          </Typography>
                                          <Typography variant="body2" color="primary">
                                            {estimate.totalPrice.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                                          </Typography>
                                          <Typography variant="caption">
                                            {estimate.etaMinutes} {language === 'ar' ? 'دقيقة' : 'min'}
                                          </Typography>
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  );
                                })}
                              </Grid>
                            </Box>

                            {/* User Information */}
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                                  value={userInfo.name}
                                  onChange={(e) => handleUserInfoChange('name', e.target.value)}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                  value={userInfo.phone}
                                  onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label={language === 'ar' ? 'العنوان' : 'Address'}
                                  value={userInfo.address}
                                  onChange={(e) => handleUserInfoChange('address', e.target.value)}
                                  multiline
                                  rows={3}
                                  required
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                  <InputLabel>{language === 'ar' ? 'المدينة' : 'City'}</InputLabel>
                                  <Select
                                    value={userInfo.city}
                                    onChange={(e) => handleUserInfoChange('city', e.target.value)}
                                  >
                                    <MenuItem value="Riyadh">Riyadh</MenuItem>
                                    <MenuItem value="Jeddah">Jeddah</MenuItem>
                                    <MenuItem value="Dammam">Dammam</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label={language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                                  value={userInfo.postalCode}
                                  onChange={(e) => handleUserInfoChange('postalCode', e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label={language === 'ar' ? 'تعليمات إضافية' : 'Additional Instructions'}
                                  value={userInfo.instructions}
                                  onChange={(e) => handleUserInfoChange('instructions', e.target.value)}
                                  multiline
                                  rows={2}
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        )}

                        {index === 2 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {language === 'ar' ? 'تأكيد الطلب' : 'Order Confirmation'}
                            </Typography>
                            <Alert severity="info" sx={{ mb: 2 }}>
                              {language === 'ar' 
                                ? 'يرجى مراجعة تفاصيل طلبك قبل الإتمام'
                                : 'Please review your order details before completing'
                              }
                            </Alert>
                            <Typography variant="body2" color="text.secondary">
                              {language === 'ar' 
                                ? 'سيتم نقلك إلى تطبيق التوصيل لإتمام الدفع'
                                : 'You will be redirected to the delivery app to complete payment'
                              }
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ mb: 2, mt: 2 }}>
                          <div>
                            <Button
                              variant="contained"
                              onClick={index === steps.length - 1 ? handleCompleteOrder : handleNext}
                              disabled={!isStepValid(index)}
                              sx={{ mr: 1 }}
                            >
                              {index === steps.length - 1 
                                ? (language === 'ar' ? 'إتمام الطلب' : 'Complete Order')
                                : (language === 'ar' ? 'التالي' : 'Continue')
                              }
                            </Button>
                            <Button
                              disabled={index === 0}
                              onClick={handleBack}
                              sx={{ mr: 1 }}
                            >
                              {language === 'ar' ? 'السابق' : 'Back'}
                            </Button>
                          </div>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
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
                      {subtotal.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">
                      {language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}
                    </Typography>
                    <Typography variant="body1">
                      {selectedProvider 
                        ? (estimates.find(e => e.providerId === selectedProvider)?.totalPrice.toFixed(2) || '0.00')
                        : '0.00'
                      } {language === 'ar' ? 'ريال' : 'SAR'}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                      {language === 'ar' ? 'المجموع الإجمالي' : 'Total'}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {(subtotal + (selectedProvider 
                        ? (estimates.find(e => e.providerId === selectedProvider)?.totalPrice || 0)
                        : 0
                      )).toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'ar' ? 'عدد المنتجات' : 'Items'}: {getTotalItems()}
                  </Typography>
                  {selectedRestaurant && (
                    <Typography variant="body2" color="text.secondary">
                      {language === 'ar' ? 'المطعم' : 'Restaurant'}: {language === 'ar' ? selectedRestaurant.nameAr : selectedRestaurant.name}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Redirect Dialog */}
      <Dialog
        open={showRedirectDialog}
        onClose={handleCancelRedirect}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OpenInNew />
            {language === 'ar' ? 'الانتقال إلى تطبيق التوصيل' : 'Redirect to Delivery App'}
          </Box>
        </DialogTitle>
        <DialogContent>
          {redirectingProvider && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info" icon={<Info />}>
                {language === 'ar' 
                  ? `سيتم نقلك إلى تطبيق ${redirectingProvider.nameAr} لإتمام الدفع`
                  : `You will be redirected to ${redirectingProvider.name} app to complete payment`
                }
              </Alert>
              
              <Typography variant="h6" gutterBottom>
                {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={language === 'ar' ? 'المطعم' : 'Restaurant'}
                    secondary={language === 'ar' ? selectedRestaurant?.nameAr : selectedRestaurant?.name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={language === 'ar' ? 'المنتجات' : 'Items'}
                    secondary={formatOrderItems(cartItems)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={language === 'ar' ? 'المجموع' : 'Total'}
                    secondary={`${(subtotal + (estimates.find(e => e.providerId === selectedProvider)?.totalPrice || 0)).toFixed(2)} ${language === 'ar' ? 'ريال' : 'SAR'}`}
                  />
                </ListItem>
              </List>
              
              <Alert severity="warning" icon={<Warning />}>
                {language === 'ar' 
                  ? 'سيتم فتح التطبيق في نافذة جديدة. تأكد من إكمال الدفع في التطبيق.'
                  : 'The app will open in a new window. Please ensure you complete payment in the app.'
                }
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRedirect}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleRedirectToDeliveryApp} 
            variant="contained"
            startIcon={<OpenInNew />}
          >
            {language === 'ar' ? 'فتح التطبيق' : 'Open App'}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
