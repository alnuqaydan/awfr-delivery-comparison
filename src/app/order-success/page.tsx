'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Home,
  Receipt,
  LocalShipping,
  AccessTime,
  LocationOn,
} from '@mui/icons-material';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAppSelector } from '@/hooks';

export default function OrderSuccessPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useAppSelector((state) => state.settings);
  const { currentOrder } = useAppSelector((state) => state.order);
  const { selectedRestaurant } = useAppSelector((state) => state.restaurant);

  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    // Generate a random order number if not available
    if (!orderNumber) {
      const randomOrderNumber = `AWFR-${Date.now().toString().slice(-6)}`;
      setOrderNumber(randomOrderNumber);
    }
  }, [orderNumber]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewOrders = () => {
    router.push('/orders');
  };

  const estimatedDeliveryTime = new Date();
  estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 45);

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
      
      <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
        {/* Success Message */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom color="success.main">
            {language === 'ar' ? 'تم الطلب بنجاح!' : 'Order Placed Successfully!'}
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            {language === 'ar' 
              ? 'شكراً لك على طلبك. سنقوم بتحديثك على حالة الطلب'
              : 'Thank you for your order. We will keep you updated on the order status'
            }
          </Typography>
          <Chip
            label={orderNumber}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '1.1rem', py: 1 }}
          />
        </Box>

        {/* Order Details */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />

                {/* Restaurant Info */}
                {selectedRestaurant && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {language === 'ar' ? 'المطعم' : 'Restaurant'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <img
                        src={selectedRestaurant.logo}
                        alt="Restaurant Logo"
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {language === 'ar' ? selectedRestaurant.nameAr : selectedRestaurant.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {language === 'ar' ? selectedRestaurant.address : selectedRestaurant.address}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Delivery Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {language === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AccessTime color="primary" />
                        <Typography variant="body2">
                          {language === 'ar' ? 'الوقت المتوقع للتوصيل' : 'Estimated Delivery Time'}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="primary.main" sx={{ fontWeight: 600 }}>
                        {estimatedDeliveryTime.toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocalShipping color="primary" />
                        <Typography variant="body2">
                          {language === 'ar' ? 'حالة التوصيل' : 'Delivery Status'}
                        </Typography>
                      </Box>
                      <Chip
                        label={language === 'ar' ? 'قيد التحضير' : 'Preparing'}
                        color="warning"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Order Items */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {language === 'ar' ? 'المنتجات المطلوبة' : 'Order Items'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {language === 'ar' ? 'برجر دجاج' : 'Chicken Burger'} x 2
                      </Typography>
                      <Typography variant="body1">
                        45.00 {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {language === 'ar' ? 'بطاطس مقلية' : 'French Fries'} x 1
                      </Typography>
                      <Typography variant="body1">
                        15.00 {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {language === 'ar' ? 'مشروب غازي' : 'Soft Drink'} x 1
                      </Typography>
                      <Typography variant="body1">
                        8.00 {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
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
                      {language === 'ar' ? 'مجموع الطلب' : 'Order Total'}
                    </Typography>
                    <Typography variant="body1">
                      68.00 {language === 'ar' ? 'ريال' : 'SAR'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">
                      {language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}
                    </Typography>
                    <Typography variant="body1">
                      12.00 {language === 'ar' ? 'ريال' : 'SAR'}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                      {language === 'ar' ? 'المجموع الإجمالي' : 'Total Amount'}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      80.00 {language === 'ar' ? 'ريال' : 'SAR'}
                    </Typography>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {language === 'ar' 
                      ? 'سيتم إرسال رسالة تأكيد إلى رقم هاتفك'
                      : 'A confirmation message will be sent to your phone number'
                    }
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Home />}
                onClick={handleGoHome}
                size="large"
              >
                {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Receipt />}
                onClick={handleViewOrders}
                size="large"
              >
                {language === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Additional Information */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {language === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn color="primary" />
                  <Box>
                    <Typography variant="subtitle2">
                      {language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {language === 'ar' 
                        ? 'شارع الملك فهد، الرياض، المملكة العربية السعودية'
                        : 'King Fahd Street, Riyadh, Saudi Arabia'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccessTime color="primary" />
                  <Box>
                    <Typography variant="subtitle2">
                      {language === 'ar' ? 'وقت الطلب' : 'Order Time'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date().toLocaleString('ar-SA')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Receipt color="primary" />
                  <Box>
                    <Typography variant="subtitle2">
                      {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      <Footer />
    </Box>
  );
}
