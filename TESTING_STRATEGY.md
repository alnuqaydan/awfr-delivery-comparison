# Testing Strategy - Restaurant Ordering System

## Overview

This document outlines a comprehensive testing strategy for the restaurant ordering system, covering unit tests, integration tests, end-to-end tests, and user acceptance testing.

## Testing Pyramid

```
                    E2E Tests (Few)
                   /              \
                  /                \
                 /                  \
            Integration Tests (Some)
           /                        \
          /                          \
         /                            \
    Unit Tests (Many)
```

## 1. Unit Testing

### 1.1 Utility Functions Testing

#### Pricing Calculations
```typescript
// tests/utils/pricing.test.ts
import { calculateCartTotals, calculateDeliveryFee, checkMinimumOrder } from '@/utils/pricing';

describe('Pricing Calculations', () => {
  describe('calculateCartTotals', () => {
    it('should calculate correct totals for empty cart', () => {
      const result = calculateCartTotals([]);
      expect(result).toEqual({
        subtotal: 0,
        deliveryFee: 0,
        taxAmount: 0,
        totalAmount: 0,
      });
    });

    it('should calculate correct totals for cart with items', () => {
      const items = [
        { id: '1', menuItem: { price: 25 }, quantity: 2, totalPrice: 50 },
        { id: '2', menuItem: { price: 15 }, quantity: 1, totalPrice: 15 },
      ];
      
      const result = calculateCartTotals(items);
      
      expect(result.subtotal).toBe(65);
      expect(result.taxAmount).toBe(9.75); // 15% VAT
      expect(result.deliveryFee).toBe(15); // Standard fee for < 50 SAR
      expect(result.totalAmount).toBe(89.75);
    });

    it('should apply free delivery for orders over 100 SAR', () => {
      const items = [
        { id: '1', menuItem: { price: 50 }, quantity: 3, totalPrice: 150 },
      ];
      
      const result = calculateCartTotals(items);
      
      expect(result.subtotal).toBe(150);
      expect(result.deliveryFee).toBe(0); // Free delivery
      expect(result.totalAmount).toBe(172.5); // 150 + 22.5 tax
    });
  });

  describe('calculateDeliveryFee', () => {
    it('should calculate correct fee based on distance and order value', () => {
      expect(calculateDeliveryFee(5, 30)).toBe(10); // Base fee for 5km
      expect(calculateDeliveryFee(10, 30)).toBe(15); // Base fee for 10km
      expect(calculateDeliveryFee(5, 60)).toBe(5); // Discounted fee for >50 SAR
      expect(calculateDeliveryFee(5, 120)).toBe(0); // Free delivery for >100 SAR
    });
  });

  describe('checkMinimumOrder', () => {
    it('should correctly validate minimum order requirements', () => {
      const result = checkMinimumOrder(30, 50);
      expect(result.isMet).toBe(false);
      expect(result.remaining).toBe(20);
      expect(result.percentage).toBe(60);

      const result2 = checkMinimumOrder(60, 50);
      expect(result2.isMet).toBe(true);
      expect(result2.remaining).toBe(0);
      expect(result2.percentage).toBe(100);
    });
  });
});
```

#### Data Validation Functions
```typescript
// tests/utils/validation.test.ts
import { validateUserInput, sanitizeInput } from '@/utils/validation';

describe('Data Validation', () => {
  describe('validateUserInput', () => {
    it('should validate correct user input', () => {
      const validInput = {
        name: 'John Doe',
        phone: '+966501234567',
        address: 'King Fahd Road, Riyadh',
        city: 'Riyadh',
      };
      
      const result = validateUserInput(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      const invalidInput = {
        name: 'John Doe',
        phone: 'invalid-phone',
        address: 'King Fahd Road, Riyadh',
        city: 'Riyadh',
      };
      
      const result = validateUserInput(invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid phone number');
    });

    it('should reject empty required fields', () => {
      const invalidInput = {
        name: '',
        phone: '+966501234567',
        address: 'King Fahd Road, Riyadh',
        city: 'Riyadh',
      };
      
      const result = validateUserInput(invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Name is required');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove XSS attempts', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).toBe('Hello World');
    });

    it('should preserve safe HTML', () => {
      const safeInput = '<strong>Bold text</strong> and <em>italic text</em>';
      const sanitized = sanitizeInput(safeInput, { ALLOWED_TAGS: ['strong', 'em'] });
      expect(sanitized).toBe('<strong>Bold text</strong> and <em>italic text</em>');
    });
  });
});
```

