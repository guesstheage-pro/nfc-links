"use client";
import { useState, useEffect } from 'react';
import { generateShortCode } from '@/lib/utils';

export default function Dashboard() {
  const [links, setLinks] = useState<any[]>([]);
  const [cliente, setCliente] = useState('');
  const [linkOriginale, setLinkOriginale] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  const loadLinks = async () => {
    const res = await fetch('/api/links?action=READ_ALL');
    const data = await res.json();
    if (Array.isArray(data)) setLinks(data);
  };

  useEffect(() => { loadLinks(); }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !linkOriginale) return;
    setLoading(true);

    const code = generateShortCode();
    const shortLink = `${baseUrl}/${code}`;
    const date = new Date().toLocaleDateString('it-IT');

    const payload = {
      action: 'CREATE',
      id: code,
      cliente,
      linkOriginale,
      linkCorto: shortLink,
      dataCreazione: date
    };

    await fetch('/api/links', { method: 'POST', body: JSON.stringify(payload) });
    setCliente(''); setLinkOriginale(''); await loadLinks(); setLoading(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Sicuro di disattivare questo link?')) return;
    await fetch('/api/links', { method: 'POST', body: JSON.stringify({ action: 'DEACTIVATE', id }) });
    loadLinks();
  };

  const handleUpdate = async (id: string) => {
    await fetch('/api/links', { method: 'POST', body: JSON.stringify({ action: 'UPDATE', id, linkOriginale: editUrl }) });
    setEditMode(null); loadLinks();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-semibold mb-6">Gestione Link NFC</h1>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inserisci nome cliente</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" value={cliente} onChange={e => setCliente(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incolla qui il link Google Reviews</label>
              <input type="url" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" value={linkOriginale} onChange={e => setLinkOriginale(e.target.value)} required />
            </div>
            <button disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors">
              {loading ? 'Generazione...' : 'GENERA LINK'}
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-6">Elenco dei link</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="pb-3">Cliente</th><th className="pb-3">Codice</th><th className="pb-3">Link originale</th><th className="pb-3">Stato</th><th className="pb-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {links.map((link) => (
                <tr key={link.id} className={`border-b ${link.attivo === 'NO' ? 'opacity-50' : ''}`}>
                  <td className="py-4">{link.cliente}</td>
                  <td className="py-4"><span className="bg-gray-100 px-2 py-1 rounded font-mono">{link.id}</span></td>
                  <td className="py-4 max-w-[200px] truncate pr-4">
                    {editMode === link.id ? (
                      <div className="flex gap-2">
                        <input type="url" className="border px-2 py-1 rounded w-full" value={editUrl} onChange={e => setEditUrl(e.target.value)} />
                        <button onClick={() => handleUpdate(link.id)} className="text-green-600 font-medium">Salva</button>
                      </div>
                    ) : ( link.linkOriginale )}
                  </td>
                  <td className="py-4">{link.attivo === 'SI' ? 'Attivo' : 'Disattivato'}</td>
                  <td className="py-4 text-right space-x-3">
                    <button onClick={() => copyToClipboard(link.linkCorto, link.id)} className="text-blue-600 font-medium">{copiedId === link.id ? 'Copiato!' : 'Copia link'}</button>
                    {link.attivo === 'SI' && (
                      <>
                        <button onClick={() => { setEditMode(link.id); setEditUrl(link.linkOriginale); }} className="text-slate-600 font-medium">Modifica</button>
                        <button onClick={() => handleDeactivate(link.id)} className="text-red-600 font-medium">Disattiva</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
