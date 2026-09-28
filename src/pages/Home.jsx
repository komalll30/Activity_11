import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

const emptyStats = { members: 0, memberships: 0, trainers: 0 }

export default function Home() {
  const [stats, setStats] = useState(emptyStats)
  const [featuredPlans, setFeaturedPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let current = true

    async function loadHome() {
      if (!supabase) {
        setError('Connect Supabase with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to load live gym data.')
        setLoading(false)
        return
      }

      const [membersResult, plansResult, trainersResult, featuredResult] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('memberships').select('id', { count: 'exact', head: true }).eq('available', true),
        supabase.from('trainers').select('id', { count: 'exact', head: true }),
        supabase.from('memberships').select('*').eq('available', true).order('price').limit(2),
      ])

      if (!current) return
      const failure = [membersResult, plansResult, trainersResult, featuredResult].find((result) => result.error)
      if (failure) setError(failure.error.message)
      else {
        setStats({
          members: membersResult.count ?? 0,
          memberships: plansResult.count ?? 0,
          trainers: trainersResult.count ?? 0,
        })
        setFeaturedPlans(featuredResult.data ?? [])
      }
      setLoading(false)
    }

    loadHome()
    return () => { current = false }
  }, [])

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow"><span className="live-dot" /> IRONNEST / TRAIN WITH INTENT</p>
          <h1>Stronger looks good <span>on you.</span></h1>
          <p className="home-intro">A focused space to build strength, find your rhythm, and keep showing up. Your next chapter starts on the floor.</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/memberships">Explore memberships <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" to="/trainers">Meet the coaches <span aria-hidden="true">→</span></Link>
          </div>
          <div className="home-stats" aria-label="Live gym statistics">
            <div><strong>{loading || error ? '—' : stats.members}</strong><span>members</span></div>
            <div><strong>{loading || error ? '—' : stats.memberships}</strong><span>open plans</span></div>
            <div><strong>{loading || error ? '—' : stats.trainers}</strong><span>coaches</span></div>
          </div>
          {error && <p className="inline-error" role="alert">{error}</p>}
        </div>
        <div className="home-visual">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85"
            alt="Strength training equipment on a modern gym floor"
          />
          <div className="visual-caption"><span>01 / THE FLOOR</span><strong>Built for the work.</strong></div>
          <div className="visual-index" aria-hidden="true">IN<span>—</span>01</div>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <div><p className="eyebrow">FIND YOUR FIT</p><h2>Memberships, without the guesswork.</h2></div>
          <Link className="text-link" to="/memberships">All memberships <span aria-hidden="true">↗</span></Link>
        </div>
        {error && featuredPlans.length === 0 ? (
          <p className="state-message">Featured memberships will appear when Supabase is connected.</p>
        ) : loading ? (
          <p className="state-message" role="status">Loading featured memberships…</p>
        ) : featuredPlans.length === 0 ? (
          <p className="state-message">No available memberships right now.</p>
        ) : (
          <div className="featured-grid">
            {featuredPlans.map((plan, index) => (
              <article className="featured-plan" key={plan.id}>
                <span className="featured-number">0{index + 1}</span>
                <div><h3>{plan.name}</h3><p>{plan.description}</p></div>
                <div className="featured-price">₹{Number(plan.price).toLocaleString('en-IN')}<span> / {plan.duration} mo</span></div>
                <Link className="round-link" to={`/join?membership=${plan.id}`} aria-label={`Join with the ${plan.name} plan`}>↗</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}