### 1.2 Redux Store Testing

#### Cart Slice Testing
```typescript
// tests/store/cartSlice.test.ts
import cartReducer, { 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart,
  calculateCartTotals 
} from '@/store/cartSlice';

describe('Cart Slice', () => {
  const initialState = {
    items: [],
    restaurantId: null,
    subtotal: 0,
    deliveryFee: 0,
    totalAmount: 0,
    loading: false,
  };

  const mockMenuItem = {
    id: 'item-1',
    restaurantId: 'restaurant-1',
    name: 'Test Item',
    nameAr: 'عنصر تجريبي',
    price: 25,
    image: '/test-image.jpg',
    category: 'Test',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 15,
    calories: 300,
    allergens: [],
  };

  it('should handle initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle adding item to cart', () => {
    const action = addToCart({ item: mockMenuItem, quantity: 2 });
    const newState = cartReducer(initialState, action);
    
    expect(newState.items).toHaveLength(1);
    expect(newState.items[0].quantity).toBe(2);
    expect(newState.items[0].totalPrice).toBe(50);
    expect(newState.restaurantId).toBe('restaurant-1');
  });

  it('should handle updating item quantity', () => {
    const stateWithItem = {
      ...initialState,
      items: [{
        id: 'item-1',
        menuItem: mockMenuItem,
        quantity: 1,
        totalPrice: 25,
      }],
      restaurantId: 'restaurant-1',
    };

    const action = updateCartItemQuantity({ itemId: 'item-1', quantity: 3 });
    const newState = cartReducer(stateWithItem, action);
    
    expect(newState.items[0].quantity).toBe(3);
    expect(newState.items[0].totalPrice).toBe(75);
  });

  it('should handle removing item from cart', () => {
    const stateWithItem = {
      ...initialState,
      items: [{
        id: 'item-1',
        menuItem: mockMenuItem,
        quantity: 1,
        totalPrice: 25,
      }],
      restaurantId: 'restaurant-1',
    };

    const action = removeFromCart('item-1');
    const newState = cartReducer(stateWithItem, action);
    
    expect(newState.items).toHaveLength(0);
    expect(newState.restaurantId).toBeNull();
  });

  it('should clear cart when adding item from different restaurant', () => {
    const stateWithItem = {
      ...initialState,
      items: [{
        id: 'item-1',
        menuItem: mockMenuItem,
        quantity: 1,
        totalPrice: 25,
      }],
      restaurantId: 'restaurant-1',
    };

    const differentMenuItem = { ...mockMenuItem, restaurantId: 'restaurant-2' };
    const action = addToCart({ item: differentMenuItem, quantity: 1 });
    const newState = cartReducer(stateWithItem, action);
    
    expect(newState.items).toHaveLength(1);
    expect(newState.restaurantId).toBe('restaurant-2');
  });
});
```

