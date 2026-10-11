// Shared layout for the login and register pages: a shelf of book spines + the form
const spines = [
  ['#b8862b', 120, 22], ['#f4f5f2', 150, 16], ['#7fa393', 105, 26], ['#b3372c', 140, 18],
  ['#f4f5f2', 115, 20], ['#d9b873', 160, 24], ['#7fa393', 130, 16], ['#f4f5f2', 100, 28], ['#b8862b', 145, 18],
];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-wrap">
      <aside className="auth-art">
        <div className="shelf" aria-hidden="true">
          {spines.map(([c, h, w], i) => (
            <span key={i} className="spine" style={{ background: c, height: h, width: w, opacity: 0.92 }} />
          ))}
        </div>
        <h1>Find it. Borrow it. Return it.</h1>
        <p>Search the catalog, keep track of your loans, and see what is due next.</p>
      </aside>
      <main className="auth-form">{children}</main>
    </div>
  );
}
