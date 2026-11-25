'use client';
import {useLanguage} from '@/context/LanguageContext';
import {translateCopy} from '@/lib/translate-copy';
export function TranslatedText({text}:{text:string}) {const {locale}=useLanguage();return <>{translateCopy(text,locale)}</>;}
