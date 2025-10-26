import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PurchaseState {
  // Array berisi ID resep yang sudah dibeli
  purchasedIds: string[];

  // Aksi untuk menandai resep sebagai dibeli
  markAsPurchased: (id: string) => void;

  // Getter untuk mengecek status pembelian
  isPurchased: (id: string) => boolean;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      purchasedIds: [],

      markAsPurchased: (id) => {
        if (!get().purchasedIds.includes(id)) {
          set((state) => ({
            purchasedIds: [...state.purchasedIds, id],
          }));
        }
      },

      isPurchased: (id) => {
        return get().purchasedIds.includes(id);
      },
    }),
    {
      name: "resep-purchases-storage", // Kunci unik di AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // Menggunakan AsyncStorage
    }
  )
);
