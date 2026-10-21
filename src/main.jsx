import React, {useState,useEffect,useRef,createContext,useContext,} from "react";
import { createRoot } from "react-dom/client";
import {ArrowRight,ArrowLeft,ArrowUpRight,Check,CheckCircle2,ChevronRight,Plus,X,Menu,Wallet,CalendarDays,Leaf,ShoppingBasket,Utensils,Users,User,LayoutDashboard,Package,SlidersHorizontal,LogOut,Search,Pencil,Trash2,Clock,Flame,RefreshCw,Info,ShieldCheck,Heart,Eye,EyeOff,AlertTriangle,ChefHat,Lightbulb,Printer,Mail,Sprout,ArrowDown,BookOpen,} from "lucide-react";
import {ingredients,recipes,slots,defaultPrefs,defaultForm,demoStock,rupiah,range,qty,getRecipe,calculate,allowed,generate,dateLabel,dateRange,} from "./model.js";
import "./style.css";
import "./workspace.css";

const Ctx = createContext();
const useApp = () => useContext(Ctx);
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem("pb-" + key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function useSaved(key, fallback) {
  const [v, s] = useState(() => read(key, fallback));
  useEffect(() => {
    localStorage.setItem("pb-" + key, JSON.stringify(v));
  }, [v]);
  return [v, s];
}
function go(path) {
  location.hash = path;
  window.scrollTo({ top: 0, behavior: "instant" });
}
function Logo() {
  return (
    <a className="logo" href="#/">
      <span className="logo-icon">
        <Sprout size={24} />
      </span>
      <span>
        pangan<em>bantu</em>
        <span className="logo-period">.</span>
      </span>
    </a>
  );
}
function Btn({
  children,
  to,
  onClick,
  variant = "primary",
  className = "",
  ...props
}) {
  return to ? (
    <a
      href={"#" + to}
      className={"btn " + variant + " " + className}
      {...props}
    >
      {children}
    </a>
  ) : (
    <button
      type="button"
      onClick={onClick}
      className={"btn " + variant + " " + className}
      {...props}
    >
      {children}
    </button>
  );
}
function Badge({ children, color = "" }) {
  return <span className={"badge " + color}>{children}</span>;
}
function Note({ children, warning = false, success = false }) {
  return (
    <div
      className={
        "info-box " +
        (warning ? "warning" : "") +
        (success ? " success-box" : "")
      }
    >
      {warning ? (
        <AlertTriangle size={18} />
      ) : success ? (
        <CheckCircle2 size={18} />
      ) : (
        <Info size={18} />
      )}
      <div>{children}</div>
    </div>
  );
}

function SourceNote() {
  return (
    <p className="source-note">
      Estimasi dari katalog simulasi PanganBantu · Pembaruan 12 Oktober 2026.
      Harga dihitung per jumlah bahan, dapat berbeda menurut daerah, musim,
      dan ukuran kemasan. Belum termasuk gas, air, serta listrik.
      Foto merupakan ilustrasi penyajian.
    </p>
  );
}

function PageHeader({ eyebrow, title, sub, children }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && (
          <div className="eyebrow">
            <span className="dot" />
            {eyebrow}
          </div>
        )}
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {children}
    </div>
  );
}
function Empty({ title, sub, icon: Icon = CalendarDays, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={29} />
      </div>
      <h2>{title}</h2>
      <p>{sub}</p>
      <div className="actions">{children}</div>
    </div>
  );
}
function Dialog({ title, sub, children, close, large = false, dismissible = true }) {
  const ref = useRef(),
    prior = useRef(document.activeElement);
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handler = (e) => {
      if (e.key === "Escape" && dismissible) close();
      if (e.key === "Tab") {
        const nodes = ref.current.querySelectorAll(
          'button:not(:disabled),a,input,select,[tabindex="0"]',
        );
        if (!nodes.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      prior.current?.focus();
    };
  }, []);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => dismissible && e.target === e.currentTarget && close()}
    >
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={"dialog " + (large ? "large" : "")}
      >
        <div className="dialog-header">
          <div>
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
          {dismissible && (
            <button className="dialog-close" aria-label="Tutup" onClick={close}>
              <X size={18} />
            </button>
          )}
        </div>
        {children}
      </section>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/"),
    [user, setUser] = useSaved("session", null),
    [stock, setStock] = useSaved("stock", {}),
    [prefs, setPrefs] = useSaved("prefs", defaultPrefs),
    [plan, setPlan] = useSaved("plan", null),
    [checked, setChecked] = useSaved("checked", {}),
    [toast, setToast] = useState(""),
    [modal, setModal] = useState(null),
    [form, setForm] = useState({ ...defaultForm }),
    [step, setStep] = useState(1),
    [failure, setFailure] = useState(null),
    [busy, setBusy] = useState(false),
    timer = useRef();
  useEffect(() => {
    const f = () => {
      setRoute(location.hash.slice(1) || "/");
      setModal(null);
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const notify = (msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4000);
  };
  const demo = () => {
    setUser({
      name: "Sahabat Pangan",
      email: "demo@panganbantu.local",
      demo: true,
    });
    setStock(demoStock);
    setPrefs(defaultPrefs);
    setPlan(generate(defaultForm, demoStock, defaultPrefs).plan);
    setChecked({});
    go("/dashboard");
    notify("Mode demo siap. Silakan jelajahi rencana dan stok contoh.");
  };
  const startPlan = () => {
    setFailure(null);
    setStep(1);
    setForm({
      ...defaultForm,
      ...(plan
        ? {
            mode: plan.mode,
            people: plan.people,
            days: plan.days,
            start: plan.start,
            budget: plan.budget,
          }
        : {}),
    });
    go("/buat-rencana");
  };
  const savePlan = (p) => {
    setPlan(p);
    setChecked({});
    setFailure(null);
    go("/rencana");
    notify(p.alternative
      ? "Alternatif ditampilkan. Estimasinya masih melebihi anggaran."
      : "Rencana makan berhasil dibuat. Selamat memasak!");
  };
  const createPlan = () => {
    setBusy(true);
    setTimeout(() => {
      const result = generate(form, stock, prefs);
      setBusy(false);
      if (result.error || !result.feasible) {
        setFailure(result);
        go("/hasil");
      } else savePlan(result.plan);
    }, 950);
  };
  const state = {
    user,
    setUser,
    stock,
    setStock,
    prefs,
    setPrefs,
    plan,
    setPlan,
    checked,
    setChecked,
    notify,
    modal,
    setModal,
    demo,
    startPlan,
    form,
    setForm,
    step,
    setStep,
    failure,
    setFailure,
    busy,
    createPlan,
    savePlan,
  };
  const publicRoute = ["/", "/masuk", "/daftar"].includes(route);
  useEffect(() => {
    if (!publicRoute && !user) {
      go("/masuk");
    }
  }, [route, user]);
  return (
    <Ctx.Provider value={state}>
      <div className={route === "/" ? "public-surface" : "workspace-surface"}>
      {route === "/" ? (
        <Landing />
      ) : route === "/masuk" || route === "/daftar" ? (
        <Auth register={route === "/daftar"} key={route} />
      ) : user ? (
        <Shell route={route}>
          {route === "/dashboard" ? (
            <Dashboard />
          ) : route === "/buat-rencana" ? (
            <Wizard />
          ) : route === "/rencana" ? (
            <Results />
          ) : route === "/hasil" ? (
            <Infeasible />
          ) : route === "/stok" ? (
            <Pantry />
          ) : route === "/belanja" ? (
            <Grocery />
          ) : route === "/preferensi" ? (
            <Preferences />
          ) : route === "/profil" ? (
            <Profile />
          ) : (
            <Empty
              title="Halaman tidak ditemukan"
              sub="Kembali ke dasbor untuk melanjutkan rencana makan Anda."
            >
              <Btn to="/dashboard">Kembali ke dasbor</Btn>
            </Empty>
          )}
        </Shell>
      ) : null}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      {modal?.type === "stock" && <StockDialog id={modal.id} />}{" "}
      {modal?.type === "recipe" && <RecipeDialog d={modal.d} s={modal.s} />}{" "}
      {modal?.type === "swap" && <SwapDialog d={modal.d} s={modal.s} />}{" "}
      {modal?.type === "delete" && <DeleteDialog id={modal.id} />}{" "}
      {busy && (
        <Dialog title="Sedang merencanakan menu" close={() => {}} dismissible={false}>
          <div className="loading" aria-live="polite">
            <div className="spinner" />
            <h2>Menu hemat sedang disiapkan…</h2>
            <p>
              Menghitung stok, menyesuaikan porsi, dan menyaring bahan sesuai
              preferensi Anda.
            </p>
          </div>
        </Dialog>
      )}
      </div>
    </Ctx.Provider>
  );
}

function Landing() {
  const [open, setOpen] = useState(false),
    [announcement, setAnnouncement] = useState(true);
  const { user, demo } = useApp();
  return (
    <>
      <div>
        {announcement && (
          <div className="announcement">
            Dari dapur yang terencana, untuk hari yang lebih tenang.{" "}
            <a href="#/daftar">Mulai bersama PanganBantu ↗</a>
            <button
              aria-label="Tutup pengumuman"
              onClick={() => setAnnouncement(false)}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <header className="container public-nav">
          <Logo />
          <button
            className="mobile-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Buka navigasi"
            aria-expanded={open}
          >
            <Menu size={21} />
          </button>
          <nav className={"navlinks " + (open ? "open" : "")}>
            <a className="active" href="#/" onClick={() => setOpen(false)}>
              Beranda
            </a>
            <a
              href="#cara-kerja"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("cara-kerja")
                  .scrollIntoView({ behavior: "smooth" });
                setOpen(false);
              }}
            >
              Cara Kerja
            </a>
            <a href={user ? "#/dashboard" : "#/masuk"}>
              {user ? "Dasbor" : "Masuk"}
            </a>
            <Btn to={user ? "/buat-rencana" : "/daftar"} variant="outline">
              {user ? "Buat Rencana" : "Daftar Gratis"}
              <ArrowUpRight size={15} />
            </Btn>
          </nav>
        </header>
      </div>
      <main>
        <div className="container">
          <section className="hero">
            <div className="hero-copy">
              <h1>
                Makan Terencana,
                <br />
                <span>
                  Pengeluaran
                  <br />
                  Terjaga.
                </span>
              </h1>
              <p>
                Menu rumahan yang pas di selera, pas di kantong. Rencanakan
                makan harian dari anggaran dan bahan yang sudah ada di dapur
                Anda.
              </p>
              <div className="hero-actions">
                <Btn to={user ? "/buat-rencana" : "/daftar"}>
                  Mulai Rencanakan Menu
                  <ArrowUpRight size={18} />
                </Btn>
                <button className="text-link" onClick={demo}>
                  Jelajahi demo
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className="hero-note">
                <span>
                  <Check size={12} />
                  Gratis untuk dicoba
                </span>
                <span>
                  <Check size={12} />
                  Untuk sendiri & keluarga
                </span>
              </div>
            </div>
            <div className="hero-image">
              <img
                src="/assets/nasi-goreng.webp"
                alt="Sepiring nasi goreng Indonesia dengan telur dan sayuran"
                fetchPriority="high"
              />
              <span className="image-credit">
                Foto: Pups with Chopsticks · Ilustrasi
              </span>
            </div>
          </section>
          <div className="landing-strip">
            <div className="strip-item">
              <Wallet />
              <div>
                <strong>Hemat dimulai dari rencana</strong>
                <small>Menu menyesuaikan anggaran Anda</small>
              </div>
            </div>
            <div className="strip-item">
              <Sprout />
              <div>
                <strong>Lebih bijak, lebih sedikit terbuang</strong>
                <small>Utamakan bahan yang sudah tersedia</small>
              </div>
            </div>
            <div className="strip-item">
              <Heart />
              <div>
                <strong>Selera keluarga, tetap nomor satu</strong>
                <small>Sesuaikan preferensi dan alergi</small>
              </div>
            </div>
          </div>
        </div>
        <section className="how-section" id="cara-kerja">
          <div className="container how-grid">
            <div>
              <h2>
                Tiga langkah kecil.
                <br />
                Seminggu lebih tenang.
              </h2>
              <p>
                Tidak perlu bingung lagi menjawab,
                <br />
                “Hari ini masak apa, ya?”
              </p>
              <Btn to="/daftar" variant="outline">
                Yuk, mulai merencanakan
                <ArrowUpRight size={17} />
              </Btn>
            </div>
            <div>
              {[
                [
                  "Ceritakan kebutuhan Anda",
                  "Pilih jumlah orang, durasi, dan anggaran. Tambahkan stok dapur serta makanan yang disukai.",
                ],
                [
                  "Temukan menu yang pas",
                  "Dapatkan rencana makan dengan resep, informasi gizi, dan kisaran biaya yang jelas.",
                ],
                [
                  "Belanja seperlunya, masak dengan tenang",
                  "Buka daftar belanja yang sudah memperhitungkan stok. Ikuti resep, lalu nikmati bersama.",
                ],
              ].map(([t, p], i) => (
                <div className="how-step" key={t}>
                  <span className="step-no">0{i + 1}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="container">
          <section className="cta-panel">
            <div>
              <h2>
                Besok masak apa?
                <br />
                Kita rencanakan hari ini.
              </h2>
              <p>Lebih sedikit bingung. Lebih banyak waktu di meja makan.</p>
            </div>
            <Btn to={user ? "/buat-rencana" : "/daftar"} variant="white">
              Buat Rencana Pertama
              <ArrowUpRight size={18} />
            </Btn>
          </section>
          <footer className="public-footer">
            <Logo />
            <span>© 2026 PanganBantu. Dari rencana, jadi hidangan.</span>
            <span>Prototipe interaktif · Data simulasi</span>
          </footer>
        </div>
      </main>
    </>
  );
}

const navItems = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/buat-rencana", "Buat Rencana", CalendarDays],
  ["/stok", "Stok Bahan", Package],
  ["/preferensi", "Preferensi", SlidersHorizontal],
  ["/belanja", "Daftar Belanja", ShoppingBasket],
  ["/profil", "Profil", User],
];
function Shell({ route, children }) {
  const { user, setUser, notify, startPlan } = useApp();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [route]);
  const currentLabel = navItems.find(([path]) => path === route)?.[1] || "Rencana Makan";
  const logout = () => {
    setUser(null);
    go("/masuk");
    notify("Anda sudah keluar dari akun simulasi.");
  };
  return (
    <div className="app-shell">
      <header className="workspace-header">
        <Logo />
        <button className="workspace-menu-toggle" aria-label={open ? "Tutup navigasi aplikasi" : "Buka navigasi aplikasi"} aria-expanded={open} aria-controls="workspace-navigation" onClick={() => setOpen(!open)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav id="workspace-navigation" className={"workspace-navigation " + (open ? "open" : "")} aria-label="Navigasi dapur">
          {navItems.map(([path, label, Icon]) => (
            <a key={path} href={"#" + path} className={route === path || (route === "/rencana" && path === "/dashboard") ? "selected" : ""} aria-current={route === path ? "page" : undefined} onClick={(e) => {
              if (path === "/buat-rencana") { e.preventDefault(); startPlan(); }
              setOpen(false);
            }}>
              <Icon size={16} /><span>{label}</span>
            </a>
          ))}
          <button className="mobile-logout" onClick={logout}><LogOut size={16} />Keluar dari akun</button>
        </nav>
        <div className="workspace-account">
          <a href="#/profil" className="workspace-profile" aria-label="Buka profil">
            <span className="avatar">{user.name.slice(0,2).toUpperCase()}</span>
            <span><strong>{user.name.split(" ")[0]}</strong><small>Akun {user.demo ? "demo" : "simulasi"}</small></span>
          </a>
          <button className="workspace-logout" aria-label="Keluar dari akun" onClick={logout}><LogOut size={16} /></button>
        </div>
      </header>
      <div className="workspace-breadcrumb">
        <div><a href="#/dashboard"><LayoutDashboard size={13} />Dapur Saya</a><ChevronRight size={12} /><span>{currentLabel}</span></div>
        <span className="workspace-date"><CalendarDays size={13} />{new Date().toLocaleDateString("id-ID", {day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Jakarta"})}<Badge>Simulasi</Badge></span>
      </div>
      <div className="app-main">
        <main className={"page page-" + route.slice(1)}>{children}</main>
      </div>
      <footer className="workspace-footer"><span>PanganBantu · Dari rencana, jadi hidangan.</span><span>Prototipe interaktif · Data simulasi</span><a href="#/">Kembali ke beranda<ArrowUpRight size={13} /></a></footer>
    </div>
  );
}

async function hashPassword(password) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );
  return Array.from(new Uint8Array(digest), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
}
function Auth({ register }) {
  const { setUser, demo, notify, setStock, setPrefs, setPlan, setChecked } =
      useApp(),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (register && !name.trim()) return setError("Nama pengguna perlu diisi.");
    if (!email.trim())
      return setError(
        "Masukkan " +
          (register ? "alamat email." : "nama pengguna atau email."),
      );
    if (register && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Format email belum benar. Contoh: nama@email.com");
    if (password.length < 6)
      return setError("Kata sandi harus berisi minimal 6 karakter.");
    setLoading(true);
    try {
      const accounts = read("accounts", []),
        digest = await hashPassword(password);
      if (register) {
        if (
          accounts.some(
            (a) =>
              a.email.toLowerCase() === email.trim().toLowerCase() ||
              a.name.toLowerCase() === name.trim().toLowerCase(),
          )
        ) {
          setLoading(false);
          return setError(
            "Email atau nama pengguna sudah terdaftar di perangkat ini. Silakan masuk.",
          );
        }
        const account = { name: name.trim(), email: email.trim(), digest };
        localStorage.setItem(
          "pb-accounts",
          JSON.stringify([...accounts, account]),
        );
        setUser({ name: account.name, email: account.email });
        setStock({});
        setPrefs(defaultPrefs);
        setPlan(null);
        setChecked({});
        notify("Akun simulasi berhasil dibuat. Selamat datang!");
      } else {
        const account = accounts.find(
          (a) =>
            (a.email.toLowerCase() === email.toLowerCase().trim() ||
              a.name.toLowerCase() === email.toLowerCase().trim()) &&
            a.digest === digest,
        );
        if (!account) {
          setLoading(false);
          return setError(
            "Nama pengguna/email atau kata sandi tidak cocok. Daftar dahulu atau gunakan akun demo.",
          );
        }
        setUser({ name: account.name, email: account.email });
        notify("Berhasil masuk. Selamat datang kembali!");
      }
      go("/dashboard");
    } catch {
      setError(
        "Akun belum dapat disimpan. Coba gunakan demo atau aktifkan penyimpanan peramban.",
      );
    }
    setLoading(false);
  }
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Logo />
        <h1>
          Besok masak apa?
          <br />
          <span>Rencanakan dari sini.</span>
        </h1>
        <p>
          Susun menu, manfaatkan stok dapur, dan siapkan daftar belanja Anda.
        </p>
        <KitchenIllustration />
        <p className="demo-label" style={{ marginTop: 20, marginBottom: 0 }}>
          PanganBantu · Teman merencanakan makan sehari-hari.
        </p>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit} noValidate>
          <Logo />
          <a href="#/" className="text-link muted">
            <ArrowLeft size={15} />
            Kembali ke beranda
          </a>
          <h2>
            {register ? "Buat akun Anda" : "Selamat datang kembali"}
          </h2>
          <p>
            {register
              ? "Buat akun dan rencanakan makan sesuai kebutuhan Anda."
              : "Masuk untuk melanjutkan rencana makan Anda."}
          </p>
          {register && (
            <label className="field">
              <span>Nama pengguna</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama panggilan Anda"
                autoComplete="username"
                maxLength={30}
              />
            </label>
          )}
          <label className="field">
            <span>
              {register ? "Alamat email" : "Nama pengguna atau email"}
            </span>
            <input
              type={register ? "email" : "text"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                register
                  ? "nama@email.com"
                  : "Masukkan nama pengguna atau email"
              }
              autoComplete={register ? "email" : "username"}
            />
          </label>
          <label className="field">
            <span>Kata sandi</span>
            <div className="password-field">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete={register ? "new-password" : "current-password"}
              />
              <button
                type="button"
                aria-label={
                  show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && (
            <div className="field-error" role="alert">
              {error}
            </div>
          )}
          <button type="submit" className="btn primary full" disabled={loading}>
            {loading ? "Mohon tunggu…" : register ? "Daftar Gratis" : "Masuk"}
            <ArrowRight size={17} />
          </button>
          <div className="divider">ATAU COBA TERLEBIH DAHULU</div>
          <Btn onClick={demo} variant="outline" className="full">
            Jelajahi dengan Akun Demo
            <ArrowUpRight size={16} />
          </Btn>
          <div className="auth-switch">
            {register ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <a href={register ? "#/masuk" : "#/daftar"}>
              {register ? "Masuk" : "Daftar gratis"}
            </a>
          </div>
          <Note>
            Ini akun simulasi. Gunakan kata sandi contoh. Data disimpan di
            peramban ini, bukan layanan akun sungguhan.
          </Note>
        </form>
      </div>
    </div>
  );
}

function Stat({ title, value, sub, icon: Icon, blue = false }) {
  return (
    <div className={"stat " + (blue ? "blue" : "")}>
      <div className="stat-top">
        {title}
        <Icon size={20} />
      </div>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}
function MealCard({ d, s, plan, calc }) {
  const { setModal } = useApp(),
    r = getRecipe(plan.menu[d][s]),
    m = calc.meals.find((m) => m.d === d && m.s === s);
  return (
    <article className="meal-card">
      <div className="meal-photo">
        <img
          loading="lazy"
          src={r.image}
          alt={r.name + " — ilustrasi penyajian"}
        />
        <Badge>
          {s === 0 ? "☀" : s === 1 ? "◉" : "☾"} {slots[s]}
        </Badge>
        <span className="time-badge">
          <Clock size={11} />
          {r.time} menit
        </span>
      </div>
      <div className="meal-body">
        <h3>{r.name}</h3>
        <div className="meal-meta">
          <Users size={12} />
          {plan.people} porsi<span>·</span>
          <Leaf size={12} />
          Masakan rumahan
        </div>
        <div className="meal-price">{range(m.min, m.max)}</div>
        <small className="muted">
          Estimasi belanja untuk {plan.people} porsi
        </small>
        <div className="nutrition-mini">
          <div>
            <strong>{r.nutrition[0]} kkal</strong>Energi / porsi
          </div>
          <div>
            <strong>{r.nutrition[1]} g</strong>Protein
          </div>
          <div>
            <strong>{r.nutrition[4]} g</strong>Serat
          </div>
        </div>
        <div className="meal-actions">
          <Btn
            variant="outline"
            onClick={() => setModal({ type: "recipe", d, s })}
          >
            Lihat Resep
            <ArrowUpRight size={13} />
          </Btn>
          <button
            className="text-link muted"
            onClick={() => setModal({ type: "swap", d, s })}
          >
            <RefreshCw size={12} />
            Ganti Menu
          </button>
        </div>
      </div>
    </article>
  );
}
function KitchenIllustration() {
  return (
    <svg className="kitchen-illustration" viewBox="0 0 400 310" fill="none" aria-hidden="true">
      <circle cx="211" cy="145" r="119" fill="#EAF9E7" />
      <path d="M84 80c-15-22 3-38 19-22 1-25 29-29 33-5 21-11 35 8 18 23" fill="white" />
      <path d="M292 56c-1-13 16-20 22-7 11-10 26 2 17 13h-39" fill="white" />
      <ellipse cx="207" cy="274" rx="124" ry="9" fill="#013237" opacity=".12" />
      <path d="M155 160c-50-15-62-54-57-85 37 8 61 37 57 85Z" fill="#4CA771" />
      <path d="M163 172c-22-58-11-100 24-127 18 46 7 92-24 127Z" fill="#013237" />
      <path d="M164 180c12-53 40-82 79-85-6 43-31 73-79 85Z" fill="#4CA771" />
      <path d="m111 95 56 99m17-131-18 121m60-75-59 76" stroke="#C0E6BA" strokeWidth="3" strokeLinecap="round" />
      <circle cx="253" cy="167" r="39" fill="#4CA771" />
      <path d="m253 128-2-16m-13 16 13 4 13-5" stroke="#013237" strokeWidth="5" strokeLinecap="round" />
      <path d="M103 185h205c-7 54-41 80-103 80s-95-26-102-80Z" fill="#013237" />
      <path d="M103 185h205" stroke="white" strokeWidth="9" strokeLinecap="round" />
      <path d="M129 207c8 19 25 32 47 37" stroke="#C0E6BA" strokeWidth="4" strokeLinecap="round" />
      <path d="m299 131 25-35" stroke="#013237" strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="329" cy="88" rx="11" ry="23" transform="rotate(34 329 88)" fill="#013237" />
      <path d="m68 195 5 7 8-1-5 6 2 8-7-4-7 4 2-8-5-6 8 1Zm251 37 5 7 8-1-5 6 2 8-7-4-7 4 2-8-5-6 8 1Z" fill="#4CA771" />
    </svg>
  );
}

function Dashboard() {
  const { user, plan, stock, startPlan, demo } = useApp();
  const calc = plan && calculate(plan, stock);
  const today = new Date().toLocaleDateString("en-CA", {timeZone:"Asia/Jakarta"});
  const dateIndex = plan ? Math.round((new Date(today+"T12:00:00")-new Date(plan.start+"T12:00:00"))/86400000) : -1;
  const d = plan && dateIndex >= 0 && dateIndex < plan.days ? dateIndex : 0;
  const stockEntries = Object.entries(stock);
  const shortcuts = [
    {to:"/buat-rencana",icon:CalendarDays,title:"Rencana baru",body:"Tentukan hari, porsi, dan anggaran.",action:"Mulai",onClick:startPlan},
    {to:"/stok",icon:Package,title:"Stok dapur",body:"Catat dan perbarui bahan yang tersedia.",action:"Kelola stok"},
    {to:"/preferensi",icon:Heart,title:"Selera & alergi",body:"Sesuaikan menu dengan kebutuhan Anda.",action:"Atur preferensi"},
    {to:"/belanja",icon:ShoppingBasket,title:"Daftar belanja",body:"Cek bahan yang masih perlu dibeli.",action:"Lihat daftar"},
  ];
  return (
    <>
      <section className="dashboard-welcome">
        <div className="dashboard-intro">
          <span className="welcome-kicker">DAPUR SAYA</span>
          <h1>Halo, {user.name.split(" ")[0]}<span>.</span><br />Siap masak hari ini?</h1>
          <p>{plan ? "Rencana sudah siap. Lihat menu dan cek bahan sebelum mulai memasak." : "Mulai dengan bahan yang ada, lalu susun menu untuk beberapa hari ke depan."}</p>
          <div className="dashboard-cover">
            <KitchenIllustration />
          </div>
        </div>
        <div className="dashboard-showcase">
          <div className="dashboard-plan">
            <Badge color="green"><CalendarDays size={12} />{plan ? "Rencana aktif" : "Mulai dari sini"}</Badge>
            <h2>{plan ? `Menu ${plan.days} hari,\nuntuk ${plan.people} orang.` : "Rencanakan\nmenu Anda."}</h2>
            <p>{plan ? dateRange(plan) : "Mulai dari jumlah orang, anggaran, dan bahan yang ada di dapur."}</p>
            {plan ? <><div className="dashboard-plan-cost"><small>Total estimasi belanja</small><strong>{range(calc.min,calc.max)}</strong></div><div className="dashboard-plan-bottom"><span><Users size={14} />{plan.people} orang <i />{plan.days} hari</span><Btn to="/rencana">Lihat Rencana<ArrowUpRight size={16} /></Btn></div></> : <div className="actions"><Btn onClick={startPlan}>Buat Rencana Makan<ArrowUpRight size={16} /></Btn><button className="text-link" onClick={demo}>Lihat contoh<ArrowRight size={14} /></button></div>}
          </div>
        </div>
      </section>
      {plan && <>
        <div className="summary-grid dashboard-stats">
          <Stat title="Anggaran makan" value={rupiah(plan.budget)} sub={`${rupiah(plan.budget/plan.days)} per hari · ${plan.days} hari`} icon={Wallet} />
          <Stat blue title="Hemat dari stok dapur" value={range(calc.savedMin,calc.savedMax)} sub={`${calc.lines.filter(l=>l.used>0).length} bahan dimanfaatkan dari dapur Anda`} icon={Sprout} />
          <Stat title="Bahan tersedia" value={`${Object.values(stock).filter(v=>v>0).length} jenis bahan`} sub="Cek stok sebelum menambah belanja" icon={Package} />
        </div>
        {calc.max > plan.budget && <Note warning>Estimasi belanja saat ini melebihi anggaran {rupiah(calc.max-plan.budget)} pada batas atas harga. <a href="#/rencana" className="text-link">Tinjau rencana<ArrowRight size={13} /></a></Note>}
        <section className="dashboard-meals content-section">
          <div className="section-title"><div><h2>{dateIndex >= 0 && dateIndex < plan.days ? "Menu hari ini" : "Menu hari pertama"}</h2><p className="section-description">{dateLabel(plan.start,d)} · {plan.people} porsi per hidangan</p></div><a className="text-link" href="#/rencana">Rencana lengkap<ArrowRight size={15} /></a></div>
          <div className="meal-grid">{[0,1,2].map(s=><MealCard key={s} d={d} s={s} plan={plan} calc={calc} />)}</div>
        </section>
      </>}
      <section className="dashboard-tools content-section">
        <div className="section-title"><h2>Kelola dapur</h2></div>
        <div className="shortcut-grid">{shortcuts.map(({to,icon:Icon,title,body,action,onClick},i)=><a key={to} className="shortcut-card" href={"#"+to} onClick={onClick?e=>{e.preventDefault();onClick();}:undefined}><span className="shortcut-icon"><Icon size={24} strokeWidth={1.5} /></span><span className="shortcut-index">0{i+1}</span><h3>{title}</h3><p>{body}</p><span className="shortcut-action">{action}<span><ArrowUpRight size={15} /></span></span></a>)}</div>
      </section>
      <section className="dashboard-pantry content-section">
        <div className="section-title"><h2>Bahan yang tersedia</h2><a className="text-link" href="#/stok">Semua stok<ArrowUpRight size={16} /></a></div>
        {stockEntries.length ? <div className="pantry-preview">{stockEntries.slice(0,6).map(([id,q])=><a href="#/stok" className="pantry-chip" key={id}><span>{ingredients[id].icon}</span><div>{ingredients[id].name}<small>{qty(q,id)} tersedia</small></div><ArrowUpRight size={14} /></a>)}</div> : <Empty title="Dapur Anda siap diisi" sub="Catat bahan yang sudah ada di rumah. Kami bantu memanfaatkannya sebelum belanja lagi." icon={Package}><Btn to="/stok"><Plus size={16} />Tambah Bahan Pertama</Btn></Empty>}
      </section>
      <SourceNote />
    </>
  );
}

function Wizard() {
  const { form, setForm, step, setStep, stock, prefs, createPlan } = useApp(),
    [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const labels = [
    "Pilih Perencanaan",
    "Durasi & Anggaran",
    "Stok Bahan",
    "Preferensi Makanan",
    "Ringkasan",
  ];
  function next() {
    setError("");
    if (
      step === 1 &&
      (!Number.isInteger(Number(form.people)) || Number(form.people) < 1)
    )
      return setError(
        "Jumlah peserta harus berupa bilangan bulat lebih dari 0.",
      );
    if (step === 2) {
      if (
        !form.start ||
        !/^\d{4}-\d{2}-\d{2}$/.test(form.start) ||
        Number.isNaN(new Date(form.start).getTime())
      )
        return setError("Pilih tanggal mulai yang valid.");
      if (!Number.isFinite(Number(form.budget)) || Number(form.budget) <= 0)
        return setError("Anggaran perlu diisi dengan nilai lebih dari Rp0.");
    }
    setForm((f) => ({
      ...f,
      people: Number(f.people),
      budget: Number(f.budget),
    }));
    setStep(Math.min(5, step + 1));
    window.scrollTo(0, 0);
  }
  return (
    <>
      <PageHeader
        eyebrow="SELANGKAH MENUJU DAPUR TERENCANA"
        title="Buat Rencana Makan"
        sub="Rencana yang sesuai dengan kebutuhan, selera, dan kantong Anda."
      />
      <div className="progress-steps" aria-label={`Langkah ${step} dari 5`}>
        {labels.map((l, i) => (
          <div
            className={
              "progress-step " +
              (step === i + 1 ? "current" : step > i + 1 ? "done" : "")
            }
            key={l}
            aria-current={step === i + 1 ? "step" : undefined}
          >
            <span>{step > i + 1 ? <Check size={15} /> : i + 1}</span>
            {l}
          </div>
        ))}
      </div>
      <div className="wizard-layout">
        <div className="panel wizard-panel">
          <Badge>LANGKAH {step} DARI 5</Badge>
          <h2 style={{ marginTop: 20 }}>
            {
              [
                "Untuk siapa kita memasak?",
                "Atur hari dan anggaran Anda",
                "Apa yang ada di dapur?",
                "Menu yang pas dengan selera",
                "Siap merencanakan hidangan?",
              ][step - 1]
            }
          </h2>
          <p className="panel-sub">
            {
              [
                "Porsi setiap resep akan disesuaikan dengan jumlah peserta.",
                "Mulai dari anggaran yang nyaman untuk Anda.",
                "Stok akan dipakai lebih dulu sebelum menghitung bahan belanja.",
                "Beri tahu kesukaan dan bahan yang perlu dihindari.",
                "Periksa sekali lagi. Anda selalu bisa mengganti menu nanti.",
              ][step - 1]
            }
          </p>
          {step === 1 && (
            <>
              <div className="mode-cards">
                {[
                  ["Individu", User, "Untuk kebutuhan makan sendiri."],
                  ["Keluarga", Users, "Untuk Anda dan orang tersayang."],
                ].map(([mode, Icon, sub]) => (
                  <button
                    className={
                      "mode-card " + (form.mode === mode ? "selected" : "")
                    }
                    key={mode}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        mode,
                        people:
                          mode === "Individu"
                            ? 1
                            : Math.max(2, Number(f.people) || 2),
                      }))
                    }
                    aria-pressed={form.mode === mode}
                  >
                    <span className="radio-dot" />
                    <Icon size={29} strokeWidth={1.5} />
                    <h3>{mode}</h3>
                    <p>{sub}</p>
                  </button>
                ))}
              </div>
              <label className="field">
                <span>Jumlah peserta</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.people}
                  onChange={(e) => set("people", e.target.value)}
                  disabled={form.mode === "Individu"}
                  aria-invalid={!!error}
                />
                <small>
                  {form.mode === "Individu"
                    ? "Mode individu otomatis menggunakan 1 peserta."
                    : "Masukkan jumlah orang dalam bilangan bulat, termasuk Anda."}
                </small>
              </label>
              <Note>
                <p>
                  Satu peserta mendapat sarapan, makan siang, dan makan malam
                  setiap hari.
                </p>
              </Note>
            </>
          )}
          {step === 2 && (
            <>
              <label className="field">
                <span>Rencanakan untuk berapa hari?</span>
                <div className="day-picker">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <button
                      key={d}
                      onClick={() => set("days", d)}
                      className={form.days === d ? "selected" : ""}
                      aria-pressed={form.days === d}
                      aria-label={`${d} hari`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <small>
                  {form.days} hari · {form.days * 3} waktu makan
                </small>
              </label>
              <label className="field">
                <span>Tanggal mulai</span>
                <input
                  type="date"
                  lang="id-ID"
                  value={form.start}
                  onChange={(e) => set("start", e.target.value)}
                />
                {form.start && <small>{dateLabel(form.start)}</small>}
              </label>
              <label className="field">
                <span>Total anggaran belanja (Rp)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Contoh: 150000"
                  value={form.budget}
                  onChange={(e) => set("budget", e.target.value)}
                  aria-invalid={!!error}
                />
                <small>
                  Anggaran untuk {form.people} orang selama {form.days} hari,
                  setelah memakai stok dapur.
                </small>
              </label>
              <div className="budget-equivalent">
                <Wallet size={22} />
                <div>
                  Setara{" "}
                  <strong>
                    {rupiah(Math.max(0, Number(form.budget) || 0) / form.days)}{" "}
                    per hari
                  </strong>
                  <br />
                  <small>
                    {rupiah(
                      Math.max(0, Number(form.budget) || 0) /
                        form.days /
                        (Number(form.people) || 1),
                    )}{" "}
                    per orang per hari
                  </small>
                </div>
              </div>
            </>
          )}
          {step === 3 && <Pantry embedded />}
          {step === 4 && <PreferenceEditor />}
          {step === 5 && (
            <>
              <div className="summary-list">
                <div>
                  <span>Mode perencanaan</span>
                  <strong>
                    {form.mode} · {form.people} orang
                  </strong>
                </div>
                <div>
                  <span>Durasi</span>
                  <strong>
                    {form.days} hari · {form.days * 3} menu
                  </strong>
                </div>
                <div>
                  <span>Tanggal</span>
                  <strong>{dateRange(form)}</strong>
                </div>
                <div>
                  <span>Anggaran</span>
                  <strong>{rupiah(form.budget)}</strong>
                </div>
                <div>
                  <span>Setara per hari</span>
                  <strong>{rupiah(form.budget / form.days)}</strong>
                </div>
              </div>
              <div className="inline-prefs">
                <strong>Stok dapur ({Object.keys(stock).length} bahan)</strong>
                {Object.keys(stock).length
                  ? Object.entries(stock)
                      .map(([id, q]) => `${ingredients[id].name} ${qty(q, id)}`)
                      .join(" · ")
                  : "Belum ada stok. Seluruh kebutuhan akan masuk daftar belanja."}
                <strong>Preferensi & pantangan</strong>
                {prefs.diet} · Disukai:{" "}
                {prefs.liked.map((id) => ingredients[id].name).join(", ") ||
                  "Tidak ada pilihan"}
                <br />
                Dihindari:{" "}
                {prefs.avoided.map((id) => ingredients[id].name).join(", ") ||
                  "Tidak ada"}
                <strong>Alergi yang wajib dikecualikan</strong>
                {prefs.allergies.join(", ") || "Tidak ada alergi yang dipilih"}
              </div>
              <Note>
                <ShieldCheck
                  size={16}
                  style={{ verticalAlign: "middle", marginRight: 5 }}
                />
                Rekomendasi memakai jumlah porsi, anggaran, stok, dan preferensi
                Anda. Batas atas estimasi dipakai untuk memeriksa kecukupan
                anggaran.
              </Note>
            </>
          )}
          {error && (
            <div role="alert" className="field-error">
              {error}
            </div>
          )}
          <div className="wizard-buttons">
            <Btn
              variant="outline"
              onClick={() => {
                setError("");
                step === 1 ? go("/dashboard") : setStep(step - 1);
              }}
            >
              <ArrowLeft size={15} />
              {step === 1 ? "Batal" : "Kembali"}
            </Btn>
            {step < 5 ? (
              <div className="actions">
                {step === 3 && !Object.keys(stock).length && (
                  <button className="text-link muted" onClick={next}>
                    Lewati, belum ada stok
                  </button>
                )}
                <Btn onClick={next}>
                  Lanjut
                  <ArrowRight size={15} />
                </Btn>
              </div>
            ) : (
              <Btn onClick={createPlan}>
                <ChefHat size={17} />
                Buat Rencana Makan
              </Btn>
            )}
          </div>
        </div>
        <aside className="wizard-aside">
          <Leaf size={29} strokeWidth={1.4} />
          <h3>Pas untuk keseharian Anda.</h3>
          <p>
            Rencana kecil hari ini bisa membuat urusan makan besok jauh lebih
            ringan.
          </p>
          <div className="aside-line">
            <span>Peserta</span>
            <strong>{form.people || "—"} orang</strong>
          </div>
          <div className="aside-line">
            <span>Durasi</span>
            <strong>{form.days} hari</strong>
          </div>
          <div className="aside-line">
            <span>Anggaran</span>
            <strong>{rupiah(Number(form.budget) || 0)}</strong>
          </div>
          <div className="aside-line">
            <span>Stok dapur</span>
            <strong>{Object.keys(stock).length} bahan</strong>
          </div>
          <p style={{ fontSize: 10, marginTop: 20, marginBottom: 0 }}>
            Anda bisa kembali ke langkah sebelumnya kapan saja. Isian tetap
            tersimpan selama proses ini.
          </p>
        </aside>
      </div>
      <SourceNote />
    </>
  );
}

function Pantry({ embedded = false }) {
  const { stock, setModal, notify, setStock } = useApp(),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("Semua");
  const entries = Object.entries(stock).filter(
    ([id]) =>
      ingredients[id].name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "Semua" || ingredients[id].category === category),
  );
  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow="KENALI ISI DAPUR ANDA"
          title="Stok Bahan Dapur"
          sub="Catat yang tersedia, manfaatkan sebelum belanja lagi."
        >
          <Btn onClick={() => setModal({ type: "stock" })}>
            <Plus size={17} />
            Tambah Bahan
          </Btn>
        </PageHeader>
      )}
      <div className="toolbar">
        <div className="searchbox">
          <Search size={17} />
          <input
            className="search-input"
            aria-label="Cari stok bahan"
            placeholder="Cari bahan di dapur…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {embedded ? (
          <Btn variant="outline" onClick={() => setModal({ type: "stock" })}>
            <Plus size={15} />
            Tambah Bahan
          </Btn>
        ) : (
          <Badge color="green">{Object.keys(stock).length} jenis bahan</Badge>
        )}
      </div>
      {!embedded && (
        <div className="filter-tabs">
          {["Semua", "Sayuran", "Protein", "Bahan Pokok", "Bumbu"].map((c) => (
            <button
              className={category === c ? "selected" : ""}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {entries.length ? (
        <div className="inventory-list">
          {entries.map(([id, q]) => (
            <div className="inventory-item" key={id}>
              <span className="ingredient-icon">{ingredients[id].icon}</span>
              <div>
                <h3>{ingredients[id].name}</h3>
                <small>
                  {qty(q, id)}{" "}
                  <span className="muted">tersedia</span>
                </small>
              </div>
              <div className="item-actions">
                <button
                  aria-label={"Ubah " + ingredients[id].name}
                  onClick={() => setModal({ type: "stock", id })}
                >
                  <Pencil size={15} />
                </button>
                <button
                  aria-label={"Hapus " + ingredients[id].name}
                  onClick={() => setModal({ type: "delete", id })}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(stock).length ? (
        <Empty
          title="Bahan belum ditemukan"
          sub="Coba kata kunci atau kategori lain."
          icon={Search}
        >
          <Btn
            variant="outline"
            onClick={() => {
              setSearch("");
              setCategory("Semua");
            }}
          >
            Tampilkan semua stok
          </Btn>
        </Empty>
      ) : (
        <Empty
          title="Dapur Anda siap diisi"
          sub="Ada beras, telur, atau sayuran di rumah? Catat di sini supaya tidak perlu dibeli lagi."
          icon={Package}
        >
          <Btn onClick={() => setModal({ type: "stock" })}>
            <Plus size={16} />
            Tambah Bahan Pertama
          </Btn>
        </Empty>
      )}
      <Note>
        Stok dialokasikan berurutan dari hari pertama: sarapan, makan siang,
        lalu makan malam. Perubahan stok langsung memperbarui estimasi rencana
        aktif. Bahan tidak otomatis dihapus setelah memasak.
      </Note>
      {!embedded && <SourceNote />}
    </>
  );
}
function StockDialog({ id }) {
  const { stock, setStock, setModal, notify, setChecked } = useApp(),
    [selected, setSelected] = useState(id || "beras"),
    [amount, setAmount] = useState(id ? stock[id] : ""),
    [search, setSearch] = useState(""),
    [error, setError] = useState("");
  const close = () => setModal(null);
  const matches = Object.entries(ingredients).filter(([key, v]) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );
  function submit(e) {
    e.preventDefault();
    if (amount === "" || !Number.isFinite(Number(amount)) || Number(amount) < 0)
      return setError("Jumlah stok wajib diisi dan tidak boleh negatif.");
    if (
      ingredients[selected].unit === "butir" &&
      !Number.isInteger(Number(amount))
    )
      return setError(
        "Jumlah telur harus berupa bilangan bulat dalam satuan butir.",
      );
    setStock((s) => ({ ...s, [selected]: Number(amount) }));
    setChecked({});
    notify(
      `${ingredients[selected].name} berhasil ${id ? "diperbarui" : "disimpan"}.`,
    );
    close();
  }
  return (
    <Dialog
      title={id ? "Ubah stok bahan" : "Tambah bahan dapur"}
      sub="Gunakan satuan yang tertera agar perhitungan tetap tepat."
      close={close}
    >
      <form onSubmit={submit} noValidate>
        {!id && (
          <label className="field">
            <span>Cari nama bahan</span>
            <input
              placeholder="Contoh: beras, telur, wortel"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                const match = Object.entries(ingredients).find(([k, v]) =>
                  v.name.toLowerCase().includes(e.target.value.toLowerCase()),
                );
                if (match) {
                  setSelected(match[0]);
                  setAmount("");
                }
              }}
            />
          </label>
        )}
        <label className="field">
          <span>Bahan</span>
          <select
            value={selected}
            disabled={!!id}
            onChange={(e) => {
              setSelected(e.target.value);
              setAmount("");
            }}
          >
            {matches.map(([key, v]) => (
              <option key={key} value={key}>
                {v.name}
              </option>
            ))}
          </select>
          {!matches.length && (
            <small>
              Tidak ada bahan dalam katalog simulasi yang cocok. Coba kata kunci
              lain.
            </small>
          )}
        </label>
        <label className="field">
          <span>Jumlah tersedia ({ingredients[selected].unit})</span>
          <input
            type="number"
            min="0"
            step={ingredients[selected].unit === "butir" ? "1" : "any"}
            placeholder="Masukkan jumlah"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus={!!id}
          />
          <small>
            {ingredients[selected].unit === "g"
              ? "Gunakan gram: 1 kg = 1.000 g."
              : ingredients[selected].unit === "ml"
                ? "Gunakan mililiter: 1 liter = 1.000 ml."
                : "Gunakan jumlah butir utuh."}
          </small>
        </label>
        {!id && stock[selected] !== undefined && (
          <Note>
            Bahan ini sudah tercatat sebanyak {qty(stock[selected], selected)}.
            Angka yang disimpan akan mengganti jumlah tersebut.
          </Note>
        )}
        {error && (
          <div className="field-error" role="alert">
            {error}
          </div>
        )}
        <div className="actions">
          <Btn variant="outline" onClick={close}>
            Batal
          </Btn>
          <button
            className="btn primary"
            type="submit"
            disabled={!matches.length}
          >
            <Check size={16} />
            Simpan Bahan
          </button>
        </div>
      </form>
    </Dialog>
  );
}
function DeleteDialog({ id }) {
  const { setStock, setModal, setChecked, notify } = useApp();
  return (
    <Dialog
      title="Hapus bahan dari stok?"
      sub={`${ingredients[id].name} akan dikeluarkan dari stok dapur. Estimasi belanja akan dihitung ulang.`}
      close={() => setModal(null)}
    >
      <div className="actions">
        <Btn variant="outline" onClick={() => setModal(null)}>
          Batal
        </Btn>
        <Btn
          onClick={() => {
            setStock((s) => {
              const n = { ...s };
              delete n[id];
              return n;
            });
            setChecked({});
            setModal(null);
            notify(ingredients[id].name + " dihapus dari stok.");
          }}
        >
          <Trash2 size={15} />
          Hapus Bahan
        </Btn>
      </div>
    </Dialog>
  );
}

function PreferenceEditor({ value, onChange }) {
  const { prefs, setPrefs } = useApp();
  const p = value || prefs,
    set = onChange || setPrefs;
  function toggle(group, id) {
    set((prev) => ({
      ...prev,
      [group]: prev[group].includes(id)
        ? prev[group].filter((v) => v !== id)
        : [...prev[group], id],
      ...(group === "liked"
        ? { avoided: prev.avoided.filter((v) => v !== id) }
        : group === "avoided"
          ? { liked: prev.liked.filter((v) => v !== id) }
          : {}),
    }));
  }
  return (
    <>
      <div className="prefs-group">
        <h3>
          <Heart
            size={15}
            style={{ verticalAlign: "middle", marginRight: 7 }}
          />
          Bahan yang disukai
        </h3>
        <p>Diutamakan jika sesuai anggaran dan pantangan Anda.</p>
        <div className="chips">
          {Object.entries(ingredients).map(([id, v]) => (
            <button
              key={id}
              className={"chip " + (p.liked.includes(id) ? "selected" : "")}
              onClick={() => toggle("liked", id)}
              aria-pressed={p.liked.includes(id)}
            >
              {p.liked.includes(id) && <Check size={12} />} {v.name}
            </button>
          ))}
        </div>
      </div>
      <div className="prefs-group">
        <h3>Bahan yang dihindari</h3>
        <p>Bahan ini tidak akan digunakan pada rekomendasi baru.</p>
        <div className="chips">
          {Object.entries(ingredients).map(([id, v]) => (
            <button
              key={id}
              className={"chip " + (p.avoided.includes(id) ? "selected" : "")}
              onClick={() => toggle("avoided", id)}
              aria-pressed={p.avoided.includes(id)}
            >
              {p.avoided.includes(id) && <X size={12} />} {v.name}
            </button>
          ))}
        </div>
      </div>
      <div className="prefs-group">
        <h3>Pola makan</h3>
        <p>Pilih pola makan yang sesuai dengan kebutuhan Anda.</p>
        <div className="chips">
          {["Bebas", "Vegetarian", "Vegan"].map((v) => (
            <button
              className={"chip " + (p.diet === v ? "selected" : "")}
              key={v}
              aria-pressed={p.diet === v}
              onClick={() => set((prev) => ({ ...prev, diet: v }))}
            >
              {p.diet === v && <Check size={12} />} {v}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 10 }}>
          Vegetarian: tanpa daging. Vegan: tanpa bahan hewani, termasuk telur.
        </p>
      </div>
      <div className="prefs-group">
        <h3>
          <ShieldCheck
            size={15}
            style={{ verticalAlign: "middle", marginRight: 7 }}
          />
          Alergi bahan makanan
        </h3>
        <p>Pilih semua yang berlaku. Pengecualian ini wajib dipatuhi.</p>
        <div className="chips">
          {[
            "Telur",
            "Kedelai",
            "Gluten",
            "Susu",
            "Kacang tanah",
            "Ikan",
            "Kerang",
          ].map((a) => (
            <button
              className={
                "chip allergy " + (p.allergies.includes(a) ? "selected" : "")
              }
              key={a}
              onClick={() => toggle("allergies", a)}
              aria-pressed={p.allergies.includes(a)}
            >
              {p.allergies.includes(a) && <Check size={12} />} {a}
            </button>
          ))}
        </div>
      </div>
      <Note warning>
        Alergen yang dipilih akan dikecualikan dari seluruh rekomendasi baru dan
        pilihan pengganti. Preferensi kesukaan tidak dapat mengabaikan alergi.
        Periksa juga label bahan dan kemungkinan kontaminasi silang saat
        memasak.
      </Note>
    </>
  );
}
function Preferences() {
  const { prefs, setPrefs, notify, plan } = useApp(),
    [draft, setDraft] = useState(() => structuredClone(prefs));
  const save = () => {
    setPrefs(draft);
    notify("Preferensi berhasil diperbarui untuk rekomendasi berikutnya.");
  };
  return (
    <>
      <PageHeader
        eyebrow="SETIAP DAPUR PUNYA SELERA"
        title="Preferensi Makanan"
        sub="Bantu kami memilih hidangan yang nyaman untuk Anda."
      >
        <Btn onClick={save}>
          <Check size={17} />
          Simpan Preferensi
        </Btn>
      </PageHeader>
      <div className="panel preferences-panel">
        <h2>Selera & kebutuhan makan</h2>
        <p className="panel-sub">
          Pilihan ini akan digunakan saat membuat rencana berikutnya.
        </p>
        <PreferenceEditor value={draft} onChange={setDraft} />
        {plan && (
          <Note>
            Rencana aktif tidak diubah otomatis. Setelah menyimpan preferensi,
            buat rencana baru untuk menerapkan seluruh perubahan.
          </Note>
        )}
        <Btn onClick={save}>
          <Check size={16} />
          Simpan Preferensi
        </Btn>
      </div>
    </>
  );
}

function Results() {
  const { plan, stock, startPlan, prefs, setForm, setStep } = useApp(),
    [day, setDay] = useState(0);
  if (!plan)
    return (
      <Empty
        title="Belum ada rencana makan"
        sub="Buat rencana pertama untuk melihat menu dan estimasi belanja Anda."
      >
        <Btn onClick={startPlan}>
          Buat Rencana Makan
          <ArrowRight size={16} />
        </Btn>
      </Empty>
    );
  const c = calculate(plan, stock),
    daily = c.meals.filter((m) => m.d === day),
    dailyMin = daily.reduce((n, m) => n + m.min, 0),
    dailyMax = daily.reduce((n, m) => n + m.max, 0),
    inBudget = c.max <= plan.budget,
    conflict = plan.menu.flat().some((id) => !allowed(getRecipe(id), prefs));
  return (
    <>
      <PageHeader
        eyebrow="DARI RENCANA, JADI HIDANGAN"
        title="Rencana Makan Anda"
        sub={`${dateRange(plan)} · ${plan.mode} · ${plan.people} orang`}
      >
        <div className="actions">
          <Btn onClick={startPlan} variant="outline">
            <RefreshCw size={15} />
            Rencana Baru
          </Btn>
          <Btn to="/belanja">
            <ShoppingBasket size={16} />
            Daftar Belanja
          </Btn>
        </div>
      </PageHeader>
      {conflict && (
        <Note warning>
          Preferensi Anda berubah. Ada menu pada rencana ini yang tidak sesuai
          preferensi terbaru. Buat rencana baru untuk menerapkan pengecualian
          tersebut.
        </Note>
      )}
      {!inBudget && (
        <Note warning>
          <strong>Alternatif ini masih melebihi anggaran.</strong>
          <p>
            Anggaran {rupiah(plan.budget)}; batas atas estimasi melebihi sebesar{" "}
            {rupiah(c.max - plan.budget)}. Rencana ini belum sesuai anggaran.
          </p>
          <button
            className="text-link"
            onClick={() => {
              setForm({ ...plan });
              setStep(2);
              go("/buat-rencana");
            }}
          >
            Ubah Anggaran
            <ArrowRight size={13} />
          </button>
        </Note>
      )}
      <div className="summary-grid">
        <Stat
          title="Total estimasi belanja"
          value={range(c.min, c.max)}
          sub={`Untuk ${plan.people} orang selama ${plan.days} hari`}
          icon={ShoppingBasket}
          blue
        />
        <Stat
          title="Anggaran Anda"
          value={rupiah(plan.budget)}
          sub={
            inBudget
              ? `Sisa pada batas atas: ${rupiah(plan.budget - c.max)}`
              : `Melebihi batas atas: ${rupiah(c.max - plan.budget)}`
          }
          icon={Wallet}
        />
        <Stat
          title="Hemat dari stok dapur"
          value={range(c.savedMin, c.savedMax)}
          sub={`${c.lines.filter((l) => l.used > 0).length} jenis bahan sudah dimanfaatkan`}
          icon={Package}
        />
      </div>
      <div className={"info-box " + (inBudget ? "success-box" : "warning")}>
        <ShieldCheck size={20} />
        <div>
          <strong>
            {inBudget
              ? "Direncanakan sesuai anggaran Anda"
              : "Alternatif termurah dari katalog simulasi"}
          </strong>
          <p>
            {inBudget
              ? "Batas atas seluruh estimasi belanja berada dalam anggaran. "
              : "Ditampilkan untuk membantu meninjau kebutuhan minimum. "}
            Menu mempertimbangkan porsi, stok dapur, bahan favorit, pantangan,
            dan alergi yang tersimpan saat pembuatan.
          </p>
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="Hari perencanaan">
        {Array.from({ length: plan.days }, (_, i) => (
          <button
            role="tab"
            aria-selected={day === i}
            aria-controls="day-panel"
            key={i}
            onClick={() => setDay(i)}
            className={"day-tab " + (day === i ? "selected" : "")}
          >
            Hari {i + 1}
            <small>{dateLabel(plan.start, i, true)}</small>
          </button>
        ))}
      </div>
      <section id="day-panel" role="tabpanel">
        <div className="result-heading">
          <div>
            <h2>{dateLabel(plan.start, day)}</h2>
            <p>
              Estimasi belanja hari ini:{" "}
              <strong style={{ color: "#4b5641" }}>
                {range(dailyMin, dailyMax)}
              </strong>
            </p>
          </div>
          <Badge color="green">
            <Users size={11} />
            {plan.people} porsi setiap menu
          </Badge>
        </div>
        <div className="meal-grid">
          {[0, 1, 2].map((s) => (
            <MealCard key={`${day}-${s}`} d={day} s={s} plan={plan} calc={c} />
          ))}
        </div>
      </section>
      <Note>
        Nilai gizi merupakan informasi perkiraan per porsi, bukan target gizi
        atau saran medis. Stok dipakai berurutan dari awal rencana; biaya harian
        dapat berbeda karena alokasi stok.
      </Note>
      <div className="panel" style={{ marginTop: 25 }}>
        <div className="section-title" style={{ marginTop: 0 }}>
          <h2>Ringkasan biaya harian</h2>
          <Badge color="gray">Setelah memakai stok</Badge>
        </div>
        <div className="summary-list">
          {plan.menu.map((_, d) => {
            const ms = c.meals.filter((m) => m.d === d);
            return (
              <div key={d}>
                <span>
                  Hari {d + 1} · {dateLabel(plan.start, d, true)}
                </span>
                <strong>
                  {range(
                    ms.reduce((n, m) => n + m.min, 0),
                    ms.reduce((n, m) => n + m.max, 0),
                  )}
                </strong>
              </div>
            );
          })}
          <div>
            <span>Estimasi tanpa stok</span>
            <strong>{range(c.min + c.savedMin, c.max + c.savedMax)}</strong>
          </div>
          <div>
            <span>Pengurangan dari stok</span>
            <strong>− {range(c.savedMin, c.savedMax)}</strong>
          </div>
          <div style={{ color: "var(--blue)" }}>
            <strong>Total estimasi belanja</strong>
            <strong>{range(c.min, c.max)}</strong>
          </div>
        </div>
      </div>
      <SourceNote />
    </>
  );
}
function Infeasible() {
  const { failure, stock, form, setStep, savePlan, startPlan } = useApp();
  if (!failure)
    return (
      <Empty
        title="Mulai dengan kebutuhan Anda"
        sub="Atur anggaran dan preferensi untuk membuat rencana."
      >
        <Btn onClick={startPlan}>Buat Rencana Makan</Btn>
      </Empty>
    );
  const c = failure.cheapest && calculate(failure.cheapest, stock);
  return (
    <>
      <PageHeader
        title="Mari sesuaikan rencana Anda"
        sub="Sedikit penyesuaian bisa membuat rencana makan terasa lebih pas."
      />
      <div className="error-plan">
        <AlertTriangle size={47} strokeWidth={1.5} />
        <h2>
          {failure.error
            ? "Belum ada menu yang sesuai."
            : "Anggaran belum mencukupi untuk rencana ini."}
        </h2>
        <p>
          {failure.error
            ? "Kombinasi bahan yang dihindari dan pola makan belum dapat dipenuhi oleh katalog simulasi kami. Tinjau preferensi atau stok. Alergi Anda tetap dikecualikan."
            : `Untuk ${form.people} orang selama ${form.days} hari, alternatif termurah dari katalog simulasi membutuhkan kisaran berikut setelah memakai stok Anda.`}
        </p>
        {c && (
          <>
            <div className="cost">{range(c.min, c.max)}</div>
            <Badge color="orange">
              Masih di atas anggaran {rupiah(form.budget)}
            </Badge>
            <p style={{ marginTop: 18 }}>
              Batas atas estimasi melebihi anggaran sebesar{" "}
              <strong>{rupiah(c.max - form.budget)}</strong>. Alternatif ini
              belum sesuai anggaran.
            </p>
          </>
        )}
        <div className="actions" style={{ marginTop: 25 }}>
          {failure.error ? (
            <Btn
              onClick={() => {
                setStep(4);
                go("/buat-rencana");
              }}
            >
              Tinjau Preferensi
              <ArrowRight size={15} />
            </Btn>
          ) : (
            <>
              <Btn
                onClick={() => {
                  savePlan({ ...failure.cheapest, alternative: true });
                }}
              >
                Lihat Alternatif Termurah
                <ArrowRight size={15} />
              </Btn>
              <Btn
                variant="outline"
                onClick={() => {
                  setStep(2);
                  go("/buat-rencana");
                }}
              >
                Ubah Anggaran
              </Btn>
            </>
          )}
        </div>
      </div>
      <Note>
        “Termurah” berarti kombinasi dengan batas atas biaya belanja terendah
        dari 9 resep simulasi yang tersedia, sesuai porsi, stok, dan
        pengecualian Anda. Angka ini bukan harga pasar waktu nyata.
      </Note>
    </>
  );
}
function RecipeDialog({ d, s }) {
  const { plan, stock, setModal } = useApp();
  if (!plan) return null;
  const r = getRecipe(plan.menu[d][s]),
    c = calculate(plan, stock),
    m = c.meals.find((x) => x.d === d && x.s === s),
    labels = ["Energi", "Protein", "Karbohidrat", "Lemak", "Serat"];
  return (
    <Dialog title="Dari dapur PanganBantu" close={() => setModal(null)} large>
      <div className="recipe-hero">
        <img src={r.image} alt={r.name + " — foto ilustrasi"} />
        <div>
          <Badge color="green">
            {slots[s]} · Hari {d + 1}
          </Badge>
          <h2>{r.name}</h2>
          <div className="meal-meta">
            <Clock size={14} />
            {r.time} menit <span>·</span>
            <Users size={14} />
            {plan.people} porsi
          </div>
          <div className="meal-price">{range(m.min, m.max)}</div>
          <p>Estimasi bahan tambahan untuk {plan.people} porsi.</p>
        </div>
      </div>
      <div className="recipe-columns">
        <section>
          <h3>Bahan yang dibutuhkan</h3>
          <p className="muted" style={{ fontSize: 11 }}>
            Takaran sudah disesuaikan untuk {plan.people} porsi. Beras ditimbang
            sebelum dimasak.
          </p>
          {m.lines.map((l) => (
            <div className="ingredient-line" key={l.id}>
              <div>
                <strong>{ingredients[l.id].name}</strong>
                <span>{qty(l.need, l.id)}</span>
              </div>
              {l.used > 0 && (
                <small style={{ color: "#547843" }}>
                  <Check size={10} style={{ verticalAlign: "middle" }} /> Sudah
                  tersedia: {qty(l.used, l.id)}{" "}
                  {l.buy === 0 ? "· Tidak perlu dibeli" : ""}
                </small>
              )}
              {l.buy > 0 && (
                <small>
                  Perlu dibeli: {qty(l.buy, l.id)} · {range(l.min, l.max)}
                </small>
              )}
            </div>
          ))}
          <p className="muted" style={{ fontSize: 10, marginTop: 12 }}>
            Air secukupnya digunakan untuk memasak. Alokasi stok ini
            memperhitungkan menu sebelumnya agar tidak terhitung dua kali.
          </p>
        </section>
        <section>
          <h3>Cara memasak</h3>
          {r.steps.map((step, i) => (
            <div className="cooking-step" key={step}>
              <span>{i + 1}</span>
              <p>{step}</p>
            </div>
          ))}
          <Note>
            Foto adalah ilustrasi penyajian dan dapat memuat pelengkap. Gunakan
            daftar bahan resep ini; pelengkap foto tidak termasuk dalam
            perhitungan.
          </Note>
        </section>
      </div>
      <h3 style={{ fontSize: 16, margin: "25px 0 12px" }}>
        Perkiraan gizi per porsi
      </h3>
      <div className="nutrition-full">
        {r.nutrition.map((n, i) => (
          <div key={labels[i]}>
            <strong>
              {n} {i === 0 ? "kkal" : "g"}
            </strong>
            {labels[i]}
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 10 }}>
        Informasi gizi simulasi, bukan target gizi pribadi atau diagnosis medis.
      </p>
      <Btn variant="outline" onClick={() => setModal(null)}>
        <ArrowLeft size={15} />
        Kembali ke Rencana Makan
      </Btn>
    </Dialog>
  );
}
function SwapDialog({ d, s }) {
  const { plan, setPlan, stock, prefs, setModal, notify, setChecked } =
    useApp();
  const opts = recipes
    .filter(
      (r) =>
        r.slot === s &&
        r.id !== plan.menu[d][s] &&
        allowed(r, prefs) &&
        allowed(r, plan.prefs),
    )
    .map((r) => {
      const p = structuredClone(plan);
      p.menu[d][s] = r.id;
      const c = calculate(p, stock);
      return { r, p, c };
    })
    .filter((o) => o.c.max <= plan.budget);
  return (
    <Dialog
      title="Pilih menu pengganti"
      sub={`${slots[s]} · Hari ${d + 1} · ${plan.people} porsi`}
      close={() => setModal(null)}
    >
      <Note>
        Hanya pilihan yang sesuai anggaran, porsi, serta pengecualian rencana
        dan preferensi terbaru yang ditampilkan. Estimasi seluruh rencana akan
        dihitung ulang.
      </Note>
      {opts.length ? (
        opts.map(({ r, p, c }) => (
          <article className="alt-card" key={r.id}>
            <img src={r.image} alt={r.name} />
            <div>
              <h3>{r.name}</h3>
              <p>
                {r.time} menit · {r.nutrition[0]} kkal per porsi
              </p>
              <p>
                Total belanja rencana: <strong>{range(c.min, c.max)}</strong>
              </p>
              <Btn
                className="small"
                onClick={() => {
                  setPlan(p);
                  setChecked({});
                  setModal(null);
                  notify(
                    "Menu berhasil diganti. Daftar belanja sudah diperbarui.",
                  );
                }}
              >
                Pilih Menu
                <Check size={13} />
              </Btn>
            </div>
          </article>
        ))
      ) : (
        <Empty
          title="Belum ada pengganti yang sesuai"
          sub="Pilihan lain pada katalog belum memenuhi seluruh anggaran dan pengecualian Anda. Menu saat ini tetap tersimpan."
          icon={ChefHat}
        >
          <Btn variant="outline" onClick={() => setModal(null)}>
            Kembali ke rencana
          </Btn>
        </Empty>
      )}
    </Dialog>
  );
}

function Grocery() {
  const { plan, stock, checked, setChecked, startPlan, notify } = useApp(),
    [filter, setFilter] = useState("Semua");
  if (!plan)
    return (
      <Empty
        title="Daftar belanja belum tersedia"
        sub="Buat rencana makan terlebih dahulu. Daftar bahan yang perlu dibeli akan tersusun otomatis."
        icon={ShoppingBasket}
      >
        <Btn onClick={startPlan}>
          Buat Rencana Makan
          <ArrowRight size={16} />
        </Btn>
      </Empty>
    );
  const c = calculate(plan, stock),
    buyLines = c.lines.filter((l) => l.buy > 0),
    done = buyLines.filter((l) => checked[l.id]).length,
    remaining = buyLines.filter((l) => !checked[l.id]);
  const toggle = (id) => {
    const next = !checked[id];
    setChecked({ ...checked, [id]: next });
    notify(
      next
        ? ingredients[id].name + " ditandai sudah dibeli."
        : "Tanda pembelian " + ingredients[id].name + " dibatalkan.",
    );
  };
  return (
    <>
      <PageHeader
        eyebrow="BELANJA SECUKUPNYA, MASAK SEPENUH HATI"
        title="Daftar Belanja"
        sub={`${dateRange(plan)} · ${plan.people} orang · ${plan.days * 3} hidangan`}
      >
        <div className="actions">
          <Btn variant="outline" onClick={() => window.print()}>
            <Printer size={15} />
            Cetak Daftar
          </Btn>
          <Btn to="/rencana" variant="outline">
            <ArrowLeft size={15} />
            Lihat Rencana
          </Btn>
        </div>
      </PageHeader>
      <div className="shopping-total">
        <div>
          <small>Total estimasi belanja</small>
          <strong>{range(c.min, c.max)}</strong>
          <p className="remaining">
            Dari {range(c.min + c.savedMin, c.max + c.savedMax)}, hemat stok{" "}
            {range(c.savedMin, c.savedMax)}.
          </p>
        </div>
        <Badge color={c.max <= plan.budget ? "green" : "orange"}>
          {c.max <= plan.budget ? (
            <CheckCircle2 size={13} />
          ) : (
            <AlertTriangle size={13} />
          )}{" "}
          {c.max <= plan.budget ? "Sesuai anggaran" : "Melebihi anggaran"}
        </Badge>
      </div>
      {c.max > plan.budget && (
        <Note warning>
          Estimasi batas atas melebihi anggaran {rupiah(c.max - plan.budget)}.
          Daftar ini belum sesuai anggaran {rupiah(plan.budget)}.
        </Note>
      )}
      <Note>
        <strong>
          Jumlah dibeli = Maks(0, Jumlah dibutuhkan - Stok tersedia)
        </strong>
        <p>
          Stok yang ditampilkan adalah bagian yang digunakan untuk rencana ini.
          Jika stok lebih banyak, sisa stok tetap tersedia di dapur.
        </p>
      </Note>
      <div className="toolbar">
        <div>
          <strong style={{ fontSize: 13 }}>
            {done} dari {buyLines.length} bahan ditandai dibeli
          </strong>
          <p className="remaining">
            Belum ditandai:{" "}
            {range(
              remaining.reduce((n, l) => n + l.min, 0),
              remaining.reduce((n, l) => n + l.max, 0),
            )}
          </p>
        </div>
        <div className="filter-tabs" style={{ margin: 0 }}>
          {["Semua", "Belum dibeli"].map((f) => (
            <button
              key={f}
              className={filter === f ? "selected" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {buyLines.length > 0 && done === buyLines.length && (
        <Note success>
          Semua bahan belanja telah ditandai. Daftar siap dipakai untuk memasak.
          Tanda pembelian hanya simulasi dan tidak menambah stok otomatis.
        </Note>
      )}
      {["Sayuran", "Protein", "Bahan Pokok", "Bumbu"].map((category) => {
        const lines = c.lines.filter(
          (l) =>
            ingredients[l.id].category === category &&
            (filter === "Semua" || (l.buy > 0 && !checked[l.id])),
        );
        return lines.length ? (
          <section className="shopping-group" key={category}>
            <h3>
              {category}{" "}
              <small style={{ fontWeight: 400, marginLeft: 8 }}>
                {lines.length} bahan
              </small>
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Bahan</th>
                    <th>Dibutuhkan</th>
                    <th>Dari stok</th>
                    <th>Perlu dibeli</th>
                    <th>Estimasi harga</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr
                      key={l.id}
                      className={checked[l.id] && l.buy > 0 ? "purchased" : ""}
                    >
                      <td>
                        <label>
                          {l.buy > 0 ? (
                            <input
                              type="checkbox"
                              checked={!!checked[l.id]}
                              onChange={() => toggle(l.id)}
                              aria-label={
                                "Tandai " +
                                ingredients[l.id].name +
                                " sudah dibeli"
                              }
                            />
                          ) : (
                            <CheckCircle2
                              size={16}
                              style={{
                                color: "#6b8a58",
                                marginRight: 12,
                                verticalAlign: "middle",
                              }}
                            />
                          )}
                          {ingredients[l.id].name}
                        </label>
                      </td>
                      <td>{qty(l.need, l.id)}</td>
                      <td>{qty(l.used, l.id)}</td>
                      <td>
                        {l.buy > 0 ? (
                          <strong>{qty(l.buy, l.id)}</strong>
                        ) : (
                          <Badge color="green">Sudah tersedia</Badge>
                        )}
                      </td>
                      <td>{l.buy > 0 ? range(l.min, l.max) : "Rp0–Rp0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null;
      })}
      {filter === "Belum dibeli" && !remaining.length && (
        <Empty
          title="Daftar sudah beres!"
          sub="Tidak ada lagi bahan yang belum ditandai untuk dibeli."
          icon={CheckCircle2}
        >
          <Btn variant="outline" onClick={() => setFilter("Semua")}>
            Tampilkan semua bahan
          </Btn>
        </Empty>
      )}
      <Note>
        Tanda centang adalah interaksi simulasi. Total estimasi kebutuhan tetap
        sama meski bahan sudah ditandai. Stok dapat diperbarui secara terpisah
        melalui halaman Stok Bahan.
      </Note>
      <SourceNote />
    </>
  );
}

function Profile() {
  const { user, setUser, notify, plan, stock } = useApp(),
    [name, setName] = useState(user.name),
    [error, setError] = useState("");
  function save(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama pengguna tidak boleh kosong.");
      return;
    }
    if (!user.demo) {
      const accounts = read("accounts", []);
      if (
        accounts.some(
          (a) =>
            a.email !== user.email &&
            a.name.toLowerCase() === name.trim().toLowerCase(),
        )
      ) {
        setError("Nama pengguna sudah dipakai. Pilih nama lain.");
        return;
      }
      localStorage.setItem(
        "pb-accounts",
        JSON.stringify(
          accounts.map((a) =>
            a.email === user.email ? { ...a, name: name.trim() } : a,
          ),
        ),
      );
    }
    setUser({ ...user, name: name.trim() });
    setError("");
    notify("Profil berhasil diperbarui.");
  }
  return (
    <>
      <PageHeader
        eyebrow="RUANG PRIBADI ANDA"
        title="Profil Saya"
        sub="Kelola informasi akun dan lihat ringkasan dapur Anda."
      />
      <div className="profile-grid">
        <form className="panel" onSubmit={save}>
          <div
            className="avatar"
            style={{ width: 62, height: 62, fontSize: 22, marginBottom: 22 }}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <h2>Informasi akun</h2>
          <p className="panel-sub">Akun simulasi tersimpan di peramban ini.</p>
          <label className="field">
            <span>Nama pengguna</span>
            <input
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Alamat email</span>
            <input type="email" value={user.email} disabled />
            <small>Email digunakan sebagai identitas akun simulasi.</small>
          </label>
          {error && (
            <div className="field-error" role="alert">
              {error}
            </div>
          )}
          <button type="submit" className="btn primary">
            <Check size={16} />
            Simpan Profil
          </button>
        </form>
        <aside>
          <div className="panel">
            <Leaf size={27} color="#687e55" />
            <h3 style={{ marginTop: 18 }}>Dapur Anda, sekilas</h3>
            <div className="summary-list">
              <div>
                <span>Mode rencana</span>
                <strong>{plan ? plan.mode : "Belum diatur"}</strong>
              </div>
              <div>
                <span>Jumlah peserta</span>
                <strong>{plan ? `${plan.people} orang` : "—"}</strong>
              </div>
              <div>
                <span>Stok tercatat</span>
                <strong>{Object.keys(stock).length} bahan</strong>
              </div>
              <div>
                <span>Status akun</span>
                <strong>{user.demo ? "Demo" : "Simulasi"}</strong>
              </div>
            </div>
            <a href="#/preferensi" className="text-link">
              Atur preferensi makanan
              <ArrowRight size={14} />
            </a>
          </div>
          <Note>
            Data prototipe disimpan lokal di peramban, tidak dikirim ke layanan
            autentikasi atau basis data.
          </Note>
        </aside>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
