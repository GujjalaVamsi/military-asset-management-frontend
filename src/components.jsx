export const Sel = ({ label, value, onChange, items, blank, required }) => (
  <label>{label}
    <select required={required} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{blank || 'Select…'}</option>
      {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
    </select>
  </label>
);

export function Filters({ f, setF, bases, types, user }) {
  const set = (k) => (v) => setF({ ...f, [k]: v && v.target ? v.target.value : v });
  return (
    <div className="filters">
      <label>From<input type="date" value={f.from} onChange={set('from')} /></label>
      <label>To<input type="date" value={f.to} onChange={set('to')} /></label>
      {user.role === 'ADMIN' && <Sel label="Base" blank="All bases" value={f.baseId} onChange={set('baseId')} items={bases} />}
      <Sel label="Equipment" blank="All types" value={f.typeId} onChange={set('typeId')} items={types} />
    </div>
  );
}

export const Table = ({ cols, rows }) => (
  <div className="scroll">
    <table>
      <thead><tr>{cols.map((c) => <th key={c[0]}>{c[0]}</th>)}</tr></thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan={cols.length} className="muted">No records</td></tr>}
        {rows.map((r, i) => <tr key={r.id ?? i}>{cols.map((c) => <td key={c[0]}>{c[1](r)}</td>)}</tr>)}
      </tbody>
    </table>
  </div>
);
