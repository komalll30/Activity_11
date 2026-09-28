import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

const emptyStats = { members: 0, activeMembers: 0, availableMemberships: 0, trainers: 0 }
const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Dashboard() {
  const [stats, setStats] = useState(emptyStats)
  const [recentMembers, setRecentMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (!supabase) {
      setError('Add your Supabase URL and anon key to .env.local to load dashboard statistics.')
      setLoading(false)
      return
    }
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    const [members, activeMembers, memberships, trainers, recent] = await Promise.all([
      supabase.from('members').select('id', { count: 'exact', head: true }),
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('memberships').select('id', { count: 'exact', head: true }).eq('available', true),
      supabase.from('trainers').select('id', { count: 'exact', head: true }),
      supabase.from('members').select('id,name,created_at,memberships(name)').order('created_at', { ascending: false }).limit(5),
    ])
    const failure = [members, activeMembers, memberships, trainers, recent].find((result) => result.error)
    if (failure) setError(failure.error.message)
    else {
      setStats({
        members: members.count ?? 0,
        activeMembers: activeMembers.count ?? 0,
        availableMemberships: memberships.count ?? 0,
        trainers: trainers.count ?? 0,
      })
      setRecentMembers(recent.data ?? [])
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const metrics = [
    { label: 'Total members', value: stats.members, index: '01' },
    { label: 'Active members', value: stats.activeMembers, index: '02' },
    { label: 'Available plans', value: stats.availableMemberships, index: '03' },
    { label: 'Total trainers', value: stats.trainers, index: '04' },
  ]

  return (
    <div className="page-shell dashboard-page">
      <div className="page-heading"><div><p className="eyebrow">OVERVIEW / LIVE DATA</p><h1>Good morning, IronNest.</h1><p className="page-lede">A live view of membership and coaching activity.</p></div><button className="button button-outline" type="button" onClick={() => loadDashboard(true)} disabled={loading || refreshing}><span aria-hidden="true">↻</span> {refreshing ? 'Refreshing' : 'Refresh data'}</button></div>
      {error && <p className="form-alert" role="alert">Dashboard data could not load: {error}</p>}
      <div className="metric-grid">
        {metrics.map((metric) => <article className="metric" key={metric.label}><span className="metric-index">{metric.index} / LIVE</span><strong>{loading || error ? '—' : metric.value}</strong><span>{metric.label}</span></article>)}
      </div>
      <section className="dashboard-lower">
        <div className="dashboard-section-heading"><div><p className="eyebrow">LATEST JOINERS</p><h2>Recent registrations</h2></div><Link className="text-link" to="/members">Member directory <span aria-hidden="true">↗</span></Link></div>
        {loading ? <p className="state-message">Loading recent members…</p> : recentMembers.length === 0 ? <p className="state-message">New member registrations will appear here.</p> : (
          <div className="recent-list">{recentMembers.map((member, index) => <div className="recent-row" key={member.id}><span className="recent-index">{String(index + 1).padStart(2, '0')}</span><div className="recent-name"><strong>{member.name}</strong><span>{member.memberships?.name ?? 'Legacy record'}</span></div><time>{member.created_at ? dateFormat.format(new Date(member.created_at)) : '—'}</time><span className="recent-arrow" aria-hidden="true">↗</span></div>)}</div>
        )}
      </section>
    </div>
  )
}