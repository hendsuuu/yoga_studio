export type UserRole = "ADMIN" | "MEMBER";
export type UserTier = "FREE" | "PREMIUM";

export type MemberSession = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  tier: UserTier;
  aiDailyLimit: number;
  aiDailyLimitMax: number;
  aiUsedToday: number;
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
  totalCoaches: number;
  totalSchedules: number;
  totalRecordings: number;
  activeAnnouncements: number;
  recentMembers: { date: string; count: number }[];
};

export type AdminMember = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  tier: UserTier;
  isActive: boolean;
  aiDailyLimit: number;
  aiDailyLimitMax: number;
  membershipExpiresAt: string | null;
  createdAt: string;
};

export type Coach = {
  id: string;
  name: string;
  phone: string | null;
  gender: string | null;
  photo: string | null;
  certificate: string | null;
  specialty: string | null;
  isActive: boolean;
  createdAt: string;
};

export type PrivateYoga = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  coachId: string;
  coach: Coach;
  isActive: boolean;
  createdAt: string;
  bookings?: PrivateYogaBooking[];
};

export type PrivateYogaBooking = {
  id: string;
  privateYogaId: string;
  fullName: string;
  whatsapp: string;
  email: string | null;
  age: number | null;
  gender: string | null;
  experience: string | null;
  goal: string;
  healthNotes: string | null;
  createdAt: string;
};

export type AdminProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
};

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  category: string;
  isActive: boolean;
};
