import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts, useOrders } from '@/hooks';
import {
  analyticsCards,
  quickActions,
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
  const { products } = useProducts();
  const { orders, acceptOrder, rejectOrder, markOrderReady } = useOrders();

  // Dynamic products, orders and low stock computations
  const totalProductsCount = products.length;
  const lowStockProducts = products.filter(
    (p) => p.isAvailable && p.stockQuantity <= (p.lowStockThreshold ?? 10) && p.stockQuantity > 0
  );
  const lowStockCount = lowStockProducts.length;

  const dynamicSummaryStats = summaryStats.map((stat) => {
    if (stat.key === 'orders') {
      return { ...stat, value: orders.length.toString() };
    }
    if (stat.key === 'products') {
      return { ...stat, value: totalProductsCount.toString() };
    }
    if (stat.key === 'lowStock') {
      return { ...stat, value: lowStockCount.toString() };
    }
    return stat;
  });

  const dynamicLowStockItems = lowStockProducts.map((p) => ({
    id: p.id,
    product: p.name,
    quantity: p.stockQuantity,
    threshold: p.lowStockThreshold ?? 10,
  }));

  const recentOrders = orders.slice(0, 3);

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
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
          {dynamicSummaryStats.map(({ key, ...stat }) => (
            <SummaryCard key={key} {...stat} />
          ))}
        </View>

        <SectionHeader title="Quick Actions" subtitle="Jump into the most common workflows." />
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
              onAccept={() => acceptOrder(order.id)}
              onReject={() => rejectOrder(order.id)}
              onMarkReady={() => markOrderReady(order.id)}
            />
          ))}
        </View>

        <SectionHeader title="Low Stock" subtitle="Products that need restocking soon." />
        <View style={styles.cardColumn}>
          {dynamicLowStockItems.map((item) => (
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
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  actionsGrid: {
    gap: Spacing.two,
    width: '100%',
  },
  cardColumn: {
    gap: Spacing.two,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
