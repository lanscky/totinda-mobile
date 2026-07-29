type TimeUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";

const DIVISIONS: { amount: number; unit: TimeUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.345, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

const LABELS: Record<string, Record<TimeUnit, [string, string]>> = {
  fr: {
    second: ["seconde", "secondes"],
    minute: ["minute", "minutes"],
    hour: ["heure", "heures"],
    day: ["jour", "jours"],
    week: ["semaine", "semaines"],
    month: ["mois", "mois"],
    year: ["an", "ans"],
  },
  en: {
    second: ["second", "seconds"],
    minute: ["minute", "minutes"],
    hour: ["hour", "hours"],
    day: ["day", "days"],
    week: ["week", "weeks"],
    month: ["month", "months"],
    year: ["year", "years"],
  },
  ln: {
    second: ["seconde", "secondes"],
    minute: ["minute", "minutes"],
    hour: ["ngonga", "bangonga"],
    day: ["mokolo", "mikolo"],
    week: ["poso", "baposo"],
    month: ["sanza", "basanza"],
    year: ["mbula", "bambula"],
  },
};

const formatRelativeTime = (
  value: number,
  unit: TimeUnit,
  locale: string,
) => {
  const language = locale.split("-")[0];
  const labels = LABELS[language] ?? LABELS.fr;
  const absoluteValue = Math.max(1, Math.abs(value));
  const label = labels[unit][absoluteValue > 1 ? 1 : 0];

  if (language === "en") {
    return value < 0
      ? `${absoluteValue} ${label} ago`
      : `in ${absoluteValue} ${label}`;
  }

  if (language === "ln") {
    return value < 0
      ? `Eleki ${absoluteValue} ${label}`
      : `Etikali ${absoluteValue} ${label}`;
  }

  return value < 0
    ? `Il y a ${absoluteValue} ${label}`
    : `Dans ${absoluteValue} ${label}`;
};

export function timeAgo(dateString: string, locale = "fr") {
  const timestamp = new Date(dateString).getTime();
  if (!Number.isFinite(timestamp)) return "";

  let duration = (timestamp - Date.now()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      const roundedDuration =
        Math.round(duration) || (duration <= 0 ? -1 : 1);
      return formatRelativeTime(roundedDuration, division.unit, locale);
    }
    duration /= division.amount;
  }

  return "";
}

const parseDeadline = (dateString?: string | null) => {
  if (!dateString) return null;

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  const date = new Date(
    isDateOnly ? `${dateString}T23:59:59.999` : dateString,
  );

  return Number.isFinite(date.getTime()) ? date : null;
};

export function isDeadlinePassed(dateString?: string | null, now = new Date()) {
  const deadline = parseDeadline(dateString);
  return deadline ? deadline.getTime() < now.getTime() : false;
}

export function formatDate(dateString?: string | null) {
  const date = parseDeadline(dateString);
  if (!date) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}
