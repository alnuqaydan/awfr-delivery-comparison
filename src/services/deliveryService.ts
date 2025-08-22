import { DeliveryOption, LocationData } from '@/types';

export interface PricingRequest {
  restaurantId: string;
  itemId?: string;
  itemPrice: number;
  userLocation: LocationData;
  restaurantLocation: LocationData;
}

export interface AvailabilityRequest {
  providerId: string;
  restaurantId: string;
  userLocation: LocationData;
}

// محاكاة API calls للحصول على أسعار التوصيل في الوقت الفعلي
export class DeliveryService {
  private static instance: DeliveryService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): DeliveryService {
    if (!DeliveryService.instance) {
      DeliveryService.instance = new DeliveryService();
    }
    return DeliveryService.instance;
  }

  // التحقق من الكاش
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  // حفظ البيانات في الكاش
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // حساب المسافة بين نقطتين
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  // محاكاة عامل الازدحام المروري
  private getTrafficFactor(): number {
    const hour = new Date().getHours();
    // أوقات الذروة: 7-9 صباحاً، 12-2 ظهراً، 6-8 مساءً
    if ((hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20)) {
      return 1.3 + Math.random() * 0.4; // 1.3 - 1.7
    } else if (hour >= 10 && hour <= 11) {
      return 1.1 + Math.random() * 0.2; // 1.1 - 1.3
    } else {
      return 0.9 + Math.random() * 0.2; // 0.9 - 1.1
    }
  }

  // محاكاة عامل الطلب
  private getDemandFactor(): number {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    let baseFactor = 1.0;
    
    // عوامل اليوم
    if (dayOfWeek === 5 || dayOfWeek === 6) { // الجمعة والسبت
      baseFactor *= 1.2;
    }
    
    // عوامل الوقت
    if (hour >= 19 && hour <= 22) { // أوقات العشاء
      baseFactor *= 1.3;
    } else if (hour >= 12 && hour <= 14) { // أوقات الغداء
      baseFactor *= 1.15;
    }
    
    return baseFactor + (Math.random() * 0.2 - 0.1); // إضافة تغير عشوائي
  }

  // جلب أسعار التوصيل من جميع الشركات
  async fetchDeliveryOptions(request: PricingRequest): Promise<DeliveryOption[]> {
    const cacheKey = `pricing_${request.restaurantId}_${request.userLocation.lat}_${request.userLocation.lng}`;
    
    // التحقق من الكاش
    const cachedOptions = this.getCachedData<DeliveryOption[]>(cacheKey);
    if (cachedOptions) {
      return cachedOptions;
    }

    // محاكاة API call
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const distance = this.calculateDistance(
      request.userLocation.lat,
      request.userLocation.lng,
      request.restaurantLocation.lat,
      request.restaurantLocation.lng
    );

    const trafficFactor = this.getTrafficFactor();
    const demandFactor = this.getDemandFactor();

    const providers = [
      {
        id: 'talabat',
        name: 'Talabat',
        nameAr: 'طلبات',
        logo: '/images/providers/talabat-logo.png',
        primaryColor: '#FF6B35',
        baseDeliveryFee: 6.0,
        perKmRate: 1.5,
        serviceFeeRate: 0.08,
        minServiceFee: 3.0,
        maxServiceFee: 8.0,
        smallOrderThreshold: 35,
        smallOrderFee: 5.0,
        reliability: 89,
        averageRating: 4.3,
        totalReviews: 12540,
      },
      {
        id: 'hungerstation',
        name: 'HungerStation',
        nameAr: 'هنقرستيشن',
        logo: '/images/providers/hungerstation-logo.png',
        primaryColor: '#E85D04',
        baseDeliveryFee: 5.5,
        perKmRate: 1.8,
        serviceFeeRate: 0.09,
        minServiceFee: 4.0,
        maxServiceFee: 7.0,
        smallOrderThreshold: 40,
        smallOrderFee: 4.0,
        reliability: 85,
        averageRating: 4.1,
        totalReviews: 8920,
      },
      {
        id: 'jahez',
        name: 'Jahez',
        nameAr: 'جاهز',
        logo: '/images/providers/jahez-logo.png',
        primaryColor: '#1976D2',
        baseDeliveryFee: 4.0,
        perKmRate: 1.2,
        serviceFeeRate: 0.06,
        minServiceFee: 2.5,
        maxServiceFee: 6.0,
        smallOrderThreshold: 30,
        smallOrderFee: 3.0,
        reliability: 92,
        averageRating: 4.5,
        totalReviews: 15630,
      },
      {
        id: 'noon',
        name: 'Noon Food',
        nameAr: 'نون فود',
        logo: '/images/providers/noon-logo.png',
        primaryColor: '#1B4B73',
        baseDeliveryFee: 7.0,
        perKmRate: 1.3,
        serviceFeeRate: 0.07,
        minServiceFee: 3.0,
        maxServiceFee: 9.0,
        smallOrderThreshold: 45,
        smallOrderFee: 6.0,
        reliability: 78,
        averageRating: 4.0,
        totalReviews: 5420,
      },
    ];

    const options: DeliveryOption[] = providers.map(provider => {
      // حساب رسوم التوصيل
      const deliveryFee = provider.baseDeliveryFee + (distance * provider.perKmRate * trafficFactor);
      
      // حساب رسوم الخدمة
      const serviceFee = Math.min(
        Math.max(request.itemPrice * provider.serviceFeeRate, provider.minServiceFee),
        provider.maxServiceFee
      ) * demandFactor;

      // رسوم الطلب الصغير
      const smallOrderFee = request.itemPrice < provider.smallOrderThreshold ? provider.smallOrderFee : 0;
      
      // رسوم المعالجة (عشوائية لبعض الشركات)
      const processingFee = Math.random() > 0.7 ? 1.5 + Math.random() * 1.0 : 0;
      
      // الضريبة (15%)
      const taxAmount = (request.itemPrice + deliveryFee + serviceFee + smallOrderFee + processingFee) * 0.15;
      
      // التكلفة الإجمالية
      const totalCost = request.itemPrice + deliveryFee + serviceFee + smallOrderFee + processingFee + taxAmount;

      // حساب وقت التوصيل
      const baseTime = 20 + (distance * 3); // 3 دقائق لكل كيلومتر
      const estimatedMin = Math.round(baseTime * trafficFactor);
      const estimatedMax = Math.round(estimatedMin * 1.4);

      // تحديد التوفر
      const isAvailable = distance <= 15 && Math.random() > 0.1; // 90% احتمال التوفر ضمن 15 كم
      
      return {
        id: provider.id,
        companyName: provider.name,
        companyNameAr: provider.nameAr,
        branding: {
          logo: provider.logo,
          primaryColor: provider.primaryColor,
          accentColor: `${provider.primaryColor}20`,
        },
        pricing: {
          baseMealPrice: request.itemPrice,
          deliveryFee: Math.round(deliveryFee * 100) / 100,
          serviceFee: Math.round(serviceFee * 100) / 100,
          smallOrderFee: Math.round(smallOrderFee * 100) / 100,
          processingFee: Math.round(processingFee * 100) / 100,
          taxAmount: Math.round(taxAmount * 100) / 100,
          totalCost: Math.round(totalCost * 100) / 100,
        },
        timing: {
          estimatedMin,
          estimatedMax,
          currentTrafficFactor: Math.round(trafficFactor * 100) / 100,
        },
        availability: {
          isAvailable,
          reason: !isAvailable ? 'Service temporarily unavailable in your area' : undefined,
        },
        rating: {
          score: provider.averageRating,
          totalReviews: provider.totalReviews,
          reliability: provider.reliability,
        },
        features: {
          liveTracking: true,
          contactlessDelivery: true,
          scheduledDelivery: provider.id !== 'hungerstation',
          groupOrdering: provider.id === 'hungerstation' || provider.id === 'jahez',
        },
        orderUrl: `https://${provider.id}.com/order/${request.restaurantId}`,
        promoCode: Math.random() > 0.6 ? this.generatePromoCode() : undefined,
        badges: [],
      };
    }).filter(option => option.availability.isAvailable);

    // إضافة الأوسمة
    if (options.length > 0) {
      // الأرخص
      const cheapest = options.reduce((prev, current) => 
        prev.pricing.totalCost < current.pricing.totalCost ? prev : current
      );
      cheapest.badges!.push('cheapest');

      // الأسرع
      const fastest = options.reduce((prev, current) => 
        prev.timing.estimatedMin < current.timing.estimatedMin ? prev : current
      );
      fastest.badges!.push('fastest');

      // الأعلى تقييماً
      const bestRated = options.reduce((prev, current) => 
        prev.rating.score > current.rating.score ? prev : current
      );
      bestRated.badges!.push('best-rated');

      // مُوصى به (أفضل توازن بين السعر والوقت والتقييم)
      const recommended = options.reduce((prev, current) => {
        const prevScore = (prev.rating.score * 0.3) + ((100 - prev.timing.estimatedMin) * 0.3) + ((100 - prev.pricing.totalCost) * 0.4);
        const currentScore = (current.rating.score * 0.3) + ((100 - current.timing.estimatedMin) * 0.3) + ((100 - current.pricing.totalCost) * 0.4);
        return prevScore > currentScore ? prev : current;
      });
      if (!recommended.badges!.includes('cheapest') && !recommended.badges!.includes('fastest')) {
        recommended.badges!.push('recommended');
      }
    }

    // حفظ في الكاش
    this.setCachedData(cacheKey, options);

    return options;
  }

  // توليد كود خصم عشوائي
  private generatePromoCode(): string {
    const codes = ['SAVE15', 'FAST20', 'NEWUSER', 'WEEKEND10', 'DELIVERY5'];
    return codes[Math.floor(Math.random() * codes.length)];
  }

  // التحقق من توفر الخدمة لشركة معينة
  async checkAvailability(request: AvailabilityRequest): Promise<boolean> {
    // محاكاة API call
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
    
    const distance = this.calculateDistance(
      request.userLocation.lat,
      request.userLocation.lng,
      24.7136, // إحداثيات افتراضية للمطعم
      46.6753
    );

    // قواعد التوفر
    return distance <= 15 && Math.random() > 0.05; // 95% احتمال التوفر ضمن 15 كم
  }

  // تحديث الأسعار في الوقت الفعلي
  async updateRealTimePricing(options: DeliveryOption[]): Promise<DeliveryOption[]> {
    const trafficFactor = this.getTrafficFactor();
    const demandFactor = this.getDemandFactor();

    return options.map(option => ({
      ...option,
      timing: {
        ...option.timing,
        estimatedMin: Math.round(option.timing.estimatedMin * trafficFactor),
        estimatedMax: Math.round(option.timing.estimatedMax * trafficFactor),
        currentTrafficFactor: Math.round(trafficFactor * 100) / 100,
      },
      pricing: {
        ...option.pricing,
        deliveryFee: Math.round(option.pricing.deliveryFee * demandFactor * 100) / 100,
        totalCost: Math.round((option.pricing.totalCost + (option.pricing.deliveryFee * (demandFactor - 1))) * 100) / 100,
      }
    }));
  }

  // مسح الكاش
  clearCache(): void {
    this.cache.clear();
  }

  // إحصائيات الكاش
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

export const deliveryService = DeliveryService.getInstance();
