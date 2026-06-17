"use client";

import { useEffect, useState } from "react";

type Flavor = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  inStock: boolean;
};

type Subscriber = {
  id: string;
  email: string;
  phone?: string;
  flavorIds: string[];
  createdAt: string;
};

const ADMIN_PASSWORD = "minnehaha2024";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [tab, setTab] = useState<"flavors" | "subscribers">("flavors");
  const [toast, setToast] = useState("");
  const [newFlavor, setNewFlavor] = useState({ name: "", emoji: "🍦", color: "#FFD1DC", description: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuthed(sessionStorage.getItem("admin_authed") === "yes");
    }
  }, []);

  useEffect(() => {
    if (authed) {
      loadFlavors();
      loadSubscribers();
    }
  }, [authed]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authed", "yes");
      setAuthed(true);
    } else {
      setLoginError("Wrong password. Try again!");
    }
  }

  function logout() {
    sessionStorage.removeItem("admin_authed");
    setAuthed(false);
  }

  async function loadFlavors() {
    const res = await fetch("/api/flavors");
    setFlavors(await res.json());
  }

  async function loadSubscribers() {
    const res = await fetch("/api/subscribers");
    setSubscribers(await res.json());
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function toggleStock(flavor: Flavor) {
    await fetch(`/api/flavors/${flavor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !flavor.inStock }),
    });
    await loadFlavors();
    if (!flavor.inStock) {
      // Was out of stock, now in stock — notify subscribers
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flavorId: flavor.id }),
      });
      showToast(`✓ Marked in stock & notified subscribers about ${flavor.name}!`);
    } else {
      showToast(`✓ Marked ${flavor.name} as out of stock.`);
    }
  }

  async function deleteFlavor(id: string) {
    if (!confirm("Delete this flavor?")) return;
    await fetch(`/api/flavors/${id}`, { method: "DELETE" });
    await loadFlavors();
    showToast("Flavor deleted.");
  }

  async function addFlavor(e: React.FormEvent) {
    e.preventDefault();
    if (!newFlavor.name) return;
    setAdding(true);
    await fetch("/api/flavors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newFlavor, inStock: true }),
    });
    setNewFlavor({ name: "", emoji: "🍦", color: "#FFD1DC", description: "" });
    await loadFlavors();
    setAdding(false);
    showToast("New flavor added! 🎉");
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-yellow-200 to-pink-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-coral mb-6" style={{ fontFamily: "'Pacifico', cursive" }}>
            Admin Login
          </h1>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border-2 border-yellow-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-400 text-center text-lg"
            />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-coral text-white font-bold py-3 rounded-full hover:bg-red-400 transition-colors text-lg"
            >
              Log In
            </button>
          </form>
          <a href="/" className="block mt-4 text-sm text-gray-400 hover:text-teal-500">← Back to shop</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-300 to-pink-300 px-6 py-4 flex items-center justify-between shadow">
        <h1 className="text-2xl font-bold text-coral" style={{ fontFamily: "'Pacifico', cursive" }}>
          🍦 Minnehaha Scoop — Admin
        </h1>
        <div className="flex gap-3">
          <a href="/" className="text-sm text-gray-600 hover:text-teal-600 font-semibold">← Shop</a>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 font-semibold">Log Out</button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 bg-teal-500 text-white px-6 py-3 rounded-2xl shadow-xl z-50 font-bold">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTab("flavors")}
            className={`px-6 py-2 rounded-full font-bold transition-colors ${tab === "flavors" ? "bg-coral text-white" : "bg-white text-gray-600 hover:bg-yellow-100"}`}
          >
            🍨 Flavors ({flavors.length})
          </button>
          <button
            onClick={() => setTab("subscribers")}
            className={`px-6 py-2 rounded-full font-bold transition-colors ${tab === "subscribers" ? "bg-coral text-white" : "bg-white text-gray-600 hover:bg-yellow-100"}`}
          >
            📧 Subscribers ({subscribers.length})
          </button>
        </div>

        {tab === "flavors" && (
          <>
            {/* Add Flavor Form */}
            <div className="bg-white rounded-3xl shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Add New Flavor</h2>
              <form onSubmit={addFlavor} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <input
                  type="text"
                  required
                  placeholder="Flavor name"
                  value={newFlavor.name}
                  onChange={(e) => setNewFlavor({ ...newFlavor, name: e.target.value })}
                  className="border-2 border-yellow-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400"
                />
                <input
                  type="text"
                  placeholder="Emoji"
                  value={newFlavor.emoji}
                  onChange={(e) => setNewFlavor({ ...newFlavor, emoji: e.target.value })}
                  className="border-2 border-yellow-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400"
                />
                <input
                  type="color"
                  value={newFlavor.color}
                  onChange={(e) => setNewFlavor({ ...newFlavor, color: e.target.value })}
                  className="h-11 w-full rounded-xl border-2 border-yellow-200 cursor-pointer"
                  title="Card color"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newFlavor.description}
                  onChange={(e) => setNewFlavor({ ...newFlavor, description: e.target.value })}
                  className="border-2 border-yellow-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="bg-teal-500 text-white font-bold py-2 px-4 rounded-xl hover:bg-teal-400 transition-colors disabled:opacity-50"
                >
                  + Add
                </button>
              </form>
            </div>

            {/* Flavor Table */}
            <div className="bg-white rounded-3xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-yellow-100 text-gray-600 text-sm">
                  <tr>
                    <th className="text-left px-6 py-3">Flavor</th>
                    <th className="text-left px-6 py-3">Description</th>
                    <th className="text-center px-6 py-3">Status</th>
                    <th className="text-center px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flavors.map((f, i) => (
                    <tr key={f.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm"
                            style={{ backgroundColor: f.color }}
                          >
                            {f.emoji}
                          </span>
                          <span className="font-bold text-gray-800">{f.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{f.description}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            f.inStock ? "bg-teal-100 text-teal-700" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {f.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => toggleStock(f)}
                            className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                              f.inStock
                                ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                            }`}
                          >
                            {f.inStock ? "Mark Out" : "Mark In ✉️"}
                          </button>
                          <button
                            onClick={() => deleteFlavor(f.id)}
                            className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "subscribers" && (
          <div className="bg-white rounded-3xl shadow overflow-hidden">
            {subscribers.length === 0 ? (
              <p className="text-center py-16 text-gray-400">No subscribers yet!</p>
            ) : (
              <table className="w-full">
                <thead className="bg-yellow-100 text-gray-600 text-sm">
                  <tr>
                    <th className="text-left px-6 py-3">Email</th>
                    <th className="text-left px-6 py-3">Phone</th>
                    <th className="text-left px-6 py-3">Subscribed Flavors</th>
                    <th className="text-left px-6 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s, i) => (
                    <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 font-semibold text-gray-800">{s.email}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{s.phone || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {s.flavorIds.map((fid) => {
                            const fl = flavors.find((f) => f.id === fid);
                            return fl ? (
                              <span key={fid} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                {fl.emoji} {fl.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
