


import React, { useState, useEffect } from 'react';
import { AuthPhase, User } from '../types';
import Button from './Button';
import { cn } from './Button';
import { MortarBoardIcon, ElsaAvatarIcon, CheckCircleIcon, GoogleIcon, EyeIcon, EyeSlashIcon, XIcon, XCircleIcon } from './Icons';
import { APP_NAME } from '../constants';
import { AuthService } from '../services/authService';


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
);
Input.displayName = "Input";

const AuthWelcome: React.FC<{ onMobileAction: (phase: AuthPhase) => void }> = ({ onMobileAction }) => {
    const Feature: React.FC<{ color: string, text: string }> = ({ color, text }) => (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", color)}></div>
            <span className="text-base text-gray-300">{text}</span>
        </div>
    );

    return (
        <div className="relative flex flex-col items-center justify-center text-center lg:text-left h-full text-white p-4">
            <div className="w-full max-w-lg">
                <div className="relative z-10">
                    {/* Desktop Title */}
                    <div className="hidden lg:flex items-start justify-center lg:justify-start space-x-4">
                        <MortarBoardIcon className="h-20 w-20 text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                            <p className="text-5xl font-bold tracking-tight">
                                Welcome to
                            </p>
                            <h1 className="text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                TestGenius!
                            </h1>
                        </div>
                    </div>
                    {/* Mobile Title */}
                    <div className="block lg:hidden text-center">
                        <MortarBoardIcon className="h-20 w-20 text-blue-400 mx-auto mb-4" />
                        <p className="text-4xl font-bold tracking-tight">Welcome to</p>
                        <h1 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">TestGenius!</h1>
                    </div>
                </div>
                <div className="relative z-10 mt-8">
                    <h2 className="text-lg md:text-xl font-normal leading-relaxed text-gray-300 mb-8">Create intelligent tests from documents, syllabus, or topics with AI-powered question generation and instant feedback.</h2>
                    <div className="space-y-3">
                        <Feature color="bg-purple-400" text="AI-powered question generation" />
                        <Feature color="bg-blue-400" text="Multiple input formats supported" />
                        <Feature color="bg-green-400" text="Instant feedback and explanations" />
                    </div>
                </div>
            </div>

             {/* Mobile Action Buttons */}
            <div className="block lg:hidden mt-12 w-full max-w-xs mx-auto space-y-4 z-10">
                <Button onClick={() => onMobileAction(AuthPhase.SIGN_IN)} size="lg" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Sign In
                </Button>
                <Button onClick={() => onMobileAction(AuthPhase.SIGN_UP)} size="lg" variant="outline" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20">
                    Create new account
                </Button>
            </div>


            <div className="flex items-center justify-center gap-3 text-sm opacity-80 mt-12">
                <ElsaAvatarIcon className="w-8 h-8 rounded-full"/>
                <span>Powered by Elsa</span>
            </div>
        </div>
    );
};

