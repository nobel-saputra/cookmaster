// app/store/purchaseStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "./authStore";

interface Purchase {
  id: string;
  user_id: string;
  recipe_id: string;
  price: number;
  purchase_date: string;
}

interface PurchaseStore {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;

  // Ambil semua pembelian user dari Supabase
  fetchPurchases: (userId: string) => Promise<void>;

  // Tambah pembelian baru ke Supabase
  addPurchase: (recipeId: string, price: number) => Promise<void>;

  // Cek apakah user sudah beli resep tertentu
  isPurchased: (recipeId: string) => boolean;
}

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  purchases: [],
  loading: false,
  error: null,

  fetchPurchases: async (userId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from("purchase_history").select("id, user_id, recipe_id, price, purchase_date").eq("user_id", userId).order("purchase_date", { ascending: false });

    if (error) {
      console.error("Error fetching purchase history:", error);
      set({ error: error.message, loading: false });
    } else {
      set({ purchases: data || [], loading: false });
    }
  },

  addPurchase: async (recipeId, price) => {
    const user = useAuthStore.getState().session?.user;
    if (!user) {
      set({ error: "User not logged in" });
      return;
    }

    const { data, error } = await supabase
      .from("purchase_history")
      .insert([
        {
          user_id: user.id,
          recipe_id: recipeId,
          price: price,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding purchase:", error);
      set({ error: error.message });
    } else {
      set((state) => ({
        purchases: [...state.purchases, ...(data || [])],
      }));
    }
  },

  isPurchased: (recipeId) => {
    return get().purchases.some((p) => p.recipe_id === recipeId);
  },
}));
