import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, View, type ViewToken } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MOCK_BANNERS } from '@/constants/mock-data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const BANNER_HEIGHT = 160;

export function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % MOCK_BANNERS.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View className="mb-4">
      <FlatList
        ref={flatListRef}
        data={MOCK_BANNERS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: BANNER_WIDTH + 16,
          offset: (BANNER_WIDTH + 16) * index,
          index,
        })}
        renderItem={({ item }) => (
          <Pressable
            className="rounded-2xl overflow-hidden justify-center px-6"
            style={{
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
              backgroundColor: item.bgFrom,
            }}
          >
            <ThemedText
              type="smallBold"
              style={{ color: '#090C14', fontSize: 24, fontWeight: '700', marginBottom: 4 }}
            >
              {item.title}
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: '#090C14', opacity: 0.8, marginBottom: 12 }}
            >
              {item.subtitle}
            </ThemedText>
            <View
              className="self-start rounded-full px-4 py-1.5"
              style={{ backgroundColor: '#090C14' }}
            >
              <ThemedText type="small" style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                {item.cta}
              </ThemedText>
            </View>
          </Pressable>
        )}
      />
      <View className="flex-row justify-center mt-3" style={{ gap: 6 }}>
        {MOCK_BANNERS.map((_, index) => (
          <View
            key={index}
            className="rounded-full"
            style={{
              width: activeIndex === index ? 20 : 6,
              height: 6,
              backgroundColor:
                activeIndex === index ? '#30F2C2' : '#7C8CA3',
            }}
          />
        ))}
      </View>
    </View>
  );
}
