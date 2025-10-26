import { useResepStore } from "@/store/resepStore";
import { router } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { 
  Image, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator,
  TextInput,
  Animated
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function ExplorePage() {
  const { resepList, fetchResep, loading } = useResepStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchResep();
  }, [fetchResep]);

  // Live search filter
  const filteredResep = useMemo(() => {
    if (!searchQuery.trim()) return resepList;
    
    const query = searchQuery.toLowerCase();
    return resepList.filter((r) => 
      r.judul?.toLowerCase().includes(query) ||
      r.deskripsi?.toLowerCase().includes(query)
    );
  }, [resepList, searchQuery]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B894" />
        <Text style={styles.loadingText}>Memuat resep...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari resep favorit Anda..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </Pressable>
        )}
      </View>

      {/* Results Count */}
      {searchQuery.length > 0 && (
        <View style={styles.resultInfo}>
          <Text style={styles.resultText}>
            {filteredResep.length} resep ditemukan
          </Text>
        </View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredResep.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ddd" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "Resep tidak ditemukan" : "Belum ada resep"}
            </Text>
            <Text style={styles.emptyDesc}>
              {searchQuery 
                ? "Coba kata kunci lain" 
                : "Belum ada resep di database 🥲"}
            </Text>
          </View>
        ) : (
          filteredResep.map((r) => (
            <Pressable
              key={r.id ?? Math.random()}
              onPress={() => {
                if (!r.id) return;
                router.push({
                  pathname: "/resep/[id]",
                  params: { id: r.id.toString() },
                });
              }}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                {r.gambar ? (
                  <Image source={{ uri: r.gambar }} style={styles.image} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#ccc" />
                  </View>
                )}
                
                {/* Gradient Overlay */}
                <View style={styles.gradientOverlay} />
                
                {/* Content */}
                <View style={styles.cardContent}>
                  <Text style={styles.title} numberOfLines={2}>
                    {r.judul}
                  </Text>
                  <Text style={styles.desc} numberOfLines={2}>
                    {r.deskripsi}
                  </Text>
                  
                  <View style={styles.footer}>
                    {r.harga ? (
                      <View style={styles.priceTag}>
                        <Text style={styles.price}>
                          Rp {Number(r.harga).toLocaleString("id-ID")}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.arrowContainer}>
                      <Ionicons name="arrow-forward" size={20} color="#00B894" />
                    </View>
                  </View>
                </View>
              </Animated.View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 50,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  resultInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    overflow: "hidden",
  },
  image: { 
    width: "100%", 
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  cardContent: {
    padding: 16,
  },
  title: { 
    fontWeight: "bold", 
    fontSize: 18, 
    color: "#222",
    marginBottom: 6,
  },
  desc: { 
    color: "#666", 
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceTag: {
    backgroundColor: "#E8F8F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  price: { 
    color: "#00B894", 
    fontWeight: "bold",
    fontSize: 16,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F8F5",
    justifyContent: "center",
    alignItems: "center",
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
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#999",
  },
});