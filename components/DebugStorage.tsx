import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

export function DebugStorage() {
  const { theme } = useTheme();
  const [storageData, setStorageData] = useState<[string, string | null][]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const loadStorageData = async () => {
    try {
      const keys = [
        'admin_login_pin',
        'admin_pin',
        'admin_security_pin',
        'auth_user_name',
        'auth_user_role',
        'auth_user_id',
        'auth_session_token',
        'auth_staff_pin',
        'staff_login_pin',
        'pin_migration_completed',
        'admin_first_setup'
      ];
      
      const values = await AsyncStorage.multiGet(keys);
      setStorageData(values);
    } catch (error) {
      console.error('Error loading storage data:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadStorageData();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Pressable
        style={[styles.toggleButton, { backgroundColor: theme.primary }]}
        onPress={() => setIsVisible(true)}
      >
        <ThemedText style={styles.toggleText}>Debug Storage</ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: theme.text }]}>AsyncStorage Debug</ThemedText>
        <Pressable
          style={[styles.closeButton, { backgroundColor: theme.background }]}
          onPress={() => setIsVisible(false)}
        >
          <ThemedText style={[styles.closeText, { color: theme.text }]}>×</ThemedText>
        </Pressable>
      </View>
      
      <Pressable
        style={[styles.refreshButton, { backgroundColor: theme.primary }]}
        onPress={loadStorageData}
      >
        <ThemedText style={styles.refreshText}>Refresh</ThemedText>
      </Pressable>

      <ScrollView style={styles.scrollView}>
        {storageData.map(([key, value]) => (
          <View key={key} style={[styles.item, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.key, { color: theme.primary }]}>{key}</ThemedText>
            <ThemedText style={[styles.value, { color: theme.text }]}>
              {value || 'null'}
            </ThemedText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  toggleText: {
    color: '#FFF',
    fontSize: 12,
  },
  container: {
    position: 'absolute',
    top: 150,
    left: 20,
    right: 20,
    maxHeight: 400,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    margin: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshText: {
    color: '#FFF',
    fontSize: 14,
  },
  scrollView: {
    maxHeight: 250,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
  },
  key: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
  },
});