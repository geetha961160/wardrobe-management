
import React, { useState, useRef } from 'react';
import { analyzeGarment } from '../services/geminiService';
import { Garment, Category, Season } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onAdd: (garment: Garment) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onAdd }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<Partial<Garment> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        triggerAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAnalysis = async (imgData: string) => {
    setLoading(true);
    try {
      const result = await analyzeGarment(imgData);
      setAnalyzedData(result);
    } catch (err) {
      alert("Failed to analyze image. You can enter details manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newGarment: Garment = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      category: formData.get('category') as Category,
      color: formData.get('color') as string,
      season: formData.get('season') as Season,
      imageUrl: image || '',
      notes: formData.get('notes') as string,
      addedAt: Date.now()
    };
    
    onAdd(newGarment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <h2 className="serif text-2xl font-bold text-stone-900">Add to Collection</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[80vh]">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-200 rounded-xl p-12 text-center cursor-pointer hover:border-stone-400 transition-colors group"
            >
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-stone-900 font-medium">Click to upload garment photo</p>
              <p className="text-sm text-stone-400 mt-1">AI will automatically detect details</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-stone-50 border border-stone-200">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
                {loading && (
                  <div className="flex items-center space-x-2 text-stone-500 text-sm animate-pulse">
                    <div className="w-2 h-2 bg-stone-900 rounded-full animate-bounce"></div>
                    <span>Gemini is analyzing style...</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Item Name</label>
                  <input
                    name="name"
                    required
                    defaultValue={analyzedData?.name || ''}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    name="category" 
                    defaultValue={analyzedData?.category || Category.TOPS}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none"
                  >
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Color</label>
                    <input
                      name="color"
                      defaultValue={analyzedData?.color || ''}
                      className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Season</label>
                    <select 
                      name="season" 
                      defaultValue={analyzedData?.season || Season.ALL}
                      className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none"
                    >
                      {Object.values(Season).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={analyzedData?.notes || ''}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="flex-1 py-3 text-stone-500 font-medium border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/20"
                  >
                    Save Item
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
