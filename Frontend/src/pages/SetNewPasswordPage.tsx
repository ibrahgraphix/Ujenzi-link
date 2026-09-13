import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface SetNewPasswordPageProps {
  onSuccess: () => void;
}

export const SetNewPasswordPage: React.FC<SetNewPasswordPageProps> = ({ onSuccess }) => {
  const { user, completeAdminPasswordChange, logout } = useAuth();
  const { error } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Strength check criteria
  const hasMinLength = newPassword.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(newPassword);
  const hasNumbers = /[0-9]/.test(newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Strength score: 0 to 4
  const strengthScore = [
    hasMinLength,
    hasLetters,
    hasNumbers,
    hasSpecial,
  ].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return '';
    if (!hasMinLength) return 'Too short (min 8 characters)';
    if (strengthScore <= 2) return 'Fair';
    if (strengthScore === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (!hasMinLength) return 'bg-rose-500';
    if (strengthScore <= 2) return 'bg-amber-500';
    if (strengthScore === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength) {
      error('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await completeAdminPasswordChange(newPassword);
      if (ok) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0B192C] to-[#1B3A6B] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2E86D8]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1B3A6B] to-[#2E86D8] text-white shadow-xl shadow-[#2E86D8]/25 mb-4 ring-4 ring-white/10">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Administrative Security Check
          </h1>
          <p className="text-slate-300 text-sm mt-1.5 max-w-md mx-auto">
            A temporary password was provisioned for this account. To protect the platform, you must establish a permanent password before continuing.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
          {/* Account Details Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-6">
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#1B3A6B] flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-medium text-slate-500">Admin Account</div>
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {user?.email || 'admin@ujenzilink.co.tz'}
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              Action Required
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password Field */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-slate-700 mb-1.5 text-left"
              >
                New Permanent Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 8 characters"
                  required
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E86D8] focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Strength:</span>
                    <span className={`font-semibold ${
                      !hasMinLength ? 'text-rose-600' : strengthScore <= 2 ? 'text-amber-600' : strengthScore === 3 ? 'text-blue-600' : 'text-emerald-600'
                    }`}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full transition-all ${newPassword.length > 0 ? getStrengthColor() : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${hasMinLength && strengthScore >= 2 ? getStrengthColor() : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${hasMinLength && strengthScore >= 3 ? getStrengthColor() : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${hasMinLength && strengthScore >= 4 ? getStrengthColor() : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-slate-700 mb-1.5 text-left"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E86D8] focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Match Feedback */}
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-rose-700 font-medium">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5 text-left">
              <div className="font-medium text-slate-800 mb-1">Password Requirements:</div>
              <div className="flex items-center gap-2">
                {hasMinLength ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={hasMinLength ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                  At least 8 characters in length
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordsMatch ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={passwordsMatch ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                  Both password fields match
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !hasMinLength || !passwordsMatch}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#1B3A6B] to-[#2E86D8] hover:from-[#152e55] hover:to-[#246bb0] text-white font-semibold rounded-xl shadow-lg shadow-[#2E86D8]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Set New Password & Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Sign Out Option */}
          <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-center">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out and return later
            </button>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Protected by Ujenzi Link Enterprise Security. Access is restricted to authorized personnel.
        </p>
      </div>
    </div>
  );
};
