import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const res = await signUp(form.name, form.email, form.password);
    if (res.success) navigate('/');
    else setError(res.error);
    const response = await register(formData);
  
    localStorage.setItem("pp_token", response.token);
  
    prompt(
      "Copy your JWT Token:",
      response.token
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-100 via-teal-400 to-blue-100 bg-300% animate-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-yellow-800 via-lime-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <img src="./logo/logo.png" alt="logo" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 mt-1 text-sm">Start tracking your productivity today</p>
        </div>

        <div className="card p-8 bg-gradient-to-r from-purple-200 via-violet-400 to-indigo-600">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Jane Smith' },
              { key: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'At least 6 chars' },
            ].map(({ key, label, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={type} required
                    className="input pl-9"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-800 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
