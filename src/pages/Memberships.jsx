import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Memberships() {
  const [plans, setPlans] = useState([])
  const [search, setSearch] = useState('')
  const [duration, setDuration] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let current = true

    async function loadMemberships() {
      if (!supabase) {
        setError('Add your Supabase URL and anon key to .env.local to load memberships.')
        setLoading(false)
        return
      }

      const { data, error: queryError } = await supabase
        .from('memberships')
        .select('*')
        .order('price', { ascending: true })

      if (!current) return
      if (queryError) setError(queryError.message)
      else setPlans(data ?? [])
      setLoading(false)
    }

    loadMemberships()
    return () => { current = false }
  }, [])

  const filteredPlans = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return plans.filter((plan) => {
      const matchesSearch = !normalizedSearch ||
        `${plan.name} ${plan.description ?? ''}`.toLowerCase().includes(normalizedSearch)
      const months = Number(plan.duration)
      const matchesDuration = duration === 'all' ||
        (duration === 'short' ? months <= 3 : months > 3)
      return matchesSearch && matchesDuration
    })
  }, [plans, search, duration])

  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MEMBERSHIPS / PLANS</p>
          <h1>Choose your commitment.</h1>
          <p className="page-lede">Straightforward plans for every kind of training week.</p>
        </div>
        <Link className="button button-primary" to="/join">Join the gym <span aria-hidden="true">↗</span></Link>
      </div>

      <div className="toolbar" aria-label="Membership filters">
        <label className="search-field">
          <span className="sr-only">Search memberships</span>
          <span aria-hidden="true">⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search plans" />
        </label>
        <label className="filter-field">
          <span className="sr-only">Filter by duration</span>
          <select value={duration} onChange={(event) => setDuration(event.target.value)}>
            <option value="all">Any duration</option>
            <option value="short">Up to 3 months</option>
            <option value="long">More than 3 months</option>
          </select>
        </label>
        <span className="result-count">{loading ? 'Loading plans' : `${filteredPlans.length} plans`}</span>
      </div>

      {loading && <p className="state-message" role="status">Loading memberships…</p>}
      {error && <p className="state-message state-error" role="alert">{error}</p>}
      {!loading && !error && filteredPlans.length === 0 && (
        <p className="state-message">No memberships match those filters.</p>
      )}

      {!loading && !error && filteredPlans.length > 0 && (
        <div className="membership-grid">
          {filteredPlans.map((plan) => (
            <article className={`membership-card${plan.available ? '' : ' is-unavailable'}`} key={plan.id}>
              <div className="membership-card-top">
                <span className={`status-pill ${plan.available ? 'status-active' : 'status-inactive'}`}>
                  {plan.available ? 'Available' : 'Unavailable'}
                </span>
                <span className="duration-label">{plan.duration} months</span>
              </div>
              <h2>{plan.name}</h2>
              <p className="membership-description">{plan.description}</p>
              <p className="membership-price">₹{Number(plan.price).toLocaleString('en-IN')}<span> / plan</span></p>
              <ul className="feature-list">
                {(plan.features ?? []).map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <Link
                className={`button ${plan.available ? 'button-primary' : 'button-muted'}`}
                to={plan.available ? `/join?membership=${plan.id}` : '/memberships'}
                aria-disabled={!plan.available}
                onClick={(event) => { if (!plan.available) event.preventDefault() }}
              >
                {plan.available ? 'Select plan' : 'Not available'} <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}