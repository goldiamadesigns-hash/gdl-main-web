/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../StoreContext';
import { Product, Review } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Star, X, Plus, Minus, Trash2, ArrowRight, Lock, 
  Search, Eye, Check, ShieldCheck, Tag, Sparkles, Menu,
  HelpCircle, Info, Phone, Mail, Link, MessageSquare, MapPin, Heart
} from 'lucide-react';

const splitImageUrls = (str: string): string[] => {
  if (!str) return [];
  const trimmed = str.trim();
  // Safe-guard single base64 images from being broken by splits
  if (trimmed.startsWith('data:image/')) {
    return [trimmed];
  }
  const cleaned = trimmed.replace(/[\r\n|]+/g, ',');
  return cleaned
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
};

interface StorefrontProps {
  onAdminTrigger: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ onAdminTrigger }) => {
  const { 
    products, cart, addToCart, updateCartQuantity, removeFromCart, 
    checkout, addReview, headerStyle, navigationMenu,
    navPresetStyle, navFontSize, navFontFamily, navFontWeight,
    navFontCase, navLineGap, navBlockSpacing, navColorStyle,
    navShowDividers, navStretchMenu,

    heroBanners,
    heroBannerLayoutMode,
    heroBannerDimDesktop,
    heroBannerDimTablet,
    heroBannerDimMobile,

    pageBannerShow,
    pageBannerBgUrl,
    pageBannerHeight,
    pageBannerAlign,
    pageBannerDimDesktop,
    pageBannerDimTablet,
    pageBannerDimMobile,

    pageTitleBarEnable,
    pageTitleBarBg,
    pageTitleBarBorder,
    pageTitleBarFontSize,

    layoutContentWidth,
    layoutBorderRadius,
    layoutShowBreadcrumbs,
    pagesList
  } = useStore();

  const getFontFamilyClass = (family: string) => {
    switch (family) {
      case 'sans': return 'font-sans';
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'grotesk': return 'font-sans tracking-tight';
      default: return 'font-sans';
    }
  };

  const getFontSizeClass = (size: string) => {
    switch (size) {
      case 'xs': return 'text-[11px]';
      case 'sm': return 'text-[12px]';
      case 'md': return 'text-[14px]';
      case 'lg': return 'text-[16px]';
      case 'xl': return 'text-[18px]';
      default: return 'text-xs';
    }
  };

  const getFontWeightClass = (weight: string) => {
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

  const getFontCaseClass = (fontCase: string) => {
    switch (fontCase) {
      case 'uppercase': return 'uppercase tracking-wider';
      case 'uppercase-spaced': return 'uppercase tracking-[0.25em]';
      case 'lowercase': return 'lowercase tracking-normal';
      case 'capitalize': return 'capitalize tracking-normal';
      case 'none': return 'normal-case tracking-normal';
      default: return 'uppercase tracking-widest';
    }
  };

  const getLineGapClass = (gap: string) => {
    switch (gap) {
      case 'tiny': return 'py-1';
      case 'small': return 'py-2';
      case 'medium': return 'py-3';
      case 'large': return 'py-4';
      case 'excessive': return 'py-6';
      default: return 'py-1.5';
    }
  };

  const getBlockSpacingClass = (spacing: string) => {
    switch (spacing) {
      case 'tiny': return 'gap-1.5 md:gap-2';
      case 'small': return 'gap-2.5 md:gap-4';
      case 'medium': return 'gap-4 md:gap-7';
      case 'large': return 'gap-6 md:gap-11';
      case 'excessive': return 'gap-10 md:gap-16';
      default: return 'gap-4';
    }
  };

  const getNavLinksStyle = (itemId: string, itemHref: string, activeSlug: string, hoverColor: string) => {
    const isActive = activeSlug === itemHref;
    
    const colors = {
      amber: {
        activeText: 'text-[#d97706]',
        hoverText: 'hover:text-[#d97706]',
        bgActive: 'bg-[#d97706]/5 border-[#d97706]',
        bgBadge: 'bg-[#d97706] text-white',
        borderActive: 'border-[#d97706]',
      },
      emerald: {
        activeText: 'text-emerald-700',
        hoverText: 'hover:text-emerald-600',
        bgActive: 'bg-emerald-50 border-emerald-600',
        bgBadge: 'bg-emerald-600 text-white',
        borderActive: 'border-emerald-600',
      },
      sapphire: {
        activeText: 'text-blue-750 text-blue-700',
        hoverText: 'hover:text-blue-600',
        bgActive: 'bg-blue-50 border-blue-600',
        bgBadge: 'bg-blue-600 text-white',
        borderActive: 'border-blue-600',
      },
      ruby: {
        activeText: 'text-rose-700',
        hoverText: 'hover:text-rose-600',
        bgActive: 'bg-rose-50 border-rose-600',
        bgBadge: 'bg-rose-600 text-white',
        borderActive: 'border-rose-600',
      },
      slate: {
        activeText: 'text-zinc-900',
        hoverText: 'hover:text-zinc-950',
        bgActive: 'bg-zinc-100 border-zinc-900',
        bgBadge: 'bg-zinc-700 text-white',
        borderActive: 'border-zinc-900',
      },
      onyx: {
        activeText: 'text-zinc-950 font-black',
        hoverText: 'hover:text-zinc-950',
        bgActive: 'bg-zinc-950 text-white border-zinc-915',
        bgBadge: 'bg-zinc-950 text-white',
        borderActive: 'border-zinc-950',
      }
    };
    
    const activeColor = colors[navColorStyle as keyof typeof colors] || colors.amber;

    switch (navPresetStyle) {
      case 'underlined':
        return `border-b-2 ${
          isActive 
            ? `${activeColor.activeText} ${activeColor.borderActive}` 
            : `text-zinc-500 hover:text-zinc-900 border-transparent ${activeColor.hoverText}`
        }`;
      case 'pill':
        return `px-4.5 rounded-full border transition-all ${
          isActive 
            ? `${activeColor.activeText} bg-zinc-50/80 border-zinc-200/50 shadow-inner` 
            : `text-zinc-505 border-transparent hover:bg-zinc-100/50 ${activeColor.hoverText}`
        }`;
      case 'rounded-badge':
        return `px-3.5 py-1 rounded-lg border transition-all ${
          isActive 
            ? `${activeColor.bgBadge} border-transparent shadow-xs` 
            : `text-zinc-505 hover:text-zinc-900 border-zinc-200 hover:border-zinc-400`
        }`;
      case 'bordered-button':
        return `px-5 border transition-all ${
          isActive 
            ? `${activeColor.activeText} ${activeColor.borderActive} bg-zinc-50` 
            : `text-zinc-505 border-zinc-200 hover:border-zinc-805 ${activeColor.hoverText}`
        }`;
      case 'clean-text':
        return `transition-colors ${
          isActive 
            ? `${activeColor.activeText} font-black` 
            : `text-zinc-505 ${activeColor.hoverText}`
        }`;
      default:
        return `border-b-2 ${
          isActive 
            ? 'text-[#d97706] border-[#d97706]' 
            : 'text-zinc-650 hover:text-zinc-950 border-transparent'
        }`;
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [syncCount, setSyncCount] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      console.log("[Storefront] Settings sync event detected. Re-evaluating styles.");
      setSyncCount(p => p + 1);
    };

    window.addEventListener('min-eco-banners-updated', handleSync);
    window.addEventListener('min-eco-pages-updated', handleSync);
    window.addEventListener('min-eco-logo-updated', handleSync);
    window.addEventListener('min-eco-supabase-config-changed', handleSync);

    return () => {
      window.removeEventListener('min-eco-banners-updated', handleSync);
      window.removeEventListener('min-eco-pages-updated', handleSync);
      window.removeEventListener('min-eco-logo-updated', handleSync);
      window.removeEventListener('min-eco-supabase-config-changed', handleSync);
    };
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  
  // Custom navigation hover item state
  const [activeMegaMenuId, setActiveMegaMenuId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load dynamic branding logo states from localStorage
  const brandLogoText = localStorage.getItem('min_eco_logo_text') || 'GOLDIAMA.';
  const brandLogoLetter = localStorage.getItem('min_eco_logo_letter') || 'G';
  const brandLogoType = localStorage.getItem('min_eco_logo_type') || 'image';
  const brandLogoImageUrl = localStorage.getItem('min_eco_frontend_logo_image_url') || localStorage.getItem('min_eco_logo_image_url') || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&h=128&q=80';

  const [activeSlug, setActiveSlug] = useState('/');
  const [activeSlide, setActiveSlide] = useState(0);
  const [activePageSlide, setActivePageSlide] = useState(0);
  const [activeInternalSlides, setActiveInternalSlides] = useState<Record<string, number>>({});

  // Active sorted hero banners for current path
  const activeHeroBanners = (heroBanners || [])
    .filter(b => b.isActive && (b.assignedPageSlug === activeSlug || b.assignedPageSlug === 'all'))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const activeBanner = activeHeroBanners[activeSlide % (activeHeroBanners.length || 1)];

  useEffect(() => {
    if (!activeBanner) return;
    let internalSlideCount = 1;

    if (activeBanner.slides && activeBanner.slides.length > 0) {
      internalSlideCount = activeBanner.slides.length;
    } else {
      const desktopBannerUrls = splitImageUrls(activeBanner.desktopImage);
      internalSlideCount = desktopBannerUrls.length;
    }

    if (internalSlideCount <= 1) return;

    const interval = setInterval(() => {
      setActiveInternalSlides(prev => ({
        ...prev,
        [activeBanner.id]: ((prev[activeBanner.id] || 0) + 1) % internalSlideCount
      }));
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanner?.id, activeBanner?.desktopImage, activeBanner?.slides]);

  // Parsed background URLs for interior pages
  const pageBannerUrls = pageBannerBgUrl
    ? splitImageUrls(pageBannerBgUrl)
    : ['https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=1600&q=80'];

  // Timers to auto-slide hero banners and interior page banners
  useEffect(() => {
    setActiveSlide(0);
    setActivePageSlide(0);
  }, [activeSlug]);

  useEffect(() => {
    if (activeHeroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(p => (p + 1) % activeHeroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeHeroBanners.length]);

  useEffect(() => {
    if (pageBannerUrls.length <= 1) return;
    const interval = setInterval(() => {
      setActivePageSlide(p => (p + 1) % pageBannerUrls.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [pageBannerUrls.length]);

  // Dynamic design layout attributes loaded live
  const layoutPreset = localStorage.getItem('min_eco_layout_preset') || 'comfortable';
  const containerMode = localStorage.getItem('min_eco_container_mode') || 'boxed';
  const sectionAlign = localStorage.getItem('min_eco_section_align') || 'left';

  // State for dynamic custom forms
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccessMsg, setContactSuccessMsg] = useState('');

  // SEO configuration document title updater hook
  React.useEffect(() => {
    const activePage = pagesList.find(p => p.slug === activeSlug);
    if (activePage) {
      const pageTitle = activePage.seoTitle || `${activePage.title} | Goldiama Global`;
      document.title = pageTitle;
      
      // Update meta elements dynamically to support complete operational SEO rules!
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', activePage.seoDesc || `High-fidelity professional workspace portal styled with premium ${activePage.template} geometry.`);

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', activePage.seoKeywords || 'precious metals, gold goldiama, secure vault');
    }
  }, [activeSlug, pagesList]);

  // Dynamic layout attributes
  const pageSize = localStorage.getItem('min_eco_page_size') || '1280px';
  const headerNoticeText = localStorage.getItem('min_eco_header_notice') || 'FREE WORLDWIDE SECURED INSURED COURIER DISPATCH FOR ALL DEPOSITS';
  const headerShowNotice = localStorage.getItem('min_eco_header_show_notice') !== 'false';
  const headerNoticeAlign = localStorage.getItem('min_eco_header_notice_align') || 'center';
  const headerEstablished = localStorage.getItem('min_eco_header_established') || 'LTD ESTABLISHED 2001';
  const headerEstablishedAlign = localStorage.getItem('min_eco_header_established_align') || 'left';
  const headerSticky = localStorage.getItem('min_eco_header_sticky') !== 'false';
  const headerShowCart = localStorage.getItem('min_eco_header_show_cart') !== 'false';
  const headerShowSearch = localStorage.getItem('min_eco_header_show_search') !== 'false';
  const headerShowCompliance = localStorage.getItem('min_eco_header_show_compliance') !== 'false';
  const headerComplianceLabel = localStorage.getItem('min_eco_header_compliance_label') || 'Compliance Portal';
  const headerComplianceIcon = localStorage.getItem('min_eco_header_compliance_icon') || 'ShieldCheck';
  const headerComplianceAction = localStorage.getItem('min_eco_header_compliance_action') || 'popup';
  const headerComplianceUrl = localStorage.getItem('min_eco_header_compliance_url') || '';
  const headerCompliancePopupTitle = localStorage.getItem('min_eco_header_compliance_popup_title') || 'Legal Audit & Compliance Portal';
  const headerCompliancePopupBadge = localStorage.getItem('min_eco_header_compliance_popup_badge') || 'GOLDIAMA REGULATION MATRIX';
  const headerComplianceSec1Title = localStorage.getItem('min_eco_header_compliance_sec1_title') || '1. Ethical Mineral Sourcing Assurance';
  const headerComplianceSec1Text = localStorage.getItem('min_eco_header_compliance_sec1_text') || 'All Gold, Silver, and Platinum bullion listed in the Goldiama catalog is certified conflict-free, fully audited in compliance with the LBMA Responsible Gold Guidance and OECD Due Diligence regulations.';
  const headerComplianceSec2Title = localStorage.getItem('min_eco_header_compliance_sec2_title') || '2. GIA & HRD Diamond Certification Standards';
  const headerComplianceSec2Text = localStorage.getItem('min_eco_header_compliance_sec2_text') || 'Every loose diamond and bespoke couture jewelry piece priced over $5,055 USD is delivered with an official GIA (Gemological Institute of America) digital ledger and laser-inscribed monogram serial numbering.';
  const headerComplianceSec3Title = localStorage.getItem('min_eco_header_compliance_sec3_title') || '3. Digital Vaulting & Sovereign Cold Storage';
  const headerComplianceSec3Text = localStorage.getItem('min_eco_header_compliance_sec3_text') || 'Customers may opt for absolute physical home courier delivery or high-security bond vaulted allocations situated in Geneva (Switzerland) with real-time digital asset verification logs.';

  const headerShowConcierge = localStorage.getItem('min_eco_header_show_concierge') !== 'false';
  const headerConciergeLabel = localStorage.getItem('min_eco_header_concierge_label') || 'Get In touch';
  const headerConciergeIcon = localStorage.getItem('min_eco_header_concierge_icon') || 'Sparkles';
  const headerConciergeAction = localStorage.getItem('min_eco_header_concierge_action') || 'popup';
  const headerConciergeUrl = localStorage.getItem('min_eco_header_concierge_url') || '';
  const headerConciergePopupTitle = localStorage.getItem('min_eco_header_concierge_popup_title') || 'Global Concierge & Bespoke Hotline';
  const headerConciergePopupBadge = localStorage.getItem('min_eco_header_concierge_popup_badge') || 'CRAVING TAILORED LUXURY?';
  const headerConciergePopupSub = localStorage.getItem('min_eco_header_concierge_popup_sub') || 'Please approach our senior curators and sales officers to design custom coins, bespoke weight bars, or schedule secure diamond viewings.';
  const headerConciergeBox1Title = localStorage.getItem('min_eco_header_concierge_box1_title') || 'PRIVATE MINTING HOTLINE';
  const headerConciergeBox1Val = localStorage.getItem('min_eco_header_concierge_box1_val') || '+41 (22) 505-8820';
  const headerConciergeBox1Tag = localStorage.getItem('min_eco_header_concierge_box1_tag') || 'GENEVA SEAT';
  const headerConciergeBox2Title = localStorage.getItem('min_eco_header_concierge_box2_title') || 'SECURE TELEGRAM CHANNEL';
  const headerConciergeBox2Val = localStorage.getItem('min_eco_header_concierge_box2_val') || '@GoldiamaRoyalConcierge';
  const headerConciergeBox2Tag = localStorage.getItem('min_eco_header_concierge_box2_tag') || '24/7 CURATED DISPATCH';
  const headerConciergeHighlightTitle = localStorage.getItem('min_eco_header_concierge_highlight_title') || 'Book Private Curated Viewings';
  const headerConciergeHighlightText = localStorage.getItem('min_eco_header_concierge_highlight_text') || 'Our private galleries are open for premium physical viewing by appointment only in the Zurich Financial Center and Geneva Gold Quay.';
  const headerConciergeHighlightLabel = localStorage.getItem('min_eco_header_concierge_highlight_label') || 'SCHEDULE AN APPOINTMENT AT:';
  const headerConciergeHighlightVal = localStorage.getItem('min_eco_header_concierge_highlight_val') || 'VIP@GOLDIAMA.CO';

  const frontendLogoMode = localStorage.getItem('min_eco_frontend_logo_mode') || 'classic';
  const showBrandNameText = localStorage.getItem('min_eco_show_brand_name_text') !== 'false';
  const showBrandEmblem = localStorage.getItem('min_eco_show_brand_emblem') !== 'false';
  const showEstablishedCaption = localStorage.getItem('min_eco_show_established_caption') !== 'false';
  const frontendLogoSize = localStorage.getItem('min_eco_frontend_logo_size') || 'M';
  const headerSupportPillsSize = localStorage.getItem('min_eco_header_support_pills_size') || 'S';

  // Desktop Pill Size styling
  let desktopPillClasses = "px-3 py-1.5 text-[10px]";
  let desktopIconClasses = "w-3.5 h-3.5";
  if (headerSupportPillsSize === 'M') {
    desktopPillClasses = "px-4.5 py-2 text-[11px]";
    desktopIconClasses = "w-4 h-4";
  } else if (headerSupportPillsSize === 'L') {
    desktopPillClasses = "px-6 py-2.5 text-xs";
    desktopIconClasses = "w-4.5 h-4.5";
  }

  // Mobile Pill Size styling
  let mobilePillClasses = "px-4 py-2.5 text-[10px]";
  let mobileIconClasses = "w-4 h-4";
  if (headerSupportPillsSize === 'M') {
    mobilePillClasses = "px-5 py-3 text-[11px]";
    mobileIconClasses = "w-4.5 h-4.5";
  } else if (headerSupportPillsSize === 'L') {
    mobilePillClasses = "px-6 py-3.5 text-xs";
    mobileIconClasses = "w-5 h-5";
  }

  // Helper to map icon names to Lucide icon components
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return ShieldCheck;
      case 'Sparkles': return Sparkles;
      case 'HelpCircle': return HelpCircle;
      case 'Info': return Info;
      case 'Phone': return Phone;
      case 'Mail': return Mail;
      case 'Link': return Link;
      case 'MessageSquare': return MessageSquare;
      case 'MapPin': return MapPin;
      case 'Star': return Star;
      case 'Heart': return Heart;
      default: return HelpCircle;
    }
  };

  const ComplianceIconComponent = getIconComponent(headerComplianceIcon);
  const ConciergeIconComponent = getIconComponent(headerConciergeIcon);

  // Dynamic logo scale classes
  const imageOnlyClass = 
    frontendLogoSize === 'L' ? 'h-12 max-h-12 max-w-[200px]' :
    frontendLogoSize === 'XL' ? 'h-16 max-h-16 max-w-[260px]' :
    frontendLogoSize === 'XXL' ? 'h-20 max-h-20 max-w-[320px]' :
    'h-9 max-h-9 max-w-[160px]';

  const emblemImageClass = 
    frontendLogoSize === 'L' ? 'h-10 max-h-10' :
    frontendLogoSize === 'XL' ? 'h-12 max-h-12' :
    frontendLogoSize === 'XXL' ? 'h-16 max-h-16' :
    'h-8 max-h-8';

  const emblemLetterClassA = 
    frontendLogoSize === 'L' ? 'w-10 h-10 text-base' :
    frontendLogoSize === 'XL' ? 'w-12 h-12 text-lg' :
    frontendLogoSize === 'XXL' ? 'w-16 h-16 text-xl' :
    'w-8 h-8 text-sm';

  const emblemLetterClassB = 
    frontendLogoSize === 'L' ? 'w-10 h-10 text-sm' :
    frontendLogoSize === 'XL' ? 'w-12 h-12 text-base' :
    frontendLogoSize === 'XXL' ? 'w-16 h-16 text-lg' :
    'w-8 h-8 text-xs';

  const brandNameTextClass = 
    frontendLogoSize === 'L' ? 'text-lg' :
    frontendLogoSize === 'XL' ? 'text-xl' :
    frontendLogoSize === 'XXL' ? 'text-2xl' :
    'text-base';

  const establishedCaptionClass = 
    frontendLogoSize === 'L' ? 'text-[9px]' :
    frontendLogoSize === 'XL' ? 'text-[10px]' :
    frontendLogoSize === 'XXL' ? 'text-[12px]' :
    'text-[8px]';

  // Shopping cart slide panel visible state
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout processes overlay states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  
  // Review form states inside details modal
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRec, setReviewRec] = useState(true);
  const [reviewSubmittedMessage, setReviewSubmittedMessage] = useState('');

  // Checkout billing inputs
  const [billName, setBillName] = useState('');
  const [billEmail, setBillEmail] = useState('');
  const [billAddress, setBillAddress] = useState('');
  const [billCity, setBillCity] = useState('');
  const [billZip, setBillZip] = useState('');
  const [billCardNumber, setBillCardNumber] = useState('');
  const [billExpiry, setBillExpiry] = useState('');
  const [billCvv, setBillCvv] = useState('');
  const [checkoutProcessState, setCheckoutProcessState] = useState<'idle' | 'authorizing' | 'success'>('idle');
  const [completedOid, setCompletedOid] = useState('');
  const [completedOTracking, setCompletedOTracking] = useState('');

  // Sub-modal overlay states for precious metals storefront
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showConciergeModal, setShowConciergeModal] = useState(false);

  // Hidden operator entry sequence clicks
  const [logoClicks, setLogoClicks] = useState(0);
  const handleLogoClick = () => {
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        onAdminTrigger();
        return 0;
      }
      return next;
    });
  };

  // Dynamic Categories list derived from current active inventory catalogue
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate cart costs
  const cartSubtotal = cart.reduce((tot, item) => tot + item.product.price * item.quantity, 0);
  const estimatedTax = cartSubtotal * 0.08;
  const flatShipping = 9.95;
  const grandTotal = cartSubtotal + estimatedTax + flatShipping;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || !reviewComment.trim()) return;

    addReview(activeProduct.id, {
      author: reviewAuthor.trim() || 'Anonymous Collector',
      rating: reviewRating,
      title: reviewTitle.trim() || 'Excellent Addition',
      comment: reviewComment.trim(),
      recommended: reviewRec
    });

    setReviewSubmittedMessage('Thank you. Your feedback is verified and has integrated in real time.');
    // Keep it temporarily on active product so the user sees their review immediately listed
    const matched = products.find(p => p.id === activeProduct.id);
    if (matched) {
      setActiveProduct(matched);
    }
    
    // Clear submission inputs
    setReviewAuthor('');
    setReviewRating(5);
    setReviewTitle('');
    setReviewComment('');
    setReviewRec(true);

    setTimeout(() => {
      setReviewSubmittedMessage('');
    }, 4500);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billName || !billEmail || !billAddress || !billCardNumber) return;

    setCheckoutProcessState('authorizing');

    setTimeout(() => {
      // Execute the order via unified store context
      const newOrder = checkout({
        name: billName,
        email: billEmail,
        address: billAddress,
        city: billCity,
        zip: billZip,
        paymentMethod: billCardNumber.startsWith('4') ? 'Visa Sandbox' : 'Credit Card Sandbox'
      });

      setCompletedOid(newOrder.id);
      setCompletedOTracking(newOrder.trackingNumber);
      setCheckoutProcessState('success');

      // Clear checkout values
      setBillName('');
      setBillEmail('');
      setBillAddress('');
      setBillCity('');
      setBillZip('');
      setBillCardNumber('');
      setBillExpiry('');
      setBillCvv('');
    }, 1500);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div id="store-main-layout" className="min-h-screen bg-[#F9FAFB] text-zinc-900 font-sans selection:bg-zinc-100 flex flex-col justify-between">
      <style>{`
        .max-page-width {
          max-width: ${
            layoutContentWidth === 'mobile' ? '480px' :
            layoutContentWidth === 'tablet-portrait' ? '768px' :
            layoutContentWidth === 'tablet-landscape' ? '1024px' :
            layoutContentWidth === 'narrow' ? '1200px' :
            layoutContentWidth === 'default' ? '1280px' :
            layoutContentWidth === 'wide' ? '1440px' :
            layoutContentWidth === 'ultra-wide' ? '1600px' :
            layoutContentWidth === 'fluid' ? '1920px' :
            '1280px'
          } !important;
          width: 100% !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
      `}</style>
      
      {/* 0. DYNAMIC ANNOUNCEMENT BANNER */}
      {headerShowNotice && headerNoticeText && (
        <div id="storefront-announcement-banner" className={`bg-[#18181b] text-[#FAF9F9] py-2 px-5 text-[10px] tracking-widest font-mono font-semibold uppercase leading-tight select-none z-30 border-b border-zinc-950 flex items-center gap-2 ${
          headerNoticeAlign === 'left' ? 'text-left justify-start' : headerNoticeAlign === 'right' ? 'text-right justify-end' : 'text-center justify-center'
        }`}>
          <span className="w-1.5 h-1.5 bg-[#d97706] rounded-full animate-pulse inline-block" />
          {headerNoticeText}
        </div>
      )}

      {/* 1. DYNAMIC RICH COUTURE COGNATE HEADER */}
      <header id="store-navigation" className={`${headerSticky ? 'sticky top-0' : 'relative'} bg-white/95 backdrop-blur-md border-b border-zinc-200/60 z-30 shadow-xs transition-all`}>
        {/* Style A: Minimalist Classic (Single-Row Nav) */}
        {headerStyle === 'minimal' ? (
          <div className="max-page-width px-6 md:px-10 lg:px-12 py-5 flex justify-between items-center">
            {/* Logo Emblem */}
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 select-none cursor-pointer active:scale-95 transition-transform"
              title="Double click or tap 5 times for administrative gateway"
            >
              {frontendLogoMode === 'image_only' && brandLogoImageUrl ? (
                <img src={brandLogoImageUrl} alt="Logo" className={`${imageOnlyClass} object-contain rounded-none animate-fade-in`} referrerPolicy="no-referrer" />
              ) : (
                <>
                  {showBrandEmblem && (
                    brandLogoType === 'image' && brandLogoImageUrl ? (
                      <img src={brandLogoImageUrl} alt="Logo" className={`${emblemImageClass} object-contain rounded-none`} referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`${emblemLetterClassA} bg-zinc-950 text-white rounded flex items-center justify-center font-sans font-black uppercase`}>{brandLogoLetter}</div>
                    )
                  )}
                  {showBrandNameText && (
                    <span className={`font-sans font-black tracking-widest text-[#18181b] leading-none uppercase ${brandNameTextClass}`}>{brandLogoText}</span>
                  )}
                </>
              )}
            </div>

            {/* Centered Navigation Node Links (Hover active triggers) */}
            <nav className={`hidden lg:flex items-center h-full ${navStretchMenu ? 'flex-grow justify-between max-w-4xl mx-8' : getBlockSpacingClass(navBlockSpacing)}`}>
              {navigationMenu.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && navShowDividers && (
                    <div className="w-px h-3.5 bg-zinc-200 self-center shrink-0 mx-4 opacity-75 animate-fade-in" />
                  )}
                  <div
                    className={`flex items-center ${navStretchMenu ? 'flex-grow justify-center' : ''}`}
                    onMouseEnter={() => {
                      if (item.isMegaMenu) setActiveMegaMenuId(item.id);
                    }}
                    onMouseLeave={() => {
                      setActiveMegaMenuId(null);
                    }}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSlug(item.href);
                      }}
                      className={`whitespace-nowrap transition-colors cursor-pointer ${navStretchMenu ? 'w-full text-center flex items-center justify-center font-bold tracking-wide' : ''} ${getFontFamilyClass(navFontFamily)} ${getFontSizeClass(navFontSize)} ${getFontWeightClass(navFontWeight)} ${getFontCaseClass(navFontCase)} ${getLineGapClass(navLineGap)} ${getNavLinksStyle(item.id, item.href, activeSlug, '#d97706')}`}
                    >
                      {item.label}
                    </a>

                    {/* Mega Menu Interactive Drawer */}
                    {item.isMegaMenu && item.megaMenu && activeMegaMenuId === item.id && (
                      <div className="absolute top-full left-0 right-0 w-full bg-white/98 backdrop-blur-md border-t-2 border-[#d97706] border-b border-zinc-200/80 shadow-2xl z-50 text-left animate-fade-in py-2">
                        <div className="max-page-width mx-auto px-6 md:px-10 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-12 gap-10">
                          {/* Column 1: Brand/Editorial Info */}
                          <div className="md:col-span-4 border-r border-[#f4f4f5] pr-8 flex flex-col justify-between h-full space-y-6">
                            <div className="space-y-4">
                              <div className="inline-flex items-center gap-2 bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
                                <span className="text-[9px] font-mono font-bold tracking-widest text-[#d97706] uppercase">BEYOND STANDARDS</span>
                              </div>
                              <h4 className="text-sm md:text-base font-sans font-black tracking-tight text-zinc-950 uppercase leading-snug">
                                {item.megaMenu.bannerTitle}
                              </h4>
                              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans font-semibold">
                                Accredited high-purity physical allocations. Authenticated trace logs with institutional vault storage capability.
                              </p>
                            </div>
                            <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-wider block pt-2 border-t border-zinc-50">
                              © Goldiama Sovereign Standards
                            </span>
                          </div>

                          {/* Column 2: Elegant Sublinks Showcase */}
                          <div className="md:col-span-4 space-y-4 pl-4 border-r border-[#f4f4f5] pr-4">
                            <span className="text-[10px] font-mono font-bold text-zinc-450 tracking-widest uppercase block border-b border-zinc-100 pb-2">
                              Explore Catalogue
                            </span>
                            <div className="grid grid-cols-1 gap-1">
                              {item.megaMenu.links.map((lnk, idx) => (
                                <a
                                  key={idx}
                                  href={lnk.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setActiveSlug(lnk.href);
                                    setActiveMegaMenuId(null);
                                  }}
                                  className="text-xs font-sans font-bold text-zinc-600 hover:text-zinc-950 transition-all duration-200 flex items-center justify-between py-2 px-1.5 rounded-lg hover:bg-zinc-50 group/item"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover/item:bg-[#d97706] group-hover/item:scale-125 transition-all duration-250" />
                                    <span className="uppercase tracking-wide">{lnk.label}</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover/item:text-[#d97706] transition-colors translate-x-2 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all duration-250">
                                    EXPLORE
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* Column 3: Prestige Showcase Panel */}
                          <div className="md:col-span-4 flex flex-col justify-between">
                            <div className="relative h-48 rounded-xl overflow-hidden group/showcase shadow-md border border-zinc-200/60 bg-zinc-50">
                              <img 
                                src={item.megaMenu.imageUrl} 
                                alt={item.label} 
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/showcase:scale-105" 
                                referrerPolicy="no-referrer" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/30 to-transparent flex flex-col justify-end p-5">
                                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest leading-none mb-2 bg-amber-400/10 px-2 py-0.5 rounded-md w-fit backdrop-blur-xs">
                                  Vault Security Purity
                                </span>
                                <span className="text-xs font-sans font-black text-white uppercase tracking-tight leading-tight">
                                  {item.megaMenu.imageTitle}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between px-1">
                              <span className="text-[9.5px] font-mono font-bold text-emerald-600 flex items-center gap-1 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                GIA CERTIFICATION VERIFIED
                              </span>
                              <span className="text-[9.5px] font-mono font-bold text-zinc-400">
                                ESG LEVEL A+
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </nav>

            {/* Right Actions Block */}
            <div className="flex items-center gap-2">
              {headerShowSearch && (
                <div className="relative hidden md:block w-36 lg:w-44 select-none">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-zinc-50 border border-zinc-200 pl-8 pr-3 py-1 text-[11px] font-sans font-medium rounded-lg outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-900 uppercase"
                  />
                </div>
              )}
              
              {headerShowCart && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-zinc-800 hover:text-zinc-950 focus:outline-none flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                  <span className="text-xs font-mono font-bold">{cart.reduce((s, c) => s + c.quantity, 0)}</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#d97706] rounded-full animate-pulse" />
                  )}
                </button>
              )}

              {/* Hamburger Button Style A */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-zinc-805 hover:text-zinc-950 focus:outline-none flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[1.8]" /> : <Menu className="w-5 h-5 stroke-[1.8]" />}
              </button>
            </div>
          </div>
        ) : (
          /* Style B: Goldiama Premium Double-Row Nav (Pill button Compliance & contacts triggers) */
          <div className="w-full">
            {/* ROW 1: BRAND LOGO + DYNAMIC PILL BUTTONS + OPERATOR PORTAL */}
            <div className="max-page-width px-6 md:px-10 lg:px-12 py-5 flex justify-between items-center relative border-b border-zinc-100">
              
              {/* Logo Emblem left */}
              <div 
                onClick={handleLogoClick}
                className="flex items-center gap-2.5 select-none cursor-pointer active:scale-95 transition-transform"
                title="Double click or tap 5 times for administrative gateway"
              >
                {frontendLogoMode === 'image_only' && brandLogoImageUrl ? (
                  <img src={brandLogoImageUrl} alt="Logo" className={`${imageOnlyClass} object-contain rounded-none animate-fade-in`} referrerPolicy="no-referrer" />
                ) : (
                  <>
                    {showBrandEmblem && (
                      brandLogoType === 'image' && brandLogoImageUrl ? (
                        <img src={brandLogoImageUrl} alt="Logo" className={`${emblemImageClass} object-contain rounded-none`} referrerPolicy="no-referrer" />
                      ) : (
                        <div className={`${emblemLetterClassB} bg-zinc-950 text-white rounded flex items-center justify-center font-sans font-black uppercase`}>{brandLogoLetter}</div>
                      )
                    )}
                    {(showBrandNameText || showEstablishedCaption) && (
                      <div className="text-left py-0.5">
                        {showBrandNameText && (
                          <span className={`font-sans font-black tracking-widest text-[#18181b] leading-none block uppercase ${brandNameTextClass}`}>{brandLogoText}</span>
                        )}
                        {showEstablishedCaption && (
                          <span className={`font-mono tracking-widest text-[#d97706] font-semibold block mt-0.5 uppercase ${establishedCaptionClass} ${
                            headerEstablishedAlign === 'left' ? 'text-left' : headerEstablishedAlign === 'right' ? 'text-right' : 'text-center'
                          }`}>{headerEstablished}</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Pill Button compliance and concierge triggers */}
              <div className="flex items-center gap-1.5">
                {headerShowSearch && (
                  <div className="relative hidden md:block w-36 lg:w-44 select-none">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full bg-zinc-50 border border-zinc-200 pl-8 pr-3 py-1 text-[11px] font-sans font-medium rounded-lg outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-900 uppercase"
                    />
                  </div>
                )}

                {/* 📘 Regulatory Compliance Pill */}
                {headerShowCompliance && (
                  <button
                    type="button"
                    onClick={() => {
                      if (headerComplianceAction === 'link' && headerComplianceUrl) {
                        window.open(headerComplianceUrl, '_blank');
                      } else {
                        setShowComplianceModal(true);
                      }
                    }}
                    className={`hidden xl:flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-850 rounded-full border border-zinc-200.5 shadow-3xs transition-all cursor-pointer font-sans font-bold uppercase tracking-wider shrink-0 ${desktopPillClasses}`}
                  >
                    <ComplianceIconComponent className={`${desktopIconClasses} text-zinc-500`} />
                    {headerComplianceLabel}
                  </button>
                )}

                {/* 📞 Global Concierge Contact Pill */}
                {headerShowConcierge && (
                  <button
                    type="button"
                    onClick={() => {
                      if (headerConciergeAction === 'link' && headerConciergeUrl) {
                        window.open(headerConciergeUrl, '_blank');
                      } else {
                        setShowConciergeModal(true);
                      }
                    }}
                    className={`hidden xl:flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-850 rounded-full border border-zinc-200.5 shadow-3xs transition-all cursor-pointer font-sans font-bold uppercase tracking-wider shrink-0 ${desktopPillClasses}`}
                  >
                    <ConciergeIconComponent className={`${desktopIconClasses} text-[#d97706]`} />
                    {headerConciergeLabel}
                  </button>
                )}
                
                {/* Cart Shopping container */}
                {headerShowCart && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-zinc-805 hover:text-zinc-950 focus:outline-none flex items-center gap-1.5 cursor-pointer ml-0.5 shrink-0"
                  >
                    <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                    <span className="text-xs font-mono font-bold">{cart.reduce((s, c) => s + c.quantity, 0)}</span>
                    {cart.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#d97706] rounded-full animate-pulse" />
                    )}
                  </button>
                )}

                {/* Hamburger Button Style B */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-zinc-805 hover:text-zinc-950 focus:outline-none flex items-center justify-center cursor-pointer shrink-0"
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[1.8]" /> : <Menu className="w-5 h-5 stroke-[1.8]" />}
                </button>
              </div>
            </div>

            {/* ROW 2: BOTTOM LEVEL LUXE CENTRED MENU NAVIGATION */}
            <div className="hidden lg:block bg-[#FAF9F9]/90 border-b border-zinc-150 z-20 relative">
              <div className={`max-page-width px-6 md:px-10 lg:px-12 py-0 flex items-center ${navStretchMenu ? 'w-full' : 'justify-center'}`}>
                <nav className={`h-full ${navStretchMenu ? 'w-full flex justify-between items-stretch' : `flex items-center ${getBlockSpacingClass(navBlockSpacing)}`}`}>
                  {navigationMenu.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {index > 0 && navShowDividers && (
                        <div className="w-px h-3.5 bg-zinc-200 self-center shrink-0 mx-4 opacity-75 animate-fade-in" />
                      )}
                      <div
                        key={item.id}
                        className={`flex items-center ${navStretchMenu ? 'flex-grow justify-center' : ''}`}
                        onMouseEnter={() => {
                          if (item.isMegaMenu) setActiveMegaMenuId(item.id);
                        }}
                        onMouseLeave={() => {
                          setActiveMegaMenuId(null);
                        }}
                      >
                        <a
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveSlug(item.href);
                          }}
                          className={`whitespace-nowrap transition-colors cursor-pointer ${navStretchMenu ? 'w-full text-center flex items-center justify-center font-bold tracking-wide' : ''} ${getFontFamilyClass(navFontFamily)} ${getFontSizeClass(navFontSize)} ${getFontWeightClass(navFontWeight)} ${getFontCaseClass(navFontCase)} ${getLineGapClass(navLineGap)} ${getNavLinksStyle(item.id, item.href, activeSlug, '#d97706')}`}
                        >
                          {item.label}
                        </a>

                        {/* Mega Menu Interactive Drawer */}
                        {item.isMegaMenu && item.megaMenu && activeMegaMenuId === item.id && (
                          <div className="absolute top-full left-0 right-0 w-full bg-white/98 backdrop-blur-md border-t-2 border-[#d97706] border-b border-zinc-200/80 shadow-2xl z-50 text-left animate-fade-in py-2">
                            <div className="max-page-width mx-auto px-6 md:px-10 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-12 gap-10">
                              {/* Column 1: Brand/Editorial Info */}
                              <div className="md:col-span-4 border-r border-[#f4f4f5] pr-8 flex flex-col justify-between h-full space-y-6">
                                <div className="space-y-4">
                                  <div className="inline-flex items-center gap-2 bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/10">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
                                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#d97706] uppercase">HIGH SPEC BARS & COINS</span>
                                  </div>
                                  <h4 className="text-sm md:text-base font-sans font-black tracking-tight text-zinc-950 uppercase leading-snug">
                                    {item.megaMenu.bannerTitle}
                                  </h4>
                                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans font-semibold">
                                    Accredited high-purity physical allocations. Authenticated trace logs with institutional vault storage capability.
                                  </p>
                                </div>
                                <span className="text-[9px] font-mono text-zinc-400 mt-4 uppercase font-bold tracking-wider block pt-2 border-t border-zinc-50">
                                  ESTABLISHED STANDARDS OF GOLDIAMA LTD
                                </span>
                              </div>

                              {/* Column 2: Elegant Sublinks Showcase */}
                              <div className="md:col-span-4 space-y-4 pl-4 border-r border-[#f4f4f5] pr-4">
                                <span className="text-[10px] font-mono font-bold text-zinc-450 tracking-widest uppercase block border-b border-zinc-100 pb-2">
                                  Authentic Assortment
                                </span>
                                <div className="grid grid-cols-1 gap-1">
                                  {item.megaMenu.links.map((lnk, idx) => (
                                    <a
                                      key={idx}
                                      href={lnk.href}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setActiveSlug(lnk.href);
                                        setActiveMegaMenuId(null);
                                      }}
                                      className="text-xs font-sans font-bold text-zinc-600 hover:text-[#d97706] transition-all duration-200 flex items-center justify-between py-2 px-1.5 rounded-lg hover:bg-zinc-50 group/item"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-350 group-hover/item:bg-[#d97706] group-hover/item:scale-125 transition-all duration-250" />
                                        <span className="uppercase tracking-wide text-zinc-850">{lnk.label}</span>
                                      </div>
                                      <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover/item:text-[#d97706] transition-colors translate-x-2 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all duration-250">
                                        EXPLORE
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              </div>

                              {/* Column 3: Dynamic Landscape Graphics Showcase */}
                              <div className="md:col-span-4 flex flex-col justify-between">
                                <div className="relative h-48 rounded-xl overflow-hidden group/showcase shadow-md border border-zinc-200/60 bg-zinc-50">
                                  <img 
                                    src={item.megaMenu.imageUrl} 
                                    alt={item.label} 
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/showcase:scale-105" 
                                    referrerPolicy="no-referrer" 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/30 to-transparent flex flex-col justify-end p-5">
                                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest leading-none mb-2 bg-amber-450/10 px-2 py-0.5 rounded-md w-fit backdrop-blur-xs">
                                      PRECIOUS METAL SHOWCASE
                                    </span>
                                    <span className="text-xs font-sans font-black text-white uppercase tracking-tight leading-tight">
                                      {item.megaMenu.imageTitle}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between px-1">
                                  <span className="text-[9.5px] font-mono font-bold text-[#d97706] flex items-center gap-1 uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    SECURE VAULT PARALLEL CODES
                                  </span>
                                  <span className="text-[9.5px] font-mono font-bold text-zinc-400">
                                    LBMA ACCREDITED
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 w-full bg-white border-b border-zinc-200 shadow-xl z-50 animate-fade-in overflow-y-auto max-h-[85vh] flex flex-col">
            <div className="p-5 space-y-5">
              
              {/* Optional Search Bar in Mobile Drawer */}
              {headerShowSearch && (
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH PRODUCTS..."
                    className="w-full bg-zinc-50 border border-zinc-200 pl-9 pr-4 py-2 text-xs font-sans font-medium rounded-xl outline-none focus:border-zinc-950 focus:bg-white transition-all text-zinc-900 uppercase"
                  />
                </div>
              )}

              {/* Navigation Menu Links */}
              <nav className="flex flex-col gap-1.5">
                {navigationMenu.map((item) => {
                  const isActive = activeSlug === item.href;
                  return (
                    <div key={item.id} className="border-b border-zinc-50 pb-2 last:border-none">
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSlug(item.href);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center justify-between py-2 text-xs font-sans font-black uppercase tracking-widest ${
                          isActive ? 'text-[#d97706]' : 'text-zinc-800'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.isMegaMenu && <span className="text-[10px] bg-amber-500/10 text-[#d97706] px-1.5 py-0.5 rounded-full font-sans font-bold">MEGA</span>}
                      </a>

                      {/* If the item has a mega menu, render a simplified accordion list in mobile view */}
                      {item.isMegaMenu && item.megaMenu && (
                        <div className="mt-1 ml-3 pl-3 border-l border-zinc-150 space-y-2">
                          <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                            {item.megaMenu.bannerTitle}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {item.megaMenu.links.map((lnk, idx) => (
                              <a
                                key={idx}
                                href={lnk.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActiveSlug(lnk.href);
                                  setIsMobileMenuOpen(false);
                                }}
                                className="text-[11px] font-sans font-semibold text-zinc-650 hover:text-[#d97706] transition-all py-1 block"
                              >
                                {lnk.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Mobile Support/Compliance/Concierge Action Pills */}
              {(headerShowCompliance || headerShowConcierge) && (
                <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row gap-2.5">
                  {headerShowCompliance && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (headerComplianceAction === 'link' && headerComplianceUrl) {
                          window.open(headerComplianceUrl, '_blank');
                        } else {
                          setShowComplianceModal(true);
                        }
                      }}
                      className={`flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-850 rounded-xl border border-zinc-200 shadow-3xs transition-all cursor-pointer font-sans font-bold uppercase tracking-wider w-full ${mobilePillClasses}`}
                    >
                      <ComplianceIconComponent className={`${mobileIconClasses} text-zinc-500`} />
                      {headerComplianceLabel}
                    </button>
                  )}
                  {headerShowConcierge && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (headerConciergeAction === 'link' && headerConciergeUrl) {
                          window.open(headerConciergeUrl, '_blank');
                        } else {
                          setShowConciergeModal(true);
                        }
                       }}
                      className={`flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-850 rounded-xl border border-zinc-200.5 shadow-3xs transition-all cursor-pointer font-sans font-bold uppercase tracking-wider w-full ${mobilePillClasses}`}
                    >
                      <ConciergeIconComponent className={`${mobileIconClasses} text-[#d97706]`} />
                      {headerConciergeLabel}
                    </button>
                  )}
                </div>
              )}

              {/* Administrative Quick Entry hint */}
              <div 
                onClick={() => {
                  onAdminTrigger();
                  setIsMobileMenuOpen(false);
                }}
                className="pt-2 text-center text-[9px] font-mono text-zinc-400 uppercase tracking-widest hover:text-zinc-650 cursor-pointer"
              >
                ADMINPORTAL GATEWAY • SELECT SECURE
              </div>

            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN WORKSPACE VIEWPORT / ROUTER */}
      {(() => {
        // Find if selected route matches a custom page
        const isHomeDefault = activeSlug === '/';
        const currentPage = pagesList.find(p => p.slug === activeSlug) || pagesList[0];

        // Filter active hero banners assigned to 'activeSlug' or assigned globally ('all')
        const matchingHeroBanners = (heroBanners || [])
          .filter(b => b.isActive && (b.assignedPageSlug === activeSlug || b.assignedPageSlug === 'all'))
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const renderHeroBannersSection = () => {
          if (matchingHeroBanners.length === 0) {
            // If homepage, show our original beautiful minimalist default proclamation card
            if (isHomeDefault) {
              return (
                <section id="store-hero-banner" className="max-page-width px-5 pt-4 pb-4 font-sans">
                  <div className="bg-white border border-zinc-200 rounded-xl p-8 md:p-12 hover:border-[#18181b] transition-all duration-300 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-zinc-50 to-zinc-100/50 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-500" />
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-3 block">MINIMALIST UTILITY COLLECTION 2026</span>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#18181b] max-w-2xl leading-[1.12] uppercase font-sans">
                      Architectural elements designed to silence workspace friction.
                    </h1>
                    <p className="mt-4 text-xs md:text-sm text-zinc-500 max-w-xl leading-relaxed">
                      Eliminate operational noise with tactile mechanical hardware, single-point diffuse brass illuminations, and structured heavy biofelt linings.
                    </p>
                  </div>
                </section>
              );
            }
            return null;
          }

          const bannerCount = matchingHeroBanners.length;
          if (bannerCount === 0) return null;
          const currentBanner = matchingHeroBanners[activeSlide % bannerCount] || matchingHeroBanners[0];
          const isFullWidth = heroBannerLayoutMode === 'full-width';

          // Extract slide info depending on whether first-class custom nested slides exist
          const hasNestedSlides = currentBanner.slides && currentBanner.slides.length > 0;
          let internalImageCount = 1;
          let internalIdx = 0;
          let currentDesktopImg = '';
          let currentTabletImg = '';
          let currentMobileImg = '';
          let currentTitle = '';
          let currentSubtitle = '';
          let currentCtaText = '';
          let currentCtaLink = '';

          if (hasNestedSlides) {
            const nested = currentBanner.slides || [];
            internalImageCount = nested.length;
            const curInternalIdx = activeInternalSlides[currentBanner.id] || 0;
            internalIdx = curInternalIdx % (internalImageCount || 1);
            const activeSlideData = nested[internalIdx] || nested[0];

            currentDesktopImg = activeSlideData.desktopImage;
            currentTabletImg = activeSlideData.tabletImage || activeSlideData.desktopImage;
            currentMobileImg = activeSlideData.mobileImage || activeSlideData.desktopImage;
            currentTitle = activeSlideData.title;
            currentSubtitle = activeSlideData.subtitle;
            currentCtaText = activeSlideData.ctaText;
            currentCtaLink = activeSlideData.ctaLink;
          } else {
            const currentBDesktopImages = currentBanner.desktopImage
              ? splitImageUrls(currentBanner.desktopImage)
              : ['https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=1600&q=80'];
            const currentBTabletImages = currentBanner.tabletImage
              ? splitImageUrls(currentBanner.tabletImage)
              : [];
            const currentBMobileImages = currentBanner.mobileImage
              ? splitImageUrls(currentBanner.mobileImage)
              : [];

            internalImageCount = currentBDesktopImages.length;
            const curInternalIdx = activeInternalSlides[currentBanner.id] || 0;
            internalIdx = curInternalIdx % (internalImageCount || 1);

            currentDesktopImg = currentBDesktopImages[internalIdx] || currentBanner.desktopImage;
            currentTabletImg = currentBTabletImages[internalIdx] || currentBTabletImages[0] || currentBanner.tabletImage || currentDesktopImg;
            currentMobileImg = currentBMobileImages[internalIdx] || currentBMobileImages[0] || currentBanner.mobileImage || currentDesktopImg;
            currentTitle = currentBanner.title;
            currentSubtitle = currentBanner.subtitle;
            currentCtaText = currentBanner.ctaText;
            currentCtaLink = currentBanner.ctaLink;
          }

          // Generate responsive aspect-ratio or height rules
          let desktopStyle = '';
          let tabletStyle = '';
          let mobileStyle = '';

          // 1. Desktop
          if (heroBannerDimDesktop === '16:9') {
            desktopStyle = `aspect-ratio: 16 / 9; height: auto !important;`;
          } else {
            if (currentBanner.heightPreset === 'small') desktopStyle = `height: 280px !important;`;
            else if (currentBanner.heightPreset === 'large') desktopStyle = `height: 520px !important;`;
            else desktopStyle = `height: 400px !important;`;
          }

          // 2. Tablet
          if (heroBannerDimTablet === '1024x768') {
            tabletStyle = `aspect-ratio: 1024 / 768; height: auto !important; max-height: 768px;`;
          } else if (heroBannerDimTablet === '1280x800') {
            tabletStyle = `aspect-ratio: 1280 / 800; height: auto !important; max-height: 800px;`;
          } else {
            if (currentBanner.heightPreset === 'small') tabletStyle = `height: 220px !important;`;
            else if (currentBanner.heightPreset === 'large') tabletStyle = `height: 440px !important;`;
            else tabletStyle = `height: 320px !important;`;
          }

          // 3. Mobile
          if (heroBannerDimMobile === '1080x1920') {
            mobileStyle = `aspect-ratio: 1080 / 1920; height: auto !important;`;
          } else if (heroBannerDimMobile === '640x1136') {
            mobileStyle = `aspect-ratio: 640 / 1136; height: auto !important;`;
          } else {
            if (currentBanner.heightPreset === 'small') mobileStyle = `height: 180px !important;`;
            else if (currentBanner.heightPreset === 'large') mobileStyle = `height: 360px !important;`;
            else mobileStyle = `height: 240px !important;`;
          }

          const styleTag = (
            <style dangerouslySetInnerHTML={{ __html: `
              .hero-banner-dyn-dims {
                display: flex !important;
                align-items: center !important;
                width: 100% !important;
                ${mobileStyle}
              }
              @media (min-width: 768px) {
                .hero-banner-dyn-dims {
                  ${tabletStyle}
                }
              }
              @media (min-width: 1024px) {
                .hero-banner-dyn-dims {
                  ${desktopStyle}
                }
              }
            `}} />
          );

          return (
            <section 
              id="store-hero-banner" 
              className={isFullWidth ? "w-full font-sans relative overflow-hidden" : "max-page-width px-5 pt-4 pb-4 font-sans relative overflow-hidden"}
            >
              {styleTag}
              <div 
                className={`w-full relative overflow-hidden transition-all duration-500 hero-banner-dyn-dims flex items-center ${
                  isFullWidth 
                    ? "rounded-none border-b border-zinc-200 shadow-none" 
                    : "border border-zinc-200 rounded-2xl shadow-sm hover:border-zinc-950"
                }`}
                style={{
                  backgroundColor: '#0a0a0a'
                }}
              >
                {/* Background Image slideshow with cross-fade & Ken Burns scale animation */}
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={`${currentBanner.id}-${internalIdx}`}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <img 
                        src={currentDesktopImg} 
                        alt={currentTitle} 
                        className="hidden lg:block w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <img 
                        src={currentTabletImg} 
                        alt={currentTitle} 
                        className="hidden md:block lg:hidden w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <img 
                        src={currentMobileImg} 
                        alt={currentTitle} 
                        className="block md:hidden w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      {/* Dynamic scenic overlay system bound strictly to the admin-configured overlayOpacity value */}
                      <div 
                        className="absolute inset-0 pointer-events-none z-10" 
                        style={{ opacity: typeof currentBanner.overlayOpacity === 'number' ? currentBanner.overlayOpacity : 0.4 }}
                      >
                        {/* Solid black base backdrop for high contrast text support */}
                        <div className="absolute inset-0 bg-black/50" />
                        
                        {/* Left gradient scrim for pristine typography legibility under any bright image conditions */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Foreground Text slide-up animation */}
                <div className={`relative z-10 text-white max-w-4xl py-8 ${
                  isFullWidth ? "px-8 sm:px-16 md:px-24 lg:px-32" : "px-6 sm:px-12 md:px-16"
                }`}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${currentBanner.id}-${internalIdx}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="space-y-4 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.25em] text-amber-500 font-extrabold uppercase block">
                          {currentBanner.assignedPageSlug === '/' ? 'ESTABLISHED MCXXVI COLLECTION' : `LOCATION: ${currentBanner.assignedPageSlug.toUpperCase()}`}
                        </span>
                      </div>
                      
                      <h1 className="text-3xl sm:text-4.5xl md:text-5.5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.05] font-sans break-words text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-200">
                        {currentTitle}
                      </h1>
                      
                      <p className="text-xs sm:text-sm md:text-[15px] text-zinc-300 max-w-2xl leading-relaxed font-sans font-normal tracking-wide opacity-90">
                        {currentSubtitle}
                      </p>

                      {currentCtaText && (
                        <div className="pt-4 flex flex-wrap gap-3.5 items-center">
                          <a 
                            href={currentCtaLink || '#'}
                            className="group relative inline-flex items-center gap-2 overflow-hidden bg-white text-zinc-950 font-mono font-black uppercase text-[10px] md:text-xs px-7 py-3.5 tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 shadow-md rounded-xs hover:shadow-lg"
                          >
                            <span className="absolute inset-0 bg-zinc-950 transition-transform duration-300 ease-out transform -translate-x-full group-hover:translate-x-0" />
                            <span className="relative z-10 flex items-center gap-1.5 group-hover:text-white">
                              {currentCtaText}
                              <span className="inline-block transform transition-transform group-hover:translate-x-1 duration-200">
                                →
                              </span>
                            </span>
                          </a>

                          <a
                            href="#collection-grid"
                            className="inline-flex items-center gap-2 border border-white/20 hover:border-white/50 text-white hover:text-white/80 font-mono text-[9px] md:text-[10px] px-5 py-3 tracking-widest bg-black/25 backdrop-blur-xs transition-colors rounded-xs uppercase font-extrabold"
                          >
                            Discover Artifacts
                          </a>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {internalImageCount > 1 && (
                  <div className={`absolute bottom-6 flex items-center gap-3.5 z-20 ${
                    isFullWidth ? "left-8 sm:left-16 md:left-24 lg:left-32" : "left-8"
                  }`}>
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg select-none">
                      <span className="font-mono text-[9px] font-black text-amber-500 uppercase tracking-widest">
                        {(internalIdx + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="w-16 h-[2.5px] bg-white/20 rounded-full overflow-hidden relative">
                        {/* Dynamic timeline segment representing visual breathing queue */}
                        <div className="h-full bg-amber-500 rounded-full w-full" />
                      </div>
                      <span className="font-mono text-[9px] text-zinc-400">
                        {internalImageCount.toString().padStart(2, '0')}
                      </span>
                    </div>

                    {/* Navigation dot beads representing each slide option */}
                    <div className="flex items-center gap-1.5 bg-black/35 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                      {Array.from({ length: internalImageCount }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveInternalSlides(prev => ({
                            ...prev,
                            [currentBanner.id]: idx
                          }))}
                          className={`w-2 h-2 rounded-full transition-all duration-300 border-0 cursor-pointer ${
                            idx === internalIdx ? 'bg-amber-500 w-5 shadow-sm' : 'bg-white/40 hover:bg-white/80'
                          }`}
                          title={`Navigate to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {bannerCount > 1 && (
                  <div className={`absolute bottom-6 flex items-center gap-1.5 z-20 ${
                    isFullWidth ? "right-8 sm:right-16 md:right-24 lg:right-32" : "right-8"
                  }`}>
                    {matchingHeroBanners.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlide(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all border-0 cursor-pointer ${
                          idx === (activeSlide % bannerCount) ? 'bg-amber-500 w-6' : 'bg-white/35 hover:bg-white/70'
                        }`}
                        title={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        };

        // Render wrapping page title banner for interior inner pages
        const renderUniversalPageBanner = () => {
          if (!pageBannerShow || isHomeDefault) return null;

          const hasPageDim = pageBannerDimDesktop !== 'default' || pageBannerDimTablet !== 'default' || pageBannerDimMobile !== 'default';

          // Generate responsive aspect-ratio or height overriding rules
          let pDesktopStyle = '';
          let pTabletStyle = '';
          let pMobileStyle = '';

          // Desktop
          if (pageBannerDimDesktop === '16:9') {
            pDesktopStyle = "aspect-ratio: 16 / 9; height: auto !important;";
          } else {
            if (pageBannerHeight === 'snug') pDesktopStyle = "height: 140px !important;";
            else if (pageBannerHeight === 'deep') pDesktopStyle = "height: 320px !important;";
            else pDesktopStyle = "height: 200px !important;";
          }

          // Tablet
          if (pageBannerDimTablet === '1024x768') {
            pTabletStyle = "aspect-ratio: 1024 / 768; height: auto !important;";
          } else if (pageBannerDimTablet === '1280x800') {
            pTabletStyle = "aspect-ratio: 1280 / 800; height: auto !important;";
          } else {
            if (pageBannerHeight === 'snug') pTabletStyle = "height: 110px !important;";
            else if (pageBannerHeight === 'deep') pTabletStyle = "height: 260px !important;";
            else pTabletStyle = "height: 160px !important;";
          }

          // Mobile
          if (pageBannerDimMobile === '1080x1920') {
            pMobileStyle = "aspect-ratio: 1080 / 1920; height: auto !important;";
          } else if (pageBannerDimMobile === '640x1136') {
            pMobileStyle = "aspect-ratio: 640 / 1136; height: auto !important;";
          } else {
            if (pageBannerHeight === 'snug') pMobileStyle = "height: 90px !important;";
            else if (pageBannerHeight === 'deep') pMobileStyle = "height: 200px !important;";
            else pMobileStyle = "height: 130px !important;";
          }

          const pageStyleTag = (
            <style dangerouslySetInnerHTML={{ __html: `
              .page-banner-dyn-dims {
                display: flex !important;
                align-items: center !important;
                width: 100% !important;
                ${pMobileStyle}
              }
              @media (min-width: 768px) {
                .page-banner-dyn-dims {
                  ${pTabletStyle}
                }
              }
              @media (min-width: 1024px) {
                .page-banner-dyn-dims {
                  ${pDesktopStyle}
                }
              }
            `}} />
          );

          const bannerUrlsCount = pageBannerUrls.length;

          return (
            <section id="store-page-banner" className="w-full font-sans relative overflow-hidden">
              {pageStyleTag}
              <div 
                className={`w-full relative overflow-hidden transition-all duration-500 rounded-none border-y border-zinc-200/60 page-banner-dyn-dims flex items-center`}
                style={{
                  backgroundColor: '#0f172a'
                }}
              >
                {/* Slideshow of images with elegant crossfade */}
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={activePageSlide % bannerUrlsCount}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <img 
                        src={pageBannerUrls[activePageSlide % bannerUrlsCount]} 
                        alt="Interior Page Banner Slide" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      {/* Overlay inside slide for individual crossfade */}
                      <div className="absolute inset-0 bg-black/40" />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className={`relative z-10 text-white w-full flex flex-col py-6 px-6 sm:px-12 md:px-16 ${
                  pageBannerAlign === 'left' ? 'items-start text-left' :
                  pageBannerAlign === 'right' ? 'items-end text-right' : 'items-center text-center'
                }`}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activePageSlide % bannerUrlsCount}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-2 flex flex-col items-inherit"
                    >
                      <span className="text-[9px] font-mono tracking-widest text-[#d97706] font-extrabold uppercase bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md inline-block">
                        GOLD & SILVER COLLECTION
                      </span>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight uppercase leading-none font-sans text-white">
                        {currentPage.title}
                      </h1>
                      <p className="text-[10px] sm:text-xs text-zinc-100 opacity-90 max-w-lg leading-relaxed font-sans">
                        {currentPage.seoDesc || 'Artisanal micro-crafted details calibrated to provide frictionless gold and silver collection experiences.'}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {bannerUrlsCount > 1 && (
                  <div className={`absolute bottom-3 flex items-center gap-1.5 z-20 ${
                    pageBannerAlign === 'left' ? 'left-6 sm:left-12 md:left-16' :
                    pageBannerAlign === 'right' ? 'right-6 sm:right-12 md:right-16' : 'left-1/2 -translate-x-1/2'
                  }`}>
                    {pageBannerUrls.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePageSlide(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all border-0 cursor-pointer ${
                          idx === (activePageSlide % bannerUrlsCount) ? 'bg-[#d97706] w-4' : 'bg-white/30 hover:bg-white/60'
                        }`}
                        title={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        };

        const renderUniversalPageTitleBar = () => {
          if (!pageTitleBarEnable || isHomeDefault) return null;

          const bgClass = 
            pageTitleBarBg === 'slate' ? 'bg-zinc-100 border-zinc-200 text-zinc-900' :
            pageTitleBarBg === 'zinc' ? 'bg-zinc-50 border-zinc-200 text-zinc-850' :
            pageTitleBarBg === 'white' ? 'bg-white border-zinc-200 text-zinc-900' :
            'bg-transparent border-zinc-200 text-zinc-900';

          const borderClass =
            pageTitleBarBorder === 'minimal' ? 'border-y border-zinc-200' :
            pageTitleBarBorder === 'bold' ? 'border-b-2 border-amber-600 border-t border-zinc-200' :
            pageTitleBarBorder === 'shadow' ? 'shadow-xs border-y border-zinc-250/80' :
            'border-none';

          const sizeClass =
            pageTitleBarFontSize === 'sm' ? 'text-xs sm:text-sm' :
            pageTitleBarFontSize === 'lg' ? 'text-base sm:text-lg' :
            pageTitleBarFontSize === 'xl' ? 'text-lg sm:text-xl md:text-2xl' :
            'text-sm sm:text-base';

          const subtitleSizeClass =
            pageTitleBarFontSize === 'sm' ? 'text-[9px]' :
            pageTitleBarFontSize === 'lg' ? 'text-[11px]' :
            pageTitleBarFontSize === 'xl' ? 'text-xs' :
            'text-[10px]';

          const showCrumbs = layoutShowBreadcrumbs && (currentPage.showBreadcrumbs !== false);

          return (
            <section id="store-page-title-bar" className={`w-full ${bgClass} ${borderClass} py-3.5 px-6 sm:px-12 md:px-16 font-sans relative flex flex-wrap justify-between items-center gap-3 transition-colors duration-305`}>
              <div className="flex flex-col text-left">
                <span className={`${subtitleSizeClass} font-mono font-bold tracking-widest text-[#d97706] uppercase`}>
                  Goldiama Sovereign Allocation
                </span>
                <h3 className={`${sizeClass} font-black uppercase tracking-tight text-zinc-950 mt-0.5`}>
                  {currentPage.title} Portal
                </h3>
              </div>
              {showCrumbs && (
                <div className="text-[10px] font-mono text-zinc-400 select-none flex items-center gap-1.5 bg-black/5 p-1 px-2.5 rounded-md border border-zinc-200/40">
                  <span className="text-zinc-[450] font-medium animate-pulse inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-0.5"></span>
                  <span className="text-zinc-[450] font-medium">Home</span>
                  <span className="text-zinc-350">/</span>
                  <span className="text-zinc-[450] font-medium">{currentPage.title}</span>
                </div>
              )}
            </section>
          );
        };
        
        // Define styling classes dynamically
        const spacingClass = 
          layoutPreset === 'comfortable' ? 'py-16 md:py-24 space-y-12' : 
          layoutPreset === 'compact' ? 'py-8 space-y-6' : 'py-0 space-y-0';

        const alignmentClass = 
          sectionAlign === 'center' ? 'text-center flex flex-col items-center' : 
          sectionAlign === 'justify' ? 'text-justify' : 'text-left';

        // Standard Home / Default Frontpage View
        if (isHomeDefault) {
          return (
            <div className="flex-1">
              
              {/* Subtle Hero Proclamation */}
              {renderHeroBannersSection()}

              {/* Home Default Grid (Bento Showcase structure) */}
              <section className="max-page-width px-5 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bento Main Spotlight bar */}
                  <div className="md:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-zinc-950 transition-all shadow-3xs">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#d97706] uppercase tracking-widest block mb-1">CERTIFIED PURITY</span>
                      <h2 className="text-lg md:text-xl font-bold text-zinc-950 uppercase tracking-tight leading-snug">FINE CAST BULLION INSIGNIA</h2>
                      <p className="text-xs text-zinc-500 mt-2 max-w-md">999.9 sovereign gold minted cast bullion bars with fully encrypted decentralized custody ledger records for complete assurance.</p>
                    </div>
                    {/* Inline Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-100 mt-6 text-left">
                      <div>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase font-semibold">METRIC SPOT PRICE</span>
                        <p className="text-base font-bold text-zinc-900">$2,410.50 / oz</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase font-semibold">CUSTODY INTEGRITY</span>
                        <p className="text-base font-bold text-zinc-900">100% Fully Allocated</p>
                      </div>
                    </div>
                  </div>

                  {/* Spot Tracker Widget */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-950 transition-all shadow-3xs text-center">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5 inline-block uppercase mb-2">LIVE FEEDS OK</span>
                      <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">SPOT GOLD METRIC</h3>
                      <span className="text-2xl font-bold text-zinc-950 block mt-3">$2,410.50</span>
                    </div>
                    <div>
                      <div className="w-full bg-emerald-500/10 h-1.5 rounded-full overflow-hidden mt-4">
                        <div className="bg-emerald-500 w-4/5 h-full rounded-full" />
                      </div>
                      <span className="text-[9.5px] font-mono text-zinc-400 mt-2 block">SECURED ENCRYPTED CONNECTION</span>
                    </div>
                  </div>
                </div>

                {/* Main Product Showcase list (re-using catalogue) */}
                <div className="mt-12 space-y-6">
                  <div className="border-b border-zinc-150 pb-4">
                    <h3 className="text-sm font-sans font-bold text-zinc-950 uppercase tracking-wider">AVAILABLE ALLOCATIONS</h3>
                    <p className="text-xs text-zinc-500">Acquire authenticated sovereign assets using our instant secure checkout portal.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.slice(0, 3).map((p) => (
                      <div key={p.id} className="group border border-zinc-200 hover:border-zinc-950 transition-all duration-300 rounded-xl overflow-hidden flex flex-col bg-white shadow-3xs">
                        <div onClick={() => setActiveProduct(p)} className="h-64 overflow-hidden relative bg-zinc-50 cursor-pointer">
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-505 group-hover:scale-105" />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block">{p.category}</span>
                            <h3 className="font-sans font-bold text-sm text-zinc-900 leading-tight block mt-1">{p.name}</h3>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-bold text-zinc-900">${p.price.toFixed(2)}</span>
                            <button
                              onClick={() => {
                                addToCart(p, 1);
                                if (headerShowCart) setIsCartOpen(true);
                              }}
                              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white font-medium uppercase tracking-wider rounded-lg text-[10px]"
                            >
                              Acquire
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredProducts.length > 3 && (
                    <div className="text-center pt-6">
                      <button
                        onClick={() => setActiveSlug('/shop')}
                        className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-mono font-bold uppercase rounded-lg transition-all cursor-pointer"
                      >
                        Browse Complete Catalog
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          );
        }

        // Render Page Layout Frame with Customizable presets
        const renderTemplateContent = () => {
          switch (currentPage.template) {
            case 'Blank Page':
              return (
                <div className="py-16 text-center space-y-4 font-sans max-w-lg mx-auto">
                  <div className="w-14 h-14 bg-zinc-50 border border-zinc-350 border-dashed rounded-full flex items-center justify-center mx-auto">
                    <span className="text-[12px] font-mono text-[#d97706] font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-zinc-900 uppercase">Pruned Blank Slate Active</h3>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Dynamic structural preset rules are successfully loaded. This represents an unpopulated design workspace canvas where custom layout sections load without presets overlay.</p>
                  </div>
                </div>
              );

            case 'Bento Showcase':
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full h-full">
                  <div className="col-span-2 bg-zinc-50 border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-[#d97706] uppercase block mb-1">SPOTLIGHT ALLOCATION</span>
                      <h4 className="text-sm font-bold text-zinc-955 uppercase">{currentPage.title} Overview</h4>
                      <p className="text-xs text-zinc-500 mt-2">Certified 999.9 pure fine cast gold bars with verified serial tokens.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-150 mt-6">
                      <div>
                        <span className="text-[8px] font-mono text-zinc-400 uppercase">Spot Rate</span>
                        <p className="text-xs font-bold text-zinc-900">$2,410.50</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-zinc-400 uppercase">Assay Vault</span>
                        <p className="text-xs font-bold text-zinc-900">Zurich, CH</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-zinc-400 uppercase">Index Status</span>
                        <p className="text-xs font-bold text-emerald-650">Active</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between text-center">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase block">CUSTODY INTEGRITY</span>
                      <span className="text-2xl font-bold text-zinc-950 mt-4 block">100%</span>
                      <p className="text-[10px] text-zinc-400 mt-1">Sovereign Allocated Ledger</p>
                    </div>
                  </div>
                </div>
              );

            case 'Infinite Scroll':
              return (
                <div className="space-y-8 text-left w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-100">
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1 text-[11px] rounded-full transition-all cursor-pointer font-semibold ${
                            selectedCategory === cat 
                              ? 'bg-zinc-955 text-white' 
                              : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Filter elements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1 border border-zinc-200 bg-white text-xs text-zinc-900 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((p) => (
                      <div key={p.id} className="group border border-zinc-200 hover:border-zinc-950 transition-all duration-300 rounded-xl overflow-hidden flex flex-col bg-white shadow-3xs">
                        <div onClick={() => setActiveProduct(p)} className="h-64 overflow-hidden relative bg-zinc-50 cursor-pointer">
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <span className="text-[10px] uppercase text-zinc-400 block">{p.category}</span>
                            <span className="font-sans font-bold text-sm text-zinc-900 block mt-0.5">{p.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-zinc-900">${p.price.toFixed(2)}</span>
                            <button
                              onClick={() => {
                                addToCart(p, 1);
                                if (headerShowCart) setIsCartOpen(true);
                              }}
                              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] uppercase rounded-lg"
                            >
                              Acquire
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'Editorial Story':
              return (
                <div className="max-w-2xl mx-auto space-y-6 text-left leading-relaxed text-zinc-650 font-sans text-xs w-full">
                  <div className="border-b border-zinc-150 pb-5">
                    <span className="text-[10px] font-mono text-[#d97706] font-bold block uppercase tracking-widest mb-1.5">EDITORIAL ESSAY LOG</span>
                    <h2 className="text-md font-bold text-zinc-955 uppercase">{currentPage.title}</h2>
                  </div>
                  <p className="text-[13px] leading-relaxed text-zinc-750">
                    Our commitment ensures complete ecological alignment from sovereign shaft extraction to luxury certified vault deposits in Zurich. By partnering solely with verified refiners, we enforce compliance at every point of the supply chain.
                  </p>
                  <p className="text-[13px] leading-relaxed text-zinc-750">
                    Each allocation registered contains a unique, unalterable digital ledger ID corresponding directly to physical custody dimensions, allowing instant audibility.
                  </p>
                  <div className="border-l-2 border-amber-500 pl-4 py-1 italic font-sans text-zinc-850">
                    "Ethical stewardship is not a secondary tier choice – it defines our primary metals sovereign standards."
                  </div>
                </div>
              );

            case 'Minimal Form':
            default:
              return (
                <div className="max-w-md mx-auto bg-zinc-50 border border-zinc-205 p-6 md:p-8 rounded-2xl text-left font-sans text-xs w-full">
                  <div className="space-y-1 pb-4 border-b border-zinc-150 mb-4">
                    <span className="text-[10px] font-mono text-[#d97706] font-bold uppercase block tracking-wider">SECURE CONCIERGE TRANSMISSION</span>
                    <h4 className="text-xs font-bold text-zinc-900 uppercase">Direct Allocations Portal</h4>
                  </div>

                  {contactSuccessMsg ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl space-y-2 text-center animate-fade-in font-mono text-[10px]">
                      <p className="font-bold uppercase">TRANSMISSION OK</p>
                      <p className="font-sans text-[11px] text-zinc-650">{contactSuccessMsg}</p>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!contactName || !contactEmail || !contactMessage) return;
                        setContactSuccessMsg('Message securely encrypted and dispatched. A certified sovereign concierge advisor will call your token within 1 business hour.');
                        setTimeout(() => {
                          setContactName('');
                          setContactEmail('');
                          setContactSubject('');
                          setContactMessage('');
                        }, 5000);
                      }} 
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Full Legal Name</label>
                        <input 
                          type="text" 
                          required 
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Your Name Address" 
                          className="w-full p-2.5 border border-zinc-205 bg-white rounded-lg" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Secure Email Address</label>
                        <input 
                          type="email" 
                          required 
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="token@domain.com" 
                          className="w-full p-2.5 border border-zinc-205 bg-white rounded-lg" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Security Subject Code</label>
                        <input 
                          type="text" 
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="e.g., Vault Verification" 
                          className="w-full p-2.5 border border-zinc-205 bg-white rounded-lg" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Enquiry Details Message</label>
                        <textarea 
                          required 
                          rows={3}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Details of physical allocation queries..." 
                          className="w-full p-2.5 border border-zinc-205 bg-white rounded-lg resize-none" 
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 text-white font-mono uppercase tracking-wider text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Dispatch Concierge Ticket
                      </button>
                    </form>
                  )}
                </div>
              );
          }
        };

        // Render wrapping frames according to selected Page Layout Presentation Mode preset
        return (
          <div className="flex-1">

            {renderHeroBannersSection()}
            {renderUniversalPageTitleBar()}
            {renderUniversalPageBanner()}

            <div className={`max-page-width px-5 ${spacingClass}`}>
              
              {containerMode === 'boxed' && (
                <div className={`bg-white border border-zinc-200 shadow-3xs rounded-2xl p-6 md:p-12 ${alignmentClass}`}>
                  <div>
                    <span className="text-[10px] font-mono text-[#d97706] font-bold uppercase tracking-widest">{currentPage.title.toUpperCase()}</span>
                    <h2 className="text-xl font-bold text-zinc-955 uppercase mt-1.5 mb-6 tracking-tight leading-tight">{currentPage.title} Portal</h2>
                  </div>
                  <div className="w-full mt-2">
                    {renderTemplateContent()}
                  </div>
                </div>
              )}

              {containerMode === 'full-width' && (
                <div className={`bg-white border-y border-zinc-150 p-6 md:p-10 w-full ${alignmentClass}`}>
                  <div>
                    <span className="text-[10px] font-mono text-[#d97706] font-bold uppercase tracking-widest">{currentPage.title.toUpperCase()}</span>
                    <h2 className="text-xl font-bold text-zinc-955 uppercase mt-1.5 mb-6 tracking-tight leading-tight">{currentPage.title} Full-Width Interface</h2>
                  </div>
                  <div className="w-full">
                    {renderTemplateContent()}
                  </div>
                </div>
              )}

              {containerMode === 'split-panels' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                  {/* Left Column info panel */}
                  <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between shadow-3xs">
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono text-[#d97706] font-bold uppercase tracking-widest">AUXILIARY META OVERVIEW</span>
                      <h2 className="text-sm font-sans font-black text-zinc-955 uppercase">{currentPage.title}</h2>
                      <p className="text-xs text-zinc-550 leading-relaxed">This page is rendered in Premium Split Panel layout mode, separating metadata indicators and credentials columns from the template body workspace.</p>
                    </div>
                    <div className="pt-6 border-t border-zinc-150 mt-6 space-y-2">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">Physical Audit Token</span>
                      <p className="text-[11px] font-mono font-medium text-zinc-805">CUST-ALLOC-65239-A</p>
                    </div>
                  </div>

                  {/* Right Column Core Workspace Panel */}
                  <div className={`lg:col-span-8 bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-3xs ${alignmentClass}`}>
                    <div className="w-full text-xs font-sans">
                      {renderTemplateContent()}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        );

      })()}

      {/* 5. SLIDE-OUT SHOPPING CART PANEL */}
      {headerShowCart && isCartOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-xs flex justify-end">
          {/* Overlay area click triggers dismiss */}
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
          
          <div id="cart-drawer-panel" className="relative w-full max-w-md bg-white border-l border-zinc-200 p-6 shadow-2xl flex flex-col justify-between h-full z-55">
            
            <div className="space-y-6 flex-1 flex flex-col overflow-y-auto pr-1">
              {/* Cart Title Header */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-zinc-800" />
                  <span className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-900">Your Basket</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <span className="p-4 bg-zinc-50 rounded-full text-zinc-400 font-mono text-sm leading-none flex items-center justify-center border border-zinc-100">
                    EMPTY
                  </span>
                  <p className="text-xs font-sans text-zinc-400 leading-relaxed max-w-[220px]">
                    Your custom mechanical hardware selection is empty. Explore and add items here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-zinc-100">
                  {cart.map((item) => (
                    <div key={item.product.id} className="pt-4 flex gap-4 first:pt-0">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        className="w-16 h-16 object-cover border border-zinc-100 rounded-[2px]"
                      />
                      <div className="flex-1 space-y-1.5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-sans font-semibold text-xs text-zinc-900 max-w-[150px] truncate block">{item.product.name}</span>
                            <span className="font-mono text-xs text-zinc-900 font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">SKU: {item.product.sku}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors rounded-[2px]"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono text-zinc-800">{item.quantity}</span>
                            <button
                              onClick={() => {
                                if (item.quantity < item.product.stock) {
                                  updateCartQuantity(item.product.id, item.quantity + 1);
                                }
                              }}
                              className="p-1 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors rounded-[2px]"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[10px] font-mono text-red-500 hover:text-red-700 flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subtotals & Trigger Checkout */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-zinc-100 bg-white space-y-4">
                <div className="space-y-1.5 text-xs text-zinc-500 font-sans">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-zinc-900">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Allocation (8%)</span>
                    <span className="font-mono text-zinc-900">${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard Ground Shipping</span>
                    <span className="font-mono text-zinc-900">${flatShipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 pt-3 text-zinc-900 font-semibold">
                    <span className="uppercase text-[11px] tracking-wide">GRAND TOTAL DUE</span>
                    <span className="font-mono text-sm">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setShowCheckoutModal(true);
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider rounded-[3px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  PROCEED SECURE CHECKOUT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. PRODUCT DETAILS MODAL (WITH FULL DYNAMIC REVIEWS FEEDBACK SYSTEM) */}
      {activeProduct && (
        <div className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl border border-zinc-200 shadow-xl p-6 md:p-8 rounded-2xl text-xs font-sans max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 mb-6">
              <span className="font-mono text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{activeProduct.category} DETAILS DRAW SHEET</span>
              <button onClick={() => setActiveProduct(null)} className="p-2 text-zinc-400 hover:text-zinc-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-zinc-100">
              
              {/* Left Column Image */}
              <div className="h-72 md:h-96 bg-zinc-50 border border-zinc-150 rounded-xl overflow-hidden shadow-xs">
                <img src={activeProduct.imageUrl} alt={activeProduct.name} className="w-full h-full object-cover" />
              </div>

              {/* Right Column Specs */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="bg-zinc-50 border border-zinc-200 text-zinc-500 px-2.5 py-1 rounded-lg font-mono text-[10px]">{activeProduct.sku}</span>
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 mt-2">{activeProduct.name}</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold font-mono text-zinc-950">${activeProduct.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1 border-l border-zinc-200 pl-3">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="font-mono font-semibold">{activeProduct.rating || 'New'}</span>
                      <span className="text-zinc-400">({activeProduct.reviewsCount} verified reviews)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Material Specifications</span>
                    <p className="text-zinc-600 text-xs leading-relaxed">{activeProduct.description}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between w-64 border-b border-zinc-100 py-1">
                      <span className="text-zinc-400 font-mono text-[10px]">INVENTORY STATUS</span>
                      <span className={`font-semibold ${activeProduct.stock > 0 ? 'text-zinc-800' : 'text-red-500'}`}>
                        {activeProduct.stock > 0 ? `${activeProduct.stock} units responsive` : 'SOLD OUT'}
                      </span>
                    </div>
                    <div className="flex justify-between w-64 border-b border-zinc-100 py-1">
                      <span className="text-zinc-400 font-mono text-[10px]">SHIPPING TIMEFRAME</span>
                      <span className="text-zinc-600 font-mono">EST: DISPATCH TODAY</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      addToCart(activeProduct, 1);
                      if (headerShowCart) setIsCartOpen(true);
                      setActiveProduct(null);
                    }}
                    disabled={activeProduct.stock === 0}
                    className="w-full md:w-auto px-8 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                  >
                    {activeProduct.stock > 0 ? 'Acquire Element & Add To Basket' : 'CATALOGUE DEPLETED'}
                  </button>
                </div>
              </div>

            </div>

            {/* INTEGRATED CUSTOMER REVIEWS PORTAL */}
            <div className="mt-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight uppercase font-mono text-zinc-950">Customer Reviews Feedback</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">REAL-TIME PUBLIC EVALUATIONS</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual stats and reviews aggregator */}
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Average Weight Metric</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-zinc-900 font-mono">{activeProduct.rating || '—'}</span>
                      <span className="text-zinc-400">/ 5.0</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star 
                          key={st} 
                          className={`w-3.5 h-3.5 ${
                            st <= Math.round(activeProduct.rating) 
                              ? 'text-yellow-500 fill-yellow-500' 
                              : 'text-zinc-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono pt-1 block">{activeProduct.reviewsCount} verified audits</span>
                  </div>

                  {/* Star indicators */}
                  <div className="space-y-2 pt-2 border-t border-zinc-250/20 text-[10px] font-mono text-zinc-500">
                    <div className="flex justify-between items-center">
                      <span>5 Star</span>
                      <div className="flex-1 mx-3 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-zinc-800 h-full rounded-full" style={{ width: activeProduct.reviewsCount > 0 ? `${(activeProduct.reviews.filter(r => r.rating === 5).length / activeProduct.reviewsCount) * 100}%` : '0%' }} />
                      </div>
                      <span>{activeProduct.reviews.filter(r => r.rating === 5).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>4 Star</span>
                      <div className="flex-1 mx-3 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-zinc-800 h-full rounded-full" style={{ width: activeProduct.reviewsCount > 0 ? `${(activeProduct.reviews.filter(r => r.rating === 4).length / activeProduct.reviewsCount) * 100}%` : '0%' }} />
                      </div>
                      <span>{activeProduct.reviews.filter(r => r.rating === 4).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>3 Star or Less</span>
                      <div className="flex-1 mx-3 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-zinc-800 h-full rounded-full" style={{ width: activeProduct.reviewsCount > 0 ? `${(activeProduct.reviews.filter(r => r.rating <= 3).length / activeProduct.reviewsCount) * 100}%` : '0%' }} />
                      </div>
                      <span>{activeProduct.reviews.filter(r => r.rating <= 3).length}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive review submission card */}
                <div className="md:col-span-2 bg-zinc-50/50 border border-zinc-200 p-5 rounded-xl">
                  <h4 className="font-mono text-[10px] font-bold text-zinc-800 uppercase tracking-wider mb-3">Compose Evaluation entry</h4>
                  
                  {reviewSubmittedMessage ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-sm font-sans flex items-center justify-center min-h-[140px]">
                      <span>{reviewSubmittedMessage}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] text-zinc-500 block">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Julian V."
                            value={reviewAuthor}
                            onChange={(e) => setReviewAuthor(e.target.value)}
                            className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-900 font-sans cursor-text"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] text-zinc-500 block">Review Headline</label>
                          <input
                            type="text"
                            required
                            placeholder="Perfect and Weighted"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-900 font-sans cursor-text"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] text-zinc-500">Rating Grade:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="p-0.5 text-zinc-400 hover:text-yellow-500 text-lg transition-colors cursor-pointer"
                              >
                                <Star className={`w-4 h-4 ${star <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-200'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            id="reviews-rep"
                            checked={reviewRec}
                            onChange={(e) => setReviewRec(e.target.checked)}
                            className="rounded-sm border-zinc-300 text-zinc-900 accent-zinc-900"
                          />
                          <label htmlFor="reviews-rep" className="font-mono text-[9px] text-zinc-500 select-none cursor-pointer">
                            I recommend this artifact
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-zinc-500 block">Review Commentary</label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Your precise material evaluations, tactile feedback, or architectural layout critique."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-905 text-zinc-900"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                      >
                        File Verified Entry
                      </button>
                    </form>
                  )}
                </div>

              </div>

              {/* Verified review lists */}
              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <span className="font-mono text-[10px] font-bold text-zinc-800 block">Chronological Activity Log ({activeProduct.reviews.length})</span>
                
                <div className="space-y-3.5">
                  {activeProduct.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 border border-zinc-200 bg-white rounded-xl space-y-2 hover:border-zinc-950 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-zinc-900 text-xs">{rev.author}</span>
                            <span className="text-[10px] font-mono text-zinc-400">— Verified Purchase</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <Star key={st} className={`w-3 h-3 ${st <= rev.rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-medium text-zinc-950 font-sans text-xs">{rev.title}</h5>
                        <p className="text-zinc-600 text-xs leading-relaxed">{rev.comment}</p>
                      </div>

                      {rev.recommended && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono bg-emerald-50/50 border border-emerald-100 px-2 py-0.5 rounded-[2px] w-fit">
                          <Check className="w-3 h-3" />
                          <span>RECOMMEND ED ARTIFACT</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {activeProduct.reviews.length === 0 && (
                    <p className="text-xs text-zinc-400 italic text-center py-6 font-mono">
                      No customer evaluation entries filed yet. Be the first to file one.
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 7. STATEFUL CHECKOUT SANDBOX & PAYMENT PORTAL OUTSIDE */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl border border-zinc-200 shadow-xl p-6 md:p-8 rounded-2xl text-xs font-sans max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 mb-6">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-900">Encrypted checkout portal</span>
              </div>
              <button 
                onClick={() => {
                  setShowCheckoutModal(false);
                  setCheckoutProcessState('idle');
                }} 
                className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* A: IDLE SUBMISSION FORM */}
            {checkoutProcessState === 'idle' && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">Shipping Demographics</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-zinc-500 block">Deliveree Full Name*</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Julian V."
                        value={billName}
                        onChange={(e) => setBillName(e.target.value)}
                        className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-900 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-zinc-500 block">Electronic Mail (Anchor)*</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="julian@aether.io"
                        value={billEmail}
                        onChange={(e) => setBillEmail(e.target.value)}
                        className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-900 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-zinc-500 block">Delivery Street Address*</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="42 Portobello Road"
                      value={billAddress}
                      onChange={(e) => setBillAddress(e.target.value)}
                      className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-900 focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-zinc-500 block">Zip Code (Zip)*</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="W11 1DJ"
                        value={billZip}
                        onChange={(e) => setBillZip(e.target.value)}
                        className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-900 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-zinc-500 block">City*</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="London"
                        value={billCity}
                        onChange={(e) => setBillCity(e.target.value)}
                        className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-900 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Gateway Card Details</span>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">SANDBOX CARD TEST</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 block">16-Digit Card Credentials*</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={19}
                      placeholder="4111 2222 3333 4444"
                      value={billCardNumber}
                      onChange={(e) => setBillCardNumber(formatCardNumber(e.target.value))}
                      className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-900 font-mono focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-zinc-500 block">Expiration Term (MM/YY)*</label>
                      <input 
                        type="text" 
                        required 
                        maxLength={5}
                        placeholder="12/28"
                        value={billExpiry}
                        onChange={(e) => setBillExpiry(e.target.value)}
                        className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-900 font-mono focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-zinc-500 block">Security Key (CVV)*</label>
                      <input 
                        type="password" 
                        required 
                        maxLength={3}
                        placeholder="•••"
                        value={billCvv}
                        onChange={(e) => setBillCvv(e.target.value.replace(/\D/g,''))}
                        className="w-full p-2 border border-zinc-200 bg-white rounded-sm text-zinc-900 font-mono focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Subtotals representation */}
                <div className="bg-zinc-50 p-4 border border-zinc-100 font-sans space-y-1 text-zinc-630">
                  <div className="flex justify-between">
                    <span>Invoiced Price due</span>
                    <span className="font-mono font-semibold text-zinc-900">${grandTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug pt-1 font-sans italic">
                    By clicking submit, you authorize transaction simulation against this sandbox gateway. Actual stocks are depleted and order reports instantly file in real time into administrator records.
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex justify-end gap-3 font-mono">
                  <button 
                    type="button" 
                    onClick={() => setShowCheckoutModal(false)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 uppercase tracking-wider text-[10px] font-bold cursor-pointer"
                  >
                    Back to mat
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white uppercase tracking-wider text-[10px] font-bold cursor-pointer"
                  >
                    Authorize Billable
                  </button>
                </div>

              </form>
            )}

            {/* B: CARD IS AUTHORIZING ON NETWORK */}
            {checkoutProcessState === 'authorizing' && (
              <div className="py-16 flex flex-col items-center justify-center space-y-5 text-center">
                <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                <div>
                  <h4 className="font-mono text-xs uppercase font-bold text-zinc-850">Securing Liquid Clearing</h4>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1">DISPATCHING TELEMETRY CHECKS AND ENFORCING LEDGER MATCHES...</p>
                </div>
              </div>
            )}

            {/* C: TRANSACTION DISPATCH SUCCESS RECEIPT */}
            {checkoutProcessState === 'success' && (
              <div className="py-6 flex flex-col items-center space-y-6 text-center text-zinc-800 font-sans">
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase tracking-tight font-sans text-zinc-900">Purchase Completed & Logged</h4>
                  <p className="text-zinc-500 max-w-sm leading-relaxed text-xs">
                    Gateway has approved clearance metrics. Inventory stocks were realigned, and order files recorded dynamically in real time.
                  </p>
                </div>

                <div className="w-80 border border-zinc-100 p-4 bg-zinc-50/50 space-y-2.5 font-mono text-left max-w-full text-[11px] text-zinc-600">
                  <div className="flex justify-between">
                    <span>LIQUID ID:</span>
                    <span className="font-bold text-zinc-900">{completedOid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COURIER ASSIGN:</span>
                    <span className="text-zinc-900">{completedOTracking}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200/50 pt-2 font-bold text-zinc-900">
                    <span>CLEAR BILLING PRICE:</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setCheckoutProcessState('idle');
                  }}
                  className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono uppercase tracking-wider text-[10px] rounded-sm transition-colors cursor-pointer"
                >
                  Dismiss Receipt
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 📘 DYNAMIC MODAL: COMPLIANCE PORTAL */}
      {showComplianceModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in animate-duration-200">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowComplianceModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-950 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-zinc-100 pb-3 text-left">
              <span className="text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest block mb-1">{headerCompliancePopupBadge}</span>
              <h3 className="font-sans font-black text-zinc-950 text-base md:text-md uppercase tracking-tight flex items-center gap-2">
                <ComplianceIconComponent className="w-5 h-5 text-zinc-950" />
                {headerCompliancePopupTitle}
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-650 font-sans leading-relaxed text-left">
              {(() => {
                const s = localStorage.getItem('min_eco_header_compliance_sections');
                if (s) {
                  try {
                    const parsed = JSON.parse(s);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      return parsed.map((sec, idx) => (
                        <div key={idx} className={sec.highlighted ? "p-3 bg-zinc-50 border border-[#d97706]/20 bg-[#d97706]/5 rounded-xl flex items-start gap-2.5" : "p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1"}>
                          {sec.highlighted ? (
                            <>
                              <div className="h-4 w-4 rounded-full bg-[#d97706]/20 text-[#d97706] font-mono text-[9px] font-bold flex items-center justify-center mt-0.5" id={`comp-badge-${idx}`}>ⓘ</div>
                              <div className="space-y-1 flex-1">
                                <div className="font-bold text-amber-800 text-[10px] uppercase font-mono">{sec.title}</div>
                                <p className="text-[11px] text-[#b45309] whitespace-pre-line">
                                  {sec.text}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-bold text-zinc-950 font-mono text-[10px] uppercase">{sec.title}</div>
                              <p className="text-[11px] text-zinc-500 whitespace-pre-line">
                                {sec.text}
                              </p>
                            </>
                          )}
                        </div>
                      ));
                    }
                  } catch (e) {
                    console.error("Failed to parse dynamic compliance sections", e);
                  }
                }
                return (
                  <>
                    {headerComplianceSec1Title && (
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                        <div className="font-bold text-zinc-950 font-mono text-[10px] uppercase">{headerComplianceSec1Title}</div>
                        <p className="text-[11px] text-zinc-500 whitespace-pre-line">
                          {headerComplianceSec1Text}
                        </p>
                      </div>
                    )}

                    {headerComplianceSec2Title && (
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                        <div className="font-bold text-zinc-950 font-mono text-[10px] uppercase">{headerComplianceSec2Title}</div>
                        <p className="text-[11px] text-zinc-500 whitespace-pre-line">
                          {headerComplianceSec2Text}
                        </p>
                      </div>
                    )}

                    {headerComplianceSec3Title && (
                      <div className="p-3 bg-zinc-50 border border-[#d97706]/20 bg-[#d97706]/5 rounded-xl flex items-start gap-2.5">
                        <div className="h-4 w-4 rounded-full bg-[#d97706]/20 text-[#d97706] font-mono text-[9px] font-bold flex items-center justify-center mt-0.5">ⓘ</div>
                        <div className="space-y-1 flex-1">
                          <div className="font-bold text-amber-800 text-[10px] uppercase font-mono">{headerComplianceSec3Title}</div>
                          <p className="text-[11px] text-[#b45309] whitespace-pre-line">
                            {headerComplianceSec3Text}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowComplianceModal(false)}
                className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-sans font-bold text-[10px] rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Accept and Dismiss Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📞 DYNAMIC MODAL: CONCIERGE DESK CONTACTS */}
      {showConciergeModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in animate-duration-200">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowConciergeModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-950 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-zinc-100 pb-3 text-left">
              <span className="text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest block mb-1">{headerConciergePopupBadge}</span>
              <h3 className="font-sans font-black text-zinc-950 text-base md:text-md uppercase tracking-tight flex items-center gap-2">
                <ConciergeIconComponent className="w-5 h-5 text-zinc-950" />
                {headerConciergePopupTitle}
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-650 font-sans leading-relaxed text-left">
              <p className="text-zinc-500 text-[11px] whitespace-pre-line">
                {headerConciergePopupSub}
              </p>

              {(() => {
                const b = localStorage.getItem('min_eco_header_concierge_boxes');
                if (b) {
                  try {
                    const parsed = JSON.parse(b);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1 text-left">
                          {parsed.map((box, idx) => (
                            <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">{box.title}</span>
                              <div className={`font-sans font-extrabold break-all ${idx % 2 === 1 ? 'text-[#d97706]' : 'text-zinc-900'}`}>{box.val}</div>
                              <span className="text-[10px] text-zinc-500 font-mono">{box.tag}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                  } catch (e) {
                    console.error("Failed to parse dynamic concierge boxes", e);
                  }
                }
                return (headerConciergeBox1Title || headerConciergeBox2Title) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1 text-left">
                    {headerConciergeBox1Title && (
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">{headerConciergeBox1Title}</span>
                        <div className="font-sans font-extrabold text-zinc-900">{headerConciergeBox1Val}</div>
                        <span className="text-[10px] text-zinc-500 font-mono">{headerConciergeBox1Tag}</span>
                      </div>
                    )}

                    {headerConciergeBox2Title && (
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-left">
                        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">{headerConciergeBox2Title}</span>
                        <div className="font-sans font-extrabold text-[#d97706]">{headerConciergeBox2Val}</div>
                        <span className="text-[10px] text-zinc-500 font-mono">{headerConciergeBox2Tag}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {headerConciergeHighlightTitle && (
                <div className="p-4 bg-zinc-900 text-white rounded-xl space-y-1.5 shadow-md">
                  <div className="font-sans font-black text-xs text-amber-400 uppercase">{headerConciergeHighlightTitle}</div>
                  <p className="text-[11px] text-zinc-300 leading-normal whitespace-pre-line">
                    {headerConciergeHighlightText}
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-1 items-start sm:items-center">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase font-black">{headerConciergeHighlightLabel}</span>
                    <span className="text-[10px] font-mono text-amber-400 underline font-bold uppercase">{headerConciergeHighlightVal}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConciergeModal(false)}
                className="px-5 py-2.5 bg-zinc-950 hover:bg-[#1f1f23] text-white font-sans font-bold text-[10px] rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Dismiss Desk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER METADATA DESIGNS */}
      <footer id="store-disclaimer-footer" className="max-page-width px-5 py-8 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-400 gap-4 mt-12 bg-white">
        <span>© 2026 GOLDIAMA TRUST & CO. ALL RIGHTS RESERVED.</span>
        <button
          onClick={() => {
            if (window.confirm("Do you want to clear your local workspace cache and synchronize with the latest live catalog updates from the central cloud database?")) {
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
          className="text-zinc-400 hover:text-zinc-850 transition-colors cursor-pointer uppercase flex items-center gap-1 font-mono hover:underline text-[9px]"
        >
          <span>🔄 Clear Sync Cache</span>
        </button>
        <span>SYSTEM CONNECTION STATUS: ONLINE</span>
      </footer>

    </div>
  );
};