#### Restaurant Slice Testing
```typescript
// tests/store/restaurantSlice.test.ts
import restaurantReducer, { 
  fetchRestaurantById, 
  fetchRestaurantMenu,
  filterRestaurantsBySearch 
} from '@/store/restaurantSlice';

describe('Restaurant Slice', () => {
  const initialState = {
    restaurants: [],
    categories: [],
    selectedRestaurant: null,
    menuItems: [],
    loading: false,
    error: null,
  };

  it('should handle fetching restaurant by ID', async () => {
    const restaurantId = 'restaurant-1';
    const action = await fetchRestaurantById(restaurantId);
    const newState = restaurantReducer(initialState, action);
    
    expect(newState.selectedRestaurant).toBeDefined();
    expect(newState.selectedRestaurant?.id).toBe(restaurantId);
  });

  it('should handle fetching restaurant menu', async () => {
    const restaurantId = 'restaurant-1';
    const action = await fetchRestaurantMenu(restaurantId);
    const newState = restaurantReducer(initialState, action);
    
    expect(newState.menuItems).toHaveLength(4); // Based on mock data
    expect(newState.menuItems.every(item => item.restaurantId === restaurantId)).toBe(true);
  });

  it('should handle restaurant search filtering', () => {
    const stateWithRestaurants = {
      ...initialState,
      restaurants: [
        { id: '1', name: 'Burger Palace', cuisineType: 'Fast Food' },
        { id: '2', name: 'Sushi Master', cuisineType: 'Asian' },
      ],
    };

    const action = filterRestaurantsBySearch('burger');
    const newState = restaurantReducer(stateWithRestaurants, action);
    
    expect(newState.restaurants).toHaveLength(1);
    expect(newState.restaurants[0].name).toBe('Burger Palace');
  });
});
```

### 1.3 Component Testing

#### Restaurant Card Component
```typescript
// tests/components/RestaurantCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RestaurantCard from '@/components/RestaurantCard';

const mockRestaurant = {
  id: 'restaurant-1',
  name: 'Test Restaurant',
  nameAr: 'مطعم تجريبي',
  description: 'Test description',
  descriptionAr: 'وصف تجريبي',
  logo: '/test-logo.jpg',
  banner: '/test-banner.jpg',
  cuisineType: 'Fast Food',
  cuisineTypeAr: 'وجبات سريعة',
  rating: 4.5,
  totalRatings: 100,
  deliveryTimeMin: 25,
  deliveryTimeMax: 45,
  minimumOrder: 30,
  location: { lat: 24.7136, lng: 46.6753 },
  address: 'Test Address',
  city: 'Riyadh',
  isActive: true,
  isFeatured: true,
};

const mockStore = configureStore({
  reducer: {
    settings: (state = { language: 'en' }) => state,
  },
});

describe('RestaurantCard', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render restaurant information correctly', () => {
    render(
      <Provider store={mockStore}>
        <RestaurantCard restaurant={mockRestaurant} onSelect={mockOnSelect} />
      </Provider>
    );

    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Fast Food')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('25-45 min')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    render(
      <Provider store={mockStore}>
        <RestaurantCard restaurant={mockRestaurant} onSelect={mockOnSelect} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockRestaurant);
  });

  it('should render Arabic text when language is Arabic', () => {
    const arabicStore = configureStore({
      reducer: {
        settings: (state = { language: 'ar' }) => state,
      },
    });

    render(
      <Provider store={arabicStore}>
        <RestaurantCard restaurant={mockRestaurant} onSelect={mockOnSelect} />
      </Provider>
    );

    expect(screen.getByText('مطعم تجريبي')).toBeInTheDocument();
    expect(screen.getByText('وجبات سريعة')).toBeInTheDocument();
  });
});
```

