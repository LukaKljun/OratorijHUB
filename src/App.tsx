import {
  Bell,
  Bus,
  CalendarDays,
  Clock3,
  ListChecks,
  Mountain,
  NotebookTabs,
  Plus,
  Save,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";

type Tab = "now" | "schedule" | "trip" | "duties" | "news" | "guide";
type AdminSection = "home" | "points" | "schedule" | "trip" | "duties" | "news" | "guide";
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
type DailyDuty = {
  id: string;
  dayId: string;
  title: string;
  people: string;
  notes: string;
};
type TripBus = {
  id: string;
  name: string;
  groups: string;
  leader: string;
  notes: string;
};
type FarmRotation = {
  id: string;
  time: string;
  cheese: string;
  catechesisGame: string;
  bigGameOne: string;
  bigGameTwo: string;
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
  dailyDuties: DailyDuty[];
  tripTitle: string;
  tripSubtitle: string;
  tripBuses: TripBus[];
  farmRotations: FarmRotation[];
};
type SaveResult =
  | { ok: true; content: SiteContent }
  | { ok: false; message: string };

const adminPassword = "oratorij2008";

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
  dailyDuties: [
    { id: "day-1-d-1", dayId: "day-1", title: "Vhod", people: "Ana Kromar, Iza Andolsek", notes: "" },
    { id: "day-1-d-2", dayId: "day-1", title: "Tri drevesa", people: "Lina Mise, Iza Merhar", notes: "" },
    { id: "day-1-d-3", dayId: "day-1", title: "Soncne kreme", people: "Lora Arko, Iza Hribsek", notes: "" },
    { id: "day-1-d-4", dayId: "day-1", title: "Most", people: "Aneja Knavs, Vita Vlajovic", notes: "" },
    { id: "day-1-d-5", dayId: "day-1", title: "Sklece na travi", people: "Urh Zahar, Tine Mihelic", notes: "" },
    { id: "day-1-d-6", dayId: "day-1", title: "Travnik", people: "Eva Stadler, Aiken", notes: "" },
    { id: "day-1-d-7", dayId: "day-1", title: "Vici", people: "Klara Novak, Ana Mate", notes: "" },
    { id: "day-1-d-8", dayId: "day-1", title: "Na travniku", people: "Sara Silc, Hana Ruparcic", notes: "" },
    { id: "day-1-d-9", dayId: "day-1", title: "Zakljucek", people: "Laura Trpin, Nika Silc", notes: "" },
    { id: "day-1-d-10", dayId: "day-1", title: "Animatorji za ruzake", people: "Patricija Pirc, Klara Franjga, Stela Pirc, Marija Arko, Iza Merhar, Masa Henigman", notes: "" },
    { id: "day-1-d-11", dayId: "day-1", title: "Vecerji", people: "Eva Mihelic, Nika Mihelic, Vida Ruparcic, Klara Novak, Laura Trpin, Lucija Tekavec, Tjasa Tanko", notes: "" },
    { id: "day-1-d-12", dayId: "day-1", title: "Velika igra skupine", people: "Samo Ema Ilc; Klara Franjga in Urh; Toni Ruparcic in Katarina Klun; Manca Kirin in Neza Gornik; Stela Pirc in Laura Trpin; Jana Obrstar in Jure Josipovic; Hana Benedik in Ela Ruparcic; Zoja, Amalija in Lina Adamic; Nik Rus in Vita Vlahovic; Iza Hribsek in Luka Gradisek; Laura Klun in Jost Lovsin; Jona Gruden in Luka Kljun; Masa Peterlin in Aljaz Zakrajsek; Julijana Jesensek in Matevz Savs; Anamarija Duscak in Ajda Andoljsek; Vanesa in Masa Henigman; Nadja in Eva Stadler; Jerca Nelec in Ana Kromar; Leja Bratovz in Hana Baloh; Aneja Knavs in Tinkara Bartol", notes: "" },
    { id: "day-1-d-13", dayId: "day-1", title: "Geslo", people: "", notes: "Ce hoces druge vneti, moras sam goreti." },
    { id: "day-1-d-14", dayId: "day-1", title: "Voda", people: "", notes: "Daj otrokom za pit vodo." },
    { id: "day-2-d-1", dayId: "day-2", title: "Igre skupine", people: "", notes: "" },
    { id: "day-2-d-2", dayId: "day-2", title: "Pelje na WC", people: "", notes: "" },
    { id: "day-2-d-3", dayId: "day-2", title: "Voda", people: "", notes: "" },
    { id: "day-2-d-4", dayId: "day-2", title: "Vhod", people: "", notes: "" },
    { id: "day-2-d-5", dayId: "day-2", title: "Velika igra", people: "", notes: "" },
    { id: "day-3-d-1", dayId: "day-3", title: "Igre skupine", people: "", notes: "" },
    { id: "day-3-d-2", dayId: "day-3", title: "Pelje na WC", people: "", notes: "" },
    { id: "day-3-d-3", dayId: "day-3", title: "Voda", people: "", notes: "" },
    { id: "day-3-d-4", dayId: "day-3", title: "Vhod", people: "", notes: "" },
    { id: "day-3-d-5", dayId: "day-3", title: "Velika igra", people: "", notes: "" },
    { id: "day-4-d-1", dayId: "day-4", title: "Igre skupine", people: "", notes: "" },
    { id: "day-4-d-2", dayId: "day-4", title: "Pelje na WC", people: "", notes: "" },
    { id: "day-4-d-3", dayId: "day-4", title: "Voda", people: "", notes: "" },
    { id: "day-4-d-4", dayId: "day-4", title: "Vhod", people: "", notes: "" },
    { id: "day-4-d-5", dayId: "day-4", title: "Velika igra", people: "", notes: "" },
    { id: "day-5-d-1", dayId: "day-5", title: "Igre skupine", people: "", notes: "" },
    { id: "day-5-d-2", dayId: "day-5", title: "Pelje na WC", people: "", notes: "" },
    { id: "day-5-d-3", dayId: "day-5", title: "Voda", people: "", notes: "" },
    { id: "day-5-d-4", dayId: "day-5", title: "Vhod", people: "", notes: "" },
    { id: "day-5-d-5", dayId: "day-5", title: "Velika igra", people: "", notes: "" },
  ],
  tripTitle: "Izlet",
  tripSubtitle: "Busi in razpored po kmetiji",
  tripBuses: [
    { id: "bus-1", name: "Bus 1", groups: "1., 2., 3. in 4. skupina", leader: "Luka Kljun", notes: "" },
    { id: "bus-2", name: "Bus 2", groups: "5., 6. in 7. skupina", leader: "Iza Orazem", notes: "" },
    { id: "bus-3", name: "Bus 3", groups: "8., 9. in 10. skupina", leader: "Anamarija Duščak", notes: "" },
    { id: "bus-4", name: "Bus 4", groups: "11., 12. in 13. skupina", leader: "Tinkara Bartol", notes: "" },
    { id: "bus-5", name: "Bus 5", groups: "14., 15. in 16. skupina + 2 animatorja in 7 otrok iz 17. skupine", leader: "Jerca Nelec", notes: "" },
    { id: "bus-6", name: "Bus 6", groups: "Ostala 17. skupina (1 animator + 4 otroci) + 18., 19. in 20. skupina", leader: "Zala Lavrič", notes: "21. skupina bo ves čas stala poleg busov in se dala kamorkoli, kjer bo frej." },
  ],
  farmRotations: [
    { id: "farm-1", time: "1. krog", cheese: "1. ekipa (1.-5. katehetska skupina)", catechesisGame: "2. ekipa (6.-10. katehetska skupina)", bigGameOne: "3. ekipa (11.-15. katehetska skupina)", bigGameTwo: "4. ekipa (16.-21. katehetska skupina)" },
    { id: "farm-2", time: "2. krog", cheese: "4. ekipa (16.-21. katehetska skupina)", catechesisGame: "1. ekipa (1.-5. katehetska skupina)", bigGameOne: "2. ekipa (6.-10. katehetska skupina)", bigGameTwo: "3. ekipa (11.-15. katehetska skupina)" },
    { id: "farm-3", time: "3. krog", cheese: "3. ekipa (11.-15. katehetska skupina)", catechesisGame: "4. ekipa (16.-21. katehetska skupina)", bigGameOne: "1. ekipa (1.-5. katehetska skupina)", bigGameTwo: "2. ekipa (6.-10. katehetska skupina)" },
    { id: "farm-4", time: "4. krog", cheese: "2. ekipa (6.-10. katehetska skupina)", catechesisGame: "3. ekipa (11.-15. katehetska skupina)", bigGameOne: "1. ekipa (1.-5. katehetska skupina)", bigGameTwo: "4. ekipa (16.-21. katehetska skupina)" },
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

const fetchSharedContent = async () => {
  try {
    const response = await fetch(`/api/content?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;
    return normalizeContent(await response.json());
  } catch {
    return null;
  }
};

const normalizeContent = (content: Partial<SiteContent>): SiteContent => ({
  ...defaultContent,
  ...content,
  pointDays: content.pointDays?.length ? content.pointDays : defaultContent.pointDays,
  guideRows: content.guideRows?.length ? content.guideRows : defaultContent.guideRows,
  announcements: content.announcements ?? defaultContent.announcements,
  schedule: content.schedule?.length ? content.schedule : defaultContent.schedule,
  dailyDuties: content.dailyDuties?.length ? content.dailyDuties : defaultContent.dailyDuties,
  tripTitle: content.tripTitle ?? defaultContent.tripTitle,
  tripSubtitle: content.tripSubtitle ?? defaultContent.tripSubtitle,
  tripBuses: content.tripBuses?.length ? content.tripBuses : defaultContent.tripBuses,
  farmRotations: content.farmRotations?.length ? content.farmRotations : defaultContent.farmRotations,
});

const postSharedContent = async (content: SiteContent): Promise<SaveResult> => {
  try {
    const response = await fetch("/api/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword,
      },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null) as { message?: string } | null;
      return { ok: false, message: error?.message ?? "Shranjevanje na Vercel ni uspelo." };
    }

    return { ok: true, content: (await response.json()) as SiteContent };
  } catch {
    return { ok: false, message: "Povezava z Vercel shrambo ni uspela." };
  }
};

const notifyForNewAnnouncements = (previous: string[], next: string[], enabled: boolean) => {
  if (!enabled || !("Notification" in window) || Notification.permission !== "granted") return;

  const previousSet = new Set(previous.map((message) => message.trim()));
  next
    .map((message) => message.trim())
    .filter((message) => message && !previousSet.has(message))
    .forEach((message, index) => {
      new Notification("Novo obvestilo", {
        body: message,
        tag: `oratorij-shared-announcement-${Date.now()}-${index}`,
      });
    });
};

const renderInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    return <span key={index}>{part}</span>;
  });
};

function MarkdownText({ text, className = "" }: { text?: string; className?: string }) {
  if (!text?.trim()) return null;

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    const current = listItems;
    listItems = [];
    blocks.push(<ul key={`list-${blocks.length}`}>{current.map((item, index) => <li key={index}>{renderInlineMarkdown(item)}</li>)}</ul>);
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      listItems.push(listMatch[1]);
      return;
    }

    flushList();
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = renderInlineMarkdown(headingMatch[2]);
      blocks.push(level === 1 ? <h3 key={`h-${blocks.length}`}>{content}</h3> : <h4 key={`h-${blocks.length}`}>{content}</h4>);
      return;
    }

    const quoteMatch = trimmed.match(/^>\s+(.+)$/);
    if (quoteMatch) {
      blocks.push(<blockquote key={`q-${blocks.length}`}>{renderInlineMarkdown(quoteMatch[1])}</blockquote>);
      return;
    }

    blocks.push(<p key={`p-${blocks.length}`}>{renderInlineMarkdown(line)}</p>);
  });
  flushList();

  return <div className={className ? `markdown-text ${className}` : "markdown-text"}>{blocks}</div>;
}

export function App() {
  const [tab, setTab] = useState<Tab>("now");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const contentRef = useRef(defaultContent);
  const [selectedPointId, setSelectedPointId] = useState(defaultContent.pointDays[0].id);
  const [selectedDutyDayId, setSelectedDutyDayId] = useState(defaultContent.pointDays[0].id);
  const [notificationStatus, setNotificationStatus] = useState(getInitialNotificationStatus);
  const [notificationsEnabled, setNotificationsEnabled] = useState(getInitialSubscription);
  const notificationsEnabledRef = useRef(notificationsEnabled);
  const [secretClicks, setSecretClicks] = useState(0);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const { current, next } = useMemo(() => getNow(content.schedule), [content.schedule]);
  const selectedPoint =
    content.pointDays.find((point) => point.id === selectedPointId) ?? content.pointDays[0];

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
  }, [notificationsEnabled]);

  useEffect(() => {
    let active = true;

    const loadSharedContent = async () => {
      const nextContent = await fetchSharedContent();
      if (!active || !nextContent) return;

      setContent((previous) => {
        notifyForNewAnnouncements(previous.announcements, nextContent.announcements, notificationsEnabledRef.current);
        contentRef.current = nextContent;
        return nextContent;
      });
    };

    void loadSharedContent();
    const interval = window.setInterval(loadSharedContent, 10000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

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
    if (!notificationsEnabledRef.current || !("Notification" in window) || Notification.permission !== "granted") return;

    messages.forEach((message, index) => {
      new Notification("Novo obvestilo", {
        body: message,
        tag: `oratorij-announcement-${Date.now()}-${index}`,
      });
    });
  };

  const saveSharedContent = async (nextContent: SiteContent) => {
    setSaveStatus("Shranjujem na Vercel ...");
    const saved = await postSharedContent(nextContent);
    if (!saved.ok) {
      setSaveStatus(saved.message);
      return;
    }

    const newAnnouncements = saved.content.announcements
      .slice(contentRef.current.announcements.length)
      .map((message) => message.trim())
      .filter(Boolean);

    contentRef.current = saved.content;
    setContent(saved.content);
    sendAnnouncementNotifications(newAnnouncements);
    setSaveStatus("Shranjeno na Vercel. Spremembe bodo vidne vsem.");

    if (!saved.content.pointDays.some((point) => point.id === selectedPointId)) {
      setSelectedPointId(saved.content.pointDays[0]?.id ?? "day-1");
    }
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
        {tab === "trip" && <TripScreen content={content} />}
        {tab === "duties" && (
          <DutiesScreen
            pointDays={content.pointDays}
            dailyDuties={content.dailyDuties}
            selectedDayId={selectedDutyDayId}
            onSelectDay={setSelectedDutyDayId}
          />
        )}
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
        <NavButton active={tab === "trip"} icon={<Bus />} label="Izlet" onClick={() => setTab("trip")} />
        <NavButton active={tab === "duties"} icon={<ListChecks />} label="Naloge" onClick={() => setTab("duties")} />
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
          onSave={saveSharedContent}
          saveStatus={saveStatus}
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
        {current.note && <MarkdownText text={current.note} className="small-note" />}
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
        <MarkdownText text={selectedPoint.text} />
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
            {item.note && <MarkdownText text={item.note} />}
          </div>
        </section>
      ))}
    </div>
  );
}

function TripScreen({ content }: { content: SiteContent }) {
  return (
    <div className="stack">
      <h2 className="page-title">{content.tripTitle}</h2>
      <section className="guide-card soft">
        <div className="point-head">
          <p className="label">Busi</p>
          <span>{content.tripSubtitle}</span>
        </div>
        <div className="bus-grid">
          {content.tripBuses.map((bus) => (
            <article className="bus-card" key={bus.id}>
              <div className="bus-title"><Bus /><strong>{bus.name}</strong></div>
              <MarkdownText text={bus.groups} className="bus-groups" />
              <MarkdownText text={bus.leader} className="bus-leader" />
              <MarkdownText text={bus.notes} className="bus-note" />
            </article>
          ))}
        </div>
      </section>

      <section className="guide-card soft">
        <div className="point-head">
          <p className="label">Kmetija</p>
          <span>4 skupine se menjavajo</span>
        </div>
        <div className="farm-list">
          {content.farmRotations.map((rotation) => (
            <article className="farm-slot" key={rotation.id}>
              <time>{rotation.time}</time>
              <div><strong>Sir</strong><MarkdownText text={rotation.cheese} /></div>
              <div><strong>Igrica + kateheza</strong><MarkdownText text={rotation.catechesisGame} /></div>
              <div><strong>Velika igra</strong><MarkdownText text={rotation.bigGameOne} /></div>
              <div><strong>Velika igra</strong><MarkdownText text={rotation.bigGameTwo} /></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DutiesScreen({
  pointDays,
  dailyDuties,
  selectedDayId,
  onSelectDay,
}: {
  pointDays: DayPoint[];
  dailyDuties: DailyDuty[];
  selectedDayId: string;
  onSelectDay: (id: string) => void;
}) {
  const selectedDay = pointDays.find((point) => point.id === selectedDayId) ?? pointDays[0];
  const duties = dailyDuties.filter((duty) => duty.dayId === selectedDay.id);

  return (
    <div className="stack">
      <h2 className="page-title">Dnevne naloge</h2>
      <section className="guide-card soft">
        <div className="point-head">
          <p className="label">Kdo ima kaj</p>
          <span>{selectedDay.day}</span>
        </div>
        <DayPointSelector points={pointDays} selectedId={selectedDay.id} onSelect={onSelectDay} />
        <div className="duty-list">
          {duties.length === 0 ? (
            <p className="quiet">Za ta dan se ni vpisanih nalog.</p>
          ) : duties.map((duty) => (
            <article className="duty-item" key={duty.id}>
              <strong>{duty.title}</strong>
              {duty.people ? <MarkdownText text={duty.people} className="duty-people" /> : <span>Se ni doloceno.</span>}
              <MarkdownText text={duty.notes} className="duty-note" />
            </article>
          ))}
        </div>
      </section>
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
          <MarkdownText text={message} />
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
        <MarkdownText text={content.guideText} />
      </section>
      <section className="card compact-list">
        {content.guideRows.map((row, index) => (
          <div key={`${row.title}-${index}`}><strong>{row.title}</strong><MarkdownText text={row.text} /></div>
        ))}
      </section>
      <section className="guide-card soft">
        <div className="point-head">
          <p className="label">Točke dneva</p>
          <span>{selectedPoint.day}</span>
        </div>
        <DayPointSelector points={content.pointDays} selectedId={selectedPointId} onSelect={onSelectPoint} />
        <h2>{selectedPoint.title}</h2>
        <MarkdownText text={selectedPoint.text} />
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

function AdminScreen({
  content,
  onClose,
  onSave,
  saveStatus,
}: {
  content: SiteContent;
  onClose: () => void;
  onSave: (content: SiteContent) => Promise<void>;
  saveStatus: string;
}) {
  const [draft, setDraft] = useState<SiteContent>(content);
  const [section, setSection] = useState<AdminSection>("home");

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

  const updateDailyDuty = (id: string, patch: Partial<DailyDuty>) => {
    setDraft((previous) => ({
      ...previous,
      dailyDuties: previous.dailyDuties.map((duty) => duty.id === id ? { ...duty, ...patch } : duty),
    }));
  };

  const addDailyDuty = (dayId: string) => {
    setDraft((previous) => ({
      ...previous,
      dailyDuties: [
        ...previous.dailyDuties,
        {
          id: `${dayId}-d-${Date.now()}`,
          dayId,
          title: "Nova naloga",
          people: "",
          notes: "",
        },
      ],
    }));
  };

  const removeDailyDuty = (id: string) => {
    setDraft((previous) => ({
      ...previous,
      dailyDuties: previous.dailyDuties.filter((duty) => duty.id !== id),
    }));
  };

  const updateTripBus = (id: string, patch: Partial<TripBus>) => {
    setDraft((previous) => ({
      ...previous,
      tripBuses: previous.tripBuses.map((bus) => bus.id === id ? { ...bus, ...patch } : bus),
    }));
  };

  const updateFarmRotation = (id: string, patch: Partial<FarmRotation>) => {
    setDraft((previous) => ({
      ...previous,
      farmRotations: previous.farmRotations.map((rotation) => rotation.id === id ? { ...rotation, ...patch } : rotation),
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
        <div className="admin-section-tabs">
          <AdminSectionButton active={section === "home"} label="Naslovnica" onClick={() => { setSection("home"); document.getElementById("admin-home")?.scrollIntoView({ behavior: "smooth" }); }} />
          <AdminSectionButton active={section === "points"} label="Točke" onClick={() => { setSection("points"); document.getElementById("admin-points")?.scrollIntoView({ behavior: "smooth" }); }} />
          <AdminSectionButton active={section === "schedule"} label="Urnik" onClick={() => { setSection("schedule"); document.getElementById("admin-schedule")?.scrollIntoView({ behavior: "smooth" }); }} />
          <AdminSectionButton active={section === "trip"} label="Izlet" onClick={() => { setSection("trip"); document.getElementById("admin-trip")?.scrollIntoView({ behavior: "smooth" }); }} />
          <AdminSectionButton active={section === "duties"} label="Naloge" onClick={() => { setSection("duties"); document.getElementById("admin-duties")?.scrollIntoView({ behavior: "smooth" }); }} />
          <AdminSectionButton active={section === "news"} label="Obvestila" onClick={() => { setSection("news"); document.getElementById("admin-news")?.scrollIntoView({ behavior: "smooth" }); }} />
          <AdminSectionButton active={section === "guide"} label="Vodič" onClick={() => { setSection("guide"); document.getElementById("admin-guide")?.scrollIntoView({ behavior: "smooth" }); }} />
        </div>

        <section className="admin-card" id="admin-home">
          <h2>Naslovnica</h2>
          <Field label="Čip" value={draft.status} onChange={(value) => setField("status", value)} />
          <Field label="Ime" value={draft.appName} onChange={(value) => setField("appName", value)} />
          <Field label="Naslov" value={draft.heroTitle} onChange={(value) => setField("heroTitle", value)} />
          <Field label="Podnaslov" value={draft.heroSubtitle} onChange={(value) => setField("heroSubtitle", value)} />
        </section>

        <section className="admin-card" id="admin-points">
          <h2>Točke dneva</h2>
          {draft.pointDays.map((point) => (
            <div className="point-editor" key={point.id}>
              <input value={point.day} onChange={(event) => updateDayPoint(point.id, { day: event.target.value })} />
              <input value={point.title} onChange={(event) => updateDayPoint(point.id, { title: event.target.value })} />
              <textarea value={point.text} onChange={(event) => updateDayPoint(point.id, { text: event.target.value })} />
            </div>
          ))}
        </section>

        <section className="admin-card" id="admin-schedule">
          <h2>Urnik</h2>
          {draft.schedule.map((item) => (
            <div className="admin-row" key={item.id}>
                <input value={item.time} onChange={(event) => updateSchedule(item.id, { time: event.target.value })} />
                <input value={item.title} onChange={(event) => updateSchedule(item.id, { title: event.target.value })} />
                <textarea value={item.note ?? ""} placeholder="opomba" onChange={(event) => updateSchedule(item.id, { note: event.target.value })} />
            </div>
          ))}
        </section>

        <section className="admin-card" id="admin-trip">
          <h2>Izlet</h2>
          <Field label="Naslov" value={draft.tripTitle} onChange={(value) => setField("tripTitle", value)} />
          <Field label="Podnaslov" value={draft.tripSubtitle} onChange={(value) => setField("tripSubtitle", value)} />
          <h3>Busi</h3>
          <div className="trip-admin-grid">
            {draft.tripBuses.map((bus) => (
              <div className="trip-editor" key={bus.id}>
                <input value={bus.name} onChange={(event) => updateTripBus(bus.id, { name: event.target.value })} />
                <textarea value={bus.groups} placeholder="skupine" onChange={(event) => updateTripBus(bus.id, { groups: event.target.value })} />
                <input value={bus.leader} placeholder="vodja" onChange={(event) => updateTripBus(bus.id, { leader: event.target.value })} />
                <textarea value={bus.notes} placeholder="opombe" onChange={(event) => updateTripBus(bus.id, { notes: event.target.value })} />
              </div>
            ))}
          </div>
          <h3>Razpored po kmetiji</h3>
          <div className="farm-admin-list">
            {draft.farmRotations.map((rotation) => (
              <div className="farm-editor" key={rotation.id}>
                <input value={rotation.time} onChange={(event) => updateFarmRotation(rotation.id, { time: event.target.value })} />
                <textarea value={rotation.cheese} placeholder="sir" onChange={(event) => updateFarmRotation(rotation.id, { cheese: event.target.value })} />
                <textarea value={rotation.catechesisGame} placeholder="igrica + kateheza" onChange={(event) => updateFarmRotation(rotation.id, { catechesisGame: event.target.value })} />
                <textarea value={rotation.bigGameOne} placeholder="velika igra 1" onChange={(event) => updateFarmRotation(rotation.id, { bigGameOne: event.target.value })} />
                <textarea value={rotation.bigGameTwo} placeholder="velika igra 2" onChange={(event) => updateFarmRotation(rotation.id, { bigGameTwo: event.target.value })} />
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card" id="admin-duties">
          <h2>Dnevne naloge</h2>
          <p className="admin-help">Za vsak dan vpisi, kdo ima igre skupine, kdo pelje na WC, kdo skrbi za vodo in ostale zadolzitve.</p>
          {draft.pointDays.map((day) => (
            <div className="duty-editor-day" key={day.id}>
              <div className="duty-editor-head">
                <strong>{day.day}</strong>
                <button onClick={() => addDailyDuty(day.id)}><Plus /> Dodaj</button>
              </div>
              {draft.dailyDuties.filter((duty) => duty.dayId === day.id).map((duty) => (
                <div className="duty-editor" key={duty.id}>
                  <input value={duty.title} onChange={(event) => updateDailyDuty(duty.id, { title: event.target.value })} />
                  <textarea value={duty.people} placeholder="kdo" onChange={(event) => updateDailyDuty(duty.id, { people: event.target.value })} />
                  <textarea value={duty.notes} placeholder="opombe" onChange={(event) => updateDailyDuty(duty.id, { notes: event.target.value })} />
                  <button onClick={() => removeDailyDuty(duty.id)}>Odstrani</button>
                </div>
              ))}
            </div>
          ))}
        </section>

        <section className="admin-card" id="admin-news">
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

        <section className="admin-card" id="admin-guide">
          <h2>Vodič</h2>
          <Field label="Oznaka" value={draft.guideLabel} onChange={(value) => setField("guideLabel", value)} />
          <Field label="Naslov" value={draft.guideTitle} onChange={(value) => setField("guideTitle", value)} />
          <Field label="Besedilo" value={draft.guideText} onChange={(value) => setField("guideText", value)} multiline />
          {draft.guideRows.map((row, index) => (
            <div className="admin-row two" key={index}>
              <input value={row.title} onChange={(event) => updateGuideRow(index, { title: event.target.value })} />
              <textarea value={row.text} onChange={(event) => updateGuideRow(index, { text: event.target.value })} />
            </div>
          ))}
        </section>
      </main>

      <footer className="admin-actions">
        <button onClick={onClose}>Zapri</button>
        {saveStatus && <span>{saveStatus}</span>}
        <button className="save-button" onClick={() => { void onSave(draft); }}>
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

function AdminSectionButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button className={active ? "active" : ""} onClick={onClick}>{label}</button>;
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactElement; label: string; onClick: () => void }) {
  return (
    <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
