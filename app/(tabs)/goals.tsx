import { Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useFast } from '@/src/context/FastContext';
import { PROTOCOLS } from '@/src/data/protocols';

const GOAL_OPTIONS = [16, 18, 20, 22, 23];

export default function GoalsScreen() {
  const { settings, updateSettings } = useFast();

  return (
    <>
      <Stack.Screen options={{ title: 'Goals & Settings' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionLabel}>Daily goal (hours)</Text>
        <View style={styles.chips}>
          {GOAL_OPTIONS.map((h) => (
            <Pressable
              key={h}
              onPress={() => updateSettings({ goalHours: h })}
              style={[styles.chip, settings.goalHours === h && styles.chipActive]}>
              <Text style={[styles.chipText, settings.goalHours === h && styles.chipTextActive]}>
                {h}h
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>
          End a fast at or above this duration to earn a streak star for the day.
        </Text>

        <Text style={styles.sectionLabel}>Default protocol</Text>
        <View style={styles.chips}>
          {PROTOCOLS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => updateSettings({ defaultProtocolId: p.id })}
              style={[styles.chip, settings.defaultProtocolId === p.id && styles.chipActive]}>
              <Text
                style={[
                  styles.chipText,
                  settings.defaultProtocolId === p.id && styles.chipTextActive,
                ]}>
                {p.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Notifications</Text>
            <Text style={styles.hint}>30 min warning + fast complete</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
            trackColor={{ false: '#333', true: '#166534' }}
            thumbColor="#f5f5f5"
          />
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Disclaimer</Text>
          <Text style={styles.disclaimerBody}>
            This app provides general educational estimates about fasting physiology. It is not
            medical advice. Consult a healthcare provider before extended fasting.
          </Text>
          <Text style={[styles.hint, { marginTop: 12 }]}>
            All data stays on this device. No cloud, no accounts.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    flexGrow: 1,
    gap: 12,
  },
  sectionLabel: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#333',
  },
  chipActive: {
    borderColor: '#4ade80',
    backgroundColor: '#14532d',
  },
  chipText: {
    color: '#ccc',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#ecfdf5',
    fontWeight: '600',
  },
  hint: {
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  switchLabel: {
    color: '#e5e5e5',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    marginTop: 24,
    padding: 14,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  disclaimerTitle: {
    color: '#fbbf24',
    fontWeight: '700',
    marginBottom: 6,
  },
  disclaimerBody: {
    color: '#999',
    lineHeight: 20,
    fontSize: 13,
  },
});
