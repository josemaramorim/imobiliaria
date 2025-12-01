import React, { useState, useEffect } from 'react';
import { Property, PropertyStatus, CustomFieldConfig, CustomFieldType, UserRole, Visit } from '../types';
import { MapPin, Bed, Bath, Expand, Filter, Plus, X, Upload, Image as ImageIcon, Trash2, CheckSquare, Square, ChevronDown, Settings, Edit2, AlertTriangle, Search, Calendar, User, Save, SlidersHorizontal, List } from 'lucide-react';
import { useLanguage } from '../i18n';
import { Can, usePermission } from '../auth';
import { useData } from '../dataContext';

// --- Helper Components ---

const CustomFieldInput = ({ 
  config, 
  value, 
  onChange
}: { 
  config: CustomFieldConfig, 
  value: any, 
  onChange: (val: any) => void
}) => {
  const { t } = useLanguage();

  const renderInput = () => {
    switch (config.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            required={config.required}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500 text-sm"
          />
        );
      case 'NUMBER':
        return (
          <input
            type="number"
            required={config.required}
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500 text-sm"
          />
        );
      case 'SELECT':
        return (
          <div className="relative">
              <select
                required={config.required}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 px-3 appearance-none bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500 text-sm"
              >
                <option value="">{t('common.select_option')}</option>
                {config.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );
      case 'BOOLEAN':
        return (
          <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                      type="radio" 
                      name={config.key} 
                      checked={value === true} 
                      onChange={() => onChange(true)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" 
                  />
                  <span className="text-sm text-gray-700">{t('common.yes')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                      type="radio" 
                      name={config.key} 
                      checked={value === false} 
                      onChange={() => onChange(false)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" 
                  />
                  <span className="text-sm text-gray-700">{t('common.no')}</span>
              </label>
          </div>
        );
      case 'MULTI_SELECT':
          const selected = (value as string[]) || [];
          return (
              <div className="relative">
                  <div className="flex flex-wrap gap-2 p-2 border border-transparent rounded-lg">
                      {config.options?.map(opt => {
                          const isSelected = selected.includes(opt);
                          return (
                              <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                      if (isSelected) onChange(selected.filter(s => s !== opt));
                                      else onChange([...selected, opt]);
                                  }}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                      isSelected 
                                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                  }`}
                              >
                                  {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                  {opt}
                              </button>
                          )
                      })}
                  </div>
                  {config.required && (
                      <input 
                        tabIndex={-1}
                        autoComplete="off"
                        style={{ opacity: 0, height: 0, width: '100%', position: 'absolute', bottom: 0 }}
                        value={selected.length > 0 ? "valid" : ""}
                        onChange={() => {}}
                        required
                        onInvalid={(e) => e.currentTarget.setCustomValidity(t('common.required_field_error'))}
                        onInput={(e) => e.currentTarget.setCustomValidity('')}
                      />
                  )}
              </div>
          )
      default:
        return null;
    }
  };

  return (
    <div>
      {renderInput()}
    </div>
  );
};

interface PropertyCardProps {
    property: Property;
    onEdit: (property: Property) => void;
    onDelete: (id: string) => void;
    onSchedule: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onEdit, onDelete, onSchedule }) => {
  const { t } = useLanguage();
  const { user } = usePermission();
  const coverImage = property.images && property.images.length > 0 ? property.images[0] : null;
  
  const isAdminOrManager = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;
  const isOwner = property.agentId === user?.id;
  const canEdit = isAdminOrManager || isOwner;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
        {coverImage ? (
            <img 
            src={coverImage} 
            alt={property.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12" />
            </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm ${
              property.status === PropertyStatus.AVAILABLE ? 'bg-green-500 text-white' : 
              property.status === PropertyStatus.SOLD ? 'bg-red-500 text-white' : 
              'bg-yellow-500 text-white'
          }`}>
              {t(`properties.status.${property.status}`)}
          </span>
        </div>
        
        {property.images.length > 1 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {property.images.length}
            </div>
        )}

        <div className="absolute top-3 right-3 flex gap-2">
            {canEdit && (
                <button 
                    onClick={() => onEdit(property)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-500 hover:text-indigo-600 hover:bg-white transition-colors shadow-sm"
                    title={t('common.edit')}
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            )}
            
            <Can permission="properties.delete">
                <button 
                    onClick={() => onDelete(property.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-colors shadow-sm"
                    title={t('common.delete')}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </Can>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{property.title}</h3>
          <p className="text-lg font-bold text-indigo-600">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price)}
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">{property.address}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bed className="w-4 h-4 text-gray-400" />
            <span>{property.bedrooms} {t('properties.beds')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bath className="w-4 h-4 text-gray-400" />
            <span>{property.bathrooms} {t('properties.baths')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Expand className="w-4 h-4 text-gray-400" />
            <span>{property.area}m²</span>
          </div>
        </div>

        <button 
          onClick={() => onSchedule(property)}
          className="mt-auto w-full py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          {t('properties.schedule_visit')}
        </button>
      </div>
    </div>
  );
};

interface PropertyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (property: Partial<Property>) => void;
    customFields: CustomFieldConfig[];
    initialData?: Property;
}

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ isOpen, onClose, onSubmit, customFields, initialData }) => {
    const { t } = useLanguage();
    const { team } = useData();
    const { user } = usePermission();
    
    const [formData, setFormData] = useState<Partial<Property>>({
        title: '',
        address: '',
        price: 0,
        area: 0,
        bedrooms: 0,
        bathrooms: 0,
        status: PropertyStatus.AVAILABLE,
        images: [],
        customValues: {},
        agentId: user?.id
    });

    React.useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {
                title: '',
                address: '',
                price: 0,
                area: 0,
                bedrooms: 0,
                bathrooms: 0,
                status: PropertyStatus.AVAILABLE,
                images: [],
                customValues: {},
                agentId: user?.id
            });
        }
    }, [isOpen, initialData, user]);

    const canAssignAgent = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

    if (!isOpen) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages = Array.from(e.target.files).map((file: any) => URL.createObjectURL(file));
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), ...newImages]
            }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? t('common.edit') : t('properties.add')}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                    {t('properties.form.section_basic')}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.form.title')}</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.form.address')}</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.address} 
                                            onChange={e => setFormData({...formData, address: e.target.value})}
                                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.form.price')}</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                                <input 
                                                    type="number" 
                                                    required
                                                    min="0"
                                                    value={formData.price} 
                                                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                                    className="w-full h-10 pl-7 pr-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.form.area')}</label>
                                            <input 
                                                type="number" 
                                                required
                                                min="0"
                                                value={formData.area} 
                                                onChange={e => setFormData({...formData, area: Number(e.target.value)})}
                                                className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.form.status')}</label>
                                            <div className="relative">
                                                <select 
                                                    value={formData.status}
                                                    onChange={e => setFormData({...formData, status: e.target.value as PropertyStatus})}
                                                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none"
                                                >
                                                    {Object.values(PropertyStatus).map(status => (
                                                        <option key={status as string} value={status as string}>{t(`properties.status.${status}`)}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.form.agent')}</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <select 
                                                    value={formData.agentId}
                                                    onChange={e => setFormData({...formData, agentId: e.target.value})}
                                                    disabled={!canAssignAgent}
                                                    className={`w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none ${!canAssignAgent ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                                                >
                                                    <option value="">{t('common.select_option')}</option>
                                                    {team.map(member => (
                                                        <option key={member.id} value={member.id}>{member.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                    {t('properties.form.section_details')}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.form.bedrooms')}</label>
                                        <div className="relative">
                                            <Bed className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="number" 
                                                value={formData.bedrooms} 
                                                onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})}
                                                className="w-full h-10 pl-9 pr-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.form.bathrooms')}</label>
                                        <div className="relative">
                                            <Bath className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="number" 
                                                value={formData.bathrooms} 
                                                onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})}
                                                className="w-full h-10 pl-9 pr-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                    {t('properties.form.section_media')}
                                </h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-4 gap-2">
                                        {formData.images?.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                {idx === 0 && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5 font-medium">
                                                        Capa
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-500">{t('common.add')}</span>
                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                    {(!formData.images || formData.images.length === 0) && (
                                        <p className="text-xs text-gray-400 italic">{t('properties.form.no_images')}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        {t('properties.form.section_features')}
                                    </h3>
                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                                        CUSTOM
                                    </span>
                                </div>
                                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                                    {customFields.map(field => (
                                        <div key={field.key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                            </label>
                                            <CustomFieldInput 
                                                config={field} 
                                                value={formData.customValues?.[field.key] as any} 
                                                onChange={(val) => setFormData(prev => ({
                                                    ...prev,
                                                    customValues: { ...prev.customValues, [field.key]: val }
                                                }))}
                                            />
                                        </div>
                                    ))}
                                    {customFields.length === 0 && (
                                        <p className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            {t('properties.fields.empty')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            {initialData ? t('common.update') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface FieldsManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    fields: CustomFieldConfig[];
    onUpdate: (fields: CustomFieldConfig[]) => void;
}

const FieldsManagerModal: React.FC<FieldsManagerModalProps> = ({ isOpen, onClose, fields, onUpdate }) => {
    const { t } = useLanguage();
    const [newField, setNewField] = useState<{ label: string, type: CustomFieldType, options: string, required: boolean }>({
        label: '', type: 'TEXT', options: '', required: false
    });
    const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSaveField = () => {
        if (!newField.label) return;

        if (editingFieldKey) {
            const updatedFields = fields.map(f => {
                if (f.key === editingFieldKey) {
                    return {
                        ...f,
                        label: newField.label,
                        type: newField.type,
                        required: newField.required,
                        options: (newField.type === 'SELECT' || newField.type === 'MULTI_SELECT') 
                                ? newField.options.split(',').map(s => s.trim()) 
                                : undefined
                    };
                }
                return f;
            });
            onUpdate(updatedFields);
            setEditingFieldKey(null);
        } else {
            const config: CustomFieldConfig = {
                key: `custom_${Date.now()}`,
                label: newField.label,
                type: newField.type,
                required: newField.required,
                options: (newField.type === 'SELECT' || newField.type === 'MULTI_SELECT') 
                        ? newField.options.split(',').map(s => s.trim()) 
                        : undefined
            };
            onUpdate([...fields, config]);
        }
        
        setNewField({ label: '', type: 'TEXT', options: '', required: false });
    };

    const handleEditClick = (field: CustomFieldConfig) => {
        setEditingFieldKey(field.key);
        setNewField({
            label: field.label,
            type: field.type,
            required: field.required || false,
            options: field.options ? field.options.join(', ') : ''
        });
    };

    const handleCancelEdit = () => {
        setEditingFieldKey(null);
        setNewField({ label: '', type: 'TEXT', options: '', required: false });
    };

    const handleDeleteField = (key: string) => {
        onUpdate(fields.filter(f => f.key !== key));
        if (editingFieldKey === key) handleCancelEdit();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('properties.fields.modal_title')}</h2>
                        <p className="text-xs text-gray-500 mt-1">{t('properties.fields.modal_subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className={`bg-gray-50 p-4 rounded-lg border ${editingFieldKey ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                {editingFieldKey ? t('properties.fields.edit_mode') : t('properties.fields.add_mode')}
                            </h4>
                            {editingFieldKey && (
                                <button onClick={handleCancelEdit} className="text-xs text-red-500 hover:text-red-700 underline">
                                    {t('properties.fields.cancel_edit')}
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('properties.fields.label')}</label>
                                <input 
                                    type="text" 
                                    value={newField.label}
                                    onChange={e => setNewField({...newField, label: e.target.value})}
                                    className="w-full h-9 px-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('properties.fields.type')}</label>
                                <select 
                                    value={newField.type}
                                    onChange={e => setNewField({...newField, type: e.target.value as CustomFieldType})}
                                    className="w-full h-9 px-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="TEXT">{t('properties.fields.type.TEXT')}</option>
                                    <option value="NUMBER">{t('properties.fields.type.NUMBER')}</option>
                                    <option value="SELECT">{t('properties.fields.type.SELECT')}</option>
                                    <option value="MULTI_SELECT">{t('properties.fields.type.MULTI_SELECT')}</option>
                                    <option value="BOOLEAN">{t('properties.fields.type.BOOLEAN')}</option>
                                </select>
                            </div>
                        </div>
                        
                        {(newField.type === 'SELECT' || newField.type === 'MULTI_SELECT') && (
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('properties.fields.options')}</label>
                                <input 
                                    type="text" 
                                    value={newField.options}
                                    onChange={e => setNewField({...newField, options: e.target.value})}
                                    placeholder="Opção A, Opção B, Opção C"
                                    className="w-full h-9 px-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={newField.required}
                                    onChange={e => setNewField({...newField, required: e.target.checked})}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">{t('properties.fields.required')}</span>
                            </label>
                        </div>

                        <button 
                            onClick={handleSaveField}
                            disabled={!newField.label}
                            className="w-full py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {editingFieldKey ? t('common.update') : t('common.add')}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <List className="w-4 h-4" />
                            Campos Existentes
                        </h3>
                        <div className="space-y-2">
                        {fields.map(field => (
                            <div key={field.key} className={`flex justify-between items-center p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow ${editingFieldKey === field.key ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200'}`}>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900 text-sm">{field.label}</p>
                                        {field.required ? (
                                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold border border-red-200 uppercase">
                                                {t('properties.fields.required')}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold border border-gray-200 uppercase">
                                                {t('properties.fields.optional')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">{t(`properties.fields.type.${field.type}`)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleEditClick(field)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteField(field.key)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('common.delete')}?</h3>
                <p className="text-sm text-gray-500 mb-6">{t('common.confirm_delete')}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                        {t('common.cancel')}
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm">
                        {t('common.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ScheduleVisitModal: React.FC<{ isOpen: boolean; onClose: () => void; property: Property | null; }> = ({ isOpen, onClose, property }) => {
    const { t } = useLanguage();
    const { addVisit, team } = useData();
    const { user } = usePermission();

    const [formData, setFormData] = useState({
        leadName: '',
        date: '',
        brokerId: user?.id || '',
        notes: '',
        reminderEnabled: true
    });

    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

    useEffect(() => {
        if (isOpen) {
            setFormData({
                leadName: '',
                date: '',
                brokerId: user?.id || '',
                notes: '',
                reminderEnabled: true
            });
        }
    }, [isOpen, user]);

    if (!isOpen || !property) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newVisit: Partial<Visit> = {
            id: `vis_${Date.now()}`,
            propertyId: property.id,
            propertyTitle: property.title,
            leadName: formData.leadName,
            date: new Date(formData.date).toISOString(),
            brokerId: formData.brokerId,
            status: 'PENDING',
            notes: formData.notes,
            reminderEnabled: formData.reminderEnabled
        };

        addVisit(newVisit as Visit);
        alert(t('visit.toast.success'));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{t('visit.modal_title')}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-indigo-50 p-3 rounded-lg flex items-start gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-indigo-900 text-sm">{property.title}</h4>
                            <p className="text-xs text-indigo-700">{property.address}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.lead')}</label>
                        <input 
                            type="text" 
                            required
                            value={formData.leadName}
                            onChange={(e) => setFormData({...formData, leadName: e.target.value})}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.date')}</label>
                        <input 
                            type="datetime-local" 
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.broker')}</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <select 
                                value={formData.brokerId}
                                onChange={(e) => setFormData({...formData, brokerId: e.target.value})}
                                disabled={!isAdmin}
                                className={`w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none ${!isAdmin ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                            >
                                {team.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>
                        {!isAdmin && (
                            <p className="text-xs text-gray-500 mt-1">Apenas gerentes podem alterar o corretor.</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.reminder_label')}</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                name="toggle" 
                                id="property-reminder-toggle" 
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-indigo-600"
                                checked={formData.reminderEnabled}
                                onChange={(e) => setFormData({...formData, reminderEnabled: e.target.checked})}
                            />
                            <label htmlFor="property-reminder-toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${formData.reminderEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.form.notes')}</label>
                        <textarea 
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    customFields: CustomFieldConfig[];
    filters: any;
    setFilters: (filters: any) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose, customFields, filters, setFilters }) => {
    const { t } = useLanguage();
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters, isOpen]);

    const handleApply = () => {
        setFilters(localFilters);
        onClose();
    };

    const handleClear = () => {
        const cleared = {
            search: '',
            status: '',
            minPrice: '',
            maxPrice: '',
            bedrooms: '',
            custom: {}
        };
        setLocalFilters(cleared);
        setFilters(cleared);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">{t('filters.title')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.form.status')}</label>
                        <div className="relative">
                            <select 
                                value={localFilters.status}
                                onChange={e => setLocalFilters({...localFilters, status: e.target.value})}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 appearance-none"
                            >
                                <option value="">Todos</option>
                                {Object.values(PropertyStatus).map(status => (
                                    <option key={status as string} value={status as string}>{t(`properties.status.${status}`)}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('filters.price_range')}</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                placeholder={t('common.min')}
                                value={localFilters.minPrice}
                                onChange={e => setLocalFilters({...localFilters, minPrice: e.target.value})}
                                className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                            <input 
                                type="number" 
                                placeholder={t('common.max')}
                                value={localFilters.maxPrice}
                                onChange={e => setLocalFilters({...localFilters, maxPrice: e.target.value})}
                                className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties.form.bedrooms')}</label>
                        <select 
                            value={localFilters.bedrooms}
                            onChange={e => setLocalFilters({...localFilters, bedrooms: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">{t('common.select_option')}</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                        </select>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Filtros Personalizados
                        </h4>
                        <div className="space-y-4">
                            {customFields.map(field => {
                                if (field.type === 'SELECT' || field.type === 'BOOLEAN') {
                                    return (
                                        <div key={field.key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                            <CustomFieldInput 
                                                config={field}
                                                value={localFilters.custom?.[field.key] as any}
                                                onChange={(val) => setLocalFilters({
                                                    ...localFilters,
                                                    custom: { ...localFilters.custom, [field.key]: val }
                                                })}
                                            />
                                        </div>
                                    )
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                    <button onClick={handleClear} className="flex-1 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                        {t('common.clear')}
                    </button>
                    <button onClick={handleApply} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                        {t('common.apply')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Properties = () => {
  const { t } = useLanguage();
  const { user } = usePermission(); 
  const { properties, addProperty, updateProperty, deleteProperty, propertyCustomFields, updatePropertyCustomFields } = useData();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFieldsManagerOpen, setIsFieldsManagerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null);
  const [scheduleProperty, setScheduleProperty] = useState<Property | null>(null);

  const [filters, setFilters] = useState({
      search: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      custom: {} as Record<string, any>
  });

  const handleCreateProperty = (data: Partial<Property>) => {
      if (editingProperty) {
          updateProperty({ ...editingProperty, ...data } as Property);
          setEditingProperty(undefined);
      } else {
          const newProp: Partial<Property> = {
              ...data,
              id: `prop_${Date.now()}`,
              agentId: data.agentId || user?.id,
              images: data.images || []
          };
          addProperty(newProp as Property);
      }
      setIsFormOpen(false);
  };

  const handleDeleteProperty = () => {
      if (deletingPropertyId) {
          deleteProperty(deletingPropertyId);
          setDeletingPropertyId(null);
          setIsDeleteModalOpen(false);
      }
  };

  const handleEditClick = (property: Property) => {
      setEditingProperty(property);
      setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
      setDeletingPropertyId(id);
      setIsDeleteModalOpen(true);
  };

  const handleOpenSchedule = (property: Property) => {
      setScheduleProperty(property);
  };

  const openAddModal = () => {
      setEditingProperty(undefined);
      setIsFormOpen(true);
  };

  const filteredProperties = properties.filter(p => {
      if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(searchLower);
          const matchesAddress = p.address.toLowerCase().includes(searchLower);
          if (!matchesTitle && !matchesAddress) return false;
      }

      if (filters.status && p.status !== filters.status) return false;
      if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      if (filters.bedrooms && p.bedrooms < Number(filters.bedrooms)) return false;

      for (const [key, value] of Object.entries(filters.custom)) {
          if (value === undefined || value === '') continue;
          const propValue = p.customValues[key];
          
          if (typeof value === 'boolean') {
             if (propValue !== value) return false;
          } else if (propValue !== value) {
             return false;
          }
      }

      return true;
  });

  const quickStatusTags = [
      { label: 'Todos', value: '' },
      { label: t('properties.status.AVAILABLE'), value: PropertyStatus.AVAILABLE },
      { label: t('properties.status.SOLD'), value: PropertyStatus.SOLD },
      { label: t('properties.status.RENTED'), value: PropertyStatus.RENTED },
      { label: t('properties.status.UNDER_OFFER'), value: PropertyStatus.UNDER_OFFER },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('properties.title')}</h1>
                <p className="text-gray-500 mt-1">{t('properties.subtitle')}</p>
            </div>
            <Can permission="properties.create">
                <button 
                    onClick={openAddModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('properties.add')}</span>
                    <span className="sm:hidden">{t('common.add')}</span>
                </button>
            </Can>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder={t('properties.search_placeholder')}
                    value={filters.search}
                    onChange={e => setFilters({...filters, search: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
                />
            </div>

            <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide py-1">
                {quickStatusTags.map((tag) => {
                    const isActive = filters.status === tag.value;
                    return (
                        <button
                            key={tag.label}
                            onClick={() => setFilters({...filters, status: tag.value})}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                isActive 
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {tag.label}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-end">
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
                    title={t('properties.filters')}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                </button>
                
                <Can permission="settings.manage">
                    <button 
                        onClick={() => setIsFieldsManagerOpen(true)}
                        className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm"
                        title={t('properties.fields.manage')}
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </Can>
            </div>
        </div>
      </div>

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map(prop => (
            <PropertyCard 
                key={prop.id} 
                property={prop} 
                onEdit={handleEditClick}
                onDelete={confirmDelete}
                onSchedule={handleOpenSchedule}
            />
            ))}
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Nenhum imóvel encontrado</h3>
              <p className="text-gray-500 mt-1 max-w-sm mx-auto">Tente ajustar seus termos de busca ou filtros para encontrar o que procura.</p>
              <button 
                onClick={() => setFilters({search: '', status: '', minPrice: '', maxPrice: '', bedrooms: '', custom: {}})}
                className="mt-4 text-indigo-600 font-medium hover:text-indigo-700"
              >
                  Limpar todos os filtros
              </button>
          </div>
      )}

      <PropertyFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleCreateProperty}
        customFields={propertyCustomFields}
        initialData={editingProperty}
      />

      <FieldsManagerModal 
        isOpen={isFieldsManagerOpen}
        onClose={() => setIsFieldsManagerOpen(false)}
        fields={propertyCustomFields}
        onUpdate={updatePropertyCustomFields}
      />

      <FilterSidebar 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        customFields={propertyCustomFields}
        filters={filters}
        setFilters={setFilters}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProperty}
      />

      <ScheduleVisitModal
        isOpen={!!scheduleProperty}
        onClose={() => setScheduleProperty(null)}
        property={scheduleProperty}
      />
    </div>
  );
};

export default Properties;