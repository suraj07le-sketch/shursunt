'use client';

// global-error must include html and body tags
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="bg-black text-white flex items-center justify-center min-h-screen p-4 font-sans">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-red-500 w-8 h-8"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">System Critical Error</h1>
                    <p className="text-gray-400">
                        A critical error occurred in the application root. We apologize for the inconvenience.
                    </p>

                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
                    >
                        Reinitialize Application
                    </button>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 text-xs font-mono text-red-500 bg-white/5 p-4 rounded text-left overflow-auto max-h-32">
                            {error.message}
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
