// app/(tabs)/profile.tsx

// import componen dan pustaka yang diperlukan
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { profileStyle as styles } from "./style/profile";

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
