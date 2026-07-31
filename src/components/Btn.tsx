import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

interface BtnProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export function Btn({ label, onPress, variant = 'secondary', style }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'danger' && styles.danger,
        pressed && styles.pressed,
        style,
      ]}>
      <Text
        style={[
          styles.text,
          variant === 'primary' && styles.textPrimary,
          variant === 'danger' && styles.textDanger,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  primary: {
    backgroundColor: '#166534',
    borderColor: '#4ade80',
  },
  danger: {
    borderColor: '#7f1d1d',
    backgroundColor: '#3f1515',
  },
  pressed: {
    opacity: 0.75,
  },
  text: {
    color: '#e5e5e5',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  textPrimary: {
    color: '#ecfdf5',
  },
  textDanger: {
    color: '#fecaca',
  },
});
