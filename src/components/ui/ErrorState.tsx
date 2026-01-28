import { AlertTriangle, SearchX, Layers } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps {
    title?: string;
    message?: string;
    retryAction?: () => void;
    retryLabel?: string;
    type?: 'error' | 'empty' | 'search';
}

export default function ErrorState({
    title = "Something went wrong",
    message = "We couldn't load the data. Please try again.",
    retryAction,
    retryLabel = "Retry",
    type = 'error'
}: ErrorStateProps) {

    const icons = {
        error: <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />,
        empty: <Layers className="w-12 h-12 text-muted-foreground mb-4" />,
        search: <SearchX className="w-12 h-12 text-amber-500 mb-4" />
    };

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
            {icons[type]}
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{message}</p>

            {retryAction && (
                <button
                    onClick={retryAction}
                    className="px-6 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold text-sm"
                >
                    {retryLabel}
                </button>
            )}
        </div>
    );
}
