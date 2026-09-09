export default function FormField({ label, error, hint, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label>{label}</label>
      {children}
      {error ? <span className="error-text">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}
