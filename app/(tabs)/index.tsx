// app/(tabs)/index.tsx

import { useAuthStore } from "@/store/authStore";
import { useHomeStore } from "@/store/homeStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const { fetchHomeData, stats, loading } = useHomeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchHomeData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B894" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#00B894"]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Selamat Datang! 👋</Text>
          <Text style={styles.appName}>CookMaster</Text>
          <Text style={styles.tagline}>Temukan Resep Favoritmu</Text>
        </View>
      </View>

      {/* Stats + Jelajah */}
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

        <Pressable
          style={styles.exploreButton}
          onPress={() => router.push("/explore")}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.exploreText}>Jelajah</Text>
        </Pressable>
      </View>

      {/* Resep Terbaru */}
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
                      <Text style={styles.recipeTime}>
                        {new Date(resep.created_at).toLocaleDateString("id-ID")}
                      </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#00B894",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#999",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E8F8F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  exploreButton: {
    backgroundColor: "#00B894",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exploreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  seeAll: {
    fontSize: 14,
    color: "#00B894",
    fontWeight: "600",
  },
  recipeCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 12,
  },
  recipeImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
  },
  recipePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  recipeFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeTime: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
});
