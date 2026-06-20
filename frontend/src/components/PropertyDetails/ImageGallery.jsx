export default function ImageGallery() {
  return (
    <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6">
      <div className="h-72 rounded-3xl bg-slate-200" />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-3xl bg-slate-100" />
        <div className="h-24 rounded-3xl bg-slate-100" />
        <div className="h-24 rounded-3xl bg-slate-100" />
      </div>
    </div>
  );
}
