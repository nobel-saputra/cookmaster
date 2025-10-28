import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Store untuk mengelola data pembelian resep
interface PurchaseState {
  // Menyimpan ID resep yang sudah dibeli
  purchasedIds: string[];

  // Tandai resep sebagai sudah dibeli
  markAsPurchased: (id: string) => void;

  // Periksa apakah resep sudah dibeli
  isPurchased: (id: string) => boolean;
}

// Persist store agar data tetap tersimpan di AsyncStorage
export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      // Array penyimpanan ID resep yang sudah dibeli
      purchasedIds: [],

      // Tambahkan ID resep ke daftar pembelian jika belum ada
      markAsPurchased: (id) => {
        if (!get().purchasedIds.includes(id)) {
          set((state) => ({
            purchasedIds: [...state.purchasedIds, id],
          }));
        }
      },

      // Periksa status pembelian resep
      isPurchased: (id) => {
        return get().purchasedIds.includes(id);
      },
    }),
    {
      // Kunci penyimpanan unik di AsyncStorage
      name: "resep-purchases-storage",

      // Gunakan AsyncStorage untuk menyimpan data secara persist
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
