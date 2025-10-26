// ✅ Tambahan: Import Toast agar bisa tampilkan notifikasi
import Toast from "react-native-toast-message";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";

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
      // ✅ Tambahan: tampilkan toast jika login berhasil
      Toast.show({
        type: "success",
        text1: "Login berhasil!",
        text2: "Selamat datang di CookMaster 🍳",
      });
      setTimeout(() => router.replace("/(tabs)"), 1500);
    } else {
      setError("Email atau password salah/email belum di verifikasi");
      // ✅ Tambahan: tampilkan toast jika login gagal
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
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>Login CookMaster</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />

      {error ? <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>{error}</Text> : null}

      <Button title="Login" onPress={handleLogin} />

      <Pressable onPress={handlePress}>
        <Text style={{ textAlign: "center", marginTop: 10 }}>Belum punya akun? Daftar</Text>
      </Pressable>
    </View>
  );
}
