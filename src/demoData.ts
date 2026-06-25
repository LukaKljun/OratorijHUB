import { Activity, Day, Group, Message, Store, Task, User } from "./types";

const mondayOfCurrentWeek = () => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
};

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export const users: User[] = [
  { id: "u-luka", name: "Luka Kljun", email: "luka@oratorij.si", phone: "+386 40 111 222", role: "admin", team: "Vodstvo", availability: "ves dan", photoUrl: "", createdAt: "2026-05-01" },
  { id: "u-maja", name: "Maja Novak", email: "maja@oratorij.si", phone: "+386 40 222 333", role: "admin", team: "Vodstvo", availability: "ves dan", photoUrl: "", createdAt: "2026-05-01" },
  { id: "u-ana", name: "Ana Zupan", email: "ana@oratorij.si", phone: "+386 40 333 444", role: "animator", team: "Kateheza", availability: "ves dan", photoUrl: "", createdAt: "2026-05-02" },
  { id: "u-jure", name: "Jure Kovač", email: "jure@oratorij.si", phone: "+386 40 444 555", role: "animator", team: "Velika igra", availability: "dopoldne in popoldne", photoUrl: "", createdAt: "2026-05-02" },
  { id: "u-eva", name: "Eva Horvat", email: "eva@oratorij.si", phone: "+386 40 555 666", role: "animator", team: "Delavnice", availability: "ves dan", photoUrl: "", createdAt: "2026-05-03" },
  { id: "u-tine", name: "Tine Mlakar", email: "tine@oratorij.si", phone: "+386 40 666 777", role: "animator", team: "Tehnika", availability: "ves dan", photoUrl: "", createdAt: "2026-05-03" },
  { id: "u-nika", name: "Nika Vidmar", email: "nika@oratorij.si", phone: "+386 40 777 888", role: "animator", team: "Glasba", availability: "ves dan", photoUrl: "", createdAt: "2026-05-04" },
  { id: "u-gasper", name: "Gašper Kljun", email: "gasper@oratorij.si", phone: "+386 40 888 999", role: "animator", team: "Vhod", availability: "do 16:30", photoUrl: "", createdAt: "2026-05-04" },
  { id: "u-sara", name: "Sara Kos", email: "sara@oratorij.si", phone: "+386 40 999 111", role: "animator", team: "Kuhinja", availability: "ves dan", photoUrl: "", createdAt: "2026-05-05" },
  { id: "u-ziga", name: "Žiga Rus", email: "ziga@oratorij.si", phone: "+386 40 123 456", role: "animator", team: "Igrica", availability: "ves dan", photoUrl: "", createdAt: "2026-05-05" },
];

const dayContent = [
  ["1. dan", "Začetek poti", "Veselje", "Veselje raste, ko ga delimo z drugimi.", "Flp 4,4", "Danes gradimo občutek sprejetosti. Otroci naj začutijo, da so tukaj varni, opaženi in povabljeni v skupnost.", "Pozdravi vsakega otroka po imenu, kadar lahko.", "Poišči novega prijatelja in se mu predstavi.", "Gospod, odpri naše srce za veselje in prijateljstvo.", "Aleluja, slava Bogu", "Poudari uvodno spoznavanje, dogovor o pravilih in varnem prostoru."],
  ["2. dan", "Pogum za dobro", "Pogum", "Pogum pomeni narediti dobro stvar tudi takrat, ko ni lahko.", "Joz 1,9", "Pogum ni samo glasnost ali moč. Pogum je tudi, da pomagaš, odpustiš, poveš resnico in vključiš nekoga, ki je sam.", "Opazi otroka, ki je tišji ali izključen, in ga vključi v igro.", "Danes naredi eno dobro stvar, ki ti je malo težka.", "Bog, pomagaj nam, da izberemo dobro tudi takrat, ko ni najlažje.", "Tukaj sem, Gospod", "Vprašanja naj vodijo k konkretnim primerom poguma v šoli, doma in med prijatelji."],
  ["3. dan", "Skupaj zmoremo", "Sodelovanje", "Ko poslušamo drug drugega, postane skupina močnejša.", "1 Kor 12,12", "Otroci naj vidijo, da ima vsak v skupini dar. Animatorji spodbujajo tihe, umirjajo glasne in povezujejo različne značaje.", "Daj prostor animatorju, ki danes potrebuje podporo.", "V skupinski nalogi najprej poslušaj idejo nekoga drugega.", "Jezus, nauči nas biti eno srce in ena ekipa.", "Mi smo luč", "Uporabi kratko timsko igro kot uvod v pogovor."],
  ["4. dan", "Odpuščanje", "Usmiljenje", "Odpuščanje nas osvobodi in nam pomaga začeti znova.", "Lk 15,20", "Dan je namenjen spravi, nežnosti in novim začetkom. Pri katehezi naj bo dovolj miru za osebni razmislek.", "Danes popravi majhno napetost v ekipi, preden zraste.", "Opraviči se, če si koga prizadel.", "Usmiljeni Oče, daj nam pogum za oprosti in hvala.", "Oče, združi nas", "Bodi pozoren na otroke, ki težje govorijo o čustvih."],
  ["5. dan", "Poslani v svet", "Hvaležnost", "Kar smo prejeli, nesemo naprej.", "Mt 5,16", "Zaključek tedna naj ne bo samo konec, ampak pošiljanje. Otroci naj odidejo z občutkom, da lahko dobro nadaljujejo doma.", "Povej vsaj trem animatorjem, za kaj si jim hvaležen.", "Domov odnesi eno dobro navado iz Oratorija.", "Gospod, hvala za ta teden. Pošlji nas kot prinašalce dobrega.", "Mnogo poti", "Pripravi kratek sklep, kjer otroci poimenujejo najlepši trenutek tedna."],
];

