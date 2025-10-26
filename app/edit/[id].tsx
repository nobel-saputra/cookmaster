// app/edit/[id].tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, Button, View, Alert, Image, ActivityIndicator } from "react-native";
import { useResepStore, Resep } from "@/store/resepStore";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "@/lib/supabaseClient"; // Pastikan path ini benar
import Toast from "react-native-toast-message";

const BUCKET_NAME = "resep-images";

// 💡 Helper function untuk decode base64 (dari konteks Anda)
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// 💡 FUNGSI UPLOAD GAMBAR (Diadaptasi dari konteks Anda)
const uploadImageToSupabase = async (base64String: string): Promise<string> => {
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

// 💡 FUNGSI UPLOAD PDF (Diadaptasi dari konteks Anda)
const uploadPdfToSupabase = async (uri: string, originalFileName: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const storagePath = `dokumen/${Date.now()}_${originalFileName}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, uint8Array, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: true,
    });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    return publicUrl.publicUrl;
  } catch (error) {
    console.error("Upload PDF Gagal:", error);
    throw error;
  }
};

export default function EditResepPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { findResepById, updateResep } = useResepStore();

  // State untuk data resep yang akan diupdate
  const [resepData, setResepData] = useState<Partial<Resep>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State tambahan untuk file baru yang akan diupload
  const [newGambarBase64, setNewGambarBase64] = useState<string | null>(null);
  const [newPdfUri, setNewPdfUri] = useState<string | null>(null);
  const [newPdfFileName, setNewPdfFileName] = useState<string | null>(null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | undefined>();

  // --- Ambil Data Resep untuk Formulir ---
  useEffect(() => {
    const loadResep = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await findResepById(id);
        if (data) {
          setResepData(data);
          // Ambil URL PDF saat ini (asumsi ada di resep.bahan[0])
          setCurrentPdfUrl(data.bahan && data.bahan.length > 0 ? data.bahan[0] : undefined);
        }
      } catch (error) {
        Alert.alert("Error", "Gagal memuat data resep.");
      } finally {
        setIsLoading(false);
      }
    };
    loadResep();
  }, [id, findResepById]);

  // --- Fungsi Image Picker (Diadaptasi) ---
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      // Set state untuk gambar baru (URI untuk preview, Base64 untuk upload)
      setResepData({ ...resepData, gambar: image.uri });
      setNewGambarBase64(image.base64 || null);
    }
  };

  // --- Fungsi Pilih Dokumen (Diadaptasi) ---
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Set state untuk PDF baru
        setNewPdfUri(result.assets[0].uri);
        setNewPdfFileName(result.assets[0].name);
      }
    } catch (err) {
      Alert.alert("Error", "Gagal memilih file PDF.");
    }
  };

  // --- FUNGSI SIMPAN/UPDATE ---
  const handleSave = async () => {
    if (!id || isSaving) return;

    setIsSaving(true);
    let updatedData = { ...resepData };
    let pdfUrlToSave = currentPdfUrl;

    try {
      // 1. 🖼️ UPLOAD GAMBAR BARU (jika Base64 ada, berarti user memilih gambar baru)
      if (newGambarBase64) {
        // 🚀 Hapus gambar lama jika ada (Ini perlu diimplementasi di resepStore/Supabase Helper)
        // Logika hapus gambar lama di Supabase perlu dipertimbangkan di sini atau di updateResep

        const uploadedImageUrl = await uploadImageToSupabase(newGambarBase64);
        updatedData.gambar = uploadedImageUrl;
      }

      // 2. 📄 UPLOAD PDF BARU (jika newPdfUri ada)
      if (newPdfUri && newPdfFileName) {
        // 🚀 Hapus PDF lama (Ini perlu diimplementasi)

        const uploadedPdfUrl = await uploadPdfToSupabase(newPdfUri, newPdfFileName);
        pdfUrlToSave = uploadedPdfUrl;
      }

      // 3. Update data bahan dengan URL PDF baru/lama
      // Mengasumsikan resep.bahan selalu menyimpan URL PDF di index 0
      updatedData.bahan = [pdfUrlToSave || ""];

      // 4. Update di Zustand/Supabase DB
      await updateResep(id, updatedData as Resep);

      Toast.show({ type: "success", text1: "Resep berhasil diperbarui!", position: "top" });
      router.back();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan resep.";
      Toast.show({ type: "error", text1: "Gagal update resep", text2: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  // ... (Loading dan not found tetap sama)

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loading}>Memuat data...</Text>
      </View>
    );
  }

  if (!resepData.id) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loading}>Resep tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Resep: {resepData.judul}</Text>

      {/* INPUT JUDUL */}
      <Text style={styles.label}>Judul</Text>
      <TextInput style={styles.input} value={resepData.judul} onChangeText={(text) => setResepData({ ...resepData, judul: text })} />

      {/* INPUT DESKRIPSI */}
      <Text style={styles.label}>Deskripsi</Text>
      <TextInput style={[styles.input, styles.textArea]} value={resepData.deskripsi} onChangeText={(text) => setResepData({ ...resepData, deskripsi: text })} multiline />

      {/* 💰 INPUT HARGA BARU */}
      <Text style={styles.label}>Harga (Rp)</Text>
      <TextInput style={styles.input} value={String(resepData.harga)} onChangeText={(text) => setResepData({ ...resepData, harga: Number(text) })} keyboardType="numeric" />

      {/* 🖼️ INPUT GAMBAR */}
      <Text style={[styles.label, { marginTop: 20 }]}>Gambar (Thumbnail)</Text>
      {resepData.gambar ? (
        <View>
          <Image source={{ uri: resepData.gambar }} style={styles.imagePreview} />
          <Button title="Ganti Gambar" onPress={pickImage} disabled={isSaving} />
        </View>
      ) : (
        <Button title="Pilih Gambar Baru" onPress={pickImage} disabled={isSaving} />
      )}

      {/* 📄 INPUT PDF */}
      <Text style={[styles.label, { marginTop: 20 }]}>Dokumen Resep (PDF)</Text>
      <Button title="Ganti File PDF" onPress={pickDocument} disabled={isSaving} />

      {/* Tampilkan file PDF yang sedang aktif atau yang baru dipilih */}
      {newPdfFileName ? <Text style={styles.pdfStatus}>File Baru Terpilih: {newPdfFileName}</Text> : currentPdfUrl && <Text style={styles.pdfStatus}>File Aktif: {currentPdfUrl.substring(currentPdfUrl.lastIndexOf("/") + 1)}</Text>}

      <View style={{ marginTop: 30, marginBottom: 50 }}>
        <Button title={isSaving ? "Menyimpan..." : "Simpan Perubahan"} onPress={handleSave} disabled={isSaving} color="#007AFF" />
      </View>
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { textAlign: "center", marginTop: 10, fontSize: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 16, marginTop: 10, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
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
