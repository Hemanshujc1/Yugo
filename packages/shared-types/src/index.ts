export type UserRole = "admin" | "shopkeeper" | "customer" | "delivery";

export interface Order {
  id: string;
  status: "placed" | "accepted" | "out_for_delivery" | "delivered" | "cancelled";
  shopId: string;
  customerId: string;
  totalAmount: number;
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  latitude: number;
  longitude: number;
}