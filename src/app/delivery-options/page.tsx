'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Badge,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Schedule,
  LocalShipping,
  Star,
  TrendingUp,
  TrendingDown,
  Speed,
  AttachMoney,
  CheckCircle,
  Info,
  Launch,
  CompareArrows,
  LocalOffer,
  Verified,
  Group,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { DeliveryOption } from '@/types';

// Mock data for delivery options (في التطبيق الحقيقي ستأتي من API)
const mockDeliveryOptions: DeliveryOption[] = [
  {
    id: 'talabat',
    companyName: 'Talabat',
    companyNameAr: 'طلبات',
    branding: {
      logo: '/images/providers/talabat-logo.png',
      primaryColor: '#FF6B35',
      accentColor: '#FFF3F0',
    },
    pricing: {
      baseMealPrice: 45.00,
      deliveryFee: 8.00,
      serviceFee: 3.50,
      smallOrderFee: 0,
      processingFee: 0,
      taxAmount: 3.38,
      totalCost: 59.88,
    },
    timing: {
      estimatedMin: 25,
      estimatedMax: 35,
      currentTrafficFactor: 1.2,
    },
    availability: {
      isAvailable: true,
    },
    rating: {
      score: 4.3,
      totalReviews: 12540,
      reliability: 89,
    },
    features: {
      liveTracking: true,
      contactlessDelivery: true,
      scheduledDelivery: true,
      groupOrdering: false,
    },
    orderUrl: 'https://talabat.com/order/123',
    promoCode: 'SAVE15',
    badges: ['recommended'],
  },
  {
    id: 'hungerstation',
    companyName: 'HungerStation',
    companyNameAr: 'هنقرستيشن',
    branding: {
      logo: '/images/providers/hungerstation-logo.png',
      primaryColor: '#E85D04',
      accentColor: '#FFF5F0',
    },
    pricing: {
      baseMealPrice: 45.00,
      deliveryFee: 6.50,
      serviceFee: 4.00,
      smallOrderFee: 5.00,
      processingFee: 1.50,
      taxAmount: 3.71,
      totalCost: 65.71,
    },
    timing: {
      estimatedMin: 20,
      estimatedMax: 30,
      currentTrafficFactor: 1.0,
    },
    availability: {
      isAvailable: true,
    },
    rating: {
      score: 4.1,
      totalReviews: 8920,
      reliability: 85,
    },
    features: {
      liveTracking: true,
      contactlessDelivery: true,
      scheduledDelivery: false,
      groupOrdering: true,
    },
    orderUrl: 'https://hungerstation.com/order/123',
    badges: ['fastest'],
  },
  {
    id: 'jahez',
    companyName: 'Jahez',
    companyNameAr: 'جاهز',
    branding: {
      logo: '/images/providers/jahez-logo.png',
      primaryColor: '#1976D2',
      accentColor: '#F0F7FF',
    },
    pricing: {
      baseMealPrice: 45.00,
      deliveryFee: 5.00,
      serviceFee: 2.50,
      smallOrderFee: 0,
      processingFee: 0,
      taxAmount: 3.14,
      totalCost: 55.64,
    },
    timing: {
      estimatedMin: 30,
      estimatedMax: 45,
      currentTrafficFactor: 1.4,
    },
    availability: {
      isAvailable: true,
    },
    rating: {
      score: 4.5,
      totalReviews: 15630,
      reliability: 92,
    },
    features: {
      liveTracking: true,
      contactlessDelivery: true,
      scheduledDelivery: true,
      groupOrdering: true,
    },
    orderUrl: 'https://jahez.com/order/123',
    badges: ['cheapest', 'best-rated'],
  },
  {
    id: 'noon',
    companyName: 'Noon Food',
    companyNameAr: 'نون فود',
    branding: {
      logo: '/images/providers/noon-logo.png',
      primaryColor: '#1B4B73',
      accentColor: '#F5F8FB',
    },
    pricing: {
      baseMealPrice: 45.00,
      deliveryFee: 7.00,
      serviceFee: 3.00,
      smallOrderFee: 0,
      processingFee: 2.00,
      taxAmount: 3.42,
      totalCost: 60.42,
    },
    timing: {
      estimatedMin: 35,
      estimatedMax: 50,
      currentTrafficFactor: 1.5,
    },
    availability: {
      isAvailable: false,
      reason: 'Temporarily unavailable in your area',
      nextAvailableTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    },
    rating: {
      score: 4.0,
      totalReviews: 5420,
      reliability: 78,
    },
    features: {
      liveTracking: false,
      contactlessDelivery: true,
      scheduledDelivery: false,
      groupOrdering: false,
    },
    orderUrl: 'https://noon.com/order/123',
  },
];

function DeliveryOptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.settings);

  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // استخراج المعاملات من URL
  const restaurantId = searchParams.get('restaurant_id');
  const itemId = searchParams.get('item_id');
  const itemName = searchParams.get('item_name');
  const basePrice = searchParams.get('base_price');
  const userLat = searchParams.get('user_lat');
  const userLng = searchParams.get('user_lng');
  const compareAll = searchParams.get('compare_all') === 'true';

  useEffect(() => {
    // محاكاة تحميل البيانات
    setLoading(true);
    setTimeout(() => {
      setDeliveryOptions(mockDeliveryOptions);
      setLoading(false);
    }, 1500);
  }, [restaurantId, itemId, userLat, userLng]);

  const handleOrderNow = (option: DeliveryOption) => {
    // فتح رابط الطلب في نافذة جديدة
    window.open(option.orderUrl, '_blank');
  };

  const getAvailableOptions = () => {
    return deliveryOptions.filter(option => option.availability.isAvailable);
  };

  const getUnavailableOptions = () => {
    return deliveryOptions.filter(option => !option.availability.isAvailable);
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'fastest': return 'success';
      case 'cheapest': return 'primary';
      case 'best-rated': return 'warning';
      case 'recommended': return 'secondary';
      default: return 'default';
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'fastest': return <Speed />;
      case 'cheapest': return <AttachMoney />;
      case 'best-rated': return <Star />;
      case 'recommended': return <Verified />;
      default: return null;
    }
  };

  const formatTime = (min: number, max: number) => {
    return `${min}-${max} ${language === 'ar' ? 'دقيقة' : 'min'}`;
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  const texts = {
    ar: {
      title: 'خيارات التوصيل',
      subtitle: 'قارن الأسعار وأوقات التوصيل واختر الأفضل لك',
      orderNow: 'اطلب الآن',
      unavailable: 'غير متوفر',
      showUnavailable: 'عرض الخيارات غير المتوفرة',
      totalCost: 'التكلفة الإجمالية',
      deliveryTime: 'وقت التوصيل',
      baseMealPrice: 'سعر الوجبة',
      deliveryFee: 'رسوم التوصيل',
      serviceFee: 'رسوم الخدمة',
      smallOrderFee: 'رسوم الطلب الصغير',
      processingFee: 'رسوم المعالجة',
      taxAmount: 'الضريبة',
      features: 'المميزات',
      liveTracking: 'تتبع مباشر',
      contactlessDelivery: 'توصيل بدون تماس',
      scheduledDelivery: 'توصيل مجدول',
      groupOrdering: 'طلب جماعي',
      rating: 'التقييم',
      reliability: 'الموثوقية',
      reviews: 'تقييم',
      promoCode: 'كود الخصم',
      badges: {
        fastest: 'الأسرع',
        cheapest: 'الأرخص',
        'best-rated': 'الأعلى تقييماً',
        recommended: 'مُوصى به',
      },
      backToRestaurant: 'العودة للمطعم',
      comparison: 'المقارنة',
      availableOptions: 'خيارات متوفرة',
      unavailableOptions: 'خيارات غير متوفرة',
    },
    en: {
      title: 'Delivery Options',
      subtitle: 'Compare prices, delivery times and choose what works best for you',
      orderNow: 'Order Now',
      unavailable: 'Unavailable',
      showUnavailable: 'Show unavailable options',
      totalCost: 'Total Cost',
      deliveryTime: 'Delivery Time',
      baseMealPrice: 'Meal Price',
      deliveryFee: 'Delivery Fee',
      serviceFee: 'Service Fee',
      smallOrderFee: 'Small Order Fee',
      processingFee: 'Processing Fee',
      taxAmount: 'Tax',
      features: 'Features',
      liveTracking: 'Live Tracking',
      contactlessDelivery: 'Contactless Delivery',
      scheduledDelivery: 'Scheduled Delivery',
      groupOrdering: 'Group Ordering',
      rating: 'Rating',
      reliability: 'Reliability',
      reviews: 'reviews',
      promoCode: 'Promo Code',
      badges: {
        fastest: 'Fastest',
        cheapest: 'Cheapest',
        'best-rated': 'Best Rated',
        recommended: 'Recommended',
      },
      backToRestaurant: 'Back to Restaurant',
      comparison: 'Comparison',
      availableOptions: 'Available Options',
      unavailableOptions: 'Unavailable Options',
    },
  };

  const t = texts[language];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {language === 'ar' ? 'جاري تحميل خيارات التوصيل...' : 'Loading delivery options...'}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4} textAlign="center">
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CompareArrows color="primary" />
          {t.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={2}>
          {t.subtitle}
        </Typography>
        
        {itemName && (
          <Chip 
            label={decodeURIComponent(itemName)} 
            variant="outlined" 
            size="medium"
            sx={{ mb: 2, fontSize: '1rem', py: 1 }}
          />
        )}
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              {getAvailableOptions().length}
            </Typography>
            <Typography variant="caption">
              {t.availableOptions}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              {formatPrice(Math.min(...getAvailableOptions().map(o => o.pricing.totalCost)))}
            </Typography>
            <Typography variant="caption">
              {t.badges.cheapest}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main">
              {Math.min(...getAvailableOptions().map(o => o.timing.estimatedMin))} {language === 'ar' ? 'دقيقة' : 'min'}
            </Typography>
            <Typography variant="caption">
              {t.badges.fastest}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="secondary.main">
              {Math.max(...getAvailableOptions().map(o => o.rating.score)).toFixed(1)} ⭐
            </Typography>
            <Typography variant="caption">
              {t.badges['best-rated']}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Available Options */}
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CheckCircle color="success" />
        {t.availableOptions} ({getAvailableOptions().length})
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {getAvailableOptions().map((option) => (
          <Grid item xs={12} md={6} lg={4} key={option.id}>
            <Card 
              sx={{ 
                height: '100%',
                border: selectedOption === option.id ? 2 : 0,
                borderColor: 'primary.main',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header with Logo and Badges */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={option.branding.logo}
                      alt={option.companyName}
                      sx={{ width: 48, height: 48 }}
                    />
                    <Box>
                      <Typography variant="h6">
                        {language === 'ar' ? option.companyNameAr : option.companyName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star color="warning" fontSize="small" />
                        <Typography variant="body2">
                          {option.rating.score} ({option.rating.totalReviews.toLocaleString()} {t.reviews})
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Badges */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {option.badges?.map((badge) => (
                      <Chip
                        key={badge}
                        label={t.badges[badge]}
                        size="small"
                        color={getBadgeColor(badge)}
                        icon={getBadgeIcon(badge)}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Pricing Breakdown */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t.comparison}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{t.baseMealPrice}</Typography>
                    <Typography variant="body2">{formatPrice(option.pricing.baseMealPrice)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{t.deliveryFee}</Typography>
                    <Typography variant="body2">{formatPrice(option.pricing.deliveryFee)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{t.serviceFee}</Typography>
                    <Typography variant="body2">{formatPrice(option.pricing.serviceFee)}</Typography>
                  </Box>
                  
                  {option.pricing.smallOrderFee > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="warning.main">{t.smallOrderFee}</Typography>
                      <Typography variant="body2" color="warning.main">{formatPrice(option.pricing.smallOrderFee)}</Typography>
                    </Box>
                  )}
                  
                  {option.pricing.processingFee > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{t.processingFee}</Typography>
                      <Typography variant="body2">{formatPrice(option.pricing.processingFee)}</Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{t.taxAmount}</Typography>
                    <Typography variant="body2">{formatPrice(option.pricing.taxAmount)}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" color="primary">{t.totalCost}</Typography>
                    <Typography variant="h6" color="primary">{formatPrice(option.pricing.totalCost)}</Typography>
                  </Box>
                </Box>

                {/* Delivery Time */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Schedule color="action" />
                  <Typography variant="body2">
                    {t.deliveryTime}: {formatTime(option.timing.estimatedMin, option.timing.estimatedMax)}
                  </Typography>
                  {option.timing.currentTrafficFactor > 1.2 && (
                    <Chip label="Heavy Traffic" size="small" color="warning" />
                  )}
                </Box>

                {/* Reliability Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption">{t.reliability}</Typography>
                    <Typography variant="caption">{option.rating.reliability}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={option.rating.reliability} 
                    color={option.rating.reliability > 85 ? 'success' : option.rating.reliability > 70 ? 'warning' : 'error'}
                  />
                </Box>

                {/* Features */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>{t.features}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {option.features.liveTracking && (
                      <Chip label={t.liveTracking} size="small" variant="outlined" />
                    )}
                    {option.features.contactlessDelivery && (
                      <Chip label={t.contactlessDelivery} size="small" variant="outlined" />
                    )}
                    {option.features.scheduledDelivery && (
                      <Chip label={t.scheduledDelivery} size="small" variant="outlined" />
                    )}
                    {option.features.groupOrdering && (
                      <Chip label={t.groupOrdering} size="small" variant="outlined" />
                    )}
                  </Box>
                </Box>

                {/* Promo Code */}
                {option.promoCode && (
                  <Alert 
                    severity="info" 
                    icon={<LocalOffer />}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2">
                      {t.promoCode}: <strong>{option.promoCode}</strong>
                    </Typography>
                  </Alert>
                )}

                {/* Order Button */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<Launch />}
                  onClick={() => handleOrderNow(option)}
                  sx={{ 
                    backgroundColor: option.branding.primaryColor,
                    '&:hover': {
                      backgroundColor: option.branding.primaryColor,
                      opacity: 0.9,
                    },
                  }}
                >
                  {t.orderNow}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Unavailable Options */}
      {getUnavailableOptions().length > 0 && (
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={showUnavailable}
                onChange={(e) => setShowUnavailable(e.target.checked)}
              />
            }
            label={t.showUnavailable}
            sx={{ mb: 2 }}
          />
          
          {showUnavailable && (
            <>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Info color="warning" />
                {t.unavailableOptions} ({getUnavailableOptions().length})
              </Typography>
              
              <Grid container spacing={3}>
                {getUnavailableOptions().map((option) => (
                  <Grid item xs={12} md={6} lg={4} key={option.id}>
                    <Card sx={{ height: '100%', opacity: 0.6 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar
                            src={option.branding.logo}
                            alt={option.companyName}
                            sx={{ width: 48, height: 48 }}
                          />
                          <Box>
                            <Typography variant="h6">
                              {language === 'ar' ? option.companyNameAr : option.companyName}
                            </Typography>
                            <Chip label={t.unavailable} size="small" color="error" />
                          </Box>
                        </Box>
                        
                        {option.availability.reason && (
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              {option.availability.reason}
                            </Typography>
                          </Alert>
                        )}
                        
                        <Button variant="outlined" fullWidth disabled>
                          {t.unavailable}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      )}
    </Container>
  );
}

// الصفحة الرئيسية مع Suspense wrapper
export default function DeliveryOptionsPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    }>
      <DeliveryOptionsContent />
    </Suspense>
  );
}
