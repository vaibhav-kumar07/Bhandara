'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, FileSpreadsheet, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import Button from '@/app/components/shared/Button'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'
import { bulkUploadSpendings, ProcessedSpendingData } from '@/actions/UploadSpendingExcel'
import { sanitizeString } from '@/lib/shared/utils'

interface UploadSpendingExcelModalProps {
  bhandaraId: string
  onClose: () => void
}

interface ExcelRow {
  Serial?: number | string
  'Spending Item'?: string
  'SpendingItem'?: string
  'spending_item'?: string
  Amount?: number | string
  [key: string]: any
}

export default function UploadSpendingExcelModal({ bhandaraId, onClose }: UploadSpendingExcelModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({
    percentage: 0,
    current: 0,
    total: 0,
    status: '' as 'idle' | 'reading' | 'parsing' | 'validating' | 'uploading' | 'complete'
  })
  const [uploadResults, setUploadResults] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return

    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ]

      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        toastError('Please select a valid Excel file (.xlsx, .xls, or .csv)')
        return
      }

      setSelectedFile(file)
      setUploadResults(null)
      setUploadProgress({ percentage: 0, current: 0, total: 0, status: 'idle' })
    }
  }

  const parseExcelFile = async (file: File): Promise<{ data: ProcessedSpendingData[], errors: string[] }> => {
    const errors: string[] = []
    const processedData: ProcessedSpendingData[] = []

    try {
      // Read file
      setUploadProgress(prev => ({ ...prev, percentage: 10, status: 'reading' }))
      const arrayBuffer = await file.arrayBuffer()

      // Parse Excel
      setUploadProgress(prev => ({ ...prev, percentage: 20, status: 'parsing' }))
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet)

      if (data.length === 0) {
        errors.push('Excel file is empty')
        return { data: processedData, errors }
      }

      // Validate and process rows
      setUploadProgress(prev => ({ ...prev, percentage: 30, status: 'validating', total: data.length }))

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2 // +2 because Excel rows start at 1 and we have a header

        try {
          // Debug: Log all available columns for the first row
          if (i === 0) {
            console.log('Available columns in Excel:', Object.keys(row))
          }

          // Extract spending item name (handle different column name variations)
          let spendingItem = ''
          
          // Try various column name patterns
          const possibleColumns = [
            'Spending Item', 'SpendingItem', 'spending_item', 'Spending_Item',
            'spending item', 'SPENDING ITEM', 'Spending item', 'spendingitem',
            'Item', 'item', 'ITEM', 'Category', 'category', 'CATEGORY',
            'Name', 'name', 'NAME', 'Description', 'description', 'DESCRIPTION'
          ]
          
          for (const col of possibleColumns) {
            if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
              spendingItem = row[col].toString().trim()
              break
            }
          }
          
          // If still empty, try to find any column that might contain the spending item
          if (!spendingItem) {
            const keys = Object.keys(row)
            for (const key of keys) {
              if (key.toLowerCase().includes('spend') || 
                  key.toLowerCase().includes('item') || 
                  key.toLowerCase().includes('category') ||
                  key.toLowerCase().includes('name')) {
                const value = row[key]
                if (value !== undefined && value !== null && value !== '') {
                  spendingItem = value.toString().trim()
                  console.log(`Found spending item in column "${key}":`, spendingItem)
                  break
                }
              }
            }
          }

          // Debug log for spending item
          if (i < 5) { // Only log first 5 rows to avoid spam
            console.log(`Row ${rowNumber}: Spending Item = "${spendingItem}"`)
          }
          
          // Validate required fields
          if (!spendingItem || spendingItem.length < 2) {
            if (i < 5) { // Only log first 5 rows to avoid spam
              console.log(`Row ${rowNumber}: Available data:`, row)
            }
            errors.push(`Row ${rowNumber}: Spending Item is required and must be at least 2 characters. Available columns: ${Object.keys(row).join(', ')}`)
            continue
          }

          // Extract and validate amount - allow 0
          let amountValue: any = undefined
          
          // Try various amount column patterns
          const amountColumns = ['Amount', 'amount', 'AMOUNT', 'Cost', 'cost', 'COST', 'Price', 'price', 'PRICE', 'Value', 'value', 'VALUE']
          
          for (const col of amountColumns) {
            if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
              amountValue = row[col]
              break
            }
          }

          // Handle empty/null/undefined
          if (amountValue === undefined || amountValue === null || amountValue === '') {
            if (i < 5) { // Only log first 5 rows to avoid spam
              console.log(`Row ${rowNumber}: No amount found. Available data:`, row)
            }
            errors.push(`Row ${rowNumber}: Amount is required. Available columns: ${Object.keys(row).join(', ')}`)
            continue
          }

          // Convert to number (handles both string and number from Excel)
          const amount = typeof amountValue === 'number' ? amountValue : parseFloat(String(amountValue).trim())

          if (isNaN(amount)) {
            errors.push(`Row ${rowNumber}: Amount must be a valid number`)
            continue
          }

          // Allow 0, but not negative numbers
          if (amount < 0) {
            errors.push(`Row ${rowNumber}: Amount cannot be negative`)
            continue
          }

          processedData.push({
            spendingItem: sanitizeString(spendingItem),
            amount,
            rowNumber
          })

          // Update progress
          const progress = 30 + Math.floor((i + 1) / data.length * 50)
          setUploadProgress(prev => ({
            ...prev,
            percentage: progress,
            current: i + 1,
            total: data.length
          }))
        } catch (error: any) {
          errors.push(`Row ${rowNumber}: ${error.message || 'Invalid data'}`)
        }
      }

      return { data: processedData, errors }
    } catch (error: any) {
      errors.push(`Failed to parse Excel file: ${error.message || 'Unknown error'}`)
      return { data: processedData, errors }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || isUploading) {
      return
    }

    setIsUploading(true)
    setUploadResults(null)
    setUploadProgress({ percentage: 0, current: 0, total: 0, status: 'reading' })

    try {
      // Parse Excel file in client
      const { data: processedData, errors: parseErrors } = await parseExcelFile(selectedFile)

      if (processedData.length === 0) {
        toastError('No valid data found in Excel file')
        setUploadResults({
          success: 0,
          failed: parseErrors.length,
          errors: parseErrors
        })
        setIsUploading(false)
        return
      }

      // Send processed data to server
      setUploadProgress(prev => ({ ...prev, percentage: 85, status: 'uploading' }))

      const result = await bulkUploadSpendings(processedData, bhandaraId)

      setUploadProgress(prev => ({ ...prev, percentage: 100, status: 'complete' }))

      // Combine parse errors with upload errors
      const allErrors = [...parseErrors, ...(result.results.errors || [])]

      if (result.success) {
        setUploadResults({
          success: result.results.success,
          failed: result.results.failed + parseErrors.length,
          errors: allErrors
        })

        if (result.results.failed === 0 && parseErrors.length === 0) {
          toastSuccess(`Successfully uploaded ${result.results.success} spending items!`)
          setTimeout(() => {
            onClose()
            router.refresh()
          }, 2000)
        } else {
          toastSuccess(`Uploaded ${result.results.success} spending items. ${result.results.failed + parseErrors.length} failed.`)
        }
      } else {
        const errorMsg = result.message || 'Failed to upload Excel file'
        console.error('Upload error:', errorMsg, result.results)
        toastError(errorMsg)
        setUploadResults({
          success: 0,
          failed: allErrors.length,
          errors: allErrors
        })
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toastError('An unexpected error occurred while uploading the file')
    } finally {
      setIsUploading(false)
      setTimeout(() => {
        setUploadProgress({ percentage: 0, current: 0, total: 0, status: 'idle' })
      }, 2000)
    }
  }

  const handleRemoveFile = () => {
    if (isUploading) return

    setSelectedFile(null)
    setUploadResults(null)
    setUploadProgress({ percentage: 0, current: 0, total: 0, status: 'idle' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isUploading) return
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (isUploading) {
        e.preventDefault()
        return
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, isUploading])

  const getStatusText = () => {
    switch (uploadProgress.status) {
      case 'reading':
        return 'Reading file...'
      case 'parsing':
        return 'Parsing Excel data...'
      case 'validating':
        return `Validating data... (${uploadProgress.current}/${uploadProgress.total})`
      case 'uploading':
        return 'Uploading to database...'
      case 'complete':
        return 'Upload complete!'
      default:
        return ''
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent bg-opacity-50 backdrop-blur-sm ${isUploading ? 'pointer-events-auto' : ''
        }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] ${isUploading ? 'pointer-events-auto' : ''
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Upload Spending Excel
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload spending items and amounts from Excel file
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`text-gray-400 hover:text-gray-600 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            title={isUploading ? 'Cannot close during upload' : 'Close'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* File Format Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Expected Excel Format:
            </h3>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• <strong>Serial/S.No.</strong> (optional)</p>
              <p>• <strong>Spending Item/Item/Category/Name</strong> (required - name of spending category)</p>
              <p>• <strong>Amount/Cost/Price/Value</strong> (required, can be 0)</p>
            </div>
            <div className="text-xs text-blue-700 mt-2">
              <p><strong>Flexible column names:</strong> The system will automatically detect columns with similar names.</p>
            </div>
            <p className="text-xs text-blue-700 mt-3 italic">
              Note: All spending will be created with default payment mode as "Cash"
            </p>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="spending-excel-file-input"
              />
              <label
                htmlFor="spending-excel-file-input"
                className={`flex-1 ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
              >
                <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors ${isUploading
                  ? 'bg-gray-50'
                  : 'hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to select Excel file
                      </span>
                      <span className="text-xs text-gray-500">
                        (.xlsx, .xls, or .csv)
                      </span>
                    </div>
                  )}
                </div>
              </label>
              {selectedFile && (
                <button
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className={`px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  title={isUploading ? 'Cannot remove during upload' : 'Remove file'}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900">
                  {getStatusText()}
                </span>
                <span className="text-sm font-bold text-blue-700">
                  {uploadProgress.percentage}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
              {uploadProgress.total > 0 && (
                <p className="text-xs text-blue-700">
                  Processing {uploadProgress.current} of {uploadProgress.total} records... Please wait, do not close this window.
                </p>
              )}
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && !isUploading && (
            <div className={`border rounded-lg p-4 ${uploadResults.failed === 0
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
              }`}>
              <h3 className="text-sm font-semibold mb-2">
                Upload Results:
              </h3>
              <div className="text-sm space-y-1">
                <p className="text-green-700">
                  ✓ Successfully processed: <strong>{uploadResults.success}</strong>
                </p>
                {uploadResults.failed > 0 && (
                  <p className="text-red-700">
                    ✗ Failed: <strong>{uploadResults.failed}</strong>
                  </p>
                )}
              </div>

              {uploadResults.errors.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto">
                  <p className="text-xs font-semibold text-red-800 mb-1">Errors:</p>
                  <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                    {uploadResults.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {uploadResults.errors.length > 10 && (
                      <li className="text-red-600 italic">
                        ... and {uploadResults.errors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Uploading...
                </>
              ) : (
                'Cancel'
              )}
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={!selectedFile || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}