'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Divider,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Rating,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccessTime as TimeIcon,
  LocalShipping as DeliveryIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { EstimateEntity } from '@/types';
import { formatPrice, formatTime, getProviderById } from '@/utils/pricing';

interface ProviderCardProps {
  estimate: EstimateEntity;
  isCheapest: boolean;
  isFastest: boolean;
  rank: number;
}

export function ProviderCard({ estimate, isCheapest, isFastest, rank }: ProviderCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const provider = getProviderById(estimate.providerId);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleOrderClick = () => {
    if (estimate.deepLinkUrl) {
      window.open(estimate.deepLinkUrl, '_blank');
    }
  };

  if (!provider) return null;

  return (
    <Card
      data-testid="provider-card"
      sx={{
        width: '100%',
        maxWidth: 400,
        height: 'fit-content',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        ...(isCheapest && {
          border: 2,
          borderColor: 'success.main',
        }),
        ...(isFastest && {
          border: 2,
          borderColor: 'secondary.main',
        }),
      }}
    >
      {/* Rank Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1,
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        #{rank}
      </Box>

      {/* Provider Header */}
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={provider.logo}
            alt={estimate.providerName}
            sx={{
              width: 56,
              height: 56,
              mr: 2,
              bgcolor: 'primary.main',
            }}
          >
            {estimate.providerName.charAt(0)}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {estimate.providerName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={provider.rating} precision={0.1} size="small" readOnly />
              <Typography variant="body2" color="text.secondary">
                {provider.rating}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Price and Time */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatPrice(estimate.totalPrice)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('delivery_fee')}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatTime(estimate.etaMinutes)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('estimated_time')}
            </Typography>
          </Box>
        </Box>

        {/* Badges */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {isCheapest && (
            <Chip
              label={t('cheapest')}
              color="success"
              size="small"
              icon={<StarIcon />}
            />
          )}
          {isFastest && (
            <Chip
              label={t('fastest')}
              color="secondary"
              size="small"
              icon={<DeliveryIcon />}
            />
          )}
        </Box>
      </CardContent>

      <Divider />

      {/* Actions */}
      <CardActions sx={{ px: 2, py: 1.5 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleOrderClick}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            py: 1,
          }}
        >
          {t('order_now')}
        </Button>
        
        <Button
          size="small"
          onClick={handleExpandClick}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ textTransform: 'none' }}
        >
          {t('price_breakdown')}
        </Button>
      </CardActions>

      {/* Price Breakdown */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {t('price_breakdown')}
          </Typography>
          
          <List dense>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary={t('base_fee')}
                secondary={formatPrice(estimate.priceBreakdown.baseFee)}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary={t('distance_fee')}
                secondary={formatPrice(estimate.priceBreakdown.distanceFee)}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary={t('surge_fee')}
                secondary={formatPrice(estimate.priceBreakdown.surgeFee)}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary={t('service_fee')}
                secondary={formatPrice(estimate.priceBreakdown.serviceFee)}
              />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('total_price')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatPrice(estimate.totalPrice)}
            </Typography>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}
