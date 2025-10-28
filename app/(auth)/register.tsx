import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { registerStyle as styles } from "./style/register";

// Validasi form dengan zod
const registerSchema = z.object({
  email: z.string().min(1, { message: "Email wajib diisi" }).email({ message: "Format email tidak valid" }),
  password: z
    .string()
    .min(6, { message: "Password minimal 6 karakter" })
    .max(50, { message: "Password maksimal 50 karakter" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password harus mengandung huruf besar, huruf kecil, dan angka",
    }),
});

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuthStore();
  const router = useRouter();

  // Fungsi untuk handle registrasi
  const handleRegister = async () => {
    const validationResult = registerSchema.safeParse({ email, password });

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

    // Proses registrasi
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
            <Text style={styles.iconEmoji}>👨‍🍳</Text>
          </View>
          <Text style={styles.title}>COOK MASTER</Text>
          <Text style={styles.subtitle}>Buat akun baru Anda</Text>
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
              placeholder="Buat password yang kuat"
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

          {/* Password Requirements Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Syarat Password:</Text>
            <Text style={styles.infoText}>• Minimal 6 karakter</Text>
            <Text style={styles.infoText}>• Huruf besar & huruf kecil</Text>
            <Text style={styles.infoText}>• Mengandung angka</Text>
          </View>

          {/* Register Button */}
          <Pressable onPress={handleRegister} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonText}>DAFTAR</Text>
          </Pressable>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.loginLink}>Masuk Sekarang</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}


