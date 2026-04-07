import { Ionicons } from "@expo/vector-icons";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface StaffMember {
  _id: string;
  name: string;
  role: string;
  permissions: any;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface StaffMonitoringModalProps {
  visible: boolean;
  staff: StaffMember | null;
  onClose: () => void;
}

export function StaffMonitoringModal({ visible, staff, onClose }: StaffMonitoringModalProps) {
  const { theme } = useTheme();

  if (!staff) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.staffName, { color: theme.text }]}>
              {staff.name}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.subtext} />
            </Pressable>
          </View>
          
          <View style={styles.scrollContent}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Staff Monitoring
            </Text>
            <Text style={[styles.infoText, { color: theme.subtext }]}>
              This feature allows you to monitor staff activity without accessing their account directly.
            </Text>
            <Text style={[styles.infoText, { color: theme.subtext }]}>
              Status: {staff.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});