import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, X, CreditCard, Receipt, TrendingDown, TrendingUp, Coins, Check, PiggyBank, Wallet, Landmark, Pencil, Wallet2, Flame } from "lucide-react";

const PALETTE = {
  paper: "#EAF1F8",
  paperDark: "#DCE7F2",
  ink: "#132C4D",
  inkSoft: "#4F6E8F",
  burgundy: "#1B4B87",
  burgundySoft: "#BFD3EA",
  teal: "#1D7DA8",
  tealSoft: "#B8E1EE",
  gold: "#3F6FA8",
  goldSoft: "#CBDCEF",
  line: "#C2D3E3",
  marginRed: "#3D6FA5",
};

const CATEGORIAS = [
  { id: "comida", label: "Comida" },
  { id: "transporte", label: "Transporte" },
  { id: "vivienda", label: "Vivienda" },
  { id: "salud", label: "Salud" },
  { id: "entretenimiento", label: "Entretenimiento" },
  { id: "otros", label: "Otros" },
];

const FUENTES_INGRESO = [
  { id: "salario", label: "Salario" },
  { id: "freelance", label: "Freelance" },
  { id: "negocio", label: "Negocio" },
  { id: "inversiones", label: "Inversiones" },
  { id: "regalo", label: "Regalo" },
  { id: "otros", label: "Otros" },
];

function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
}

