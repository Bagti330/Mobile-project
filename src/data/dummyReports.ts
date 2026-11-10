import { ReportItem } from '../types/report';

export const DUMMY_REPORTS: ReportItem[] = [
  {
    id: '1',
    title: 'Banjir Luapan Sungai',
    category: 'Bencana Alam',
    severity: 'Tinggi',
    description: 'Air meluap hingga 50cm di permukiman warga.',
    timestamp: '10 Menit lalu',
    coordinate: { latitude: -7.96662, longitude: 112.63263 },
  },
  {
    id: '2',
    title: 'Jalan Ambles & Berlubang',
    category: 'Infrastruktur Rusak',
    severity: 'Sedang',
    description: 'Jalan utama berlubang cukup dalam.',
    timestamp: '1 Jam lalu',
    coordinate: { latitude: -7.975, longitude: 112.628 },
  },
];