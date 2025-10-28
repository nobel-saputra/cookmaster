// app/(tabs)/index.tsx

import { useHomeStore } from "@/store/homeStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Animated, Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { indexStyle as styles } from "./style";

// Komponen utama halaman Home
export default function HomeScreen() {
  const { fetchHomeData, stats, loading } = useHomeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  // Memuat data awal saat komponen pertama kali dirender
  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  // Fungsi untuk me-refresh data secara manual
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  // Animasi klik kartu resep dan navigasi ke halaman detail
  const handleCardPress = (id: number) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    router.push({
      pathname: "/resep/[id]",
      params: { id: id.toString() },
    });
  };

  // Tampilan loading saat data belum selesai dimuat
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B894" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  // Tampilan utama halaman Home
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00B894"]} />}>
      {/* Bagian Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Selamat Datang! 👋</Text>
          <Text style={styles.appName}>cookmaster</Text>
          <Text style={styles.tagline}>Temukan Resep Favoritmu</Text>
        </View>
      </View>

      {/* Bagian Statistik dan Tombol Jelajah */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="book" size={28} color="#00B894" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{stats.totalResep}</Text>
            <Text style={styles.statLabel}>Total Resep</Text>
          </View>
        </View>

        <Pressable style={styles.exploreButton} onPress={() => router.push("/explore")}>
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.exploreText}>Jelajah</Text>
        </Pressable>
      </View>

      {/* Bagian Resep Terbaru */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resep Terbaru</Text>
          <Pressable onPress={() => router.push("/explore")}>
            <Text style={styles.seeAll}>Lihat Semua →</Text>
          </Pressable>
        </View>

        {stats.resepTerbaru.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>Belum ada resep terbaru</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stats.resepTerbaru.map((resep) => (
              <Pressable key={resep.id} onPress={() => handleCardPress(resep.id)}>
                <View style={styles.recipeCard}>
                  {resep.gambar ? (
                    <Image source={{ uri: resep.gambar }} style={styles.recipeImage} />
                  ) : (
                    <View style={styles.recipePlaceholder}>
                      <Ionicons name="image-outline" size={32} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle} numberOfLines={2}>
                      {resep.judul}
                    </Text>
                    <View style={styles.recipeFooter}>
                      <Ionicons name="time-outline" size={14} color="#999" />
                      <Text style={styles.recipeTime}>{new Date(resep.created_at).toLocaleDateString("id-ID")}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}
