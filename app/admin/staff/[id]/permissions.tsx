import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View
} from "react-native";
import { useTheme } from '../../../../context/ThemeContext';
import { showErrorToast, showSuccessToast } from '../../../../utils/errorHandler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StaffMember {
  _id: string;
  name: string;
  role: string;
  lastLogin: string | null;
  isActive: boolean;
  createdAt: string;
  permissions?: {
    viewProducts?: boolean;      // Default: true, compulsory
    scanProducts?: boolean;      // Default: true
    registerProducts?: boolean;  // Default: true
    addProducts?: boolean;       // Default: true
    processSales?: boolean;      // Default: true
  };
}

export default function StaffPermissionsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState({
    viewProducts: true,      // Always true, compulsory
    scanProducts: true,
    registerProducts: true,
    addProducts: true,
    processSales: true,
  });

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/auth/staff/${id}`);
      if (response.data.success) {
        const staffData = response.data.data;
        setStaff(staffData);
        setPermissions(staffData.permissions || {
          viewProducts: true,
          scanProducts: true,
          registerProducts: true,
          addProducts: true,
          processSales: true,
        });
      }
    } catch (error: any) {
      console.error('Error fetching staff details:', error);
      showErrorToast(error, "Failed to load staff details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (key: keyof typeof permissions) => {
    // Prevent disabling viewProducts as it's compulsory
    if (key === 'viewProducts') return;
    
    // If disabling addProducts, also disable registerProducts
    if (key === 'addProducts' && permissions.addProducts) {
      setPermissions(prev => ({ 
        ...prev, 
        [key]: false,
        registerProducts: false 
      }));
      return;
    }
    
    // If enabling registerProducts, also enable addProducts
    if (key === 'registerProducts' && !permissions.registerProducts && !permissions.addProducts) {
      setPermissions(prev => ({ 
        ...prev, 
        [key]: true,
        addProducts: true 
      }));
      return;
    }
    
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const savePermissions = async () => {
    if (!staff) return;

    setSaving(true);
    try {
      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/staff/${staff._id}/permissions`,
        { permissions }
      );

      if (response.data.success) {
        showSuccessToast("Permissions Updated", `${staff.name}'s permissions have been updated`);
        router.back();
      } else {
        throw new Error(response.data.error || 'Failed to update permissions');
      }
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      showErrorToast(error, "Update Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>
            Loading staff details...
          </Text>
        </View>
      </View>
    );
  }

  if (!staff) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Staff member not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const permissionItems = [
    {
      key: 'viewProducts',
      label: 'View Products',
      icon: 'eye-outline',
      description: 'View all products and stock levels',
      isCompulsory: true,
      color: '#34C759'
    },
    {
      key: 'scanProducts',
      label: 'Scan Products',
      icon: 'scan-outline',
      description: 'Access barcode scanner functionality',
      isCompulsory: false,
      color: '#007AFF',
      note: 'If disabled, scan page will be restricted'
    },
    {
      key: 'registerProducts',
      label: 'Register Products',
      icon: 'add-circle-outline',
      description: 'Register new products after scanning',
      isCompulsory: false,
      color: '#FF9500',
      note: 'If disabled, shows permission modal after scanning'
    },
    {
      key: 'addProducts',
      label: 'Add Products',
      icon: 'cube-outline',
      description: 'Add inventory to existing products',
      isCompulsory: false,
      color: '#5856D6',
      note: 'If disabled, register products is automatically disabled'
    },
    {
      key: 'processSales',
      label: 'Process Sales',
      icon: 'cart-outline',
      description: 'Complete sales transactions',
      isCompulsory: false,
      color: '#FF3B30',
      note: 'If disabled, sales section hidden from home screen'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Staff Permissions</Text>
          <Text style={[styles.headerSubtitle, { color: theme.subtext }]}>
            {staff.name}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Staff Info Card */}
        <View style={[styles.staffInfoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.staffAvatar, { backgroundColor: '#007AFF' + '20' }]}>
            <Ionicons name="person" size={32} color="#007AFF" />
          </View>
          <View style={styles.staffInfo}>
            <Text style={[styles.staffName, { color: theme.text }]}>{staff.name}</Text>
            <View style={styles.staffMeta}>
              <View style={[styles.roleBadge, { backgroundColor: '#007AFF' + '15' }]}>
                <Text style={[styles.roleText, { color: '#007AFF' }]}>Staff Member</Text>
              </View>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: staff.isActive ? '#34C759' + '15' : '#FF3B30' + '15' }
              ]}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: staff.isActive ? '#34C759' : '#FF3B30' }
                ]} />
                <Text style={[
                  styles.statusText, 
                  { color: staff.isActive ? '#34C759' : '#FF3B30' }
                ]}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Permissions Section */}
        <View style={styles.permissionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            PERMISSIONS
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.subtext }]}>
            Control what {staff.name} can do in the app. Some permissions affect others automatically.
          </Text>

          {permissionItems.map((item) => (
            <View
              key={item.key}
              style={[
                styles.permissionCard,
                { 
                  backgroundColor: theme.surface, 
                  borderColor: theme.border,
                  opacity: item.isCompulsory ? 0.7 : 1
                }
              ]}
            >
              <View style={styles.permissionHeader}>
                <View style={[styles.permissionIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.permissionContent}>
                  <View style={styles.permissionTitleRow}>
                    <Text style={[styles.permissionLabel, { color: theme.text }]}>
                      {item.label}
                    </Text>
                    {item.isCompulsory && (
                      <View style={[styles.compulsoryBadge, { backgroundColor: '#34C759' + '15' }]}>
                        <Text style={[styles.compulsoryText, { color: '#34C759' }]}>
                          Required
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.permissionDescription, { color: theme.subtext }]}>
                    {item.description}
                  </Text>
                  {item.note && (
                    <Text style={[styles.permissionNote, { color: '#FF9500' }]}>
                      Note: {item.note}
                    </Text>
                  )}
                </View>
                <Switch
                  value={permissions[item.key as keyof typeof permissions]}
                  onValueChange={() => togglePermission(item.key as keyof typeof permissions)}
                  trackColor={{ true: item.color, false: theme.border }}
                  disabled={item.isCompulsory}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <Pressable
            onPress={savePermissions}
            disabled={saving}
            style={[
              styles.saveButton,
              { 
                backgroundColor: theme.primary,
                opacity: saving ? 0.7 : 1
              }
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Save Permissions</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  staffInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 30,
  },
  staffAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  staffMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  permissionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  permissionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  permissionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  permissionContent: {
    flex: 1,
    marginRight: 12,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  compulsoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  compulsoryText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  permissionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  permissionNote: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  saveSection: {
    marginTop: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});