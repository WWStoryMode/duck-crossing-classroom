import { useConnected } from '../socket';

export default function ConnectionDot() {
  const connected = useConnected();
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm font-bold">
      <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-sage' : 'animate-pulse bg-brick'}`} />
      {connected ? 'Live' : 'Reconnecting…'}
    </span>
  );
}
