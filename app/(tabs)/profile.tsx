import { StyleSheet, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export default function LoginPage() {
  const handlePress = () => {
    Toast.show({
      type: "success",
      text1: "Login berhasil!",
      text2: "Selamat datang di CookMaster 🍳",
      position: "top",
    });

    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 800);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handlePress}>
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
  },
  button: {
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
