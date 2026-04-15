import React,{useState} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'

function Register(){
  const [username,setUsername]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [err,setErr]=useState('')
  const navigate=useNavigate()

  const register=async()=>{
    setErr('')
    if(!username || !email || !password){
      setErr('Tous les champs sont requis')
      return
    }
    if(password !== confirm){
      setErr('Les mots de passe ne correspondent pas')
      return
    }
    try{
      const r = await axios.post(`${API_BASE}/api/register/`, {username,email,password})
      localStorage.setItem('token', r.data.access)
      localStorage.setItem('refresh_token', r.data.refresh)
      navigate('/dashboard')
    }catch(e){
      setErr(e.response?.data?.detail || 'Impossible de créer le compte')
    }
  }

  return (
    <div className='auth-background'>
      <div className='auth-card'>
        <div className='auth-header'>
          <div className='auth-badge'>Inscription</div>
          <h2>Créez votre compte commerçant</h2>
          <p>Rejoignez votre espace de gestion financière et commencez à suivre vos ventes.</p>
        </div>

        {err && <div className='auth-error'>{err}</div>}

        <div className='auth-form'>
          <input className='auth-input' placeholder="Nom d'utilisateur" value={username} onChange={e=>setUsername(e.target.value)}/>
          <input className='auth-input' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)}/>
          <input className='auth-input' type='password' placeholder='Mot de passe' value={password} onChange={e=>setPassword(e.target.value)}/>
          <input className='auth-input' type='password' placeholder='Confirmer le mot de passe' value={confirm} onChange={e=>setConfirm(e.target.value)}/>
          <button className='auth-button' onClick={register}>S'inscrire</button>
        </div>

        <div className='auth-footer'>
          <span>Déjà inscrit ?</span>
          <button className='auth-link' onClick={()=>navigate('/')}>Se connecter</button>
        </div>
      </div>
    </div>
  )
}

export default Register
