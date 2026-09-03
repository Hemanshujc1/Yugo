export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  line1: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
}