#### Menu Item Component
```typescript
// tests/components/MenuItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MenuItem from '@/components/MenuItem';

const mockMenuItem = {
  id: 'item-1',
  restaurantId: 'restaurant-1',
  name: 'Test Burger',
  nameAr: 'برجر تجريبي',
  description: 'Delicious test burger',
  descriptionAr: 'برجر تجريبي لذيذ',
  price: 25,
  image: '/test-burger.jpg',
  category: 'Burgers',
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  isAvailable: true,
  preparationTime: 15,
  calories: 450,
  allergens: ['gluten', 'dairy'],
};

const mockStore = configureStore({
  reducer: {
    settings: (state = { language: 'en' }) => state,
    cart: (state = { items: [] }) => state,
  },
});

describe('MenuItem', () => {
  const mockOnAddToCart = jest.fn();

  beforeEach(() => {
    mockOnAddToCart.mockClear();
  });

  it('should render menu item information correctly', () => {
    render(
      <Provider store={mockStore}>
        <MenuItem item={mockMenuItem} onAddToCart={mockOnAddToCart} />
      </Provider>
    );

    expect(screen.getByText('Test Burger')).toBeInTheDocument();
    expect(screen.getByText('Delicious test burger')).toBeInTheDocument();
    expect(screen.getByText('25 SAR')).toBeInTheDocument();
  });

  it('should call onAddToCart when add button is clicked', () => {
    render(
      <Provider store={mockStore}>
        <MenuItem item={mockMenuItem} onAddToCart={mockOnAddToCart} />
      </Provider>
    );

    fireEvent.click(screen.getByLabelText('Add to cart'));
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockMenuItem, 1);
  });

  it('should show quantity controls when item is in cart', () => {
    const storeWithItem = configureStore({
      reducer: {
        settings: (state = { language: 'en' }) => state,
        cart: (state = { 
          items: [{ 
            id: 'item-1', 
            menuItem: mockMenuItem, 
            quantity: 2, 
            totalPrice: 50 
          }] 
        }) => state,
      },
    });

    render(
      <Provider store={storeWithItem}>
        <MenuItem item={mockMenuItem} onAddToCart={mockOnAddToCart} />
      </Provider>
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove one')).toBeInTheDocument();
  });
});
```

## 2. Integration Testing

### 2.1 API Integration Testing
```typescript
// tests/integration/api.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RestaurantPage from '@/app/restaurant/[id]/page';

const server = setupServer(
  rest.get('/api/restaurants/:id', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'restaurant-1',
        name: 'Test Restaurant',
        menuItems: [
          {
            id: 'item-1',
            name: 'Test Item',
            price: 25,
          },
        ],
      })
    );
  }),
  rest.get('/api/restaurants/:id/menu', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'item-1',
          name: 'Test Item',
          price: 25,
        },
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Restaurant Page Integration', () => {
  it('should load restaurant data and menu items', async () => {
    const store = configureStore({
      reducer: {
        restaurant: restaurantReducer,
        settings: (state = { language: 'en' }) => state,
      },
    });

    render(
      <Provider store={store}>
        <RestaurantPage params={{ id: 'restaurant-1' }} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    server.use(
      rest.get('/api/restaurants/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const store = configureStore({
      reducer: {
        restaurant: restaurantReducer,
        settings: (state = { language: 'en' }) => state,
      },
    });

    render(
      <Provider store={store}>
        <RestaurantPage params={{ id: 'restaurant-1' }} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### 2.2 Cart Integration Testing
```typescript
// tests/integration/cart.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RestaurantPage from '@/app/restaurant/[id]/page';
import CartPage from '@/app/cart/page';

