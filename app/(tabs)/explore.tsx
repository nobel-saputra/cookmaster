// Import dependensi utama
import { useResepStore } from "@/store/resepStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, Image, Pressable, Text, TextInput, View } from "react-native";
import { exploreStyle as styles } from "../(tabs)/style/explore";

// Halaman eksplorasi resep
export default function ExplorePage() {
  const { resepList, fetchResep, loading } = useResepStore();
  const [searchQuery, setSearchQuery] = useState("");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Ambil data resep saat komponen dimuat
  useEffect(() => {
    fetchResep();
  }, [fetchResep]);

  // Filter pencarian secara real-time
  const filteredResep = useMemo(() => {
    if (!searchQuery.trim()) return resepList;

    const query = searchQuery.toLowerCase();
    return resepList.filter((r) => r.judul?.toLowerCase().includes(query) || r.deskripsi?.toLowerCase().includes(query));
  }, [resepList, searchQuery]);

  // Animasi skala saat ditekan
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  // Kembalikan skala ke ukuran normal
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Tampilkan indikator loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B894" />
        <Text style={styles.loadingText}>Memuat resep...</Text>
      </View>
    );
  }

  // Tampilan utama halaman
  return (
    <View style={styles.container}>
      <FlatList
        data={filteredResep}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        // Bagian atas daftar (search bar + info hasil)
        ListHeaderComponent={
          <>
            {/* Kolom pencarian */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput style={styles.searchInput} placeholder="Cari resep favorit Anda..." placeholderTextColor="#999" value={searchQuery} onChangeText={setSearchQuery} autoCapitalize="none" autoCorrect={false} />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </Pressable>
              )}
            </View>

            {/* Jumlah hasil pencarian */}
            {searchQuery.length > 0 && (
              <View style={styles.resultInfo}>
                <Text style={styles.resultText}>{filteredResep.length} resep ditemukan</Text>
              </View>
            )}
          </>
        }
        // Render tiap item resep
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (!item.id) return;
              router.push({
                pathname: "/resep/[id]",
                params: { id: item.id.toString() },
              });
            }}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}>
            <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
              {item.gambar ? (
                <Image source={{ uri: item.gambar }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={48} color="#ccc" />
                </View>
              )}

              {/* Overlay transparan pada gambar */}
              <View style={styles.gradientOverlay} />

              {/* Konten resep */}
              <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.judul}
                </Text>
                <Text style={styles.desc} numberOfLines={2}>
                  {item.deskripsi}
                </Text>

                {/* Bagian harga dan panah navigasi */}
                <View style={styles.footer}>
                  {item.harga ? (
                    <View style={styles.priceTag}>
                      <Text style={styles.price}>Rp {Number(item.harga).toLocaleString("id-ID")}</Text>
                    </View>
                  ) : null}
                  <View style={styles.arrowContainer}>
                    <Ionicons name="arrow-forward" size={20} color="#00B894" />
                  </View>
                </View>
              </View>
            </Animated.View>
          </Pressable>
        )}
        // Jika daftar kosong
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ddd" />
            <Text style={styles.emptyTitle}>{searchQuery ? "Resep tidak ditemukan" : "Belum ada resep"}</Text>
            <Text style={styles.emptyDesc}>{searchQuery ? "Coba kata kunci lain" : "Belum ada resep di database 🥲"}</Text>
          </View>
        }
      />
    </View>
  );
}
