import React from 'react'
import {NavLink, useNavigate} from 'react-router-dom'

const menuItems=[
  {path:'/dashboard', label:'Dashboard'},
  {path:'/dashboard/entries', label:'Entrées'},
  {path:'/dashboard/sales', label:'Sorties'},
  {path:'/dashboard/stock', label:'Stock'},
  {path:'/dashboard/debts', label:'Dettes'},
  {path:'/dashboard/transactions', label:'Transactions'},
  {path:'/dashboard/creditors', label:'Créanciers'},
  {path:'/dashboard/health', label:'Santé'}
]

function Sidebar({open,setOpen,theme,setTheme}){
  const navigate=useNavigate()

  const logout=()=>{
    localStorage.removeItem('token')
    navigate('/')
  }

  const toggleTheme=()=>{
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleNavClick=()=>{
    setOpen(false)
  }

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      <div className='sidebar-head'>
        <div className='sidebar-brand'>
          <div className='brand-badge'>F</div>
          {open && <div>
            <div className='brand-title'>FinancePro</div>
            <div className='brand-subtitle'>Gestion commerçant</div>
          </div>}
        </div>
        <button className='sidebar-close' onClick={()=>setOpen(!open)}>{open ? '✕' : '☰'}</button>
      </div>

      <nav className='sidebar-nav'>
        {menuItems.map(item=>(
          <NavLink key={item.path} to={item.path} onClick={handleNavClick} className={({isActive})=>isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <span className='sidebar-icon' />
            {open && item.label}
          </NavLink>
        ))}
      </nav>

      <div className='sidebar-bottom'>
        <button className='theme-toggle' onClick={toggleTheme}>
          <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
        </button>
        <button className='logout-button' onClick={logout}>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