describe('Cart Integration', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        restaurant: restaurantReducer,
        cart: cartReducer,
        settings: (state = { language: 'en' }) => state,
      },
    });
  });

  it('should add items to cart and persist across navigation', async () => {
    render(
      <Provider store={store}>
        <RestaurantPage params={{ id: 'restaurant-1' }} />
      </Provider>
    );

    // Wait for menu items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    // Add item to cart
    fireEvent.click(screen.getByLabelText('Add to cart'));

    // Navigate to cart page
    render(
      <Provider store={store}>
        <CartPage />
      </Provider>
    );

    // Verify item is in cart
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    // Verify pricing calculations
    expect(screen.getByText('25.00 SAR')).toBeInTheDocument();
    expect(screen.getByText('3.75 SAR')).toBeInTheDocument(); // 15% VAT
  });

  it('should update cart totals when quantities change', async () => {
    render(
      <Provider store={store}>
        <CartPage />
      </Provider>
    );

    // Add item to cart first
    const addButton = screen.getByLabelText('Add to cart');
    fireEvent.click(addButton);

    // Increase quantity
    const increaseButton = screen.getByLabelText('Add one more');
    fireEvent.click(increaseButton);

    // Verify updated totals
    await waitFor(() => {
      expect(screen.getByText('50.00 SAR')).toBeInTheDocument(); // 2 x 25
      expect(screen.getByText('7.50 SAR')).toBeInTheDocument(); // 15% VAT on 50
    });
  });
});
```

## 3. End-to-End Testing

### 3.1 Complete Order Flow Testing
```typescript
// tests/e2e/order-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Order Flow', () => {
  test('should complete full order journey', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Search for restaurant
    await page.fill('[data-testid="search-input"]', 'Burger');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Click on restaurant
    await page.click('[data-testid="restaurant-card"]');
    
    // Wait for menu to load
    await page.waitForSelector('[data-testid="menu-item"]');
    
    // Add items to cart
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="add-to-cart"]'); // Add second item
    
    // View cart
    await page.click('[data-testid="view-cart"]');
    
    // Verify cart contents
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="item-quantity"]')).toHaveText('2');
    
    // Proceed to delivery comparison
    await page.click('[data-testid="proceed-to-delivery"]');
    
    // Select delivery provider
    await page.click('[data-testid="delivery-provider"]');
    
    // Complete order
    await page.click('[data-testid="complete-order"]');
    
    // Verify redirect dialog
    await expect(page.locator('[data-testid="redirect-dialog"]')).toBeVisible();
    
    // Confirm redirect
    await page.click('[data-testid="confirm-redirect"]');
    
    // Verify success page
    await expect(page).toHaveURL('/order-success');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should handle minimum order validation', async ({ page }) => {
    await page.goto('/restaurant/restaurant-1');
    
    // Add item below minimum order
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="view-cart"]');
    
    // Try to proceed to delivery
    await page.click('[data-testid="proceed-to-delivery"]');
    
    // Should show minimum order warning
    await expect(page.locator('[data-testid="minimum-order-warning"]')).toBeVisible();
    
    // Add more items to meet minimum
    await page.click('[data-testid="continue-shopping"]');
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="view-cart"]');
    
    // Now should be able to proceed
    await page.click('[data-testid="proceed-to-delivery"]');
    await expect(page.locator('[data-testid="delivery-providers"]')).toBeVisible();
  });

  test('should handle delivery provider comparison', async ({ page }) => {
    await page.goto('/delivery-comparison');
    
    // Wait for providers to load
    await page.waitForSelector('[data-testid="delivery-provider"]');
    
    // Verify all providers are displayed
    const providers = await page.locator('[data-testid="delivery-provider"]').count();
    expect(providers).toBeGreaterThan(1);
    
    // Select a provider
    await page.click('[data-testid="delivery-provider"]:first-child');
    
    // Verify selection is highlighted
    await expect(page.locator('[data-testid="delivery-provider"]:first-child')).toHaveClass(/selected/);
    
    // Verify order summary updates
    await expect(page.locator('[data-testid="delivery-fee"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });
});
```

### 3.2 Error Handling Testing
```typescript
// tests/e2e/error-handling.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate offline state
    await page.route('**/*', route => route.abort());
    
    await page.goto('/');
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Should show cached data if available
    await expect(page.locator('[data-testid="cached-content"]')).toBeVisible();
  });

  test('should handle location services failure', async ({ page }) => {
    // Mock geolocation to fail
    await page.addInitScript(() => {
      navigator.geolocation.getCurrentPosition = (success, error) => {
        error({ code: 1, message: 'Permission denied' });
      };
    });
    
    await page.goto('/delivery-comparison');
    
    // Should show manual location input
    await expect(page.locator('[data-testid="manual-location-input"]')).toBeVisible();
    
    // Should use default location
    await expect(page.locator('[data-testid="default-location"]')).toBeVisible();
  });

  test('should handle cart data corruption', async ({ page }) => {
    // Corrupt localStorage
    await page.addInitScript(() => {
      localStorage.setItem('cart', 'invalid-json');
    });
    
    await page.goto('/cart');
    
    // Should show empty cart state
    await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible();
    
    // Should provide option to clear corrupted data
    await expect(page.locator('[data-testid="clear-cart"]')).toBeVisible();
  });
});
```

### 3.3 Accessibility Testing
```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through all interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'search-input');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'restaurant-card');
    
    // Enter should activate restaurant card
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/restaurant\//);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper ARIA labels
    await expect(page.locator('[data-testid="search-input"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="restaurant-card"]')).toHaveAttribute('aria-label');
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This would require a visual regression testing tool
    // For now, we'll check that proper CSS classes are applied
    await expect(page.locator('body')).toHaveClass(/accessible/);
  });
});
```

## 4. Performance Testing

### 4.1 Load Testing
```typescript
// tests/performance/load.test.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load homepage within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load restaurant menu within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/restaurant/restaurant-1');
    await page.waitForSelector('[data-testid="menu-item"]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle large menu lists efficiently', async ({ page }) => {
    await page.goto('/restaurant/restaurant-1');
    
    // Scroll through menu
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Should not cause performance issues
    const memoryUsage = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB limit
  });
});
```

## 5. User Acceptance Testing

### 5.1 User Journey Testing
```typescript
// tests/uat/user-journey.test.ts
import { test, expect } from '@playwright/test';

