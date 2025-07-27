'use client'

import { useState, useEffect } from 'react'
import InventoryDashboard from './components/InventoryDashboard'
import ProductManager from './components/ProductManager'
import TransactionManager from './components/TransactionManager'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [inventoryData, setInventoryData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchInventoryData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/`)
      if (response.ok) {
        const data = await response.json()
        setInventoryData(data)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const tabs = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: '📊',
      description: 'Overview & Analytics',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'products', 
      name: 'Products', 
      icon: '📦',
      description: 'Product Management',
      color: 'from-emerald-500 to-emerald-600'
    },
    { 
      id: 'transactions', 
      name: 'Transactions', 
      icon: '📝',
      description: 'Stock Movements',
      color: 'from-purple-500 to-purple-600'
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-75"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Loading Inventory Data</h3>
          <p className="text-gray-500">Please wait while we fetch your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Tab Navigation */}
      <div className="relative">
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="input-field"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.icon} {tab.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="hidden sm:block">
          <div className="grid grid-cols-3 gap-4 p-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group p-6 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`text-3xl transition-transform duration-300 ${
                    activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    {tab.icon}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{tab.name}</h3>
                    <p className={`text-sm ${
                      activeTab === tab.id ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {tab.description}
                    </p>
                  </div>
                </div>
                
                {activeTab === tab.id && (
                  <div className="absolute inset-0 rounded-xl bg-white/10 border-2 border-white/20"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content with Animation */}
      <div className="relative">
        <div className={`transition-all duration-500 ${loading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {activeTab === 'dashboard' && (
            <InventoryDashboard 
              inventoryData={inventoryData} 
              onRefresh={fetchInventoryData} 
            />
          )}
          {activeTab === 'products' && (
            <ProductManager onUpdate={fetchInventoryData} />
          )}
          {activeTab === 'transactions' && (
            <TransactionManager onUpdate={fetchInventoryData} />
          )}
        </div>
      </div>
    </div>
  )
}
