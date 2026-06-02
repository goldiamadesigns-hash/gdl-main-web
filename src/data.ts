/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Order, Customer } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Aether Mechanical Keyboard',
    description: 'A masterpiece of tactile responsiveness. Precision-milled anodized aluminum chassis, hot-swappable linear quiet switches, and solid PBT keycaps with laser-etched minimalist typography.',
    price: 189.00,
    category: 'Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    stock: 14,
    rating: 4.8,
    reviewsCount: 3,
    sku: 'KB-AETH-01',
    reviews: [
      {
        id: 'rev-1',
        author: 'Julian V.',
        rating: 5,
        title: 'Work of Art',
        comment: 'The keycap texture and solid aluminum frame make writing a pure luxury. Incredibly minimalist, sleek white backlight, and no useless branding logos.',
        date: 'May 12, 2026',
        recommended: true
      },
      {
        id: 'rev-2',
        author: 'Clara S.',
        rating: 5,
        title: 'Perfect silent switches',
        comment: 'Exactly what I needed for long coding sessions. The mechanical feedback is pristine while being completely background-noise friendly.',
        date: 'May 18, 2026',
        recommended: true
      },
      {
        id: 'rev-3',
        author: 'Liam O.',
        rating: 4,
        title: 'Outstanding weight, minor chord',
        comment: 'Very hefty, which keeps it stable on the felt mat. I only wish it had a toggle switch for multi-device profile changing on the face itself instead of the side.',
        date: 'May 20, 2026',
        recommended: true
      }
    ]
  },
  {
    id: 'prod-002',
    name: 'Mono Brass Desk Lamp',
    description: 'A singular uninterrupted solid brass rod casting focused ambient illumination. Warm 2700K integrated LEDs with customizable touch-sensitive dimming and textured concrete footings.',
    price: 145.00,
    category: 'Lighting',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    stock: 22,
    rating: 4.6,
    reviewsCount: 2,
    sku: 'LP-MONO-BR',
    reviews: [
      {
        id: 'rev-4',
        author: 'Thomas G.',
        rating: 5,
        title: 'Stunner on the counter',
        comment: 'Beautiful warm diffuse glow that softens my workspace. The weight of the concrete base is luxurious and the dimmer reaction is immediate.',
        date: 'April 29, 2026',
        recommended: true
      },
       {
        id: 'rev-5',
        author: 'Evelyn P.',
        rating: 4,
        title: 'Minimalist statement',
        comment: 'Stripped of all complexity. The brass finish has a lovely brushed grain. I like it a lot!',
        date: 'May 02, 2026',
        recommended: true
      }
    ]
  },
  {
    id: 'prod-003',
    name: 'Merino Wool Felt Desk Mat',
    description: '100% genuine biodegradable Merino wool felt sheet forming a protective luxury barrier for your mechanical keyboard and mouse. Non-slip cork honeycomb composite underlayment.',
    price: 59.00,
    category: 'Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80',
    stock: 45,
    rating: 4.9,
    reviewsCount: 2,
    sku: 'MT-M wool-GY',
    reviews: [
      {
        id: 'rev-6',
        author: 'Hanna B.',
        rating: 5,
        title: 'Soft and structured',
        comment: 'The quality of the wool is incredibly high-density. No fluffing after several weeks of mouse sliding, and it grips my desk like cement.',
        date: 'May 14, 2026',
        recommended: true
      },
      {
        id: 'rev-7',
        author: 'Nico K.',
        rating: 5,
        title: 'Stops cold hands',
        comment: 'Keeps my palms isolated from the freezing glass veneer table. Plus, it dampens the acoustic tone of the keyboard perfectly.',
        date: 'May 22, 2026',
        recommended: true
      }
    ]
  },
  {
    id: 'prod-004',
    name: 'Chronos Ceramic Slate Watch',
    description: 'A master study in watchmaking rest. Liquid white ceramic capsule with a deep slate black face ring, raw brushed index marker pins, and genuine nubuck calfskin closure.',
    price: 295.00,
    category: 'Lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    stock: 8,
    rating: 4.7,
    reviewsCount: 2,
    sku: 'WT-CHRO-SL',
    reviews: [
      {
        id: 'rev-8',
        author: 'Sophia W.',
        rating: 5,
        title: 'Subtle elegance',
        comment: 'It stands out precisely because it is so understated. Simple ceramic lines, extremely flat profile, leather strap wears beautifully with age.',
        date: 'May 15, 2026',
        recommended: true
      },
      {
        id: 'rev-9',
        author: 'David L.',
        rating: 4,
        title: 'Beautiful but fits tight',
        comment: 'Minimalism at its peak. Be aware that the nubuck strap is a bit stiff for the first 3-4 days but molds itself perfectly to your wrist after.',
        date: 'May 19, 2026',
        recommended: true
      }
    ]
  },
  {
    id: 'prod-005',
    name: 'Acoustic Desk Organizer',
    description: 'Thermo-pressed sound-absorbing container felt shell configured with solid ash hardwood dividers. Arranges technical wires, pocket items, and stationary in neat grid structures.',
    price: 42.00,
    category: 'Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    stock: 28,
    rating: 4.5,
    reviewsCount: 1,
    sku: 'OG-ACST-F1',
    reviews: [
      {
        id: 'rev-10',
        author: 'Aris T.',
        rating: 4,
        title: 'Super neat',
        comment: 'Great touch feedback. Divides my fountain pen collections elegantly on my standing desk.',
        date: 'April 10, 2026',
        recommended: true
      }
    ]
  },
  {
    id: 'prod-006',
    name: 'Bespoke Studio Stool',
    description: 'Three structural sheets of hot-bent Baltic birch laminate joined together with clean steel hardware. Sculpted center saddle to maximize ergonomic bone alignment during tasks.',
    price: 240.00,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
    stock: 5,
    rating: 4.8,
    reviewsCount: 1,
    sku: 'ST-BST-BIR',
    reviews: [
      {
        id: 'rev-11',
        author: 'Marc R.',
        rating: 5,
        title: 'Incredible form and grain',
        comment: 'Absolute mid-century modernist perfection. It works flawlessly as either a side accent piece or primary task stool.',
        date: 'May 11, 2026',
        recommended: true
      }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: '#893427',
    customerName: 'Alex Morgan',
    customerEmail: 'alex.morgan@gmail.com',
    customerAddress: '42 Portobello Road',
    customerCity: 'London',
    customerZip: 'W11 1DJ',
    products: [
      {
        productId: 'prod-005',
        name: 'Acoustic Desk Organizer',
        quantity: 1,
        price: 42.00
      }
    ],
    amount: 49.20, // includes 7.20 shipping
    status: 'Completed',
    date: 'May 25, 2026',
    paymentMethod: 'Apple Pay',
    trackingNumber: 'TRK-98317-UK'
  },
  {
    id: '#A74329',
    customerName: 'Megan Rapinoe',
    customerEmail: 'megan.rap@outlook.com',
    customerAddress: '109 Pike St Floor 3',
    customerCity: 'Seattle',
    customerZip: '98101',
    products: [
      {
        productId: 'prod-002',
        name: 'Mono Brass Desk Lamp',
        quantity: 1,
        price: 145.00
      }
    ],
    amount: 150.75, // includes 5.75 shipping
    status: 'Cancelled',
    date: 'May 26, 2026',
    paymentMethod: 'PayPal',
    trackingNumber: 'TRK-81203-US'
  },
  {
    id: '#B8652C',
    customerName: 'Kristie Mewis',
    customerEmail: 'kristie.mewis@gmail.com',
    customerAddress: 'Sveavägen 45',
    customerCity: 'Stockholm',
    customerZip: '111 34',
    products: [
      {
        productId: 'prod-003',
        name: 'Merino Wool Felt Desk Mat',
        quantity: 2,
        price: 59.00
      }
    ],
    amount: 120.62, // includes 2.62 tax/ship
    status: 'Completed',
    date: 'May 27, 2026',
    paymentMethod: 'Credit Card',
    trackingNumber: 'TRK-00982-SE'
  },
  {
    id: '#C8872F',
    customerName: 'Rose Lavelle',
    customerEmail: 'rose.lavelle@gmail.com',
    customerAddress: 'Istiklal Caddesi 22',
    customerCity: 'Istanbul',
    customerZip: '34433',
    products: [
      {
        productId: 'prod-001',
        name: 'Aether Mechanical Keyboard',
        quantity: 1,
        price: 189.00
      }
    ],
    amount: 200.45, // includes 11.45 shipping
    status: 'Pending',
    date: 'May 28, 2026',
    paymentMethod: 'Stripe',
    trackingNumber: 'TRK-44211-TR'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@gmail.com',
    country: 'United Kingdom',
    city: 'London',
    totalOrders: 1,
    totalSpent: 49.20,
    lastActive: 'May 25, 2026'
  },
  {
    id: 'cust-2',
    name: 'Megan Rapinoe',
    email: 'megan.rap@outlook.com',
    country: 'United States',
    city: 'Seattle',
    totalOrders: 1,
    totalSpent: 145.00,
    lastActive: 'May 26, 2026'
  },
  {
    id: 'cust-3',
    name: 'Kristie Mewis',
    email: 'kristie.mewis@gmail.com',
    country: 'Sweden',
    city: 'Stockholm',
    totalOrders: 1,
    totalSpent: 120.62,
    lastActive: 'May 27, 2026'
  },
  {
    id: 'cust-4',
    name: 'Rose Lavelle',
    email: 'rose.lavelle@gmail.com',
    country: 'Turkey',
    city: 'Istanbul',
    totalOrders: 1,
    totalSpent: 200.45,
    lastActive: 'May 28, 2026'
  },
  {
    id: 'cust-5',
    name: 'Marcus Thorne',
    email: 'marcus.thorne@web.de',
    country: 'Germany',
    city: 'Munich',
    totalOrders: 2,
    totalSpent: 310.00,
    lastActive: 'May 28, 2026'
  }
];
