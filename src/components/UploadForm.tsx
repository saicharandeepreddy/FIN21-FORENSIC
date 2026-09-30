import React, { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Actor } from '../lib/types';

interface UploadFormProps {
  user: Actor;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export const UploadForm: React.FC<UploadFormProps> = ({ user, onSubmit, isSubmitting }) => {
  const [file, setFile] = useState<File | null>(null);
  const [vendor, setVendor] = useState('Uber India Technology');
  const [amount, setAmount] = useState('450.00');
  const [category, setCategory] = useState('local_conveyance');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPreset, setSelectedPreset] = useState<'uber' | 'taj' | 'fake' | 'canva'>('uber');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyPreset = (preset: 'uber' | 'taj' | 'fake' | 'canva') => {
    setSelectedPreset(preset);
    if (preset === 'uber') {
      setVendor('Uber India Technology');
      setAmount('450.00');
      setCategory('local_conveyance');
      const dummyFile = new File(['uber receipt text content GSTIN: 29AABCU9603R1ZJ Total: 450.00'], 'uber_ride_receipt_292.png', { type: 'image/png' });
      setFile(dummyFile);
    } else if (preset === 'taj') {
      setVendor('Taj Mahal Palace Mumbai');
      setAmount('18500.00');
      setCategory('travel_lodging');
      const dummyFile = new File(['taj hotel folio GSTIN: 27AAACT2727Q1ZW Total: 18500.00'], 'taj_hotel_executive_folio.jpg', { type: 'image/jpeg' });
      setFile(dummyFile);
    } else if (preset === 'fake') {
      setVendor('Fake Vendor Pvt Ltd');
      setAmount('65000.00');
      setCategory('equipment');
      const dummyFile = new File(['fake forged bill GSTIN: 29FAKE1234A1ZZ9 Total: 65000.00'], 'fake_hardware_invoice_2026.pdf', { type: 'application/pdf' });
      setFile(dummyFile);
    } else if (preset === 'canva') {
      setVendor('Edited Graphics Merchant');
      setAmount('12000.00');
      setCategory('software_subscription');
      const dummyFile = new File(['canva edited slip Total: 12000.00'], 'canva_tampered_bill.jpg', { type: 'image/jpeg' });
      setFile(dummyFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveFile = file || new File(['sample image content Uber India Total: 450.00 GSTIN: 29AABCU9603R1ZJ'], 'uber_ride_receipt.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('employee_id', user.actorId);
    formData.append('vendor', vendor.trim());
    formData.append('amount', amount);
    formData.append('category', category);
    formData.append('expense_date', expenseDate);
    formData.append('file', effectiveFile);

    await onSubmit(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-8">
      {/* Editorial Header */}
      <div className="mb-8">
        <h1 className="font-anton text-[48px] sm:text-[64px] lg:text-[72px] text-[#0F0F0F] tracking-[-0.02em] leading-[0.85] uppercase">
          SUBMIT AN EXPENSE.
        </h1>
        <div className="small-caps text-[11px] sm:text-[12px] text-[#8A8378] tracking-[0.25em] mt-3">
          DRAG RECEIPT BELOW FOR AUTONOMOUS POLICY FORENSICS
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="small-caps text-[10px] text-[#8A8378] tracking-[0.25em] mr-2">
          AUDIT PRESETS:
        </span>
        <button
          type="button"
          onClick={() => handleApplyPreset('uber')}
          className={`px-3 py-1.5 border small-caps text-[10px] tracking-[0.25em] transition-colors ${
            selectedPreset === 'uber'
              ? 'bg-[#C8352B] text-[#EDE8DF] border-[#C8352B]'
              : 'border-[#0F0F0F] hover:bg-[#F5F1E8] text-[#0F0F0F]'
          }`}
        >
          UBER (VALID GSTIN)
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset('taj')}
          className={`px-3 py-1.5 border small-caps text-[10px] tracking-[0.25em] transition-colors ${
            selectedPreset === 'taj'
              ? 'bg-[#C8352B] text-[#EDE8DF] border-[#C8352B]'
              : 'border-[#0F0F0F] hover:bg-[#F5F1E8] text-[#0F0F0F]'
          }`}
        >
          TAJ HOTEL (EXECUTIVE)
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset('fake')}
          className={`px-3 py-1.5 border small-caps text-[10px] tracking-[0.25em] transition-colors ${
            selectedPreset === 'fake'
              ? 'bg-[#C8352B] text-[#EDE8DF] border-[#C8352B]'
              : 'border-[#0F0F0F] hover:bg-[#F5F1E8] text-[#0F0F0F]'
          }`}
        >
          FAKE VENDOR (CHECKSUM FAIL)
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset('canva')}
          className={`px-3 py-1.5 border small-caps text-[10px] tracking-[0.25em] transition-colors ${
            selectedPreset === 'canva'
              ? 'bg-[#C8352B] text-[#EDE8DF] border-[#C8352B]'
              : 'border-[#0F0F0F] hover:bg-[#F5F1E8] text-[#0F0F0F]'
          }`}
        >
          CANVA (EXIF FORGERY)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Large 320px Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-[260px] sm:h-[320px] border-2 border-dashed border-[#C8352B] flex flex-col items-center justify-center cursor-pointer transition-colors select-none ${
            dragActive ? 'bg-[#C8352B]/10' : 'hover:bg-[#C8352B]/5 bg-transparent'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center p-4 text-center">
              <div className="w-12 h-12 border border-[#0F0F0F] bg-[#F5F1E8] flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-[#C8352B] stroke-[1.5]" />
              </div>
              <span className="font-mono text-sm text-[#0F0F0F] font-bold">
                {file.name}
              </span>
              <span className="text-xs text-[#8A8378] font-mono mt-1">
                {(file.size / 1024).toFixed(1)} KB · READY FOR SCAN
              </span>
              <span className="small-caps text-[10px] text-[#C8352B] tracking-[0.25em] mt-3 underline">
                CLICK TO REPLACE RECEIPT
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-4">
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-[#C8352B] stroke-[1.5] mb-3" />
              <span className="small-caps text-[12px] sm:text-[13px] text-[#0F0F0F] tracking-[0.25em] font-bold">
                DROP FILE OR CLICK TO SELECT
              </span>
              <span className="text-xs text-[#8A8378] mt-2">
                PDF, PNG, JPG accepted. Auto-scanned for EXIF tampering & Mod-36 GSTIN.
              </span>
            </div>
          )}
        </div>

        {/* 2-Column Editorial Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Employee ID (prefilled) */}
          <div className="border-b border-[#0F0F0F] pb-2">
            <label className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-1">
              EMPLOYEE IDENTIFIER
            </label>
            <input
              type="text"
              value={user.actorId}
              readOnly
              className="w-full bg-transparent text-[#0F0F0F] font-mono text-base font-semibold focus:outline-none cursor-not-allowed opacity-80"
            />
          </div>

          {/* Expense Date */}
          <div className="border-b border-[#0F0F0F] pb-2 focus-within:border-[#C8352B] transition-colors">
            <label className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-1">
              EXPENSE DATE
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full bg-transparent text-[#0F0F0F] font-mono text-base focus:outline-none"
              required
            />
          </div>

          {/* Vendor */}
          <div className="border-b border-[#0F0F0F] pb-2 focus-within:border-[#C8352B] transition-colors">
            <label className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-1">
              VENDOR / ENTITY NAME
            </label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Uber India"
              className="w-full bg-transparent text-[#0F0F0F] font-sans text-base focus:outline-none"
              required
            />
          </div>

          {/* Amount */}
          <div className="border-b border-[#0F0F0F] pb-2 focus-within:border-[#C8352B] transition-colors">
            <label className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-1">
              CLAIMED AMOUNT (₹)
            </label>
            <div className="flex items-center">
              <span className="font-mono text-base text-[#8A8378] mr-2">₹</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-[#0F0F0F] font-mono text-lg font-bold focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="border-b border-[#0F0F0F] pb-2 focus-within:border-[#C8352B] transition-colors md:col-span-2">
            <label className="small-caps text-[11px] text-[#8A8378] tracking-[0.25em] block mb-1">
              EXPENSE CATEGORY
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent text-[#0F0F0F] font-sans text-base focus:outline-none cursor-pointer"
            >
              <option value="local_conveyance">Local Conveyance (Cab, Auto)</option>
              <option value="travel_lodging">Travel & Lodging</option>
              <option value="meals">Business Meals & Catering</option>
              <option value="equipment">IT Hardware & Equipment</option>
              <option value="software_subscription">Software & SaaS</option>
              <option value="other">General Miscellaneous</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[56px] bg-[#C8352B] hover:bg-[#B32D24] text-[#EDE8DF] rounded-[4px] font-anton text-[18px] tracking-[0.2em] uppercase transition-colors flex items-center justify-center space-x-2 select-none disabled:opacity-70"
          >
            {isSubmitting ? (
              <span>VERIFYING...</span>
            ) : (
              <span>SUBMIT FOR AUTONOMOUS COMPLIANCE AUDIT</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
