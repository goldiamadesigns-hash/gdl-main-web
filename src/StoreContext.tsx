/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, Customer, Review, OrderStatus, OrderProduct, NavigationItem, HeroBanner, CustomPage } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS } from './data';

export const DEFAULT_NAVIGATION_MENU: NavigationItem[] = [
  { id: '1', label: 'HOME', href: '#home', isMegaMenu: false },
  { id: '2', label: 'ABOUT US', href: '#about', isMegaMenu: false },
  {
    id: '3',
    label: 'GOLD',
    href: '#gold',
    isMegaMenu: true,
    megaMenu: {
      bannerTitle: 'LEADING WITH TRANSPARENCY IN THE GLOBAL GOLD INDUSTRY.',
      links: [
        { label: 'Cast Gold Bars', href: '#cast' },
        { label: 'Minted Gold Bars', href: '#minted-bars' },
        { label: 'Minted Gold Coins', href: '#minted-coins' },
        { label: 'Gold Investment', href: '#gold-investment' },
        { label: 'Gold Supply Chain', href: '#gold-supply' }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&h=300&q=80',
      imageTitle: 'PUREST STANDARDS, FINEST GOLD'
    }
  },
  {
    id: '4',
    label: 'SILVER',
    href: '#silver',
    isMegaMenu: true,
    megaMenu: {
      bannerTitle: 'HIGHLY LIQUID PRECIOUS METALS FOR MODERN PORTFOLIOS.',
      links: [
        { label: 'Cast Silver Bars', href: '#cast-silver' },
        { label: 'Minted Silver Coins', href: '#minted-silver' },
        { label: 'Silver Grain', href: '#silver-grain' },
        { label: 'Industrial Silver', href: '#industrial' }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1605557202138-097824c3f9f4?auto=format&fit=crop&w=400&h=300&q=80',
      imageTitle: '99.9% FINE SILVER SPECIFICATIONS'
    }
  },
  {
    id: '5',
    label: 'DIAMONDS',
    href: '#diamonds',
    isMegaMenu: true,
    megaMenu: {
      bannerTitle: 'ETHICALLY SOURCED, CONFLICT-FREE EXCEPTIONAL DIAMONDS.',
      links: [
        { label: 'Rough Diamonds', href: '#rough' },
        { label: 'Polished Brilliants', href: '#polished' },
        { label: 'Custom Cuts', href: '#custom-cuts' },
        { label: 'Certified Solitaires', href: '#certified' }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&h=300&q=80',
      imageTitle: 'AUTHENTICATED GIA HIGHEST GRADES'
    }
  },
  {
    id: '6',
    label: 'HIGH-END JEWELLERY',
    href: '#jewellery',
    isMegaMenu: true,
    megaMenu: {
      bannerTitle: 'METICULOUSLY CRAFTED BESPOKE COUTURE PIECES.',
      links: [
        { label: 'Diamond Necklaces', href: '#necklaces' },
        { label: 'Bridal Rings', href: '#bridal' },
        { label: 'Gold Cuffs', href: '#cuffs' },
        { label: 'High Jewelry Collections', href: '#collections' }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&h=300&q=80',
      imageTitle: 'CRAFTSMANSHIP BEYOND TIMELESS'
    }
  },
  { id: '7', label: 'DIAMOND MANUFACTURING', href: '#manufacturing', isMegaMenu: false },
  { id: '8', label: 'CONTACT US', href: '#contact', isMegaMenu: false }
];

interface StoreContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  cart: { product: Product; quantity: number }[];
  isAdminLoggedIn: boolean;
  headerStyle: 'minimal' | 'goldiama';
  setHeaderStyle: (style: 'minimal' | 'goldiama') => void;
  navigationMenu: NavigationItem[];
  setNavigationMenu: (menu: NavigationItem[]) => void;
  navPresetStyle: string;
  setNavPresetStyle: (val: string) => void;
  navFontSize: string;
  setNavFontSize: (val: string) => void;
  navFontFamily: string;
  setNavFontFamily: (val: string) => void;
  navFontWeight: string;
  setNavFontWeight: (val: string) => void;
  navFontCase: string;
  setNavFontCase: (val: string) => void;
  navLineGap: string;
  setNavLineGap: (val: string) => void;
  navBlockSpacing: string;
  setNavBlockSpacing: (val: string) => void;
  navColorStyle: string;
  setNavColorStyle: (val: string) => void;
  navShowDividers: boolean;
  setNavShowDividers: (val: boolean) => void;
  navStretchMenu: boolean;
  setNavStretchMenu: (val: boolean) => void;
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (details: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    paymentMethod: string;
  }) => Order;
  addReview: (
    productId: string,
    review: { author: string; rating: number; title: string; comment: string; recommended: boolean }
  ) => void;
  updateStock: (productId: string, newStock: number) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addProduct: (product: Omit<Product, 'reviews' | 'reviewsCount' | 'rating'>) => void;
  editProduct: (productId: string, updated: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  loginAdmin: (username: string, pass: string) => boolean;
  logoutAdmin: () => void;

  heroBannerShow: boolean;
  setHeroBannerShow: (val: boolean) => void;
  heroBannerTitle: string;
  setHeroBannerTitle: (val: string) => void;
  heroBannerSubtitle: string;
  setHeroBannerSubtitle: (val: string) => void;
  heroBannerBgUrl: string;
  setHeroBannerBgUrl: (val: string) => void;
  heroBannerOverlay: number;
  setHeroBannerOverlay: (val: number) => void;
  heroBannerHeight: string;
  setHeroBannerHeight: (val: string) => void;
  heroBannerCtaText: string;
  setHeroBannerCtaText: (val: string) => void;
  heroBannerCtaLink: string;
  setHeroBannerCtaLink: (val: string) => void;
  heroBannerLayoutMode: string;
  setHeroBannerLayoutMode: (val: string) => void;
  heroBannerDimDesktop: string;
  setHeroBannerDimDesktop: (val: string) => void;
  heroBannerDimTablet: string;
  setHeroBannerDimTablet: (val: string) => void;
  heroBannerDimMobile: string;
  setHeroBannerDimMobile: (val: string) => void;

  pageBannerShow: boolean;
  setPageBannerShow: (val: boolean) => void;
  pageBannerBgUrl: string;
  setPageBannerBgUrl: (val: string) => void;
  pageBannerHeight: string;
  setPageBannerHeight: (val: string) => void;
  pageBannerAlign: string;
  setPageBannerAlign: (val: string) => void;
  pageBannerDimDesktop: string;
  setPageBannerDimDesktop: (val: string) => void;
  pageBannerDimTablet: string;
  setPageBannerDimTablet: (val: string) => void;
  pageBannerDimMobile: string;
  setPageBannerDimMobile: (val: string) => void;

  pageTitleBarEnable: boolean;
  setPageTitleBarEnable: (val: boolean) => void;
  pageTitleBarBg: string;
  setPageTitleBarBg: (val: string) => void;
  pageTitleBarBorder: string;
  setPageTitleBarBorder: (val: string) => void;
  pageTitleBarFontSize: string;
  setPageTitleBarFontSize: (val: string) => void;

  layoutContentWidth: string;
  setLayoutContentWidth: (val: string) => void;
  layoutBorderRadius: string;
  setLayoutBorderRadius: (val: string) => void;
  layoutShowBreadcrumbs: boolean;
  setLayoutShowBreadcrumbs: (val: boolean) => void;

  heroBanners: HeroBanner[];
  addHeroBanner: (banner: Omit<HeroBanner, 'id'>) => void;
  editHeroBanner: (bannerId: string, updated: Partial<HeroBanner>) => void;
  deleteHeroBanner: (bannerId: string) => void;

  pagesList: CustomPage[];
  updatePagesList: (newList: CustomPage[]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'hb1',
    title: 'INDUSTRIAL & PRECIOUS FINE SILVER',
    subtitle: 'Diversify your portfolio with premium silver bars and coins, offering high liquidity and historically proven growth potential.',
    desktopImage: 'https://images.unsplash.com/photo-1610375228911-c4ab82525289?auto=format&fit=crop&w=1600&q=80',
    tabletImage: 'https://images.unsplash.com/photo-1605557202138-097824c3f9f4?auto=format&fit=crop&w=1024&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=640&q=80',
    overlayOpacity: 0.4,
    ctaText: 'SHOP SILVER',
    ctaLink: '#silver',
    heightPreset: 'medium',
    assignedPageSlug: '/',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'hb2',
    title: 'SOVEREIGN PURE CAST GOLD',
    subtitle: 'Meticulously crafted gold bullion products minted with 99.99% certified purity standards, offering absolute confidence.',
    desktopImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80',
    tabletImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1024&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=640&q=80',
    overlayOpacity: 0.3,
    ctaText: 'EXPLORE GOLD',
    ctaLink: '#gold',
    heightPreset: 'medium',
    assignedPageSlug: '/',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'hb3',
    title: 'CURATED LUXURY DISPATCH',
    subtitle: 'Explore our certified safe custody vault products and boutique precious jewelry allocations, verified by the Goldiama standards.',
    desktopImage: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=1600&q=80',
    tabletImage: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=1024&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=640&q=80',
    overlayOpacity: 0.5,
    ctaText: 'EXPLORE COLLECTIONS',
    ctaLink: '/shop',
    heightPreset: 'small',
    assignedPageSlug: '/shop',
    sortOrder: 1,
    isActive: true
  }
];

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  schema?: string;
}

let serverSupabaseConfig: SupabaseConfig | null = null;

const getSupabaseConfig = (): SupabaseConfig | null => {
  const url = localStorage.getItem('min_eco_supabase_url') || serverSupabaseConfig?.url;
  const anonKey = localStorage.getItem('min_eco_supabase_anon_key') || serverSupabaseConfig?.anonKey;
  const serviceRoleKey = localStorage.getItem('min_eco_supabase_service_role_key') || serverSupabaseConfig?.serviceRoleKey;
  const schema = localStorage.getItem('min_eco_supabase_database_schema') || serverSupabaseConfig?.schema || 'public';
  if (!url || !anonKey) return null;
  return { url, anonKey, serviceRoleKey, schema };
};

const writeStateToSupabase = async (key: string, data: any) => {
  const config = getSupabaseConfig();
  if (!config) return;

  const keyToUse = config.serviceRoleKey || config.anonKey;
  const endpoint = `${config.url.trim().replace(/\/$/, "")}/rest/v1/goldiama_store`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': keyToUse,
        'Authorization': `Bearer ${keyToUse}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates, return=representation'
      },
      body: JSON.stringify({
        key,
        value: data,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      // Fallback with a direct patch override in case table setup constraints trigger PGRST errors
      const optRes = await fetch(`${endpoint}?key=eq.${key}`, {
        method: 'PATCH',
        headers: {
          'apikey': keyToUse,
          'Authorization': `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: data,
          updated_at: new Date().toISOString()
        })
      });
      if (!optRes.ok) {
        throw new Error(`Direct PATCH fallback returned error: ${await optRes.text()}`);
      }
    }
    console.log(`[SupabaseSync] Database successfully updated live on cloud storage: "${key}"`);
  } catch (err) {
    console.warn(`[SupabaseSync] Database auto-save warning for "${key}". The public.goldiama_store table might not exist yet:`, err);
  }
};

