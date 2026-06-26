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
