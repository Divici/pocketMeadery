import { useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { lightTheme } from '../theme';

type Props = {
  onOpenMeads: () => void;
};

const SWIPE_DISTANCE = 120;

export function HomeScreen({ onOpenMeads }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(-SWIPE_DISTANCE, Math.min(0, gesture.dx));
          translateX.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx <= -SWIPE_DISTANCE * 0.65) {
            Animated.timing(translateX, {
              toValue: -SWIPE_DISTANCE,
              duration: 120,
              useNativeDriver: true,
            }).start(() => onOpenMeads());
            return;
          }
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 6,
          }).start();
        },
      }),
    [onOpenMeads, translateX]
  );

  return (
    <View style={styles.container}>
      <HoneycombPattern />

      <View style={styles.centerTextWrap}>
        <Text style={styles.title}>Pocket Meadery</Text>
      </View>

      <View style={styles.latchRail}>
        <Animated.View
          style={[styles.latch, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <Pressable onPress={onOpenMeads}>
            <MaterialCommunityIcons
              name="bee"
              size={24}
              color="#fff"
              style={styles.beeIcon}
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

function HoneycombPattern() {
  const { width, height } = Dimensions.get('window');
  const cell = 34;
  const rowGap = 30;
  const rows = Math.ceil(height / rowGap) + 3;
  const cols = Math.ceil(width / cell) + 4;

  return (
    <View style={styles.patternWrap} pointerEvents="none">
      {Array.from({ length: rows }, (_, row) => (
        <View
          key={`row-${row}`}
          style={[
            styles.patternRowWrap,
            { top: row * rowGap },
            row % 2 === 1 && styles.patternRowOffset,
          ]}
        >
          {Array.from({ length: cols }, (_, col) => (
            <Text key={`cell-${row}-${col}`} style={styles.patternCell}>
              ⬡
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  patternWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternRowWrap: {
    position: 'absolute',
    left: -18,
    flexDirection: 'row',
  },
  patternCell: {
    color: '#9A7C40',
    opacity: 0.18,
    fontSize: 28,
    marginRight: 6,
  },
  patternRowOffset: {
    left: 0,
  },
  centerTextWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: lightTheme.primary,
    textAlign: 'center',
  },
  latchRail: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -28,
    width: SWIPE_DISTANCE + 58,
    alignItems: 'flex-end',
  },
  latch: {
    width: 58,
    height: 56,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    backgroundColor: '#B22020',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  beeIcon: {
    transform: [{ rotate: '180deg' }],
  },
});
