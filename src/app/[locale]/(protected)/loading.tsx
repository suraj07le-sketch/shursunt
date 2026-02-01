
export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-10 w-48 bg-white/5 rounded-lg"></div>
            <div className="space-y-4">
                <div className="h-[500px] w-full bg-white/5 rounded-xl border border-white/10"></div>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 w-full bg-white/5 rounded-lg"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
