import { create } from 'zustand';
import { ReportItem } from '../types/report';
import { DUMMY_REPORTS } from '../data/dummyReports';

interface ReportState {
  reports: ReportItem[];
  selectedReport: ReportItem | null;
  addReport: (report: ReportItem) => void;
  setSelectedReport: (report: ReportItem | null) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: DUMMY_REPORTS,
  selectedReport: null,
  addReport: (newReport) => set((state) => ({ reports: [newReport, ...state.reports] })),
  setSelectedReport: (report) => set({ selectedReport: report }),
}));