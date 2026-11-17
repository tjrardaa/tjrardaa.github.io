import { PROFILE, PROJECTS, SKILLS, TROPHIES } from './data'

// Mode recruteur : tout l'essentiel sur une page simple, sans 3D.
export default function Recruiter({ onClose, night }) {
  const ink = night ? 'text-[#f1eee5]' : 'text-ink'
  const sub = night ? 'text-[#9b9a93]' : 'text-[#67655e]'
  const card = night ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'
  return (
    <div className={`fixed inset-0 z-50 overflow-auto ${night ? 'bg-[#0b0d14]' : 'bg-[#f4f1ea]'} ${ink}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between gap-3 mb-10">
          <div className="flex items-center gap-3">
            <img src="./favicon.svg" alt="" className="w-10 h-10" />
            <span className="font-mono text-sm">mode recruteur</span>
          </div>
          <button onClick={onClose} className="btn rounded-full px-4 py-2 text-sm font-semibold bg-coral text-white">Voir l’expérience 3D</button>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none">{PROFILE.name}</h1>
        <p className="mt-3 text-xl sm:text-2xl font-semibold">{PROFILE.title}</p>
        <p className={`mt-1 font-mono text-sm ${sub}`}>{PROFILE.tagline} · {PROFILE.location}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={PROFILE.cv} download className={`btn rounded-full px-4 py-2 text-sm font-semibold ${night ? 'bg-white text-ink' : 'bg-ink text-white'}`}>Télécharger le CV</a>
          <a href={`mailto:${PROFILE.email}`} className={`btn rounded-full px-4 py-2 border text-sm ${card}`}>{PROFILE.email}</a>
          <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className={`btn rounded-full px-4 py-2 border text-sm ${card}`}>LinkedIn ↗</a>
          <a href={PROFILE.github} target="_blank" rel="noreferrer" className={`btn rounded-full px-4 py-2 border text-sm ${card}`}>GitHub ↗</a>
        </div>

        <section className="mt-12">
          <h2 className="font-mono text-sm text-coral mb-3">01 · profil</h2>
          {PROFILE.about.map((p) => <p key={p} className="text-lg leading-relaxed mb-3">{p}</p>)}
          <dl className="grid sm:grid-cols-2 gap-3 mt-5">
            {PROFILE.facts.map(([k, v]) => (
              <div key={k} className={`rounded-xl border p-4 ${card}`}><dt className={`font-mono text-xs ${sub}`}>{k}</dt><dd className="mt-1">{v}</dd></div>
            ))}
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="font-mono text-sm text-coral mb-3">02 · projets</h2>
          <div className="grid gap-3">
            {PROJECTS.map((p) => (
              <article key={p.id} className={`rounded-xl border p-5 ${card}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xl font-extrabold">{p.title}</h3>
                  <span className={`font-mono text-xs ${sub}`}>{p.meta}</span>
                </div>
                <p className="mt-2">{p.summary}</p>
                <ul className={`mt-2 list-disc pl-5 text-sm leading-6 ${sub}`}>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
                {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm underline">Code sur GitHub ↗</a>}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-mono text-sm text-coral mb-3">03 · compétences</h2>
          <div className={`rounded-xl border divide-y ${card} ${night ? 'divide-white/10' : 'divide-black/10'}`}>
            {SKILLS.map(([k, v]) => (
              <div key={k} className="p-4 sm:flex gap-4"><div className="font-semibold w-36 shrink-0">{k}</div><div className={sub}>{v}</div></div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-mono text-sm text-coral mb-3">04 · trophées</h2>
          <div className="flex flex-wrap gap-2">
            {TROPHIES.map((t) => (
              <span key={t.name} className={`rounded-full px-3 py-1 text-sm border ${t.got ? 'bg-sun text-ink border-sun' : `${card} ${sub}`}`}>{t.got ? '✓ ' : ''}{t.name}</span>
            ))}
          </div>
        </section>

        <footer className={`mt-14 pt-6 border-t font-mono text-xs ${sub} ${night ? 'border-white/10' : 'border-black/10'}`}>
          Arda Nigiz · Créteil · site construit avec React et Three.js, avec l’aide de Claude
        </footer>
      </div>
    </div>
  )
}
