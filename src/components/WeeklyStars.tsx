import { StyleSheet, Text, View } from 'react-native';

interface WeeklyStarsProps {
  met: boolean[];
  streak: number;
}

export function WeeklyStars({ met, streak }: WeeklyStarsProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.stars}>
        {met.map((ok, i) => (ok ? '★' : '☆')).join('')}
      </Text>
      <Text style={styles.label}>Streak: {streak} day{streak === 1 ? '' : 's'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    color: '#fbbf24',
    fontSize: 22,
    letterSpacing: 2,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
  },
});
