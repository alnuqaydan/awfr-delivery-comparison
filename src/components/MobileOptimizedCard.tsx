'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Schedule,
  Star,
  Launch,
  CheckCircle,
  TrendingUp,
  LocalOffer,
  SwipeRightAlt,
} from '@mui/icons-material';
import { DeliveryOption } from '@/types';

interface MobileOptimizedCardProps {
  option: DeliveryOption;
  onOrderNow: (option: DeliveryOption) => void;
  isSelected?: boolean;
  language: 'ar' | 'en';
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  option,
  onOrderNow,
  isSelected = false,
  language,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const texts = {
    ar: {
      orderNow: 'اطلب الآن',
      totalCost: 'التكلفة الإجمالية',
      deliveryTime: 'وقت التوصيل',
      rating: 'التقييم',
      reliability: 'الموثوقية',
      reviews: 'تقييم',
      features: 'المميزات',
      promoCode: 'كود الخصم',
      swipeToOrder: 'اسحب للطلب',
      badges: {
        fastest: 'الأسرع',
        cheapest: 'الأرخص',
        'best-rated': 'الأعلى تقييماً',
        recommended: 'مُوصى به',
      },
    },
    en: {
      orderNow: 'Order Now',
      totalCost: 'Total Cost',
      deliveryTime: 'Delivery Time',
      rating: 'Rating',
      reliability: 'Reliability',
      reviews: 'reviews',
      features: 'Features',
      promoCode: 'Promo Code',
      swipeToOrder: 'Swipe to Order',
      badges: {
        fastest: 'Fastest',
        cheapest: 'Cheapest',
        'best-rated': 'Best Rated',
        recommended: 'Recommended',
      },
    },
  };

  const t = texts[language];

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  const formatTime = (min: number, max: number) => {
    return `${min}-${max} ${language === 'ar' ? 'دقيقة' : 'min'}`;
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

  if (isMobile) {
    // تصميم محسن للأجهزة المحمولة
    return (
      <Card
        sx={{
          mb: 2,
          border: isSelected ? 2 : 0,
          borderColor: 'primary.main',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:active': {
            transform: 'scale(0.98)',
          },
          backgroundColor: option.branding.accentColor,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Header - Company Info & Badges */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={option.branding.logo}
                alt={option.companyName}
                sx={{ width: 40, height: 40 }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  {language === 'ar' ? option.companyNameAr : option.companyName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    {option.rating.score}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Badges - Only show the primary one on mobile */}
            {option.badges && option.badges.length > 0 && (
              <Chip
                label={t.badges[option.badges[0]]}
                size="small"
                color={getBadgeColor(option.badges[0])}
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>

          {/* Key Info Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                {formatPrice(option.pricing.totalCost)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t.totalCost}
              </Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatTime(option.timing.estimatedMin, option.timing.estimatedMax)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {t.deliveryTime}
              </Typography>
            </Box>
          </Box>

          {/* Reliability Bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {t.reliability}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {option.rating.reliability}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={option.rating.reliability}
              color={option.rating.reliability > 85 ? 'success' : option.rating.reliability > 70 ? 'warning' : 'error'}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>

          {/* Promo Code Alert */}
          {option.promoCode && (
            <Box
              sx={{
                backgroundColor: 'info.light',
                color: 'info.contrastText',
                p: 1,
                borderRadius: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <LocalOffer sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {t.promoCode}: {option.promoCode}
              </Typography>
            </Box>
          )}

          {/* CTA Button - Prominent */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => onOrderNow(option)}
            endIcon={<SwipeRightAlt />}
            sx={{
              backgroundColor: option.branding.primaryColor,
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              py: 1.5,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: option.branding.primaryColor,
                opacity: 0.9,
                boxShadow: 3,
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            {t.orderNow}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // تصميم للأجهزة الأكبر (يبقى كما هو)
  return (
    <Card
      sx={{
        height: '100%',
        border: isSelected ? 2 : 0,
        borderColor: 'primary.main',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Desktop layout remains the same */}
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
          
          {/* All badges for desktop */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {option.badges?.map((badge) => (
              <Chip
                key={badge}
                label={t.badges[badge]}
                size="small"
                color={getBadgeColor(badge)}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary">{t.totalCost}</Typography>
          <Typography variant="h6" color="primary">{formatPrice(option.pricing.totalCost)}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Schedule color="action" />
          <Typography variant="body2">
            {t.deliveryTime}: {formatTime(option.timing.estimatedMin, option.timing.estimatedMax)}
          </Typography>
        </Box>

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

        {option.promoCode && (
          <Box sx={{ 
            backgroundColor: 'info.light',
            color: 'info.contrastText',
            p: 1,
            borderRadius: 1,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <LocalOffer />
            <Typography variant="body2">
              {t.promoCode}: <strong>{option.promoCode}</strong>
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          endIcon={<Launch />}
          onClick={() => onOrderNow(option)}
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
  );
};

export default MobileOptimizedCard;
