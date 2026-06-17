import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Globe, Plus, Edit, ExternalLink, Github, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function SitesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sites } = await supabase.from('sites').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My Sites</h1>
          <p className="text-gray-500 mt-1">{sites?.length ?? 0} website{sites?.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/builder" className="btn btn-primary btn-md"><Plus size={15} /> New Website</Link>
      </div>

      {!sites || sites.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="text-5xl mb-4">🌐</div>
          <h2 className="font-bold text-xl mb-2">No websites yet</h2>
          <p className="text-gray-500 text-sm mb-6">Build your first AI-powered website in minutes.</p>
          <Link href="/builder" className="btn btn-primary btn-lg w-fit mx-auto"><Plus size={15} /> Create your first site</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {sites.map(site => (
            <div key={site.id} className="card overflow-hidden hover:shadow-card-md transition-shadow">
              <div className="h-32 bg-gradient-to-br from-brand-50 to-surface-100 border-b border-surface-200 flex items-center justify-center">
                <Globe size={28} className="text-brand-300" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-base">{site.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{site.subdomain}.harnova.my</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    <span className={`status-${site.status}`} />
                    <span className="text-xs text-gray-500 capitalize">{site.status}</span>
                  </div>
                </div>

                {site.deploy_expires_at && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-2">
                    <Clock size={11} /> Expires {formatDate(site.deploy_expires_at)}
                  </div>
                )}
                {site.github_repo && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <Github size={11} /> {site.github_repo}
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-4">{formatDate(site.created_at)}</p>

                <div className="flex items-center gap-2">
                  <Link href={`/builder?site=${site.id}`} className="btn btn-primary btn-sm flex-1"><Edit size={11} /> Edit</Link>
                  {site.deployed_url && (
                    <a href={site.deployed_url} target="_blank" rel="noopener" className="btn btn-secondary btn-sm flex-1"><ExternalLink size={11} /> View Live</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
