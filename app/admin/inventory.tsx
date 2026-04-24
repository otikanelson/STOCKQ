import { ProductCard } from "@/components/ProductCard";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from "../../context/ThemeContext";
import { useProducts } from "../../hooks/useProducts";

export default function AdminInventory() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

    const { products, loading, refresh } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "totalQuantity" | "risk" | "velocity">("name");
  const [displayMode, setDisplayMode] = useState<"card" | "list" | "rect">("card");
  const [activeTab, setActiveTab] = useState<"registry" | "inventory">("inventory");
  const [globalProducts, setGlobalProducts] = useState<any[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [analytics, setAnalytics] = useState<Record<string, { velocity: number; riskScore: number }>>({});

  // Refresh inventory when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Always force refresh when screen comes into focus
      if (activeTab === "inventory") {
        refresh();
        fetchAnalytics();
      } else {
        fetchGlobalProducts();
      }
    }, [activeTab])
  );
  
  // Separate analytics fetch function
  const fetchAnalytics = async () => {
    try {
      console.log('Fetching analytics from:', `${process.env.EXPO_PUBLIC_API_URL}/analytics/dashboard`);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/analytics/dashboard`);
      console.log('Analytics response:', response.data);
      if (response.data.success) {
        const analyticsMap: Record<string, { velocity: number; riskScore: number }> = {};
        response.data.data.productAnalytics.forEach((item: any) => {
          analyticsMap[item.productId] = {
            velocity: item.velocity,
            riskScore: item.riskScore
          };
        });
        console.log('Analytics map:', analyticsMap);
        setAnalytics(analyticsMap);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Fetch analytics for inventory products
  useEffect(() => {
    if (activeTab === "inventory" && products.length > 0) {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Helper functions
  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return '#FF3B30';
    if (riskScore >= 50) return '#FF9500';
    if (riskScore >= 30) return '#FFCC00';
    return null;
  };

  const getVelocityIndicator = (velocity: number) => {
    if (velocity > 5) return { icon: 'flash' as const, color: '#34C759' };
    if (velocity < 0.5) return { icon: 'hourglass' as const, color: '#FF9500' };
    return null;
  };

  const cycleSortField = () => {
    const fields: Array<"name" | "totalQuantity" | "risk" | "velocity"> = ["name", "totalQuantity", "risk", "velocity"];
    const currentIndex = fields.indexOf(sortField);
    const nextIndex = (currentIndex + 1) % fields.length;
    setSortField(fields[nextIndex]);
  };

  // Fetch global registry products
  const fetchGlobalProducts = async () => {
    setLoadingGlobal(true);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/products/registry/all`
      );
      setGlobalProducts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch global products:", error);
      Toast.show({
        type: "error",
        text1: "Fetch Failed",
        text2: "Could not load global registry",
      });
    } finally {
      setLoadingGlobal(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "registry") {
      fetchGlobalProducts();
    }
  }, [activeTab]);

  const currentProducts = activeTab === "inventory" ? products : globalProducts;
  const currentLoading = activeTab === "inventory" ? loading : loadingGlobal;

  const filteredProducts = useMemo(() => {
    return currentProducts.filter((p) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(searchLower) ||
        (p.barcode && p.barcode.includes(searchQuery)) ||
        (p.category && p.category.toLowerCase().includes(searchLower))
      );
    });
  }, [currentProducts, searchQuery]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortField === "risk" && activeTab === "inventory") {
        const riskA = analytics[a._id]?.riskScore || 0;
        const riskB = analytics[b._id]?.riskScore || 0;
        return riskB - riskA;
      } else if (sortField === "velocity" && activeTab === "inventory") {
        const velA = analytics[a._id]?.velocity || 0;
        const velB = analytics[b._id]?.velocity || 0;
        return velB - velA;
      } else if (sortField === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return (b.totalQuantity || 0) - (a.totalQuantity || 0);
      }
    });
  }, [filteredProducts, sortField, analytics, activeTab]);

  const handleRefresh = async () => {
    if (activeTab === "inventory") {
      await refresh();
      await fetchAnalytics();
    } else {
      await fetchGlobalProducts();
    }
  };

  // FIXED: Handle navigation based on tab
  const handleProductPress = async (item: any) => {
    if (activeTab === "inventory") {
      // Local inventory - navigate directly with product ID
      router.push({
        pathname: "/admin/product/[id]",
        params: { id: item._id },
      });
    } else {
      // Global registry - check if product exists in local inventory first
      try {
        const localProduct = products.find((p) => p.barcode === item.barcode);
        
        if (localProduct) {
          // Product exists in local inventory - navigate to it
          router.push({
            pathname: "/admin/product/[id]",
            params: { id: localProduct._id },
          });
        } else {
          // Product NOT in local inventory - navigate to global product detail page
          router.push({
            pathname: "/admin/product/[id]",
            params: { id: item._id }, // Use global product ID
          });
        }
      } catch (error) {
        console.error("Error checking product:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not verify product status",
        });
      }
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: theme.primary }}>
      {/* Blue Header */}
      <View style={[styles.blueHeader, { backgroundColor: theme.primary }]}>
        <View style={styles.headerTop}>
          <ThemedText style={styles.headerTitle}>Inventory List</ThemedText>
          <View style={styles.headerIcons}>
            <Pressable style={styles.headerIconBtn} onPress={cycleSortField}>
              <Ionicons
                name={sortField === "risk" ? "alert-circle" : sortField === "velocity" ? "speedometer" : "list"}
                size={20}
                color="#FFF"
              />
            </Pressable>
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => {
                const modes: Array<"card" | "list" | "rect"> = ["card", "list", "rect"];
                const nextIndex = (modes.indexOf(displayMode) + 1) % modes.length;
                setDisplayMode(modes[nextIndex]);
              }}
            >
              <Ionicons
                name={displayMode === "card" ? "list" : displayMode === "list" ? "grid-outline" : "grid"}
                size={20}
                color="#FFF"
              />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" style={{ marginLeft: 4 }} />
          <TextInput
            placeholder="Search the products"
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable
            onPress={() => router.push({ pathname: "/admin/scan", params: { initialTab: "lookup" } })}
            style={styles.barcodeBtn}
          >
            <Ionicons name="barcode-outline" size={22} color={theme.primary} />
          </Pressable>
        </View>

        {/* Tab + Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          <Pressable
            onPress={() => setActiveTab("inventory")}
            style={[styles.pill, activeTab === "inventory" && styles.pillActive]}
          >
            <ThemedText style={[styles.pillText, activeTab === "inventory" && styles.pillTextActive]}>
              Inventory ({products.length})
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("registry")}
            style={[styles.pill, activeTab === "registry" && styles.pillActive]}
          >
            <ThemedText style={[styles.pillText, activeTab === "registry" && styles.pillTextActive]}>
              Registry ({globalProducts.length})
            </ThemedText>
          </Pressable>
          {activeTab === "inventory" &&
            Array.from(new Set(products.map(p => p.category || "Uncategorized"))).slice(0, 4).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSearchQuery(searchQuery === cat ? "" : cat)}
                style={[styles.pill, searchQuery === cat && styles.pillActive]}
              >
                <ThemedText style={[styles.pillText, searchQuery === cat && styles.pillTextActive]}>
                  {cat} ({products.filter(p => (p.category || "Uncategorized") === cat).length})
                </ThemedText>
              </Pressable>
            ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <View style={[styles.listContainer, { backgroundColor: theme.background }]}>
        <FlatList
          data={sortedProducts}
          keyExtractor={(item) => item._id || item.barcode}
          contentContainerStyle={styles.listPadding}
          numColumns={displayMode === "rect" ? 2 : 1}
          key={displayMode === "rect" ? "grid" : "list"}
          columnWrapperStyle={displayMode === "rect" ? styles.columnWrapper : undefined}
          refreshControl={
            <RefreshControl refreshing={currentLoading} onRefresh={handleRefresh} tintColor={theme.primary} />
          }
          renderItem={({ item, index }) => {
            const inLocalInventory = activeTab === "registry"
              ? products.some((p) => p.barcode === item.barcode)
              : true;
            const productAnalytics = activeTab === "inventory" ? analytics[item._id] : null;
            const riskScore = productAnalytics?.riskScore || 0;
            const velocity = productAnalytics?.velocity || 0;
            const riskColor = getRiskColor(riskScore);
            const velocityIndicator = getVelocityIndicator(velocity);

            if (displayMode === "list") {
              return (
                <Pressable
                  onPress={() => handleProductPress(item)}
                  style={[styles.listItem, { borderBottomColor: theme.border }]}
                >
                  {riskColor && riskScore > 30 && activeTab === "inventory" && (
                    <View style={[styles.listRiskDot, { backgroundColor: riskColor }]} />
                  )}
                  <View style={{ flex: 2 }}>
                    <ThemedText style={[styles.listName, { color: theme.text }]} numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                    <ThemedText style={[styles.listSubtitle, { color: theme.subtext }]}>
                      {item.barcode || "No SKU"}
                    </ThemedText>
                  </View>
                  <View style={styles.listPill}>
                    <ThemedText style={[styles.listCategory, { color: theme.subtext }]}>
                      {item.category || "General"}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <ThemedText style={[styles.listQty, {
                      color: activeTab === "inventory" && (item.totalQuantity || 0) < 10 ? theme.notification : theme.text
                    }]}>
                      {activeTab === "inventory"
                        ? `${item.totalQuantity || 0} units`
                        : inLocalInventory
                        ? `${products.find(p => p.barcode === item.barcode)?.totalQuantity || 0} units`
                        : "—"}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            }

            if (displayMode === "rect") {
              if (activeTab === "inventory") {
                const prediction = productAnalytics ? { metrics: { riskScore, velocity } } : null;
                return <ProductCard item={item} prediction={prediction as any} sortField={sortField as any} />;
              }
              return <ProductCard item={item} prediction={null} sortField="name" />;
            }

            // Card mode — new design
            return (
              <Pressable
                onPress={() => handleProductPress(item)}
                style={[styles.productCard, { backgroundColor: theme.surface }]}
              >
                {riskColor && riskScore > 30 && activeTab === "inventory" && (
                  <View style={[styles.cardRiskDot, { backgroundColor: riskColor }]} />
                )}
                <View style={styles.cardNumberBadge}>
                  <ThemedText style={[styles.cardNumber, { color: theme.subtext }]}>
                    #{String(index + 1).padStart(2, "0")}
                  </ThemedText>
                  <ThemedText style={[styles.cardPrice, { color: theme.text }]}>
                    {item.genericPrice ? `₦${item.genericPrice}` : ""}
                  </ThemedText>
                </View>
                <View style={[styles.cardImageBox, { backgroundColor: theme.background }]}>
                  {item.imageUrl && item.imageUrl !== "cube" && item.imageUrl !== "" ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="contain" />
                  ) : (
                    <Ionicons name="cube-outline" size={40} color={theme.subtext + "60"} />
                  )}
                </View>
                <ThemedText style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[styles.cardBarcode, { color: theme.subtext }]} numberOfLines={1}>
                  Code: {item.barcode || "N/A"}
                </ThemedText>
                {activeTab === "inventory" ? (
                  <ThemedText style={[styles.cardMeta, { color: theme.subtext }]}>
                    Qty: {item.totalQuantity || 0} units
                  </ThemedText>
                ) : (
                  <View style={{ marginTop: 4 }}>
                    {inLocalInventory ? (
                      <View style={[styles.statusBadge, { backgroundColor: theme.primary + "20" }]}>
                        <Ionicons name="checkmark-circle" size={11} color={theme.primary} />
                        <ThemedText style={[styles.statusText, { color: theme.primary }]}>In Stock</ThemedText>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: "#FF9500" + "20" }]}>
                        <Ionicons name="alert-circle" size={11} color="#FF9500" />
                        <ThemedText style={[styles.statusText, { color: "#FF9500" }]}>No Stock</ThemedText>
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="archive-outline" size={48} color={theme.subtext} />
              <ThemedText style={[styles.emptyText, { color: theme.subtext }]}>No products found</ThemedText>
            </View>
          }
        />
      </View>

      {/* Floating Add Button */}
      <Pressable
        onPress={() => router.push("/admin/add-products")}
        style={[styles.fab, { backgroundColor: theme.primary }]}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  blueHeader: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  barcodeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  pillActive: {
    backgroundColor: "#FFF",
    borderColor: "#FFF",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
  },
  pillTextActive: {
    color: "#1a6fd4",
  },
  listContainer: {
    flex: 1,
  },
  listPadding: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },
  columnWrapper: { justifyContent: "space-between" },

  productCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardNumberBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardNumber: { fontSize: 12, fontWeight: "700" },
  cardPrice: { fontSize: 13, fontWeight: "800" },
  cardImageBox: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: "100%" },
  cardName: { fontSize: 14, fontWeight: "800", marginBottom: 3 },
  cardBarcode: { fontSize: 11, marginBottom: 2 },
  cardMeta: { fontSize: 11 },
  cardRiskDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 10, fontWeight: "700" },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  listRiskDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  listName: { fontSize: 14, fontWeight: "700" },
  listSubtitle: { fontSize: 11, marginTop: 2 },
  listPill: {
    backgroundColor: "rgba(150,150,150,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  listCategory: { fontSize: 10 },
  listQty: { fontSize: 13, fontWeight: "700" },

  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: { marginTop: 12, fontSize: 14 },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
