import React from 'react';
import { Opportunity, OpportunityStage, Tag } from '../types/types';
import { Edit2 } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  opportunities: Opportunity[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStage: string) => void;
  onAddClick: () => void;
  onEdit: (opp: Opportunity) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id, title, color, opportunities, onDragOver, onDrop, onAddClick, onEdit
}) => {
  const totalValue = opportunities.reduce((s, o) => s + (o.value || 0), 0);
  const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue);

  return (
    <div
      className={`flex flex-col w-80 min-w-[20rem] bg-white rounded-xl border shadow-sm`}
      style={{ borderColor: color }}
      onDragOver={onDragOver}
      onDrop={e => onDrop(e, id)}
    >
      <div className="relative">
        <div style={{ height: 6, backgroundColor: color }} className="rounded-t-xl"></div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <div>
            <h3 className="font-bold text-gray-800 text-lg uppercase tracking-wide">{title}</h3>
            <div className="text-xs text-gray-500">{opportunities.length} {opportunities.length === 1 ? 'card' : 'cards'}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-sm font-semibold text-gray-800">{formattedTotal}</div>
            <button onClick={onAddClick} className="mt-2 inline-flex items-center justify-center w-8 h-8 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">+</button>
          </div>
        </div>
        <div className="absolute -top-2 right-4">
          <div style={{ backgroundColor: color }} className="text-xs text-white px-2 py-0.5 rounded-full font-medium">{opportunities.length}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {opportunities.map(opp => (
          <div
            key={opp.id}
            className="relative bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md cursor-grab transition-shadow"
            onClick={() => onEdit(opp)}
            draggable
            onDragStart={e => { e.dataTransfer.setData('opportunityId', opp.id); (e.currentTarget as HTMLElement).classList.add('cursor-grabbing'); }}
            onDragEnd={e => { (e.currentTarget as HTMLElement).classList.remove('cursor-grabbing'); }}
          >
            {/* probability badge */}
            <div className="absolute left-3 -top-3">
              <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-medium">{opp.probability ?? 0}% Prob.</div>
            </div>
            {/* edit icon */}
            <button onClick={(e) => { e.stopPropagation(); onEdit(opp); }} className="absolute right-3 top-3 opacity-0 hover:opacity-100 transition-opacity bg-white rounded p-1">
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-2">
                <div className="font-semibold text-gray-800 text-sm line-clamp-1">{opp.propertyTitle || opp.leadName || 'Sem título'}</div>
                <div className="text-xs text-gray-500 mt-1">{opp.leadName}</div>
              </div>
              <div className="text-sm font-medium text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opp.value || 0)}</div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-500">Prob: <span className="font-medium text-gray-700">{opp.probability ?? 0}%</span></div>
              <div className="flex items-center gap-2">
                {opp.tags && opp.tags.slice(0,3).map((tag: Tag) => (
                  <span key={tag.id} className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: (tag.color || '#ccc') + '22', color: tag.color || '#333', border: `1px solid ${tag.color || '#ccc'}` }}>{tag.label}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
