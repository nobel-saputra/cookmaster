// store/cartStore.ts
import { supabase } from "@/lib/supabaseClient";
import Toast from "react-native-toast-message";
import { create } from "zustand";

// --- Interface Data ---
interface CartItem {
  id: string;
  resep_id: string;
  user_id?: string;
  quantity: number;
  judul: string;
  gambar: string;
  harga: number;
}

interface CartStore {
  cartItems: CartItem[];
  loading: boolean;
  fetchCart: (userId: string) => Promise<void>;
  addToCart: (resepId: string, userId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: (userId: string, resepStore: any) => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cartItems: [],
  loading: false,

  // 🔹 Ambil item keranjang dari Supabase (dengan data resep)
  fetchCart: async (userId) => {
    set({ loading: true });

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

  // 🔹 Tambah item ke keranjang
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
      Toast.show({ type: "error", text1: "Gagal", text2: error.message, position: "top" });
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
        position: "top",
      });
    }
  },

  // 🔹 Hapus item dari keranjang
  removeItem: async (itemId) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

    if (error) {
      console.error("Gagal hapus dari cart:", error);
      Toast.show({ type: "error", text1: "Gagal Hapus", text2: error.message, position: "top" });
    } else {
      set((state) => ({
        cartItems: state.cartItems.filter((item) => item.id !== itemId),
      }));
      Toast.show({
        type: "success",
        text1: "Terhapus",
        text2: "Item dihapus dari keranjang.",
        position: "top",
      });
    }
  },

  // 🔹 Simulasi Checkout
  checkout: async (userId, resepStore) => {
    const itemsToPurchase = get().cartItems;
    if (itemsToPurchase.length === 0) return;

    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const markAsPurchased = resepStore.markAsPurchased;
    itemsToPurchase.forEach((item) => markAsPurchased(item.resep_id));

    const itemIds = itemsToPurchase.map((item) => item.id);
    const { error } = await supabase.from("cart_items").delete().in("id", itemIds);

    if (error) {
      console.error("Gagal clear cart setelah checkout:", error);
      Toast.show({
        type: "error",
        text1: "Error Checkout",
        text2: "Gagal menghapus item dari keranjang.",
      });
      set({ loading: false });
      return;
    }

    set({ cartItems: [], loading: false });
    Toast.show({
      type: "success",
      text1: "Pembelian Sukses!",
      text2: "Resep berhasil dibeli.",
      position: "top",
    });
  },
}));
