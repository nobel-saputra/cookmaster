import { useResepStore } from "@/store/resepStore";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";

export default function ExplorePage() {
  const { resepList, fetchResep, loading } = useResepStore();

  useEffect(() => {
    fetchResep(); // ambil data dari Supabase
  }, [fetchResep]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B894" />
        <Text style={{ marginTop: 10 }}>Memuat resep...</Text>
      </View>
    );
  }

  if (!resepList || resepList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: "#666" }}>Belum ada resep di database 🥲</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {resepList.map((r) => (
        <Pressable
          key={r.id ?? Math.random()}
          onPress={() => {
            if (!r.id) return;
            router.push({
              pathname: "/resep/[id]",
              params: { id: r.id.toString() },
            });
          }}>
          <View style={styles.card}>
            {r.gambar ? (
              <Image source={{ uri: r.gambar }} style={styles.image} />
            ) : (
              <View style={[styles.image, { backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ color: "#888" }}>Tidak ada gambar</Text>
              </View>
            )}
            <Text style={styles.title}>{r.judul}</Text>
            <Text style={styles.desc}>{r.deskripsi}</Text>
            {r.harga ? <Text style={styles.price}>Rp {Number(r.harga).toLocaleString("id-ID")}</Text> : null}
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: "100%", height: 180, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  title: { fontWeight: "bold", fontSize: 16, marginTop: 8, paddingHorizontal: 10 },
  desc: { color: "#555", paddingHorizontal: 10, marginBottom: 5 },
  price: { color: "#00B894", fontWeight: "bold", marginBottom: 10, paddingHorizontal: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
