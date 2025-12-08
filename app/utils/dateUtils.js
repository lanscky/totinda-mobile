// utils/dateUtils.js

export function timeAgo(dateString) {
  const now = new Date();
  const publishedDate = new Date(dateString);
  const diffInSeconds = Math.floor((now - publishedDate) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (diffInSeconds < 60) return "Il y a quelques secondes";
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  if (days < 7) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  if (months < 12) return `Il y a ${months} mois`;
  return `Il y a ${years} an${years > 1 ? "s" : ""}`;
}
