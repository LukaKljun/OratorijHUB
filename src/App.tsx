import {
  Bell,
  CalendarDays,
  Clock3,
  Mountain,
  NotebookTabs,
  Plus,
  Save,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Tab = "now" | "schedule" | "news" | "guide";
type Activity = {
  id: string;
  time: string;
  title: string;
  note?: string;
};
type GuideRow = {
  title: string;
  text: string;
};
type DayPoint = {
  id: string;
  day: string;
  title: string;
  text: string;
};
type SiteContent = {
  status: string;
  appName: string;
  heroTitle: string;
  heroSubtitle: string;
  pointDays: DayPoint[];
  guideLabel: string;
  guideTitle: string;
  guideText: string;
  guideRows: GuideRow[];
  announcements: string[];
  schedule: Activity[];
};

const defaultContent: SiteContent = {
  status: "Informativni pregled",
  appName: "Oratorij Hub",
  heroTitle: "Hajdi: Živeti je lepo!",
  heroSubtitle: "Animatorji · urnik · obvestila · vodič",
  pointDays: [
    { id: "day-1", day: "1. dan", title: "Veselje", text: "Veselje raste, ko ga delimo z drugimi." },
    { id: "day-2", day: "2. dan", title: "Pogum", text: "Naredi dobro stvar tudi takrat, ko ni najlažje." },
    { id: "day-3", day: "3. dan", title: "Sodelovanje", text: "Ko poslušamo drug drugega, postane skupina močnejša." },
    { id: "day-4", day: "4. dan", title: "Odpuščanje", text: "Odpuščanje nam pomaga začeti znova." },
    { id: "day-5", day: "5. dan", title: "Hvaležnost", text: "Kar smo prejeli, nesemo naprej." },
  ],
  guideLabel: "Hajdi",
  guideTitle: "Živeti je lepo!",
  guideText: "Dan je lep, ko ga napolnimo z dobroto, pogumom in pozornostjo do drugega.",
  guideRows: [
    { title: "Animatorji", text: "bodi blizu otrokom" },
    { title: "Pesem", text: "Tukaj sem, Gospod" },
    { title: "Molitev", text: "pogum za dobro" },
  ],
  announcements: [
    "Animatorji pridemo 10 minut pred svojo zadolžitvijo.",
    "Pri malici naj najprej pridejo mlajše skupine.",
    "Refleksija animatorjev je ob 16:30 v župnišču.",
  ],
  schedule: [
    { id: "a1", time: "08:00", title: "Prihod animatorjev" },
    { id: "a2", time: "09:00", title: "Zbiranje otrok" },
    { id: "a3", time: "09:30", title: "Igrica" },
    { id: "a4", time: "10:00", title: "Molitev" },
    { id: "a5", time: "10:20", title: "Kateheza", note: "Otroci gredo po skupinah." },
    { id: "a6", time: "11:00", title: "Malica" },
    { id: "a7", time: "11:15", title: "Delavnice" },
    { id: "a8", time: "12:30", title: "Kosilo" },
    { id: "a9", time: "14:00", title: "Velika igra" },
    { id: "a10", time: "16:30", title: "Refleksija" },
  ],
};

const minuteNow = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const getNow = (schedule: Activity[]) => {
  const currentMinutes = minuteNow();
  const current =
    [...schedule].reverse().find((item) => toMinutes(item.time) <= currentMinutes) ?? schedule[0];
  const next = schedule.find((item) => toMinutes(item.time) > currentMinutes) ?? null;
  return { current, next };
};

const getInitialNotificationStatus = (): NotificationPermission | "unsupported" => {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
};

const getInitialSubscription = () => {
  if (!("Notification" in window)) return false;
  return localStorage.getItem("oratorij-notifications") === "true" && Notification.permission === "granted";
};

export function App() {
  const [tab, setTab] = useState<Tab>("now");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [selectedPointId, setSelectedPointId] = useState(defaultContent.pointDays[0].id);
  const [notificationStatus, setNotificationStatus] = useState(getInitialNotificationStatus);
  const [notificationsEnabled, setNotificationsEnabled] = useState(getInitialSubscription);
  const [secretClicks, setSecretClicks] = useState(0);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { current, next } = useMemo(() => getNow(content.schedule), [content.schedule]);
  const selectedPoint =
    content.pointDays.find((point) => point.id === selectedPointId) ?? content.pointDays[0];

  const handleSecretClick = () => {
    const nextCount = secretClicks + 1;
    if (nextCount >= 5) {
      setSecretClicks(0);
      setPasswordOpen(true);
      return;
    }
    setSecretClicks(nextCount);
  };

  const subscribeToNotifications = async () => {
    if (!("Notification" in window)) {
      setNotificationStatus("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    const enabled = permission === "granted";
    setNotificationsEnabled(enabled);
    localStorage.setItem("oratorij-notifications", enabled ? "true" : "false");

    if (enabled) {
      new Notification("Oratorij Hub", {
        body: "Naročen/a si na obvestila.",
        tag: "oratorij-subscribe",
      });
    }
  };

  const sendAnnouncementNotifications = (messages: string[]) => {
    if (!notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") return;

    messages.forEach((message, index) => {
      new Notification("Novo obvestilo", {
        body: message,
        tag: `oratorij-announcement-${Date.now()}-${index}`,
      });
    });
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <div className="mountain-mark">
            <Mountain />
          </div>
          <button className="status-chip" onClick={handleSecretClick}>
            {content.status}
          </button>
        </div>
        <p>{content.appName}</p>
        <h1>{content.heroTitle}</h1>
        <span>{content.heroSubtitle}</span>
      </header>

      <main className={tab === "now" ? "content content-overlap" : "content content-clear"}>
        {tab === "now" && (
          <NowScreen
            pointDays={content.pointDays}
            selectedPoint={selectedPoint}
            selectedPointId={selectedPointId}
            onSelectPoint={setSelectedPointId}
            current={current}
            next={next}
          />
        )}
        {tab === "schedule" && <ScheduleScreen current={current} schedule={content.schedule} />}
        {tab === "news" && (
          <NewsScreen
            announcements={content.announcements}
            notificationsEnabled={notificationsEnabled}
            notificationStatus={notificationStatus}
            onSubscribe={subscribeToNotifications}
          />
        )}
        {tab === "guide" && (
          <GuideScreen
            content={content}
            selectedPoint={selectedPoint}
            selectedPointId={selectedPointId}
            onSelectPoint={setSelectedPointId}
          />
        )}
      </main>

      <nav className="bottom-nav">
        <NavButton active={tab === "now"} icon={<Clock3 />} label="Zdaj" onClick={() => setTab("now")} />
        <NavButton active={tab === "schedule"} icon={<CalendarDays />} label="Urnik" onClick={() => setTab("schedule")} />
        <NavButton active={tab === "news"} icon={<Bell />} label="Obvestila" onClick={() => setTab("news")} />
        <NavButton active={tab === "guide"} icon={<NotebookTabs />} label="Vodič" onClick={() => setTab("guide")} />
      </nav>

      {passwordOpen && (
        <PasswordModal
          onClose={() => setPasswordOpen(false)}
          onUnlock={() => {
            setPasswordOpen(false);
            setAdminOpen(true);
          }}
        />
      )}
      {adminOpen && (
        <AdminScreen
          content={content}
          onClose={() => setAdminOpen(false)}
          onSave={(nextContent) => {
            const newAnnouncements = nextContent.announcements
              .slice(content.announcements.length)
              .map((message) => message.trim())
              .filter(Boolean);
            setContent(nextContent);
            sendAnnouncementNotifications(newAnnouncements);
            if (!nextContent.pointDays.some((point) => point.id === selectedPointId)) {
              setSelectedPointId(nextContent.pointDays[0]?.id ?? "day-1");
            }
          }}
        />
      )}
    </div>
  );
}

function NowScreen({
  pointDays,
  selectedPoint,
  selectedPointId,
  onSelectPoint,
  current,
  next,
}: {
  pointDays: DayPoint[];
  selectedPoint: DayPoint;
  selectedPointId: string;
  onSelectPoint: (id: string) => void;
  current: Activity;
  next: Activity | null;
}) {
  return (
    <div className="stack">
      <section className="now-card">
        <p className="label">Zdaj</p>
        <h2>{current.title}</h2>
        <div className="meta">
          <span><Clock3 /> {current.time}</span>
        </div>
        {current.note && <p className="small-note">{current.note}</p>}
      </section>

      {next && (
        <section className="mini-card">
          <span>Sledi</span>
          <strong>{next.time} · {next.title}</strong>
        </section>
      )}

      <section className="guide-card soft">
        <div className="point-head">
          <p className="label">Točka dneva</p>
          <span>{selectedPoint.day}</span>
        </div>
        <DayPointSelector points={pointDays} selectedId={selectedPointId} onSelect={onSelectPoint} />
        <h2>{selectedPoint.title}</h2>
        <p>{selectedPoint.text}</p>
      </section>
    </div>
  );
}

function ScheduleScreen({ current, schedule }: { current: Activity; schedule: Activity[] }) {
  return (
    <div className="stack">
      <h2 className="page-title">Urnik</h2>
      {schedule.map((item) => (
        <section className={item.id === current.id ? "schedule-item active" : "schedule-item"} key={item.id}>
          <time>{item.time}</time>
          <div>
            <h3>{item.title}</h3>
          </div>
        </section>
      ))}
    </div>
  );
}

function NewsScreen({
  announcements,
  notificationsEnabled,
  notificationStatus,
  onSubscribe,
}: {
  announcements: string[];
  notificationsEnabled: boolean;
  notificationStatus: NotificationPermission | "unsupported";
  onSubscribe: () => void;
}) {
  return (
    <div className="stack">
      <h2 className="page-title">Obvestila</h2>
      <section className="card subscribe-card">
        <div>
          <strong>Obvestila na napravi</strong>
          <p>{getNotificationText(notificationsEnabled, notificationStatus)}</p>
        </div>
        <button disabled={notificationsEnabled || notificationStatus === "unsupported" || notificationStatus === "denied"} onClick={onSubscribe}>
          {notificationsEnabled ? "Naročeno" : "Naroči se"}
        </button>
      </section>
      {announcements.map((message, index) => (
        <section className="card notice" key={`${message}-${index}`}>
          <Bell />
          <p>{message}</p>
        </section>
      ))}
    </div>
  );
}

function getNotificationText(enabled: boolean, status: NotificationPermission | "unsupported") {
  if (enabled) return "Ko se doda novo obvestilo, ga ta naprava prejme enkrat.";
  if (status === "unsupported") return "Ta brskalnik ne podpira obvestil.";
  if (status === "denied") return "Obvestila so blokirana v nastavitvah brskalnika.";
  return "Naroči se, da dobiš novo obvestilo takoj, ko je objavljeno.";
}

function GuideScreen({
  content,
  selectedPoint,
  selectedPointId,
  onSelectPoint,
}: {
  content: SiteContent;
  selectedPoint: DayPoint;
  selectedPointId: string;
  onSelectPoint: (id: string) => void;
}) {
  return (
    <div className="stack">
      <h2 className="page-title">Vodič</h2>
      <section className="guide-card">
        <p className="label">{content.guideLabel}</p>
        <h2>{content.guideTitle}</h2>
        <p>{content.guideText}</p>
      </section>
      <section className="card compact-list">
        {content.guideRows.map((row, index) => (
          <div key={`${row.title}-${index}`}><strong>{row.title}</strong><span>{row.text}</span></div>
        ))}
      </section>
      <section className="guide-card soft">
        <div className="point-head">
          <p className="label">Točke dneva</p>
          <span>{selectedPoint.day}</span>
        </div>
        <DayPointSelector points={content.pointDays} selectedId={selectedPointId} onSelect={onSelectPoint} />
        <h2>{selectedPoint.title}</h2>
        <p>{selectedPoint.text}</p>
      </section>
    </div>
  );
}

function DayPointSelector({ points, selectedId, onSelect }: { points: DayPoint[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="day-selector">
      {points.map((point) => (
        <button
          className={point.id === selectedId ? "active" : ""}
          key={point.id}
          onClick={() => onSelect(point.id)}
        >
          {point.day}
        </button>
      ))}
    </div>
  );
}

function PasswordModal({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (password === "oratorij2008") {
      onUnlock();
      return;
    }
    setError("Napačno geslo.");
  };

  return (
    <div className="modal-backdrop">
      <section className="password-card">
        <div className="admin-head">
          <h2>Admin</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <label>
          Geslo
          <input
            autoFocus
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="save-button" onClick={submit}>Odpri</button>
      </section>
    </div>
  );
}

function AdminScreen({ content, onClose, onSave }: { content: SiteContent; onClose: () => void; onSave: (content: SiteContent) => void }) {
  const [draft, setDraft] = useState<SiteContent>(content);

  const setField = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  const updateSchedule = (id: string, patch: Partial<Activity>) => {
    setDraft((previous) => ({
      ...previous,
      schedule: previous.schedule.map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
  };

  const updateAnnouncement = (index: number, value: string) => {
    setDraft((previous) => ({
      ...previous,
      announcements: previous.announcements.map((item, itemIndex) => itemIndex === index ? value : item),
    }));
  };

  const updateDayPoint = (id: string, patch: Partial<DayPoint>) => {
    setDraft((previous) => ({
      ...previous,
      pointDays: previous.pointDays.map((point) => point.id === id ? { ...point, ...patch } : point),
    }));
  };

  const updateGuideRow = (index: number, patch: Partial<GuideRow>) => {
    setDraft((previous) => ({
      ...previous,
      guideRows: previous.guideRows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row),
    }));
  };

  return (
    <div className="admin-screen">
      <header className="admin-top">
        <div>
          <p>Skriti admin</p>
          <h1>Uredi vsebino</h1>
        </div>
        <button onClick={onClose}><X /></button>
      </header>

      <main className="admin-content">
        <section className="admin-card">
          <h2>Naslovnica</h2>
          <Field label="Čip" value={draft.status} onChange={(value) => setField("status", value)} />
          <Field label="Ime" value={draft.appName} onChange={(value) => setField("appName", value)} />
          <Field label="Naslov" value={draft.heroTitle} onChange={(value) => setField("heroTitle", value)} />
          <Field label="Podnaslov" value={draft.heroSubtitle} onChange={(value) => setField("heroSubtitle", value)} />
        </section>

        <section className="admin-card">
          <h2>Točke dneva</h2>
          {draft.pointDays.map((point) => (
            <div className="point-editor" key={point.id}>
              <input value={point.day} onChange={(event) => updateDayPoint(point.id, { day: event.target.value })} />
              <input value={point.title} onChange={(event) => updateDayPoint(point.id, { title: event.target.value })} />
              <textarea value={point.text} onChange={(event) => updateDayPoint(point.id, { text: event.target.value })} />
            </div>
          ))}
        </section>

        <section className="admin-card">
          <h2>Urnik</h2>
          {draft.schedule.map((item) => (
            <div className="admin-row" key={item.id}>
              <input value={item.time} onChange={(event) => updateSchedule(item.id, { time: event.target.value })} />
              <input value={item.title} onChange={(event) => updateSchedule(item.id, { title: event.target.value })} />
              <input value={item.note ?? ""} placeholder="opomba" onChange={(event) => updateSchedule(item.id, { note: event.target.value })} />
            </div>
          ))}
        </section>

        <section className="admin-card">
          <h2>Obvestila</h2>
          {draft.announcements.map((message, index) => (
            <div className="admin-line" key={index}>
              <textarea value={message} onChange={(event) => updateAnnouncement(index, event.target.value)} />
              <button onClick={() => setField("announcements", draft.announcements.filter((_, itemIndex) => itemIndex !== index))}>Odstrani</button>
            </div>
          ))}
          <button className="ghost-admin-button" onClick={() => setField("announcements", [...draft.announcements, "Novo obvestilo"])}>
            <Plus /> Dodaj obvestilo
          </button>
        </section>

        <section className="admin-card">
          <h2>Vodič</h2>
          <Field label="Oznaka" value={draft.guideLabel} onChange={(value) => setField("guideLabel", value)} />
          <Field label="Naslov" value={draft.guideTitle} onChange={(value) => setField("guideTitle", value)} />
          <Field label="Besedilo" value={draft.guideText} onChange={(value) => setField("guideText", value)} multiline />
          {draft.guideRows.map((row, index) => (
            <div className="admin-row two" key={index}>
              <input value={row.title} onChange={(event) => updateGuideRow(index, { title: event.target.value })} />
              <input value={row.text} onChange={(event) => updateGuideRow(index, { text: event.target.value })} />
            </div>
          ))}
        </section>
      </main>

      <footer className="admin-actions">
        <button onClick={onClose}>Zapri</button>
        <button className="save-button" onClick={() => { onSave(draft); onClose(); }}>
          <Save /> Shrani
        </button>
      </footer>
    </div>
  );
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement; label: string; onClick: () => void }) {
  return (
    <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
