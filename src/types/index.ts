// Delivery Provider Types
export interface Provider {
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
  deepLinkUrl?: string;
}

export interface EstimateEntity {
  providerId: string;
  providerName: string;
  providerNameAr: string;
  totalPrice: number;
  etaMinutes: number;
  distanceKm: number;
  currency: string;
  priceBreakdown: Record<string, number>;
  timestamp: Date;
  isCheapest: boolean;
  isFastest: boolean;
  deepLinkUrl?: string;
}

// Restaurant Types
export interface Restaurant {
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
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  city: string;
  isActive: boolean;
  isFeatured: boolean;
}

export interface RestaurantCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

// Menu Types
export interface MenuItem {
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

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  totalPrice: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  orderNumber: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  deliveryProvider: string;
  deliveryProviderOrderId?: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

// User Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  location?: {
    lat: number;
    lng: number;
  };
  address?: string;
  city?: string;
  postalCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferredDeliveryProvider?: string;
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  notificationSettings: NotificationSettings;
  createdAt: Date;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

// State Types
export interface PricingState {
  providers: Provider[];
  estimates: EstimateEntity[];
  selectedDistance: number;
  loading: boolean;
  error: string | null;
}

export interface RestaurantState {
  restaurants: Restaurant[];
  categories: RestaurantCategory[];
  selectedRestaurant: Restaurant | null;
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  loading: boolean;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

export interface SettingsState {
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  distance: number;
  notifications: boolean;
}

export interface AppState {
  pricing: PricingState;
  restaurant: RestaurantState;
  cart: CartState;
  order: OrderState;
  settings: SettingsState;
}

// Utility Types
export interface PriceBreakdown {
  baseFee: number;
  distanceFee: number;
  surgeFee: number;
  serviceFee: number;
  totalPrice: number;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
}

export interface LanguageConfig {
  code: 'ar' | 'en';
  name: string;
  nameNative: string;
  rtl: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  labelAr: string;
  href: string;
  icon: string;
}

// Component Props Types
export interface ProviderCardProps {
  provider: Provider;
  estimate: EstimateEntity;
  isCheapest: boolean;
  isFastest: boolean;
  onOrder: (providerId: string) => void;
}

export interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
}

export interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export interface DistanceSelectorProps {
  value: number;
  onChange: (distance: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export interface HeaderProps {
  onLanguageChange: (language: 'ar' | 'en') => void;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  currentLanguage: 'ar' | 'en';
  currentTheme: 'light' | 'dark' | 'system';
}
