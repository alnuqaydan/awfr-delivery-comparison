'use client';

import { useTranslation } from 'react-i18next';
import {
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ProviderCard } from './ProviderCard';
import { useAppSelector } from '@/hooks';

interface ProviderGridProps {
  loading: boolean;
  error: string | null;
}

export function ProviderGrid({ loading, error }: ProviderGridProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { estimates } = useAppSelector((state) => state.pricing);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {t('loading')}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          <AlertTitle>{t('error')}</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  if (estimates.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('no_results')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Results Summary */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          sx={{ fontWeight: 600, mb: 2 }}
        >
          Delivery Options for {estimates[0]?.distanceKm} km
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {estimates.length} providers available • Sorted by price
        </Typography>
      </Box>

      {/* Provider Cards Grid */}
      <Grid
        container
        spacing={3}
        sx={{
          maxWidth: 1400,
          mx: 'auto',
        }}
      >
        {estimates.map((estimate, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            lg={4}
            key={estimate.providerId}
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <ProviderCard
              estimate={estimate}
              isCheapest={estimate.isCheapest}
              isFastest={estimate.isFastest}
              rank={index + 1}
            />
          </Grid>
        ))}
      </Grid>

      {/* Additional Information */}
      <Box sx={{ mt: 6, p: 4, bgcolor: 'background.paper', borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          How it works
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Prices are calculated based on base fees, distance charges, and service fees. 
          Delivery times are estimates and may vary based on traffic and restaurant preparation time.
        </Typography>
      </Box>
    </Box>
  );
}
