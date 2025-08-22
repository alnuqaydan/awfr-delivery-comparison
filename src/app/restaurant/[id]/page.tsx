'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
  Divider,
  IconButton,
  Badge,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Star,
  AccessTime,
  LocationOn,
  Phone,
  ShoppingCart,
  Add,
  Remove,
} from '@mui/icons-material';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { fetchRestaurantById, fetchRestaurantMenu } from '@/store/restaurantSlice';
import { addToCart, updateCartItemQuantity } from '@/store/cartSlice';
import { Restaurant, MenuItem, CartItem } from '@/types';

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
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function RestaurantPage() {
  const { t } = useTranslation();
  const params = useParams();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.settings);
  const { selectedRestaurant, menuItems, loading, error } = useAppSelector(
    (state) => state.restaurant
  );
  const { items: cartItems } = useAppSelector((state) => state.cart);

  const [selectedTab, setSelectedTab] = useState(0);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // استخراج المعاملات من URL
  const restaurantSlug = params.id as string;
  const restaurantId = searchParams.get('restaurant_id');
  const userLat = searchParams.get('lat');
  const userLng = searchParams.get('lng');
  const menuCategory = searchParams.get('menu_category');
  const dietaryRestrictions = searchParams.get('dietary');

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchRestaurantById(restaurantId));
      dispatch(fetchRestaurantMenu(restaurantId));
    }
  }, [dispatch, restaurantId]);

  useEffect(() => {
    if (menuItems.length > 0) {
      const categories = Array.from(new Set(menuItems.map((item) => item.category)));
      setMenuCategories(categories);
    }
  }, [menuItems]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    const existingItem = cartItems.find(
      (item) => item.menuItem.id === menuItem.id
    );

    if (existingItem) {
      dispatch(
        updateCartItemQuantity({
          itemId: existingItem.id,
          quantity: existingItem.quantity + 1,
        })
      );
    } else {
      dispatch(addToCart({
        item: menuItem,
        quantity: 1,
      }));
    }
  };

  const getItemQuantity = (menuItemId: string) => {
    const cartItem = cartItems.find((item) => item.menuItem.id === menuItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleUpdateQuantity = (menuItem: MenuItem, newQuantity: number) => {
    const existingItem = cartItems.find(
      (item) => item.menuItem.id === menuItem.id
    );

    if (existingItem) {
      if (newQuantity === 0) {
        // Remove item logic would go here
        return;
      }
      dispatch(
        updateCartItemQuantity({
          itemId: existingItem.id,
          quantity: newQuantity,
        })
      );
    }
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !selectedRestaurant) {
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
          <Alert severity="error">
            {language === 'ar' ? 'حدث خطأ في تحميل بيانات المطعم' : 'Error loading restaurant data'}
          </Alert>
        </Container>
        <Footer />
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
        {/* Restaurant Header */}
        <Card sx={{ mb: 4, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="300"
            image={selectedRestaurant.banner}
            alt={language === 'ar' ? selectedRestaurant.nameAr : selectedRestaurant.name}
          />
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {language === 'ar' ? selectedRestaurant.nameAr : selectedRestaurant.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {language === 'ar' ? selectedRestaurant.descriptionAr : selectedRestaurant.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Rating value={selectedRestaurant.rating} readOnly />
                  <Typography variant="body2">
                    {selectedRestaurant.rating} ({selectedRestaurant.totalRatings} {language === 'ar' ? 'تقييم' : 'reviews'})
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<AccessTime />}
                    label={`${selectedRestaurant.deliveryTimeMin}-${selectedRestaurant.deliveryTimeMax} ${language === 'ar' ? 'دقيقة' : 'min'}`}
                    variant="outlined"
                  />
                  <Chip
                    icon={<LocationOn />}
                    label={selectedRestaurant.city}
                    variant="outlined"
                  />
                  <Chip
                    label={`${language === 'ar' ? 'الحد الأدنى' : 'Min'}: ${selectedRestaurant.minimumOrder} ${language === 'ar' ? 'ريال' : 'SAR'}`}
                    variant="outlined"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={selectedRestaurant.logo}
                    alt="Restaurant Logo"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '16px',
                    }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {language === 'ar' ? selectedRestaurant.cuisineTypeAr : selectedRestaurant.cuisineType}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Menu Tabs */}
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
            {menuCategories.map((category, index) => (
              <Tab
                key={category}
                label={language === 'ar' ? category : category}
                id={`menu-tab-${index}`}
                aria-controls={`menu-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {/* Menu Items */}
        {menuCategories.map((category, index) => (
          <TabPanel key={category} value={selectedTab} index={index}>
            <Grid container spacing={3}>
              {menuItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.image}
                        alt={language === 'ar' ? item.nameAr : item.name}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {language === 'ar' ? item.nameAr : item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {language === 'ar' ? item.descriptionAr : item.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" color="primary">
                            {item.price} {language === 'ar' ? 'ريال' : 'SAR'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getItemQuantity(item.id) > 0 && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleUpdateQuantity(item, getItemQuantity(item.id) - 1)}
                                >
                                  <Remove />
                                </IconButton>
                                <Typography variant="body2" sx={{ minWidth: '20px', textAlign: 'center' }}>
                                  {getItemQuantity(item.id)}
                                </Typography>
                              </>
                            )}
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleAddToCart(item)}
                            >
                              <Add />
                            </IconButton>
                          </Box>
                        </Box>

                        {item.isVegetarian && (
                          <Chip label={language === 'ar' ? 'نباتي' : 'Vegetarian'} size="small" color="success" />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </TabPanel>
        ))}
      </Container>

      {/* Floating Cart Button */}
      {getTotalCartItems() > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <Badge badgeContent={getTotalCartItems()} color="primary">
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              sx={{
                borderRadius: '50px',
                px: 3,
                py: 1.5,
                boxShadow: 3,
              }}
            >
              {language === 'ar' ? 'عرض السلة' : 'View Cart'}
            </Button>
          </Badge>
        </Box>
      )}

      <Footer />
    </Box>
  );
}
