'use client';
import {TranslatedText} from '@/components/TranslatedText';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
interface AppointmentRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedBranchCode?: string;
    preselectedService?: string;
}
export function AppointmentRequestModal({ isOpen, onClose, preselectedBranchCode, preselectedService }: AppointmentRequestModalProps) {
    const { language } = useLanguage();
    if (!isOpen)
        return null;
    const ar = language === 'ar';
    const params = new URLSearchParams();
    if (preselectedBranchCode)
        params.set('branch', preselectedBranchCode);
    if (preselectedService)
        params.set('service', preselectedService);
    return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onKeyDown={e => { if (e.key === 'Escape')
        onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="booking-title" className="surface-card max-w-lg w-full"><h2 id="booking-title">{ar ? 'حجز موعد' : 'Book an appointment'}</h2><p className="my-4">{ar ? 'اختر الفرع والطبيب والوقت المتاح لإرسال طلبك. يؤكد الاستقبال الحجز.' : 'Choose a branch, dentist and available time to send your request. Reception confirms your booking.'}</p><div className="flex gap-3"><Link onClick={onClose} href={'/book?' + params.toString()} className="primary-button">{ar ? 'اختيار موعد' : 'Choose a time'}</Link><button autoFocus className="secondary-button" onClick={onClose}><TranslatedText text={String(ar ? 'إغلاق' : 'Close')}/></button></div></section></div>;
}
export default AppointmentRequestModal;
