/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Phone, User as UserIcon, KeyRound, X, Loader2, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { User } from '../types';
import { formatPhone } from '../utils/phoneFormatter';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  theme?: 'dark' | 'light';
}

export default function StaffAuthModal({ isOpen, onClose, onSuccess, theme = 'dark' }: StaffAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [staffPin, setStaffPin] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: loginPhone,
          password: loginPassword
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Ошибка входа');
        return;
      }

      if (!['chef', 'courier', 'owner', 'admin'].includes(data.user.role)) {
        setError('У данного аккаунта нет прав служебного доступа. Используйте обычный вход.');
        return;
      }

      localStorage.setItem('pandabar_user', JSON.stringify(data.user));
      if (data.user?.token) {
        localStorage.setItem('pandabar_auth_token', data.user.token);
      }
      onSuccess(data.user);
      onClose();
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/staff-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          password: regPassword,
          staffPin: staffPin
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Ошибка регистрации сотрудника');
        return;
      }

      setSuccessMsg('Служебный аккаунт успешно создан!');
      localStorage.setItem('pandabar_user', JSON.stringify(data.user));
      if (data.user?.token) {
        localStorage.setItem('pandabar_auth_token', data.user.token);
      }
      setTimeout(() => {
        onSuccess(data.user);
        onClose();
      }, 700);
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 md:backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl overflow-hidden z-10 ${
            theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-panda-charcoal border-white/10 text-white'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-panda-orange to-red-500 text-white shadow-lg shadow-panda-orange/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-black tracking-tight">Служебный терминал</h3>
              <p className="text-[11px] text-white/40">Доступ для кухни, курьеров и руководства</p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-white/5 border border-white/5 mb-6">
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login' ? 'bg-panda-orange text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Вход сотрудника
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register' ? 'bg-panda-orange text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Регистрация
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Tab 1: Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                  Номер Телефона
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+7 (999) 000-00-00"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(formatPhone(e.target.value))}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-panda-orange transition-all"
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                  Пароль
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-panda-orange transition-all"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !loginPhone || !loginPassword}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-sm font-extrabold shadow-lg shadow-panda-orange/20 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Войти в рабочую смену</span>}
              </button>
            </form>
          )}

          {/* Tab 2: Registration Form with PIN */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                  Имя и должность (позывной)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Алексей (Кухня)"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-panda-orange transition-all"
                  />
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                  Номер Телефона
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+7 (999) 000-00-00"
                    value={regPhone}
                    onChange={(e) => setRegPhone(formatPhone(e.target.value))}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-panda-orange transition-all"
                  />
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                  Пароль (не менее 4 символов)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-panda-orange transition-all"
                  />
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/30" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-panda-orange">
                    Служебный PIN-код допуска
                  </label>
                  <span className="text-[9px] text-white/40">Выдается управляющим</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Код подразделения"
                    value={staffPin}
                    onChange={(e) => setStaffPin(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-panda-orange/5 border border-panda-orange/30 text-xs text-white placeholder-white/20 focus:outline-none focus:border-panda-orange font-mono tracking-widest transition-all"
                  />
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-panda-orange" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !regName || !regPhone || !regPassword || !staffPin}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-panda-orange to-panda-orange-hover text-white text-xs font-extrabold shadow-lg shadow-panda-orange/20 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-3"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Зарегистрировать и войти</span>}
              </button>
            </form>
          )}

          <div className="mt-5 border-t border-white/5 pt-3 text-center">
            <p className="text-[10px] text-white/30 leading-tight">
              🔒 Доступ разрешен только официальному персоналу Суши Панда. Любые попытки несанкционированного доступа логируются.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
