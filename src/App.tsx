import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Edit3,
  Home,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Save,
  Send,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { createDemoStore } from "./demoData";
import { Activity, ActivityStatus, ActivityType, Day, Group, Message, Priority, Store, Task, User } from "./types";

type AnimatorTab = "today" | "schedule" | "tasks" | "messages" | "more" | "point";
type AdminTab = "dashboard" | "schedule" | "assignments" | "point" | "messages" | "groups" | "settings";

const activityTypes: ActivityType[] = ["Priprava", "Vhod", "Igrica", "Molitev", "Kateheza", "Malica", "Delavnice", "Kosilo", "Velika igra", "Konec", "Refleksija", "Druženje", "Drugo"];
const statusLabels: Record<ActivityStatus, string> = { planned: "Načrtovano", active: "Poteka", finished: "Končano", cancelled: "Odpovedano" };
const priorityLabels: Record<Priority, string> = { low: "Nizko", normal: "Normalno", high: "Visoko", urgent: "Nujno" };
const boardColumns = ["Nedodeljeno", "Vhod", "Igrica", "Glasba", "Molitev", "Kateheza", "Delavnice", "Velika igra", "Kuhinja", "Čiščenje", "Tehnika", "Refleksija"];

const nowMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("sl-SI", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${iso}T12:00:00`));

const firstName = (name: string) => name.split(" ")[0];

const sortActivities = (activities: Activity[]) => [...activities].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

const getCurrentAndNext = (activities: Activity[]) => {
  const sorted = sortActivities(activities);
  const minutes = nowMinutes();
  const current = sorted.find((activity) => minutes >= toMinutes(activity.startTime) && minutes < toMinutes(activity.endTime)) ?? null;
  const next = sorted.find((activity) => toMinutes(activity.startTime) > minutes) ?? sorted[0] ?? null;
  return { current, next };
};

const nameFor = (users: User[], id: string) => users.find((user) => user.id === id)?.name ?? "Nedodeljeno";

const namesFor = (users: User[], ids: string[]) => ids.map((id) => nameFor(users, id)).join(", ");

const activityLocation = (store: Store, activity: Activity) => (store.rainPlanActive && activity.rainLocation ? activity.rainLocation : activity.location);

const publicAnimator: User = {
  id: "public",
  name: "Ekipa animatorjev",
  email: "",
  phone: "",
  role: "animator",
  team: "Skupni pogled",
  availability: "javni pogled",
  photoUrl: "",
  createdAt: "2026-06-25",
};

export function App() {
  const [store, setStore] = useState<Store>(() => createDemoStore());
  const [currentUserId, setCurrentUserId] = useState("");
  const [roleView, setRoleView] = useState<"animator" | "admin">("animator");
  const [animatorTab, setAnimatorTab] = useState<AnimatorTab>("today");
  const [adminTab, setAdminTab] = useState<AdminTab>("dashboard");
  const [selectedDayId, setSelectedDayId] = useState(() => {
    const demo = createDemoStore();
    const today = new Date().toISOString().slice(0, 10);
    return demo.days.find((day) => day.date === today)?.id ?? demo.days[1].id;
  });
  const [focusOpen, setFocusOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [pendingChange, setPendingChange] = useState<{ before: Activity; after: Activity } | null>(null);
  const [dayPlanOpen, setDayPlanOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const currentUser = store.users.find((user) => user.id === currentUserId) ?? null;
  const viewerUser = currentUser ?? publicAnimator;
  const isLoggedIn = Boolean(currentUser);
  const selectedDay = store.days.find((day) => day.id === selectedDayId) ?? store.days[0];
  const dayActivities = useMemo(() => sortActivities(store.activities.filter((activity) => activity.dayId === selectedDay.id)), [store.activities, selectedDay.id]);
  const { current, next } = getCurrentAndNext(dayActivities);

  const updateActivity = (updated: Activity) => {
    const before = store.activities.find((activity) => activity.id === updated.id);
    setStore((previous) => ({
      ...previous,
      activities: previous.activities.map((activity) => (activity.id === updated.id ? { ...updated, lastEditedAt: new Date().toISOString(), changedRecently: true } : activity)),
    }));
    if (before) setPendingChange({ before, after: updated });
  };

  const sendChangeNotification = (change: { before: Activity; after: Activity }) => {
    const recipients = Array.from(new Set([change.after.responsibleUserId, ...change.after.assignedUserIds]));
    setStore((previous) => ({
      ...previous,
      notifications: [
        ...previous.notifications,
        ...recipients.map((userId) => ({
          id: `n-${Date.now()}-${userId}`,
          userId,
          title: "Sprememba urnika",
          text: `${change.after.title}: ${change.before.startTime} ${change.before.location} -> ${change.after.startTime} ${change.after.location}`,
          relatedActivityId: change.after.id,
          read: false,
          createdAt: new Date().toISOString(),
        })),
      ],
      messages: [
        {
          id: `m-${Date.now()}`,
          senderId: viewerUser.id,
          channel: "announcements",
          title: "Sprememba urnika",
          text: `${change.after.title} je posodobljena: ${change.after.startTime}-${change.after.endTime}, ${change.after.location}.`,
          priority: "high",
          createdAt: new Date().toISOString(),
          seenBy: [],
          relatedActivityId: change.after.id,
          requireSeenConfirmation: false,
        },
        ...previous.messages,
      ],
    }));
    setPendingChange(null);
  };

  const toggleTask = (taskId: string) => {
    setStore((previous) => ({ ...previous, tasks: previous.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)) }));
  };

  const markSeen = (messageId: string) => {
    if (!currentUser) {
      setLoginOpen(true);
      return;
    }
    setStore((previous) => ({
      ...previous,
      messages: previous.messages.map((message) =>
        message.id === messageId && !message.seenBy.includes(currentUser.id) ? { ...message, seenBy: [...message.seenBy, currentUser.id] } : message,
      ),
    }));
  };

  const activateRainPlan = () => {
    setStore((previous) => ({
      ...previous,
      rainPlanActive: true,
      messages: [
        {
          id: `m-rain-${Date.now()}`,
          senderId: viewerUser.id,
          channel: "urgent",
          title: "Aktiviran dežni plan",
          text: "Zaradi dežja je aktiviran dežni plan. Preveri nove lokacije pri svojih nalogah.",
          priority: "urgent",
          createdAt: new Date().toISOString(),
          seenBy: [],
          requireSeenConfirmation: true,
        },
        ...previous.messages,
      ],
    }));
  };

  const content =
    roleView === "admin" && currentUser ? (
      <AdminShell
        tab={adminTab}
        setTab={setAdminTab}
        user={currentUser}
        store={store}
        selectedDay={selectedDay}
        setSelectedDayId={setSelectedDayId}
        activities={dayActivities}
        current={current}
        next={next}
        onEdit={setEditingActivity}
        onRain={activateRainPlan}
        onDayPlan={() => setDayPlanOpen(true)}
        onAnnouncement={() => setAnnouncementOpen(true)}
        setStore={setStore}
      />
    ) : (
      <AnimatorShell
        tab={animatorTab}
        setTab={setAnimatorTab}
        user={viewerUser}
        isLoggedIn={isLoggedIn}
        onLogin={() => setLoginOpen(true)}
        store={store}
        selectedDay={selectedDay}
        setSelectedDayId={setSelectedDayId}
        activities={dayActivities}
        current={current}
        next={next}
        onFocus={() => setFocusOpen(true)}
        onTaskToggle={toggleTask}
        onSeen={markSeen}
      />
    );

  return (
    <div className="app-shell">
      <TopBar
        user={currentUser}
        roleView={roleView}
        viewerName={viewerUser.name}
        onRoleSwitch={currentUser?.role === "admin" ? setRoleView : undefined}
        onLogin={() => setLoginOpen(true)}
        onLogout={currentUser ? () => { setCurrentUserId(""); setRoleView("animator"); } : undefined}
      />
      {store.rainPlanActive && <div className="rain-banner"><CloudRain size={18} /> Aktiviran je dežni plan</div>}
      {content}
      {focusOpen && current && <NowModal store={store} user={viewerUser} isLoggedIn={isLoggedIn} activity={current} next={next} onClose={() => setFocusOpen(false)} />}
      {editingActivity && <ActivityEditModal store={store} activity={editingActivity} onClose={() => setEditingActivity(null)} onSave={(activity) => { updateActivity(activity); setEditingActivity(null); }} />}
      {pendingChange && <ConfirmNotifyModal change={pendingChange} onClose={() => setPendingChange(null)} onNotify={() => sendChangeNotification(pendingChange)} />}
      {dayPlanOpen && <DayPlanModal store={store} selectedDay={selectedDay} setStore={setStore} onClose={() => setDayPlanOpen(false)} senderId={viewerUser.id} />}
      {announcementOpen && <AnnouncementModal store={store} setStore={setStore} senderId={viewerUser.id} onClose={() => setAnnouncementOpen(false)} />}
      {loginOpen && <LoginModal users={store.users} onClose={() => setLoginOpen(false)} onLogin={(user) => { setCurrentUserId(user.id); setRoleView(user.role === "admin" ? "admin" : "animator"); setLoginOpen(false); }} />}
    </div>
  );
}

function LoginModal({ users, onLogin, onClose }: { users: User[]; onLogin: (user: User) => void; onClose: () => void }) {
  const [email, setEmail] = useState("luka@oratorij.si");
  const selected = users.find((user) => user.email === email) ?? users[0];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onLogin(selected);
  };
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="login-card">
        <div className="modal-head"><h2>Prijava</h2><button className="icon-button" onClick={onClose}><X size={18} /></button></div>
        <div className="logo-mark"><Sparkles size={28} /></div>
        <p className="eyebrow">Oratorij za animatorje</p>
        <h1>Oratorij Hub</h1>
        <p className="muted">Mirna nadzorna točka za urnik, naloge, točko dneva in hitro komunikacijo ekipe.</p>
        <form onSubmit={submit} className="form-grid">
          <label>Email<select value={email} onChange={(event) => setEmail(event.target.value)}>{users.map((user) => <option key={user.id} value={user.email}>{user.email} - {user.role}</option>)}</select></label>
          <label>Geslo<input type="password" value="oratorij-demo" readOnly /></label>
          <button className="primary-button" type="submit">Prijava</button>
        </form>
      </section>
    </div>
  );
}

function TopBar({ user, viewerName, roleView, onRoleSwitch, onLogin, onLogout }: { user: User | null; viewerName: string; roleView: "animator" | "admin"; onRoleSwitch?: (role: "animator" | "admin") => void; onLogin: () => void; onLogout?: () => void }) {
  return (
    <header className="top-bar">
      <div>
        <strong>Oratorij Hub</strong>
        <span>{user ? viewerName : "Javni pogled za animatorje"}</span>
      </div>
      <div className="top-actions">
        {onRoleSwitch && (
          <button className="pill-button" onClick={() => onRoleSwitch(roleView === "admin" ? "animator" : "admin")}>
            {roleView === "admin" ? "Animator pogled" : "Admin pogled"}
          </button>
        )}
        {user ? <button className="icon-button" onClick={onLogout}><X size={18} /></button> : <button className="pill-button" onClick={onLogin}>Prijava</button>}
      </div>
    </header>
  );
}

function AnimatorShell(props: {
  tab: AnimatorTab;
  setTab: (tab: AnimatorTab) => void;
  user: User;
  isLoggedIn: boolean;
  onLogin: () => void;
  store: Store;
  selectedDay: Day;
  setSelectedDayId: (id: string) => void;
  activities: Activity[];
  current: Activity | null;
  next: Activity | null;
  onFocus: () => void;
  onTaskToggle: (taskId: string) => void;
  onSeen: (messageId: string) => void;
}) {
  const screen = {
    today: <TodayScreen {...props} />,
    schedule: <TimetableScreen {...props} />,
    tasks: <TasksScreen {...props} />,
    messages: <MessagesScreen {...props} />,
    point: <PointScreen day={props.selectedDay} />,
    more: <MoreScreen setTab={props.setTab} user={props.user} />,
  }[props.tab];
  return (
    <>
      <main className="main-content">{screen}</main>
      <nav className="bottom-nav">
        <NavButton active={props.tab === "today"} icon={<Home />} label="Danes" onClick={() => props.setTab("today")} />
        <NavButton active={props.tab === "schedule"} icon={<CalendarDays />} label="Urnik" onClick={() => props.setTab("schedule")} />
        <NavButton active={props.tab === "tasks"} icon={<ListChecks />} label="Moje naloge" onClick={() => props.setTab("tasks")} />
        <NavButton active={props.tab === "messages"} icon={<MessageCircle />} label="Sporočila" onClick={() => props.setTab("messages")} />
        <NavButton active={props.tab === "more" || props.tab === "point"} icon={<MoreHorizontal />} label="Več" onClick={() => props.setTab("more")} />
      </nav>
    </>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement; label: string; onClick: () => void }) {
  return <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function TodayScreen({ user, isLoggedIn, onLogin, store, selectedDay, activities, current, next, onFocus, onTaskToggle }: Parameters<typeof AnimatorShell>[0]) {
  const myTasks = isLoggedIn ? store.tasks.filter((task) => task.assignedTo === user.id && activities.some((activity) => activity.id === task.activityId)) : [];
  const urgent = store.messages.filter((message) => message.channel === "urgent").slice(0, 2);
  return (
    <div className="stack">
      <section className="hero-card">
        <p>{isLoggedIn ? `Dobro jutro, ${firstName(user.name)}` : "Živjo, animatorji"}</p>
        <h1>{formatDate(selectedDay.date)}</h1>
        <span>{selectedDay.title} Oratorija</span>
      </section>
      {!isLoggedIn && (
        <section className="card friendly-card">
          <p className="eyebrow">Odprto za ekipo</p>
          <h2>Vse osnovne informacije vidiš brez prijave.</h2>
          <p>Urnik, trenutna aktivnost, točka dneva in obvestila so takoj dostopni. Prijava odklene tvoje osebne naloge, potrditve nujnih sporočil in admin urejanje.</p>
          <button className="ghost-button" onClick={onLogin}>Prijavi se za moj pogled</button>
        </section>
      )}
      <ActivitySpotlight title="Trenutno poteka" activity={current} store={store} users={store.users} user={user} highlighted />
      <ActivitySpotlight title="Sledi" activity={next} store={store} users={store.users} user={user} />
      <PointOfDayCard day={selectedDay} compact />
      <section className="card">
        <div className="section-title"><h2>Moje naloge danes</h2><span>{myTasks.length}</span></div>
        {!isLoggedIn ? <LoginPrompt onLogin={onLogin} text="Prijavi se, da vidiš svoje osebne naloge za danes." /> : myTasks.length === 0 ? <EmptyState text="Danes nimaš posebnih nalog." /> : myTasks.slice(0, 5).map((task) => <TaskCard key={task.id} task={task} activity={store.activities.find((activity) => activity.id === task.activityId)} onToggle={onTaskToggle} />)}
      </section>
      {urgent.length > 0 && <section className="card urgent-soft"><h2>Nujna obvestila</h2>{urgent.map((message) => <MessageCard key={message.id} message={message} users={store.users} currentUser={user} compact />)}</section>}
      <button className="focus-button" onClick={onFocus}>Kaj moram narediti zdaj?</button>
    </div>
  );
}

function ActivitySpotlight({ title, activity, store, users, user, highlighted = false }: { title: string; activity: Activity | null; store: Store; users: User[]; user: User; highlighted?: boolean }) {
  const task = activity ? store.tasks.find((item) => item.activityId === activity.id && item.assignedTo === user.id) : null;
  return (
    <section className={highlighted ? "card highlight-card" : "card"}>
      <p className="eyebrow">{title}</p>
      {activity ? (
        <>
          <div className="time-row">{activity.startTime}-{activity.endTime}<StatusBadge status={highlighted ? "active" : activity.status} /></div>
          <h2>{activity.title}</h2>
          <p>Lokacija: <strong>{activityLocation(store, activity)}</strong></p>
          <p>Tvoja naloga: <strong>{task?.title ?? "bodi pripravljen/a in spremljaj ekipo"}</strong></p>
          <p>Odgovorni: {nameFor(users, activity.responsibleUserId)}</p>
          <button className="ghost-button">Odpri podrobnosti <ChevronRight size={16} /></button>
        </>
      ) : <EmptyState text="Trenutno ni načrtovane aktivnosti." />}
    </section>
  );
}

function TimetableScreen({ store, selectedDay, setSelectedDayId, activities, current, next, user }: Parameters<typeof AnimatorShell>[0]) {
  const taskCount = store.tasks.filter((task) => task.assignedTo === user.id && activities.some((activity) => activity.id === task.activityId)).length;
  return (
    <div className="stack">
      <ScreenHeader title="Urnik" subtitle={`${formatDate(selectedDay.date)} · danes imaš ${taskCount} nalog`} />
      <DaySelector days={store.days} selectedDayId={selectedDay.id} onSelect={setSelectedDayId} />
      <Timeline store={store} activities={activities} users={store.users} currentId={current?.id} nextId={next?.id} />
    </div>
  );
}

function TasksScreen({ store, user, isLoggedIn, onLogin, activities, onTaskToggle }: Parameters<typeof AnimatorShell>[0]) {
  if (!isLoggedIn) {
    return (
      <div className="stack">
        <ScreenHeader title="Moje naloge" subtitle="Osebni pogled za animatorje." />
        <section className="card friendly-card">
          <p className="eyebrow">Prijava odklene osebni seznam</p>
          <h2>Skupni urnik je odprt, tvoje naloge pa so vezane nate.</h2>
          <p>Ko se prijaviš, boš videl/a svoje zadolžitve po sklopih Zdaj, Kasneje danes in Opravljeno.</p>
          <button className="primary-button" onClick={onLogin}>Prijava</button>
        </section>
      </div>
    );
  }
  const myTasks = store.tasks.filter((task) => task.assignedTo === user.id && activities.some((activity) => activity.id === task.activityId));
  const groups = {
    Zdaj: myTasks.filter((task) => !task.done && activities.find((activity) => activity.id === task.activityId && nowMinutes() >= toMinutes(activity.startTime) && nowMinutes() < toMinutes(activity.endTime))),
    "Kasneje danes": myTasks.filter((task) => !task.done && !activities.find((activity) => activity.id === task.activityId && nowMinutes() >= toMinutes(activity.startTime) && nowMinutes() < toMinutes(activity.endTime))),
    Opravljeno: myTasks.filter((task) => task.done),
  };
  return (
    <div className="stack">
      <ScreenHeader title="Moje naloge" subtitle="Samo stvari, ki so dodeljene tebi." />
      {Object.entries(groups).map(([title, tasks]) => (
        <section className="card" key={title}>
          <div className="section-title"><h2>{title}</h2><span>{tasks.length}</span></div>
          {tasks.length === 0 ? <EmptyState text={title === "Opravljeno" ? "Še nič ni označeno kot opravljeno." : "Danes nimaš posebnih nalog."} /> : tasks.map((task) => <TaskCard key={task.id} task={task} activity={store.activities.find((activity) => activity.id === task.activityId)} onToggle={onTaskToggle} />)}
        </section>
      ))}
    </div>
  );
}

function PointScreen({ day }: { day: Day }) {
  return (
    <div className="stack">
      <ScreenHeader title="Točka dneva" subtitle={`${day.title} - ${day.theme}`} />
      <PointOfDayCard day={day} />
    </div>
  );
}

function MessagesScreen({ store, user, onSeen }: Pick<Parameters<typeof AnimatorShell>[0], "store" | "user" | "onSeen">) {
  const channelList: { key: "urgent" | "announcements" | "team"; title: string; empty: string }[] = [
    { key: "urgent", title: "Nujno", empty: "Ni nujnih obvestil." },
    { key: "announcements", title: "Obvestila", empty: "Zaenkrat ni novih sporočil." },
    { key: "team", title: "Skupinski klepet", empty: "Zaenkrat ni novih sporočil." },
  ];
  return (
    <div className="stack">
      <ScreenHeader title="Sporočila" subtitle="Hitro, jasno, brez šuma." />
      {channelList.map((channel) => {
        const messages = store.messages.filter((message) => message.channel === channel.key);
        return <section className="card" key={channel.key}><div className="section-title"><h2>{channel.title}</h2><span>{messages.length}</span></div>{messages.length === 0 ? <EmptyState text={channel.empty} /> : messages.map((message) => <MessageCard key={message.id} message={message} users={store.users} currentUser={user} onSeen={onSeen} />)}</section>;
      })}
    </div>
  );
}

function MoreScreen({ setTab, user }: { setTab: (tab: AnimatorTab) => void; user: User }) {
  return (
    <div className="stack">
      <ScreenHeader title="Več" subtitle={`Prijavljen/a kot ${user.name}`} />
      <button className="menu-card" onClick={() => setTab("point")}><Sparkles /> Točka dneva <ChevronRight /></button>
      <button className="menu-card"><Users /> Ekipa animatorjev <ChevronRight /></button>
      <button className="menu-card"><Settings /> Nastavitve obvestil <ChevronRight /></button>
    </div>
  );
}

function AdminShell(props: {
  tab: AdminTab;
  setTab: (tab: AdminTab) => void;
  user: User;
  store: Store;
  selectedDay: Day;
  setSelectedDayId: (id: string) => void;
  activities: Activity[];
  current: Activity | null;
  next: Activity | null;
  onEdit: (activity: Activity) => void;
  onRain: () => void;
  onDayPlan: () => void;
  onAnnouncement: () => void;
  setStore: React.Dispatch<React.SetStateAction<Store>>;
}) {
  const screen = {
    dashboard: <AdminDashboard {...props} />,
    schedule: <AdminTimetable {...props} />,
    assignments: <AssignmentBoard store={props.store} setStore={props.setStore} activities={props.activities} />,
    point: <DailyPointEditor store={props.store} selectedDay={props.selectedDay} setStore={props.setStore} />,
    messages: <AdminMessages store={props.store} onAnnouncement={props.onAnnouncement} />,
    groups: <GroupsScreen store={props.store} setStore={props.setStore} />,
    settings: <SettingsScreen store={props.store} />,
  }[props.tab];
  return (
    <main className="main-content admin-content">
      <div className="admin-tabs">
        <AdminTabButton active={props.tab === "dashboard"} icon={<LayoutDashboard />} label="Admin nadzorna plošča" onClick={() => props.setTab("dashboard")} />
        <AdminTabButton active={props.tab === "schedule"} icon={<CalendarDays />} label="Urejanje urnika" onClick={() => props.setTab("schedule")} />
        <AdminTabButton active={props.tab === "assignments"} icon={<Users />} label="Dodelitev animatorjev" onClick={() => props.setTab("assignments")} />
        <AdminTabButton active={props.tab === "point"} icon={<Sparkles />} label="Točka dneva" onClick={() => props.setTab("point")} />
        <AdminTabButton active={props.tab === "messages"} icon={<Bell />} label="Sporočila" onClick={() => props.setTab("messages")} />
        <AdminTabButton active={props.tab === "groups"} icon={<Users />} label="Skupine" onClick={() => props.setTab("groups")} />
        <AdminTabButton active={props.tab === "settings"} icon={<Settings />} label="Nastavitve" onClick={() => props.setTab("settings")} />
      </div>
      {screen}
    </main>
  );
}

function AdminTabButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement; label: string; onClick: () => void }) {
  return <button className={active ? "admin-tab active" : "admin-tab"} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function AdminDashboard({ store, selectedDay, activities, current, next, onRain, onDayPlan, onAnnouncement, setTab }: Parameters<typeof AdminShell>[0]) {
  const unassigned = activities.filter((activity) => !activity.responsibleUserId).length;
  const workloads = store.users.map((user) => ({ user, count: store.tasks.filter((task) => task.assignedTo === user.id && activities.some((activity) => activity.id === task.activityId)).length })).filter((item) => item.count >= 6);
  return (
    <div className="stack">
      <ScreenHeader title="Admin nadzorna plošča" subtitle={`${formatDate(selectedDay.date)} · organizacijski pogled`} />
      <div className="dashboard-grid">
        <MetricCard label="Trenutno poteka" value={current?.title ?? "Ni aktivnosti"} detail={current ? `${current.startTime} · ${activityLocation(store, current)}` : ""} />
        <MetricCard label="Sledi" value={next?.title ?? "Konec dneva"} detail={next ? `${next.startTime} · ${activityLocation(store, next)}` : ""} />
        <MetricCard label="Nedodeljeno" value={`${unassigned} nalog`} detail={unassigned ? "Preveri odgovorne animatorje." : "Vse ima odgovornega animatorja."} warning={unassigned > 0} />
        <MetricCard label="Opozorila" value={`${workloads.length} animatorjev`} detail={workloads[0] ? `${workloads[0].user.name} ima danes ${workloads[0].count} nalog.` : "Obremenitve so videti zdrave."} />
      </div>
      <section className="card">
        <h2>Hitre akcije</h2>
        <div className="quick-grid">
          <button onClick={() => setTab("schedule")}><Plus /> Dodaj aktivnost</button>
          <button onClick={() => setTab("schedule")}><Edit3 /> Uredi urnik</button>
          <button onClick={() => setTab("assignments")}><Users /> Dodeli animatorje</button>
          <button onClick={onAnnouncement}><Send /> Pošlji obvestilo</button>
          <button onClick={() => setTab("point")}><Sparkles /> Uredi točko dneva</button>
          <button onClick={onRain}><CloudRain /> Aktiviraj dežni plan</button>
          <button onClick={onDayPlan}><CalendarDays /> Spremeni plan dneva</button>
        </div>
      </section>
      <AdminWarnings activities={activities} store={store} />
    </div>
  );
}

function AdminTimetable({ store, selectedDay, setSelectedDayId, activities, current, next, onEdit, onRain, onDayPlan }: Parameters<typeof AdminShell>[0]) {
  return (
    <div className="stack">
      <ScreenHeader title="Urejanje urnika" subtitle="Velike kartice namesto tabele, ker si ekipa zasluži boljši nadzor." />
      <DaySelector days={store.days} selectedDayId={selectedDay.id} onSelect={setSelectedDayId} />
      <div className="toolbar">
        <button><Plus size={16} /> Dodaj aktivnost</button>
        <button onClick={onDayPlan}><CalendarDays size={16} /> Spremeni plan dneva</button>
        <button onClick={onRain}><CloudRain size={16} /> Aktiviraj dežni plan</button>
      </div>
      <div className="timeline">
        {activities.map((activity) => (
          <AdminActivityCard key={activity.id} store={store} activity={activity} isCurrent={activity.id === current?.id} isNext={activity.id === next?.id} onEdit={() => onEdit(activity)} />
        ))}
      </div>
    </div>
  );
}

function AdminActivityCard({ store, activity, isCurrent, isNext, onEdit }: { store: Store; activity: Activity; isCurrent: boolean; isNext: boolean; onEdit: () => void }) {
  return (
    <article className={isCurrent ? "activity-card current" : "activity-card"}>
      <div className="activity-head">
        <div><strong>{activity.startTime}-{activity.endTime}</strong><h3>{activity.title}</h3></div>
        <div className="badge-row"><StatusBadge status={isCurrent ? "active" : activity.status} />{isNext && <span className="soft-badge">Sledi</span>}{activity.changedRecently && <span className="changed-badge">Spremenjeno pred kratkim</span>}</div>
      </div>
      <div className="detail-grid">
        <p>Lokacija: <strong>{activityLocation(store, activity)}</strong></p>
        <p>Odgovorna oseba: <strong>{nameFor(store.users, activity.responsibleUserId)}</strong></p>
        <p>Animatorji: {namesFor(store.users, activity.assignedUserIds)}</p>
        <p>Materiali: {activity.materials.join(", ")}</p>
        <p>Opombe: {activity.publicNotes}</p>
        <p className="admin-note">Private admin notes: {activity.adminNotes}</p>
      </div>
      <div className="card-actions">
        <button onClick={onEdit}>Uredi</button>
        <button>Dodeli animatorje</button>
        <button>Podvoji</button>
        <button>Prekliči</button>
        <button>Obvesti</button>
      </div>
    </article>
  );
}

function Timeline({ store, activities, users, currentId, nextId }: { store: Store; activities: Activity[]; users: User[]; currentId?: string; nextId?: string }) {
  return (
    <div className="timeline">
      {activities.map((activity) => (
        <article className={activity.id === currentId ? "activity-card current" : "activity-card"} key={activity.id}>
          <div className="activity-head">
            <div><strong>{activity.startTime}-{activity.endTime}</strong><h3>{activity.title}</h3></div>
            <div className="badge-row"><StatusBadge status={activity.id === currentId ? "active" : activity.status} />{activity.id === nextId && <span className="soft-badge">Sledi</span>}{activity.changedRecently && <span className="changed-badge">Spremenjeno pred kratkim</span>}</div>
          </div>
          <p>Lokacija: <strong>{activityLocation(store, activity)}</strong></p>
          <p>Odgovorna: {nameFor(users, activity.responsibleUserId)}</p>
          <p>Animatorji: {namesFor(users, activity.assignedUserIds)}</p>
          <p>Materiali: {activity.materials.join(", ")}</p>
          <p>{activity.publicNotes}</p>
        </article>
      ))}
    </div>
  );
}

function ActivityEditModal({ store, activity, onClose, onSave }: { store: Store; activity: Activity; onClose: () => void; onSave: (activity: Activity) => void }) {
  const [draft, setDraft] = useState<Activity>(activity);
  const set = <K extends keyof Activity>(key: K, value: Activity[K]) => setDraft((previous) => ({ ...previous, [key]: value }));
  return (
    <Modal title="Uredi aktivnost" onClose={onClose}>
      <div className="form-grid two">
        <label>Title<input value={draft.title} onChange={(event) => set("title", event.target.value)} /></label>
        <label>Activity type<select value={draft.type} onChange={(event) => set("type", event.target.value as ActivityType)}>{activityTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label>Start time<input type="time" value={draft.startTime} onChange={(event) => set("startTime", event.target.value)} /></label>
        <label>End time<input type="time" value={draft.endTime} onChange={(event) => set("endTime", event.target.value)} /></label>
        <label>Location<input value={draft.location} onChange={(event) => set("location", event.target.value)} /></label>
        <label>Rain plan location<input value={draft.rainLocation} onChange={(event) => set("rainLocation", event.target.value)} /></label>
        <label>Responsible animator<select value={draft.responsibleUserId} onChange={(event) => set("responsibleUserId", event.target.value)}>{store.users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
        <label>Status<select value={draft.status} onChange={(event) => set("status", event.target.value as ActivityStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="wide">Helper animators<select multiple value={draft.assignedUserIds} onChange={(event) => set("assignedUserIds", Array.from(event.target.selectedOptions).map((option) => option.value))}>{store.users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
        <label className="wide">Materials<input value={draft.materials.join(", ")} onChange={(event) => set("materials", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></label>
        <label className="wide">Public notes<textarea value={draft.publicNotes} onChange={(event) => set("publicNotes", event.target.value)} /></label>
        <label className="wide">Private admin notes<textarea value={draft.adminNotes} onChange={(event) => set("adminNotes", event.target.value)} /></label>
        <label className="wide">Rain plan instructions<textarea value={draft.rainInstructions} onChange={(event) => set("rainInstructions", event.target.value)} /></label>
      </div>
      <div className="modal-actions"><button onClick={onClose}>Prekliči</button><button className="primary-button" onClick={() => onSave(draft)}><Save size={16} /> Shrani</button></div>
    </Modal>
  );
}

function ConfirmNotifyModal({ change, onClose, onNotify }: { change: { before: Activity; after: Activity }; onClose: () => void; onNotify: () => void }) {
  return (
    <Modal title="Obvestim animatorje o spremembi?" onClose={onClose}>
      <p>Spremenil/a si aktivnost. Želiš, da obvestimo vse dodeljene animatorje?</p>
      <div className="change-summary">
        <div><span>Old:</span><strong>{change.before.startTime} {change.before.title} - {change.before.location}</strong></div>
        <div><span>New:</span><strong>{change.after.startTime} {change.after.title} - {change.after.location}</strong></div>
      </div>
      <div className="modal-actions"><button onClick={onClose}>Ne, samo shrani</button><button className="primary-button" onClick={onNotify}>Da, pošlji obvestilo</button></div>
    </Modal>
  );
}

function DayPlanModal({ store, selectedDay, setStore, onClose, senderId }: { store: Store; selectedDay: Day; setStore: React.Dispatch<React.SetStateAction<Store>>; onClose: () => void; senderId: string }) {
  const activities = store.activities.filter((activity) => activity.dayId === selectedDay.id);
  const [selected, setSelected] = useState<string[]>(activities.filter((activity) => ["Velika igra", "Delavnice"].includes(activity.title)).map((activity) => activity.id));
  const [shift, setShift] = useState(30);
  const [note, setNote] = useState("Zaradi dežja je aktiviran dežni plan. Preveri lokacije v urniku.");
  const apply = () => {
    setStore((previous) => ({
      ...previous,
      rainPlanActive: true,
      activities: previous.activities.map((activity) => selected.includes(activity.id) ? { ...activity, startTime: addMinutes(activity.startTime, shift), endTime: addMinutes(activity.endTime, shift), location: activity.rainLocation || activity.location, changedRecently: true, lastEditedAt: new Date().toISOString() } : activity),
      messages: [{ id: `m-plan-${Date.now()}`, senderId, channel: "urgent", title: "Spremeni plan dneva", text: note, priority: "urgent", createdAt: new Date().toISOString(), seenBy: [], requireSeenConfirmation: true }, ...previous.messages],
    }));
    onClose();
  };
  return (
    <Modal title="Spremeni plan dneva" onClose={onClose}>
      <p>Izberi več aktivnosti, zamakni čas, aktiviraj dežne lokacije in obvesti ekipo.</p>
      <div className="select-list">{activities.map((activity) => <label key={activity.id}><input type="checkbox" checked={selected.includes(activity.id)} onChange={() => setSelected((previous) => previous.includes(activity.id) ? previous.filter((id) => id !== activity.id) : [...previous, activity.id])} /> {activity.startTime} {activity.title}</label>)}</div>
      <label>Zamik<select value={shift} onChange={(event) => setShift(Number(event.target.value))}>{[15, 30, 45, 60].map((value) => <option key={value} value={value}>{value} minut</option>)}</select></label>
      <label>Globalna opomba<textarea value={note} onChange={(event) => setNote(event.target.value)} /></label>
      <div className="modal-actions"><button onClick={onClose}>Prekliči</button><button className="primary-button" onClick={apply}>Shrani in obvesti vse</button></div>
    </Modal>
  );
}

function addMinutes(time: string, minutes: number) {
  const total = toMinutes(time) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function AssignmentBoard({ store, setStore, activities }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>>; activities: Activity[] }) {
  const [draggedUserId, setDraggedUserId] = useState<string | null>(null);
  const taskCount = (userId: string) => store.tasks.filter((task) => task.assignedTo === userId && activities.some((activity) => activity.id === task.activityId)).length;
  const setTeam = (userId: string, team: string) => {
    setStore((previous) => ({ ...previous, users: previous.users.map((user) => (user.id === userId ? { ...user, team } : user)) }));
  };
  return (
    <div className="stack">
      <ScreenHeader title="Dodelitev animatorjev" subtitle="Povleci kartico v ekipo ali uporabi premik na telefonu." />
      <div className="board">
        {boardColumns.map((column) => {
          const users = store.users.filter((user) => (column === "Nedodeljeno" ? !boardColumns.includes(user.team) : user.team === column));
          return (
            <section className="board-column" key={column} onDragOver={(event) => event.preventDefault()} onDrop={() => draggedUserId && setTeam(draggedUserId, column)}>
              <h3>{column}</h3>
              {users.length === 0 ? <EmptyState text="Ni animatorjev." /> : users.map((user) => (
                <AnimatorCard key={user.id} user={user} count={taskCount(user.id)} onDrag={() => setDraggedUserId(user.id)} onMove={(team) => setTeam(user.id, team)} />
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AnimatorCard({ user, count, onDrag, onMove }: { user: User; count: number; onDrag: () => void; onMove: (team: string) => void }) {
  return (
    <article className="animator-card" draggable onDragStart={onDrag}>
      <strong>{user.name}</strong>
      <span>Vloga: {user.team}</span>
      <span>Naloge danes: {count}</span>
      <span>{user.availability}</span>
      {count >= 6 && <em>Veliko nalog danes</em>}
      <select value={user.team} onChange={(event) => onMove(event.target.value)}>{boardColumns.filter((column) => column !== "Nedodeljeno").map((column) => <option key={column}>{column}</option>)}</select>
    </article>
  );
}

function DailyPointEditor({ store, selectedDay, setStore }: { store: Store; selectedDay: Day; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const [draft, setDraft] = useState(selectedDay);
  const set = <K extends keyof Day>(key: K, value: Day[K]) => setDraft((previous) => ({ ...previous, [key]: value }));
  const save = () => setStore((previous) => ({ ...previous, days: previous.days.map((day) => (day.id === draft.id ? draft : day)) }));
  return (
    <div className="stack">
      <ScreenHeader title="Točka dneva" subtitle="Uredi duhovno in vzgojno jedro dneva." />
      <section className="card form-grid">
        <label>Day title<input value={draft.title} onChange={(event) => set("title", event.target.value)} /></label>
        <label>Theme<input value={draft.theme} onChange={(event) => set("theme", event.target.value)} /></label>
        <label>Main value<input value={draft.value} onChange={(event) => set("value", event.target.value)} /></label>
        <label>Point of the day<textarea value={draft.pointOfDay} onChange={(event) => set("pointOfDay", event.target.value)} /></label>
        <label>Bible quote/story connection<input value={draft.bibleQuote} onChange={(event) => set("bibleQuote", event.target.value)} /></label>
        <label>Explanation<textarea value={draft.explanation} onChange={(event) => set("explanation", event.target.value)} /></label>
        <label>Animator challenge<textarea value={draft.animatorChallenge} onChange={(event) => set("animatorChallenge", event.target.value)} /></label>
        <label>Children challenge<textarea value={draft.childrenChallenge} onChange={(event) => set("childrenChallenge", event.target.value)} /></label>
        <label>Prayer<textarea value={draft.prayer} onChange={(event) => set("prayer", event.target.value)} /></label>
        <label>Song<input value={draft.song} onChange={(event) => set("song", event.target.value)} /></label>
        <label>Catechesis notes<textarea value={draft.catechesisNotes} onChange={(event) => set("catechesisNotes", event.target.value)} /></label>
        <button className="primary-button" onClick={save}>Shrani</button>
      </section>
    </div>
  );
}

function GroupsScreen({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const updateGroup = (updated: Group) => setStore((previous) => ({ ...previous, groups: previous.groups.map((group) => (group.id === updated.id ? updated : group)) }));
  return (
    <div className="stack">
      <ScreenHeader title="Skupine" subtitle="Otroške skupine, voditelji in kratke opombe." />
      <div className="group-grid">{store.groups.map((group) => <GroupCard key={group.id} group={group} users={store.users} onChange={updateGroup} />)}</div>
    </div>
  );
}

function GroupCard({ group, users, onChange }: { group: Group; users: User[]; onChange: (group: Group) => void }) {
  return (
    <section className="card">
      <h2>{group.name}</h2>
      <label>Children count<input type="number" value={group.childrenCount} onChange={(event) => onChange({ ...group, childrenCount: Number(event.target.value) })} /></label>
      <p>Leader: {namesFor(users, group.leaderIds)}</p>
      <p>Assistant: {namesFor(users, group.assistantIds)}</p>
      <label>Notes<textarea value={group.notes} onChange={(event) => onChange({ ...group, notes: event.target.value })} /></label>
    </section>
  );
}

function AnnouncementModal({ store, setStore, senderId, onClose }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>>; senderId: string; onClose: () => void }) {
  const [title, setTitle] = useState("Obvestilo");
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [channel, setChannel] = useState<"announcements" | "urgent">("announcements");
  const send = () => {
    setStore((previous) => ({
      ...previous,
      messages: [{ id: `m-${Date.now()}`, senderId, channel, title, text: text || "Novo obvestilo za ekipo.", priority, createdAt: new Date().toISOString(), seenBy: [], requireSeenConfirmation: channel === "urgent" }, ...previous.messages],
    }));
    onClose();
  };
  return (
    <Modal title="Pošlji obvestilo" onClose={onClose}>
      <div className="form-grid">
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>Message<textarea value={text} onChange={(event) => setText(event.target.value)} /></label>
        <label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>{Object.entries(priorityLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label>Kanal<select value={channel} onChange={(event) => setChannel(event.target.value as "announcements" | "urgent")}><option value="announcements">Obvestila</option><option value="urgent">Nujno</option></select></label>
      </div>
      <div className="modal-actions"><button onClick={onClose}>Prekliči</button><button className="primary-button" onClick={send}>Pošlji obvestilo</button></div>
    </Modal>
  );
}

function AdminMessages({ store, onAnnouncement }: { store: Store; onAnnouncement: () => void }) {
  return <div className="stack"><ScreenHeader title="Sporočila" subtitle="Obvestila, nujna sporočila in potrditve ogleda." /><button className="primary-button" onClick={onAnnouncement}>Novo obvestilo</button><MessagesScreen store={store} user={store.users[0]} onSeen={() => undefined} /></div>;
}

function SettingsScreen({ store }: { store: Store }) {
  return (
    <div className="stack">
      <ScreenHeader title="Nastavitve" subtitle="Demo prototip, pripravljen za kasnejšo povezavo z bazo." />
      <section className="card"><h2>Podatkovni model</h2><p>Uporabniki: {store.users.length}</p><p>Dnevi: {store.days.length}</p><p>Aktivnosti: {store.activities.length}</p><p>Naloge: {store.tasks.length}</p></section>
      <section className="card"><h2>Stanja</h2><p>Dežni plan: {store.rainPlanActive ? "aktiven" : "ni aktiven"}</p><p>Vsi podatki so trenutno lokalni demo podatki.</p></section>
    </div>
  );
}

function AdminWarnings({ activities, store }: { activities: Activity[]; store: Store }) {
  const warnings = [
    ...activities.filter((activity) => !activity.responsibleUserId).map((activity) => `${activity.title} nima odgovornega animatorja.`),
    ...activities.filter((activity) => !activity.location).map((activity) => `${activity.title} nima dodane lokacije.`),
    ...activities.filter((activity) => !activity.rainLocation).map((activity) => `${activity.title}: dežni plan ni pripravljen.`),
  ];
  const lukaTasks = store.tasks.filter((task) => task.assignedTo === "u-luka" && activities.some((activity) => activity.id === task.activityId)).length;
  if (lukaTasks >= 6) warnings.push(`Luka ima danes že ${lukaTasks} nalog.`);
  warnings.push("Velika igra še nima dodeljenih vseh postaj.");
  return <section className="card warning-card"><h2>Opozorila</h2>{warnings.map((warning) => <p key={warning}><AlertTriangle size={16} /> {warning}</p>)}</section>;
}

function TaskCard({ task, activity, onToggle }: { task: Task; activity?: Activity; onToggle: (taskId: string) => void }) {
  return (
    <article className={task.done ? "task-card done" : "task-card"}>
      <button className="check-button" onClick={() => onToggle(task.id)}>{task.done ? <CheckCircle2 /> : null}</button>
      <div>
        <strong>{task.dueTime} · {activity?.title ?? task.title}</strong>
        <p>{task.title}: {task.description}</p>
        <span>{activity?.location}</span>
      </div>
      <PriorityBadge priority={task.priority} />
    </article>
  );
}

function MessageCard({ message, users, currentUser, onSeen, compact = false }: { message: Message; users: User[]; currentUser: User; onSeen?: (id: string) => void; compact?: boolean }) {
  const seen = message.seenBy.includes(currentUser.id);
  return (
    <article className={message.channel === "urgent" ? "message-card urgent" : "message-card"}>
      <div className="message-head"><strong>{message.title}</strong><span>{nameFor(users, message.senderId)}</span></div>
      <p>{message.text}</p>
      {!compact && message.requireSeenConfirmation && <div className="seen-row"><span>Videno: {message.seenBy.length}</span>{seen ? <span className="seen-ok">Videl sem</span> : <button onClick={() => onSeen?.(message.id)}>Videl sem</button>}</div>}
    </article>
  );
}

function PointOfDayCard({ day, compact = false }: { day: Day; compact?: boolean }) {
  return (
    <section className="card point-card">
      <p className="eyebrow">Točka dneva</p>
      <h2>{day.title} - {day.value}</h2>
      <blockquote>{day.pointOfDay}</blockquote>
      {!compact && <>
        <p><strong>Svetopisemska povezava:</strong> {day.bibleQuote}</p>
        <p>{day.explanation}</p>
        <p><strong>Izziv za animatorje:</strong> {day.animatorChallenge}</p>
        <p><strong>Izziv za otroke:</strong> {day.childrenChallenge}</p>
        <p><strong>Molitev:</strong> {day.prayer}</p>
        <p><strong>Pesem dneva:</strong> {day.song}</p>
        <p><strong>Kateheza:</strong> {day.catechesisNotes}</p>
      </>}
      {compact && <p><strong>Izziv:</strong> {day.animatorChallenge}</p>}
    </section>
  );
}

function NowModal({ store, user, isLoggedIn, activity, next, onClose }: { store: Store; user: User; isLoggedIn: boolean; activity: Activity; next: Activity | null; onClose: () => void }) {
  const task = isLoggedIn ? store.tasks.find((item) => item.activityId === activity.id && item.assignedTo === user.id) : null;
  return (
    <Modal title="Kaj moraš narediti zdaj?" onClose={onClose}>
      <section className="now-detail">
        <p>Trenutno: <strong>{activity.title}</strong></p>
        <p>{isLoggedIn ? "Tvoja naloga" : "Skupna naloga"}: <strong>{task?.title ?? "pojdi na lokacijo, preveri odgovorno osebo in bodi pripravljen/a pomagati"}</strong></p>
        <p>Lokacija: <strong>{activityLocation(store, activity)}</strong></p>
        <p>S tabo: {namesFor(store.users, activity.assignedUserIds.filter((id) => id !== user.id)) || "vodstvo"}</p>
        <p>Materiali: {activity.materials.join(", ")}</p>
        <p>Naslednje: {next ? `${next.title} ob ${next.startTime}` : "konec dneva"}</p>
        <p>Opombe od admina: {activity.publicNotes}</p>
      </section>
    </Modal>
  );
}

function ScreenHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="screen-header"><h1>{title}</h1><p>{subtitle}</p></div>;
}

function DaySelector({ days, selectedDayId, onSelect }: { days: Day[]; selectedDayId: string; onSelect: (id: string) => void }) {
  return <div className="day-selector">{days.map((day) => <button className={day.id === selectedDayId ? "active" : ""} key={day.id} onClick={() => onSelect(day.id)}>{day.title.replace(". dan", "")}<span>{formatDate(day.date).split(",")[0]}</span></button>)}</div>;
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  return <span className={`status-badge ${status}`}>{statusLabels[status]}</span>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`priority-badge ${priority}`}>{priorityLabels[priority]}</span>;
}

function MetricCard({ label, value, detail, warning }: { label: string; value: string; detail: string; warning?: boolean }) {
  return <section className={warning ? "metric-card warning" : "metric-card"}><span>{label}</span><strong>{value}</strong><p>{detail}</p></section>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state">{text}</div>;
}

function LoginPrompt({ text, onLogin }: { text: string; onLogin: () => void }) {
  return (
    <div className="login-prompt">
      <p>{text}</p>
      <button className="ghost-button" onClick={onLogin}>Prijava</button>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-card">
        <div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={18} /></button></div>
        {children}
      </section>
    </div>
  );
}
