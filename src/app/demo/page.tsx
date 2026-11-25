import {PresentationAccess} from '@/components/PresentationAccess';
import {presentationEnabled} from '@/lib/presentation';
import {notFound} from 'next/navigation';
export default function DemoPage(){if(!presentationEnabled())notFound();return <main className="max-w-2xl mx-auto p-6 my-10 bg-white border rounded-3xl shadow-lg"><PresentationAccess inline/></main>;}
