import { Supplier } from '../types/supplier';
import { storageService, STORAGE_KEYS } from './storage-service';

const INITIAL_MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-101',
    name: 'Shree Traders',
    phone: '+91 98765 43210',
    email: 'contact@shreetraders.com',
    address: '14/B, Wholesale Market Road',
    city: 'Bengaluru',
    notes: 'Primary FMCG & grocery distributor for staples and spices.',
    isActive: true,
    receiptCount: 18,
    totalPurchaseValue: 184520,
    lastReceivedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sup-102',
    name: 'Metro Wholesale',
    phone: '+91 91234 56789',
    email: 'orders@metrowholesale.in',
    address: 'Plot 88, Industrial Suburb, Yeshwanthpur',
    city: 'Bengaluru',
    notes: 'Bulk beverage and packaged food supplier.',
    isActive: true,
    receiptCount: 12,
    totalPurchaseValue: 142800,
    lastReceivedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sup-103',
    name: 'Bangalore FMCG Distributors',
    phone: '+91 99887 76655',
    email: 'info@blrfmcg.com',
    address: 'Shop 40, APMC Yard, Yeshwanthpur',
    city: 'Bengaluru',
    notes: 'Dairy, edible oils, and personal care products.',
    isActive: true,
    receiptCount: 8,
    totalPurchaseValue: 96400,
    lastReceivedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sup-104',
    name: 'Sri Lakshmi Agencies',
    phone: '+91 98112 23344',
    email: 'srilakshmi.agencies@gmail.com',
    address: 'No 5, Grain Market Street',
    city: 'Mysore',
    notes: 'Rice, wheat flour, and pulses specialist.',
    isActive: true,
    receiptCount: 5,
    totalPurchaseValue: 62100,
    lastReceivedAt: new Date(Date.now() - 3600000 * 140).toISOString(),
    createdAt: '2026-04-05T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sup-105',
    name: 'FreshMart Wholesale',
    phone: '+91 94567 89012',
    email: 'sales@freshmartwholesale.com',
    address: 'Building 12, Logistics Park, Hosur Road',
    city: 'Bengaluru',
    notes: 'Snacks, biscuits, and confectionery goods.',
    isActive: true,
    receiptCount: 3,
    totalPurchaseValue: 28500,
    lastReceivedAt: new Date(Date.now() - 3600000 * 200).toISOString(),
    createdAt: '2026-05-20T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

let mockSuppliers: Supplier[] = [...INITIAL_MOCK_SUPPLIERS];

export const supplierService = {
  async init(): Promise<Supplier[]> {
    const isInit = await storageService.isInitialized();
    if (isInit) {
      const stored = await storageService.getItem<Supplier[] | null>(STORAGE_KEYS.SUPPLIERS, null);
      if (stored && Array.isArray(stored)) {
        mockSuppliers = stored;
        return [...mockSuppliers];
      }
    }
    mockSuppliers = [...INITIAL_MOCK_SUPPLIERS];
    await storageService.setItem(STORAGE_KEYS.SUPPLIERS, mockSuppliers);
    return [...mockSuppliers];
  },

  async persist(): Promise<void> {
    await storageService.setItem(STORAGE_KEYS.SUPPLIERS, mockSuppliers);
  },

  async getSuppliers(searchQuery = ''): Promise<Supplier[]> {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [...mockSuppliers];

    return mockSuppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q))
    );
  },

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    return mockSuppliers.find((s) => s.id === id);
  },

  async createSupplier(data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    notes?: string;
  }): Promise<Supplier> {
    if (!data.name || !data.name.trim()) {
      throw new Error('Supplier name is required.');
    }

    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone ? data.phone.trim() : '',
      email: data.email ? data.email.trim() : undefined,
      address: data.address ? data.address.trim() : '',
      city: data.city ? data.city.trim() : 'Bengaluru',
      notes: data.notes ? data.notes.trim() : undefined,
      isActive: true,
      receiptCount: 0,
      totalPurchaseValue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSuppliers.unshift(newSupplier);
    await this.persist();
    return newSupplier;
  },

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const idx = mockSuppliers.findIndex((s) => s.id === id);
    if (idx === -1) {
      throw new Error(`Supplier with ID ${id} not found.`);
    }

    const updated = {
      ...mockSuppliers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    mockSuppliers[idx] = updated;
    await this.persist();
    return updated;
  },

  async updateSupplierStats(
    supplierId: string,
    purchaseValue: number,
    receiptDateISO: string
  ): Promise<Supplier | undefined> {
    const s = await this.getSupplierById(supplierId);
    if (!s) return undefined;

    return this.updateSupplier(supplierId, {
      receiptCount: s.receiptCount + 1,
      totalPurchaseValue: s.totalPurchaseValue + (purchaseValue > 0 ? purchaseValue : 0),
      lastReceivedAt: receiptDateISO,
    });
  },
};
