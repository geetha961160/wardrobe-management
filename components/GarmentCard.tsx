
import React from 'react';
import { Garment } from '../types';

interface GarmentCardProps {
  item: Garment;
  onDelete: (id: string) => void;
}

const GarmentCard: React.FC<GarmentCardProps> = ({ item, onDelete }) => {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100">
      <div className="aspect-[3/4] overflow-hidden bg-stone-50">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-stone-900 text-sm truncate pr-2">{item.name}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium uppercase tracking-tighter">
            {item.category}
          </span>
        </div>
        <p className="text-xs text-stone-500 mb-3">{item.color} • {item.season}</p>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onDelete(item.id)}
            className="text-stone-300 hover:text-red-500 transition-colors"
            title="Remove item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          
          <button className="text-stone-400 hover:text-stone-900 transition-colors">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GarmentCard;
