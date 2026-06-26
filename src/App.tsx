import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Home,
  LogIn,
  MapPin,
  Mountain,
  NotebookTabs,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Tab = "now" | "schedule" | "news" | "guide";
type User = { id: string; name: string; role: "animator" | "admin"; tasks: string[] };
type Activity = {
  id: string;
  time: string;
  title: string;
  place: string;
  lead: string;
  note?: string;
  changed?: boolean;
};

const users: User[] = [
  { id: "luka", name: "Luka", role: "admin", tasks: ["Vodi skupino 3", "Postaja pri veliki igri", "Refleksija"] },
  { id: "maja", name: "Maja", role: "admin", tasks: ["Jutranji zbor", "Obvestila animatorjem"] },
  { id: "ana", name: "Ana", role: "animator", tasks: ["Sprejem otrok", "Kateheza skupina 2"] },
  { id: "jure", name: "Jure", role: "animator", tasks: ["Velika igra", "Čiščenje dvorišča"] },
];

const schedule: Activity[] = [
  { id: "a1", time: "08:00", title: "Prihod animatorjev", place: "Župnišče", lead: "Maja" },
  { id: "a2", time: "09:00", title: "Zbiranje otrok", place: "Dvorišče", lead: "Gašper" },
  { id: "a3", time: "09:30", title: "Igrica", place: "Oder", lead: "Žiga" },
  { id: "a4", time: "10:00", title: "Molitev", place: "Cerkev", lead: "Nika" },
  { id: "a5", time: "10:20", title: "Kateheza", place: "Učilnice", lead: "Ana", note: "Animatorji v skupine." },
  { id: "a6", time: "11:00", title: "Malica", place: "Dvorišče", lead: "Sara" },
  { id: "a7", time: "11:15", title: "Delavnice", place: "Učilnice", lead: "Eva", changed: true },
  { id: "a8", time: "12:30", title: "Kosilo", place: "Jedilnica", lead: "Luka" },
  { id: "a9", time: "14:00", title: "Velika igra", place: "Igrišče", lead: "Jure", changed: true },
  { id: "a10", time: "16:30", title: "Refleksija", place: "Župnišče", lead: "Luka" },
];

const announcements = [
  "Velika igra ima pripravljen dežni plan.",
  "Pri malici naj najprej pridejo mlajše skupine.",
  "Animatorji: refleksija je danes ob 16:30.",
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
  const [user, setUser] = useState<User | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const { current, next } = useMemo(getNow, []);

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <div className="mountain-mark">
            <Mountain />
          </div>
          <button className="login-chip" onClick={() => setLoginOpen(true)}>
            {user ? <UserRound /> : <LogIn />}
            {user ? user.name : "Prijava"}
          </button>
        </div>
        <p>Oratorij Hub</p>
        <h1>Hajdi: Živeti je lepo!</h1>
        <span>Animatorji · danes · hitro in jasno</span>
      </header>

      <main className="content">
        {tab === "now" && <NowScreen current={current} next={next} user={user} />}
        {tab === "schedule" && <ScheduleScreen current={current} />}
        {tab === "news" && <NewsScreen user={user} />}
        {tab === "guide" && <GuideScreen user={user} />}
      </main>

      <nav className="bottom-nav">
        <NavButton active={tab === "now"} icon={<Clock3 />} label="Zdaj" onClick={() => setTab("now")} />
        <NavButton active={tab === "schedule"} icon={<CalendarDays />} label="Urnik" onClick={() => setTab("schedule")} />
        <NavButton active={tab === "news"} icon={<Bell />} label="Obvestila" onClick={() => setTab("news")} />
        <NavButton active={tab === "guide"} icon={<NotebookTabs />} label="Vodič" onClick={() => setTab("guide")} />
      </nav>

      {loginOpen && <LoginSheet onClose={() => setLoginOpen(false)} onLogin={(nextUser) => { setUser(nextUser); setLoginOpen(false); }} />}
    </div>
  );
}

function NowScreen({ current, next, user }: { current: Activity; next: Activity | null; user: User | null }) {
  return (
    <div className="stack">
      <section className="now-card">
        <p className="label">Zdaj</p>
        <h2>{current.title}</h2>
        <div className="meta">
          <span><Clock3 /> {current.time}</span>
          <span><MapPin /> {current.place}</span>
        </div>
        <p className="lead">Odgovorni: {current.lead}</p>
        {current.note && <p className="small-note">{current.note}</p>}
      </section>

      {next && (
        <section className="mini-card">
          <span>Sledi</span>
          <strong>{next.time} · {next.title}</strong>
          <p>{next.place}</p>
        </section>
      )}

      <section className="card">
        <div className="section-title">
          <h3>Moje</h3>
          {!user && <span>po prijavi</span>}
        </div>
        {user ? (
          <div className="task-list">
            {user.tasks.map((task) => (
              <div className="task" key={task}><CheckCircle2 /> {task}</div>
            ))}
          </div>
        ) : (
          <p className="quiet">Urnik vidiš takoj. Za osebne naloge se prijavi.</p>
        )}
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

function NewsScreen({ user }: { user: User | null }) {
  return (
    <div className="stack">
      <h2 className="page-title">Obvestila</h2>
      {announcements.map((message) => (
        <section className="card notice" key={message}>
          <Bell />
          <p>{message}</p>
        </section>
      ))}
      {user?.role === "admin" && (
        <section className="admin-mini">
          <ShieldCheck />
          <div>
            <strong>Admin pogled</strong>
            <p>Dodajanje obvestil pride kasneje. Trenutno je to čist demo.</p>
          </div>
        </section>
      )}
    </div>
  );
}

function GuideScreen({ user }: { user: User | null }) {
  return (
    <div className="stack">
      <h2 className="page-title">Vodič</h2>
      <section className="guide-card">
        <p className="label">Točka dneva</p>
        <h2>Pogum</h2>
        <p>Pogum je narediti dobro stvar tudi takrat, ko ni najlažje.</p>
      </section>
      <section className="card compact-list">
        <div><strong>Animatorji</strong><span>opazi otroka, ki je sam</span></div>
        <div><strong>Pesem</strong><span>Tukaj sem, Gospod</span></div>
        <div><strong>Molitev</strong><span>izberi dobro</span></div>
      </section>
      {!user && <p className="quiet center">Brez prijave vidiš vse osnovne informacije.</p>}
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

function LoginSheet({ onClose, onLogin }: { onClose: () => void; onLogin: (user: User) => void }) {
  return (
    <div className="sheet-backdrop">
      <section className="sheet">
        <div className="sheet-head">
          <h2>Prijava</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <p>Izberi demo animatorja.</p>
        <div className="user-list">
          {users.map((person) => (
            <button key={person.id} onClick={() => onLogin(person)}>
              <UserRound />
              <span>{person.name}</span>
              <em>{person.role === "admin" ? "admin" : "animator"}</em>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
