import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ReportCategory, SeverityLevel } from '../types/report';

interface AddReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    category: ReportCategory,
    severity: SeverityLevel,
    description: string,
    nik: string,
    photoUri?: string
  ) => void;
}

export const AddReportModal = ({ visible, onClose, onSubmit }: AddReportModalProps) => {
  const [nik, setNik] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Bencana Alam');
  const [severity, setSeverity] = useState<SeverityLevel>('Sedang');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  // Handler Pengambilan Foto dengan Just-In-Time Permission
  const handlePickImage = async (useCamera: boolean) => {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin kamera untuk mengambil foto bukti laporan.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = () => {
    if (nik.trim().length < 16) {
      Alert.alert('Validasi NIK', 'Mohon masukkan 16 digit NIK yang valid untuk verifikasi pelapor.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      Alert.alert('Form Belum Lengkap', 'Mohon isi judul dan deskripsi laporan!');
      return;
    }

    onSubmit(title, category, severity, description, nik, photoUri);

    // Reset seluruh field
    setNik('');
    setTitle('');
    setDescription('');
    setPhotoUri(undefined);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🚨 Buat Laporan Baru</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Input Identitas / NIK (Akan diamankan via expo-secure-store) */}
            <Text style={styles.label}>NIK Pelapor (Terenkripsi Aman 🔒)</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan 16 digit NIK Anda"
              keyboardType="numeric"
              maxLength={16}
              value={nik}
              onChangeText={setNik}
            />

            {/* Input Judul */}
            <Text style={styles.label}>Judul Laporan</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Pohon Tumbang di Jl. Melati"
              value={title}
              onChangeText={setTitle}
            />

            {/* Pilihan Kategori */}
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.chipRow}>
              {(['Bencana Alam', 'Infrastruktur Rusak', 'Fasilitas Publik'] as ReportCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pilihan Tingkat Bahaya */}
            <Text style={styles.label}>Tingkat Bahaya</Text>
            <View style={styles.chipRow}>
              {(['Tinggi', 'Sedang', 'Rendah'] as SeverityLevel[]).map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[
                    styles.chip,
                    severity === sev && (sev === 'Tinggi' ? styles.bgRed : styles.bgOrange),
                  ]}
                  onPress={() => setSeverity(sev)}
                >
                  <Text style={[styles.chipText, severity === sev && styles.textWhite]}>{sev}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tombol Unggah / Ambil Foto Bukti */}
            <Text style={styles.label}>Foto Bukti Kejadian</Text>
            <View style={styles.photoActionRow}>
              <TouchableOpacity style={styles.photoBtn} onPress={() => handlePickImage(true)}>
                <Text style={styles.photoBtnText}>📷 Ambil Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={() => handlePickImage(false)}>
                <Text style={styles.photoBtnText}>🖼️ Pilih Galeri</Text>
              </TouchableOpacity>
            </View>

            {photoUri && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setPhotoUri(undefined)}>
                  <Text style={styles.removePhotoText}>Hapus Foto</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Input Deskripsi */}
            <Text style={styles.label}>Deskripsi Kejadian</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Jelaskan detail lokasi dan kondisi terkini..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            {/* Tombol Simpan */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
              <Text style={styles.submitButtonText}>Kirim Laporan</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  closeIcon: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  textArea: {
    height: 85,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  bgRed: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  bgOrange: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  textWhite: { color: '#ffffff', fontWeight: 'bold' },
  photoActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: '#e0f2fe',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  photoBtnText: {
    color: '#0369a1',
    fontWeight: '600',
    fontSize: 13,
  },
  previewContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  removePhotoBtn: {
    marginTop: 6,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removePhotoText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});