import { apiRequest } from "./client";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export type StageStatus = "upcoming" | "in_progress" | "completed" | "cancelled";

export type StageAssignment = {
  id: number;
  candidature: number;
  student: number;
  offre_stage: number;
  offre_title: string;
  company_name: string;
  student_name: string;
  assigned_on: string;
  start_date: string | null;
  end_date: string | null;
  status: StageStatus;
  objectives: string;
  convention_pdf: string | null;
  supervisor_name: string | null;
  supervisor_email: string | null;
  progress: {
    total_weeks: number;
    elapsed_weeks: number;
    validated_weeks: number;
    pending_reports: number;
    draft_reports: number;
    missing_weeks: number;
    percentage: number;
  };
};

const emptyProgress: StageAssignment["progress"] = {
  total_weeks: 0,
  elapsed_weeks: 0,
  validated_weeks: 0,
  pending_reports: 0,
  draft_reports: 0,
  missing_weeks: 0,
  percentage: 0,
};

const normalizeStage = (stage: StageAssignment): StageAssignment => ({
  ...stage,
  progress: stage.progress ?? emptyProgress,
});

export type StageReportStatus = "draft" | "submitted" | "validated";

export type StageWeeklyReport = {
  id: number;
  affectation: number;
  week_start: string;
  week_end: string;
  activities: string;
  learnings: string;
  difficulties: string;
  status: StageReportStatus;
  company_comment: string;
  submitted_at: string | null;
  validated_at: string | null;
  validated_by: number | null;
  validated_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export type StageReportInput = {
  activities: string;
  learnings: string;
  difficulties: string;
  status: "draft" | "submitted";
};

type Paginated<T> = { results: T[] };

const normalizeList = <T>(data: T[] | Paginated<T>) =>
  Array.isArray(data) ? data : data.results;

export type FinalEvaluation = {
  id: number;
  candidature: number;
  score: number;
  comments: string;
  created_at: string;
};

type StageCertificate = {
  filename: string;
  reference: string;
  content_base64: string;
};

export const stageService = {
  getById: async (id: number) =>
    normalizeStage(await apiRequest<StageAssignment>(`affectations-stage/${id}/`)),
  getEvaluation: async (candidatureId: number) => {
    const data = await apiRequest<FinalEvaluation[] | Paginated<FinalEvaluation>>(
      `evaluations/by-candidature/${candidatureId}/`,
    );
    return normalizeList(data)[0] ?? null;
  },
  downloadCertificate: async (stageId: number) => {
    const certificate = await apiRequest<StageCertificate>(
      `affectations-stage/${stageId}/attestation/`,
    );
    if (!FileSystem.cacheDirectory) throw new Error("Stockage temporaire indisponible.");
    const fileUri = `${FileSystem.cacheDirectory}${certificate.filename}`;
    await FileSystem.writeAsStringAsync(fileUri, certificate.content_base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "Attestation de fin de stage",
        UTI: "com.adobe.pdf",
      });
    }
    return certificate.reference;
  },
};

export const stageReportService = {
  list: async (stageId: number) => {
    const data = await apiRequest<StageWeeklyReport[] | Paginated<StageWeeklyReport>>(
      `rapports-stage/?affectation=${stageId}&limit=1000`,
    );
    return normalizeList(data);
  },
  create: (stageId: number, weekStart: string, input: StageReportInput) =>
    apiRequest<StageWeeklyReport>("rapports-stage/", {
      method: "POST",
      body: JSON.stringify({ affectation: stageId, week_start: weekStart, ...input }),
    }),
  update: (reportId: number, input: StageReportInput) =>
    apiRequest<StageWeeklyReport>(`rapports-stage/${reportId}/`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};
