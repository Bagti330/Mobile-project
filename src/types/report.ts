export type ReportCategory = 'Bencana Alam' | 'Infrastruktur Rusak' | 'Fasilitas Publik';
export type SeverityLevel = 'Tinggi' | 'Sedang' | 'Rendah';

export interface ReportItem {
  id: string;
  title: string;
  category: ReportCategory;
  severity: SeverityLevel;
  description: string;
  timestamp: string;
  reporterNik?: string; // Akan dienkripsi via expo-secure-store
  photoUri?: string;    // Path foto dari expo-file-system
  coordinate: {
    latitude: number;
    longitude: number;
  };
}