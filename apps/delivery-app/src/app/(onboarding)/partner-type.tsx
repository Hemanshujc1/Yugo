import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Screen } from '@/components/ui/screen';
import { SelectableCard } from '@/components/ui/selectable-card';
import { Spacing } from '@/constants/theme';
import { usePartnerAuth } from '@/state/partner-auth-context';
import type { PartnerType } from '@/types/partner';

const OPTIONS: { type: PartnerType; title: string; description: string }[] = [
  {
    type: 'general',
    title: 'General Partner',
    description: 'Deliver for any shop on YuGo. Full KYC — Aadhaar, driving licence, vehicle RC, and a selfie.',
  },
  {
    type: 'merchant',
    title: 'Merchant Partner',
    description:
      'Deliver exclusively for a shop that has hired you directly. Lighter KYC since the shop vouches for you.',
  },
];

export default function PartnerTypeScreen() {
  const { partnerType, setPartnerType } = usePartnerAuth();
  const [selected, setSelected] = useState<PartnerType | null>(partnerType);

  function handleContinue() {
    if (!selected) return;
    setPartnerType(selected);
    router.push('/documents');
  }

  return (
    <Screen scroll>
      <View style={styles.dots}>
        <ProgressDots total={4} current={2} />
      </View>

      <View style={styles.header}>
        <ThemedText type="h1">How will you deliver?</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Choose the option that matches how you'll be working with YuGo.
        </ThemedText>
      </View>

      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <SelectableCard
            key={option.type}
            title={option.title}
            description={option.description}
            selected={selected === option.type}
            onPress={() => setSelected(option.type)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} disabled={!selected} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dots: { marginBottom: Spacing.four },
  header: { gap: Spacing.one, marginBottom: Spacing.five },
  options: { flex: 1, gap: Spacing.three },
  footer: { paddingBottom: Spacing.two, paddingTop: Spacing.four },
});
