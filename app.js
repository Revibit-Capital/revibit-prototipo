/* Revibit · prototipo de plataforma v2 (sin backend).
   Todo es simulado: los datos viven en el navegador (localStorage) y los proyectos son ficticios [F].
   Fotos ilustrativas de Unsplash (licencia Unsplash); no son de los inmuebles. */
(function () {
  "use strict";

  // ---------- Utilidades ----------
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let nf0, nf2;
  try {
    nf0 = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" });
    nf2 = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" });
  } catch (e) {
    nf0 = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
    nf2 = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
  }
  const eur = (n, dec) => (dec ? nf2 : nf0).format(n);
  const num = (n) => Math.round(n).toLocaleString("es-ES", { useGrouping: true });
  const pct = (r, d = 1) => (r * 100).toLocaleString("es-ES", { maximumFractionDigits: d }) + " %";
  const fdate = (d) => new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x.toISOString(); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString(); };
  const daysTo = (d) => Math.ceil((new Date(d) - Date.now()) / 86400000);
  const monthsBetween = (a, b) => Math.max(0, (new Date(b) - new Date(a)) / (86400000 * 30.4375));
  const today = () => new Date().toISOString();
  const RETENCION = 0.19;           // retención IRPF sobre rendimientos (D2b)
  const UNIDAD = 100;               // 1 participación = 100 € [F]
  const REFLEXION_DIAS = 4;         // periodo de reflexión [H, confirmar con el abogado]
  const COMISION_VENTA = 0.03;      // comisión de la agencia al vender [E]
  const ph = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

  // ---------- Generador de cuentas de un flip [F] (mismas reglas que 03_Modelo) ----------
  function flip({ buy, m2, reform = 500, months, rate, salePm2, extra = [] }) {
    const r = Math.round(reform * m2);
    const lines = [["Compra del inmueble", buy], ["ITP (7,75 %)", Math.round(buy * 0.0775)], ["Notaría, registro y gestoría", 1500], [`Reforma (${reform} €/m²)`, r], ["Imprevistos (10 % de la reforma)", Math.round(r * 0.1)], [`Tenencia ${months} meses (IBI, comunidad, seguro)`, 100 * months], ...extra];
    const sub = lines.reduce((a, l) => a + l[1], 0);
    const struct = Math.round(sub * 0.04 / 100) * 100;
    lines.push(["Estructuración (abogado, SPV, plataforma)", struct]);
    const pre = sub + struct, round = Math.ceil((pre + 2500) / 1000) * 1000;
    lines.push(["Fondo de reserva", round - pre]);
    const sale = Math.round(salePm2 * m2 / 500) * 500;
    const invRet = round * rate * months / 12;
    const breakEven = Math.round((round + invRet) / (1 - COMISION_VENTA) / m2 / 10) * 10;
    return { budget: lines, round, sale, breakEven, invRet };
  }

  // ---------- Proyectos de ejemplo [F] ----------
  const C = { casco: [37.5998, -0.9851], lucia: [37.5953, -0.9712], ensanche: [37.6108, -0.9795], concepcion: [37.5921, -0.9902], anton: [37.6121, -0.9912], puerto: [37.5993, -0.9800] };
  const RAW = [
    { id: "casco-1", code: "RVB-CT-01", name: "Vivienda Casco Histórico I", zone: "Casco histórico", geo: C.casco, kind: "Vivienda", strategy: "Comprar, reformar y vender", step: 1,
      status: "open", m2: 55, beds: 2, baths: 1, floor: "2.ª planta", lift: false, year: 1925, extraFeat: "Balcón a la calle", energy: "C (prevista)",
      rate: 0.15, months: 12, raisedPct: 0.64, investors: 87, closes: "2026-12-20", hue: 158, partner: "Constructora local (ejemplo)",
      f: { buy: 52000, m2: 55, months: 12, rate: 0.15, salePm2: 2500 }, appraisal: 140000,
      photos: [["photo-1759054785539-4562f0a4a632", "Calle del entorno"], ["photo-1444419988131-046ed4e5ffd6", "Estado actual (antes)"], ["photo-1630699376289-b62375a35505", "Acabados previstos (después)"]],
      summary: "Piso vacío de 55 m² en un edificio con informe favorable, a dos calles de la Plaza del Ayuntamiento. Se rehabilita entero: instalaciones nuevas, climatización y cocina abierta, para venderlo a alguien que vaya a vivir en él.",
      barrio: [["Precio medio reformado en la zona", "≈ 2.600 €/m²"], ["Tiempo medio de venta", "≈ 4 meses"], ["Al puerto", "6 min a pie"], ["Comprador típico", "Profesional joven o pareja"]] },
    { id: "atico-puerto", code: "RVB-CT-02", name: "Ático con terraza junto al puerto", zone: "Casco histórico", geo: C.puerto, kind: "Vivienda", strategy: "Comprar, reformar y vender", step: 1,
      status: "open", m2: 98, beds: 3, baths: 2, floor: "Ático", lift: true, year: 1968, extraFeat: "Terraza de 30 m²", energy: "B (prevista)",
      rate: 0.145, months: 14, raisedPct: 0.31, investors: 41, closes: "2027-01-15", hue: 200, partner: "Constructora local (ejemplo)",
      f: { buy: 118000, m2: 98, reform: 600, months: 14, rate: 0.145, salePm2: 2900 }, appraisal: 290000,
      photos: [["photo-1794113965964-4c7204a13e36", "Fachada del edificio"], ["photo-1759238136859-b6fe007fe126", "Salón previsto"], ["photo-1755624222023-621f7718950b", "Cocina prevista"]],
      summary: "Ático de 98 m² con terraza y ascensor, a un paso del puerto. Reforma de gama media-alta: dos baños, cocina nueva y la terraza como protagonista.",
      barrio: [["Precio medio reformado en la zona", "≈ 3.000 €/m²"], ["Tiempo medio de venta", "≈ 5 meses"], ["Al puerto", "2 min a pie"], ["Comprador típico", "Familia o segunda vivienda"]] },
    { id: "local-ensanche", code: "RVB-CT-03", name: "De local a vivienda · Ensanche", zone: "Ensanche", geo: C.ensanche, kind: "Cambio de uso", strategy: "Comprar, cambiar el uso, reformar y vender", step: 1,
      status: "open", m2: 72, beds: 2, baths: 1, floor: "Planta baja", lift: false, year: 1979, extraFeat: "Patio de 12 m²", energy: "C (prevista)",
      rate: 0.16, months: 15, raisedPct: 0.18, investors: 25, closes: "2027-01-31", hue: 32, partner: "Estudio de arquitectura + constructora (ejemplo)",
      f: { buy: 49000, m2: 72, reform: 750, months: 15, rate: 0.16, salePm2: 2250, extra: [["Licencia de cambio de uso y proyecto técnico", 4500]] }, appraisal: 158000,
      photos: [["photo-1702381186403-488ea9c591a3", "Local actual"], ["photo-1689043528099-2ba014dd7c64", "Cocina-comedor prevista"]],
      summary: "Local comercial vacío que se convierte en una vivienda de dos dormitorios con patio. Rentabilidad algo mayor porque tiene un riesgo extra: la licencia de cambio de uso.",
      extraRisk: "Si el Ayuntamiento no concede el cambio de uso, el plan cambia: se vendería como local y la rentabilidad podría ser menor.",
      barrio: [["Precio medio reformado en la zona", "≈ 2.300 €/m²"], ["Tiempo medio de venta", "≈ 4 meses"], ["A la estación", "8 min a pie"], ["Comprador típico", "Primera vivienda"]] },
    { id: "concepcion", code: "RVB-CT-04", name: "Vivienda La Concepción", zone: "La Concepción", geo: C.concepcion, kind: "Vivienda", strategy: "Comprar, reformar y vender", step: 1,
      status: "open", m2: 50, beds: 2, baths: 1, floor: "1.ª planta", lift: false, year: 1958, extraFeat: "Exterior", energy: "C (prevista)",
      rate: 0.15, months: 12, raisedPct: 0.95, investors: 118, closes: "2026-11-30", hue: 12, partner: "Constructora local (ejemplo)",
      f: { buy: 46000, m2: 50, months: 12, rate: 0.15, salePm2: 2350 }, appraisal: 117000,
      photos: [["photo-1760715700239-070a60fa405e", "Calle del entorno"], ["photo-1661796428215-04fc2830aae6", "Salón previsto"]],
      summary: "Piso pequeño y luminoso cerca de la futura Ciudad de la Justicia. Casi completo: quedan pocas participaciones.",
      barrio: [["Precio medio reformado en la zona", "≈ 2.400 €/m²"], ["Tiempo medio de venta", "≈ 3 meses"], ["Al centro", "10 min a pie"], ["Comprador típico", "Primera vivienda"]] },
    { id: "santa-lucia", code: "RVB-CT-05", name: "Vivienda Santa Lucía", zone: "Santa Lucía", geo: C.lucia, kind: "Vivienda", strategy: "Comprar, reformar y vender", step: 1,
      status: "funded", m2: 62, beds: 3, baths: 1, floor: "3.ª planta", lift: false, year: 1962, extraFeat: "Vistas al puerto", energy: "C (prevista)",
      rate: 0.15, months: 12, raisedPct: 1, investors: 131, closes: "2026-08-25", hue: 28, works: 45, partner: "Constructora local (ejemplo)",
      f: { buy: 58000, m2: 62, months: 12, rate: 0.15, salePm2: 2450 }, appraisal: 150000,
      photos: [["photo-1693391402893-04a7c1a11aa4", "Edificio"], ["photo-1618832515490-e181c4794a45", "Cocina en obra"], ["photo-1634586648651-f1fb9ec10d90", "Salón en obra"]],
      summary: "Vivienda de 62 m² con vistas al puerto. La ronda se completó en agosto y la obra va por la mitad.",
      updates: [
        { date: "2026-11-04", title: "Instalación eléctrica terminada", text: "Toda la instalación nueva y revisada. Esta semana empieza la fontanería." },
        { date: "2026-10-15", title: "Demolición terminada", text: "Fuera tabiques y suelos antiguos. Sin sorpresas en la estructura." },
        { date: "2026-09-10", title: "Compra firmada", text: "Firmada ante notario. La hipoteca a favor de los inversores ya está inscrita." }
      ],
      barrio: [["Precio medio reformado en la zona", "≈ 2.400 €/m²"], ["Tiempo medio de venta", "≈ 4 meses"], ["Al puerto", "4 min a pie"], ["Comprador típico", "Pareja joven"]] },
    { id: "san-anton", code: "RVB-CT-00", name: "Vivienda San Antón", zone: "San Antón", geo: C.anton, kind: "Vivienda", strategy: "Comprar, reformar y vender", step: 1,
      status: "done", m2: 58, beds: 2, baths: 1, floor: "2.ª planta", lift: true, year: 1972, extraFeat: "Ascensor", energy: "C",
      rate: 0.15, months: 12, raisedPct: 1, investors: 74, closes: "2025-09-25", hue: 280, partner: "Constructora local (ejemplo)",
      f: { buy: 50000, m2: 58, months: 12, rate: 0.15, salePm2: 2550 }, appraisal: 148000, soldPm2: 2550, paidOn: "2026-09-25",
      photos: [["photo-1786912091659-0814b3470e0c", "Edificio"], ["photo-1737233459465-8eaf6c7d8856", "Resultado final"]],
      summary: "Primer proyecto de ejemplo completado: vendido en 11 meses y devuelto con la rentabilidad pactada.",
      updates: [{ date: "2026-09-25", title: "Pagado a los inversores", text: "Capital + 15 % bruto devuelto a los 74 inversores." }, { date: "2026-08-30", title: "Vivienda vendida", text: "Vendida a 2.550 €/m² a una pareja que vive en ella." }],
      barrio: [["Precio medio reformado en la zona", "≈ 2.500 €/m²"], ["Tiempo medio de venta", "≈ 4 meses"], ["Al centro", "12 min a pie"], ["Comprador típico", "Pareja"]] },
    { id: "ensanche", code: "RVB-CT-06", name: "Edificio Ensanche", zone: "Ensanche", geo: C.ensanche, kind: "Edificio", strategy: "Rehabilitar el edificio completo y vender", step: 2,
      status: "soon", m2: 310, beds: 4, baths: 3, floor: "Edificio completo", lift: false, year: 1931, extraFeat: "2 viviendas + local", energy: "Por definir",
      rate: 0.14, months: 18, raisedPct: 0, investors: 0, opens: "enero 2027", hue: 210, partner: "Promotora local (ejemplo)",
      round: 420000, budget: [["Compra", 245000], ["Impuestos y gastos", 21000], ["Rehabilitación", 120000], ["Imprevistos", 12000], ["Estructuración y reserva", 22000]], sale: 600000, breakEven: 1720, appraisal: 610000,
      photos: [["photo-1728300940040-4e474c8dbf09", "Fachada"], ["photo-1675119660400-8403b93bb5a9", "Balcones"]],
      summary: "Edificio entero con un local y dos viviendas. Segundo peldaño de la escalera de Revibit.",
      barrio: [["Precio medio reformado en la zona", "≈ 2.300 €/m²"], ["Al centro", "7 min a pie"]] },
    { id: "solar-2", code: "RVB-CT-07", name: "Solar Casco Histórico II", zone: "Casco histórico", geo: C.casco, kind: "Obra nueva", strategy: "Construir y vender", step: 3,
      status: "study", m2: 640, beds: 8, baths: 8, floor: "Solar", lift: true, year: 2028, extraFeat: "8 viviendas", energy: "A (prevista)",
      rate: 0.16, months: 26, raisedPct: 0, investors: 0, opens: "2027", hue: 265, partner: "Promotora + arquitectos locales (ejemplo)",
      round: 950000, budget: [["Suelo", 280000], ["Construcción", 560000], ["Licencias y técnicos", 60000], ["Estructuración y reserva", 50000]], sale: 1400000, breakEven: 2050, appraisal: 1450000,
      photos: [["photo-1609867271967-a82f85c48531", "Imagen ilustrativa de obra"], ["photo-1644221150167-fb4fafa7f411", "Imagen ilustrativa de obra"]],
      summary: "Solar vacío en el casco histórico. Tercer peldaño: obra nueva con arquitectos locales y respeto al patrimonio.",
      extraRisk: "En el casco histórico puede aparecer patrimonio arqueológico, lo que puede parar la obra meses.",
      barrio: [["Precio medio obra nueva en la zona", "≈ 2.900 €/m²"]] }
  ];
  const PROJECTS = RAW.map((p) => {
    const q = { ...p };
    if (p.f) Object.assign(q, flip(p.f));
    q.raised = Math.round((q.round * p.raisedPct) / 100) * 100;
    q.min = 500;
    q.updates = p.updates || [];
    q.start = p.closes || null;
    q.end = p.closes ? addMonths(p.closes, p.months) : null;
    q.total = p.rate * p.months / 12;
    q.skin = Math.round(q.round * (p.step === 1 ? 0.2 : 0.1) / 1000) * 1000;
    q.spv = `Revibit ${p.code.split("-").pop()} SL (SPV, ejemplo)`;
    q.guarantee = p.status === "study" || p.status === "soon" ? "Por definir en la ficha definitiva." : "Hipoteca de primer rango sobre el inmueble a favor de los inversores, a través de un agente de garantías (pendiente de confirmar con el abogado).";
    q.risks = [
      "La venta puede tardar más o hacerse a un precio menor del previsto.",
      `La obra puede costar más (escenario de estrés: ${p.f ? (p.f.reform || 500) + 200 : "+20 %"} ${p.f ? "€/m²" : ""}).`,
      "Si hay retraso: 1 mes de gracia y después la rentabilidad se prorratea al % anual. En el mes 18 se activan medidas de protección.",
      ...(p.extraRisk ? [p.extraRisk] : []),
      "Puedes perder parte o la totalidad del dinero aportado.",
      "No hay mercado secundario: en general, el dinero queda en el proyecto hasta el vencimiento."
    ];
    q.timeline = {
      open: [["Ronda abierta", "now"], ["Compra ante notario", ""], ["Obra (≈ 4 meses)", ""], ["Venta", ""], ["Devolución del capital + rentabilidad", ""]],
      funded: [["Ronda completada", "done"], ["Compra ante notario", "done"], [`Obra · ${p.works || 0} %`, "now"], ["Venta", ""], ["Devolución", ""]],
      done: [["Ronda completada", "done"], ["Compra", "done"], ["Obra", "done"], ["Venta", "done"], ["Devuelto a los inversores", "done"]],
      soon: [["Análisis técnico", "now"], ["Apertura de la ronda", ""], ["Compra", ""], ["Obra", ""], ["Venta", ""]],
      study: [["Estudio de viabilidad", "now"], ["Licencia", ""], ["Ronda", ""], ["Obra", ""], ["Venta", ""]]
    }[p.status];
    return q;
  });
  const P = (id) => PROJECTS.find((p) => p.id === id);
  const STATUS = { open: ["Abierto", "pill-brand"], funded: ["En reforma", "pill-info"], done: ["Completado", ""], soon: ["Próximamente", "pill-warn"], study: ["En estudio", ""] };

  // ---------- Estado ----------
  const KEY = "revibit-proto-v2";
  const fresh = () => ({ user: null, cash: 0, investments: [], movements: [], favs: {}, waitlist: {}, interest: [], readNotif: 0, prefs: { theme: "dark", notif: { obra: true, nuevos: true, cobros: true } } });
  let S = fresh();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch (e) { /* sin almacenamiento */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignorar */ } };

  const mineIn = (p) => S.investments.filter((i) => i.pid === p.id && i.status === "active");
  const raisedOf = (p) => Math.min(p.round, p.raised + (p.status === "open" ? mineIn(p).reduce((a, i) => a + i.amount, 0) : 0));
  const ret = (amount, p) => { const gross = amount * p.total; return { gross, tax: gross * RETENCION, net: gross * (1 - RETENCION) }; };
  const active = () => S.investments.filter((i) => i.status === "active");
  const invested = () => active().reduce((a, i) => a + i.amount, 0);
  const accrued = (i) => { const p = P(i.pid); if (p.status === "open") return 0; return i.amount * p.rate * Math.min(p.months, monthsBetween(p.start, today())) / 12; };
  const lossCap = () => S.user?.nw != null ? Math.max(0, S.user.nw * 0.1) : null;
  const warnLimit = () => S.user?.nw != null ? Math.max(1000, S.user.nw * 0.05) : 1000;

  function demoUser() {
    S = Object.assign(fresh(), { prefs: S.prefs });
    S.user = { name: "Ana Demo", email: "ana@revibit.test", country: "España", kyc: "done", test: "ok", nw: 42000, since: "2025-09-18" };
    S.investments = [
      { id: "i0", pid: "san-anton", amount: 1500, date: "2025-09-20T10:00:00Z", reflectUntil: "2025-09-24T10:00:00Z", status: "repaid" },
      { id: "i1", pid: "santa-lucia", amount: 1000, date: "2026-08-20T10:00:00Z", reflectUntil: "2026-08-24T10:00:00Z", status: "active" }
    ];
    const g = 1500 * 0.15;
    S.movements = [
      { type: "in", label: "Dinero añadido", amount: 2000, date: "2025-09-18T09:12:00Z" },
      { type: "inv", label: "Inversión · Vivienda San Antón", amount: -1500, date: "2025-09-20T10:00:00Z" },
      { type: "out", label: "Retirada a tu banco", amount: -500, date: "2026-02-03T10:00:00Z" },
      { type: "inv", label: "Inversión · Vivienda Santa Lucía", amount: -1000, date: "2026-08-20T10:00:00Z", _skip: true },
      { type: "pay", label: "Cobro · Vivienda San Antón (capital + 15 % − retención)", amount: 1500 + g * (1 - RETENCION), date: "2026-09-25T08:00:00Z" }
    ];
    // saldo: 2000 − 1500 − 500 + 1000 (aportado en ago.) − 1000 + cobro
    S.movements.splice(3, 0, { type: "in", label: "Dinero añadido", amount: 1000, date: "2026-08-18T09:00:00Z" });
    S.movements.forEach((m) => delete m._skip);
    S.cash = S.movements.reduce((a, m) => a + m.amount, 0);
    save();
  }

  // ---------- Tema ----------
  function applyTheme() {
    const t = S.prefs.theme;
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  }

  // ---------- Iconos ----------
  const I = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M16 13h2M3 9h18M6 6V5a2 2 0 0 1 2-2h8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', up: '<path d="M12 19V5M6 11l6-6 6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M15 18 9 12l6-6"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    doc: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', stairs: '<path d="M3 20h5v-5h5v-5h5V5h3"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.4M12 17v.5"/>',
    euro: '<path d="M17 6.5A6.5 6.5 0 1 0 17 17.5M4 10h9M4 14h9"/>', tool: '<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>'
  };
  const ic = (n, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

  // ---------- Ilustración de respaldo (si no carga la foto) ----------
  function art(p) {
    const h = p.hue, w = 320, H = 180;
    let seed = [...p.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    let x = 0, b = "";
    while (x < w) { const bw = 34 + Math.floor(rnd() * 46), bh = 60 + Math.floor(rnd() * 90); b += `<rect x="${x}" y="${H - bh}" width="${bw - 3}" height="${bh}" fill="hsl(${h} 35% ${30 + Math.floor(rnd() * 25)}%)"/>`; x += bw; }
    return `<svg viewBox="0 0 ${w} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="${w}" height="${H}" fill="hsl(${h} 60% 70%)"/>${b}</svg>`;
  }
  // Foto con respaldo: la ilustración queda debajo; si la foto falla, se retira.
  const photo = (p, i = 0, w = 900, alt) => `${art(p)}<img src="${ph(p.photos[i][0], w)}" alt="${esc(alt ?? p.photos[i][1] + " · foto ilustrativa")}" loading="lazy" onerror="this.remove()">`;

  // ---------- Componentes ----------
  const favBtn = (p) => `<button class="fav-btn" data-act="fav" data-id="${p.id}" aria-pressed="${!!S.favs[p.id]}" aria-label="${S.favs[p.id] ? "Quitar de guardados" : "Guardar"}">${ic("heart", 18)}</button>`;
  function projCard(p, opts = {}) {
    const raised = raisedOf(p), f = Math.round((raised / p.round) * 100);
    const [st, cls] = STATUS[p.status];
    const d = p.status === "open" ? daysTo(p.closes) : null;
    const stats = opts.public
      ? `<div><b>${p.months} m</b><span>Plazo</span></div><div><b>${eur(p.round)}</b><span>Ronda</span></div><div><b>${eur(p.min)}</b><span>Mínimo</span></div>`
      : `<div><b>${pct(p.rate)}</b><span>Anual bruto</span></div><div><b>${pct(p.total)}</b><span>Total ${p.months} m</span></div><div><b>${eur(p.min)}</b><span>Mínimo</span></div>`;
    const foot = ["open", "funded", "done"].includes(p.status)
      ? `<div class="progress" aria-label="Financiado ${f} %"><span style="width:${f}%"></span></div><div class="row between small"><span class="muted">${eur(raised)} de ${eur(p.round)}</span><strong>${f} %</strong></div>`
      : `<div class="small muted">${p.status === "soon" ? "Abre en " + esc(p.opens) : "En estudio · " + esc(p.opens)}</div>`;
    return `<article class="card proj" data-act="open-project" data-id="${p.id}" tabindex="0" role="link" aria-label="Ver ${esc(p.name)}">
      <div class="media photo">${photo(p, 0, 700, "")}<div class="tags"><span class="pill ${cls}">${st}</span><span class="pill">Ficticio</span></div>
        ${opts.public ? "" : `<div class="fav">${favBtn(p)}</div>`}${d != null && d >= 0 ? `<div class="days"><span class="pill">${ic("clock", 13)} ${d === 0 ? "Cierra hoy" : "Quedan " + d + " días"}</span></div>` : ""}</div>
      <div class="body"><div><div class="code">${p.code} · ${esc(p.zone)}</div><div class="h3">${esc(p.name)}</div><div class="xs muted">${esc(p.kind)} · ${p.m2} m² · ${p.beds} hab.</div></div>
      <div class="stats">${stats}</div>${foot}</div></article>`;
  }

  // ---------- Web pública ----------
  function phoneMock() {
    const hero = P("atico-puerto");
    return `<div class="phone" aria-hidden="true">
            <div class="balance-hero" style="padding:18px 14px"><div class="label xs">Total</div><div class="amount" style="font-size:34px">3.682 €</div><div class="accr">${ic("spark", 14)} +62,50 € generados</div></div>
            <div class="list-item"><div class="av photo">${photo(P("santa-lucia"), 0, 120, "")}</div><div class="grow"><div class="t">Vivienda Santa Lucía</div><div class="xs muted">En reforma · 45 %</div></div><div class="amt">1.000 €</div></div>
            <div class="list-item"><div class="av photo">${photo(hero, 0, 120, "")}</div><div class="grow"><div class="t">${esc(hero.name)}</div><div class="xs muted">Abierto</div></div><div class="amt">→</div></div>
          </div>`;
  }
  function viewLanding() {
    const logged = !!S.user, hero = P("atico-puerto");
    return `
    <div class="pub-hero">
      <div class="bg"><img src="${ph("photo-1646496523246-4c7905b07db4", 1600)}" alt="" onerror="this.remove()"></div>
      <div class="inner">
        <header class="pub-nav">
          <a class="logo" href="#/">Revibit<b>.</b></a>
          <nav class="links" aria-label="Principal"><a class="navlink" href="#como">Cómo funciona</a><a class="navlink" href="#proyectos">Proyectos</a><a class="navlink" href="#faq">Preguntas</a>
            <a class="btn btn-brand btn-sm" href="${logged ? "#/app" : "#/entrar"}">${logged ? "Mi cuenta" : "Entrar"}</a></nav>
        </header>
        <div class="hero-grid">
          <div>
            <span class="pill">Hecho en Cartagena</span>
            <h1 class="h1" style="margin-top:16px">Tu ciudad<span class="dot">.</span><br>Tu inversión<span class="dot">.</span></h1>
            <p class="lead">Participa en la rehabilitación de viviendas y edificios del centro de Cartagena. Desde 500 €, desde el móvil y sin letra pequeña.</p>
            <div class="row wrap"><a class="btn btn-brand" href="${logged ? "#/app/proyectos" : "#/entrar"}">${logged ? "Ver proyectos" : "Empieza ahora"} ${ic("arrow", 18)}</a><a class="btn btn-outline" href="#interes">Soy constructora</a></div>
          </div>
          ${phoneMock()}
        </div>
      </div>
    </div>
    <main>
      <section class="section" id="por-que">
        <h2 class="h2">Invertir en tu ciudad, por fin fácil</h2>
        <div class="features">
          <div class="card feature"><div class="ico">${ic("euro")}</div><div class="h3">Desde 500 €</div><p class="muted">No hace falta comprar un piso entero. Entra con lo que quieras a partir de 500 €.</p></div>
          <div class="card feature"><div class="ico">${ic("eye")}</div><div class="h3">Lo ves con tus ojos</div><p class="muted">Proyectos en calles que conoces. Fotos de cada avance de obra en tu app.</p></div>
          <div class="card feature"><div class="ico">${ic("doc")}</div><div class="h3">Sin letra pequeña</div><p class="muted">Números, plazos, garantía y riesgos en cada ficha. Lo bueno y lo malo.</p></div>
          <div class="card feature"><div class="ico">${ic("phone")}</div><div class="h3">Todo desde el móvil</div><p class="muted">Te das de alta en minutos, inviertes en euros y sigues tu dinero. Sin criptomonedas.</p></div>
        </div>
      </section>
      <section class="section" id="como">
        <h2 class="h2">Así funciona</h2>
        <div class="steps">
          <div class="card step"><div class="h3">Elige proyecto</div><p class="muted">Cada ficha te cuenta cuánto cuesta, cuánto se espera vender y qué puede salir mal.</p></div>
          <div class="card step"><div class="h3">Invierte</div><p class="muted">Desde 500 €. Tienes 4 días para arrepentirte sin coste.</p></div>
          <div class="card step"><div class="h3">Sigue la obra</div><p class="muted">Avances con fotos en tu app hasta que se vende.</p></div>
          <div class="card step"><div class="h3">Cobra</div><p class="muted">Al vender, recuperas tu dinero más la rentabilidad fijada en la ficha. Tú cobras antes que Revibit.</p></div>
        </div>
      </section>
      <section class="section" id="proyectos">
        <div class="row between wrap"><h2 class="h2">Proyectos de ejemplo</h2><span class="pill pill-fict">Datos ficticios · fotos ilustrativas</span></div>
        <p class="muted">Viviendas → edificios → solares. Así crece Revibit.</p>
        <div class="proj-grid" style="margin-top:20px">${PROJECTS.filter((p) => p.status !== "done").slice(0, 6).map((p) => projCard(p, { public: true })).join("")}</div>
      </section>
      <section class="section faq" id="faq">
        <h2 class="h2" style="margin-bottom:20px">Preguntas</h2>
        <details><summary>¿Qué es Revibit?</summary><p>Una forma de que los vecinos de Cartagena participen en recuperar viviendas, edificios y solares vacíos del centro, junto a constructoras locales.</p></details>
        <details><summary>¿Puedo invertir ya?</summary><p>Todavía no. Esto es un prototipo con proyectos ficticios. Estamos preparando el primer proyecto y su estructura legal.</p></details>
        <details><summary>¿Cuándo cobro?</summary><p>Al final del proyecto, cuando se vende el inmueble: recibes tu dinero más la rentabilidad fijada en la ficha, menos la retención fiscal. No hay pagos mensuales.</p></details>
        <details><summary>¿Y si se retrasa?</summary><p>Hay un mes de gracia. Después, la rentabilidad se sigue calculando al % anual hasta que cobras.</p></details>
        <details><summary>¿Qué riesgos tiene?</summary><p>Que la obra cueste más, que se venda más tarde o más barato. Puedes perder parte o todo lo que inviertes. Cada ficha te enseña qué pasa en cada escenario.</p></details>
        <details><summary>¿Puedo sacar mi dinero antes?</summary><p>En general, no. No hay mercado secundario: el dinero se queda en el proyecto hasta el vencimiento.</p></details>
        <details><summary>¿Necesito saber de cripto?</summary><p>No. Todo es en euros. Estamos estudiando si la tokenización aporta algo (por ejemplo, un registro claro de quién tiene qué); si la usamos, no notarás nada raro.</p></details>
      </section>
      <section class="section" id="interes">
        <div class="card" style="max-width:640px;margin:0 auto">
          <h2 class="h2">Entra en la lista</h2>
          <p class="muted">Sin compromiso. Te avisamos cuando abra el primer proyecto.</p>
          <form class="stack" data-form="interest">
            <div class="field"><label for="i-name">Nombre</label><input id="i-name" name="name" required autocomplete="given-name"></div>
            <div class="field"><label for="i-mail">Correo</label><input id="i-mail" name="email" type="email" required autocomplete="email"></div>
            <div class="field"><label for="i-type">Soy…</label><select id="i-type" name="type"><option>Persona interesada en participar</option><option>Constructora o promotora</option><option>Arquitecto o técnico</option></select></div>
            <div class="field"><label for="i-amt">¿Cuánto pondrías, más o menos?</label><select id="i-amt" name="amount"><option>Aún no lo sé</option><option>Menos de 1.000 €</option><option>1.000–2.500 €</option><option>2.500–5.000 €</option><option>Más de 5.000 €</option></select></div>
            <label class="check"><input type="checkbox" required name="rgpd"><span>He leído la Política de privacidad y acepto que Revibit use mis datos para responderme y contarme novedades del proyecto.</span></label>
            <button class="btn btn-brand btn-block" type="submit">Apuntarme</button>
            <p class="xs muted">Prototipo: los datos se quedan en este navegador.</p>
          </form>
        </div>
      </section>
    </main>
    <footer class="footer">
      <div class="logo" style="font-size:18px">Revibit<b>.</b></div>
      <p>Revibit está en fase de preparación y no ofrece ningún producto de inversión. Esta web es divulgativa y no es una oferta ni una recomendación de inversión.</p>
      <p>Política de privacidad · Aviso legal · Política de cookies · © 2026 Revibit</p>
      <p class="credit">Fotos ilustrativas de Unsplash. No corresponden a inmuebles reales de Revibit.</p>
    </footer>`;
  }

  function viewLogin() {
    return `<div class="pub-hero auth-hero">
      <div class="bg"><img src="${ph("photo-1646496523246-4c7905b07db4", 1600)}" alt="" onerror="this.remove()"></div>
      <div class="inner">
        <header class="pub-nav"><a class="logo" href="#/">Revibit<b>.</b></a></header>
        <div class="hero-grid">
          <div>
            <span class="pill">Hecho en Cartagena</span>
            <h1 class="h1" style="margin-top:16px">Tu ciudad<span class="dot">.</span><br>Tu inversión<span class="dot">.</span></h1>
            <p class="lead">Entra con tu correo y te mandamos un enlace. Sin contraseñas.</p>
            <form class="auth-form" data-form="signup">
              <label class="sr-only" for="s-mail">Correo</label>
              <input id="s-mail" name="email" type="email" required autocomplete="email" placeholder="tu@correo.com">
              <button class="btn btn-brand btn-block" type="submit">Continuar ${ic("arrow", 18)}</button>
            </form>
            <button class="btn btn-outline btn-block" data-act="demo" style="margin-top:12px">Probar con la cuenta demo</button>
            <p class="auth-note">La demo trae saldo, una inversión en marcha y otra ya cobrada. Todo ficticio.</p>
          </div>
          ${phoneMock()}
        </div>
      </div>
    </div>`;
  }

  // ---------- Alta (5 pasos) ----------
  function viewOnboarding(step) {
    const N = 5, n = Math.min(Math.max(parseInt(step, 10) || 1, 1), N);
    const bar = `<div class="stepper" aria-label="Paso ${n} de ${N}">${Array.from({ length: N }, (_, i) => `<span class="${i < n ? "on" : ""}"></span>`).join("")}</div>`;
    let body = "";
    if (n === 1) body = `<h1 class="h2">¿Cómo te llamas?</h1><p class="muted">Lo justo para abrir tu cuenta.</p>
      <form class="stack" data-form="ob1">
        <div class="field"><label for="o-name">Nombre y apellidos</label><input id="o-name" name="name" required autocomplete="name" value="${esc(S.user?.name || "")}"></div>
        <div class="field"><label for="o-country">¿Dónde vives?</label><select id="o-country" name="country"><option>España</option><option>Otro país de la UE</option><option>Fuera de la UE</option></select></div>
        <label class="check"><input type="checkbox" name="adult" required><span>Soy mayor de edad.</span></label>
        <button class="btn btn-primary btn-block" type="submit">Siguiente</button></form>`;
    if (n === 2) body = `<h1 class="h2">Verifica que eres tú</h1><p class="muted">Lo pide la ley para cualquier inversión. Tarda 2 minutos.</p>
      <div class="card" style="text-align:center;box-shadow:none;background:var(--surface-2)">${ic("shield", 40)}<p>En la versión real: foto de tu documento + selfie, con un proveedor de verificación autorizado.</p><p class="small muted">Aquí no se sube ni se guarda nada.</p></div>
      <button class="btn btn-primary btn-block" data-act="kyc">Simular verificación</button>`;
    if (n === 3) body = `<h1 class="h2">3 preguntas rápidas</h1><p class="muted">Para saber si esto encaja contigo. Si fallas, no pasa nada: te contamos los riesgos.</p>
      <form class="stack" data-form="ob3">
        ${quiz("q1", "Si el proyecto sale mal, ¿puedes perder dinero?", [["a", "Sí, parte o todo"], ["b", "No, está garantizado"]])}
        ${quiz("q2", "¿Puedes sacar tu dinero cuando quieras?", [["a", "Sí, cuando quiera"], ["b", "No, en general hasta el vencimiento"]])}
        ${quiz("q3", "Si la venta se retrasa…", [["a", "Cobro más tarde, con la rentabilidad prorrateada"], ["b", "Cobro en la fecha prevista pase lo que pase"]])}
        <button class="btn btn-primary btn-block" type="submit">Ver resultado</button></form>`;
    if (n === 4) body = `<h1 class="h2">¿Cuánto podrías perder sin problema?</h1>
      <p class="muted">Calculamos tu capacidad de asumir pérdidas: el 10 % de tu patrimonio neto. Usamos rangos, no cifras exactas.</p>
      <form class="stack" data-form="ob4">
        ${rangeSel("inc", "Ingresos netos al año", [["15000", "Menos de 20.000 €"], ["30000", "20.000–40.000 €"], ["55000", "40.000–70.000 €"], ["90000", "Más de 70.000 €"]])}
        ${rangeSel("liq", "Ahorros e inversiones que puedes vender rápido", [["5000", "Menos de 10.000 €"], ["25000", "10.000–40.000 €"], ["70000", "40.000–100.000 €"], ["150000", "Más de 100.000 €"]])}
        ${rangeSel("debt", "Pagos fijos al año (hipoteca, préstamos…)", [["0", "Ninguno"], ["6000", "Menos de 10.000 €"], ["15000", "10.000–20.000 €"], ["30000", "Más de 20.000 €"]])}
        <button class="btn btn-primary btn-block" type="submit">Calcular</button></form>`;
    if (n === 5) {
      const ok = S.user?.test === "ok";
      body = `<div class="success-ico">${ic("check", 38)}</div><h1 class="h2" style="text-align:center">¡Listo!</h1>
        <p class="muted" style="text-align:center">Tu cuenta está abierta. Podrías asumir pérdidas de hasta <strong>${eur(lossCap() || 0)}</strong>.</p>
        ${ok ? "" : `<div class="notice warn">Ojo: tus respuestas dicen que este producto puede no encajar contigo. Recuerda: <strong>puedes perder lo que inviertes</strong>, en general <strong>no puedes sacarlo antes</strong> y <strong>un retraso retrasa tu cobro</strong>. Te lo recordaremos al invertir.</div>`}
        <a class="btn btn-brand btn-block" href="#/app" style="margin-top:16px">Ir a mi cuenta</a>`;
    }
    return `<div class="auth-wrap"><div class="row between"><a class="logo" href="#/">Revibit<b>.</b></a><span class="small muted">${n}/${N}</span></div><div style="margin-top:24px">${bar}${body}</div></div>`;
  }
  const quiz = (name, q, opts) => `<fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:600;margin-bottom:8px">${q}</legend>${opts.map(([v, t]) => `<label class="opt"><input type="radio" name="${name}" value="${v}" required>${t}</label>`).join("")}</fieldset>`;
  const rangeSel = (name, label, opts) => `<div class="field"><label for="r-${name}">${label}</label><select id="r-${name}" name="${name}" required><option value="">Elige un rango</option>${opts.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></div>`;

  // ---------- Estructura de la app ----------
  const NAV = [["inicio", "Inicio", "home"], ["proyectos", "Invertir", "grid"], ["cartera", "Cartera", "wallet"], ["perfil", "Perfil", "user"]];
  const initials = (n) => (n || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  function shell(activeTab, content) {
    const items = (cls) => NAV.map(([k, t, i]) => `<a class="${cls}" href="#/app/${k === "inicio" ? "" : k}" ${activeTab === k ? 'aria-current="page"' : ""}>${ic(i)}<span>${t}</span></a>`).join("");
    const ini = esc(initials(S.user?.name));
    const unread = notifications().length > S.readNotif;
    return `<div class="app"><aside class="sidebar"><a class="logo" href="#/">Revibit<b>.</b></a><nav aria-label="App">${items("navitem")}</nav>
      <div class="side-foot"><button class="navitem" data-act="toast" data-msg="En el producto real: chat con el equipo de Revibit">${ic("help")}<span>Ayuda</span></button>
      <div class="xs side-note">Prototipo · datos ficticios</div></div></aside>
      <div class="main-wrap"><header class="topbar">
        <a class="avatar m-only" href="#/app/perfil" aria-label="Perfil">${ini}</a>
        <a class="top-logo m-only" href="#/app" aria-label="Revibit, inicio">Revibit<b>.</b></a>
        <button class="search" data-act="go" data-to="#/app/proyectos" aria-label="Buscar proyectos">${ic("search", 18)}<span>Buscar proyectos</span><kbd class="d-only">⌘ K</kbd></button>
        <div class="top-actions"><button class="icon-btn" data-act="notifs" aria-label="Notificaciones">${ic("bell", 19)}${unread ? '<span class="badge-dot"></span>' : ""}</button><a class="avatar d-only" href="#/app/perfil" aria-label="Perfil">${ini}</a></div>
      </header>
      <main class="main" id="main">${content}</main></div><nav class="tabbar" aria-label="App">${items("")}</nav></div>`;
  }
  const kycBanner = () => S.user && S.user.kyc !== "done" ? `<div class="notice warn row between wrap" style="margin-bottom:16px"><span>Te falta verificar tu identidad para invertir.</span><a class="btn btn-sm btn-primary" href="#/alta/${S.user.name ? 2 : 1}">Terminar</a></div>` : "";

  function notifications() {
    const list = [];
    S.investments.forEach((i) => P(i.pid).updates.forEach((u) => list.push({ date: u.date, title: u.title, text: P(i.pid).name })));
    PROJECTS.filter((p) => p.status === "open").forEach((p) => list.push({ date: addDays(p.closes, -40), title: "Nuevo proyecto abierto", text: p.name }));
    return [...new Map(list.map((n) => [n.date + n.title, n])).values()].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 12);
  }

  // ---------- Inicio ----------
  const hm = (d) => new Date(d).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  function txText(m) {
    const [a, ...b] = m.label.split(" · ");
    if (!b.length) return [a, { in: "Transferencia entrante", out: "A tu cuenta bancaria" }[m.type] || ""];
    const rest = b.join(" · "), mm = rest.match(/^(.*?)\s*\((.*)\)$/);
    return mm ? [mm[1], a + " · " + mm[2]] : [rest, a];
  }
  function txRow(m) {
    const p = PROJECTS.find((x) => m.label.includes(x.name));
    const [t, sub] = txText(m), pos = m.amount >= 0;
    const icon = p ? `<span class="tx-ic photo">${photo(p, 0, 120, "")}</span>` : `<span class="tx-ic ${pos ? "in" : ""}">${ic(pos ? "down" : "up", 18)}</span>`;
    return `<div class="tx-row"><div class="tx-main">${icon}<div class="tx-txt"><div class="t">${esc(t)}</div><div class="xs muted">${esc(sub)}<span class="m-only"> · ${fdate(m.date)}</span></div></div></div>
      <div class="tx-date d-only">${fdate(m.date)}, ${hm(m.date)}</div><div class="tx-st d-only">Completada</div>
      <div class="tx-amt num ${pos ? "pos" : ""}">${pos ? "+" : "−"}${eur(Math.abs(m.amount), true)}</div></div>`;
  }
  function spark() {
    const mv = [...S.movements].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (mv.length < 2) return "";
    let c = 0; const pts = mv.map((m) => (c += m.amount));
    const max = Math.max(...pts), min = Math.min(0, ...pts), W = 220, H = 64;
    const xy = pts.map((v, i) => [Math.round((i / (pts.length - 1)) * W), Math.round(H - 4 - ((v - min) / (max - min || 1)) * (H - 8))]);
    const d = xy.map(([x, y], i) => (i ? "L" : "M") + x + " " + y).join(" ");
    const [lx, ly] = xy[xy.length - 1];
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d} L${W} ${H} L0 ${H}Z" class="area"/><path d="${d}" class="line"/><circle cx="${lx}" cy="${ly}" r="4" class="pt"/></svg>`;
  }
  function viewHome() {
    const inv = invested(), total = S.cash + inv, acc = active().reduce((a, i) => a + accrued(i), 0);
    const earned = S.movements.filter((m) => m.type === "pay").reduce((a, m) => a + m.amount, 0) - S.investments.filter((i) => i.status === "repaid").reduce((a, i) => a + i.amount, 0);
    const next = active().map((i) => ({ i, p: P(i.pid) })).sort((a, b) => new Date(a.p.end) - new Date(b.p.end))[0];
    const open = PROJECTS.filter((p) => p.status === "open");
    const ups = notifications().filter((n) => n.title !== "Nuevo proyecto abierto").slice(0, 3);
    const mv = [...S.movements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
    const [ent, dec] = eur(total, true).replace(/\s?€/, "").split(",");
    return shell("inicio", `${kycBanner()}
      <div class="home-grid">
        <div class="home-main">
          <section class="bal" aria-label="Saldo">
            <div class="bal-l"><div class="bal-amt num">${ent}<small>,${dec}</small> €</div>
              <div class="bal-sub">Total · EUR<span class="d-only"> · ${eur(S.cash)} disponibles · ${eur(inv)} invertidos</span></div></div>
            <div class="bal-actions">
              <button class="pa" data-act="add-funds"><span class="pi">${ic("plus", 18)}</span><span>Añadir</span></button>
              <button class="pa primary" data-act="go" data-to="#/app/proyectos"><span class="pi">${ic("grid", 18)}</span><span>Invertir</span></button>
              <button class="pa" data-act="withdraw"><span class="pi">${ic("up", 18)}</span><span>Retirar</span></button>
              <button class="pa" data-act="see-moves"><span class="pi">${ic("doc", 18)}</span><span>Extracto</span></button>
            </div>
          </section>
          <div class="m-only bal-split"><div><span class="xs muted">Disponible</span><b class="num">${eur(S.cash, true)}</b></div><div><span class="xs muted">Invertido</span><b class="num">${eur(inv, true)}</b></div></div>
          <section class="panel tx" aria-label="Últimos movimientos">
            <div class="tx-head d-only"><span>Movimiento</span><span>Fecha</span><span>Estado</span><span>Importe</span></div>
            ${mv.length ? mv.map(txRow).join("") : `<div class="empty">Todavía no hay movimientos.</div>`}
            <button class="tx-more" data-act="see-moves">Ver todo</button>
          </section>
          <section class="panel" aria-label="Avances de obra"><div class="panel-h"><h2>Avances de obra</h2></div>
            ${ups.length ? ups.map((u) => `<div class="tx-row simple"><div class="tx-main"><span class="tx-ic">${ic("tool", 18)}</span><div class="tx-txt"><div class="t">${esc(u.title)}</div><div class="xs muted">${esc(u.text)}</div></div></div><div class="xs muted">${fdate(u.date)}</div></div>`).join("") : `<p class="muted small">Cuando participes en un proyecto, verás aquí cada avance.</p>`}
          </section>
        </div>
        <aside class="home-side">
          <section class="panel w-gen"><div class="panel-h"><h2>Generado</h2><span class="xs muted">estimado</span></div>
            <div class="w-big num pos">+${eur(acc + Math.max(earned, 0), true)}</div>
            <div class="w-rows"><div><span>Ya cobrado</span><b class="num">${eur(Math.max(earned, 0), true)}</b></div><div><span>Pendiente (al vencimiento)</span><b class="num">${eur(acc, true)}</b></div></div>
            ${spark()}<div class="xs muted">Evolución de tu saldo en Revibit</div>
          </section>
          <section class="panel"><div class="panel-h"><h2>Tus inversiones</h2><a class="lnk" href="#/app/cartera">Ver todo</a></div>
            ${inv ? allocBar() + active().map((i) => { const p = P(i.pid); return `<button class="tx-row simple btnrow" data-act="open-project" data-id="${p.id}"><div class="tx-main"><span class="tx-ic photo">${photo(p, 0, 120, "")}</span><div class="tx-txt"><div class="t">${esc(p.name)}</div><div class="xs muted">${STATUS[p.status][0]}${p.works ? " · obra " + p.works + " %" : ""}</div></div></div><div class="tx-amt"><div class="num">${eur(i.amount)}</div><div class="xs pos num">+${eur(accrued(i), true)}</div></div></button>`; }).join("")
                  : `<div class="empty">Aún no tienes inversiones activas.<br><a class="btn btn-brand btn-sm" style="margin-top:12px" href="#/app/proyectos">Explorar proyectos</a></div>`}
          </section>
          ${next ? `<section class="panel"><div class="panel-h"><h2>Próximo cobro</h2><span class="xs muted">previsto</span></div><div class="w-big num">${eur(next.i.amount + ret(next.i.amount, next.p).net, true)}</div><div class="small muted">${fdate(next.p.end)} · ${esc(next.p.name)} · neto</div></section>` : ""}
          <section class="panel"><div class="panel-h"><h2>Para ti</h2><a class="lnk" href="#/app/proyectos">Ver todos</a></div>
            ${open.slice(0, 3).map((p) => { const f = Math.round((raisedOf(p) / p.round) * 100); return `<button class="tx-row simple btnrow" data-act="open-project" data-id="${p.id}"><div class="tx-main"><span class="tx-ic photo">${photo(p, 0, 120, "")}</span><div class="tx-txt"><div class="t">${esc(p.name)}</div><div class="xs muted">${pct(p.rate)} anual · ${p.months} meses · ${f} % financiado</div></div></div></button>`; }).join("")}
          </section>
          <p class="xs muted side-legal">Datos y proyectos ficticios. En el producto real, cada ficha fija su rentabilidad bruta y su plazo.</p>
        </aside>
      </div>`);
  }
  function allocBar() {
    const by = {}; active().forEach((i) => (by[i.pid] = (by[i.pid] || 0) + i.amount));
    const BR = ["#00ffb3", "#00b383", "#7fe9cf", "#0e7a5c"];
    const parts = Object.entries(by).map(([pid, a], k) => ({ p: P(pid), a, c: BR[k % BR.length] }));
    return `<div class="alloc" aria-hidden="true">${parts.map((x) => `<span style="flex:${x.a};background:${x.c}"></span>`).join("")}<span style="flex:${Math.max(S.cash, 0.0001)};background:var(--surface-2)"></span></div>
      <div class="legend">${parts.map((x) => `<span><i style="background:${x.c}"></i>${esc(x.p.name)}</span>`).join("")}<span><i style="background:var(--surface-2);border:1px solid var(--border)"></i>Disponible</span></div><div class="divider" style="margin-bottom:4px"></div>`;
  }

  // ---------- Proyectos ----------
  let filter = "all", sort = "recent";
  function viewProjects() {
    const F = [["all", "Todos"], ["open", "Abiertos"], ["fav", "Guardados"], ["funded", "En reforma"], ["done", "Completados"], ["soon", "Próximamente"], ["study", "En estudio"]];
    let list = PROJECTS.filter((p) => filter === "all" || (filter === "fav" ? S.favs[p.id] : p.status === filter));
    const order = { open: 0, soon: 1, funded: 2, study: 3, done: 4 };
    list = list.slice().sort({
      recent: (a, b) => order[a.status] - order[b.status],
      rate: (a, b) => b.rate - a.rate,
      short: (a, b) => a.months - b.months,
      funded: (a, b) => raisedOf(b) / b.round - raisedOf(a) / a.round
    }[sort]);
    return shell("proyectos", `${kycBanner()}
      <div class="page-head"><div><h1 class="h2">Invertir</h1><div class="small muted">${PROJECTS.filter((p) => p.status === "open").length} proyectos abiertos ahora</div></div><span class="pill pill-fict">Ejemplos ficticios</span></div>
      <div class="filters" role="group" aria-label="Filtrar">${F.map(([k, t]) => `<button class="chip" data-act="filter" data-f="${k}" aria-pressed="${filter === k}">${t}</button>`).join("")}</div>
      <div class="toolbar"><span class="small muted">${list.length} proyecto${list.length === 1 ? "" : "s"}</span>
        <label class="small row" style="gap:6px">Ordenar <select data-act="sort" aria-label="Ordenar proyectos">${[["recent", "Relevancia"], ["rate", "Mayor rentabilidad"], ["short", "Menor plazo"], ["funded", "Más financiado"]].map(([k, t]) => `<option value="${k}" ${sort === k ? "selected" : ""}>${t}</option>`).join("")}</select></label></div>
      <div class="proj-grid">${list.map((p) => projCard(p)).join("") || `<div class="empty">Nada por aquí. ${filter === "fav" ? "Guarda proyectos con el." : ""}</div>`}</div>`);
  }

  // ---------- Ficha de proyecto ----------
  let tab = "resumen", simAmt = 1000;
  function viewProject(id) {
    const p = P(id); if (!p) return viewProjects();
    const [st, cls] = STATUS[p.status];
    const mine = S.investments.filter((i) => i.pid === p.id && i.status !== "cancelled").reduce((a, i) => a + i.amount, 0);
    const raised = raisedOf(p), units = p.round / UNIDAD, left = p.round - raised, d = p.status === "open" ? daysTo(p.closes) : null;
    const T = [["resumen", "Resumen"], ["numeros", "Números"], ["ubicacion", "Ubicación"], ["riesgos", "Riesgos"], ["obra", "Avances"], ["detalles", "Participación"], ["docs", "Documentos"]];
    const tot = p.budget.reduce((a, b) => a + b[1], 0);
    const structCost = p.budget.filter(([k]) => /Estructuración|reserva/i.test(k)).reduce((a, b) => a + b[1], 0);
    let pane = "";
    if (tab === "resumen") pane = `<div class="card"><p style="margin-top:0">${esc(p.summary)}</p>
        <div class="feat-grid">
          <div><span>Superficie</span><b>${p.m2} m²</b></div><div><span>Habitaciones</span><b>${p.beds}</b></div><div><span>Baños</span><b>${p.baths}</b></div>
          <div><span>Planta</span><b>${esc(p.floor)}</b></div><div><span>Ascensor</span><b>${p.lift ? "Sí" : "No"}</b></div><div><span>Año del edificio</span><b>${p.year}</b></div>
          <div><span>Extra</span><b>${esc(p.extraFeat)}</b></div><div><span>Certificado energético</span><b>${esc(p.energy)}</b></div><div><span>Estrategia</span><b>${esc(p.strategy)}</b></div>
        </div></div>
        <div class="card"><div class="h3" style="margin-bottom:6px">Quién está detrás</div>
          <div class="kv"><span>Promotor y responsable</span><strong>Revibit</strong></div>
          <div class="kv"><span>Socio ejecutor</span><strong>${esc(p.partner)}</strong></div>
          <div class="kv"><span>Revibit y su equipo ponen</span><strong>${eur(p.skin)} (${Math.round((p.skin / p.round) * 100)} %)</strong></div>
          <div class="kv"><span>Garantía</span><strong style="max-width:62%">${esc(p.guarantee)}</strong></div></div>
        <div class="card"><div class="h3" style="margin-bottom:14px">Calendario</div><ol class="timeline">${p.timeline.map(([t, s]) => `<li class="${s}"><strong>${esc(t)}</strong>${s === "now" ? ' <span class="pill pill-brand">Ahora</span>' : ""}</li>`).join("")}</ol>
          ${p.start ? `<div class="kv"><span>Inicio de la rentabilidad</span><strong>${fdate(p.start)}</strong></div><div class="kv"><span>Vencimiento previsto</span><strong>${fdate(p.end)}</strong></div>` : ""}</div>`;
    if (tab === "numeros") {
      const sc = scenarios(p);
      pane = `<div class="card"><div class="h3" style="margin-bottom:8px">¿A dónde va el dinero?</div>
        <div class="split" aria-hidden="true"><span style="flex:${tot - structCost};background:var(--brand)"></span><span style="flex:${structCost};background:var(--warn)"></span></div>
        <div class="legend" style="margin-bottom:10px"><span><i style="background:var(--brand)"></i>Al inmueble y la obra · ${pct((tot - structCost) / tot, 0)}</span><span><i style="background:var(--warn)"></i>Estructura y reserva · ${pct(structCost / tot, 0)}</span></div>
        <table class="bar-table"><tbody>${p.budget.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${eur(v)}</td></tr>`).join("")}<tr class="total"><td>Ronda</td><td class="num">${eur(tot)}</td></tr></tbody></table></div>
        <div class="card"><div class="h3" style="margin-bottom:8px">Valor y venta</div>
          <div class="kv"><span>Tasación tras la reforma</span><strong>${eur(p.appraisal)}</strong></div>
          <div class="kv"><span>LTV (ronda / tasación)</span><strong>${pct(p.round / p.appraisal, 0)}</strong></div>
          <div class="kv"><span>Venta prevista</span><strong>${eur(p.sale)} · ${num(p.sale / p.m2)} €/m²</strong></div>
          <div class="kv"><span>Tú cobras íntegro si se vende por encima de</span><strong>≈ ${num(p.breakEven)} €/m²</strong></div>
          ${p.soldPm2 ? `<div class="kv"><span>Vendido finalmente a</span><strong class="pos">${num(p.soldPm2)} €/m²</strong></div>` : ""}
          <p class="xs muted" style="margin:8px 0 0">Tasación de ejemplo [F]. En el producto real la hace una tasadora homologada.</p></div>
        <div class="card"><div class="h3" style="margin-bottom:4px">¿Y si sale peor?</div><p class="small muted" style="margin-top:0">Qué pasaría con tu dinero según el precio de venta.</p>
          <table class="scen"><thead><tr><th>Escenario</th><th>Venta €/m²</th><th>Tú recibes</th><th>Revibit</th></tr></thead><tbody>
          ${sc.map((s) => `<tr><td>${s.name}</td><td class="num">${num(s.pm2)}</td><td class="num ${s.full ? "ok" : "ko"}">${s.full ? "100 % + " + pct(p.total) : pct(s.back, 0) + " del capital"}</td><td class="num ${s.rev >= 0 ? "" : "ko"}">${s.rev >= 0 ? "+" : ""}${eur(s.rev)}</td></tr>`).join("")}
          </tbody></table><p class="xs muted" style="margin:8px 0 0">Simplificado: no incluye la ejecución de la garantía ni el fondo de reserva. Tú cobras antes que Revibit.</p></div>`;
    }
    if (tab === "ubicacion") {
      const [la, lo] = p.geo, dd = 0.006;
      pane = `<div class="card"><iframe class="map" title="Mapa de la zona de ${esc(p.zone)}" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${lo - dd}%2C${la - dd * 0.7}%2C${lo + dd}%2C${la + dd * 0.7}&layer=mapnik&marker=${la}%2C${lo}"></iframe>
        <p class="xs muted">${ic("pin", 14)} Ubicación aproximada de la zona. La dirección exacta se da en la ficha definitiva.</p></div>
        <div class="card"><div class="h3" style="margin-bottom:6px">El barrio · ${esc(p.zone)}</div>${p.barrio.map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}<p class="xs muted" style="margin:8px 0 0">Datos de ejemplo [F]. En el producto real, con fuente (notarios, Registro, agencias).</p></div>`;
    }
    if (tab === "riesgos") pane = `<div class="card"><div class="notice danger" style="margin-bottom:12px"><strong>Puedes perder parte o todo lo que inviertas.</strong> Pon solo dinero que no vayas a necesitar durante el plazo.</div><ul>${p.risks.map((r) => `<li style="margin-bottom:8px">${esc(r)}</li>`).join("")}</ul>
        <p class="small muted">Las rentabilidades son objetivos fijados en la ficha, no promesas: dependen de que el proyecto salga como está previsto.</p></div>`;
    if (tab === "obra") pane = `<div class="card">${p.works != null ? `<div class="row between"><strong>Avance de obra</strong><strong>${p.works} %</strong></div><div class="progress" style="margin:8px 0 16px"><span style="width:${p.works}%"></span></div>` : ""}
        ${p.updates.length ? p.updates.map((u) => `<div class="list-item" style="align-items:flex-start"><div class="av">${ic("tool", 20)}</div><div class="grow"><div class="t">${esc(u.title)}</div><div class="xs muted">${fdate(u.date)}</div><p class="small" style="margin:6px 0 0">${esc(u.text)}</p></div></div>`).join("") : `<p class="muted">Todavía no hay avances. Aquí verás cada paso con fotos.</p>`}</div>`;
    if (tab === "detalles") pane = `<div class="card">
        <div class="kv"><span>Serie</span><strong class="num">${p.code}</strong></div>
        <div class="kv"><span>Emisor</span><strong>${esc(p.spv)}</strong></div>
        <div class="kv"><span>Instrumento</span><strong>Préstamo participativo con rentabilidad fija (por confirmar)</strong></div>
        <div class="kv"><span>Precio por participación</span><strong>${eur(UNIDAD)}</strong></div>
        <div class="kv"><span>Participaciones emitidas</span><strong>${num(units)}</strong></div>
        <div class="kv"><span>Disponibles</span><strong>${num(left / UNIDAD)}</strong></div>
        <div class="kv"><span>Tipo de cobro</span><strong>Al vencimiento (pago único)</strong></div>
        <div class="kv"><span>Fiscalidad</span><strong>Retención del ${RETENCION * 100} % sobre los rendimientos</strong></div>
        <div class="kv"><span>Registro</span><strong>Por decidir (tokenización en estudio)</strong></div></div>`;
    if (tab === "docs") pane = `<div class="card">${["Ficha del proyecto", "Hoja de datos clave de la inversión", "Acuerdo de suscripción", "Nota simple del Registro", "Informe de tasación", "Presupuesto de obra", "Escrituras de la sociedad del proyecto"].map((x) => `<button class="list-item" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;cursor:pointer;text-align:left" data-act="toast" data-msg="Documento de ejemplo: en la versión real se descarga el PDF"><div class="av">${ic("doc", 20)}</div><div class="grow"><div class="t">${x}</div><div class="xs muted">PDF · ejemplo</div></div>${ic("down", 18)}</button>`).join("")}</div>`;

    let cta = "";
    if (p.status === "open") cta = `<div class="sim"><label class="small" for="sim">Si inviertes <strong id="sim-v">${eur(simAmt)}</strong></label><input id="sim" type="range" min="500" max="${Math.min(10000, left)}" step="100" value="${Math.min(simAmt, left)}" data-id="${p.id}">
        <div class="kv"><span>Recibirías (neto)</span><strong class="pos num" id="sim-r">${eur(Math.min(simAmt, left) + ret(Math.min(simAmt, left), p).net, true)}</strong></div></div>
        <button class="btn btn-brand btn-block" data-act="invest" data-id="${p.id}" style="margin-top:10px">Invertir</button>`;
    else if (p.status === "soon") cta = S.waitlist[p.id] ? `<button class="btn btn-ghost btn-block" data-act="waitlist" data-id="${p.id}">${ic("check", 18)} Te avisaremos</button>` : `<button class="btn btn-primary btn-block" data-act="waitlist" data-id="${p.id}">Avísame cuando abra</button>`;
    else if (p.status === "funded") cta = `<div class="notice">Ronda completa. ${mine ? "Tienes " + eur(mine) + " aquí." : ""}</div>`;
    else if (p.status === "done") cta = `<div class="notice">Proyecto completado y pagado el ${fdate(p.paidOn)}. ${mine ? "Participaste con " + eur(mine) + "." : ""}</div>`;
    else cta = `<div class="notice">En estudio. Las cifras son orientativas.</div>`;

    return shell("proyectos", `
      <div class="page-head"><a class="btn btn-ghost btn-sm" href="#/app/proyectos">${ic("back", 18)} Volver</a><div class="row" style="gap:8px"><span class="pill pill-fict">Ficticio</span>${favBtn(p)}</div></div>
      <div class="gallery" aria-label="Fotos ilustrativas">${p.photos.map((x, i) => `<figure>${photo(p, i, 1200)}<figcaption>${esc(x[1])} · ilustrativa</figcaption></figure>`).join("")}</div>
      ${p.photos.length > 1 ? `<div class="dots" aria-hidden="true">${p.photos.map(() => "<span></span>").join("")}</div>` : ""}
      <div class="detail-grid">
        <div>
          <div class="row wrap" style="gap:8px"><span class="pill ${cls}">${st}</span><span class="pill">${ic("stairs", 14)} Peldaño ${p.step}</span><span class="pill">${p.code}</span></div>
          <h1 class="h2" style="margin:10px 0 4px">${esc(p.name)}</h1><p class="muted" style="margin-top:0">${ic("pin", 15)} ${esc(p.zone)}, Cartagena · ${esc(p.kind)}</p>
          <div class="tabs" role="tablist">${T.map(([k, t]) => `<button role="tab" aria-selected="${tab === k}" data-act="tab" data-t="${k}">${t}</button>`).join("")}</div>
          ${pane}
        </div>
        <div class="card sticky-card">
          <div class="row between" style="align-items:flex-start"><div><div class="xs muted">Rentabilidad anual</div><div style="font-size:32px;font-weight:700;letter-spacing:-.02em">${pct(p.rate)}</div><div class="xs muted">bruta · fija en la ficha</div></div>
            <div style="text-align:right"><div class="xs muted">Total en ${p.months} meses</div><div style="font-size:22px;font-weight:700">${pct(p.total)}</div><div class="xs muted">cobro al final</div></div></div>
          <div class="divider"></div>
          ${["open", "funded", "done"].includes(p.status) ? progress(p) : ""}
          <div class="kv"><span>Mínimo</span><strong>${eur(p.min)}</strong></div>
          <div class="kv"><span>Inversores</span><strong>${p.investors + (p.status === "open" && mineIn(p).length ? 1 : 0)}</strong></div>
          ${d != null ? `<div class="kv"><span>Cierre</span><strong>${d > 0 ? "en " + d + " días" : "hoy"}</strong></div>` : ""}
          ${mine ? `<div class="kv"><span>Lo tuyo</span><strong class="pos">${eur(mine)}</strong></div>` : ""}
          <div style="margin-top:12px">${cta}</div>
          <p class="xs muted" style="margin:10px 0 0">Rentabilidad objetivo, no garantizada. Ejemplo ficticio.</p>
        </div>
      </div>`);
  }
  const progress = (p) => { const r = raisedOf(p), f = Math.round((r / p.round) * 100); return `<div class="progress" aria-label="Financiado ${f} %"><span style="width:${f}%"></span></div><div class="row between xs muted" style="margin:6px 0 4px"><span>${eur(r)} de ${eur(p.round)}</span><span>${f} %</span></div>`; };
  function scenarios(p) {
    const base = p.sale / p.m2, inv = p.round * p.total;
    return [["Optimista", 1.08], ["Base", 1], ["Pesimista", 0.85], ["Muy malo", 0.65]].map(([name, k]) => {
      const pm2 = base * k, net = pm2 * p.m2 * (1 - COMISION_VENTA), owed = p.round + inv;
      const full = net >= owed;
      return { name, pm2, full, back: Math.min(1, net / p.round), rev: Math.round((net - owed) / 100) * 100 };
    });
  }

  // ---------- Cartera ----------
  let ctab = "activas";
  function viewWallet() {
    const inv = invested(), acc = active().reduce((a, i) => a + accrued(i), 0);
    const T = [["activas", "Activas"], ["cerradas", "Completadas"], ["movimientos", "Movimientos"], ["docs", "Documentos"]];
    let pane = "";
    const posCard = (i) => {
      const p = P(i.pid), r = ret(i.amount, p);
      const el = p.status === "open" ? 0 : Math.round(Math.min(1, monthsBetween(p.start, today()) / p.months) * 100);
      const canCancel = i.status === "active" && new Date(i.reflectUntil) > new Date();
      return `<div class="card"><div class="list-item" style="border:0;padding-top:0"><div class="av photo">${photo(p, 0, 120, "")}</div><div class="grow"><div class="t">${esc(p.name)}</div><div class="xs muted">${i.amount / UNIDAD} participaciones · ${p.code}</div></div><div class="amt num">${eur(i.amount)}</div></div>
        ${i.status === "repaid" ? `<div class="kv"><span>Cobrado (neto)</span><strong class="pos num">${eur(i.amount + r.net, true)}</strong></div><div class="kv"><span>Fecha de cobro</span><strong>${fdate(p.paidOn)}</strong></div>`
          : `<div class="kv"><span>Generado hasta hoy (estimado)</span><strong class="pos num">+${eur(accrued(i), true)}</strong></div>
             <div class="kv"><span>Al vencimiento, bruto</span><strong class="num">+${eur(r.gross, true)}</strong></div>
             <div class="kv"><span>Retención (${RETENCION * 100} %)</span><strong class="num">−${eur(r.tax, true)}</strong></div>
             <div class="kv"><span>Vencimiento previsto</span><strong>${p.end ? fdate(p.end) : "—"}</strong></div>
             <div class="xs muted" style="margin:8px 0 6px">${p.status === "open" ? "Empieza a contar al cerrar la ronda" : "Plazo transcurrido · " + el + " %"}</div><div class="progress"><span style="width:${el}%"></span></div>`}
        <div class="row wrap" style="margin-top:14px;gap:8px"><button class="btn btn-ghost btn-sm" data-act="open-project" data-id="${p.id}">Ver proyecto</button><button class="btn btn-ghost btn-sm" data-act="registry" data-id="${i.id}">Registro</button>
        ${canCancel ? `<button class="btn btn-outline btn-sm" data-act="cancel" data-id="${i.id}">Desistir (hasta ${fdate(i.reflectUntil)})</button>` : ""}</div></div>`;
    };
    if (ctab === "activas") pane = active().length ? active().map(posCard).join("") : `<div class="card empty">Sin inversiones activas.<br><a class="btn btn-brand btn-sm" style="margin-top:12px" href="#/app/proyectos">Explorar proyectos</a></div>`;
    if (ctab === "cerradas") { const c = S.investments.filter((i) => i.status === "repaid"); pane = c.length ? c.map(posCard).join("") : `<div class="card empty">Aún no se ha completado ninguno de tus proyectos.</div>`; }
    if (ctab === "movimientos") pane = `<section class="panel tx"><div class="tx-head d-only"><span>Movimiento</span><span>Fecha</span><span>Estado</span><span>Importe</span></div>${S.movements.length ? [...S.movements].sort((a, b) => new Date(b.date) - new Date(a.date)).map(txRow).join("") : `<div class="empty">Sin movimientos.</div>`}</section>`;
    if (ctab === "docs") pane = `<div class="card">${["Contratos de inversión", "Certificado fiscal 2025 (para la Renta)", "Extracto de movimientos"].map((d) => `<button class="list-item" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;cursor:pointer;text-align:left" data-act="toast" data-msg="Documento de ejemplo"><div class="av">${ic("doc", 20)}</div><div class="grow"><div class="t">${d}</div></div>${ic("down", 18)}</button>`).join("")}</div>`;
    return shell("cartera", `${kycBanner()}
      <section class="bal" aria-label="Saldo disponible">
        <div class="bal-l"><div class="xs muted" style="margin-bottom:4px">Cartera · disponible</div><div class="bal-amt num">${eur(S.cash, true).replace(/\s?€/, "").replace(/,(\d\d)$/, "<small>,$1</small>")} €</div>
          <div class="bal-sub">Invertido ${eur(inv)}${acc ? " · generado +" + eur(acc, true) + " (estimado)" : ""}</div></div>
        <div class="bal-actions"><button class="pa" data-act="add-funds"><span class="pi">${ic("plus", 18)}</span><span>Añadir</span></button><button class="pa" data-act="withdraw"><span class="pi">${ic("up", 18)}</span><span>Retirar</span></button><button class="pa" data-act="ctab" data-t="docs"><span class="pi">${ic("doc", 18)}</span><span>Documentos</span></button></div>
      </section>
      <div class="tabs" role="tablist" style="margin-top:16px">${T.map(([k, t]) => `<button role="tab" aria-selected="${ctab === k}" data-act="ctab" data-t="${k}">${t}</button>`).join("")}</div>
      ${pane}`);
  }

  // ---------- Perfil ----------
  function viewProfile() {
    const u = S.user, n = S.prefs.notif;
    const sw = (k, t) => `<div class="kv" style="align-items:center"><span>${t}</span><label class="switch"><input type="checkbox" data-act="notif" data-k="${k}" ${n[k] ? "checked" : ""} aria-label="${t}"><span></span></label></div>`;
    return shell("perfil", `
      <div class="page-head"><h1 class="h2">Perfil</h1></div>
      <div class="card row"><div style="width:56px;height:56px;border-radius:999px;background:var(--hero-grad);color:#fff;display:grid;place-items:center;font-weight:700;font-size:22px">${esc((u.name || u.email || "?")[0].toUpperCase())}</div><div><div class="h3">${esc(u.name || "Sin nombre")}</div><div class="small muted">${esc(u.email)}</div></div></div>
      <div class="card"><div class="h3" style="margin-bottom:6px">Tu cuenta</div>
        <div class="kv"><span>Identidad</span><strong>${u.kyc === "done" ? '<span class="pill pill-brand">Verificada</span>' : '<a href="#/alta/2">Verificar</a>'}</strong></div>
        <div class="kv"><span>Test de conocimientos</span><strong>${u.test === "ok" ? "Superado" : u.test === "warn" ? '<span class="pill pill-warn">Con avisos</span>' : '<a href="#/alta/3">Hacer</a>'}</strong></div>
        <div class="kv"><span>Puedes asumir pérdidas de hasta</span><strong>${lossCap() != null ? eur(lossCap()) : '<a href="#/alta/4">Calcular</a>'}</strong></div>
        <div class="kv"><span>Te avisamos si inviertes más de</span><strong>${eur(warnLimit())} por proyecto</strong></div>
        <div class="kv"><span>Residencia</span><strong>${esc(u.country || "—")}</strong></div>
        <div class="kv"><span>Cuenta bancaria</span><strong>${u.kyc === "done" ? "Verificada (simulada)" : "—"}</strong></div></div>
      <div class="card"><div class="h3" style="margin-bottom:6px">Notificaciones</div>${sw("obra", "Avances de obra")}${sw("nuevos", "Nuevos proyectos")}${sw("cobros", "Cobros y vencimientos")}</div>
      <div class="card"><div class="h3" style="margin-bottom:10px">Apariencia</div>
        <div class="tabs" role="radiogroup" aria-label="Tema">${[["system", "Sistema"], ["light", "Claro"], ["dark", "Oscuro"]].map(([k, t]) => `<button role="radio" aria-checked="${S.prefs.theme === k}" aria-selected="${S.prefs.theme === k}" data-act="theme" data-t="${k}">${t}</button>`).join("")}</div></div>
      <div class="card stack"><button class="btn btn-outline btn-block" data-act="reset">Reiniciar la demo</button><button class="btn btn-ghost btn-block" data-act="logout">Cerrar sesión</button>
        <p class="xs muted" style="text-align:center">Prototipo de Revibit · sin backend · los datos viven solo en este navegador.<br>Fotos ilustrativas de Unsplash.</p></div>`);
  }

  // ---------- Hojas ----------
  let lastFocus = null;
  function sheet(title, body) {
    lastFocus = document.activeElement;
    $("#overlay").innerHTML = `<div class="sheet-backdrop" data-act="close-bg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t">
      <div class="sheet-head"><h2 class="h3" id="sheet-t">${title}</h2><button class="icon-btn" data-act="close" aria-label="Cerrar">${ic("x", 18)}</button></div>
      <div class="sheet-body">${body}</div></div></div>`;
    const f = $("#overlay input, #overlay a, #overlay button:not([data-act=close])"); (f || $("#overlay .sheet")).focus();
  }
  const closeSheet = () => { $("#overlay").innerHTML = ""; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); };
  function amountField(value, presets, hint) {
    return `<div class="amount-input"><label class="sr-only" for="amt">Importe en euros</label><input id="amt" inputmode="numeric" autocomplete="off" value="${value}" aria-describedby="amt-hint"><div class="cur">EUR</div></div>
      <div class="presets">${presets.map((v) => `<button class="chip" type="button" data-act="preset" data-v="${v}">${eur(v)}</button>`).join("")}</div><div id="amt-hint" class="small muted" style="text-align:center;min-height:21px">${hint || ""}</div>`;
  }
  const readAmt = () => parseInt(($("#amt")?.value || "").replace(/\D/g, ""), 10) || 0;

  function investSheet(p, amount) {
    if (S.user.kyc !== "done" || !S.user.test || S.user.nw == null) { sheet("Antes de invertir", `<p>Te faltan un par de pasos: verificar tu identidad, el test y calcular cuánto podrías perder. 3 minutos.</p><a class="btn btn-primary btn-block" href="#/alta/${!S.user.name ? 1 : S.user.kyc !== "done" ? 2 : !S.user.test ? 3 : 4}" data-act="close-nav">Vamos</a>`); return; }
    const left = p.round - raisedOf(p), a = amount || Math.min(simAmt, left);
    sheet(`Invertir en ${esc(p.name)}`, `<div class="stepper"><span class="on"></span><span></span><span></span></div>
      ${amountField(a, [500, 1000, 2500, 5000].filter((v) => v <= left), "")}<div id="calc"></div>
      <button class="btn btn-primary btn-block" data-act="invest-review" data-id="${p.id}" style="margin-top:14px">Revisar</button>`);
    calc(p);
  }
  function calc(p) {
    const a = readAmt(), left = p.round - raisedOf(p), r = ret(a, p);
    let err = "";
    if (a < p.min) err = `Uy, el mínimo son ${eur(p.min)}.`;
    else if (a % UNIDAD) err = `Tiene que ser múltiplo de ${eur(UNIDAD)} (1 participación = ${eur(UNIDAD)}).`;
    else if (a > left) err = `Solo quedan ${eur(left)} por financiar.`;
    $("#amt-hint").textContent = err || `${a / UNIDAD} participaciones · tienes ${eur(S.cash)} disponibles`;
    $("#amt-hint").style.color = err ? "var(--danger)" : "";
    $("#calc").innerHTML = `<div class="kv"><span>Rentabilidad bruta (${p.months} meses)</span><strong class="pos num">+${eur(r.gross, true)}</strong></div>
      <div class="kv"><span>Retención (${RETENCION * 100} %)</span><strong class="num">−${eur(r.tax, true)}</strong></div>
      <div class="kv"><span>Recibirías el ${p.end ? fdate(p.end) : "—"}</span><strong class="num">${eur(a + r.net, true)}</strong></div>`;
    const b = $("[data-act=invest-review]"); if (b) b.disabled = !!err;
  }
  function reviewSheet(p, a) {
    const r = ret(a, p), short = Math.ceil(a - S.cash), warn = S.user.test === "warn", over = a > warnLimit();
    sheet("Revisa y confirma", `<div class="stepper"><span class="on"></span><span class="on"></span><span></span></div>
      <div class="kv"><span>Proyecto</span><strong>${esc(p.name)}</strong></div><div class="kv"><span>Importe</span><strong class="num">${eur(a)} · ${a / UNIDAD} participaciones</strong></div>
      <div class="kv"><span>Rentabilidad</span><strong>${pct(p.rate)} anual bruta, fija</strong></div><div class="kv"><span>Plazo</span><strong>${p.months} meses desde el cierre</strong></div>
      <div class="kv"><span>Neto previsto al final</span><strong class="pos num">${eur(a + r.net, true)}</strong></div><div class="kv"><span>Comisiones para ti</span><strong>0 €</strong></div>
      ${warn ? `<div class="notice warn" style="margin-top:12px">Según tu test, esto puede no encajar contigo. Échale un ojo a los riesgos antes.</div>` : ""}
      <div class="notice" style="margin-top:12px">Tienes <strong>${REFLEXION_DIAS} días</strong> para echarte atrás sin coste, desde la cartera.</div>
      <form class="stack" data-form="confirm" data-id="${p.id}" data-a="${a}" style="margin-top:14px">
        <label class="check"><input type="checkbox" required><span>He leído la ficha, la hoja de datos clave y los riesgos.</span></label>
        <label class="check"><input type="checkbox" required><span>Entiendo que puedo perder parte o todo y que, en general, no podré sacar el dinero antes del vencimiento.</span></label>
        ${over ? `<label class="check"><input type="checkbox" required><span>Sé que invierto más de ${eur(warnLimit())} en un solo proyecto, por encima de lo recomendado para mi patrimonio.</span></label>` : ""}
        ${short > 0 ? `<div class="notice warn">Te faltan ${eur(short)}.</div><button class="btn btn-primary btn-block" type="button" data-act="add-funds" data-need="${short}" data-back="${p.id}|${a}">Añadir ${eur(short)}</button>`
                    : `<button class="btn btn-brand btn-block" type="submit">Invertir ${eur(a)}</button>`}
      </form>`);
  }
  function successSheet(p, a) {
    sheet("¡Hecho!", `<div class="stepper"><span class="on"></span><span class="on"></span><span class="on"></span></div>
      <div class="success-ico">${ic("check", 38)}</div><p style="text-align:center;font-size:18px">Ya formas parte de <strong>${esc(p.name)}</strong></p>
      <p class="small muted" style="text-align:center">${eur(a)} · ${a / UNIDAD} participaciones. Te avisaremos de cada avance de la obra.</p>
      <a class="btn btn-primary btn-block" href="#/app/cartera" data-act="close-nav">Ver mi cartera</a>`);
  }
  const fundsSheet = (need, back) => sheet("Añadir dinero", `${amountField(Math.ceil(need) || 1000, [500, 1000, 2500, 5000], "Por transferencia (simulada) · gratis")}
      <div class="notice small">En la versión real, tu dinero lo guarda una entidad de pago autorizada, no Revibit.</div>
      <button class="btn btn-brand btn-block" style="margin-top:14px" data-act="funds-ok" data-back="${back || ""}">Añadir</button>`);
  const withdrawSheet = () => sheet("Retirar a tu banco", `${amountField(Math.min(Math.floor(S.cash), 500), [100, 500, 1000].filter((v) => v <= S.cash), `Disponible: ${eur(S.cash, true)}`)}
      <div class="kv"><span>A</span><strong>Tu cuenta bancaria (simulada)</strong></div><div class="kv"><span>Llega</span><strong>En 1 día hábil · gratis</strong></div>
      <button class="btn btn-primary btn-block" style="margin-top:14px" data-act="withdraw-ok">Retirar</button>`);
  function registrySheet(inv) {
    const p = P(inv.pid);
    sheet("Tu participación", `<div class="kv"><span>Proyecto</span><strong>${esc(p.name)}</strong></div><div class="kv"><span>Serie</span><strong>${p.code}</strong></div>
      <div class="kv"><span>Participaciones</span><strong>${inv.amount / UNIDAD} × ${eur(UNIDAD)}</strong></div><div class="kv"><span>Fecha</span><strong>${fdate(inv.date)}</strong></div>
      <div class="kv"><span>Identificador</span><strong class="num">${p.code}-${inv.id.toUpperCase()}</strong></div>
      <div class="notice" style="margin-top:12px">Está por decidir si se usa tokenización (D4). Si se usa, aquí enlazaríamos el registro público. Para ti no cambia nada: todo en euros.</div>`);
  }
  function notifSheet() {
    const L = notifications(); S.readNotif = L.length; save();
    sheet("Notificaciones", L.map((n) => `<div class="list-item"><div class="av">${ic(n.title.startsWith("Nuevo") ? "spark" : "tool", 20)}</div><div class="grow"><div class="t">${esc(n.title)}</div><div class="xs muted">${esc(n.text)} · ${fdate(n.date)}</div></div></div>`).join("") || `<p class="muted">Nada nuevo.</p>`);
    render();
  }

  // ---------- Router ----------
  function render() {
    if (!local && !gateOk()) { showGate(false); return; }
    const parts = (location.hash || "#/").replace(/^#\/?/, "").split("/").filter(Boolean);
    const [a, b, c] = parts;
    let html;
    if (!a) html = viewLanding();
    else if (a === "entrar") { if (S.user) { location.hash = "#/app"; return; } html = viewLogin(); }
    else if (a === "alta") { if (!S.user) { location.hash = "#/entrar"; return; } html = viewOnboarding(b); }
    else if (a === "app") {
      if (!S.user) { location.hash = "#/entrar"; return; }
      html = !b ? viewHome() : b === "proyectos" ? (c ? viewProject(c) : viewProjects()) : b === "cartera" ? viewWallet() : b === "perfil" ? viewProfile() : viewHome();
    } else if (["como", "proyectos", "faq", "interes", "por-que"].includes(a)) {
      if (!$(".pub-hero")) $("#root").innerHTML = viewLanding();
      const el = document.getElementById(a); if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    } else html = viewLanding();
    $("#root").innerHTML = html;
    document.title = "Revibit · " + (a === "app" ? (NAV.find((n) => n[0] === (b || "inicio"))?.[1] || "App") : a === "entrar" ? "Entrar" : a === "alta" ? "Alta" : "Prototipo");
  }
  let prevRoute = "";
  window.addEventListener("hashchange", () => {
    const route = location.hash.split("/").slice(0, 4).join("/");
    if (route !== prevRoute && !/^#(como|proyectos|faq|interes|por-que)$/.test(location.hash)) { window.scrollTo(0, 0); tab = "resumen"; }
    prevRoute = route; render();
    if (/^#\/(app|alta)/.test(location.hash)) $("#root").focus({ preventScroll: true });
  });

  const toast = (msg) => { const t = $("#toast"); t.innerHTML = `<div class="toast">${esc(msg)}</div>`; clearTimeout(toast.t); toast.t = setTimeout(() => (t.innerHTML = ""), 2600); };
  const move = (type, label, amount) => S.movements.push({ type, label, amount, date: today() });

  // ---------- Acciones ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    if (act === "close-bg" && e.target !== el) return;
    if (act === "fav") e.stopPropagation();
    switch (act) {
      case "demo": demoUser(); location.hash = "#/app"; toast("¡Bienvenida, Ana! (cuenta demo)"); break;
      case "go": location.hash = el.dataset.to; break;
      case "toast": toast(el.dataset.msg); break;
      case "open-project": closeSheet(); location.hash = S.user ? "#/app/proyectos/" + id : "#/entrar"; break;
      case "fav": S.favs[id] = !S.favs[id]; save(); render(); toast(S.favs[id] ? "Guardado" : "Quitado de guardados"); break;
      case "filter": filter = el.dataset.f; render(); break;
      case "tab": tab = el.dataset.t; render(); break;
      case "ctab": ctab = el.dataset.t; render(); break;
      case "see-moves": ctab = "movimientos"; if (location.hash === "#/app/cartera") render(); else location.hash = "#/app/cartera"; break;
      case "notifs": notifSheet(); break;
      case "invest": investSheet(P(id)); break;
      case "preset": $("#amt").value = el.dataset.v; $("#amt").dispatchEvent(new Event("input", { bubbles: true })); break;
      case "invest-review": reviewSheet(P(id), readAmt()); break;
      case "add-funds": fundsSheet(parseInt(el.dataset.need, 10) || 0, el.dataset.back); break;
      case "funds-ok": {
        const a = readAmt(); if (a < 10) { toast("Pon un importe"); break; }
        S.cash += a; move("in", "Dinero añadido (simulado)", a); save();
        const back = el.dataset.back;
        if (back) { const [pid, amt] = back.split("|"); render(); reviewSheet(P(pid), parseInt(amt, 10)); } else { closeSheet(); render(); }
        toast(`+${eur(a)} añadidos`); break;
      }
      case "withdraw": if (S.cash < 1) { toast("No tienes saldo disponible"); break; } withdrawSheet(); break;
      case "withdraw-ok": { const a = readAmt(); if (a <= 0 || a > S.cash) { toast("Importe no válido"); break; } S.cash -= a; move("out", "Retirada a tu banco (simulada)", -a); save(); closeSheet(); render(); toast(`${eur(a)} en camino a tu banco`); break; }
      case "waitlist": S.waitlist[id] = !S.waitlist[id]; save(); render(); toast(S.waitlist[id] ? "Te avisamos en cuanto abra" : "Aviso cancelado"); break;
      case "registry": registrySheet(S.investments.find((i) => i.id === id)); break;
      case "cancel": {
        const inv = S.investments.find((i) => i.id === id); if (!inv) break;
        if (!confirm(`¿Echarte atrás con ${eur(inv.amount)}? El dinero vuelve a tu saldo.`)) break;
        inv.status = "cancelled"; S.cash += inv.amount; move("in", "Desistimiento · " + P(inv.pid).name, inv.amount); save(); render(); toast("Hecho, dinero devuelto"); break;
      }
      case "kyc": el.disabled = true; el.textContent = "Verificando…"; setTimeout(() => { S.user.kyc = "done"; save(); location.hash = "#/alta/3"; }, 900); break;
      case "theme": S.prefs.theme = el.dataset.t; save(); applyTheme(); render(); break;
      case "reset": if (confirm("¿Reiniciar la demo? Se borra todo lo de este navegador.")) { S = fresh(); save(); applyTheme(); location.hash = "#/"; render(); } break;
      case "logout": S.user = null; save(); location.hash = "#/"; break;
      case "close": case "close-bg": case "close-nav": closeSheet(); break;
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("#overlay").innerHTML) closeSheet();
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("article[data-act=open-project]")) { e.preventDefault(); e.target.click(); }
  });
  document.addEventListener("change", (e) => {
    const n = e.target.closest("[data-act=notif]"); if (n) { S.prefs.notif[n.dataset.k] = n.checked; save(); }
    const s = e.target.closest("[data-act=sort]"); if (s) { sort = s.value; render(); }
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "sim") { const p = P(e.target.dataset.id), v = +e.target.value; simAmt = v; $("#sim-v").textContent = eur(v); $("#sim-r").textContent = eur(v + ret(v, p).net, true); return; }
    if (e.target.id !== "amt") return;
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 7);
    const b = $("[data-act=invest-review]"); if (b) calc(P(b.dataset.id));
  });
  document.addEventListener("submit", (e) => {
    const f = e.target.closest("[data-form]"); if (!f) return; e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    switch (f.dataset.form) {
      case "interest": S.interest.push({ ...d, date: today() }); save(); f.reset(); toast("¡Gracias! Te escribimos pronto"); break;
      case "signup": S = Object.assign(fresh(), { prefs: S.prefs }); S.user = { email: d.email, name: "", kyc: "none", test: null, nw: null, since: today() }; save(); location.hash = "#/alta/1"; break;
      case "ob1": S.user.name = d.name.trim(); S.user.country = d.country; save(); location.hash = "#/alta/2"; break;
      case "ob3": S.user.test = d.q1 === "a" && d.q2 === "b" && d.q3 === "a" ? "ok" : "warn"; save(); location.hash = "#/alta/4"; break;
      case "ob4": S.user.nw = Math.max(0, (+d.inc) + (+d.liq) - (+d.debt)); save(); location.hash = "#/alta/5"; break;
      case "confirm": {
        const p = P(f.dataset.id), a = parseInt(f.dataset.a, 10);
        if (a > S.cash) { toast("No tienes saldo suficiente"); break; }
        S.cash -= a;
        S.investments.push({ id: "i" + Date.now().toString(36), pid: p.id, amount: a, date: today(), reflectUntil: addDays(today(), REFLEXION_DIAS), status: "active" });
        move("inv", "Inversión · " + p.name, -a); save(); render(); successSheet(p, a); break;
      }
    }
  });

  // ---------- Acceso con contraseña compartida (barrera básica, no es seguridad real) ----------
  const GATE_HASH = "96b04d6957bbb0e75bb32736bdcfbe0ee336ea9f81c8f2d95b7a6f0f4ab93c1e";
  const GATE_KEY = "revibit-proto-acceso";
  // Dentro de la app nativa (Capacitor) no hace falta contraseña: la app ya es privada.
  const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  if (native) {
    document.documentElement.classList.add("native");
    // Como app se abre directamente en la cuenta (o en la pantalla de entrada si no hay sesión)
    if (!location.hash || location.hash === "#/") history.replaceState(null, "", "#/app");
    try { window.Capacitor.Plugins.StatusBar.setStyle({ style: "DARK" }); } catch (e) { /* plugin no disponible */ }
  }
  const local = native || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const gateOk = () => { try { return localStorage.getItem(GATE_KEY) === GATE_HASH; } catch (e) { return false; } };
  async function sha256(t) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  function showGate(err) {
    $("#root").innerHTML = `<div class="pub-hero auth-hero"><div class="bg"><img src="${ph("photo-1646496523246-4c7905b07db4", 1600)}" alt="" onerror="this.remove()"></div>
      <div class="inner"><header class="pub-nav"><span class="logo">Revibit<b>.</b></span></header>
        <div style="max-width:460px;margin-top:56px">
          <span class="pill">Acceso privado</span>
          <h1 class="h1" style="margin-top:16px">Prototipo<span class="dot">.</span></h1>
          <p class="lead">Solo para el equipo de Revibit. Escribe la contraseña que te han pasado.</p>
          <form class="auth-form" id="gate-form">
            <label class="sr-only" for="gate-pw">Contraseña</label>
            <input id="gate-pw" type="password" autocomplete="current-password" placeholder="Contraseña" required>
            <button class="btn btn-brand btn-block" type="submit">Entrar ${ic("arrow", 18)}</button>
          </form>
          <p class="auth-note" role="alert" style="color:${err ? "#ffb4a8" : ""}">${err ? "Contraseña incorrecta. Prueba otra vez." : "Datos y proyectos ficticios. No es una oferta de inversión."}</p>
        </div></div></div>`;
    $("#gate-form").addEventListener("submit", async (e) => {
      e.preventDefault(); e.stopPropagation();
      const h = await sha256($("#gate-pw").value.trim().toLowerCase());
      if (h === GATE_HASH) { try { localStorage.setItem(GATE_KEY, h); } catch (x) { /* sin almacenamiento */ } render(); }
      else showGate(true);
    });
    $("#gate-pw").focus();
  }

  applyTheme();
  if (local || gateOk()) render(); else showGate(false);
})();
