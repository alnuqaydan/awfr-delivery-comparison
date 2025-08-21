import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProviderCard } from '../ProviderCard';
import { EstimateEntity } from '@/types';

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the pricing utility
vi.mock('@/utils/pricing', () => ({
  formatPrice: (price: number) => `SAR ${price.toFixed(2)}`,
  formatTime: (minutes: number) => `${minutes} min`,
  getProviderById: () => ({
    id: 'mrsool',
    name: 'Mrsool',
    nameAr: 'مرسول',
    logo: '/test-logo.png',
    baseFee: 15,
    perKm: 2.5,
    surge: 0,
    etaMinutes: 45,
    supportedCities: ['Riyadh'],
    isActive: true,
    rating: 4.5,
  }),
}));

const mockEstimate: EstimateEntity = {
  providerId: 'mrsool',
  providerName: 'Mrsool',
  providerNameAr: 'مرسول',
  totalPrice: 25.5,
  etaMinutes: 45,
  distanceKm: 5,
  currency: 'SAR',
  priceBreakdown: {
    baseFee: 15,
    distanceFee: 12.5,
    surgeFee: 0,
    serviceFee: 1.375,
  },
  timestamp: new Date(),
  isCheapest: true,
  isFastest: false,
  deepLinkUrl: 'https://mrsool.app',
};

describe('ProviderCard', () => {
  it('renders provider information correctly', () => {
    render(
      <ProviderCard
        estimate={mockEstimate}
        isCheapest={true}
        isFastest={false}
        rank={1}
      />
    );

    expect(screen.getByText('Mrsool')).toBeInTheDocument();
    expect(screen.getByText('SAR 25.50')).toBeInTheDocument();
    expect(screen.getByText('45 min')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('shows cheapest badge when provider is cheapest', () => {
    render(
      <ProviderCard
        estimate={mockEstimate}
        isCheapest={true}
        isFastest={false}
        rank={1}
      />
    );

    expect(screen.getByText('cheapest')).toBeInTheDocument();
  });

  it('shows fastest badge when provider is fastest', () => {
    render(
      <ProviderCard
        estimate={mockEstimate}
        isCheapest={false}
        isFastest={true}
        rank={1}
      />
    );

    expect(screen.getByText('fastest')).toBeInTheDocument();
  });

  it('expands price breakdown when clicked', () => {
    render(
      <ProviderCard
        estimate={mockEstimate}
        isCheapest={true}
        isFastest={false}
        rank={1}
      />
    );

    const expandButton = screen.getByText('price_breakdown');
    fireEvent.click(expandButton);

    expect(screen.getByText('base_fee')).toBeInTheDocument();
    expect(screen.getByText('distance_fee')).toBeInTheDocument();
    expect(screen.getByText('surge_fee')).toBeInTheDocument();
    expect(screen.getByText('service_fee')).toBeInTheDocument();
  });

  it('opens provider link when order button is clicked', () => {
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    });

    render(
      <ProviderCard
        estimate={mockEstimate}
        isCheapest={true}
        isFastest={false}
        rank={1}
      />
    );

    const orderButton = screen.getByText('order_now');
    fireEvent.click(orderButton);

    expect(mockOpen).toHaveBeenCalledWith('https://mrsool.app', '_blank');
  });
});
