
import React from 'react'
import axios from 'axios'
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import './styles.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DashboardHome from './pages/DashboardHome'
import Entries from './pages/Entries'
import Sales from './pages/Sales'
import Debts from './pages/Debts'
import Transactions from './pages/Transactions'
import Creditors from './pages/Creditors'
import Health from './pages/Health'
import Stock from './pages/Stock'

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'

axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const refreshUrl = `${API_BASE}/api/token/refresh/`

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== refreshUrl) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        originalRequest._retry = true
        try {
          const rs = await axios.post(refreshUrl, { refresh: refreshToken })
          localStorage.setItem('token', rs.data.access)
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${rs.data.access}`
          return axios(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/'
          return Promise.reject(refreshError)
        }
      }
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/'
    }

    if (error.response?.status === 401 && originalRequest.url === refreshUrl) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/'
    }

    return Promise.reject(error)
  }
)

function ProtectedRoute({children}){
  const token=localStorage.getItem('token')
  return token ? children : <Navigate to='/' replace />
}

function App(){
  return(
    <div className='app-shell'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}>
            <Route index element={<DashboardHome/>}/>
            <Route path='entries' element={<Entries/>}/>
            <Route path='sales' element={<Sales/>}/>
            <Route path='stock' element={<Stock/>}/>
            <Route path='debts' element={<Debts/>}/>
            <Route path='transactions' element={<Transactions/>}/>
            <Route path='creditors' element={<Creditors/>}/>
            <Route path='health' element={<Health/>}/>
          </Route>
          <Route path='*' element={<Navigate to='/' replace/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App
