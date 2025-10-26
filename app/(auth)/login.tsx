import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { styles } from "./style/login";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      setError("");
      Toast.show({
        type: "success",
        text1: "Login berhasil!",
        text2: "Selamat datang di CookMaster 🍳",
      });
      setTimeout(() => router.replace("/(tabs)"), 1500);
    } else {
      setError("Email atau password salah/email belum di verifikasi");
      Toast.show({
        type: "error",
        text1: "Login gagal",
        text2: "Email atau password salah. Coba lagi.",
      });
    }
  };

  const handlePress = () => {
    router.replace("/(auth)/register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>COOK MASTER</Text>
      <Text style={styles.h2}>Login Page</Text>

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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={handleLogin}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? "#3B40A0" : "#4E56C0", // warna saat ditekan lebih gelap
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 10,
          },
        ]}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          LOGIN
        </Text>
      </Pressable>

      <Text style={{ textAlign: "center", marginTop: 10 }}>
        Belum punya akun?{" "}
        <Text
          style={{ color: "#4E56C0", fontWeight: "bold" }}
          onPress={handlePress}
        >
          Daftar
        </Text>
      </Text>
    </View>
  );
}
