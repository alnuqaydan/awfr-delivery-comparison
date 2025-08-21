import { Restaurant, MenuItem, RestaurantCategory } from '@/types';

// واجهة للبيانات القادمة من الموقع الخارجي
interface KSAExternalRestaurant {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  logo?: string;
  banner?: string;
  cuisineType: string;
  cuisineTypeAr?: string;
  rating?: number;
  totalRatings?: number;
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
  minimumOrder?: number;
  location?: {
    lat: number;
    lng: number;
  };
  address?: string;
  city?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  menuItems?: KSAExternalMenuItem[];
}

interface KSAExternalMenuItem {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  image?: string;
  category: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isAvailable?: boolean;
  preparationTime?: number;
  calories?: number;
  allergens?: string[];
}

// فئات المطاعم المحسنة بناءً على الموقع الخارجي
export const ENHANCED_RESTAURANT_CATEGORIES: RestaurantCategory[] = [
  {
    id: 'fast-food',
    name: 'Fast Food',
    nameAr: 'وجبات سريعة',
    icon: '🍔',
    color: '#FF6B6B',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'arabic',
    name: 'Arabic',
    nameAr: 'مأكولات عربية',
    icon: '🥙',
    color: '#4ECDC4',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'asian',
    name: 'Asian',
    nameAr: 'مأكولات آسيوية',
    icon: '🍜',
    color: '#45B7D1',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'italian',
    name: 'Italian',
    nameAr: 'مأكولات إيطالية',
    icon: '🍕',
    color: '#96CEB4',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'indian',
    name: 'Indian',
    nameAr: 'مأكولات هندية',
    icon: '🍛',
    color: '#FFA726',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'turkish',
    name: 'Turkish',
    nameAr: 'مأكولات تركية',
    icon: '🥘',
    color: '#8D6E63',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'seafood',
    name: 'Seafood',
    nameAr: 'مأكولات بحرية',
    icon: '🐟',
    color: '#42A5F5',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'desserts',
    name: 'Desserts',
    nameAr: 'حلويات',
    icon: '🍰',
    color: '#FFEAA7',
    sortOrder: 8,
    isActive: true,
  },
  {
    id: 'beverages',
    name: 'Beverages',
    nameAr: 'مشروبات',
    icon: '☕',
    color: '#DDA0DD',
    sortOrder: 9,
    isActive: true,
  },
  {
    id: 'coffee-shops',
    name: 'Coffee Shops',
    nameAr: 'مقاهي',
    icon: '☕',
    color: '#795548',
    sortOrder: 10,
    isActive: true,
  },
];

class KSARestaurantService {
  private baseUrl = 'https://www.ksarestaurantmenus.com/api';
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 دقائق

  // جلب جميع المطاعم من الموقع الخارجي
  async fetchAllRestaurants(): Promise<Restaurant[]> {
    try {
      const cacheKey = 'all-restaurants';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // محاكاة استدعاء API (في التطبيق الحقيقي سيتم استبدال هذا بـ API حقيقي)
      const response = await this.simulateAPICall('/restaurants');
      const restaurants = this.transformExternalRestaurants(response);
      
      this.setCache(cacheKey, restaurants);
      return restaurants;
    } catch (error) {
      console.error('خطأ في جلب المطاعم:', error);
      return [];
    }
  }

