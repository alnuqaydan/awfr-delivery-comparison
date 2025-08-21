import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Star,
  AccessTime,
  LocationOn,
} from '@mui/icons-material';
import { Restaurant, RestaurantCardProps } from '@/types';
import { formatPrice } from '@/utils/pricing';

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onSelect,
}) => {
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    onSelect(restaurant);
  };

  return (
    <Card
      sx={{
        maxWidth: 345,
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        },
        position: 'relative',
        overflow: 'visible',
      }}
      onClick={handleCardClick}
    >
      {/* Favorite Button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
          },
          zIndex: 1,
        }}
        onClick={handleFavoriteToggle}
      >
        {isFavorite ? (
          <Favorite sx={{ color: '#ff4757' }} />
        ) : (
          <FavoriteBorder />
        )}
      </IconButton>

      {/* Featured Badge */}
      {restaurant.isFeatured && (
        <Badge
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
          }}
          badgeContent="مميز"
          color="primary"
        />
      )}

      {/* Restaurant Image */}
      <CardMedia
        component="img"
        height="200"
        image={restaurant.banner || '/images/restaurant-placeholder.jpg'}
        alt={restaurant.name}
        sx={{
          objectFit: 'cover',
        }}
      />

      <CardContent sx={{ p: 2 }}>
        {/* Restaurant Name and Rating */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              fontSize: '1.1rem',
              lineHeight: 1.2,
              flex: 1,
              mr: 1,
            }}
          >
            {restaurant.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Rating
              value={restaurant.rating}
              precision={0.1}
              size="small"
              readOnly
              sx={{ mr: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              ({restaurant.totalRatings})
            </Typography>
          </Box>
        </Box>

        {/* Cuisine Type */}
        <Chip
          label={restaurant.cuisineTypeAr}
          size="small"
          sx={{
            mb: 1,
            backgroundColor: '#f8f9fa',
            color: '#495057',
            fontWeight: 500,
          }}
        />

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {restaurant.descriptionAr}
        </Typography>

        {/* Delivery Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} دقيقة
          </Typography>
        </Box>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {restaurant.address}
          </Typography>
        </Box>

        {/* Minimum Order */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            الحد الأدنى للطلب:
          </Typography>
          <Typography variant="body2" fontWeight={600} color="primary">
            {formatPrice(restaurant.minimumOrder)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
