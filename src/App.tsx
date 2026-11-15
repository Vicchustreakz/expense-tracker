import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Scale,
  Landmark,
  CalendarDays,
  Settings,
  Plus,
  LogOut,
  TrendingUp,
  History as HistoryIcon,
  ChevronsLeft,
  ChevronsRight,
  Menu,
} from "lucide-react";
import { auth, configured } from "./firebase";
import { useTx } from "./useTx";
import { accounts, catOf, accOf, GRADS } from "./data";
import { Format } from "./helpers";
import { NavItem, ThemeToggle, TabButton } from "./components";
import Transactions from "./Transactions";
import Dashboard from "./Dashboard";
import Balance from "./Balance";
import Calendar from "./Calendar";
import Categories from "./Categories";
import Accounts from "./Accounts";
import SettingsPage from "./Settings";
import Investments from "./Investments";
import History from "./History";
import Entry from "./Entry";
import { useMonth } from "./useMonth";
import { useCategories } from "./useCategories";
import { useAccounts } from "./useAccounts";
import { useSettings } from "./useSettings";
import { useHoldings } from "./useHoldings";
import { useHistory } from "./useHistory";
import { useUI } from "./ui";
import type { Tx } from "./types";
const NAV = [
  ["Dashboard", LayoutDashboard],
  ["Transactions", ArrowLeftRight],
  ["Categories", Tags],
  ["Balance", Scale],
  ["Accounts", Landmark],
  ["Investments", TrendingUp],
  ["Calendar", CalendarDays],
  ["History", HistoryIcon],
  ["Settings", Settings],
] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const PAGES_WITHOUT_PERIOD = ["Investments", "History", "Settings"];
const select =
  "min-w-0 flex-1 rounded-xl border border-line bg-card/60 px-3 py-2 text-sm backdrop-blur sm:flex-none";
