# Restaurant Ordering System - Technical Architecture

## Overview

This document outlines the technical architecture for a complete restaurant ordering system that addresses the critical issue of menu display failures and provides a seamless user experience from restaurant selection to delivery app integration.

## System Architecture

### 1. Frontend Architecture

#### Technology Stack
- **Framework**: Next.js 14 with App Router
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Language Support**: React i18next (Arabic/English)
- **Styling**: Tailwind CSS + MUI Theme
- **Type Safety**: TypeScript

#### Component Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page with restaurant listing
│   ├── cart/              # Shopping cart management
│   ├── checkout/          # Order completion flow
│   ├── delivery-comparison/ # Delivery service comparison
│   ├── order-success/     # Order confirmation page
│   └── restaurant/[id]/   # Individual restaurant menu pages
├── components/            # Reusable UI components
├── store/                 # Redux state management
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── hooks/                 # Custom React hooks
└── data/                  # Mock data and API simulations
```

### 2. State Management Architecture

#### Redux Store Structure
```typescript
interface AppState {
  restaurant: RestaurantState;    // Restaurant and menu data
  cart: CartState;               // Shopping cart management
  pricing: PricingState;         // Delivery pricing calculations
  order: OrderState;             // Order processing
  settings: SettingsState;       // User preferences
}
```

#### Key State Slices
1. **Restaurant Slice**: Manages restaurant data, menu items, and selection
2. **Cart Slice**: Handles cart operations, pricing calculations, and persistence
3. **Pricing Slice**: Manages delivery provider comparisons and estimates
4. **Order Slice**: Handles order processing and status tracking
5. **Settings Slice**: User preferences, language, and theme settings

### 3. Data Flow Architecture

#### User Journey Flow
1. **Restaurant Discovery** → Restaurant listing with search/filter
2. **Menu Browsing** → Menu display with categories and search
3. **Cart Management** → Add/remove items with real-time pricing
4. **Delivery Selection** → Compare delivery providers and costs
5. **Order Completion** → Checkout flow with delivery app redirect

#### Data Flow Patterns
- **Unidirectional Data Flow**: Redux → Components → User Actions → Redux
- **Persistent State**: Cart and user preferences stored in localStorage
- **Real-time Updates**: Pricing calculations update automatically
- **Error Handling**: Comprehensive error boundaries and fallbacks

## Core Features Implementation

### 1. Restaurant Selection Interface

#### Implementation Details
```typescript
// Restaurant listing with search and filtering
const RestaurantGrid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'minimumOrder'>('rating');
  
  // Real-time filtering and sorting
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisineType.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'deliveryTime': return a.deliveryTimeMin - b.deliveryTimeMin;
        case 'minimumOrder': return a.minimumOrder - b.minimumOrder;
        default: return 0;
      }
    });
  }, [restaurants, searchTerm, sortBy]);
};
```

#### Key Features
- **Responsive Grid Layout**: Adapts to different screen sizes
- **Search Functionality**: Real-time search across restaurant names and cuisines
- **Category Filtering**: Filter by cuisine type
- **Sorting Options**: Sort by rating, delivery time, or minimum order
- **Accessibility**: ARIA labels and keyboard navigation support

### 2. Menu Display System

#### Implementation Details
```typescript
// Menu display with categories and search
const RestaurantMenu = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  
  // Dynamic category generation
  useEffect(() => {
    if (menuItems.length > 0) {
      const categories = Array.from(new Set(menuItems.map(item => item.category)));
      setMenuCategories(categories);
    }
  }, [menuItems]);
  
  // Search functionality
  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return menuItems;
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menuItems, searchTerm]);
};
```

#### Key Features
- **Category-based Organization**: Items organized by logical categories
- **Search and Filter**: Real-time search across menu items
- **Responsive Design**: Mobile-optimized menu display
- **Quantity Management**: Add/remove items with quantity controls
- **Special Instructions**: Support for custom order notes

### 3. Shopping Cart and Ordering

#### Implementation Details
```typescript
// Enhanced cart management with pricing calculations
const CartManager = () => {
  const cartItems = useAppSelector(selectCartItems);
  const cartTotals = calculateCartTotals(cartItems);
  
  // Real-time pricing calculations
  const pricing = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);
    const taxAmount = subtotal * 0.15; // 15% VAT
    const deliveryFee = calculateDeliveryFee(distance, subtotal);
    const totalAmount = subtotal + taxAmount + deliveryFee;
    
    return { subtotal, taxAmount, deliveryFee, totalAmount };
  }, [cartItems, distance]);
};
```

#### Key Features
- **Persistent Cart**: Cart data persists across page navigation
- **Real-time Pricing**: Automatic calculation of subtotal, tax, and delivery fees
- **Quantity Management**: Add/remove items with quantity controls
- **Restaurant Validation**: Ensures items from same restaurant
- **Minimum Order Checking**: Validates against restaurant minimums

### 4. Pricing and Checkout System

#### Implementation Details
```typescript
// Comprehensive pricing calculation system
export const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((total, item) => total + item.totalPrice, 0);
  
  // Dynamic delivery fee calculation
  let deliveryFee = 0;
  if (subtotal > 0) {
    if (subtotal >= 100) {
      deliveryFee = 0; // Free delivery for orders over 100 SAR
    } else if (subtotal >= 50) {
      deliveryFee = 5; // Reduced delivery fee
    } else {
      deliveryFee = 15; // Standard delivery fee
    }
  }
  
  // VAT calculation (15% in Saudi Arabia)
  const taxAmount = subtotal * 0.15;
  const totalAmount = subtotal + deliveryFee + taxAmount;
  
  return { subtotal, deliveryFee, taxAmount, totalAmount };
};
```

#### Key Features
- **Dynamic Pricing**: Real-time calculation based on order value
- **Tax Integration**: Automatic 15% VAT calculation
- **Delivery Fee Logic**: Tiered pricing based on order value
- **Price Breakdown**: Detailed itemized pricing display
- **Currency Support**: SAR (Saudi Riyal) with proper formatting

### 5. Delivery Integration

#### Implementation Details
```typescript
// Delivery provider comparison and selection
const DeliveryComparison = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [estimates, setEstimates] = useState<EstimateEntity[]>([]);
  
  // Calculate delivery estimates
  useEffect(() => {
    if (userLocation && restaurantLocation) {
      const distance = calculateDistance(userLocation, restaurantLocation);
      const estimates = PROVIDERS.map(provider => ({
        providerId: provider.id,
        providerName: provider.name,
        totalPrice: calculateProviderPrice(provider, distance),
        etaMinutes: calculateETA(provider, distance),
        distanceKm: distance,
        isCheapest: false,
        isFastest: false,
      }));
      
      // Mark cheapest and fastest
      const cheapest = estimates.reduce((min, current) => 
        current.totalPrice < min.totalPrice ? current : min
      );
      const fastest = estimates.reduce((min, current) => 
        current.etaMinutes < min.etaMinutes ? current : min
      );
      
      estimates.forEach(estimate => {
        estimate.isCheapest = estimate.providerId === cheapest.providerId;
        estimate.isFastest = estimate.providerId === fastest.providerId;
      });
      
      setEstimates(estimates);
    }
  }, [userLocation, restaurantLocation]);
};
```

#### Key Features
- **Multi-Provider Support**: Integration with major delivery platforms
- **Real-time Comparison**: Side-by-side comparison of costs and times
- **Location-based Pricing**: Distance-based delivery fee calculation
- **Provider Selection**: User choice of delivery service
- **Deep Link Integration**: Direct redirect to delivery apps

## API Integration Patterns

### 1. Mock Data Structure
```typescript
// Restaurant data structure
interface Restaurant {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  logo: string;
  banner: string;
  cuisineType: string;
  cuisineTypeAr: string;
  rating: number;
  totalRatings: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  minimumOrder: number;
  location: { lat: number; lng: number };
  address: string;
  city: string;
  isActive: boolean;
  isFeatured: boolean;
}

