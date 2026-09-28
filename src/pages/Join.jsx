import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'

const blankForm = {
  name: '', email: '', phone: '', age: '', gender: '', membership_id: '',
  fitness_goal: '', workout_time: '', emergency_contact: '', notes: '',
}

export default function Join() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState(blankForm)
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let current = true

    async function loadMemberships() {
      if (!supabase) {
        setError('Connect Supabase with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to register.')
        setLoading(false)
        return
      }
      const { data, error: queryError } = await supabase
        .from('memberships').select('id,name,duration,price').eq('available', true).order('price')
      if (!current) return
      if (queryError) setError(queryError.message)
      else {
        setMemberships(data ?? [])
        const requestedId = searchParams.get('membership')
        const selected = data?.find((membership) => membership.id === requestedId) ?? data?.[0]
        if (selected) setForm((currentForm) => ({ ...currentForm, membership_id: selected.id }))
      }
      setLoading(false)
    }

    loadMemberships()
    return () => { current = false }
  }, [searchParams])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!supabase) {
      setError('Supabase is not connected. Add the project URL and anon key to .env.local.')
      return
    }
    const phonePattern = /^[+()\d\s.-]{7,20}$/
    if (!phonePattern.test(form.phone.trim())) {
      setError('Enter a valid phone number, including its country code if needed.')
      return
    }
    if (!phonePattern.test(form.emergency_contact.trim())) {
      setError('Enter a valid emergency contact phone number.')
      return
    }
    const age = Number(form.age)
    if (!Number.isInteger(age) || age < 13 || age > 100) {
      setError('Age must be a whole number between 13 and 100.')
      return
    }
    if (!memberships.some((membership) => membership.id === form.membership_id)) {
      setError('Choose an available membership plan.')
      return
    }

    setSubmitting(true)
    const { error: insertError } = await supabase.from('members').insert([{
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      age,
      emergency_contact: form.emergency_contact.trim(),
      notes: form.notes.trim(),
    }])
    setSubmitting(false)

    if (insertError) setError(`Registration could not be completed: ${insertError.message}`)
    else {
      setMessage(`You're registered, ${form.name.trim()}. Welcome to IronNest.`)
      setForm(blankForm)
    }
  }

  return (
    <div className="page-shell join-page">
      <div className="page-heading">
        <div><p className="eyebrow">YOUR FIRST REP</p><h1>Let’s get you started.</h1><p className="page-lede">Share a few details and we’ll get your membership set up.</p></div>
        <div className="join-aside"><span>01</span><p>Good training starts with a plan that fits your life.</p></div>
      </div>

      {error && <p className="form-alert" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}
      <form className="join-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend><span>01</span> Your details</legend>
          <div className="form-grid">
            <label className="field"><span>Full name</span><input name="name" value={form.name} onChange={updateField} autoComplete="name" required maxLength="120" /></label>
            <label className="field"><span>Email address</span><input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required maxLength="254" /></label>
            <label className="field"><span>Phone number</span><input name="phone" type="tel" value={form.phone} onChange={updateField} autoComplete="tel" required maxLength="20" placeholder="+91 98765 43210" /></label>
            <label className="field"><span>Age</span><input name="age" type="number" min="13" max="100" step="1" value={form.age} onChange={updateField} required /></label>
            <label className="field"><span>Gender</span><select name="gender" value={form.gender} onChange={updateField} required><option value="">Select an option</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Prefer not to say</option></select></label>
            <label className="field"><span>Membership plan</span><select name="membership_id" value={form.membership_id} onChange={updateField} required disabled={loading || memberships.length === 0}><option value="">{loading ? 'Loading plans…' : 'Choose a plan'}</option>{memberships.map((membership) => <option key={membership.id} value={membership.id}>{membership.name} · ₹{Number(membership.price).toLocaleString('en-IN')} / {membership.duration} mo</option>)}</select></label>
          </div>
        </fieldset>

        <fieldset>
          <legend><span>02</span> Your training</legend>
          <div className="form-grid">
            <label className="field"><span>Fitness goal</span><select name="fitness_goal" value={form.fitness_goal} onChange={updateField} required><option value="">Choose your focus</option><option>Build strength</option><option>Improve endurance</option><option>Weight management</option><option>Mobility and flexibility</option><option>General fitness</option><option>Other</option></select></label>
            <label className="field"><span>Preferred workout time</span><select name="workout_time" value={form.workout_time} onChange={updateField} required><option value="">Choose a time</option><option>Early morning</option><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Flexible</option></select></label>
            <label className="field"><span>Emergency contact</span><input name="emergency_contact" type="tel" value={form.emergency_contact} onChange={updateField} required maxLength="20" placeholder="Contact phone number" /></label>
            <label className="field field-wide"><span>Anything else we should know <small>Optional</small></span><textarea name="notes" value={form.notes} onChange={updateField} rows="4" maxLength="1000" placeholder="Training experience, accessibility needs, or questions" /></label>
          </div>
        </fieldset>

        <div className="form-actions"><p>Your details are used to manage your membership.</p><button className="button button-primary" type="submit" disabled={loading || submitting || !memberships.length}>{submitting ? 'Registering…' : 'Complete registration'} <span aria-hidden="true">↗</span></button></div>
      </form>
    </div>
  )
}