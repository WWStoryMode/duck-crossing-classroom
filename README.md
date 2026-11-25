# Duck Crossing — Pedagogy & Game-Based Learning

A real-time classroom activity for a 15-minute microteaching session. Four table groups match game mechanics from the unfinished game *Duck Crossing* to two learning outcomes (A / B / Both / Neither). The teacher watches responses arrive, projects live results, and then reveals suggested matches to start discussion.

**Nothing is stored permanently.** All submissions live only in the memory of a single Node.js process. They disappear when the teacher resets the session or the server restarts. There is no database, no user accounts and no browser storage.

| URL | Who | What |
| --- | --- | --- |
| `/` | Students | Choose table → classify 6 cards → submit / revise |
| `/teacher` | Teacher (access code) | Live responses, justifications, lock, reveal, reset, demo mode, QR code |
| `/results` | Projector | One table at a time, bar charts, ←/→ keys to switch tables |
| `/present` | Teacher (projector) | 8-slide, 15-minute session deck with the join QR and live results built in |

Stack: React + TypeScript + Vite + Tailwind (client), Express + Socket.IO (server), one process.

---

## Run locally

Requires **Node 18.18+** (Node 20 recommended; `.nvmrc` included).

```bash
nvm use            # or install Node 20
npm install
```

**Development** (hot reload):

```bash
TEACHER_CODE=duck npm run dev
```

- App: http://localhost:5180 (Vite; proxies the API and WebSocket to the server on :3000)
- Phones on the same Wi-Fi can use `http://<your-laptop-IP>:5180`

**Production-style** (one process, which is what you deploy):

```bash
npm run build
TEACHER_CODE=duck npm start      # http://localhost:3000
```

If `TEACHER_CODE` is not set, the server prints a random code to its log at startup.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `TEACHER_CODE` | Access code for `/teacher`. Checked on the server. **Set this.** |
| `PORT` | Port to listen on (most hosts set it for you). Default `3000`. |
| `PUBLIC_URL` | Optional. The URL students should open, used for the QR code. Defaults to the address in the teacher's browser. |

---

## Deploy to a Node.js host

The app keeps shared state in memory and uses WebSockets, so it **must run as one long-running Node process with exactly one instance**.

✅ Works: Render (Web Service), Railway, Fly.io, a VPS, or any host that runs `npm start` persistently.
❌ Won't work: Vercel / Netlify functions, AWS Lambda, Cloudflare Workers, static-only hosting, or any setup with more than one instance (each instance would have its own separate memory).

Settings for any host:

| Setting | Value |
| --- | --- |
| Build command | `npm install --include=dev && npm run build` |
| Start command | `npm start` |
| Node version | 20 |
| Instances | **1** (disable autoscaling) |
| Env vars | `TEACHER_CODE=<something only you know>` |

**Render:** New → Web Service → connect the repo → use the build/start commands above → set Instance Count to 1 → add `TEACHER_CODE`. Free instances go to sleep when idle, so open the site a few minutes before class to wake it up. Waking up starts the server fresh with no data, which is fine here.

**Railway:** New project → deploy from repo → add `TEACHER_CODE` under Variables → Settings → Networking → Generate Domain. Keep replicas at 1.

**Fly.io:** `fly launch` (choose 1 machine, no database), `fly secrets set TEACHER_CODE=...`, `fly deploy`. Set `min_machines_running = 1` so the machine doesn't stop mid-lesson.

Health check endpoint: `GET /api/health`.

---

## Classroom flow (≈15 min)

1. **Before class:** open `/teacher`, log in, then press **Reset session** to start clean. Open `/results` on the projector.
2. **Join (1 min):** students scan the QR code on the teacher page (or type the URL), pick their table and optionally enter a group name.
3. **Activity (6–8 min):** groups classify their six cards, pick one debatable card, and submit. They can revise and resubmit, and each revision replaces their earlier answers rather than adding a new response. The projector updates live.
4. **Lock:** press **Lock submissions** when time is up.
5. **Reveal (5 min):** press **Reveal suggested answers**. The projector highlights the suggested answer (✓) and any defensible alternatives (◐) and shows a short explanation for each card. Students see their own evaluations: *Matches suggested answer* / *Open for discussion* / *Reconsider*. Use **Next table →** to work through tables 1–4.

### Presenting with the slide deck (`/present`)

`/present` is a static HTML deck (`public/present.html`) that runs the whole 15-minute session. You can also open it from the teacher dashboard with **Open presentation ↗**.

- **Navigation:** ←/→, Space, or PgUp/PgDn change slides. Home/End jump to the first/last slide. **O** opens the slide overview, and **Fullscreen** is for the projector.
- **Timers:** **Start timer** runs the 15-minute session clock. Slide 5 has its own 4-minute activity countdown.
- **Slide 5:** shows the student join QR code. It uses `PUBLIC_URL` (from `/api/join-url`) if set, otherwise the deck's own address.
- **Slide 6:** embeds the live `/results` view. **Teacher controls** opens `/teacher` in a side drawer, where you log in with the teacher code to lock submissions and reveal answers without leaving the deck.
- **Notes:** **N** toggles presenter notes. They appear **on the projected screen**, so hide them before facing the class.

The deck stores nothing; it only displays pages from the same server.

### Testing with demo mode

On `/teacher`, **Add demo responses** adds one simulated response for each table. Demo responses are labelled **DEMO** in the teacher view, appear as hatched bar segments on the projector, and are counted separately from real groups. **Clear demo responses** removes only the demo responses. **Reset session** removes everything. Use demo mode to try reveal and the projector view before class.

---

## How it handles real-classroom problems

- **Double clicks / flaky Wi-Fi:** the submit button is disabled while a request is in progress. Each open page also sends a random key with its first submission, so if a request is retried, the server updates the existing response instead of creating a duplicate.
- **Revisions:** the server issues a submission ID, which the page keeps in memory only. Resubmitting updates that same record.
- **Refresh:** a refresh loses the ID. The activity page warns that submitting again will count as a **new response**.
- **Reset while students are working:** students keep their selected answers and are told that their next submission will count as a new response.
- **Disconnections:** Socket.IO reconnects automatically. Every reconnecting page gets the current state from server memory, and the teacher page logs back in automatically with its in-memory token.
- **Privacy of answers:** the answer key exists only on the server and is sent to browsers only after the teacher reveals it. Group names and written justifications are sent only to authenticated teacher connections.

## Project layout

```
shared/   content.ts (cards & outcomes), types.ts, evaluate.ts
server/   index.ts (Express + Socket.IO), state.ts (in-memory session), answerKey.ts, demo.ts
src/      pages/ Landing, Activity, Teacher, Results · components/ · socket.ts
```

To edit card text, change `shared/content.ts`. To edit suggested answers or explanations, change `server/answerKey.ts`. Students can never edit either.

> Suggested classifications are pedagogical interpretations, not scientifically established correct answers.
