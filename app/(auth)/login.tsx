import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { loginStyles as styles } from "./style/login";

// Validasi form dengan zod
const loginSchema = z.object({
  email: z.string().min(1, { message: "Email wajib diisi" }).email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }).max(50, { message: "Password maksimal 50 karakter" }),
});

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const { login } = useAuthStore();
  const router = useRouter();

  // Fungsi untuk handle login
  const handleLogin = async () => {
    const validationResult = loginSchema.safeParse({ email, password });

    // Cek validasi input
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    // Proses login
    const success = await login(email, password);
    if (success) {
      setError("");
      Toast.show({
        type: "success",
        text1: "Login berhasil!",
        text2: "Selamat datang di CookMaster ",
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

  // Fungsi hapus error saat user mengetik
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🍳</Text>
          </View>
          <Text style={styles.title}>COOK MASTER</Text>
          <Text style={styles.subtitle}>Masuk ke akun Anda</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Input Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Masukkan email Anda"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                clearError("email");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, errors.email && styles.inputError]}
            />
            {errors.email && <Text style={styles.errorText}>⚠️ {errors.email}</Text>}
          </View>

          {/* Input Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Masukkan password Anda"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearError("password");
              }}
              style={[styles.input, errors.password && styles.inputError]}
            />
            {errors.password && <Text style={styles.errorText}>⚠️ {errors.password}</Text>}
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <Pressable onPress={handleLogin} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonText}>MASUK</Text>
          </Pressable>

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <Pressable onPress={() => router.replace("/(auth)/register")}>
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
