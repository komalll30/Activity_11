import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

export default function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let current = true
    async function loadTrainers() {
      if (!supabase) {
        setError('Add your Supabase URL and anon key to .env.local to load trainers.')
        setLoading(false)
        return
      }
      const { data, error: queryError } = await supabase.from('trainers').select('*').order('name')
      if (!current) return
      if (queryError) setError(queryError.message)
      else setTrainers(data ?? [])
      setLoading(false)
    }
    loadTrainers()
    return () => { current = false }
  }, [])

  const trainingTypes = [...new Set(trainers.map((trainer) => trainer.training_type).filter(Boolean))]
  const filteredTrainers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return trainers.filter((trainer) => {
      const matchesSearch = !query || `${trainer.name} ${trainer.specialization}`.toLowerCase().includes(query)
      return matchesSearch && (type === 'all' || trainer.training_type === type)
    })
  }, [trainers, search, type])

  return (
    <div className="page-shell">
      <div className="page-heading"><div><p className="eyebrow">PEOPLE / COACHING</p><h1>Good people. Better coaching.</h1><p className="page-lede">Meet the coaches who help turn showing up into momentum.</p></div><span className="heading-index">01 — TEAM</span></div>
      <div className="toolbar">
        <label className="search-field"><span className="sr-only">Search trainers</span><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search coaches or focus" /></label>
        <label className="filter-field"><span className="sr-only">Filter by training type</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All training types</option>{trainingTypes.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <span className="result-count">{loading ? 'Loading coaches' : `${filteredTrainers.length} coaches`}</span>
      </div>
      {loading && <p className="state-message" role="status">Loading trainers…</p>}
      {error && <p className="state-message state-error" role="alert">{error}</p>}
      {!loading && !error && filteredTrainers.length === 0 && <p className="state-message">No coaches match those filters.</p>}
      {!loading && !error && filteredTrainers.length > 0 && (
        <div className="trainer-grid">
          {filteredTrainers.map((trainer, index) => (
            <article className="trainer-card" key={trainer.id}>
              <div className={`trainer-mark trainer-mark-${index % 4}`} aria-hidden="true">{trainer.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</div>
              <div className="trainer-card-heading"><span className="eyebrow">COACH / {String(index + 1).padStart(2, '0')}</span><span className="status-pill status-active">{trainer.availability}</span></div>
              <h2>{trainer.name}</h2>
              <p className="trainer-specialty">{trainer.specialization}</p>
              <div className="trainer-meta"><span><strong>{trainer.experience}</strong> years experience</span><span>{trainer.training_type}</span></div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}