function fmt(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  useGoogleFonts();
  const [debts, setDebts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState([]);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [tab, setTab] = useState("deudas");
  const [loaded, setLoaded] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [error, setError] = useState("");

  // Load
  useEffect(() => {
    (async () => {
      try {
        const d = await window.storage.get("debts", false);
        if (d && d.value) setDebts(JSON.parse(d.value));
      } catch (e) {}
      try {
        const ex = await window.storage.get("expenses", false);
        if (ex && ex.value) setExpenses(JSON.parse(ex.value));
      } catch (e) {}
      try {
        const sv = await window.storage.get("savings", false);
        if (sv && sv.value) setSavings(JSON.parse(sv.value));
      } catch (e) {}
      try {
        const de = await window.storage.get("dailyExpenses", false);
        if (de && de.value) setDailyExpenses(JSON.parse(de.value));
      } catch (e) {}
      try {
        const inc = await window.storage.get("incomes", false);
        if (inc && inc.value) setIncomes(JSON.parse(inc.value));
      } catch (e) {}
      try {
        const g = await window.storage.get("savingsGoal", false);
        if (g && g.value) setSavingsGoal(JSON.parse(g.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  // Persist
  useEffect(() => {
    if (!loaded) return;
    window.storage.set("debts", JSON.stringify(debts), false).catch(() => setError("No se pudo guardar."));
  }, [debts, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set("expenses", JSON.stringify(expenses), false).catch(() => setError("No se pudo guardar."));
  }, [expenses, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set("savings", JSON.stringify(savings), false).catch(() => setError("No se pudo guardar."));
  }, [savings, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set("dailyExpenses", JSON.stringify(dailyExpenses), false).catch(() => setError("No se pudo guardar."));
  }, [dailyExpenses, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set("incomes", JSON.stringify(incomes), false).catch(() => setError("No se pudo guardar."));
  }, [incomes, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set("savingsGoal", JSON.stringify(savingsGoal), false).catch(() => setError("No se pudo guardar."));
  }, [savingsGoal, loaded]);

  const totalDeudaPendiente = useMemo(
    () => debts.reduce((s, d) => s + Math.max(0, d.total - d.paid), 0),
    [debts]
  );
  const totalPagadoDeudas = useMemo(() => debts.reduce((s, d) => s + d.paid, 0), [debts]);

  const mesActual = new Date().toISOString().slice(0, 7);
  const gastoMes = useMemo(
    () => expenses.filter((e) => e.date.slice(0, 7) === mesActual).reduce((s, e) => s + e.amount, 0),
    [expenses, mesActual]
  );

  const totalAhorrado = useMemo(() => savings.reduce((s, a) => s + a.amount, 0), [savings]);

  const ingresoMes = useMemo(
    () => incomes.filter((i) => i.date.slice(0, 7) === mesActual).reduce((s, i) => s + i.amount, 0),
    [incomes, mesActual]
  );
  const totalIngresos = useMemo(() => incomes.reduce((s, i) => s + i.amount, 0), [incomes]);

  const patrimonioNeto = totalAhorrado - totalDeudaPendiente;

  const hoy = todayISO();
  const totalHoy = useMemo(
    () => dailyExpenses.filter((e) => e.date === hoy).reduce((s, e) => s + e.amount, 0),
    [dailyExpenses, hoy]
  );
  const totalDiariosMes = useMemo(
    () => dailyExpenses.filter((e) => e.date.slice(0, 7) === mesActual).reduce((s, e) => s + e.amount, 0),
    [dailyExpenses, mesActual]
  );

  // --- Meta de ahorro anual y presupuesto diario ---
  const anoActual = mesActual.slice(0, 4);

  const ingresosAno = useMemo(
    () => incomes.filter((i) => i.date.slice(0, 4) === anoActual).reduce((s, i) => s + i.amount, 0),
    [incomes, anoActual]
  );
  const gastosFijosAno = useMemo(
    () => expenses.filter((e) => e.date.slice(0, 4) === anoActual).reduce((s, e) => s + e.amount, 0),
    [expenses, anoActual]
  );
  const gastosDiariosAno = useMemo(
    () => dailyExpenses.filter((e) => e.date.slice(0, 4) === anoActual).reduce((s, e) => s + e.amount, 0),
    [dailyExpenses, anoActual]
  );
  const ahorroAcumuladoAno = ingresosAno - gastosFijosAno - gastosDiariosAno;
  const metaRestante = Math.max(0, savingsGoal - ahorroAcumuladoAno);

  const diasRestantesAno = useMemo(() => {
    const finAno = new Date(Number(anoActual), 11, 31);
    const hoyDate = new Date(hoy + "T00:00:00");
    return Math.max(1, Math.round((finAno - hoyDate) / 86400000) + 1);
  }, [anoActual, hoy]);

  const ahorroDiarioObjetivo = savingsGoal > 0 ? metaRestante / diasRestantesAno : 0;

  const diasEnMesActual = new Date(Number(mesActual.slice(0, 4)), Number(mesActual.slice(5, 7)), 0).getDate();
  const cuotaDeudaMensual = useMemo(
    () => debts.filter((d) => d.total - d.paid > 0).reduce((s, d) => s + (d.monthlyPayment || 0), 0),
    [debts]
  );
  const ingresoDiarioProm = ingresoMes / diasEnMesActual;
  const gastosFijosDiarios = gastoMes / diasEnMesActual;
  const cuotaDeudaDiaria = cuotaDeudaMensual / diasEnMesActual;

  const presupuestoDiario = ingresoDiarioProm - gastosFijosDiarios - cuotaDeudaDiaria - ahorroDiarioObjetivo;
  const metaCumplida = savingsGoal > 0 && ahorroAcumuladoAno >= savingsGoal;

  function setGoal(amount) {
    setSavingsGoal(amount);
  }

  function addDaily(item) {
    setDailyExpenses((prev) => [{ ...item, id: crypto.randomUUID() }, ...prev]);
    setShowDailyForm(false);
  }
  function removeDaily(id) {
    setDailyExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  function addSaving(item) {
    setSavings((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
    setShowSavingsForm(false);
  }
  function removeSaving(id) {
    setSavings((prev) => prev.filter((s) => s.id !== id));
  }
  function updateSavingAmount(id, amount) {
    setSavings((prev) => prev.map((s) => (s.id === id ? { ...s, amount } : s)));
  }

  function addDebt(debt) {
    setDebts((prev) => [...prev, { ...debt, id: crypto.randomUUID(), paid: 0 }]);
    setShowDebtForm(false);
  }
  function removeDebt(id) {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }
  function registrarPago(id, monto) {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, paid: Math.min(d.total, d.paid + monto) } : d))
    );
  }
  function addExpense(exp) {
    setExpenses((prev) => [{ ...exp, id: crypto.randomUUID() }, ...prev]);
    setShowExpenseForm(false);
  }
  function removeExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  function addIncome(inc) {
    setIncomes((prev) => [{ ...inc, id: crypto.randomUUID() }, ...prev]);
    setShowIncomeForm(false);
  }
  function removeIncome(id) {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div
      style={{ background: PALETTE.paper, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: PALETTE.ink }}
      className="w-full"
    >
      <div className="max-w-2xl mx-auto px-5 py-8 sm:px-8 sm:py-10">
        {/* Header */}
        <div className="flex items-baseline justify-between border-b pb-4 mb-6" style={{ borderColor: PALETTE.line }}>
          <div>
            <h1
              style={{ fontFamily: "Fraunces, serif", fontWeight: 700, color: PALETTE.ink }}
              className="text-3xl sm:text-4xl tracking-tight"
            >
              Libro de Cuentas
            </h1>
            <p style={{ color: PALETTE.inkSoft }} className="text-sm mt-1">
              Deudas y gastos, en un solo lugar
            </p>
          </div>
          <span
            style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.inkSoft }}
            className="text-xs hidden sm:block"
          >
            {new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
        </div>

        {/* Presupuesto diario destacado */}
        <DailyBudgetBanner
          savingsGoal={savingsGoal}
          presupuestoDiario={presupuestoDiario}
          ahorroDiarioObjetivo={ahorroDiarioObjetivo}
          metaCumplida={metaCumplida}
          ahorroAcumuladoAno={ahorroAcumuladoAno}
          anoActual={anoActual}
          onClick={() => setTab("meta")}
        />

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <SummaryCard
            icon={<TrendingUp size={16} />}
            label="Ingresos del mes"
            value={ingresoMes}
            color="#1D7DA8"
            bg={PALETTE.tealSoft}
            onClick={() => setTab("ingresos")}
          />
          <SummaryCard
            icon={<TrendingDown size={16} />}
            label="Deuda pendiente"
            value={totalDeudaPendiente}
            color={PALETTE.burgundy}
            bg={PALETTE.burgundySoft}
            onClick={() => setTab("deudas")}
          />
          <SummaryCard
            icon={<Receipt size={16} />}
            label="Gastos fijos mensuales"
            value={gastoMes}
            color={PALETTE.teal}
            bg={PALETTE.tealSoft}
            onClick={() => setTab("gastos")}
          />
          <SummaryCard
            icon={<Flame size={16} />}
            label="Gastos diarios (hoy)"
            value={totalHoy}
            sub={`$${fmt(totalDiariosMes)} este mes`}
            color={PALETTE.teal}
            bg={PALETTE.tealSoft}
            onClick={() => setTab("diarios")}
          />
          <SummaryCard
            icon={<PiggyBank size={16} />}
            label="Total ahorrado"
            value={totalAhorrado}
            color={PALETTE.gold}
            bg={PALETTE.goldSoft}
            onClick={() => setTab("ahorros")}
          />
          <SummaryCard
            icon={<Coins size={16} />}
            label="Patrimonio neto"
            value={patrimonioNeto}
            color={PALETTE.ink}
            bg={PALETTE.line}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 flex-wrap">
          <TabButton active={tab === "meta"} onClick={() => setTab("meta")} label="Meta anual" />
          <TabButton active={tab === "ingresos"} onClick={() => setTab("ingresos")} label="Ingresos" />
          <TabButton active={tab === "deudas"} onClick={() => setTab("deudas")} label="Deudas" />
          <TabButton active={tab === "gastos"} onClick={() => setTab("gastos")} label="Gastos" />
          <TabButton active={tab === "diarios"} onClick={() => setTab("diarios")} label="Gastos diarios" />
          <TabButton active={tab === "ahorros"} onClick={() => setTab("ahorros")} label="Ahorros" />
        </div>

        {error && (
          <div className="text-xs mb-3 px-3 py-2 rounded" style={{ background: PALETTE.burgundySoft, color: PALETTE.burgundy }}>
            {error}
          </div>
        )}

        {tab === "meta" && (
          <MetaAhorroPanel
            savingsGoal={savingsGoal}
            onSetGoal={setGoal}
            showForm={showGoalForm}
            setShowForm={setShowGoalForm}
            anoActual={anoActual}
            ahorroAcumuladoAno={ahorroAcumuladoAno}
            metaRestante={metaRestante}
            metaCumplida={metaCumplida}
            diasRestantesAno={diasRestantesAno}
            ahorroDiarioObjetivo={ahorroDiarioObjetivo}
            presupuestoDiario={presupuestoDiario}
            ingresoDiarioProm={ingresoDiarioProm}
            gastosFijosDiarios={gastosFijosDiarios}
            cuotaDeudaDiaria={cuotaDeudaDiaria}
            ingresosAno={ingresosAno}
            gastosFijosAno={gastosFijosAno}
            gastosDiariosAno={gastosDiariosAno}
          />
        )}
        {tab === "ingresos" && (
          <IngresosPanel
            incomes={incomes}
            totalMes={ingresoMes}
            totalGeneral={totalIngresos}
            onRemove={removeIncome}
            showForm={showIncomeForm}
            setShowForm={setShowIncomeForm}
            onAdd={addIncome}
          />
        )}
        {tab === "deudas" && (
          <DeudasPanel
            debts={debts}
            onRemove={removeDebt}
            onPago={registrarPago}
            showForm={showDebtForm}
            setShowForm={setShowDebtForm}
            onAdd={addDebt}
          />
        )}
        {tab === "gastos" && (
          <GastosPanel
            expenses={expenses}
            onRemove={removeExpense}
            showForm={showExpenseForm}
            setShowForm={setShowExpenseForm}
            onAdd={addExpense}
          />
        )}
        {tab === "diarios" && (
          <DiariosPanel
            items={dailyExpenses}
            totalHoy={totalHoy}
            totalMes={totalDiariosMes}
            onRemove={removeDaily}
            showForm={showDailyForm}
            setShowForm={setShowDailyForm}
            onAdd={addDaily}
          />
        )}
        {tab === "ahorros" && (
          <AhorrosPanel
            savings={savings}
            onRemove={removeSaving}
            onUpdateAmount={updateSavingAmount}
            showForm={showSavingsForm}
            setShowForm={setShowSavingsForm}
            onAdd={addSaving}
          />
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color, bg, sub, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className="rounded-md p-3 sm:p-4 text-left w-full"
      style={{
        background: "#fff",
        border: `1px solid ${PALETTE.line}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        className="inline-flex items-center justify-center rounded-full mb-2"
        style={{ width: 26, height: 26, background: bg, color }}
      >
        {icon}
      </div>
      <p className="text-[11px] uppercase tracking-wide" style={{ color: PALETTE.inkSoft }}>
        {label}
      </p>
      <p style={{ fontFamily: "IBM Plex Mono, monospace", color }} className="text-base sm:text-lg font-medium mt-0.5">
        ${fmt(value)}
      </p>
      {sub && (
        <p style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.inkSoft }} className="text-[10px] mt-0.5">
          {sub}
        </p>
      )}
    </Tag>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm rounded-t-md transition-colors"
      style={{
        background: active ? "#fff" : "transparent",
        color: active ? PALETTE.ink : PALETTE.inkSoft,
        fontWeight: active ? 600 : 400,
        borderBottom: active ? `2px solid ${PALETTE.gold}` : "2px solid transparent",
      }}
    >
      {label}
    </button>
  );
}

function LedgerRow({ children, isLast }) {
  return (
    <div
      className="relative pl-4 pr-3 py-3 flex items-center gap-3"
      style={{ borderBottom: isLast ? "none" : `1px solid ${PALETTE.line}` }}
    >
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: PALETTE.marginRed, opacity: 0.5 }} />
      {children}
    </div>
  );
}

function DeudasPanel({ debts, onRemove, onPago, showForm, setShowForm, onAdd }) {
  const [payAmount, setPayAmount] = useState({});

  return (
    <div className="rounded-md overflow-hidden" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
      {debts.length === 0 && !showForm && (
        <div className="py-10 text-center text-sm" style={{ color: PALETTE.inkSoft }}>
          Aún no registras deudas. Agrega la primera para llevar el control.
        </div>
      )}

      {debts.map((d, i) => {
        const remaining = Math.max(0, d.total - d.paid);
        const pct = d.total > 0 ? Math.min(100, Math.round((d.paid / d.total) * 100)) : 0;
        const isPaid = remaining <= 0;
        return (
          <LedgerRow key={d.id} isLast={i === debts.length - 1 && !showForm}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{d.name}</span>
                {isPaid && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-sm rotate-[-4deg]"
                    style={{ border: `1px solid ${PALETTE.teal}`, color: PALETTE.teal, fontFamily: "IBM Plex Mono, monospace" }}
                  >
                    PAGADO
                  </span>
                )}
              </div>
              <div className="h-1.5 rounded-full mt-2 mb-1" style={{ background: PALETTE.paperDark }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${pct}%`, background: isPaid ? PALETTE.teal : PALETTE.gold }}
                />
              </div>
              <p style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.inkSoft }} className="text-xs">
                ${fmt(d.paid)} de ${fmt(d.total)} &middot; cuota ${fmt(d.monthlyPayment)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!isPaid && (
                <>
                  <input
                    type="number"
                    placeholder="Pago"
                    value={payAmount[d.id] || ""}
                    onChange={(e) => setPayAmount((p) => ({ ...p, [d.id]: e.target.value }))}
                    className="w-16 text-xs px-1.5 py-1 rounded outline-none"
                    style={{ border: `1px solid ${PALETTE.line}`, fontFamily: "IBM Plex Mono, monospace" }}
                  />
                  <button
                    onClick={() => {
                      const val = parseFloat(payAmount[d.id]);
                      if (val > 0) {
                        onPago(d.id, val);
                        setPayAmount((p) => ({ ...p, [d.id]: "" }));
                      }
                    }}
                    className="p-1.5 rounded"
                    style={{ background: PALETTE.tealSoft, color: PALETTE.teal }}
                    title="Registrar pago"
                  >
                    <Check size={14} />
                  </button>
                </>
              )}
              <button
                onClick={() => onRemove(d.id)}
                className="p-1.5 rounded"
                style={{ color: PALETTE.inkSoft }}
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </LedgerRow>
        );
      })}

      {showForm ? (
        <DebtForm onAdd={onAdd} onCancel={() => setShowForm(false)} />
      ) : (
        <AddRowButton onClick={() => setShowForm(true)} label="Agregar deuda" icon={<CreditCard size={14} />} />
      )}
    </div>
  );
}

function DebtForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");

  const valid = name.trim() && parseFloat(total) > 0;

  return (
    <div className="p-4 space-y-2.5" style={{ background: PALETTE.paperDark }}>
      <input
        autoFocus
        placeholder="Acreedor (ej. Tarjeta BBVA)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded outline-none"
        style={{ border: `1px solid ${PALETTE.line}` }}
      />
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Monto total"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          className="w-1/2 text-sm px-3 py-2 rounded outline-none"
          style={{ border: `1px solid ${PALETTE.line}`, fontFamily: "IBM Plex Mono, monospace" }}
        />
        <input
          type="number"
          placeholder="Cuota mensual"
          value={monthlyPayment}
          onChange={(e) => setMonthlyPayment(e.target.value)}
          className="w-1/2 text-sm px-3 py-2 rounded outline-none"
          style={{ border: `1px solid ${PALETTE.line}`, fontFamily: "IBM Plex Mono, monospace" }}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          disabled={!valid}
          onClick={() =>
            onAdd({ name: name.trim(), total: parseFloat(total), monthlyPayment: parseFloat(monthlyPayment) || 0 })
          }
          className="text-sm px-3 py-1.5 rounded font-medium"
          style={{ background: valid ? PALETTE.ink : PALETTE.line, color: "#fff" }}
        >
          Guardar
        </button>
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded" style={{ color: PALETTE.inkSoft }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function GastosPanel({ expenses, onRemove, showForm, setShowForm, onAdd }) {
  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="rounded-md overflow-hidden" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
      {sorted.length === 0 && !showForm && (
        <div className="py-10 text-center text-sm" style={{ color: PALETTE.inkSoft }}>
          Aún no registras gastos. Agrega el primero.
        </div>
      )}

      {sorted.map((e, i) => (
        <LedgerRow key={e.id} isLast={i === sorted.length - 1 && !showForm}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium capitalize">{CATEGORIAS.find((c) => c.id === e.category)?.label || e.category}</span>
              <span className="text-xs" style={{ color: PALETTE.inkSoft }}>
                {new Date(e.date + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
              </span>
            </div>
            {e.note && (
              <p className="text-xs mt-0.5 truncate" style={{ color: PALETTE.inkSoft }}>
                {e.note}
              </p>
            )}
          </div>
          <span style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.teal }} className="text-sm shrink-0">
            ${fmt(e.amount)}
          </span>
          <button onClick={() => onRemove(e.id)} className="p-1.5 rounded shrink-0" style={{ color: PALETTE.inkSoft }}>
            <Trash2 size={14} />
          </button>
        </LedgerRow>
      ))}

      {showForm ? (
        <ExpenseForm onAdd={onAdd} onCancel={() => setShowForm(false)} />
      ) : (
        <AddRowButton onClick={() => setShowForm(true)} label="Agregar gasto" icon={<Receipt size={14} />} />
      )}
    </div>
  );
}

function ExpenseForm({ onAdd, onCancel }) {
  const [category, setCategory] = useState(CATEGORIAS[0].id);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const valid = parseFloat(amount) > 0;

  return (
    <div className="p-4 space-y-2.5" style={{ background: PALETTE.paperDark }}>
      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-1/2 text-sm px-3 py-2 rounded outline-none"
          style={{ border: `1px solid ${PALETTE.line}` }}
        >
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-1/2 text-sm px-3 py-2 rounded outline-none"
          style={{ border: `1px solid ${PALETTE.line}`, fontFamily: "IBM Plex Mono, monospace" }}
        />
      </div>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded outline-none"
        style={{ border: `1px solid ${PALETTE.line}` }}
      />
      <input
        placeholder="Nota (opcional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded outline-none"
        style={{ border: `1px solid ${PALETTE.line}` }}
      />
      <div className="flex gap-2 pt-1">
        <button
          disabled={!valid}
          onClick={() => onAdd({ category, amount: parseFloat(amount), date, note: note.trim() })}
          className="text-sm px-3 py-1.5 rounded font-medium"
          style={{ background: valid ? PALETTE.ink : PALETTE.line, color: "#fff" }}
        >
          Guardar
        </button>
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded" style={{ color: PALETTE.inkSoft }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

const TIPOS_AHORRO = [
  { id: "cuenta", label: "Cuenta bancaria", icon: Landmark },
  { id: "efectivo", label: "Efectivo", icon: Wallet },
];

function AhorrosPanel({ savings, onRemove, onUpdateAmount, showForm, setShowForm, onAdd }) {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");

  return (
    <div className="rounded-md overflow-hidden" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
      {savings.length === 0 && !showForm && (
        <div className="py-10 text-center text-sm" style={{ color: PALETTE.inkSoft }}>
          Aún no registras ahorros. Agrega tus cuentas o el efectivo que tengas.
        </div>
      )}

      {savings.map((s, i) => {
        const Icon = (TIPOS_AHORRO.find((t) => t.id === s.type) || TIPOS_AHORRO[1]).icon;
        const isEditing = editing === s.id;
        return (
          <LedgerRow key={s.id} isLast={i === savings.length - 1 && !showForm}>
            <div
              className="inline-flex items-center justify-center rounded-full shrink-0"
              style={{ width: 26, height: 26, background: PALETTE.goldSoft, color: PALETTE.gold }}
            >
              <Icon size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.name}</p>
              <p className="text-xs" style={{ color: PALETTE.inkSoft }}>
                {(TIPOS_AHORRO.find((t) => t.id === s.type) || TIPOS_AHORRO[1]).label}
              </p>
            </div>
            {isEditing ? (
              <>
                <input
                  autoFocus
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-20 text-xs px-1.5 py-1 rounded outline-none"
                  style={{ border: `1px solid ${PALETTE.line}`, fontFamily: "IBM Plex Mono, monospace" }}
                />
                <button
                  onClick={() => {
                    const val = parseFloat(editValue);
                    if (!isNaN(val) && val >= 0) onUpdateAmount(s.id, val);
                    setEditing(null);
                  }}
                  className="p-1.5 rounded"
                  style={{ background: PALETTE.tealSoft, color: PALETTE.teal }}
                >
                  <Check size={14} />
                </button>
              </>
            ) : (
              <>
                <span style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.gold }} className="text-sm shrink-0">
                  ${fmt(s.amount)}
                </span>
                <button
                  onClick={() => {
                    setEditing(s.id);
                    setEditValue(String(s.amount));
                  }}
                  className="p-1.5 rounded shrink-0"
                  style={{ color: PALETTE.inkSoft }}
                  title="Actualizar monto"
                >
                  <Pencil size={14} />
                </button>
              </>
            )}
            <button onClick={() => onRemove(s.id)} className="p-1.5 rounded shrink-0" style={{ color: PALETTE.inkSoft }}>
              <Trash2 size={14} />
            </button>
          </LedgerRow>
        );
      })}

      {showForm ? (
        <SavingsForm onAdd={onAdd} onCancel={() => setShowForm(false)} />
      ) : (
        <AddRowButton onClick={() => setShowForm(true)} label="Agregar cuenta o efectivo" icon={<PiggyBank size={14} />} />
      )}
    </div>
  );
}

function SavingsForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("cuenta");
  const [amount, setAmount] = useState("");

  const valid = name.trim() && parseFloat(amount) >= 0 && amount !== "";

  return (
    <div className="p-4 space-y-2.5" style={{ background: PALETTE.paperDark }}>
      <input
        autoFocus
        placeholder="Nombre (ej. Cuenta Santander, Efectivo en casa)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded outline-none"
        style={{ border: `1px solid ${PALETTE.line}` }}
      />
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-1/2 text-sm px-3 py-2 rounded outline-none"
          style={{ border: `1px solid ${PALETTE.line}` }}
        >
          {TIPOS_AHORRO.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-1/2 text-sm px-3 py-2 rounded outline-none"
          style={{ border: `1px solid ${PALETTE.line}`, fontFamily: "IBM Plex Mono, monospace" }}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          disabled={!valid}
          onClick={() => onAdd({ name: name.trim(), type, amount: parseFloat(amount) })}
          className="text-sm px-3 py-1.5 rounded font-medium"
          style={{ background: valid ? PALETTE.ink : PALETTE.line, color: "#fff" }}
        >
          Guardar
        </button>
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded" style={{ color: PALETTE.inkSoft }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function DiariosPanel({ items, totalHoy, totalMes, onRemove, showForm, setShowForm, onAdd }) {
  const sorted = [...items].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <div className="flex gap-3 mb-3">
        <div className="flex-1 rounded-md p-3" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: PALETTE.inkSoft }}>Gastado hoy</p>
          <p style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.teal }} className="text-base font-medium mt-0.5">
            ${fmt(totalHoy)}
          </p>
        </div>
        <div className="flex-1 rounded-md p-3" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: PALETTE.inkSoft }}>Este mes</p>
          <p style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.teal }} className="text-base font-medium mt-0.5">
            ${fmt(totalMes)}
          </p>
        </div>
      </div>

      <div className="rounded-md overflow-hidden" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
        {sorted.length === 0 && !showForm && (
          <div className="py-10 text-center text-sm" style={{ color: PALETTE.inkSoft }}>
            Aún no registras gastos diarios. Agrega el primero.
          </div>
        )}

        {sorted.map((e, i) => (
          <LedgerRow key={e.id} isLast={i === sorted.length - 1 && !showForm}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {new Date(e.date + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                </span>
                {e.note && (
                  <span className="text-xs truncate" style={{ color: PALETTE.inkSoft }}>
                    {e.note}
                  </span>
                )}
              </div>
            </div>
            <span style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.teal }} className="text-sm shrink-0">
              ${fmt(e.amount)}
            </span>
            <button onClick={() => onRemove(e.id)} className="p-1.5 rounded shrink-0" style={{ color: PALETTE.inkSoft }}>
              <Trash2 size={14} />
            </button>
          </LedgerRow>
        ))}

        {showForm ? (
          <DailyForm onAdd={onAdd} onCancel={() => setShowForm(false)} />
        ) : (
          <AddRowButton onClick={() => setShowForm(true)} label="Agregar gasto diario" icon={<Receipt size={14} />} />
        )}
      </div>
    </div>
  );
}

