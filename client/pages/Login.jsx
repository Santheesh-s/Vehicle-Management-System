import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ParkingCircle, Eye, EyeOff, Mail, Lock, User, Shield } from 'lucide-react';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Enter email, 2: Enter OTP and new password

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔄 Attempting login with:', { username: loginData.username, password: '***' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      console.log('📡 Response status:', response.status);
      
      const result = await response.json();
      console.log('📋 Response data:', result);

      if (result.success) {
        console.log('✅ Login successful');
        // Store token and user data
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));

        // Call parent login handler
        onLogin(result.data.user, result.data.token);

        // Navigate to dashboard
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        console.log('❌ Login failed:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (resetStep === 1) {
      // Request OTP
      if (!resetData.email) {
        setError('Email is required');
        return;
      }
      
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await fetch('/api/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetData.email })
        });

        const result = await response.json();

        if (result.success) {
          setSuccess('OTP sent to your email address. Please check your inbox.');
          setResetStep(2);
          setError('');
        } else {
          setError(result.error || 'Failed to send OTP');
        }
      } catch (error) {
        console.error('Request OTP error:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Verify OTP and reset password
      if (!resetData.otp || !resetData.newPassword || !resetData.confirmPassword) {
        setError('All fields are required');
        return;
      }
      
      if (resetData.newPassword !== resetData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (resetData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: resetData.email,
            otp: resetData.otp,
            newPassword: resetData.newPassword
          })
        });

        const result = await response.json();

        if (result.success) {
          alert('✅ Password reset successfully! You can now login with your new password.');
          setIsResetDialogOpen(false);
          setResetStep(1);
          setResetData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
          setSuccess('');
          setError('');
        } else {
          setError(result.error || 'Failed to reset password');
        }
      } catch (error) {
        console.error('Reset password error:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const demoLogin = async (role) => {
    setLoading(true);
    setError('');
    
    const demoCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      staff: { username: 'staff', password: 'staff123' }
    };
    
    console.log(`🔄 Demo login for ${role}:`, demoCredentials[role]);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoCredentials[role])
      });

      console.log('📡 Demo response status:', response.status);
      const result = await response.json();
      console.log('📋 Demo response data:', result);

      if (result.success) {
        console.log('✅ Demo login successful');
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        onLogin(result.data.user, result.data.token);

        // Navigate to dashboard
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        console.log('❌ Demo login failed:', result.error);
        setError(result.error || 'Demo login failed');
      }
    } catch (error) {
      console.error('❌ Demo login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const testEmailConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/test-email', { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        alert('✅ Email configuration test successful! Check your email inbox.');
      } else {
        alert('��� Email test failed: ' + result.error);
      }
    } catch (error) {
      console.error('Email test error:', error);
      alert('Error testing email configuration');
    } finally {
      setLoading(false);
    }
  };

  const testSMSConfig = async () => {
    const phone = prompt('Enter phone number for SMS test:', '+917812858137');
    if (!phone) return;

    try {
      setLoading(true);
      const response = await fetch('/api/auth/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      });
      const result = await response.json();

      if (result.success) {
        alert('✅ SMS configuration test successful! Check your phone for the message.');
      } else {
        alert('❌ SMS test failed: ' + result.error);
      }
    } catch (error) {
      console.error('SMS test error:', error);
      alert('❌ SMS test failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <ParkingCircle className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ParkSys</h1>
            <p className="text-gray-600">Parking Management System</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-success">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username or Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username or email"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="pl-9 pr-9"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="link" 
                      className="px-0 font-normal"
                      onClick={() => {
                        setResetStep(1);
                        setResetData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {resetStep === 1 ? 'Reset Password' : 'Enter OTP & New Password'}
                      </DialogTitle>
                      <DialogDescription>
                        {resetStep === 1 
                          ? 'Enter your email address to receive an OTP' 
                          : 'Enter the OTP sent to your email and your new password'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      {success && (
                        <Alert>
                          <AlertDescription className="text-success">{success}</AlertDescription>
                        </Alert>
                      )}
                      
                      {resetStep === 1 ? (
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="Enter your email"
                              value={resetData.email}
                              onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                              className="pl-9"
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="otp">OTP Code</Label>
                            <div className="relative">
                              <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <Input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={resetData.otp}
                                onChange={(e) => setResetData({ ...resetData, otp: e.target.value })}
                                className="pl-9"
                                maxLength={6}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <Input
                                id="new-password"
                                type={showResetPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={resetData.newPassword}
                                onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                                className="pl-9 pr-9"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowResetPassword(!showResetPassword)}
                              >
                                {showResetPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <Input
                                id="confirm-password"
                                type={showResetPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={resetData.confirmPassword}
                                onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                                className="pl-9"
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            if (resetStep === 2) {
                              setResetStep(1);
                              setError('');
                              setSuccess('');
                            } else {
                              setIsResetDialogOpen(false);
                            }
                          }}
                          className="flex-1"
                        >
                          {resetStep === 2 ? 'Back' : 'Cancel'}
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                          {loading ? 'Processing...' : (resetStep === 1 ? 'Send OTP' : 'Reset Password')}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              Enter your username and password to access the parking management system
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>© 2024 ParkSys. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
