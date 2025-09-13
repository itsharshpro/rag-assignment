import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="flex justify-center mb-6 text-5xl font-semibold text-black">Sign Up</h3>
        
        
        <form onSubmit={handleSubmit}>
          <AuthInput
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            label="Username"
            placeholder="rengoku"
            type="text"
            required
          />

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

          <AuthInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Confirm Password"
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
            <span className="group-hover:hidden">{loading ? 'Creating account...' : 'Sign Up'}</span>
            <span className="hidden group-hover:inline">→</span>
          </button>

          <p className="text-[15px] mt-3 flex justify-center">
            Already have an account?{" "}
            <Link className="font-medium underline text-[15px] ml-2" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Register;