function DailyForm({ onAdd, onCancel }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const valid = parseFloat(amount) > 0;

  return (
    <div className="p-4 space-y-2.5" style={{ background: PALETTE.paperDark }}>
      <div className="flex gap-2">
        <input
          autoFocus
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-1/2 text-sm px-3 py-2 rounded outline-none"
          style={{ border: `1px solid ${PALETTE.line}`, fontFamily: "IBM Plex Mono, monospace" }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-1/2 text-sm px-3 py-2 rounded outline-none"
          style={{ border: `1px solid ${PALETTE.line}` }}
        />
      </div>
      <input
        placeholder="Nota (ej. café, taxi, super)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded outline-none"
        style={{ border: `1px solid ${PALETTE.line}` }}
      />
      <div className="flex gap-2 pt-1">
        <button
          disabled={!valid}
          onClick={() => onAdd({ amount: parseFloat(amount), date, note: note.trim() })}
          className="text-sm px-3 py-1.5 rounded font-medium"
          style={{ background: valid ? PALETTE.ink : PALETTE.line, color: "#fff" }}
        >
          Guardar
        </button>
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded" style={{ color: PALETTE.inkSoft }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function IngresosPanel({ incomes, totalMes, totalGeneral, onRemove, showForm, setShowForm, onAdd }) {
  const sorted = [...incomes].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <div className="flex gap-3 mb-3">
        <div className="flex-1 rounded-md p-3" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: PALETTE.inkSoft }}>Este mes</p>
          <p style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.teal }} className="text-base font-medium mt-0.5">
            ${fmt(totalMes)}
          </p>
        </div>
        <div className="flex-1 rounded-md p-3" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: PALETTE.inkSoft }}>Total registrado</p>
          <p style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.teal }} className="text-base font-medium mt-0.5">
            ${fmt(totalGeneral)}
          </p>
        </div>
      </div>

      <div className="rounded-md overflow-hidden" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
        {sorted.length === 0 && !showForm && (
          <div className="py-10 text-center text-sm" style={{ color: PALETTE.inkSoft }}>
            Aún no registras ingresos. Agrega el primero.
          </div>
        )}

        {sorted.map((inc, i) => (
          <LedgerRow key={inc.id} isLast={i === sorted.length - 1 && !showForm}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize">
                  {FUENTES_INGRESO.find((f) => f.id === inc.source)?.label || inc.source}
                </span>
                <span className="text-xs" style={{ color: PALETTE.inkSoft }}>
                  {new Date(inc.date + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                </span>
              </div>
              {inc.note && (
                <p className="text-xs mt-0.5 truncate" style={{ color: PALETTE.inkSoft }}>
                  {inc.note}
                </p>
              )}
            </div>
            <span style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.teal }} className="text-sm shrink-0">
              +${fmt(inc.amount)}
            </span>
            <button onClick={() => onRemove(inc.id)} className="p-1.5 rounded shrink-0" style={{ color: PALETTE.inkSoft }}>
              <Trash2 size={14} />
            </button>
          </LedgerRow>
        ))}

        {showForm ? (
          <IncomeForm onAdd={onAdd} onCancel={() => setShowForm(false)} />
        ) : (
          <AddRowButton onClick={() => setShowForm(true)} label="Agregar ingreso" icon={<TrendingUp size={14} />} />
        )}
      </div>
    </div>
  );
}

