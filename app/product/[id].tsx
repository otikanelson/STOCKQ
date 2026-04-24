import { DisabledButton } from "@/components/DisabledButton";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import { PredictionCard } from "../../components/PredictionCard";
import { useTheme } from "../../context/ThemeContext";
import { useAIPredictions } from "../../hooks/useAIPredictions";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import { useProducts } from "../../hooks/useProducts";
import { ThemedText } from '../../components/ThemedText';

interface Batch {
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  receivedDate?: string;
  price?: number;
}

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isDark } = useTheme();

  // Check feature access for adding batches
  const addAccess = useFeatureAccess('addProducts');

  const { getProductById } = useProducts();
  const { prediction, loading: predictionLoading } = useAIPredictions({ 
    productId: id as string,
    enableWebSocket: true,
    autoFetch: true
  });

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  // Reload product when screen comes into focus (e.g., after adding a batch)
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadProduct();
      }
    }, [id])
  );

  const loadProduct = async () => {
    setLoading(true);
    const data = await getProductById(id as string);
    setProduct(data);
    setLoading(false);
  };

  // Price analytics
  const priceAnalytics = useMemo(() => {
    if (!product) return null;

    const genericPrice = product.genericPrice || null;
    const batches = product.batches || [];
    
    const batchesWithPrice = batches.filter((b: Batch) => b.price && b.price > 0);
    
    if (batchesWithPrice.length === 0) {
      return {
        genericPrice,
        hasBatchPrices: false,
        avgBatchPrice: null,
        minBatchPrice: null,
        maxBatchPrice: null,
      };
    }

    const prices = batchesWithPrice.map((b: Batch) => b.price!);
    const avgBatchPrice = prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length;
    const minBatchPrice = Math.min(...prices);
    const maxBatchPrice = Math.max(...prices);

    return {
      genericPrice,
      hasBatchPrices: true,
      avgBatchPrice,
      minBatchPrice,
      maxBatchPrice,
      priceVariance: maxBatchPrice - minBatchPrice,
    };
  }, [product]);

  // Expiry analytics
  const expiryAnalytics = useMemo(() => {
    if (!product || !product.batches) return null;

    const now = new Date();
    const batches = product.batches;

    const expiringSoon = batches.filter((b: Batch) => {
      const expiry = new Date(b.expiryDate);
      const daysUntilExpiry = Math.ceil(
        (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    const expired = batches.filter((b: Batch) => {
      const expiry = new Date(b.expiryDate);
      return expiry < now;
    });

    return {
      expiringSoonCount: expiringSoon.length,
      expiredCount: expired.length,
      totalBatches: batches.length,
    };
  }, [product]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={[styles.loadingText, { color: theme.text }]}>Loading product...</ThemedText>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.subtext} />
          <ThemedText style={[styles.errorText, { color: theme.text }]}>Product not found</ThemedText>
        </View>
      </View>
    );
  }

  const stockStatus =
    product.totalQuantity === 0
      ? "Out of Stock"
      : product.totalQuantity < 10
        ? "Low Stock"
        : "In Stock";

  const stockColor =
    product.totalQuantity === 0
      ? "#EF4444"
      : product.totalQuantity < 10
        ? "#F59E0B"
        : "#10B981";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: theme.surface }]}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          
          <View style={styles.headerInfo}>
            <ThemedText style={[styles.headerLabel, { color: theme.primary }]}>
              PRODUCT DETAILS
            </ThemedText>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
              {product.name}
            </ThemedText>
          </View>
        </View>

        {/* Wide Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Image
            source={
              product.imageUrl
                ? { uri: product.imageUrl }
                : require("../../assets/images/icon.png")
            }
            style={styles.productImage}
            resizeMode="stretch"
          />
        </View>

        {/* Product Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.infoHeader}>
            <View style={styles.infoMain}>
              <ThemedText style={[styles.productCategory, { color: theme.primary }]}>
                {product.category}
              </ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: stockColor + '20', borderColor: stockColor }]}>
                <Ionicons name="alert-circle" size={14} color={stockColor} />
                <ThemedText style={[styles.statusText, { color: stockColor }]}>
                  {stockStatus}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={24} color={theme.primary} />
              <ThemedText style={[styles.statValue, { color: theme.text }]}>
                {product.totalQuantity}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>
                In Stock
              </ThemedText>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="barcode-outline" size={24} color={theme.primary} />
              <ThemedText style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
                {product.barcode || "N/A"}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>
                Barcode
              </ThemedText>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="layers-outline" size={24} color={theme.primary} />
              <ThemedText style={[styles.statValue, { color: theme.text }]}>
                {product.batches?.length || 0}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.subtext }]}>
                Batches
              </ThemedText>
            </View>
          </View>
        </View>

        {/* AI Prediction Card - Simplified for Users */}
        <PredictionCard 
          prediction={prediction} 
          loading={predictionLoading}
        />

        {/* Price Information */}
        {priceAnalytics && (priceAnalytics.genericPrice || priceAnalytics.hasBatchPrices) && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ThemedText style={[styles.cardTitle, { color: theme.primary }]}>
              PRICE INFORMATION
            </ThemedText>

            {priceAnalytics.genericPrice && (
              <View style={styles.priceRow}>
                <View style={styles.priceInfo}>
                  <Ionicons name="cash-outline" size={20} color={theme.subtext} />
                  <ThemedText style={[styles.priceLabel, { color: theme.subtext }]}>
                    Generic Price
                  </ThemedText>
                </View>
                <ThemedText style={[styles.priceValue, { color: theme.text }]}>
                  ${priceAnalytics.genericPrice.toFixed(2)}
                </ThemedText>
              </View>
            )}

            {priceAnalytics.hasBatchPrices && (
              <>
                <View style={styles.priceRow}>
                  <View style={styles.priceInfo}>
                    <Ionicons name="trending-up-outline" size={20} color={theme.subtext} />
                    <ThemedText style={[styles.priceLabel, { color: theme.subtext }]}>
                      Avg Batch Price
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.priceValue, { color: theme.text }]}>
                    ${priceAnalytics.avgBatchPrice?.toFixed(2)}
                  </ThemedText>
                </View>
                <View style={styles.priceRow}>
                  <View style={styles.priceInfo}>
                    <Ionicons name="swap-horizontal-outline" size={20} color={theme.subtext} />
                    <ThemedText style={[styles.priceLabel, { color: theme.subtext }]}>
                      Price Range
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.priceValue, { color: theme.text }]}>
                    ${priceAnalytics.minBatchPrice?.toFixed(2)} - $
                    {priceAnalytics.maxBatchPrice?.toFixed(2)}
                  </ThemedText>
                </View>
              </>
            )}
          </View>
        )}

        {/* Expiry Analytics */}
        {product.isPerishable && expiryAnalytics && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ThemedText style={[styles.cardTitle, { color: theme.primary }]}>
              EXPIRY STATUS
            </ThemedText>

            <View style={styles.expiryGrid}>
              <View style={styles.expiryItem}>
                <View style={[styles.expiryIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                  <Ionicons name="time-outline" size={24} color="#F59E0B" />
                </View>
                <ThemedText style={[styles.expiryCount, { color: "#F59E0B" }]}>
                  {expiryAnalytics.expiringSoonCount}
                </ThemedText>
                <ThemedText style={[styles.expiryLabel, { color: theme.subtext }]}>
                  Expiring Soon
                </ThemedText>
              </View>

              <View style={styles.expiryItem}>
                <View style={[styles.expiryIcon, { backgroundColor: '#EF4444' + '20' }]}>
                  <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
                </View>
                <ThemedText style={[styles.expiryCount, { color: "#EF4444" }]}>
                  {expiryAnalytics.expiredCount}
                </ThemedText>
                <ThemedText style={[styles.expiryLabel, { color: theme.subtext }]}>
                  Expired
                </ThemedText>
              </View>

              <View style={styles.expiryItem}>
                <View style={[styles.expiryIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={theme.primary} />
                </View>
                <ThemedText style={[styles.expiryCount, { color: theme.primary }]}>
                  {expiryAnalytics.totalBatches}
                </ThemedText>
                <ThemedText style={[styles.expiryLabel, { color: theme.subtext }]}>
                  Total Batches
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Batches */}
        {product.batches && product.batches.length > 0 && (
          <View style={styles.batchesSection}>
            <ThemedText style={[styles.cardTitle, { color: theme.primary }]}>
              BATCH INVENTORY ({product.batches.length})
            </ThemedText>

            {product.batches.map((batch: Batch, index: number) => {
              const expiryDate = new Date(batch.expiryDate);
              const now = new Date();
              const daysUntilExpiry = Math.ceil(
                (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );

              const isExpired = daysUntilExpiry < 0;
              const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

              const expiryColor = isExpired
                ? "#EF4444"
                : isExpiringSoon
                  ? "#F59E0B"
                  : "#10B981";

              return (
                <View
                  key={index}
                  style={[
                    styles.batchItem,
                    { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      borderLeftColor: expiryColor,
                    },
                  ]}
                >
                  <View style={styles.batchHeader}>
                    <View style={styles.batchInfo}>
                      <ThemedText style={[styles.batchNumber, { color: theme.text }]}>
                        {batch.batchNumber}
                      </ThemedText>
                      <ThemedText style={[styles.batchQuantity, { color: theme.primary }]}>
                        {batch.quantity} units
                      </ThemedText>
                    </View>
                    
                    {batch.price && (
                      <ThemedText style={[styles.batchPrice, { color: theme.text }]}>
                        ${batch.price.toFixed(2)}
                      </ThemedText>
                    )}
                  </View>

                  <View style={styles.batchDetails}>
                    <View style={styles.batchDetail}>
                      <Ionicons name="calendar-outline" size={16} color={theme.subtext} />
                      <ThemedText style={[styles.batchDetailText, { color: theme.subtext }]}>
                        Expires: {expiryDate.toLocaleDateString()}
                      </ThemedText>
                    </View>

                    {(batch as any).manufacturerDate && (
                      <View style={styles.batchDetail}>
                        <Ionicons name="construct-outline" size={16} color={theme.subtext} />
                        <ThemedText style={[styles.batchDetailText, { color: theme.subtext }]}>
                          Mfg: {new Date((batch as any).manufacturerDate).toLocaleDateString()}
                        </ThemedText>
                      </View>
                    )}

                    <View style={styles.batchDetail}>
                      <Ionicons name="alert-circle-outline" size={16} color={expiryColor} />
                      <ThemedText style={[styles.batchDetailText, { color: expiryColor }]}>
                        {isExpired
                          ? "Expired"
                          : isExpiringSoon
                            ? `${daysUntilExpiry} days left`
                            : "Good condition"}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Fixed Add Batch Button at Bottom */}
      <View style={[styles.bottomButtonContainer, { backgroundColor: theme.background }]}>
        <DisabledButton
          onPress={() => {
            // Navigate to add-products page with pre-filled data
            router.push({
              pathname: "/(tabs)/add-products",
              params: {
                barcode: product.barcode,
                name: product.name,
                category: product.category,
                imageUrl: product.imageUrl,
                isPerishable: product.isPerishable ? 'true' : 'false',
              }
            });
          }}
          disabled={!addAccess.isAllowed}
          disabledReason={addAccess.reason}
          style={[styles.fixedAddBatchButton, { backgroundColor: "#5B4FE8" }]}
        >
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <ThemedText style={styles.fixedAddBatchText}>Add New Batch</ThemedText>
        </DisabledButton>
      </View>
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
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  
  // Fixed Bottom Button
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  fixedAddBatchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fixedAddBatchText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  
  // Wide Image Container
  imageContainer: {
    width: "100%",
    height: 250,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  
  // Info Card
  infoCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoHeader: {
    marginBottom: 20,
  },
  infoMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productCategory: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Cards
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  
  // Price Rows
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.1)",
  },
  priceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  
  // Expiry Grid
  expiryGrid: {
    flexDirection: "row",
    gap: 15,
  },
  expiryItem: {
    flex: 1,
    alignItems: "center",
  },
  expiryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  expiryCount: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  expiryLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Batches Section
  batchesSection: {
    marginBottom: 20,
  },
  batchItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginTop: 12,
  },
  batchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  batchInfo: {
    flex: 1,
  },
  batchNumber: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  batchQuantity: {
    fontSize: 13,
    fontWeight: "700",
  },
  batchPrice: {
    fontSize: 18,
    fontWeight: "900",
  },
  batchDetails: {
    gap: 8,
  },
  batchDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  batchDetailText: {
    fontSize: 13,
    fontWeight: "600",
  },
});


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Blue Hero Header */}
      <View style={[styles.heroHeader, { backgroundColor: theme.primary }]}>
        <View style={styles.heroNav}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </Pressable>
          <ThemedText style={styles.heroNavTitle}>Product Details</ThemedText>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.heroImageBox}>
          {product.imageUrl && product.imageUrl !== "cube" && product.imageUrl !== "" ? (
            <Image source={{ uri: product.imageUrl }} style={styles.heroImage} resizeMode="contain" />
          ) : (
            <Ionicons name="cube-outline" size={80} color="rgba(255,255,255,0.5)" />
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Name Card */}
        <View style={[styles.nameCard, { backgroundColor: theme.surface }]}>
          <View style={styles.nameRow}>
            <ThemedText style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
              {product.name}
            </ThemedText>
            <View style={[styles.stockBadge, { backgroundColor: stockColor + "20", borderColor: stockColor }]}>
              <View style={[styles.stockDot, { backgroundColor: stockColor }]} />
              <ThemedText style={[styles.stockText, { color: stockColor }]}>{stockStatus}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.categoryLabel, { color: theme.primary }]}>
            {product.category || "Uncategorized"}
          </ThemedText>
        </View>

        {/* Info Rows */}
        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Name</ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.text }]} numberOfLines={1}>{product.name}</ThemedText>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Code</ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.text }]}>{product.barcode || "N/A"}</ThemedText>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Category</ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.text }]}>{product.category || "Uncategorized"}</ThemedText>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Total Stock</ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.text }]}>{product.totalQuantity} units</ThemedText>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: "transparent" }]}>
            <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Batches</ThemedText>
            <ThemedText style={[styles.infoValue, { color: theme.text }]}>{product.batches?.length || 0}</ThemedText>
          </View>
        </View>

        {/* AI Prediction */}
        <PredictionCard prediction={prediction} loading={predictionLoading} />

        {/* Price Information */}
        {priceAnalytics && (priceAnalytics.genericPrice || priceAnalytics.hasBatchPrices) && (
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>PRICE INFORMATION</ThemedText>
            {priceAnalytics.genericPrice && (
              <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Generic Price</ThemedText>
                <ThemedText style={[styles.infoValue, { color: theme.text }]}>₦{priceAnalytics.genericPrice.toFixed(2)}</ThemedText>
              </View>
            )}
            {priceAnalytics.hasBatchPrices && (
              <>
                <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                  <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Avg Batch Price</ThemedText>
                  <ThemedText style={[styles.infoValue, { color: theme.text }]}>₦{priceAnalytics.avgBatchPrice?.toFixed(2)}</ThemedText>
                </View>
                <View style={[styles.infoRow, { borderBottomColor: "transparent" }]}>
                  <ThemedText style={[styles.infoLabel, { color: theme.subtext }]}>Price Range</ThemedText>
                  <ThemedText style={[styles.infoValue, { color: theme.text }]}>₦{priceAnalytics.minBatchPrice?.toFixed(2)} – ₦{priceAnalytics.maxBatchPrice?.toFixed(2)}</ThemedText>
                </View>
              </>
            )}
          </View>
        )}

        {/* Expiry Analytics */}
        {product.isPerishable && expiryAnalytics && (
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>EXPIRY STATUS</ThemedText>
            <View style={styles.expiryGrid}>
              <View style={styles.expiryItem}>
                <View style={[styles.expiryIcon, { backgroundColor: "#F59E0B20" }]}>
                  <Ionicons name="time-outline" size={22} color="#F59E0B" />
                </View>
                <ThemedText style={[styles.expiryCount, { color: "#F59E0B" }]}>{expiryAnalytics.expiringSoonCount}</ThemedText>
                <ThemedText style={[styles.expiryLabel, { color: theme.subtext }]}>Expiring Soon</ThemedText>
              </View>
              <View style={styles.expiryItem}>
                <View style={[styles.expiryIcon, { backgroundColor: "#EF444420" }]}>
                  <Ionicons name="alert-circle-outline" size={22} color="#EF4444" />
                </View>
                <ThemedText style={[styles.expiryCount, { color: "#EF4444" }]}>{expiryAnalytics.expiredCount}</ThemedText>
                <ThemedText style={[styles.expiryLabel, { color: theme.subtext }]}>Expired</ThemedText>
              </View>
              <View style={styles.expiryItem}>
                <View style={[styles.expiryIcon, { backgroundColor: theme.primary + "20" }]}>
                  <Ionicons name="checkmark-circle-outline" size={22} color={theme.primary} />
                </View>
                <ThemedText style={[styles.expiryCount, { color: theme.primary }]}>{expiryAnalytics.totalBatches}</ThemedText>
                <ThemedText style={[styles.expiryLabel, { color: theme.subtext }]}>Total Batches</ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Batches */}
        {product.batches && product.batches.length > 0 && (
          <View style={styles.batchesSection}>
            <ThemedText style={[styles.sectionTitle, { color: theme.primary, marginBottom: 12 }]}>
              BATCH INVENTORY ({product.batches.length})
            </ThemedText>
            {product.batches.map((batch: Batch, index: number) => {
              const expiryDate = new Date(batch.expiryDate);
              const now = new Date();
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isExpired = daysUntilExpiry < 0;
              const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;
              const expiryColor = isExpired ? "#EF4444" : isExpiringSoon ? "#F59E0B" : "#10B981";
              return (
                <View key={index} style={[styles.batchItem, { backgroundColor: theme.surface, borderColor: theme.border, borderLeftColor: expiryColor }]}>
                  <View style={styles.batchHeader}>
                    <View>
                      <ThemedText style={[styles.batchNumber, { color: theme.text }]}>{batch.batchNumber}</ThemedText>
                      <ThemedText style={[styles.batchQty, { color: theme.primary }]}>{batch.quantity} units</ThemedText>
                    </View>
                    {batch.price && <ThemedText style={[styles.batchPrice, { color: theme.text }]}>₦{batch.price.toFixed(2)}</ThemedText>}
                  </View>
                  <View style={styles.batchMeta}>
                    <View style={styles.batchMetaItem}>
                      <Ionicons name="calendar-outline" size={14} color={theme.subtext} />
                      <ThemedText style={[styles.batchMetaText, { color: theme.subtext }]}>Expires: {expiryDate.toLocaleDateString()}</ThemedText>
                    </View>
                    <View style={styles.batchMetaItem}>
                      <Ionicons name="alert-circle-outline" size={14} color={expiryColor} />
                      <ThemedText style={[styles.batchMetaText, { color: expiryColor }]}>
                        {isExpired ? "Expired" : isExpiringSoon ? `${daysUntilExpiry} days left` : "Good condition"}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Add Batch Button */}
      <DisabledButton
        onPress={() => {
          router.push({
            pathname: "/(tabs)/add-products",
            params: {
              barcode: product.barcode,
              name: product.name,
              category: product.category,
              imageUrl: product.imageUrl,
              isPerishable: product.isPerishable ? "true" : "false",
            },
          });
        }}
        disabled={!addAccess.isAllowed}
        disabledReason={addAccess.reason}
        style={[styles.addBatchFab, { backgroundColor: theme.primary }]}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </DisabledButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: "600" },
  errorText: { marginTop: 16, fontSize: 16, fontWeight: "600", textAlign: "center" },

  heroHeader: { paddingTop: 55, paddingBottom: 30, alignItems: "center" },
  heroNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroNavTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  heroImageBox: { width: 160, height: 160, justifyContent: "center", alignItems: "center" },
  heroImage: { width: "100%", height: "100%" },

  nameCard: {
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  productName: { fontSize: 22, fontWeight: "900", flex: 1, marginRight: 12, letterSpacing: -0.5 },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  stockText: { fontSize: 11, fontWeight: "800" },
  categoryLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },

  infoCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5, marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 15, fontWeight: "500" },
  infoValue: { fontSize: 15, fontWeight: "700", maxWidth: "55%", textAlign: "right" },

  expiryGrid: { flexDirection: "row", gap: 12, marginTop: 4 },
  expiryItem: { flex: 1, alignItems: "center" },
  expiryIcon: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  expiryCount: { fontSize: 22, fontWeight: "900", marginBottom: 4 },
  expiryLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },

  batchesSection: { marginHorizontal: 16, marginBottom: 12 },
  batchItem: { padding: 14, borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, marginBottom: 10 },
  batchHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  batchNumber: { fontSize: 15, fontWeight: "800", marginBottom: 3 },
  batchQty: { fontSize: 13, fontWeight: "700" },
  batchPrice: { fontSize: 17, fontWeight: "900" },
  batchMeta: { gap: 6 },
  batchMetaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  batchMetaText: { fontSize: 12, fontWeight: "600" },

  addBatchFab: {
    position: "absolute",
    bottom: 100,
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