const schedule = [
  ["08:00", "09:00", "Prihod animatorjev", "Animatorji pridejo, pripravijo materiale, prejmejo navodila ter uredijo prostore.", "Župnišče", "Župnišče", "Priprava"],
  ["09:00", "09:30", "Zbiranje otrok in vhod", "Sprejem otrok, dobrodošlica in preverjanje prisotnosti.", "Dvorišče", "Avla župnišča", "Vhod"],
  ["09:30", "10:00", "Igrica", "Uvodni prizor predstavi temo dneva.", "Oder", "Dvorana", "Igrica"],
  ["10:00", "10:20", "Molitev", "Skupna jutranja molitev z otroki in animatorji.", "Cerkev", "Cerkev", "Molitev"],
  ["10:20", "11:00", "Kateheza", "Otroci gredo v skupine, animatorji vodijo pogovor in aktivnosti.", "Učilnice", "Učilnice", "Kateheza"],
  ["11:00", "11:15", "Malica", "Odmor za otroke in animatorje.", "Dvorišče", "Jedilnica", "Malica"],
  ["11:15", "12:30", "Delavnice", "Ustvarjalne, športne, glasbene in tehnične delavnice.", "Igrišče in učilnice", "Učilnice", "Delavnice"],
  ["12:30", "14:00", "Kosilo", "Skupno kosilo in miren prehod v popoldne.", "Jedilnica", "Jedilnica", "Kosilo"],
  ["14:00", "16:00", "Velika igra", "Glavna popoldanska igra s postajami, ekipami in odgovornimi animatorji.", "Igrišče", "Telovadnica", "Velika igra"],
  ["16:00", "16:30", "Konec", "Otroci odidejo domov, animatorji poskrbijo za varen prevzem in čiščenje.", "Dvorišče", "Avla župnišča", "Konec"],
  ["16:30", "17:15", "Refleksija animatorjev", "Animatorji ovrednotijo dan in pripravijo izboljšave za jutri.", "Župnišče", "Župnišče", "Refleksija"],
  ["20:00", "22:00", "Večerno druženje", "Neobvezno večerno druženje animatorjev.", "Župnišče", "Župnišče", "Druženje"],
] as const;

const responsibles = ["u-maja", "u-gasper", "u-ziga", "u-nika", "u-ana", "u-sara", "u-eva", "u-luka", "u-jure", "u-gasper", "u-luka", "u-tine"];
const helpers = [
  ["u-luka", "u-tine", "u-eva"],
  ["u-gasper", "u-sara", "u-ana"],
  ["u-ziga", "u-nika", "u-tine"],
  ["u-nika", "u-maja", "u-ana"],
  ["u-ana", "u-jure", "u-eva", "u-luka"],
  ["u-sara", "u-gasper", "u-ziga"],
  ["u-eva", "u-nika", "u-tine", "u-sara"],
  ["u-luka", "u-maja", "u-sara"],
  ["u-jure", "u-tine", "u-gasper", "u-ziga"],
  ["u-gasper", "u-ana", "u-eva"],
  ["u-luka", "u-maja", "u-ana", "u-jure"],
  ["u-tine", "u-ziga", "u-nika"],
];

const materials = [
  ["ozvočenje", "urniki", "oznake prostorov"],
  ["seznami otrok", "nalepke z imeni", "pisala"],
  ["kostumi", "rekviziti", "mikrofoni"],
  ["pesmarice", "sveča", "Sveto pismo"],
  ["listi", "barvice", "Sveto pismo", "vprašanja"],
  ["košare", "voda", "sadje"],
  ["škarje", "lepilo", "žoge", "flomastri"],
  ["pladnji", "kozarci", "serviete"],
  ["stožci", "kartice ekip", "postaje", "piščalka"],
  ["seznam prevzema", "metle", "vreče za smeti"],
  ["zapisnik", "jutrišnji urnik", "pisala"],
  ["družabne igre", "kitara", "čaj"],
];