// Menu item structure
interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  category: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isAvailable: boolean;
  preparationTime: number;
  calories: number;
  allergens: string[];
}
```

### 2. Delivery Provider Integration
```typescript
// Delivery provider configuration
interface Provider {
  id: string;
  name: string;
  nameAr: string;
  logo: string;
  baseFee: number;
  perKm: number;
  surge: number;
  etaMinutes: number;
  supportedCities: string[];
  isActive: boolean;
  rating: number;
  deepLinkUrl: string;
}

// Supported providers
const PROVIDERS: Provider[] = [
  {
    id: 'mrsool',
    name: 'Mrsool',
    nameAr: 'مرسول',
    baseFee: 15,
    perKm: 2.5,
    deepLinkUrl: 'https://mrsool.app',
  },
  {
    id: 'jahez',
    name: 'Jahez',
    nameAr: 'جاهز',
    baseFee: 12,
    perKm: 2.0,
    deepLinkUrl: 'https://jahez.com',
  },
  // ... more providers
];
```

## Error Handling and Edge Cases

### 1. Error Handling Strategy
```typescript
// Comprehensive error handling
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: Error) => {
      setHasError(true);
      setError(error);
      // Log error to monitoring service
      console.error('Application error:', error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <ErrorFallback error={error} />;
  }

  return children;
};
```

### 2. Loading States
```typescript
// Loading state management
const LoadingStates = {
  RESTAURANT_LOADING: 'restaurant_loading',
  MENU_LOADING: 'menu_loading',
  CART_LOADING: 'cart_loading',
  DELIVERY_LOADING: 'delivery_loading',
  ORDER_LOADING: 'order_loading',
};

