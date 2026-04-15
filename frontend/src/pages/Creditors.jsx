import React,{useEffect,useState} from 'react'
import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'

function Creditors(){
  const [creditors,setCreditors]=useState([])
  const [message,setMessage]=useState('')
  const token=localStorage.getItem('token')
  const headers={Authorization:`Bearer ${token}`}

  const loadCreditors=async()=>{
    const res=await axios.get(`${API_BASE}/api/creditors/`,{headers})
    setCreditors(res.data.creditors)
  }

  useEffect(()=>{ if(token) loadCreditors() },[token])

  const downloadPdf=async()=>{
    try{
      const res=await axios.get(`${API_BASE}/api/report/creditors/`,{headers,responseType:'blob'})
      const url=window.URL.createObjectURL(new Blob([res.data],{type:'application/pdf'}))
      const link=document.createElement('a')
      link.href=url
      link.setAttribute('download','creanciers.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      setMessage('Téléchargement lancé')
    }catch(err){
      setMessage('Impossible de télécharger le PDF pour le moment')
    }
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{margin:0,color:'#1f2a44'}}>Liste des créanciers</h2>
          <p style={{margin:'8px 0 0',color:'#606f8a'}}>Suivez les dettes clients selon chaque catégorie de produit.</p>
        </div>
        <button onClick={downloadPdf} style={{padding:'14px 20px',borderRadius:14,background:'#3751ff',color:'white',border:'none',cursor:'pointer'}}>Télécharger en PDF</button>
      </div>

      {message && <div style={{marginBottom:18,color:'#3751ff'}}>{message}</div>}

      <div style={{background:'white',borderRadius:24,padding:24,boxShadow:'0 18px 50px rgba(15,23,42,0.08)'}}>
        <div style={{display:'grid',gap:14}}>
          {creditors.map(item=>(
            <div key={item.id} style={{padding:'16px',borderRadius:18,background:'#f5f8ff'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <strong>{item.categorie}</strong>
                <span style={{color:'#66758f'}}>{item.date}</span>
              </div>
              <div style={{marginBottom:8,color:'#2c3b69'}}>Quantité : {item.quantite}</div>
              <div style={{fontSize:15,fontWeight:700,color:'#1f2a44'}}>Total dette : {(item.total || (item.montant * item.quantite)).toFixed(2)} FCFA</div>
              <div style={{marginTop:6,color:'#5d6b88'}}>Prix unitaire : {item.montant.toFixed(2)} FCFA</div>
            </div>
          ))}
          {creditors.length===0 && <p style={{color:'#6f7a94'}}>Aucune créancier enregistré.</p>}
        </div>
      </div>
    </div>
  )
}

export default Creditors
