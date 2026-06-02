/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../StoreContext';
import { OrderStatus, Product, NavigationItem, MegaMenuConfig, HeroBanner, HeroSliderItem, Category } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  Layers, ShoppingBag, Users, Trash2, Edit, X, LogOut, Filter, Download, 
  MapPin, CreditCard, ChevronRight, ChevronDown, ChevronUp, Check, Plus, Globe, Search, ArrowUpRight, 
  FileText, TrendingUp, HelpCircle, Type, Image, Layout, Sliders, Wallet, AlignJustify,
  Lock, Bell, Shield, ArrowUp, ArrowDown, Settings, ShieldCheck, Sparkles,
  Smartphone, Tablet, Monitor, Coins, RefreshCw, Database, FolderOpen, Upload, Save, Cloud, CloudOff
} from 'lucide-react';

const splitImageUrls = (str: string): string[] => {
  if (!str) return [];
  const cleaned = str.replace(/[\r\n|]+/g, ',');
  return cleaned
    .split(/(?<!;base64),/i)
    .map(s => s.trim())
    .filter(Boolean);
};

// Pre-packaged monthly data matching the gorgeous revenue layout
const REVENUE_TREND_DATA = [
  { name: 'Jan', amount: 25000 },
  { name: 'Feb', amount: 32000 },
  { name: 'Mar', amount: 28000 },
  { name: 'Apr', amount: 41000 },
  { name: 'May', amount: 38000 },
  { name: 'Jun', amount: 48000 },
  { name: 'Jul', amount: 45000 },
  { name: 'Aug', amount: 56000 },
  { name: 'Sep', amount: 52000 },
  { name: 'Oct', amount: 64000 },
  { name: 'Nov', amount: 59000 },
  { name: 'Dec', amount: 72592 }
];

export const AdminDashboard: React.FC = () => {
  const { 
    products, orders, customers, logoutAdmin, updateStock, 
    updateOrderStatus, addProduct, editProduct, deleteProduct,
    headerStyle, setHeaderStyle, navigationMenu, setNavigationMenu,
    navPresetStyle, setNavPresetStyle, navFontSize, setNavFontSize,
    navFontFamily, setNavFontFamily, navFontWeight, setNavFontWeight,
    navFontCase, setNavFontCase, navLineGap, setNavLineGap,
    navBlockSpacing, setNavBlockSpacing, navColorStyle, setNavColorStyle,
    navShowDividers, setNavShowDividers, navStretchMenu, setNavStretchMenu,

    heroBannerShow, setHeroBannerShow,
    heroBannerTitle, setHeroBannerTitle,
    heroBannerSubtitle, setHeroBannerSubtitle,
    heroBannerBgUrl, setHeroBannerBgUrl,
    heroBannerOverlay, setHeroBannerOverlay,
    heroBannerHeight, setHeroBannerHeight,
    heroBannerCtaText, setHeroBannerCtaText,
    heroBannerCtaLink, setHeroBannerCtaLink,

    pageBannerShow, setPageBannerShow,
    pageBannerBgUrl, setPageBannerBgUrl,
    pageBannerHeight, setPageBannerHeight,
    pageBannerAlign, setPageBannerAlign,

    pageTitleBarEnable, setPageTitleBarEnable,
    pageTitleBarBg, setPageTitleBarBg,
    pageTitleBarBorder, setPageTitleBarBorder,
    pageTitleBarFontSize, setPageTitleBarFontSize,

    layoutContentWidth, setLayoutContentWidth,
    layoutBorderRadius, setLayoutBorderRadius,
    layoutShowBreadcrumbs, setLayoutShowBreadcrumbs,

    heroBanners,
    addHeroBanner,
    editHeroBanner,
    deleteHeroBanner,
    heroBannerLayoutMode,
    setHeroBannerLayoutMode,
    heroBannerDimDesktop,
    setHeroBannerDimDesktop,
    heroBannerDimTablet,
    setHeroBannerDimTablet,
    heroBannerDimMobile,
    setHeroBannerDimMobile,
    pageBannerDimDesktop,
    setPageBannerDimDesktop,
    pageBannerDimTablet,
    setPageBannerDimTablet,
    pageBannerDimMobile,
    setPageBannerDimMobile,
    pagesList,
    updatePagesList
  } = useStore();

  // Safe sandboxed confirmation states bypassing blocked browser alerts/confirms
  const [confirmDeletePageId, setConfirmDeletePageId] = useState<string | null>(null);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);
  const [confirmDeleteBannerId, setConfirmDeleteBannerId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Market Precious Metals API settings and dynamic price states
  const [apiProvider, setApiProvider] = useState<'goldapi' | 'metalpriceapi' | 'demo'>(() => {
    return (localStorage.getItem('min_eco_metal_api_provider') as any) || 'demo';
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('min_eco_metal_api_key') || '';
  });
  const [metalCurrency, setMetalCurrency] = useState<'USD' | 'EUR' | 'GBP'>(() => {
    return (localStorage.getItem('min_eco_metal_currency') as any) || 'USD';
  });
  const [metalUnit, setMetalUnit] = useState<'ounce' | 'gram'>(() => {
    return (localStorage.getItem('min_eco_metal_unit') as any) || 'ounce';
  });

  const [goldPriceBase, setGoldPriceBase] = useState<number>(2385.40);
  const [goldPriceChangeBase, setGoldPriceChangeBase] = useState<number>(14.50);
  const [goldPriceChangePct, setGoldPriceChangePct] = useState<number>(0.61);

  const [silverPriceBase, setSilverPriceBase] = useState<number>(31.15);
  const [silverPriceChangeBase, setSilverPriceChangeBase] = useState<number>(-0.45);
  const [silverPriceChangePct, setSilverPriceChangePct] = useState<number>(-1.42);

  const [lastPriceFetchTime, setLastPriceFetchTime] = useState<string>(() => {
    return localStorage.getItem('min_eco_last_price_fetch_time') || 'Never synchronized';
  });
  const [priceFetchLoading, setPriceFetchLoading] = useState<boolean>(false);
  const [priceFetchError, setPriceFetchError] = useState<string | null>(null);

  const [selectedChartAsset, setSelectedChartAsset] = useState<'XAU' | 'XAG'>('XAU');
  const [chartDuration, setChartDuration] = useState<'7d' | '30d' | '12m'>('7d');

  const getCurrencySymbol = (cur: 'USD' | 'EUR' | 'GBP') => {
    if (cur === 'EUR') return '€';
    if (cur === 'GBP') return '£';
    return '$';
  };

  const getConvertedPrice = (priceInUsdPerOunce: number) => {
    const currencyRate = metalCurrency === 'EUR' ? 0.92 : metalCurrency === 'GBP' ? 0.79 : 1.0;
    let price = priceInUsdPerOunce * currencyRate;
    if (metalUnit === 'gram') {
      price = price / 31.1035;
    }
    return price;
  };

  const getHistoricChartData = () => {
    const isGold = selectedChartAsset === 'XAU';
    const baseVal = isGold ? goldPriceBase : silverPriceBase;
    const currencyRate = metalCurrency === 'EUR' ? 0.92 : metalCurrency === 'GBP' ? 0.79 : 1.0;
    const unitDiv = metalUnit === 'gram' ? 31.1035 : 1.0;

    const convert = (usdPerOunce: number) => {
      return parseFloat(((usdPerOunce * currencyRate) / unitDiv).toFixed(2));
    };

    if (chartDuration === '7d') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const devs = isGold ? [-12, -5, 8, 3, -2, 11, 0] : [0.8, -0.4, 1.2, 0.1, -0.8, -0.2, 0];
      return days.map((day, idx) => ({
        name: day,
        price: convert(baseVal + devs[idx])
      }));
    } else if (chartDuration === '30d') {
      const dataPoints = [];
      const count = 30;
      for (let i = count; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const cycle = Math.sin(i / 3) * (isGold ? 25 : 0.8);
        const noise = Math.cos(i / 1.5) * (isGold ? 8 : 0.25);
        dataPoints.push({
          name: dayStr,
          price: convert(baseVal + cycle + noise)
        });
      }
      return dataPoints;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const devs = isGold 
        ? [-120, -95, -60, -10, 35, 110, 85, 150, 190, 240, 210, 0] 
        : [-3.2, -2.8, -2.1, -1.1, -0.4, 0.8, 1.2, 0.5, 1.6, 2.4, 1.9, 0];
      return months.map((month, idx) => ({
        name: month,
        price: convert(baseVal + devs[idx])
      }));
    }
  };

  const triggerPriceFetch = async () => {
    if (apiProvider === 'demo') {
      setPriceFetchLoading(true);
      setPriceFetchError(null);
      setTimeout(() => {
        const goldDev = (Math.random() - 0.5) * 8;
        const silverDev = (Math.random() - 0.5) * 0.3;
        setGoldPriceBase(prev => parseFloat((prev + goldDev).toFixed(2)));
        setGoldPriceChangeBase(prev => parseFloat((prev + goldDev).toFixed(2)));
        setSilverPriceBase(prev => parseFloat((prev + silverDev).toFixed(2)));
        setSilverPriceChangeBase(prev => parseFloat((prev + silverDev).toFixed(2)));

        const now = new Date();
        const timeStr = now.toLocaleTimeString() + ' (Simulated Feed)';
        setLastPriceFetchTime(timeStr);
        localStorage.setItem('min_eco_last_price_fetch_time', timeStr);
        setPriceFetchLoading(false);
      }, 700);
      return;
    }

    if (!apiKey) {
      setPriceFetchError("Missing API key. Please check setting variables under 'API Integration'.");
      return;
    }

    setPriceFetchLoading(true);
    setPriceFetchError(null);

    try {
      if (apiProvider === 'goldapi') {
        const goldRes = await fetch('https://www.goldapi.io/api/XAU/USD', {
          headers: { 'x-access-token': apiKey }
        });
        if (!goldRes.ok) throw new Error(`GoldAPI connection returned status ${goldRes.status}`);
        const goldData = await goldRes.json();
        
        if (goldData && typeof goldData.price === 'number') {
          setGoldPriceBase(goldData.price);
          if (typeof goldData.chg === 'number') setGoldPriceChangeBase(goldData.chg);
          if (typeof goldData.chg_pct === 'number') setGoldPriceChangePct(goldData.chg_pct);
        }

        const silverRes = await fetch('https://www.goldapi.io/api/XAG/USD', {
          headers: { 'x-access-token': apiKey }
        });
        if (silverRes.ok) {
          const silverData = await silverRes.json();
          if (silverData && typeof silverData.price === 'number') {
            setSilverPriceBase(silverData.price);
            if (typeof silverData.chg === 'number') setSilverPriceChangeBase(silverData.chg);
            if (typeof silverData.chg_pct === 'number') setSilverPriceChangePct(silverData.chg_pct);
          }
        }
      } else if (apiProvider === 'metalpriceapi') {
        const res = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,XAG`);
        if (!res.ok) throw new Error(`MetalpriceAPI returned status ${res.status}`);
        const data = await res.json();
        if (data && data.rates) {
          if (data.rates.USDXAU) {
            const ounceGoldUsd = 1 / data.rates.USDXAU;
            setGoldPriceBase(parseFloat(ounceGoldUsd.toFixed(2)));
          }
          if (data.rates.USDXAG) {
            const ounceSilverUsd = 1 / data.rates.USDXAG;
            setSilverPriceBase(parseFloat(ounceSilverUsd.toFixed(2)));
          }
        } else {
          throw new Error(data?.error?.info || "JSON rates key missing in payload response");
        }
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString() + ' (Connected Live)';
      setLastPriceFetchTime(timeStr);
      localStorage.setItem('min_eco_last_price_fetch_time', timeStr);
    } catch (err: any) {
      console.error(err);
      setPriceFetchError(err?.message || "Operational connection failure while reaching endpoints");
    } finally {
      setPriceFetchLoading(false);
    }
  };

  React.useEffect(() => {
    triggerPriceFetch();
  }, [apiProvider, apiKey]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerSubSection, setBannerSubSection] = useState<'hero' | 'page' | 'titlebar'>('hero');

  // Hero Banner multi-item management state
  const [showAddBannerForm, setShowAddBannerForm] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerPreviewDevice, setBannerPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Input states for hero banner creator/editor
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bDesktopImage, setBDesktopImage] = useState('');
  const [bTabletImage, setBTabletImage] = useState('');
  const [bMobileImage, setBMobileImage] = useState('');
  const [bOverlayOpacity, setBOverlayOpacity] = useState(0.4);
  const [bCtaText, setBCtaText] = useState('EXPLORE COLLECTION');
  const [bCtaLink, setBCtaLink] = useState('#');
  const [bHeightPreset, setBHeightPreset] = useState<'small' | 'medium' | 'large'>('medium');
  const [bAssignedPageSlug, setBAssignedPageSlug] = useState('/');
  const [bSortOrder, setBSortOrder] = useState(1);
  const [bIsActive, setBIsActive] = useState(true);
  const [bSlides, setBSlides] = useState<HeroSliderItem[]>([]);

  // Sub-slide nested edit-form states
  const [sTitle, setSTitle] = useState('');
  const [sSubtitle, setSSubtitle] = useState('');
  const [sDesktopImage, setSDesktopImage] = useState('');
  const [sTabletImage, setSTabletImage] = useState('');
  const [sMobileImage, setSMobileImage] = useState('');
  const [sCtaText, setSCtaText] = useState('EXPLORE COLLECTION');
  const [sCtaLink, setSCtaLink] = useState('#');
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [showAddSlideForm, setShowAddSlideForm] = useState(false);
  const [bannerFormError, setBannerFormError] = useState<string | null>(null);

  const startEditBanner = (banner: HeroBanner) => {
    setEditingBannerId(banner.id);
    setShowAddBannerForm(true);
    setBTitle(banner.title);
    setBSubtitle(banner.subtitle);
    setBDesktopImage(banner.desktopImage);
    setBTabletImage(banner.tabletImage || '');
    setBMobileImage(banner.mobileImage || '');
    setBOverlayOpacity(banner.overlayOpacity);
    setBCtaText(banner.ctaText);
    setBCtaLink(banner.ctaLink);
    setBHeightPreset(banner.heightPreset);
    setBAssignedPageSlug(banner.assignedPageSlug);
    setBSortOrder(banner.sortOrder);
    setBIsActive(banner.isActive);
    setBSlides(banner.slides || []);
    
    // Clear sub-slide forms on main selection
    setSTitle('');
    setSSubtitle('');
    setSDesktopImage('');
    setSTabletImage('');
    setSMobileImage('');
    setSCtaText('EXPLORE COLLECTION');
    setSCtaLink('#');
    setEditingSlideId(null);
    setShowAddSlideForm(false);
  };

  const renderSingleImagePicker = (
    label: string,
    value: string,
    setValue: (val: string) => void,
    targetKey: 'bDesktopImage' | 'bTabletImage' | 'bMobileImage',
    placeholder: string,
    required = false
  ) => {
    return (
      <div className="space-y-1.5 p-3 border border-zinc-200 bg-white shadow-2xs rounded-xl text-left">
        <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">{label}</label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 p-2 bg-zinc-50 text-[10.5px] font-mono border border-zinc-200 rounded-lg outline-none focus:bg-white focus:border-zinc-950 transition-all text-zinc-800"
            placeholder={placeholder}
            required={required}
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          <button
            type="button"
            onClick={() => {
              setMediaSelectorAction('replace');
              setMediaSelectorTarget(targetKey);
            }}
            className="py-1 text-[8.5px] font-mono font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded cursor-pointer transition-all flex items-center justify-center gap-1"
          >
            <FolderOpen className="w-2.5 h-2.5" /> Gallery Vault
          </button>
          <button
            type="button"
            onClick={() => {
              triggerImageFileSelector(targetKey);
            }}
            className="py-1 text-[8.5px] font-mono font-bold bg-zinc-955 hover:bg-zinc-850 text-white rounded cursor-pointer transition-all flex items-center justify-center gap-1"
          >
            <Upload className="w-2.5 h-2.5" /> Upload File
          </button>
        </div>
        {value && (
          <div className="h-16 w-full mt-2 border border-zinc-150 rounded-lg overflow-hidden bg-zinc-50 relative group">
            <img src={value} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute top-1 right-1 bg-black/60 font-mono text-white text-[7px] px-1 py-0.5 rounded select-none">
              DEFAULT PREVIEW
            </div>
            <button
              type="button"
              onClick={() => setValue('')}
              className="absolute inset-0 bg-red-600/85 hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-0 cursor-pointer text-[10px] font-mono font-bold uppercase"
            >
              Clear Image
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bSlides.length === 0) {
      setBannerFormError('At least one configured slide is required inside the FIRST-CLASS SLIDER CAROUSEL to publish or update this banner.');
      return;
    }
    
    setBannerFormError(null);
    const firstSlide = bSlides[0];

    const payload = {
      title: bTitle || 'Sovereign Slide Carousel',
      subtitle: firstSlide.subtitle || '',
      desktopImage: firstSlide.desktopImage || '',
      tabletImage: firstSlide.tabletImage || '',
      mobileImage: firstSlide.mobileImage || '',
      overlayOpacity: Number(bOverlayOpacity),
      ctaText: firstSlide.ctaText || '',
      ctaLink: firstSlide.ctaLink || '',
      heightPreset: bHeightPreset,
      assignedPageSlug: bAssignedPageSlug,
      sortOrder: Number(bSortOrder),
      isActive: bIsActive,
      slides: bSlides,
    };

    if (editingBannerId) {
      editHeroBanner(editingBannerId, payload);
    } else {
      addHeroBanner(payload);
    }

    clearForm();
  };

  const clearForm = () => {
    setEditingBannerId(null);
    setShowAddBannerForm(false);
    setBannerFormError(null);
    setBTitle('');
    setBSubtitle('');
    setBDesktopImage('');
    setBTabletImage('');
    setBMobileImage('');
    setBOverlayOpacity(0.4);
    setBCtaText('EXPLORE COLLECTION');
    setBCtaLink('#');
    setBHeightPreset('medium');
    setBAssignedPageSlug('/');
    setBSortOrder(1);
    setBIsActive(true);
    setBSlides([]);

    // Clear slide editor form
    setSTitle('');
    setSSubtitle('');
    setSDesktopImage('');
    setSTabletImage('');
    setSMobileImage('');
    setSCtaText('EXPLORE COLLECTION');
    setSCtaLink('#');
    setEditingSlideId(null);
    setShowAddSlideForm(false);
  };

  // Header Style / Menu customisation states
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavHref, setNewNavHref] = useState('');
  const [newNavIsMega, setNewNavIsMega] = useState(false);
  const [newNavBannerTitle, setNewNavBannerTitle] = useState('');
  const [newNavImageUrl, setNewNavImageUrl] = useState('');
  const [newNavImageTitle, setNewNavImageTitle] = useState('');
  const [newNavLinksRaw, setNewNavLinksRaw] = useState<Array<{ label: string; href: string }>>([]);
  const [tempSubLabel, setTempSubLabel] = useState('');
  const [tempSubHref, setTempSubHref] = useState('');
  const [editingSubIndex, setEditingSubIndex] = useState<number | null>(null);

  const getSimFontFamily = (family: string) => {
    switch (family) {
      case 'sans': return 'font-sans';
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'grotesk': return 'font-sans font-black';
      default: return 'font-sans';
    }
  };

  const getSimFontSize = (size: string) => {
    switch (size) {
      case 'xs': return 'text-[7px]';
      case 'sm': return 'text-[8px]';
      case 'md': return 'text-[9px]';
      case 'lg': return 'text-[10px]';
      case 'xl': return 'text-[11px]';
      default: return 'text-[8px]';
    }
  };

  const getSimFontWeight = (weight: string) => {
    switch (weight) {
      case 'light': return 'font-light';
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      case 'bold': return 'font-bold';
      case 'extrabold': return 'font-extrabold';
      case 'black': return 'font-black';
      default: return 'font-bold';
    }
  };

  const getSimFontCase = (fontCase: string) => {
    switch (fontCase) {
      case 'uppercase': return 'uppercase tracking-tight';
      case 'uppercase-spaced': return 'uppercase tracking-wider';
      case 'lowercase': return 'lowercase';
      case 'capitalize': return 'capitalize';
      case 'none': return 'normal-case';
      default: return 'uppercase';
    }
  };

  const getSimLineGap = (gap: string) => {
    switch (gap) {
      case 'tiny': return 'py-0.5';
      case 'small': return 'py-1';
      case 'medium': return 'py-1.5';
      case 'large': return 'py-2';
      case 'excessive': return 'py-2.5';
      default: return 'py-1';
    }
  };

  const getSimBlockSpacing = (spacing: string) => {
    switch (spacing) {
      case 'tiny': return 'gap-1';
      case 'small': return 'gap-1.5';
      case 'medium': return 'gap-2';
      case 'large': return 'gap-3';
      case 'excessive': return 'gap-4';
      default: return 'gap-2';
    }
  };

  const getSimColorStyle = (itemId: string, index: number) => {
    const isMockActive = index === 1;

    const colors = {
      amber: { text: 'text-[#d97706]', hover: 'hover:text-[#d97706]', bgActive: 'bg-[#d97706]/10', borderActive: 'border-[#d97706]' },
      emerald: { text: 'text-emerald-700', hover: 'hover:text-emerald-600', bgActive: 'bg-emerald-100/40', borderActive: 'border-emerald-600' },
      sapphire: { text: 'text-blue-700', hover: 'hover:text-blue-600', bgActive: 'bg-blue-100/40', borderActive: 'border-blue-600' },
      ruby: { text: 'text-rose-700', hover: 'hover:text-rose-600', bgActive: 'bg-rose-100/40', borderActive: 'border-rose-600' },
      slate: { text: 'text-zinc-900', hover: 'hover:text-zinc-950', bgActive: 'bg-zinc-100', borderActive: 'border-zinc-900' },
      onyx: { text: 'text-zinc-950', hover: 'hover:text-zinc-950', bgActive: 'bg-zinc-950/10', borderActive: 'border-zinc-950' }
    };

    const scheme = colors[navColorStyle as keyof typeof colors] || colors.amber;

    switch (navPresetStyle) {
      case 'underlined':
        return `border-b ${isMockActive ? `${scheme.text} ${scheme.borderActive}` : 'text-zinc-650 hover:text-zinc-900 border-transparent'}`;
      case 'pill':
        return `px-1.5 rounded-full ${isMockActive ? `${scheme.text} ${scheme.bgActive} border border-zinc-200/50` : 'text-zinc-650'}`;
      case 'rounded-badge':
        return `px-1.5 rounded-md ${isMockActive ? `${scheme.text} ${scheme.bgActive} border border-zinc-200` : 'text-zinc-650 hover:bg-zinc-100/50'}`;
      case 'bordered-button':
        return `px-1.5 border ${isMockActive ? `${scheme.text} ${scheme.borderActive} bg-zinc-50` : 'text-zinc-650 border-transparent hover:border-zinc-300'}`;
      case 'clean-text':
        return `${isMockActive ? `${scheme.text} font-bold` : 'text-zinc-750 hover:text-zinc-950'}`;
      default:
        return `${isMockActive ? 'text-[#d97706] border-b border-[#d97706]' : 'text-zinc-650'}`;
    }
  };

  const startEditNavItem = (item: NavigationItem) => {
    setEditingItem(item);
    setIsAddingItem(false);
    setNewNavLabel(item.label);
    setNewNavHref(item.href);
    setNewNavIsMega(item.isMegaMenu);
    if (item.isMegaMenu && item.megaMenu) {
      setNewNavBannerTitle(item.megaMenu.bannerTitle || '');
      setNewNavImageUrl(item.megaMenu.imageUrl || '');
      setNewNavImageTitle(item.megaMenu.imageTitle || '');
      setNewNavLinksRaw(item.megaMenu.links || []);
    } else {
      setNewNavBannerTitle('');
      setNewNavImageUrl('');
      setNewNavImageTitle('');
      setNewNavLinksRaw([]);
    }
    setTempSubLabel('');
    setTempSubHref('');
    setEditingSubIndex(null);
  };

  const startAddNavItem = () => {
    setEditingItem(null);
    setIsAddingItem(true);
    setNewNavLabel('');
    setNewNavHref('#');
    setNewNavIsMega(false);
    setNewNavBannerTitle('');
    setNewNavImageUrl('');
    setNewNavImageTitle('');
    setNewNavLinksRaw([]);
    setTempSubLabel('');
    setTempSubHref('');
    setEditingSubIndex(null);
  };

  const saveNavItem = () => {
    if (!newNavLabel.trim()) return;

    let megaMenuConf: MegaMenuConfig | undefined = undefined;
    if (newNavIsMega) {
      megaMenuConf = {
        bannerTitle: newNavBannerTitle.trim() || 'LEADING WITH TRANSPARENCY IN THE GLOBAL GOLD INDUSTRY.',
        links: newNavLinksRaw,
        imageUrl: newNavImageUrl.trim() || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&h=300&q=80',
        imageTitle: newNavImageTitle.trim() || 'PUREST STANDARDS, FINEST GOLD'
      };
    }

    if (editingItem) {
      const updated = navigationMenu.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            label: newNavLabel.toUpperCase().trim(),
            href: newNavHref.trim(),
            isMegaMenu: newNavIsMega,
            megaMenu: megaMenuConf
          };
        }
        return item;
      });
      setNavigationMenu(updated);
      setEditingItem(null);
    } else if (isAddingItem) {
      const newItem: NavigationItem = {
        id: `nav-${Date.now()}`,
        label: newNavLabel.toUpperCase().trim(),
        href: newNavHref.trim(),
        isMegaMenu: newNavIsMega,
        megaMenu: megaMenuConf
      };
      setNavigationMenu([...navigationMenu, newItem]);
      setIsAddingItem(false);
    }
  };

  const deleteNavItem = (id: string) => {
    const updated = navigationMenu.filter(item => item.id !== id);
    setNavigationMenu(updated);
    if (editingItem && editingItem.id === id) {
      setEditingItem(null);
    }
  };

  const addSubLink = () => {
    if (!tempSubLabel.trim()) return;
    const labelVal = tempSubLabel.trim();
    const hrefVal = tempSubHref.trim() || '#';

    if (editingSubIndex !== null) {
      const updated = [...newNavLinksRaw];
      updated[editingSubIndex] = { label: labelVal, href: hrefVal };
      setNewNavLinksRaw(updated);
      setEditingSubIndex(null);
    } else {
      setNewNavLinksRaw([
        ...newNavLinksRaw,
        { label: labelVal, href: hrefVal }
      ]);
    }
    setTempSubLabel('');
    setTempSubHref('');
  };

  const removeSubLink = (idx: number) => {
    setNewNavLinksRaw(newNavLinksRaw.filter((_, i) => i !== idx));
    if (editingSubIndex === idx) {
      setEditingSubIndex(null);
      setTempSubLabel('');
      setTempSubHref('');
    } else if (editingSubIndex !== null && editingSubIndex > idx) {
      setEditingSubIndex(editingSubIndex - 1);
    }
  };

  // Admin Customization and Security states
  const [adminLogoText, setAdminLogoTextState] = useState(() => localStorage.getItem('min_eco_logo_text') || 'GOLDIAMA.');
  const [adminLogoLetter, setAdminLogoLetterState] = useState(() => localStorage.getItem('min_eco_logo_letter') || 'G');
  const [adminLogoType, setAdminLogoTypeState] = useState<'letter' | 'image'>(() => (localStorage.getItem('min_eco_logo_type') as 'letter' | 'image') || 'image');
  const [adminLogoImageUrl, setAdminLogoImageUrlState] = useState(() => localStorage.getItem('min_eco_admin_logo_image_url') || localStorage.getItem('min_eco_logo_image_url') || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=128&h=128&q=80');
  const [frontendLogoImageUrl, setFrontendLogoImageUrlState] = useState(() => localStorage.getItem('min_eco_frontend_logo_image_url') || localStorage.getItem('min_eco_logo_image_url') || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&h=128&q=80');
  const [frontendLogoMode, setFrontendLogoModeState] = useState<'classic' | 'image_only'>(() => (localStorage.getItem('min_eco_frontend_logo_mode') || 'classic') as 'classic' | 'image_only');

  // Switch options between Media Vault & Image Host sources
  const [adminLogoSource, setAdminLogoSource] = useState<'vault' | 'host'>('vault');
  const [frontendLogoSource, setFrontendLogoSource] = useState<'vault' | 'host'>('vault');
  const [adminLogoVaultSearch, setAdminLogoVaultSearch] = useState('');
  const [frontendLogoVaultSearch, setFrontendLogoVaultSearch] = useState('');

  const setAdminLogoText = (val: string) => {
    setAdminLogoTextState(val);
    localStorage.setItem('min_eco_logo_text', val);
  };
  const setAdminLogoLetter = (val: string) => {
    setAdminLogoLetterState(val);
    localStorage.setItem('min_eco_logo_letter', val);
  };
  const setAdminLogoType = (val: 'letter' | 'image') => {
    setAdminLogoTypeState(val);
    localStorage.setItem('min_eco_logo_type', val);
  };
  const setAdminLogoImageUrl = (val: string) => {
    setAdminLogoImageUrlState(val);
    localStorage.setItem('min_eco_admin_logo_image_url', val);
  };
  const setFrontendLogoImageUrl = (val: string) => {
    setFrontendLogoImageUrlState(val);
    localStorage.setItem('min_eco_frontend_logo_image_url', val);
  };
  const setFrontendLogoMode = (val: 'classic' | 'image_only') => {
    setFrontendLogoModeState(val);
    localStorage.setItem('min_eco_frontend_logo_mode', val);
  };
  const [sidebarGroups, setSidebarGroups] = useState<string[]>([
    'core',
    'design',
    'kyc',
    'commerce'
  ]);
  const [settingsSubTab, setSettingsSubTab] = useState<'customisation' | 'profile' | 'notifications' | 'api-integration' | 'supabase'>('profile');
  
  // Supabase Database & File Storage Configurations
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('min_eco_supabase_url') || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('min_eco_supabase_anon_key') || '');
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState(() => localStorage.getItem('min_eco_supabase_service_role_key') || '');
  const [supabaseBucketName, setSupabaseBucketName] = useState(() => localStorage.getItem('min_eco_supabase_bucket_name') || 'goldiama-bucket');
  const [supabaseDatabaseSchema, setSupabaseDatabaseSchema] = useState(() => localStorage.getItem('min_eco_supabase_database_schema') || 'public');
  
  // Supabase states
  const [supabaseConnectionStatus, setSupabaseConnectionStatus] = useState<'connected' | 'disconnected' | 'testing' | 'error'>('disconnected');
  const [supabaseConsoleLogs, setSupabaseConsoleLogs] = useState<string[]>(['[System] Supabase Controller online. Provide connection URL & keys to proceed.']);
  const [supabasePing, setSupabasePing] = useState<number | null>(null);
  const [supabaseLastCheckTime, setSupabaseLastCheckTime] = useState<string>('');
  const [showSupabaseKeys, setShowSupabaseKeys] = useState(false);

  // Dual Action & Multi-hosting Cloud Configuration states
  const [activeStorageProvider, setActiveStorageProvider] = useState<'local' | 'supabase' | 's3' | 'cloudinary' | 'custom-api'>(() => {
    const stored = localStorage.getItem('min_eco_active_storage_provider');
    if (stored) return stored as any;
    return 'supabase';
  });
  const [s3Endpoint, setS3Endpoint] = useState(() => localStorage.getItem('min_eco_s3_endpoint') || '');
  const [s3Bucket, setS3Bucket] = useState(() => localStorage.getItem('min_eco_s3_bucket') || '');
  const [s3AccessKey, setS3AccessKey] = useState(() => localStorage.getItem('min_eco_s3_access_key') || '');
  const [s3SecretKey, setS3SecretKey] = useState(() => localStorage.getItem('min_eco_s3_secret_key') || '');
  const [s3Region, setS3Region] = useState(() => localStorage.getItem('min_eco_s3_region') || 'us-east-1');

  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(() => localStorage.getItem('min_eco_cloudinary_cloud_name') || '');
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(() => localStorage.getItem('min_eco_cloudinary_upload_preset') || '');

  const [customApiUrl, setCustomApiUrl] = useState(() => localStorage.getItem('min_eco_custom_api_url') || '');
  const [customApiHeaders, setCustomApiHeaders] = useState(() => localStorage.getItem('min_eco_custom_api_headers') || '{\n  "Authorization": "Bearer your_key_here"\n}');
  const [customApiPayloadType, setCustomApiPayloadType] = useState<'json-base64' | 'multipart'>(() => {
    return (localStorage.getItem('min_eco_custom_api_payload_type') as any) || 'multipart';
  });
  const [customApiKeyName, setCustomApiKeyName] = useState(() => localStorage.getItem('min_eco_custom_api_key_name') || 'file');
  const [customApiUrlSelector, setCustomApiUrlSelector] = useState(() => localStorage.getItem('min_eco_custom_api_url_selector') || 'url');
  const [profileName, setProfileName] = useState('Erik Sorenson');
  const [profileEmail, setProfileEmail] = useState('erik@nordic.co');
  const [profileRole, setProfileRole] = useState('Chief Curator');
  const [profileInitials, setProfileInitials] = useState('ES');
  const [currentPassword, setCurrentPassword] = useState('••••••••••••');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyKyc, setNotifyKyc] = useState(true);
  const [notifyStock, setNotifyStock] = useState(false);
  const [notifySecurity, setNotifySecurity] = useState(true);

  // KYC Onboarding Queue States (Individual)
  const [kycIndividuals, setKycIndividuals] = useState([
    { id: 'KYC-I-081', name: 'Sophia Sterling', email: 'sophia@sterling.design', country: 'Sweden', docType: 'Passport', submittedAt: '2026-05-24', status: 'Pending', docUrl: 'https://images.unsplash.com/photo-1554080353-a576cf803bda' },
    { id: 'KYC-I-079', name: 'Liam Lindqvist', email: 'liam@lindqvist.se', country: 'Norway', docType: 'Driving License', submittedAt: '2026-05-22', status: 'Approved', docUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' },
    { id: 'KYC-I-078', name: 'Hannah Vance', email: 'hannah@vance.co', country: 'Denmark', docType: 'National ID Card', submittedAt: '2026-05-21', status: 'Under Review', docUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d' },
    { id: 'KYC-I-075', name: 'Marcus Aurel', email: 'marcus@aurelius.it', country: 'Finland', docType: 'Passport', submittedAt: '2026-05-18', status: 'Declined', docUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' }
  ]);
  const [newIndName, setNewIndName] = useState('');
  const [newIndEmail, setNewIndEmail] = useState('');
  const [newIndCountry, setNewIndCountry] = useState('Sweden');
  const [newIndDocType, setNewIndDocType] = useState('Passport');

  // KYC Onboarding Queue States (Corporate)
  const [kycCorporates, setKycCorporates] = useState([
    { id: 'KYC-C-401', companyName: 'Aalto Workspace Oy', regNumber: 'FI3920192', uboName: 'Alvar Aalto', country: 'Finland', complianceOfficer: 'Elissa Aalto', submittedAt: '2026-05-25', status: 'Pending', verifiedShares: '85%' },
    { id: 'KYC-C-398', companyName: 'Stockholm Woodworks AB', regNumber: 'SE5590212', uboName: 'Gustav Vasa', country: 'Sweden', complianceOfficer: 'Karl XII', submittedAt: '2026-05-20', status: 'Approved', verifiedShares: '100%' },
    { id: 'KYC-C-392', companyName: 'Hygge Living ApS', regNumber: 'DK2910405', uboName: 'Mads Mikkelsen', country: 'Denmark', complianceOfficer: 'Soren Kierkegaard', submittedAt: '2026-05-15', status: 'Under Review', verifiedShares: '50%' },
    { id: 'KYC-C-390', companyName: 'Oslo Fjord Design', regNumber: 'NO9201048', uboName: 'Edvard Munch', country: 'Norway', complianceOfficer: 'Henrik Ibsen', submittedAt: '2026-05-10', status: 'Declined', verifiedShares: '0%' }
  ]);
  const [newCorpName, setNewCorpName] = useState('');
  const [newCorpReg, setNewCorpReg] = useState('');
  const [newCorpUbo, setNewCorpUbo] = useState('');
  const [newCorpCountry, setNewCorpCountry] = useState('Sweden');
  const [newCorpOfficer, setNewCorpOfficer] = useState('');

  // Submenu toggle state
  const [isOrdersMenuExpanded, setIsOrdersMenuExpanded] = useState(true);

  // New Menu States (Interactive Panels)
  // 1. Header Section Settings State
  const [headerNoticeText, setHeaderNoticeText] = useState(() => localStorage.getItem('min_eco_header_notice') || 'FREE WORLDWIDE SECURED INSURED COURIER DISPATCH FOR ALL DEPOSITS');
  const [headerShowNotice, setHeaderShowNotice] = useState(() => localStorage.getItem('min_eco_header_show_notice') !== 'false');
  const [headerNoticeAlign, setHeaderNoticeAlign] = useState(() => localStorage.getItem('min_eco_header_notice_align') || 'center');
  const [headerEstablished, setHeaderEstablished] = useState(() => localStorage.getItem('min_eco_header_established') || 'LTD ESTABLISHED 2001');
  const [headerEstablishedAlign, setHeaderEstablishedAlign] = useState(() => localStorage.getItem('min_eco_header_established_align') || 'left');
  const [headerLogoText, setHeaderLogoText] = useState('NORDIC.');
  const [headerSticky, setHeaderSticky] = useState(() => localStorage.getItem('min_eco_header_sticky') !== 'false');
  const [headerShowCart, setHeaderShowCart] = useState(() => localStorage.getItem('min_eco_header_show_cart') !== 'false');
  const [headerShowSearch, setHeaderShowSearch] = useState(() => localStorage.getItem('min_eco_header_show_search') !== 'false');
  const [headerSupportPillsSize, setHeaderSupportPillsSize] = useState(() => localStorage.getItem('min_eco_header_support_pills_size') || 'S');
  const [headerShowCompliance, setHeaderShowCompliance] = useState(() => localStorage.getItem('min_eco_header_show_compliance') !== 'false');
  const [headerComplianceLabel, setHeaderComplianceLabel] = useState(() => localStorage.getItem('min_eco_header_compliance_label') || 'Compliance Portal');
  const [headerComplianceIcon, setHeaderComplianceIcon] = useState(() => localStorage.getItem('min_eco_header_compliance_icon') || 'ShieldCheck');
  const [headerComplianceAction, setHeaderComplianceAction] = useState(() => localStorage.getItem('min_eco_header_compliance_action') || 'popup');
  const [headerComplianceUrl, setHeaderComplianceUrl] = useState(() => localStorage.getItem('min_eco_header_compliance_url') || '');
  const [headerCompliancePopupTitle, setHeaderCompliancePopupTitle] = useState(() => localStorage.getItem('min_eco_header_compliance_popup_title') || 'Legal Audit & Compliance Portal');
  const [headerCompliancePopupBadge, setHeaderCompliancePopupBadge] = useState(() => localStorage.getItem('min_eco_header_compliance_popup_badge') || 'GOLDIAMA REGULATION MATRIX');
  const [headerComplianceSec1Title, setHeaderComplianceSec1Title] = useState(() => localStorage.getItem('min_eco_header_compliance_sec1_title') || '1. Ethical Mineral Sourcing Assurance');
  const [headerComplianceSec1Text, setHeaderComplianceSec1Text] = useState(() => localStorage.getItem('min_eco_header_compliance_sec1_text') || 'All Gold, Silver, and Platinum bullion listed in the Goldiama catalog is certified conflict-free, fully audited in compliance with the LBMA Responsible Gold Guidance and OECD Due Diligence regulations.');
  const [headerComplianceSec2Title, setHeaderComplianceSec2Title] = useState(() => localStorage.getItem('min_eco_header_compliance_sec2_title') || '2. GIA & HRD Diamond Certification Standards');
  const [headerComplianceSec2Text, setHeaderComplianceSec2Text] = useState(() => localStorage.getItem('min_eco_header_compliance_sec2_text') || 'Every loose diamond and bespoke couture jewelry piece priced over $5,055 USD is delivered with an official GIA (Gemological Institute of America) digital ledger and laser-inscribed monogram serial numbering.');
  const [headerComplianceSec3Title, setHeaderComplianceSec3Title] = useState(() => localStorage.getItem('min_eco_header_compliance_sec3_title') || '3. Digital Vaulting & Sovereign Cold Storage');
  const [headerComplianceSec3Text, setHeaderComplianceSec3Text] = useState(() => localStorage.getItem('min_eco_header_compliance_sec3_text') || 'Customers may opt for absolute physical home courier delivery or high-security bond vaulted allocations situated in Geneva (Switzerland) with real-time digital asset verification logs.');

  const [headerShowConcierge, setHeaderShowConcierge] = useState(() => localStorage.getItem('min_eco_header_show_concierge') !== 'false');
  const [headerConciergeLabel, setHeaderConciergeLabel] = useState(() => localStorage.getItem('min_eco_header_concierge_label') || 'Get In touch');
  const [headerConciergeIcon, setHeaderConciergeIcon] = useState(() => localStorage.getItem('min_eco_header_concierge_icon') || 'Sparkles');
  const [headerConciergeAction, setHeaderConciergeAction] = useState(() => localStorage.getItem('min_eco_header_concierge_action') || 'popup');
  const [headerConciergeUrl, setHeaderConciergeUrl] = useState(() => localStorage.getItem('min_eco_header_concierge_url') || '');
  const [headerConciergePopupTitle, setHeaderConciergePopupTitle] = useState(() => localStorage.getItem('min_eco_header_compliance_popup_title') || 'Global Concierge & Bespoke Hotline');
  const [headerConciergePopupBadge, setHeaderConciergePopupBadge] = useState(() => localStorage.getItem('min_eco_header_concierge_popup_badge') || 'CRAVING TAILORED LUXURY?');
  const [headerConciergePopupSub, setHeaderConciergePopupSub] = useState(() => localStorage.getItem('min_eco_header_concierge_popup_sub') || 'Please approach our senior curators and sales officers to design custom coins, bespoke weight bars, or schedule secure diamond viewings.');
  const [headerConciergeBox1Title, setHeaderConciergeBox1Title] = useState(() => localStorage.getItem('min_eco_header_concierge_box1_title') || 'PRIVATE MINTING HOTLINE');
  const [headerConciergeBox1Val, setHeaderConciergeBox1Val] = useState(() => localStorage.getItem('min_eco_header_concierge_box1_val') || '+41 (22) 505-8820');
  const [headerConciergeBox1Tag, setHeaderConciergeBox1Tag] = useState(() => localStorage.getItem('min_eco_header_concierge_box1_tag') || 'GENEVA SEAT');
  const [headerConciergeBox2Title, setHeaderConciergeBox2Title] = useState(() => localStorage.getItem('min_eco_header_concierge_box2_title') || 'SECURE TELEGRAM CHANNEL');
  const [headerConciergeBox2Val, setHeaderConciergeBox2Val] = useState(() => localStorage.getItem('min_eco_header_concierge_box2_val') || '@GoldiamaRoyalConcierge');
  const [headerConciergeBox2Tag, setHeaderConciergeBox2Tag] = useState(() => localStorage.getItem('min_eco_header_concierge_box2_tag') || '24/7 CURATED DISPATCH');
  const [headerConciergeHighlightTitle, setHeaderConciergeHighlightTitle] = useState(() => localStorage.getItem('min_eco_header_concierge_highlight_title') || 'Book Private Curated Viewings');
  const [headerConciergeHighlightText, setHeaderConciergeHighlightText] = useState(() => localStorage.getItem('min_eco_header_concierge_highlight_text') || 'Our private galleries are open for premium physical viewing by appointment only in the Zurich Financial Center and Geneva Gold Quay.');
  const [headerConciergeHighlightLabel, setHeaderConciergeHighlightLabel] = useState(() => localStorage.getItem('min_eco_header_concierge_highlight_label') || 'SCHEDULE AN APPOINTMENT AT:');
  const [headerConciergeHighlightVal, setHeaderConciergeHighlightVal] = useState(() => localStorage.getItem('min_eco_header_concierge_highlight_val') || 'VIP@GOLDIAMA.CO');

  const [complianceSections, setComplianceSections] = useState<{ title: string; text: string; highlighted?: boolean }[]>(() => {
    const saved = localStorage.getItem('min_eco_header_compliance_sections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed parsing saved compliance sections", e);
      }
    }
    const s1Title = localStorage.getItem('min_eco_header_compliance_sec1_title') || '1. Ethical Mineral Sourcing Assurance';
    const s1Text = localStorage.getItem('min_eco_header_compliance_sec1_text') || 'All Gold, Silver, and Platinum bullion listed in the Goldiama catalog is certified conflict-free, fully audited in compliance with the LBMA Responsible Gold Guidance and OECD Due Diligence regulations.';
    const s2Title = localStorage.getItem('min_eco_header_compliance_sec2_title') || '2. GIA & HRD Diamond Certification Standards';
    const s2Text = localStorage.getItem('min_eco_header_compliance_sec2_text') || 'Every loose diamond and bespoke couture jewelry piece priced over $5,055 USD is delivered with an official GIA (Gemological Institute of America) digital ledger and laser-inscribed monogram serial numbering.';
    const s3Title = localStorage.getItem('min_eco_header_compliance_sec3_title') || '3. Digital Vaulting & Sovereign Cold Storage';
    const s3Text = localStorage.getItem('min_eco_header_compliance_sec3_text') || 'Customers may opt for absolute physical home courier delivery or high-security bond vaulted allocations situated in Geneva (Switzerland) with real-time digital asset verification logs.';
    return [
      { title: s1Title, text: s1Text },
      { title: s2Title, text: s2Text },
      { title: s3Title, text: s3Text, highlighted: true }
    ];
  });

  const [conciergeBoxes, setConciergeBoxes] = useState<{ title: string; val: string; tag: string }[]>(() => {
    const saved = localStorage.getItem('min_eco_header_concierge_boxes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed parsing saved concierge boxes", e);
      }
    }
    const b1Title = localStorage.getItem('min_eco_header_concierge_box1_title') || 'PRIVATE MINTING HOTLINE';
    const b1Val = localStorage.getItem('min_eco_header_concierge_box1_val') || '+41 (22) 505-8820';
    const b1Tag = localStorage.getItem('min_eco_header_concierge_box1_tag') || 'GENEVA SEAT';
    const b2Title = localStorage.getItem('min_eco_header_concierge_box2_title') || 'SECURE TELEGRAM CHANNEL';
    const b2Val = localStorage.getItem('min_eco_header_concierge_box2_val') || '@GoldiamaRoyalConcierge';
    const b2Tag = localStorage.getItem('min_eco_header_concierge_box2_tag') || '24/7 CURATED DISPATCH';
    return [
      { title: b1Title, val: b1Val, tag: b1Tag },
      { title: b2Title, val: b2Val, tag: b2Tag }
    ];
  });

  const [mockHoverItem, setMockHoverItem] = useState<string | null>(null);
  const [headerSavedToast, setHeaderSavedToast] = useState(false);
  const [globalSaveToast, setGlobalSaveToast] = useState<{
    show: boolean;
    title: string;
    subtitle?: string;
    type: 'success' | 'info' | 'error';
  }>({ show: false, title: '', type: 'success' });
  const [showSaveAllDetailsModal, setShowSaveAllDetailsModal] = useState(false);

  const [frontendShowBrandNameText, setFrontendShowBrandNameText] = useState(() => localStorage.getItem('min_eco_show_brand_name_text') !== 'false');
  const [frontendShowBrandEmblem, setFrontendShowBrandEmblem] = useState(() => localStorage.getItem('min_eco_show_brand_emblem') !== 'false');
  const [frontendShowEstablishedCaption, setFrontendShowEstablishedCaption] = useState(() => localStorage.getItem('min_eco_show_established_caption') !== 'false');
  const [frontendLogoSize, setFrontendLogoSize] = useState<'M' | 'L' | 'XL' | 'XXL'>(() => (localStorage.getItem('min_eco_frontend_logo_size') || 'M') as 'M' | 'L' | 'XL' | 'XXL');

  // Dynamic simulation scale classes
  const simImageOnlyClass = 
    frontendLogoSize === 'L' ? 'h-6.5 max-w-[105px]' :
    frontendLogoSize === 'XL' ? 'h-8 max-w-[125px]' :
    frontendLogoSize === 'XXL' ? 'h-10 max-w-[155px]' :
    'h-5 max-w-[80px]';

  const simEmblemImageClass = 
    frontendLogoSize === 'L' ? 'h-6.5 max-h-6.5' :
    frontendLogoSize === 'XL' ? 'h-8 max-h-8' :
    frontendLogoSize === 'XXL' ? 'h-10 max-h-10' :
    'h-5 max-h-5';

  const simEmblemLetterClass = 
    frontendLogoSize === 'L' ? 'w-6.5 h-6.5 text-[10px]' :
    frontendLogoSize === 'XL' ? 'w-8 h-8 text-[12px]' :
    frontendLogoSize === 'XXL' ? 'w-10 h-10 text-[14px]' :
    'w-5 h-5 text-[8px]';

  const simBrandNameTextClass = 
    frontendLogoSize === 'L' ? 'text-[11px]' :
    frontendLogoSize === 'XL' ? 'text-[13px]' :
    frontendLogoSize === 'XXL' ? 'text-[15px]' :
    'text-[9px]';

  const simEstablishedCaptionClass = 
    frontendLogoSize === 'L' ? 'text-[6px]' :
    frontendLogoSize === 'XL' ? 'text-[7px]' :
    frontendLogoSize === 'XXL' ? 'text-[8px]' :
    'text-[5px]';

  // 2. Footer Section Settings State
  const [footerCopyrightText, setFooterCopyrightText] = useState(() => localStorage.getItem('min_eco_footer_copyright') || '© 2026 GOLDIAMA LTD. Curated Sourcing & Precious Metals.');
  const [footerShowNewsletter, setFooterShowNewsletter] = useState(() => localStorage.getItem('min_eco_footer_show_newsletter') !== 'false');
  const [footerShowPaymentBadges, setFooterShowPaymentBadges] = useState(() => localStorage.getItem('min_eco_footer_show_payment_badges') !== 'false');
  const [footerEmailPlaceholder, setFooterEmailPlaceholder] = useState(() => localStorage.getItem('min_eco_footer_email_placeholder') || 'newsletter@goldiama.com');

  // 3. Typography Settings State
  const [typographyHeadingFont, setTypographyHeadingFont] = useState(() => localStorage.getItem('min_eco_typo_heading_font') || 'Gilda Display');
  const [typographyBodyFont, setTypographyBodyFont] = useState(() => localStorage.getItem('min_eco_typo_body_font') || 'Montserrat');
  const [typographyHeadingLetterSpacing, setTypographyHeadingLetterSpacing] = useState('tight'); // legacy fallback
  const [typographyHeadingTextTransform, setTypographyHeadingTextTransform] = useState('uppercase'); // legacy fallback

  const [selectedTypoElement, setSelectedTypoElement] = useState<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body'>('h1');

  // H1 Style States
  const [typoH1Font, setTypoH1Font] = useState(() => localStorage.getItem('min_eco_typo_h1_font') || 'heading');
  const [typoH1Weight, setTypoH1Weight] = useState(() => localStorage.getItem('min_eco_typo_h1_weight') || '700');
  const [typoH1Transform, setTypoH1Transform] = useState(() => localStorage.getItem('min_eco_typo_h1_transform') || 'uppercase');
  const [typoH1Spacing, setTypoH1Spacing] = useState(() => localStorage.getItem('min_eco_typo_h1_spacing') || 'tight');
  const [typoH1Size, setTypoH1Size] = useState(() => localStorage.getItem('min_eco_typo_h1_size') || '100%');
  const [typoH1LineHeight, setTypoH1LineHeight] = useState(() => localStorage.getItem('min_eco_typo_h1_line_height') || '1.1');

  // H2 Style States
  const [typoH2Font, setTypoH2Font] = useState(() => localStorage.getItem('min_eco_typo_h2_font') || 'heading');
  const [typoH2Weight, setTypoH2Weight] = useState(() => localStorage.getItem('min_eco_typo_h2_weight') || '700');
  const [typoH2Transform, setTypoH2Transform] = useState(() => localStorage.getItem('min_eco_typo_h2_transform') || 'uppercase');
  const [typoH2Spacing, setTypoH2Spacing] = useState(() => localStorage.getItem('min_eco_typo_h2_spacing') || 'tight');
  const [typoH2Size, setTypoH2Size] = useState(() => localStorage.getItem('min_eco_typo_h2_size') || '100%');
  const [typoH2LineHeight, setTypoH2LineHeight] = useState(() => localStorage.getItem('min_eco_typo_h2_line_height') || '1.2');

  // H3 Style States
  const [typoH3Font, setTypoH3Font] = useState(() => localStorage.getItem('min_eco_typo_h3_font') || 'heading');
  const [typoH3Weight, setTypoH3Weight] = useState(() => localStorage.getItem('min_eco_typo_h3_weight') || '600');
  const [typoH3Transform, setTypoH3Transform] = useState(() => localStorage.getItem('min_eco_typo_h3_transform') || 'uppercase');
  const [typoH3Spacing, setTypoH3Spacing] = useState(() => localStorage.getItem('min_eco_typo_h3_spacing') || 'normal');
  const [typoH3Size, setTypoH3Size] = useState(() => localStorage.getItem('min_eco_typo_h3_size') || '100%');
  const [typoH3LineHeight, setTypoH3LineHeight] = useState(() => localStorage.getItem('min_eco_typo_h3_line_height') || '1.25');

  // H4 Style States
  const [typoH4Font, setTypoH4Font] = useState(() => localStorage.getItem('min_eco_typo_h4_font') || 'body');
  const [typoH4Weight, setTypoH4Weight] = useState(() => localStorage.getItem('min_eco_typo_h4_weight') || '700');
  const [typoH4Transform, setTypoH4Transform] = useState(() => localStorage.getItem('min_eco_typo_h4_transform') || 'uppercase');
  const [typoH4Spacing, setTypoH4Spacing] = useState(() => localStorage.getItem('min_eco_typo_h4_spacing') || 'normal');
  const [typoH4Size, setTypoH4Size] = useState(() => localStorage.getItem('min_eco_typo_h4_size') || '100%');
  const [typoH4LineHeight, setTypoH4LineHeight] = useState(() => localStorage.getItem('min_eco_typo_h4_line_height') || '1.3');

  // H5 Style States
  const [typoH5Font, setTypoH5Font] = useState(() => localStorage.getItem('min_eco_typo_h5_font') || 'body');
  const [typoH5Weight, setTypoH5Weight] = useState(() => localStorage.getItem('min_eco_typo_h5_weight') || '600');
  const [typoH5Transform, setTypoH5Transform] = useState(() => localStorage.getItem('min_eco_typo_h5_transform') || 'none');
  const [typoH5Spacing, setTypoH5Spacing] = useState(() => localStorage.getItem('min_eco_typo_h5_spacing') || 'normal');
  const [typoH5Size, setTypoH5Size] = useState(() => localStorage.getItem('min_eco_typo_h5_size') || '100%');
  const [typoH5LineHeight, setTypoH5LineHeight] = useState(() => localStorage.getItem('min_eco_typo_h5_line_height') || '1.4');

  // H6 Style States
  const [typoH6Font, setTypoH6Font] = useState(() => localStorage.getItem('min_eco_typo_h6_font') || 'body');
  const [typoH6Weight, setTypoH6Weight] = useState(() => localStorage.getItem('min_eco_typo_h6_weight') || '500');
  const [typoH6Transform, setTypoH6Transform] = useState(() => localStorage.getItem('min_eco_typo_h6_transform') || 'none');
  const [typoH6Spacing, setTypoH6Spacing] = useState(() => localStorage.getItem('min_eco_typo_h6_spacing') || 'normal');
  const [typoH6Size, setTypoH6Size] = useState(() => localStorage.getItem('min_eco_typo_h6_size') || '100%');
  const [typoH6LineHeight, setTypoH6LineHeight] = useState(() => localStorage.getItem('min_eco_typo_h6_line_height') || '1.4');

  // Body Style States
  const [typoBodyFontChoice, setTypoBodyFontChoice] = useState(() => localStorage.getItem('min_eco_typo_body_font') || 'body');
  const [typoBodyWeight, setTypoBodyWeight] = useState(() => localStorage.getItem('min_eco_typo_body_weight') || '400');
  const [typoBodyTransform, setTypoBodyTransform] = useState(() => localStorage.getItem('min_eco_typo_body_transform') || 'none');
  const [typoBodySpacing, setTypoBodySpacing] = useState(() => localStorage.getItem('min_eco_typo_body_spacing') || 'normal');
  const [typoBodySize, setTypoBodySize] = useState(() => localStorage.getItem('min_eco_typo_body_size') || '100%');
  const [typoBodyLineHeight, setTypoBodyLineHeight] = useState(() => localStorage.getItem('min_eco_typo_body_line_height') || '1.5');

  // 4. Pages list state - migrated to StoreContext for unified real-time reactivity

  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageTemplate, setNewPageTemplate] = useState('Bento Showcase');
  const [newPageSeoTitle, setNewPageSeoTitle] = useState('');
  const [newPageSeoDesc, setNewPageSeoDesc] = useState('');
  const [newPageSeoKeywords, setNewPageSeoKeywords] = useState('');

  // Editing state for pages list
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const [editingTemplate, setEditingTemplate] = useState('Bento Showcase');
  const [editingSeoTitle, setEditingSeoTitle] = useState('');
  const [editingSeoDesc, setEditingSeoDesc] = useState('');
  const [editingSeoKeywords, setEditingSeoKeywords] = useState('');
  const [editingShowBreadcrumbs, setEditingShowBreadcrumbs] = useState(true);

  // Compact modal trigger state for viewing
  const [viewingPage, setViewingPage] = useState<any | null>(null);

  // States for Page Layout Design settings
  const [layoutPreset, setLayoutPreset] = useState<'comfortable' | 'compact' | 'flush'>(() => {
    return (localStorage.getItem('min_eco_layout_preset') || 'comfortable') as any;
  });
  const [containerMode, setContainerMode] = useState<'boxed' | 'full-width' | 'split-panels'>(() => {
    return (localStorage.getItem('min_eco_container_mode') || 'boxed') as any;
  });
  const [sectionAlign, setSectionAlign] = useState<'left' | 'center' | 'justify'>(() => {
    return (localStorage.getItem('min_eco_section_align') || 'center') as any;
  });
  const [layoutDesignSaveSuccess, setLayoutDesignSaveSuccess] = useState(false);

  // 5. Media Gallery list state
  const [mediaItems, setMediaItems] = useState<{
    id: string;
    name: string;
    size: string;
    url: string;
    category: string;
    altText?: string;
    focusKeywords?: string;
    caption?: string;
    metaTitle?: string;
    descriptionSEO?: string;
  }[]>(() => {
    const saved = localStorage.getItem('min_eco_media_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: '1001', name: 'nordic_chair_side.jpg', size: '1.2 MB', url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c', category: 'Product', altText: 'Minimal Nordic wooden chair side view', focusKeywords: 'nordic, wooden chair, dining chair', caption: 'Handcrafted Nordic oak dining chair', metaTitle: 'Nordic Oak Dining Chair | Goldiama Showcase', descriptionSEO: 'Premium organic timber seat matching minimalist workspaces.' },
      { id: '1002', name: 'lighting_ambient_lens.jpg', size: '840 KB', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c', category: 'Banner', altText: 'Warm ambient lighting suspended bulb', focusKeywords: 'ambient bulb, bronze fixture, soft light', caption: 'Serrated bronze filament dome light fixture', metaTitle: 'Industrial Ambient Dome Lighting', descriptionSEO: 'Aesthetic brushed copper lighting solutions for design studies.' },
      { id: '1003', name: 'workspace_setup_neutral.jpg', size: '2.1 MB', url: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2', category: 'Hero', altText: 'Bright minimalist desk setup on cork mat', focusKeywords: 'neutral desk, office, concrete plant', caption: 'Bright home office setup with concrete planters', metaTitle: 'Bright Office Concept Workspace Storefront', descriptionSEO: 'Modern workplace accessories with rich earth-tone alignments.' },
      { id: '1004', name: 'minimal_mat_texture.jpg', size: '1.9 MB', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', category: 'Product', altText: 'Woven organic kitchen mat fiber close up', focusKeywords: 'organic runner, seagrass rug, entry mat', caption: 'Rough-texture seagrass kitchen runner', metaTitle: 'Textured Seagrass Indoor Entry Rug', descriptionSEO: 'Earth-friendly heavy woven organic runners for high traffic areas.' }
    ];
  });

  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isMediaDragging, setIsMediaDragging] = useState(false);
  const mediaFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [mediaSelectorTarget, setMediaSelectorTarget] = useState<'bDesktopImage' | 'bTabletImage' | 'bMobileImage' | 'pageBannerBgUrl' | 'sDesktopImage' | 'sTabletImage' | 'sMobileImage' | 'newNavImageUrl' | null>(null);
  const [mediaSelectorAction, setMediaSelectorAction] = useState<'replace' | 'append'>('replace');
  const [isUploadingImage, setIsUploadingImage] = useState<string | null>(null);

  const handleDirectImageUpload = async (file: File, targetField: 'bDesktopImage' | 'bTabletImage' | 'bMobileImage' | 'pageBannerBgUrl' | 'sDesktopImage' | 'sTabletImage' | 'sMobileImage' | 'newNavImageUrl') => {
    try {
      setIsUploadingImage(targetField);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        try {
          
          // Try fetching standard server-side upload path
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: file.name, dataUrl })
          });
          
          if (!res.ok) {
            throw new Error('Upload server HTTP error.');
          }
          
          const payload = await res.json();
          if (payload.success && payload.url) {
            const sizeStr = payload.size || `${(file.size / 1024).toFixed(0)} KB`;
            const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            
            const matchTimestamp = payload.name ? payload.name.match(/^(\d+)_/) : null;
            const numericId = matchTimestamp ? matchTimestamp[1] : String(Date.now());
            const newMedItem = {
              id: numericId,
              name: payload.name,
              size: sizeStr,
              url: payload.url,
              category: 'Banner',
              altText: `${baseName} photo asset`,
              focusKeywords: baseName.split(' ').slice(0, 3).join(', '),
              caption: `Uploaded image detailing ${baseName}`,
              metaTitle: `${baseName} | Goldiama Showcase`,
              descriptionSEO: `High-resolution studio asset showing ${baseName} for online inventory.`
            };
            
            const updated = [...mediaItems, newMedItem];
            saveMediaItemsToStorage(updated);
            
            const appendOrReplace = (prevVal: string, newVal: string): string => {
              if (mediaSelectorAction === 'append' && prevVal) {
                const currentUrls = splitImageUrls(prevVal);
                currentUrls.push(newVal);
                return currentUrls.join(',');
              }
              return newVal;
            };

            if (targetField === 'bDesktopImage') setBDesktopImage(prev => appendOrReplace(prev, payload.url));
            else if (targetField === 'bTabletImage') setBTabletImage(prev => appendOrReplace(prev, payload.url));
            else if (targetField === 'bMobileImage') setBMobileImage(prev => appendOrReplace(prev, payload.url));
            else if (targetField === 'pageBannerBgUrl') setPageBannerBgUrl(prev => appendOrReplace(prev, payload.url));
            else if (targetField === 'sDesktopImage') setSDesktopImage(payload.url);
            else if (targetField === 'sTabletImage') setSTabletImage(payload.url);
            else if (targetField === 'sMobileImage') setSMobileImage(payload.url);
          } else {
            throw new Error('No url returned');
          }
        } catch (serverErr) {
          console.warn("Server upload failed, falling back to local base64 storage:", serverErr);
          // Fallback to offline/browser pure DataURL storage
          const sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
          const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          const fallbackMed = {
            id: String(Date.now()),
            name: file.name,
            size: sizeStr,
            url: dataUrl,
            category: 'Banner',
            altText: `${baseName} local asset`,
            focusKeywords: baseName.split(' ').slice(0, 3).join(', '),
            caption: `Local image describing ${baseName}`,
            metaTitle: `${baseName} | Goldiama Showcase`,
            descriptionSEO: `Offline client-stored image for ${baseName}.`
          };
          const updated = [...mediaItems, fallbackMed];
          saveMediaItemsToStorage(updated);
          
          const appendOrReplace = (prevVal: string, newVal: string): string => {
            if (mediaSelectorAction === 'append' && prevVal) {
              const currentUrls = splitImageUrls(prevVal);
              currentUrls.push(newVal);
              return currentUrls.join(',');
            }
            return newVal;
          };

          if (targetField === 'bDesktopImage') setBDesktopImage(prev => appendOrReplace(prev, dataUrl));
          else if (targetField === 'bTabletImage') setBTabletImage(prev => appendOrReplace(prev, dataUrl));
          else if (targetField === 'bMobileImage') setBMobileImage(prev => appendOrReplace(prev, dataUrl));
          else if (targetField === 'pageBannerBgUrl') setPageBannerBgUrl(prev => appendOrReplace(prev, dataUrl));
          else if (targetField === 'sDesktopImage') setSDesktopImage(dataUrl);
          else if (targetField === 'sTabletImage') setSTabletImage(dataUrl);
          else if (targetField === 'sMobileImage') setSMobileImage(dataUrl);
          else if (targetField === 'newNavImageUrl') setNewNavImageUrl(dataUrl);
        } finally {
          setIsUploadingImage(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setIsUploadingImage(null);
    }
  };

  const triggerImageFileSelector = (targetField: 'bDesktopImage' | 'bTabletImage' | 'bMobileImage' | 'pageBannerBgUrl' | 'sDesktopImage' | 'sTabletImage' | 'sMobileImage' | 'newNavImageUrl') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        handleDirectImageUpload(file, targetField);
      }
    };
    input.click();
  };

  // Local SEO states
  const [seoAltText, setSeoAltText] = useState('');
  const [seoFocusKeywords, setSeoFocusKeywords] = useState('');
  const [seoCaption, setSeoCaption] = useState('');
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoCategory, setSeoCategory] = useState('Product');
  const [seoSuccessMessage, setSeoSuccessMessage] = useState(false);

  // Save utility helper
  const saveMediaItemsToStorage = (items: typeof mediaItems) => {
    setMediaItems(items);
    localStorage.setItem('min_eco_media_items', JSON.stringify(items));
  };

  // Custom folder support states
  const [customFolderInput, setCustomFolderInput] = useState('Root');
  const [availableFolders, setAvailableFolders] = useState<string[]>(['Root']);
  const [selectedFolderFilter, setSelectedFolderFilter] = useState('All');

  // Custom Image URL registration states
  const [customUrlRegisterVal, setCustomUrlRegisterVal] = useState('');
  const [customUrlRegisterName, setCustomUrlRegisterName] = useState('');
  const [customUrlRegisterCat, setCustomUrlRegisterCat] = useState('Product');

  const recordImageUsageInGallery = (url: string | null | undefined, name?: string, category?: string) => {
    if (!url) return;
    const urlsToProcess = url.split(',').map(u => u.trim()).filter(Boolean);
    
    setMediaItems(prevItems => {
      let updated = [...prevItems];
      let changed = false;
      
      urlsToProcess.forEach((singleUrl) => {
        if (!singleUrl || singleUrl.startsWith('data:')) return;
        
        const exists = updated.some(item => item.url === singleUrl);
        if (!exists) {
          const cleanName = name || singleUrl.split('/').pop()?.split('?')[0] || `assigned_${Date.now()}`;
          const defaultCategory = category || 'Standard';
          const newMedItem = {
            id: String(Date.now() + Math.random() * 10000).replace('.', ''),
            name: cleanName.endsWith('.jpg') || cleanName.endsWith('.png') || cleanName.endsWith('.webp') || cleanName.endsWith('.svg') ? cleanName : `${cleanName}.jpg`,
            size: 'External',
            url: singleUrl,
            category: defaultCategory,
            folder: 'Root',
            altText: `Assigned asset: ${cleanName}`,
            focusKeywords: 'assigned, custom-url',
            caption: 'External custom image asset',
            metaTitle: 'External Registered Asset',
            descriptionSEO: 'Successfully assigned and registered link inside our media storage catalog.'
          };
          updated.push(newMedItem);
          changed = true;
        }
      });
      
      if (changed) {
        localStorage.setItem('min_eco_media_items', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleRegisterCustomImageUrl = (url: string, name?: string, category?: string) => {
    if (!url || !url.trim()) return;
    const cleanUrl = url.trim();
    const cleanName = name?.trim() || cleanUrl.split('/').pop()?.split('?')[0] || `registered_url_${Date.now()}`;
    const cleanCat = category || 'Standard';
    recordImageUsageInGallery(cleanUrl, cleanName, cleanCat);
    setCustomUrlRegisterVal('');
    setCustomUrlRegisterName('');
    alert('Custom Image URL was registered in your Media Gallery successfully!');
  };

  const fetchServerImages = async () => {
    try {
      const res = await fetch('/api/list-images');
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          console.warn("Server list-images returned non-JSON format during boot/setup.");
          return;
        }
        const data = await res.json();
        if (data.success) {
          const serverFolders = data.folders || [];
          if (data.files) {
            setMediaItems(prevItems => {
              const currentUrls = new Set(prevItems.map(item => item.url));
              const newItems = data.files.filter((file: any) => !currentUrls.has(file.url));
              const merged = [...prevItems, ...newItems].map(item => {
                const matchedServerFile = data.files.find((f: any) => f.url === item.url);
                if (matchedServerFile) {
                  return { ...item, folder: matchedServerFile.folder || 'Root' };
                }
                return { ...item, folder: item.folder || 'Root' };
              });
              localStorage.setItem('min_eco_media_items', JSON.stringify(merged));
              
              const itemFolders = merged.map(item => (item as any).folder || 'Root');
              const allFolders = Array.from(new Set(['Root', ...serverFolders, ...itemFolders]));
              setAvailableFolders(allFolders);
              
              return merged;
            });
          } else if (data.folders) {
            setAvailableFolders(prev => Array.from(new Set(['Root', ...prev, ...serverFolders])));
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch server images:", err);
    }
  };

  React.useEffect(() => {
    fetchServerImages();
  }, [activeTab]);

  // Synchronize available folders dynamically whenever mediaItems change (handles local updates, uploads, and storage fallbacks)
  React.useEffect(() => {
    if (mediaItems && mediaItems.length > 0) {
      setAvailableFolders(prev => {
        const itemFolders = mediaItems.map(item => (item as any).folder || 'Root');
        const merged = Array.from(new Set([...prev, ...itemFolders]));
        if (!merged.includes('Root')) {
          merged.unshift('Root');
        }
        return merged;
      });
    }
  }, [mediaItems]);

  // Sync state with selected media
  React.useEffect(() => {
    if (selectedMediaId) {
      const active = mediaItems.find(m => m.id === selectedMediaId);
      if (active) {
        setSeoAltText(active.altText || '');
        setSeoFocusKeywords(active.focusKeywords || '');
        setSeoCaption(active.caption || '');
        setSeoMetaTitle(active.metaTitle || '');
        setSeoDescription(active.descriptionSEO || '');
        setSeoCategory(active.category || 'Product');
        setSeoSuccessMessage(false);
      }
    } else {
      setSeoAltText('');
      setSeoFocusKeywords('');
      setSeoCaption('');
      setSeoMetaTitle('');
      setSeoDescription('');
      setSeoCategory('Product');
      setSeoSuccessMessage(false);
    }
  }, [selectedMediaId, mediaItems]);

  // Callback to verify Supabase storage bucket AND database rest availability
  const verifySupabaseConnection = React.useCallback(async (silent = false) => {
    setSupabaseConnectionStatus('testing');
    const timestamp = new Date().toLocaleTimeString();
    
    if (!silent) {
      setSupabaseConsoleLogs(prev => [
        ...prev,
        `[${timestamp}] 🔍 Initiating Supabase connection diagnostic suite...`,
        `[${timestamp}] 📡 Resolving edge routing for Supabase endpoint path: ${supabaseUrl}...`
      ]);
    } else {
      setSupabaseConsoleLogs([
        `[${timestamp}] 🔍 Automated Supabase verification triggered on system load.`,
        `[${timestamp}] 📡 Querying Supabase cloud gateways...`
      ]);
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      setSupabaseConnectionStatus('error');
      setSupabasePing(null);
      setSupabaseConsoleLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Discovery failed. Both Supabase URL and Public Anon Key are required.`,
        `[${new Date().toLocaleTimeString()}] ⚠️ Action Required: Input valid Supabase API settings inside parameters form below.`
      ]);
      return;
    }

    const t0 = performance.now();
    try {
      let cleanUrl = supabaseUrl.trim().replace(/\/$/, "");
      const keyToUse = supabaseServiceRoleKey || supabaseAnonKey;
      
      const storageCheckUrl = `${cleanUrl}/storage/v1/bucket`;
      const dbCheckUrl = `${cleanUrl}/rest/v1/`;

      setSupabaseConsoleLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🪐 Connecting to Supabase Storage endpoint: "/storage/v1/bucket"...`
      ]);

      const [storageRes, dbRes] = await Promise.all([
        fetch(storageCheckUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${keyToUse}`,
            'apikey': keyToUse
          }
        }).catch(() => null),
        fetch(dbCheckUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${keyToUse}`,
            'apikey': keyToUse
          }
        }).catch(() => null)
      ]);

      const t1 = performance.now();
      const latency = Math.floor(t1 - t0);
      const finalTime = new Date().toLocaleTimeString();

      if (!storageRes && !dbRes) {
        setSupabaseConnectionStatus('error');
        setSupabasePing(null);
        setSupabaseConsoleLogs(prev => [
          ...prev,
          `[${finalTime}] ❌ DNS lookup or network handshaking failed.`,
          `[${finalTime}] ⚠️ Error: [ENDPOINT_UNREACHABLE] Check if URL "${supabaseUrl}" is correct and online.`
        ]);
        return;
      }

      let storageSuccess = false;
      let dbSuccess = false;
      let logsToAdd: string[] = [];

      if (storageRes) {
        if (storageRes.status === 200 || storageRes.status === 201) {
          const buckets = await storageRes.json();
          storageSuccess = true;
          const targetBucket = supabaseBucketName || 'goldiama-bucket';
          const doesBucketExist = Array.isArray(buckets) && buckets.some(b => b.name === targetBucket);
          
          logsToAdd.push(`[${finalTime}] 📦 Storage connection verified! Found ${Array.isArray(buckets) ? buckets.length : 0} cloud buckets.`);
          if (doesBucketExist) {
            logsToAdd.push(`[${finalTime}] ✅ Bucket "${targetBucket}" discovered and verified as writeable.`);
          } else {
            logsToAdd.push(`[${finalTime}] ⚠️ Warning: Custom bucket "${targetBucket}" not found in list. It will be auto-created upon first upload.`);
          }
        } else {
          logsToAdd.push(`[${finalTime}] ❌ Storage connection failed with status ${storageRes.status}.`);
          if (storageRes.status === 401 || storageRes.status === 403) {
            logsToAdd.push(`[${finalTime}] ⚠️ Auth rejection: Key is not authorized to list buckets.`);
          }
        }
      }

      if (dbRes) {
        if (dbRes.status === 200 || dbRes.status === 204) {
          dbSuccess = true;
          logsToAdd.push(`[${finalTime}] 🗃️ Relational DB context verified (schema: "${supabaseDatabaseSchema}").`);
        } else {
          logsToAdd.push(`[${finalTime}] ❌ DB REST API connection status returned ${dbRes.status}.`);
        }
      }

      if (storageSuccess || dbSuccess) {
        setSupabasePing(latency);
        setSupabaseLastCheckTime(finalTime);
        setSupabaseConnectionStatus('connected');
        setSupabaseConsoleLogs(prev => [
          ...prev,
          ...logsToAdd,
          `[${finalTime}] ⚡ Global protocol handshake confirmed (TLSv1.3 enabled).`,
          `[${finalTime}] ✅ Supabase service harness initialized successfully in ${latency}ms!`
        ]);
        
        // Save verified configuration to the backend server so public visitors can query it
        fetch('/api/save-supabase-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: supabaseUrl,
            anonKey: supabaseAnonKey,
            serviceRoleKey: supabaseServiceRoleKey,
            bucketName: supabaseBucketName,
            databaseSchema: supabaseDatabaseSchema
          })
        }).catch(err => console.error("Error saving verified config to backend:", err));

        window.dispatchEvent(new Event('min-eco-supabase-config-changed'));
      } else {
        setSupabaseConnectionStatus('error');
        setSupabasePing(null);
        setSupabaseConsoleLogs(prev => [
          ...prev,
          ...logsToAdd,
          `[${finalTime}] ❌ Handshake verification aborted. Both storage and database connections are faulty.`
        ]);
      }

    } catch (err: any) {
      const finalTime = new Date().toLocaleTimeString();
      setSupabaseConnectionStatus('error');
      setSupabasePing(null);
      setSupabaseConsoleLogs(prev => [
        ...prev,
        `[${finalTime}] ❌ Exception during query check: ${err?.message || 'Unknown protocol crash.'}`,
        `[${finalTime}] ⚠️ Direct endpoint ping recommended to check firewall settings.`
      ]);
    }
  }, [supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey, supabaseBucketName, supabaseDatabaseSchema]);

  // Single media file upload controller with dynamic multi-hosting routing support
  const uploadSingleMediaFile = async (file: File, fileResult: string, folderVal: string) => {
    let sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
    if (file.size > 1024 * 1024) {
      sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    }
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const suggestedAlt = `${baseName} photo asset`;
    const suggestedTitle = baseName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' | Goldiama Catalyst';

    try {
      let data: any = null;

      if (activeStorageProvider === 'local') {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            dataUrl: fileResult,
            folder: folderVal
          })
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Local server returned non-JSON: ${text.substring(0, 100)}`);
        }
        data = await res.json();

      } else if (activeStorageProvider === 'supabase') {
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase URL and Public Anon Key must be configured under Settings.");
        }
        let cleanUrl = supabaseUrl.trim().replace(/\/$/, "");
        
        // Match base64 parts
        const matches = fileResult.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error("Invalid base64 payload format for Supabase asset upload.");
        }
        
        const mimeType = matches[1];
        const base64Data = matches[2];
        const sliceSize = 1024;
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        const fileBlob = new Blob(byteArrays, { type: mimeType });

        // Prepare cloud file paths
        const folderPrefix = folderVal && folderVal !== "Root" ? `${folderVal}/` : "";
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueFileName = `${Date.now()}_${cleanName}`;
        const filePath = `${folderPrefix}${uniqueFileName}`;
        
        const targetBucket = supabaseBucketName || 'goldiama-bucket';
        const key = supabaseServiceRoleKey || supabaseAnonKey;
        const uploadUrl = `${cleanUrl}/storage/v1/object/${targetBucket}/${filePath}`;

        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'apikey': key,
            'Content-Type': mimeType,
            'x-upsert': 'true'
          },
          body: fileBlob
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Supabase Storage returned error status ${res.status}: ${errText.substring(0, 100)}`);
        }

        const publicUrl = `${cleanUrl}/storage/v1/object/public/${targetBucket}/${filePath}`;
        data = {
          success: true,
          url: publicUrl,
          name: uniqueFileName,
          folder: folderVal || 'Root',
          size: sizeStr
        };

      } else if (activeStorageProvider === 'cloudinary') {
        if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
          throw new Error("Cloudinary Cloud Name and Upload Preset must be configured under Settings.");
        }
        
        const formData = new FormData();
        formData.append('file', fileResult);
        formData.append('upload_preset', cloudinaryUploadPreset);
        if (folderVal && folderVal !== 'Root') {
          formData.append('folder', folderVal);
        }

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Cloudinary API returned error status ${res.status}: ${errText.substring(0, 100)}`);
        }

        const cloudData = await res.json();
        data = {
          success: true,
          url: cloudData.secure_url || cloudData.url,
          name: cloudData.original_filename ? `${cloudData.original_filename}.${cloudData.format}` : file.name,
          folder: folderVal || 'Root',
          size: sizeStr
        };

      } else if (activeStorageProvider === 's3') {
        const res = await fetch('/api/storage/s3/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            dataUrl: fileResult,
            folder: folderVal,
            settings: {
              endpoint: s3Endpoint,
              bucket: s3Bucket,
              accessKey: s3AccessKey,
              secretKey: s3SecretKey,
              region: s3Region
            }
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`S3 Proxy upload failed with status ${res.status}: ${errText.substring(0, 100)}`);
        }
        data = await res.json();

      } else if (activeStorageProvider === 'custom-api') {
        const res = await fetch('/api/storage/custom-api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            dataUrl: fileResult,
            folder: folderVal,
            settings: {
              apiUrl: customApiUrl,
              headers: customApiHeaders,
              payloadType: customApiPayloadType,
              keyName: customApiKeyName,
              urlSelector: customApiUrlSelector
            }
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Custom REST API upload failed with status ${res.status}: ${errText.substring(0, 100)}`);
        }
        data = await res.json();
      }

      if (data && data.success && data.url) {
        const matchTimestamp = data.name ? data.name.match(/^(\d+)_/) : null;
        const numericId = matchTimestamp ? matchTimestamp[1] : String(Date.now());
        
        const providerNames: Record<string, string> = {
          'local': 'Local Server Storage',
          'supabase': 'Supabase Storage',
          'cloudinary': 'Cloudinary Service',
          's3': 'S3-Compatible Storage',
          'custom-api': 'Custom Rest API Gateway'
        };
        const currentProviderLabel = providerNames[activeStorageProvider] || 'Cloud API';

        const newMedItem = {
          id: numericId,
          name: data.name || file.name,
          size: data.size || sizeStr,
          url: data.url,
          category: 'Product',
          folder: data.folder || 'Root',
          altText: suggestedAlt,
          focusKeywords: baseName.split(' ').slice(0, 3).join(', '),
          caption: `Uploaded asset detailing ${baseName} inside subdirectory "${data.folder || 'Root'}" (Stored via ${currentProviderLabel})`,
          metaTitle: suggestedTitle,
          descriptionSEO: `High-resolution studio asset showing ${baseName} for online inventory.`
        };
        const updated = [...mediaItems, newMedItem];
        saveMediaItemsToStorage(updated);
        setSelectedMediaId(newMedItem.id);
        fetchServerImages();
        if (activeStorageProvider === 'supabase') {
          verifySupabaseConnection(true);
        }
      } else {
        throw new Error(data?.error || "Invalid response data payload structure on complete.");
      }
    } catch (err: any) {
      console.error("Cloud image upload failed, falling back to offline key-value storage.", err);
      const newMedItem = {
        id: String(Date.now()),
        name: file.name,
        size: sizeStr,
        url: fileResult,
        category: 'Product',
        folder: folderVal || 'Root',
        altText: suggestedAlt,
        focusKeywords: baseName.split(' ').slice(0, 3).join(', '),
        caption: `Offline asset detailing ${baseName}`,
        metaTitle: suggestedTitle,
        descriptionSEO: `Local catalog asset showing ${baseName}.`
      };
      const updated = [...mediaItems, newMedItem];
      saveMediaItemsToStorage(updated);
      setSelectedMediaId(newMedItem.id);
    } finally {
      setTimeout(() => setUploadProgress(null), 500);
    }
  };

  // Run on first component mount
  React.useEffect(() => {
    const checkAndInitSupabase = async () => {
      if (!localStorage.getItem('min_eco_supabase_url')) {
        try {
          const res = await fetch('/api/supabase-config');
          const data = await res.json();
          if (data && data.success && data.url && data.anonKey) {
            setSupabaseUrl(data.url);
            setSupabaseAnonKey(data.anonKey);
            setSupabaseBucketName(data.bucketName || 'goldiama-bucket');
            setSupabaseDatabaseSchema(data.databaseSchema || 'public');
            
            localStorage.setItem('min_eco_supabase_url', data.url);
            localStorage.setItem('min_eco_supabase_anon_key', data.anonKey);
            localStorage.setItem('min_eco_supabase_bucket_name', data.bucketName || 'goldiama-bucket');
            localStorage.setItem('min_eco_supabase_database_schema', data.databaseSchema || 'public');
            
            setTimeout(() => {
              verifySupabaseConnection(true);
            }, 150);
            return;
          }
        } catch (err) {
          console.warn('[AdminDashboard] Failed to preload backend Supabase configs:', err);
        }
      }

      if (localStorage.getItem('min_eco_supabase_url')) {
        verifySupabaseConnection(true);
      }
    };
    checkAndInitSupabase();
  }, []);

  // Run when user specifically clicks / switches to the Supabase database tab
  React.useEffect(() => {
    if (settingsSubTab === 'supabase') {
      verifySupabaseConnection(true);
    }
  }, [settingsSubTab]);

  // 6. Banking & Payment State
  const [bankingLegalName, setBankingLegalName] = useState('Nordic Design Labs AB');
  const [bankingIban, setBankingIban] = useState('SE62 5000 0000 2345 6789');
  const [bankingActiveGateway, setBankingActiveGateway] = useState('Stripe Connect');
  const [bankingTaxRate, setBankingTaxRate] = useState(25);
  const [bankingCurrency, setBankingCurrency] = useState('USD');
  
  // 6b. Pages Canvas Page Size Layout States
  const [pageSizePreset, setPageSizePreset] = useState<'mobile' | 'tablet-portrait' | 'tablet-landscape' | 'desktop'>(() => {
    return (localStorage.getItem('min_eco_page_size_preset') || 'desktop') as any;
  });
  const [pageSizeCustomVal, setPageSizeCustomVal] = useState<number>(() => {
    const val = localStorage.getItem('min_eco_page_size_custom_val');
    return val ? parseInt(val, 10) : 1280;
  });
  const [pageSizeSaveSuccess, setPageSizeSaveSuccess] = useState(false);
  
  // Product Section Sub-toggles
  const [productsSectionMode, setProductsSectionMode] = useState<'inventory' | 'categories'>('inventory');

  // Categories Database State
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('min_eco_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: 'cat-gold', name: 'Gold', imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d' },
      { id: 'cat-gold-cast', name: 'Cast Bar', parentName: 'Gold', imageUrl: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366' },
      { id: 'cat-gold-minted', name: 'Minted Bar', parentName: 'Gold', imageUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723' },
      { id: 'cat-gold-coin', name: 'Minted Coin', parentName: 'Gold', imageUrl: 'https://images.unsplash.com/photo-1613243555988-441166d4d6fd' },
      { id: 'cat-silver', name: 'Silver', imageUrl: 'https://images.unsplash.com/photo-1622601712713-7ef26620f4db' },
      { id: 'cat-silver-cast', name: 'Cast Bar', parentName: 'Silver', imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82' }
    ];
  });

  const saveCategoriesToStorage = (updatedCats: Category[]) => {
    setCategories(updatedCats);
    localStorage.setItem('min_eco_categories', JSON.stringify(updatedCats));
  };

  // Category editing and creation states
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState('');
  const [newCatImageUrl, setNewCatImageUrl] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCatMediaPicker, setShowCatMediaPicker] = useState(false);
  const [categoryMediaPickerTarget, setCategoryMediaPickerTarget] = useState<'new' | 'edit' | null>(null);

  // Product Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // New Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Workspace');
  const [newProdCategories, setNewProdCategories] = useState<string[]>([]);
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');

  // Selected order invoice/status details modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Derive dynamic dashboard KPIs based on actual orders
  const completedOrders = orders.filter(o => o.status === 'Completed');
  const realPurchasesSum = completedOrders.reduce((total, o) => total + o.amount, 0);

  // Substatus counts for sidebar
  const countProgress = orders.filter(o => o.status === 'Shipped').length;
  const countDelivered = orders.filter(o => o.status === 'Completed').length;
  const countCancelled = orders.filter(o => o.status === 'Cancelled').length;
  const countPending = orders.filter(o => o.status === 'Pending').length;
  
  // Profit calculations (assume 45% margin)
  const totalProfit = realPurchasesSum * 0.45;
  const displayProfit = 30720 + totalProfit; // Mock constant offset + dynamic value
  const displayOrdersCount = 15350 + orders.length;
  const displayNewCustomers = 4972 + customers.length;

  // Search filter lists
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayOrdersList = (() => {
    if (activeTab === 'orders-progress') {
      return filteredOrders.filter(o => o.status === 'Shipped');
    }
    if (activeTab === 'orders-delivered') {
      return filteredOrders.filter(o => o.status === 'Completed');
    }
    if (activeTab === 'orders-cancelled') {
      return filteredOrders.filter(o => o.status === 'Cancelled');
    }
    if (activeTab === 'orders-pending') {
      return filteredOrders.filter(o => o.status === 'Pending');
    }
    return filteredOrders;
  })();

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdStock) return;

    // Convert category IDs to display names like "Gold / Cast Bar"
    const readableCategoryValue = newProdCategories.length > 0 
      ? newProdCategories.map(catId => {
          const cat = categories.find(c => c.id === catId);
          if (cat) {
            return cat.parentName ? `${cat.parentName} > ${cat.name}` : cat.name;
          }
          return catId;
        }).join(', ')
      : newProdCategory;

    addProduct({
      id: `prod-${Date.now()}`,
      name: newProdName,
      description: newProdDesc || 'Fine precious bullion asset certified for sovereign custody accounts.',
      price: parseFloat(newProdPrice),
      category: readableCategoryValue,
      categories: newProdCategories,
      stock: parseInt(newProdStock),
      sku: newProdSku || `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
      imageUrl: newProdImageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
    });

    if (newProdImageUrl) {
      recordImageUsageInGallery(newProdImageUrl, newProdName, 'Product');
    }

    // Reset Form
    setNewProdName('');
    setNewProdPrice('');
    setNewProdStock('');
    setNewProdDesc('');
    setNewProdCategory('Gold');
    setNewProdCategories([]);
    setNewProdSku('');
    setNewProdImageUrl('');
    setShowAddModal(false);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const readableCategoryValue = editingProduct.categories && editingProduct.categories.length > 0
      ? editingProduct.categories.map(catId => {
          const cat = categories.find(c => c.id === catId);
          if (cat) {
            return cat.parentName ? `${cat.parentName} > ${cat.name}` : cat.name;
          }
          return catId;
        }).join(', ')
      : editingProduct.category;

    editProduct(editingProduct.id, {
      name: editingProduct.name,
      price: editingProduct.price,
      stock: editingProduct.stock,
      description: editingProduct.description,
      category: readableCategoryValue,
      categories: editingProduct.categories || [],
      sku: editingProduct.sku,
      imageUrl: editingProduct.imageUrl
    });

    if (editingProduct.imageUrl) {
      recordImageUsageInGallery(editingProduct.imageUrl, editingProduct.name, 'Product');
    }

    setEditingProduct(null);
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleSaveAllChanges = () => {
    // 1. Save Header & Brand layouts state
    localStorage.setItem('min_eco_header_notice', headerNoticeText);
    localStorage.setItem('min_eco_header_show_notice', String(headerShowNotice));
    localStorage.setItem('min_eco_header_notice_align', headerNoticeAlign);
    localStorage.setItem('min_eco_header_established', headerEstablished);
    localStorage.setItem('min_eco_header_established_align', headerEstablishedAlign);
    localStorage.setItem('min_eco_header_sticky', String(headerSticky));
    localStorage.setItem('min_eco_header_show_cart', String(headerShowCart));
    localStorage.setItem('min_eco_header_show_search', String(headerShowSearch));
    localStorage.setItem('min_eco_header_support_pills_size', headerSupportPillsSize);
    localStorage.setItem('min_eco_header_show_compliance', String(headerShowCompliance));
    localStorage.setItem('min_eco_header_compliance_label', headerComplianceLabel);
    localStorage.setItem('min_eco_header_compliance_icon', headerComplianceIcon);
    localStorage.setItem('min_eco_header_compliance_action', headerComplianceAction);
    localStorage.setItem('min_eco_header_compliance_url', headerComplianceUrl);
    localStorage.setItem('min_eco_header_compliance_popup_title', headerCompliancePopupTitle);
    localStorage.setItem('min_eco_header_compliance_popup_badge', headerCompliancePopupBadge);
    localStorage.setItem('min_eco_header_compliance_sec1_title', headerComplianceSec1Title);
    localStorage.setItem('min_eco_header_compliance_sec1_text', headerComplianceSec1Text);
    localStorage.setItem('min_eco_header_compliance_sec2_title', headerComplianceSec2Title);
    localStorage.setItem('min_eco_header_compliance_sec2_text', headerComplianceSec2Text);
    localStorage.setItem('min_eco_header_compliance_sec3_title', headerComplianceSec3Title);
    localStorage.setItem('min_eco_header_compliance_sec3_text', headerComplianceSec3Text);
    localStorage.setItem('min_eco_header_compliance_sections', JSON.stringify(complianceSections));
    localStorage.setItem('min_eco_header_show_concierge', String(headerShowConcierge));
    localStorage.setItem('min_eco_header_concierge_label', headerConciergeLabel);
    localStorage.setItem('min_eco_header_concierge_icon', headerConciergeIcon);
    localStorage.setItem('min_eco_header_concierge_action', headerConciergeAction);
    localStorage.setItem('min_eco_header_concierge_url', headerConciergeUrl);
    localStorage.setItem('min_eco_header_concierge_popup_title', headerConciergePopupTitle);
    localStorage.setItem('min_eco_header_concierge_popup_badge', headerConciergePopupBadge);
    localStorage.setItem('min_eco_header_concierge_popup_sub', headerConciergePopupSub);
    localStorage.setItem('min_eco_header_concierge_box1_title', headerConciergeBox1Title);
    localStorage.setItem('min_eco_header_concierge_box1_val', headerConciergeBox1Val);
    localStorage.setItem('min_eco_header_concierge_box1_tag', headerConciergeBox1Tag);
    localStorage.setItem('min_eco_header_concierge_box2_title', headerConciergeBox2Title);
    localStorage.setItem('min_eco_header_concierge_box2_val', headerConciergeBox2Val);
    localStorage.setItem('min_eco_header_concierge_box2_tag', headerConciergeBox2Tag);
    localStorage.setItem('min_eco_header_concierge_boxes', JSON.stringify(conciergeBoxes));
    localStorage.setItem('min_eco_header_concierge_highlight_title', headerConciergeHighlightTitle);
    localStorage.setItem('min_eco_header_concierge_highlight_text', headerConciergeHighlightText);
    localStorage.setItem('min_eco_header_concierge_highlight_label', headerConciergeHighlightLabel);
    localStorage.setItem('min_eco_header_concierge_highlight_val', headerConciergeHighlightVal);
    localStorage.setItem('min_eco_show_brand_name_text', String(frontendShowBrandNameText));
    localStorage.setItem('min_eco_show_brand_emblem', String(frontendShowBrandEmblem));
    localStorage.setItem('min_eco_show_established_caption', String(frontendShowEstablishedCaption));
    localStorage.setItem('min_eco_frontend_logo_size', frontendLogoSize);

    // 2. Save Footer Section settings state
    localStorage.setItem('min_eco_footer_copyright', footerCopyrightText);
    localStorage.setItem('min_eco_footer_show_newsletter', String(footerShowNewsletter));
    localStorage.setItem('min_eco_footer_show_payment_badges', String(footerShowPaymentBadges));
    localStorage.setItem('min_eco_footer_email_placeholder', footerEmailPlaceholder);

    // 3. Save Typography state attributes
    localStorage.setItem('min_eco_typo_heading_font', typographyHeadingFont);
    localStorage.setItem('min_eco_typo_body_font', typographyBodyFont);
    localStorage.setItem('min_eco_typo_h1_font', typoH1Font);
    localStorage.setItem('min_eco_typo_h1_weight', typoH1Weight);
    localStorage.setItem('min_eco_typo_h1_transform', typoH1Transform);
    localStorage.setItem('min_eco_typo_h1_spacing', typoH1Spacing);
    localStorage.setItem('min_eco_typo_h1_size', typoH1Size);
    localStorage.setItem('min_eco_typo_h1_line_height', typoH1LineHeight);
    localStorage.setItem('min_eco_typo_h2_font', typoH2Font);
    localStorage.setItem('min_eco_typo_h2_weight', typoH2Weight);
    localStorage.setItem('min_eco_typo_h2_transform', typoH2Transform);
    localStorage.setItem('min_eco_typo_h2_spacing', typoH2Spacing);
    localStorage.setItem('min_eco_typo_h2_size', typoH2Size);
    localStorage.setItem('min_eco_typo_h2_line_height', typoH2LineHeight);
    localStorage.setItem('min_eco_typo_h3_font', typoH3Font);
    localStorage.setItem('min_eco_typo_h3_weight', typoH3Weight);
    localStorage.setItem('min_eco_typo_h3_transform', typoH3Transform);
    localStorage.setItem('min_eco_typo_h3_spacing', typoH3Spacing);
    localStorage.setItem('min_eco_typo_h3_size', typoH3Size);
    localStorage.setItem('min_eco_typo_h3_line_height', typoH3LineHeight);
    localStorage.setItem('min_eco_typo_h4_font', typoH4Font);
    localStorage.setItem('min_eco_typo_h4_weight', typoH4Weight);
    localStorage.setItem('min_eco_typo_h4_transform', typoH4Transform);
    localStorage.setItem('min_eco_typo_h4_spacing', typoH4Spacing);
    localStorage.setItem('min_eco_typo_h4_size', typoH4Size);
    localStorage.setItem('min_eco_typo_h4_line_height', typoH4LineHeight);
    localStorage.setItem('min_eco_typo_h5_font', typoH5Font);
    localStorage.setItem('min_eco_typo_h5_weight', typoH5Weight);
    localStorage.setItem('min_eco_typo_h5_transform', typoH5Transform);
    localStorage.setItem('min_eco_typo_h5_spacing', typoH5Spacing);
    localStorage.setItem('min_eco_typo_h5_size', typoH5Size);
    localStorage.setItem('min_eco_typo_h5_line_height', typoH5LineHeight);
    localStorage.setItem('min_eco_typo_h6_font', typoH6Font);
    localStorage.setItem('min_eco_typo_h6_weight', typoH6Weight);
    localStorage.setItem('min_eco_typo_h6_transform', typoH6Transform);
    localStorage.setItem('min_eco_typo_h6_spacing', typoH6Spacing);
    localStorage.setItem('min_eco_typo_h6_size', typoH6Size);
    localStorage.setItem('min_eco_typo_h6_line_height', typoH6LineHeight);
    localStorage.setItem('min_eco_typo_body_weight', typoBodyWeight);
    localStorage.setItem('min_eco_typo_body_transform', typoBodyTransform);
    localStorage.setItem('min_eco_typo_body_spacing', typoBodySpacing);
    localStorage.setItem('min_eco_typo_body_size', typoBodySize);
    localStorage.setItem('min_eco_typo_body_line_height', typoBodyLineHeight);

    // 4. Synchronize page-layout state parameters to store context variables
    setHeaderStyle(headerStyle);
    setNavPresetStyle(navPresetStyle);
    setNavFontSize(navFontSize);
    setNavFontFamily(navFontFamily);
    setNavFontWeight(navFontWeight);
    setNavFontCase(navFontCase);
    setNavLineGap(navLineGap);
    setNavBlockSpacing(navBlockSpacing);
    setNavColorStyle(navColorStyle);
    setNavShowDividers(navShowDividers);
    setNavStretchMenu(navStretchMenu);
    
    setHeroBannerShow(heroBannerShow);
    setHeroBannerTitle(heroBannerTitle);
    setHeroBannerSubtitle(heroBannerSubtitle);
    setHeroBannerBgUrl(heroBannerBgUrl);
    setHeroBannerOverlay(heroBannerOverlay);
    setHeroBannerHeight(heroBannerHeight);
    setHeroBannerCtaText(heroBannerCtaText);
    setHeroBannerCtaLink(heroBannerCtaLink);
    setHeroBannerLayoutMode(heroBannerLayoutMode);
    setHeroBannerDimDesktop(heroBannerDimDesktop);
    setHeroBannerDimTablet(heroBannerDimTablet);
    setHeroBannerDimMobile(heroBannerDimMobile);

    setPageBannerShow(pageBannerShow);
    setPageBannerBgUrl(pageBannerBgUrl);
    setPageBannerHeight(pageBannerHeight);
    setPageBannerAlign(pageBannerAlign);
    setPageBannerDimDesktop(pageBannerDimDesktop);
    setPageBannerDimTablet(pageBannerDimTablet);
    setPageBannerDimMobile(pageBannerDimMobile);

    setPageTitleBarEnable(pageTitleBarEnable);
    setPageTitleBarBg(pageTitleBarBg);
    setPageTitleBarBorder(pageTitleBarBorder);
    setPageTitleBarFontSize(pageTitleBarFontSize);

    setLayoutContentWidth(layoutContentWidth);
    setLayoutBorderRadius(layoutBorderRadius);
    setLayoutShowBreadcrumbs(layoutShowBreadcrumbs);

    // 5. Store API credentials
    localStorage.setItem('min_eco_metal_api_provider', apiProvider);
    localStorage.setItem('min_eco_metal_api_key', apiKey);
    localStorage.setItem('min_eco_metal_currency', metalCurrency);
    localStorage.setItem('min_eco_metal_unit', metalUnit);
    // 8. Record active customize-tab images in Media Vault Gallery
    if (heroBannerBgUrl) recordImageUsageInGallery(heroBannerBgUrl, "Hero Banner Background", "Hero");
    if (pageBannerBgUrl) recordImageUsageInGallery(pageBannerBgUrl, "Page Banner Background", "Background");
    if (adminLogoImageUrl) recordImageUsageInGallery(adminLogoImageUrl, "Admin Brand Logo", "Standard");
    if (newNavImageUrl) recordImageUsageInGallery(newNavImageUrl, "Navigation Menu Header", "Standard");
    if (bDesktopImage) recordImageUsageInGallery(bDesktopImage, "Hero Desktop Frame", "Banner");
    if (bTabletImage) recordImageUsageInGallery(bTabletImage, "Hero Tablet Frame", "Banner");
    if (bMobileImage) recordImageUsageInGallery(bMobileImage, "Hero Mobile Frame", "Banner");
    if (sDesktopImage) recordImageUsageInGallery(sDesktopImage, "Slider Desktop Frame", "Banner");
    if (sTabletImage) recordImageUsageInGallery(sTabletImage, "Slider Tablet Frame", "Banner");
    if (sMobileImage) recordImageUsageInGallery(sMobileImage, "Slider Mobile Frame", "Banner");

    // Dispatch real-time listener events to notify frontend pages of changes
    window.dispatchEvent(new Event('min-eco-typography-updated'));
    window.dispatchEvent(new Event('min-eco-banners-updated'));
    window.dispatchEvent(new Event('min-eco-layout-updated'));
    window.dispatchEvent(new Event('min-eco-pages-updated'));

    // Trigger Success notification Toast
    setGlobalSaveToast({
      show: true,
      title: "All Sections Saved successfully!",
      subtitle: "Persisted Header, Banner, Layout, Typography, and Footer configurations across all active modules.",
      type: 'success'
    });

    // Auto-dismiss toast
    setTimeout(() => {
      setGlobalSaveToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  return (
    <div id="admin-main-grid" className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row text-zinc-800 font-sans">
      
      {/* LEFT SIDEBAR - Matches 'Nordic' style */}
      <aside 
        id="admin-sidebar"
        className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-zinc-200 p-5 flex flex-col justify-between shrink-0"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {adminLogoType === 'image' && adminLogoImageUrl ? (
                <div className="flex items-center gap-2">
                  <img 
                    src={adminLogoImageUrl} 
                    alt="brand-logo" 
                    className="h-7 max-h-7 max-w-[100px] object-contain rounded-none animate-fade-in"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-sans font-black tracking-tight text-zinc-950 text-base leading-none uppercase">{adminLogoText}</span>
                </div>
              ) : (
                <>
                  <div className="w-6 h-6 bg-zinc-950 rounded-sm flex items-center justify-center text-white text-xs font-mono font-bold uppercase">{adminLogoLetter}</div>
                  <span className="font-sans font-black tracking-tight text-zinc-950 text-base leading-none uppercase">{adminLogoText}</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 select-none uppercase">v2.4</span>
          </div>

          {/* Clean Mock Search Command Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search or actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-xs placeholder-zinc-400 focus:outline-none focus:border-zinc-500 font-sans transition-all"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-400 bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">
              ⌘K
            </span>
          </div>

          {/* Navigation Menu - Grouped elegantly like a professional CMS */}
          <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1 scrollbar-thin">
            {/* Separate Overview Cockpit */}
            <button
              onClick={() => { setActiveTab('overview'); setSearchTerm(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer rounded-lg font-bold border ${
                activeTab === 'overview' 
                  ? 'bg-zinc-950 text-white border-zinc-950' 
                  : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950 border-zinc-200/50 bg-zinc-50/20'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Overview Cockpit</span>
            </button>

            {sidebarGroups.map((group) => {
              if (group === 'core') {
                return (
                  <div className="space-y-0.5" key="group-core">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase px-2.5 block mb-1 select-none tracking-widest">
                      Core Console
                    </span>
                    
                    <button
                      onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'products' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Products Catalog ({products.length})
                    </button>

                    {/* MOVED: Orders menu (formerly under Commerce Operation) positioned below Products Catalog */}
                    <div className="space-y-0.5">
                      <button
                        onClick={() => { 
                          setIsOrdersMenuExpanded(!isOrdersMenuExpanded);
                          if (!activeTab.startsWith('orders')) {
                            setActiveTab('orders');
                          }
                          setSearchTerm('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                          activeTab.startsWith('orders') 
                            ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                            : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Orders</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-200/60 px-1.5 py-0.5 rounded-md font-semibold">
                            {orders.length}
                          </span>
                          {isOrdersMenuExpanded ? (
                            <ChevronUp className="w-3 h-3 text-zinc-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-zinc-400" />
                          )}
                        </div>
                      </button>

                      {/* Submenu */}
                      {isOrdersMenuExpanded && (
                        <div className="pl-4 pr-1 py-1 space-y-1 bg-zinc-50/50 border-l border-zinc-205/70 ml-4 rounded-r-lg">
                          <button
                            onClick={() => { setActiveTab('orders-progress'); setSearchTerm(''); }}
                            className={`w-full flex items-center justify-between py-1 px-2 text-[11px] font-sans transition-all cursor-pointer rounded-lg ${
                              activeTab === 'orders-progress'
                                ? 'bg-zinc-900 text-white font-bold'
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-blue-500" />
                              On Progress
                            </span>
                            <span className="text-[9px] font-mono opacity-80 font-semibold">{countProgress}</span>
                          </button>

                          <button
                            onClick={() => { setActiveTab('orders-delivered'); setSearchTerm(''); }}
                            className={`w-full flex items-center justify-between py-1 px-2 text-[11px] font-sans transition-all cursor-pointer rounded-lg ${
                              activeTab === 'orders-delivered'
                                ? 'bg-zinc-900 text-white font-bold'
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              Delivered
                            </span>
                            <span className="text-[9px] font-mono opacity-80 font-semibold">{countDelivered}</span>
                          </button>

                          <button
                            onClick={() => { setActiveTab('orders-cancelled'); setSearchTerm(''); }}
                            className={`w-full flex items-center justify-between py-1 px-2 text-[11px] font-sans transition-all cursor-pointer rounded-lg ${
                              activeTab === 'orders-cancelled'
                                ? 'bg-zinc-900 text-white font-bold'
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-red-400" />
                              Cancelled
                            </span>
                            <span className="text-[9px] font-mono opacity-80 font-semibold">{countCancelled}</span>
                          </button>

                          <button
                            onClick={() => { setActiveTab('orders-pending'); setSearchTerm(''); }}
                            className={`w-full flex items-center justify-between py-1 px-2 text-[11px] font-sans transition-all cursor-pointer rounded-lg ${
                              activeTab === 'orders-pending'
                                ? 'bg-zinc-900 text-white font-bold'
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-amber-400" />
                              Pending
                            </span>
                            <span className="text-[9px] font-mono opacity-80 font-semibold">{countPending}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => { setActiveTab('customers'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'customers' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Customer Center ({customers.length})
                    </button>
                  </div>
                );
              }

              if (group === 'design') {
                return (
                  <div className="space-y-0.5" key="group-design">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase px-2.5 block mb-1 select-none tracking-widest">
                      Store Design & Layout
                    </span>
                    
                     <button
                      onClick={() => { setActiveTab('header'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'header' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <Layout className="w-3.5 h-3.5" />
                      Header Section
                    </button>

                    <button
                      onClick={() => { setActiveTab('banners'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'banners' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                      Banner Section
                    </button>

                    <button
                      onClick={() => { setActiveTab('footer'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'footer' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                      Footer Section
                    </button>

                    <button
                      onClick={() => { setActiveTab('typography'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'typography' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      Typography Settings
                    </button>

                    <button
                      onClick={() => { setActiveTab('pages'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'pages' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Pages
                    </button>

                    <button
                      onClick={() => { setActiveTab('page-layout'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'page-layout' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      Page Layout
                    </button>

                    <button
                      onClick={() => { setActiveTab('media'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'media' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <Image className="w-3.5 h-3.5 text-zinc-500" />
                      Media Gallery & URL Register
                    </button>
                  </div>
                );
              }

              if (group === 'kyc') {
                return (
                  <div className="space-y-0.5" key="group-kyc">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase px-2.5 block mb-1 select-none tracking-widest block-title">
                      KYC Onboarding
                    </span>
                    
                    <button
                      onClick={() => { setActiveTab('kyc-individual'); setSearchTerm(''); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'kyc-individual' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>Individual KYC</span>
                      </span>
                      <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 font-bold">
                        {kycIndividuals.filter(i => i.status === 'Pending').length}
                      </span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('kyc-corporate'); setSearchTerm(''); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans transition-all cursor-pointer font-semibold border-l-2 ${
                        activeTab === 'kyc-corporate' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Corporate KYC</span>
                      </span>
                      <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 font-bold">
                        {kycCorporates.filter(c => c.status === 'Pending').length}
                      </span>
                    </button>
                  </div>
                );
              }

              if (group === 'commerce') {
                return (
                  <div className="space-y-0.5" key="group-commerce">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase px-2.5 block mb-1 select-none tracking-widest">
                      Commerce Operations
                    </span>

                    <button
                      onClick={() => { setActiveTab('banking'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'banking' 
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Banking and Payment
                    </button>
                  </div>
                );
              }

              if (group === 'settings') {
                return (
                  <div className="space-y-0.5" key="group-settings">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase px-2.5 block mb-1 select-none tracking-widest">
                      System Settings
                    </span>
                    
                    <button
                      onClick={() => { setActiveTab('admin-settings'); setSettingsSubTab('profile'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'admin-settings' && !['supabase'].includes(settingsSubTab)
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Admin Settings
                    </button>

                    <button
                      onClick={() => { setActiveTab('admin-settings'); setSettingsSubTab('supabase'); setSearchTerm(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans transition-all cursor-pointer font-medium border-l-2 ${
                        activeTab === 'admin-settings' && settingsSubTab === 'supabase'
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-950 font-semibold' 
                          : 'text-zinc-550 hover:bg-zinc-50 hover:text-zinc-950 border-transparent'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5 text-zinc-700" />
                      Supabase Integration
                    </button>
                  </div>
                );
              }

              return null;
            })}

          </div>
        </div>

        {/* Sidebar Footer with Logout & Active Guard Status */}
        <div className="pt-6 border-t border-zinc-200 mt-6 space-y-4">
          <button
            onClick={() => { setActiveTab('admin-settings'); setSearchTerm(''); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans rounded-xl border transition-all cursor-pointer font-bold ${
              activeTab === 'admin-settings' 
                ? 'bg-zinc-950 text-white border-zinc-950 font-semibold shadow-xs' 
                : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950 border-zinc-200 bg-zinc-50/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">SECURE LINK ONLINE</span>
            </div>
          </div>
          <button
            onClick={logoutAdmin}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-650 hover:bg-red-50 hover:text-red-750 font-mono rounded-xl border border-transparent transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            DISCONNECT CONSOLE
          </button>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT AREA */}
      <main id="admin-view-body" className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Mini bar */}
        <header id="admin-panel-header" className="flex justify-between items-center bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 font-sans">
              Command Center
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest font-semibold mt-0.5">
              Secure Operations Console
            </p>
          </div>
          <div className="flex items-center gap-5">
            {['header', 'banners', 'footer', 'typography', 'pages', 'media', 'page-layout', 'banking', 'admin-settings'].includes(activeTab) && (
              <button
                type="button"
                onClick={handleSaveAllChanges}
                className="inline-flex items-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
                title="Persist and compile state adjustments across all workspace customizer panels"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Sections</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-semibold text-zinc-800 block">Erik Sorenson</span>
                <span className="text-[9px] font-mono text-zinc-400">erik@nordic.co</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-xs select-none">
                ES
              </div>
            </div>
          </div>
        </header>

        {/* 1. OVERVIEW COCKPIT TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stat Card 1 */}
              <div className="bg-white border border-zinc-200 p-5 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs flex flex-col justify-between group">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block mb-1">Total Profit Margin</span>
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 mt-2 block font-sans">
                    ${displayProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-[#10B981] font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12.04%</span>
                  <span className="text-zinc-400 font-normal">vs last month</span>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white border border-zinc-200 p-5 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs flex flex-col justify-between group">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block mb-1">Consolidated Orders</span>
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 mt-2 block font-sans">
                    {displayOrdersCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-[#10B981] font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+16.02%</span>
                  <span className="text-zinc-400 font-normal">vs last month</span>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white border border-zinc-200 p-5 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs flex flex-col justify-between group">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block mb-1">Acquired Customers</span>
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 mt-2 block font-sans">
                    {displayNewCustomers.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-[#10B981] font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+19.08%</span>
                  <span className="text-zinc-400 font-normal">vs last month</span>
                </div>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-white border border-zinc-200 p-5 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs flex flex-col justify-between group">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block mb-1">Active Conversion</span>
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 mt-2 block font-sans">
                    3.82%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-red-500 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 rotate-180" />
                  <span>-0.4%</span>
                  <span className="text-zinc-400 font-normal">vs peak</span>
                </div>
              </div>

            </div>

            {/* PRECIOUS METALS SPOT RATES & HISTORICAL TRENDS COCKPIT */}
            <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4 gap-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-950 font-sans flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                    Precious Metals Live Spot Rates
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5 uppercase tracking-wider">
                    GLOBAL BULLION INDICES · {metalUnit} rate in {metalCurrency}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Currency selector buttons */}
                  <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-[10px] font-mono">
                    {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => {
                          setMetalCurrency(curr);
                          localStorage.setItem('min_eco_metal_currency', curr);
                        }}
                        className={`px-2 py-1 rounded-md transition-all cursor-pointer font-bold ${
                          metalCurrency === curr 
                            ? 'bg-white text-zinc-950 shadow-3xs border border-zinc-150' 
                            : 'text-zinc-500 hover:text-zinc-955'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>

                  {/* Weight Unit selector */}
                  <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-[10px] font-mono">
                    {(['ounce', 'gram'] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          setMetalUnit(unit);
                          localStorage.setItem('min_eco_metal_unit', unit);
                        }}
                        className={`px-2 py-1 rounded-md transition-all cursor-pointer font-bold uppercase text-[9px] ${
                          metalUnit === unit 
                            ? 'bg-white text-zinc-950 shadow-3xs border border-zinc-150' 
                            : 'text-zinc-500 hover:text-zinc-955'
                        }`}
                      >
                        {unit === 'ounce' ? 'oz' : 'g'}
                      </button>
                    ))}
                  </div>

                  {/* Trigger Sync Button */}
                  <button
                    type="button"
                    onClick={triggerPriceFetch}
                    disabled={priceFetchLoading}
                    className="px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-250 text-zinc-750 hover:text-zinc-950 rounded-lg transition-colors flex items-center gap-1 font-mono text-[9px] font-extrabold cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${priceFetchLoading ? 'animate-spin text-amber-500' : ''}`} />
                    <span>SYNC RATES</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left side: Golden / Silver Ticker Widgets */}
                <div className="space-y-4 lg:col-span-1 border-r border-zinc-100 pr-0 lg:pr-6">
                  
                  {/* GOLD Box */}
                  <button
                    type="button"
                    onClick={() => setSelectedChartAsset('XAU')}
                    className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between h-[110px] group outline-none cursor-pointer ${
                      selectedChartAsset === 'XAU' 
                        ? 'border-amber-500 bg-amber-50/10 ring-1 ring-amber-500/20 shadow-xs' 
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/10 to-amber-500/5 rounded-full blur-xl -z-10 animate-pulse" />
                    
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <span className="font-mono font-black text-[10px] tracking-wider text-amber-600 block uppercase">GOLD SPOT (XAU)</span>
                        <span className="text-[9px] text-zinc-400 font-mono mt-0.5 block">99.99% LONDON LBMA BENCHMARK</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-0.5 font-black shrink-0 ${
                        goldPriceChangeBase >= 0 ? 'bg-green-50 text-emerald-700 border border-green-150' : 'bg-red-50 text-rose-700 border border-red-150'
                      }`}>
                        {goldPriceChangeBase >= 0 ? <ArrowUp className="w-2.5 h-2.5 text-emerald-600" /> : <ArrowDown className="w-2.5 h-2.5 text-rose-650" />}
                        {goldPriceChangeBase >= 0 ? '+' : ''}{goldPriceChangePct.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-end w-full pt-1">
                      <div className="text-2xl font-sans font-black tracking-tight text-zinc-950 flex items-baseline">
                        <span className="text-lg font-mono font-medium text-zinc-400 mr-0.5">{getCurrencySymbol(metalCurrency)}</span>
                        {getConvertedPrice(goldPriceBase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-[10px] font-mono text-zinc-400 font-normal ml-1">/{metalUnit === 'ounce' ? 'oz' : 'g'}</span>
                      </div>
                      <span className="text-[9.5px] text-zinc-400 font-mono">
                        {goldPriceChangeBase >= 0 ? '+' : ''}
                        {getConvertedPrice(goldPriceChangeBase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {metalCurrency}
                      </span>
                    </div>
                  </button>

                  {/* SILVER Box */}
                  <button
                    type="button"
                    onClick={() => setSelectedChartAsset('XAG')}
                    className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between h-[110px] group outline-none cursor-pointer ${
                      selectedChartAsset === 'XAG' 
                        ? 'border-zinc-500 bg-zinc-50/40 ring-1 ring-zinc-500/20 shadow-xs' 
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-zinc-200/15 to-zinc-400/5 rounded-full blur-xl -z-10 animate-pulse" />
                    
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <span className="font-mono font-black text-[10px] tracking-wider text-zinc-650 block uppercase">SILVER SPOT (XAG)</span>
                        <span className="text-[9px] text-zinc-400 font-mono mt-0.5 block">99.9% COUTURE SILVER AUDITED</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-0.5 font-black shrink-0 ${
                        silverPriceChangeBase >= 0 ? 'bg-green-50 text-emerald-700 border border-green-150' : 'bg-red-50 text-rose-700 border border-red-150'
                      }`}>
                        {silverPriceChangeBase >= 0 ? <ArrowUp className="w-2.5 h-2.5 text-emerald-600" /> : <ArrowDown className="w-2.5 h-2.5 text-rose-650" />}
                        {silverPriceChangeBase >= 0 ? '+' : ''}{silverPriceChangePct.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-end w-full pt-1">
                      <div className="text-2xl font-sans font-black tracking-tight text-zinc-950 flex items-baseline">
                        <span className="text-lg font-mono font-medium text-zinc-400 mr-0.5">{getCurrencySymbol(metalCurrency)}</span>
                        {getConvertedPrice(silverPriceBase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-[10px] font-mono text-zinc-400 font-normal ml-1">/{metalUnit === 'ounce' ? 'oz' : 'g'}</span>
                      </div>
                      <span className="text-[9.5px] text-zinc-400 font-mono">
                        {silverPriceChangeBase >= 0 ? '+' : ''}
                        {getConvertedPrice(silverPriceChangeBase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {metalCurrency}
                      </span>
                    </div>
                  </button>

                  {/* Informational Diagnostics Meta Footer */}
                  <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl space-y-1.5 font-sans">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-500 uppercase tracking-widest text-[9px]">FEED STATUS:</span>
                      <span className={`font-black uppercase text-[8px] px-1.5 py-0.5 rounded border tracking-wide select-none ${
                        apiProvider === 'demo'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {apiProvider === 'demo' ? '📶 DEMO SIMULATION FEED' : `🟢 Connected [${apiProvider.toUpperCase()}]`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-zinc-500 uppercase tracking-widest text-[9px]">LAST SYNC METRIC:</span>
                      <span className="text-zinc-700 font-bold">{lastPriceFetchTime}</span>
                    </div>
                  </div>

                </div>

                {/* Right side: Recharts Spot Trend Visualizer */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center bg-zinc-50 p-2 rounded-xl border border-zinc-150">
                    <span className="text-[10px] font-mono font-black text-zinc-650 uppercase tracking-widest pl-1">
                      {selectedChartAsset === 'XAU' ? '📈 GOLD SPOT PRICE TREND WAVE' : '📈 SILVER SPOT PRICE TREND WAVE'}
                    </span>
                    <div className="flex bg-zinc-200/50 p-0.5 rounded-lg text-[9px] font-mono font-bold uppercase border border-zinc-250">
                      {(['7d', '30d', '12m'] as const).map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setChartDuration(dur)}
                          className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                            chartDuration === dur ? 'bg-white text-zinc-950 shadow-3xs border border-zinc-150 font-black' : 'text-zinc-400 hover:text-zinc-955'
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-48 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={getHistoricChartData()}
                        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="metalSpotGradient" x1="0" y1="0" x2="0" y2="1">
                            {selectedChartAsset === 'XAU' ? (
                              <>
                                <stop offset="5%" stopColor="#d97706" stopOpacity={0.12}/>
                                <stop offset="95%" stopColor="#d97706" stopOpacity={0.00}/>
                              </>
                            ) : (
                              <>
                                <stop offset="5%" stopColor="#71717a" stopOpacity={0.12}/>
                                <stop offset="95%" stopColor="#71717a" stopOpacity={0.00}/>
                              </>
                            )}
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis 
                          dataKey="name" 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fontSize: 9, fill: '#71717a', fontFamily: 'JetBrains Mono' }}
                        />
                        <YAxis 
                          domain={['auto', 'auto']}
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fontSize: 9, fill: '#71717a', fontFamily: 'JetBrains Mono' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e4e4e7', 
                            borderRadius: '8px',
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            color: '#18181b',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                          }} 
                          formatter={(value: any) => [
                            `${getCurrencySymbol(metalCurrency)}${parseFloat(value).toLocaleString()} per ${metalUnit}`, 
                            selectedChartAsset === 'XAU' ? "Gold Spot" : "Silver Spot"
                          ]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke={selectedChartAsset === 'XAU' ? "#d97706" : "#71717a"} 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#metalSpotGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>

            {/* Medium Layout Grid: Chart & Countries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Side Chart - Total Revenue */}
              <div className="lg:col-span-2 bg-white border border-zinc-200 p-5 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-zinc-950 font-sans">
                      Consolidated Revenue Track
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      REAL-TIME REVENUE AGGREGATION
                    </p>
                  </div>
                  <div className="flex gap-2 text-[10px] font-mono">
                    <span className="bg-zinc-100 border border-zinc-200 text-zinc-800 px-2 py-0.5 rounded">Yearly</span>
                  </div>
                </div>

                <div className="text-2xl font-bold tracking-tight text-zinc-900 pt-1">
                  ${(72592 + realPurchasesSum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                {/* Recharts Curve Layout */}
                <div className="h-64 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={REVENUE_TREND_DATA}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#18181b" stopOpacity={0.06}/>
                          <stop offset="95%" stopColor="#18181b" stopOpacity={0.00}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 10, fill: '#888', fontFamily: 'JetBrains Mono' }}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 10, fill: '#888', fontFamily: 'JetBrains Mono' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e4e4e7', 
                          borderRadius: '2px',
                          fontFamily: 'Inter',
                          fontSize: '11px',
                          color: '#27272a'
                        }} 
                        formatter={(value: any) => [`$${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#18181b" 
                        strokeWidth={1.5}
                        fillOpacity={1} 
                        fill="url(#gradientColor)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            {/* Right Side - Country Distribution */}
            <div className="bg-white border border-zinc-200 p-5 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-zinc-950 font-sans">
                        Country Footprints
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        GLOBAL CUSTOMER SEGMENTATION
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                  </div>

                  <div className="space-y-4 pt-2">
                    
                    {/* Item UK */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-sans">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-800">
                          <Globe className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
                          United Kingdom
                        </span>
                        <span className="font-mono text-zinc-500">12,628 (80%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-zinc-800 h-full rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>

                    {/* Item US */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-sans">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-800">
                          <Globe className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
                          United States
                        </span>
                        <span className="font-mono text-zinc-500">10,628 (80%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-zinc-800 h-full rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>

                    {/* Item SE */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-sans">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-800">
                          <Globe className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
                          Sweden
                        </span>
                        <span className="font-mono text-zinc-500">8,628 (60%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-zinc-600 h-full rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>

                    {/* Item TR */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-sans">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-800">
                          <Globe className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
                          Turkey
                        </span>
                        <span className="font-mono text-zinc-500">6,628 (40%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-zinc-400 h-full rounded-full" style={{ width: '40%' }} />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 font-mono border-t border-zinc-100 pt-4 mt-6">
                  UPDATES INTERVAL: CHRONOLOGICAL 
                </div>
              </div>

            </div>

            {/* Bottom Section - Recent Orders List */}
            <div className="bg-white border border-zinc-200 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
                    Live Dispatch Logs
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    REAL-TIME TRANSACTIONS QUEUE
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setActiveTab('orders'); }} 
                    className="text-xs font-mono text-zinc-900 border border-zinc-200 px-4.5 py-1.5 hover:bg-zinc-50 transition-all bg-white rounded-lg cursor-pointer"
                  >
                    View All Orders
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F9] uppercase font-mono text-zinc-500 text-[10px] tracking-wider border-b border-zinc-100">
                    <tr>
                      <th className="py-3 px-5 font-semibold">Order ID</th>
                      <th className="py-3 px-5 font-semibold">Customer</th>
                      <th className="py-3 px-5 font-semibold">Products</th>
                      <th className="py-3 px-5 font-semibold">Amount</th>
                      <th className="py-3 px-5 font-semibold">Status</th>
                      <th className="py-3 px-5 font-semibold">Payment</th>
                      <th className="py-3 px-5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-sans">
                    {orders.slice(0, 4).map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-zinc-900 font-medium">{ord.id}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-medium text-zinc-900">{ord.customerName}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{ord.customerEmail}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="max-w-[200px] truncate text-zinc-600">
                            {ord.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-zinc-900 font-medium">
                          ${ord.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                            ord.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            ord.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            ord.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-zinc-500 font-mono text-[11px]">{ord.paymentMethod}</td>
                        <td className="py-3.5 px-5 text-right">
                          <button 
                            onClick={() => setSelectedOrderId(ord.id)}
                            className="px-3 py-1.5 text-[10px] font-mono border border-zinc-200 rounded-lg text-zinc-800 bg-white hover:bg-zinc-50 transition-all cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 2. PRODUCTS & INVENTORY MANAGER TAB */}
        {activeTab === 'products' && (
          <div className="space-y-5 animate-fade-in">
            {/* Sub Tabs Selection Bar */}
            <div className="bg-white border border-zinc-200 p-2 rounded-xl shadow-3xs flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProductsSectionMode('inventory')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  productsSectionMode === 'inventory'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Merchandise Inventory ({filteredProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setProductsSectionMode('categories')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  productsSectionMode === 'categories'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Category Directory & Assets ({categories.length})
              </button>
            </div>

            {productsSectionMode === 'categories' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-zinc-900">
                {/* 1. Category Form Panel */}
                <div className="lg:col-span-1 bg-white border border-zinc-200 p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="border-b border-zinc-150 pb-3">
                    <h3 className="text-xs font-mono font-black uppercase text-zinc-950 tracking-wider">
                      {editingCategory ? 'Update Category Details' : 'Sovereign Category Creator'}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {editingCategory ? 'AMEND ATTRIBUTES & ATTACHMENTS' : 'DECLARE NEW MAIN OR SUBCATEGORIES'}
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newCatName.trim()) return;

                      if (editingCategory) {
                        const updated = categories.map(c => 
                          c.id === editingCategory.id 
                            ? { ...c, name: newCatName.trim(), parentName: newCatParent || undefined, imageUrl: newCatImageUrl } 
                            : c
                        );
                        saveCategoriesToStorage(updated);
                        if (newCatImageUrl) {
                          recordImageUsageInGallery(newCatImageUrl, newCatName.trim(), 'Category');
                        }
                        setEditingCategory(null);
                      } else {
                        const fresh: Category = {
                          id: `cat-${Date.now()}`,
                          name: newCatName.trim(),
                          parentName: newCatParent || undefined,
                          imageUrl: newCatImageUrl || 'https://images.unsplash.com/photo-1610375461246-83df859d849d'
                        };
                        saveCategoriesToStorage([...categories, fresh]);
                        if (newCatImageUrl) {
                          recordImageUsageInGallery(newCatImageUrl, newCatName.trim(), 'Category');
                        }
                      }

                      // Reset form states
                      setNewCatName('');
                      setNewCatParent('');
                      setNewCatImageUrl('');
                    }}
                    className="space-y-4 text-xs font-sans"
                  >
                    <div className="space-y-1.5">
                      <label className="font-mono font-bold text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Category Name</label>
                      <input
                        type="text"
                        required
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Cast Bar, Minted Coin, Platinum"
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 text-zinc-900 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono font-bold text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Hierarchy Level (Parent Category)</label>
                      <select
                        value={newCatParent}
                        onChange={(e) => setNewCatParent(e.target.value)}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 text-zinc-900 font-medium"
                      >
                        <option value="">No Parent (Main Category)</option>
                        {categories.filter(c => !c.parentName).map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <p className="text-[9px] text-zinc-400 font-mono leading-tight">
                        Choose "Gold" or "Silver" to establish them as your subcategories, or None to introduce a new sovereign asset class block.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono font-bold text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Core Visual Image</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden shadow-2xs shrink-0 flex items-center justify-center">
                          {newCatImageUrl ? (
                            <img src={newCatImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="w-5 h-5 text-zinc-350" />
                          )}
                        </div>
                        <input
                          type="text"
                          value={newCatImageUrl}
                          onChange={(e) => setNewCatImageUrl(e.target.value)}
                          placeholder="Image URL from gallery or internet"
                          className="flex-1 p-2 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-[10px] font-mono text-zinc-900"
                        />
                      </div>


                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-805 text-white rounded-xl font-bold uppercase tracking-wider cursor-pointer shadow-sm text-[10px] text-center"
                      >
                        {editingCategory ? 'Deem Update Done' : 'Create Category'}
                      </button>
                      {editingCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(null);
                            setNewCatName('');
                            setNewCatParent('');
                            setNewCatImageUrl('');
                          }}
                          className="py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold uppercase tracking-wider cursor-pointer text-[10px] text-center"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* 2. Structured Hierarchy List */}
                <div className="lg:col-span-2 space-y-6 text-zinc-900">
                  {(() => {
                    const mainCategories = categories.filter(c => !c.parentName);
                    return mainCategories.map(main => {
                      const subs = categories.filter(c => c.parentName === main.name);
                      return (
                        <div key={main.id} className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden hover:border-zinc-950 transition-colors duration-300">
                          {/* Main Category Header Block */}
                          <div className="bg-[#FAF9F9] border-b border-zinc-150 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3.5">
                              <img src={main.imageUrl || 'https://images.unsplash.com/photo-1610375461246-83df859d849d'} alt={main.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-205 shadow-2xs" />
                              <div>
                                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 uppercase">Sovereign Main Category</span>
                                <h4 className="text-sm font-black text-zinc-950 font-sans tracking-tight uppercase mt-0.5">{main.name}</h4>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingCategory(main);
                                  setNewCatName(main.name);
                                  setNewCatParent(main.parentName || '');
                                  setNewCatImageUrl(main.imageUrl || '');
                                }}
                                className="p-1.5 border border-zinc-200 text-zinc-650 hover:border-zinc-950 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer bg-white"
                                title="Edit Main Category"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  const updated = categories.filter(c => c.id !== main.id && c.parentName !== main.name);
                                  saveCategoriesToStorage(updated);
                                }}
                                className="p-1.5 border border-red-105 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors cursor-pointer bg-white"
                                title="Delete Main Category and Subcategories"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Subcategories Directory */}
                          <div className="p-4 space-y-3">
                            <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase tracking-widest border-b border-zinc-50 pb-1.5">
                              Subcategories of {main.name} ({subs.length})
                            </span>
                            {subs.length === 0 ? (
                              <div className="py-6 text-center text-zinc-400 font-mono text-[10px]">
                                NO SUBCATEGORIES DESIGNATED FOR {main.name.toUpperCase()}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {subs.map(sub => (
                                  <div key={sub.id} className="p-3 border border-zinc-150 rounded-xl flex items-center justify-between hover:bg-zinc-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                      <img src={sub.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'} alt={sub.name} className="w-10 h-10 rounded-lg object-cover border border-zinc-100" />
                                      <div>
                                        <div className="font-bold text-zinc-900 font-sans">{sub.name}</div>
                                        <div className="text-[9px] font-mono text-zinc-400 uppercase mt-0.5">{main.name} &gt; {sub.name}</div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => {
                                          setEditingCategory(sub);
                                          setNewCatName(sub.name);
                                          setNewCatParent(sub.parentName || '');
                                          setNewCatImageUrl(sub.imageUrl || '');
                                        }}
                                        className="p-1 border border-zinc-205 text-zinc-650 hover:border-zinc-950 rounded bg-white cursor-pointer"
                                        title="Edit Subcategory"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const updated = categories.filter(c => c.id !== sub.id);
                                          saveCategoriesToStorage(updated);
                                        }}
                                        className="p-1 border border-red-105 text-red-500 hover:border-red-350 rounded bg-white cursor-pointer"
                                        title="Delete Subcategory"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}

                  {categories.length === 0 && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 font-mono text-xs">
                      NO CATEGORIES DETECTED IN ACTIVE WORKSPACE
                    </div>
                  )}
                </div>


              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs">
                  <div>
                    <h2 className="text-md font-sans font-bold text-zinc-900">Inventory Registry Tools</h2>
                    <p className="text-xs text-zinc-400 font-mono">ADD AND EDIT COMMERCIABLE ELEMENTS</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewProdCategories([]);
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Enroll New Product
                  </button>
                </div>

                {/* List Table */}
                <div className="bg-white border border-zinc-200 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-900">
                      <thead className="bg-[#FAF9F9] uppercase font-mono text-zinc-500 text-[10px] tracking-wider border-b border-zinc-100">
                        <tr>
                          <th className="py-3 px-5 font-semibold">SKU / Code</th>
                          <th className="py-3 px-5 font-semibold">Element Title</th>
                          <th className="py-3 px-5 font-semibold">Category</th>
                          <th className="py-3 px-5 font-semibold">List Price</th>
                          <th className="py-3 px-5 font-semibold">Stock Available</th>
                          <th className="py-3 px-5 font-semibold">Live Score</th>
                          <th className="py-3 px-5 font-semibold text-right">Inventory Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-sans">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="py-4 px-5 font-mono text-zinc-500 text-[11px]">{p.sku}</td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover border border-zinc-100 rounded-sm shadow-sm" />
                                <div>
                                  <div className="font-semibold text-zinc-900">{p.name}</div>
                                  <div className="text-[10px] text-zinc-400 truncate max-w-[200px]">{p.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-zinc-900">
                              {p.categories && p.categories.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[220px]">
                                  {p.categories.map((catId) => {
                                    const cat = categories.find((c) => c.id === catId);
                                    if (!cat) return null;
                                    return (
                                      <span key={catId} className="text-[9px] bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono text-amber-800 shrink-0 select-none">
                                        {cat.parentName ? `${cat.parentName} > ${cat.name}` : cat.name}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-[11px] bg-zinc-100 px-2 py-0.5 rounded font-mono text-zinc-600">{p.category}</span>
                              )}
                            </td>
                            <td className="py-4 px-5 font-mono text-zinc-900 font-medium">${p.price.toFixed(2)}</td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={p.stock}
                                  onChange={(e) => updateStock(p.id, parseInt(e.target.value) || 0)}
                                  className="w-16 px-1.5 py-0.5 border border-zinc-250 bg-white text-center font-mono rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-500"
                                />
                                {p.stock === 0 && (
                                  <span className="text-[10px] font-mono text-red-600 uppercase tracking-tight">OUT</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-1 font-mono text-zinc-700">
                                <span className="text-yellow-500">★</span>
                                <span className="font-bold">{p.rating || '—'}</span>
                                <span className="text-zinc-400">({p.reviewsCount})</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-right space-x-2">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="p-1.5 border border-zinc-200 text-zinc-700 hover:border-zinc-800 hover:text-zinc-950 transition-all rounded-lg inline-block cursor-pointer bg-white"
                                title="Edit specifications"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirmDeleteProductId === p.id) {
                                    deleteProduct(p.id);
                                    setConfirmDeleteProductId(null);
                                  } else {
                                    setConfirmDeleteProductId(p.id);
                                    setTimeout(() => setConfirmDeleteProductId(prev => prev === p.id ? null : prev), 5000);
                                  }
                                }}
                                className={`p-1.5 border transition-all rounded-lg inline-block cursor-pointer bg-white ${
                                  confirmDeleteProductId === p.id
                                    ? 'border-red-500 bg-red-600 text-white animate-pulse'
                                    : 'border-red-100 text-red-505 text-red-500 hover:bg-red-50 hover:border-red-300'
                                }`}
                                title={confirmDeleteProductId === p.id ? 'Click again to confirm purge' : 'Remove completely'}
                              >
                                {confirmDeleteProductId === p.id ? <Check className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-10 text-center font-mono text-zinc-400">
                              NO REGISTRY ENTRIES MATCH SEARCH PARAMETER: "{searchTerm}"
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. ORDER DISPATCH LOGS TAB (WITH SUB-STATUSES PRE-FILTERED) */}
        {activeTab.startsWith('orders') && (
          <div className="space-y-5">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs">
              <h2 className="text-md font-sans font-bold text-zinc-900">
                {activeTab === 'orders-progress' ? 'Shipped & In Transit (On Progress)' :
                 activeTab === 'orders-delivered' ? 'Delivered Orders' :
                 activeTab === 'orders-cancelled' ? 'Cancelled Orders' :
                 activeTab === 'orders-pending' ? 'Pending Orders Portfolio' :
                 'Secure Dispatch & Order Tracker'}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                {activeTab === 'orders-progress' ? 'SHIPPING DISPATCH INTEGRITY & VELOCITY TRACKER' :
                 activeTab === 'orders-delivered' ? 'COMPLETED CONTRACTS SUMMARY LOG' :
                 activeTab === 'orders-cancelled' ? 'DECLINED OR RETRACTED AGREEMENTS REGISTER' :
                 activeTab === 'orders-pending' ? 'UNFULFILLED INCOMING STACK - PENDING ACTION' :
                 'MODIFY TRANSIT VALUES AND COMPLIANCE'}
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F9] uppercase font-mono text-zinc-500 text-[10px] tracking-wider border-b border-zinc-100">
                    <tr>
                      <th className="py-3.5 px-5 font-semibold">ID</th>
                      <th className="py-3.5 px-5 font-semibold">Timestamp</th>
                      <th className="py-3.5 px-5 font-semibold">Purchaser</th>
                      <th className="py-3.5 px-5 font-semibold">Total Invoice</th>
                      <th className="py-3.5 px-5 font-semibold">Gateway</th>
                      <th className="py-3.5 px-5 font-semibold">Tracking Number</th>
                      <th className="py-3.5 px-5 font-semibold">Transit State</th>
                      <th className="py-3.5 px-5 font-semibold text-right">Execution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-sans">
                    {displayOrdersList.map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-zinc-900 font-bold">{ord.id}</td>
                        <td className="py-3.5 px-5 font-mono text-zinc-500">{ord.date}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-zinc-900">{ord.customerName}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{ord.customerEmail}</div>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-zinc-900">${ord.amount.toFixed(2)}</td>
                        <td className="py-3.5 px-5 font-mono text-zinc-400">{ord.paymentMethod}</td>
                        <td className="py-3.5 px-5 font-mono text-zinc-500">{ord.trackingNumber}</td>
                        <td className="py-3.5 px-5">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className={`px-2 py-1.5 text-[11px] font-mono border rounded-xl outline-none ${
                              ord.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              ord.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              ord.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-zinc-100 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono">
                          <button
                            onClick={() => setSelectedOrderId(ord.id)}
                            className="bg-zinc-100 text-zinc-800 hover:bg-zinc-200 text-[10px] px-3 py-1.5 rounded-lg transition-all border border-zinc-200 cursor-pointer font-medium"
                          >
                            Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                    {displayOrdersList.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-zinc-400 font-mono">
                          NO ACTIVE TRANSACTIONS ALIGN WITH KEYWORDS IN THIS SUB-SELECTION OR KEYWORDS: "{searchTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. CUSTOMER CENTER TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-5">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs">
              <h2 className="text-md font-sans font-bold text-zinc-900">Customer Center & CRM</h2>
              <p className="text-xs text-zinc-400 font-mono">AUDIT MEMBER STATUS, COMPLIANCE FREQUENCIES AND ACQUIRED GEOMETRY</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F9] uppercase font-mono text-zinc-500 text-[10px] tracking-wider border-b border-zinc-100">
                    <tr>
                      <th className="py-3.5 px-5 font-semibold">User Reference ID</th>
                      <th className="py-3.5 px-5 font-semibold">Customer Name</th>
                      <th className="py-3.5 px-5 font-semibold">Email Anchor</th>
                      <th className="py-3.5 px-5 font-semibold">Registered City</th>
                      <th className="py-3.5 px-5 font-semibold">Country Grid</th>
                      <th className="py-3.5 px-5 font-semibold">Total Inbound Orders</th>
                      <th className="py-3.5 px-5 font-semibold">Lifetime Valuations</th>
                      <th className="py-3.5 px-5 font-semibold text-right">Heartbeat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-sans">
                    {filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-zinc-400 text-[11px]">{cust.id}</td>
                        <td className="py-3.5 px-5 font-medium text-zinc-950 font-sans">{cust.name}</td>
                        <td className="py-3.5 px-5 font-mono text-zinc-500">{cust.email}</td>
                        <td className="py-3.5 px-5 text-zinc-600">{cust.city || 'Seattle'}</td>
                        <td className="py-3.5 px-5 flex items-center gap-1.5 py-3.5">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          <span>{cust.country}</span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-center text-zinc-900 font-bold">{cust.totalOrders}</td>
                        <td className="py-3.5 px-5 font-mono text-zinc-900 font-bold">${cust.totalSpent.toFixed(2)}</td>
                        <td className="py-3.5 px-5 text-right font-mono text-zinc-400 text-[11px]">{cust.lastActive}</td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-zinc-400 font-mono">
                          NO ACQUIRED CUSTOMERS RECORDED UNDER PATTERN: "{searchTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= NEW MENU TAB PANELS ======================= */}

        {/* 5. HEADER SECTION SETTINGS */}
        {activeTab === 'header' && (
          <div className="space-y-6 animate-fade-in">
            {headerSavedToast && (
              <div className="p-4 bg-teal-50 border border-teal-200 text-teal-850 rounded-xl flex items-center justify-between shadow-xs animate-fade-in">
                <span className="font-sans font-bold text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  ✨ Success: Header brand parameters & layout styles successfully persisted to global store!
                </span>
                <button 
                  onClick={() => setHeaderSavedToast(false)}
                  className="text-teal-500 hover:text-teal-800 font-bold text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-md font-sans font-bold text-zinc-900">Header Branding & Navigation Studio</h2>
                <p className="text-xs text-zinc-400 font-mono">DETERMINE VISUAL LAYOUT PRESETS, CONFIGURE BRAND EMBLEMS, AND MODEL COMPLEX MEGA MENU STRUCTURES IN REAL TIME</p>
              </div>
              <span className="text-[10px] font-mono border border-zinc-200 text-zinc-400 px-2.5 py-1 uppercase rounded-md leading-none bg-zinc-50 align-middle">
                System Interface Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Form Controls - left span 2 */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Header attributes customization */}
                <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-4">
                  <h3 className="text-sm font-mono font-bold uppercase text-zinc-800 border-b border-zinc-100 pb-2 flex items-center gap-2 block">
                    <Settings className="w-4 h-4 text-zinc-500" />
                    Header Identity Attributes
                  </h3>
                  
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-150 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="font-sans font-bold text-[11px] text-zinc-800 block uppercase tracking-wider">Announcement Banner status</label>
                        <span className="text-[9px] text-zinc-400 font-mono block">TOGGLE TOP-OF-PAGE ANNOUNCEMENT NOTICE BAR</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={headerShowNotice}
                        onChange={(e) => setHeaderShowNotice(e.target.checked)}
                        className="cursor-pointer w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      />
                    </div>

                    {headerShowNotice && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-200/60 animate-fade-in text-left">
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="font-sans font-bold text-[10px] text-zinc-550 block uppercase tracking-wider">Announcement Banner Text</label>
                          <input
                            type="text"
                            value={headerNoticeText}
                            onChange={(e) => setHeaderNoticeText(e.target.value)}
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-955 text-xs font-sans text-zinc-900"
                            placeholder="e.g. FREE WORLDWIDE SECURED INSURED COURIER DISPATCH FOR ALL DEPOSITS..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-sans font-bold text-[10px] text-zinc-550 block uppercase tracking-wider">Banner Text Alignment</label>
                          <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-zinc-200/80 flex h-[38px] items-center">
                            {(['left', 'center', 'right'] as const).map((align) => (
                              <button
                                key={align}
                                type="button"
                                onClick={() => setHeaderNoticeAlign(align)}
                                className={`h-7 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer uppercase ${
                                  headerNoticeAlign === align
                                    ? 'bg-zinc-950 text-white shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-950 bg-transparent'
                                }`}
                              >
                                {align}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-sans font-bold text-[10px] text-zinc-500 block uppercase tracking-wider">
                        Brand Logo Name Text
                      </label>
                      <input
                        type="text"
                        value={adminLogoText}
                        onChange={(e) => setAdminLogoText(e.target.value)}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-sans text-zinc-900 font-black uppercase tracking-wider unicode-bidi"
                        placeholder="e.g. GOLDIAMA."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-sans font-bold text-[10px] text-zinc-500 block uppercase tracking-wider">Brand Logo Emblem Letter</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={adminLogoLetter}
                        onChange={(e) => setAdminLogoLetter(e.target.value)}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-sans text-zinc-900 font-black uppercase"
                        placeholder="e.g. G"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-sans font-bold text-[10px] text-zinc-500 block uppercase tracking-wider">
                        Brand Established Caption
                      </label>
                      <input
                        type="text"
                        value={headerEstablished}
                        onChange={(e) => setHeaderEstablished(e.target.value)}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-sans text-zinc-900 uppercase font-mono tracking-wider"
                        placeholder="e.g. LTD ESTABLISHED 2001"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-sans font-bold text-[10px] text-zinc-500 block uppercase tracking-wider">Established Align</label>
                      <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-zinc-200 flex h-[38px] items-center">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => setHeaderEstablishedAlign(align)}
                            className={`h-7 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer uppercase ${
                              headerEstablishedAlign === align
                                ? 'bg-zinc-950 text-white shadow-xs'
                                : 'text-zinc-500 hover:text-zinc-950 bg-transparent'
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Logo Type Selector & URL Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="font-sans font-bold text-[10px] text-zinc-500 block uppercase tracking-wider">Logo Type</label>
                      <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
                        <button
                          type="button"
                          onClick={() => setAdminLogoType('letter')}
                          className={`py-1.5 text-[11px] font-sans font-bold rounded-lg transition-all cursor-pointer ${
                            adminLogoType === 'letter'
                              ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                              : 'text-zinc-500 hover:text-zinc-950'
                          }`}
                        >
                          🅰️ Text Badge
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminLogoType('image')}
                          className={`py-1.5 text-[11px] font-sans font-bold rounded-lg transition-all cursor-pointer ${
                            adminLogoType === 'image'
                              ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                              : 'text-zinc-500 hover:text-zinc-950'
                          }`}
                        >
                          🖼️ Custom Image
                        </button>
                      </div>
                    </div>

                    {adminLogoType === 'image' && (
                      <div className="space-y-6 animate-fade-in border-t border-zinc-150 pt-4">
                        
                        {/* 1. ADMIN SIDEBAR LOGO SELECTOR */}
                        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">ADMIN SIDEBAR CONSOLE</span>
                              <h4 className="font-sans font-bold text-xs text-zinc-900 uppercase tracking-tight">Sidebar Logo Source</h4>
                            </div>
                            
                            {/* Segment tabs */}
                            <div className="flex p-0.5 bg-zinc-200/60 rounded-lg text-[10px] select-none font-bold">
                              <button
                                type="button"
                                onClick={() => setAdminLogoSource('vault')}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  adminLogoSource === 'vault'
                                    ? 'bg-white text-zinc-950 shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-950'
                                }`}
                              >
                                📂 Media Vault
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdminLogoSource('host')}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  adminLogoSource === 'host'
                                    ? 'bg-white text-zinc-950 shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-950'
                                }`}
                              >
                                🔗 Image Host
                              </button>
                            </div>
                          </div>

                          {adminLogoSource === 'vault' ? (
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={adminLogoVaultSearch}
                                  onChange={(e) => setAdminLogoVaultSearch(e.target.value)}
                                  className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 text-zinc-900"
                                  placeholder="Search image in Media Vault..."
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('media');
                                    setSearchTerm('');
                                  }}
                                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-white text-[10px] font-mono uppercase font-bold rounded-lg transition-colors cursor-pointer"
                                  title="Go to Media Library context to upload new assets"
                                >
                                  + Upload New
                                </button>
                              </div>

                              {/* Thumbnails grid */}
                              {(() => {
                                const list = mediaItems.filter(item =>
                                  item.name.toLowerCase().includes(adminLogoVaultSearch.toLowerCase())
                                );
                                if (list.length === 0) {
                                  return (
                                    <div className="py-2 text-center text-[10px] font-mono text-zinc-400">
                                      NO ITEMS MATCHING THIS FILTER QUERY.
                                    </div>
                                  );
                                }
                                return (
                                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1 bg-white rounded-lg border border-zinc-150">
                                    {list.map((med) => {
                                      const isSelected = adminLogoImageUrl === med.url;
                                      return (
                                        <button
                                          key={med.id}
                                          type="button"
                                          onClick={() => setAdminLogoImageUrl(med.url)}
                                          className={`relative aspect-square w-full rounded-md overflow-hidden border cursor-pointer transition-all ${
                                            isSelected 
                                              ? 'border-[#d97706] ring-2 ring-amber-500/30' 
                                              : 'border-zinc-200 hover:border-zinc-400'
                                          }`}
                                          title={`${med.name} (${med.size})`}
                                        >
                                          <img src={med.url} alt={med.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                          {isSelected && (
                                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                              <span className="text-[9px] bg-[#d97706] text-white px-1.5 py-0.5 rounded-full font-sans font-black">✓</span>
                                            </div>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                              
                              <div className="text-[9.5px] font-mono text-zinc-400 truncate">
                                Selected Location: <span className="text-zinc-700">{adminLogoImageUrl}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3.5">
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Custom Image URL Path</label>
                                <input
                                  type="text"
                                  value={adminLogoImageUrl}
                                  onChange={(e) => setAdminLogoImageUrl(e.target.value)}
                                  className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-mono text-zinc-950"
                                  placeholder="Paste custom image link (e.g., Imgur, S3, Unsplash)..."
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-sans font-bold text-[9px] text-zinc-400 block uppercase tracking-wider">Predefined Console Presets</label>
                                <div className="grid grid-cols-5 gap-1.5">
                                  {[
                                    { name: 'Minimal Shield', url: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=128&h=128&q=80' },
                                    { name: 'Abstract Signet', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&h=128&q=80' },
                                    { name: 'Monochrome Crest', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=128&h=128&q=80' },
                                    { name: 'Geometric Emblem', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699552e?auto=format&fit=crop&w=128&h=128&q=80' },
                                    { name: 'Abstract Canvas', url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=128&h=128&q=80' }
                                  ].map((preset) => (
                                    <button
                                      key={preset.name}
                                      type="button"
                                      onClick={() => setAdminLogoImageUrl(preset.url)}
                                      className={`group relative h-8 w-full rounded-lg overflow-hidden border cursor-pointer transition-all ${
                                        adminLogoImageUrl === preset.url ? 'border-zinc-950 ring-1 ring-zinc-950' : 'border-zinc-200 hover:border-zinc-400'
                                      }`}
                                      title={preset.name}
                                    >
                                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. STOREFRONT LOGO SELECTOR */}
                        <div id="design-storefront-logo-selector" className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">FRONTEND STOREFRONT HEADER</span>
                              <h4 className="font-sans font-bold text-xs text-zinc-900 uppercase tracking-tight">Storefront Logo</h4>
                            </div>

                            {/* Segment tabs */}
                            <div className="flex p-0.5 bg-zinc-200/60 rounded-lg text-[10px] select-none font-bold">
                              <button
                                type="button"
                                onClick={() => setFrontendLogoSource('vault')}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  frontendLogoSource === 'vault'
                                    ? 'bg-white text-zinc-950 shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-950'
                                }`}
                              >
                                📂 Media Vault
                              </button>
                              <button
                                type="button"
                                onClick={() => setFrontendLogoSource('host')}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  frontendLogoSource === 'host'
                                    ? 'bg-white text-zinc-950 shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-950'
                                }`}
                              >
                                🔗 Image Host
                              </button>
                            </div>
                          </div>

                          <div className="p-4 bg-white border border-zinc-150 rounded-xl space-y-3.5 shadow-3xs">
                            {frontendLogoSource === 'vault' ? (
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={frontendLogoVaultSearch}
                                    onChange={(e) => setFrontendLogoVaultSearch(e.target.value)}
                                    className="flex-1 px-3 py-1.5 bg-[#FAF9F9] border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 text-zinc-900"
                                    placeholder="Search image in Media Vault..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTab('media');
                                      setSearchTerm('');
                                    }}
                                    className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-850 text-white text-[10px] font-mono uppercase font-bold rounded-lg transition-colors cursor-pointer"
                                    title="Go to Media Library to upload new assets"
                                  >
                                    + Upload New
                                  </button>
                                </div>

                                {/* Thumbnails grid */}
                                {(() => {
                                  const list = mediaItems.filter(item =>
                                    item.name.toLowerCase().includes(frontendLogoVaultSearch.toLowerCase())
                                  );
                                  if (list.length === 0) {
                                    return (
                                      <div className="py-2 text-center text-[10px] font-mono text-zinc-400">
                                        NO ITEMS MATCHING THIS FILTER QUERY.
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1 bg-[#FAF9F9] rounded-lg border border-zinc-150">
                                      {list.map((med) => {
                                        const isSelected = frontendLogoImageUrl === med.url;
                                        return (
                                          <button
                                            key={med.id}
                                            type="button"
                                            onClick={() => setFrontendLogoImageUrl(med.url)}
                                            className={`relative aspect-square w-full rounded-md overflow-hidden border cursor-pointer transition-all ${
                                              isSelected 
                                                ? 'border-[#d97706] ring-2 ring-amber-500/30' 
                                                : 'border-zinc-200 hover:border-zinc-400'
                                            }`}
                                            title={`${med.name} (${med.size})`}
                                          >
                                            <img src={med.url} alt={med.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            {isSelected && (
                                              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                                <span className="text-[9px] bg-[#d97706] text-white px-1.5 py-0.5 rounded-full font-sans font-black">✓</span>
                                              </div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                                
                                <div className="text-[9.5px] font-mono text-zinc-400 truncate">
                                  Selected: <span className="text-zinc-700">{frontendLogoImageUrl}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3.5">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-wider block">Custom Image URL Path</label>
                                  <input
                                    type="text"
                                    value={frontendLogoImageUrl}
                                    onChange={(e) => setFrontendLogoImageUrl(e.target.value)}
                                    className="w-full p-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-mono text-zinc-950"
                                    placeholder="Paste custom image link (e.g., Imgur, S3, Unsplash)..."
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="font-sans font-bold text-[9px] text-zinc-400 block uppercase tracking-wider">Predefined Presets</label>
                                  <div className="grid grid-cols-5 gap-1.5">
                                    {[
                                      { name: 'Minimal Shield', url: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=128&h=128&q=80' },
                                      { name: 'Abstract Signet', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&h=128&q=80' },
                                      { name: 'Monochrome Crest', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=128&h=128&q=80' },
                                      { name: 'Geometric Emblem', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699552e?auto=format&fit=crop&w=128&h=128&q=80' },
                                      { name: 'Abstract Canvas', url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=128&h=128&q=80' }
                                    ].map((preset) => (
                                      <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => setFrontendLogoImageUrl(preset.url)}
                                        className={`group relative h-8 w-full rounded-lg overflow-hidden border cursor-pointer transition-all ${
                                          frontendLogoImageUrl === preset.url ? 'border-zinc-950 ring-1 ring-zinc-950 scale-[1.03]' : 'border-zinc-200 hover:border-zinc-400'
                                        }`}
                                        title={preset.name}
                                      >
                                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <span className="text-[11px] font-bold text-zinc-700 font-sans">Sticky Top Bar</span>
                      <input
                        type="checkbox"
                        checked={headerSticky}
                        onChange={(e) => setHeaderSticky(e.target.checked)}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <span className="text-[11px] font-bold text-zinc-700 font-sans">Show Shopping Cart</span>
                      <input
                        type="checkbox"
                        checked={headerShowCart}
                        onChange={(e) => setHeaderShowCart(e.target.checked)}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <span className="text-[11px] font-bold text-zinc-700 font-sans">Show Search Input</span>
                      <input
                        type="checkbox"
                        checked={headerShowSearch}
                        onChange={(e) => setHeaderShowSearch(e.target.checked)}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Storefront Header Pill Buttons Configuration */}
                  <div className="border-t border-zinc-150 pt-5 mt-5 space-y-4">
                    <div>
                      <span className="text-[11px] font-mono font-black text-zinc-950 uppercase tracking-widest block">STOREFRONT HEADER SUPPORT PILLS</span>
                      <p className="text-[11px] text-zinc-500 font-sans mt-0.5 font-medium">Configure, enable/disable, rename, assign custom icons, or switch actions (interactive popups vs custom links) for the support pills shown on your Storefront Header.</p>
                    </div>

                    {/* Support Pills sizing selector option */}
                    <div className="p-4 bg-zinc-55 border border-zinc-200.5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
                      <div>
                        <span className="text-[11px] font-mono font-black text-zinc-950 uppercase tracking-wider block">💊 SUPPORT PILLS BUTTON SIZE</span>
                        <p className="text-[9px] text-zinc-500 font-sans mt-0.5 uppercase font-bold">Adjust size scaling for compliance and concierge active header buttons</p>
                      </div>
                      <div className="flex gap-1">
                        {['S', 'M', 'L'].map((sz) => {
                          const label = sz === 'S' ? '◽ S (Standard)' : sz === 'M' ? '◽ M (Medium)' : '◽ L (Large)';
                          const isSelected = headerSupportPillsSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setHeaderSupportPillsSize(sz)}
                              className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer uppercase ${
                                isSelected ? 'bg-zinc-950 text-white shadow-xs' : 'bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-650'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* CARD 1: COMPLIANCE PORTAL */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4 text-left">
                        <div className="flex items-center justify-between border-b border-zinc-150 pb-2.5">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-zinc-600" />
                            <span className="text-[11px] font-bold text-zinc-950 font-sans uppercase tracking-wider">Pill A: Compliance Portal Config</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={headerShowCompliance}
                            onChange={(e) => setHeaderShowCompliance(e.target.checked)}
                            className="cursor-pointer h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                          />
                        </div>

                        {headerShowCompliance && (
                          <div className="space-y-3 text-left">
                            
                            {/* Label Input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">Button Label Text</label>
                              <input
                                type="text"
                                value={headerComplianceLabel}
                                onChange={(e) => setHeaderComplianceLabel(e.target.value)}
                                className="w-full bg-white border border-zinc-205 px-3 py-1.5 text-xs font-semibold rounded-lg font-sans text-zinc-900 focus:border-zinc-950 outline-none transition-all"
                                placeholder="Compliance Portal"
                              />
                            </div>

                            {/* Icon Choice Input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">Choose Icon</label>
                              <select
                                value={headerComplianceIcon}
                                onChange={(e) => setHeaderComplianceIcon(e.target.value)}
                                className="w-full bg-white border border-zinc-205 px-3 py-1.5 text-xs font-semibold rounded-lg font-sans text-zinc-900 focus:border-zinc-950 outline-none transition-all"
                              >
                                <option value="ShieldCheck">🛡️ Shield Check (Default)</option>
                                <option value="Sparkles">✨ Sparkles</option>
                                <option value="HelpCircle">❓ Help Circle</option>
                                <option value="Info">ℹ️ Info</option>
                                <option value="Phone">📞 Phone/Hotline</option>
                                <option value="Mail">✉️ Email Mailbox</option>
                                <option value="Link">🔗 Custom Link</option>
                                <option value="MessageSquare">💬 Message Square</option>
                                <option value="MapPin">📍 Map Pin Location</option>
                                <option value="Star">⭐ Star badge</option>
                                <option value="Heart">❤️ Heart symbol</option>
                              </select>
                            </div>

                            {/* Action Choice Input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">Button Interaction Action</label>
                              <select
                                value={headerComplianceAction}
                                onChange={(e) => setHeaderComplianceAction(e.target.value)}
                                className="w-full bg-white border border-zinc-205 px-3 py-1.5 text-xs font-semibold rounded-lg font-sans text-zinc-900 focus:border-zinc-950 outline-none transition-all"
                              >
                                <option value="popup">Trigger Dynamic Modal Popup</option>
                                <option value="link">Navigate to URL or Custom Link string</option>
                              </select>
                            </div>

                            {/* Link Destination */}
                            {headerComplianceAction === 'link' && (
                              <div className="space-y-1 p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                                <label className="text-[9px] font-mono font-bold text-amber-700 uppercase tracking-wide block">Custom Link URL / Destination</label>
                                <input
                                  type="text"
                                  value={headerComplianceUrl}
                                  onChange={(e) => setHeaderComplianceUrl(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 px-3 py-1.5 text-xs font-semibold rounded-lg font-sans text-zinc-900 focus:border-zinc-950 outline-none transition-all placeholder:text-zinc-400"
                                  placeholder="e.g. https://domain.com/legal, mailto:info@domain.com, or tel:+123456"
                                />
                                <span className="text-[9px] font-sans text-zinc-400 block mt-1">Accepts standard web URLs, mailto or tel schemes.</span>
                              </div>
                            )}

                            {/* Popup Editor Content */}
                            {headerComplianceAction === 'popup' && (
                              <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-3">
                                <span className="text-[10px] font-mono font-bold text-zinc-700 uppercase tracking-wider block border-b border-zinc-100 pb-1">Edit Compliance Popup Content</span>
                                
                                <div className="space-y-2.5">
                                  <div className="space-y-0.5">
                                    <label className="text-[8px] font-mono font-bold text-zinc-450 uppercase block">Popup Category Badge Text</label>
                                    <input
                                      type="text"
                                      value={headerCompliancePopupBadge}
                                      onChange={(e) => setHeaderCompliancePopupBadge(e.target.value)}
                                      className="w-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-[11px] font-semibold rounded font-sans text-zinc-800"
                                    />
                                  </div>

                                  <div className="space-y-0.5">
                                    <label className="text-[8px] font-mono font-bold text-zinc-450 uppercase block">Popup Main Title Header</label>
                                    <input
                                      type="text"
                                      value={headerCompliancePopupTitle}
                                      onChange={(e) => setHeaderCompliancePopupTitle(e.target.value)}
                                      className="w-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-[11px] font-semibold rounded font-sans text-zinc-800"
                                    />
                                  </div>

                                  {complianceSections.map((sec, idx) => (
                                    <div key={idx} className="border-t border-zinc-100 pt-2 space-y-1.5 text-left">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Audit Section {idx + 1}</span>
                                        <div className="flex items-center gap-2">
                                          <label className="flex items-center gap-1 text-[8px] font-mono text-zinc-400 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={!!sec.highlighted}
                                              onChange={(e) => {
                                                const updated = [...complianceSections];
                                                updated[idx] = { ...updated[idx], highlighted: e.target.checked };
                                                setComplianceSections(updated);
                                              }}
                                              className="h-3 w-3 rounded border-zinc-300 text-zinc-950 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                            />
                                            Highlight Accent
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = complianceSections.filter((_, sIdx) => sIdx !== idx);
                                              setComplianceSections(updated);
                                            }}
                                            className="text-red-500 hover:text-red-700 text-[8px] font-mono uppercase font-bold tracking-wider cursor-pointer"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                      <input
                                        type="text"
                                        value={sec.title || ''}
                                        onChange={(e) => {
                                          const updated = [...complianceSections];
                                          updated[idx] = { ...updated[idx], title: e.target.value };
                                          setComplianceSections(updated);
                                        }}
                                        placeholder="Section Title"
                                        className="w-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-[11px] font-bold rounded font-sans text-zinc-850 outline-none focus:border-zinc-500"
                                      />
                                      <textarea
                                        value={sec.text || ''}
                                        onChange={(e) => {
                                          const updated = [...complianceSections];
                                          updated[idx] = { ...updated[idx], text: e.target.value };
                                          setComplianceSections(updated);
                                        }}
                                        rows={2}
                                        placeholder="Section Body text"
                                        className="w-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-[11px] font-sans text-zinc-650 rounded outline-none focus:border-zinc-500"
                                      />
                                    </div>
                                  ))}

                                  <div className="pt-2 border-t border-zinc-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setComplianceSections([
                                          ...complianceSections,
                                          { title: `Audit Standard ${complianceSections.length + 1}`, text: `Describe the audit and validation standard here.`, highlighted: false }
                                        ]);
                                      }}
                                      className="w-full py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 text-zinc-650 hover:text-zinc-950 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                                    >
                                      + Add New Audit Section
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        )}
                      </div>

                      {/* CARD 2: CONCIERGE / GET IN TOUCH */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4 text-left">
                        <div className="flex items-center justify-between border-b border-zinc-150 pb-2.5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-zinc-600" />
                            <span className="text-[11px] font-bold text-zinc-950 font-sans uppercase tracking-wider">Pill B: Get in Touch / Contact Config</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={headerShowConcierge}
                            onChange={(e) => setHeaderShowConcierge(e.target.checked)}
                            className="cursor-pointer h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                          />
                        </div>

                        {headerShowConcierge && (
                          <div className="space-y-3 text-left font-sans">
                            
                            {/* Label Input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">Button Label Text</label>
                              <input
                                type="text"
                                value={headerConciergeLabel}
                                onChange={(e) => setHeaderConciergeLabel(e.target.value)}
                                className="w-full bg-white border border-zinc-205 px-3 py-1.5 text-xs font-semibold rounded-lg font-sans text-zinc-900 focus:border-zinc-950 outline-none transition-all"
                                placeholder="Get In touch"
                              />
                            </div>

                            {/* Icon Choice Input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">Choose Icon</label>
                              <select
                                value={headerConciergeIcon}
                                onChange={(e) => setHeaderConciergeIcon(e.target.value)}
                                className="w-full bg-white border border-zinc-205 px-3 py-1.5 text-xs font-semibold rounded-lg font-sans text-zinc-900 focus:border-zinc-950 outline-none transition-all"
                              >
                                <option value="Sparkles">✨ Sparkles (Default)</option>
                                <option value="ShieldCheck">🛡️ Shield Check</option>
                                <option value="HelpCircle">❓ Help Circle</option>
                                <option value="Info">ℹ️ Info</option>
                                <option value="Phone">📞 Phone/Hotline</option>
                                <option value="Mail">✉️ Email Mailbox</option>
                                <option value="Link">🔗 Custom Link</option>
                                <option value="MessageSquare">💬 Message Square</option>
                                <option value="MapPin">📍 Map Pin Location</option>
                                <option value="Star">⭐ Star badge</option>
                                <option value="Heart">❤️ Heart symbol</option>
                              </select>
                            </div>

                            {/* Action Choice Input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">Button Interaction Action</label>
                              <select
                                value={headerConciergeAction}
                                onChange={(e) => setHeaderConciergeAction(e.target.value)}
                                className="w-full bg-white border border-zinc-205 px-3 py-1.5 text-xs font-semibold rounded-lg font-sans text-zinc-900 focus:border-zinc-950 outline-none transition-all"
                              >
                                <option value="popup">Trigger Dynamic Modal Popup</option>
                                <option value="link">Navigate to URL or Custom Link string</option>
                              </select>
                            </div>

                            {/* Link Destination */}
                            {headerConciergeAction === 'link' && (
                              <div className="space-y-1 p-2.5 bg-amber-500/5 border border-[#d97706]/15 rounded-lg bg-[#d97706]/5">
                                <label className="text-[9px] font-mono font-bold text-[#b45309] uppercase tracking-wide block">Custom Link URL / Destination</label>
                                <input
                                  type="text"
                                  value={headerConciergeUrl}
                                  onChange={(e) => setHeaderConciergeUrl(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 px-3 py-1.5 text-xs font-semibold rounded-lg font-sans text-zinc-900 focus:border-zinc-950 outline-none transition-all placeholder:text-zinc-400"
                                  placeholder="e.g. https://calendly.com, mailto:vip@domain.com, or tel:+41225058820"
                                />
                                <span className="text-[9px] font-sans text-zinc-400 block mt-1">Accepts standard web URLs, mailto or tel schemes.</span>
                              </div>
                            )}

                            {/* Popup Editor Content */}
                            {headerConciergeAction === 'popup' && (
                              <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-3">
                                <span className="text-[10px] font-mono font-bold text-zinc-700 uppercase tracking-wider block border-b border-zinc-100 pb-1">Edit Contact Popup Content</span>
                                
                                <div className="space-y-2.5">
                                  <div className="space-y-0.5">
                                    <label className="text-[8px] font-mono font-bold text-zinc-450 uppercase block">Popup Intro Subtitle</label>
                                    <input
                                      type="text"
                                      value={headerConciergePopupBadge}
                                      onChange={(e) => setHeaderConciergePopupBadge(e.target.value)}
                                      className="w-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-[11px] font-semibold rounded font-sans text-zinc-800"
                                    />
                                  </div>

                                  <div className="space-y-0.5">
                                    <label className="text-[8px] font-mono font-bold text-zinc-450 uppercase block">Popup Header Title Message</label>
                                    <input
                                      type="text"
                                      value={headerConciergePopupTitle}
                                      onChange={(e) => setHeaderConciergePopupTitle(e.target.value)}
                                      className="w-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-[11px] font-semibold rounded font-sans text-zinc-800"
                                    />
                                  </div>

                                  <div className="space-y-0.5 border-t border-zinc-100 pt-1.5">
                                    <label className="text-[8px] font-mono font-bold text-zinc-450 uppercase block">Main Intro Paragraph</label>
                                    <textarea
                                      value={headerConciergePopupSub}
                                      onChange={(e) => setHeaderConciergePopupSub(e.target.value)}
                                      rows={2}
                                      className="w-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-[11px] rounded font-sans text-zinc-650"
                                    />
                                  </div>

                                  {/* Dynamic Contacts Blocks */}
                                  {conciergeBoxes.map((box, idx) => (
                                    <div key={idx} className="border-t border-zinc-100 pt-2 space-y-1.5 text-left font-sans">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Contact Block {idx + 1}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = conciergeBoxes.filter((_, bIdx) => bIdx !== idx);
                                            setConciergeBoxes(updated);
                                          }}
                                          className="text-red-500 hover:text-red-700 text-[8px] font-mono uppercase font-bold tracking-wider cursor-pointer"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 px-1.5 py-2 bg-zinc-50 rounded-lg">
                                        <div>
                                          <label className="text-[7.5px] font-mono text-zinc-400 block uppercase">Box Label</label>
                                          <input
                                            type="text"
                                            value={box.title || ''}
                                            onChange={(e) => {
                                              const updated = [...conciergeBoxes];
                                              updated[idx] = { ...updated[idx], title: e.target.value };
                                              setConciergeBoxes(updated);
                                            }}
                                            className="w-full bg-white border border-zinc-200 px-1 py-1 text-[9.5px] font-mono rounded text-zinc-800 uppercase outline-none focus:border-zinc-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[7.5px] font-mono text-zinc-400 block uppercase">Value/Link</label>
                                          <input
                                            type="text"
                                            value={box.val || ''}
                                            onChange={(e) => {
                                              const updated = [...conciergeBoxes];
                                              updated[idx] = { ...updated[idx], val: e.target.value };
                                              setConciergeBoxes(updated);
                                            }}
                                            className="w-full bg-white border border-zinc-200 px-1 py-1 text-[9.5px] rounded text-amber-700 uppercase font-sans font-bold outline-none focus:border-zinc-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[7.5px] font-mono text-zinc-400 block uppercase">Tag/Caption</label>
                                          <input
                                            type="text"
                                            value={box.tag || ''}
                                            onChange={(e) => {
                                              const updated = [...conciergeBoxes];
                                              updated[idx] = { ...updated[idx], tag: e.target.value };
                                              setConciergeBoxes(updated);
                                            }}
                                            className="w-full bg-white border border-zinc-200 px-1 py-1 text-[9.5px] font-mono rounded text-zinc-500 uppercase outline-none focus:border-zinc-500"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  <div className="pt-2 border-t border-zinc-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setConciergeBoxes([
                                          ...conciergeBoxes,
                                          { title: `SECURE CHANNEL`, val: `@goldiamachannel`, tag: `24/7 CURATED` }
                                        ]);
                                      }}
                                      className="w-full py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 text-zinc-650 hover:text-zinc-950 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                                    >
                                      + Add New Contact Block
                                    </button>
                                  </div>

                                  {/* Highlight booking */}
                                  <div className="border-t border-zinc-100 pt-2 space-y-2">
                                    <span className="text-[8px] font-mono font-medium text-zinc-400 tracking-widest block uppercase">Highlight Container Box</span>
                                    <input
                                      type="text"
                                      value={headerConciergeHighlightTitle}
                                      onChange={(e) => setHeaderConciergeHighlightTitle(e.target.value)}
                                      placeholder="Container Title"
                                      className="w-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-[11px] font-bold rounded font-sans text-zinc-800"
                                    />
                                    <textarea
                                      value={headerConciergeHighlightText}
                                      onChange={(e) => setHeaderConciergeHighlightText(e.target.value)}
                                      rows={2}
                                      placeholder="Description"
                                      className="w-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-[11px] font-sans text-zinc-650 rounded"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        value={headerConciergeHighlightLabel}
                                        onChange={(e) => setHeaderConciergeHighlightLabel(e.target.value)}
                                        placeholder="Schedule Call prefix"
                                        className="w-full bg-zinc-50 border border-zinc-200 px-2 py-1 text-[10px] font-mono rounded text-zinc-500 uppercase"
                                      />
                                      <input
                                        type="text"
                                        value={headerConciergeHighlightVal}
                                        onChange={(e) => setHeaderConciergeHighlightVal(e.target.value)}
                                        placeholder="Contact Value (e.g. VIP@GOLDIAMA.CO)"
                                        className="w-full bg-zinc-50 border border-zinc-200 px-2 py-1 text-[10px] font-mono rounded text-zinc-800 font-black"
                                      />
                                    </div>
                                  </div>

                                </div>
                              </div>
                            )}

                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Storefront Brand Elements Toggles */}
                  <div className="border-t border-zinc-150 pt-4 mt-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">STOREFRONT HEADER BRAND VISIBILITY (STOREFRONT ONLY)</span>
                      <p className="text-[9px] text-zinc-400 font-sans mt-0.5">Toggle display of each brand element on your main Storefront Header. These elements remain fully visible and active within the admin console preview/sidebar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                        <span className="text-[11px] font-bold text-zinc-700 font-sans">Show Brand Name Text</span>
                        <input
                          type="checkbox"
                          checked={frontendShowBrandNameText}
                          onChange={(e) => {
                            setFrontendShowBrandNameText(e.target.checked);
                            localStorage.setItem('min_eco_show_brand_name_text', e.target.checked.toString());
                          }}
                          className="cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                        <span className="text-[11px] font-bold text-zinc-700 font-sans">Show Emblem Icon/Badge</span>
                        <input
                          type="checkbox"
                          checked={frontendShowBrandEmblem}
                          onChange={(e) => {
                            setFrontendShowBrandEmblem(e.target.checked);
                            localStorage.setItem('min_eco_show_brand_emblem', e.target.checked.toString());
                          }}
                          className="cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                        <span className="text-[11px] font-bold text-zinc-700 font-sans">Show Established Caption</span>
                        <input
                          type="checkbox"
                          checked={frontendShowEstablishedCaption}
                          onChange={(e) => {
                            setFrontendShowEstablishedCaption(e.target.checked);
                            localStorage.setItem('min_eco_show_established_caption', e.target.checked.toString());
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Logo Size Sizing Option (Secondary convenience control) */}
                    <div className="border-t border-zinc-150 pt-4 mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">FRONTEND HEADER LOGO SCALE</span>
                        <span className="text-[9px] font-mono font-bold text-[#d97706] bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded uppercase">Size: {frontendLogoSize}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 bg-zinc-50 border border-zinc-200 p-1.5 rounded-xl">
                        {(['M', 'L', 'XL', 'XXL'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              setFrontendLogoSize(sz);
                              localStorage.setItem('min_eco_frontend_logo_size', sz);
                            }}
                            className={`py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                              frontendLogoSize === sz
                                ? 'bg-zinc-950 text-white'
                                : 'bg-transparent text-zinc-550 hover:bg-zinc-200/50'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        // Persist to local storage elements
                        localStorage.setItem('min_eco_header_notice', headerNoticeText);
                        localStorage.setItem('min_eco_header_show_notice', headerShowNotice.toString());
                        localStorage.setItem('min_eco_header_notice_align', headerNoticeAlign);
                        localStorage.setItem('min_eco_header_established', headerEstablished);
                        localStorage.setItem('min_eco_header_established_align', headerEstablishedAlign);
                        localStorage.setItem('min_eco_header_sticky', headerSticky.toString());
                        localStorage.setItem('min_eco_header_show_cart', headerShowCart.toString());
                        localStorage.setItem('min_eco_header_show_search', headerShowSearch.toString());
                        localStorage.setItem('min_eco_header_support_pills_size', headerSupportPillsSize);
                        localStorage.setItem('min_eco_header_show_compliance', headerShowCompliance.toString());
                        localStorage.setItem('min_eco_header_compliance_label', headerComplianceLabel);
                        localStorage.setItem('min_eco_header_compliance_icon', headerComplianceIcon);
                        localStorage.setItem('min_eco_header_compliance_action', headerComplianceAction);
                        localStorage.setItem('min_eco_header_compliance_url', headerComplianceUrl);
                        localStorage.setItem('min_eco_header_compliance_popup_title', headerCompliancePopupTitle);
                        localStorage.setItem('min_eco_header_compliance_popup_badge', headerCompliancePopupBadge);
                        localStorage.setItem('min_eco_header_compliance_sec1_title', headerComplianceSec1Title);
                        localStorage.setItem('min_eco_header_compliance_sec1_text', headerComplianceSec1Text);
                        localStorage.setItem('min_eco_header_compliance_sec2_title', headerComplianceSec2Title);
                        localStorage.setItem('min_eco_header_compliance_sec2_text', headerComplianceSec2Text);
                        localStorage.setItem('min_eco_header_compliance_sec3_title', headerComplianceSec3Title);
                        localStorage.setItem('min_eco_header_compliance_sec3_text', headerComplianceSec3Text);
                        localStorage.setItem('min_eco_header_compliance_sections', JSON.stringify(complianceSections));

                        localStorage.setItem('min_eco_header_show_concierge', headerShowConcierge.toString());
                        localStorage.setItem('min_eco_header_concierge_label', headerConciergeLabel);
                        localStorage.setItem('min_eco_header_concierge_icon', headerConciergeIcon);
                        localStorage.setItem('min_eco_header_concierge_action', headerConciergeAction);
                        localStorage.setItem('min_eco_header_concierge_url', headerConciergeUrl);
                        localStorage.setItem('min_eco_header_concierge_popup_title', headerConciergePopupTitle);
                        localStorage.setItem('min_eco_header_concierge_popup_badge', headerConciergePopupBadge);
                        localStorage.setItem('min_eco_header_concierge_popup_sub', headerConciergePopupSub);
                        localStorage.setItem('min_eco_header_concierge_box1_title', headerConciergeBox1Title);
                        localStorage.setItem('min_eco_header_concierge_box1_val', headerConciergeBox1Val);
                        localStorage.setItem('min_eco_header_concierge_box1_tag', headerConciergeBox1Tag);
                        localStorage.setItem('min_eco_header_concierge_box2_title', headerConciergeBox2Title);
                        localStorage.setItem('min_eco_header_concierge_box2_val', headerConciergeBox2Val);
                        localStorage.setItem('min_eco_header_concierge_box2_tag', headerConciergeBox2Tag);
                        localStorage.setItem('min_eco_header_concierge_boxes', JSON.stringify(conciergeBoxes));
                        localStorage.setItem('min_eco_header_concierge_highlight_title', headerConciergeHighlightTitle);
                        localStorage.setItem('min_eco_header_concierge_highlight_text', headerConciergeHighlightText);
                        localStorage.setItem('min_eco_header_concierge_highlight_label', headerConciergeHighlightLabel);
                        localStorage.setItem('min_eco_header_concierge_highlight_val', headerConciergeHighlightVal);
                        localStorage.setItem('min_eco_show_brand_name_text', frontendShowBrandNameText.toString());
                        localStorage.setItem('min_eco_show_brand_emblem', frontendShowBrandEmblem.toString());
                        localStorage.setItem('min_eco_show_established_caption', frontendShowEstablishedCaption.toString());
                        localStorage.setItem('min_eco_frontend_logo_size', frontendLogoSize);
                        
                        setHeaderSavedToast(true);
                        setTimeout(() => setHeaderSavedToast(false), 4500);
                      }}
                      className="w-full bg-zinc-955 text-white bg-zinc-900 border hover:border-zinc-950 hover:bg-zinc-800 font-sans font-bold tracking-widest hover:bg-zinc-800 transition-colors text-xs py-2.5 rounded-xl block cursor-pointer"
                    >
                      SAVE BASIC HEADER ATTRIBUTES
                    </button>
                  </div>
                </div>

                {/* 2. Header Layout style configuration */}
                <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-4">
                  <h3 className="text-sm font-mono font-bold uppercase text-zinc-800 border-b border-zinc-100 pb-2 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-zinc-500" />
                    Selected Header Layout Preset Style
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">DETERMINE SCREEN-SPACE ARCHITECTURE AND BRAND REPRESENTATION WITH A SINGLE CLICK</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option Minimalist Classic */}
                    <button
                      type="button"
                      onClick={() => setHeaderStyle('minimal')}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        headerStyle === 'minimal'
                          ? 'border-zinc-950 bg-zinc-50/55 shadow-xs ring-1 ring-zinc-950'
                          : 'border-zinc-200 hover:border-zinc-400 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-bold text-xs text-zinc-900">Minimal Classic Single-Row</span>
                        {headerStyle === 'minimal' && <span className="text-[9px] bg-zinc-950 text-white font-mono px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Active</span>}
                      </div>
                      <p className="mt-1.5 text-[11px] text-zinc-500 font-sans leading-relaxed">
                        Clean typography-oriented top bar with branding emblem left, custom horizontal navigation links inside the main row, operator panel and cart right. Ideal for direct shopping experiences.
                      </p>
                    </button>

                    {/* Option Goldiama Luxurious Bold */}
                    <button
                      type="button"
                      onClick={() => setHeaderStyle('goldiama')}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        headerStyle === 'goldiama'
                          ? 'border-zinc-950 bg-zinc-50/55 shadow-xs ring-1 ring-zinc-950'
                          : 'border-zinc-200 hover:border-zinc-400 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-bold text-xs text-zinc-900">Goldiama Premium Double-Row</span>
                        {headerStyle === 'goldiama' && <span className="text-[9px] bg-zinc-950 text-white font-mono px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Active</span>}
                      </div>
                      <p className="mt-1.5 text-[11px] text-zinc-500 font-sans leading-relaxed">
                        Dual-row luxury layout. Top row hosts the iconic brand logo on left, dynamic round compliance and concierge-desk buttons on right. Bottom row hosts centered premium mega menu trigger columns.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 3. Navigation Studio & Mega Menu Builder Panel */}
                <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-6">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2 flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-mono font-bold uppercase text-zinc-800 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-zinc-500" />
                        Interactive Navigation Menu Architecture
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">ESTABLISH CHANNELS, STRUCTURAL ANCHORS, CATEGORIES AND COLLAPSIBLE MEGA MENU TILES</p>
                    </div>
                    {!isAddingItem && !editingItem && (
                      <button
                        type="button"
                        onClick={startAddNavItem}
                        className="flex items-center gap-1 bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer font-bold uppercase font-sans tracking-wide transition-all shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Node
                      </button>
                    )}
                  </div>

                  {/* Navigation nodes layout */}
                  <div className="space-y-2">
                    {navigationMenu.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-[#FAF9F9] border border-zinc-200 rounded-xl hover:border-zinc-400 transition-all"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                            0{index + 1}
                          </span>
                          <span className="font-sans font-black text-xs text-[#18181b] uppercase tracking-tight">{item.label}</span>
                          <span className="font-mono text-[9px] text-zinc-400">{item.href}</span>
                          
                          {(() => {
                            const matchedPage = pagesList.find(p => p.slug === item.href);
                            if (matchedPage) {
                              return (
                                <span className="text-[8.5px] font-mono bg-zinc-950 text-[#fff] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border border-emerald-400/30">
                                  🟢 Connected: {matchedPage.title} ({matchedPage.slug})
                                </span>
                              );
                            }
                            return null;
                          })()}

                          {item.isMegaMenu ? (
                            <span className="text-[8px] font-bold uppercase tracking-widest font-sans bg-amber-500/10 text-amber-850 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1 animate-pulse">
                              ✨ Mega Menu Active ({item.megaMenu?.links.length || 0} links)
                            </span>
                          ) : (
                            <span className="text-[8px] font-semibold uppercase font-sans bg-zinc-200/50 text-zinc-650 px-2 py-0.5 rounded-full">
                              📄 Direct Anchor
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 md:mt-0 pb-1">
                          {/* Control triggers to shift order */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const copy = [...navigationMenu];
                              const temp = copy[index];
                              copy[index] = copy[index - 1];
                              copy[index - 1] = temp;
                              setNavigationMenu(copy);
                            }}
                            className={`p-1 bg-white border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 rounded transition-all cursor-pointer ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-950" />
                          </button>
                          <button
                            type="button"
                            disabled={index === navigationMenu.length - 1}
                            onClick={() => {
                              const copy = [...navigationMenu];
                              const temp = copy[index];
                              copy[index] = copy[index + 1];
                              copy[index + 1] = temp;
                              setNavigationMenu(copy);
                            }}
                            className={`p-1 bg-white border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 rounded transition-all cursor-pointer ${index === navigationMenu.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-950" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditNavItem(item)}
                            className="px-2.5 py-1 text-[10px] font-sans font-bold bg-white hover:bg-zinc-100 transition-all cursor-pointer rounded border border-zinc-300 flex items-center gap-1 text-zinc-800"
                          >
                            <Edit className="w-3 h-3 text-zinc-500" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteNavItem(item.id)}
                            className="p-1 border border-red-150 text-red-500 hover:bg-red-50 hover:text-red-700 rounded cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Inline Editor for custom menu customisation */}
                  {(isAddingItem || editingItem) && (
                    <div className="p-5 border border-zinc-950 bg-zinc-50 rounded-xl space-y-4 animate-fade-in shadow-xs">
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                        <span className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-950 flex items-center gap-1.5 font-sans font-extrabold">
                          {editingItem ? <Edit className="w-3.5 h-3.5 text-amber-600" /> : <Plus className="w-3.5 h-3.5 text-teal-600" />}
                          {editingItem ? `Editing Navigation Node: ${editingItem.label}` : 'Architecting New Navigation Node'}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setEditingItem(null); setIsAddingItem(false); }}
                          className="text-zinc-400 hover:text-zinc-950 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Editing panel input grids */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase tracking-widest">Link Label / Display Name</label>
                          <input
                            type="text"
                            placeholder="e.g. GOLD"
                            value={newNavLabel}
                            onChange={(e) => setNewNavLabel(e.target.value)}
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-xs font-sans font-bold uppercase transition-all"
                          />
                        </div>

                        <div className="space-y-1.5 text-left bg-zinc-50 border border-zinc-200 p-3 rounded-lg">
                          <label className="font-sans font-bold text-[9px] text-[#18181b] uppercase tracking-widest block font-extrabold mb-1">Anchor Link Target Selection</label>
                          <div className="space-y-2">
                            <div>
                              <span className="text-[8.5px] font-mono text-zinc-500 block uppercase font-bold mb-1">🔗 Active Web Directory Page</span>
                              <select
                                value={pagesList.some(p => p.slug === newNavHref) ? newNavHref : 'custom'}
                                onChange={(e) => {
                                  if (e.target.value !== 'custom') {
                                    setNewNavHref(e.target.value);
                                  }
                                }}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none text-xs font-sans text-zinc-900 font-bold"
                              >
                                <option value="custom">-- Enter Custom Anchor or Slug --</option>
                                {pagesList.map((pg) => (
                                  <option key={pg.id} value={pg.slug}>
                                    📄 {pg.title} ({pg.slug})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="text-[8.5px] font-mono text-zinc-500 block uppercase font-bold mb-1">Or enter manual anchor link (e.g. #gold or external url)</span>
                              <input
                                type="text"
                                placeholder="e.g. #gold"
                                value={newNavHref}
                                onChange={(e) => setNewNavHref(e.target.value)}
                                className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-xs font-mono transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Is Mega Menu toggle */}
                      <div className="space-y-2 pt-2 text-left">
                        <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase tracking-widest block font-bold">Menu Mode Type</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewNavIsMega(false)}
                            className={`flex-1 py-2 text-xs font-sans font-bold rounded-lg border cursor-pointer transition-all ${
                              !newNavIsMega
                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                                : 'text-zinc-500 border-zinc-200 bg-white hover:text-zinc-950'
                            }`}
                          >
                            📄 Standard Non-expandable Anchor Link
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewNavIsMega(true)}
                            className={`flex-1 py-2 text-xs font-sans font-bold rounded-lg border cursor-pointer transition-all ${
                              newNavIsMega
                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                                : 'text-zinc-550 border-zinc-200 bg-white hover:text-zinc-950'
                            }`}
                          >
                            ✨ Full-Width Interactive Mega Menu Column
                          </button>
                        </div>
                      </div>

                      {/* 4. MEGA MENU SPECIFIC DETAILS FORM */}
                      {newNavIsMega && (
                        <div className="space-y-4 pt-4 border-t border-zinc-200 animate-fade-in text-left">
                          <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-4">
                            <span className="text-[10px] font-mono tracking-widest font-semibold text-zinc-400 uppercase block border-b border-zinc-100 pb-1.5 mb-2">MEGA MENU RICH CONTENT SETUP</span>
                            
                            <div className="space-y-1.5">
                              <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase tracking-widest">Mega Menu Slogan / Text Proclamation (Left Banner Column)</label>
                              <input
                                type="text"
                                placeholder="e.g. LEADING WITH TRANSPARENCY IN THE GLOBAL GOLD INDUSTRY."
                                value={newNavBannerTitle}
                                onChange={(e) => setNewNavBannerTitle(e.target.value)}
                                className="w-full p-2.5 bg-zinc-50/20 border border-zinc-200 rounded-lg outline-none focus:border-zinc-955 text-xs font-sans font-medium text-zinc-900"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase tracking-widest">Showcase Landscape Image URL (Right Column)</label>
                                <input
                                  type="text"
                                  placeholder="Image unsplash link..."
                                  value={newNavImageUrl}
                                  onChange={(e) => setNewNavImageUrl(e.target.value)}
                                  className="w-full p-2.5 bg-zinc-50/20 border border-zinc-200 rounded-lg outline-none focus:border-zinc-955 text-xs font-mono text-zinc-900"
                                />

                                {/* Quick selection items */}
                                <div className="flex gap-1.5 pt-1 overflow-x-auto pb-1 max-w-full">
                                  {[
                                    { label: '🥇 Stacked Gold', url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&h=300&q=80' },
                                    { label: '🥈 Stacked Silver', url: 'https://images.unsplash.com/photo-1605557202138-097824c3f9f4?auto=format&fit=crop&w=400&h=300&q=80' },
                                    { label: '💎 Sparkle Diamond', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&h=300&q=80' },
                                    { label: '💍 Bespoke Couture', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&h=300&q=80' }
                                  ].map(pres => (
                                    <button
                                      key={pres.label}
                                      type="button"
                                      onClick={() => setNewNavImageUrl(pres.url)}
                                      className="text-[9px] font-sans font-semibold bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded text-zinc-650 cursor-pointer whitespace-nowrap"
                                    >
                                      {pres.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase tracking-widest">Showcase Image Text Caption Overlay</label>
                                <input
                                  type="text"
                                  placeholder="e.g. PUREST STANDARDS, FINEST GOLD"
                                  value={newNavImageTitle}
                                  onChange={(e) => setNewNavImageTitle(e.target.value)}
                                  className="w-full p-2.5 bg-zinc-50/20 border border-zinc-200 rounded-lg outline-none focus:border-zinc-955 text-xs font-sans text-zinc-900"
                                />
                              </div>
                            </div>

                            {/* Sub links lists inside mega menu */}
                            <div className="space-y-2.5 pt-2 border-t border-zinc-100 text-left">
                              <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Column Sub-Items Catalog List</label>
                              
                              {newNavLinksRaw.length === 0 ? (
                                <p className="text-[11px] text-zinc-400 font-mono italic">No items are nested in this mega menu yet. Insert an item below!</p>
                              ) : (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {newNavLinksRaw.map((lnk, idx) => (
                                    <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-sans transition-all ${editingSubIndex === idx ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100' : 'bg-zinc-100 border-zinc-200'}`}>
                                      <span className="font-semibold text-zinc-905">{lnk.label}</span>
                                      <span className="font-mono text-[9px] text-zinc-400">({lnk.href})</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingSubIndex(idx);
                                          setTempSubLabel(lnk.label);
                                          setTempSubHref(lnk.href);
                                        }}
                                        className="text-amber-600 hover:text-amber-800 font-bold ml-1.5 cursor-pointer text-[10px] uppercase font-mono"
                                        title="Edit sub-link information"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeSubLink(idx)}
                                        className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer text-sm leading-none"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Forms to insert column items */}
                              <div className="flex flex-col gap-3 bg-zinc-50 p-4 rounded-lg border border-zinc-200 text-left">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <span className="text-[9px] text-[#18181b] font-mono font-bold block uppercase mb-1">Sub Item Name</span>
                                    <input
                                      type="text"
                                      placeholder="e.g. Cast Gold Bars"
                                      value={tempSubLabel}
                                      onChange={(e) => setTempSubLabel(e.target.value)}
                                      className="w-full p-2 border border-zinc-200 rounded bg-white text-xs text-zinc-900 outline-none focus:border-zinc-500 font-medium"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-[#18181b] font-mono font-bold block uppercase mb-1">Active Directory Page</span>
                                    <select
                                      value={pagesList.some(p => p.slug === tempSubHref) ? tempSubHref : 'custom'}
                                      onChange={(e) => {
                                        if (e.target.value !== 'custom') {
                                          setTempSubHref(e.target.value);
                                        }
                                      }}
                                      className="w-full p-2 border border-zinc-200 rounded bg-white text-xs text-zinc-900 outline-none font-bold"
                                    >
                                      <option value="custom">-- Custom Anchor/Href --</option>
                                      {pagesList.map((pg) => (
                                        <option key={pg.id} value={pg.slug}>
                                          📄 {pg.title} ({pg.slug})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-[#18181b] font-mono font-bold block uppercase mb-1">HREF / Target</span>
                                    <input
                                      type="text"
                                      placeholder="e.g. #cast"
                                      value={tempSubHref}
                                      onChange={(e) => setTempSubHref(e.target.value)}
                                      className="w-full p-2 border border-zinc-200 rounded bg-white text-xs text-zinc-900 outline-none focus:border-zinc-500 font-mono"
                                    />
                                  </div>
                                </div>
                                {editingSubIndex !== null ? (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={addSubLink}
                                      className="flex-1 py-2 bg-[#d97706] hover:bg-[#b45309] text-white rounded text-xs font-bold uppercase transition-all cursor-pointer text-center block"
                                    >
                                      Save Sub-Item Changes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSubIndex(null);
                                        setTempSubLabel('');
                                        setTempSubHref('');
                                      }}
                                      className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded text-xs font-bold uppercase transition-all cursor-pointer text-center block"
                                    >
                                      Cancel Edit
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={addSubLink}
                                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded text-xs font-bold uppercase transition-all cursor-pointer text-center block shrink-0"
                                  >
                                    + Insert Nested Sub-Item
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Editor Form Bottom Submission */}
                      <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 text-left">
                        <button
                          type="button"
                          onClick={() => { setEditingItem(null); setIsAddingItem(false); }}
                          className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 font-sans font-semibold text-[11px] rounded-lg transition-all text-zinc-500 cursor-pointer uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveNavItem}
                          className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-sans font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1.5 uppercase"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save Node Configuration
                        </button>
                      </div>
                    </div>
                  )}

                  {/* NAV STYLING CONTROL SUITE */}
                  <div className="border-t border-zinc-100 pt-6 mt-6 space-y-5 text-left" id="navigation-styling-suite">
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase text-zinc-800 flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                        Interactive Navigation Layout & Typography Customizer
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-mono uppercase">Fine-tune font-families, weights, spacing pads, custom gutters and color accents in real-time</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                      {/* Preset Style Customizer */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-zinc-505 uppercase tracking-wider block">Menu Preset Style</label>
                        <select
                          value={navPresetStyle}
                          onChange={(e) => setNavPresetStyle(e.target.value)}
                          className="w-full bg-white border border-zinc-200 px-2.5 py-1.5 text-xs rounded-lg font-sans text-zinc-800 outline-none focus:border-zinc-500"
                        >
                          <option value="underlined">Classic Underlined (Border-B)</option>
                          <option value="pill">Luxe Pillow Highlight (Pill Bag)</option>
                          <option value="rounded-badge">Bespoke Rounded Badge</option>
                          <option value="bordered-button">Architectural Bordered Button</option>
                          <option value="clean-text">Pure Sleek Typography (No Frame)</option>
                        </select>
                      </div>

                      {/* Font Family Selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-zinc-505 uppercase tracking-wider block">Font Style Typo-Family</label>
                        <select
                          value={navFontFamily}
                          onChange={(e) => setNavFontFamily(e.target.value)}
                          className="w-full bg-white border border-zinc-200 px-2.5 py-1.5 text-xs rounded-lg font-sans text-zinc-800 outline-none focus:border-zinc-500"
                        >
                          <option value="sans">Clean Sans-Serif (Standard Inter)</option>
                          <option value="serif">Imperial Roman Serif (Timeless Playfair)</option>
                          <option value="mono">Tech Monospace (JetBrains Mono)</option>
                          <option value="grotesk">Geometric Grotesk (Outfit Bold)</option>
                        </select>
                      </div>

                      {/* Font Size Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-zinc-505 uppercase tracking-wider block">Font Scale Size</label>
                        <select
                          value={navFontSize}
                          onChange={(e) => setNavFontSize(e.target.value)}
                          className="w-full bg-white border border-zinc-200 px-2.5 py-1.5 text-xs rounded-lg font-sans text-zinc-800 outline-none focus:border-zinc-500"
                        >
                          <option value="xs">Extra Small (11px)</option>
                          <option value="sm">Elegant Small (12px)</option>
                          <option value="md">Balanced Base (14px)</option>
                          <option value="lg">Prominent Large (16px)</option>
                          <option value="xl">Sovereign Executive XL (18px)</option>
                        </select>
                      </div>

                      {/* Font Weight Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-zinc-505 uppercase tracking-wider block">Font Weight style</label>
                        <select
                          value={navFontWeight}
                          onChange={(e) => setNavFontWeight(e.target.value)}
                          className="w-full bg-white border border-zinc-200 px-2.5 py-1.5 text-xs rounded-lg font-sans text-zinc-800 outline-none focus:border-zinc-500"
                        >
                          <option value="light">Lightweight Thin (300)</option>
                          <option value="normal">Classic Normal (400)</option>
                          <option value="medium">Subtle Medium (500)</option>
                          <option value="semibold">Sophisticated Semi-Bold (600)</option>
                          <option value="bold">Empowered Bold (700)</option>
                          <option value="extrabold">Ultimate Extra-Bold (800)</option>
                          <option value="black">Heavy Royal Black (900)</option>
                        </select>
                      </div>

                      {/* Character Case Setting */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-zinc-505 uppercase tracking-wider block">Letter Character Case</label>
                        <select
                          value={navFontCase}
                          onChange={(e) => setNavFontCase(e.target.value)}
                          className="w-full bg-white border border-zinc-200 px-2.5 py-1.5 text-xs rounded-lg font-sans text-zinc-800 outline-none focus:border-zinc-500"
                        >
                          <option value="uppercase">Sleek UPPERCASE</option>
                          <option value="uppercase-spaced">Spaced U P P E R C A S E</option>
                          <option value="lowercase">lowered case letters</option>
                          <option value="capitalize">Standard Capitalize Case</option>
                          <option value="none">Default Raw Code (As Entered)</option>
                        </select>
                      </div>

                      {/* Line height gap spacing */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-zinc-505 uppercase tracking-wider block">Line Gap (Link Pad-Y)</label>
                        <select
                          value={navLineGap}
                          onChange={(e) => setNavLineGap(e.target.value)}
                          className="w-full bg-white border border-zinc-200 px-2.5 py-1.5 text-xs rounded-lg font-sans text-zinc-800 outline-none focus:border-zinc-500"
                        >
                          <option value="tiny">Micro (4px Padding)</option>
                          <option value="small">Streamlined (8px Padding)</option>
                          <option value="medium">Balanced (12px Padding)</option>
                          <option value="large">Spacious (18px Padding)</option>
                          <option value="excessive">Luxurious Breathe (24px Padding)</option>
                        </select>
                      </div>

                      {/* Block Horizontal Spacing */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-zinc-505 uppercase tracking-wider block">Menu Block Spacing (Gap)</label>
                        <select
                          value={navBlockSpacing}
                          onChange={(e) => setNavBlockSpacing(e.target.value)}
                          className="w-full bg-white border border-zinc-200 px-2.5 py-1.5 text-xs rounded-lg font-sans text-zinc-800 outline-none focus:border-zinc-500"
                        >
                          <option value="tiny">Tight Compact (8px Gaps)</option>
                          <option value="small">Snug Slim (16px Gaps)</option>
                          <option value="medium">Standard Harmonious (24px Gaps)</option>
                          <option value="large">Grand Columnar (36px Gaps)</option>
                          <option value="excessive">Ultra Immersive Wide (56px Gaps)</option>
                        </select>
                      </div>

                      {/* Royal Color Theme Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-zinc-505 uppercase tracking-wider block">Royal Active Palette</label>
                        <select
                          value={navColorStyle}
                          onChange={(e) => setNavColorStyle(e.target.value)}
                          className="w-full bg-white border border-zinc-200 px-2.5 py-1.5 text-xs rounded-lg font-sans text-zinc-850 outline-none focus:border-zinc-500"
                        >
                          <option value="amber">✨ Core Goldiama Amber (#d97706)</option>
                          <option value="emerald">💚 Sovereign Jade Emerald (#059669)</option>
                          <option value="sapphire">💙 Diamond Sovereign Blue (#2563eb)</option>
                          <option value="ruby">❤️ Bespoke Vintage Ruby (#dc2626)</option>
                          <option value="slate">🩶 Platinum Office Slate (#4b5563)</option>
                          <option value="onyx">🖤 Absolute Obsidian Onyx (#111111)</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-zinc-200 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Toggle for Vertical Divider Lines */}
                      <div className="flex items-center justify-between p-3 bg-white border border-zinc-150 rounded-lg shadow-2xs hover:border-zinc-300 transition-colors">
                        <div className="space-y-0.5">
                          <label className="text-[10.5px] font-sans font-bold text-zinc-800 uppercase tracking-wide block">⚖️ Vertical Divider Lines</label>
                          <p className="text-[9.5px] text-zinc-400 font-sans leading-tight">Introduce elegant clean visual separators between horizontal menu items.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNavShowDividers(!navShowDividers)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            navShowDividers ? 'bg-zinc-950' : 'bg-zinc-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              navShowDividers ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Toggle for Stretch Menu Items */}
                      <div className="flex items-center justify-between p-3 bg-white border border-zinc-150 rounded-lg shadow-2xs hover:border-zinc-300 transition-colors">
                        <div className="space-y-0.5">
                          <label className="text-[10.5px] font-sans font-bold text-zinc-800 uppercase tracking-wide block">↔️ Stretch Menu Edge-to-Edge</label>
                          <p className="text-[9.5px] text-zinc-400 font-sans leading-tight">Distribute links evenly across the container width for balanced coverage.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNavStretchMenu(!navStretchMenu)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            navStretchMenu ? 'bg-zinc-950' : 'bg-zinc-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              navStretchMenu ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                     </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Sidepanel - sticky placement in lg screens */}
              <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl space-y-4 lg:sticky lg:top-24">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-zinc-800 tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-500 animate-spin-slow" />
                    Interactive Simulator
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-tight">REAL-TIME WORKSPACE LAYOUT SIMULATOR</p>
                </div>

                {/* Mock browser header frame */}
                <div className="border border-zinc-200 bg-white rounded-xl shadow-xl overflow-hidden text-zinc-900 relative">
                  {/* Browser toolbar top */}
                  <div className="bg-zinc-100/85 px-3 py-2 flex items-center justify-between border-b border-zinc-200/65">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    </div>
                    <div className="bg-white/80 border border-zinc-200/50 rounded-md px-3 py-0.5 text-[8px] font-mono text-zinc-400 w-32 truncate text-center mx-2 select-none">
                      https://{adminLogoText.toLowerCase().replace(/\./g, '') || 'goldiama'}.co/
                    </div>
                    <div className="w-6 shrink-0" /> {/* Balance */}
                  </div>

                  {/* Simulated Announcement Banner */}
                  {headerShowNotice && (
                    <div className={`bg-zinc-900 text-white py-1.5 px-3 text-[7px] tracking-widest font-mono uppercase font-bold leading-none animate-fade-in ${
                      headerNoticeAlign === 'left' ? 'text-left animate-fade-in' : headerNoticeAlign === 'right' ? 'text-right animate-fade-in' : 'text-center animate-fade-in'
                    }`}>
                      {headerNoticeText || 'FREE COURIER SHIPPING ON ALL ORDERS PORTFOLIOS'}
                    </div>
                  )}

                  {/* SIMULATED LIVE HEADER MAIN ROW */}
                  <div className="bg-white/95 border-b border-zinc-150 p-2.5 relative select-none">
                    
                    {/* STYLE A: Minimal Classic single row layout */}
                    {headerStyle === 'minimal' ? (
                      <div className="flex justify-between items-center gap-2">
                        {/* Mock logo left */}
                        <div className="flex items-center gap-1 select-none">
                          {frontendLogoMode === 'image_only' && frontendLogoImageUrl ? (
                            <img src={frontendLogoImageUrl} className={`${simImageOnlyClass} object-contain rounded-none`} referrerPolicy="no-referrer" />
                          ) : (
                            <>
                              {frontendShowBrandEmblem && (
                                adminLogoType === 'image' && frontendLogoImageUrl ? (
                                  <img src={frontendLogoImageUrl} className={`${simEmblemImageClass} object-contain rounded-none`} referrerPolicy="no-referrer" />
                                ) : (
                                  <div className={`${simEmblemLetterClass} bg-zinc-950 text-white rounded font-black flex items-center justify-center uppercase`}>{adminLogoLetter}</div>
                                )
                              )}
                              {frontendShowBrandNameText && (
                                <span className={`font-black tracking-wider text-zinc-955 uppercase shrink-0 ${simBrandNameTextClass}`}>
                                  {adminLogoText}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Mid navigation links horizontal preview */}
                        <div className={`hidden sm:flex items-center overflow-hidden py-1 ${navStretchMenu ? 'flex-1 grow justify-between mx-4' : getSimBlockSpacing(navBlockSpacing)}`}>
                          {navigationMenu.slice(0, 4).map((item, index) => (
                            <React.Fragment key={item.id}>
                              {index > 0 && navShowDividers && (
                                <div className="w-px h-3 bg-zinc-200 self-center shrink-0 mx-1 opacity-80" />
                              )}
                              <div 
                                onMouseEnter={() => { if (item.isMegaMenu) setMockHoverItem(item.id); }}
                                onMouseLeave={() => setMockHoverItem(null)}
                                className={`relative cursor-pointer transition-colors shrink-0 ${navStretchMenu ? 'flex-grow text-center font-sans' : ''}`}
                              >
                                <span className={`whitespace-nowrap transition-all duration-200 ${navStretchMenu ? 'w-full text-center block' : ''} ${getSimFontFamily(navFontFamily)} ${getSimFontSize(navFontSize)} ${getSimFontWeight(navFontWeight)} ${getSimFontCase(navFontCase)} ${getSimLineGap(navLineGap)} ${getSimColorStyle(item.id, index)}`}>
                                  {item.label}
                                </span>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Right tools mini */}
                        <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
                          {headerShowSearch && <Search className="w-3 h-3 text-zinc-400" />}
                          {headerShowCart && (
                            <div className="flex items-center gap-0.5 text-zinc-955">
                              <ShoppingBag className="w-3 h-3 text-zinc-650" />
                              <span className="text-[8px] font-mono font-bold">0</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* STYLE B: Goldiama Double-Row luxurious Layout */
                      <div className="space-y-2">
                        {/* Upper row */}
                        <div className="flex justify-between items-center gap-2">
                          {/* Logo left */}
                          <div className="flex items-center gap-1 select-none">
                            {frontendLogoMode === 'image_only' && frontendLogoImageUrl ? (
                              <img src={frontendLogoImageUrl} className={`${simImageOnlyClass} object-contain rounded-none`} referrerPolicy="no-referrer" />
                            ) : (
                              <>
                                {frontendShowBrandEmblem && (
                                  adminLogoType === 'image' && frontendLogoImageUrl ? (
                                    <img src={frontendLogoImageUrl} className={`${simEmblemImageClass} object-contain rounded-none`} referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className={`${simEmblemLetterClass} bg-zinc-950 text-white rounded font-black flex items-center justify-center uppercase`}>{adminLogoLetter}</div>
                                  )
                                )}
                                {(frontendShowBrandNameText || frontendShowEstablishedCaption) && (
                                  <div className="text-left shrink-0">
                                    {frontendShowBrandNameText && (
                                      <span className={`font-black tracking-wider text-zinc-955 uppercase leading-none block ${simBrandNameTextClass}`}>{adminLogoText}</span>
                                    )}
                                    {frontendShowEstablishedCaption && (
                                      <span className={`font-mono text-[#d97706] font-bold block mt-0.5 ${simEstablishedCaptionClass} ${
                                        headerEstablishedAlign === 'left' ? 'text-left' : headerEstablishedAlign === 'right' ? 'text-right' : 'text-center'
                                      }`}>{headerEstablished}</span>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Quick access tools & pills right */}
                          <div className="flex items-center gap-1 shrink-0">
                            {headerShowCompliance && (() => {
                              let previewPillClasses = "px-1 py-0.5 text-[6px]";
                              let previewIconClasses = "w-2 h-2 text-zinc-500";
                              if (headerSupportPillsSize === 'M') {
                                previewPillClasses = "px-1.5 py-0.75 text-[7px]";
                                previewIconClasses = "w-2.5 h-2.5 text-zinc-500";
                              } else if (headerSupportPillsSize === 'L') {
                                previewPillClasses = "px-2 py-1 text-[8px]";
                                previewIconClasses = "w-3 h-3 text-zinc-500";
                              }
                              return (
                                <span className={`hidden leading-none sm:flex items-center gap-0.5 border border-zinc-200 bg-zinc-50 rounded-full font-bold uppercase tracking-wide text-zinc-700 ${previewPillClasses}`}>
                                  <ShieldCheck className={previewIconClasses} />
                                  {headerComplianceLabel}
                                </span>
                              );
                            })()}
                            {headerShowConcierge && (() => {
                              let previewPillClasses = "px-1 py-0.5 text-[6px]";
                              let previewIconClasses = "w-2 h-2 text-[#d97706]";
                              if (headerSupportPillsSize === 'M') {
                                previewPillClasses = "px-1.5 py-0.75 text-[7px]";
                                previewIconClasses = "w-2.5 h-2.5 text-[#d97706]";
                              } else if (headerSupportPillsSize === 'L') {
                                previewPillClasses = "px-2 py-1 text-[8px]";
                                previewIconClasses = "w-3 h-3 text-[#d97706]";
                              }
                              return (
                                <span className={`hidden leading-none sm:flex items-center gap-0.5 border border-zinc-200 bg-zinc-50 rounded-full font-bold uppercase tracking-wide text-zinc-700 ${previewPillClasses}`}>
                                  <Sparkles className={previewIconClasses} />
                                  {headerConciergeLabel}
                                </span>
                              );
                            })()}
                            <div className="w-px h-3 bg-zinc-205 mx-0.5 hidden sm:block" />
                            <ShoppingBag className="w-3 h-3 text-zinc-650" />
                          </div>
                        </div>

                        {/* Lower row centered */}
                        <div className={`flex items-center bg-zinc-50/70 border-t border-b border-zinc-150/50 py-0 transition-colors ${navStretchMenu ? 'w-full justify-between px-3' : `justify-center ${getSimBlockSpacing(navBlockSpacing)}`}`}>
                          {navigationMenu.slice(0, 5).map((item, index) => (
                            <React.Fragment key={item.id}>
                              {index > 0 && navShowDividers && (
                                <div className="w-px h-3 bg-zinc-200 self-center shrink-0 mx-1 opacity-80" />
                              )}
                              <div
                                onMouseEnter={() => { if (item.isMegaMenu) setMockHoverItem(item.id); }}
                                onMouseLeave={() => setMockHoverItem(null)}
                                className={`relative cursor-pointer shrink-0 ${navStretchMenu ? 'flex-grow text-center font-sans' : ''}`}
                              >
                                <span className={`whitespace-nowrap transition-all duration-205 ${navStretchMenu ? 'w-full text-center block' : ''} ${getSimFontFamily(navFontFamily)} ${getSimFontSize(navFontSize)} ${getSimFontWeight(navFontWeight)} ${getSimFontCase(navFontCase)} ${getSimLineGap(navLineGap)} ${getSimColorStyle(item.id, index)}`}>
                                  {item.label}
                                </span>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* INTERACTIVE SIMULATOR MEGA MENU HOVER PORTLET */}
                    {navigationMenu.map((item) => (
                      item.isMegaMenu && item.megaMenu && mockHoverItem === item.id && (
                        <div 
                          key={`mock-mega-${item.id}`} 
                          className="absolute left-1/2 -translate-x-1/2 w-[98%] bg-white border border-zinc-200 shadow-2xl rounded-lg p-3 grid grid-cols-12 gap-2.5 z-50 animate-fade-in text-left top-[96%]"
                        >
                          <div className="col-span-12 md:col-span-5 border-r border-zinc-100 pr-1 text-[7px] flex flex-col justify-between whitespace-normal">
                            <div>
                              <span className="text-[5px] font-mono text-amber-600 font-bold uppercase tracking-widest block leading-none mb-1">REALM</span>
                              <h5 className="font-sans font-black text-zinc-950 uppercase tracking-tight text-[7px] leading-normal">{item.megaMenu.bannerTitle}</h5>
                            </div>
                            <span className="text-[4px] font-mono text-zinc-400 uppercase">© GOLDIAMA STANDARDS</span>
                          </div>
                          
                          <div className="col-span-12 md:col-span-3 space-y-1 text-left text-[6px]">
                            <span className="text-[5px] font-mono text-zinc-400 uppercase font-black tracking-wider block">Assortment</span>
                            <div className="space-y-1 flex flex-col pt-0.5">
                              {item.megaMenu.links.slice(0, 3).map((lnk, idx) => (
                                <span key={idx} className="text-zinc-[650] font-sans font-extrabold flex items-center gap-0.5 truncate uppercase text-[6px]">
                                  <span className="w-1 h-1 rounded-full bg-amber-500" />
                                  {lnk.label}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="col-span-12 md:col-span-4 relative h-10 rounded overflow-hidden shadow-xs border border-zinc-150">
                            <img src={item.megaMenu.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent flex flex-col justify-end p-1 text-[5px]">
                              <span className="text-white font-extrabold truncate uppercase font-sans leading-none">{item.megaMenu.imageTitle}</span>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                    
                  </div>

                  {/* Body canvas mockup */}
                  <div className="p-8 text-center text-zinc-300 text-[9px] bg-zinc-50/50 font-mono tracking-widest flex flex-col gap-1 select-none">
                    <span>STOREFRONT LIVING VIEW</span>
                    <span className="text-[7px] text-zinc-400 font-bold uppercase font-sans leading-normal">Hover or keep cursor on active menu items to trigger real-time Mega Menu drawers!</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1">
                  <span className="text-[8px] font-mono font-bold text-amber-600 block uppercase">⚙️ Synchronized Client Engines</span>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                    Any modifications to layout styles (Single vs Double block rows) or menu links are immediately bound to your live persistent customer storefront dynamically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NEW: BANNER SECTION SETTINGS WITH SUB SECTIONS (Hero Banner, Page Banner, Page Title Bar) */}
        {activeTab === 'banners' && (
          <div className="space-y-6 animate-fade-in text-zinc-900">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs flex justify-between items-center">
              <div>
                <h2 className="text-md font-sans font-bold text-zinc-900">Banners & Proclamation Panels</h2>
                <p className="text-xs text-zinc-400 font-mono">CONFIGURE HERO BANNER HEROINES, STOREFRONT PAGE HEADERS, AND PAGE TITLE BARS</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded uppercase">STORE LAYOUT</span>
            </div>

            {/* Sub-section horizontal tab picker */}
            <div className="flex border-b border-zinc-200 bg-white p-1 rounded-xl gap-2 shadow-3xs max-w-md">
              <button
                type="button"
                onClick={() => setBannerSubSection('hero')}
                className={`flex-1 py-2 text-xs font-mono font-black uppercase rounded-lg transition-all text-center cursor-pointer ${
                  bannerSubSection === 'hero' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                Hero Banner
              </button>
              <button
                type="button"
                onClick={() => setBannerSubSection('page')}
                className={`flex-1 py-2 text-xs font-mono font-black uppercase rounded-lg transition-all text-center cursor-pointer ${
                  bannerSubSection === 'page' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                Page Banner
              </button>
              <button
                type="button"
                onClick={() => setBannerSubSection('titlebar')}
                className={`flex-1 py-2 text-xs font-mono font-black uppercase rounded-lg transition-all text-center cursor-pointer ${
                  bannerSubSection === 'titlebar' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                Page Title Bar
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side: Active Sub-section Controls */}
              <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-6">
                
                {/* 1. HERO BANNER OPTIONS SECTION */}
                {bannerSubSection === 'hero' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                      <div>
                        <h3 className="text-xs font-mono font-bold uppercase text-[#d97706] tracking-wider">Hero Banner Registry</h3>
                        <p className="text-[10px] text-zinc-400 font-mono">CREATE AND ROUTE STYLED HERO SLIDERS ACROSS CHOSEN STORE PAGES</p>
                      </div>
                      {!showAddBannerForm && (
                        <button
                          type="button"
                          onClick={() => {
                            clearForm();
                            setShowAddBannerForm(true);
                          }}
                          className="px-3 py-1 text-[11px] font-mono font-bold bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-1 cursor-pointer border-0"
                        >
                          <Plus className="w-3.5 h-3.5" /> CREATE BANNER
                        </button>
                      )}
                    </div>

                    {showAddBannerForm && (
                      <form onSubmit={handleSaveBanner} className="space-y-4 p-5 border border-zinc-200 rounded-xl bg-zinc-50/50 animate-fade-in text-zinc-900">
                        <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                          <span className="text-xs font-mono font-bold uppercase text-zinc-700">
                            {editingBannerId ? '✏️ EDIT HERO SLIDER' : '✨ CREATE NEW HERO SLIDER'}
                          </span>
                          <button
                            type="button"
                            onClick={clearForm}
                            className="text-zinc-400 hover:text-zinc-600 font-mono text-xs flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                          >
                            <X className="w-3.5 h-3.5" /> CANCEL
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {bannerFormError && (
                            <div className="col-span-1 md:col-span-2 p-3.5 bg-red-50 border border-red-200 text-red-900 text-xs font-mono rounded-xl flex items-center gap-2 animate-pulse">
                              <span className="text-sm font-bold">⚠️</span>
                              <span className="font-semibold">{bannerFormError}</span>
                            </div>
                          )}

                          <div className="col-span-1 md:col-span-2 space-y-1.5 text-left">
                            <label className="font-sans font-bold text-[10.5px] text-zinc-650 uppercase block tracking-wider">
                              🏷️ Campaign / Slide Carousel Identifier Name
                            </label>
                            <input
                              type="text"
                              value={bTitle}
                              onChange={(e) => setBTitle(e.target.value)}
                              className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-xs text-zinc-800 font-bold font-sans"
                              placeholder="E.g. Summer Collection 2026, Home Precious Metals Slider"
                              required
                            />
                            <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                              This system identifier organizes and names your sliding campaign banner inside the administrative dashboards.
                            </p>
                          </div>

                          <div className="col-span-1 md:col-span-2 border-t border-zinc-100 pt-3 text-left space-y-4">
                            {/* FIRST-CLASS NESTED CAROUSEL SLIDES SYSTEM */}
                            <div className="border-t border-zinc-200 pt-4 space-y-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11.5px] font-sans font-black text-zinc-950 block uppercase tracking-wide">
                                  📂 CAROUSEL SLIDES SYSTEM (EXCLUSIVELY MANAGED)
                                </span>
                                <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                                  Define active slides for this carousel below. Each slide has its own bespoke title, subtitle, CTA actions, and highly responsive images configured for monitors, tablets, and phones.
                                </p>
                              </div>

                              {/* LIST OF CURRENT SLIDES */}
                              {bSlides.length > 0 && (
                                <div className="space-y-2.5">
                                  <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                                    ⚡ CONFIGURED SLIDE CAROUSEL ORDER:
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {bSlides.map((slide, idx) => (
                                      <div key={slide.id} className="p-3.5 border border-zinc-200 rounded-xl bg-white shadow-3xs relative flex flex-col justify-between text-left hover:border-zinc-400 transition-all">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setBSlides(prev => prev.filter(s => s.id !== slide.id));
                                          }}
                                          className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-red-600 p-1 rounded-lg hover:bg-zinc-50 border-0 cursor-pointer transition-colors"
                                          title="Delete slide"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                        
                                        <div className="space-y-1.5 pr-6">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[8.5px] font-mono bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                              Slide #{idx + 1}
                                            </span>
                                            <span className="text-xs font-sans font-extrabold text-zinc-850 line-clamp-1">{slide.title || '(Untitled Slide)'}</span>
                                          </div>
                                          <p className="text-[10.5px] text-zinc-500 font-sans line-clamp-2 leading-relaxed">{slide.subtitle || '(No Subtitle Narrative)'}</p>
                                          <div className="text-[8.5px] font-mono text-zinc-400 bg-zinc-50 p-1.5 rounded border border-zinc-150 flex flex-col gap-0.5">
                                            <div>CTA: <span className="text-zinc-700 font-semibold">{slide.ctaText || 'None'}</span></div>
                                            <div>Link: <span className="text-zinc-600 truncate block">{slide.ctaLink || '#'}</span></div>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-3 border-t border-zinc-100 pt-2.5 bg-zinc-50/50 -mx-3.5 -mb-3.5 p-2 rounded-b-xl border-t border-zinc-200">
                                          <div className="flex gap-2 pl-1.5">
                                            <div className="w-8 h-8 border border-zinc-200 rounded overflow-hidden relative shadow-3xs" title="Desktop view image">
                                              <img src={slide.desktopImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[6px] text-white font-mono text-center">Desk</span>
                                            </div>
                                            {slide.tabletImage && (
                                              <div className="w-8 h-8 border border-zinc-200 rounded overflow-hidden relative shadow-3xs" title="Tablet fallback image">
                                                <img src={slide.tabletImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[6px] text-white font-mono text-center">Tab</span>
                                              </div>
                                            )}
                                            {slide.mobileImage && (
                                              <div className="w-8 h-8 border border-zinc-200 rounded overflow-hidden relative shadow-3xs" title="Mobile fallback image">
                                                <img src={slide.mobileImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[6px] text-white font-mono text-center">Mob</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1 flex justify-end gap-1.5 pr-1.5">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                // Re-order slide UP
                                                if (idx > 0) {
                                                  const copy = [...bSlides];
                                                  const temp = copy[idx];
                                                  copy[idx] = copy[idx - 1];
                                                  copy[idx - 1] = temp;
                                                  setBSlides(copy);
                                                }
                                              }}
                                              disabled={idx === 0}
                                              className="p-1 border border-zinc-250 hover:bg-zinc-100 rounded text-zinc-650 cursor-pointer disabled:opacity-30"
                                              title="Move Up"
                                            >
                                              ↑
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                // Re-order slide DOWN
                                                if (idx < bSlides.length - 1) {
                                                  const copy = [...bSlides];
                                                  const temp = copy[idx];
                                                  copy[idx] = copy[idx + 1];
                                                  copy[idx + 1] = temp;
                                                  setBSlides(copy);
                                                }
                                              }}
                                              disabled={idx === bSlides.length - 1}
                                              className="p-1 border border-zinc-250 hover:bg-zinc-100 rounded text-zinc-650 cursor-pointer disabled:opacity-30"
                                              title="Move Down"
                                            >
                                              ↓
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEditingSlideId(slide.id);
                                                setSTitle(slide.title);
                                                setSSubtitle(slide.subtitle);
                                                setSDesktopImage(slide.desktopImage);
                                                setSTabletImage(slide.tabletImage || '');
                                                setSMobileImage(slide.mobileImage || '');
                                                setSCtaText(slide.ctaText);
                                                setSCtaLink(slide.ctaLink);
                                                setShowAddSlideForm(true);
                                              }}
                                              className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase bg-white hover:bg-zinc-100 border border-zinc-300 rounded text-zinc-700 cursor-pointer transition-colors"
                                            >
                                              Edit
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* ADDE/EDIT CAROUSEL SLIDE BOX FORM */}
                              <div className="border border-dashed border-zinc-250 rounded-xl p-4 bg-zinc-50/30 text-left">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    {editingSlideId ? 'EDIT SLIDE SUB-STRUCTURE' : 'ADD NEW CUSTOM SLIDE TO THE CAROUSEL'}
                                  </span>
                                  {!showAddSlideForm ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSTitle('');
                                        setSSubtitle('');
                                        setSDesktopImage('');
                                        setSTabletImage('');
                                        setSMobileImage('');
                                        setSCtaText('EXPLORE COLLECTION');
                                        setSCtaLink('#');
                                        setEditingSlideId(null);
                                        setShowAddSlideForm(true);
                                      }}
                                      className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-850 text-white font-mono font-bold text-[9px] uppercase rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                                    >
                                      + Add Slide
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowAddSlideForm(false);
                                        setEditingSlideId(null);
                                      }}
                                      className="text-[10px] text-zinc-400 hover:text-zinc-650 font-mono tracking-tight uppercase border-0 cursor-pointer bg-transparent"
                                    >
                                      Collapse Form [X]
                                    </button>
                                  )}
                                </div>

                                {showAddSlideForm && (
                                  <div className="space-y-3.5 border-t border-zinc-100 pt-3 text-xs bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                      <div className="space-y-1">
                                        <label className="font-sans font-bold text-[9.5px] text-zinc-500 uppercase block tracking-wider">Slide H1 Title Text</label>
                                        <input
                                          type="text"
                                          value={sTitle}
                                          onChange={(e) => setSTitle(e.target.value)}
                                          className="w-full p-2.5 bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-250 rounded-lg outline-none text-xs transition-colors"
                                          placeholder="Bespoke luxury title override"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="font-sans font-bold text-[9.5px] text-zinc-500 uppercase block tracking-wider">Slide Subtitle / Promo Narrative</label>
                                        <input
                                          type="text"
                                          value={sSubtitle}
                                          onChange={(e) => setSSubtitle(e.target.value)}
                                          className="w-full p-2.5 bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-250 rounded-lg outline-none text-xs transition-colors"
                                          placeholder="Detailed promo pitch narrative"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="font-sans font-bold text-[9.5px] text-zinc-500 uppercase block tracking-wider font-mono">Button CTA Label</label>
                                        <input
                                          type="text"
                                          value={sCtaText}
                                          onChange={(e) => setSCtaText(e.target.value)}
                                          className="w-full p-2.5 bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-250 rounded-lg outline-none text-xs"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="font-sans font-bold text-[9.5px] text-zinc-500 uppercase block tracking-wider font-mono">Button Destination Link Target</label>
                                        <input
                                          type="text"
                                          value={sCtaLink}
                                          onChange={(e) => setSCtaLink(e.target.value)}
                                          className="w-full p-2.5 bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-250 rounded-lg outline-none text-xs font-mono"
                                          placeholder="#collection"
                                        />
                                      </div>
                                    </div>

                                    <div className="border-t border-zinc-150 pt-3.5 space-y-3">
                                      <span className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block">Slide Images:</span>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        {/* Desktop Image Input for slide */}
                                        <div className="space-y-1.5 p-3.5 border border-zinc-150 bg-zinc-50/50 rounded-xl text-left">
                                          <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase block">🖥️ Desktop Image</label>
                                          <input
                                            type="text"
                                            value={sDesktopImage}
                                            onChange={(e) => setSDesktopImage(e.target.value)}
                                            className="w-full p-2 bg-white border border-zinc-250 rounded text-[10px] font-mono outline-none"
                                            placeholder="Primary Desktop URL"
                                          />
                                          <div className="hidden flex gap-1.5 mt-2">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setMediaSelectorAction('replace');
                                                setMediaSelectorTarget('sDesktopImage');
                                              }}
                                              className="flex-1 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[8.5px] font-mono font-bold rounded cursor-pointer transition-colors"
                                            >
                                              Gallery
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                triggerImageFileSelector('sDesktopImage');
                                              }}
                                              className="flex-1 py-1 bg-zinc-950 hover:bg-zinc-850 text-white text-[8.5px] font-mono font-bold rounded cursor-pointer transition-colors"
                                            >
                                              Upload
                                            </button>
                                          </div>
                                          {sDesktopImage && (
                                            <div className="h-14 w-full mt-2.5 bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden">
                                              <img src={sDesktopImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            </div>
                                          )}
                                        </div>

                                        {/* Tablet Image Input for slide */}
                                        <div className="space-y-1.5 p-3.5 border border-zinc-150 bg-zinc-50/50 rounded-xl text-left">
                                          <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase block">📟 Tablet Image (Optional)</label>
                                          <input
                                            type="text"
                                            value={sTabletImage}
                                            onChange={(e) => setSTabletImage(e.target.value)}
                                            className="w-full p-2 bg-white border border-zinc-250 rounded text-[10px] font-mono outline-none"
                                            placeholder="Blank falls back"
                                          />
                                          <div className="hidden flex gap-1.5 mt-2">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setMediaSelectorAction('replace');
                                                setMediaSelectorTarget('sTabletImage');
                                              }}
                                              className="flex-1 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[8.5px] font-mono font-bold rounded cursor-pointer"
                                            >
                                              Gallery
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                triggerImageFileSelector('sTabletImage');
                                              }}
                                              className="flex-1 py-1 bg-zinc-950 hover:bg-zinc-850 text-white text-[8.5px] font-mono font-bold rounded cursor-pointer"
                                            >
                                              Upload
                                            </button>
                                          </div>
                                          {sTabletImage && (
                                            <div className="h-14 w-full mt-2.5 bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden">
                                              <img src={sTabletImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            </div>
                                          )}
                                        </div>

                                        {/* Mobile Image Input for slide */}
                                        <div className="space-y-1.5 p-3.5 border border-zinc-150 bg-zinc-50/50 rounded-xl text-left">
                                          <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase block">📱 Mobile Image (Optional)</label>
                                          <input
                                            type="text"
                                            value={sMobileImage}
                                            onChange={(e) => setSMobileImage(e.target.value)}
                                            className="w-full p-2 bg-white border border-zinc-250 rounded text-[10px] font-mono outline-none"
                                            placeholder="Blank falls back"
                                          />
                                          <div className="hidden flex gap-1.5 mt-2">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setMediaSelectorAction('replace');
                                                setMediaSelectorTarget('sMobileImage');
                                              }}
                                              className="flex-1 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[8.5px] font-mono font-bold rounded cursor-pointer"
                                            >
                                              Gallery
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                triggerImageFileSelector('sMobileImage');
                                              }}
                                              className="flex-1 py-1 bg-zinc-950 hover:bg-zinc-850 text-white text-[8.5px] font-mono font-bold rounded cursor-pointer"
                                            >
                                              Upload
                                            </button>
                                          </div>
                                          {sMobileImage && (
                                            <div className="h-14 w-full mt-2.5 bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden">
                                              <img src={sMobileImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-150">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSTitle('');
                                          setSSubtitle('');
                                          setSDesktopImage('');
                                          setSTabletImage('');
                                          setSMobileImage('');
                                          setSCtaText('EXPLORE COLLECTION');
                                          setSCtaLink('#');
                                          setEditingSlideId(null);
                                          setShowAddSlideForm(false);
                                        }}
                                        className="px-3.5 py-1.5 border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-650 font-mono text-[9.5px] uppercase rounded-lg cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        disabled={!sDesktopImage}
                                        onClick={() => {
                                          if (!sDesktopImage) return;
                                          const updatedSlideItem = {
                                            id: editingSlideId || 'slide-' + Date.now(),
                                            title: sTitle,
                                            subtitle: sSubtitle,
                                            desktopImage: sDesktopImage,
                                            tabletImage: sTabletImage,
                                            mobileImage: sMobileImage,
                                            ctaText: sCtaText,
                                            ctaLink: sCtaLink,
                                          };

                                          if (editingSlideId) {
                                            setBSlides(prev => prev.map(s => s.id === editingSlideId ? updatedSlideItem : s));
                                          } else {
                                            setBSlides(prev => [...prev, updatedSlideItem]);
                                          }

                                          // Reset subslide form fields
                                          setSTitle('');
                                          setSSubtitle('');
                                          setSDesktopImage('');
                                          setSTabletImage('');
                                          setSMobileImage('');
                                          setSCtaText('EXPLORE COLLECTION');
                                          setSCtaLink('#');
                                          setEditingSlideId(null);
                                          setShowAddSlideForm(false);
                                        }}
                                        className="px-4.5 py-1.5 bg-zinc-950 hover:bg-zinc-850 disabled:bg-zinc-200 text-white font-mono font-black text-[9.5px] uppercase rounded-lg flex items-center gap-1.5 shadow"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                        {editingSlideId ? 'Save Slide Changes' : 'Append Created Slide'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">Height Thickness Profile</label>
                            <select
                              value={bHeightPreset}
                              onChange={(e) => setBHeightPreset(e.target.value as any)}
                              className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none text-xs text-zinc-900"
                            >
                              <option value="small">Snug Slim (py-4 px-5 / py-6)</option>
                              <option value="medium">Standard Harmonious (py-8 px-6 / py-12)</option>
                              <option value="large">Grand Columnar (py-14 / py-20)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">Dark Overlay Opacity</label>
                            <select
                              value={bOverlayOpacity}
                              onChange={(e) => setBOverlayOpacity(parseFloat(e.target.value))}
                              className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none text-xs text-zinc-900"
                            >
                              <option value="0">0% Absolute (No overlay)</option>
                              <option value="0.2">20% Minimal overlay</option>
                              <option value="0.3">30% Soft focus mask</option>
                              <option value="0.4">40% Semi-dark overlay (Recommended)</option>
                              <option value="0.6">60% Extreme contrast dark</option>
                              <option value="0.8">80% Obsidian heavy mask</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">Assign Store Page Location</label>
                            <select
                              value={bAssignedPageSlug}
                              onChange={(e) => setBAssignedPageSlug(e.target.value)}
                              className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none text-xs text-zinc-900 font-mono"
                            >
                              {pagesList.map((pg) => (
                                <option key={pg.id} value={pg.slug}>
                                  {pg.title} ({pg.slug}) - {pg.template}
                                </option>
                              ))}
                              <option value="all">Sovereign All Pages (Shows Globally)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">Sorting Precedence Order</label>
                            <input
                              type="number"
                              value={bSortOrder}
                              onChange={(e) => setBSortOrder(parseInt(e.target.value) || 1)}
                              className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none text-xs text-zinc-900 font-mono"
                              placeholder="E.g. 1"
                              min={1}
                              max={100}
                              required
                            />
                            <p className="text-[9px] text-zinc-400 font-mono mt-0.5 uppercase">Lowest numbers render first in sliding carousel queue.</p>
                          </div>

                          <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-zinc-100 p-3 rounded-lg border border-zinc-200">
                            <input
                              type="checkbox"
                              id="bIsActive"
                              checked={bIsActive}
                              onChange={(e) => setBIsActive(e.target.checked)}
                              className="w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-950"
                            />
                            <label htmlFor="bIsActive" className="font-sans font-bold text-xs text-zinc-700 cursor-pointer select-none">
                              Publish this Hero Banner live to custom client storefront pages right now
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                          <button
                            type="button"
                            onClick={clearForm}
                            className="px-4 py-2 text-xs font-mono font-bold text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer border-0"
                          >
                            RESET
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 text-xs font-mono font-black uppercase text-white bg-zinc-900 hover:bg-zinc-950 rounded-lg transition-all shadow-sm cursor-pointer border-0"
                          >
                            {editingBannerId ? 'UPDATE BANNER LIVE' : 'PUBLISH HERO BANNER'}
                          </button>
                        </div>
                      </form>
                    )}

                    {!showAddBannerForm && (
                      <div className="space-y-4">
                        {/* Width presentation selector */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                          <div>
                            <h4 className="text-xs font-mono font-bold uppercase text-zinc-900">Hero Banner Width Presentation</h4>
                            <p className="text-[10px] text-zinc-400 font-sans mt-0.5 leading-relaxed">Choose between an immersive full-screen edge-to-edge container or a classic boxed boxed style.</p>
                          </div>
                          <div className="flex bg-white border border-zinc-200 rounded-lg p-0.5 gap-1 shadow-3xs self-start sm:self-center">
                            <button
                              type="button"
                              onClick={() => setHeroBannerLayoutMode('full-width')}
                              className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition-all whitespace-nowrap cursor-pointer border-0 ${
                                heroBannerLayoutMode === 'full-width'
                                  ? 'bg-zinc-900 text-white shadow-3xs'
                                  : 'text-zinc-500 hover:text-zinc-950 bg-transparent'
                              }`}
                            >
                              🖥️ Full Screen
                            </button>
                            <button
                              type="button"
                              onClick={() => setHeroBannerLayoutMode('boxed')}
                              className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition-all whitespace-nowrap cursor-pointer border-0 ${
                                heroBannerLayoutMode === 'boxed'
                                  ? 'bg-zinc-900 text-white shadow-3xs'
                                  : 'text-zinc-500 hover:text-zinc-950 bg-transparent'
                              }`}
                            >
                              📦 Boxed Style
                            </button>
                          </div>
                        </div>

                        {/* Device aspect-ratio and dimensions selector */}
                        <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-4 shadow-3xs">
                          <div>
                            <h4 className="text-xs font-mono font-bold uppercase text-[#d97706] tracking-wider">Hero Banner Device Dimensions Configurator</h4>
                            <p className="text-[10px] text-zinc-400 font-sans mt-0.5 leading-relaxed">Adjust individual dimensions of Hero Banners globally for desktop monitors, tablet viewports, and mobile screens.</p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase block tracking-wider">🖥️ Desktop Layout / Ratio</label>
                              <select
                                value={heroBannerDimDesktop}
                                onChange={(e) => setHeroBannerDimDesktop(e.target.value)}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none focus:border-zinc-950"
                              >
                                <option value="default">Default Flow (Standard Height)</option>
                                <option value="16:9">Desktop 16:9 ratio</option>
                              </select>
                            </div>
                        
                            <div className="space-y-1.5">
                              <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase block tracking-wider">📟 Tablet Layout / Dimensions</label>
                              <select
                                value={heroBannerDimTablet}
                                onChange={(e) => setHeroBannerDimTablet(e.target.value)}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none focus:border-zinc-950"
                              >
                                <option value="default">Default Adaptive</option>
                                <option value="1024x768">Tablet: 1024 x 768 px</option>
                                <option value="1280x800">standard iPad: 1280 x 800 px</option>
                              </select>
                            </div>
                        
                            <div className="space-y-1.5">
                              <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase block tracking-wider">📱 Mobile Layout / Dimensions</label>
                              <select
                                value={heroBannerDimMobile}
                                onChange={(e) => setHeroBannerDimMobile(e.target.value)}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none focus:border-zinc-950"
                              >
                                <option value="default">Default Adaptive</option>
                                <option value="1080x1920">Mobile: 1080 x 1920 px (Upright)</option>
                                <option value="640x1136">Mobile: 640 x 1136 px (Compact)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {heroBanners.length === 0 ? (
                          <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-xl space-y-2">
                            <p className="text-sm font-sans font-bold text-zinc-500">No Hero Banners declared in this storefront registry.</p>
                            <p className="text-xs text-zinc-400 max-w-sm mx-auto">Click the Create Banner button in the upper right quadrant to introduce premium sliders.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {heroBanners.map((hb) => (
                              <div
                                key={hb.id}
                                className={`border rounded-xl p-4 bg-white transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-zinc-950 ${
                                  hb.isActive ? 'border-zinc-200 shadow-3xs' : 'border-zinc-100 opacity-60 bg-zinc-50'
                                }`}
                              >
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                                          hb.isActive
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                            : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                                        }`}>
                                          {hb.isActive ? '● PUBLISHED' : '○ DRAFT'}
                                        </span>
                                        <span className="text-[8px] font-mono font-extrabold bg-amber-50 border border-amber-200 text-amber-700 uppercase px-1.5 py-0.5 rounded">
                                          ORDER: {hb.sortOrder}
                                        </span>
                                        <span className="text-[8px] font-mono font-extrabold bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase px-1.5 py-0.5 rounded">
                                          LOCATION: {hb.assignedPageSlug === '/' ? 'HOME' : hb.assignedPageSlug.toUpperCase()}
                                        </span>
                                      </div>
                                      <h4 className="text-xs font-sans font-black text-zinc-950 uppercase tracking-tight mt-1 line-clamp-1">{hb.title || 'Untitled Banner'}</h4>
                                      <p className="text-[10px] text-zinc-400 font-sans line-clamp-2 leading-relaxed">{hb.subtitle}</p>
                                    </div>
                                  </div>

                                  {/* Viewport indicators */}
                                  <div className="grid grid-cols-3 gap-2 border-t border-b border-zinc-100 py-2 my-2 text-center">
                                    <div>
                                      <span className="text-[7px] font-mono text-zinc-400 block uppercase">1. Monitor 🖥️</span>
                                      <span className="text-[9px] font-bold text-zinc-700 truncate block max-w-full">
                                        {hb.desktopImage ? 'Desktop OK' : 'Missing'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[7px] font-mono text-zinc-400 block uppercase">2. Tablet 📟</span>
                                      <span className="text-[9px] font-bold text-zinc-700 truncate block max-w-full">
                                        {hb.tabletImage ? 'Tablet OK' : 'Inherit 🖥️'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[7px] font-mono text-zinc-400 block uppercase">3. Mobile 📱</span>
                                      <span className="text-[9px] font-bold text-zinc-700 truncate block max-w-full">
                                        {hb.mobileImage ? 'Mobile OK' : 'Inherit 🖥️'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-right mt-auto">
                                  <span className="text-[8.5px] font-mono text-zinc-400">ID: {hb.id}</span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => startEditBanner(hb)}
                                      className="p-1 px-2.5 text-[10px] font-mono font-bold bg-zinc-50 border border-zinc-200 text-zinc-755 rounded hover:bg-zinc-100 hover:text-zinc-950 transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit className="w-2.5 h-2.5" /> EDIT
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirmDeleteBannerId === hb.id) {
                                          deleteHeroBanner(hb.id);
                                          setConfirmDeleteBannerId(null);
                                        } else {
                                          setConfirmDeleteBannerId(hb.id);
                                          setTimeout(() => setConfirmDeleteBannerId(prev => prev === hb.id ? null : prev), 5000);
                                        }
                                      }}
                                      className={`p-1 px-2.5 text-[10px] font-mono font-bold rounded transition-all flex items-center gap-1 cursor-pointer ${
                                        confirmDeleteBannerId === hb.id
                                          ? 'bg-red-600 border border-red-700 text-white animate-pulse'
                                          : 'bg-rose-50 border border-rose-150 text-rose-600 hover:bg-rose-100 hover:text-rose-700'
                                      }`}
                                      title={confirmDeleteBannerId === hb.id ? 'Click again to confirm' : 'Purge hero banner'}
                                    >
                                      {confirmDeleteBannerId === hb.id ? <Check className="w-2.5 h-2.5" /> : <Trash2 className="w-2.5 h-2.5" />}
                                      {confirmDeleteBannerId === hb.id ? 'CONFIRM' : 'DELETE'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. PAGE BANNER OPTIONS SECTION */}
                {bannerSubSection === 'page' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <div>
                        <h3 className="text-xs font-mono font-bold uppercase text-[#d97706] tracking-wider">General interior page banner controls</h3>
                        <p className="text-[10px] text-zinc-400 font-mono">BANNERS FOR SHOP AND INNER PAGES</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setPageBannerShow(!pageBannerShow)}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer border ${
                          pageBannerShow 
                            ? 'bg-emerald-500 text-white border-emerald-500' 
                            : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                        }`}
                      >
                        {pageBannerShow ? '● ACTIVE DISPLAY' : '○ DISABLED / FALLBACK TO BLANK'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">Universal Default Interior Background Image(s) (Supports slideshow separated by commas)</label>
                        <input
                          type="text"
                          value={pageBannerBgUrl}
                          onChange={(e) => setPageBannerBgUrl(e.target.value)}
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-mono"
                          placeholder="https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
                          disabled={!pageBannerShow}
                        />
                        <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Enter a single URL or multiple image URLs separated by commas. If multiple URLs are specified, the Page Banner will automatically slide with beautiful transition animations!</p>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1 pt-1">
                          <span className="text-[9px] font-mono font-bold text-zinc-400 block mr-1">PRESET CHOICES:</span>
                          {[
                            { name: 'Gilded Golden Bullion', url: 'https://images.unsplash.com/photo-1610375228911-c4ab82525289?auto=format&fit=crop&w=1600&q=80' },
                            { name: 'Brushed Charcoal Slate', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80' },
                            { name: 'Bespoke Nordic Studio Desk', url: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=1600&q=80' }
                          ].map((psr) => (
                            <button
                              key={psr.name}
                              type="button"
                              onClick={() => setPageBannerBgUrl(psr.url)}
                              className="text-[9px] font-sans px-2 py-0.5 border border-zinc-200 text-zinc-500 hover:text-zinc-950 bg-zinc-50 rounded hover:bg-zinc-100 cursor-pointer"
                              disabled={!pageBannerShow}
                            >
                              {psr.name}
                            </button>
                          ))}
                          {pageBannerBgUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Clear universal interior page banner background image?')) {
                                  setPageBannerBgUrl('');
                                }
                              }}
                              className="text-[9px] font-mono font-bold px-2 py-0.5 border border-rose-200 text-rose-600 hover:text-rose-700 bg-rose-50 rounded hover:bg-rose-100 cursor-pointer"
                              disabled={!pageBannerShow}
                            >
                              🗑️ Clear Background
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">Page Banner Height Block</label>
                        <select
                          value={pageBannerHeight}
                          onChange={(e) => setPageBannerHeight(e.target.value)}
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900"
                          disabled={!pageBannerShow}
                        >
                          <option value="snug">Snug & Compact (Height 120px)</option>
                          <option value="moderate">Moderate & Focused (Height 180px)</option>
                          <option value="deep">Deep & Scenic (Height 300px)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">Title Alignment Direction</label>
                        <select
                          value={pageBannerAlign}
                          onChange={(e) => setPageBannerAlign(e.target.value)}
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900"
                          disabled={!pageBannerShow}
                        >
                          <option value="left">Left Aligned Alignments (Classic)</option>
                          <option value="center">Center / Sovereign Alignments</option>
                          <option value="right">Right Aligned Layout</option>
                        </select>
                      </div>

                      <div className="col-span-1 md:col-span-2 border-t border-zinc-100 pt-4 mt-2">
                        <h4 className="text-[10px] font-mono font-bold uppercase text-zinc-800 tracking-wider mb-2">Interior Page Banner Custom Dimensions</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase block tracking-wider">🖥️ Desktop Layout Dim</label>
                            <select
                              value={pageBannerDimDesktop}
                              onChange={(e) => setPageBannerDimDesktop(e.target.value)}
                              className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900"
                              disabled={!pageBannerShow}
                            >
                              <option value="default">Default Flow (Standard Height)</option>
                              <option value="16:9">Desktop 16:9 ratio</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase block tracking-wider">📟 Tablet Layout Dim</label>
                            <select
                              value={pageBannerDimTablet}
                              onChange={(e) => setPageBannerDimTablet(e.target.value)}
                              className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900"
                              disabled={!pageBannerShow}
                            >
                              <option value="default">Default Adaptive</option>
                              <option value="1024x768">Tablet: 1024 x 768 px</option>
                              <option value="1280x800">standard iPad: 1280 x 800 px</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase block tracking-wider">📱 Mobile Layout Dim</label>
                            <select
                              value={pageBannerDimMobile}
                              onChange={(e) => setPageBannerDimMobile(e.target.value)}
                              className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900"
                              disabled={!pageBannerShow}
                            >
                              <option value="default">Default Adaptive</option>
                              <option value="1080x1920">Mobile: 1080 x 1920 px (Upright)</option>
                              <option value="640x1136">Mobile: 640 x 1136 px (Compact)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PAGE TITLE BAR OPTIONS SECTION */}
                {bannerSubSection === 'titlebar' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <div>
                        <h3 className="text-xs font-mono font-bold uppercase text-[#d97706] tracking-wider">Page Title Bar layout options</h3>
                        <p className="text-[10px] text-zinc-400 font-mono">BREADCRUMB HEADER NAV BARS BELOW THE NAV MAIN BAR</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setPageTitleBarEnable(!pageTitleBarEnable)}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer border ${
                          pageTitleBarEnable 
                            ? 'bg-emerald-500 text-white border-emerald-500' 
                            : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                        }`}
                      >
                        {pageTitleBarEnable ? '● ENABLED TITLE BAR' : '○ COMPACT NONE'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">Background Shade theme</label>
                        <select
                          value={pageTitleBarBg}
                          onChange={(e) => setPageTitleBarBg(e.target.value)}
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none text-xs text-zinc-900"
                          disabled={!pageTitleBarEnable}
                        >
                          <option value="slate">Platinum Silver Slate bg ({'#F4F4F5'})</option>
                          <option value="zinc">Soft off-white zinc ({'#FAF9F9'})</option>
                          <option value="white">Pure White ({'#FFFFFF'})</option>
                          <option value="translucent">Clean Border-only (Transparent bg)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">Underline Border details</label>
                        <select
                          value={pageTitleBarBorder}
                          onChange={(e) => setPageTitleBarBorder(e.target.value)}
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none text-xs text-zinc-900"
                          disabled={!pageTitleBarEnable}
                        >
                          <option value="minimal">Minimal Slate Hairline (1px Gray)</option>
                          <option value="bold">Bold Thick Underline (2px Accent)</option>
                          <option value="shadow">Subtle shadow-xs borderless</option>
                          <option value="none">Completely borderless seamless</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase block tracking-wider">Title Font Size Category</label>
                        <select
                          value={pageTitleBarFontSize}
                          onChange={(e) => setPageTitleBarFontSize(e.target.value)}
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none text-xs text-zinc-900"
                          disabled={!pageTitleBarEnable}
                        >
                          <option value="sm">Small Compact (Text-sm)</option>
                          <option value="md">Medium Balanced (Text-base)</option>
                          <option value="lg">Grand Header (Text-xl)</option>
                          <option value="xl">Display Size (Text-2xl)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: High Fidelity Simulator */}
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-4">
                <div>
                  <h3 className="text-xs font-mono font-black uppercase text-zinc-800 tracking-wider flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-zinc-500" />
                    Banners live previewer
                  </h3>
                  <p className="text-[9px] text-zinc-400 font-mono uppercase">HIGH FIDELITY PREVIEW RHYTHM MODEL</p>
                </div>

                <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-xs bg-white text-zinc-800 select-none min-h-[300px] flex flex-col">
                  {/* Mock Navbar */}
                  <div className="border-b border-zinc-150 px-3 py-2 bg-white flex items-center justify-between text-[8px] font-mono font-bold">
                    <span className="text-zinc-950">GOLDIAMA. Preview</span>
                    <div className="flex gap-2 text-zinc-400">
                      <span>SHOP</span>
                      <span>BOUTIQUE</span>
                      <span>LABS</span>
                    </div>
                  </div>

                  {/* Universal Responsive Device Selector */}
                  <div className="p-2 border-b border-zinc-150 bg-zinc-50/50">
                    <div className="flex bg-zinc-205/60 p-1 rounded-lg text-center font-mono text-[8px] gap-1">
                      {(['desktop', 'tablet', 'mobile'] as const).map((dev) => (
                        <button
                          key={dev}
                          type="button"
                          onClick={() => setBannerPreviewDevice(dev)}
                          className={`flex-1 py-1 rounded capitalize font-black transition-all border border-transparent cursor-pointer flex items-center justify-center gap-1 ${
                            bannerPreviewDevice === dev ? 'bg-zinc-950 text-white shadow-3xs' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 bg-transparent'
                          }`}
                        >
                          {dev === 'desktop' ? '🖥️ Desktop' : dev === 'tablet' ? '📟 Tablet' : '📱 Mobile'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 bg-zinc-50/50 p-3 space-y-4">
                    {/* Simulator rendering: Active category */}
                    {bannerSubSection === 'hero' ? (
                      <div>
                        {(() => {
                          const activePreviewBanner = showAddBannerForm
                            ? {
                                title: bTitle || 'INDUSTRIAL FINE COINS & BULLION',
                                subtitle: bSubtitle || 'Precious metal designs that outlast financial turbulence.',
                                desktopImage: bDesktopImage || 'https://images.unsplash.com/photo-1610375228911-c4ab82525289?auto=format&fit=crop&w=1200&q=80',
                                tabletImage: bTabletImage,
                                mobileImage: bMobileImage,
                                overlayOpacity: bOverlayOpacity,
                                ctaText: bCtaText || 'SHOP COLLECTION',
                                heightPreset: bHeightPreset
                              }
                            : (heroBanners.find(b => b.isActive) || heroBanners[0] || {
                                title: 'GOLDIAMA SOVEREIGN LUXURY',
                                subtitle: 'Artisanal handcast silver bullion bars designed for legacy collectors.',
                                desktopImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
                                tabletImage: '',
                                mobileImage: '',
                                overlayOpacity: 0.4,
                                ctaText: 'VIEW METALS',
                                heightPreset: 'medium'
                              });

                          const activeImg = bannerPreviewDevice === 'mobile'
                            ? (activePreviewBanner.mobileImage || activePreviewBanner.desktopImage)
                            : bannerPreviewDevice === 'tablet'
                            ? (activePreviewBanner.tabletImage || activePreviewBanner.desktopImage)
                            : activePreviewBanner.desktopImage;

                          // Dynamic preview container dimension styles
                          const simStyles: React.CSSProperties = {
                            backgroundImage: `url("${activeImg}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: '#111827',
                            transition: 'all 0.3s ease-in-out',
                          };

                          let widthClass = 'w-full max-w-full';
                          let dimLabel = 'AUTO FLOW';

                          if (bannerPreviewDevice === 'desktop') {
                            widthClass = 'w-full max-w-full';
                            if (heroBannerDimDesktop === '16:9') {
                              simStyles.aspectRatio = '16 / 9';
                              dimLabel = '🖥️ DESKTOP 16:9 RATIO';
                            } else {
                              simStyles.minHeight = activePreviewBanner.heightPreset === 'small' ? '120px' : activePreviewBanner.heightPreset === 'large' ? '190px' : '150px';
                              dimLabel = `🖥️ DESKTOP PRESET: ${activePreviewBanner.heightPreset.toUpperCase()}`;
                            }
                          } else if (bannerPreviewDevice === 'tablet') {
                            widthClass = 'w-[90%] sm:w-[320px] mx-auto border-x-4 border-zinc-200 rounded-md';
                            if (heroBannerDimTablet === '1024x768') {
                              simStyles.aspectRatio = '1024 / 768';
                              dimLabel = '📟 TABLET 1024x768px';
                            } else if (heroBannerDimTablet === '1280x800') {
                              simStyles.aspectRatio = '1280 / 800';
                              dimLabel = '📟 TABLET 1280x800px';
                            } else {
                              simStyles.minHeight = activePreviewBanner.heightPreset === 'small' ? '90px' : activePreviewBanner.heightPreset === 'large' ? '150px' : '120px';
                              dimLabel = `📟 TABLET PRESET: ${activePreviewBanner.heightPreset.toUpperCase()}`;
                            }
                          } else { // mobile
                            widthClass = 'w-[70%] sm:w-[220px] mx-auto border-x-8 border-zinc-350 rounded-2xl';
                            if (heroBannerDimMobile === '1080x1920') {
                              simStyles.aspectRatio = '1080 / 1920';
                              dimLabel = '📱 MOBILE 1080x1920px';
                            } else if (heroBannerDimMobile === '640x1136') {
                              simStyles.aspectRatio = '640 / 1136';
                              dimLabel = '📱 MOBILE 640x1136px';
                            } else {
                              simStyles.minHeight = activePreviewBanner.heightPreset === 'small' ? '80px' : activePreviewBanner.heightPreset === 'large' ? '135px' : '105px';
                              dimLabel = `📱 MOBILE DEFAULT: ${activePreviewBanner.heightPreset.toUpperCase()}`;
                            }
                          }

                          return (
                            <div className={`transition-all duration-300 ${widthClass}`}>
                              {/* Virtual screen device frame indicator */}
                              <div className="bg-zinc-205 border border-zinc-200 text-zinc-500 text-[6.5px] font-mono font-extrabold px-2 py-0.5 rounded-t-md flex items-center justify-between">
                                <span>{dimLabel}</span>
                                <span className="opacity-60">HERO SIMULATOR</span>
                              </div>
                              <div 
                                className="relative overflow-hidden flex flex-col justify-center p-3 sm:p-4 text-left border border-t-0 border-zinc-200 rounded-b-md"
                                style={simStyles}
                              >
                                {/* Overlay darkness mask */}
                                <div 
                                  className="absolute inset-0 bg-black"
                                  style={{ opacity: activePreviewBanner.overlayOpacity, zIndex: 0 }}
                                />

                                <div className="relative text-white space-y-1 z-10 w-full">
                                  <span className="text-[4.5px] font-mono uppercase tracking-widest text-amber-500 font-extrabold block">COLLECTION 2026</span>
                                  <h1 className="text-[7.5px] sm:text-[8px] font-sans font-black leading-tight uppercase max-w-[160px] truncate">{activePreviewBanner.title}</h1>
                                  <p className="text-[6.5px] opacity-85 leading-normal max-w-[160px] line-clamp-2">{activePreviewBanner.subtitle}</p>
                                  
                                  <button type="button" className="bg-white text-zinc-950 border border-transparent text-[5px] font-mono px-1.5 py-0.5 rounded shadow-3xs uppercase font-extrabold mt-0.5 cursor-pointer">
                                    {activePreviewBanner.ctaText}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                        
                        <p className="text-[8px] text-zinc-400 font-mono text-center mt-2 uppercase">
                          PREVIEWING: {showAddBannerForm ? 'Current Form Draft' : 'Primary Active Banner'} - {bannerPreviewDevice.toUpperCase()} Image
                        </p>
                      </div>
                    ) : null}

                    {bannerSubSection === 'page' ? (
                      <div>
                        {pageBannerShow ? (
                          (() => {
                            const pageSimStyles: React.CSSProperties = {
                              backgroundImage: `url("${pageBannerBgUrl}")`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundColor: '#0f172a',
                              transition: 'all 0.3s ease-in-out',
                            };

                            let widthClass = 'w-full max-w-full';
                            let dimLabel = 'AUTO FLOW';

                            if (bannerPreviewDevice === 'desktop') {
                              widthClass = 'w-full max-w-full';
                              if (pageBannerDimDesktop === '16:9') {
                                pageSimStyles.aspectRatio = '16 / 9';
                                dimLabel = '🖥️ DESKTOP 16:9 RATIO';
                              } else {
                                pageSimStyles.height = pageBannerHeight === 'snug' ? '60px' : pageBannerHeight === 'deep' ? '110px' : '85px';
                                dimLabel = `🖥️ DESKTOP HEIGHT: ${pageBannerHeight.toUpperCase()}`;
                              }
                            } else if (bannerPreviewDevice === 'tablet') {
                              widthClass = 'w-[90%] sm:w-[320px] mx-auto border-x-4 border-zinc-200 rounded-md';
                              if (pageBannerDimTablet === '1024x768') {
                                pageSimStyles.aspectRatio = '1024 / 768';
                                dimLabel = '📟 TABLET 1024x768px';
                              } else if (pageBannerDimTablet === '1280x800') {
                                pageSimStyles.aspectRatio = '1280 / 800';
                                dimLabel = '📟 TABLET 1280x800px';
                              } else {
                                pageSimStyles.height = pageBannerHeight === 'snug' ? '50px' : pageBannerHeight === 'deep' ? '90px' : '70px';
                                dimLabel = `📟 TABLET HEIGHT: ${pageBannerHeight.toUpperCase()}`;
                              }
                            } else { // mobile
                              widthClass = 'w-[70%] sm:w-[220px] mx-auto border-x-8 border-zinc-350 rounded-2xl';
                              if (pageBannerDimMobile === '1080x1920') {
                                pageSimStyles.aspectRatio = '1080 / 1920';
                                dimLabel = '📱 MOBILE 1080x1920px';
                              } else if (pageBannerDimMobile === '640x1136') {
                                pageSimStyles.aspectRatio = '640 / 1136';
                                dimLabel = '📱 MOBILE 640x1136px';
                              } else {
                                pageSimStyles.height = pageBannerHeight === 'snug' ? '45px' : pageBannerHeight === 'deep' ? '75px' : '55px';
                                dimLabel = `📱 MOBILE DEFAULT: ${pageBannerHeight.toUpperCase()}`;
                              }
                            }

                            return (
                              <div className={`transition-all duration-300 ${widthClass}`}>
                                <div className="bg-zinc-205 border border-zinc-200 text-zinc-500 text-[6.5px] font-mono font-extrabold px-2 py-0.5 rounded-t-md flex items-center justify-between">
                                  <span>{dimLabel}</span>
                                  <span className="opacity-60">PAGE BANNER</span>
                                </div>
                                <div 
                                  className="relative overflow-hidden flex flex-col justify-center p-3 text-left border border-t-0 border-zinc-200 rounded-b-md"
                                  style={pageSimStyles}
                                >
                                  <div className="absolute inset-0 bg-black/45" />
                                  <div className={`relative z-10 text-white w-full flex flex-col ${
                                    pageBannerAlign === 'left' ? 'items-start text-left' :
                                    pageBannerAlign === 'right' ? 'items-end text-right' : 'items-center text-center'
                                  } space-y-1`}>
                                    <h2 className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight">SHOP FINE ACCENTS</h2>
                                    <span className="text-[5px] font-mono tracking-widest uppercase opacity-80">Catalog / Showcase / Workspace</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="py-10 text-center border-2 border-dashed border-zinc-200 rounded-lg text-zinc-350 font-mono text-[9px] uppercase">
                            Fallback Interior Page Banner Disabled
                          </div>
                        )}
                      </div>
                    ) : null}

                    {bannerSubSection === 'titlebar' ? (
                      <div>
                        {pageTitleBarEnable ? (
                          <div className={`transition-all duration-300 ${bannerPreviewDevice === 'mobile' ? 'w-[70%] sm:w-[220px] mx-auto border-x-8 border-zinc-350 rounded-2xl' : bannerPreviewDevice === 'tablet' ? 'w-[90%] sm:w-[320px] mx-auto border-x-4 border-zinc-200 rounded-md' : 'w-full'}`}>
                            <div className="bg-zinc-205 border border-zinc-200 text-zinc-500 text-[6.5px] font-mono font-extrabold px-2 py-0.5 rounded-t-md flex items-center justify-between animate-fade-in">
                              <span>NAV HEADER BAR</span>
                              <span className="opacity-60">TITLEBAR SIMULATION</span>
                            </div>
                            <div 
                              className={`p-2.5 flex justify-between items-center text-[7px] font-sans border-x border-b border-zinc-200 rounded-b-md ${
                                pageTitleBarBg === 'slate' ? 'bg-[#F4F4F5] border-zinc-200' : pageTitleBarBg === 'zinc' ? 'bg-[#FAF9F9] border-zinc-150' : pageTitleBarBg === 'white' ? 'bg-white border-zinc-200' : 'bg-transparent border-zinc-200'
                              } ${
                                pageTitleBarBorder === 'minimal' ? 'border-b border-t' : pageTitleBarBorder === 'bold' ? 'border-b-2 border-amber-600' : pageTitleBarBorder === 'shadow' ? 'shadow-xs border-transparent' : 'border-none'
                              }`}
                            >
                              <div className="truncate">
                                <span className="text-zinc-[450] font-mono text-[5.5px] uppercase block">Goldiama Collective</span>
                                <h3 className={`font-black uppercase tracking-tight text-zinc-950 truncate ${
                                  pageTitleBarFontSize === 'sm' ? 'text-[6px]' : pageTitleBarFontSize === 'lg' ? 'text-[8.5px]' : pageTitleBarFontSize === 'xl' ? 'text-[11px]' : 'text-[7.5px]'
                                }`}>
                                  Product Catalog Workspace
                                </h3>
                              </div>
                              <span className="text-zinc-[450] font-mono text-[5.5px] hidden sm:block truncate ml-1">Home / Boutique / Workspace</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-10 text-center border-2 border-dashed border-zinc-200 rounded-lg text-zinc-350 font-mono text-[9px] uppercase">
                            Compact Menu Layout (Title Bar Disabled)
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Generic interior elements preview to provide grounding visual */}
                    <div className="pt-2">
                      <div className="bg-white border border-zinc-150 p-2.5 rounded-lg space-y-1 shadow-3xs text-left select-none">
                        <div className="h-1.5 w-1/3 bg-zinc-200 rounded-sm" />
                        <div className="h-1 w-2/3 bg-zinc-100 rounded-sm" />
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="h-10 bg-zinc-100/70 border border-zinc-200 rounded-lg flex items-center justify-center text-[6px] text-zinc-400 font-mono uppercase">MOCK BOX</div>
                          <div className="h-10 bg-zinc-100/70 border border-zinc-200 rounded-lg flex items-center justify-center text-[6px] text-zinc-400 font-mono uppercase">MOCK BOX</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NEW: SITE-WIDE PAGE LAYOUT SYSTEM */}
        {activeTab === 'page-layout' && (
          <div className="space-y-6 animate-fade-in text-zinc-900">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs flex justify-between items-center">
              <div>
                <h2 className="text-md font-sans font-bold text-zinc-900">Global Page Layout Constraints</h2>
                <p className="text-xs text-zinc-400 font-mono">ADJUST CENTRAL COLUMN PAGE WIDTHS, ROUNDED BORDERS AND FLOATING BREADCRUMBS</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded uppercase font-bold">GRID STRUCTURE</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column Form Controls */}
              <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-5">
                <h3 className="text-xs font-mono font-bold uppercase text-[#d97706] tracking-wider border-b border-zinc-50 pb-2">Central Grid Alignments & Radius Shapes</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="font-sans font-bold text-[10px] text-zinc-500 block uppercase tracking-wider">Site Central Page Width Limits</label>
                    <select
                      value={layoutContentWidth}
                      onChange={(e) => setLayoutContentWidth(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900 font-sans"
                    >
                      <option value="mobile">Mobile Pocket (480px max-w)</option>
                      <option value="tablet-portrait">Tablet Portrait (768px max-w)</option>
                      <option value="tablet-landscape">Tablet Landscape (1024px max-w)</option>
                      <option value="narrow">Standard Narrow (1200px max-w)</option>
                      <option value="default">Standard Balanced (1280px max-w · Default)</option>
                      <option value="wide">Wide Screen Display (1440px max-w)</option>
                      <option value="ultra-wide">Professional Large Studio (1600px max-w)</option>
                      <option value="fluid">Extreme Cinematic Canvas (1920px max-w / fluid)</option>
                    </select>
                    <p className="text-[9.5px] text-zinc-400 font-mono mt-0.5">This modifies the container constraints for margins on desktop views.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-sans font-bold text-[10px] text-zinc-500 block uppercase tracking-wider">Site-Wide Component Border Roundness Style</label>
                    <select
                      value={layoutBorderRadius}
                      onChange={(e) => setLayoutBorderRadius(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900 font-sans"
                    >
                      <option value="none">Sharp Corners (0px / brutalist industrial style)</option>
                      <option value="rounded">Standard Elegant (4px / small curves)</option>
                      <option value="rounded-xl">Lush Soft Cushion premium curves (12px rounded)</option>
                      <option value="rounded-2xl">Bespoke Circular organic curves (16px rounded)</option>
                    </select>
                    <p className="text-[9.5px] text-zinc-400 font-mono mt-0.5">Applies beautiful corner curves across product cards, buttons, simulator elements.</p>
                  </div>

                  <div className="col-span-1 md:col-span-2 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="font-sans font-bold text-[10px] text-zinc-550 block uppercase tracking-wider">Universal Breadcrumb Assist Links</label>
                      <p className="text-[9.5px] text-zinc-400 font-mono">Enable standard Home / Category / Active item helper badges above product layout titles</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setLayoutShowBreadcrumbs(!layoutShowBreadcrumbs)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer border ${
                        layoutShowBreadcrumbs 
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-3xs' 
                          : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:text-zinc-650'
                      }`}
                    >
                      {layoutShowBreadcrumbs ? '✓ BREADCRUMBS SHOWING' : '✗ BREADCRUMBS HIDDEN'}
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50/40 border border-amber-200/50 p-3.5 rounded-lg text-[10px] text-[#b45309] font-mono leading-relaxed mt-4">
                  💡 **COORDINATION**: These layout settings dynamically override variables that constrain page wrappers inside both the active Storefront views and simulated editor headers instantly.
                </div>
              </div>

              {/* Right Column: Site Scale Simulator */}
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-4">
                <div>
                  <h3 className="text-xs font-mono font-black uppercase text-zinc-800 tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                    Grid Scaling Simulator
                  </h3>
                  <p className="text-[9px] text-zinc-400 font-mono uppercase">REAL-TIME CONSTRAINTS GEOMETRY</p>
                </div>

                <div className="border border-zinc-205 rounded-xl overflow-hidden shadow-xs bg-white text-zinc-800 select-none min-h-[290px] flex flex-col p-3 text-left space-y-3">
                  <span className="text-[6.5px] font-mono text-zinc-400 uppercase">CONTAINER: [ {layoutContentWidth.toUpperCase()} ]</span>
                  
                  {/* Outer container simulating relative width changes */}
                  <div className="bg-zinc-100/80 border border-zinc-200 rounded p-1 transition-all duration-300">
                    <div 
                      className={`mx-auto bg-white border border-zinc-300 p-3 shadow-3xs space-y-2 transition-all duration-300 ${
                        layoutContentWidth === 'narrow' ? 'max-w-[70%]' : layoutContentWidth === 'ultra-wide' ? 'max-w-[100%]' : 'max-w-[85%]'
                      }`}
                      style={{
                        borderRadius: layoutBorderRadius === 'none' ? '0px' : layoutBorderRadius === 'rounded' ? '4px' : layoutBorderRadius === 'rounded-xl' ? '12px' : '16px'
                      }}
                    >
                      {layoutShowBreadcrumbs && (
                        <div className="flex gap-1 items-center text-[5px] font-mono text-zinc-400 uppercase tracking-widest leading-none">
                          <span>Home</span> <span>/</span> <span>Collection</span>
                        </div>
                      )}

                      <h4 className="text-[9px] font-bold text-zinc-950 leading-none uppercase">Central Page container text mockup</h4>
                      <p className="text-[6.5px] text-zinc-400 leading-normal">
                        This showcases fluid grids matching exactly the visual width and corner angles configured in the system panel layout properties.
                      </p>

                      <div className="grid grid-cols-3 gap-1.5 pt-2">
                        {[1, 2, 3].map((num) => (
                          <div 
                            key={num}
                            className="bg-zinc-100 border border-zinc-200 p-1.5 text-center flex flex-col justify-between"
                            style={{
                              borderRadius: layoutBorderRadius === 'none' ? '0px' : layoutBorderRadius === 'rounded' ? '3px' : '8px'
                            }}
                          >
                            <div className="aspect-square bg-zinc-50 border border-zinc-150 rounded-sm mb-1" />
                            <span className="text-[5px] font-bold text-zinc-950 uppercase tracking-tight block">ACC #{num}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-[8.5px] font-mono text-zinc-400 pt-3 border-t border-zinc-100 space-y-1">
                    <div>• WIDTH SELECTOR: <span className="text-zinc-800">{layoutContentWidth}</span></div>
                    <div>• RADIUS VALUE: <span className="text-zinc-800">{layoutBorderRadius}</span></div>
                    <div>• BREADCRUMB ASSIST: <span className="text-zinc-800">{layoutShowBreadcrumbs ? 'Show' : 'Hide'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. FOOTER SECTION SETTINGS */}
        {activeTab === 'footer' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs">
              <h2 className="text-md font-sans font-bold text-zinc-900">Footer Structure & Legal Declarations</h2>
              <p className="text-xs text-zinc-400 font-mono">EDIT COPYRIGHT LABELS, TRUST BADGES, AND NEWSLETTER UTILS</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Controls */}
              <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-4">
                <h3 className="text-sm font-mono font-bold uppercase text-zinc-800 border-b border-zinc-100 pb-2">Footer Attributes</h3>
                
                <div className="space-y-1.5">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Copyright / Legal Copytext</label>
                  <input
                    type="text"
                    value={footerCopyrightText}
                    onChange={(e) => setFooterCopyrightText(e.target.value)}
                    className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-sans text-zinc-900"
                    placeholder="Legal copyright information..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Newsletter Input Placeholder</label>
                  <input
                    type="text"
                    value={footerEmailPlaceholder}
                    onChange={(e) => setFooterEmailPlaceholder(e.target.value)}
                    className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-sans text-zinc-900 font-mono"
                    placeholder="Email field placeholder..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <span className="text-[11px] font-medium text-zinc-700 font-sans">Display Newsletter Block</span>
                    <input
                      type="checkbox"
                      checked={footerShowNewsletter}
                      onChange={(e) => setFooterShowNewsletter(e.target.checked)}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <span className="text-[11px] font-medium text-zinc-700 font-sans">Show Verified Payment Badges</span>
                    <input
                      type="checkbox"
                      checked={footerShowPaymentBadges}
                      onChange={(e) => setFooterShowPaymentBadges(e.target.checked)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleSaveAllChanges}
                    className="w-full bg-zinc-950 text-white font-mono hover:bg-zinc-800 transition-colors text-xs py-2.5 rounded-xl block font-bold cursor-pointer uppercase tracking-widest"
                  >
                    COMMIT FOOTER CONFIGURATION
                  </button>
                </div>
              </div>

              {/* Live Preview Sidepanel */}
              <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase text-zinc-800 tracking-wider">Live View Screen</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">FOOTER ADAPTABILITY EMULATOR</p>
                  </div>

                  {/* Mock browser footer frame */}
                  <div className="border border-zinc-200 bg-white rounded-lg shadow-sm overflow-hidden text-zinc-950">
                    <div className="p-4 bg-zinc-50 border-b border-zinc-150 text-center text-[10px] text-zinc-350 font-mono">
                      CORE PAGE CONTENT ABOVE
                    </div>

                    {/* Styled Minimalist Footer preview */}
                    <div className="p-4 bg-zinc-900 text-white text-[9px] font-sans space-y-3">
                      {footerShowNewsletter && (
                        <div className="border-b border-zinc-800 pb-3">
                          <p className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest mb-1.5 subpixel-antialiased">Newsletter Dispatch</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              disabled
                              placeholder={footerEmailPlaceholder}
                              className="bg-zinc-800 border border-zinc-700 text-[8px] p-1 px-2 rounded w-full outline-none text-zinc-200"
                            />
                            <button className="bg-white text-zinc-950 p-1 font-bold rounded text-[8px] uppercase font-mono">Send</button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[8px] leading-relaxed">
                        <span className="text-zinc-400 max-w-[150px]">{footerCopyrightText}</span>
                        {footerShowPaymentBadges && (
                          <div className="flex gap-1">
                            <span className="bg-zinc-800 text-zinc-350 px-1 rounded text-[7px] font-mono">VISA</span>
                            <span className="bg-zinc-800 text-zinc-350 px-1 rounded text-[7px] font-mono">AMEX</span>
                            <span className="bg-zinc-800 text-zinc-350 px-1 rounded text-[7px] font-mono">STRIPE</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-zinc-400 italic">
                  * Clean geometric rules prevent component clutter in rendering engine.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. TYPOGRAPHY SETTINGS */}
        {activeTab === 'typography' && (
          <div className="space-y-6 animate-fade-in text-zinc-900">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs">
              <h2 className="text-md font-sans font-bold text-zinc-900">Typographical Scale & Identity</h2>
              <p className="text-xs text-zinc-400 font-mono">CHOOSE TYPEFACE PAIRINGS, WEIGHT SCALES, AND CSS RHYTHM override selectors</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Controls */}
              <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-6">
                
                {/* General Font Pairs */}
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-[#d97706] mb-3 tracking-wider">Configure Theme Font Families</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-sans font-bold text-[10px] text-zinc-500 block uppercase tracking-wider">Display Header Font (Primary)</label>
                      <select
                        value={typographyHeadingFont}
                        onChange={(e) => {
                          setTypographyHeadingFont(e.target.value);
                          // Auto update for current session
                          localStorage.setItem('min_eco_typo_heading_font', e.target.value);
                          window.dispatchEvent(new Event('min-eco-typography-updated'));
                        }}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-sans text-zinc-900 transition-colors"
                      >
                        <option value="Gilda Display">Gilda Display (Elegant Serif)</option>
                        <option value="Montserrat">Montserrat (Warm Sans-serif)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech-Modern)</option>
                        <option value="Inter">Inter (Swiss Neutral)</option>
                        <option value="Playfair Display">Playfair Display (Editorial Serif)</option>
                        <option value="JetBrains Mono">JetBrains Mono (Technical Mono)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-sans font-bold text-[10px] text-zinc-500 block uppercase tracking-wider">Body Typography (Secondary)</label>
                      <select
                        value={typographyBodyFont}
                        onChange={(e) => {
                          setTypographyBodyFont(e.target.value);
                          // Auto update for current session
                          localStorage.setItem('min_eco_typo_body_font', e.target.value);
                          window.dispatchEvent(new Event('min-eco-typography-updated'));
                        }}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-sans text-zinc-900 transition-colors"
                      >
                        <option value="Montserrat">Montserrat (Warm Sans-serif)</option>
                        <option value="Gilda Display">Gilda Display (Elegant Serif)</option>
                        <option value="Inter">Inter (Swiss Neutral)</option>
                        <option value="Fira Code">Fira Code (Dev Mono)</option>
                        <option value="JetBrains Mono">JetBrains Mono (Technical Mono)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sub-Task 2: Global Color settings option under TypographySettings */}
                <div className="border-t border-zinc-100 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-mono font-bold uppercase text-[#d97706] tracking-wider">Global Color settings option</h3>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded uppercase">Palette Override</span>
                  </div>
                  <div className="p-4 bg-zinc-50/70 border border-zinc-150 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-sans font-bold text-[10px] text-zinc-505 block uppercase tracking-wider text-zinc-550">Active Global Theme Accent</label>
                      <select
                        value={navColorStyle}
                        onChange={(e) => setNavColorStyle(e.target.value)}
                        className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none text-xs font-sans text-zinc-900 focus:border-zinc-950"
                      >
                        <option value="amber">✨ Core Goldiama Amber (#d97706)</option>
                        <option value="emerald">💚 Sovereign Jade Emerald (#059669)</option>
                        <option value="sapphire">💙 Diamond Sovereign Blue (#2563eb)</option>
                        <option value="ruby">❤️ Bespoke Vintage Ruby (#dc2626)</option>
                        <option value="slate">🩶 Platinum Office Slate (#4b5563)</option>
                        <option value="onyx">🖤 Absolute Obsidian Onyx (#111111)</option>
                      </select>
                      <p className="text-[10px] text-zinc-400 font-mono">This configures style indicators, links, checkmarks, active frames, and tags globally.</p>
                    </div>

                    <div className="flex flex-col justify-center">
                      <span className="text-[9px] font-mono text-zinc-450 uppercase mb-2">QUICK PRESS PRESETS:</span>
                      <div className="flex items-center gap-2">
                        {[
                          { key: 'amber', color: 'bg-[#d97706]', label: 'Amber' },
                          { key: 'emerald', color: 'bg-emerald-600', label: 'Emerald' },
                          { key: 'sapphire', color: 'bg-blue-600', label: 'Sapphire' },
                          { key: 'ruby', color: 'bg-rose-600', label: 'Ruby' },
                          { key: 'slate', color: 'bg-zinc-650', label: 'Slate' },
                          { key: 'onyx', color: 'bg-zinc-950', label: 'Onyx' }
                        ].map((btn) => (
                          <button
                            key={btn.key}
                            type="button"
                            onClick={() => {
                              setNavColorStyle(btn.key);
                              localStorage.setItem('min_eco_nav_color_style', btn.key);
                            }}
                            className={`w-7 h-7 rounded-full cursor-pointer transition-all border ${
                              navColorStyle === btn.key 
                                ? 'ring-2 ring-zinc-950 scale-110 border-white' 
                                : 'border-zinc-205 hover:scale-105'
                            } ${btn.color}`}
                            title={btn.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct H1 to H6 & Body Selectors */}
                <div className="border-t border-zinc-100 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-mono font-bold uppercase text-[#d97706] tracking-wider">Element Selector Style Overrides</h3>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded uppercase">Level Customizer</span>
                  </div>

                  {/* Segments tab */}
                  <div className="grid grid-cols-7 gap-1 bg-zinc-50 p-1 rounded-xl mb-4">
                    {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body'] as const).map((elem) => (
                      <button
                        key={elem}
                        type="button"
                        onClick={() => setSelectedTypoElement(elem)}
                        className={`py-1.5 text-xs font-mono tracking-wider font-extrabold uppercase rounded-lg transition-all text-center cursor-pointer ${
                          selectedTypoElement === elem
                            ? 'bg-zinc-900 text-white shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        {elem}
                      </button>
                    ))}
                  </div>

                  {/* Active Element Controls Panel */}
                  <div className="bg-zinc-50/50 border border-zinc-100 p-4 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-200/55 pb-2">
                      <span className="text-[11px] font-mono font-black text-zinc-900 uppercase block">Currently Editing:</span>
                      <span className="text-[10px] font-mono font-black text-white bg-zinc-900 px-2.5 py-0.5 rounded-md uppercase tracking-widest">{selectedTypoElement} element</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Family Option */}
                      <div className="space-y-1">
                        <label className="font-sans font-bold text-[9px] text-zinc-400 block uppercase tracking-wider">Custom Font Face fallback</label>
                        <select
                          value={
                            selectedTypoElement === 'h1' ? typoH1Font :
                            selectedTypoElement === 'h2' ? typoH2Font :
                            selectedTypoElement === 'h3' ? typoH3Font :
                            selectedTypoElement === 'h4' ? typoH4Font :
                            selectedTypoElement === 'h5' ? typoH5Font :
                            selectedTypoElement === 'h6' ? typoH6Font : typoBodyFontChoice
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (selectedTypoElement === 'h1') setTypoH1Font(val);
                            else if (selectedTypoElement === 'h2') setTypoH2Font(val);
                            else if (selectedTypoElement === 'h3') setTypoH3Font(val);
                            else if (selectedTypoElement === 'h4') setTypoH4Font(val);
                            else if (selectedTypoElement === 'h5') setTypoH5Font(val);
                            else if (selectedTypoElement === 'h6') setTypoH6Font(val);
                            else setTypoBodyFontChoice(val);
                          }}
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none text-xs"
                        >
                          <option value="heading">Theme Primary Display Font ({typographyHeadingFont})</option>
                          <option value="body">Theme Secondary Body Font ({typographyBodyFont})</option>
                          <option value="mono">Technical JetBrains Mono</option>
                          <option value="Gilda Display">Gilda Display</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Inter">Inter</option>
                          <option value="Space Grotesk">Space Grotesk</option>
                          <option value="Playfair Display">Playfair Display</option>
                        </select>
                      </div>

                      {/* Weight Selector */}
                      <div className="space-y-1">
                        <label className="font-sans font-bold text-[9px] text-zinc-400 block uppercase tracking-wider">Font weight density</label>
                        <select
                          value={
                            selectedTypoElement === 'h1' ? typoH1Weight :
                            selectedTypoElement === 'h2' ? typoH2Weight :
                            selectedTypoElement === 'h3' ? typoH3Weight :
                            selectedTypoElement === 'h4' ? typoH4Weight :
                            selectedTypoElement === 'h5' ? typoH5Weight :
                            selectedTypoElement === 'h6' ? typoH6Weight : typoBodyWeight
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (selectedTypoElement === 'h1') setTypoH1Weight(val);
                            else if (selectedTypoElement === 'h2') setTypoH2Weight(val);
                            else if (selectedTypoElement === 'h3') setTypoH3Weight(val);
                            else if (selectedTypoElement === 'h4') setTypoH4Weight(val);
                            else if (selectedTypoElement === 'h5') setTypoH5Weight(val);
                            else if (selectedTypoElement === 'h6') setTypoH6Weight(val);
                            else setTypoBodyWeight(val);
                          }}
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none text-xs"
                        >
                          <option value="200">200 (Extra Light)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular / Normal)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semibold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="800">800 (Extra Bold)</option>
                          <option value="900">900 (Black Ultra)</option>
                        </select>
                      </div>

                      {/* Letter Spacing */}
                      <div className="space-y-1">
                        <label className="font-sans font-bold text-[9px] text-zinc-400 block uppercase tracking-wider">Letter Spacing Tracking</label>
                        <select
                          value={
                            selectedTypoElement === 'h1' ? typoH1Spacing :
                            selectedTypoElement === 'h2' ? typoH2Spacing :
                            selectedTypoElement === 'h3' ? typoH3Spacing :
                            selectedTypoElement === 'h4' ? typoH4Spacing :
                            selectedTypoElement === 'h5' ? typoH5Spacing :
                            selectedTypoElement === 'h6' ? typoH6Spacing : typoBodySpacing
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (selectedTypoElement === 'h1') setTypoH1Spacing(val);
                            else if (selectedTypoElement === 'h2') setTypoH2Spacing(val);
                            else if (selectedTypoElement === 'h3') setTypoH3Spacing(val);
                            else if (selectedTypoElement === 'h4') setTypoH4Spacing(val);
                            else if (selectedTypoElement === 'h5') setTypoH5Spacing(val);
                            else if (selectedTypoElement === 'h6') setTypoH6Spacing(val);
                            else setTypoBodySpacing(val);
                          }}
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none text-xs"
                        >
                          <option value="tighter">Tighter (-0.05em)</option>
                          <option value="tight">Tight (-0.025em)</option>
                          <option value="normal">Normal (0px)</option>
                          <option value="wide">Wide (0.05em)</option>
                          <option value="widest">Widest (0.1em)</option>
                        </select>
                      </div>

                      {/* Text Transform */}
                      <div className="space-y-1">
                        <label className="font-sans font-bold text-[9px] text-zinc-400 block uppercase tracking-wider">Text Transform case</label>
                        <select
                          value={
                            selectedTypoElement === 'h1' ? typoH1Transform :
                            selectedTypoElement === 'h2' ? typoH2Transform :
                            selectedTypoElement === 'h3' ? typoH3Transform :
                            selectedTypoElement === 'h4' ? typoH4Transform :
                            selectedTypoElement === 'h5' ? typoH5Transform :
                            selectedTypoElement === 'h6' ? typoH6Transform : typoBodyTransform
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (selectedTypoElement === 'h1') setTypoH1Transform(val);
                            else if (selectedTypoElement === 'h2') setTypoH2Transform(val);
                            else if (selectedTypoElement === 'h3') setTypoH3Transform(val);
                            else if (selectedTypoElement === 'h4') setTypoH4Transform(val);
                            else if (selectedTypoElement === 'h5') setTypoH5Transform(val);
                            else if (selectedTypoElement === 'h6') setTypoH6Transform(val);
                            else setTypoBodyTransform(val);
                          }}
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none text-xs mb-1"
                        >
                          <option value="none">As Typed (none)</option>
                          <option value="uppercase">UPPERCASE (all caps)</option>
                          <option value="lowercase">lowercase</option>
                          <option value="capitalize">Capitalize Each Word</option>
                        </select>
                      </div>

                      {/* Size modifier */}
                      <div className="space-y-1">
                        <label className="font-sans font-bold text-[9px] text-zinc-400 block uppercase tracking-wider">Scale Size Factor</label>
                        <select
                          value={
                            selectedTypoElement === 'h1' ? typoH1Size :
                            selectedTypoElement === 'h2' ? typoH2Size :
                            selectedTypoElement === 'h3' ? typoH3Size :
                            selectedTypoElement === 'h4' ? typoH4Size :
                            selectedTypoElement === 'h5' ? typoH5Size :
                            selectedTypoElement === 'h6' ? typoH6Size : typoBodySize
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (selectedTypoElement === 'h1') setTypoH1Size(val);
                            else if (selectedTypoElement === 'h2') setTypoH2Size(val);
                            else if (selectedTypoElement === 'h3') setTypoH3Size(val);
                            else if (selectedTypoElement === 'h4') setTypoH4Size(val);
                            else if (selectedTypoElement === 'h5') setTypoH5Size(val);
                            else if (selectedTypoElement === 'h6') setTypoH6Size(val);
                            else setTypoBodySize(val);
                          }}
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none text-xs"
                        >
                          <option value="75%">Smaller (75%)</option>
                          <option value="90%">Subtle (90%)</option>
                          <option value="100%">Standard Default (100%)</option>
                          <option value="110%">Large (110%)</option>
                          <option value="120%">Scale Up (120%)</option>
                          <option value="130%">Extra Scale (130%)</option>
                          <option value="150%">Magnified (150%)</option>
                          <option value="175%">Double scale (175%)</option>
                          <option value="200%">Jumbo focus (200%)</option>
                        </select>
                      </div>

                      {/* Line Height Selector */}
                      <div className="space-y-1">
                        <label className="font-sans font-bold text-[9px] text-zinc-400 block uppercase tracking-wider">Line Height spacing</label>
                        <select
                          value={
                            selectedTypoElement === 'h1' ? typoH1LineHeight :
                            selectedTypoElement === 'h2' ? typoH2LineHeight :
                            selectedTypoElement === 'h3' ? typoH3LineHeight :
                            selectedTypoElement === 'h4' ? typoH4LineHeight :
                            selectedTypoElement === 'h5' ? typoH5LineHeight :
                            selectedTypoElement === 'h6' ? typoH6LineHeight : typoBodyLineHeight
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (selectedTypoElement === 'h1') setTypoH1LineHeight(val);
                            else if (selectedTypoElement === 'h2') setTypoH2LineHeight(val);
                            else if (selectedTypoElement === 'h3') setTypoH3LineHeight(val);
                            else if (selectedTypoElement === 'h4') setTypoH4LineHeight(val);
                            else if (selectedTypoElement === 'h5') setTypoH5LineHeight(val);
                            else if (selectedTypoElement === 'h6') setTypoH6LineHeight(val);
                            else setTypoBodyLineHeight(val);
                          }}
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none text-xs"
                        >
                          <option value="normal">Normal (Default)</option>
                          <option value="1.0">1.0 (Solid)</option>
                          <option value="1.1">1.1 (Super tight)</option>
                          <option value="1.15">1.15 (Tight)</option>
                          <option value="1.2">1.2 (Compact)</option>
                          <option value="1.25">1.25 (Header tight)</option>
                          <option value="1.3">1.3 (Slightly Snug)</option>
                          <option value="1.4">1.4 (Readable Heading)</option>
                          <option value="1.5">1.5 (Regular Body)</option>
                          <option value="1.6">1.6 (Ample)</option>
                          <option value="1.7">1.7 (Breezy)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleSaveAllChanges}
                    className="w-full bg-zinc-950 text-white font-mono hover:bg-zinc-805 transition-all font-black text-xs py-3 rounded-xl block tracking-widest uppercase cursor-pointer"
                  >
                    COMPOSE STYLE SYSTEM
                  </button>
                </div>
              </div>

              {/* Live Preview Sidepanel */}
              <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-mono font-black uppercase text-zinc-800 tracking-wider">Dynamic Type specimens</h3>
                    <p className="text-[9px] text-zinc-400 font-mono uppercase">REAL-TIME VISUAL HARMONY ENGINE</p>
                  </div>

                  {/* Rendering specimen preview list */}
                  <div className="bg-white border border-zinc-200 p-4 rounded-lg space-y-4 shadow-sm select-none">
                    <div className="border-b border-zinc-100 pb-2">
                      <span className="text-[7.5px] font-mono text-zinc-400 tracking-widest block uppercase mb-1">H1 Headings Specimen</span>
                      <h1 
                        className="text-lg text-zinc-950"
                        style={{
                          fontFamily: typoH1Font === 'heading' ? `"${typographyHeadingFont}", serif` : typoH1Font === 'body' ? `"${typographyBodyFont}", sans-serif` : typoH1Font === 'mono' ? '"JetBrains Mono", monospace' : `"${typoH1Font}", sans-serif`,
                          fontWeight: typoH1Weight,
                          letterSpacing: typoH1Spacing === 'tight' ? '-0.025em' : typoH1Spacing === 'tighter' ? '-0.05em' : typoH1Spacing === 'wide' ? '0.05em' : typoH1Spacing === 'widest' ? '0.1em' : '0em',
                          textTransform: typoH1Transform as any,
                          lineHeight: typoH1LineHeight === 'normal' ? 'normal' : typoH1LineHeight
                        }}
                      >
                        H1 Title Text
                      </h1>
                    </div>

                    <div className="border-b border-zinc-100 pb-2">
                      <span className="text-[7.5px] font-mono text-zinc-400 tracking-widest block uppercase mb-1">H2 Headers</span>
                      <h2 
                        className="text-base text-zinc-900"
                        style={{
                          fontFamily: typoH2Font === 'heading' ? `"${typographyHeadingFont}", serif` : typoH2Font === 'body' ? `"${typographyBodyFont}", sans-serif` : typoH2Font === 'mono' ? '"JetBrains Mono", monospace' : `"${typoH2Font}", sans-serif`,
                          fontWeight: typoH2Weight,
                          letterSpacing: typoH2Spacing === 'tight' ? '-0.025em' : typoH2Spacing === 'tighter' ? '-0.05em' : typoH2Spacing === 'wide' ? '0.05em' : typoH2Spacing === 'widest' ? '0.1em' : '0em',
                          textTransform: typoH2Transform as any,
                          lineHeight: typoH2LineHeight === 'normal' ? 'normal' : typoH2LineHeight
                        }}
                      >
                        H2 Section Header
                      </h2>
                    </div>

                    <div className="border-b border-zinc-100 pb-2">
                      <span className="text-[7.5px] font-mono text-zinc-400 tracking-widest block uppercase mb-1">H3 Card Headers</span>
                      <h3 
                        className="text-sm text-zinc-900"
                        style={{
                          fontFamily: typoH3Font === 'heading' ? `"${typographyHeadingFont}", serif` : typoH3Font === 'body' ? `"${typographyBodyFont}", sans-serif` : typoH3Font === 'mono' ? '"JetBrains Mono", monospace' : `"${typoH3Font}", sans-serif`,
                          fontWeight: typoH3Weight,
                          letterSpacing: typoH3Spacing === 'tight' ? '-0.025em' : typoH3Spacing === 'tighter' ? '-0.05em' : typoH3Spacing === 'wide' ? '0.05em' : typoH3Spacing === 'widest' ? '0.1em' : '0em',
                          textTransform: typoH3Transform as any,
                          lineHeight: typoH3LineHeight === 'normal' ? 'normal' : typoH3LineHeight
                        }}
                      >
                        H3 Grid Box Title
                      </h3>
                    </div>

                    <div className="border-b border-zinc-100 pb-2">
                      <span className="text-[7.5px] font-mono text-zinc-400 tracking-widest block uppercase mb-1">Body Typography</span>
                      <p 
                        className="text-[11px] text-zinc-650"
                        style={{
                          fontFamily: typoBodyFontChoice === 'heading' ? `"${typographyHeadingFont}", serif` : typoBodyFontChoice === 'body' ? `"${typographyBodyFont}", sans-serif` : typoBodyFontChoice === 'mono' ? '"JetBrains Mono", monospace' : `"${typoBodyFontChoice}", sans-serif`,
                          fontWeight: typoBodyWeight,
                          letterSpacing: typoBodySpacing === 'tight' ? '-0.025em' : typoBodySpacing === 'tighter' ? '-0.05em' : typoBodySpacing === 'wide' ? '0.05em' : typoBodySpacing === 'widest' ? '0.1em' : '0em',
                          textTransform: typoBodyTransform as any,
                          lineHeight: typoBodyLineHeight === 'normal' ? 'normal' : typoBodyLineHeight
                        }}
                      >
                        Our workspace series is designed purely around structural integrity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[9.5px] text-zinc-400 font-mono tracking-wide grid grid-cols-1 gap-1 border-t border-zinc-200/60 pt-4 mt-4">
                  <span>• Main Headings: {typographyHeadingFont}</span>
                  <span>• Body text: {typographyBodyFont}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. PAGES SYSTEM MANAGER */}
        {activeTab === 'pages' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-md font-sans font-bold text-zinc-900">Custom Display Pages ({pagesList.length})</h2>
                <p className="text-xs text-zinc-400 font-mono">MANAGE CORE NAVIGATION ROUTES, TEMPLATES AND SLUG BINDS</p>
              </div>
              <span className="text-xs text-zinc-400 font-mono">LIVE ON WORKSPACE</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Controls for instant addition */}
              <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-4">
                <h3 className="text-sm font-mono font-bold uppercase text-zinc-800 border-b border-zinc-100 pb-2">Create Custom Page</h3>
                
                <div className="space-y-1.5 font-sans text-left">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-sans text-zinc-900"
                    placeholder="e.g. Sustainable Ethos"
                  />
                </div>

                <div className="space-y-1.5 font-sans text-left">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Url Slug (Path) *</label>
                  <input
                    type="text"
                    required
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-mono text-zinc-900"
                    placeholder="e.g. /ethos"
                  />
                </div>

                <div className="space-y-1.5 font-sans text-left">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Page Template Frame</label>
                  <select
                    value={newPageTemplate}
                    onChange={(e) => setNewPageTemplate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-sans text-zinc-900"
                  >
                    <option value="Bento Showcase">Bento Showcase (Default Grid)</option>
                    <option value="Infinite Scroll">Infinite Scroll Catalog</option>
                    <option value="Editorial Story">Editorial Story (Editorial Text)</option>
                    <option value="Minimal Form">Minimal Contact Form</option>
                    <option value="Blank Page">Blank Page Template</option>
                  </select>
                </div>

                {/* ADVANCED SEO CONDUIT FOR PAGES */}
                <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl space-y-3 text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-650 uppercase tracking-widest block">Configure Page SEO</span>
                    <span className="text-[8px] bg-zinc-200 text-zinc-700 px-1.5 py-0.2 rounded font-mono font-bold">INDEX</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-sans font-semibold text-zinc-400 block uppercase">SEO Title override</label>
                    <input
                      type="text"
                      value={newPageSeoTitle}
                      onChange={(e) => setNewPageSeoTitle(e.target.value)}
                      className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-[11px] font-sans text-zinc-800"
                      placeholder="e.g. Bespoke Cast Gold Bars - Sovereign Custody"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-sans font-semibold text-zinc-400 block uppercase">SEO Meta Description</label>
                    <textarea
                      value={newPageSeoDesc}
                      onChange={(e) => setNewPageSeoDesc(e.target.value)}
                      rows={2}
                      className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-[11px] font-sans text-zinc-800 resize-none leading-snug"
                      placeholder="Summary snippet featured in web browsers..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-sans font-semibold text-zinc-400 block uppercase">Focus Targets Keywords</label>
                    <input
                      type="text"
                      value={newPageSeoKeywords}
                      onChange={(e) => setNewPageSeoKeywords(e.target.value)}
                      className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-[11px] font-mono text-zinc-800"
                      placeholder="e.g. gold, bullion, bespoke"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      if (!newPageTitle || !newPageSlug) {
                        alert("Please fill in page title and slug paths!");
                        return;
                      }
                      updatePagesList([
                        ...pagesList, 
                        {
                          id: String(Date.now()),
                          title: newPageTitle,
                          slug: newPageSlug,
                          status: 'Published',
                          template: newPageTemplate,
                          seoTitle: newPageSeoTitle || `${newPageTitle} | Goldiama Global`,
                          seoDesc: newPageSeoDesc || `Bespoke representation page built with the beautiful ${newPageTemplate} layout.`,
                          seoKeywords: newPageSeoKeywords || newPageTitle.toLowerCase(),
                          showBreadcrumbs: true
                        }
                      ]);
                      setNewPageTitle('');
                      setNewPageSlug('');
                      setNewPageSeoTitle('');
                      setNewPageSeoDesc('');
                      setNewPageSeoKeywords('');
                      alert(`Successfully published page "${newPageTitle}" with ${newPageTemplate} configuration.`);
                    }}
                    className="w-full bg-zinc-900 text-white font-mono hover:bg-zinc-850 transition-colors text-xs py-2.5 rounded-xl block font-bold cursor-pointer"
                  >
                    PUBLISH FRESH CANVAS
                  </button>
                </div>
              </div>

              {/* Pages Grid Listing */}
              <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-4 text-left">
                <h3 className="text-sm font-mono font-bold uppercase text-zinc-800 border-b border-zinc-100 pb-2">Active Web Directories</h3>
                
                <div className="space-y-3">
                  {pagesList.map((pg) => (
                    <div key={pg.id} className="border border-zinc-200 hover:border-zinc-900 transition-all rounded-xl p-3.5 bg-white-50/50 flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold font-sans text-zinc-950">{pg.title}</h4>
                            <span className={`inline-block text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              pg.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                              {pg.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-mono">PATH: <span className="text-zinc-650 font-bold">{pg.slug}</span> · TEMPLATE: <span className="text-zinc-650">{pg.template}</span></p>
                          {pg.seoTitle && (
                            <div className="text-[9.5px] text-[#d97706] font-mono flex items-center gap-1 bg-amber-50/40 border border-amber-100/30 px-1.5 py-0.5 rounded w-fit">
                              <span className="font-bold">SEO Title:</span> {pg.seoTitle.substring(0, 52)}...
                            </div>
                          )}
                        </div>

                        {/* Operations panel with Edit, View, and Duplicate */}
                        <div className="flex flex-wrap items-center gap-1">
                          {/* VIEW ACTION */}
                          <button 
                            onClick={() => setViewingPage(pg)}
                            className="px-2.5 py-1 text-[9.5px] font-mono font-bold border border-zinc-200 rounded-lg text-zinc-700 bg-white hover:bg-zinc-100/50 transition-all cursor-pointer"
                            title="Interactive Frame Preview"
                          >
                            VIEW
                          </button>

                          {/* EDIT ACTION */}
                          <button 
                            onClick={() => {
                              if (editingPageId === pg.id) {
                                setEditingPageId(null);
                              } else {
                                setEditingPageId(pg.id);
                                setEditingTitle(pg.title);
                                setEditingSlug(pg.slug);
                                setEditingTemplate(pg.template);
                                setEditingSeoTitle(pg.seoTitle || pg.title);
                                setEditingSeoDesc(pg.seoDesc || '');
                                setEditingSeoKeywords(pg.seoKeywords || '');
                                setEditingShowBreadcrumbs(pg.showBreadcrumbs !== false);
                              }
                            }}
                            className={`px-2.5 py-1 text-[9.5px] font-mono font-bold border rounded-lg transition-all cursor-pointer ${
                              editingPageId === pg.id 
                                ? 'bg-zinc-900 border-zinc-900 text-white' 
                                : 'text-zinc-700 bg-white border-zinc-200 hover:bg-zinc-100/50'
                            }`}
                            title="SEO Settings / Parameters"
                          >
                            EDIT
                          </button>

                          {/* DUPLICATE ACTION */}
                          <button 
                            onClick={() => {
                              const twinPage = {
                                id: String(Date.now()),
                                title: `${pg.title} (Copy)`,
                                slug: pg.slug === '/' ? '/copy' : `${pg.slug}-copy`,
                                status: 'Draft',
                                template: pg.template,
                                seoTitle: pg.seoTitle ? `${pg.seoTitle} (Duplicate)` : `${pg.title} (Copy)`,
                                seoDesc: pg.seoDesc || '',
                                seoKeywords: pg.seoKeywords || '',
                                showBreadcrumbs: pg.showBreadcrumbs !== false
                              };
                              updatePagesList([...pagesList, twinPage]);
                              alert(`Successfully duplicated standard directory custom route: "${pg.title}". Copied structure as draft.`);
                            }}
                            className="px-2.5 py-1 text-[9.5px] font-mono font-bold border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100/40 transition-all cursor-pointer"
                            title="Duplicate Content Frame"
                          >
                            DUPLICATE
                          </button>

                          {/* TOGGLE */}
                          <button 
                            onClick={() => {
                              const next = pagesList.map(p => p.id === pg.id ? { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' } : p);
                              updatePagesList(next);
                            }}
                            className="px-2 py-1 text-[9.5px] font-sans font-medium border border-zinc-200 text-zinc-650 rounded-lg hover:bg-zinc-100 transition-all cursor-pointer"
                          >
                            Toggle Status
                          </button>

                          {/* DELETE */}
                          <button 
                            onClick={() => {
                              if (confirmDeletePageId === pg.id) {
                                updatePagesList(pagesList.filter(p => p.id !== pg.id));
                                setConfirmDeletePageId(null);
                              } else {
                                setConfirmDeletePageId(pg.id);
                                setTimeout(() => setConfirmDeletePageId(prev => prev === pg.id ? null : prev), 5000);
                              }
                            }}
                            className={`p-1 px-2.5 transition-colors text-[9.5px] font-mono font-bold border rounded-lg cursor-pointer ${
                              confirmDeletePageId === pg.id
                                ? 'bg-red-600 border-red-700 text-white animate-pulse'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-100'
                            }`}
                            title={confirmDeletePageId === pg.id ? 'Click again to confirm deletion!' : 'Delete route'}
                          >
                            {confirmDeletePageId === pg.id ? '⚠️ CONFIRM PURGE' : 'DELETE'}
                          </button>
                        </div>
                      </div>

                      {/* INLINE EDIT FOR ACTIVE WEB DIRECTORY */}
                      {editingPageId === pg.id && (
                        <div className="bg-zinc-100/50 border border-zinc-200 p-4 rounded-xl space-y-4 animate-fade-in block w-full text-left">
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-250">
                            <span className="text-[10px] font-mono font-black text-zinc-900 uppercase">Configuration panel for {pg.title}</span>
                            <span className="text-[8px] font-mono bg-amber-50 text-[#d97706] p-1 border border-amber-100 rounded">WORKPLACE REAL ESTATE SAVING</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-sans font-bold text-zinc-500 uppercase tracking-wide">Page Display Title</label>
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 font-sans"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-sans font-bold text-zinc-500 uppercase tracking-wide">Url Slug Path</label>
                              <input
                                type="text"
                                value={editingSlug}
                                onChange={(e) => setEditingSlug(e.target.value)}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-sans font-bold text-zinc-500 uppercase tracking-wide">Template Presentation Frame</label>
                              <select
                                value={editingTemplate}
                                onChange={(e) => setEditingTemplate(e.target.value)}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 font-sans"
                              >
                                <option value="Bento Showcase">Bento Showcase (Default Grid)</option>
                                <option value="Infinite Scroll">Infinite Scroll Catalog</option>
                                <option value="Editorial Story">Editorial Story (Editorial Text)</option>
                                <option value="Minimal Form">Minimal Contact Form</option>
                                <option value="Blank Page">Blank Page Template</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-sans font-bold text-zinc-500 uppercase tracking-wide">SEO Focus Keywords</label>
                              <input
                                type="text"
                                value={editingSeoKeywords}
                                onChange={(e) => setEditingSeoKeywords(e.target.value)}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 font-mono text-zinc-800"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-sans font-bold text-zinc-500 uppercase tracking-wide">Breadcrumbs Navigation</label>
                              <select
                                value={editingShowBreadcrumbs ? "true" : "false"}
                                onChange={(e) => setEditingShowBreadcrumbs(e.target.value === "true")}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 font-sans text-zinc-900"
                              >
                                <option value="true">Enable Breadcrumbs on this page</option>
                                <option value="false">Disable Breadcrumbs on this page</option>
                              </select>
                            </div>

                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[9px] font-sans font-bold text-zinc-500 uppercase tracking-wide">SEO Search Title override</label>
                              <input
                                type="text"
                                value={editingSeoTitle}
                                onChange={(e) => setEditingSeoTitle(e.target.value)}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 text-zinc-800 font-sans"
                              />
                            </div>

                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[9px] font-sans font-bold text-zinc-500 uppercase tracking-wide">SEO Search Meta Description Summary</label>
                              <textarea
                                value={editingSeoDesc}
                                onChange={(e) => setEditingSeoDesc(e.target.value)}
                                rows={2}
                                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 text-zinc-800 resize-none leading-snug"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingPageId(null)}
                              className="px-3 py-1.5 border border-zinc-200 text-zinc-650 hover:bg-zinc-150 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = pagesList.map(p => {
                                  if (p.id === pg.id) {
                                    return {
                                      ...p,
                                      title: editingTitle,
                                      slug: editingSlug,
                                      template: editingTemplate,
                                      seoTitle: editingSeoTitle,
                                      seoDesc: editingSeoDesc,
                                      seoKeywords: editingSeoKeywords,
                                      showBreadcrumbs: editingShowBreadcrumbs
                                    };
                                  }
                                  return p;
                                });
                                updatePagesList(updated);
                                setEditingPageId(null);
                                alert(`Successfully updated configuration details of custom page "${editingTitle}".`);
                              }}
                              className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-[10px] font-mono font-bold uppercase transition-colors"
                            >
                              Apply Configs
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. MEDIA GALLERY MANAGER */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h2 className="text-md font-sans font-bold text-zinc-900">Media Vault & Image Host</h2>
                <p className="text-xs text-zinc-400 font-mono">DRAG AND DROP VECTOR GRAPHICS, LIFESTYLE HEROS AND WORKSPACE SNAPS</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {selectedMediaId && (
                  <button
                    onClick={() => setSelectedMediaId(null)}
                    className="p-1 px-3 text-[10px] font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors cursor-pointer"
                  >
                    CLEAR SELECTION
                  </button>
                )}
                <button
                  onClick={() => mediaFileInputRef.current?.click()}
                  className="p-1.5 px-3.5 text-xs font-mono font-bold bg-zinc-950 hover:bg-zinc-850 text-white rounded-lg transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wide"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Select Local File
                </button>
              </div>
            </div>

            {/* Hidden Input for Local Files */}
            <input
              type="file"
              ref={mediaFileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadProgress(0);
                  let progress = 0;
                  const interval = setInterval(() => {
                    progress += 20;
                    setUploadProgress(progress);
                    if (progress >= 100) {
                      clearInterval(interval);
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const fileResult = event.target?.result as string;
                        const folderVal = customFolderInput.trim() !== 'Root' ? customFolderInput.trim() : '';
                        await uploadSingleMediaFile(file, fileResult, folderVal);
                      };
                      reader.readAsDataURL(file);
                    }
                  }, 120);
                }
              }}
              accept="image/*"
              className="hidden"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Left Zone - Files Uploader & Search Engine Optimization settings form */}
              <div className="lg:col-span-1 space-y-4">
                
                {/* Global Storage Engine Selection Toggle */}
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono tracking-widest font-black text-amber-700 uppercase block flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-amber-700" />
                      STORAGE ENGINE CHOICE
                    </span>
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase bg-zinc-100 px-1.5 py-0.5 rounded">
                      GLOBAL
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                    All new image file uploads will route to the selected destination dynamically and verify connections in real-time.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStorageProvider('local');
                        localStorage.setItem('min_eco_active_storage_provider', 'local');
                      }}
                      className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        activeStorageProvider === 'local'
                          ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider block">Local Server</span>
                      <span className="text-[8px] opacity-75 leading-tight font-sans">/api/upload-image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveStorageProvider('supabase');
                        localStorage.setItem('min_eco_active_storage_provider', 'supabase');
                      }}
                      className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        activeStorageProvider === 'supabase'
                          ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider block">Supabase Cloud</span>
                      <span className="text-[8px] opacity-75 leading-tight font-sans">REST Cloud Storage</span>
                    </button>
                  </div>

                  {/* Supabase connection status helper */}
                  {activeStorageProvider === 'supabase' && (
                    <div className="mt-2.5 p-2 bg-white border border-zinc-200 rounded-lg flex items-center justify-between text-[9px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          supabaseConnectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                          supabaseConnectionStatus === 'testing' ? 'bg-amber-500 animate-spin' :
                          supabaseConnectionStatus === 'error' ? 'bg-rose-500' : 'bg-zinc-450'
                        }`} />
                        <span className="font-bold text-zinc-600">SUPABASE BUCKET:</span>
                      </div>
                      <span className={`font-bold uppercase ${
                        supabaseConnectionStatus === 'connected' ? 'text-emerald-600' :
                        supabaseConnectionStatus === 'testing' ? 'text-amber-600' :
                        supabaseConnectionStatus === 'error' ? 'text-rose-600' : 'text-zinc-500'
                      }`}>
                        {supabaseConnectionStatus === 'connected' ? 'CONNECTED' :
                         supabaseConnectionStatus === 'testing' ? 'TESTING...' :
                         supabaseConnectionStatus === 'error' ? 'FAILED' : 'DISCONNECTED'}
                      </span>
                    </div>
                  )}

                  {activeStorageProvider === 'local' && (
                    <div className="mt-2.5 p-2 bg-white border border-zinc-200 rounded-lg flex items-center justify-between text-[9px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-zinc-650">LOCAL ENDPOINT:</span>
                      </div>
                      <span className="text-emerald-600 font-bold uppercase">READY</span>
                    </div>
                  )}
                </div>

                {/* Custom Folder Configuration */}
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3 text-left">
                  <span className="text-[10px] font-mono tracking-widest font-black text-amber-700 uppercase block flex items-center gap-1">
                    📁 UPLOAD SUBDIRECTORY
                  </span>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 block">Select Subfolder Preset:</label>
                    <select
                      value={availableFolders.includes(customFolderInput) ? customFolderInput : 'custom'}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setCustomFolderInput(e.target.value);
                        }
                      }}
                      className="w-full p-2 border border-zinc-205 rounded-lg bg-white text-xs text-zinc-900 outline-none font-bold"
                    >
                      <option value="Root">/ Root (uploaded_images/)</option>
                      {availableFolders.filter(f => f !== 'Root').map((f) => (
                        <option key={f} value={f}>
                          / {f}
                        </option>
                      ))}
                      <option value="custom">-- Create / Type Custom Subfolder --</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 block">⌨️ Subfolder Name:</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. products, banners..."
                        value={customFolderInput}
                        onChange={(e) => setCustomFolderInput(e.target.value)}
                        className="flex-1 p-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono text-zinc-950 outline-none focus:border-zinc-500 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const sanitized = customFolderInput.replace(/[^a-zA-Z0-9_\-\/]/g, '_').trim();
                          if (sanitized && !availableFolders.includes(sanitized)) {
                            setAvailableFolders([...availableFolders, sanitized]);
                            setCustomFolderInput(sanitized);
                          }
                        }}
                        className="px-2.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[9px] font-bold rounded-lg uppercase cursor-pointer"
                        title="Add as temporary subfolder choice"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Standard Drag & Drop local file container */}
                <div 
                  onClick={() => mediaFileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsMediaDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsMediaDragging(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsMediaDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      setUploadProgress(0);
                      let progress = 0;
                      const interval = setInterval(() => {
                        progress += 20;
                        setUploadProgress(progress);
                        if (progress >= 100) {
                          clearInterval(interval);
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const fileResult = event.target?.result as string;
                            const folderVal = customFolderInput.trim() !== 'Root' ? customFolderInput.trim() : '';
                            await uploadSingleMediaFile(file, fileResult, folderVal);
                          };
                          reader.readAsDataURL(file);
                        }
                      }, 120);
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-350 bg-white ${
                    isMediaDragging
                      ? 'border-amber-500 bg-amber-50/20 scale-[1.02]'
                      : 'border-zinc-200 hover:border-zinc-950'
                  }`}
                >
                  <Image className={`w-8 h-8 stroke-[1.2] mb-3 transition-colors ${isMediaDragging ? 'text-amber-500' : 'text-zinc-450'}`} />
                  <span className="text-[11px] font-bold text-zinc-900 block font-mono uppercase tracking-wider">Drag & Drop Image</span>
                  <span className="text-[10px] text-zinc-400 block mt-1 font-sans">Or click to browse storage files</span>
                  
                  {uploadProgress !== null && (
                    <div className="w-full mt-4 space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                        <span>Uploading file...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-950 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* CUSTOM IMAGE URL REGISTER FORM */}
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3 text-left">
                  <span className="text-[10px] font-mono tracking-widest font-black text-amber-700 uppercase block flex items-center gap-1">
                    🔗 REGISTER CUSTOM URL
                  </span>
                  <p className="text-[9.5px] font-sans text-zinc-500 leading-normal">
                    Manually index any static web image path or remote asset into your central Media Gallery.
                  </p>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-zinc-550 uppercase block">Image URL:</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={customUrlRegisterVal}
                      onChange={(e) => setCustomUrlRegisterVal(e.target.value)}
                      className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono text-zinc-950 outline-none focus:border-zinc-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-zinc-550 uppercase block">Asset Display Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. customized_chair.jpg"
                      value={customUrlRegisterName}
                      onChange={(e) => setCustomUrlRegisterName(e.target.value)}
                      className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono text-zinc-950 outline-none focus:border-zinc-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-zinc-550 uppercase block">Category Tag:</label>
                    <select
                      value={customUrlRegisterCat}
                      onChange={(e) => setCustomUrlRegisterCat(e.target.value)}
                      className="w-full p-2 border border-zinc-205 rounded-lg bg-white text-xs text-zinc-900 outline-none font-bold"
                    >
                      <option value="Product">Product</option>
                      <option value="Standard">Standard</option>
                      <option value="Banner">Banner</option>
                      <option value="Hero">Hero</option>
                      <option value="Background">Background</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={!customUrlRegisterVal.trim()}
                    onClick={() => handleRegisterCustomImageUrl(customUrlRegisterVal, customUrlRegisterName, customUrlRegisterCat)}
                    className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-mono text-[9px] font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Index URL to Gallery
                  </button>
                </div>

                {/* IMAGE SEO SETTINGS PANEL */}
                {selectedMediaId ? (
                  (() => {
                    const active = mediaItems.find(m => m.id === selectedMediaId);
                    if (!active) return null;
                    return (
                      <div className="bg-white border border-zinc-950/20 p-4 rounded-xl space-y-4 shadow-sm animate-fade-in relative overflow-hidden">
                        {/* Decorative background border */}
                        <div className="absolute top-0 left-0 w-1 bg-amber-600 h-full" />
                        
                        <div className="flex justify-between items-center pl-1">
                          <span className="text-[10px] font-mono text-amber-700 tracking-widest font-black uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-[#d97706]" />
                            Image SEO Tweaks
                          </span>
                          <button
                            onClick={() => setSelectedMediaId(null)}
                            className="text-zinc-400 hover:text-zinc-900 text-[10px] font-mono leading-none cursor-pointer uppercase"
                          >
                            Close
                          </button>
                        </div>

                        <div className="flex items-center gap-3 pl-1 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                          <img src={active.url} alt={active.name} className="w-10 h-10 object-cover rounded border border-zinc-200 shrink-0" referrerPolicy="no-referrer" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-zinc-850 truncate font-mono">{active.name}</p>
                            <span className="text-[8.5px] font-mono text-zinc-400">{active.size} ({active.category})</span>
                          </div>
                        </div>

                        {seoSuccessMessage && (
                          <div className="p-2 bg-green-50 border border-green-150 text-green-700 text-[10px] rounded-lg font-sans font-semibold flex items-center gap-1.5 animate-pulse pl-1">
                            <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                            SEO Metadata applied successfully!
                          </div>
                        )}

                        <div className="space-y-3 pt-1 text-left">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-450 uppercase font-black tracking-wide">
                              <span>Alt Tag Text (Alternative)</span>
                              <span className="text-zinc-400 text-[8px]">Access / Crawlers</span>
                            </div>
                            <input
                              type="text"
                              value={seoAltText}
                              onChange={(e) => setSeoAltText(e.target.value)}
                              placeholder="e.g. Nordic solid oak desk helper chair"
                              className="w-full p-2 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg outline-none text-xs font-sans text-zinc-90"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-450 uppercase font-black block tracking-wide">Meta Title Tag</span>
                            <input
                              type="text"
                              value={seoMetaTitle}
                              onChange={(e) => setSeoMetaTitle(e.target.value)}
                              placeholder="e.g. Ergonomic Office Chairs | Goldiama Catalog"
                              className="w-full p-2 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg outline-none text-xs font-sans text-zinc-90"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-450 uppercase font-black block tracking-wide">Focus Keywords</span>
                            <input
                              type="text"
                              value={seoFocusKeywords}
                              onChange={(e) => setSeoFocusKeywords(e.target.value)}
                              placeholder="e.g. oak, ergonomic chair, furniture nordic"
                              className="w-full p-2 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg outline-none text-xs font-mono text-zinc-90"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-455 uppercase font-black block tracking-wide border-0">Category</span>
                            <select
                              value={seoCategory}
                              onChange={(e) => setSeoCategory(e.target.value)}
                              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none text-xs font-mono text-zinc-90"
                            >
                              <option value="Product">Product</option>
                              <option value="Standard">Standard</option>
                              <option value="Banner">Banner</option>
                              <option value="Hero">Hero</option>
                              <option value="Background">Background</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-455 uppercase font-black block tracking-wide">Description SEO (Snippet)</span>
                            <textarea
                              value={seoDescription}
                              onChange={(e) => setSeoDescription(e.target.value)}
                              rows={2}
                              placeholder="Describe image relevance for search snippet..."
                              className="w-full p-2 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg outline-none text-xs font-sans text-zinc-90 resize-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-450 uppercase font-black block tracking-wide">Caption Detail</span>
                            <input
                              type="text"
                              value={seoCaption}
                              onChange={(e) => setSeoCaption(e.target.value)}
                              placeholder="Visually displayed descriptive text"
                              className="w-full p-2 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg outline-none text-xs font-sans text-zinc-90"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex flex-col gap-2 border-t border-zinc-100">
                          <button
                            type="button"
                            onClick={() => {
                              // Autogenerate based on filename
                              const cleanName = active.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                              const uppercaseWords = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                              setSeoAltText(`High-fidelity editorial capture of ${cleanName} lifestyle concept`);
                              setSeoFocusKeywords(`${cleanName.split(' ')[0] || 'minimal'}, styling key, luxury ${cleanName.split(' ').pop() || 'furniture'}`);
                              setSeoCaption(`Custom selected ${cleanName} accessories from Nordic materials.`);
                              setSeoMetaTitle(`Curated ${uppercaseWords} | Goldiama Fine Collections`);
                              setSeoDescription(`Explore high-standard organic ${cleanName} details with luxurious finishes for modern workspace architectures.`);
                            }}
                            className="w-full py-1.5 border border-zinc-200 hover:border-zinc-950 bg-white hover:bg-zinc-50 text-zinc-800 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Auto Suggest SEO (AI)
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const updated = mediaItems.map(item => {
                                if (item.id === selectedMediaId) {
                                  return {
                                    ...item,
                                    altText: seoAltText,
                                    focusKeywords: seoFocusKeywords,
                                    caption: seoCaption,
                                    metaTitle: seoMetaTitle,
                                    descriptionSEO: seoDescription,
                                    category: seoCategory
                                  };
                                }
                                return item;
                              });
                              saveMediaItemsToStorage(updated);
                              setSeoSuccessMessage(true);
                              setTimeout(() => setSeoSuccessMessage(false), 2000);
                            }}
                            className="w-full py-2 bg-zinc-950 text-white hover:bg-zinc-850 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            Save SEO Settings
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-[10px] font-mono space-y-3 text-left">
                    <p className="font-bold text-zinc-700 uppercase tracking-widest flex items-center gap-1 text-[9px] border-b border-zinc-200/50 pb-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#d97706]" />
                      SEARCH OPTIMISER (SEO)
                    </p>
                    <p className="text-zinc-500 leading-relaxed font-sans">
                      Click any asset in the main catalog to edit its Google indexation tags, Alt criteria, caption, meta titles, or run automated AI key generation!
                    </p>
                    <div className="pt-2 border-t border-zinc-200/50 space-y-1 text-[8.5px] font-mono text-zinc-450">
                      <span className="text-zinc-550 block font-bold">WORKSPACE DETAILS:</span>
                      <span className="block">• MAX FILE LIMIT: 25 MB</span>
                      <span className="block">• TYPES: JPEG, PNG, WEBP, SVG</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Zone - Gallery item lists */}
              <div className="lg:col-span-3 bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-4">
                <div className="flex flex-col gap-2.5 border-b border-zinc-100 pb-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-mono font-bold uppercase text-zinc-800">Active Asset Catalog</h3>
                    <span className="text-[9px] font-mono text-zinc-440 font-bold uppercase tracking-wide">
                      {mediaItems.filter(med => {
                        if (selectedFolderFilter === 'All') return true;
                        const medFolder = med.folder || 'Root';
                        return medFolder.toLowerCase() === selectedFolderFilter.toLowerCase();
                      }).length} elements shown • Click to configure SEO
                    </span>
                  </div>
                  
                  {/* Directory / Subfolder Filter selector */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-zinc-100/50">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase mr-1">Filter Directory:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFolderFilter('All')}
                      className={`px-2.5 py-1 text-[9px] font-mono rounded-md font-bold transition-all cursor-pointer ${selectedFolderFilter === 'All' ? 'bg-zinc-950 text-white shadow-xs' : 'bg-zinc-100 hover:bg-zinc-250 text-zinc-600'}`}
                    >
                      📁 ALL DIRECTORIES
                    </button>
                    {availableFolders.map((fld) => (
                      <button
                        key={fld}
                        type="button"
                        onClick={() => setSelectedFolderFilter(fld)}
                        className={`px-2.5 py-1 text-[9px] font-mono rounded-md font-bold transition-all cursor-pointer uppercase ${selectedFolderFilter === fld ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-100'}`}
                      >
                        📁 {fld}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mediaItems
                    .filter(med => {
                      if (selectedFolderFilter === 'All') return true;
                      const medFolder = med.folder || 'Root';
                      return medFolder.toLowerCase() === selectedFolderFilter.toLowerCase();
                    })
                    .map((med) => {
                      const isSelected = med.id === selectedMediaId;
                      return (
                        <div 
                          key={med.id} 
                          onClick={() => setSelectedMediaId(med.id)}
                          className={`border transition-all rounded-xl overflow-hidden flex flex-col group bg-zinc-50 cursor-pointer ${
                            isSelected 
                              ? 'border-zinc-950 ring-2 ring-zinc-950 shadow-md bg-zinc-50/10' 
                              : 'border-zinc-200 hover:border-zinc-900 hover:shadow-xs'
                          }`}
                        >
                          {/* Image Preview Window */}
                          <div className="h-28 overflow-hidden relative bg-zinc-150 flex items-center justify-center border-b border-zinc-200 bg-white">
                            <img 
                              src={med.url} 
                              alt={med.altText || med.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Directory and category badge overlay */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                              <span className="bg-zinc-900/90 text-white text-[7.5px] font-mono tracking-widest px-1.5 py-0.5 rounded font-black uppercase">
                                {med.category}
                              </span>
                              <span className="bg-amber-700/90 text-white text-[7.5px] font-mono tracking-wider px-1.5 py-0.5 rounded font-bold uppercase block">
                                📁 {med.folder || 'Root'}
                              </span>
                            </div>

                            <div className="absolute top-2 right-2 flex gap-1">
                              {med.altText && med.metaTitle ? (
                                <span className="bg-green-600 text-white text-[8px] font-mono font-black px-1.5 py-0.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.15)] shrink-0" title="Alt Tags & Titles Synced">
                                  ✓ SEO CAPABLE
                                </span>
                              ) : (
                                <span className="bg-amber-600/90 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.15)] shrink-0" title="SEO settings deficient or blank">
                                  ⚠ NO SEO
                                </span>
                              )}
                            </div>

                            {/* Hover Actions Overlay */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMediaId(med.id);
                                }}
                                className="bg-white hover:bg-zinc-100 text-zinc-950 px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all transform hover:scale-105 shadow-md border border-zinc-200"
                                title="Edit Metadata & Alt Tags"
                              >
                                <Edit className="w-3 h-3 text-zinc-700" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (selectedMediaId === med.id) {
                                    setSelectedMediaId(null);
                                  }
                                  const filtered = mediaItems.filter(m => m.id !== med.id);
                                  saveMediaItemsToStorage(filtered);
                                }}
                                className="bg-red-650 hover:bg-red-750 text-white px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all transform hover:scale-105 shadow-md border border-red-700"
                                title="Delete media asset completely"
                              >
                                <Trash2 className="w-3 h-3 text-white" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                        {/* Info Panel */}
                        <div className="p-3 bg-white space-y-1 flex-1 flex flex-col justify-between">
                          <div className="space-y-0.5">
                            <div className="flex justify-between items-start gap-1">
                              <p className="text-[11px] font-bold text-zinc-950 truncate font-mono flex-1 text-left">{med.name}</p>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-mono text-left">Weight: {med.size}</p>
                            {med.altText && (
                              <p className="text-[8.5px] italic text-zinc-500 truncate font-sans pt-0.5 text-left" title={med.altText}>alt: "{med.altText}"</p>
                            )}
                          </div>

                          <div className="pt-2 flex justify-between items-center bg-white border-t border-zinc-50 mt-2">
                            <span className="text-[9px] font-mono text-zinc-400">ID: {med.id}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedMediaId === med.id) {
                                  setSelectedMediaId(null);
                                }
                                const filtered = mediaItems.filter(m => m.id !== med.id);
                                saveMediaItemsToStorage(filtered);
                              }}
                              className="text-[9px] font-mono text-red-650 hover:text-red-750 font-bold bg-zinc-50 hover:bg-red-50 p-1 px-2 rounded transition-colors cursor-pointer"
                            >
                              DISCARD
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 10. BANKING AND PAYMENT HUB */}
        {activeTab === 'banking' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs">
              <h2 className="text-md font-sans font-bold text-zinc-900">Banking, Settlements & Payment Gateway</h2>
              <p className="text-xs text-zinc-400 font-mono">CONFIGURE SECURE INBOUND CHANNELS, IBAN DATA, EXPORTS AND COMPLIANCE VALUE ADDED TAX</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Controls */}
              <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 shadow-xs space-y-5">
                
                <h3 className="text-sm font-mono font-bold uppercase text-zinc-800 border-b border-zinc-100 pb-2">Settlement Account parameters</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 font-sans">
                    <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Active Corporate Name</label>
                    <input
                      type="text"
                      value={bankingLegalName}
                      onChange={(e) => setBankingLegalName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">IBAN Settlement Code (SEPA/SWIFT)</label>
                    <input
                      type="text"
                      value={bankingIban}
                      onChange={(e) => setBankingIban(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Processor Gateway</label>
                    <select
                      value={bankingActiveGateway}
                      onChange={(e) => setBankingActiveGateway(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900 font-sans"
                    >
                      <option value="Stripe Connect">Stripe Connect</option>
                      <option value="Adyen Direct">Adyen Direct</option>
                      <option value="Klarna API">Klarna API</option>
                      <option value="PayPal Pro">PayPal Pro</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Country VAT Rate (%)</label>
                    <input
                      type="number"
                      value={bankingTaxRate}
                      onChange={(e) => setBankingTaxRate(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Payout Currency</label>
                    <select
                      value={bankingCurrency}
                      onChange={(e) => setBankingCurrency(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900 font-mono"
                    >
                      <option value="USD font-mono">USD ($)</option>
                      <option value="EUR font-mono">EUR (€)</option>
                      <option value="SEK font-mono">SEK (kr)</option>
                      <option value="GBP font-mono">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleSaveAllChanges}
                    className="w-full bg-zinc-950 text-white font-mono hover:bg-zinc-805 transition-colors text-xs py-2.5 rounded-xl block font-bold cursor-pointer uppercase tracking-widest"
                  >
                    LOCK & SYNC ACCOUNT PARAMS
                  </button>
                </div>
              </div>

              {/* Status Sidepanel with nice graphics */}
              <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl space-y-4 font-mono text-[10px]">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-mono font-bold uppercase text-zinc-850 tracking-wider">Compliance Monitor</h3>
                  <p className="text-[9px] text-zinc-400 font-mono">TRUST LEVEL STATE</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-3.5">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500">PAYOUT CHANNEL</span>
                    <span className="text-emerald-600 font-bold uppercase">active</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500 font-mono">CURRENCY CODE</span>
                    <span className="text-zinc-900 font-bold">{bankingCurrency}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500">VAT MARGIN</span>
                    <span className="text-zinc-900 font-bold">{bankingTaxRate}%</span>
                  </div>

                  <div className="flex justify-between items-center pb-2">
                    <span className="text-zinc-500">SSL SECURITY HANDSHAKE</span>
                    <span className="text-emerald-600 font-bold">AES-256</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 text-amber-900 font-sans border border-amber-200 rounded-xl leading-relaxed text-[11px]">
                  <strong>Notice:</strong> Updates to Banking details trigger visual audit prompts on the consumer storefront inside the checkout gateway frame.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 11. INDIVIDUAL KYC ONBOARDING */}
        {activeTab === 'kyc-individual' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-md font-sans font-bold text-zinc-900">Individual KYC Verifications</h2>
                <p className="text-xs text-zinc-400 font-mono text-[10px]">STANDARDIZED SEPA COMPLIANCE & IDENTITY CHECKS DEFI-COMPLIANT</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono px-2 py-1 bg-[#FAF9F9] border rounded-lg text-zinc-500 font-bold">TOTAL VERIFIED: {kycIndividuals.filter(i => i.status === 'Approved').length}</span>
                <span className="text-[10px] font-mono px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-bold">PENDING: {kycIndividuals.filter(i => i.status === 'Pending').length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Submission List Table */}
              <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-950 transition-all duration-350">
                <div className="px-5 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Verification Requests</span>
                  <span className="text-[9px] font-mono text-zinc-400">REALTIME INBOUND STREAM</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F9] border-b border-zinc-100 font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">User ID</th>
                        <th className="py-3 px-4">Applicant</th>
                        <th className="py-3 px-4">Doc Type</th>
                        <th className="py-3 px-4">Origin</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {kycIndividuals.map((ind) => (
                        <tr key={ind.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10px] text-zinc-400">{ind.id}</td>
                          <td className="py-3 px-4 font-sans font-semibold text-zinc-950">
                            <div>{ind.name}</div>
                            <div className="text-[9px] text-zinc-400 font-mono font-normal tracking-tight">{ind.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-sans font-medium text-zinc-650 px-1.5 py-0.5 border border-zinc-200 rounded">
                              {ind.docType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-550">
                            {ind.country}
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-zinc-450">{ind.submittedAt}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                              ind.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                              ind.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                              ind.status === 'Under Review' ? 'bg-blue-50 text-blue-700' :
                              'bg-zinc-100 text-zinc-500'
                            }`}>
                              {ind.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 font-mono">
                            {ind.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setKycIndividuals(kycIndividuals.map(x => x.id === ind.id ? { ...x, status: 'Approved' } : x));
                                  }}
                                  className="text-[10px] bg-zinc-950 text-white rounded px-2 py-1 font-bold hover:bg-zinc-800 cursor-pointer font-sans"
                                >
                                  Pass
                                </button>
                                <button
                                  onClick={() => {
                                    setKycIndividuals(kycIndividuals.map(x => x.id === ind.id ? { ...x, status: 'Declined' } : x));
                                  }}
                                  className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded px-2 py-1 font-bold cursor-pointer font-sans"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {ind.status !== 'Pending' && (
                              <button
                                onClick={() => {
                                  setKycIndividuals(kycIndividuals.map(x => x.id === ind.id ? { ...x, status: 'Pending' } : x));
                                }}
                                className="text-[9px] text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                              >
                                Reset to Pending
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Simulation Onboarding Widget */}
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-4">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-zinc-800 tracking-wider">Simulate Applicant Submission</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">GENERATE REGULATORY VERIFICATION PIPELINES FOR SANDBOX AUDIT</p>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-[10px] text-zinc-500 uppercase">Applicant Full Name</label>
                    <input
                      type="text"
                      value={newIndName}
                      onChange={(e) => setNewIndName(e.target.value)}
                      placeholder="e.g. Astrid Lindgren"
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-xs text-zinc-950"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[10px] text-zinc-500 uppercase">Email Anchor</label>
                    <input
                      type="email"
                      value={newIndEmail}
                      onChange={(e) => setNewIndEmail(e.target.value)}
                      placeholder="e.g. astrid@lindgren.org"
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-xs text-zinc-950 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase">Residence Country</label>
                      <select
                        value={newIndCountry}
                        onChange={(e) => setNewIndCountry(e.target.value)}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-955 text-xs text-zinc-950"
                      >
                        <option value="Sweden">Sweden</option>
                        <option value="Norway">Norway</option>
                        <option value="Denmark">Denmark</option>
                        <option value="Finland">Finland</option>
                        <option value="Iceland">Iceland</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase">Verification Document</label>
                      <select
                        value={newIndDocType}
                        onChange={(e) => setNewIndDocType(e.target.value)}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-955 text-xs text-zinc-950"
                      >
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                        <option value="National ID Card">National ID Card</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newIndName || !newIndEmail) {
                        alert("Please fill in applicant name and email.");
                        return;
                      }
                      const newId = 'KYC-I-' + Math.floor(Math.random() * 900 + 100);
                      const now = new Date().toISOString().split('T')[0];
                      setKycIndividuals([
                        { 
                          id: newId, 
                          name: newIndName, 
                          email: newIndEmail, 
                          country: newIndCountry, 
                          docType: newIndDocType, 
                          submittedAt: now, 
                          status: 'Pending', 
                          docUrl: '' 
                        },
                        ...kycIndividuals
                      ]);
                      setNewIndName('');
                      setNewIndEmail('');
                    }}
                    className="w-full bg-zinc-950 text-white font-mono rounded-lg py-2.5 hover:bg-zinc-800 transition-colors text-xs font-bold cursor-pointer"
                  >
                    EMULATE INBOUND PROFILE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 12. CORPORATE KYC ONBOARDING */}
        {activeTab === 'kyc-corporate' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-md font-sans font-bold text-zinc-900">Corporate & Entity Verifications</h2>
                <p className="text-xs text-zinc-400 font-mono text-[10px]">CORPORATE STRUCTURE DIRECTIVE & UBO VERIFICATION STANDARDS</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono px-2 py-1 bg-[#FAF9F9] border rounded-lg text-zinc-500 font-bold">ACTIVE ENTITIES: {kycCorporates.filter(c => c.status === 'Approved').length}</span>
                <span className="text-[10px] font-mono px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-bold">IN REVIEW: {kycCorporates.filter(c => c.status === 'Pending' || c.status === 'Under Review').length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Corporate Directory Table */}
              <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-950 transition-all duration-350">
                <div className="px-5 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Registered Legal Entities</span>
                  <span className="text-[9px] font-mono text-zinc-400">STATE ENROLLMENT RECORDS</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F9] border-b border-zinc-100 font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Entity Code</th>
                        <th className="py-3 px-4">Legal Name / Reg</th>
                        <th className="py-3 px-4">Beneficial Owner (UBO)</th>
                        <th className="py-3 px-4">Jurisdiction</th>
                        <th className="py-3 px-4">Officer</th>
                        <th className="py-3 px-4">Audit Status</th>
                        <th className="py-3 px-4 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {kycCorporates.map((corp) => (
                        <tr key={corp.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10px] text-zinc-500">{corp.id}</td>
                          <td className="py-3 px-4 font-sans font-semibold text-zinc-950">
                            <div>{corp.companyName}</div>
                            <div className="text-[9px] text-zinc-400 font-mono font-normal tracking-tight">{corp.regNumber}</div>
                          </td>
                          <td className="py-3 px-4 font-sans text-zinc-700">
                            <div>{corp.uboName}</div>
                            <div className="text-[9px] text-zinc-400 font-mono">Equity Held: {corp.verifiedShares}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                            {corp.country}
                          </td>
                          <td className="py-3 px-4 text-zinc-550 font-sans text-[11px]">{corp.complianceOfficer}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                              corp.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                              corp.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                              corp.status === 'Under Review' ? 'bg-blue-50 text-blue-700' :
                              'bg-zinc-100 text-zinc-500'
                            }`}>
                              {corp.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 font-mono">
                            {corp.status === 'Pending' && (
                              <button
                                onClick={() => {
                                  setKycCorporates(kycCorporates.map(x => x.id === corp.id ? { ...x, status: 'Approved', verifiedShares: '100%' } : x));
                                }}
                                className="text-[10px] bg-zinc-950 text-white rounded px-2.5 py-1 font-bold hover:bg-zinc-805 cursor-pointer font-sans"
                              >
                                Approve
                              </button>
                            )}
                            {corp.status !== 'Approved' && corp.status !== 'Pending' && (
                              <button
                                onClick={() => {
                                  setKycCorporates(kycCorporates.map(x => x.id === corp.id ? { ...x, status: 'Approved' } : x));
                                }}
                                className="text-[10px] text-zinc-850 hover:text-zinc-950 underline cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {corp.status === 'Approved' && (
                              <button
                                onClick={() => {
                                  setKycCorporates(kycCorporates.map(x => x.id === corp.id ? { ...x, status: 'Pending', verifiedShares: '0%' } : x));
                                }}
                                className="text-[9px] text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                              >
                                Revert
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Corporate Simulation Module */}
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-4">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-zinc-800 tracking-wider">File Entity Application</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">EMULATE CORPORATE INCORPORATION DOSSIER UPLOAD</p>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-[10px] text-zinc-500 uppercase">Legal Entity Name</label>
                    <input
                      type="text"
                      value={newCorpName}
                      onChange={(e) => setNewCorpName(e.target.value)}
                      placeholder="e.g. Stockholm Architectural AS"
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-[#222] text-xs text-zinc-950"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase">Registry Number</label>
                      <input
                        type="text"
                        value={newCorpReg}
                        onChange={(e) => setNewCorpReg(e.target.value)}
                        placeholder="e.g. SE-2938102"
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-[#222] text-xs text-zinc-950 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase">Officer in Charge</label>
                      <input
                        type="text"
                        value={newCorpOfficer}
                        onChange={(e) => setNewCorpOfficer(e.target.value)}
                        placeholder="e.g. Nils Frahm"
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-[#222] text-xs text-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase">UBO Name</label>
                      <input
                        type="text"
                        value={newCorpUbo}
                        onChange={(e) => setNewCorpUbo(e.target.value)}
                        placeholder="e.g. Helgi Jonsson"
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-[#222] text-xs text-zinc-950"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase">Jurisdiction</label>
                      <select
                        value={newCorpCountry}
                        onChange={(e) => setNewCorpCountry(e.target.value)}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-[#222] text-xs text-zinc-950"
                      >
                        <option value="Sweden">Sweden</option>
                        <option value="Norway">Norway</option>
                        <option value="Denmark">Denmark</option>
                        <option value="Finland">Finland</option>
                        <option value="Iceland">Iceland</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newCorpName || !newCorpReg || !newCorpOfficer) {
                        alert("Please fill in Entity Name, Registry Number and Officer Name.");
                        return;
                      }
                      const newId = 'KYC-C-' + Math.floor(Math.random() * 900 + 400);
                      const now = new Date().toISOString().split('T')[0];
                      setKycCorporates([
                        { 
                          id: newId, 
                          companyName: newCorpName, 
                          regNumber: newCorpReg, 
                          uboName: newCorpUbo || 'Undisclosed Beneficiaries', 
                          country: newCorpCountry, 
                          complianceOfficer: newCorpOfficer, 
                          submittedAt: now, 
                          status: 'Pending', 
                          verifiedShares: '55%' 
                        },
                        ...kycCorporates
                      ]);
                      setNewCorpName('');
                      setNewCorpReg('');
                      setNewCorpUbo('');
                      setNewCorpOfficer('');
                    }}
                    className="w-full bg-zinc-950 text-white font-mono rounded-lg py-2.5 hover:bg-zinc-800 transition-colors text-xs font-bold cursor-pointer"
                  >
                    SUBMIT CORPORATE DOSSIER
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 13. ADMIN PORTAL SETTINGS */}
        {activeTab === 'admin-settings' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-md font-sans font-bold text-zinc-900">Console Settings & System Administration</h2>
                <p className="text-xs text-zinc-400 font-mono text-[10px]">EDIT SYSTEM CUSTOMISATION, USER SPECS, PROFILE DETAILS, AND CHANNEL ALERTS</p>
              </div>
            </div>

            {/* Elegant Horizontal Sub-Tabs */}
            <div className="bg-zinc-100 p-1 rounded-xl flex flex-wrap gap-1 w-full max-w-3xl">
              <button
                type="button"
                onClick={() => setSettingsSubTab('profile')}
                className={`flex-1 min-w-[120px] py-1.5 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer text-center ${
                  settingsSubTab === 'profile'
                    ? 'bg-white text-zinc-950 shadow-sm font-semibold border border-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50/50'
                }`}
              >
                👤 Profile User Settings
              </button>
              <button
                type="button"
                onClick={() => setSettingsSubTab('notifications')}
                className={`flex-1 min-w-[110px] py-1.5 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer text-center ${
                  settingsSubTab === 'notifications'
                    ? 'bg-white text-zinc-950 shadow-sm font-semibold border border-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50/50'
                }`}
              >
                🔔 Notifications
              </button>
              <button
                type="button"
                onClick={() => setSettingsSubTab('api-integration')}
                className={`flex-1 min-w-[110px] py-1.5 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer text-center ${
                  settingsSubTab === 'api-integration'
                    ? 'bg-white text-zinc-950 shadow-sm font-semibold border border-zinc-200'
                    : 'text-zinc-550 hover:text-zinc-950 hover:bg-zinc-50/50'
                }`}
              >
                🔌 API Integration
              </button>
              <button
                type="button"
                onClick={() => setSettingsSubTab('supabase')}
                className={`flex-1 min-w-[130px] py-1.5 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer text-center ${
                  settingsSubTab === 'supabase'
                    ? 'bg-white text-zinc-950 shadow-sm font-semibold border border-zinc-200'
                    : 'text-zinc-550 hover:text-zinc-950 hover:bg-zinc-50/50'
                }`}
              >
                ⚡ Supabase Config
              </button>
            </div>

            {/* Sub-Tab 1: CUSTOMISATION */}
            {settingsSubTab === 'customisation' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                {/* Brand Identity Card */}
                <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                      <Settings className="w-4 h-4 text-zinc-500" />
                      Console Logo & Brand Identity
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Logo Display Type</label>
                        <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
                          <button
                            type="button"
                            onClick={() => setAdminLogoType('letter')}
                            className={`py-1.5 text-[11px] font-sans font-bold rounded-lg transition-all cursor-pointer ${
                              adminLogoType === 'letter'
                                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                                : 'text-zinc-500 hover:text-zinc-950'
                            }`}
                          >
                            🔤 Monogram Letter
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminLogoType('image')}
                            className={`py-1.5 text-[11px] font-sans font-bold rounded-lg transition-all cursor-pointer ${
                              adminLogoType === 'image'
                                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                                : 'text-zinc-500 hover:text-zinc-950'
                            }`}
                          >
                            🖼️ Custom Image
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {adminLogoType === 'letter' ? (
                          <div className="space-y-1.5 animate-fade-in">
                            <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Sidebar Emblem Letter</label>
                            <input
                              type="text"
                              maxLength={2}
                              value={adminLogoLetter}
                              onChange={(e) => setAdminLogoLetter(e.target.value)}
                              className="w-full p-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900 font-mono uppercase font-bold text-center"
                            />
                          </div>
                        ) : null}

                        <div className="space-y-1.5">
                          <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Sidebar Brand Text</label>
                          <input
                            type="text"
                            value={adminLogoText}
                            onChange={(e) => setAdminLogoText(e.target.value)}
                            className="w-full p-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs text-zinc-900 font-sans uppercase font-bold"
                          />
                        </div>
                      </div>

                      {adminLogoType === 'image' && (
                        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">ADMIN SIDEBAR CONSOLE</span>
                              <h4 className="font-sans font-bold text-xs text-zinc-900 uppercase tracking-tight">Sidebar Logo Source</h4>
                            </div>
                            
                            {/* Segment tabs */}
                            <div className="flex p-0.5 bg-zinc-200/60 rounded-lg text-[10px] select-none font-bold">
                              <button
                                type="button"
                                onClick={() => setAdminLogoSource('vault')}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  adminLogoSource === 'vault'
                                    ? 'bg-white text-zinc-950 shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-950'
                                }`}
                              >
                                📂 Media Vault
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdminLogoSource('host')}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  adminLogoSource === 'host'
                                    ? 'bg-white text-zinc-950 shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-950'
                                }`}
                              >
                                🔗 Image Host
                              </button>
                            </div>
                          </div>

                          {adminLogoSource === 'vault' ? (
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={adminLogoVaultSearch}
                                  onChange={(e) => setAdminLogoVaultSearch(e.target.value)}
                                  className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 text-zinc-900"
                                  placeholder="Search image in Media Vault..."
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('media');
                                    setSearchTerm('');
                                  }}
                                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-white text-[10px] font-mono uppercase font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  + Upload New
                                </button>
                              </div>

                              {(() => {
                                const list = mediaItems.filter(item =>
                                  item.name.toLowerCase().includes(adminLogoVaultSearch.toLowerCase())
                                );
                                if (list.length === 0) {
                                  return (
                                    <div className="py-2 text-center text-[10px] font-mono text-zinc-400">
                                      NO ITEMS MATCHING THIS FILTER QUERY.
                                    </div>
                                  );
                                }
                                return (
                                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1 bg-white rounded-lg border border-zinc-150">
                                    {list.map((med) => {
                                      const isSelected = adminLogoImageUrl === med.url;
                                      return (
                                        <button
                                          key={med.id}
                                          type="button"
                                          onClick={() => setAdminLogoImageUrl(med.url)}
                                          className={`relative aspect-square w-full rounded-md overflow-hidden border cursor-pointer transition-all ${
                                            isSelected 
                                              ? 'border-[#d97706] ring-2 ring-amber-500/30' 
                                              : 'border-zinc-200 hover:border-zinc-400'
                                          }`}
                                          title={`${med.name} (${med.size})`}
                                        >
                                          <img src={med.url} alt={med.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                          {isSelected && (
                                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                              <span className="text-[9px] bg-[#d97706] text-white px-1.5 py-0.5 rounded-full font-sans font-black">✓</span>
                                            </div>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={adminLogoImageUrl}
                                onChange={(e) => setAdminLogoImageUrl(e.target.value)}
                                className="w-full p-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-mono text-zinc-900"
                                placeholder="Image URL..."
                              />
                              <div className="grid grid-cols-5 gap-1.5 pt-1">
                                {[
                                  { name: 'Minimal Shield', url: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=128&h=128&q=80' },
                                  { name: 'Abstract Signet', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&h=128&q=80' },
                                  { name: 'Monochrome Crest', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=128&h=128&q=80' },
                                  { name: 'Geometric Emblem', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699552e?auto=format&fit=crop&w=128&h=128&q=80' },
                                  { name: 'Abstract Canvas', url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=128&h=128&q=80' }
                                ].map((preset) => (
                                  <button
                                    key={preset.name}
                                    type="button"
                                    onClick={() => setAdminLogoImageUrl(preset.url)}
                                    className={`group relative h-8 w-full rounded-lg overflow-hidden border cursor-pointer transition-all ${
                                      adminLogoImageUrl === preset.url ? 'border-zinc-950 ring-1 ring-zinc-950 scale-[1.03]' : 'border-zinc-200 hover:border-zinc-400'
                                    }`}
                                    title={preset.name}
                                  >
                                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* SEPARATED STOREFRONT LOGO CUSTOMIZATION */}
                      <div className="border-t border-zinc-150 pt-5 mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse"></span>
                            <h4 className="font-sans font-bold text-[10px] text-amber-600 uppercase tracking-widest">Storefront Header Logo</h4>
                          </div>

                          {/* Segment tabs */}
                          <div className="flex p-0.5 bg-zinc-200/60 rounded-lg text-[10px] select-none font-bold">
                            <button
                              type="button"
                              onClick={() => setFrontendLogoSource('vault')}
                              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                frontendLogoSource === 'vault'
                                  ? 'bg-white text-zinc-950 shadow-xs'
                                  : 'text-zinc-500 hover:text-zinc-950'
                              }`}
                            >
                              📂 Media Vault
                            </button>
                            <button
                              type="button"
                              onClick={() => setFrontendLogoSource('host')}
                              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                frontendLogoSource === 'host'
                                  ? 'bg-white text-zinc-950 shadow-xs'
                                  : 'text-zinc-500 hover:text-zinc-950'
                              }`}
                            >
                              🔗 Image Host
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4 shadow-3xs">
                          {/* Logo Display Mode Selector */}
                          <div className="space-y-1.5">
                            <label className="font-sans font-bold text-[9px] text-zinc-505 block uppercase tracking-wider">Logo Display Format</label>
                            <div className="grid grid-cols-2 gap-2 bg-zinc-200/50 p-1 rounded-xl border border-zinc-250">
                              <button
                                type="button"
                                onClick={() => setFrontendLogoMode('classic')}
                                className={`py-1.5 text-[10px] font-sans font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                  frontendLogoMode === 'classic'
                                    ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                                    : 'text-zinc-550 hover:text-zinc-955'
                                }`}
                              >
                                🏢 Classic Text & Emblem
                              </button>
                              <button
                                type="button"
                                onClick={() => setFrontendLogoMode('image_only')}
                                className={`py-1.5 text-[10px] font-sans font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                  frontendLogoMode === 'image_only'
                                    ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                                    : 'text-zinc-550 hover:text-zinc-955'
                                }`}
                              >
                                🖼️ Full Logo Image Only
                              </button>
                            </div>
                            <span className="text-[9px] text-zinc-400 font-mono block">
                              {frontendLogoMode === 'image_only' 
                                ? 'ℹ️ Brand Logo Name Text & Brand Established Caption are hidden in the Frontend Storefront Header, but are fully editable in Admin.' 
                                : 'Standard emblem icon alongside Brand Text and Established metadata.'}
                            </span>
                          </div>

                          {/* Logo Size Selector */}
                          <div className="space-y-1.5 border-t border-zinc-150/50 pt-3">
                            <div className="flex items-center justify-between">
                              <label className="font-sans font-bold text-[9px] text-zinc-500 block uppercase tracking-wider">Frontend Logo Sizing Scale</label>
                              <span className="text-[9px] font-mono font-bold text-[#d97706] bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded uppercase">Size: {frontendLogoSize}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 bg-zinc-200/50 p-1 rounded-xl border border-zinc-250">
                              {(['M', 'L', 'XL', 'XXL'] as const).map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => {
                                    setFrontendLogoSize(sz);
                                    localStorage.setItem('min_eco_frontend_logo_size', sz);
                                  }}
                                  className={`py-1 text-[10px] font-mono font-black rounded-lg transition-all cursor-pointer ${
                                    frontendLogoSize === sz
                                      ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                                      : 'text-zinc-550 hover:text-zinc-955'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                            <span className="text-[9px] text-zinc-400 font-mono block">
                              Proportionately scale your Brand Emblem, Name Text, and Established caption sizes for Storefront view.
                            </span>
                          </div>

                          <div className="border-t border-zinc-150/50 pt-3">
                            {frontendLogoSource === 'vault' ? (
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={frontendLogoVaultSearch}
                                    onChange={(e) => setFrontendLogoVaultSearch(e.target.value)}
                                    className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-950 text-zinc-900"
                                    placeholder="Search image in Media Vault..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTab('media');
                                      setSearchTerm('');
                                    }}
                                    className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-850 text-white text-[10px] font-mono uppercase font-bold rounded-lg transition-colors cursor-pointer"
                                    title="Go to Media Library context to upload new assets"
                                  >
                                    + Upload New
                                  </button>
                                </div>

                                {/* Thumbnails grid */}
                                {(() => {
                                  const list = mediaItems.filter(item =>
                                    item.name.toLowerCase().includes(frontendLogoVaultSearch.toLowerCase())
                                  );
                                  if (list.length === 0) {
                                    return (
                                      <div className="py-2 text-center text-[10px] font-mono text-zinc-400">
                                        NO ITEMS MATCHING THIS FILTER QUERY.
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1 bg-white rounded-lg border border-zinc-150">
                                      {list.map((med) => {
                                        const isSelected = frontendLogoImageUrl === med.url;
                                        return (
                                          <button
                                            key={med.id}
                                            type="button"
                                            onClick={() => setFrontendLogoImageUrl(med.url)}
                                            className={`relative aspect-square w-full rounded-md overflow-hidden border cursor-pointer transition-all ${
                                              isSelected 
                                                ? 'border-[#d97706] ring-2 ring-amber-500/30' 
                                                : 'border-zinc-200 hover:border-zinc-400'
                                            }`}
                                            title={`${med.name} (${med.size})`}
                                          >
                                            <img src={med.url} alt={med.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            {isSelected && (
                                              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                                <span className="text-[9px] bg-[#d97706] text-white px-1.5 py-0.5 rounded-full font-sans font-black">✓</span>
                                              </div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                                
                                <div className="text-[9.5px] font-mono text-zinc-400 truncate">
                                  Selected Location: <span className="text-zinc-700">{frontendLogoImageUrl}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3.5">
                                <div className="space-y-1">
                                  <label className="text-[9.5px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Custom Image URL Path</label>
                                  <input
                                    type="text"
                                    value={frontendLogoImageUrl}
                                    onChange={(e) => setFrontendLogoImageUrl(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 text-xs font-mono text-zinc-950"
                                    placeholder="Paste custom image link (e.g., Imgur, S3, Unsplash)..."
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="font-sans font-bold text-[9px] text-[#71717a] block uppercase tracking-wider">Predefined Presets</label>
                                  <div className="grid grid-cols-5 gap-1.5">
                                    {[
                                      { name: 'Minimal Shield', url: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=128&h=128&q=80' },
                                      { name: 'Abstract Signet', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&h=128&q=80' },
                                      { name: 'Monochrome Crest', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=128&h=128&q=80' },
                                      { name: 'Geometric Emblem', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699552e?auto=format&fit=crop&w=128&h=128&q=80' },
                                      { name: 'Abstract Canvas', url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=128&h=128&q=80' }
                                    ].map((preset) => (
                                      <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => setFrontendLogoImageUrl(preset.url)}
                                        className={`group relative h-8 w-full rounded-lg overflow-hidden border cursor-pointer transition-all ${
                                          frontendLogoImageUrl === preset.url ? 'border-zinc-955 ring-1 ring-zinc-955 scale-[1.03]' : 'border-zinc-200 hover:border-[#18181b]'
                                        }`}
                                        title={preset.name}
                                      >
                                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {adminLogoType === 'image' && adminLogoImageUrl ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={adminLogoImageUrl} 
                                alt="preview-emblem" 
                                className="h-6 max-h-6 max-w-[80px] object-contain rounded-none animate-fade-in"
                                referrerPolicy="no-referrer"
                              />
                              <span className="font-sans font-black tracking-tight text-zinc-950 text-xs uppercase">{adminLogoText || 'GOLDIAMA.'}</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-6 h-6 bg-zinc-950 rounded flex items-center justify-center text-white text-[11px] font-mono font-bold uppercase">{adminLogoLetter || 'N'}</div>
                              <span className="font-sans font-black tracking-tight text-zinc-950 text-sm uppercase">{adminLogoText || 'NORDIC.'}</span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">SIDEBAR PREVIEW</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Menu Re-arrangement code */}
                <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 space-y-4">
                  <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <Layers className="w-4 h-4 text-zinc-500" />
                    Navigation Menu Arrangement
                  </h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                    Rearrange the sidebar primary console groups. Changes are bound immediately to your active workspace layout flow:
                  </p>

                  <div className="space-y-2">
                    {sidebarGroups.map((groupKey, index) => {
                      const label = 
                        groupKey === 'core' ? 'Core Console' :
                        groupKey === 'design' ? 'Store Design & Layout' :
                        groupKey === 'kyc' ? 'KYC Onboarding Queue' :
                        groupKey === 'commerce' ? 'Commerce Operations' :
                        'System Settings';
                      
                      return (
                        <div key={groupKey} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                          <span className="text-xs font-sans font-medium text-zinc-850 flex items-center gap-2">
                            <span className="font-mono text-[10px] text-zinc-400">0{index + 1}</span>
                            {label}
                          </span>
                          <div className="flex gap-1">
                            <button
                              disabled={index === 0}
                              onClick={() => {
                                const copy = [...sidebarGroups];
                                const temp = copy[index];
                                copy[index] = copy[index - 1];
                                copy[index - 1] = temp;
                                setSidebarGroups(copy);
                              }}
                              className={`p-1 border border-zinc-200 bg-white rounded hover:bg-zinc-100 hover:border-zinc-950 transition-all cursor-pointer ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                              title="Move Group Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={index === sidebarGroups.length - 1}
                              onClick={() => {
                                const copy = [...sidebarGroups];
                                const temp = copy[index];
                                copy[index] = copy[index + 1];
                                copy[index + 1] = temp;
                                setSidebarGroups(copy);
                              }}
                              className={`p-1 border border-zinc-200 bg-white rounded hover:bg-zinc-100 hover:border-zinc-950 transition-all cursor-pointer ${index === sidebarGroups.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                              title="Move Group Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* GRAND CARD DESIGN: Header Style Preset & Navigation Studio */}
            {settingsSubTab === 'customisation' && (
              <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 space-y-6">
                <div>
                  <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <Layout className="w-4 h-4 text-zinc-500" />
                    Header Customisation & Navigation Studio
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono mt-1">CONFIGURE ACCENT THEMES, TOP NAVIGATION PILLS, AND COMPLEX INTERACTIVE MEGA MENUS IN REAL TIME</p>
                </div>

                {/* 1. Header Style Choice */}
                <div className="space-y-3">
                  <label className="font-sans font-bold text-[10px] text-zinc-500 uppercase tracking-widest block">Header Layout Preset</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option Minimalist Classic */}
                    <button
                      type="button"
                      onClick={() => setHeaderStyle('minimal')}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        headerStyle === 'minimal'
                          ? 'border-zinc-950 bg-zinc-50/55 shadow-xs ring-1 ring-zinc-950'
                          : 'border-zinc-200 hover:border-zinc-400 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-bold text-xs text-zinc-900">Minimal Classic Single-Row</span>
                        {headerStyle === 'minimal' && <span className="text-[9px] bg-zinc-950 text-white font-mono px-1.5 py-0.5 rounded font-bold uppercase">Active</span>}
                      </div>
                      <p className="mt-1.5 text-[11px] text-zinc-500 font-sans leading-relaxed">
                        Clean typography-oriented top bar with branding emblem left, standard navigation links, Operator Panel & cart on right.
                      </p>
                    </button>

                    {/* Option Goldiama Luxurious Bold */}
                    <button
                      type="button"
                      onClick={() => setHeaderStyle('goldiama')}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        headerStyle === 'goldiama'
                          ? 'border-zinc-950 bg-zinc-50/55 shadow-xs ring-1 ring-zinc-950'
                          : 'border-zinc-200 hover:border-zinc-400 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-bold text-xs text-zinc-900">Goldiama Premium Double-Row</span>
                        {headerStyle === 'goldiama' && <span className="text-[9px] bg-zinc-950 text-white font-mono px-1.5 py-0.5 rounded font-bold uppercase">Active</span>}
                      </div>
                      <p className="mt-1.5 text-[11px] text-zinc-500 font-sans leading-relaxed">
                        Dual-row branding design. Top row sports signature logo on left + custom round compliance/contact buttons on right. Bottom row hosts centered premium mega menu triggers. (Perfect fit for Goldiama since 2001 layout!)
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Menu Items Management Table */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <span className="font-sans font-bold text-[10px] text-zinc-500 uppercase tracking-widest block">Active Navigation Hierarchy</span>
                    {!isAddingItem && !editingItem && (
                      <button
                        type="button"
                        onClick={startAddNavItem}
                        className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer font-bold uppercase font-sans tracking-wide transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add Menu Item
                      </button>
                    )}
                  </div>

                  {/* Navigation nodes layout */}
                  <div className="space-y-2">
                    {navigationMenu.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-[#FAF9F9] border border-zinc-200 rounded-xl hover:border-zinc-400 transition-all"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                            0{index + 1}
                          </span>
                          <span className="font-sans font-black text-xs text-[#18181b] uppercase tracking-tight">{item.label}</span>
                          <span className="font-mono text-[9px] text-zinc-400">{item.href}</span>
                          {item.isMegaMenu ? (
                            <span className="text-[8px] font-bold uppercase tracking-widest font-sans bg-amber-500/10 text-amber-800 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1 animate-pulse">
                              ✨ Mega Menu Active ({item.megaMenu?.links.length || 0} links)
                            </span>
                          ) : (
                            <span className="text-[8px] font-semibold uppercase font-sans bg-zinc-200/50 text-zinc-600 px-2 py-0.5 rounded-full">
                              📄 Direct Anchor
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 md:mt-0">
                          {/* Control triggers to shift order */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const copy = [...navigationMenu];
                              const temp = copy[index];
                              copy[index] = copy[index - 1];
                              copy[index - 1] = temp;
                              setNavigationMenu(copy);
                            }}
                            className={`p-1 bg-white border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 rounded transition-all cursor-pointer ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-950" />
                          </button>
                          <button
                            type="button"
                            disabled={index === navigationMenu.length - 1}
                            onClick={() => {
                              const copy = [...navigationMenu];
                              const temp = copy[index];
                              copy[index] = copy[index + 1];
                              copy[index + 1] = temp;
                              setNavigationMenu(copy);
                            }}
                            className={`p-1 bg-white border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 rounded transition-all cursor-pointer ${index === navigationMenu.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-950" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditNavItem(item)}
                            className="px-2 py-1 text-[10px] font-sans font-bold bg-white hover:bg-zinc-955 hover:text-zinc-950 hover:bg-zinc-100 transition-all cursor-pointer rounded border border-zinc-300 flex items-center gap-1 text-zinc-800"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteNavItem(item.id)}
                            className="p-1 border border-red-150 text-red-500 hover:bg-red-50 hover:text-red-700 rounded cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. In-line Editor for custom menu customisation */}
                {(isAddingItem || editingItem) && (
                  <div className="p-5 border border-zinc-950 bg-zinc-50 rounded-xl space-y-4 animate-fade-in shadow-xs">
                    <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                      <span className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                        {editingItem ? <Edit className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {editingItem ? `Editing Navigation Node: ${editingItem.label}` : 'Architecting New Navigation Node'}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setEditingItem(null); setIsAddingItem(false); }}
                        className="text-zinc-400 hover:text-zinc-950"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Editing panel input grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase tracking-widest">Link Label / Display Name</label>
                        <input
                          type="text"
                          placeholder="e.g. GOLD"
                          value={newNavLabel}
                          onChange={(e) => setNewNavLabel(e.target.value)}
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-xs font-sans font-bold uppercase transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase tracking-widest">Anchor Link Target</label>
                        <input
                          type="text"
                          placeholder="e.g. #gold"
                          value={newNavHref}
                          onChange={(e) => setNewNavHref(e.target.value)}
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-xs font-mono transition-all"
                        />
                      </div>
                    </div>

                    {/* Is Mega Menu toggle */}
                    <div className="space-y-2 pt-2">
                      <label className="font-sans font-bold text-[9px] text-zinc-400 uppercase tracking-widest block font-bold">Menu Mode Type</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewNavIsMega(false)}
                          className={`flex-1 py-2 text-xs font-sans font-bold rounded-lg border cursor-pointer transition-all ${
                            !newNavIsMega
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                              : 'text-zinc-500 border-zinc-200 bg-white hover:text-zinc-950'
                          }`}
                        >
                          📄 Standard Non-expandable Anchor Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewNavIsMega(true)}
                          className={`flex-1 py-2 text-xs font-sans font-bold rounded-lg border cursor-pointer transition-all ${
                            newNavIsMega
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                              : 'text-zinc-550 border-zinc-200 bg-white hover:text-zinc-950'
                          }`}
                        >
                          ✨ Full-Width Interactive Mega Menu Column
                        </button>
                      </div>
                    </div>

                    {/* 4. MEGA MENU SPECIFIC DETAILS FORM */}
                    {newNavIsMega && (
                      <div className="space-y-4 pt-4 border-t border-zinc-200 animate-fade-in">
                        <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-4">
                          <span className="text-[10px] font-mono tracking-widest font-semibold text-zinc-400 uppercase block">MEGA MENU RICH CONTENT SETUP</span>
                          
                          <div className="space-y-1.5">
                            <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase tracking-widest">Mega Menu Slogan / Text Proclamation (Left Banner Column)</label>
                            <input
                              type="text"
                              placeholder="e.g. LEADING WITH TRANSPARENCY IN THE GLOBAL GOLD INDUSTRY."
                              value={newNavBannerTitle}
                              onChange={(e) => setNewNavBannerTitle(e.target.value)}
                              className="w-full p-2.5 bg-zinc-50/20 border border-zinc-200 rounded-lg outline-none focus:border-zinc-955 text-xs font-sans font-medium text-zinc-900"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase tracking-widest">Showcase Landscape Image URL (Right Column)</label>
                              <input
                                  type="text"
                                  placeholder="Image unsplash link..."
                                  value={newNavImageUrl}
                                  onChange={(e) => setNewNavImageUrl(e.target.value)}
                                  className="w-full p-2.5 bg-zinc-50/20 border border-zinc-200 rounded-lg outline-none focus:border-zinc-955 text-xs font-mono text-zinc-900"
                              />

                              {/* Quick selection items */}
                              <div className="flex gap-1.5 pt-1 overflow-x-auto pb-1">
                                {[
                                  { label: '🥇 Stacked Gold', url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&h=300&q=80' },
                                  { label: '🥈 Stacked Silver', url: 'https://images.unsplash.com/photo-1605557202138-097824c3f9f4?auto=format&fit=crop&w=400&h=300&q=80' },
                                  { label: '💎 Sparkle Diamond', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&h=300&q=80' },
                                  { label: '💍 Bespoke Couture', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&h=300&q=80' }
                                ].map(pres => (
                                  <button
                                    key={pres.label}
                                    type="button"
                                    onClick={() => setNewNavImageUrl(pres.url)}
                                    className="text-[9px] font-sans font-semibold bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded text-zinc-650 cursor-pointer whitespace-nowrap"
                                  >
                                    {pres.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase tracking-widest">Showcase Image Text Caption Overlay</label>
                              <input
                                type="text"
                                placeholder="e.g. PUREST STANDARDS, FINEST GOLD"
                                value={newNavImageTitle}
                                onChange={(e) => setNewNavImageTitle(e.target.value)}
                                className="w-full p-2.5 bg-zinc-50/20 border border-zinc-200 rounded-lg outline-none focus:border-zinc-955 text-xs font-sans text-zinc-900"
                              />
                            </div>
                          </div>

                          {/* Sub links lists inside mega menu */}
                          <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                            <label className="font-sans font-bold text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Column Sub-Items Catalog List</label>
                            
                            {newNavLinksRaw.length === 0 ? (
                              <p className="text-[11px] text-zinc-400 font-mono italic">No items are nested in this mega menu. Add one below!</p>
                            ) : (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {newNavLinksRaw.map((lnk, idx) => (
                                  <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-sans transition-all ${editingSubIndex === idx ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100' : 'bg-zinc-100 border-zinc-200'}`}>
                                    <span className="font-semibold text-zinc-900">{lnk.label}</span>
                                    <span className="font-mono text-[9px] text-zinc-450">({lnk.href})</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSubIndex(idx);
                                        setTempSubLabel(lnk.label);
                                        setTempSubHref(lnk.href);
                                      }}
                                      className="text-amber-600 hover:text-amber-800 font-bold ml-1.5 cursor-pointer text-[10px] uppercase font-mono"
                                      title="Edit sub-link information"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeSubLink(idx)}
                                      className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer text-sm"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Forms to insert column items */}
                            <div className="flex flex-col gap-3 bg-zinc-50 p-4 rounded-lg border border-zinc-200 text-left">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <span className="text-[9px] text-[#18181b] font-mono font-bold block uppercase mb-1">Sub Item Name</span>
                                  <input
                                    type="text"
                                    placeholder="e.g. Cast Gold Bars"
                                    value={tempSubLabel}
                                    onChange={(e) => setTempSubLabel(e.target.value)}
                                    className="w-full p-2 border border-zinc-200 rounded bg-white text-xs text-zinc-900 outline-none focus:border-zinc-500 font-medium"
                                  />
                                </div>
                                <div>
                                  <span className="text-[9px] text-[#18181b] font-mono font-bold block uppercase mb-1">Active Directory Page</span>
                                  <select
                                    value={pagesList.some(p => p.slug === tempSubHref) ? tempSubHref : 'custom'}
                                    onChange={(e) => {
                                      if (e.target.value !== 'custom') {
                                        setTempSubHref(e.target.value);
                                      }
                                    }}
                                    className="w-full p-2 border border-zinc-200 rounded bg-white text-xs text-zinc-900 outline-none font-bold"
                                  >
                                    <option value="custom">-- Custom Anchor/Href --</option>
                                    {pagesList.map((pg) => (
                                      <option key={pg.id} value={pg.slug}>
                                        📄 {pg.title} ({pg.slug})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <span className="text-[9px] text-[#18181b] font-mono font-bold block uppercase mb-1">HREF / Target</span>
                                  <input
                                    type="text"
                                    placeholder="e.g. #cast"
                                    value={tempSubHref}
                                    onChange={(e) => setTempSubHref(e.target.value)}
                                    className="w-full p-2 border border-zinc-200 rounded bg-white text-xs text-zinc-900 outline-none focus:border-zinc-500 font-mono"
                                  />
                                </div>
                              </div>
                              {editingSubIndex !== null ? (
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={addSubLink}
                                    className="flex-1 py-2 bg-[#d97706] hover:bg-[#b45309] text-white rounded text-xs font-bold uppercase transition-all cursor-pointer text-center block"
                                  >
                                    Save Sub-Item Changes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSubIndex(null);
                                      setTempSubLabel('');
                                      setTempSubHref('');
                                    }}
                                    className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded text-xs font-bold uppercase transition-all cursor-pointer text-center block"
                                  >
                                    Cancel Edit
                                  </button>
                                </div>
                              ) : (
                                  <button
                                    type="button"
                                    onClick={addSubLink}
                                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded text-xs font-bold uppercase transition-all cursor-pointer text-center block shrink-0"
                                  >
                                    + Insert Nested Sub-Item
                                  </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Editor Form Bottom Submission */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
                      <button
                        type="button"
                        onClick={() => { setEditingItem(null); setIsAddingItem(false); }}
                        className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 font-sans font-semibold text-[11px] rounded-lg transition-all text-zinc-500 cursor-pointer uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveNavItem}
                        className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-sans font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1.5 uppercase"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save Node Configuration
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 2: PROFILE USER SETTINGS */}
            {settingsSubTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                {/* Curator Profile Settings */}
                <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 space-y-6">
                  <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <Users className="w-4 h-4 text-zinc-500" />
                    Curator Profile Settings
                  </h3>
                  
                  <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <div className="w-12 h-12 rounded-full bg-zinc-950 text-white font-mono flex items-center justify-center font-bold text-sm tracking-wide shadow-inner">
                      {profileInitials}
                    </div>
                    <div>
                      <div className="font-sans font-bold text-zinc-950 text-sm leading-none">{profileName}</div>
                      <div className="text-xs text-zinc-500 font-mono pt-1">{profileRole}</div>
                      <div className="text-[10px] text-zinc-400 font-mono tracking-tight pt-0.5">{profileEmail}</div>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-[10px] text-zinc-500 uppercase">Administrator Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => {
                            setProfileName(e.target.value);
                            const words = e.target.value.trim().split(' ');
                            if (words.length > 1 && words[0] && words[1]) {
                              setProfileInitials((words[0][0] + words[1][0]).toUpperCase());
                            } else if (words[0]) {
                              setProfileInitials(words[0][0].toUpperCase());
                            }
                          }}
                          className="w-full p-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-[10px] text-zinc-500 uppercase">Interactive Initials</label>
                        <input
                          type="text"
                          maxLength={3}
                          value={profileInitials}
                          onChange={(e) => setProfileInitials(e.target.value.toUpperCase())}
                          className="w-full p-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-955 font-mono text-center tracking-wider"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-[10px] text-zinc-500 uppercase">Designation / Role</label>
                        <input
                          type="text"
                          value={profileRole}
                          onChange={(e) => setProfileRole(e.target.value)}
                          className="w-full p-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-955"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-[10px] text-zinc-500 uppercase">Secure Email Anchor</label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full p-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-955 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAllChanges}
                      className="w-full bg-zinc-955 hover:bg-zinc-800 text-white font-mono font-bold py-2.5 rounded-xl text-xs cursor-pointer uppercase tracking-widest"
                    >
                      SECURE PROFILE SPECS
                    </button>
                  </div>
                </div>

                {/* Password Management */}
                <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 space-y-4">
                  <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-2">
                    <Lock className="w-4 h-4 text-zinc-500" />
                    Modify Console Password
                  </h3>
                  
                  <div className="space-y-3 text-xs font-sans">
                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase">Current Admin Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-955 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-[10px] text-zinc-500 uppercase">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 chars"
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-955 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-[10px] text-zinc-500 uppercase">Verify Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-955 font-mono"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPassword || !confirmPassword) {
                          alert("Please fill out both password fields!");
                          return;
                        }
                        if (newPassword !== confirmPassword) {
                          alert("New passwords do not match!");
                          return;
                        }
                        alert("Cryptographic access keys fully updated across database clusters!");
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="w-full bg-zinc-900 hover:bg-zinc-850 text-white font-mono font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                    >
                      APPLY CRYPTOGRAPHIC HASH UPDATES
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 3: NOTIFICATIONS */}
            {settingsSubTab === 'notifications' && (
              <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 max-w-3xl animate-fade-in space-y-6">
                <div>
                  <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <Bell className="w-4 h-4 text-zinc-500" />
                    Channel & Event Notifications
                  </h3>
                  <p className="text-zinc-500 text-[11px] font-sans pt-1">Configure event triggers, audio feedback and system notification channels:</p>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors">
                    <div>
                      <div className="font-bold text-zinc-900">Inbound Retail Order Alerts</div>
                      <div className="text-[10px] text-zinc-400">Trigger audio alerts and database metrics on successful checkouts.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyOrders}
                      onChange={(e) => setNotifyOrders(e.target.checked)}
                      className="w-4 h-4 cursor-pointer accent-zinc-950"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors">
                    <div>
                      <div className="font-bold text-zinc-900">KYC Verification Submissions</div>
                      <div className="text-[10px] text-zinc-400">Dispatch compliance emails upon submission of documents.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyKyc}
                      onChange={(e) => setNotifyKyc(e.target.checked)}
                      className="w-4 h-4 cursor-pointer accent-zinc-950"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors">
                    <div>
                      <div className="font-bold text-zinc-900">Low Stock Safeguard Warnings</div>
                      <div className="text-[10px] text-zinc-400">Notify the admin instantly when items hold less than 5 units.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyStock}
                      onChange={(e) => setNotifyStock(e.target.checked)}
                      className="w-4 h-4 cursor-pointer accent-zinc-950"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 4: API INTEGRATION */}
            {settingsSubTab === 'api-integration' && (
              <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 max-w-3xl animate-fade-in space-y-6 text-left">
                <div>
                  <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <Database className="w-4 h-4 text-zinc-500 shrink-0" />
                    Gold & Silver Market Rate API Integration
                  </h3>
                  <p className="text-zinc-500 text-[11px] font-sans pt-1">
                    Configure the active API feed provider and secret credentials to fetch real-time precious metal pricing charts across the Admin Cockpit:
                  </p>
                </div>

                <div className="space-y-5 font-sans text-xs">
                  {/* Select Provider */}
                  <div className="space-y-1.5 thermal-tabs">
                    <label className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider block">API Feed Provider</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                      {[
                        { id: 'demo', name: 'Simulated Feed', desc: 'Secure high-quality ticker' },
                        { id: 'goldapi', name: 'GoldAPI.io', desc: 'Professional Gold/Silver JSON API' },
                        { id: 'metalpriceapi', name: 'MetalpriceAPI.com', desc: 'Consolidated rates provider' }
                      ].map((prov) => (
                        <button
                          key={prov.id}
                          type="button"
                          onClick={() => {
                            setApiProvider(prov.id as any);
                            localStorage.setItem('min_eco_metal_api_provider', prov.id);
                          }}
                          className={`py-2 text-[10px] font-sans rounded-lg transition-all cursor-pointer text-left px-3 ${
                            apiProvider === prov.id
                              ? 'bg-white text-zinc-950 shadow-xs font-bold border border-zinc-200'
                              : 'text-zinc-550 hover:text-zinc-950 hover:bg-zinc-50/50'
                          }`}
                        >
                          <span className="block font-semibold">{prov.name}</span>
                          <span className="block text-[8px] text-zinc-400 font-mono font-normal mt-0.5 leading-none">{prov.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {apiProvider !== 'demo' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* API Key input */}
                      <div className="space-y-1">
                        <label className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider block">API Access Token / Key</label>
                        <div className="relative">
                          <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => {
                              setApiKey(e.target.value);
                              localStorage.setItem('min_eco_metal_api_key', e.target.value);
                            }}
                            placeholder={
                              apiProvider === 'goldapi' 
                                ? 'e.g. goldapi-123456789abcdef-io' 
                                : 'e.g. mpa_abc123xyz789_sec'
                            }
                            className="w-full pl-8 pr-3 py-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 font-mono text-xs text-zinc-805"
                          />
                          <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-3" />
                        </div>
                        <p className="text-[9.5px] text-zinc-400 font-mono mt-1">
                          {apiProvider === 'goldapi' ? (
                            <span>
                              🔑 Obtain a free or premium access token from{' '}
                              <a 
                                href="https://www.goldapi.io" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-amber-650 hover:underline font-bold"
                              >
                                goldapi.io
                              </a>. Generous daily quota details.
                            </span>
                          ) : (
                            <span>
                              🔑 Register of keys at{' '}
                              <a 
                                href="https://metalpriceapi.com" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-amber-655 hover:underline font-bold"
                              >
                                metalpriceapi.com
                              </a>. Base currency parameters applied.
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 text-[10px] text-zinc-500 space-y-1 font-mono">
                        <div className="font-bold flex items-center gap-1.5 text-zinc-800 select-none uppercase">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Security Integrity Safeguard
                        </div>
                        <p className="">Your credentials are fully persisted locally inside your browser's workspace storage and never shared or sent to any secondary database.</p>
                      </div>
                    </div>
                  )}

                  {/* Options: Default Display Currency and weight unit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-100 pt-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider block">Default Market Currency</label>
                      <select
                        value={metalCurrency}
                        onChange={(e) => {
                          const val = e.target.value as 'USD' | 'EUR' | 'GBP';
                          setMetalCurrency(val);
                          localStorage.setItem('min_eco_metal_currency', val);
                        }}
                        className="w-full p-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none text-xs text-zinc-800 font-sans"
                      >
                        <option value="USD">USD ($) - United States Dollar (Default)</option>
                        <option value="EUR">EUR (€) - European Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider block">Default Measurement Weight Unit</label>
                      <select
                        value={metalUnit}
                        onChange={(e) => {
                          const val = e.target.value as 'ounce' | 'gram';
                          setMetalUnit(val);
                          localStorage.setItem('min_eco_metal_unit', val);
                        }}
                        className="w-full p-2.5 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none text-xs text-zinc-800 font-sans"
                      >
                        <option value="ounce">Ounce (oz t) - Standard Troy Ounce (Default)</option>
                        <option value="gram">Gram (g) - Metric Gram Weight</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await triggerPriceFetch();
                        alert("API rates synchronized successfully. Correct indices applied live!");
                      }}
                      disabled={priceFetchLoading}
                      className="w-full bg-zinc-950 hover:bg-zinc-850 disabled:opacity-55 text-white font-mono font-bold py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${priceFetchLoading ? 'animate-spin' : ''}`} />
                      {priceFetchLoading ? 'CONNECTING ENDPOINTS...' : 'SAVE & MANUALLY SYNC INDEX'}
                    </button>
                  </div>

                  {priceFetchError && (
                    <div className="p-3 bg-red-50 border border-red-150 text-red-650 rounded-xl text-[10px] font-mono animate-fade-in">
                      ⚠️ Operational Sync Warning: {priceFetchError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-Tab: SUPABASE CONFIGURATION */}
            {settingsSubTab === 'supabase' && (
              <div className="bg-white border border-zinc-200 p-6 rounded-xl hover:border-zinc-950 transition-all duration-350 max-w-3xl animate-fade-in space-y-6 text-left">
                <div>
                  <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <Database className="w-4 h-4 text-zinc-500 shrink-0" />
                    Supabase Cloud Sync Engine Setup
                  </h3>
                  <p className="text-zinc-500 text-[11px] font-sans pt-1">
                    Integrate serverless file storage bucket and relational Postgres REST API to drive production content delivery:
                  </p>
                </div>

                {/* Live Connection Diagnostics Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Indicator Card */}
                  <div className="p-4 bg-zinc-50 border border-zinc-250/80 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Live Connection Status</span>
                      <div className="flex items-center gap-2">
                        {/* Heartbeat pulse circles */}
                        {supabaseConnectionStatus === 'testing' && (
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                          </span>
                        )}
                        {supabaseConnectionStatus === 'connected' && (
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                        )}
                        {supabaseConnectionStatus === 'error' && (
                          <span className="flex h-3 w-3 relative">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                          </span>
                        )}
                        {supabaseConnectionStatus === 'disconnected' && (
                          <span className="flex h-3 w-3 relative">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-400"></span>
                          </span>
                        )}
                        
                        <span className="font-mono text-xs font-black uppercase text-zinc-900">
                          {supabaseConnectionStatus === 'testing' && 'Handshaking...'}
                          {supabaseConnectionStatus === 'connected' && 'SUITE ACTIVE'}
                          {supabaseConnectionStatus === 'error' && 'HANDSHAKE FAILURE'}
                          {supabaseConnectionStatus === 'disconnected' && 'OFFLINE'}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-zinc-450 font-mono">
                        {supabaseConnectionStatus === 'connected' && supabasePing !== null && `Speed: ${supabasePing}ms • Checked at: ${supabaseLastCheckTime || 'N/A'}`}
                        {supabaseConnectionStatus === 'testing' && 'Establishing SSL websocket channels...'}
                        {supabaseConnectionStatus === 'error' && 'Check API endpoint permissions/keys.'}
                        {supabaseConnectionStatus === 'disconnected' && 'Idle. Manual verification recommended.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => verifySupabaseConnection(true)}
                      className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 rounded-xl font-mono text-[10px] font-bold tracking-wider uppercase cursor-pointer"
                    >
                      Ping REST
                    </button>
                  </div>

                  {/* Schema Context Card */}
                  <div className="p-4 bg-zinc-50 border border-zinc-250/80 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Storage Sync context</span>
                    <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-zinc-850">
                      <span>Bucket Name: {supabaseBucketName || 'Unspecified'}</span>
                    </div>
                    <p className="text-[9.5px] text-zinc-500 font-mono">
                      Schema: "{supabaseDatabaseSchema}"
                    </p>
                    <p className="text-[9px] text-zinc-400 font-sans">
                      Drives media file sync queries & product asset uploads seamlessly.
                    </p>
                  </div>
                </div>

                {/* Cache Operations Control Box */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 text-left animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19" />
                      </svg>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Global Cache Management</span>
                      <h4 className="text-xs font-sans font-bold text-zinc-900">Synchronize Cloud State & Force Cache Purge</h4>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                    Clears client-side browser cache and forcibly triggers a complete, fresh pull of products, collections, page customisation options, typography, and menus directly from the Supabase Postgres master database.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Purge client-side cached layouts, styles, and catalogs, and refetch raw states fresh from Supabase?")) {
                          const keysPreserved = [
                            'min_eco_supabase_url',
                            'min_eco_supabase_anon_key',
                            'min_eco_supabase_service_role_key',
                            'min_eco_supabase_bucket_name',
                            'min_eco_supabase_database_schema',
                            'min_eco_admin_login'
                          ];
                          let count = 0;
                          for (let i = localStorage.length - 1; i >= 0; i--) {
                            const key = localStorage.key(i);
                            if (key && key.startsWith('min_eco_') && !keysPreserved.includes(key)) {
                              localStorage.removeItem(key);
                              count++;
                            }
                          }
                          alert("Cache cleared successfully! Re-initializing secure catalog channel...");
                          window.location.reload();
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#b45309] font-mono text-[9px] font-bold tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      🔄 Clear Cache & Fetch Fresh
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Wipe all Supabase connection endpoints and local customisation cache to start from scratch?")) {
                          let cleared = 0;
                          for (let i = localStorage.length - 1; i >= 0; i--) {
                            const key = localStorage.key(i);
                            if (key && key.startsWith('min_eco_') && key !== 'min_eco_admin_login') {
                              localStorage.removeItem(key);
                              cleared++;
                            }
                          }
                          alert(`Full Client Cache & Shared Database connections wiped locally (${cleared} keys). Workspace has been reset.`);
                          window.location.reload();
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-zinc-700 font-mono text-[9px] font-semibold tracking-wider uppercase rounded-lg transition-all flex items-center justify-center cursor-pointer"
                    >
                      Wipe Full Workspace Cache
                    </button>
                  </div>
                </div>

                {/* Configuration Inputs */}
                <div className="space-y-4">
                  {/* URL */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider block">Supabase Project API URL *</label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => {
                        setSupabaseUrl(e.target.value);
                        localStorage.setItem('min_eco_supabase_url', e.target.value);
                      }}
                      placeholder="e.g. https://your-project-id.supabase.co"
                      className="w-full px-3 py-2 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 font-mono text-xs text-zinc-850"
                    />
                  </div>

                  {/* Public key */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider block">Public Anonymous API Key *</label>
                        <button
                          type="button"
                          onClick={() => setShowSupabaseKeys(p => !p)}
                          className="text-[9px] font-mono text-zinc-450 hover:text-zinc-955 font-bold focus:outline-none cursor-pointer"
                        >
                          {showSupabaseKeys ? 'HIDE' : 'SHOW'}
                        </button>
                      </div>
                      <input
                        type={showSupabaseKeys ? 'text' : 'password'}
                        value={supabaseAnonKey}
                        onChange={(e) => {
                          setSupabaseAnonKey(e.target.value);
                          localStorage.setItem('min_eco_supabase_anon_key', e.target.value);
                        }}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full px-3 py-2 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 font-mono text-xs text-zinc-850"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider block">Private Service Role API Key (Optional)</label>
                      <input
                        type={showSupabaseKeys ? 'text' : 'password'}
                        value={supabaseServiceRoleKey}
                        onChange={(e) => {
                          setSupabaseServiceRoleKey(e.target.value);
                          localStorage.setItem('min_eco_supabase_service_role_key', e.target.value);
                        }}
                        placeholder="sb_xxxx..."
                        className="w-full px-3 py-2 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 font-mono text-xs text-zinc-850"
                      />
                    </div>
                  </div>

                  {/* Bucket & Schema */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider block">Storage Bucket (For Files)</label>
                      <input
                        type="text"
                        value={supabaseBucketName}
                        onChange={(e) => {
                          setSupabaseBucketName(e.target.value);
                          localStorage.setItem('min_eco_supabase_bucket_name', e.target.value);
                        }}
                        placeholder="goldiama-bucket"
                        className="w-full px-3 py-2 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 font-mono text-xs text-zinc-850"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider block">Default Database Schema</label>
                      <input
                        type="text"
                        value={supabaseDatabaseSchema}
                        onChange={(e) => {
                          setSupabaseDatabaseSchema(e.target.value);
                          localStorage.setItem('min_eco_supabase_database_schema', e.target.value);
                        }}
                        placeholder="public"
                        className="w-full px-3 py-2 bg-[#FAF9F9] border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 font-mono text-xs text-zinc-855"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulated Console Logs Monitor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider block">💻 Supabase Connection Verification Console Output & Logs</span>
                    <button
                      type="button"
                      onClick={() => setSupabaseConsoleLogs([`[${new Date().toLocaleTimeString()}] [System] Manual logs buffer reset.`])}
                      className="text-[9px] font-mono text-zinc-400 hover:text-rose-600 transition-colors uppercase font-bold cursor-pointer"
                    >
                      CLEAR METRIC LOGS
                    </button>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl font-mono text-[10px] text-emerald-400 space-y-1 h-36 overflow-y-auto leading-relaxed shadow-inner">
                    {supabaseConsoleLogs.map((log, idx) => (
                      <div key={idx} className="whitespace-pre-wrap">
                        {log}
                      </div>
                    ))}
                    <div className="animate-pulse inline-block w-1.5 h-3 bg-emerald-400 align-middle ml-0.5" />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Purge Supabase cloud credentials from local persistent storage?")) {
                        setSupabaseUrl('');
                        setSupabaseAnonKey('');
                        setSupabaseServiceRoleKey('');
                        setSupabaseBucketName('goldiama-bucket');
                        setSupabaseDatabaseSchema('public');
                        setSupabaseConnectionStatus('disconnected');
                        setSupabasePing(null);
                        setSupabaseConsoleLogs(['[System] Credentials wiped. Interface disconnected.']);
                        localStorage.removeItem('min_eco_supabase_url');
                        localStorage.removeItem('min_eco_supabase_anon_key');
                        localStorage.removeItem('min_eco_supabase_service_role_key');
                        localStorage.removeItem('min_eco_supabase_bucket_name');
                        localStorage.removeItem('min_eco_supabase_database_schema');
                        
                        // Clear backend shared configuration
                        fetch('/api/save-supabase-config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            url: '',
                            anonKey: '',
                            serviceRoleKey: '',
                            bucketName: 'goldiama-bucket',
                            databaseSchema: 'public'
                          })
                        }).catch(err => console.error(err));

                        alert("Supabase integration credentials deleted cleanly.");
                      }
                    }}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-sans font-bold py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all text-center"
                  >
                    Wipe Credentials
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      verifySupabaseConnection(false);
                      alert("Connecting to Supabase endpoint... See live socket logs below.");
                    }}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-850 text-white font-mono font-bold py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    SAVE CREDENTIALS & RUN LIVE HARNESS
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* --- MODAL 1: ADD NEW PRODUCT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-lg border border-zinc-250 shadow-2xl p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 mb-5">
              <div>
                <h3 className="text-sm font-semibold tracking-tight uppercase font-mono text-zinc-900">Enroll New Merchandise</h3>
                <p className="text-[10px] text-zinc-400 font-mono">ENCODE ELEMENT ATTRIBUTES</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Product Name*</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Pivot Storage Mat"
                    className="w-full p-2 bg-white/50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">SKU / Code ID</label>
                  <input
                    type="text"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="e.g. MT-PIV-01"
                    className="w-full p-2 bg-white/50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full p-2 bg-white/50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-sans"
                  >
                    <option value="Workspace">Workspace</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Price ($)*</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="120.00"
                    className="w-full p-2 bg-white/50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Stock Units*</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="25"
                    className="w-full p-2 bg-white/50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Image URL</label>
                <input
                  type="url"
                  value={newProdImageUrl}
                  onChange={(e) => setNewProdImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 bg-white/50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-mono"
                />
                <p className="text-[10px] text-zinc-400 italic font-sans mt-1">Leave blank to use a high-fidelity placeholder image.</p>
              </div>

              <div className="space-y-1">
                <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Product Specifications & Description</label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Describe material specifications, dimensions, finish techniques."
                  className="w-full p-2 bg-white/50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900"
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-650 hover:bg-zinc-50 transition-all rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 transition-all rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDIT PRODUCT MODAL --- */}
      {editingProduct && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-lg border border-zinc-250 shadow-2xl p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 mb-5">
              <div>
                <h3 className="text-sm font-semibold tracking-tight uppercase font-mono text-zinc-900">Edit Product Specifications</h3>
                <p className="text-[10px] text-zinc-400 font-mono">AMEND CORE VALUES</p>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full p-2 bg-white/50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">SKU / Code ID</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full p-2 bg-white/50 border border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full p-2 bg-white/50 border border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-sans"
                  >
                    <option value="Workspace">Workspace</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-white/50 border border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-white/50 border border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Image URL</label>
                <input
                  type="url"
                  required
                  value={editingProduct.imageUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full p-2 bg-white/50 border border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-sans font-semibold text-[10px] text-zinc-500 block uppercase tracking-wider">Description & Specifications</label>
                <textarea
                  rows={4}
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 bg-white/50 border border border-zinc-200 rounded-xl outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors text-zinc-900"
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-650 hover:bg-zinc-50 transition-all rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 transition-all rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Specification Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: SECURE INVOICE DETAILS MODAL --- */}
      {selectedOrderId && selectedOrder && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-xl border border-zinc-250 shadow-2xl p-8 rounded-2xl text-xs font-sans max-h-[90vh] overflow-y-auto">
            
            {/* Header / Meta */}
            <div className="flex justify-between items-start pb-6 border-b border-zinc-100 mb-6">
              <div>
                <h3 className="text-sm font-semibold tracking-tight uppercase font-mono text-zinc-950">Invoice {selectedOrder.id}</h3>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">STATUS: {selectedOrder.status}</span>
              </div>
              <button 
                onClick={() => setSelectedOrderId(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Printed Invoice Structure */}
            <div className="border border-zinc-200 p-6 bg-zinc-50/50 rounded-xl space-y-6">
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider block">SHIPPING ADDEE</span>
                  <div className="font-bold text-zinc-900 text-[13px]">{selectedOrder.customerName}</div>
                  <div className="text-zinc-600 text-xs">
                    {selectedOrder.customerAddress}<br />
                    {selectedOrder.customerCity}, {selectedOrder.customerZip}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono pt-1 h-3">{selectedOrder.customerEmail}</div>
                </div>

                <div className="text-right space-y-1">
                  <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider block">ORDER INCEPTION</span>
                  <div className="font-mono text-zinc-800 text-xs">{selectedOrder.date}</div>
                  <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider block pt-2">TRACKING IDENT</span>
                  <div className="font-mono text-zinc-800 text-xs bg-white px-2.5 py-0.5 border border-zinc-200 rounded-lg inline-block">{selectedOrder.trackingNumber}</div>
                </div>
              </div>

              {/* Items List inside Billing invoice */}
              <div className="space-y-2 border-t border-b border-zinc-200/60 py-4">
                <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider block mb-2">BILLABLE MERCHANDISE</span>
                {selectedOrder.products.map((itm, index) => (
                  <div key={index} className="flex justify-between text-zinc-800 font-sans">
                    <span className="font-medium text-zinc-950">
                      {itm.name} <span className="text-zinc-400 font-mono text-xs">x{itm.quantity}</span>
                    </span>
                    <span className="font-mono font-medium">${(itm.price * itm.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="flex flex-col items-end space-y-1.5 pt-1">
                <div className="flex justify-between w-48 text-zinc-500 font-sans text-xs">
                  <span>Subtotal</span>
                  <span className="font-mono">${(selectedOrder.amount - 9.95 - (selectedOrder.amount - 9.95) * 0.08 / 1.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-zinc-500 font-sans text-xs">
                  <span>Standard Shipping</span>
                  <span className="font-mono">$9.95</span>
                </div>
                <div className="flex justify-between w-48 text-[#18181b] font-sans text-xs font-bold border-t border-zinc-200/50 pt-2.5">
                  <span className="uppercase text-[11px] tracking-wide">GRAND TOTAL Invoiced</span>
                  <span className="font-mono text-sm">${selectedOrder.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Gateway details and legal audit */}
              <div className="pt-4 border-t border-zinc-100 flex justify-between items-center text-[10px] font-mono text-zinc-400">
                <span>GATEWAY SYSTEM: {selectedOrder.paymentMethod.toUpperCase()}</span>
                <span>STATE: GUARANTEED MATCH</span>
              </div>
            </div>

            {/* Invoice bottom update state shortcuts */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-sans">STATE TRANSITIONS:</span>
                <div className="flex gap-1.5">
                  {(['Pending', 'Shipped', 'Completed', 'Cancelled'] as OrderStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      className={`px-2.5 py-1 text-[9px] font-mono border rounded-lg cursor-pointer transition-all ${
                        selectedOrder.status === status 
                          ? 'bg-zinc-900 border-zinc-900 text-white font-bold' 
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                PRINT INVOICE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 4: INTERACTIVE PAGE PREVIEW VIEWPORT --- */}
      {viewingPage && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-2xl border border-zinc-200 shadow-2xl p-6 md:p-8 rounded-2xl text-xs font-sans max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-zinc-150 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#d97706] font-bold uppercase tracking-wider">LIVE TEMPLATE PREVIEW FRAME</span>
                <h3 className="text-sm font-sans font-bold text-zinc-950 mt-1 uppercase">
                  {viewingPage.title} (Slug: {viewingPage.slug})
                </h3>
              </div>
              <button 
                onClick={() => setViewingPage(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Live Viewport Container */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 shadow-inner">
              {/* Browser Bar */}
              <div className="bg-zinc-100/90 border-b border-zinc-200 px-4 py-2 flex items-center gap-1.5 text-zinc-400 text-[10px] select-none font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <span className="bg-white text-zinc-650 px-3 py-0.5 rounded border border-zinc-200 ml-4 w-72 truncate block text-left">
                  https://goldiama.com{viewingPage.slug}
                </span>
                <span className="ml-auto font-bold text-[#d97706] bg-amber-50 px-2 py-0.5 border border-amber-100 rounded">
                  {viewingPage.template.toUpperCase()}
                </span>
              </div>

              {/* Viewport Canvas Body based on Template selection */}
              <div className="p-6 bg-white min-h-[220px] font-sans flex flex-col justify-between">
                {viewingPage.template === 'Blank Page' ? (
                  <div className="text-center py-12 px-6 flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-50 border border-dashed border-zinc-300 flex items-center justify-center">
                      <Layout className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-zinc-800">Blank Page Canvas Active</p>
                      <p className="text-[10px] text-zinc-400 font-sans tracking-tight leading-snug max-w-sm mx-auto mt-1">This page represents an optimized pristine canvas layout that loads no preset visual overlays, perfect for custom dynamic bento or slider integrations.</p>
                    </div>
                  </div>
                ) : viewingPage.template === 'Bento Showcase' ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-left">
                      <span className="text-[8px] font-mono font-bold text-[#d97706] block mb-1">SPOTLIGHT ALLOCATION</span>
                      <h4 className="text-xs font-bold uppercase tracking-tight text-zinc-950">Cast Gold Bars Purity Standard</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 font-sans">999.9 Certified Fine Cast Bars with fully verified Swiss serial certificates.</p>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-center flex flex-col justify-between">
                      <span className="text-[10px] font-sans font-bold text-zinc-900 block">$2,410.50</span>
                      <span className="text-[7.5px] font-mono text-[#d97706] bg-amber-50 rounded py-0.5 uppercase">LIVE SPOT PRICE</span>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-left">
                      <span className="text-[8px] font-mono text-zinc-400 block pb-1">CERTIFIED SECURE</span>
                      <span className="text-[9px] font-bold text-zinc-800">Bespoke Vault Minting</span>
                    </div>
                    <div className="col-span-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-left">
                      <span className="text-[8px] font-mono text-zinc-400 block pb-1">DIGITAL CUSTODY TRACKING</span>
                      <span className="text-[9px] font-bold text-zinc-800">Full Blockchain Chain of Custody</span>
                    </div>
                  </div>
                ) : viewingPage.template === 'Infinite Scroll' ? (
                  <div className="space-y-4 text-center py-6">
                    <p className="text-[9px] font-mono text-[#d97706] font-bold tracking-widest uppercase mb-1">Infinite Scroll Product Grid Mockup</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="border border-zinc-150 p-2.5 rounded-lg text-left bg-zinc-50">
                          <div className="w-full h-11 bg-zinc-200/50 rounded flex items-center justify-center mb-1 text-[8px] font-mono text-zinc-400">GOLD BLOCK {i}</div>
                          <span className="text-[8px] font-sans font-bold text-zinc-950 block truncate">Fine Cast Bar {i}oz</span>
                          <span className="text-[8px] font-mono text-zinc-450 block mt-0.5">$2,410</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : viewingPage.template === 'Editorial Story' ? (
                  <div className="space-y-3 py-4 max-w-md mx-auto text-center font-sans">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">EDITORIAL ESSAY EXCERPT</span>
                    <h4 className="text-xs font-sans font-black tracking-tight text-zinc-950 uppercase">Leading Ethically in Global Gold Bullion Mining</h4>
                    <p className="text-[10px] text-zinc-600 leading-relaxed italic">"Our commitment ensures complete ecological alignment from sovereign shaft extraction to luxury certified vault deposits in Zurich."</p>
                  </div>
                ) : (
                  <div className="border border-zinc-150 rounded-xl p-4 max-w-sm mx-auto space-y-3.5 my-4 text-left font-sans">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block border-b pb-1">Minimal Secure Form Portal</span>
                    <div className="space-y-2">
                      <input type="text" disabled placeholder="Full Name Address" className="w-full p-2 border border-zinc-200 rounded-lg text-[9px] bg-zinc-50 cursor-not-allowed" />
                      <input type="text" disabled placeholder="Corporate Security Token" className="w-full p-2 border border-zinc-200 rounded-lg text-[9px] bg-zinc-50 cursor-not-allowed" />
                      <button disabled className="w-full py-2 bg-zinc-400 text-white font-mono text-[9px] uppercase tracking-wider rounded-lg cursor-not-allowed">Request Secure Authorization</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Analysis Section */}
            <div className="bg-zinc-50 border border-zinc-150 p-5 rounded-xl space-y-3 text-left">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">Active Search Index Metadata</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">SEO Page Title Tag</span>
                  <p className="text-[11px] font-semibold text-zinc-850 font-sans border border-zinc-200 bg-white p-2.5 rounded-lg shadow-2xs leading-snug">
                    {viewingPage.seoTitle || `${viewingPage.title} | Goldiama Sovereign`}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">Focus Target Keywords</span>
                  <p className="text-[11px] font-medium text-zinc-800 font-mono border border-zinc-200 bg-white p-2.5 rounded-lg shadow-2xs">
                    {viewingPage.seoKeywords || viewingPage.title.toLowerCase()}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">SEO Meta Description Override Snippet</span>
                  <p className="text-[11px] text-zinc-600 leading-relaxed border border-zinc-200 bg-white p-3 rounded-lg shadow-2xs">
                    {viewingPage.seoDesc || 'No specific search engine metadata overrides configured. Dynamic system fallback tags will index automatically.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewingPage(null)}
                className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-850 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Close Canvas Viewport
              </button>
            </div>
          </div>
        </div>
      )}




      {/* GLOBAL MASTER SAVE TOAST NOTIFICATION */}
      {globalSaveToast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 p-4 max-w-sm flex items-start gap-3.5 animate-slide-up duration-350">
          <div className="p-2 rounded-xl bg-[#d97706]/20 border border-[#d97706]/35 flex items-center justify-center text-[#fbbf24] mt-0.5">
            <Save className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-sans font-bold text-white tracking-tight">{globalSaveToast.title}</h4>
            <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">{globalSaveToast.subtitle}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-black bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">AUTO-COMPILED SESSIONS</span>
              <span className="text-[8px] font-mono text-emerald-400 font-bold">● ONLINE</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setGlobalSaveToast(prev => ({ ...prev, show: false }))} 
            className="text-zinc-500 hover:text-white transition-all cursor-pointer p-0.5 hover:bg-zinc-900 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}



    </div>
  );
};
