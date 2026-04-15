import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'

function Stock(){
  const [stock, setStock] = useState([])
  const [totalStock, setTotalStock] = useState(0)
  const [message, setMessage] = useState('')
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const loadStock = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/stock/`, { headers })
      setStock(res.data.stock)
      setTotalStock(res.data.total_stock)
    } catch (err) {
      setMessage('Impossible de charger le stock pour le moment')
    }
  }

  useEffect(() => { if (token) loadStock() }, [token])

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{margin:0,color:'#1f2a44'}}>Stock de marchandises</h2>
          <p style={{margin:'8px 0 0',color:'#606f8a'}}>Suivez les catégories de produits et les quantités restantes.</p>
        </div>
      </div>

      {message && <div style={{marginBottom:18,color:'#d9534f'}}>{message}</div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,marginBottom:24}}>
        <div style={{background:'white',borderRadius:24,padding:24,boxShadow:'0 18px 50px rgba(15,23,42,0.08)'}}>
          <h3 style={{margin:'0 0 16px',color:'#1f2a44'}}>Stock global</h3>
          <div style={{fontSize:42,fontWeight:700,color:'#3751ff'}}>{totalStock} unités</div>
          <p style={{margin:'12px 0 0',color:'#55637d'}}>Quantité totale restante après achats et ventes.</p>
        </div>
        <div style={{background:'white',borderRadius:24,padding:24,boxShadow:'0 18px 50px rgba(15,23,42,0.08)'}}>
          <h3 style={{margin:'0 0 16px',color:'#1f2a44'}}>Recommandation</h3>
          <p style={{color:'#4c5e7f',margin:0}}>Vérifiez les catégories avec peu de stock et réapprovisionnez les produits les plus performants.</p>
        </div>
      </div>

      <div style={{background:'white',borderRadius:24,padding:24,boxShadow:'0 18px 50px rgba(15,23,42,0.08)'}}>
        <h3 style={{margin:'0 0 18px',color:'#1f2a44'}}>Détail du stock</h3>
        <div style={{display:'grid',gap:14}}>
          {stock.length > 0 ? stock.map(item => (
            <div key={item.categorie} style={{padding:'18px',borderRadius:18,background:'#f7f9ff',display:'grid',gridTemplateColumns:'1fr auto',gap:16,alignItems:'center'}}>
              <div>
                <strong style={{display:'block',color:'#1f2a44'}}>{item.categorie}</strong>
                <span style={{color:'#55637d'}}>Dernier mouvement : {item.dernier_mouvement}</span>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:24,fontWeight:700,color:'#3751ff'}}>{item.quantite_restante}</div>
                <span style={{color:'#4c5e7f'}}>unités</span>
              </div>
            </div>
          )) : <p style={{color:'#6f7a94'}}>Aucun stock disponible pour le moment.</p>}
        </div>
      </div>
    </div>
  )
}

export default Stock
