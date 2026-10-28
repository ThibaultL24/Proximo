import { useEffect, useMemo, useState } from "react";
import { fetchAdminArticles } from "../../api/admin-articles";
import type { Article } from "../../types";
import "./admin-gazette-studio.css";

const columns = (body: string) => body.split(/\n{2,}/).filter(Boolean);
export function AdminGazetteStudioPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [issue, setIssue] = useState("N° 7");
  const [edition, setEdition] = useState("Octobre 2026");
  const [subtitle, setSubtitle] = useState("L'info qui nous rassemble");
  const [error, setError] = useState("");
  useEffect(() => {
    fetchAdminArticles({ scope: "gazette" }).then(data => {
      setArticles(data);
      setSelectedId(data[0]?.id ?? null);
    }).catch(() => setError("Impossible de charger les articles de la Gazette."));
  }, []);
  const article = useMemo(() => articles.find(a => a.id === selectedId), [articles, selectedId]);
  return (
    <section className="space-y-6">
      <header className="rounded-[2rem] bg-[#093969] p-7 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-[#ffd44a]">Fenêtre Ouverte · Édition</p>
        <h1 className="mt-2 text-3xl font-bold">Studio Gazette</h1>
        <p className="mt-2 text-blue-100">Composez une page A4 pour la Gazette papier et exportez-la via l'impression PDF de votre navigateur.</p>
      </header>
      <div className="gazette-editor-controls fo-card grid gap-4 p-5 md:grid-cols-2">
        <label className="text-sm font-bold">Article
          <select className="mt-2 w-full rounded-xl border border-line bg-white p-3" value={selectedId ?? ""} onChange={e => setSelectedId(Number(e.target.value))}>
            {articles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">Édition
          <input className="mt-2 w-full rounded-xl border border-line p-3" value={edition} onChange={e => setEdition(e.target.value)} />
        </label>
        <label className="text-sm font-bold">Numéro
          <input className="mt-2 w-full rounded-xl border border-line p-3" value={issue} onChange={e => setIssue(e.target.value)} />
        </label>
        <label className="text-sm font-bold">Accroche de la Gazette
          <input className="mt-2 w-full rounded-xl border border-line p-3" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
        </label>
        <button type="button" onClick={() => window.print()} className="rounded-xl bg-[#ffbd24] px-6 py-3 text-sm font-bold text-[#093969] md:col-span-2">
          Imprimer / Enregistrer en PDF
        </button>
        <p className="text-xs text-ink-muted md:col-span-2">Maquette d'une page inspirée de la Gazette d'octobre : deux colonnes, grand titre, photographie et pied de page. La pagination multi-pages et les gabarits restent à développer.</p>
      </div>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div id="gazette-print-area" className="gazette-sheet mx-auto">
        <header className="gazette-sheet-header">
          <div><strong>FENÊTRE <span>OUVERTE</span></strong><small>{subtitle}</small></div>
          <p>LA GAZETTE<br/><b>SUD ARDÈCHE · DRÔME · VAUCLUSE</b></p>
        </header>
        <div className="gazette-sheet-body">
          <p className="gazette-eyebrow">Les gens d'ici · Le territoire à l'honneur</p>
          <h2>{article?.title || "La vie de notre territoire"}</h2>
          <p className="gazette-lead">{article?.excerpt || "Choisissez un article pour commencer la mise en page."}</p>
          {article?.cover_image_url && <img className="gazette-cover" src={article.cover_image_url} alt="" />}
          <div className="gazette-columns">{columns(article?.body || "Vos articles et portraits locaux prendront place ici.").map((p,i) => <p key={i}>{p}</p>)}</div>
        </div>
        <footer className="gazette-sheet-footer"><span>FENÊTRE OUVERTE · L'INFO QUI NOUS RASSEMBLE</span><span>{edition} · {issue}</span></footer>
      </div>
    </section>
  );
}
