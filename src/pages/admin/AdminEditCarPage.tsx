import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CarForm } from '@/components/admin/CarForm';
import { ChevronRight, Loader2 } from 'lucide-react';

interface AdminEditCarPageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function AdminEditCarPage({ user, onLogout }: AdminEditCarPageProps) {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: car, isLoading: isFetching } = useQuery({
        queryKey: ['car', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        }
    });

    if (isFetching) {
        return (
            <AdminLayout user={user} onLogout={onLogout} title="Loading" subtitle="Please wait...">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout user={user} onLogout={onLogout} title="Edit Car" subtitle="Fleet Management">

            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-slate-500 mb-6">
                <span className="hover:text-slate-900 dark:hover:text-slate-300 cursor-pointer transition-colors" onClick={() => navigate('/admin/cars')}>Fleet</span>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="hover:text-slate-900 dark:hover:text-slate-300 cursor-pointer transition-colors" onClick={() => navigate('/admin/cars')}>Cars</span>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="font-medium text-slate-900 dark:text-white">Edit Car</span>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Edit Vehicle</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Update details for {car?.brand} {car?.model}.
                    </p>
                </div>

                <CarForm mode="edit" initialData={car} carId={id} />
            </div>
        </AdminLayout>
    );
}
