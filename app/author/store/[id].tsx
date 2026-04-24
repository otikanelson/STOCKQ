import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import Toast from 'react-native-toast-message';
import { useTheme } from '../../../context/ThemeContext';
import { ThemedText } from '../../../components/ThemedText';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

interface StoreDetails {
  store: {
    _id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    isActive: boolean;
  };
  admins: Array<{
    _id: string;
    name: string;
    lastLogin?: string;
    isActive: boolean;
  }>;
  staff: Array<{
    _id: string;
    name: string;
    createdBy: string;
    lastLogin?: string;
    isActive: boolean;
  }>;
  statistics: {
    totalProducts: number;
    totalSales: number;
    totalRevenue: number;
  };
}

export default function StoreDetailScreen() {
  const { theme, isDark } = useTheme();

  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [details, setDetails] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('Store detail page - ID from params:', id);
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!id || id === 'undefined') {
        console.log('Store detail - No valid ID after timeout, stopping load');
        setLoading(false);
      }
    }, 1000);

    if (id && id !== 'undefined') {
      loadStoreDetails();
    }

    return () => clearTimeout(timeout);
  }, [id]);

  const loadStoreDetails = async () => {
    if (!id || id === 'undefined') {
      console.log('Store detail - Invalid ID, skipping load');
      setLoading(false);
      return;
    }

    console.log('Store detail - Loading details for ID:', id);

    try {
      const sessionToken = await AsyncStorage.getItem('auth_session_token');

      if (!sessionToken) {
        Toast.show({
          type: 'error',
          text1: 'Not Authenticated',
          text2: 'Please log in again',
        });
        router.replace('/auth/login' as any);
        return;
      }

      console.log('Store detail - Making API request to:', `${API_URL}/author/stores/${id}`);

      const response = await axios.get(`${API_URL}/author/stores/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      console.log('Store detail - Response received:', response.data.success);

      if (response.data.success) {
        setDetails(response.data.data);
      }
    } catch (error: any) {
      console.error('Load store details error:', error);
      console.error('Error response:', error.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Load Failed',
        text2: error.response?.data?.error || 'Could not load store details',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStoreDetails();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={[styles.loadingText, { color: theme.text }]}>Loading store details...</ThemedText>
        </View>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.subtext} />
          <ThemedText style={[styles.loadingText, { color: theme.text }]}>Store not found</ThemedText>
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.headerSub, { color: theme.primary }]}>STORE_DETAILS</ThemedText>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>{details.store.name}</ThemedText>
          </View>
        </View>

        {/* Store Info Card */}
        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Store ID:</ThemedText>
              <ThemedText style={[styles.infoValue, { color: theme.text }]}>{details.store._id}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Created:</ThemedText>
              <ThemedText style={[styles.infoValue, { color: theme.text }]}>
                {new Date(details.store.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Status:</ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: details.store.isActive ? '#34C759' + '20' : '#FF3B30' + '20',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.statusText,
                    { color: details.store.isActive ? '#34C759' : '#FF3B30' },
                  ]}
                >
                  {details.store.isActive ? 'Active' : 'Inactive'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>STATISTICS</ThemedText>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="cube-outline" size={28} color="#AF52DE" />
              <ThemedText style={[styles.statValue, { color: theme.text }]}>
                {details.statistics.totalProducts}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>Products</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="cart-outline" size={28} color="#FF9500" />
              <ThemedText style={[styles.statValue, { color: theme.text }]}>
                {details.statistics.totalSales}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>Sales</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="cash-outline" size={28} color="#34C759" />
              <ThemedText style={[styles.statValue, { color: theme.text }]}>
                ${details.statistics.totalRevenue.toFixed(2)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>Revenue</ThemedText>
            </View>
          </View>
        </View>

        {/* Admins */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>
            ADMINS ({details.admins.length})
          </ThemedText>
          {details.admins.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="shield-checkmark-outline" size={40} color={theme.subtext} />
              <ThemedText style={[styles.emptyText, { color: theme.text }]}>No Admins</ThemedText>
            </View>
          ) : (
            <View style={styles.usersList}>
              {details.admins.map((admin) => (
                <View
                  key={admin._id}
                  style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={[styles.userAvatar, { backgroundColor: '#FF9500' + '20' }]}>
                    <Ionicons name="shield-checkmark" size={24} color="#FF9500" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.userName, { color: theme.text }]}>{admin.name}</ThemedText>
                    <ThemedText style={[styles.userRole, { color: theme.subtext }]}>Store Admin</ThemedText>
                    {admin.lastLogin && (
                      <ThemedText style={[styles.userLastLogin, { color: theme.subtext }]}>
                        Last login: {new Date(admin.lastLogin).toLocaleDateString()}
                      </ThemedText>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: admin.isActive ? '#34C759' + '20' : '#FF3B30' + '20',
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusText,
                        { color: admin.isActive ? '#34C759' : '#FF3B30' },
                      ]}
                    >
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Staff */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>
            STAFF ({details.staff.length})
          </ThemedText>
          {details.staff.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="people-outline" size={40} color={theme.subtext} />
              <ThemedText style={[styles.emptyText, { color: theme.text }]}>No Staff</ThemedText>
            </View>
          ) : (
            <View style={styles.usersList}>
              {details.staff.map((staff) => (
                <View
                  key={staff._id}
                  style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={[styles.userAvatar, { backgroundColor: '#34C759' + '20' }]}>
                    <Ionicons name="person" size={24} color="#34C759" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.userName, { color: theme.text }]}>{staff.name}</ThemedText>
                    <ThemedText style={[styles.userRole, { color: theme.subtext }]}>Staff Member</ThemedText>
                    {staff.lastLogin && (
                      <ThemedText style={[styles.userLastLogin, { color: theme.subtext }]}>
                        Last login: {new Date(staff.lastLogin).toLocaleDateString()}
                      </ThemedText>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: staff.isActive ? '#34C759' + '20' : '#FF3B30' + '20',
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusText,
                        { color: staff.isActive ? '#34C759' : '#FF3B30' },
                      ]}
                    >
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 70,
    marginBottom: 30,
    gap: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  infoCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  userLastLogin: {
    fontSize: 11,
    fontWeight: '500',
  },
});
