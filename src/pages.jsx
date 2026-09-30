import { useEffect, useState } from 'react';
import { api, qs, today } from './api';
import { Sel, Filters, Table } from './components';

const empty = { from: '', to: '', baseId: '', typeId: '' };
const myBases = (user, bases) => (user.role === 'ADMIN' ? bases : bases.filter((b) => b.id === user.baseId));
const ts = (s) => (s ? s.replace('T', ' ').slice(0, 19) : '');

/* ---------------- Dashboard ---------------- */
export function Dashboard({ user, bases, types }) {
  const [f, setF] = useState(empty);
  const [d, setD] = useState(null);
  const [detail, setDetail] = useState(null);
  useEffect(() => { api('/dashboard' + qs(f)).then(setD).catch(() => {}); }, [f]);
  const open = () => api('/dashboard/net-movement' + qs(f)).then(setDetail);

  const cards = d ? [
    ['Opening Balance', d.openingBalance], ['Net Movement', d.netMovement, true],
    ['Closing Balance', d.closingBalance], ['Assigned', d.assigned], ['Expended', d.expended],
  ] : [];
  return (
    <>
      <h2>Dashboard</h2>
      <Filters f={f} setF={setF} bases={bases} types={types} user={user} />
      <div className="cards">
        {cards.map(([label, v, click]) => (
          <div key={label} className={'card' + (click ? ' clickable' : '')} onClick={click ? open : undefined}>
            <span>{label}</span><b>{v}</b>{click && <small>click for details</small>}
          </div>
        ))}
      </div>
      {detail && (
        <div className="modal" onClick={() => setDetail(null)}>
          <div className="modal-body" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setDetail(null)}>✕</button>
            <h3>Net Movement = Purchases + Transfers In − Transfers Out</h3>
            <h4>Purchases ({d.purchases})</h4>
            <Table rows={detail.purchases} cols={[['Date', (r) => r.eventDate], ['Base', (r) => r.base.name], ['Equipment', (r) => r.equipment.name], ['Qty', (r) => r.quantity]]} />
            <h4>Transfers In ({d.transferIn})</h4>
            <Table rows={detail.transfersIn} cols={[['Date', (r) => r.eventDate], ['From', (r) => r.fromBase.name], ['To', (r) => r.toBase.name], ['Equipment', (r) => r.equipment.name], ['Qty', (r) => r.quantity]]} />
            <h4>Transfers Out ({d.transferOut})</h4>
            <Table rows={detail.transfersOut} cols={[['Date', (r) => r.eventDate], ['From', (r) => r.fromBase.name], ['To', (r) => r.toBase.name], ['Equipment', (r) => r.equipment.name], ['Qty', (r) => r.quantity]]} />
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- shared page shell: form + filtered history ---------------- */
function useList(path, f) {
  const [rows, setRows] = useState([]);
  const load = () => api(path + qs(f)).then(setRows).catch(() => {});
  useEffect(() => { load(); }, [f]);
  return [rows, load];
}
function useSubmit(path, body, reload) {
  const [msg, setMsg] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    try { await api(path, { method: 'POST', body }); setMsg({ ok: true, t: 'Saved successfully' }); reload(); }
    catch (x) { setMsg({ ok: false, t: x.message }); }
  };
  return [msg, submit];
}
const Msg = ({ m }) => (m ? <p className={m.ok ? 'ok' : 'err'}>{m.t}</p> : null);
const num = (v) => (v === '' ? null : +v);

/* ---------------- Purchases ---------------- */
export function Purchases({ user, bases, types }) {
  const [f, setF] = useState(empty);
  const [rows, load] = useList('/purchases', f);
  const [form, setForm] = useState({ baseId: user.baseId ?? '', equipmentId: '', quantity: '', date: today() });
  const set = (k) => (v) => setForm({ ...form, [k]: v && v.target ? v.target.value : v });
  const [msg, submit] = useSubmit('/purchases', { ...form, baseId: num(form.baseId), equipmentId: num(form.equipmentId), quantity: +form.quantity }, load);
  return (
    <>
      <h2>Purchases</h2>
      <form className="form" onSubmit={submit}>
        <Sel required label="Base" value={form.baseId} onChange={set('baseId')} items={myBases(user, bases)} />
        <Sel required label="Equipment" value={form.equipmentId} onChange={set('equipmentId')} items={types} />
        <label>Quantity<input required type="number" min="1" value={form.quantity} onChange={set('quantity')} /></label>
        <label>Date<input required type="date" value={form.date} onChange={set('date')} /></label>
        <button>Record purchase</button>
      </form>
      <Msg m={msg} />
      <h3>History</h3>
      <Filters f={f} setF={setF} bases={bases} types={types} user={user} />
      <Table rows={rows} cols={[['Date', (r) => r.eventDate], ['Base', (r) => r.base.name], ['Equipment', (r) => r.equipment.name], ['Qty', (r) => r.quantity], ['By', (r) => r.createdBy]]} />
    </>
  );
}

/* ---------------- Transfers ---------------- */
export function Transfers({ user, bases, types }) {
  const [f, setF] = useState(empty);
  const [rows, load] = useList('/transfers', f);
  const [form, setForm] = useState({ fromBaseId: user.baseId ?? '', toBaseId: '', equipmentId: '', quantity: '', date: today() });
  const set = (k) => (v) => setForm({ ...form, [k]: v && v.target ? v.target.value : v });
  const [msg, submit] = useSubmit('/transfers', { ...form, fromBaseId: num(form.fromBaseId), toBaseId: num(form.toBaseId), equipmentId: num(form.equipmentId), quantity: +form.quantity }, load);
  return (
    <>
      <h2>Transfers</h2>
      <form className="form" onSubmit={submit}>
        <Sel required label="From base" value={form.fromBaseId} onChange={set('fromBaseId')} items={myBases(user, bases)} />
        <Sel required label="To base" value={form.toBaseId} onChange={set('toBaseId')} items={bases.filter((b) => String(b.id) !== String(form.fromBaseId))} />
        <Sel required label="Equipment" value={form.equipmentId} onChange={set('equipmentId')} items={types} />
        <label>Quantity<input required type="number" min="1" value={form.quantity} onChange={set('quantity')} /></label>
        <label>Date<input required type="date" value={form.date} onChange={set('date')} /></label>
        <button>Transfer</button>
      </form>
      <Msg m={msg} />
      <h3>Transfer history</h3>
      <Filters f={f} setF={setF} bases={bases} types={types} user={user} />
      <Table rows={rows} cols={[['Timestamp', (r) => ts(r.createdAt)], ['Date', (r) => r.eventDate], ['From', (r) => r.fromBase.name], ['To', (r) => r.toBase.name], ['Equipment', (r) => r.equipment.name], ['Qty', (r) => r.quantity], ['By', (r) => r.createdBy]]} />
    </>
  );
}

/* ---------------- Assignments & Expenditures ---------------- */
export function Assignments({ user, bases, types }) {
  const [f, setF] = useState(empty);
  const [rows, load] = useList('/assignments', f);
  const [form, setForm] = useState({ baseId: user.baseId ?? '', equipmentId: '', personnel: '', quantity: '', kind: 'ASSIGNED', date: today() });
  const set = (k) => (v) => setForm({ ...form, [k]: v && v.target ? v.target.value : v });
  const [msg, submit] = useSubmit('/assignments', { ...form, baseId: num(form.baseId), equipmentId: num(form.equipmentId), quantity: +form.quantity }, load);
  return (
    <>
      <h2>Assignments &amp; Expenditures</h2>
      <form className="form" onSubmit={submit}>
        <Sel required label="Base" value={form.baseId} onChange={set('baseId')} items={myBases(user, bases)} />
        <Sel required label="Equipment" value={form.equipmentId} onChange={set('equipmentId')} items={types} />
        <label>Type
          <select value={form.kind} onChange={set('kind')}><option value="ASSIGNED">Assign to personnel</option><option value="EXPENDED">Expended</option></select>
        </label>
        <label>Personnel{form.kind === 'EXPENDED' ? ' (optional)' : ''}<input required={form.kind === 'ASSIGNED'} value={form.personnel} onChange={set('personnel')} /></label>
        <label>Quantity<input required type="number" min="1" value={form.quantity} onChange={set('quantity')} /></label>
        <label>Date<input required type="date" value={form.date} onChange={set('date')} /></label>
        <button>Save</button>
      </form>
      <Msg m={msg} />
      <h3>History</h3>
      <Filters f={f} setF={setF} bases={bases} types={types} user={user} />
      <Table rows={rows} cols={[['Date', (r) => r.eventDate], ['Base', (r) => r.base.name], ['Equipment', (r) => r.equipment.name], ['Type', (r) => r.kind], ['Personnel', (r) => r.personnel], ['Qty', (r) => r.quantity], ['By', (r) => r.createdBy]]} />
    </>
  );
}

/* ---------------- Audit log (admin) ---------------- */
export function Logs() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api('/audit-logs').then(setRows).catch(() => {}); }, []);
  return (
    <>
      <h2>API Audit Log</h2>
      <Table rows={rows} cols={[['Time', (r) => ts(r.createdAt)], ['User', (r) => r.username], ['Method', (r) => r.method], ['Path', (r) => r.path], ['Status', (r) => r.status]]} />
    </>
  );
}