export default function App() {
  const now = new Date(),
    { confirm, run } = useUI();
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(!configured);
  const [page, setPage] = useState("Dashboard"),
    [y, setY] = useState(now.getFullYear()),
    [m, setM] = useState(now.getMonth()),
    [acc, setAcc] = useState("");
  const [mode, setMode] = useState(localStorage.mode || "dark"),
    [accent, setAccent] = useState(localStorage.accent || "#6d5dfc"),
    [edit, setEdit] = useState<Partial<Tx> | null>(null);
  const [collapsed, setCollapsed] = useState(() =>
      localStorage.sb ? localStorage.sb === "1" : window.innerWidth <= 1100,
    ),
    [drawer, setDrawer] = useState(false);
  useEffect(() => {
    if (configured)
      return onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
      });
  }, []);
  const uid = user?.uid ?? null;
  const { tx, save, remove } = useTx(uid, y, m);
  const mo = useMonth(uid, y, m);
  const cs = useCategories(uid);
  const ac = useAccounts(uid);
  const st = useSettings(uid);
  const hd = useHoldings(uid);
  const hs = useHistory(uid);
  useEffect(() => {
    if (st.mode) setMode(st.mode);
    if (st.accent) setAccent(st.accent);
  }, [st.mode, st.accent]);
  useEffect(() => {
    const r = document.documentElement,
      g = GRADS[st.gradient || ""];
    r.dataset.theme = mode;
    r.style.setProperty("--accent", accent);
    if (g) {
      r.dataset.grad = "1";
      r.style.setProperty("--g1", g[0]);
      r.style.setProperty("--g2", g[1]);
      r.style.setProperty("--grad", `linear-gradient(135deg,${g[0]},${g[1]})`);
    } else {
      delete r.dataset.grad;
      r.style.removeProperty("--g1");
      r.style.removeProperty("--g2");
      r.style.setProperty("--grad", "var(--accent)");
    }
    localStorage.mode = mode;
    localStorage.accent = accent;
  }, [mode, accent, st.gradient]);
  const pickMode = (v: string) => {
      setMode(v);
      st.save({ mode: v });
    },
    pickAccent = (v: string) => {
      setAccent(v);
      st.save({ accent: v });
    };
  const go = (p: string) => {
    setPage(p);
    setDrawer(false);
  };
  const act = (
    kind: string,
    action: string,
    summary: string,
    f: () => Promise<any>,
  ) =>
    run(async () => {
      await f();
      hs.log(action, kind, summary);
    });
  const del = async (
    kind: string,
    name: string,
    f: () => Promise<any>,
    note = "",
  ) => {
    if (await confirm(`Delete "${name}"?${note}`))
      await act(kind, "deleted", name, f);
  };
  const label = (t: Partial<Tx>) =>
    `${catOf(t.categoryId || "").name} ${Format.amount(t.amount ?? 0)}`;
  if (!ready) return null;
  if (configured && !user)
    return (
      <div className="login">
        <div className="card">
          <h2>Expense Tracker</h2>
          <p className="muted">Sign in to sync your entries across devices.</p>
          <button
            className="btn"
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  const shown = acc ? tx.filter((t) => t.accountId === acc) : tx;
  const photo = st.photo || user?.photoURL,
    nm = st.name || user?.displayName;
  const screens: Record<string, JSX.Element> = {
    Dashboard: (
      <Dashboard
        tx={shown}
        y={y}
        m={m}
        name={nm?.split(" ")[0] || "there"}
        onAll={() => go("Transactions")}
        carried={acc ? 0 : mo.carried}
        salary={acc ? 0 : mo.salary}
      />
    ),
    Transactions: (
      <Transactions
        tx={shown}
        y={y}
        m={m}
        onEdit={setEdit}
        onDelete={(id) => {
          const t = tx.find((x) => x.id === id);
          if (t) del("entry", label(t), () => remove(id));
        }}
      />
    ),
    Categories: (
      <Categories
        cats={cs.cats}
        tx={shown}
        save={(c) =>
          act(
            "category",
            cs.cats.some((x) => x.id === c.id) ? "edited" : "added",
            c.name,
            () => cs.save(c),
          )
        }
        remove={(id) =>
          del(
            "category",
            catOf(id).name,
            () => cs.remove(id),
            " Its entries will show as Uncategorized.",
          )
        }
      />
    ),
    Balance: <Balance tx={tx} y={y} m={m} mo={mo} />,
    Accounts: (
      <Accounts
        accs={ac.accs}
        tx={tx}
        save={(a) =>
          act(
            "account",
            ac.accs.some((x) => x.id === a.id) ? "edited" : "added",
            a.name,
            () => ac.save(a),
          )
        }
        remove={(id) =>
          del(
            "account",
            accOf(id).name,
            async () => {
              await ac.remove(id);
              if (acc === id) setAcc("");
            },
            " Its entries will show as Deleted account.",
          )
        }
        onOpen={(id) => {
          setAcc(id);
          go("Transactions");
        }}
      />
    ),
    Investments: (
      <Investments
        list={hd.list}
        save={(h) =>
          act("investment", h.id ? "edited" : "added", h.name, () => hd.save(h))
        }
        remove={(id) => {
          const h = hd.list.find((x) => x.id === id);
          if (h) del("investment", h.name, () => hd.remove(id));
        }}
      />
    ),
    Calendar: (
      <Calendar
        tx={shown}
        y={y}
        m={m}
        onAdd={(d) => setEdit({ date: d })}
        onEdit={setEdit}
      />
    ),
    History: <History items={hs.items} />,
    Settings: (
      <SettingsPage
        st={st}
        save={st.save}
        mode={mode}
        accent={accent}
        onMode={pickMode}
        onAccent={pickAccent}
        user={user}
      />
    ),
  };
  return (
    <div className="app-bg flex min-h-screen text-fg">
      {drawer && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setDrawer(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-1 overflow-y-auto border-r border-line bg-card/70 p-3 backdrop-blur-xl transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 md:overflow-visible md:transition-[width] ${drawer ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "md:w-16" : "md:w-64"}`}
      >
        <button
          className={`icon mb-1 hidden md:grid ${collapsed ? "self-center" : "self-end"}`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() =>
            setCollapsed((c) => {
              localStorage.sb = c ? "0" : "1";
              return !c;
            })
          }
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
        <div className="my-2 flex flex-col items-center gap-2">
          {photo ? (
            <img
              src={photo}
              alt=""
              className={`rounded-full object-cover ${collapsed ? "size-16 md:size-9" : "size-16"}`}
            />
          ) : (
            <span
              className={`grid place-items-center rounded-full text-2xl text-white ${collapsed ? "size-16 md:size-9 md:text-sm" : "size-16"}`}
              style={{ background: "var(--grad)" }}
            >
              {(nm || "D")[0]}
            </span>
          )}
          <span
            className={`text-sm font-medium ${collapsed ? "md:hidden" : ""}`}
          >
            {nm || "Demo mode"}
          </span>
        </div>
        <button
          onClick={() => {
            setEdit({});
            setDrawer(false);
          }}
          aria-label="Add new"
          className={`mb-2 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white ${collapsed ? "md:px-0" : ""}`}
          style={{ background: "var(--grad)" }}
        >
          <Plus size={16} />
          <span className={collapsed ? "md:hidden" : ""}>Add new</span>
        </button>
        {NAV.map(([n, I]) => (
          <NavItem
            key={n}
            label={n}
            icon={I}
            active={page === n}
            collapsed={collapsed}
            onClick={() => go(n)}
          />
        ))}
        <div className="flex-1" />
        <ThemeToggle mode={mode} onChange={pickMode} collapsed={collapsed} />
        {user && (
          <NavItem
            label="Log out"
            icon={LogOut}
            collapsed={collapsed}
            onClick={() => signOut(auth)}
          />
        )}
      </aside>
      <main className="min-w-0 flex-1 p-4 pb-28 md:p-6 md:pb-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {page === "Dashboard" ? (
            <span />
          ) : (
            <h1 className="text-2xl font-semibold">
              {PAGES_WITHOUT_PERIOD.includes(page) ? page : "My " + page}
            </h1>
          )}
          {!PAGES_WITHOUT_PERIOD.includes(page) && (
            <div className="flex w-full gap-2 sm:w-auto">
              <select
                aria-label="Account"
                className={select}
                value={acc}
                onChange={(e) => setAcc(e.target.value)}
              >
                <option value="">All accounts</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Month"
                className={select}
                value={m}
                onChange={(e) => setM(+e.target.value)}
              >
                {MONTHS.map((n, i) => (
                  <option key={n} value={i}>
                    {n}
                  </option>
                ))}
              </select>
              <select
                aria-label="Year"
                className={select}
                value={y}
                onChange={(e) => setY(+e.target.value)}
              >
                {[y - 2, y - 1, y, y + 1].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
          )}
        </header>
        {screens[page]}
      </main>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 px-3 md:hidden"
        style={{ paddingBottom: "max(0.5rem,env(safe-area-inset-bottom))" }}
      >
        <div className="relative flex items-end rounded-3xl border border-line bg-card/80 px-2 pb-2 pt-3 shadow-xl backdrop-blur-xl">
          <TabButton
            label="Home"
            icon={LayoutDashboard}
            active={page === "Dashboard"}
            onClick={() => go("Dashboard")}
          />
          <TabButton
            label="Transactions"
            icon={ArrowLeftRight}
            active={page === "Transactions"}
            onClick={() => go("Transactions")}
          />
          <span className="w-16" />
          <TabButton
            label="Invest"
            icon={TrendingUp}
            active={page === "Investments"}
            onClick={() => go("Investments")}
          />
          <TabButton
            label="Menu"
            icon={Menu}
            active={drawer}
            onClick={() => setDrawer((d) => !d)}
          />
          <button
            aria-label="Add new"
            onClick={() => setEdit({})}
            className="absolute -top-6 left-1/2 grid size-14 -translate-x-1/2 place-items-center rounded-full text-white shadow-xl ring-4 ring-bg"
            style={{ background: "var(--grad)" }}
          >
            <Plus size={26} />
          </button>
        </div>
      </nav>
      {edit && (
        <Entry
          init={edit}
          onClose={() => setEdit(null)}
          onSave={async (t) => {
            await act("entry", t.id ? "edited" : "added", label(t), () =>
              save(t),
            );
            setEdit(null);
          }}
        />
      )}
    </div>
  );
}
