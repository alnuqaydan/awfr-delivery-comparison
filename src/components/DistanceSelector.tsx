'use client';

import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Slider,
  TextField,
  useTheme,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { setDistance } from '@/store/settingsSlice';

interface DistanceSelectorProps {
  value: number;
  onChange: (distance: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showIcon?: boolean;
  compact?: boolean;
}

export function DistanceSelector({
  value,
  onChange,
  min = 1,
  max = 50,
  step = 1,
  showIcon = false,
  compact = false,
}: DistanceSelectorProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.settings);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const distance = newValue as number;
    onChange(distance);
    dispatch(setDistance(distance));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value >= min && value <= max) {
      onChange(value);
      dispatch(setDistance(value));
    }
  };

  const marks = [
    { value: min, label: `${min} ${language === 'ar' ? 'كم' : 'km'}` },
    { value: Math.round((min + max) / 4), label: `${Math.round((min + max) / 4)} ${language === 'ar' ? 'كم' : 'km'}` },
    { value: Math.round((min + max) / 2), label: `${Math.round((min + max) / 2)} ${language === 'ar' ? 'كم' : 'km'}` },
    { value: Math.round((min + max) * 3 / 4), label: `${Math.round((min + max) * 3 / 4)} ${language === 'ar' ? 'كم' : 'km'}` },
    { value: max, label: `${max} ${language === 'ar' ? 'كم' : 'km'}` },
  ];

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {showIcon && <LocationIcon color="primary" />}
        <Slider
          value={value}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          marks={marks}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value} ${language === 'ar' ? 'كم' : 'km'}`}
          sx={{
            flexGrow: 1,
            '& .MuiSlider-mark': {
              backgroundColor: 'primary.main',
            },
            '& .MuiSlider-markLabel': {
              color: 'text.secondary',
              fontSize: '0.75rem',
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: 'primary.main',
              fontSize: '0.75rem',
            },
          }}
        />
        <TextField
          type="number"
          value={value}
          onChange={handleInputChange}
          inputProps={{
            min,
            max,
            step,
          }}
          size="small"
          sx={{
            width: 80,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {language === 'ar' ? 'كم' : 'km'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {showIcon && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <LocationIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" component="h3" gutterBottom>
            {language === 'ar' ? 'مسافة التوصيل' : 'Delivery Distance'}
          </Typography>
        </Box>
      )}

      <Box sx={{ px: 2, mb: 3 }}>
        <Slider
          value={value}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          marks={marks}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value} ${language === 'ar' ? 'كم' : 'km'}`}
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

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <TextField
          type="number"
          value={value}
          onChange={handleInputChange}
          inputProps={{
            min,
            max,
            step,
          }}
          sx={{
            width: 120,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        <Typography variant="body1" color="text.secondary">
          {language === 'ar' ? 'كيلومتر' : 'kilometers'}
        </Typography>
      </Box>

      {/* Distance Preview */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
          {value} {language === 'ar' ? 'كيلومتر' : 'kilometers'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {language === 'ar' 
            ? 'الوقت المتوقع للتوصيل: 30-60 دقيقة'
            : 'Estimated delivery time: 30-60 minutes'
          }
        </Typography>
      </Box>
    </Box>
  );
}
