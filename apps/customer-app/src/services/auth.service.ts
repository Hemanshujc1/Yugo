import { MOCK_USER } from '@/constants/mock-data';
import type { User } from '@/types/user.types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendOtp(phone: string): Promise<{ success: boolean }> {
  await delay(500);
  console.log(`OTP sent to +91 ${phone}`);
  return { success: true };
}

export async function verifyOtp(
  _phone: string,
  _otp: string,
): Promise<{ user: User; token: string }> {
  await delay(500);
  return {
    user: MOCK_USER,
    token: 'mock-jwt-token-' + Date.now(),
  };
}
