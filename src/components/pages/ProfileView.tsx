import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadAvatar, updateUserProfile } from '../../lib/supabase';
import { Camera, Save, User, Phone, CheckCircle, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { ActiveRoute } from '../../types';

interface ProfileViewProps {
  onRouteChange?: (route: ActiveRoute) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onRouteChange }) => {
  const { user, profile, refreshProfile, updateCurrentUser, logout, signOut } = useAuth();
  const handleLogout = logout || signOut;
  
  const [firstName, setFirstName] = useState(profile?.first_name || user?.firstName || '');
  const [lastName, setLastName] = useState(profile?.last_name || user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || user?.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || user?.avatarUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    
    try {
      setLoading(true);
      setMessage(null);
      const file = e.target.files[0];
      const url = await uploadAvatar(user.id, file);
      setAvatarUrl(url);
      if (updateCurrentUser) {
        updateCurrentUser({ avatarUrl: url });
      }
      setMessage({ type: 'success', text: "Rasm muvaffaqiyatli yuklandi! O'zgarishlarni saqlash tugmasini bosing." });
    } catch (err: any) {
      setMessage({ type: 'error', text: "Rasm yuklashda xatolik: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setMessage(null);
      await updateUserProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        avatar_url: avatarUrl
      });
      if (updateCurrentUser) {
        updateCurrentUser({
          firstName,
          lastName,
          phoneNumber,
          avatarUrl,
        });
      }
      if (refreshProfile) await refreshProfile();
      setMessage({ type: 'success', text: "Profil ma'lumotlari muvaffaqiyatli saqlandi!" });
    } catch (err: any) {
      setMessage({ type: 'error', text: "Saqlashda xatolik yuz berdi: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="profile-view" className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Profil Sozlamalari</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-105">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={loading} />
              </label>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Profil Rasmi</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">PNG, JPG yoki WEBP rasmlarini yuklashingiz mumkin.</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ismingiz</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Ismingizni kiriting"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Familiyangiz</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Familiyangizni kiriting"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Telefon Raqamingiz</label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                handleLogout();
                if (onRouteChange) onRouteChange('dashboard');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-sm font-medium transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Tizimdan Chiqish</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>O'zgarishlarni Saqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
