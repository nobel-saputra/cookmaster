import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function LoginPage() {
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

  const handleTambahResep = async () => {
    try {
      setTimeout(() => {
        router.push("/resep/add");
      }, 1200);
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
      <Pressable style={styles.buttonTambah} onPress={handleTambahResep}>
        <Text style={styles.text}>Tambah Resep</Text>
      </Pressable>

      <Pressable style={styles.buttonLogout} onPress={handleLogout}>
        <Text style={styles.text}>Keluar</Text>
      </Pressable>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  buttonTambah: {
    backgroundColor: "#00B894",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonLogout: {
    backgroundColor: "#FF7A00",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