// Skeleton components for better UX
const MenuItemSkeleton = () => (
  <Card>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="30%" />
    </CardContent>
  </Card>
);
```

### 3. Edge Case Handling
- **Empty Cart**: Graceful handling of empty cart states
- **Network Failures**: Offline support and retry mechanisms
- **Invalid Data**: Data validation and fallback values
- **Location Services**: Fallback to default location
- **Browser Compatibility**: Cross-browser testing and polyfills

## Performance Optimization

### 1. Code Splitting
```typescript
// Dynamic imports for better performance
const RestaurantPage = dynamic(() => import('./RestaurantPage'), {
  loading: () => <RestaurantPageSkeleton />,
  ssr: false,
});

const CheckoutPage = dynamic(() => import('./CheckoutPage'), {
  loading: () => <CheckoutPageSkeleton />,
  ssr: false,
});
```

### 2. Memoization
```typescript
// Optimized calculations with useMemo
const filteredRestaurants = useMemo(() => {
  return restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [restaurants, searchTerm]);

const cartTotals = useMemo(() => {
  return calculateCartTotals(cartItems);
}, [cartItems]);
```

### 3. Image Optimization
```typescript
// Next.js Image optimization
import Image from 'next/image';

const OptimizedImage = ({ src, alt, ...props }) => (
  <Image
    src={src}
    alt={alt}
    width={400}
    height={300}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,..."
    {...props}
  />
);
```

## Testing Strategy

### 1. Unit Testing
```typescript
// Jest tests for utility functions
describe('calculateCartTotals', () => {
  it('should calculate correct totals for cart items', () => {
    const items = [
      { id: '1', menuItem: { price: 25 }, quantity: 2, totalPrice: 50 },
      { id: '2', menuItem: { price: 15 }, quantity: 1, totalPrice: 15 },
    ];
    
    const result = calculateCartTotals(items);
    
    expect(result.subtotal).toBe(65);
    expect(result.taxAmount).toBe(9.75);
    expect(result.deliveryFee).toBe(15);
    expect(result.totalAmount).toBe(89.75);
  });
});
```

### 2. Integration Testing
```typescript
// Playwright E2E tests
test('complete order flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="restaurant-card"]');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="view-cart"]');
  await page.click('[data-testid="proceed-to-delivery"]');
  await page.click('[data-testid="select-provider"]');
  await page.click('[data-testid="complete-order"]');
  
  await expect(page).toHaveURL('/order-success');
});
```

### 3. User Journey Testing
- **Restaurant Selection**: Test search, filtering, and navigation
- **Menu Browsing**: Test category navigation and item selection
- **Cart Management**: Test add/remove items and pricing updates
- **Delivery Selection**: Test provider comparison and selection
- **Order Completion**: Test checkout flow and delivery app redirect

## Security Considerations

### 1. Data Validation
```typescript
// Input validation
const validateUserInput = (input: any) => {
  const schema = z.object({
    name: z.string().min(2).max(50),
    phone: z.string().regex(/^[0-9+\-\s()]+$/),
    address: z.string().min(10).max(200),
    city: z.enum(['Riyadh', 'Jeddah', 'Dammam']),
  });
  
  return schema.parse(input);
};
```

### 2. XSS Prevention
```typescript
// Sanitize user inputs
const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};
```

### 3. CSRF Protection
```typescript
// CSRF token implementation
const csrfToken = getCsrfToken();
const headers = {
  'Content-Type': 'application/json',
  'X-CSRF-Token': csrfToken,
};
```

## Deployment and Monitoring

### 1. Build Configuration
```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  },
};
```

### 2. Environment Configuration
```bash
# Environment variables
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### 3. Monitoring Setup
```typescript
// Error monitoring
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

## Conclusion

This technical architecture provides a robust foundation for a complete restaurant ordering system that addresses the critical menu display issues and delivers a seamless user experience. The system is designed to be scalable, maintainable, and user-friendly while providing comprehensive error handling and performance optimization.

The implementation follows modern web development best practices and is ready for production deployment with proper monitoring and testing strategies in place.
