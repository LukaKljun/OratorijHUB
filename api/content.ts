import { get, put } from "@vercel/blob";

const contentPath = "oratorij-hub/content.json";
const adminPassword = process.env.ORATORIJ_ADMIN_PASSWORD ?? "oratorij2008";

const defaultContent = {
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
    { id: "bus-1", name: "Bus 1", groups: "1., 2., 3. in 4. skupina", leader: "Ti", notes: "" },
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

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  Response.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });

export async function GET() {
  try {
    const blob = await get(contentPath, { access: "private" });

    if (!blob?.stream) {
      return jsonResponse(defaultContent);
    }

    return jsonResponse(await new Response(blob.stream).json());
  } catch {
    return jsonResponse(defaultContent);
  }
}

export async function POST(request: Request) {
  if (request.headers.get("x-admin-password") !== adminPassword) {
    return jsonResponse({ message: "Nimaš dovoljenja za shranjevanje." }, { status: 401 });
  }

  try {
    const content = await request.json();
    await put(contentPath, `${JSON.stringify(content, null, 2)}\n`, {
      access: "private",
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: "application/json; charset=utf-8",
    });

    return jsonResponse(content);
  } catch {
    return jsonResponse({ message: "Vercel Blob shranjevanje ni uspelo." }, { status: 500 });
  }
}
