import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Members() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let current = true
    async function loadMembers() {
      if (!supabase) {
        setError('Add your Supabase URL and anon key to .env.local to load member history.')
        setLoading(false)
        return
      }
      const { data, error: queryError } = await supabase
        .from('members')
        .select('id,name,email,phone,fitness_goal,status,created_at,memberships(name)')
        .order('created_at', { ascending: false })
      if (!current) return
      if (queryError) setError(queryError.message)
      else setMembers(data ?? [])
      setLoading(false)
    }
    loadMembers()
    return () => { current = false }
  }, [])

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return members.filter((member) => {
      const matchesSearch = !query || `${member.name} ${member.email} ${member.phone ?? ''} ${member.memberships?.name ?? ''}`.toLowerCase().includes(query)
      return matchesSearch && (status === 'all' || member.status === status)
    })
  }, [members, search, status])

  return (
    <div className="page-shell">
      <div className="page-heading"><div><p className="eyebrow">PEOPLE / MEMBER HISTORY</p><h1>The people behind the progress.</h1><p className="page-lede">A live directory of registered IronNest members.</p></div><span className="heading-index">{loading ? '—' : String(members.length).padStart(2, '0')} MEMBERS</span></div>
      <div className="toolbar">
        <label className="search-field"><span className="sr-only">Search members</span><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, plan" /></label>
        <label className="filter-field"><span className="sr-only">Filter member status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        <span className="result-count">{loading ? 'Loading members' : `${filteredMembers.length} records`}</span>
      </div>
      {loading && <p className="state-message" role="status">Loading member history…</p>}
      {error && <p className="state-message state-error" role="alert">{error}</p>}
      {!loading && !error && filteredMembers.length === 0 && <p className="state-message">No member records match those filters.</p>}
      {!loading && !error && filteredMembers.length > 0 && (
        <>
          <div className="member-table-wrap">
            <table className="member-table">
              <thead><tr><th>Member</th><th>Membership</th><th>Fitness goal</th><th>Registered</th><th>Status</th></tr></thead>
              <tbody>{filteredMembers.map((member) => <tr key={member.id}>
                <td><strong>{member.name}</strong><span>{member.email}</span><span>{member.phone}</span></td>
                <td>{member.memberships?.name ?? 'Legacy record'}</td>
                <td>{member.fitness_goal || '—'}</td>
                <td>{member.created_at ? dateFormat.format(new Date(member.created_at)) : '—'}</td>
                <td><span className={`status-pill ${member.status === 'active' ? 'status-active' : 'status-inactive'}`}>{member.status}</span></td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="member-mobile-list">{filteredMembers.map((member) => <article className="member-mobile-row" key={member.id}>
            <div className="member-mobile-top"><strong>{member.name}</strong><span className={`status-pill ${member.status === 'active' ? 'status-active' : 'status-inactive'}`}>{member.status}</span></div>
            <p>{member.memberships?.name ?? 'Legacy record'} · {member.fitness_goal || 'No goal set'}</p><a href={`mailto:${member.email}`}>{member.email}</a><span>{member.phone}</span>
          </article>)}</div>
        </>
      )}
    </div>
  )
}