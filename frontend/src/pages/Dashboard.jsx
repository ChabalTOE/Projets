
import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

function Dashboard(){
  const [isOpen,setIsOpen]=useState(true)
  const [theme,setTheme]=useState(localStorage.getItem('theme') || 'light')

  useEffect(()=>{
    document.body.classList.toggle('dark-mode', theme === 'dark')
    localStorage.setItem('theme', theme)
  },[theme])

  return (
    <div className={`dashboard-shell ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar open={isOpen} setOpen={setIsOpen} theme={theme} setTheme={setTheme} />
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={()=>setIsOpen(false)}/>
      <main className='dashboard-main'>
        <div className='dashboard-topbar'>
          <button className='dashboard-toggler' onClick={()=>setIsOpen(!isOpen)}>{isOpen ? 'Masquer le menu' : 'Ouvrir le menu'}</button>
          <div>
            <h1>Tableau de bord commerçant</h1>
            <p>Accédez rapidement aux entrées, ventes, dettes et santé financière.</p>
          </div>
        </div>
        <div className='dashboard-content'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Dashboard
