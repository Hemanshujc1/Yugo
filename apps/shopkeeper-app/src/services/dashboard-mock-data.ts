import type { Href } from 'expo-router';

export const shopInfo = {
  name: 'Yugo Supermart',
  location: 'Main Street Market',
};

export const summaryStats = [
  {
    key: 'sales',
    title: 'Total Sales Today',
    value: '$12.4K',
    detail: '+18% from yesterday',
    icon: { ios: 'dollarsign.circle.fill', android: 'attach_money', web: 'paid' },
    tint: '#2563EB',
  },
  {
    key: 'orders',
    title: 'Orders Today',
    value: '42',
    detail: '5 new orders',
    icon: { ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' },
    tint: '#0EA5E9',
  },
  {
    key: 'products',
    title: 'Products',
    value: '510',
    detail: '12 categories',
    icon: { ios: 'cube.box.fill', android: 'inventory_2', web: 'inventory_2' },
    tint: '#10B981',
  },
  {
    key: 'lowStock',
    title: 'Low Stock Items',
    value: '7',
    detail: 'Action required',
    icon: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
    tint: '#F59E0B',
  },
];

export type QuickActionHref = Href;

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  quantity: number;
  status: 'In stock' | 'Low stock' | 'Out of stock';
}

export type CategoryItem = {
  id: string;
  name: string;
  count: number;
};

export const quickActions: Array<{
  key: string;
  title: string;
  description: string;
  href: QuickActionHref;
  icon: { ios: string; android: string; web: string };
}> = [
  {
    key: 'add-product',
    title: 'Add Product',
    description: 'Create a new item listing',
    href: '/products/add',
    icon: { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' },
  },
  {
    key: 'manage-products',
    title: 'Manage Products',
    description: 'Edit stock and pricing',
    href: '/products',
    icon: { ios: 'circle.grid.2x2.fill', android: 'grid_view', web: 'grid_view' },
  },
  {
    key: 'orders',
    title: 'Orders',
    description: 'Review incoming orders',
    href: '/orders',
    icon: { ios: 'tray.full.fill', android: 'receipt_long', web: 'receipt_long' },
  },
  {
    key: 'customers',
    title: 'Customers',
    description: 'View customer activity',
    href: '/customers',
    icon: { ios: 'person.2.fill', android: 'groups', web: 'groups' },
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'Track sales and growth',
    href: '/orders',
    icon: { ios: 'chart.bar.xaxis', android: 'analytics', web: 'analytics' },
  },
  {
    key: 'inventory',
    title: 'Inventory',
    description: 'Check stock levels',
    href: '/products',
    icon: { ios: 'archivebox.fill', android: 'inventory', web: 'inventory' },
  },
  {
    key: 'categories',
    title: 'Categories',
    description: 'Organize product groups',
    href: '/products',
    icon: { ios: 'tag.fill', android: 'label', web: 'label' },
  },
  {
    key: 'settings',
    title: 'Settings',
    description: 'Update your shop profile',
    href: '/profile',
    icon: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  },
];

export const recentOrders = [
  {
    id: 'ORD-1124',
    customer: 'Aarya Patel',
    amount: '$312',
    status: 'Processing',
    statusColor: '#2563EB',
    time: '9:12 AM',
  },
  {
    id: 'ORD-1123',
    customer: 'Nina Shah',
    amount: '$128',
    status: 'Delivered',
    statusColor: '#10B981',
    time: '8:45 AM',
  },
  {
    id: 'ORD-1122',
    customer: 'Ravi Kumar',
    amount: '$529',
    status: 'Pending',
    statusColor: '#F59E0B',
    time: '7:20 AM',
  },
];

export const lowStockItems = [
  {
    id: 'SKU-0591',
    product: 'Organic Rice',
    quantity: 4,
    threshold: 10,
  },
  {
    id: 'SKU-0248',
    product: 'Milk Powder',
    quantity: 8,
    threshold: 12,
  },
  {
    id: 'SKU-0783',
    product: 'Olive Oil',
    quantity: 3,
    threshold: 5,
  },
];

export const analyticsCards = [
  {
    key: 'revenue',
    title: 'Revenue',
    value: '$24.8K',
    detail: '+15% this week',
    icon: { ios: 'chart.bar.fill', android: 'analytics', web: 'analytics' },
  },
  {
    key: 'profit',
    title: 'Profit',
    value: '$8.1K',
    detail: '+12% margin',
    icon: { ios: 'sparkles', android: 'auto_graph', web: 'auto_graph' },
  },
  {
    key: 'orders',
    title: 'Orders',
    value: '146',
    detail: '+10% from last week',
    icon: { ios: 'tray.full.fill', android: 'receipt_long', web: 'receipt_long' },
  },
  {
    key: 'customers',
    title: 'Customers',
    value: '97',
    detail: '+8 new today',
    icon: { ios: 'person.2.fill', android: 'groups', web: 'groups' },
  },
];

export const products: ProductItem[] = [
  {
    id: 'SKU-0543',
    name: 'Premium Coffee Beans',
    category: 'Beverages',
    price: '$16.99',
    quantity: 28,
    status: 'In stock',
  },
  {
    id: 'SKU-0217',
    name: 'Organic Yogurt',
    category: 'Dairy',
    price: '$4.49',
    quantity: 9,
    status: 'Low stock',
  },
  {
    id: 'SKU-0302',
    name: 'Gluten-Free Bread',
    category: 'Bakery',
    price: '$5.99',
    quantity: 0,
    status: 'Out of stock',
  },
  {
    id: 'SKU-0188',
    name: 'Sparkling Water',
    category: 'Beverages',
    price: '$2.49',
    quantity: 74,
    status: 'In stock',
  },
];

export const categories: CategoryItem[] = [
  { id: 'cat-1', name: 'Beverages', count: 42 },
  { id: 'cat-2', name: 'Dairy', count: 28 },
  { id: 'cat-3', name: 'Bakery', count: 16 },
  { id: 'cat-4', name: 'Snacks', count: 34 },
];