interface SignInFormProps {
    onPhaseChange: (phase: AuthPhase) => void;
    onSignIn: (user: User) => void;
}
const SignInForm: React.FC<SignInFormProps> = ({ onPhaseChange, onSignIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { user, error } = await AuthService.signIn(email, password);
            
            if (error) {
                setError(error);
                return;
            }

            if (user) {
                onSignIn({
                    name: user.name,
                    email: user.email,
                    initials: user.initials
                });
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        const { error } = await AuthService.signInWithGoogle();
        if (error) {
            setError(error);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">Sign In</h2>
                <p className="text-muted-foreground mt-2">Welcome back! Please sign in to continue.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="email-signin" className="text-sm font-medium">Email</label>
                    <Input id="email-signin" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <label htmlFor="password-signin"className="text-sm font-medium">Password</label>
                    <div className="relative">
                        <Input id="password-signin" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-md">{error}</p>}
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <Button 
                variant="outline" 
                className="w-full bg-background/50" 
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
            >
                <GoogleIcon className="w-5 h-5 mr-2"/> Sign in with Google
            </Button>
            <div className="text-center text-sm">
                <button onClick={() => onPhaseChange(AuthPhase.RESET_PASSWORD)} className="font-medium text-primary hover:underline">Forgot Password?</button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
                Don't have an account? <button onClick={() => onPhaseChange(AuthPhase.SIGN_UP)} className="font-medium text-primary hover:underline">Sign up</button>
            </div>
        </div>
    );
};

const PasswordStrengthMeter: React.FC<{
    validation: {
        length: boolean;
        uppercase: boolean;
        number: boolean;
        symbol: boolean;
    };
    strength: number;
}> = ({ validation, strength }) => {
    const strengthLabels = ["", "Weak", "Medium", "Strong", "Very Strong"];
    const strengthColors = [
        "bg-muted",       // 0
        "bg-destructive", // 1
        "bg-yellow-500",  // 2
        "bg-blue-500",    // 3
        "bg-green-500"    // 4
    ];
    
    const strengthColor = strengthColors[strength];
    const strengthLabel = strengthLabels[strength];

    const ValidationRule: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
        <div className={cn("flex items-center gap-2 text-xs transition-colors", isValid ? 'text-green-500' : 'text-muted-foreground')}>
            {isValid ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4"/>}
            <span>{text}</span>
        </div>
    );

    return (
        <div className="space-y-2 py-3">
            <div className="flex w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                    className={cn("transition-all duration-300 rounded-full", strength > 0 ? strengthColor : '')}
                    style={{ width: `${strength * 25}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-xs font-semibold" style={{ color: strength > 1 ? strengthColor : 'inherit' }}>
                    {strengthLabel}
                </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-2">
                <ValidationRule isValid={validation.length} text="At least 8 characters" />
                <ValidationRule isValid={validation.uppercase} text="One uppercase letter" />
                <ValidationRule isValid={validation.number} text="One number" />
                <ValidationRule isValid={validation.symbol} text="One symbol" />
            </div>
        </div>
    );
};


interface SignUpFormProps {
    onPhaseChange: (phase: AuthPhase) => void;
    onSignIn: (user: User) => void;
}
const SignUpForm: React.FC<SignUpFormProps> = ({ onPhaseChange, onSignIn }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [validation, setValidation] = useState({
        length: false,
        uppercase: false,
        number: false,
        symbol: false,
    });
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        setValidation({
            length: hasLength,
            uppercase: hasUppercase,
            number: hasNumber,
            symbol: hasSymbol,
        });

        const newStrength = [hasLength, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;
        setStrength(newStrength);
    }, [password]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (strength < 4) {
            setError('Please ensure your password meets all criteria.');
            setIsLoading(false);
            return;
        }

        try {
            const { user, error } = await AuthService.signUp(email, password, name);
            
            if (error) {
                setError(error);
                return;
            }

            if (user) {
                onSignIn({
                    name: user.name,
                    email: user.email,
                    initials: user.initials
                });
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        const { error } = await AuthService.signInWithGoogle();
        if (error) {
            setError(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
                <p className="text-muted-foreground mt-2">Join TestGenius to start creating intelligent tests.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="name-signup" className="text-sm font-medium">Name</label>
                    <Input id="name-signup" type="text" placeholder="Enter your Name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <label htmlFor="email-signup" className="text-sm font-medium">Email</label>
                    <Input id="email-signup" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <label htmlFor="password-signup"className="text-sm font-medium">Password</label>
                     <div className="relative">
                        <Input 
                            id="password-signup"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onFocus={() => setPasswordTouched(true)}
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {passwordTouched && (
                    <PasswordStrengthMeter validation={validation} strength={strength} />
                )}

                {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-md">{error}</p>}
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
            </div>
            <Button 
                variant="outline" 
                className="w-full bg-background/50" 
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
            >
                <GoogleIcon className="w-5 h-5 mr-2"/> Sign in with Google
            </Button>
            <div className="text-center text-sm text-muted-foreground">
                Already have an account? <button onClick={() => onPhaseChange(AuthPhase.SIGN_IN)} className="font-medium text-primary hover:underline">Sign in</button>
            </div>
        </div>
    );
};


interface ResetPasswordFormProps {
    onPhaseChange: (phase: AuthPhase) => void;
}
const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onPhaseChange }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) {
                setError(error.message);
                return;
            }

            setSubmitted(true);
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (submitted) {
        return (
            <div className="space-y-6 text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                 <div className="text-center">
                    <h2 className="text-3xl font-bold text-foreground">Check your email</h2>
                    <p className="text-muted-foreground mt-2">We've sent a password reset link to <span className="font-bold text-foreground">{email}</span>.</p>
                </div>
                 <Button onClick={() => onPhaseChange(AuthPhase.SIGN_IN)} variant="outline" className="w-full bg-background/50" size="lg">Back to Sign In</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">Reset Password</h2>
                <p className="text-muted-foreground mt-2">Enter your email to reset your password</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="email-reset" className="text-sm font-medium">Email</label>
                    <Input id="email-reset" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-md">{error}</p>}
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
            </form>
            <div className="text-center text-sm">
                <button onClick={() => onPhaseChange(AuthPhase.SIGN_IN)} className="font-medium text-primary hover:underline">Back to sign in</button>
            </div>
        </div>
    );
};

interface AuthPageProps {
    authPhase: AuthPhase;
    onAuthPhaseChange: (phase: AuthPhase) => void;
    onSignIn: (user: User) => void;
}
export const AuthPage: React.FC<AuthPageProps> = ({ authPhase, onAuthPhaseChange, onSignIn }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [mobileAuthModal, setMobileAuthModal] = useState<AuthPhase | null>(null);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            setMousePos({ x: event.clientX, y: event.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const renderDesktopForm = () => {
        switch(authPhase) {
            case AuthPhase.SIGN_UP:
                return <SignUpForm onPhaseChange={onAuthPhaseChange} onSignIn={onSignIn} />;
            case AuthPhase.RESET_PASSWORD:
                return <ResetPasswordForm onPhaseChange={onAuthPhaseChange} />;
            case AuthPhase.SIGN_IN:
            default:
                return <SignInForm onPhaseChange={onAuthPhaseChange} onSignIn={onSignIn} />;
        }
    }

    const handleModalPhaseChange = (phase: AuthPhase) => {
        setMobileAuthModal(phase);
    };

    const renderModalForm = () => {
        switch (mobileAuthModal) {
            case AuthPhase.SIGN_UP:
                return <SignUpForm onPhaseChange={handleModalPhaseChange} onSignIn={onSignIn} />;
            case AuthPhase.RESET_PASSWORD:
                return <ResetPasswordForm onPhaseChange={handleModalPhaseChange} />;
            case AuthPhase.SIGN_IN:
            default:
                return <SignInForm onPhaseChange={handleModalPhaseChange} onSignIn={onSignIn} />;
        }
    };

    const backgroundStyle = {
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`,
        background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), hsl(var(--primary) / 0.15), transparent 80%)`,
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#1E2027] overflow-hidden relative">
            <div style={backgroundStyle} className="absolute inset-0 transition-all duration-300 ease-out z-0"></div>
            
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-12 items-center z-10">
                {/* Left Column (Welcome) */}
                <div className="w-full lg:col-span-7">
                    <AuthWelcome onMobileAction={setMobileAuthModal} />
                </div>
                
                {/* Right Column (Form) - HIDDEN ON MOBILE */}
                <div className="hidden lg:block w-full lg:col-span-5">
                    <div className="bg-card/80 dark:bg-card/60 border border-border/30 backdrop-blur-xl p-6 sm:p-10 rounded-2xl shadow-2xl">
                        {renderDesktopForm()}
                    </div>
                </div>
            </div>

            {/* Mobile Auth Modal - HIDDEN ON DESKTOP */}
            {mobileAuthModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in-50"
                >
                    <div className="bg-card rounded-2xl p-6 sm:p-8 w-full max-w-md relative shadow-2xl animate-in zoom-in-95">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileAuthModal(null)}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                            aria-label="Close"
                        >
                            <XIcon className="w-6 h-6" />
                        </Button>
                        {renderModalForm()}
                    </div>
                </div>
            )}
        </div>
    );
};