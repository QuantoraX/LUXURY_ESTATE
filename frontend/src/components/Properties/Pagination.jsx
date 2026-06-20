export default function Pagination() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
      <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600">Previous</button>
      <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600">1</button>
      <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600">2</button>
      <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600">Next</button>
    </div>
  );
}
