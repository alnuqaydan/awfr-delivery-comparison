'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Fab,
  Collapse,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Speed,
  AttachMoney,
  Star,
  AccessTime,
  Insights,
  ExpandMore,
  ExpandLess,
  Quickreply,
  CompareArrows,
} from '@mui/icons-material';
import { DeliveryOption } from '@/types';

interface QuickDecisionHelperProps {
  options: DeliveryOption[];
  onOptionSelect: (option: DeliveryOption) => void;
  language: 'ar' | 'en';
}

interface OptionAnalysis {
  bestValue: DeliveryOption;
  fastest: DeliveryOption;
  cheapest: DeliveryOption;
  mostReliable: DeliveryOption;
  recommendation: DeliveryOption;
  savings: {
    cheapestVsExpensive: number;
    fastestVsSlowest: number;
  };
}

const QuickDecisionHelper: React.FC<QuickDecisionHelperProps> = ({
  options,
  onOptionSelect,
  language,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<OptionAnalysis | null>(null);
  const [countdown, setCountdown] = useState(60); // 60 ثانية لاتخاذ القرار

  // تحليل الخيارات
  useEffect(() => {
    if (options.length === 0) return;

    const availableOptions = options.filter(opt => opt.availability.isAvailable);
    if (availableOptions.length === 0) return;

    const fastest = availableOptions.reduce((prev, current) =>
      prev.timing.estimatedMin < current.timing.estimatedMin ? prev : current
    );

    const cheapest = availableOptions.reduce((prev, current) =>
      prev.pricing.totalCost < current.pricing.totalCost ? prev : current
    );

    const mostReliable = availableOptions.reduce((prev, current) =>
      prev.rating.reliability > current.rating.reliability ? prev : current
    );

    // أفضل قيمة (توازن بين السعر والوقت والموثوقية)
    const bestValue = availableOptions.reduce((prev, current) => {
      const prevScore = calculateValueScore(prev);
      const currentScore = calculateValueScore(current);
      return prevScore > currentScore ? prev : current;
    });

    // التوصية الذكية
    const recommendation = availableOptions.reduce((prev, current) => {
      const prevScore = calculateSmartScore(prev);
      const currentScore = calculateSmartScore(current);
      return prevScore > currentScore ? prev : current;
    });

    const mostExpensive = availableOptions.reduce((prev, current) =>
      prev.pricing.totalCost > current.pricing.totalCost ? prev : current
    );

    const slowest = availableOptions.reduce((prev, current) =>
      prev.timing.estimatedMax > current.timing.estimatedMax ? prev : current
    );

    setAnalysis({
      bestValue,
      fastest,
      cheapest,
      mostReliable,
      recommendation,
      savings: {
        cheapestVsExpensive: mostExpensive.pricing.totalCost - cheapest.pricing.totalCost,
        fastestVsSlowest: slowest.timing.estimatedMax - fastest.timing.estimatedMin,
      },
    });
  }, [options]);

  // عداد تنازلي لتشجيع اتخاذ قرار سريع
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const calculateValueScore = (option: DeliveryOption): number => {
    // نقاط بناءً على السعر (كلما قل السعر، زادت النقاط)
    const priceScore = Math.max(0, 100 - option.pricing.totalCost);
    
    // نقاط بناءً على الوقت (كلما قل الوقت، زادت النقاط)
    const timeScore = Math.max(0, 100 - option.timing.estimatedMin);
    
    // نقاط الموثوقية
    const reliabilityScore = option.rating.reliability;
    
    // نقاط التقييم
    const ratingScore = option.rating.score * 20; // تحويل من 5 إلى 100
    
    return (priceScore * 0.3) + (timeScore * 0.3) + (reliabilityScore * 0.25) + (ratingScore * 0.15);
  };

  const calculateSmartScore = (option: DeliveryOption): number => {
    const hour = new Date().getHours();
    let weights = { price: 0.3, time: 0.3, reliability: 0.25, rating: 0.15 };
    
    // تعديل الأوزان حسب الوقت
    if (hour >= 19 && hour <= 22) {
      // أوقات العشاء - الوقت أهم
      weights = { price: 0.25, time: 0.4, reliability: 0.25, rating: 0.1 };
    } else if (hour >= 12 && hour <= 14) {
      // أوقات الغداء - توازن
      weights = { price: 0.3, time: 0.35, reliability: 0.25, rating: 0.1 };
    }
    
    const priceScore = Math.max(0, 100 - option.pricing.totalCost);
    const timeScore = Math.max(0, 100 - option.timing.estimatedMin);
    const reliabilityScore = option.rating.reliability;
    const ratingScore = option.rating.score * 20;
    
    return (priceScore * weights.price) + 
           (timeScore * weights.time) + 
           (reliabilityScore * weights.reliability) + 
           (ratingScore * weights.rating);
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  const formatTime = (minutes: number) => {
    return `${minutes} ${language === 'ar' ? 'دقيقة' : 'min'}`;
  };

  const texts = {
    ar: {
      quickDecision: 'قرار سريع',
      recommendation: 'التوصية',
      bestValue: 'أفضل قيمة',
      fastest: 'الأسرع',
      cheapest: 'الأرخص',
      mostReliable: 'الأكثر موثوقية',
      savings: 'التوفير',
      timeSaved: 'وقت موفر',
      moneySaved: 'مبلغ موفر',
      selectNow: 'اختر الآن',
      timeLeft: 'الوقت المتبقي',
      seconds: 'ثانية',
      analysis: 'التحليل',
      showDetails: 'عرض التفاصيل',
      hideDetails: 'إخفاء التفاصيل',
      smartChoice: 'الخيار الذكي',
      quickStats: 'إحصائيات سريعة',
    },
    en: {
      quickDecision: 'Quick Decision',
      recommendation: 'Recommendation',
      bestValue: 'Best Value',
      fastest: 'Fastest',
      cheapest: 'Cheapest',
      mostReliable: 'Most Reliable',
      savings: 'Savings',
      timeSaved: 'Time Saved',
      moneySaved: 'Money Saved',
      selectNow: 'Select Now',
      timeLeft: 'Time Left',
      seconds: 'seconds',
      analysis: 'Analysis',
      showDetails: 'Show Details',
      hideDetails: 'Hide Details',
      smartChoice: 'Smart Choice',
      quickStats: 'Quick Stats',
    },
  };

  const t = texts[language];

  if (!analysis) return null;

  return (
    <Box sx={{ position: 'sticky', top: 20, zIndex: 100 }}>
      {/* Floating Quick Decision Button */}
      {isMobile && !expanded && (
        <Fab
          variant="extended"
          color="primary"
          onClick={() => setExpanded(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            boxShadow: 4,
          }}
        >
                            <Quickreply sx={{ mr: 1 }} />
          {t.quickDecision}
          {countdown > 0 && (
            <Chip
              label={`${countdown}s`}
              size="small"
              color="warning"
              sx={{ ml: 1 }}
            />
          )}
        </Fab>
      )}

      {/* Quick Decision Panel */}
      <Paper
        elevation={isMobile ? 0 : 3}
        sx={{
          p: isMobile ? 1 : 3,
          borderRadius: isMobile ? 0 : 2,
          position: isMobile ? 'fixed' : 'relative',
          bottom: isMobile ? 0 : 'auto',
          left: isMobile ? 0 : 'auto',
          right: isMobile ? 0 : 'auto',
          width: isMobile ? '100%' : 'auto',
          zIndex: isMobile ? 1000 : 'auto',
          maxHeight: isMobile ? '80vh' : 'none',
          overflow: 'auto',
          display: isMobile ? (expanded ? 'block' : 'none') : 'block',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Insights color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {t.quickDecision}
            </Typography>
            {countdown > 0 && (
              <Chip
                label={`${countdown} ${t.seconds}`}
                size="small"
                color={countdown <= 10 ? 'error' : 'warning'}
                variant="outlined"
              />
            )}
          </Box>
          
          {isMobile && (
            <IconButton onClick={() => setExpanded(false)}>
              <ExpandMore />
            </IconButton>
          )}
        </Box>

        {/* Smart Recommendation */}
        <Card
          sx={{
            mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
            border: 2,
            borderColor: 'primary.main',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  {t.smartChoice}
                </Typography>
              </Box>
              <Chip label={t.recommendation} color="primary" size="small" />
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {language === 'ar' ? analysis.recommendation.companyNameAr : analysis.recommendation.companyName}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" color="primary" fontWeight={700}>
                {formatPrice(analysis.recommendation.pricing.totalCost)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatTime(analysis.recommendation.timing.estimatedMin)}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              onClick={() => onOptionSelect(analysis.recommendation)}
              sx={{ fontWeight: 600 }}
            >
              {t.selectNow}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 1.5, textAlign: 'center', backgroundColor: 'success.light', color: 'success.contrastText' }}>
              <AttachMoney fontSize="small" />
              <Typography variant="caption" display="block" fontWeight={600}>
                {t.cheapest}
              </Typography>
              <Typography variant="body2">
                {formatPrice(analysis.cheapest.pricing.totalCost)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 1.5, textAlign: 'center', backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
              <Speed fontSize="small" />
              <Typography variant="caption" display="block" fontWeight={600}>
                {t.fastest}
              </Typography>
              <Typography variant="body2">
                {formatTime(analysis.fastest.timing.estimatedMin)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 1.5, textAlign: 'center', backgroundColor: 'info.light', color: 'info.contrastText' }}>
              <TrendingUp fontSize="small" />
              <Typography variant="caption" display="block" fontWeight={600}>
                {t.mostReliable}
              </Typography>
              <Typography variant="body2">
                {analysis.mostReliable.rating.reliability}%
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 1.5, textAlign: 'center', backgroundColor: 'secondary.light', color: 'secondary.contrastText' }}>
              <Star fontSize="small" />
              <Typography variant="caption" display="block" fontWeight={600}>
                {t.bestValue}
              </Typography>
              <Typography variant="body2">
                {language === 'ar' ? analysis.bestValue.companyNameAr : analysis.bestValue.companyName}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Savings Information */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            icon={<AttachMoney />}
            label={`${t.moneySaved}: ${formatPrice(analysis.savings.cheapestVsExpensive)}`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<AccessTime />}
            label={`${t.timeSaved}: ${formatTime(analysis.savings.fastestVsSlowest)}`}
            color="warning"
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Quick Action Buttons */}
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              size="small"
              startIcon={<AttachMoney />}
              onClick={() => onOptionSelect(analysis.cheapest)}
              color="success"
            >
              {t.cheapest}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              size="small"
              startIcon={<Speed />}
              onClick={() => onOptionSelect(analysis.fastest)}
              color="warning"
            >
              {t.fastest}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default QuickDecisionHelper;
