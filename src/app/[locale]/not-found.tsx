import { Link } from '@/i18n/routing';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
            <p className="mb-8">Could not find requested resource</p>
            <Link href="/" className="px-4 py-2 bg-primary text-white rounded">
                Return Home
            </Link>
        </div>
    );
}
