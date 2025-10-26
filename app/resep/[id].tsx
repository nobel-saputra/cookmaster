import { Resep, useResepStore } from "@/store/resepStore";
import { usePurchaseStore } from "@/store/purchaseStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Linking,
  Text,
  View,
  Pressable,
  StatusBar,
} from "react-native";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function DetailResepPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { findResepById } = useResepStore();
  const isPurchased = usePurchaseStore((state) => state.isPurchased);
  const markAsPurchased = usePurchaseStore((state) => state.markAsPurchased);
  const { addToCart } = useCartStore();
  const userId = useAuthStore((state) => state.session?.user?.id);

  const [resep, setResep] = useState<Resep | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);

  const recipeId = resep?.id ?? id!;
  const isRecipePurchased = isPurchased(recipeId);

  useEffect(() => {
    const getData = async () => {
      if (!id) return setIsLoading(false);
      setIsLoading(true);
      try {
        const data = await findResepById(id);
        setResep(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [id, findResepById]);

  const handleAddToCart = async () => {
    if (!resep?.id || !userId) {
      Toast.show({ type: "error", text1: "Silakan login terlebih dahulu." });
      return;
    }
    await addToCart(resep.id, userId);
    router.push("/(tabs)/cart");
    
  };

  const handleBuyDirectly = () => {
    if (!resep?.id || !userId || isBuying) return;
    Alert.alert(
      "Konfirmasi Pembelian",
      `Yakin ingin membeli "${resep.judul}" seharga Rp ${resep.harga}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Beli Sekarang",
          onPress: async () => {
            setIsBuying(true);
            await new Promise((r) => setTimeout(r, 2000));
            markAsPurchased(resep.id!);
            setIsBuying(false);
            Toast.show({
              type: "success",
              text1: "Berhasil!",
              text2: `Resep "${resep.judul}" kini milikmu.`,
            });
          },
        },
      ]
    );
  };

  const handleViewRecipe = () => {
    const pdfUrl = resep?.bahan?.[0];
    if (pdfUrl?.startsWith("http")) Linking.openURL(pdfUrl);
    else Alert.alert("Informasi", "File resep tidak tersedia.");
  };

  const handleEdit = () => {
    if (resep?.id) {
      router.push(`/edit/${resep.id}`);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Konfirmasi Hapus",
      `Yakin ingin menghapus resep "${resep?.judul}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            // TODO: Implementasi logika delete
            Toast.show({
              type: "success",
              text1: "Resep berhasil dihapus",
            });
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Memuat resep...</Text>
      </View>
    );

  if (!resep)
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Resep tidak ditemukan</Text>
      </View>
    );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Image with Gradient Overlay */}
        <View style={styles.imageContainer}>
          {resep.gambar ? (
            <>
              <Image source={{ uri: resep.gambar }} style={styles.image} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.imageGradient}
              />
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="food" size={80} color="#ddd" />
            </View>
          )}
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{resep.judul}</Text>
            {isRecipePurchased && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
                <Text style={styles.badgeText}>Terbeli</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.deskripsi}>{resep.deskripsi}</Text>

          {/* Price Section */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>Harga</Text>
              <Text style={styles.harga}>Rp {resep.harga?.toLocaleString("id-ID")}</Text>
            </View>
            {isRecipePurchased && (
              <MaterialCommunityIcons name="check-decagram" size={40} color="#00A86B" />
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {isRecipePurchased ? (
              <Pressable 
                style={styles.viewRecipeButton} 
                onPress={handleViewRecipe}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              >
                <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#fff" />
                <Text style={styles.viewRecipeButtonText}>Lihat Resep Lengkap</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  style={styles.cartButton}
                  onPress={handleAddToCart}
                  disabled={isBuying}
                  android_ripple={{ color: "rgba(255,255,255,0.1)" }}
                >
                  <MaterialCommunityIcons name="cart-plus" size={22} color="#fff" />
                  <Text style={styles.cartButtonText}>Keranjang</Text>
                </Pressable>

                <Pressable
                  style={[styles.buyButton, isBuying && styles.buyButtonDisabled]}
                  onPress={handleBuyDirectly}
                  disabled={isBuying}
                  android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                >
                  {isBuying ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="lightning-bolt" size={22} color="#fff" />
                      <Text style={styles.buyButtonText}>Beli Sekarang</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Edit & Delete Section */}
          <View style={styles.manageSection}>
            <Text style={styles.manageSectionTitle}>Kelola Resep</Text>
            <View style={styles.manageButtons}>
              <Pressable 
                style={({ pressed }) => [
                  styles.manageButton,
                  styles.editButton,
                  pressed && styles.manageButtonPressed
                ]} 
                onPress={handleEdit}
                android_ripple={{ color: "rgba(0,122,255,0.1)" }}
              >
                <MaterialCommunityIcons name="pencil" size={24} color="#007AFF" />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
              
              <Pressable 
                style={({ pressed }) => [
                  styles.manageButton,
                  styles.deleteButton,
                  pressed && styles.manageButtonPressed
                ]} 
                onPress={handleDelete}
                android_ripple={{ color: "rgba(255,59,48,0.1)" }}
              >
                <MaterialCommunityIcons name="delete" size={24} color="#FF3B30" />
                <Text style={styles.deleteButtonText}>Hapus</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorText: { 
    fontSize: 18, 
    color: "#999",
    marginTop: 16,
    fontWeight: "600",
  },
  
  // Image Section
  imageContainer: {
    width: "100%",
    height: 320,
    position: "relative",
  },
  image: { 
    width: "100%", 
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e8e8e8",
    justifyContent: "center",
    alignItems: "center",
  },

  // Content Card
  contentCard: {
    backgroundColor: "#fff",
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },

  // Title Section
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800",
    color: "#1a1a1a",
    flex: 1,
    letterSpacing: -0.5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F57C00",
  },

  // Description
  deskripsi: { 
    fontSize: 16, 
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },

  // Price Section
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 13,
    color: "#F57C00",
    fontWeight: "600",
    marginBottom: 2,
  },
  harga: { 
    fontSize: 26, 
    fontWeight: "800",
    color: "#FF7A00",
    letterSpacing: -0.5,
  },

  // Action Buttons
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  cartButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#2C3E50",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  buyButton: {
    flex: 1.5,
    flexDirection: "row",
    backgroundColor: "#FF7A00",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buyButtonDisabled: {
    opacity: 0.7,
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  viewRecipeButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#00A86B",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#00A86B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewRecipeButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#e8e8e8",
    marginVertical: 24,
  },

  // Manage Section
  manageSection: {
    marginTop: 8,
  },
  manageSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#888",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  manageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  manageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    borderWidth: 2,
  },
  manageButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.8,
  },
  editButton: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  editButtonText: {
    color: "#007AFF",
    fontWeight: "700",
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
    borderColor: "#FF3B30",
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontWeight: "700",
    fontSize: 15,
  },
});