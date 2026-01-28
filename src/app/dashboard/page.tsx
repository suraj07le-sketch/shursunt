import { getMarketData } from "@/lib/api";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
    // We skip server-side fetching here to make navigation instant.
    // ClientDashboard will handle data fetching or use its internal skeletons.
    return (
        <div className="h-full">
            <ClientDashboard initialData={[]} />
        </div>
    );
}