export const createDemoStore = (): Store => {
  const monday = mondayOfCurrentWeek();
  const days: Day[] = dayContent.map((content, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      id: `day-${index + 1}`,
      date: isoDate(date),
      title: content[0],
      theme: content[1],
      value: content[2],
      pointOfDay: content[3],
      bibleQuote: content[4],
      explanation: content[5],
      animatorChallenge: content[6],
      childrenChallenge: content[7],
      prayer: content[8],
      song: content[9],
      catechesisNotes: content[10],
    };
  });

  const activities: Activity[] = days.flatMap((day, dayIndex) =>
    schedule.map((item, activityIndex) => ({
      id: `${day.id}-a-${activityIndex + 1}`,
      dayId: day.id,
      startTime: item[0],
      endTime: item[1],
      title: item[2],
      description: item[3],
      location: item[4],
      rainLocation: item[5],
      rainInstructions: item[6] === "Velika igra" ? "Uporabi postaje ob robu telovadnice in skrajšaj tekmovalni del." : "Premik v notranje prostore, vodja preveri materiale.",
      type: item[6],
      responsibleUserId: responsibles[activityIndex],
      assignedUserIds: helpers[activityIndex],
      materials: materials[activityIndex],
      publicNotes: activityIndex === 8 ? "Voditelji postaj naj bodo na lokaciji 10 minut prej." : "Preveri prisotnost svoje ekipe in pripravi prostor.",
      adminNotes: activityIndex === 7 ? "Preveri, če je kosilo potrjeno pri kuhinji." : "Po potrebi obvesti vodstvo o zamudah.",
      status: "planned",
      lastEditedAt: new Date(Date.now() - (dayIndex + activityIndex) * 1100000).toISOString(),
      changedRecently: dayIndex === 1 && [6, 8].includes(activityIndex),
    })),
  );

  const tasks: Task[] = activities
    .filter((activity) => ["Prihod animatorjev", "Zbiranje otrok in vhod", "Kateheza", "Velika igra", "Refleksija animatorjev"].includes(activity.title))
    .flatMap((activity, index) =>
      activity.assignedUserIds.slice(0, 3).map((userId, helperIndex) => ({
        id: `task-${activity.id}-${helperIndex}`,
        activityId: activity.id,
        assignedTo: userId,
        title: activity.title === "Kateheza" ? "Vodi skupino 3" : activity.title === "Velika igra" ? `Postaja ${helperIndex + 2}` : activity.title,
        description: activity.title === "Velika igra" ? "Razloži pravila otrokom in pazi na varnost." : activity.description,
        priority: activity.title === "Velika igra" ? "high" : index % 4 === 0 ? "normal" : "low",
        dueTime: activity.startTime,
        done: false,
        createdAt: "2026-06-01T08:00:00.000Z",
      })),
    );

  const groups: Group[] = [
    { id: "g-1", name: "Skupina 1", childrenCount: 12, leaderIds: ["u-ana"], assistantIds: ["u-tine"], notes: "Mlajši otroci, potrebujejo jasna navodila." },
    { id: "g-2", name: "Skupina 2", childrenCount: 13, leaderIds: ["u-jure"], assistantIds: ["u-nika"], notes: "Energična skupina, dobro delujejo kratke igre." },
    { id: "g-3", name: "Skupina 3", childrenCount: 14, leaderIds: ["u-luka"], assistantIds: ["u-ana"], notes: "Dva otroka potrebujeta dodatno pozornost." },
    { id: "g-4", name: "Skupina 4", childrenCount: 11, leaderIds: ["u-eva"], assistantIds: ["u-gasper"], notes: "Radi ustvarjajo, pripraviti dodaten material." },
  ];

  const messages: Message[] = [
    { id: "m-1", senderId: "u-maja", channel: "urgent", title: "NUJNO", text: "Velika igra se zaradi dežja lahko prestavi v telovadnico. Voditelji postaj pridite ob 13:40 k telovadnici.", priority: "urgent", createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), seenBy: ["u-luka", "u-ana"], relatedActivityId: "day-2-a-9", requireSeenConfirmation: true },
    { id: "m-2", senderId: "u-luka", channel: "announcements", title: "Malica", text: "Danes pri malici najprej dobijo najmlajše skupine. Prosimo za miren prehod.", priority: "normal", createdAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(), seenBy: [], requireSeenConfirmation: false },
    { id: "m-3", senderId: "u-ziga", channel: "team", title: "Igrica", text: "Kdo ima rezervni mikrofon? Na odru manjka en kabel.", priority: "normal", createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), seenBy: [], requireSeenConfirmation: false },
  ];

  return { users, days, activities, tasks, messages, groups, notifications: [], rainPlanActive: false };
};
