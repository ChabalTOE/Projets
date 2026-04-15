import React,{useEffect,useState} from 'react'
import axios from 'axios'
import {Bar,Doughnut} from 'react-chartjs-2'
import {Chart as ChartJS,CategoryScale,LinearScale,BarElement,ArcElement,Title,Tooltip,Legend} from 'chart.js'
ChartJS.register(CategoryScale,LinearScale,BarElement,ArcElement,Title,Tooltip,Legend)

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'

function DashboardHome(){
  const [stats,setStats]=useState({revenus:0,depenses:0,solde:0})
  const [daySummary,setDaySummary]=useState({revenus:0,depenses:0,solde:0})
  const [months,setMonths]=useState(Array(12).fill(0))
  const [alerts,setAlerts]=useState([])
  const [month,setMonth]=useState('')
  const [year,setYear]=useState('')
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const token=localStorage.getItem('token')
  const margin = stats.revenus ? ((stats.revenus - stats.depenses) / stats.revenus) * 100 : 0
  const averageRevenue = months.reduce((sum,value)=>sum+value,0) / 12

  const headers={Authorization:`Bearer ${token}`}

  const loadData=async()=>{
    try{
      const [dashboard,monthly,alert,daily]=await Promise.all([
        axios.get(`${API_BASE}/api/dashboard/?month=${month}&year=${year}`,{headers}),
        axios.get(`${API_BASE}/api/monthly/`,{headers}),
        axios.get(`${API_BASE}/api/alerts/`,{headers}),
        axios.get(`${API_BASE}/api/daily-summary/?date=${date}`,{headers})
      ])
      setStats(dashboard.data)
      setMonths(monthly.data.months)
      setAlerts(alert.data.alerts)
      setDaySummary(daily.data)
    }catch(err){
      console.error(err)
    }
  }

  useEffect(()=>{ if(token) loadData() },[token,month,year,date])

  const monthlyData={
    labels:['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
    datasets:[{label:'Revenus mensuels',data:months,backgroundColor:'rgba(56, 100, 255, 0.75)',borderColor:'#2c6cff',borderWidth:2,fill:true}]
  }

  const dailyData={
    labels:['Entrées','Sorties'],
    datasets:[{data:[daySummary.revenus,daySummary.depenses],backgroundColor:['#3e8efd','#ff6a6a'],borderWidth:0}]
  }

  return (
    <div className='dashboard-home'>
      <section className='kpi-section'>
        <div className='kpi-card fade-up delay-1'>
          <div className='kpi-head'>
            <h3>Marge opérationnelle</h3>
            <span>{margin.toFixed(0)}%</span>
          </div>
          <p className='kpi-value'>{(stats.revenus - stats.depenses).toFixed(2)} FCFA</p>
          <p className='kpi-meta'>Basé sur les revenus et dépenses actuels</p>
        </div>
        <div className='kpi-card fade-up delay-2'>
          <div className='kpi-head'>
            <h3>Entrée moyenne</h3>
            <span>{averageRevenue.toFixed(0)} FCFA</span>
          </div>
          <p className='kpi-value'>{averageRevenue ? averageRevenue.toFixed(2) : '0.00'} FCFA</p>
          <p className='kpi-meta'>Sur 12 mois</p>
        </div>
      </section>

      <section className='dashboard-stats'>
        <div className='status-card fade-up'>
          <h3>Entrées totales</h3>
          <p className='status-value'>{stats.revenus.toFixed(2)} FCFA</p>
        </div>
        <div className='status-card fade-up delay-1'>
          <h3>Sorties totales</h3>
          <p className='status-value status-danger'>{stats.depenses.toFixed(2)} FCFA</p>
        </div>
        <div className='status-card fade-up delay-2'>
          <h3>Revenus</h3>
          <p className='status-value status-success'>{(stats.depenses - stats.revenus).toFixed(2)} FCFA</p>
        </div>
      </section>

      <section className='dashboard-main'>
        <div className='dashboard-panel fade-up'>
          <div className='panel-header'>
            <div>
              <h2>Récapitulatif des transactions</h2>
              <p>Suivi de la journée sélectionnée.</p>
            </div>
            <input className='dashboard-input' type='date' value={date} onChange={e=>setDate(e.target.value)} />
          </div>

          <div className='summary-grid'>
            <div className='summary-card summary-blue'><strong>Entrées</strong><p>{daySummary.revenus.toFixed(2)} FCFA</p></div>
            <div className='summary-card summary-red'><strong>Sorties</strong><p>{daySummary.depenses.toFixed(2)} FCFA</p></div>
            <div className='summary-card summary-green'><strong>Solde journalier</strong><p>{daySummary.solde.toFixed(2)} FCFA</p></div>
          </div>

          <div className='chart-holder'><Doughnut data={dailyData} /></div>
        </div>

        <div className='dashboard-panel fade-up delay-1'>
          <h2>Filtrer par mois</h2>
          <div className='filter-row'>
            <input className='dashboard-input' placeholder='Mois (1-12)' value={month} onChange={e=>setMonth(e.target.value)} />
            <input className='dashboard-input' placeholder='Année' value={year} onChange={e=>setYear(e.target.value)} />
          </div>
          <button className='page-button' onClick={loadData}>Mettre à jour</button>
          <div className='chart-holder'><Bar data={monthlyData} options={{responsive:true, plugins:{legend:{display:false}}}}/></div>
        </div>
      </section>

      <section className='dashboard-cards'>
        <div className='alert-card fade-up'>
          <h3>Alertes intelligentes</h3>
          <ul>{alerts.map((alert,index)=>(<li key={index}>{alert}</li>))}</ul>
        </div>
        <div className='report-card fade-up delay-1'>
          <h3>Rapport rapide</h3>
          <p>Téléchargez rapidement un résumé PDF de l'activité commerciale.</p>
          <a className='page-button link-button' href={`${API_BASE}/api/report/`} target='_blank' rel='noreferrer'>Télécharger le PDF</a>
        </div>
      </section>
    </div>
  )
}

export default DashboardHome
