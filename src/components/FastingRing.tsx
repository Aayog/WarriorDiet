import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

interface FastingRingProps {
  progress: number;
  remainingLabel: string;
  totalLabel: string;
  size?: number;
}

export function FastingRing({
  progress,
  remainingLabel,
  totalLabel,
  size = 220,
}: FastingRingProps) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.min(1, Math.max(0, progress));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2a2a2a"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4ade80"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.remaining}>{remainingLabel}</Text>
        <Text style={styles.sub}>remaining</Text>
        <Text style={styles.total}>of {totalLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  remaining: {
    color: '#f5f5f5',
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sub: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  total: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
});
