// app/(tabs)/profile.tsx

// import componen dan pustaka yang diperlukan
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";


// Komponen utama halaman profil pengguna
export default function ProfilePage() {
  const [scaleLogout] = useState(new Animated.Value(1));
  const [scaleAdd] = useState(new Animated.Value(1));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Animasi masuk saat halaman pertama kali dimuat
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Fungsi untuk menangani proses logout pengguna
  const handleLogout = () => {
    Toast.show({
      type: "success",
      text1: "Logout Berhasil",
      text2: "Sampai jumpa lagi! 👋",
      position: "top",
    });

    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 1500);
  };

  // Fungsi untuk navigasi ke halaman tambah resep
  const handleTambahResep = () => {
    try {
      router.push("../resep/add");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Gagal menambah resep",
        text2: String(err),
        position: "top",
      });
    }
  };

  // Animasi saat tombol ditekan lalu menjalankan aksi callback
  const animatePress = (animValue: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  // Struktur utama tampilan halaman profil
  return (
    <View style={styles.container}>
      {/* Bagian header dengan animasi masuk */}
      <Animated.View
        style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Unknown</Text>
            <Text style={styles.subtitleText}>Suka memasak</Text>
          </View>
        </View>
      </Animated.View>

      {/* Foto profil dengan efek border dan animasi muncul */}
      <View style={styles.centerContainer}>
        <Animated.View
          style={[
            styles.imageSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }],
            },
          ]}>
          <View style={styles.imageWrapper}>
            <View style={styles.imageBorder}>
              <Image
                source={{
                  uri: "https://i.scdn.co/image/ab67616d00001e02d45ec66aa3cf3864205fd068",
                }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Tombol aksi di bagian bawah layar */}
      <View style={styles.actionContainer}>
        <Animated.View style={{ transform: [{ scale: scaleLogout }], flex: 1 }}>
          <Pressable style={styles.logoutButton} onPress={() => animatePress(scaleLogout, handleLogout)}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.buttonSpacer} />

        <Animated.View style={{ transform: [{ scale: scaleAdd }], flex: 1.5 }}>
          <Pressable style={styles.addButton} onPress={() => animatePress(scaleAdd, handleTambahResep)}>
            <View style={styles.addButtonContent}>
              <MaterialIcons name="add-circle-outline" size={28} color="#fff" />
              <Text style={styles.addButtonText}>Tambah Resep</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      {/* Komponen notifikasi toast */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerSection: {
    backgroundColor: "#00B894",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontStyle: "italic",
  },
  crownBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  imageSection: {
    alignItems: "center",
  },
  imageWrapper: {
    padding: 6,
  },
  imageBorder: {
    borderRadius: 150,
    padding: 5,
    backgroundColor: "#fff",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
  },
  profileImage: {
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  actionContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  buttonSpacer: {
    width: 12,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: "#00B894",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#00B894",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
});

