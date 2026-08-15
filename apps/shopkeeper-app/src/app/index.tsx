import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import { AppText, Screen, ThemedView } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  analyticsCards,
  lowStockItems,
  quickActions,
  recentOrders,
  shopInfo,
  summaryStats,
} from '@/services/dashboard-mock-data';
import {
  AnalyticsCard,
  DashboardHeader,
  OrderCard,
  QuickActionCard,
  SectionHeader,
  StockCard,
  SummaryCard,
} from '@/components/dashboard';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}> 
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          shopName={shopInfo.name}
          greeting={`${getGreeting()}, ${shopInfo.name.split(' ')[0]}`}
          date={new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        />

        <SectionHeader title="Today Summary" subtitle="Key shop metrics for the day." />
        <View style={styles.summaryGrid}>
          {summaryStats.map(({ key, ...stat }) => (
            <SummaryCard key={key} {...stat} />
          ))}
        </View>

        <View style={styles.sectionTop}>
          <SectionHeader title="Quick Actions" subtitle="Jump into the most common workflows." />
        </View>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.key}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onPress={() => router.push(action.href)}
            />
          ))}
        </View>

        <SectionHeader title="Recent Orders" subtitle="Monitor the latest orders in real time." />
        <View style={styles.cardColumn}>
          {recentOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() =>
                router.push({ pathname: '/order-details', params: { orderId: order.id } })
              }
            />
          ))}
        </View>

        <SectionHeader title="Low Stock" subtitle="Products that need restocking soon." />
        <View style={styles.cardColumn}>
          {lowStockItems.map((item) => (
            <StockCard key={item.id} item={item} onRestock={() => router.push('/products')} />
          ))}
        </View>

        <SectionHeader title="Analytics Preview" subtitle="Fresh business insights." />
        <View style={styles.analyticsGrid}>
          {analyticsCards.map(({ key, ...card }) => (
            <AnalyticsCard key={key} {...card} />
          ))}
        </View>
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
    paddingBottom: BottomTabInset + Spacing.four,
  },
  summaryGrid: {
    gap: Spacing.three,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionsGrid: {
    gap: Spacing.three,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  cardColumn: {
    gap: Spacing.three,
  },
  analyticsGrid: {
    gap: Spacing.three,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionTop: {
    marginTop: Spacing.two,
  },
});
