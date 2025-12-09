import React, { useState, useEffect } from 'react';
import { GlobalSettings } from '../../types/types';
import { useData } from '../../context/dataContext';
import { useLanguage } from '../../config/i18n';
import { Settings, Save, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
    const { t } = useLanguage();
    const { globalSettings, updateGlobalSettings } = useData();
    const [localSettings, setLocalSettings] = useState(globalSettings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalSettings(globalSettings);
    }, [globalSettings]);

    const handleSave = () => {
        updateGlobalSettings(localSettings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(globalSettings);

    return (
        <div className="p-8 max-w-4xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Configurações Globais</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie as configurações da plataforma</p>
                </div>
                {hasChanges && (
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                    </button>
                )}
            </div>

            {/* Success Message */}
            {isSaved && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Configurações salvas com sucesso!</span>
                </div>
            )}

            {/* Settings Form */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Platform Info */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Informações da Plataforma
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da Plataforma
                            </label>
                            <input
                                type="text"
                                value={localSettings.platformName}
                                onChange={(e) => setLocalSettings({ ...localSettings, platformName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Apollo CRM"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Moeda Padrão
                            </label>
                            <select
                                value={localSettings.currency}
                                onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="BRL">BRL - Real Brasileiro (R$)</option>
                                <option value="USD">USD - Dólar Americano ($)</option>
                                <option value="EUR">EUR - Euro (€)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Access Control */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Controle de Acesso</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Modo de Manutenção</p>
                                <p className="text-sm text-gray-500">Desabilita o acesso de todos os usuários</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSettings.maintenanceMode}
                                    onChange={(e) => setLocalSettings({ ...localSettings, maintenanceMode: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Permitir Novos Cadastros</p>
                                <p className="text-sm text-gray-500">Permite que novos tenants se cadastrem</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSettings.allowSignups}
                                    onChange={(e) => setLocalSettings({ ...localSettings, allowSignups: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Current Values Summary */}
                <div className="p-6 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumo das Configurações</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Plataforma:</span>
                            <span className="ml-2 font-medium text-gray-900">{localSettings.platformName}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Moeda:</span>
                            <span className="ml-2 font-medium text-gray-900">{localSettings.currency}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Manutenção:</span>
                            <span className={`ml-2 font-medium ${localSettings.maintenanceMode ? 'text-red-600' : 'text-green-600'}`}>
                                {localSettings.maintenanceMode ? 'Ativado' : 'Desativado'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Cadastros:</span>
                            <span className={`ml-2 font-medium ${localSettings.allowSignups ? 'text-green-600' : 'text-red-600'}`}>
                                {localSettings.allowSignups ? 'Permitidos' : 'Bloqueados'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button Bottom */}
            {hasChanges && (
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        <Save className="w-5 h-5" />
                        Salvar Configurações
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
