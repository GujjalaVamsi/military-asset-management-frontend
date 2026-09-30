import { useEffect, useState } from 'react';
import { api } from './api';
import { Dashboard, Purchases, Transfers, Assignments, Logs } from './pages.jsx';

function getStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && typeof user.username === 'string' && typeof user.role === 'string') return user;
  } catch {}
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  return null;
}

function Login({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api('/auth/login', { method: 'POST', body: { username: u, password: p } });
      localStorage.setItem('token', r.token);
      localStorage.setItem('user', JSON.stringify(r));
      onLogin(r);
    } catch (x) { setErr(x.message); }
  };
  return (
    <form className="login" onSubmit={submit}>
      <h1>Military Asset Management</h1>
      <input placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} required />
      <input placeholder="Password" type="password" value={p} onChange={(e) => setP(e.target.value)} required />
      <button>Sign in</button>
      {err && <p className="err">{err}</p>}
    </form>
  );
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [page, setPage] = useState('Dashboard');
  const [bases, setBases] = useState([]);
  const [types, setTypes] = useState([]);
  useEffect(() => {
    if (!user) return;
    api('/bases').then(setBases).catch(() => {});
    api('/equipment-types').then(setTypes).catch(() => {});
  }, [user]);

  if (!user) return <Login onLogin={setUser} />;

  // Menu items per role (server enforces the same rules)
  const canAssign = user.role !== 'LOGISTICS_OFFICER';
  const tabs = ['Dashboard', 'Purchases', 'Transfers', ...(canAssign ? ['Assignments'] : []), ...(user.role === 'ADMIN' ? ['Logs'] : [])];
  const props = { user, bases, types };
  const logout = () => { localStorage.clear(); setUser(null); };

  return (
    <>
      <header>
        <b>MAMS</b>
        <nav>{tabs.map((t) => <button key={t} className={t === page ? 'active' : ''} onClick={() => setPage(t)}>{t}</button>)}</nav>
        <span className="who">{user.username} · {user.role.replace('_', ' ')} · {user.baseName}</span>
        <button onClick={logout}>Logout</button>
      </header>
      <main>
        {page === 'Dashboard' && <Dashboard {...props} />}
        {page === 'Purchases' && <Purchases {...props} />}
        {page === 'Transfers' && <Transfers {...props} />}
        {page === 'Assignments' && canAssign && <Assignments {...props} />}
        {page === 'Logs' && user.role === 'ADMIN' && <Logs />}
      </main>
    </>
  );
}
