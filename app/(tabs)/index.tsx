import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Btn } from '@/src/components/Btn';
import { FastingRing } from '@/src/components/FastingRing';
import { WeeklyStars } from '@/src/components/WeeklyStars';
import { useFast, useFastState } from '@/src/context/FastContext';
import { PROTOCOLS, getProtocol } from '@/src/data/protocols';
import { formatDateTime, formatDuration, getMilestone } from '@/src/utils/time';

type EditField = 'start' | 'end' | null;

export default function HomeScreen() {
  const {
    loading,
    activeFast,
    settings,
    streak,
    startFast,
    endFast,
    adjustEndByMinutes,
    setStartedAt,
    setTargetEndAt,
  } = useFast();
  const state = useFastState();
  const [protocolId, setProtocolId] = useState(settings.defaultProtocolId);
  const [editField, setEditField] = useState<EditField>(null);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4ade80" />
      </View>
    );
  }

  if (!activeFast?.isActive || !state) {
    return (
      <>
        <Stack.Screen options={{ title: 'Warrior Diet' }} />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Start a fast</Text>
          <Text style={styles.disclaimer}>
            Educational estimates only — not medical advice.
          </Text>
          <Text style={styles.sectionLabel}>Protocol</Text>
          <View style={styles.chips}>
            {PROTOCOLS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setProtocolId(p.id)}
                style={[styles.chip, protocolId === p.id && styles.chipActive]}>
                <Text style={[styles.chipText, protocolId === p.id && styles.chipTextActive]}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <Btn
            label={`Start ${getProtocol(protocolId).name} fast now`}
            variant="primary"
            onPress={() => startFast(protocolId)}
            style={{ marginTop: 24 }}
          />
          <WeeklyStars met={streak.last7DaysMet} streak={streak.currentStreak} />
        </ScrollView>
      </>
    );
  }

  const protocol = getProtocol(activeFast.protocolId);
  const milestone = getMilestone(state.elapsedHours);
  const hourFloor = Math.floor(state.elapsedHours);

  const onPickerChange = (field: EditField) => (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setEditField(null);
    if (event.type === 'dismissed' || !date) return;
    if (field === 'start') setStartedAt(date.getTime());
    if (field === 'end') setTargetEndAt(date.getTime());
  };

  return (
    <>
      <Stack.Screen options={{ title: protocol.name }} />
      <ScrollView contentContainerStyle={styles.container}>
        <FastingRing
          progress={state.progress}
          remainingLabel={formatDuration(state.remainingMs)}
          totalLabel={formatDuration(state.totalMs)}
        />

        <View style={styles.phaseRow}>
          <View style={styles.phaseDot} />
          <Text style={styles.phase}>{milestone.phase} (est.)</Text>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Started: {formatDateTime(activeFast.startedAt)}</Text>
          <Btn label="Edit" onPress={() => setEditField('start')} style={styles.editBtn} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Ends: {formatDateTime(activeFast.targetEndAt)}</Text>
          <Btn label="Edit" onPress={() => setEditField('end')} style={styles.editBtn} />
        </View>

        {editField === 'start' && (
          <DateTimePicker
            value={new Date(activeFast.startedAt)}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickerChange('start')}
          />
        )}
        {editField === 'end' && (
          <DateTimePicker
            value={new Date(activeFast.targetEndAt)}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickerChange('end')}
          />
        )}

        <Text style={styles.sectionLabel}>Quick adjust</Text>
        <View style={styles.adjustRow}>
          <Btn label="-15 Min" onPress={() => adjustEndByMinutes(-15)} style={styles.adjustBtn} />
          <Btn label="+15 Min" onPress={() => adjustEndByMinutes(15)} style={styles.adjustBtn} />
          <Btn label="+1 Hr" onPress={() => adjustEndByMinutes(60)} style={styles.adjustBtn} />
        </View>

        <View style={styles.insight}>
          <Text style={styles.insightTitle}>Hour {hourFloor}</Text>
          <Text style={styles.insightBody}>{milestone.desc}</Text>
        </View>

        <WeeklyStars met={streak.last7DaysMet} streak={streak.currentStreak} />

        <Btn
          label="End fast early"
          variant="danger"
          onPress={endFast}
          style={{ marginTop: 20, width: '100%' }}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#121212',
    flexGrow: 1,
    gap: 12,
  },
  title: {
    color: '#f5f5f5',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 40,
  },
  disclaimer: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 8,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  phase: {
    color: '#d4d4d4',
    fontSize: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeLabel: {
    color: '#aaa',
    fontSize: 14,
    flex: 1,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustBtn: {
    flex: 1,
  },
  insight: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginTop: 4,
  },
  insightTitle: {
    color: '#4ade80',
    fontWeight: '700',
    marginBottom: 4,
  },
  insightBody: {
    color: '#bbb',
    lineHeight: 20,
  },
});
