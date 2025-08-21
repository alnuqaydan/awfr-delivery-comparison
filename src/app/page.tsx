'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Tabs, 
  Tab, 
  TextField, 
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, Restaurant } from '@mui/icons-material';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import RestaurantCard from '@/components/RestaurantCard';
import { Footer } from '@/components/Footer';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { 
  fetchRestaurantsByCategory, 
  filterRestaurantsBySearch,
  sortRestaurantsBy,
  setSelectedRestaurant 
} from '@/store/restaurantSlice';
import { Restaurant as RestaurantType, RestaurantCategory } from '@/types';
import { RESTAURANT_CATEGORIES } from '@/data/restaurants';

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.settings);
  const { 
    restaurants, 
    categories, 
    loading, 
    error 
  } = useAppSelector((state) => state.restaurant);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'minimumOrder'>('rating');

  useEffect(() => {
    if (selectedCategory !== 'all') {
      dispatch(fetchRestaurantsByCategory(selectedCategory));
    }
  }, [dispatch, selectedCategory]);

  useEffect(() => {
    if (searchTerm) {
      dispatch(filterRestaurantsBySearch(searchTerm));
    }
  }, [dispatch, searchTerm]);

  useEffect(() => {
    dispatch(sortRestaurantsBy(sortBy));
  }, [dispatch, sortBy]);

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  const handleRestaurantSelect = (restaurant: RestaurantType) => {
    dispatch(setSelectedRestaurant(restaurant));
    // Navigate to restaurant page
    router.push(`/restaurant/${restaurant.id}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as 'rating' | 'deliveryTime' | 'minimumOrder');
  };

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
        
        {/* Search Bar */}
        <Box sx={{ my: 4 }}>
          <TextField
            fullWidth
            placeholder={language === 'ar' ? 'البحث عن المطاعم أو الأطباق...' : 'Search restaurants or dishes...'}
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'background.paper',
              },
            }}
          />
        </Box>

        {/* Category Tabs */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              mb: 2,
              color: 'text.primary',
            }}
          >
            {language === 'ar' ? 'فئات الطعام' : 'Food Categories'}
          </Typography>
          
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 120,
                textTransform: 'none',
                fontWeight: 500,
              },
            }}
          >
            <Tab 
              label={language === 'ar' ? 'الكل' : 'All'} 
              value="all" 
              icon={<Restaurant />}
              iconPosition="start"
            />
            {categories.map((category) => (
              <Tab
                key={category.id}
                label={language === 'ar' ? category.nameAr : category.name}
                value={category.id}
                icon={<span>{category.icon}</span>}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        {/* Sort Options */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <select
            value={sortBy}
            onChange={handleSortChange}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              fontSize: '14px',
            }}
          >
            <option value="rating">
              {language === 'ar' ? 'ترتيب حسب التقييم' : 'Sort by Rating'}
            </option>
            <option value="deliveryTime">
              {language === 'ar' ? 'ترتيب حسب وقت التوصيل' : 'Sort by Delivery Time'}
            </option>
            <option value="minimumOrder">
              {language === 'ar' ? 'ترتيب حسب الحد الأدنى' : 'Sort by Minimum Order'}
            </option>
          </select>
        </Box>

        {/* Restaurants Grid */}
        <Box sx={{ mb: 6 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : restaurants.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                {language === 'ar' ? 'لا توجد مطاعم متاحة' : 'No restaurants available'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {restaurants.map((restaurant) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={restaurant.id}>
                  <RestaurantCard
                    restaurant={restaurant}
                    onSelect={handleRestaurantSelect}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
