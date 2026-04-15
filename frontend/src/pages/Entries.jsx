import React,{useEffect,useState} from 'react'
import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'

function Entries(){
  const [items,setItems]=useState([])
  const [montant,setMontant]=useState('')
  const [categorie,setCategorie]=useState('')
  const [quantite,setQuantite]=useState('')
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const [message,setMessage]=useState('')
  const token=localStorage.getItem('token')
  const headers={Authorization:`Bearer ${token}`}

  const loadEntries=async()=>{
    const res=await axios.get(`${API_BASE}/api/revenus/`,{headers})
    setItems(res.data)
  }

  useEffect(()=>{ if(token) loadEntries() },[token])

  const saveEntry=async()=>{
    if(!montant || !categorie || !quantite){ setMessage('Montant, catégorie et quantité requis'); return }
    await axios.post(`${API_BASE}/api/revenus/`, {montant:parseFloat(montant),categorie,quantite:parseInt(quantite),date},{headers})
    setMontant(''); setCategorie(''); setQuantite(''); setMessage('Entrée enregistrée')
    loadEntries()
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{margin:0,color:'#1f2a44'}}>Enregistrement des entrées</h2>
          <p style={{margin:'8px 0 0',color:'#606f8a'}}>Ajoutez les revenus de votre commerce.</p>
        </div>
      </div>

      <div style={{background:'white',borderRadius:24,padding:24,boxShadow:'0 18px 50px rgba(15,23,42,0.08)',marginBottom:24}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:18}}>
          <input type='number' placeholder='Montant unitaire (€)' value={montant} onChange={e=>setMontant(e.target.value)} style={{padding:'14px',borderRadius:14,border:'1px solid #dfe3ec'}}/>
          <input type='text' placeholder='Catégorie / produit' value={categorie} onChange={e=>setCategorie(e.target.value)} style={{padding:'14px',borderRadius:14,border:'1px solid #dfe3ec'}}/>
          <input type='number' placeholder='Quantité' value={quantite} onChange={e=>setQuantite(e.target.value)} style={{padding:'14px',borderRadius:14,border:'1px solid #dfe3ec'}}/>
          <input type='date' value={date} onChange={e=>setDate(e.target.value)} style={{padding:'14px',borderRadius:14,border:'1px solid #dfe3ec'}}/>
        </div>
        {message && <div style={{margin:'16px 0',color:'#3751ff'}}>{message}</div>}
        <button onClick={saveEntry} style={{padding:'14px 20px',borderRadius:14,background:'#3751ff',color:'white',border:'none',cursor:'pointer'}}>Ajouter une entrée</button>
      </div>

      <div style={{background:'white',borderRadius:24,padding:24,boxShadow:'0 18px 50px rgba(15,23,42,0.08)'}}>
        <h3 style={{margin:'0 0 18px',color:'#1f2a44'}}>Historique des entrées</h3>
        <div style={{display:'grid',gap:14}}>
          {items.map((item)=>(
            <div key={item.id} style={{padding:'16px',borderRadius:18,background:'#f7f9ff'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <strong>{(item.montant * item.quantite).toFixed(2)} FCFA</strong>
                <span style={{color:'#66758f'}}>{item.date}</span>
              </div>
              <div style={{color:'#4c5e7f'}}>{item.categorie} - Quantité: {item.quantite}</div>
              <div style={{marginTop:6,color:'#66758f'}}>Prix unitaire : {item.montant.toFixed(2)} FCFA</div>
            </div>
          ))}
          {items.length===0 && <p style={{color:'#6f7a94'}}>Aucune entrée enregistrée.</p>}
        </div>
      </div>
    </div>
  )
}

export default Entries
