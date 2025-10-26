import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

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
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>Register Akun Baru</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 10, marginBottom: 20 }} />
      <Button title="Daftar" onPress={handleRegister} />
      <Pressable onPress={handlePress}>
        <Text style={{ textAlign: "center", marginTop: 10 }}>Belum punya akun? Daftar</Text>
      </Pressable>
    </View>
  );
}