function IncomeForm({ onAdd, onCancel }) {
  const [source, setSource] = useState(FUENTES_INGRESO[0].id);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const valid = parseFloat(amount) > 0;

  return (
    <div className="p-4 space-y-2.5" style={{ background: PALETTE.paperDark }}>
      <div className="flex gap-2">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-1/2 text-sm px-3 py-2 rounded outline-none"
          style={{ border: `1px solid ${PALETTE.line}` }}
        >
          {FUENTES_INGRESO.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-1/2 text-sm px-3 py-2 rounded outline-none"
          style={{ border: `1px solid ${PALETTE.line}`, fontFamily: "IBM Plex Mono, monospace" }}
        />
      </div>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded outline-none"
        style={{ border: `1px solid ${PALETTE.line}` }}
      />
      <input
        placeholder="Nota (opcional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded outline-none"
        style={{ border: `1px solid ${PALETTE.line}` }}
      />
      <div className="flex gap-2 pt-1">
        <button
          disabled={!valid}
          onClick={() => onAdd({ source, amount: parseFloat(amount), date, note: note.trim() })}
          className="text-sm px-3 py-1.5 rounded font-medium"
          style={{ background: valid ? PALETTE.ink : PALETTE.line, color: "#fff" }}
        >
          Guardar
        </button>
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded" style={{ color: PALETTE.inkSoft }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function DailyBudgetBanner({ savingsGoal, presupuestoDiario, ahorroDiarioObjetivo, metaCumplida, ahorroAcumuladoAno, anoActual, onClick }) {
  if (!savingsGoal || savingsGoal <= 0) {
    return (
      <button
        onClick={onClick}
        className="w-full rounded-md p-4 mb-6 text-left flex items-center justify-between gap-3"
        style={{ background: "#fff", border: `1px dashed ${PALETTE.gold}` }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: PALETTE.ink }}>
            Fija tu meta de ahorro anual
          </p>
          <p className="text-xs mt-0.5" style={{ color: PALETTE.inkSoft }}>
            Así la app calcula cuánto puedes gastar cada día sin perder el rumbo.
          </p>
        </div>
        <span
          className="text-xs px-3 py-1.5 rounded shrink-0"
          style={{ background: PALETTE.ink, color: "#fff" }}
        >
          Fijar meta
        </span>
      </button>
    );
  }

  const negativo = presupuestoDiario < 0;
  const color = negativo ? PALETTE.burgundy : PALETTE.teal;
  const bg = negativo ? PALETTE.burgundySoft : PALETTE.tealSoft;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-md p-4 sm:p-5 mb-6 text-left"
      style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: PALETTE.inkSoft }}>
            {metaCumplida ? `Meta ${anoActual} cumplida · disponible hoy` : "Disponible para gastar hoy"}
          </p>
          <p style={{ fontFamily: "IBM Plex Mono, monospace", color }} className="text-2xl sm:text-3xl font-semibold mt-1">
            ${fmt(presupuestoDiario)}
          </p>
          <p className="text-xs mt-1" style={{ color: PALETTE.inkSoft }}>
            {metaCumplida
              ? "Ya alcanzaste tu meta de ahorro de este año."
              : `Reservando $${fmt(ahorroDiarioObjetivo)} al día para tu meta ${anoActual}`}
          </p>
        </div>
        <span
          className="inline-flex items-center justify-center rounded-full shrink-0"
          style={{ width: 34, height: 34, background: bg, color }}
        >
          <Flame size={16} />
        </span>
      </div>
    </button>
  );
}

