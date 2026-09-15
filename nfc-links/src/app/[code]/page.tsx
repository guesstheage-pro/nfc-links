import { redirect } from 'next/navigation';

export default async function RedirectPage({ params }: { params: { code: string } }) {
  const code = params.code;
  
  const res = await fetch(`${process.env.GOOGLE_SCRIPT_URL}?action=READ_ONE&id=${code}`, { 
    cache: 'no-store' 
  });
  const data = await res.json();

  if (data.error || !data.linkOriginale) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-800">
        <h1 className="text-xl font-medium">Link non trovato.</h1>
      </div>
    );
  }

  if (data.attivo === "NO") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-800">
        <h1 className="text-xl font-medium">Questo link non è più attivo.</h1>
      </div>
    );
  }

  redirect(data.linkOriginale);
}