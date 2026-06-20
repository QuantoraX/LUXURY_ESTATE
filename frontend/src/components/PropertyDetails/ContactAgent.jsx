import Button from '../common/Button';

export default function ContactAgent() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Contact the Agent</h2>
          <p className="text-slate-600">Get in touch to schedule a viewing or ask questions.</p>
        </div>
        <Button>Send Message</Button>
      </header>
    </section>
  );
}
