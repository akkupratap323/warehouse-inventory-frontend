'use client'

import { useState, useEffect } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

interface Product {
  id: number
  prod_code: string
  prod_name: string
  unit_price: number
  current_stock: number
}

interface Transaction {
  trans_id: number
  trans_date: string
  trans_type: string
  reference_no: string
  remarks: string
  created_by: string
  details: TransactionDetail[]
  total_amount: number
}

interface TransactionDetail {
  detail_id: number
  product: number
  product_name: string
  product_code: string
  quantity: number
  unit_cost: number
  total_cost: number
}

interface Props {
  onUpdate: () => void
}

export default function TransactionManager({ onUpdate }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    trans_date: new Date().toISOString().slice(0, 16),
    trans_type: 'IN',
    reference_no: '',
    remarks: '',
    created_by: 'admin',
    details: [
      {
        product: '',
        quantity: '',
        unit_cost: ''
      }
    ]
  })

  useEffect(() => {
    fetchTransactions()
    fetchProducts()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions/`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.results || data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products/`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.results || data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        details: formData.details.map(detail => ({
          product: parseInt(detail.product),
          quantity: parseInt(detail.quantity),
          unit_cost: parseFloat(detail.unit_cost)
        }))
      }

      const response = await fetch(`${BACKEND_URL}/api/transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await fetchTransactions()
        onUpdate()
        resetForm()
        alert('Transaction created successfully!')
      } else {
        const errorData = await response.json()
        alert('Error: ' + JSON.stringify(errorData))
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert('Error saving transaction')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      trans_date: new Date().toISOString().slice(0, 16),
      trans_type: 'IN',
      reference_no: '',
      remarks: '',
      created_by: 'admin',
      details: [
        {
          product: '',
          quantity: '',
          unit_cost: ''
        }
      ]
    })
    setShowForm(false)
  }

  const addDetailRow = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { product: '', quantity: '', unit_cost: '' }]
    })
  }

  const removeDetailRow = (index: number) => {
    const newDetails = formData.details.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      details: newDetails.length > 0 ? newDetails : [{ product: '', quantity: '', unit_cost: '' }]
    })
  }

  const updateDetailRow = (index: number, field: string, value: string) => {
    const newDetails = [...formData.details]
    newDetails[index] = { ...newDetails[index], [field]: value }
    setFormData({ ...formData, details: newDetails })
  }

  const transactionTypes = [
    { value: 'IN', label: 'Stock In', color: 'green' },
    { value: 'OUT', label: 'Stock Out', color: 'red' },
    { value: 'ADJ', label: 'Adjustment', color: 'blue' }
  ]

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Transaction Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {showForm ? 'Cancel' : 'New Transaction'}
        </button>
      </div>

      {/* Transaction Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New Transaction
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.trans_date}
                    onChange={(e) => setFormData({...formData, trans_date: e.target.value})}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type *
                  </label>
                  <select
                    value={formData.trans_type}
                    onChange={(e) => setFormData({...formData, trans_type: e.target.value})}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {transactionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference No
                  </label>
                  <input
                    type="text"
                    value={formData.reference_no}
                    onChange={(e) => setFormData({...formData, reference_no: e.target.value})}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="PO123, INV456, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created By
                  </label>
                  <input
                    type="text"
                    value={formData.created_by}
                    onChange={(e) => setFormData({...formData, created_by: e.target.value})}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Transaction Details */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">Transaction Details</h4>
                  <button
                    type="button"
                    onClick={addDetailRow}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                  >
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.details.map((detail, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product *
                        </label>
                        <select
                          required
                          value={detail.product}
                          onChange={(e) => updateDetailRow(index, 'product', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.prod_code} - {product.prod_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={detail.quantity}
                          onChange={(e) => updateDetailRow(index, 'quantity', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit Cost *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={detail.unit_cost}
                          onChange={(e) => updateDetailRow(index, 'unit_cost', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="flex items-end">
                        {formData.details.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDetailRow(index)}
                            className="w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Transaction'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Transactions ({transactions.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trans ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.trans_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaction.trans_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.trans_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.trans_type === 'IN' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.trans_type === 'OUT'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transactionTypes.find(t => t.value === transaction.trans_type)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.reference_no || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      {transaction.details.map((detail, idx) => (
                        <div key={detail.detail_id} className="text-xs">
                          {detail.product_code}: {detail.quantity} x ${detail.unit_cost}
                          {idx < transaction.details.length - 1 && <br />}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${transaction.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.created_by}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