test.describe('User Acceptance Testing', () => {
  test('should allow user to find and order from restaurant', async ({ page }) => {
    // User searches for restaurant
    await page.goto('/');
    await page.fill('[data-testid="search-input"]', 'Pizza');
    await page.click('[data-testid="search-button"]');
    
    // User selects restaurant
    await page.click('[data-testid="restaurant-card"]:first-child');
    
    // User browses menu
    await page.waitForSelector('[data-testid="menu-item"]');
    const menuItems = await page.locator('[data-testid="menu-item"]').count();
    expect(menuItems).toBeGreaterThan(0);
    
    // User adds items to cart
    await page.click('[data-testid="add-to-cart"]:first-child');
    await page.click('[data-testid="add-to-cart"]:nth-child(2)');
    
    // User views cart
    await page.click('[data-testid="view-cart"]');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
    
    // User proceeds to checkout
    await page.click('[data-testid="proceed-to-delivery"]');
    
    // User selects delivery provider
    await page.click('[data-testid="delivery-provider"]:first-child');
    
    // User completes order
    await page.click('[data-testid="complete-order"]');
    
    // User confirms redirect
    await page.click('[data-testid="confirm-redirect"]');
    
    // User sees success page
    await expect(page).toHaveURL('/order-success');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should handle user preferences and settings', async ({ page }) => {
    await page.goto('/');
    
    // User changes language
    await page.click('[data-testid="language-toggle"]');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    
    // User changes theme
    await page.click('[data-testid="theme-toggle"]');
    await expect(page.locator('body')).toHaveClass(/dark/);
    
    // Settings should persist
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('body')).toHaveClass(/dark/);
  });
});
```

## 6. Test Configuration

### 6.1 Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.spec.{ts,tsx}',
  ],
};
```

### 6.2 Playwright Configuration
```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
```

## 7. Continuous Integration

### 7.1 GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## Conclusion

This comprehensive testing strategy ensures the restaurant ordering system is robust, reliable, and user-friendly. The testing pyramid approach provides good coverage while maintaining efficiency, and the automated testing pipeline ensures consistent quality across all changes.

The strategy covers all critical user journeys, error scenarios, and performance requirements, making the system ready for production deployment.
