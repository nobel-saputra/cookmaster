// app/resep/add.tsx

// impport component
import { supabase } from "@/lib/supabaseClient";
import { useResepStore } from "@/store/resepStore";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { addStyles as styles } from "./style/add";

// Konstanta untuk nama bucket di Supabase
const BUCKET_NAME = "resep-images";

export default function AddResepPage() {
  // State dan fungsi store resep
  const { addResep } = useResepStore();
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState("");
  const [gambar, setGambar] = useState<string | null>(null);
  const [gambarBase64, setGambarBase64] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fungsi untuk memilih gambar dari galeri
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

  // Fungsi untuk memilih file PDF dari dokumen
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

  // Konversi string base64 menjadi array byte
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Upload gambar ke Supabase Storage
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

  // Upload file PDF ke Supabase Storage
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

  // Proses penyimpanan data resep baru
  const handleSubmit = async () => {
    if (uploading) return;

    try {
      setUploading(true);
      let uploadedImageUrl = gambar;
      let uploadedPdfUrl: string | null = null;

      if (!pdfUri || !pdfFileName) {
        throw new Error("Mohon unggah dokumen PDF resep.");
      }

      if (gambar && !gambar.startsWith("http") && gambarBase64) {
        uploadedImageUrl = await uploadImageToSupabase(gambarBase64);
      }

      uploadedPdfUrl = await uploadPdfToSupabase(pdfUri, pdfFileName);

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

  // Tampilan utama halaman tambah resep
  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />

      {/* Header dengan gradient dan tombol kembali */}
      <LinearGradient colors={["#00B894", "#00B894"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Resep Baru</Text>
        <View style={styles.headerSubtitle}>
          <Ionicons name="restaurant" size={16} color="#fff" />
          <Text style={styles.headerSubtitleText}>Buat resep lezat Anda</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Bagian unggah gambar resep */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="image" size={20} color="#00B894" />
            <Text style={styles.cardTitle}>Foto Resep</Text>
          </View>

          {gambar ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: gambar }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.changeImageButton} onPress={pickImage} disabled={uploading}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.changeImageText}>Ganti Foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={uploading}>
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload" size={40} color="#00B894" />
              </View>
              <Text style={styles.uploadText}>Pilih Gambar dari Galeri</Text>
              <Text style={styles.uploadSubtext}>JPG atau PNG, maksimal 5MB</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form input detail resep */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="create" size={20} color="#00B894" />
            <Text style={styles.cardTitle}>Detail Resep</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="text" size={14} color="#666" /> Judul Resep
            </Text>
            <TextInput style={styles.input} value={judul} onChangeText={setJudul} placeholder="Contoh: Nasi Goreng Spesial" placeholderTextColor="#999" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="document-text" size={14} color="#666" /> Deskripsi
            </Text>
            <TextInput style={[styles.input, styles.textArea]} value={deskripsi} onChangeText={setDeskripsi} placeholder="Ceritakan tentang resep ini..." placeholderTextColor="#999" multiline numberOfLines={4} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="cash" size={14} color="#666" /> Harga (Rp)
            </Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>Rp</Text>
              <TextInput style={styles.priceInput} value={harga} onChangeText={setHarga} placeholder="25.000" placeholderTextColor="#999" keyboardType="numeric" />
            </View>
          </View>
        </View>

        {/* Bagian unggah dokumen PDF */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-attach" size={20} color="#00B894" />
            <Text style={styles.cardTitle}>Dokumen Resep (PDF)</Text>
          </View>

          {pdfFileName ? (
            <View style={styles.pdfPreview}>
              <View style={styles.pdfIconContainer}>
                <Ionicons name="document-text" size={32} color="#00B894" />
              </View>
              <View style={styles.pdfInfo}>
                <Text style={styles.pdfFileName} numberOfLines={1}>
                  {pdfFileName}
                </Text>
                <Text style={styles.pdfStatus}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" /> File siap diupload
                </Text>
              </View>
              <TouchableOpacity onPress={pickDocument} disabled={uploading} style={styles.pdfChangeButton}>
                <Ionicons name="swap-horizontal" size={20} color="#00B894" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pdfUploadButton} onPress={pickDocument} disabled={uploading}>
              <Ionicons name="cloud-upload" size={28} color="#00B894" />
              <Text style={styles.pdfUploadText}>Pilih File PDF</Text>
              <Text style={styles.pdfUploadSubtext}>Dokumen resep lengkap</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tombol simpan resep */}
        <TouchableOpacity style={[styles.submitButton, (!judul.trim() || !pdfUri || uploading) && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={!judul.trim() || !pdfUri || uploading}>
          <LinearGradient colors={!judul.trim() || !pdfUri || uploading ? ["#ccc", "#999"] : ["#00B894", "#00B894"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
            {uploading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitText}>Mengupload...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitText}>Simpan Resep</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <Toast />
    </View>
  );
}
