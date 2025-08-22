'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Grid,
} from '@mui/material';
import {
  CheckCircle,
  Home,
  Receipt,
  LocalShipping,
  AccessTime,
  LocationOn,
  Phone,
  Person,
  ArrowBack,
  Download,
  Share,
} from '@mui/icons-material';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAppSelector } from '@/hooks';

interface OrderData {
  id: string;
  restaurant: any;
  items: any[];
  userInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    instructions: string;
  };
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  provider: any;
  status: string;
  createdAt: Date;
}

export default function OrderSuccessPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useAppSelector((state) => state.settings);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    // Get order data from localStorage
    const storedOrder = localStorage.getItem('pendingOrder');
    if (storedOrder) {
      setOrderData(JSON.parse(storedOrder));
    }
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewOrders = () => {
    router.push('/orders');
  };

  const handleDownloadReceipt = () => {
    if (!orderData) return;

    // Create receipt content
    const receiptContent = `
      RECEIPT
      ========================
      Order ID: ${orderData.id}
      Date: ${new Date(orderData.createdAt).toLocaleDateString()}
      Time: ${new Date(orderData.createdAt).toLocaleTimeString()}
      
      RESTAURANT
      ${language === 'ar' ? orderData.restaurant.nameAr : orderData.restaurant.name}
      ${orderData.restaurant.address}
      
      CUSTOMER
      ${orderData.userInfo.name}
      ${orderData.userInfo.phone}
      ${orderData.userInfo.address}
      ${orderData.userInfo.city}
      
      ITEMS
      ${orderData.items.map(item => 
        `${item.quantity}x ${language === 'ar' ? item.menuItem.nameAr : item.menuItem.name} - ${item.totalPrice.toFixed(2)} SAR`
      ).join('\n')}
      
      DELIVERY
      ${language === 'ar' ? orderData.provider.nameAr : orderData.provider.name}
      Delivery Fee: ${orderData.deliveryFee.toFixed(2)} SAR
      
      TOTALS
      Subtotal: ${orderData.subtotal.toFixed(2)} SAR
      Delivery Fee: ${orderData.deliveryFee.toFixed(2)} SAR
      Total: ${orderData.totalAmount.toFixed(2)} SAR
      
      ========================
      Thank you for your order!
    `;

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${orderData.id}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleShareOrder = () => {
    if (navigator.share && orderData) {
      navigator.share({
        title: language === 'ar' ? 'طلب جديد' : 'New Order',
        text: language === 'ar' 
          ? `طلب من ${orderData.restaurant.nameAr} - ${orderData.totalAmount.toFixed(2)} ريال`
          : `Order from ${orderData.restaurant.name} - ${orderData.totalAmount.toFixed(2)} SAR`,
        url: window.location.href,
      });
    }
  };

  const formatOrderItems = (items: any[]) => {
    return items.map(item => 
      `${item.quantity}x ${language === 'ar' ? item.menuItem.nameAr : item.menuItem.name}`
    ).join(', ');
  };

  if (!orderData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {language === 'ar' ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}
        </Typography>
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
      
      <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom color="success.main">
            {language === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Order Placed Successfully!'}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {language === 'ar' 
              ? 'تم إرسال طلبك إلى مطعمك المفضل. ستتلقى تأكيداً قريباً.'
              : 'Your order has been sent to your favorite restaurant. You will receive confirmation soon.'
            }
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Order Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Restaurant Info */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {language === 'ar' ? 'المطعم' : 'Restaurant'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Image
                        src={orderData.restaurant.logo}
                        alt="Restaurant Logo"
                        width={50}
                        height={50}
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                      <Box>
                        <Typography variant="h6">
                          {language === 'ar' ? orderData.restaurant.nameAr : orderData.restaurant.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {orderData.restaurant.address}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Order Items */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {language === 'ar' ? 'المنتجات المطلوبة' : 'Order Items'}
                    </Typography>
                    <List dense>
                      {orderData.items.map((item) => (
                        <ListItem key={item.id}>
                          <ListItemText
                            primary={`${item.quantity}x ${language === 'ar' ? item.menuItem.nameAr : item.menuItem.name}`}
                            secondary={`${item.totalPrice.toFixed(2)} ${language === 'ar' ? 'ريال' : 'SAR'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Divider />

                  {/* Delivery Info */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {language === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <LocalShipping />
                        </ListItemIcon>
                        <ListItemText
                          primary={language === 'ar' ? 'خدمة التوصيل' : 'Delivery Service'}
                          secondary={language === 'ar' ? orderData.provider.nameAr : orderData.provider.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText
                          primary={language === 'ar' ? 'اسم العميل' : 'Customer Name'}
                          secondary={orderData.userInfo.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Phone />
                        </ListItemIcon>
                        <ListItemText
                          primary={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                          secondary={orderData.userInfo.phone}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn />
                        </ListItemIcon>
                        <ListItemText
                          primary={language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                          secondary={`${orderData.userInfo.address}, ${orderData.userInfo.city}`}
                        />
                      </ListItem>
                    </List>
                  </Box>

                  <Divider />

                  {/* Pricing */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {language === 'ar' ? 'التسعير' : 'Pricing'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                          {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                        </Typography>
                        <Typography variant="body2">
                          {orderData.subtotal.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                          {language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}
                        </Typography>
                        <Typography variant="body2">
                          {orderData.deliveryFee.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6">
                          {language === 'ar' ? 'المجموع الإجمالي' : 'Total'}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {orderData.totalAmount.toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Cards */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Order Status */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {language === 'ar' ? 'حالة الطلب' : 'Order Status'}
                  </Typography>
                  <Chip
                    label={language === 'ar' ? 'قيد المعالجة' : 'Processing'}
                    color="warning"
                    icon={<AccessTime />}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {language === 'ar' 
                      ? 'سيتم تأكيد طلبك قريباً من قبل المطعم'
                      : 'Your order will be confirmed soon by the restaurant'
                    }
                  </Typography>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {language === 'ar' ? 'الخطوات التالية' : 'Next Steps'}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary={language === 'ar' ? 'تأكيد الطلب' : 'Order Confirmation'}
                        secondary={language === 'ar' ? 'من المطعم' : 'From restaurant'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={language === 'ar' ? 'تحضير الطلب' : 'Order Preparation'}
                        secondary={language === 'ar' ? 'في المطعم' : 'At restaurant'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={language === 'ar' ? 'التوصيل' : 'Delivery'}
                        secondary={language === 'ar' ? 'إلى عنوانك' : 'To your address'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={handleDownloadReceipt}
                      fullWidth
                    >
                      {language === 'ar' ? 'تحميل الإيصال' : 'Download Receipt'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={handleShareOrder}
                      fullWidth
                    >
                      {language === 'ar' ? 'مشاركة الطلب' : 'Share Order'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Receipt />}
                      onClick={handleViewOrders}
                      fullWidth
                    >
                      {language === 'ar' ? 'عرض الطلبات' : 'View Orders'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={handleGoHome}
          >
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Receipt />}
            onClick={handleViewOrders}
          >
            {language === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
          </Button>
        </Box>

        {/* Important Notice */}
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            {language === 'ar' 
              ? 'تم إرسال طلبك إلى تطبيق التوصيل. يرجى متابعة حالة طلبك في التطبيق المختار.'
              : 'Your order has been sent to the delivery app. Please track your order status in the selected app.'
            }
          </Typography>
        </Alert>
      </Container>

      <Footer />
    </Box>
  );
}
