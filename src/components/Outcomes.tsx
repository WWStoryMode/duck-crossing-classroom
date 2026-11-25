import type { TableContent } from '../../shared/types';

export default function Outcomes({ table, large = false }: { table: TableContent; large?: boolean }) {
  const text = large ? 'text-xl lg:text-2xl' : 'text-base';
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border-l-8 border-sage bg-sage-light p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-sage-dark">Learning Outcome A</p>
        <p className={`mt-1 font-bold ${text}`}>{table.outcomeA}</p>
      </div>
      <div className="rounded-2xl border-l-8 border-mustard bg-mustard-light p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-mustard-dark">Learning Outcome B</p>
        <p className={`mt-1 font-bold ${text}`}>{table.outcomeB}</p>
      </div>
    </div>
  );
}
