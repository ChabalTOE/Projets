
import React,{useState} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'

function Login(){
  const [u,setU]=useState("")
  const [p,setP]=useState("")
  const [err,setErr]=useState("")
  const navigate=useNavigate()

  const login=async()=>{
    if(!u || !p){
      setErr("Nom d'utilisateur et mot de passe requis")
      return
    }
    try{
      const r=await axios.post(`${API_BASE}/api/login/`,{username:u,password:p})
      localStorage.setItem("token",r.data.access)
      localStorage.setItem("refresh_token",r.data.refresh)
      navigate('/dashboard')
    }catch(e){
      setErr(e.response?.data?.detail || "Erreur de connexion")
    }
  }

  return(
    <div className='auth-background'>
      <div className='auth-card'>
        <div className='auth-header'>
          <div className='auth-badge'>Finance</div>
          <h2>Connexion commerçant</h2>
          <p>Entrez vos identifiants pour accéder à votre espace de gestion financière.</p>
        </div>

        {err && <div className='auth-error'>{err}</div>}

        <div className='auth-form'>
          <input className='auth-input' placeholder="Nom d'utilisateur" value={u} onChange={e=>setU(e.target.value)}/>
          <input className='auth-input' type="password" placeholder="Mot de passe" value={p} onChange={e=>setP(e.target.value)}/>
          <button className='auth-button' onClick={login}>Se connecter</button>
        </div>

        <div className='auth-footer'>
          <span>Pas encore inscrit ?</span>
          <button className='auth-link' onClick={()=>navigate('/register')}>S'inscrire</button>
        </div>
      </div>
    </div>
  )
}

export default Login
