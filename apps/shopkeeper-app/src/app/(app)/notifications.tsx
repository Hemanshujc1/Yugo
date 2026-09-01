import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNotifications } from '@/hooks';
import type { AppNotification, NotificationCategory } from '@/types/notification';

type FilterType = 'ALL' | NotificationCategory;

function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getDateGroup(isoString: string): 'Today' | 'Yesterday' | 'Earlier' {
  const date = new Date(isoString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  return 'Earlier';
}

function getCategoryIcon(category: NotificationCategory): string {
  switch (category) {
    case 'ORDER':
      return '📦';
    case 'INVENTORY':
      return '🏷️';
    case 'DELIVERY':
      return '🛵';
    case 'SYSTEM':
      return '⚙️';
    default:
      return '🔔';
  }
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [filter, setFilter] = useState<FilterType>('ALL');

  const filtered = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.category === filter;
  });

  const grouped = {
    Today: filtered.filter((n) => getDateGroup(n.createdAt) === 'Today'),
    Yesterday: filtered.filter((n) => getDateGroup(n.createdAt) === 'Yesterday'),
    Earlier: filtered.filter((n) => getDateGroup(n.createdAt) === 'Earlier'),
  };

  const handleNotificationPress = async (n: AppNotification) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }

    // Perform actionable deep-link navigation
    if (n.entityType === 'ORDER' && n.entityId) {
      router.push({ pathname: '/order-details', params: { orderId: n.entityId } });
    } else if (n.category === 'DELIVERY') {
      router.push('/delivery-operations' as any);
    } else if (n.entityType === 'INVENTORY_ITEM' && n.entityId) {
      router.push(`/inventory-detail/${n.entityId}` as any);
    } else if (n.category === 'INVENTORY') {
      router.push('/(tabs)/explore' as any);
    } else if (n.entityType === 'STOCK_AUDIT') {
      router.push('/stock-audit' as any);
    } else if (n.entityType === 'IMPORT_HISTORY') {
      router.push('/stock-history' as any);
    } else {
      router.push('/(tabs)/index' as any);
    }
  };

  const filterChips: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'ORDER', label: 'Orders' },
    { key: 'INVENTORY', label: 'Inventory' },
    { key: 'DELIVERY', label: 'Delivery' },
    { key: 'SYSTEM', label: 'System' },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Notifications' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          action={
            unreadCount > 0 ? (
              <Button title="Mark all read" variant="secondary" size="sm" onPress={markAllAsRead} />
            ) : undefined
          }
        />

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterChips.map((chip) => {
            const active = filter === chip.key;
            return (
              <Pressable
                key={chip.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? '#2563EB' : theme.backgroundElement,
                    borderColor: active ? '#2563EB' : '#9CA3AF44',
                  },
                ]}
                onPress={() => setFilter(chip.key)}
              >
                <AppText
                  variant="caption"
                  style={{
                    color: active ? '#FFFFFF' : theme.text,
                    fontWeight: active ? '700' : '500',
                  }}
                >
                  {chip.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Grouped Notifications */}
        {filtered.length > 0 ? (
          (['Today', 'Yesterday', 'Earlier'] as const).map((groupKey) => {
            const list = grouped[groupKey];
            if (list.length === 0) return null;

            return (
              <View key={groupKey} style={styles.groupSection}>
                <AppText variant="caption" style={styles.groupTitle}>
                  {groupKey}
                </AppText>

                <View style={styles.listGap}>
                  {list.map((item) => {
                    const icon = getCategoryIcon(item.category);
                    const relTime = getRelativeTime(item.createdAt);

                    return (
                      <Pressable key={item.id} onPress={() => handleNotificationPress(item)}>
                        <ThemedView
                          type="backgroundElement"
                          style={[
                            styles.notifCard,
                            {
                              borderColor: item.isRead ? '#9CA3AF22' : '#2563EB77',
                              borderLeftWidth: item.isRead ? 1 : 4,
                              borderLeftColor: item.isRead ? '#9CA3AF22' : '#2563EB',
                            },
                          ]}
                        >
                          <View style={styles.iconContainer}>
                            <AppText variant="h3">{icon}</AppText>
                          </View>

                          <View style={styles.textContainer}>
                            <View style={styles.titleRow}>
                              <AppText
                                variant="subtitle"
                                style={{
                                  fontWeight: item.isRead ? '600' : '800',
                                  flex: 1,
                                }}
                              >
                                {item.title}
                              </AppText>
                              <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                                {relTime}
                              </AppText>
                            </View>

                            <AppText
                              variant="caption"
                              style={{ color: theme.textSecondary, marginTop: 2 }}
                              numberOfLines={2}
                            >
                              {item.message}
                            </AppText>

                            {item.entityType && (
                              <AppText variant="caption" style={styles.tapActionText}>
                                Tap to view details →
                              </AppText>
                            )}
                          </View>
                        </ThemedView>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })
        ) : (
          <ThemedView type="backgroundElement" style={styles.emptyContainer}>
            <AppText variant="h1" style={{ fontSize: 48, textAlign: 'center' }}>
              🔔
            </AppText>
            <AppText variant="h3" style={{ fontWeight: '700', textAlign: 'center' }}>
              You are all caught up!
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              Important shop updates, order alerts, and inventory warnings will appear here.
            </AppText>
          </ThemedView>
        )}
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
  filterScroll: {
    gap: Spacing.two,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
  },
  groupSection: {
    gap: Spacing.two,
  },
  groupTitle: {
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  listGap: {
    gap: Spacing.two,
  },
  notifCard: {
    borderRadius: 16,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    borderWidth: 1,
  },
  iconContainer: {
    paddingTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tapActionText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 11,
    marginTop: Spacing.one,
  },
  emptyContainer: {
    borderRadius: 20,
    padding: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
});
