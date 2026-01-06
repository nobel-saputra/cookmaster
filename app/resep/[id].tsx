// app/resep/[id].tsx

// Import component
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { usePurchaseHistoryStore } from "@/store/purchaseHistory";
import { usePurchaseStore } from "@/store/purchaseStore";
import { Resep, useResepStore } from "@/store/resepStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { idStyles as styles } from "./style/[id]";

// Komponen utama halaman detail resep
export default function DetailResepPage() {
  // Ambil parameter id dari URL
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : undefined;
  const router = useRouter();

  // Inisialisasi store yang digunakan
  const { findResepById, deleteResep } = useResepStore();
  const isPurchased = usePurchaseStore((state) => state.isPurchased);
  const markAsPurchased = usePurchaseStore((state) => state.isPurchased);
  const { addToCart } = useCartStore();
  const { addPurchaseHistory, checkIfPurchased } = usePurchaseHistoryStore();
  const userId = useAuthStore((state) => state.session?.user?.id);

  // State untuk data dan status loading
  const [resep, setResep] = useState<Resep | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPurchasedFromDB, setIsPurchasedFromDB] = useState(false);

  // Cek status pembelian resep
  const recipeId = resep?.id ?? id;
  const isRecipePurchased = recipeId ? isPurchased(recipeId) || isPurchasedFromDB : false;

  // Ambil data resep berdasarkan ID dan cek status pembelian
  useEffect(() => {
    const getData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await findResepById(id as string);
        setResep(data);

        // Cek apakah sudah dibeli di database
        if (userId) {
          const purchased = await checkIfPurchased(userId, id as string);
          setIsPurchasedFromDB(purchased);

          // Sync dengan local store jika sudah dibeli
          if (purchased && !isPurchased(id as string)) {
            markAsPurchased(id as string);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [id, findResepById, userId, checkIfPurchased, isPurchased, markAsPurchased]);

  // Tambah resep ke keranjang
  const handleAddToCart = async () => {
    if (!resep?.id) {
      Toast.show({ type: "error", text1: "Resep tidak ditemukan." });
      return;
    }
    if (!userId) {
      Toast.show({ type: "error", text1: "Silakan login terlebih dahulu." });
      return;
    }
    try {
      await addToCart(resep.id as string, userId as string);
      router.push("/(tabs)/cart");
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Gagal menambahkan ke keranjang." });
    }
  };

  // Proses pembelian langsung
  const handleBuyDirectly = () => {
    if (!resep?.id || !userId || isBuying) return;
    Alert.alert("Konfirmasi Pembelian", `Yakin ingin membeli "${resep.judul}" seharga Rp ${resep.harga}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Beli Sekarang",
        onPress: async () => {
          setIsBuying(true);

          try {
            // Simulasi proses pembayaran
            await new Promise((r) => setTimeout(r, 2000));

            // Simpan ke database purchase_history
            const purchaseResult = await addPurchaseHistory({
              user_id: userId as string,
              recipe_id: resep.id as string,
              price: resep.harga || 0,
            });

            if (purchaseResult) {
              // Tandai sebagai terbeli di local store
              markAsPurchased(resep.id as string);
              setIsPurchasedFromDB(true);

              Toast.show({
                type: "success",
                text1: "Berhasil!",
                text2: `Resep "${resep.judul}" kini milikmu.`,
              });
            } else {
              Toast.show({
                type: "error",
                text1: "Gagal",
                text2: "Terjadi kesalahan saat menyimpan pembelian.",
              });
            }
          } catch (error) {
            console.error(error);
            Toast.show({
              type: "error",
              text1: "Gagal",
              text2: "Terjadi kesalahan saat memproses pembelian.",
            });
          } finally {
            setIsBuying(false);
          }
        },
      },
    ]);
  };

  // Tampilkan file resep (PDF)
  const handleViewRecipe = () => {
    const pdfUrl = resep?.bahan?.[0];
    if (pdfUrl?.startsWith("http")) Linking.openURL(pdfUrl);
    else Alert.alert("Informasi", "File resep tidak tersedia.");
  };

  // Navigasi ke halaman edit resep
  const handleEdit = () => {
    if (resep?.id) router.push(`/edit/${resep.id}`);
    else Toast.show({ type: "error", text1: "Resep tidak ditemukan." });
  };

  // Hapus resep dari database
  const handleDelete = () => {
    if (!resep?.id) return;
    Alert.alert("Konfirmasi Hapus", `Yakin ingin menghapus resep "${resep.judul}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            setIsDeleting(true);
            await deleteResep(resep.id as string, resep.gambar || undefined, resep.bahan?.[0] || undefined);
            Toast.show({ type: "success", text1: "Resep berhasil dihapus" });
            router.back();
          } catch (error) {
            console.error(error);
            Toast.show({ type: "error", text1: "Gagal menghapus resep", text2: "Terjadi kesalahan saat menghapus." });
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  // Tampilan loading
  if (isLoading)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Memuat resep...</Text>
      </View>
    );

  // Tampilan ketika data tidak ditemukan
  if (!resep)
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Resep tidak ditemukan</Text>
      </View>
    );

  // Tampilan utama halaman detail resep
  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Gambar header resep */}
        <View style={styles.imageContainer}>
          {resep.gambar ? (
            <>
              <Image source={{ uri: resep.gambar }} style={styles.image} />
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.imageGradient} />
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="food" size={80} color="#ddd" />
            </View>
          )}
        </View>

        {/* Kartu konten utama */}
        <View style={styles.contentCard}>
          {/* Judul resep */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{resep.judul}</Text>
            {isRecipePurchased && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
                <Text style={styles.badgeText}>Terbeli</Text>
              </View>
            )}
          </View>

          {/* Deskripsi resep */}
          <Text style={styles.deskripsi}>{resep.deskripsi}</Text>

          {/* Harga resep */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>Harga</Text>
              <Text style={styles.harga}>Rp {resep.harga?.toLocaleString("id-ID")}</Text>
            </View>
            {isRecipePurchased && <MaterialCommunityIcons name="check-decagram" size={40} color="#00A86B" />}
          </View>

          {/* Tombol aksi utama */}
          <View style={styles.actionsContainer}>
            {isRecipePurchased ? (
              <Pressable style={styles.viewRecipeButton} onPress={handleViewRecipe} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
                <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#fff" />
                <Text style={styles.viewRecipeButtonText}>Lihat Resep Lengkap</Text>
              </Pressable>
            ) : (
              <>
                <Pressable style={styles.cartButton} onPress={handleAddToCart} disabled={isBuying} android_ripple={{ color: "rgba(255,255,255,0.1)" }}>
                  <MaterialCommunityIcons name="cart-plus" size={22} color="#fff" />
                  <Text style={styles.cartButtonText}>Keranjang</Text>
                </Pressable>

                <Pressable style={[styles.buyButton, isBuying && styles.buyButtonDisabled]} onPress={handleBuyDirectly} disabled={isBuying} android_ripple={{ color: "rgba(255,255,255,0.2)" }}>
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

          <View style={styles.divider} />

          {/* Bagian pengelolaan resep */}
          <View style={styles.manageSection}>
            <Text style={styles.manageSectionTitle}>Kelola Resep</Text>
            <View style={styles.manageButtons}>
              <Pressable style={({ pressed }) => [styles.manageButton, styles.editButton, pressed && styles.manageButtonPressed]} onPress={handleEdit}>
                <MaterialCommunityIcons name="pencil" size={24} color="#007AFF" />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>

              <Pressable style={({ pressed }) => [styles.manageButton, styles.deleteButton, pressed && styles.manageButtonPressed]} onPress={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="delete" size={24} color="#FF3B30" />
                    <Text style={styles.deleteButtonText}>Hapus</Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Tombol Kembali */}
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.manageButton, { marginTop: 12, backgroundColor: "#F8F9FA", borderColor: "#E9ECEF" }, pressed && styles.manageButtonPressed]}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#495057" />
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#495057" }}>Kembali</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Toast />
    </>
  );
}
