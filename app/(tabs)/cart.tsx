import { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Image } from "react-native";
import { useCartStore } from "@/store/cartStore"; // store keranjang
import { useAuthStore } from "@/store/authStore"; // store auth (ambil user id)
import { usePurchaseStore } from "@/store/purchaseStore"; // store pembelian
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

/**
 * 🛒 Halaman Keranjang
 * Menampilkan daftar resep yang ditambahkan ke keranjang pengguna
 * Lengkap dengan gambar, judul, dan harga.
 */
export default function CartPage() {
  const userId = useAuthStore((state) => state.session?.user?.id);
  const { cartItems, loading, fetchCart, removeItem, checkout } = useCartStore();
  const purchaseStore = usePurchaseStore();

  // 🧠 Ambil data keranjang dari Supabase saat userId berubah
  useEffect(() => {
    if (userId) {
      fetchCart(userId);
    }
  }, [userId, fetchCart]);

  // 💳 Fungsi checkout
  const handleCheckout = () => {
    if (!userId || cartItems.length === 0 || loading) return;

    const totalHarga = cartItems.reduce((sum, item) => sum + (item.harga || 0), 0);

    Alert.alert("Konfirmasi Pembelian", `Total belanja Anda Rp ${totalHarga.toLocaleString("id-ID")}. Lanjutkan pembayaran?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Bayar",
        onPress: () => {
          checkout(userId, purchaseStore);
          setTimeout(() => router.replace("/(tabs)/profile"), 500);
        },
      },
    ]);
  };

  // 🔒 Jika belum login
  if (!userId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Silakan login untuk melihat keranjang.</Text>
      </View>
    );
  }

  // ⏳ Loading
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat Keranjang...</Text>
      </View>
    );
  }

  // 🛍️ Jika keranjang kosong
  if (cartItems.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="cart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Keranjang Anda kosong.</Text>
        <Pressable style={styles.exploreButton} onPress={() => router.replace("/(tabs)/explore")}>
          <Text style={styles.checkoutText}>Cari Resep</Text>
        </Pressable>
      </View>
    );
  }

  // 💰 Hitung total harga
  const totalHarga = cartItems.reduce((sum, item) => sum + (item.harga || 0), 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Keranjang Belanja Anda ({cartItems.length} Resep)</Text>

        {/* 🔁 Daftar Item */}
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            {/* 🖼️ Gambar Resep */}
            <Image source={{ uri: item.gambar || "https://placehold.co/100x100?text=No+Image" }} style={styles.itemImage} />

            {/* 📖 Info Resep */}
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.judul || "Resep Tanpa Judul"}</Text>
              <Text style={styles.itemPrice}>Rp {item.harga ? item.harga.toLocaleString("id-ID") : "0"}</Text>
            </View>

            {/* 🗑️ Tombol Hapus */}
            <Pressable onPress={() => removeItem(item.id)} style={styles.removeButton}>
              <MaterialCommunityIcons name="delete-forever" size={26} color="#FF0000" />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* 🧾 Footer Total dan Checkout */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>Rp {totalHarga.toLocaleString("id-ID")}</Text>
        </View>
        <Pressable style={styles.checkoutButton} onPress={handleCheckout} disabled={loading}>
          <Text style={styles.checkoutText}>{loading ? "Memproses..." : "Bayar Sekarang"}</Text>
        </Pressable>
      </View>

      <Toast />
    </View>
  );
}

// 🎨 Styling
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16 },
  errorText: { fontSize: 18, color: "red" },
  emptyText: { fontSize: 18, color: "#999", marginTop: 10, marginBottom: 20 },
  scrollContent: { padding: 15 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#333" },

  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  itemPrice: { fontSize: 14, color: "#888", marginTop: 4 },
  removeButton: { padding: 6 },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 15,
    backgroundColor: "#fff",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  totalLabel: { fontSize: 18, fontWeight: "600" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#FF7A00" },

  checkoutButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  exploreButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
