import React,{useEffect,useState} from 'react'
import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'

function Health(){
  const [health,setHealth]=useState({revenus:0,depenses:0,dettes:0,cashflow:0,status:'Chargement',score:0,advice:[]})
  const token=localStorage.getItem('token')
  const headers={Authorization:`Bearer ${token}`}

  const loadHealth=async()=>{
    const res=await axios.get(`${API_BASE}/api/health/`,{headers})
    setHealth(res.data)
  }

  useEffect(()=>{ if(token) loadHealth() },[token])

  const ratio = health.revenus ? Math.round((health.dettes / health.revenus) * 100) : 0

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{margin:0,color:'#1f2a44'}}>Santé financière</h2>
          <p style={{margin:'8px 0 0',color:'#606f8a'}}>Analyse automatique et recommandations pour votre commerce.</p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20,marginBottom:24}}>
        <div style={{background:'white',borderRadius:24,padding:24,boxShadow:'0 18px 50px rgba(15,23,42,0.08)'}}>
          <h3 style={{margin:'0 0 16px',color:'#1f2a44'}}>Score global</h3>
          <div style={{fontSize:48,fontWeight:700,color: health.score > 70 ? '#1f8a58' : health.score > 40 ? '#ff9f1c' : '#ff4d6d'}}>{health.score}%</div>
          <p style={{margin:'14px 0 0',color:'#55637d'}}>Statut : {health.status}</p>
        </div>
        <div style={{background:'white',borderRadius:24,padding:24,boxShadow:'0 18px 50px rgba(15,23,42,0.08)'}}>
          <h3 style={{margin:'0 0 16px',color:'#1f2a44'}}>Indicateurs clés</h3>
          <div style={{display:'grid',gap:12}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><span>Revenus</span><strong>{health.revenus.toFixed(2)} FCFA</strong></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span>Dépenses</span><strong>{health.depenses.toFixed(2)} FCFA</strong></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span>Dettes</span><strong>{health.dettes.toFixed(2)} FCFA</strong></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span>Cashflow</span><strong>{health.cashflow.toFixed(2)} FCFA</strong></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span>Ratio dette / revenu</span><strong>{ratio}%</strong></div>
          </div>
        </div>
      </div>

      <div style={{background:'white',borderRadius:24,padding:24,boxShadow:'0 18px 50px rgba(15,23,42,0.08)'}}>
        <h3 style={{margin:'0 0 16px',color:'#1f2a44'}}>Recommandations intelligentes</h3>
        <ul style={{paddingLeft:20,margin:0,color:'#4a5a7f'}}>
          {health.advice.map((item,index)=>(<li key={index} style={{marginBottom:12}}>{item}</li>))}
        </ul>
      </div>
    </div>
  )
}

export default Health
