export type Role = "animator" | "admin";
export type ActivityStatus = "planned" | "active" | "finished" | "cancelled";
export type MessageChannel = "announcements" | "team" | "urgent";
export type Priority = "low" | "normal" | "high" | "urgent";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  team: string;
  availability: string;
  photoUrl: string;
  createdAt: string;
};

export type Day = {
  id: string;
  date: string;
  title: string;
  theme: string;
  value: string;
  pointOfDay: string;
  bibleQuote: string;
  explanation: string;
  animatorChallenge: string;
  childrenChallenge: string;
  prayer: string;
  song: string;
  catechesisNotes: string;
};

export type ActivityType =
  | "Priprava"
  | "Vhod"
  | "Igrica"
  | "Molitev"
  | "Kateheza"
  | "Malica"
  | "Delavnice"
  | "Kosilo"
  | "Velika igra"
  | "Konec"
  | "Refleksija"
  | "Druženje"
  | "Drugo";

export type Activity = {
  id: string;
  dayId: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  location: string;
  rainLocation: string;
  rainInstructions: string;
  type: ActivityType;
  responsibleUserId: string;
  assignedUserIds: string[];
  materials: string[];
  publicNotes: string;
  adminNotes: string;
  status: ActivityStatus;
  lastEditedAt: string;
  changedRecently: boolean;
};

export type Task = {
  id: string;
  activityId: string;
  assignedTo: string;
  title: string;
  description: string;
  priority: Priority;
  dueTime: string;
  done: boolean;
  createdAt: string;
};

export type Message = {
  id: string;
  senderId: string;
  channel: MessageChannel;
  title: string;
  text: string;
  priority: Priority;
  createdAt: string;
  seenBy: string[];
  relatedActivityId?: string;
  requireSeenConfirmation: boolean;
};

export type Group = {
  id: string;
  name: string;
  childrenCount: number;
  leaderIds: string[];
  assistantIds: string[];
  notes: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  text: string;
  relatedActivityId?: string;
  read: boolean;
  createdAt: string;
};

export type Store = {
  users: User[];
  days: Day[];
  activities: Activity[];
  tasks: Task[];
  messages: Message[];
  groups: Group[];
  notifications: Notification[];
  rainPlanActive: boolean;
};
