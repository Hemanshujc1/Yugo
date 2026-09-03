import { Redirect } from 'expo-router';

import { useDelivery } from '@/state/delivery-context';
import { usePartnerAuth } from '@/state/partner-auth-context';

export default function Index() {
  const { isOnboarded } = usePartnerAuth();
  const { activeDelivery } = useDelivery();

  if (!isOnboarded) {
    return <Redirect href="/(onboarding)" />;
  }

  if (activeDelivery) {
    return <Redirect href="/(delivery)" />;
  }

  return <Redirect href="/(tabs)" />;
}
