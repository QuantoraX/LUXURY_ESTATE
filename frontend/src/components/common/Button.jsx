export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
