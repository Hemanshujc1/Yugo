import axios, { AxiosInstance } from "axios";
import type { Order, Shop } from "@yugo/shared-types";

export function createApiClient(baseURL: string): AxiosInstance {
  return axios.create({ baseURL, timeout: 10000 });
}

export async function getOrders(client: AxiosInstance): Promise<Order[]> {
  const { data } = await client.get<Order[]>("/orders");
  return data;
}

export async function getShops(client: AxiosInstance): Promise<Shop[]> {
  const { data } = await client.get<Shop[]>("/shops");
  return data;
}