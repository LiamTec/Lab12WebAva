"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Author = {
  id: string;
  name: string;
  email: string;
  books?: any[];
};

export default function DashboardPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthors();
  }, []);

  async function fetchAuthors() {
    setLoading(true);
    try {
      const res = await fetch("/api/authors");
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: res.statusText }));
        setError(errBody?.error || "Error");
        setAuthors([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setAuthors(data as Author[]);
      else setAuthors([]);
    } catch (e) {
      console.error(e);
      setError("Error al obtener autores");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        setError(err?.error || "Error al crear");
        return;
      }
      setName("");
      setEmail("");
      await fetchAuthors();
    } catch (e) {
      console.error(e);
      setError("Error al crear autor");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar autor?")) return;
    try {
      const res = await fetch(`/api/authors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        console.error(await res.text());
        return;
      }
      setAuthors((s) => s.filter((a) => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  const totalBooks = authors.reduce((s, a) => s + (a.books ? a.books.length : 0), 0);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/books" className="text-sm px-3 py-1 rounded border">Ir a libros</Link>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-2">Crear autor</h2>
            <form onSubmit={handleCreate} className="grid gap-3">
              <input className="border px-3 py-2 rounded" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="border px-3 py-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <div className="flex gap-3 items-center">
                <button className="bg-blue-600 text-white px-3 py-1.5 rounded" type="submit">Crear</button>
                {error && <span className="text-sm text-red-500">{error}</span>}
              </div>
            </form>
          </div>

          <aside className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-2">Estadísticas generales</h3>
            <p className="text-sm text-gray-600">Total autores: <strong className="text-black">{authors.length}</strong></p>
            <p className="text-sm text-gray-600">Total libros: <strong className="text-black">{totalBooks}</strong></p>
          </aside>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Autores</h2>
          {loading ? <p>Cargando...</p> : (
            <div className="space-y-3">
              {authors.map((a) => (
                <div key={a.id} className="flex items-center justify-between border-t pt-3">
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-sm text-gray-500">{a.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/authors/${a.id}`} className="px-2 py-1 rounded border">Ver / Edit</Link>
                    <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => handleDelete(a.id)}>Eliminar</button>
                    <Link href={`/authors/${a.id}`} className="px-2 py-1 rounded border">Ver libros</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
