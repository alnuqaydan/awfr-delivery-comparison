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

export interface PricingState {
  providers: Provider[];
  estimates: EstimateEntity[];
  selectedDistance: number;
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
  settings: SettingsState;
}

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

export interface ProviderCardProps {
  provider: Provider;
  estimate: EstimateEntity;
  isCheapest: boolean;
  isFastest: boolean;
  onOrder: (providerId: string) => void;
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
