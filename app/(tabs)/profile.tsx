import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProfilePage() {
  const handleLogout = () => {
    Toast.show({
      type: "success",
      text1: "Logout",
      text2: "Goodbye!",
      position: "top",
    });

    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 1500);
  };

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.welcomeText}>Welcome, Your Majesty</Text>

      {/* Image tengah */}
      <View style={styles.centerImageContainer}>
        <Image
          source={{ uri: "https://i.scdn.co/image/ab67616d00001e02d45ec66aa3cf3864205fd068" }}
          style={styles.centerImage}
          resizeMode="contain"
        />
      </View>

      {/* Footer dengan tombol kiri dan kanan */}
      <View style={styles.footer}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </Pressable>

        <Pressable style={styles.addButton} onPress={handleTambahResep}>
          <MaterialIcons name="add-circle-outline" size={28} color="#fff" />
          <Text style={styles.addButtonText}>Tambah Resep</Text>
        </Pressable>
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: "space-between",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 30,
  },
  centerImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerImage: {
    width: 250,
    height: 250,
    borderRadius: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00B894",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
  },
});
