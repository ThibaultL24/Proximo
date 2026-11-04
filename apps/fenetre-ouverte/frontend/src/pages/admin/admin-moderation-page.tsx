import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

interface PendingPost {
  id: number;
  body: string;
  category: string;
  requested_syndication: boolean;
  requested_providers: string[];
  created_at: string;
  merchant: { id: number; name: string };
}
interface PendingProfile {
  id: number;
  merchant_name: string;
  merchant_id: number;
  changeset: Record<string, string>;
  logo_attached: boolean;
  photos_count: number;
  logo_url?: string | null;
  photo_urls?: string[];
  submitted_at: string;
}
export function AdminModerationPage() {
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      api.get<PendingPost[]>("/admin/publication_moderations"),
      api.get<PendingProfile[]>("/admin/profile_reviews"),
    ]);
    setPosts(a.data);
    setProfiles(b.data);
  }, []);
  useEffect(() => { load().catch(() => setError("Impossible de charger la modération.")); }, [load]);
  async function decide(type: "publication_moderations" | "profile_reviews", id: number, decision: "approve" | "reject") {
    const reason = decision === "reject" ? window.prompt("Motif de refus transmis au commerçant :") : "";
    if (decision === "reject" && !reason?.trim()) return;
    setBusy(`${type}-${id}`);
    setError("");
    try {
      await api.patch(`/admin/${type}/${id}/${decision}`, decision === "reject" ? { reason } : {});
      await load();
    } catch { setError("L'opération a échoué. Vérifiez vos droits et réessayez."); }
    finally { setBusy(null); }
  }
  return (
    <div className="space-y-8 pb-10">
      <div className="rounded-[2rem] bg-[#0b4c93] px-7 py-8 text-white shadow-xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#ffd65d]">Édition & confiance</p>
        <h1 className="mt-3 text-3xl font-bold">Centre de modération</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">Gardez le contrôle des publications et des fiches commerçantes. Rien n'est publié automatiquement.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full bg-white/15 px-4 py-2 text-sm">{posts.length} publication(s) à relire</span>
          <span className="rounded-full bg-[#ffbd24] px-4 py-2 text-sm font-bold text-[#093969]">{profiles.length} fiche(s) en attente</span>
        </div>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-800">{error}</p>}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">Publications commerçantes</h2><Link to="/fil" className="text-sm font-semibold text-petrol">Voir le fil public</Link></div>
        {posts.length === 0 && <p className="fo-card p-6 text-ink-muted">Aucune publication en attente.</p>}
        {posts.map(post => (
          <article key={post.id} className="fo-card space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-3"><span className="fo-pill px-3 py-1 text-xs">En attente</span><strong>{post.merchant.name}</strong><span className="text-xs text-ink-muted">{post.category}</span></div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
            <p className="text-xs text-ink-muted">Diffusion réseaux demandée : {post.requested_syndication ? (post.requested_providers.join(", ") || "réseaux connectés") : "non"}</p>
            <div className="flex gap-3">
              <button type="button" disabled={!!busy} onClick={() => decide("publication_moderations", post.id, "approve")} className="rounded-xl bg-[#0b4c93] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">Approuver et publier</button>
              <button type="button" disabled={!!busy} onClick={() => decide("publication_moderations", post.id, "reject")} className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-bold text-red-700 disabled:opacity-40">Refuser</button>
            </div>
          </article>
        ))}
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Modifications de fiches</h2>
        {profiles.length === 0 && <p className="fo-card p-6 text-ink-muted">Aucune fiche en attente.</p>}
        {profiles.map(profile => (
          <article key={profile.id} className="fo-card space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-3"><span className="fo-pill px-3 py-1 text-xs">Proposition</span><strong>{profile.merchant_name}</strong></div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {Object.entries(profile.changeset).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-paper p-3"><dt className="text-xs font-bold text-ink-muted">{key}</dt><dd className="mt-1 break-words text-sm">{String(value)}</dd></div>
              ))}
            </dl>
            {(profile.logo_attached || profile.photos_count > 0) && <div className="space-y-3">
              <p className="text-sm text-ink-muted">Médias soumis à validation : {profile.photos_count} photo(s){profile.logo_attached ? " et un logo" : ""}</p>
              <div className="flex flex-wrap gap-3">
                {profile.logo_url && <a href={profile.logo_url} target="_blank" rel="noreferrer" aria-label="Agrandir le nouveau logo"><img src={profile.logo_url} alt="Nouveau logo proposé" className="h-24 w-24 rounded-xl border border-line object-cover" /></a>}
                {(profile.photo_urls || []).map((url,i) => <a href={url} target="_blank" rel="noreferrer" key={url} aria-label={`Agrandir la photo ${i+1}`}><img src={url} alt={`Photo proposée ${i+1}`} className="h-24 w-32 rounded-xl border border-line object-cover" /></a>)}
              </div>
            </div>}
            <div className="flex gap-3">
              <button type="button" disabled={!!busy} onClick={() => decide("profile_reviews", profile.id, "approve")} className="rounded-xl bg-[#0b4c93] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">Valider la fiche</button>
              <button type="button" disabled={!!busy} onClick={() => decide("profile_reviews", profile.id, "reject")} className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-bold text-red-700 disabled:opacity-40">Refuser</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
