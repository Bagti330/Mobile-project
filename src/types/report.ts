export type ReportCategory = 'Bencana Alam' | 'Infrastruktur Rusak' | 'Fasilitas Publik';
export type SeverityLevel = 'Tinggi' | 'Sedang' | 'Rendah';

export interface ReportItem {
  id: string;
  title: string;
  category: ReportCategory;
  severity: SeverityLevel;
  description: string;
  timestamp: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}