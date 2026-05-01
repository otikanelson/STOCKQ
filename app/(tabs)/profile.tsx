import { ConfirmationModal } from '@/components/ConfirmationModal';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View
} from "react-native";
import Toast from 'react-native-toast-message';
import { ThemedText } from '../../components/ThemedText';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const [showPinModal, setShowPinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleDeleteAccount = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      if (!deletePin || deletePin.length !== 4) {
        Toast.show({
          type: 'error',
          text1: 'Invalid PIN',
          text2: 'Please enter your 4-digit PIN',
        });
        setIsDeleting(false);
        return;
      }

      // Get stored PIN
      const storedPin = await AsyncStorage.getItem('auth_staff_pin');
      
      if (deletePin !== storedPin) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Failed',
          text2: 'Incorrect PIN',
        });
        setIsDeleting(false);
        return;
      }

      // Call backend to delete account
      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const token = await AsyncStorage.getItem('auth_session_token');
      
      const response = await fetch(`${API_URL}/auth/staff/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pin: deletePin }),
      });

      const data = await response.json();

      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: 'Your account has been permanently deleted',
        });

        // Clear all local data
        await AsyncStorage.clear();

        // Navigate to setup
        setTimeout(() => {
          router.replace('/auth/setup' as any);
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Delete Failed',
          text2: data.error || 'Could not delete account',
        });
      }
    } catch (error) {
      console.error('Delete account error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not delete account',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdatePin = async () => {
    try {
      // Validate new PIN format
      if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        Toast.show({
          type: 'error',
          text1: 'Invalid PIN',
          text2: 'PIN must be exactly 4 digits',
        });
        return;
      }

      // Validate confirmation
      if (newPin !== confirmPin) {
        Toast.show({
          type: 'error',
          text1: 'PIN Mismatch',
          text2: 'New PIN and confirmation do not match',
        });
        return;
      }

      // Get stored PIN based on role
      let pinKey: string;
      let storedPin: string | null;
      
      if (role === 'admin') {
        // Check new admin_login_pin first, fallback to old admin_pin
        storedPin = await AsyncStorage.getItem('admin_login_pin');
        if (!storedPin) {
          storedPin = await AsyncStorage.getItem('admin_pin');
          pinKey = 'admin_pin';
        } else {
          pinKey = 'admin_login_pin';
        }
      } else {
        pinKey = 'auth_staff_pin';
        storedPin = await AsyncStorage.getItem(pinKey);
      }

      // Validate old PIN
      if (oldPin !== storedPin) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Failed',
          text2: 'Current PIN is incorrect',
        });
        return;
      }

      // Update PIN
      await AsyncStorage.setItem(pinKey, newPin);

      Toast.show({
        type: 'success',
        text1: 'PIN Updated',
        text2: 'Your PIN has been changed successfully',
      });

      setShowPinModal(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Could not update PIN',
      });
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    router.replace('/auth/login' as any);
  };

  const getRoleDisplay = () => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'staff':
        return 'Staff Member';
      default:
        return 'User';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return '#FF3B30';
      case 'staff':
        return '#007AFF';
      default:
        return theme.primary;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
      

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Profile</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.avatarContainer, { backgroundColor: getRoleColor() + '20' }]}>
            <Ionicons name="person" size={48} color={getRoleColor()} />
          </View>

          <ThemedText style={[styles.userName, { color: theme.text }]}>{user?.name || 'User'}</ThemedText>

          <View style={[styles.roleBadge, { backgroundColor: getRoleColor() + '20' }]}>
            <Ionicons name={role === 'admin' ? 'shield-checkmark' : 'person'} size={16} color={getRoleColor()} />
            <ThemedText style={[styles.roleText, { color: getRoleColor() }]}>{getRoleDisplay()}</ThemedText>
          </View>

          <ThemedText style={[styles.userId, { color: theme.subtext }]}>ID: {user?.id || 'N/A'}</ThemedText>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>ACCOUNT SETTINGS</ThemedText>

          <Pressable
            style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setShowPinModal(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="key-outline" size={22} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.settingLabel, { color: theme.text }]}>Change PIN</ThemedText>
              <ThemedText style={[styles.settingDesc, { color: theme.subtext }]}>Update your 4-digit access code</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
          </Pressable>

          {role === 'admin' && (
            <Pressable
              style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push('/admin/settings' as any)}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="settings-outline" size={22} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.settingLabel, { color: theme.text }]}>Admin Settings</ThemedText>
                <ThemedText style={[styles.settingDesc, { color: theme.subtext }]}>Manage system configuration</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
            </Pressable>
          )}
        </View>

        {/* Permissions */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>YOUR PERMISSIONS</ThemedText>

          <View style={[styles.permissionsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {role === 'admin' ? (
              <>
                <PermissionItem icon="checkmark-circle" label="Full system access" granted theme={theme} />
                <PermissionItem icon="checkmark-circle" label="Manage inventory" granted theme={theme} />
                <PermissionItem icon="checkmark-circle" label="Process sales" granted theme={theme} />
                <PermissionItem icon="checkmark-circle" label="View analytics" granted theme={theme} />
                <PermissionItem icon="checkmark-circle" label="Manage staff" granted theme={theme} />
                <PermissionItem icon="checkmark-circle" label="System settings" granted theme={theme} />
              </>
            ) : (
              <>
                <PermissionItem 
                  icon={user?.permissions?.viewProducts ? "checkmark-circle" : "close-circle"} 
                  label="View Products" 
                  granted={user?.permissions?.viewProducts ?? true} 
                  theme={theme} 
                />
                <PermissionItem 
                  icon={user?.permissions?.scanProducts ? "checkmark-circle" : "close-circle"} 
                  label="Scan Products" 
                  granted={user?.permissions?.scanProducts ?? true} 
                  theme={theme} 
                />
                <PermissionItem 
                  icon={user?.permissions?.registerProducts ? "checkmark-circle" : "close-circle"} 
                  label="Register Products" 
                  granted={user?.permissions?.registerProducts ?? true} 
                  theme={theme} 
                />
                <PermissionItem 
                  icon={user?.permissions?.addProducts ? "checkmark-circle" : "close-circle"} 
                  label="Add Inventory" 
                  granted={user?.permissions?.addProducts ?? true} 
                  theme={theme} 
                />
                <PermissionItem 
                  icon={user?.permissions?.processSales ? "checkmark-circle" : "close-circle"} 
                  label="Process Sales" 
                  granted={user?.permissions?.processSales ?? true} 
                  theme={theme} 
                />
              </>
            )}
          </View>
        </View>

        {/* Logout Button */}
        <Pressable style={[styles.logoutBtn, { borderColor: '#FF4444' }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF4444" />
          <ThemedText style={styles.logoutText}>Logout from Store</ThemedText>
        </Pressable>

        {/* Delete Account Button */}
        {role === 'staff' && (
          <Pressable 
            style={[styles.deleteBtn, { borderColor: '#FF3B30', backgroundColor: '#FF3B30' + '10' }]} 
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            <ThemedText style={[styles.deleteText, { color: '#FF3B30' }]}>Delete Account Permanently</ThemedText>
          </Pressable>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* PIN Update Modal */}
      <Modal visible={showPinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalIconBox, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="key" size={32} color={theme.primary} />
            </View>

            <ThemedText style={[styles.modalTitle, { color: theme.text }]}>Update PIN</ThemedText>
            <ThemedText style={[styles.modalDesc, { color: theme.subtext }]}>
              Enter your current PIN and choose a new 4-digit code
            </ThemedText>

            <TextInput
              style={[
                styles.pinInput,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              placeholder="Current PIN"
              placeholderTextColor={theme.subtext}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              value={oldPin}
              onChangeText={setOldPin}
            />

            <TextInput
              style={[
                styles.pinInput,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              placeholder="New PIN"
              placeholderTextColor={theme.subtext}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              value={newPin}
              onChangeText={setNewPin}
            />

            <TextInput
              style={[
                styles.pinInput,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              placeholder="Confirm New PIN"
              placeholderTextColor={theme.subtext}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              value={confirmPin}
              onChangeText={setConfirmPin}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border },
                ]}
                onPress={() => {
                  setShowPinModal(false);
                  setOldPin('');
                  setNewPin('');
                  setConfirmPin('');
                }}
              >
                <ThemedText style={{ color: theme.text, }}>Cancel</ThemedText>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handleUpdatePin}>
                <ThemedText style={{ color: '#FFF', }}>Update PIN</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Logout from Store"
        message="Are you sure you want to logout? You'll need to enter your PIN again to access your account."
        confirmText="Logout"
        type="warning"
      />

      {/* Delete Account Confirmation Modal */}
      {role === 'staff' && (
        <ConfirmationModal
          visible={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletePin('');
          }}
          onConfirm={confirmDeleteAccount}
          title="Delete Account"
          message="This will permanently delete your staff account and all associated data. This action cannot be undone."
          confirmText="Delete Forever"
          type="danger"
          requirePinConfirmation={true}
          onPinChange={setDeletePin}
          pinValue={deletePin}
          pinPlaceholder="Staff PIN"
          isLoading={isDeleting}
        />
      )}
    </View>
    </View>
  );
}

interface PermissionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  granted: boolean;
  theme: any;
}

const PermissionItem: React.FC<PermissionItemProps> = ({ icon, label, granted, theme }) => (
  <View style={styles.permissionItem}>
    <Ionicons name={icon} size={18} color={granted ? '#34C759' : '#FF3B30'} />
    <ThemedText style={[styles.permissionLabel, { color: granted ? theme.text : theme.subtext }]}>{label}</ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    },
  profileCard: {
    padding: 30,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
  },
  roleText: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  userId: {
    fontSize: 12,
    },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    },
  permissionsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionLabel: {
    fontSize: 14,
    },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    marginTop: 10,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 14,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    marginTop: 12,
  },
  deleteText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  pinInput: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

