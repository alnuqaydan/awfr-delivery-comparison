'use client';

import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Paper,
  Grid,
  useTheme,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { setDistance } from '@/store/pricingSlice';

export function DistanceSelector() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { selectedDistance } = useAppSelector((state) => state.pricing);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    dispatch(setDistance(newValue as number));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= 50) {
      dispatch(setDistance(value));
    }
  };

  const marks = [
    { value: 1, label: '1 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
  ];

  return (
    <Paper
      id="distance-selector"
      data-testid="distance-selector"
      elevation={0}
      sx={{
        p: 4,
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <LocationIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          sx={{ fontWeight: 600, mb: 1 }}
        >
          {t('select_distance')}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Select the distance for your delivery to compare prices from all providers
        </Typography>
      </Box>

      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={8}>
          <Box sx={{ px: 2 }}>
            <Slider
              value={selectedDistance}
              onChange={handleSliderChange}
              min={1}
              max={50}
              step={0.5}
              marks={marks}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value} km`}
              sx={{
                '& .MuiSlider-mark': {
                  backgroundColor: 'primary.main',
                },
                '& .MuiSlider-markLabel': {
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                },
                '& .MuiSlider-valueLabel': {
                  backgroundColor: 'primary.main',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              type="number"
              value={selectedDistance}
              onChange={handleInputChange}
              inputProps={{
                min: 1,
                max: 50,
                step: 0.5,
              }}
              sx={{
                width: 120,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Typography variant="body1" color="text.secondary">
              {t('kilometers')}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Distance Preview */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
          {selectedDistance} {t('kilometers')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Estimated delivery time: 30-60 minutes
        </Typography>
      </Box>
    </Paper>
  );
}
