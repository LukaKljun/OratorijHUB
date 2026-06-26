import {
  Bell,
  CalendarDays,
  Clock3,
  MapPin,
  Mountain,
  NotebookTabs,
} from "lucide-react";
import { useMemo, useState } from "react";

type Tab = "now" | "schedule" | "news" | "guide";
type Activity = {
  id: string;
  time: string;
  title: string;
  place: string;
  lead: string;
  note?: string;
  changed?: boolean;
};

const schedule: Activity[] = [
  { id: "a1", time: "08:00", title: "Prihod animatorjev", place: "Župnišče", lead: "vodstvo" },
  { id: "a2", time: "09:00", title: "Zbiranje otrok", place: "Dvorišče", lead: "vhod" },
  { id: "a3", time: "09:30", title: "Igrica", place: "Oder", lead: "igralska ekipa" },
  { id: "a4", time: "10:00", title: "Molitev", place: "Cerkev", lead: "glasba" },
  { id: "a5", time: "10:20", title: "Kateheza", place: "Učilnice", lead: "voditelji skupin", note: "Otroci gredo po skupinah." },
  { id: "a6", time: "11:00", title: "Malica", place: "Dvorišče", lead: "kuhinja" },
  { id: "a7", time: "11:15", title: "Delavnice", place: "Učilnice", lead: "delavnice" },
  { id: "a8", time: "12:30", title: "Kosilo", place: "Jedilnica", lead: "kuhinja" },
  { id: "a9", time: "14:00", title: "Velika igra", place: "Igrišče", lead: "ekipa igre" },
  { id: "a10", time: "16:30", title: "Refleksija", place: "Župnišče", lead: "animatorji" },
];

const announcements = [
  "Animatorji pridemo 10 minut pred svojo zadolžitvijo.",
  "Pri malici naj najprej pridejo mlajše skupine.",
  "Refleksija animatorjev je ob 16:30 v župnišču.",
];

const minuteNow = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const getNow = () => {
  const currentMinutes = minuteNow();
  const current =
    [...schedule].reverse().find((item) => toMinutes(item.time) <= currentMinutes) ?? schedule[0];
  const next = schedule.find((item) => toMinutes(item.time) > currentMinutes) ?? null;
  return { current, next };
};

export function App() {
  const [tab, setTab] = useState<Tab>("now");
  const { current, next } = useMemo(getNow, []);

  /*
   * Prijava je namenoma izklopljena.
   * Ko bo aplikacija dobila backend, se lahko tukaj ponovno doda prijava,
   * osebne naloge animatorjev in urejanje urnika.
   */

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <div className="mountain-mark">
            <Mountain />
          </div>
          <span className="status-chip">Informativni pregled</span>
        </div>
        <p>Oratorij Hub</p>
        <h1>Hajdi: Živeti je lepo!</h1>
        <span>Animatorji · urnik · obvestila · vodič</span>
      </header>

      <main className="content">
        {tab === "now" && <NowScreen current={current} next={next} />}
        {tab === "schedule" && <ScheduleScreen current={current} />}
        {tab === "news" && <NewsScreen />}
        {tab === "guide" && <GuideScreen />}
      </main>

      <nav className="bottom-nav">
        <NavButton active={tab === "now"} icon={<Clock3 />} label="Zdaj" onClick={() => setTab("now")} />
        <NavButton active={tab === "schedule"} icon={<CalendarDays />} label="Urnik" onClick={() => setTab("schedule")} />
        <NavButton active={tab === "news"} icon={<Bell />} label="Obvestila" onClick={() => setTab("news")} />
        <NavButton active={tab === "guide"} icon={<NotebookTabs />} label="Vodič" onClick={() => setTab("guide")} />
      </nav>
    </div>
  );
}

function NowScreen({ current, next }: { current: Activity; next: Activity | null }) {
  return (
    <div className="stack">
      <section className="now-card">
        <p className="label">Zdaj</p>
        <h2>{current.title}</h2>
        <div className="meta">
          <span><Clock3 /> {current.time}</span>
          <span><MapPin /> {current.place}</span>
        </div>
        <p className="lead">Skrbi: {current.lead}</p>
        {current.note && <p className="small-note">{current.note}</p>}
      </section>

      {next && (
        <section className="mini-card">
          <span>Sledi</span>
          <strong>{next.time} · {next.title}</strong>
          <p>{next.place}</p>
        </section>
      )}

      <section className="guide-card soft">
        <p className="label">Točka dneva</p>
        <h2>Pogum</h2>
        <p>Naredi dobro stvar tudi takrat, ko ni najlažje.</p>
      </section>
    </div>
  );
}

function ScheduleScreen({ current }: { current: Activity }) {
  return (
    <div className="stack">
      <h2 className="page-title">Urnik</h2>
      {schedule.map((item) => (
        <section className={item.id === current.id ? "schedule-item active" : "schedule-item"} key={item.id}>
          <time>{item.time}</time>
          <div>
            <h3>{item.title}</h3>
            <p>{item.place} · {item.lead}</p>
          </div>
          {item.changed && <span className="tag">novo</span>}
        </section>
      ))}
    </div>
  );
}

function NewsScreen() {
  return (
    <div className="stack">
      <h2 className="page-title">Obvestila</h2>
      {announcements.map((message) => (
        <section className="card notice" key={message}>
          <Bell />
          <p>{message}</p>
        </section>
      ))}
    </div>
  );
}

function GuideScreen() {
  return (
    <div className="stack">
      <h2 className="page-title">Vodič</h2>
      <section className="guide-card">
        <p className="label">Hajdi</p>
        <h2>Živeti je lepo!</h2>
        <p>Dan je lep, ko ga napolnimo z dobroto, pogumom in pozornostjo do drugega.</p>
      </section>
      <section className="card compact-list">
        <div><strong>Animatorji</strong><span>bodi blizu otrokom</span></div>
        <div><strong>Pesem</strong><span>Tukaj sem, Gospod</span></div>
        <div><strong>Molitev</strong><span>pogum za dobro</span></div>
      </section>
    </div>
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
