import express from 'express';
import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { Server, type Socket } from 'socket.io';
import type { SubmitPayload, SubmitResult, TeacherResult } from '../shared/types';
import * as state from './state';
import { addDemoRound } from './demo';

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL?.trim() || '';
const TEACHER_CODE = process.env.TEACHER_CODE?.trim() || randomBytes(3).toString('hex');
if (!process.env.TEACHER_CODE?.trim()) {
  console.warn(`[duck-crossing] TEACHER_CODE not set. Using a random code for this run: ${TEACHER_CODE}`);
}

/** Teacher session tokens (memory only; a server restart logs the teacher out). */
const teacherTokens = new Set<string>();

const sha = (s: string) => createHash('sha256').update(s).digest();
const codeMatches = (attempt: unknown) =>
  typeof attempt === 'string' && timingSafeEqual(sha(attempt.trim()), sha(TEACHER_CODE));

const app = express();
app.disable('x-powered-by');
const httpServer = createServer(app);
const io = new Server(httpServer, { maxHttpBufferSize: 32_000 });

app.get('/api/health', (_req, res) => res.json({ ok: true }));
// Used by the presentation's join QR (slide 5). null → the deck falls back to its own origin.
app.get('/api/join-url', (_req, res) => res.json({ url: PUBLIC_URL || null }));

// Serve the built frontend in production.
const clientDir = path.resolve(process.cwd(), 'dist/client');
if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir, { index: false }));
  app.get('/present', (_req, res) => res.sendFile(path.join(clientDir, 'present.html')));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDir, 'index.html')));
} else {
  app.get('/', (_req, res) =>
    res.type('text').send('Frontend not built. In development open http://localhost:5180, or run `npm run build`.'),
  );
}

function broadcast() {
  io.emit('state', state.publicState());
  io.to('teacher').emit('teacher:submissions', state.allSubmissions());
}

function onTeacher<A>(socket: Socket, event: string, handler: (arg: A) => void) {
  socket.on(event, (arg: A, ack?: (r: TeacherResult) => void) => {
    if (!socket.data.teacher) return ack?.({ ok: false, error: 'Not authorised. Please log in again.' });
    handler(arg);
    broadcast();
    ack?.({ ok: true });
  });
}

io.on('connection', (socket) => {
  // Every (re)connection resyncs from current server memory.
  socket.emit('state', state.publicState());

  socket.on('submit', (payload: Partial<SubmitPayload>, ack?: (r: SubmitResult) => void) => {
    const result = state.submit(payload);
    ack?.(result);
    if (result.ok) broadcast();
  });

  socket.on('teacher:auth', (arg: { code?: string; token?: string }, ack?: (r: TeacherResult<{ token: string; publicUrl: string }>) => void) => {
    let token = '';
    if (arg?.token && teacherTokens.has(arg.token)) token = arg.token;
    else if (codeMatches(arg?.code)) {
      token = randomBytes(24).toString('hex');
      teacherTokens.add(token);
    }
    if (!token) return ack?.({ ok: false, error: 'Incorrect access code.' });
    socket.data.teacher = true;
    socket.join('teacher');
    ack?.({ ok: true, token, publicUrl: PUBLIC_URL });
    socket.emit('teacher:submissions', state.allSubmissions());
  });

  onTeacher<boolean>(socket, 'teacher:lock', (v) => state.setLocked(!!v));
  onTeacher<boolean>(socket, 'teacher:reveal', (v) => state.setRevealed(!!v));
  onTeacher(socket, 'teacher:reset', () => state.resetSession());
  onTeacher(socket, 'teacher:demo:add', () => addDemoRound());
  onTeacher(socket, 'teacher:demo:clear', () => state.clearDemo());
});

httpServer.listen(PORT, () => {
  console.log(`[duck-crossing] Listening on http://localhost:${PORT}`);
});
