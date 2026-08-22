export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  mrp: number;
  discount: number;
  unit: string;
  category: string;
  shopId: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}
