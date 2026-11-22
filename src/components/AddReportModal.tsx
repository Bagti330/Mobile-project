
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
import * as FileSystem from 'expo-file-system/legacy';

import {
  ReportCategory,
  SeverityLevel,
} from '../types/report';

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

// ==========================================
// FUNGSI MENYIMPAN FOTO KE PENYIMPANAN INTERNAL
// ==========================================

const saveEvidencePhoto = async (
  sourceUri: string
): Promise<string> => {
  if (Platform.OS === 'web') {
    return sourceUri;
  }

  const documentDirectory = FileSystem.documentDirectory;

  if (!documentDirectory) {
    throw new Error('Document directory tidak tersedia.');
  }

  // Folder penyimpanan foto bukti
  const folder = `${documentDirectory}evidence/`;

  // Periksa apakah folder sudah tersedia
  const folderInfo = await FileSystem.getInfoAsync(folder);

  // Buat folder jika belum ada
  if (!folderInfo.exists) {
    await FileSystem.makeDirectoryAsync(folder, {
      intermediates: true,
    });
  }

  // Buat nama file unik
  const fileName = `evidence_${Date.now()}.jpg`;

  const destination = `${folder}${fileName}`;

  // Salin foto ke penyimpanan internal aplikasi
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destination,
  });

  console.log('Foto berhasil disimpan:', destination);

  return destination;
};

// ==========================================
// KOMPONEN ADD REPORT MODAL
// ==========================================

export const AddReportModal = ({
  visible,
  onClose,
  onSubmit,
}: AddReportModalProps) => {
  const [nik, setNik] = useState('');
  const [title, setTitle] = useState('');

  const [category, setCategory] =
    useState<ReportCategory>('Bencana Alam');

  const [severity, setSeverity] =
    useState<SeverityLevel>('Sedang');

  const [description, setDescription] = useState('');

  const [photoUri, setPhotoUri] = useState<string | undefined>();

  const [isSaving, setIsSaving] = useState(false);

  // ==========================================
  // MEMILIH FOTO KAMERA / GALERI
  // ==========================================

  const handlePickImage = async (useCamera: boolean) => {
    try {
      // Meminta izin kamera hanya ketika tombol kamera ditekan
      if (useCamera) {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Izin Ditolak',
            'Aplikasi memerlukan izin kamera untuk mengambil foto bukti laporan.'
          );

          return;
        }
      }

      // Membuka kamera atau galeri
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          });

      // Jika pengguna membatalkan pemilihan foto
      if (result.canceled || !result.assets?.length) {
        return;
      }

      setIsSaving(true);

      // Salin foto ke penyimpanan internal aplikasi
      const savedUri = await saveEvidencePhoto(
        result.assets[0].uri
      );

      // Simpan URI foto
      setPhotoUri(savedUri);

      if (Platform.OS !== 'web') {
        Alert.alert(
          'Berhasil',
          'Foto bukti berhasil disimpan di penyimpanan aplikasi.'
        );
      }
    } catch (error) {
      console.error('Photo error:', error);

      Alert.alert(
        'Gagal',
        'Foto tidak dapat diambil atau disimpan.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // MENGIRIM LAPORAN
  // ==========================================

  const handleSubmit = () => {
    // Validasi NIK
    if (!/^\d{16}$/.test(nik.trim())) {
      Alert.alert(
        'Validasi NIK',
        'Mohon masukkan 16 digit NIK yang valid.'
      );

      return;
    }

    // Validasi judul dan deskripsi
    if (!title.trim() || !description.trim()) {
      Alert.alert(
        'Form Belum Lengkap',
        'Mohon isi judul dan deskripsi laporan!'
      );

      return;
    }

    // Mengirim data laporan ke halaman utama
    onSubmit(
      title.trim(),
      category,
      severity,
      description.trim(),
      nik.trim(),
      photoUri
    );

    // Reset formulir
    setNik('');
    setTitle('');
    setCategory('Bencana Alam');
    setSeverity('Sedang');
    setDescription('');
    setPhotoUri(undefined);

    onClose();
  };

  // ==========================================
  // TAMPILAN MODAL
  // ==========================================

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>

          {/* HEADER */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              🚨 Buat Laporan Baru
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* NIK */}
            <Text style={styles.label}>
              NIK Pelapor (Terenkripsi Aman 🔒)
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Masukkan 16 digit NIK Anda"
              keyboardType="numeric"
              maxLength={16}
              value={nik}
              onChangeText={setNik}
            />

            {/* JUDUL LAPORAN */}
            <Text style={styles.label}>
              Judul Laporan
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Contoh: Pohon Tumbang di Jl. Melati"
              value={title}
              onChangeText={setTitle}
            />

            {/* KATEGORI */}
            <Text style={styles.label}>
              Kategori
            </Text>

            <View style={styles.chipRow}>
              {(
                [
                  'Bencana Alam',
                  'Infrastruktur Rusak',
                  'Fasilitas Publik',
                ] as ReportCategory[]
              ).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    category === cat && styles.chipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === cat && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TINGKAT BAHAYA */}
            <Text style={styles.label}>
              Tingkat Bahaya
            </Text>

            <View style={styles.chipRow}>
              {(
                ['Tinggi', 'Sedang', 'Rendah'] as SeverityLevel[]
              ).map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[
                    styles.chip,
                    severity === sev &&
                      (sev === 'Tinggi'
                        ? styles.bgRed
                        : sev === 'Sedang'
                        ? styles.bgOrange
                        : styles.chipActive),
                  ]}
                  onPress={() => setSeverity(sev)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      severity === sev && styles.textWhite,
                    ]}
                  >
                    {sev}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* FOTO BUKTI */}
            <Text style={styles.label}>
              Foto Bukti Kejadian
            </Text>

            <View style={styles.photoActionRow}>

              {/* TOMBOL KAMERA */}
              <TouchableOpacity
                style={styles.photoBtn}
                onPress={() => handlePickImage(true)}
                disabled={isSaving}
              >
                <Text style={styles.photoBtnText}>
                  📷 Ambil Foto
                </Text>
              </TouchableOpacity>

              {/* TOMBOL GALERI */}
              <TouchableOpacity
                style={styles.photoBtn}
                onPress={() => handlePickImage(false)}
                disabled={isSaving}
              >
                <Text style={styles.photoBtnText}>
                  🖼️ Pilih Galeri
                </Text>
              </TouchableOpacity>
            </View>

            {/* STATUS PENYIMPANAN */}
            {isSaving && (
              <Text style={styles.savingText}>
                Menyimpan foto...
              </Text>
            )}

            {/* PREVIEW FOTO */}
            {photoUri && (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.previewImage}
                />

                <Text style={styles.savedText}>
                  ✓ Foto berhasil disimpan
                </Text>

                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => setPhotoUri(undefined)}
                >
                  <Text style={styles.removePhotoText}>
                    Hapus Foto dari Form
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* DESKRIPSI */}
            <Text style={styles.label}>
              Deskripsi Kejadian
            </Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Jelaskan detail lokasi dan kondisi terkini..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            {/* TOMBOL KIRIM */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSaving && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                Kirim Laporan
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ==========================================
// STYLING
// ==========================================

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

  bgRed: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },

  bgOrange: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },

  textWhite: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

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

  savedText: {
    color: '#16a34a',
    fontSize: 12,
    marginTop: 6,
  },

  savingText: {
    color: '#0369a1',
    marginTop: 8,
    fontSize: 12,
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

  disabledButton: {
    opacity: 0.5,
  },

  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
