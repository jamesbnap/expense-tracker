import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    vendor: '',
    amount: '',
    category: '',
    start_date: '',
    end_date: '',
    number_of_days: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleUpload = async () => {
    if (!file) return

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(`expenses/${file.name}`, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      return
    }

    const fileUrl = supabase.storage.from('attachments').getPublicUrl(uploadData.path).data.publicUrl

    const { error: insertError } = await supabase.from('expenses').insert([
      {
        file_url: fileUrl,
        vendor: form.vendor,
        amount: form.amount,
        category: form.category,
        start_date: form.start_date,
        end_date: form.end_date,
        number_of_days: parseInt(form.number_of_days),
      },
    ])

    if (insertError) {
      alert('DB error: ' + insertError.message)
    } else {
      alert('Expense saved!')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Expense</h1>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <input type="text" name="vendor" placeholder="Vendor" value={form.vendor} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <input type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <input type="date" name="start_date" placeholder="Start Date" value={form.start_date} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <input type="date" name="end_date" placeholder="End Date" value={form.end_date} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <input type="number" name="number_of_days" placeholder="Number of Days" value={form.number_of_days} onChange={handleChange} className="block w-full mb-4 p-2 border rounded" />

      <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Upload & Save
      </button>
    </div>
  )
}
