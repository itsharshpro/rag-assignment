import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="flex justify-center text-5xl mb-6 font-semibold text-black">Login</h3>
        
        <form onSubmit={handleSubmit}>
          <AuthInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email Address"
            placeholder="pro@example.com"
            type="email"
            required
          />

          <AuthInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            placeholder="••••••••"
            type="password"
            required
          />

          {error && <p className="text-xs pb-2.5 text-red-600">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full text-xl text-white bg-black shadow-md p-[5px] rounded-md relative group disabled:opacity-50"
          >
            <span className="group-hover:hidden">{loading ? 'Signing in...' : 'Login'}</span>
            <span className="hidden group-hover:inline">→</span>
          </button>

          <p className="text-[15px] mt-3 flex justify-center">
            Don&apos;t have an account?{" "}
            <Link className="font-medium underline text-[15px] ml-2" to="/register">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
