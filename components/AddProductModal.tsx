import { Ionicons } from "@expo/vector-icons";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    View
} from "react-native";
import { ThemedText } from '../components/ThemedText';
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

interface Product {
  _id: string;
  name: string;
  category?: string;
  imageUrl?: string;
  totalQuantity: number;
  barcode?: string;
}

interface AddProductModalProps {
  visible: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  emptyMessage?: string;
}

export const AddProductModal = ({
  visible,
  products,
  onClose,
  onSelectProduct,
  emptyMessage = "No products available"
}: AddProductModalProps) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.title, { color: theme.text }]}>
              Select Product
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={theme.text} />
            </Pressable>
          </View>

          {/* Product List */}
          <FlatList
            data={products.filter(p => p.totalQuantity > 0)}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.productItem,
                  { 
                    backgroundColor: theme.background,
                    borderColor: theme.border 
                  }
                ]}
                onPress={() => onSelectProduct(item)}
              >
                {/* Product Image */}
                <View style={[styles.productImage, { backgroundColor: theme.surface }]}>
                  {item.imageUrl && item.imageUrl !== "cube" ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.image}
                    />
                  ) : (
                    <Ionicons name="cube-outline" size={32} color={theme.subtext} />
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                  <ThemedText style={[styles.productName, { color: theme.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={[styles.productDetails, { color: theme.subtext }]}>
                    {item.category || "Uncategorized"} • Stock: {item.totalQuantity}
                  </ThemedText>
                  {item.barcode && (
                    <ThemedText style={[styles.productBarcode, { color: theme.subtext }]}>
                      {item.barcode}
                    </ThemedText>
                  )}
                </View>

                {/* Add Icon */}
                <Ionicons name="add-circle" size={28} color={theme.primary} />
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={64} color={theme.subtext + "40"} />
                <ThemedText style={[styles.emptyText, { color: theme.subtext }]}>
                  {emptyMessage}
                </ThemedText>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "80%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  productDetails: {
    fontSize: 13,
    marginBottom: 2,
  },
  productBarcode: {
    fontSize: 11,
    fontFamily: "monospace",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 16,
  },
});

