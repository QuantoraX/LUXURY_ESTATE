export default function PropertyInfo() {
  return (
    <aside className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
      <h2 className="text-2xl font-semibold">Property Details</h2>
      <p className="mt-4 text-slate-600">A beautiful home with modern amenities, spacious rooms, and excellent natural light.</p>
      <div className="mt-6 space-y-3 text-slate-700">
        <div className="flex justify-between border-b border-slate-200 pb-3">
          <span>Price</span>
          <span className="font-semibold">$680,000</span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-3">
          <span>Bedrooms</span>
          <span>4</span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-3">
          <span>Bathrooms</span>
          <span>3</span>
        </div>
        <div className="flex justify-between pb-3">
          <span>Square Feet</span>
          <span>2,450 sqft</span>
        </div>
      </div>
    </aside>
  );
}
