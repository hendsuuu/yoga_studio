import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@virtualstudio.app",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );
}

export { webpush };

export type PushPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
};

export function buildSchedulePayload(schedule: {
  title: string;
  coach: string;
  timeRange: string;
  id: string;
}): PushPayload {
  return {
    title: `🧘 ${schedule.title}`,
    body: `Kelas bersama ${schedule.coach} hari ini pukul ${schedule.timeRange}. Jangan sampai terlewat!`,
    icon: "/images/yoga.png",
    badge: "/images/yoga.png",
    url: "/dashboard",
    tag: `schedule-${schedule.id}`,
  };
}
