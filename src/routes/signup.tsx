import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signUpWithEmail } from "@/lib/auth-client";

function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const result = await signUpWithEmail(email, password, name);
    setIsLoading(false);
    if (result.success) {
      navigate({ to: "/" });
    } else {
      setError(result.error?.message ?? "An error occurred");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3dd45c] to-[#00c9a7] flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            ≡
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Start managing your vehicle inventory today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl bg-[#131a2b] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3dd45c]/50 focus:border-[#3dd45c]/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[#131a2b] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3dd45c]/50 focus:border-[#3dd45c]/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 rounded-xl bg-[#131a2b] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3dd45c]/50 focus:border-[#3dd45c]/50 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-[11px] text-gray-500 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#3dd45c] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
});
