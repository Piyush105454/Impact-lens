import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Phase } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TZ = "Asia/Kolkata";

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...opts }).format(new Date(iso));
}

export function formatShortDate(iso: string) {
  return formatDate(iso, { day: "numeric", month: "short", year: "numeric" });
}

export function formatMonth(iso: string) {
  return formatDate(iso, { month: "long", year: "numeric" });
}

export function formatDateTime(iso: string) {
  return formatDate(iso, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatPeriod(start: string, end: string) {
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

export function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export const PHASE_LABEL: Record<Phase, string> = { before: "Before", during: "During", after: "After" };

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
