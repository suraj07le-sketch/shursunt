import AuthForm from "@/components/auth/AuthForm";
import { SolarisIcon } from "@/components/ui/SolarisIcon";
import { AuroraBackground } from "@/components/aceternity/AuroraBackground";

export default function LoginPage() {
    return (
        <AuroraBackground className="dark">
            <div className="relative z-10 w-full max-w-md space-y-8 p-4">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    {/* Simplified Logo for Glass Theme */}
                    <SolarisIcon className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>

                {/* Glass Container handled by AuthForm */}
                <AuthForm mode="login" />
            </div>
        </AuroraBackground>
    );
}
