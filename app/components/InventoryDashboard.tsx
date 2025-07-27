'use client'

import { useState, useEffect } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

interface InventoryItem {
  product_id: number
  prod_code: string
  prod_name: string
  category: string
  unit_price: string | number
  current_stock: number
  min_stock_level: number
  stock_value: string | number
  is_low_stock: boolean
}

interface SummaryData {
  total_products: number
  total_stock_value: number
  low_stock_items: number
  total_transactions: number
}

interface Props {
  inventoryData: InventoryItem[]
  onRefresh: () => void
}

export default function InventoryDashboard({ inventoryData, onRefresh }: Props) {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('prod_name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/summary/`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const filteredData = inventoryData
    .filter(item => {
      const matchesSearch = item.prod_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.prod_code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryFilter || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let aVal = a[sortBy as keyof InventoryItem]
      let bVal = b[sortBy as keyof InventoryItem]
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

  const categories = [...new Set(inventoryData.map(item => item.category))]

  const summaryCards = summary ? [
    {
      title: 'Total Products',
      value: summary.total_products,
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Stock Value',
      value: `$${formatPrice(summary.total_stock_value)}`,
      icon: '💰',
      color: 'from-emerald-500 to-emerald-600',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Low Stock Items',
      value: summary.low_stock_items,
      icon: '⚠️',
      color: 'from-amber-500 to-amber-600',
      change: '-3%',
      changeType: 'negative' as const
    },
    {
      title: 'Transactions',
      value: summary.total_transactions,
      icon: '📝',
      color: 'from-purple-500 to-purple-600',
      change: '+25%',
      changeType: 'positive' as const
    }
  ] : []

  return (
    <div className="space-y-8">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <div
            key={card.title}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {card.value}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  card.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  <span className={card.changeType === 'positive' ? '↗️' : '↘️'}></span>
                  <span className="ml-1">{card.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Filters */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🔍</span>
          Search & Filter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or code..."
                className="input-field pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="prod_name">Product Name</option>
              <option value="prod_code">Product Code</option>
              <option value="current_stock">Current Stock</option>
              <option value="unit_price">Unit Price</option>
              <option value="stock_value">Stock Value</option>
            </select>
          </div>
          
          <div className="flex flex-col justify-end space-y-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary text-sm"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
            <button
              onClick={onRefresh}
              className="btn-primary text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Inventory Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📋</span>
            Current Inventory
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {filteredData.length} items
            </span>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'product', label: 'Product' },
                  { key: 'category', label: 'Category' },
                  { key: 'current_stock', label: 'Stock' },
                  { key: 'unit_price', label: 'Unit Price' },
                  { key: 'stock_value', label: 'Total Value' },
                  { key: 'status', label: 'Status' }
                ].map((header) => (
                  <th
                    key={header.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => {
                      if (header.key !== 'status') {
                        setSortBy(header.key === 'product' ? 'prod_name' : header.key)
                        setSortOrder(sortBy === header.key && sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{header.label}</span>
                      {sortBy === (header.key === 'product' ? 'prod_name' : header.key) && (
                        <span className="text-blue-500">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr 
                  key={item.product_id} 
                  className={`table-row ${item.is_low_stock ? 'bg-red-50 border-l-4 border-red-400' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {item.prod_code.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.prod_name}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {item.prod_code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${item.is_low_stock ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.current_stock}
                        </span>
                        <span className="text-xs text-gray-500">
                          Min: {item.min_stock_level}
                        </span>
                      </div>
                      {item.is_low_stock && (
                        <span className="ml-2 text-red-500">⚠️</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${formatPrice(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    ${formatPrice(item.stock_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.is_low_stock ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
