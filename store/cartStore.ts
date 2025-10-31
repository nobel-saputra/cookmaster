import { supabase } from "@/lib/supabaseClient";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import { usePurchaseStore } from "./purchaseStore";

// Tipe data item dalam keranjang
interface CartItem {
  id: string;
  resep_id: string;
  user_id?: string;
  quantity: number;
  judul: string;
  gambar: string;
  harga: number;
}

// Struktur state & aksi
interface CartStore {
  cartItems: CartItem[];
  loading: boolean;
  fetchCart: (userId: string) => Promise<void>;
  addToCart: (resepId: string, userId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: (userId: string) => Promise<void>;
}

// Store Zustand
export const useCartStore = create<CartStore>((set, get) => ({
  cartItems: [],
  loading: false,

  // Ambil keranjang dari database
  fetchCart: async (userId) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        user_id,
        resep_id,
        quantity,
        resep:resep_id (judul, gambar, harga)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal fetch cart:", error);
      Toast.show({ type: "error", text1: "Error Cart", text2: error.message });
    } else {
      const mappedItems: CartItem[] = (data || []).map((item: any) => {
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

  // Tambah ke keranjang
  addToCart: async (resepId, userId) => {
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

    const newCartItem = { resep_id: resepId, user_id: userId, quantity: 1 };
    const { data, error } = await supabase
      .from("cart_items")
      .insert([newCartItem])
      .select(`
        id,
        user_id,
        resep_id,
        quantity,
        resep:resep_id (judul, gambar, harga)
      `)
      .single();

    if (error) {
      console.error("Gagal tambah ke cart:", error);
      Toast.show({ type: "error", text1: "Gagal", text2: error.message });
    } else {
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

  // Hapus item
  removeItem: async (itemId) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

    if (error) {
      console.error("Gagal hapus dari cart:", error);
      Toast.show({ type: "error", text1: "Gagal Hapus", text2: error.message });
    } else {
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

  // Checkout dan simpan ke purchase_history
  checkout: async (userId) => {
    const itemsToPurchase = get().cartItems;
    if (itemsToPurchase.length === 0) return;

    const { addPurchase } = usePurchaseStore.getState();
    set({ loading: true });

    try {
      // Insert semua pembelian ke Supabase via purchaseStore
      for (const item of itemsToPurchase) {
        await addPurchase(item.resep_id, item.harga);
      }

      // Hapus semua item dari keranjang setelah sukses
      const itemIds = itemsToPurchase.map((item) => item.id);
      const { error } = await supabase.from("cart_items").delete().in("id", itemIds);
      if (error) throw error;

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
