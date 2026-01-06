/**
 * Cart Store
 *
 * Store ini mengelola state dan logika bisnis untuk keranjang belanja.
 * Menghubungkan aplikasi dengan tabel 'cart_items' di Supabase.
 * Fitur: Fetch cart, Add to cart, Remove item, Checkout.
 */

import { supabase } from "@/lib/supabaseClient";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import { usePurchaseStore } from "./purchaseStore";

/**
 * Interface untuk item dalam keranjang
 * Menggabungkan data dari tabel cart_items dengan detail resep
 */
interface CartItem {
  id: string; // ID unik item di keranjang
  resep_id: string; // ID resep yang terkait
  user_id?: string; // ID user pemilik keranjang
  quantity: number; // Jumlah item (default 1 untuk resep)
  judul: string; // Judul resep (dari relation)
  gambar: string; // URL gambar resep (dari relation)
  harga: number; // Harga resep (dari relation)
}

/**
 * Interface untuk Cart Store State
 */
interface CartStore {
  cartItems: CartItem[]; // Array item keranjang
  loading: boolean; // Status loading untuk operasi async

  // Actions
  fetchCart: (userId: string) => Promise<void>;
  addToCart: (resepId: string, userId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: (userId: string) => Promise<void>;
}

/**
 * Zustand Store untuk Shopping Cart
 */
export const useCartStore = create<CartStore>((set, get) => ({
  // State awal
  cartItems: [],
  loading: false,

  /**
   * Mengambil semua item keranjang user dari database
   * Melakukan join dengan tabel resep untuk mendapatkan detail produk
   * @param userId - ID user yang sedang login
   */
  fetchCart: async (userId) => {
    set({ loading: true });

    // Query ke Supabase dengan relation (join) ke tabel resep
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        user_id,
        resep_id,
        quantity,
        resep:resep_id (judul, gambar, harga)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal fetch cart:", error);
      Toast.show({ type: "error", text1: "Error Cart", text2: error.message });
    } else {
      // Mapping data mentah dari Supabase ke struktur CartItem yang bersih
      const mappedItems: CartItem[] = (data || []).map((item: any) => {
        // Handle kemungkinan array atau object tunggal dari relation
        const resep = Array.isArray(item.resep) ? item.resep[0] : item.resep;
        return {
          id: item.id,
          resep_id: item.resep_id,
          user_id: item.user_id,
          quantity: item.quantity ?? 1,
          judul: resep?.judul ?? "Tanpa Judul",
          gambar: resep?.gambar ?? "https://via.placeholder.com/300x200?text=No+Image",
          harga: resep?.harga ?? 0,
        };
      });

      set({ cartItems: mappedItems });
    }

    set({ loading: false });
  },

  /**
   * Menambahkan resep ke keranjang
   * Mencegah duplikasi item yang sama
   * @param resepId - ID resep yang akan ditambahkan
   * @param userId - ID user pemilik keranjang
   */
  addToCart: async (resepId, userId) => {
    // 1. Cek duplikasi di state lokal (optimasi request)
    const existingItem = get().cartItems.find((item) => item.resep_id === resepId);
    if (existingItem) {
      Toast.show({
        type: "info",
        text1: "Sudah Ada",
        text2: "Resep ini sudah ada di keranjang Anda.",
        position: "top",
      });
      return;
    }

    // 2. Insert ke database
    const newCartItem = { resep_id: resepId, user_id: userId, quantity: 1 };
    const { data, error } = await supabase
      .from("cart_items")
      .insert([newCartItem])
      .select(
        `
        id,
        user_id,
        resep_id,
        quantity,
        resep:resep_id (judul, gambar, harga)
      `
      )
      .single();

    if (error) {
      console.error("Gagal tambah ke cart:", error);
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    } else {
      // 3. Update state lokal dengan data baru
      const resep = Array.isArray(data.resep) ? data.resep[0] : data.resep;
      const newItem: CartItem = {
        id: data.id,
        resep_id: data.resep_id,
        user_id: data.user_id,
        quantity: data.quantity ?? 1,
        judul: resep?.judul ?? "Tanpa Judul",
        gambar: resep?.gambar ?? "https://via.placeholder.com/300x200?text=No+Image",
        harga: resep?.harga ?? 0,
      };

      set((state) => ({ cartItems: [newItem, ...state.cartItems] }));

      Toast.show({
        type: "success",
        text1: "Berhasil",
        text2: "Resep ditambahkan ke keranjang.",
      });
    }
  },

  /**
   * Menghapus item dari keranjang
   * @param itemId - ID unik item keranjang (bukan recipe ID)
   */
  removeItem: async (itemId) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

    if (error) {
      console.error("Gagal hapus dari cart:", error);
      Toast.show({ type: "error", text1: "Gagal Hapus", text2: error.message });
    } else {
      // Update state lokal
      set((state) => ({
        cartItems: state.cartItems.filter((item) => item.id !== itemId),
      }));

      Toast.show({
        type: "success",
        text1: "Terhapus",
        text2: "Item dihapus dari keranjang.",
      });
    }
  },

  /**
   * Proses Checkout
   * Memindahkan item dari cart ke purchase history dan mengosongkan keranjang
   * @param userId - ID user yang melakukan checkout
   */
  checkout: async (userId) => {
    const itemsToPurchase = get().cartItems;
    if (itemsToPurchase.length === 0) return;

    // Menggunakan action dari purchaseStore untuk insert history
    const { addPurchase } = usePurchaseStore.getState();
    set({ loading: true });

    try {
      // 1. Insert semua data pembelian ke tabel purchase_history
      for (const item of itemsToPurchase) {
        await addPurchase(item.resep_id, item.harga);
      }

      // 2. Hapus semua item dari tabel cart_items setelah sukses dibeli
      const itemIds = itemsToPurchase.map((item) => item.id);
      const { error } = await supabase.from("cart_items").delete().in("id", itemIds);
      if (error) throw error;

      // 3. Update state: Kosongkan keranjang & stop loading
      set({ cartItems: [], loading: false });

      Toast.show({
        type: "success",
        text1: "Pembelian Berhasil!",
        text2: "Data pembelian disimpan ke database.",
      });
    } catch (err: any) {
      console.error("Checkout gagal:", err.message);
      Toast.show({
        type: "error",
        text1: "Error Checkout",
        text2: err.message,
      });
      set({ loading: false });
    }
  },
}));
