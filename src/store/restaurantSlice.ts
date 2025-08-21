import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Restaurant, RestaurantCategory, MenuItem, RestaurantState } from '@/types';
import { 
  RESTAURANTS, 
  RESTAURANT_CATEGORIES, 
  MENU_ITEMS,
  getRestaurantsByCategory,
  getRestaurantById,
  getMenuItemsByRestaurant,
  getMenuItemsByCategory
} from '@/data/restaurants';

const initialState: RestaurantState = {
  restaurants: RESTAURANTS,
  categories: RESTAURANT_CATEGORIES,
  selectedRestaurant: null,
  menuItems: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchRestaurantsByCategory = createAsyncThunk(
  'restaurant/fetchByCategory',
  async (categoryId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return getRestaurantsByCategory(categoryId);
  }
);

export const fetchRestaurantDetails = createAsyncThunk(
  'restaurant/fetchDetails',
  async (restaurantId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const restaurant = getRestaurantById(restaurantId);
    const menuItems = getMenuItemsByRestaurant(restaurantId);
    return { restaurant, menuItems };
  }
);

export const fetchMenuItemsByCategory = createAsyncThunk(
  'restaurant/fetchMenuByCategory',
  async ({ restaurantId, category }: { restaurantId: string; category: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    return getMenuItemsByCategory(category);
  }
);

export const fetchRestaurantById = createAsyncThunk(
  'restaurant/fetchById',
  async (restaurantId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return getRestaurantById(restaurantId);
  }
);

export const fetchRestaurantMenu = createAsyncThunk(
  'restaurant/fetchMenu',
  async (restaurantId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    return getMenuItemsByRestaurant(restaurantId);
  }
);

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setSelectedRestaurant: (state, action: PayloadAction<Restaurant | null>) => {
      state.selectedRestaurant = action.payload;
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
      state.menuItems = [];
    },
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.menuItems = action.payload;
    },
    filterRestaurantsBySearch: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase();
      if (searchTerm) {
        state.restaurants = RESTAURANTS.filter(restaurant =>
          restaurant.name.toLowerCase().includes(searchTerm) ||
          restaurant.nameAr.includes(searchTerm) ||
          restaurant.cuisineType.toLowerCase().includes(searchTerm)
        );
      } else {
        state.restaurants = RESTAURANTS;
      }
    },
    filterRestaurantsByRating: (state, action: PayloadAction<number>) => {
      const minRating = action.payload;
      state.restaurants = RESTAURANTS.filter(restaurant =>
        restaurant.rating >= minRating
      );
    },
    sortRestaurantsBy: (state, action: PayloadAction<'rating' | 'deliveryTime' | 'minimumOrder'>) => {
      const sortBy = action.payload;
      state.restaurants = [...state.restaurants].sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'deliveryTime':
            return a.deliveryTimeMin - b.deliveryTimeMin;
          case 'minimumOrder':
            return a.minimumOrder - b.minimumOrder;
          default:
            return 0;
        }
      });
    },
    toggleRestaurantFavorite: (state, action: PayloadAction<string>) => {
      // This would typically update a user's favorites in the backend
      // For now, we'll just log the action
      console.log('Toggle favorite for restaurant:', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
      })
      .addCase(fetchRestaurantsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch restaurants';
      })
      .addCase(fetchRestaurantDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRestaurant = action.payload.restaurant || null;
        state.menuItems = action.payload.menuItems;
      })
      .addCase(fetchRestaurantDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch restaurant details';
      })
      .addCase(fetchMenuItemsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItemsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload;
      })
      .addCase(fetchMenuItemsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch menu items';
      })
      .addCase(fetchRestaurantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRestaurant = action.payload || null;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch restaurant by ID';
      })
      .addCase(fetchRestaurantMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload;
      })
      .addCase(fetchRestaurantMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch restaurant menu';
      });
  },
});

export const {
  setSelectedRestaurant,
  clearSelectedRestaurant,
  setMenuItems,
  filterRestaurantsBySearch,
  filterRestaurantsByRating,
  sortRestaurantsBy,
  toggleRestaurantFavorite,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;
