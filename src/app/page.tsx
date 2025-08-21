'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Box, Typography, Grid } from '@mui/material';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { DistanceSelector } from '@/components/DistanceSelector';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Footer } from '@/components/Footer';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { calculateDeliveryEstimates } from '@/store/pricingSlice';

export default function HomePage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedDistance, loading, error } = useAppSelector((state) => state.pricing);
  const { language } = useAppSelector((state) => state.settings);

  useEffect(() => {
    dispatch(calculateDeliveryEstimates(selectedDistance));
  }, [dispatch, selectedDistance]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        direction: language === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      <Header />
      
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <HeroSection />
        
        <Box sx={{ my: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 600,
              mb: 3,
              color: 'text.primary',
            }}
          >
            {t('compare_prices')}
          </Typography>
          
          <DistanceSelector />
        </Box>

        <ProviderGrid loading={loading} error={error} />
      </Container>

      <Footer />
    </Box>
  );
}
