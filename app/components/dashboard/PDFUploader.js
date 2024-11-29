// app/components/dashboard/PDFUploader.js
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader } from 'lucide-react'

export default function PDFUploader() {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setAnalysis(null)

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to analyze PDF')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      setError('Failed to analyze the PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {!analysis && (
        <div
          {...getRootProps()}
          className={`w-full max-w-lg p-8 border-2 border-dashed rounded-lg text-center transition-colors
            ${isDragActive ? 'border-black bg-gray-50' : 'border-gray-300'}
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-black'}`}
        >
          <input {...getInputProps()} disabled={loading} />
          <div className="flex flex-col items-center space-y-4">
            {loading ? (
              <Loader className="h-12 w-12 text-gray-400 animate-spin" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
            <p className="text-sm text-gray-500">
              {isDragActive
                ? 'Drop your PDF here'
                : loading
                ? 'Analyzing PDF...'
                : 'Drop your PDF here or click to upload'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg w-full max-w-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {analysis && (
        <div className="mt-8 w-full max-w-2xl bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-semibold">AI Analysis Results</h3>
            <button
              onClick={() => setAnalysis(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="prose prose-sm max-w-none">
            {analysis.split('\n').map((line, i) => (
              <p key={i} className="mb-2">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}