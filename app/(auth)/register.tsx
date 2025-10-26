import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { styles } from "./style/register"; // import style dari file terpisah

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    const result = await register(email, password);

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "Registrasi berhasil!",
        text2: "Silakan verifikasi email Anda.",
      });

      setTimeout(() => router.replace("/(auth)/login"), 2000);
    } else {
      Toast.show({
        type: "error",
        text1: "Registrasi gagal",
        text2: result.message || "Terjadi kesalahan, coba lagi.",
      });
    }
  };

  const handlePress = () => {
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>COOKMASTER</Text>
      <Text style={styles.h2}>Register Page</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Pressable
        onPress={handleRegister}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? "#3B40A0" : "#4E56C0" },
        ]}
      >
        <Text style={styles.buttonText}>REGISTER</Text>
      </Pressable>

      <Text style={styles.linkTextContainer}>
        Sudah punya akun?{" "}
        <Text style={styles.linkText} onPress={handlePress}>
          Login
        </Text>
      </Text>
    </View>
  );
}
