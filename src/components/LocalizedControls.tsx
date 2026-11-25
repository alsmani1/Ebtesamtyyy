'use client';
import React,{forwardRef,InputHTMLAttributes,TextareaHTMLAttributes,SelectHTMLAttributes} from 'react';
import {useLanguage} from '@/context/LanguageContext';
import {translateCopy} from '@/lib/translate-copy';
function useLocalizedProps<T extends {placeholder?:string;title?:string;'aria-label'?:string}>(props:T){const {locale}=useLanguage();return {...props,...Object.fromEntries(['placeholder','title','aria-label'].filter(k=>typeof (props as any)[k]==='string').map(k=>[k,translateCopy((props as any)[k],locale)]))};}
export const LocalizedInput=forwardRef<HTMLInputElement,InputHTMLAttributes<HTMLInputElement>>(function LocalizedInput(props,ref){return <input {...useLocalizedProps(props)} ref={ref}/>;});
export const LocalizedTextarea=forwardRef<HTMLTextAreaElement,TextareaHTMLAttributes<HTMLTextAreaElement>>(function LocalizedTextarea(props,ref){return <textarea {...useLocalizedProps(props)} ref={ref}/>;});
export const LocalizedSelect=forwardRef<HTMLSelectElement,SelectHTMLAttributes<HTMLSelectElement>>(function LocalizedSelect(props,ref){return <select {...useLocalizedProps(props)} ref={ref}/>;});
