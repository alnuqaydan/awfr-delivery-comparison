'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Rating,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Search,
  Star,
  AccessTime,
  LocationOn,
  ShoppingCart,
  Restaurant,
  FilterList,
} from '@mui/icons-material';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Restaurant, RestaurantCategory } from '@/types';
import { ksaRestaurantService, ENHANCED_RESTAURANT_CATEGORIES } from '@/services/ksaRestaurantService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`restaurant-tabpanel-${index}`}
      aria-labelledby={`restaurant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function KSARestaurantsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.settings);
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, selectedCategory, searchQuery]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب المطاعم من الخدمة الخارجية
      const data = await ksaRestaurantService.fetchAllRestaurants();
      setRestaurants(data);
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ في تحميل المطاعم' : 'Error loading restaurants');
      console.error('خطأ في تحميل المطاعم:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = restaurants;

    // تصفية حسب الفئة
    if (selectedCategory !== 'all') {
      const category = ENHANCED_RESTAURANT_CATEGORIES.find(cat => cat.id === selectedCategory);
      if (category) {
        filtered = filtered.filter(restaurant => 
          restaurant.cuisineType.toLowerCase() === category.name.toLowerCase()
        );
      }
    }

    // تصفية حسب البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.nameAr.includes(searchQuery) ||
        restaurant.description.toLowerCase().includes(query) ||
        restaurant.descriptionAr.includes(searchQuery) ||
        restaurant.cuisineType.toLowerCase().includes(query) ||
        restaurant.cuisineTypeAr.includes(searchQuery)
      );
    }

    setFilteredRestaurants(filtered);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    if (newValue === 0) {
      setSelectedCategory('all');
    } else {
      const category = ENHANCED_RESTAURANT_CATEGORIES[newValue - 1];
      setSelectedCategory(category.id);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    // التنقل إلى صفحة المطعم
    window.location.href = `/restaurant/${restaurant.id}`;
  };

  const getTotalRestaurants = () => {
    return filteredRestaurants.length;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          direction: language === 'ar' ? 'rtl' : 'ltr',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        direction: language === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      <Header />
      
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {/* عنوان الصفحة */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {language === 'ar' ? 'مطاعم المملكة العربية السعودية' : 'Saudi Arabia Restaurants'}
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            {language === 'ar' 
              ? 'اكتشف أفضل المطاعم وقوائم الطعام من جميع أنحاء المملكة' 
              : 'Discover the best restaurants and menus from across the Kingdom'
            }
          </Typography>
        </Box>

        {/* شريط البحث */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={language === 'ar' ? 'ابحث عن مطعم أو طبق...' : 'Search for restaurant or dish...'}
            value={searchQuery}
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
                borderRadius: '50px',
              },
            }}
          />
        </Box>

        {/* فئات المطاعم */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
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
              id="restaurant-tab-0"
              aria-controls="restaurant-tabpanel-0"
            />
            {ENHANCED_RESTAURANT_CATEGORIES.map((category, index) => (
              <Tab
                key={category.id}
                label={language === 'ar' ? category.nameAr : category.name}
                id={`restaurant-tab-${index + 1}`}
                aria-controls={`restaurant-tabpanel-${index + 1}`}
              />
            ))}
          </Tabs>
        </Box>

        {/* رسالة الخطأ */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* عدد النتائج */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Restaurant color="primary" />
          <Typography variant="body1">
            {language === 'ar' 
              ? `تم العثور على ${getTotalRestaurants()} مطعم` 
              : `Found ${getTotalRestaurants()} restaurants`
            }
          </Typography>
        </Box>

        {/* عرض المطاعم */}
        {filteredRestaurants.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {language === 'ar' ? 'لم يتم العثور على مطاعم' : 'No restaurants found'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {language === 'ar' 
                ? 'جرب تغيير معايير البحث أو الفئة' 
                : 'Try changing your search criteria or category'
              }
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRestaurants.map((restaurant) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
                <RestaurantCard
                  restaurant={restaurant}
                  onSelect={handleRestaurantSelect}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* معلومات إضافية */}
        <Box sx={{ mt: 6, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            {language === 'ar' ? 'عن هذه الصفحة' : 'About This Page'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {language === 'ar' 
              ? 'هذه الصفحة تعرض المطاعم من موقع ksaRestaurantmenus.com، وهو مصدر شامل لقوائم الطعام في المملكة العربية السعودية. يمكنك استكشاف مجموعة متنوعة من المطاعم والوصول إلى قوائم الطعام المحدثة.'
              : 'This page displays restaurants from ksaRestaurantmenus.com, a comprehensive source for restaurant menus across Saudi Arabia. You can explore a variety of restaurants and access updated menus.'
            }
          </Typography>
          <Button
            variant="outlined"
            href="https://www.ksarestaurantmenus.com"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<Restaurant />}
          >
            {language === 'ar' ? 'زيارة الموقع الأصلي' : 'Visit Original Website'}
          </Button>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
