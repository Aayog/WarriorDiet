import { Stack } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useFast } from '@/src/context/FastContext';
import { getProtocol } from '@/src/data/protocols';
import { formatDateTime, formatDuration } from '@/src/utils/time';

export default function HistoryScreen() {
  const { history } = useFast();

  return (
    <>
      <Stack.Screen options={{ title: 'History' }} />
      <FlatList
        style={styles.list}
        contentContainerStyle={history.length === 0 ? styles.emptyWrap : styles.content}
        data={history}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No completed fasts yet.</Text>
        }
        renderItem={({ item }) => {
          const duration = item.endedAt - item.startedAt;
          return (
            <View style={styles.card}>
              <Text style={styles.protocol}>{getProtocol(item.protocolId).name}</Text>
              <Text style={styles.meta}>{formatDateTime(item.startedAt)} → {formatDateTime(item.endedAt)}</Text>
              <Text style={styles.meta}>Duration: {formatDuration(duration)}</Text>
              <Text style={[styles.badge, item.wasGoalMet ? styles.met : styles.missed]}>
                {item.wasGoalMet ? 'Goal met ★' : 'Under goal'}
              </Text>
            </View>
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 10,
  },
  protocol: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: '#999',
    marginTop: 4,
    fontSize: 13,
  },
  badge: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  met: {
    color: '#4ade80',
  },
  missed: {
    color: '#888',
  },
});
