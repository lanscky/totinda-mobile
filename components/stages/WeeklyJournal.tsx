import { CheckCircle2, ChevronRight, Clock3, FilePenLine, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import {
  StageReportInput,
  StageReportStatus,
  StageWeeklyReport,
  stageReportService,
} from "../../api/stages";
import { Button } from "../Button";
import { Typography } from "../Typography";

const reportStyles: Record<StageReportStatus, { color: string; background: string; icon: typeof Clock3 }> = {
  draft: { color: "#667085", background: "bg-gray-100", icon: FilePenLine },
  submitted: { color: "#D97706", background: "bg-amber-50", icon: Clock3 },
  validated: { color: "#059669", background: "bg-emerald-50", icon: CheckCircle2 },
};

const currentMonday = () => {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() - ((value.getDay() + 6) % 7));
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyInput: StageReportInput = {
  activities: "",
  learnings: "",
  difficulties: "",
  status: "draft",
};

export function WeeklyJournal({ stageId }: { stageId: number }) {
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState<StageWeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<StageWeeklyReport | null>(null);
  const [form, setForm] = useState<StageReportInput>(emptyInput);
  const monday = useMemo(currentMonday, []);

  const loadReports = useCallback(async () => {
    try {
      setReports(await stageReportService.list(stageId));
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error instanceof Error ? error.message : t("common.networkError"),
      });
    } finally {
      setLoading(false);
    }
  }, [stageId, t]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const openEditor = (report?: StageWeeklyReport) => {
    setSelectedReport(report ?? null);
    setForm(report ? {
      activities: report.activities,
      learnings: report.learnings,
      difficulties: report.difficulties,
      status: report.status === "validated" ? "submitted" : report.status,
    } : emptyInput);
    setEditorVisible(true);
  };

  const save = async (status: "draft" | "submitted") => {
    if (!form.activities.trim()) {
      Toast.show({ type: "error", text1: t("stage.journal.activitiesRequired") });
      return;
    }
    setSaving(true);
    const input = {
      activities: form.activities.trim(),
      learnings: form.learnings.trim(),
      difficulties: form.difficulties.trim(),
      status,
    };
    try {
      if (selectedReport) await stageReportService.update(selectedReport.id, input);
      else await stageReportService.create(stageId, monday, input);
      setEditorVisible(false);
      await loadReports();
      Toast.show({ type: "success", text1: t(status === "submitted" ? "stage.journal.submittedSuccess" : "stage.journal.savedSuccess") });
    } catch (error) {
      Toast.show({ type: "error", text1: error instanceof Error ? error.message : t("common.networkError") });
    } finally {
      setSaving(false);
    }
  };

  const currentWeekExists = reports.some((report) => report.week_start === monday);
  const formatWeek = (report: StageWeeklyReport) => {
    const start = new Date(`${report.week_start}T12:00:00`);
    const end = new Date(`${report.week_end}T12:00:00`);
    const locale = i18n.language === "ln" ? "fr-FR" : i18n.language;
    return `${start.toLocaleDateString(locale, { day: "numeric", month: "short" })} – ${end.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}`;
  };

  return (
    <View className="mt-4 rounded-3xl border border-gray-100 bg-white p-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Typography variant="body" weight="bold" className="text-secondary">
            {t("stage.journal.title")}
          </Typography>
          <Typography variant="label" className="mt-1 text-gray-500">
            {t("stage.journal.subtitle")}
          </Typography>
        </View>
        {!currentWeekExists ? (
          <TouchableOpacity
            onPress={() => openEditor()}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-primary"
          >
            <Plus size={21} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator className="mt-5" color="#044EB8" />
      ) : reports.length === 0 ? (
        <View className="mt-4 rounded-2xl bg-gray-50 p-4">
          <Typography variant="caption" className="text-center text-gray-500">
            {t("stage.journal.empty")}
          </Typography>
          <Button title={t("stage.journal.addWeek")} onPress={() => openEditor()} className="mt-4" />
        </View>
      ) : (
        <View className="mt-4 gap-3">
          {reports.map((report) => {
            const style = reportStyles[report.status];
            const StatusIcon = style.icon;
            const editable = report.status !== "validated";
            return (
              <TouchableOpacity
                key={report.id}
                disabled={!editable}
                onPress={() => openEditor(report)}
                className="rounded-2xl border border-gray-100 p-4"
              >
                <View className="flex-row items-center">
                  <View className={`h-10 w-10 items-center justify-center rounded-xl ${style.background}`}>
                    <StatusIcon size={19} color={style.color} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Typography variant="caption" weight="bold" className="text-secondary">
                      {formatWeek(report)}
                    </Typography>
                    <Typography variant="label" weight="semi" style={{ color: style.color }}>
                      {t(`stage.journal.status.${report.status}`)}
                    </Typography>
                  </View>
                  {editable ? <ChevronRight size={19} color="#98A2B3" /> : null}
                </View>
                <Typography variant="caption" numberOfLines={2} className="mt-3 text-gray-600">
                  {report.activities}
                </Typography>
                {report.company_comment ? (
                  <View className="mt-3 rounded-xl bg-blue-50 p-3">
                    <Typography variant="label" weight="bold" className="text-primary">
                      {t("stage.journal.companyComment")}
                    </Typography>
                    <Typography variant="caption" className="mt-1 text-gray-700">
                      {report.company_comment}
                    </Typography>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Modal visible={editorVisible} transparent animationType="slide" onRequestClose={() => !saving && setEditorVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 justify-end bg-black/50">
          <View className="max-h-[92%] rounded-t-3xl bg-white px-6 pb-8 pt-6">
            <Typography variant="h3" weight="bold" className="text-secondary">
              {t("stage.journal.editorTitle")}
            </Typography>
            <Typography variant="caption" className="mt-1 text-gray-500">
              {selectedReport ? formatWeek(selectedReport) : t("stage.journal.currentWeek")}
            </Typography>
            <ScrollView className="mt-5" keyboardShouldPersistTaps="handled">
              <JournalField
                label={t("stage.journal.activities")}
                placeholder={t("stage.journal.activitiesPlaceholder")}
                value={form.activities}
                onChangeText={(activities) => setForm((current) => ({ ...current, activities }))}
              />
              <JournalField
                label={t("stage.journal.learnings")}
                placeholder={t("stage.journal.learningsPlaceholder")}
                value={form.learnings}
                onChangeText={(learnings) => setForm((current) => ({ ...current, learnings }))}
              />
              <JournalField
                label={t("stage.journal.difficulties")}
                placeholder={t("stage.journal.difficultiesPlaceholder")}
                value={form.difficulties}
                onChangeText={(difficulties) => setForm((current) => ({ ...current, difficulties }))}
              />
            </ScrollView>
            <Button title={t("stage.journal.submit")} onPress={() => void save("submitted")} loading={saving} disabled={!form.activities.trim()} className="mt-5" />
            <Button title={t("stage.journal.saveDraft")} variant="outline" onPress={() => void save("draft")} disabled={saving || !form.activities.trim()} className="mt-3" />
            <TouchableOpacity onPress={() => setEditorVisible(false)} disabled={saving} className="mt-3 py-3">
              <Typography weight="semi" className="text-center text-gray-600">{t("common.cancel")}</Typography>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function JournalField({ label, placeholder, value, onChangeText }: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View className="mb-4">
      <Typography variant="caption" weight="semi" className="mb-2 text-gray-700">{label}</Typography>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#98A2B3"
        multiline
        maxLength={2000}
        textAlignVertical="top"
        className="min-h-28 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-noto-reg text-base text-gray-800"
      />
    </View>
  );
}
