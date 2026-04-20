import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/member/dashboard-client";
import { type TabKey } from "@/components/member/nav-bar";
import { getCurrentMemberSession } from "@/lib/auth/member-session";
import { prisma } from "@/lib/db/prisma";
import type { Recording, Schedule } from "@/types";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const VALID_TABS: TabKey[] = [
  "schedule",
  "recordings",
  "meditation",
  "relax",
  "library",
  "guide",
];

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeTab(rawTab: string | undefined, fallbackTab: TabKey): TabKey {
  if (rawTab && VALID_TABS.includes(rawTab as TabKey)) {
    return rawTab as TabKey;
  }

  return fallbackTab;
}

function normalizeRecordingDate(rawDate: string | undefined) {
  if (!rawDate) {
    return "";
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : "";
}

function createRecordingDateRange(date: string) {
  return {
    gte: new Date(`${date}T00:00:00.000Z`),
    lte: new Date(`${date}T23:59:59.999Z`),
  };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const member = await getCurrentMemberSession();

  if (!member) {
    redirect("/login");
  }

  if (!member.isActive) {
    redirect("/profile");
  }

  const defaultTab: TabKey = member.tier === "FREE" ? "relax" : "schedule";
  const activeTab = normalizeTab(getSingleParam(params.tab), defaultTab);
  const searchQuery = getSingleParam(params.q)?.trim() ?? "";
  const recordingDate = normalizeRecordingDate(getSingleParam(params.date));

  const [announcements, schedules, recordings] = await Promise.all([
    prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    activeTab === "schedule"
      ? prisma.schedule.findMany({
          where: { isActive: true },
          orderBy: { date: "asc" },
        }).then<Schedule[]>((items) =>
          items.map((item) => ({
            ...item,
            date: item.date.toISOString(),
          })),
        )
      : Promise.resolve<Schedule[]>([]),
    activeTab === "recordings"
      ? prisma.recording.findMany({
          where: {
            isPublished: true,
            ...(searchQuery
              ? {
                  title: {
                    contains: searchQuery,
                    mode: "insensitive",
                  },
                }
              : {}),
            ...(recordingDate
              ? { date: createRecordingDateRange(recordingDate) }
              : {}),
          },
          orderBy: { date: "desc" },
        }).then<Recording[]>((items) =>
          items.map((item) => ({
            ...item,
            date: item.date.toISOString(),
          })),
        )
      : Promise.resolve<Recording[]>([]),
  ]);

  return (
    <DashboardClient
      activeTab={activeTab}
      announcements={announcements}
      initialRecordingDate={recordingDate}
      initialSearchQuery={searchQuery}
      member={member}
      recordings={recordings}
      schedules={schedules}
    />
  );
}
