/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  recommended: boolean;
}

export interface Category {
  id: string;
  name: string;
  parentName?: string; // e.g. "Gold", "Silver", or undefined for main categories
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categories?: string[]; // Array of selected Category IDs or Category Names
  imageUrl: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  sku: string;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Completed' | 'Cancelled';

export interface OrderProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  customerZip: string;
  products: OrderProduct[];
  amount: number;
  status: OrderStatus;
  date: string;
  paymentMethod: string;
  trackingNumber: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  country: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastActive: string;
}

export interface MegaMenuConfig {
  bannerTitle: string;
  links: { label: string; href: string }[];
  imageUrl: string;
  imageTitle: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  isMegaMenu: boolean;
  megaMenu?: MegaMenuConfig;
}

export interface HeroSliderItem {
  id: string; // unique sub-id
  title: string;
  subtitle: string;
  desktopImage: string;
  tabletImage: string;
  mobileImage: string;
  ctaText: string;
  ctaLink: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  desktopImage: string;
  tabletImage: string;
  mobileImage: string;
  overlayOpacity: number;
  ctaText: string;
  ctaLink: string;
  heightPreset: 'small' | 'medium' | 'large';
  assignedPageSlug: string; 
  sortOrder: number;
  isActive: boolean;
  slides?: HeroSliderItem[];
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  status: string;
  template: string;
  seoTitle?: string;
  seoDesc?: string;
  seoKeywords?: string;
  showBreadcrumbs?: boolean;
}