function MetaAhorroPanel({
  savingsGoal,
  onSetGoal,
  showForm,
  setShowForm,
  anoActual,
  ahorroAcumuladoAno,
  metaRestante,
  metaCumplida,
  diasRestantesAno,
  ahorroDiarioObjetivo,
  presupuestoDiario,
  ingresoDiarioProm,
  gastosFijosDiarios,
  cuotaDeudaDiaria,
  ingresosAno,
  gastosFijosAno,
  gastosDiariosAno,
}) {
  const pct = savingsGoal > 0 ? Math.min(100, Math.max(0, Math.round((ahorroAcumuladoAno / savingsGoal) * 100))) : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-md p-4" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium">Meta de ahorro {anoActual}</p>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="p-1.5 rounded"
            style={{ color: PALETTE.inkSoft }}
            title="Editar meta"
          >
            <Pencil size={14} />
          </button>
        </div>

        {showForm ? (
          <GoalForm
            initial={savingsGoal}
            onSave={(v) => {
              onSetGoal(v);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : savingsGoal > 0 ? (
          <>
            <p style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.ink }} className="text-2xl font-semibold mt-1">
              ${fmt(savingsGoal)}
            </p>
            <div className="h-1.5 rounded-full mt-3 mb-1" style={{ background: PALETTE.paperDark }}>
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${pct}%`, background: metaCumplida ? PALETTE.teal : PALETTE.gold }}
              />
            </div>
            <p style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.inkSoft }} className="text-xs">
              ${fmt(ahorroAcumuladoAno)} ahorrado estimado &middot; {pct}% de la meta
            </p>
          </>
        ) : (
          <div className="pt-1">
            <p className="text-sm mb-2" style={{ color: PALETTE.inkSoft }}>
              Aún no fijas una meta de ahorro para {anoActual}.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm px-3 py-1.5 rounded font-medium"
              style={{ background: PALETTE.ink, color: "#fff" }}
            >
              Fijar meta anual
            </button>
          </div>
        )}
      </div>

      {savingsGoal > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md p-3" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
              <p className="text-[11px] uppercase tracking-wide" style={{ color: PALETTE.inkSoft }}>
                Días restantes del año
              </p>
              <p style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.ink }} className="text-base font-medium mt-0.5">
                {diasRestantesAno}
              </p>
            </div>
            <div className="rounded-md p-3" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
              <p className="text-[11px] uppercase tracking-wide" style={{ color: PALETTE.inkSoft }}>
                {metaCumplida ? "Meta ya cumplida" : "Falta por ahorrar"}
              </p>
              <p style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.gold }} className="text-base font-medium mt-0.5">
                ${fmt(metaRestante)}
              </p>
            </div>
          </div>

          <div className="rounded-md p-4" style={{ background: "#fff", border: `1px solid ${PALETTE.line}` }}>
            <p className="text-[11px] uppercase tracking-wide mb-2" style={{ color: PALETTE.inkSoft }}>
              Cómo se calcula tu disponible diario
            </p>
            <div className="space-y-1.5 text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", color: PALETTE.inkSoft }}>
              <div className="flex justify-between">
                <span>Ingreso diario promedio (mes actual)</span>
                <span style={{ color: PALETTE.teal }}>+${fmt(ingresoDiarioProm)}</span>
              </div>
              <div className="flex justify-between">
                <span>Gastos fijos diarios (mes actual)</span>
                <span style={{ color: PALETTE.burgundy }}>-${fmt(gastosFijosDiarios)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cuota de deudas diaria</span>
                <span style={{ color: PALETTE.burgundy }}>-${fmt(cuotaDeudaDiaria)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ahorro diario para tu meta {anoActual}</span>
                <span style={{ color: PALETTE.burgundy }}>-${fmt(ahorroDiarioObjetivo)}</span>
              </div>
              <div
                className="flex justify-between pt-1.5 mt-1.5"
                style={{ borderTop: `1px solid ${PALETTE.line}`, color: PALETTE.ink, fontWeight: 600 }}
              >
                <span>Disponible para gastar hoy</span>
                <span>${fmt(presupuestoDiario)}</span>
              </div>
            </div>
            <p className="text-[11px] mt-3" style={{ color: PALETTE.inkSoft }}>
              El ahorro estimado del año usa tus ingresos y gastos (fijos y diarios) registrados con fecha en {anoActual}.
              No incluye pagos a deudas ni cambios manuales en Ahorros, así que tómalo como una guía, no como una cifra exacta.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function GoalForm({ initial, onSave, onCancel }) {
  const [amount, setAmount] = useState(initial > 0 ? String(initial) : "");
  const valid = parseFloat(amount) > 0;

  return (
    <div className="pt-2 space-y-2.5">
      <input
        autoFocus
        type="number"
        placeholder="Monto meta anual (ej. 60000)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded outline-none"
        style={{ border: `1px solid ${PALETTE.line}`, fontFamily: "IBM Plex Mono, monospace" }}
      />
      <div className="flex gap-2">
        <button
          disabled={!valid}
          onClick={() => onSave(parseFloat(amount))}
          className="text-sm px-3 py-1.5 rounded font-medium"
          style={{ background: valid ? PALETTE.ink : PALETTE.line, color: "#fff" }}
        >
          Guardar
        </button>
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded" style={{ color: PALETTE.inkSoft }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function AddRowButton({ onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 text-sm py-3"
      style={{ color: PALETTE.inkSoft, background: PALETTE.paper }}
    >
      <Plus size={14} />
      {label}
    </button>
  );
}
