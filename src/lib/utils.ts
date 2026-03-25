import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateZScore(value: number, history: number[]) {
  if (history.length < 2) return 0;
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const stdDev = Math.sqrt(history.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / history.length);
  return stdDev === 0 ? 0 : (value - mean) / stdDev;
}

export function getRiskLevel(score: number) {
  if (score < 30) return { label: "Low", color: "text-green-400", bg: "bg-green-400/10" };
  if (score < 60) return { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-400/10" };
  return { label: "High", color: "text-red-400", bg: "bg-red-400/10" };
}

export function getSuspicionStatus(score: number, zScore: number) {
  if (score > 70 || Math.abs(zScore) > 2.5) return { label: "Possible Doping Pattern", color: "text-red-500", icon: "🔴" };
  if (score > 40 || Math.abs(zScore) > 1.5) return { label: "Physiological Stress", color: "text-yellow-500", icon: "🟡" };
  return { label: "Normal", color: "text-green-500", icon: "🟢" };
}
