import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4ade80',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#2a2a2a',
        },
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#f5f5f5',
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Fast',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'timer', android: 'schedule', web: 'schedule' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'list.bullet', android: 'list', web: 'list' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'star', android: 'star', web: 'star' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
