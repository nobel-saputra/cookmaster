// app/store/purchaseHistory.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface PurchaseHistory {
  id: string;
  user_id: string;
  recipe_id: string;
  price: number;
  purchase_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreatePurchaseHistory {
  user_id: string;
  recipe_id: string;
  price: number;
}

export interface PurchaseHistoryWithRecipe extends PurchaseHistory {
  recipe?: {
    judul: string;
    gambar: string;
    deskripsi: string;
  };
}

interface PurchaseHistoryState {
  purchaseHistory: PurchaseHistoryWithRecipe[];
  isLoading: boolean;
  error: string | null;

  addPurchaseHistory: (data: CreatePurchaseHistory) => Promise<PurchaseHistory | null>;
  fetchPurchaseHistory: (userId: string) => Promise<void>;
  fetchPurchaseHistoryWithRecipe: (userId: string) => Promise<void>;
  checkIfPurchased: (userId: string, recipeId: string) => Promise<boolean>;
  getPurchaseById: (id: string) => Promise<PurchaseHistory | null>;
  clearError: () => void;
  reset: () => void;
}

export const usePurchaseHistoryStore = create<PurchaseHistoryState>((set, get) => ({
  purchaseHistory: [],
  isLoading: false,
  error: null,

  addPurchaseHistory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: newPurchase, error } = await supabase
        .from("purchase_history")
        .insert([{ user_id: data.user_id, recipe_id: data.recipe_id, price: data.price }])
        .select()
        .single();

      if (error) throw error;

      if (newPurchase) {
        set((state) => ({
          purchaseHistory: [...state.purchaseHistory, newPurchase],
        }));
      }

      set({ isLoading: false });
      return newPurchase;
    } catch (error: any) {
      console.error("Error adding purchase history:", error);
      set({
        isLoading: false,
        error: error.message || "Gagal menambahkan riwayat pembelian",
      });
      return null;
    }
  },

  fetchPurchaseHistory: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("purchase_history").select("*").eq("user_id", userId).order("created_at", { ascending: false });

      if (error) throw error;

      set({ purchaseHistory: data || [], isLoading: false });
    } catch (error: any) {
      console.error("Error fetching purchase history:", error);
      set({
        isLoading: false,
        error: error.message || "Gagal mengambil riwayat pembelian",
      });
    }
  },

  fetchPurchaseHistoryWithRecipe: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("purchase_history")
        .select(
          `
          *,
          recipe:resep (
            judul,
            gambar,
            deskripsi
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ purchaseHistory: data || [], isLoading: false });
    } catch (error: any) {
      console.error("Error fetching purchase history with recipe:", error);
      set({
        isLoading: false,
        error: error.message || "Gagal mengambil riwayat pembelian",
      });
    }
  },

  checkIfPurchased: async (userId, recipeId) => {
    try {
      const { data, error } = await supabase.from("purchase_history").select("id").eq("user_id", userId).eq("recipe_id", recipeId).maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error: any) {
      console.error("Error checking purchase status:", error);
      return false;
    }
  },

  getPurchaseById: async (id) => {
    try {
      const { data, error } = await supabase.from("purchase_history").select("*").eq("id", id).single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error getting purchase by ID:", error);
      set({ error: error.message || "Gagal mengambil data pembelian" });
      return null;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ purchaseHistory: [], isLoading: false, error: null }),
}));
