import { supabase } from "@/lib/supabaseClient";
import { useResepStore } from "@/store/resepStore";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useState } from "react";
import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  Alert, 
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar
} from "react-native";
import Toast from "react-native-toast-message";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

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

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      
      {/* Header dengan Gradient */}
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Resep Baru</Text>
        <View style={styles.headerSubtitle}>
          <Ionicons name="restaurant" size={16} color="#fff" />
          <Text style={styles.headerSubtitleText}>Buat resep lezat Anda</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Gambar */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="image" size={20} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Foto Resep</Text>
          </View>
          
          {gambar ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: gambar }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={uploading}
              >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.changeImageText}>Ganti Foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={pickImage}
              disabled={uploading}
            >
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload" size={40} color="#FF6B6B" />
              </View>
              <Text style={styles.uploadText}>Pilih Gambar dari Galeri</Text>
              <Text style={styles.uploadSubtext}>JPG atau PNG, maksimal 5MB</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="create" size={20} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Detail Resep</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="text" size={14} color="#666" /> Judul Resep
            </Text>
            <TextInput 
              style={styles.input} 
              value={judul} 
              onChangeText={setJudul}
              placeholder="Contoh: Nasi Goreng Spesial"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="document-text" size={14} color="#666" /> Deskripsi
            </Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={deskripsi} 
              onChangeText={setDeskripsi}
              placeholder="Ceritakan tentang resep ini..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="cash" size={14} color="#666" /> Harga (Rp)
            </Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>Rp</Text>
              <TextInput 
                style={styles.priceInput} 
                value={harga} 
                onChangeText={setHarga}
                placeholder="25.000"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Card PDF */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-attach" size={20} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Dokumen Resep (PDF)</Text>
          </View>

          {pdfFileName ? (
            <View style={styles.pdfPreview}>
              <View style={styles.pdfIconContainer}>
                <Ionicons name="document-text" size={32} color="#FF6B6B" />
              </View>
              <View style={styles.pdfInfo}>
                <Text style={styles.pdfFileName} numberOfLines={1}>{pdfFileName}</Text>
                <Text style={styles.pdfStatus}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" /> File siap diupload
                </Text>
              </View>
              <TouchableOpacity 
                onPress={pickDocument}
                disabled={uploading}
                style={styles.pdfChangeButton}
              >
                <Ionicons name="swap-horizontal" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.pdfUploadButton}
              onPress={pickDocument}
              disabled={uploading}
            >
              <Ionicons name="cloud-upload" size={28} color="#FF6B6B" />
              <Text style={styles.pdfUploadText}>Pilih File PDF</Text>
              <Text style={styles.pdfUploadSubtext}>Dokumen resep lengkap</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!judul.trim() || !pdfUri || uploading) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!judul.trim() || !pdfUri || uploading}
        >
          <LinearGradient
            colors={(!judul.trim() || !pdfUri || uploading) ? ['#ccc', '#999'] : ['#FF6B6B', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
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

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerSubtitleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  imageContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: '#FFE0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#999',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C3E50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingLeft: 14,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    padding: 14,
    paddingLeft: 0,
    fontSize: 15,
    color: '#2C3E50',
  },
  pdfPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  pdfIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfInfo: {
    flex: 1,
  },
  pdfFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  pdfStatus: {
    fontSize: 13,
    color: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfChangeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfUploadButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: '#FFE0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  pdfUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 8,
  },
  pdfUploadSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 40,
  },
});