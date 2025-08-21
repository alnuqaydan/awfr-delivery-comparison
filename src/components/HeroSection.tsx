'use client';

import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  Compare as CompareIcon,
  Savings as SavingsIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

export function HeroSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <CompareIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('compare_prices'),
      description: 'Compare prices from 6 major delivery providers',
    },
    {
      icon: <SavingsIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: t('cheapest'),
      description: 'Find the most affordable delivery option',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: t('fastest'),
      description: 'Get your order delivered as fast as possible',
    },
  ];

  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      {/* Main Hero Content */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
            lineHeight: 1.2,
            background: 'linear-gradient(45deg, #1976d2 30%, #ff9800 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3,
          }}
        >
          {t('hero_title')}
        </Typography>
        
        <Typography
          variant="h5"
          component="p"
          color="text.secondary"
          sx={{
            maxWidth: 800,
            mx: 'auto',
            mb: 4,
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            lineHeight: 1.6,
          }}
        >
          {t('hero_subtitle')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<DeliveryIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 2,
              textTransform: 'none',
            }}
            onClick={() => {
              const element = document.getElementById('distance-selector');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('get_started')}
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<CompareIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            {t('learn_more')}
          </Button>
        </Box>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ maxWidth: 1200, mx: 'auto' }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                textAlign: 'center',
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <Box sx={{ mb: 2 }}>
                {feature.icon}
              </Box>
              
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{ fontWeight: 600, mb: 2 }}
              >
                {feature.title}
              </Typography>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Stats Section */}
      <Box sx={{ mt: 8, p: 4, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600, mb: 4 }}
        >
          {t('providers_available')}
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {['Mrsool', 'Jahez', 'HungerStation', 'ToYou', 'Lugmety', 'Careem'].map((provider, index) => (
            <Grid item key={index}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                {provider}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
