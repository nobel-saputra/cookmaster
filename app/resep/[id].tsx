import { Resep, useResepStore } from "@/store/resepStore";
import { usePurchaseStore } from "@/store/purchaseStore"; // 👈 Import Store Pembelian
import { useCartStore } from "@/store/cartStore"; // 👈 Import Store Keranjang
import { useAuthStore } from "@/store/authStore"; // 👈 Import Store Auth untuk userId
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
// 💡 Menambahkan Pressable dan ActivityIndicator ke import
import { ActivityIndicator, Alert, Button, Image, Linking, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Import icon untuk ceklis

export default function DetailResepPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { findResepById, deleteResep } = useResepStore();

  // 💡 Ambil state dan action dari store pembelian
  const isPurchased = usePurchaseStore((state) => state.isPurchased);
  const markAsPurchased = usePurchaseStore((state) => state.markAsPurchased); // Diperlukan untuk Beli Langsung

  // 🛒 Ambil action dari store Keranjang
  const { addToCart } = useCartStore();

  // 👤 Ambil userId dari store Auth (diperlukan untuk AddToCart & Beli Langsung)
  const userId = useAuthStore((state) => state.session?.user?.id);

  const [resep, setResep] = useState<Resep | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // 💡 State isBuying diperlukan lagi untuk simulasi Beli Langsung
  const [isBuying, setIsBuying] = useState(false);

  // Status pembelian saat ini
  const recipeId = resep?.id || id;
  const isRecipePurchased = isPurchased(recipeId || "");

  // --- Ambil Data Resep dari Zustand/Supabase ---
  useEffect(() => {
    const getData = async () => {
      if (!id || typeof id !== "string") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const data = await findResepById(id);
        setResep(data);
      } catch (error) {
        console.error("Gagal mengambil resep:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [id, findResepById]);

  // --- 🛒 FUNGSI TAMBAH KE KERANJANG ---
  const handleAddToCart = async () => {
    if (!resep || !resep.id) return;

    if (!userId) {
      Toast.show({ type: "error", text1: "Gagal", text2: "Silakan login untuk menambahkan ke keranjang.", position: "top" });
      return;
    }

    await addToCart(resep.id, userId);

    // Arahkan pengguna ke halaman keranjang
    router.push("/(tabs)/cart");
  };

  // --- 💰 FUNGSI BELI LANGSUNG ---
  const handleBuyDirectly = () => {
    if (!resep || !resep.id || isBuying) return;

    if (!userId) {
      Toast.show({ type: "error", text1: "Gagal", text2: "Silakan login untuk melakukan pembelian langsung.", position: "top" });
      return;
    }

    // 1. Tampilkan konfirmasi
    Alert.alert("Konfirmasi Pembelian", `Yakin ingin membeli resep "${resep.judul}" seharga Rp ${resep.harga}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Beli Sekarang",
        onPress: async () => {
          setIsBuying(true);

          // 2. Simulasi Loading Transaksi (3 detik)
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // 3. Tandai sebagai sudah dibeli di store persisten
          markAsPurchased(resep.id!);

          setIsBuying(false);

          // 4. Tampilkan notifikasi sukses
          Toast.show({
            type: "success",
            text1: "Transaksi Berhasil! 🎉",
            text2: `Resep "${resep.judul}" kini menjadi milik Anda.`,
            position: "top",
          });
        },
      },
    ]);
  };

  // --- FUNGSI LIHAT RESEP (Menggantikan Unduh PDF) ---
  const handleViewRecipe = () => {
    if (resep?.bahan && resep.bahan.length > 0) {
      const pdfUrl = resep.bahan[0];
      if (pdfUrl && (pdfUrl.startsWith("http") || pdfUrl.startsWith("https"))) {
        Linking.openURL(pdfUrl);
      } else {
        Alert.alert("Informasi", "URL Resep tidak valid.");
      }
    } else {
      Alert.alert("Informasi", "File resep tidak tersedia.");
    }
  };

  // --- FUNGSI EDIT & DELETE (Tidak Berubah) ---
  const handleEdit = () => {
    // Logika edit
  };
  const handleDelete = () => {
    // Logika delete
  };

  // --- RENDER LOADING / ERROR ---
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat Detail Resep...</Text>
      </View>
    );
  }

  if (!resep) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Resep tidak ditemukan. (ID: {id})</Text>
      </View>
    );
  }

  // --- RENDER KONTEN ---
  return (
    <ScrollView style={styles.container}>
      <View style={styles.actionButtons}>
        <Button title="Edit Resep" onPress={handleEdit} color="#007AFF" />
        <Button title="Hapus Resep" onPress={handleDelete} color="#FF0000" />
      </View>

      {/* Gambar Thumbnail */}
      {resep.gambar && <Image source={{ uri: resep.gambar }} style={styles.image} />}

      <Text style={styles.title}>{resep.judul}</Text>
      <Text style={styles.deskripsi}>{resep.deskripsi}</Text>
      <Text style={styles.harga}>Rp {resep.harga}</Text>

      {/* 💡 BAGIAN INI DIGANTI: Tombol Add To Cart dan Beli Langsung */}
      <View style={styles.buyActionsContainer}>
        {isRecipePurchased ? (
          // 🟢 RESEP SUDAH DIBELI
          <View style={styles.purchasedContainer}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#00A86B" />
            <Text style={styles.purchasedText}>Resep Sudah Dibeli</Text>
            {/* Tombol untuk melihat resep (membuka PDF) */}
            <Button title="Lihat Resep" color="#007AFF" onPress={handleViewRecipe} />
          </View>
        ) : (
          // 🟡 RESEP BELUM DIBELI (Tombol Add To Cart & Beli Langsung)
          <>
            <Pressable
              style={[styles.actionButton, styles.addToCartButton]}
              onPress={handleAddToCart}
              disabled={isBuying} // Disable jika sedang proses beli langsung
            >
              <MaterialCommunityIcons name="cart-plus" size={20} color="#fff" style={{ marginRight: 5 }} />
              <Text style={styles.buttonText}>Tambah ke Keranjang</Text>
            </Pressable>

            <Pressable style={[styles.actionButton, styles.buyDirectlyButton]} onPress={handleBuyDirectly} disabled={isBuying}>
              {isBuying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="credit-card" size={20} color="#fff" style={{ marginRight: 5 }} />
                  <Text style={styles.buttonText}>Beli Langsung</Text>
                </>
              )}
            </Pressable>
          </>
        )}
      </View>

      {/* ... (Bahan & Langkah tetap sama) */}
      <Text style={styles.subTitle}>Bahan:</Text>
      {/* Tampilkan sisa item di 'bahan' selain URL PDF hanya jika sudah dibeli */}
      {isRecipePurchased ? Array.isArray(resep.bahan) && resep.bahan.slice(1).map((b: string, idx: number) => <Text key={idx}>• {b}</Text>) : <Text style={styles.lockedText}>Bahan terkunci, silakan beli resep.</Text>}

      <Text style={styles.subTitle}>Langkah:</Text>
      {isRecipePurchased ? (
        resep.langkah?.map((l: string, idx: number) => (
          <Text key={idx}>
            {idx + 1}. {l}
          </Text>
        ))
      ) : (
        <Text style={styles.lockedText}>Langkah terkunci, silakan beli resep.</Text>
      )}

      <View style={{ height: 50 }} />
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  // ... (Styles sebelumnya)
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16 },
  errorText: { fontSize: 18, color: "red" },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    marginTop: 10,
  },
  image: { width: "100%", height: 250, borderRadius: 12, marginBottom: 10 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  deskripsi: { marginVertical: 10, fontSize: 16 },
  harga: { fontSize: 18, color: "#FF7A00", marginBottom: 15, fontWeight: "bold" },
  subTitle: { fontWeight: "bold", marginTop: 10, fontSize: 18 },

  // 💡 STYLES BARU UNTUK DUA TOMBOL (Horizontal, responsif)
  buyActionsContainer: {
    marginVertical: 20,
    flexDirection: "row", // Tata letak horizontal
    justifyContent: "space-between",
    gap: 10, // Spasi antara tombol
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  addToCartButton: {
    backgroundColor: "#333", // Warna netral untuk Tambah Keranjang
  },
  buyDirectlyButton: {
    backgroundColor: "#FF7A00", // Warna cerah untuk Beli Langsung
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  purchasedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E0F7FA", // Light cyan background
    padding: 15,
    borderRadius: 8,
  },
  purchasedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00A86B", // Green text
  },
  lockedText: {
    fontStyle: "italic",
    color: "#888",
    marginTop: 5,
    marginBottom: 10,
  },
});
