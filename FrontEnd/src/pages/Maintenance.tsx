import React from 'react';
import { useLanguage } from '../config/i18n';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const MaintenancePage = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-center p-4">
            <div className="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('maintenance.title')}</h1>
            <p className="text-lg text-gray-600 max-w-lg">
                {t('maintenance.message')}
            </p>
            <Link to="/login" className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                <ArrowLeft className="w-4 h-4" />
                {t('common.back_to_login')}
            </Link>
        </div>
    );
};

export default MaintenancePage;
