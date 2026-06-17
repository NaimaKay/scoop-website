"use client";

import { useEffect, useState } from "react";

const ADMIN_PASSWORD = "minnehaha2024";

type Flavor = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  inStock: boolean;
  category: string;
};

type ModalState = { open: boolean; selectedFlavor: Flavor | null };

export default function Home() {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [modal, setModal] = useState<ModalState>({ open: false, selectedFlavor: null });
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [adminPrompt, setAdminPrompt] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminPwError, setAdminPwError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/flavors").then((r) => r.json()).then(setFlavors);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }

  function tryAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (adminPw === ADMIN_PASSWORD) {
      setAdminMode(true);
      setAdminPrompt(false);
      setAdminPw("");
      setAdminPwError("");
    } else {
      setAdminPwError("Wrong password.");
    }
  }

  async function toggleStock(flavor: Flavor) {
    await fetch(`/api/flavors/${flavor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !flavor.inStock }),
    });
    const updated = await fetch("/api/flavors").then((r) => r.json());
    setFlavors(updated);
    if (!flavor.inStock) {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flavorId: flavor.id }),
      });
      showToast(`✓ ${flavor.name} is back in stock — subscribers notified!`);
    } else {
      showToast(`✓ ${flavor.name} marked out of stock.`);
    }
  }

  function openModal(flavor: Flavor) {
    setModal({ open: true, selectedFlavor: flavor });
    setSelectedIds([flavor.id]);
    setEmail("");
    setPhone("");
    setSuccess(false);
    setError("");
  }

  function closeModal() {
    setModal({ open: false, selectedFlavor: null });
  }

  function toggleFlavor(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || selectedIds.length === 0) {
      setError("Please enter your email and select at least one flavor.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, flavorIds: selectedIds }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Something went wrong.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inStock = flavors.filter((f) => f.inStock);
  const outOfStock = flavors.filter((f) => !f.inStock);

  return (
    <main className="min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 bg-teal-500 text-white px-6 py-3 rounded-2xl shadow-xl z-50 font-bold text-sm">
          {toast}
        </div>
      )}

      {/* Admin password prompt */}
      {adminPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">🔐</div>
            <h3 className="text-xl font-bold text-gray-700 mb-4" style={{ fontFamily: "'Pacifico', cursive" }}>
              Admin Mode
            </h3>
            <form onSubmit={tryAdminLogin} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={adminPw}
                onChange={(e) => setAdminPw(e.target.value)}
                placeholder="Password"
                className="w-full border-2 border-yellow-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400 text-center text-lg"
              />
              {adminPwError && <p className="text-red-500 text-sm">{adminPwError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-coral text-white font-bold py-2 rounded-full hover:bg-red-400 transition-colors"
                >
                  Enter
                </button>
                <button
                  type="button"
                  onClick={() => { setAdminPrompt(false); setAdminPw(""); setAdminPwError(""); }}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-300 via-pink-200 to-teal-200 py-20 px-4 text-center relative">
        <div className="text-7xl mb-4">🍦</div>
        <h1
          className="text-6xl text-coral drop-shadow-sm mb-4"
          style={{ fontFamily: "'Pacifico', cursive" }}
        >
          Minnehaha Scoop
        </h1>
        <p className="text-2xl font-bold text-gray-700 mb-2">
          Life&apos;s too short for boring ice cream!
        </p>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Subscribe to get notified the moment your favorite flavor is back in stock. Never miss a scoop again! 🎉
        </p>

        {/* Admin toggle */}
        <div className="absolute top-4 right-4">
          {adminMode ? (
            <button
              onClick={() => setAdminMode(false)}
              className="text-xs bg-orange-400 text-white font-bold px-3 py-1.5 rounded-full hover:bg-orange-500 transition-colors shadow"
            >
              ✓ Admin Mode — Click to Exit
            </button>
          ) : (
            <button
              onClick={() => setAdminPrompt(true)}
              className="text-xs bg-white/60 text-gray-500 font-bold px-3 py-1.5 rounded-full hover:bg-white/80 transition-colors"
            >
              Admin
            </button>
          )}
        </div>
      </section>

      {adminMode && (
        <div className="bg-orange-50 border-b-2 border-orange-200 px-4 py-3 text-center text-sm font-semibold text-orange-700">
          🛠 Admin Mode — click <strong>Mark Out</strong> or <strong>Mark In</strong> on any flavor card to update stock. Subscribers are emailed automatically when a flavor comes back.
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* IN STOCK */}
        <div className="flex items-baseline gap-3 mb-6">
          <h2
            className="text-3xl text-teal-600 font-bold"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            🌟 In Stock
          </h2>
          <span className="text-sm font-bold text-teal-500 bg-teal-50 px-3 py-1 rounded-full">
            {inStock.length} flavor{inStock.length !== 1 ? "s" : ""}
          </span>
        </div>

        {inStock.length === 0 ? (
          <p className="text-gray-400 italic mb-14">No flavors in stock right now — check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-16">
            {inStock.map((f) => (
              <FlavorCard
                key={f.id}
                flavor={f}
                onNotify={openModal}
                adminMode={adminMode}
                onToggleStock={toggleStock}
              />
            ))}
          </div>
        )}

        {/* OUT OF STOCK */}
        <div className="border-t-2 border-dashed border-gray-200 pt-12">
          <div className="flex items-baseline gap-3 mb-2">
            <h2
              className="text-3xl text-coral font-bold"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              😢 Out of Stock
            </h2>
            <span className="text-sm font-bold text-red-400 bg-red-50 px-3 py-1 rounded-full">
              {outOfStock.length} flavor{outOfStock.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-gray-500 mb-6">
            Subscribe below to be the first to know when these come back!
          </p>

          {outOfStock.length === 0 ? (
            <p className="text-gray-400 italic mb-14">Everything is in stock — lucky you! 🎉</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-14">
              {outOfStock.map((f) => (
                <FlavorCard
                  key={f.id}
                  flavor={f}
                  onNotify={openModal}
                  adminMode={adminMode}
                  onToggleStock={toggleStock}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-yellow-300 text-center py-6 text-gray-700 font-semibold">
        © 2024 Minnehaha Scoop &nbsp;•&nbsp; Made with 🍦 &nbsp;•&nbsp;{" "}
        <a href="/admin" className="underline hover:text-coral transition-colors">
          Admin Dashboard
        </a>
      </footer>

      {/* Subscribe Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-5 text-2xl text-gray-400 hover:text-coral"
            >
              ✕
            </button>

            {success ? (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3
                  className="text-2xl font-bold text-teal-600 mb-2"
                  style={{ fontFamily: "'Pacifico', cursive" }}
                >
                  You&apos;re on the list!
                </h3>
                <p className="text-gray-600">
                  We&apos;ll email you the moment your flavors are back. Stay sweet! 🍦
                </p>
                <button
                  onClick={closeModal}
                  className="mt-6 bg-coral text-white px-6 py-2 rounded-full font-bold hover:bg-red-400 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3
                  className="text-2xl font-bold text-coral mb-1"
                  style={{ fontFamily: "'Pacifico', cursive" }}
                >
                  Get Notified!
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Enter your email and pick every flavor you want updates on.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border-2 border-yellow-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Phone <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (612) 000-0000"
                      className="w-full border-2 border-yellow-200 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Notify me when these are back:
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {flavors.map((f) => (
                        <label
                          key={f.id}
                          className={`flex items-center gap-2 cursor-pointer text-sm rounded-xl px-3 py-2 transition-colors ${
                            selectedIds.includes(f.id)
                              ? "bg-teal-50 ring-1 ring-teal-300"
                              : "bg-gray-50 hover:bg-yellow-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(f.id)}
                            onChange={() => toggleFlavor(f.id)}
                            className="accent-teal-500"
                          />
                          <span>
                            {f.emoji} {f.name}
                            {f.category === "oat-based" && (
                              <span className="ml-1 text-teal-500">🌱</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-coral text-white font-bold py-3 rounded-full hover:bg-red-400 transition-colors disabled:opacity-50 text-lg"
                  >
                    {submitting ? "Subscribing..." : "🍦 Subscribe!"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function FlavorCard({
  flavor,
  onNotify,
  adminMode,
  onToggleStock,
}: {
  flavor: Flavor;
  onNotify: (f: Flavor) => void;
  adminMode?: boolean;
  onToggleStock?: (f: Flavor) => void;
}) {
  const isNonDairy = flavor.category === "oat-based";

  return (
    <div
      className="rounded-3xl shadow-lg overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-xl"
      style={{ backgroundColor: flavor.color }}
    >
      <div className="text-5xl text-center pt-6 pb-1">{flavor.emoji}</div>
      <div className="bg-white/75 backdrop-blur-sm flex-1 p-3 flex flex-col">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="font-bold text-gray-800 text-sm leading-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {flavor.name}
          </h3>
          {isNonDairy && (
            <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full shrink-0">
              🌱
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs flex-1 leading-snug" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {flavor.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-1">
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              flavor.inStock ? "bg-teal-100 text-teal-700" : "bg-red-100 text-red-600"
            }`}
          >
            {flavor.inStock ? "✓ In Stock" : "✗ Out"}
          </span>
          {adminMode ? (
            <button
              onClick={() => onToggleStock?.(flavor)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                flavor.inStock
                  ? "bg-orange-200 text-orange-700 hover:bg-orange-300"
                  : "bg-teal-200 text-teal-700 hover:bg-teal-300"
              }`}
            >
              {flavor.inStock ? "Mark Out" : "Mark In ✉️"}
            </button>
          ) : (
            <button
              onClick={() => onNotify(flavor)}
              className="text-xs bg-coral text-white font-bold px-3 py-1 rounded-full hover:bg-red-400 transition-colors"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Notify Me
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
