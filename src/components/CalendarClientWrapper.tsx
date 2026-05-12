"use client";

import { useState, useEffect } from "react";
import { WeeklyCalendar } from "./WeeklyCalendar";
import type { WeekDay } from "@/lib/week";
import type { ReelRecord } from "@/app/reels/actions";

interface Props {
  week: WeekDay[];
  scheduledReels: ReelRecord[];
  unscheduledReels: ReelRecord[];
}

export function CalendarClientWrapper(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 bg-built-gray-1 border border-built-gray-2 rounded-sm" />;
  return <WeeklyCalendar {...props} />;
}
