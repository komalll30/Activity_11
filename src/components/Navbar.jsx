import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/memberships', label: 'Memberships' },
  { to: '/join', label: 'Join' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/members', label: 'Members' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="navbar">
        <NavLink className="brand" to="/" onClick={() => setMenuOpen(false)} aria-label="IronNest home">
          <span className="brand-mark" aria-hidden="true">I</span><span>IRON<span>NEST</span></span>
        </NavLink>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>
        <nav id="primary-navigation" className={menuOpen ? 'primary-nav is-open' : 'primary-nav'} aria-label="Main navigation">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link is-active' : 'nav-link'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink className="nav-cta" to="/join">Become a member <span aria-hidden="true">↗</span></NavLink>
      </div>
    </header>
  )
}
