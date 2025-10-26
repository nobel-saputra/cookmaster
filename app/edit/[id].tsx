// app/edit/[id].tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  Alert, 
  Image, 
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useResepStore, Resep } from "@/store/resepStore";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "@/lib/supabaseClient";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BUCKET_NAME = "resep-images";

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

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

  const [resepData, setResepData] = useState<Partial<Resep>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newGambarBase64, setNewGambarBase64] = useState<string | null>(null);
  const [newPdfUri, setNewPdfUri] = useState<string | null>(null);
  const [newPdfFileName, setNewPdfFileName] = useState<string | null>(null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | undefined>();

  useEffect(() => {
    const loadResep = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await findResepById(id);
        if (data) {
          setResepData(data);
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      setResepData({ ...resepData, gambar: image.uri });
      setNewGambarBase64(image.base64 || null);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewPdfUri(result.assets[0].uri);
        setNewPdfFileName(result.assets[0].name);
      }
    } catch (err) {
      Alert.alert("Error", "Gagal memilih file PDF.");
    }
  };

  const handleSave = async () => {
    if (!id || isSaving) return;

    // Validasi
    if (!resepData.judul?.trim()) {
      Toast.show({ type: "error", text1: "Judul tidak boleh kosong" });
      return;
    }
    if (!resepData.harga || resepData.harga <= 0) {
      Toast.show({ type: "error", text1: "Harga harus lebih dari 0" });
      return;
    }

    setIsSaving(true);
    let updatedData = { ...resepData };
    let pdfUrlToSave = currentPdfUrl;

    try {
      if (newGambarBase64) {
        const uploadedImageUrl = await uploadImageToSupabase(newGambarBase64);
        updatedData.gambar = uploadedImageUrl;
      }

      if (newPdfUri && newPdfFileName) {
        const uploadedPdfUrl = await uploadPdfToSupabase(newPdfUri, newPdfFileName);
        pdfUrlToSave = uploadedPdfUrl;
      }

      updatedData.bahan = [pdfUrlToSave || ""];

      await updateResep(id, updatedData as Resep);

      Toast.show({ 
        type: "success", 
        text1: "Berhasil!", 
        text2: "Resep berhasil diperbarui",
        position: "top" 
      });
      
      setTimeout(() => router.back(), 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan resep.";
      Toast.show({ type: "error", text1: "Gagal update resep", text2: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  if (!resepData.id) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Resep tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1a1a1a" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Resep</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.formContainer}>
          {/* Image Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foto Resep</Text>
            <Pressable 
              style={styles.imagePickerContainer} 
              onPress={pickImage}
              disabled={isSaving}
            >
              {resepData.gambar ? (
                <>
                  <Image source={{ uri: resepData.gambar }} style={styles.imagePreview} />
                  <View style={styles.imageOverlay}>
                    <MaterialCommunityIcons name="camera" size={32} color="#fff" />
                    <Text style={styles.imageOverlayText}>Ganti Foto</Text>
                  </View>
                </>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="image-plus" size={48} color="#ccc" />
                  <Text style={styles.placeholderText}>Tap untuk pilih foto</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Form Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Dasar</Text>
            
            {/* Judul */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Judul Resep <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="food" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={resepData.judul}
                  onChangeText={(text) => setResepData({ ...resepData, judul: text })}
                  placeholder="Masukkan judul resep"
                  placeholderTextColor="#999"
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* Deskripsi */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deskripsi</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <MaterialCommunityIcons name="text" size={20} color="#999" style={styles.inputIconTop} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={resepData.deskripsi}
                  onChangeText={(text) => setResepData({ ...resepData, deskripsi: text })}
                  placeholder="Ceritakan tentang resep ini..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* Harga */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Harga <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={String(resepData.harga || "")}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, "");
                    setResepData({ ...resepData, harga: Number(numericValue) || 0 });
                  }}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  editable={!isSaving}
                />
              </View>
            </View>
          </View>

          {/* PDF Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dokumen Resep</Text>
            
            <Pressable 
              style={styles.pdfPickerButton}
              onPress={pickDocument}
              disabled={isSaving}
            >
              <View style={styles.pdfIconContainer}>
                <MaterialCommunityIcons name="file-pdf-box" size={32} color="#FF7A00" />
              </View>
              <View style={styles.pdfTextContainer}>
                <Text style={styles.pdfButtonTitle}>
                  {newPdfFileName || (currentPdfUrl ? "File PDF tersimpan" : "Pilih File PDF")}
                </Text>
                <Text style={styles.pdfButtonSubtitle}>
                  {newPdfFileName 
                    ? "Tap untuk ganti file" 
                    : currentPdfUrl 
                      ? currentPdfUrl.substring(currentPdfUrl.lastIndexOf("/") + 1).substring(0, 30) + "..."
                      : "Tap untuk upload dokumen resep"}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
            </Pressable>

            {newPdfFileName && (
              <View style={styles.newFileIndicator}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#00A86B" />
                <Text style={styles.newFileText}>File baru siap diupload</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable 
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </Pressable>

            <Pressable 
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
    fontWeight: "600",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },

  // Form Container
  formContainer: {
    padding: 20,
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Image Picker
  imagePickerContainer: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
  },
  imageOverlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },

  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#FF3B30",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e8e8e8",
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputIconTop: {
    marginRight: 10,
    marginTop: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
  },
  textAreaContainer: {
    alignItems: "flex-start",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF7A00",
    marginRight: 8,
  },
  priceInput: {
    fontWeight: "600",
    color: "#FF7A00",
  },

  // PDF Picker
  pdfPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  pdfIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pdfTextContainer: {
    flex: 1,
  },
  pdfButtonTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  pdfButtonSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  newFileIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  newFileText: {
    fontSize: 14,
    color: "#00A86B",
    fontWeight: "500",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e8e8e8",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#666",
  },
  saveButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
});