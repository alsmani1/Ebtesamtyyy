'use client';
import {useLanguage} from '@/context/LanguageContext';
import {message,MessageKey} from '@/lib/messages';
export function LocalizedText({name}:{name:MessageKey}){return <>{message(useLanguage().locale,name)}</>}
