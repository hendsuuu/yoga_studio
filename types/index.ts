export type MemberSession = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  specialAccess: boolean;
  membershipExpiresAt: string | null;
};

export type Schedule = {
  id: string;
  title: string;
  date: string;
  timeRange: string;
  coach: string;
  coachPhoto: string | null;
  certificate: string | null;
  tools: string | null;
  meetingId: string | null;
  meetingPass: string | null;
  zoomUrl: string | null;
  isActive: boolean;
};

export type Recording = {
  id: string;
  title: string;
  date: string;
  coach: string;
  duration: string | null;
  url: string;
  isPublished: boolean;
};

export type Announcement = {
  id: string;
  message: string;
  isActive: boolean;
};

export type AppConfigItem = {
  id: string;
  key: string;
  value: string;
};

export type AdminStats = {
  totalMembers: number;
  activeMembers: number;
  totalSchedules: number;
  totalRecordings: number;
  activeAnnouncements: number;
};

export type AdminMember = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  specialAccess: boolean;
  membershipExpiresAt: string | null;
  createdAt: string;
};
