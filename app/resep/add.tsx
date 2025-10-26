import { supabase } from "@/lib/supabaseClient";
import { useResepStore } from "@/store/resepStore";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useState } from "react";
import { Button, Image, ScrollView, StyleSheet, Text, TextInput, View, Alert, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

const BUCKET_NAME = "resep-images";

export default function AddResepPage() {
  const { addResep } = useResepStore();
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState("");
  const [gambar, setGambar] = useState<string | null>(null);
  const [gambarBase64, setGambarBase64] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // --- Fungsi Image Picker ---
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      setGambar(image.uri);
      setGambarBase64(image.base64 || null);
    }
  };

  // --- Fungsi Pilih Dokumen ---
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPdfUri(result.assets[0].uri);
        setPdfFileName(result.assets[0].name);
      }
    } catch (err) {
      console.error("Gagal memilih dokumen:", err);
      Alert.alert("Error", "Gagal memilih file PDF.");
    }
  };

  // Helper function untuk decode base64
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Fungsi upload gambar
  const uploadImageToSupabase = async (base64String: string) => {
    try {
      const fileData = decode(base64String);
      const fileName = `resep_${Date.now()}.jpg`;

      const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, fileData, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Upload Gambar Gagal:", error);
      throw error;
    }
  };

  // 🚀 FUNGSI UPLOAD PDF (FIXED - Pakai Fetch)
  const uploadPdfToSupabase = async (uri: string, originalFileName: string): Promise<string> => {
    try {
      // Baca file menggunakan fetch (cara paling reliable di React Native)
      const response = await fetch(uri);
      const blob = await response.blob();

      // Convert blob ke ArrayBuffer
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const storagePath = `dokumen/${Date.now()}_${originalFileName}`;

      // Upload ke Supabase Storage
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, uint8Array, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: true,
      });

      if (error) throw error;

      // Dapatkan public URL
      const { data: publicUrl } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Upload PDF Gagal:", error);
      throw error;
    }
  };

  // --- Fungsi Handle Submit ---
  const handleSubmit = async () => {
    if (uploading) return;

    try {
      setUploading(true);
      let uploadedImageUrl = gambar;
      let uploadedPdfUrl: string | null = null;

      if (!pdfUri || !pdfFileName) {
        throw new Error("Mohon unggah dokumen PDF resep.");
      }

      // Upload gambar jika ada
      if (gambar && !gambar.startsWith("http") && gambarBase64) {
        uploadedImageUrl = await uploadImageToSupabase(gambarBase64);
      }

      // Upload PDF
      uploadedPdfUrl = await uploadPdfToSupabase(pdfUri, pdfFileName);

      // Simpan resep
      await addResep({
        judul,
        deskripsi,
        harga: Number(harga),
        gambar: uploadedImageUrl || "",
        bahan: [uploadedPdfUrl],
        langkah: [`File PDF: ${pdfFileName}`],
        dibuat_oleh: "Admin",
      });

      Toast.show({
        type: "success",
        text1: "Resep dan PDF berhasil ditambahkan!",
        position: "top",
      });

      router.replace("/(tabs)/explore");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      Toast.show({
        type: "error",
        text1: "Gagal menambah resep",
        text2: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  // --- JSX Render ---
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Judul</Text>
      <TextInput style={styles.input} value={judul} onChangeText={setJudul} />

      <Text style={styles.label}>Deskripsi</Text>
      <TextInput style={styles.input} value={deskripsi} onChangeText={setDeskripsi} multiline />

      <Text style={styles.label}>Harga</Text>
      <TextInput style={styles.input} value={harga} onChangeText={setHarga} keyboardType="numeric" />

      <Text style={styles.label}>Gambar (Thumbnail)</Text>
      {gambar ? (
        <View>
          <Image source={{ uri: gambar }} style={styles.imagePreview} />
          <Button title="Ganti Gambar" onPress={pickImage} disabled={uploading} />
        </View>
      ) : (
        <Button title="Pilih Gambar dari Galeri" onPress={pickImage} disabled={uploading} />
      )}

      {/* INPUT PDF */}
      <Text style={[styles.label, { marginTop: 20 }]}>Dokumen Resep (PDF)</Text>
      <Button title="Pilih File PDF" onPress={pickDocument} disabled={uploading} />
      {pdfFileName && <Text style={styles.pdfStatus}>File terpilih: {pdfFileName}</Text>}

      <View style={{ marginTop: 20, marginBottom: 50 }}>
        <Button title={uploading ? "Mengupload..." : "Simpan Resep"} onPress={handleSubmit} disabled={uploading || !judul.trim() || !pdfUri} />
        {uploading && (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
      </View>
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  pdfStatus: {
    marginTop: 10,
    fontStyle: "italic",
    color: "#007AFF",
  },
});
