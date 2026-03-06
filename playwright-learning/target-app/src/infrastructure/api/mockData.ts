import { User } from '../../domain/entities/User';
import { Product } from '../../domain/entities/Product';
import { Order } from '../../domain/entities/Order';
import { AppSettings } from '../../domain/entities/Settings';
import { createUserId } from '../../domain/valueObjects/UserId';
import { createEmail } from '../../domain/valueObjects/Email';
import { createProductId } from '../../domain/valueObjects/ProductId';
import { createMoney } from '../../domain/valueObjects/Money';

export const mockUsers: User[] = [
  { id: createUserId('u1'), name: '田中太郎', email: createEmail('tanaka@example.com'), role: 'admin', department: '開発部', isActive: true, createdAt: new Date('2024-01-15') },
  { id: createUserId('u2'), name: '鈴木花子', email: createEmail('suzuki@example.com'), role: 'editor', department: '営業部', isActive: true, createdAt: new Date('2024-02-20') },
  { id: createUserId('u3'), name: '佐藤健', email: createEmail('sato@example.com'), role: 'viewer', department: '開発部', isActive: true, createdAt: new Date('2024-03-10') },
  { id: createUserId('u4'), name: '山田美咲', email: createEmail('yamada@example.com'), role: 'editor', department: '企画部', isActive: false, createdAt: new Date('2024-04-05') },
  { id: createUserId('u5'), name: '高橋誠', email: createEmail('takahashi@example.com'), role: 'viewer', department: '営業部', isActive: true, createdAt: new Date('2024-05-12') },
];

export const mockProducts: Product[] = [
  {
    id: createProductId('p1'), name: 'ノートPC Pro', description: '高性能ノートパソコン', category: 'electronics', status: 'active',
    basePrice: createMoney(198000), tags: ['PC', 'ビジネス'],
    variants: [
      { id: 'v1', name: '16GB/512GB', sku: 'NPC-16-512', price: createMoney(198000), stock: 25 },
      { id: 'v2', name: '32GB/1TB', sku: 'NPC-32-1T', price: createMoney(258000), stock: 10 },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: createProductId('p2'), name: 'ワイヤレスマウス', description: 'エルゴノミクスマウス', category: 'electronics', status: 'active',
    basePrice: createMoney(4980), tags: ['周辺機器'],
    variants: [
      { id: 'v3', name: 'ブラック', sku: 'WM-BK', price: createMoney(4980), stock: 100 },
      { id: 'v4', name: 'ホワイト', sku: 'WM-WH', price: createMoney(4980), stock: 80 },
    ],
    createdAt: new Date('2024-02-01'),
  },
  {
    id: createProductId('p3'), name: 'プログラミング入門書', description: 'TypeScriptで学ぶWebプログラミング', category: 'books', status: 'active',
    basePrice: createMoney(3200), tags: ['書籍', 'プログラミング'],
    variants: [
      { id: 'v5', name: '紙版', sku: 'BK-TS-P', price: createMoney(3200), stock: 50 },
      { id: 'v6', name: '電子版', sku: 'BK-TS-E', price: createMoney(2800), stock: 999 },
    ],
    createdAt: new Date('2024-03-01'),
  },
  {
    id: createProductId('p4'), name: 'コーヒー豆セット', description: '厳選3種のコーヒー豆', category: 'food', status: 'active',
    basePrice: createMoney(2500), tags: ['食品', 'ギフト'],
    variants: [
      { id: 'v7', name: '200g×3袋', sku: 'CF-S', price: createMoney(2500), stock: 30 },
      { id: 'v8', name: '500g×3袋', sku: 'CF-L', price: createMoney(5800), stock: 15 },
    ],
    createdAt: new Date('2024-04-01'),
  },
  {
    id: createProductId('p5'), name: 'Tシャツ（ロゴ入り）', description: 'オリジナルロゴTシャツ', category: 'clothing', status: 'draft',
    basePrice: createMoney(3000), tags: ['アパレル'],
    variants: [
      { id: 'v9', name: 'S', sku: 'TS-S', price: createMoney(3000), stock: 20 },
      { id: 'v10', name: 'M', sku: 'TS-M', price: createMoney(3000), stock: 30 },
      { id: 'v11', name: 'L', sku: 'TS-L', price: createMoney(3000), stock: 25 },
    ],
    createdAt: new Date('2024-05-01'),
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-001', customerId: 'u2', customerName: '鈴木花子',
    items: [
      { productId: 'p1', productName: 'ノートPC Pro', variantName: '16GB/512GB', quantity: 1, unitPrice: createMoney(198000) },
    ],
    status: 'delivered', totalAmount: createMoney(198000),
    shippingAddress: { postalCode: '100-0001', prefecture: '東京都', city: '千代田区', line1: '丸の内1-1-1' },
    orderedAt: new Date('2024-06-01'), shippedAt: new Date('2024-06-03'), deliveredAt: new Date('2024-06-05'),
  },
  {
    id: 'ord-002', customerId: 'u3', customerName: '佐藤健',
    items: [
      { productId: 'p2', productName: 'ワイヤレスマウス', variantName: 'ブラック', quantity: 2, unitPrice: createMoney(4980) },
      { productId: 'p3', productName: 'プログラミング入門書', variantName: '電子版', quantity: 1, unitPrice: createMoney(2800) },
    ],
    status: 'shipped', totalAmount: createMoney(12760),
    shippingAddress: { postalCode: '530-0001', prefecture: '大阪府', city: '大阪市北区', line1: '梅田2-2-2' },
    orderedAt: new Date('2024-06-15'), shippedAt: new Date('2024-06-17'),
  },
  {
    id: 'ord-003', customerId: 'u5', customerName: '高橋誠',
    items: [
      { productId: 'p4', productName: 'コーヒー豆セット', variantName: '200g×3袋', quantity: 3, unitPrice: createMoney(2500) },
    ],
    status: 'confirmed', totalAmount: createMoney(7500),
    shippingAddress: { postalCode: '460-0001', prefecture: '愛知県', city: '名古屋市中区', line1: '栄3-3-3' },
    orderedAt: new Date('2024-07-01'),
  },
  {
    id: 'ord-004', customerId: 'u2', customerName: '鈴木花子',
    items: [
      { productId: 'p1', productName: 'ノートPC Pro', variantName: '32GB/1TB', quantity: 1, unitPrice: createMoney(258000) },
      { productId: 'p2', productName: 'ワイヤレスマウス', variantName: 'ホワイト', quantity: 1, unitPrice: createMoney(4980) },
    ],
    status: 'pending', totalAmount: createMoney(262980),
    shippingAddress: { postalCode: '100-0001', prefecture: '東京都', city: '千代田区', line1: '丸の内1-1-1' },
    orderedAt: new Date('2024-07-10'),
  },
];

export const mockSettings: AppSettings = {
  general: { siteName: 'ECサイト管理', language: 'ja', timezone: 'Asia/Tokyo', dateFormat: 'YYYY/MM/DD' },
  notifications: { emailNotifications: true, orderAlerts: true, stockAlerts: false, newsletterSubscription: true },
  security: { twoFactorEnabled: false, sessionTimeout: 30, passwordMinLength: 8, requireSpecialChars: true },
};
