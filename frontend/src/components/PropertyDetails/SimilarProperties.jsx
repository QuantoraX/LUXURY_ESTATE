import PropertyCard from '../Properties/PropertyCard';

export default function SimilarProperties() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Similar Properties</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <PropertyCard />
        <PropertyCard />
        <PropertyCard />
      </div>
    </section>
  );
}
