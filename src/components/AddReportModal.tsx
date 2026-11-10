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
} from 'react-native';
import { ReportCategory, SeverityLevel } from '../types/report';

interface AddReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, category: ReportCategory, severity: SeverityLevel, description: string) => void;
}

export const AddReportModal = ({ visible, onClose, onSubmit }: AddReportModalProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Bencana Alam');
  const [severity, setSeverity] = useState<SeverityLevel>('Sedang');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      alert('Mohon isi judul dan deskripsi laporan!');
      return;
    }
    onSubmit(title, category, severity, description);
    // Reset form setelah dikirim
    setTitle('');
    setDescription('');
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 14,
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
    height: 90,
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
  submitButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});