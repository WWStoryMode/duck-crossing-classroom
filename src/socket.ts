import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import type { PublicState } from '../shared/types';

/** One shared connection per page. Socket.IO reconnects automatically after drops. */
export const socket = io({ transports: ['websocket', 'polling'] });

let latest: PublicState | null = null;
const listeners = new Set<(s: PublicState) => void>();
socket.on('state', (s: PublicState) => {
  latest = s;
  listeners.forEach((l) => l(s));
});

/** Live public state, resynchronised from server memory on every (re)connect. */
export function useServerState() {
  const [state, setState] = useState<PublicState | null>(latest);
  useEffect(() => {
    listeners.add(setState);
    if (latest) setState(latest);
    return () => void listeners.delete(setState);
  }, []);
  return state;
}

export function useConnected() {
  const [connected, setConnected] = useState(socket.connected);
  useEffect(() => {
    const on = () => setConnected(true);
    const off = () => setConnected(false);
    socket.on('connect', on);
    socket.on('disconnect', off);
    return () => {
      socket.off('connect', on);
      socket.off('disconnect', off);
    };
  }, []);
  return connected;
}