  // جلب مطعم محدد بواسطة المعرف
  async fetchRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const cacheKey = `restaurant-${id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.simulateAPICall(`/restaurants/${id}`);
      const restaurant = this.transformExternalRestaurant(response);
      
      this.setCache(cacheKey, restaurant);
      return restaurant;
    } catch (error) {
      console.error('خطأ في جلب المطعم:', error);
      return null;
    }
  }

  // جلب قائمة طعام مطعم محدد
  async fetchRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
    try {
      const cacheKey = `menu-${restaurantId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.simulateAPICall(`/restaurants/${restaurantId}/menu`);
      const menuItems = this.transformExternalMenuItems(response, restaurantId);
      
      this.setCache(cacheKey, menuItems);
      return menuItems;
    } catch (error) {
      console.error('خطأ في جلب قائمة الطعام:', error);
      return [];
    }
  }

  // البحث في المطاعم
  async searchRestaurants(query: string): Promise<Restaurant[]> {
    try {
      const cacheKey = `search-${query}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.simulateAPICall(`/restaurants/search?q=${encodeURIComponent(query)}`);
      const restaurants = this.transformExternalRestaurants(response);
      
      this.setCache(cacheKey, restaurants);
      return restaurants;
    } catch (error) {
      console.error('خطأ في البحث:', error);
      return [];
    }
  }

  // جلب المطاعم حسب الفئة
  async fetchRestaurantsByCategory(categoryId: string): Promise<Restaurant[]> {
    try {
      const cacheKey = `category-${categoryId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.simulateAPICall(`/restaurants/category/${categoryId}`);
      const restaurants = this.transformExternalRestaurants(response);
      
      this.setCache(cacheKey, restaurants);
      return restaurants;
    } catch (error) {
      console.error('خطأ في جلب المطاعم حسب الفئة:', error);
      return [];
    }
  }

  // تحويل البيانات الخارجية إلى تنسيق التطبيق
  private transformExternalRestaurants(externalData: KSAExternalRestaurant[]): Restaurant[] {
    return externalData.map(this.transformExternalRestaurant);
  }

  private transformExternalRestaurant(external: KSAExternalRestaurant): Restaurant {
    return {
      id: external.id,
      name: external.name,
      nameAr: external.nameAr || this.translateToArabic(external.name),
      description: external.description || 'مطعم مميز يقدم أطباق لذيذة',
      descriptionAr: external.descriptionAr || 'مطعم مميز يقدم أطباق لذيذة',
      logo: external.logo || '/images/restaurants/default-logo.jpg',
      banner: external.banner || '/images/restaurants/default-banner.jpg',
      cuisineType: external.cuisineType,
      cuisineTypeAr: external.cuisineTypeAr || this.translateCuisineToArabic(external.cuisineType),
      rating: external.rating || 4.0,
      totalRatings: external.totalRatings || 100,
      deliveryTimeMin: external.deliveryTimeMin || 25,
      deliveryTimeMax: external.deliveryTimeMax || 45,
      minimumOrder: external.minimumOrder || 30,
      location: external.location || { lat: 24.7136, lng: 46.6753 },
      address: external.address || 'الرياض، المملكة العربية السعودية',
      city: external.city || 'الرياض',
      isActive: external.isActive !== false,
      isFeatured: external.isFeatured || false,
    };
  }

  private transformExternalMenuItems(externalData: KSAExternalMenuItem[], restaurantId: string): MenuItem[] {
    return externalData.map((item) => this.transformExternalMenuItem(item, restaurantId));
  }

  private transformExternalMenuItem(external: KSAExternalMenuItem, restaurantId: string): MenuItem {
    return {
      id: external.id,
      restaurantId,
      name: external.name,
      nameAr: external.nameAr || this.translateToArabic(external.name),
      description: external.description || 'طبق لذيذ محضر بعناية',
      descriptionAr: external.descriptionAr || 'طبق لذيذ محضر بعناية',
      price: external.price,
      image: external.image || '/images/menu/default-item.jpg',
      category: external.category,
      isVegetarian: external.isVegetarian || false,
      isVegan: external.isVegan || false,
      isGlutenFree: external.isGlutenFree || false,
      isAvailable: external.isAvailable !== false,
      preparationTime: external.preparationTime || 15,
      calories: external.calories || 300,
      allergens: external.allergens || [],
    };
  }

  // ترجمة بسيطة للكلمات الإنجليزية إلى العربية
  private translateToArabic(englishText: string): string {
    const translations: Record<string, string> = {
      'Burger': 'برجر',
      'Pizza': 'بيتزا',
      'Shawarma': 'شاورما',
      'Sushi': 'سوشي',
      'Pasta': 'باستا',
      'Salad': 'سلطة',
      'Soup': 'حساء',
      'Rice': 'أرز',
      'Chicken': 'دجاج',
      'Beef': 'لحم بقري',
      'Fish': 'سمك',
      'Lamb': 'لحم غنم',
      'Vegetarian': 'نباتي',
      'Vegan': 'نباتي صرف',
      'Dessert': 'حلويات',
      'Drink': 'مشروب',
      'Coffee': 'قهوة',
      'Tea': 'شاي',
      'Juice': 'عصير',
      'Water': 'ماء',
    };

    let translated = englishText;
    Object.entries(translations).forEach(([eng, ar]) => {
      translated = translated.replace(new RegExp(eng, 'gi'), ar);
    });

    return translated;
  }

  // ترجمة أنواع المأكولات
  private translateCuisineToArabic(cuisineType: string): string {
    const cuisineTranslations: Record<string, string> = {
      'Fast Food': 'وجبات سريعة',
      'Arabic': 'مأكولات عربية',
      'Asian': 'مأكولات آسيوية',
      'Italian': 'مأكولات إيطالية',
      'Indian': 'مأكولات هندية',
      'Turkish': 'مأكولات تركية',
      'Seafood': 'مأكولات بحرية',
      'Desserts': 'حلويات',
      'Beverages': 'مشروبات',
      'Coffee Shops': 'مقاهي',
    };

    return cuisineTranslations[cuisineType] || cuisineType;
  }

  // محاكاة استدعاء API (سيتم استبدالها بـ API حقيقي)
  private async simulateAPICall(endpoint: string): Promise<any> {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 500));

    // بيانات تجريبية محسنة
    const mockData = this.getMockData(endpoint);
    return mockData;
  }

  // بيانات تجريبية محسنة
  private getMockData(endpoint: string): any {
    if (endpoint === '/restaurants') {
      return this.getMockRestaurants();
    } else if (endpoint.startsWith('/restaurants/') && endpoint.includes('/menu')) {
      const restaurantId = endpoint.split('/')[2];
      return this.getMockMenuItems(restaurantId);
    } else if (endpoint.startsWith('/restaurants/')) {
      const restaurantId = endpoint.split('/')[2];
      return this.getMockRestaurant(restaurantId);
    } else if (endpoint.includes('/search')) {
      return this.getMockRestaurants();
    } else if (endpoint.includes('/category/')) {
      return this.getMockRestaurants();
    }

    return [];
  }

  private getMockRestaurants(): KSAExternalRestaurant[] {
    return [
      {
        id: 'ksa-restaurant-1',
        name: 'Al Baik',
        nameAr: 'البيك',
        description: 'Famous Saudi fast food chain known for fried chicken',
        descriptionAr: 'سلسلة مطاعم سعودية شهيرة معروفة بالدجاج المقلي',
        logo: '/images/restaurants/albaik-logo.jpg',
        banner: '/images/restaurants/albaik-banner.jpg',
        cuisineType: 'Fast Food',
        cuisineTypeAr: 'وجبات سريعة',
        rating: 4.6,
        totalRatings: 5000,
        deliveryTimeMin: 20,
        deliveryTimeMax: 35,
        minimumOrder: 25,
        location: { lat: 24.7136, lng: 46.6753 },
        address: 'King Fahd Road, Riyadh',
        city: 'Riyadh',
        isActive: true,
        isFeatured: true,
      },
      {
        id: 'ksa-restaurant-2',
        name: 'Shawarma House',
        nameAr: 'بيت الشاورما',
        description: 'Authentic Arabic shawarma with traditional recipes',
        descriptionAr: 'شاورما عربية أصيلة مع وصفات تقليدية',
        logo: '/images/restaurants/shawarma-house-logo.jpg',
        banner: '/images/restaurants/shawarma-house-banner.jpg',
        cuisineType: 'Arabic',
        cuisineTypeAr: 'مأكولات عربية',
        rating: 4.3,
        totalRatings: 890,
        deliveryTimeMin: 20,
        deliveryTimeMax: 35,
        minimumOrder: 25,
        location: { lat: 24.7136, lng: 46.6753 },
        address: 'Olaya Street, Riyadh',
        city: 'Riyadh',
        isActive: true,
        isFeatured: false,
      },
      {
        id: 'ksa-restaurant-3',
        name: 'Sushi Master',
        nameAr: 'سوشي ماستر',
        description: 'Fresh sushi and Japanese cuisine prepared by expert chefs',
        descriptionAr: 'سوشي طازج ومأكولات يابانية محضرة من قبل طهاة خبراء',
        logo: '/images/restaurants/sushi-master-logo.jpg',
        banner: '/images/restaurants/sushi-master-banner.jpg',
        cuisineType: 'Asian',
        cuisineTypeAr: 'مأكولات آسيوية',
        rating: 4.7,
        totalRatings: 650,
        deliveryTimeMin: 30,
        deliveryTimeMax: 50,
        minimumOrder: 50,
        location: { lat: 24.7136, lng: 46.6753 },
        address: 'Tahlia Street, Riyadh',
        city: 'Riyadh',
        isActive: true,
        isFeatured: true,
      },
      {
        id: 'ksa-restaurant-4',
        name: 'Pizza Corner',
        nameAr: 'زاوية البيتزا',
        description: 'Italian pizza with authentic recipes and fresh toppings',
        descriptionAr: 'بيتزا إيطالية مع وصفات أصيلة وإضافات طازجة',
        logo: '/images/restaurants/pizza-corner-logo.jpg',
        banner: '/images/restaurants/pizza-corner-banner.jpg',
        cuisineType: 'Italian',
        cuisineTypeAr: 'مأكولات إيطالية',
        rating: 4.4,
        totalRatings: 1100,
        deliveryTimeMin: 35,
        deliveryTimeMax: 55,
        minimumOrder: 40,
        location: { lat: 24.7136, lng: 46.6753 },
        address: 'King Abdullah Road, Riyadh',
        city: 'Riyadh',
        isActive: true,
        isFeatured: false,
      },
      {
        id: 'ksa-restaurant-5',
        name: 'Taj Mahal',
        nameAr: 'تاج محل',
        description: 'Authentic Indian cuisine with rich flavors and spices',
        descriptionAr: 'مأكولات هندية أصيلة بنكهات غنية وتوابل',
        logo: '/images/restaurants/taj-mahal-logo.jpg',
        banner: '/images/restaurants/taj-mahal-banner.jpg',
        cuisineType: 'Indian',
        cuisineTypeAr: 'مأكولات هندية',
        rating: 4.5,
        totalRatings: 750,
        deliveryTimeMin: 30,
        deliveryTimeMax: 45,
        minimumOrder: 35,
        location: { lat: 24.7136, lng: 46.6753 },
        address: 'Prince Sultan Road, Riyadh',
        city: 'Riyadh',
        isActive: true,
        isFeatured: true,
      },
    ];
  }

  private getMockRestaurant(id: string): KSAExternalRestaurant | null {
    const restaurants = this.getMockRestaurants();
    return restaurants.find(r => r.id === id) || null;
  }

  private getMockMenuItems(restaurantId: string): KSAExternalMenuItem[] {
    const menuItems: Record<string, KSAExternalMenuItem[]> = {
      'ksa-restaurant-1': [
        {
          id: 'ksa-item-1',
          name: 'Chicken Broast',
          nameAr: 'دجاج بروست',
          description: 'Crispy fried chicken with special seasoning',
          descriptionAr: 'دجاج مقلي مقرمش مع تتبيلة خاصة',
          price: 28,
          image: '/images/menu/chicken-broast.jpg',
          category: 'Chicken',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isAvailable: true,
          preparationTime: 15,
          calories: 450,
          allergens: ['gluten', 'dairy'],
        },
        {
          id: 'ksa-item-2',
          name: 'Chicken Nuggets',
          nameAr: 'قطع دجاج',
          description: 'Bite-sized chicken pieces with crispy coating',
          descriptionAr: 'قطع دجاج صغيرة مع طلاء مقرمش',
          price: 18,
          image: '/images/menu/chicken-nuggets.jpg',
          category: 'Chicken',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isAvailable: true,
          preparationTime: 10,
          calories: 320,
          allergens: ['gluten', 'dairy'],
        },
        {
          id: 'ksa-item-3',
          name: 'French Fries',
          nameAr: 'بطاطس مقلية',
          description: 'Golden crispy fries served with ketchup',
          descriptionAr: 'بطاطس مقلية ذهبية مقرمشة مع الكاتشب',
          price: 8,
          image: '/images/menu/french-fries.jpg',
          category: 'Sides',
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          isAvailable: true,
          preparationTime: 8,
          calories: 250,
          allergens: [],
        },
      ],
      'ksa-restaurant-2': [
        {
          id: 'ksa-item-4',
          name: 'Chicken Shawarma',
          nameAr: 'شاورما دجاج',
          description: 'Marinated chicken with tahini sauce and pickles',
          descriptionAr: 'دجاج متبل مع صلصة الطحينة والمخلل',
          price: 18,
          image: '/images/menu/chicken-shawarma.jpg',
          category: 'Shawarma',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isAvailable: true,
          preparationTime: 10,
          calories: 320,
          allergens: ['gluten', 'sesame'],
        },
        {
          id: 'ksa-item-5',
          name: 'Beef Shawarma',
          nameAr: 'شاورما لحم',
          description: 'Tender beef with garlic sauce and vegetables',
          descriptionAr: 'لحم طري مع صلصة الثوم والخضروات',
          price: 22,
          image: '/images/menu/beef-shawarma.jpg',
          category: 'Shawarma',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isAvailable: true,
          preparationTime: 12,
          calories: 380,
          allergens: ['gluten', 'dairy'],
        },
      ],
      'ksa-restaurant-3': [
        {
          id: 'ksa-item-6',
          name: 'California Roll',
          nameAr: 'رول كاليفورنيا',
          description: 'Crab, avocado, and cucumber roll',
          descriptionAr: 'رول سلطعون وأفوكادو وخيار',
          price: 35,
          image: '/images/menu/california-roll.jpg',
          category: 'Sushi',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true,
          isAvailable: true,
          preparationTime: 20,
          calories: 220,
          allergens: ['fish', 'soy'],
        },
        {
          id: 'ksa-item-7',
          name: 'Salmon Nigiri',
          nameAr: 'نيجيري سلمون',
          description: 'Fresh salmon over seasoned rice',
          descriptionAr: 'سلمون طازج فوق أرز متبل',
          price: 28,
          image: '/images/menu/salmon-nigiri.jpg',
          category: 'Sushi',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true,
          isAvailable: true,
          preparationTime: 15,
          calories: 180,
          allergens: ['fish', 'soy'],
        },
      ],
    };

    return menuItems[restaurantId] || [];
  }

  // إدارة التخزين المؤقت
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // مسح التخزين المؤقت
  clearCache(): void {
    this.cache.clear();
  }
}

export const ksaRestaurantService = new KSARestaurantService();
export { ENHANCED_RESTAURANT_CATEGORIES };
