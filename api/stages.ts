import { apiRequest } from "./client";

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
};

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

export const stageService = {
  getById: (id: number) =>
    apiRequest<StageAssignment>(`affectations-stage/${id}/`),
  getEvaluation: async (candidatureId: number) => {
    const data = await apiRequest<FinalEvaluation[] | Paginated<FinalEvaluation>>(
      `evaluations/by-candidature/${candidatureId}/`,
    );
    return normalizeList(data)[0] ?? null;
  },
};

export const stageReportService = {
  list: async (stageId: number) => {
    const data = await apiRequest<StageWeeklyReport[] | Paginated<StageWeeklyReport>>(
      `rapports-stage/?affectation=${stageId}`,
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
