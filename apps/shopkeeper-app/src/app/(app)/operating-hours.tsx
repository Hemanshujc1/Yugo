import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { Stack } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useShopSettings } from '@/hooks';
import { DayOperatingHours, DayOfWeek } from '@/types/shop-settings';

export default function OperatingHoursScreen() {
  const theme = useTheme();
  const { operatingHours, updateOperatingHours } = useShopSettings();

  const [hoursState, setHoursState] = useState<DayOperatingHours[]>([...operatingHours]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleToggleDay = (day: DayOfWeek, isOpen: boolean) => {
    setHoursState((prev) =>
      prev.map((item) => (item.day === day ? { ...item, isOpen } : item))
    );
  };

  const handleSelectTime = (day: DayOfWeek, field: 'openTime' | 'closeTime', time: string) => {
    setHoursState((prev) =>
      prev.map((item) => (item.day === day ? { ...item, [field]: time } : item))
    );
  };

  const handleSaveHours = async () => {
    setIsSubmitting(true);
    setSuccessMsg(false);
    try {
      await updateOperatingHours(hoursState);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to save operating hours:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTimesList = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'];
  const closeTimesList = ['06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Operating Hours' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Operating Hours"
          subtitle="Configure store opening and closing times for each day of the week."
        />

        <View style={{ gap: Spacing.three }}>
          {hoursState.map((item) => (
            <ThemedView key={item.day} type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    {item.day}
                  </AppText>
                  <AppText variant="caption" style={{ color: item.isOpen ? '#10B981' : '#6B7280', fontWeight: '700' }}>
                    {item.isOpen ? `Open (${item.openTime} → ${item.closeTime})` : 'Closed'}
                  </AppText>
                </View>

                <Switch
                  value={item.isOpen}
                  onValueChange={(val) => handleToggleDay(item.day, val)}
                  trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {item.isOpen && (
                <View style={styles.timePickersBox}>
                  {/* Open Time Selector */}
                  <View style={{ gap: 4 }}>
                    <AppText variant="caption" style={{ fontWeight: '700' }}>
                      Opening Time:
                    </AppText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.one }}>
                      {openTimesList.map((t) => {
                        const active = item.openTime === t;
                        return (
                          <Pressable
                            key={t}
                            style={[
                              styles.chip,
                              {
                                backgroundColor: active ? '#2563EB' : theme.background,
                                borderColor: active ? '#2563EB' : '#9CA3AF44',
                              },
                            ]}
                            onPress={() => handleSelectTime(item.day, 'openTime', t)}
                          >
                            <AppText
                              variant="caption"
                              style={{
                                color: active ? '#FFFFFF' : theme.text,
                                fontWeight: active ? '700' : '500',
                                fontSize: 11,
                              }}
                            >
                              {t}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Close Time Selector */}
                  <View style={{ gap: 4 }}>
                    <AppText variant="caption" style={{ fontWeight: '700' }}>
                      Closing Time:
                    </AppText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.one }}>
                      {closeTimesList.map((t) => {
                        const active = item.closeTime === t;
                        return (
                          <Pressable
                            key={t}
                            style={[
                              styles.chip,
                              {
                                backgroundColor: active ? '#2563EB' : theme.background,
                                borderColor: active ? '#2563EB' : '#9CA3AF44',
                              },
                            ]}
                            onPress={() => handleSelectTime(item.day, 'closeTime', t)}
                          >
                            <AppText
                              variant="caption"
                              style={{
                                color: active ? '#FFFFFF' : theme.text,
                                fontWeight: active ? '700' : '500',
                                fontSize: 11,
                              }}
                            >
                              {t}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              )}
            </ThemedView>
          ))}
        </View>

        {successMsg && (
          <AppText variant="caption" style={{ color: '#10B981', fontWeight: '800', textAlign: 'center' }}>
            ✓ Operating hours updated successfully!
          </AppText>
        )}

        <Button
          title={isSubmitting ? 'Saving Hours...' : 'Save Operating Hours'}
          variant="primary"
          onPress={handleSaveHours}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timePickersBox: {
    backgroundColor: '#9CA3AF11',
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.two,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
});
