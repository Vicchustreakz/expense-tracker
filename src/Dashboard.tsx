import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { catOf, accOf, TS } from "./data";
import { TxHelper, Format, chartAxis } from "./helpers";
import { GlassCard, Segmented, CategoryIcon } from "./components";
import type { Tx } from "./types";
const select = "rounded-xl border border-line bg-card/60 px-2 py-1 text-xs";
export default function Dashboard({
  tx,
  y,
  m,
  onAll,
  carried,
  salary,
  name,
}: {
  tx: Tx[];
  y: number;
  m: number;
  onAll: () => void;
  carried: number;
  salary: number;
  name: string;
}) {
  const [kind, setKind] = useState<"expense" | "income">("expense"),
    [wk, setWk] = useState(0),
    [view, setView] = useState<"bar" | "line">("bar");
  const expenses = TxHelper.ofType(tx, "expense"),
    incomes = TxHelper.ofType(tx, "income");
  const spent = TxHelper.sumAmounts(expenses),
    earned = TxHelper.sumAmounts(incomes) + salary,
    balance = carried + earned - spent;
  const spentPct = Format.percent(spent, earned),
    savedPct = Math.max(0, 100 - spentPct);
  const days = TxHelper.daysIn(y, m),
    weeks = Math.ceil(days / 7),
    w = Math.min(wk, weeks - 1);
  const week = TxHelper.dailyTotals(tx, w * 7 + 1, Math.min(days, w * 7 + 7)),
    flow = TxHelper.runningBalance(tx, carried + salary, days);
  const source = kind === "expense" ? expenses : incomes,
    sourceTotal = TxHelper.sumAmounts(source),
    top = TxHelper.byCategory(source).slice(0, 5);
  const rings = [
    { name: "Income", v: earned ? 100 : 0, fill: "var(--green)" },
    { name: "Spent", v: Math.min(spentPct, 100), fill: "var(--red)" },
    {
      name: "Saved",
      v: Math.min(Math.max(Format.percent(balance, earned), 0), 100),
      fill: "var(--accent)",
    },
  ];
  return (
    <div>
      <section className="mb-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {Format.greeting()}, {name}.
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          A clear view of your balance, where your money goes, and what changed
          this month.
        </p>
      </section>
      <div className="grid gap-4 lg:grid-cols-12">
        <GlassCard className="lg:col-span-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-muted">Net balance</h3>
            <span
              className={`rounded-full bg-line/40 px-2 py-0.5 text-xs ${Format.tone(balance)}`}
            >
              {savedPct}% saved
            </span>
          </div>
          <p className="mt-3 text-4xl font-semibold tracking-tight">
            {Format.amount(balance)}
          </p>
          <p className="text-sm text-muted">
            {tx.length} transactions this month
          </p>
          <div className="mt-3 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flow}>
                <Tooltip
                  contentStyle={TS}
                  formatter={(v: any) => Format.amount(+v)}
                  labelFormatter={(d) => `Day ${d}`}
                />
                <Area
                  dataKey="balance"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="lg:col-span-4">
          <h3 className="text-sm text-muted">Income vs spending</h3>
          <div className="mt-2 flex items-center justify-around gap-2">
            <div className="size-40">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  data={rings}
                  innerRadius="30%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                  />
                  <RadialBar dataKey="v" background cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                ["Income", Format.amount(earned), "var(--green)"],
                ["Spent", Format.amount(spent), "var(--red)"],
                ["Saved", Format.amount(balance), "var(--accent)"],
              ].map(([n, v, c]) => (
                <li key={n} className="flex items-center gap-2">
                  <i
                    className="size-2.5 rounded-full"
                    style={{ background: c }}
                  />
                  <span className="text-muted">{n}</span>
                  <b>{v}</b>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
        <div
          className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg lg:col-span-4"
          style={{ background: "var(--grad)" }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-white/15 to-black/25" />
          <div className="relative flex h-full min-h-40 flex-col justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold leading-tight">
                {spent > earned
                  ? "Spending is ahead of income."
                  : `You kept ${savedPct}% of your income.`}
              </h3>
              <p className="mt-2 text-sm text-white/80">
                You have spent {Format.amount(spent)} of {Format.amount(earned)}{" "}
                earned this month.
              </p>
            </div>
            <button
              onClick={onAll}
              className="self-start rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900"
            >
              View transactions
            </button>
          </div>
        </div>
        <GlassCard className="lg:col-span-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium">Where your money goes</h3>
            <Segmented
              value={kind}
              onChange={setKind}
              options={[
                ["expense", "Spent"],
                ["income", "Earned"],
              ]}
            />
          </div>
          <p className="mb-3 text-xs text-muted">
            {Format.amount(sourceTotal)} this period
          </p>
          {top.length === 0 && (
            <p className="text-sm text-muted">
              Nothing recorded yet. Add an entry to see the breakdown.
            </p>
          )}
          <ul className="space-y-4">
            {top.map(({ id, total }) => {
              const c = catOf(id),
                pct = Format.percent(total, sourceTotal);
              return (
                <li key={id} className="flex items-center gap-3">
                  <CategoryIcon id={id} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">{c.name}</span>
                      <b>{Format.amount(total)}</b>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="flex flex-1 gap-0.5" aria-hidden>
                        {Array.from({ length: 10 }, (_, i) => (
                          <span
                            key={i}
                            className={`h-2 flex-1 rounded-sm ${i < Math.round(pct / 10) ? "" : "opacity-20"}`}
                            style={{ background: c.color }}
                          />
                        ))}
                      </span>
                      <small className="w-9 text-right text-muted">
                        {pct}%
                      </small>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassCard>
        <GlassCard className="lg:col-span-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium">Statistics</h3>
            <span className="flex items-center gap-2">
              <select
                aria-label="Week"
                className={select}
                value={w}
                onChange={(e) => setWk(+e.target.value)}
              >
                {Array.from({ length: weeks }, (_, i) => (
                  <option key={i} value={i}>
                    Week {i + 1}
                  </option>
                ))}
              </select>
              <Segmented
                value={view}
                onChange={setView}
                options={[
                  ["bar", "Bar"],
                  ["line", "Line"],
                ]}
              />
            </span>
          </div>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              {view === "line" ? (
                <AreaChart data={week}>
                  <XAxis dataKey="day" {...chartAxis} />
                  <YAxis {...chartAxis} width={36} />
                  <Tooltip contentStyle={TS} />
                  <Area
                    dataKey="expense"
                    stroke="var(--red)"
                    fill="var(--red)"
                    fillOpacity={0.25}
                  />
                  <Area
                    dataKey="income"
                    stroke="var(--green)"
                    fill="var(--green)"
                    fillOpacity={0.25}
                  />
                </AreaChart>
              ) : (
                <BarChart data={week}>
                  <XAxis dataKey="day" {...chartAxis} />
                  <YAxis {...chartAxis} width={36} />
                  <Tooltip contentStyle={TS} cursor={{ fill: "var(--line)" }} />
                  <Bar
                    dataKey="expense"
                    fill="var(--red)"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="income"
                    fill="var(--green)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="lg:col-span-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium">Recent activity</h3>
            <button onClick={onAll} className="text-sm text-accent">
              View all
            </button>
          </div>
          {tx.length === 0 && (
            <p className="text-sm text-muted">
              No entries yet. Use Add new to create one.
            </p>
          )}
          <ul className="divide-y divide-line">
            {TxHelper.latest(tx, 5).map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <CategoryIcon id={t.categoryId} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {catOf(t.categoryId).name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {accOf(t.accountId).name}
                  </p>
                </div>
                <b className={`text-sm ${Format.toneOf(t)}`}>
                  {Format.signedAmount(t)}
                </b>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
