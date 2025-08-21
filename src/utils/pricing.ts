import { Provider, PriceBreakdown, EstimateEntity } from '@/types';

export const PROVIDERS: Provider[] = [
  {
    id: 'mrsool',
    name: 'Mrsool',
    nameAr: 'مرسول',
    logo: '/images/providers/mrsool.png',
    baseFee: 15,
    perKm: 2.5,
    surge: 0,
    etaMinutes: 45,
    supportedCities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
    isActive: true,
    rating: 4.5,
    deepLinkUrl: 'https://mrsool.app',
  },
  {
    id: 'jahez',
    name: 'Jahez',
    nameAr: 'جاهز',
    logo: '/images/providers/jahez.png',
    baseFee: 12,
    perKm: 2.0,
    surge: 0,
    etaMinutes: 40,
    supportedCities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
    isActive: true,
    rating: 4.3,
    deepLinkUrl: 'https://jahez.com',
  },
  {
    id: 'hungerstation',
    name: 'HungerStation',
    nameAr: 'هنقرستيشن',
    logo: '/images/providers/hungerstation.png',
    baseFee: 14,
    perKm: 2.2,
    surge: 0,
    etaMinutes: 50,
    supportedCities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
    isActive: true,
    rating: 4.4,
    deepLinkUrl: 'https://hungerstation.com',
  },
  {
    id: 'toyou',
    name: 'ToYou',
    nameAr: 'إليك',
    logo: '/images/providers/toyou.png',
    baseFee: 13,
    perKm: 2.1,
    surge: 0,
    etaMinutes: 42,
    supportedCities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
    isActive: true,
    rating: 4.2,
    deepLinkUrl: 'https://toyou.com',
  },
  {
    id: 'lugmety',
    name: 'Lugmety',
    nameAr: 'لقمتي',
    logo: '/images/providers/lugmety.png',
    baseFee: 11,
    perKm: 1.8,
    surge: 0,
    etaMinutes: 35,
    supportedCities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
    isActive: true,
    rating: 4.1,
    deepLinkUrl: 'https://lugmety.com',
  },
  {
    id: 'careem',
    name: 'Careem',
    nameAr: 'كريم',
    logo: '/images/providers/careem.png',
    baseFee: 16,
    perKm: 2.8,
    surge: 0,
    etaMinutes: 55,
    supportedCities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
    isActive: true,
    rating: 4.6,
    deepLinkUrl: 'https://careem.com',
  },
];

export function calculatePrice(provider: Provider, distance: number): PriceBreakdown {
  const baseFee = provider.baseFee;
  const distanceFee = distance * provider.perKm;
  const surgeFee = provider.surge;
  const serviceFee = (baseFee + distanceFee) * 0.05; // 5% service fee
  
  return {
    baseFee,
    distanceFee,
    surgeFee,
    serviceFee,
    totalPrice: baseFee + distanceFee + surgeFee + serviceFee,
  };
}

export function calculateEstimates(distance: number): EstimateEntity[] {
  const estimates: EstimateEntity[] = PROVIDERS.map((provider) => {
    const priceBreakdown = calculatePrice(provider, distance);
    
    return {
      providerId: provider.id,
      providerName: provider.name,
      providerNameAr: provider.nameAr,
      totalPrice: priceBreakdown.totalPrice,
      etaMinutes: provider.etaMinutes,
      distanceKm: distance,
      currency: 'SAR',
      priceBreakdown: {
        baseFee: priceBreakdown.baseFee,
        distanceFee: priceBreakdown.distanceFee,
        surgeFee: priceBreakdown.surgeFee,
        serviceFee: priceBreakdown.serviceFee,
      },
      timestamp: new Date(),
      isCheapest: false,
      isFastest: false,
      deepLinkUrl: provider.deepLinkUrl,
    };
  });

  // Find cheapest and fastest
  const cheapest = estimates.reduce((min, current) => 
    current.totalPrice < min.totalPrice ? current : min
  );
  const fastest = estimates.reduce((min, current) => 
    current.etaMinutes < min.etaMinutes ? current : min
  );

  // Mark cheapest and fastest
  estimates.forEach(estimate => {
    estimate.isCheapest = estimate.providerId === cheapest.providerId;
    estimate.isFastest = estimate.providerId === fastest.providerId;
  });

  return estimates.sort((a, b) => a.totalPrice - b.totalPrice);
}

export function formatPrice(price: number, currency: string = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function getProviderById(id: string): Provider | undefined {
  return PROVIDERS.find(provider => provider.id === id);
}

export function getActiveProviders(): Provider[] {
  return PROVIDERS.filter(provider => provider.isActive);
}
