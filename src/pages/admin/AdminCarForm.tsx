import { AdminLayout } from '@/components/admin/AdminLayout';
import { CarForm } from '@/components/admin/CarForm';
import { ChevronRight } from 'lucide-react';

interface AdminCarFormProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function AdminCarForm({ user, onLogout }: AdminCarFormProps) {
    return (
        <AdminLayout user={user} onLogout={onLogout} title="Add New Car" subtitle="Fleet Management">

            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-slate-500 mb-6">
                <span className="hover:text-slate-900 dark:hover:text-slate-300 cursor-pointer transition-colors">Fleet</span>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="font-medium text-slate-900 dark:text-white">Add New Car</span>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Add New Car</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Add a new vehicle to your premium fleet. Ensure all details are accurate.
                    </p>
                </div>

                <CarForm mode="create" />
            </div>
        </AdminLayout>
    );
}