const readStateFromSupabase = async (key: string): Promise<any | null> => {
  const config = getSupabaseConfig();
  if (!config) return null;

  const keyToUse = config.serviceRoleKey || config.anonKey;
  const endpoint = `${config.url.trim().replace(/\/$/, "")}/rest/v1/goldiama_store?key=eq.${key}&select=value`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': keyToUse,
        'Authorization': `Bearer ${keyToUse}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0].value;
    }
    return null;
  } catch (err) {
    console.warn(`[SupabaseSync] Database read warning for "${key}":`, err);
    return null;
  }
};

const readAllStatesFromSupabase = async (): Promise<{ key: string; value: any }[] | null> => {
  const config = getSupabaseConfig();
  if (!config) return null;

  const keyToUse = config.serviceRoleKey || config.anonKey;
  const endpoint = `${config.url.trim().replace(/\/$/, "")}/rest/v1/goldiama_store?select=key,value`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': keyToUse,
        'Authorization': `Bearer ${keyToUse}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn(`[SupabaseSync] Database read warning for all keys:`, err);
    return null;
  }
};

// Proxy localStorage.setItem to auto-propagate min_eco_ updates to Supabase dynamically
if (typeof window !== 'undefined' && !(window as any).__localStorageSetItemProxied) {
  (window as any).__localStorageSetItemProxied = true;
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key: string, value: string) {
    originalSetItem.call(localStorage, key, value);
    if (key.startsWith('min_eco_') && !(window as any).__isSyncingFromSupabase) {
      if (![
        'min_eco_supabase_url',
        'min_eco_supabase_anon_key',
        'min_eco_supabase_service_role_key',
        'min_eco_supabase_bucket_name',
        'min_eco_supabase_database_schema',
        'min_eco_admin_login'
      ].includes(key)) {
        let parsed: any = value;
        try {
          parsed = JSON.parse(value);
        } catch (e) {}
        writeStateToSupabase(key, parsed);
      }
    }
  };
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [heroBanners, setHeroBannersState] = useState<HeroBanner[]>(() => {
    const saved = localStorage.getItem('min_eco_hero_banners_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Error parsing page hero banners, fallback to initial state.', e);
      }
    }
    return INITIAL_HERO_BANNERS;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [headerStyle, setHeaderStyleState] = useState<'minimal' | 'goldiama'>('goldiama');
  const [navigationMenu, setNavigationMenuState] = useState<NavigationItem[]>([]);
  const [navPresetStyle, setNavPresetStyleState] = useState<string>('underlined');
  const [navFontSize, setNavFontSizeState] = useState<string>('xs');
  const [navFontFamily, setNavFontFamilyState] = useState<string>('sans');
  const [navFontWeight, setNavFontWeightState] = useState<string>('bold');
  const [navFontCase, setNavFontCaseState] = useState<string>('uppercase');
  const [navLineGap, setNavLineGapState] = useState<string>('medium');
  const [navBlockSpacing, setNavBlockSpacingState] = useState<string>('medium');
  const [navColorStyle, setNavColorStyleState] = useState<string>('amber');
  const [navShowDividers, setNavShowDividersState] = useState<boolean>(false);
  const [navStretchMenu, setNavStretchMenuState] = useState<boolean>(false);

  const [heroBannerShow, setHeroBannerShowState] = useState<boolean>(() => localStorage.getItem('min_eco_hero_banner_show') !== 'false');
  const [heroBannerTitle, setHeroBannerTitleState] = useState<string>(() => localStorage.getItem('min_eco_hero_banner_title') || 'Architectural elements designed to silence workspace friction.');
  const [heroBannerSubtitle, setHeroBannerSubtitleState] = useState<string>(() => localStorage.getItem('min_eco_hero_banner_subtitle') || 'Eliminate operational noise with tactile mechanical hardware, single-point diffuse brass illuminations, and structured heavy biofelt linings.');
  const [heroBannerBgUrl, setHeroBannerBgUrlState] = useState<string>(() => localStorage.getItem('min_eco_hero_banner_bg_url') || '');
  const [heroBannerOverlay, setHeroBannerOverlayState] = useState<number>(() => parseFloat(localStorage.getItem('min_eco_hero_banner_overlay') || '0'));
  const [heroBannerHeight, setHeroBannerHeightState] = useState<string>(() => localStorage.getItem('min_eco_hero_banner_height') || 'medium');
  const [heroBannerCtaText, setHeroBannerCtaTextState] = useState<string>(() => localStorage.getItem('min_eco_hero_banner_cta_text') || 'EXPLORE COLLECTIONS');
  const [heroBannerCtaLink, setHeroBannerCtaLinkState] = useState<string>(() => localStorage.getItem('min_eco_hero_banner_cta_link') || '#');
  const [heroBannerLayoutMode, setHeroBannerLayoutModeState] = useState<string>(() => localStorage.getItem('min_eco_hero_banner_layout_mode') || 'full-width');
  const [heroBannerDimDesktop, setHeroBannerDimDesktopState] = useState<string>(() => localStorage.getItem('min_eco_hero_banner_dim_desktop') || 'default');
  const [heroBannerDimTablet, setHeroBannerDimTabletState] = useState<string>(() => localStorage.getItem('min_eco_hero_banner_dim_tablet') || 'default');
  const [heroBannerDimMobile, setHeroBannerDimMobileState] = useState<string>(() => localStorage.getItem('min_eco_hero_banner_dim_mobile') || 'default');

  const [pageBannerShow, setPageBannerShowState] = useState<boolean>(() => localStorage.getItem('min_eco_page_banner_show') !== 'false');
  const [pageBannerBgUrl, setPageBannerBgUrlState] = useState<string>(() => localStorage.getItem('min_eco_page_banner_bg_url') || 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=1600&q=80');
  const [pageBannerHeight, setPageBannerHeightState] = useState<string>(() => localStorage.getItem('min_eco_page_banner_height') || 'snug');
  const [pageBannerAlign, setPageBannerAlignState] = useState<string>(() => localStorage.getItem('min_eco_page_banner_align') || 'center');
  const [pageBannerDimDesktop, setPageBannerDimDesktopState] = useState<string>(() => localStorage.getItem('min_eco_page_banner_dim_desktop') || 'default');
  const [pageBannerDimTablet, setPageBannerDimTabletState] = useState<string>(() => localStorage.getItem('min_eco_page_banner_dim_tablet') || 'default');
  const [pageBannerDimMobile, setPageBannerDimMobileState] = useState<string>(() => localStorage.getItem('min_eco_page_banner_dim_mobile') || 'default');

  const [pageTitleBarEnable, setPageTitleBarEnableState] = useState<boolean>(() => localStorage.getItem('min_eco_page_title_bar_enable') !== 'false');
  const [pageTitleBarBg, setPageTitleBarBgState] = useState<string>(() => localStorage.getItem('min_eco_page_title_bar_bg') || 'slate');
  const [pageTitleBarBorder, setPageTitleBarBorderState] = useState<string>(() => localStorage.getItem('min_eco_page_title_bar_border') || 'minimal');
  const [pageTitleBarFontSize, setPageTitleBarFontSizeState] = useState<string>(() => localStorage.getItem('min_eco_page_title_bar_font_size') || 'md');

  const [layoutContentWidth, setLayoutContentWidthState] = useState<string>(() => localStorage.getItem('min_eco_layout_content_width') || 'default');
  const [layoutBorderRadius, setLayoutBorderRadiusState] = useState<string>(() => localStorage.getItem('min_eco_layout_border_radius') || 'rounded');
  const [layoutShowBreadcrumbs, setLayoutShowBreadcrumbsState] = useState<boolean>(() => localStorage.getItem('min_eco_layout_show_breadcrumbs') !== 'false');

  // Unified Pages shared reactive hook state
  const [pagesList, setPagesList] = useState<CustomPage[]>(() => {
    const saved = localStorage.getItem('min_eco_custom_pages_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: '1', title: 'Home Frontpage', slug: '/', status: 'Published', template: 'Bento Showcase', seoTitle: 'Goldiama Ltd | Global Gold & Bullion Custody Standards', seoDesc: 'Institutional physical gold custody allocations with transparent digital logs.', seoKeywords: 'gold, bullion bars, institutional gold custody' },
      { id: '2', title: 'Curated Catalog', slug: '/shop', status: 'Published', template: 'Infinite Scroll', seoTitle: 'Precious Metals Catalog | Goldiama Sovereign Wealth', seoDesc: 'Physical allocations of cast gold bars, silver, and sovereign coins.', seoKeywords: 'cast bars, gold coins, precious metal' },
      { id: '3', title: 'Artisanal Ethos', slug: '/about', status: 'Draft', template: 'Editorial Story', seoTitle: 'Artisanal Ethos & Integrity Standards | Goldiama', seoDesc: 'Our commitment to ethical mining, complete supply-chain trace logs, and carbon neutrality.', seoKeywords: 'ethical gold mining, trace logs, gold purity' },
      { id: '4', title: 'Order Support', slug: '/support', status: 'Published', template: 'Minimal Form', seoTitle: 'Order Support & Inquiries Desk | Goldiama', seoDesc: 'Secure communication portal, order tracking queries, custom gold allocations dispatch support.', seoKeywords: 'order support, shipping contact, service desk' }
    ];
  });

  const updatePagesList = (newList: CustomPage[]) => {
    setPagesList(newList);
    localStorage.setItem('min_eco_custom_pages_list', JSON.stringify(newList));
    window.dispatchEvent(new Event('min-eco-pages-updated'));
    writeStateToSupabase('min_eco_custom_pages_list', newList);
  };

  // Initialize from LocalStorage or Fallback to pre-populated Initial Data
  useEffect(() => {
    const savedProducts = localStorage.getItem('min_eco_products');
    const savedOrders = localStorage.getItem('min_eco_orders');
    const savedCustomers = localStorage.getItem('min_eco_customers');
    const savedLogin = localStorage.getItem('min_eco_admin_login');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('min_eco_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders(INITIAL_ORDERS);
      localStorage.setItem('min_eco_orders', JSON.stringify(INITIAL_ORDERS));
    }

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      setCustomers(INITIAL_CUSTOMERS);
      localStorage.setItem('min_eco_customers', JSON.stringify(INITIAL_CUSTOMERS));
    }

    if (savedLogin === 'true') {
      setIsAdminLoggedIn(true);
    }

    const savedHeaderStyle = localStorage.getItem('min_eco_header_style');
    const savedNavMenu = localStorage.getItem('min_eco_nav_menu');

    if (savedHeaderStyle === 'minimal' || savedHeaderStyle === 'goldiama') {
      setHeaderStyleState(savedHeaderStyle);
    } else {
      setHeaderStyleState('goldiama');
      localStorage.setItem('min_eco_header_style', 'goldiama');
    }

    if (savedNavMenu) {
      setNavigationMenuState(JSON.parse(savedNavMenu));
    } else {
      setNavigationMenuState(DEFAULT_NAVIGATION_MENU);
      localStorage.setItem('min_eco_nav_menu', JSON.stringify(DEFAULT_NAVIGATION_MENU));
    }

    setNavPresetStyleState(localStorage.getItem('min_eco_nav_preset_style') || 'underlined');
    setNavFontSizeState(localStorage.getItem('min_eco_nav_font_size') || 'xs');
    setNavFontFamilyState(localStorage.getItem('min_eco_nav_font_family') || 'sans');
    setNavFontWeightState(localStorage.getItem('min_eco_nav_font_weight') || 'bold');
    setNavFontCaseState(localStorage.getItem('min_eco_nav_font_case') || 'uppercase');
    setNavLineGapState(localStorage.getItem('min_eco_nav_line_gap') || 'medium');
    setNavBlockSpacingState(localStorage.getItem('min_eco_nav_block_spacing') || 'medium');
    setNavColorStyleState(localStorage.getItem('min_eco_nav_color_style') || 'amber');
    setNavShowDividersState(localStorage.getItem('min_eco_nav_show_dividers') === 'true');
    setNavStretchMenuState(localStorage.getItem('min_eco_nav_stretch_menu') === 'true');
  }, []);

  // Post-mount Supabase master relational JSON database pulling and seeding sync suite
  useEffect(() => {
    const initAndSyncSupabase = async () => {
      // Pull shared guest config from active Node server backend
      try {
        const res = await fetch('/api/supabase-config');
        const data = await res.json();
        if (data && data.success && data.url && data.anonKey) {
          serverSupabaseConfig = {
            url: data.url,
            anonKey: data.anonKey,
            schema: data.databaseSchema || 'public'
          };
          console.log('[SupabaseSync] Pulled active shared database credentials from Node.js server config.');
        }
      } catch (err) {
        console.warn('[SupabaseSync] Could not fetch shared config from Node.js backend:', err);
      }

      const config = getSupabaseConfig();
      if (!config) {
        console.log('[SupabaseSync] No active Supabase config found locally or on the server. Skipping sync.');
        return;
      }

      console.log('[SupabaseSync] Initializing live database synchronization...');

      try {
        const allCloudData = await readAllStatesFromSupabase();
        if (allCloudData && Array.isArray(allCloudData) && allCloudData.length > 0) {
          (window as any).__isSyncingFromSupabase = true;
          
          for (const item of allCloudData) {
            const key = item.key;
            const val = item.value;
            
            // Save to localStorage directly
            const strVal = (typeof val === 'object' && val !== null) ? JSON.stringify(val) : String(val);
            localStorage.setItem(key, strVal);
            
            // Apply corresponding React state setter if exists
            if (key === 'min_eco_custom_pages_list') setPagesList(val);
            else if (key === 'min_eco_hero_banners_list') setHeroBannersState(val);
            else if (key === 'min_eco_products') setProducts(val);
            else if (key === 'min_eco_orders') setOrders(val);
            else if (key === 'min_eco_customers') setCustomers(val);
            else if (key === 'min_eco_nav_menu') setNavigationMenuState(val);
            else if (key === 'min_eco_header_style') setHeaderStyleState(val);
            
            // Single settings mapping:
            else if (key === 'min_eco_nav_preset_style') setNavPresetStyleState(String(val));
            else if (key === 'min_eco_nav_font_size') setNavFontSizeState(String(val));
            else if (key === 'min_eco_nav_font_family') setNavFontFamilyState(String(val));
            else if (key === 'min_eco_nav_font_weight') setNavFontWeightState(String(val));
            else if (key === 'min_eco_nav_font_case') setNavFontCaseState(String(val));
            else if (key === 'min_eco_nav_line_gap') setNavLineGapState(String(val));
            else if (key === 'min_eco_nav_block_spacing') setNavBlockSpacingState(String(val));
            else if (key === 'min_eco_nav_color_style') setNavColorStyleState(String(val));
            else if (key === 'min_eco_nav_show_dividers') setNavShowDividersState(String(val) === 'true');
            else if (key === 'min_eco_nav_stretch_menu') setNavStretchMenuState(String(val) === 'true');
            
            else if (key === 'min_eco_hero_banner_show') setHeroBannerShowState(String(val) !== 'false');
            else if (key === 'min_eco_hero_banner_title') setHeroBannerTitleState(String(val));
            else if (key === 'min_eco_hero_banner_subtitle') setHeroBannerSubtitleState(String(val));
            else if (key === 'min_eco_hero_banner_bg_url') setHeroBannerBgUrlState(String(val));
            else if (key === 'min_eco_hero_banner_overlay') setHeroBannerOverlayState(parseFloat(String(val)) || 0);
            else if (key === 'min_eco_hero_banner_height') setHeroBannerHeightState(String(val));
            else if (key === 'min_eco_hero_banner_cta_text') setHeroBannerCtaTextState(String(val));
            else if (key === 'min_eco_hero_banner_cta_link') setHeroBannerCtaLinkState(String(val));
            else if (key === 'min_eco_hero_banner_layout_mode') setHeroBannerLayoutModeState(String(val));
            else if (key === 'min_eco_hero_banner_dim_desktop') setHeroBannerDimDesktopState(String(val));
            else if (key === 'min_eco_hero_banner_dim_tablet') setHeroBannerDimTabletState(String(val));
            else if (key === 'min_eco_hero_banner_dim_mobile') setHeroBannerDimMobileState(String(val));
            
            else if (key === 'min_eco_page_banner_show') setPageBannerShowState(String(val) !== 'false');
            else if (key === 'min_eco_page_banner_bg_url') setPageBannerBgUrlState(String(val));
            else if (key === 'min_eco_page_banner_height') setPageBannerHeightState(String(val));
            else if (key === 'min_eco_page_banner_align') setPageBannerAlignState(String(val));
            else if (key === 'min_eco_page_banner_dim_desktop') setPageBannerDimDesktopState(String(val));
            else if (key === 'min_eco_page_banner_dim_tablet') setPageBannerDimTabletState(String(val));
            else if (key === 'min_eco_page_banner_dim_mobile') setPageBannerDimMobileState(String(val));
            
            else if (key === 'min_eco_page_title_bar_enable') setPageTitleBarEnableState(String(val) !== 'false');
            else if (key === 'min_eco_page_title_bar_bg') setPageTitleBarBgState(String(val));
            else if (key === 'min_eco_page_title_bar_border') setPageTitleBarBorderState(String(val));
            else if (key === 'min_eco_page_title_bar_font_size') setPageTitleBarFontSizeState(String(val));
            
            else if (key === 'min_eco_layout_content_width') setLayoutContentWidthState(String(val));
            else if (key === 'min_eco_layout_border_radius') setLayoutBorderRadiusState(String(val));
            else if (key === 'min_eco_layout_show_breadcrumbs') setLayoutShowBreadcrumbsState(String(val) !== 'false');
          }
          
          (window as any).__isSyncingFromSupabase = false;
          console.log(`[SupabaseSync] Pulled ${allCloudData.length} active database configurations from cloud storage.`);

          // Fire lifecycle rendering events
          window.dispatchEvent(new Event('min-eco-banners-updated'));
          window.dispatchEvent(new Event('min-eco-pages-updated'));
          window.dispatchEvent(new Event('min-eco-logo-updated'));
        }
      } catch (err) {
        console.warn('[SupabaseSync] All states full sync fail, falling back to sequential check:', err);
      }

      // Sync and verification subset (essential fallback and initial seeding table logic)
      const keysToSync = [
        {
          key: 'min_eco_products',
          setter: setProducts,
          fallback: () => {
            const saved = localStorage.getItem('min_eco_products');
            return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
          }
        },
        {
          key: 'min_eco_orders',
          setter: setOrders,
          fallback: () => {
            const saved = localStorage.getItem('min_eco_orders');
            return saved ? JSON.parse(saved) : INITIAL_ORDERS;
          }
        },
        {
          key: 'min_eco_customers',
          setter: setCustomers,
          fallback: () => {
            const saved = localStorage.getItem('min_eco_customers');
            return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
          }
        },
        {
          key: 'min_eco_custom_pages_list',
          setter: setPagesList,
          fallback: () => {
            const saved = localStorage.getItem('min_eco_custom_pages_list');
            if (saved) {
              try { return JSON.parse(saved); } catch (e) {}
            }
            return [
              { id: '1', title: 'Home Frontpage', slug: '/', status: 'Published', template: 'Bento Showcase', seoTitle: 'Goldiama Ltd | Global Gold & Bullion Custody Standards', seoDesc: 'Institutional physical gold custody allocations with transparent digital logs.', seoKeywords: 'gold, bullion bars, institutional gold custody' },
              { id: '2', title: 'Curated Catalog', slug: '/shop', status: 'Published', template: 'Infinite Scroll', seoTitle: 'Precious Metals Catalog | Goldiama Sovereign Wealth', seoDesc: 'Physical allocations of cast gold bars, silver, and sovereign coins.', seoKeywords: 'cast bars, gold coins, precious metal' },
              { id: '3', title: 'Artisanal Ethos', slug: '/about', status: 'Draft', template: 'Editorial Story', seoTitle: 'Artisanal Ethos & Integrity Standards | Goldiama', seoDesc: 'Our commitment to ethical mining, complete supply-chain trace logs, and carbon neutrality.', seoKeywords: 'ethical gold mining, trace logs, gold purity' },
              { id: '4', title: 'Order Support', slug: '/support', status: 'Published', template: 'Minimal Form', seoTitle: 'Order Support & Inquiries Desk | Goldiama', seoDesc: 'Secure communication portal, order tracking queries, custom gold allocations dispatch support.', seoKeywords: 'order support, shipping contact, service desk' }
            ];
          }
        },
        {
          key: 'min_eco_hero_banners_list',
          setter: setHeroBannersState,
          fallback: () => {
            const saved = localStorage.getItem('min_eco_hero_banners_list');
            return saved ? JSON.parse(saved) : INITIAL_HERO_BANNERS;
          }
        },
        {
          key: 'min_eco_nav_menu',
          setter: setNavigationMenuState,
          fallback: () => {
            const saved = localStorage.getItem('min_eco_nav_menu');
            return saved ? JSON.parse(saved) : DEFAULT_NAVIGATION_MENU;
          }
        }
      ];

      for (const item of keysToSync) {
        try {
          const cloudVal = await readStateFromSupabase(item.key);
          if (cloudVal !== null) {
            item.setter(cloudVal);
            localStorage.setItem(item.key, JSON.stringify(cloudVal));
          } else {
            // Seed cloud database with currently resolved local state so we don't start with blank lists
            const localData = item.fallback();
            await writeStateToSupabase(item.key, localData);
            console.log(`[SupabaseSync] Seeded cloud database for key "${item.key}".`);
          }
        } catch (e) {
          console.warn(`[SupabaseSync] Direct sync fallback for key "${item.key}":`, e);
        }
      }
    };

    initAndSyncSupabase();

    // Listen to real-time configuration overrides from the Admin settings interface
    const handleConfigChange = () => {
      console.log('[SupabaseSync] Supabase credentials updated. Running live resynchronization...');
      initAndSyncSupabase();
    };
    window.addEventListener('min-eco-supabase-config-changed', handleConfigChange);
    return () => {
      window.removeEventListener('min-eco-supabase-config-changed', handleConfigChange);
    };
  }, []);

  // Synchronizers to local storage and Supabase DB
  const syncProducts = (newProds: Product[]) => {
    setProducts(newProds);
    localStorage.setItem('min_eco_products', JSON.stringify(newProds));
    writeStateToSupabase('min_eco_products', newProds);
  };

  const syncOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('min_eco_orders', JSON.stringify(newOrders));
    writeStateToSupabase('min_eco_orders', newOrders);
  };

  const syncCustomers = (newCusts: Customer[]) => {
    setCustomers(newCusts);
    localStorage.setItem('min_eco_customers', JSON.stringify(newCusts));
    writeStateToSupabase('min_eco_customers', newCusts);
  };

  const setHeaderStyle = (style: 'minimal' | 'goldiama') => {
    setHeaderStyleState(style);
    localStorage.setItem('min_eco_header_style', style);
  };

  const setNavigationMenu = (menu: NavigationItem[]) => {
    setNavigationMenuState(menu);
    localStorage.setItem('min_eco_nav_menu', JSON.stringify(menu));
    writeStateToSupabase('min_eco_nav_menu', menu);
  };

  const setNavPresetStyle = (val: string) => {
    setNavPresetStyleState(val);
    localStorage.setItem('min_eco_nav_preset_style', val);
  };
  const setNavFontSize = (val: string) => {
    setNavFontSizeState(val);
    localStorage.setItem('min_eco_nav_font_size', val);
  };
  const setNavFontFamily = (val: string) => {
    setNavFontFamilyState(val);
    localStorage.setItem('min_eco_nav_font_family', val);
  };
  const setNavFontWeight = (val: string) => {
    setNavFontWeightState(val);
    localStorage.setItem('min_eco_nav_font_weight', val);
  };
  const setNavFontCase = (val: string) => {
    setNavFontCaseState(val);
    localStorage.setItem('min_eco_nav_font_case', val);
  };
  const setNavLineGap = (val: string) => {
    setNavLineGapState(val);
    localStorage.setItem('min_eco_nav_line_gap', val);
  };
  const setNavBlockSpacing = (val: string) => {
    setNavBlockSpacingState(val);
    localStorage.setItem('min_eco_nav_block_spacing', val);
  };
  const setNavColorStyle = (val: string) => {
    setNavColorStyleState(val);
    localStorage.setItem('min_eco_nav_color_style', val);
  };
  const setNavShowDividers = (val: boolean) => {
    setNavShowDividersState(val);
    localStorage.setItem('min_eco_nav_show_dividers', String(val));
  };
  const setNavStretchMenu = (val: boolean) => {
    setNavStretchMenuState(val);
    localStorage.setItem('min_eco_nav_stretch_menu', String(val));
  };

  const setHeroBannerShow = (val: boolean) => {
    setHeroBannerShowState(val);
    localStorage.setItem('min_eco_hero_banner_show', String(val));
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerTitle = (val: string) => {
    setHeroBannerTitleState(val);
    localStorage.setItem('min_eco_hero_banner_title', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerSubtitle = (val: string) => {
    setHeroBannerSubtitleState(val);
    localStorage.setItem('min_eco_hero_banner_subtitle', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerBgUrl = (val: string) => {
    setHeroBannerBgUrlState(val);
    localStorage.setItem('min_eco_hero_banner_bg_url', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerOverlay = (val: number) => {
    setHeroBannerOverlayState(val);
    localStorage.setItem('min_eco_hero_banner_overlay', String(val));
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerHeight = (val: string) => {
    setHeroBannerHeightState(val);
    localStorage.setItem('min_eco_hero_banner_height', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerCtaText = (val: string) => {
    setHeroBannerCtaTextState(val);
    localStorage.setItem('min_eco_hero_banner_cta_text', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerCtaLink = (val: string) => {
    setHeroBannerCtaLinkState(val);
    localStorage.setItem('min_eco_hero_banner_cta_link', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerLayoutMode = (val: string) => {
    setHeroBannerLayoutModeState(val);
    localStorage.setItem('min_eco_hero_banner_layout_mode', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerDimDesktop = (val: string) => {
    setHeroBannerDimDesktopState(val);
    localStorage.setItem('min_eco_hero_banner_dim_desktop', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerDimTablet = (val: string) => {
    setHeroBannerDimTabletState(val);
    localStorage.setItem('min_eco_hero_banner_dim_tablet', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setHeroBannerDimMobile = (val: string) => {
    setHeroBannerDimMobileState(val);
    localStorage.setItem('min_eco_hero_banner_dim_mobile', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };

  const setPageBannerShow = (val: boolean) => {
    setPageBannerShowState(val);
    localStorage.setItem('min_eco_page_banner_show', String(val));
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setPageBannerBgUrl = (val: string) => {
    setPageBannerBgUrlState(val);
    localStorage.setItem('min_eco_page_banner_bg_url', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setPageBannerHeight = (val: string) => {
    setPageBannerHeightState(val);
    localStorage.setItem('min_eco_page_banner_height', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setPageBannerAlign = (val: string) => {
    setPageBannerAlignState(val);
    localStorage.setItem('min_eco_page_banner_align', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setPageBannerDimDesktop = (val: string) => {
    setPageBannerDimDesktopState(val);
    localStorage.setItem('min_eco_page_banner_dim_desktop', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setPageBannerDimTablet = (val: string) => {
    setPageBannerDimTabletState(val);
    localStorage.setItem('min_eco_page_banner_dim_tablet', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setPageBannerDimMobile = (val: string) => {
    setPageBannerDimMobileState(val);
    localStorage.setItem('min_eco_page_banner_dim_mobile', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };

  const setPageTitleBarEnable = (val: boolean) => {
    setPageTitleBarEnableState(val);
    localStorage.setItem('min_eco_page_title_bar_enable', String(val));
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setPageTitleBarBg = (val: string) => {
    setPageTitleBarBgState(val);
    localStorage.setItem('min_eco_page_title_bar_bg', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setPageTitleBarBorder = (val: string) => {
    setPageTitleBarBorderState(val);
    localStorage.setItem('min_eco_page_title_bar_border', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };
  const setPageTitleBarFontSize = (val: string) => {
    setPageTitleBarFontSizeState(val);
    localStorage.setItem('min_eco_page_title_bar_font_size', val);
    window.dispatchEvent(new Event('min-eco-banners-updated'));
  };

  const setLayoutContentWidth = (val: string) => {
    setLayoutContentWidthState(val);
    localStorage.setItem('min_eco_layout_content_width', val);
    window.dispatchEvent(new Event('min-eco-layout-updated'));
  };
  const setLayoutBorderRadius = (val: string) => {
    setLayoutBorderRadiusState(val);
    localStorage.setItem('min_eco_layout_border_radius', val);
    window.dispatchEvent(new Event('min-eco-layout-updated'));
  };
  const setLayoutShowBreadcrumbs = (val: boolean) => {
    setLayoutShowBreadcrumbsState(val);
    localStorage.setItem('min_eco_layout_show_breadcrumbs', String(val));
    window.dispatchEvent(new Event('min-eco-layout-updated'));
  };

  const addHeroBanner = (newB: Omit<HeroBanner, 'id'>) => {
    const id = 'hb-' + Date.now();
    const fullB = { id, ...newB };
    const updated = [...heroBanners, fullB];
    setHeroBannersState(updated);
    localStorage.setItem('min_eco_hero_banners_list', JSON.stringify(updated));
    window.dispatchEvent(new Event('min-eco-banners-updated'));
    writeStateToSupabase('min_eco_hero_banners_list', updated);
  };

  const editHeroBanner = (bannerId: string, updatedFields: Partial<HeroBanner>) => {
    const updated = heroBanners.map(b => b.id === bannerId ? { ...b, ...updatedFields } : b);
    setHeroBannersState(updated);
    localStorage.setItem('min_eco_hero_banners_list', JSON.stringify(updated));
    window.dispatchEvent(new Event('min-eco-banners-updated'));
    writeStateToSupabase('min_eco_hero_banners_list', updated);
  };

  const deleteHeroBanner = (bannerId: string) => {
    const updated = heroBanners.filter(b => b.id !== bannerId);
    setHeroBannersState(updated);
    localStorage.setItem('min_eco_hero_banners_list', JSON.stringify(updated));
    window.dispatchEvent(new Event('min-eco-banners-updated'));
    writeStateToSupabase('min_eco_hero_banners_list', updated);
  };

  const loginAdmin = (username: string, pass: string): boolean => {
    // Elegant standard admin credentials
    if (username.trim().toLowerCase() === 'admin' && pass === 'admin') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('min_eco_admin_login', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.setItem('min_eco_admin_login', 'false');
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prevCart, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: Math.min(quantity, item.product.stock) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout executes order, deplates inventory stock, creates/updates customers list
  const checkout = (details: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    paymentMethod: string;
  }): Order => {
    const productsSum = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const tax = parseFloat((productsSum * 0.08).toFixed(2));
    const shipping = 9.95;
    const finalAmount = parseFloat((productsSum + tax + shipping).toFixed(2));

    // Construct new Order Products
    const orderItems: OrderProduct[] = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Create unique order numeric ID
    const customOrderId = `#${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: customOrderId,
      customerName: details.name,
      customerEmail: details.email,
      customerAddress: details.address,
      customerCity: details.city,
      customerZip: details.zip,
      products: orderItems,
      amount: finalAmount,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      paymentMethod: details.paymentMethod,
      trackingNumber: `TRK-${Math.floor(10000 + Math.random() * 90000)}-INT`,
    };

    // Update real-time product stock counts
    const updatedProducts = products.map((prod) => {
      const orderMatch = cart.find((item) => item.product.id === prod.id);
      if (orderMatch) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - orderMatch.quantity),
        };
      }
      return prod;
    });

    // Update customers records
    const existingCustomerIdx = customers.findIndex(
      (c) => c.email.toLowerCase() === details.email.toLowerCase()
    );

    let updatedCustomers = [...customers];
    if (existingCustomerIdx >= 0) {
      // Update existing
      updatedCustomers[existingCustomerIdx] = {
        ...updatedCustomers[existingCustomerIdx],
        totalOrders: updatedCustomers[existingCustomerIdx].totalOrders + 1,
        totalSpent: parseFloat(
          (updatedCustomers[existingCustomerIdx].totalSpent + finalAmount).toFixed(2)
        ),
        lastActive: newOrder.date,
      };
    } else {
      // Add new
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: details.name,
        email: details.email,
        country: 'United States', // Mock or determined dynamically
        city: details.city,
        totalOrders: 1,
        totalSpent: finalAmount,
        lastActive: newOrder.date,
      };
      updatedCustomers = [newCustomer, ...updatedCustomers];
    }

    syncProducts(updatedProducts);
    syncCustomers(updatedCustomers);
    syncOrders([newOrder, ...orders]);
    setCart([]); // Clear shopper cart

    return newOrder;
  };

  const addReview = (
    productId: string,
    newReviewData: { author: string; rating: number; title: string; comment: string; recommended: boolean }
  ) => {
    const updated = products.map((prod) => {
      if (prod.id === productId) {
        const newReview: Review = {
          id: `rev-${Date.now()}`,
          author: newReviewData.author || 'Anonymous',
          rating: newReviewData.rating,
          title: newReviewData.title || 'Product Feedback',
          comment: newReviewData.comment,
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
          recommended: newReviewData.recommended,
        };

        const list = [newReview, ...prod.reviews];
        // Re-calculate live weighted rating
        const sumOfRatings = list.reduce((total, r) => total + r.rating, 0);
        const avg = parseFloat((sumOfRatings / list.length).toFixed(1));

        return {
          ...prod,
          reviews: list,
          reviewsCount: list.length,
          rating: avg,
        };
      }
      return prod;
    });

    syncProducts(updated);
  };

  const updateStock = (productId: string, newStock: number) => {
    const updated = products.map((prod) =>
      prod.id === productId ? { ...prod, stock: Math.max(0, newStock) } : prod
    );
    syncProducts(updated);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    syncOrders(updated);
  };

  const addProduct = (newProdData: Omit<Product, 'reviews' | 'reviewsCount' | 'rating'>) => {
    const freshProduct: Product = {
      ...newProdData,
      rating: 0,
      reviewsCount: 0,
      reviews: [],
    };
    syncProducts([freshProduct, ...products]);
  };

  const editProduct = (productId: string, updated: Partial<Product>) => {
    const updatedList = products.map((p) => (p.id === productId ? { ...p, ...updated } : p));
    syncProducts(updatedList);
  };

  const deleteProduct = (productId: string) => {
    const filtered = products.filter((p) => p.id !== productId);
    syncProducts(filtered);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        customers,
        cart,
        isAdminLoggedIn,
        headerStyle,
        setHeaderStyle,
        navigationMenu,
        setNavigationMenu,
        navPresetStyle,
        setNavPresetStyle,
        navFontSize,
        setNavFontSize,
        navFontFamily,
        setNavFontFamily,
        navFontWeight,
        setNavFontWeight,
        navFontCase,
        setNavFontCase,
        navLineGap,
        setNavLineGap,
        navBlockSpacing,
        setNavBlockSpacing,
        navColorStyle,
        setNavColorStyle,
        navShowDividers,
        setNavShowDividers,
        navStretchMenu,
        setNavStretchMenu,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        checkout,
        addReview,
        updateStock,
        updateOrderStatus,
        addProduct,
        editProduct,
        deleteProduct,
        loginAdmin,
        logoutAdmin,

        heroBannerShow,
        setHeroBannerShow,
        heroBannerTitle,
        setHeroBannerTitle,
        heroBannerSubtitle,
        setHeroBannerSubtitle,
        heroBannerBgUrl,
        setHeroBannerBgUrl,
        heroBannerOverlay,
        setHeroBannerOverlay,
        heroBannerHeight,
        setHeroBannerHeight,
        heroBannerCtaText,
        setHeroBannerCtaText,
        heroBannerCtaLink,
        setHeroBannerCtaLink,
        heroBannerLayoutMode,
        setHeroBannerLayoutMode,
        heroBannerDimDesktop,
        setHeroBannerDimDesktop,
        heroBannerDimTablet,
        setHeroBannerDimTablet,
        heroBannerDimMobile,
        setHeroBannerDimMobile,

        pageBannerShow,
        setPageBannerShow,
        pageBannerBgUrl,
        setPageBannerBgUrl,
        pageBannerHeight,
        setPageBannerHeight,
        pageBannerAlign,
        setPageBannerAlign,
        pageBannerDimDesktop,
        setPageBannerDimDesktop,
        pageBannerDimTablet,
        setPageBannerDimTablet,
        pageBannerDimMobile,
        setPageBannerDimMobile,

        pageTitleBarEnable,
        setPageTitleBarEnable,
        pageTitleBarBg,
        setPageTitleBarBg,
        pageTitleBarBorder,
        setPageTitleBarBorder,
        pageTitleBarFontSize,
        setPageTitleBarFontSize,

        layoutContentWidth,
        setLayoutContentWidth,
        layoutBorderRadius,
        setLayoutBorderRadius,
        layoutShowBreadcrumbs,
        setLayoutShowBreadcrumbs,

        heroBanners,
        addHeroBanner,
        editHeroBanner,
        deleteHeroBanner,

        pagesList,
        updatePagesList,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
