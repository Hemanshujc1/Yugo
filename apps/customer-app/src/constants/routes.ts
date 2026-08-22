export const Routes = {
  AUTH: {
    LOGIN: '/auth/login',
    OTP: '/auth/otp',
  },
  TABS: {
    HOME: '/(tabs)',
    SEARCH: '/(tabs)/search',
    ORDERS: '/(tabs)/orders',
    ACCOUNT: '/(tabs)/account',
  },
  PRODUCT: '/product',
  CART: '/cart',
  CHECKOUT: '/checkout',
  TRACKING: '/tracking',
} as const;
