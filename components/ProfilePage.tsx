

import React, { useState } from 'react';
import { ProfileTab, User, TestHistoryEntry } from '../types';
import Button from './Button';
import { 
    UserIcon, HistoryIcon, FeedbackIcon, SettingsIcon, SparklesIcon, ChevronLeftIcon,
    MoonIcon, SunIcon, SignOutIcon, EditIcon, MenuIcon, XIcon, TrophyIcon, ArrowUpTrayIcon, BookOpenIcon, LightBulbIcon, RetestIcon, BrainIcon, ElsaAvatarIcon, GradeFlowIcon
} from './Icons';
import { cn } from './Button';
import { HistoryView } from './HistoryView';
import { SavedTestState } from '../types';

interface ProfileSidebarProps {
    activeTab: ProfileTab;
    onTabChange: (tab: ProfileTab) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: ProfileTab.PROFILE, label: 'Profile', icon: UserIcon },
        { id: ProfileTab.TEST_HISTORY, label: 'Test History', icon: HistoryIcon },
        { id: ProfileTab.SAVED_TESTS, label: 'Saved Tests', icon: BookOpenIcon }, // New tab
        { id: ProfileTab.ANSWER_KEY_CHECK, label: 'Answer Key Check', icon: EditIcon },
        { id: ProfileTab.FEEDBACK, label: 'Feedback', icon: FeedbackIcon },
        { id: ProfileTab.SETTINGS, label: 'Settings', icon: SettingsIcon },
        { id: ProfileTab.KNOW_THE_APP, label: 'Know the App', icon: SparklesIcon },
    ];

    return (
        <aside className="w-full md:w-64 bg-card border-r-0 md:border-r border-border p-4 flex-col flex-shrink-0">
            <nav className="flex flex-col space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                            activeTab === item.id 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

interface ProfileViewProps {
    user: User;
    onUpdateUser: (user: User) => void;
    history: TestHistoryEntry[];
    currentUserRank: number | null;
    currentUserFinalScore: number | null;
}
const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, history, currentUserRank, currentUserFinalScore }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(user.name);

    const testsCompleted = history.length;
    const totalQuestions = history.reduce((acc, entry) => acc + entry.totalQuestions, 0);
    const averageScore = testsCompleted > 0 
        ? history.reduce((acc, entry) => acc + entry.scorePercentage, 0) / testsCompleted 
        : 0;

    const recentActivity = [...history]
        .sort((a, b) => b.dateCompleted - a.dateCompleted)
        .slice(0, 5);
    
    const handleSaveName = () => {
        if (editedName.trim()) {
            const initials = editedName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            onUpdateUser({ ...user, name: editedName, initials: initials || 'TU' });
            setIsEditingName(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedName(user.name);
        setIsEditingName(false);
    };

    return (
        <div className="p-4 sm:p-8 space-y-8">
            <div className="bg-card border border-border p-8 rounded-lg shadow-lg flex flex-col items-center text-center">
                 <div className="flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-4xl">
                    {user.initials}
                </div>
                <div className="flex items-center gap-2">
                    {isEditingName ? (
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="text-3xl font-bold text-foreground bg-secondary border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary w-full max-w-xs text-center"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveName();
                                if (e.key === 'Escape') handleCancelEdit();
                            }}
                        />
                    ) : (
                        <h2 className="text-3xl font-bold text-foreground">{user.name}</h2>
                    )}
                    <div className="flex items-center">
                        {isEditingName ? (
                            <div className="flex gap-1 ml-2">
                                <Button onClick={handleSaveName} size="sm">Save</Button>
                                <Button onClick={handleCancelEdit} variant="ghost" size="sm">Cancel</Button>
                            </div>
                        ) : (
                            <Button onClick={() => setIsEditingName(true)} variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><EditIcon className="w-5 h-5"/></Button>
                        )}
                    </div>
                </div>
                <p className="text-muted-foreground">{user.email}</p>
                {currentUserRank && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <TrophyIcon className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-muted-foreground">
                            Global Rank: <span className="font-bold text-foreground">#{currentUserRank}</span>
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full max-w-2xl">
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-3xl font-bold text-primary">{testsCompleted}</p>
                        <p className="text-sm text-muted-foreground">Tests Completed</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-3xl font-bold text-primary">{averageScore.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                    </div>
                     <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-3xl font-bold text-primary">{totalQuestions}</p>
                        <p className="text-sm text-muted-foreground">Total Questions</p>
                    </div>
                    {currentUserFinalScore !== null && (
                        <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-3xl font-bold text-primary">{(currentUserFinalScore * 100).toFixed(1)}%</p>
                            <p className="text-sm text-muted-foreground">Final Score</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {recentActivity.length > 0 ? recentActivity.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-secondary rounded-md">
                            <div>
                                <p className="font-semibold text-foreground">{item.testName}</p>
                                <p className="text-sm text-muted-foreground">{new Date(item.dateCompleted).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-lg ${item.scorePercentage >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>{item.scorePercentage.toFixed(1)}%</p>
                                <p className="text-sm text-muted-foreground">{item.correctAnswers}/{item.totalQuestions}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-center py-4">No recent activity to show.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface SettingsViewProps {
    user: User;
    onSignOut: () => void;
    darkMode: boolean;
    toggleDarkMode: (event: React.MouseEvent) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onSignOut, darkMode, toggleDarkMode }) => {
    return (
        <div className="p-4 sm:p-8 space-y-8">
            <div className="bg-card border border-border p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-foreground mb-4">Account Settings</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium text-foreground">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
                        <div>
                            <p className="text-sm text-muted-foreground">Password</p>
                            <p className="font-medium text-foreground">Last updated recently</p>
                        </div>
                        <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                </div>
            </div>

             <div className="bg-card border border-border p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-foreground mb-4">Preferences</h3>
                <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
                    <div>
                        <p className="text-sm text-muted-foreground">Theme</p>
                        <p className="font-medium text-foreground">Choose your preferred theme</p>
                    </div>
                    <Button onClick={toggleDarkMode} variant="outline" size="sm" leftIcon={darkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}>
                       {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </Button>
                </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-destructive mb-2">Danger Zone</h3>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium text-foreground">Sign Out</p>
                        <p className="text-sm text-muted-foreground">Sign out of your account</p>
                    </div>
                    <Button onClick={onSignOut} variant="destructive" size="sm" leftIcon={<SignOutIcon className="w-4 h-4" />}>
                       Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
};

const FeedbackView: React.FC = () => {
    return (
         <div className="p-4 sm:p-8 space-y-8">
            <div className="bg-card border border-border p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <FeedbackIcon className="w-8 h-8"/>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">Share Your Feedback</h3>
                        <p className="text-muted-foreground">Help us improve TestGenius with your suggestions and feedback</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="feedback-text" className="text-sm font-medium text-foreground">Your Feedback</label>
                        <textarea
                            id="feedback-text"
                            rows={6}
                            className="mt-1 block w-full rounded-md border-input bg-background shadow-sm focus:border-primary focus:ring-0 sm:text-sm p-2 resize-y"
                            placeholder="Tell us what you think about TestGenius. What features would you like to see? What can we improve?"
                            maxLength={1000}
                        />
                        <p className="text-xs text-right text-muted-foreground mt-1">0/1000 characters</p>
                    </div>
                    <Button size="lg" className="w-full sm:w-auto">Submit Feedback</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-6 rounded-lg shadow-lg">
                    <h4 className="text-lg font-semibold text-foreground mb-2">Feature Requests</h4>
                    <p className="text-muted-foreground">Suggest new features or improvements to existing ones.</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-lg shadow-lg">
                    <h4 className="text-lg font-semibold text-foreground mb-2">Bug Reports</h4>
                    <p className="text-muted-foreground">Report any issues or bugs you've encountered.</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-lg shadow-lg">
                    <h4 className="text-lg font-semibold text-foreground mb-2">General Feedback</h4>
                    <p className="text-muted-foreground">Share your overall experience and suggestions.</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-lg shadow-lg">
                    <h4 className="text-lg font-semibold text-foreground mb-2">Contact Us</h4>
                    <p className="text-muted-foreground">Reach out for support or collaboration opportunities.</p>
                </div>
            </div>
        </div>
    );
}

const KnowTheAppView: React.FC = () => {
    const features = [
        {
            icon: <ArrowUpTrayIcon className="w-6 h-6 text-blue-500" />,
            title: 'Document Upload (PYQ PDFs)',
            description: 'Upload previous year question papers or any PDF to generate mock tests. The AI extracts questions and options, creating a test for you. Processing time depends on PDF length (max 10MB supported).',
        },
        {
            icon: <BookOpenIcon className="w-6 h-6 text-purple-500" />,
            title: 'Syllabus Upload',
            description: 'Upload your syllabus and select the desired difficulty. The AI generates questions tailored to your syllabus, helping you prepare efficiently.',
        },
        {
            icon: <LightBulbIcon className="w-6 h-6 text-pink-500" />,
            title: 'Keywords',
            description: 'Enter topics or keywords to generate focused practice tests. The AI uses your input to create relevant and challenging questions for targeted practice.',
        },
        {
            icon: <HistoryIcon className="w-6 h-6 text-green-500" />,
            title: 'Test History',
            description: 'All your completed tests are saved in Test History. Review your scores, see detailed analytics, and retake tests to track your progress over time.',
        },
        {
            icon: <RetestIcon className="w-6 h-6 text-orange-500" />,
            title: 'Retest & Details',
            description: 'Retake any previous test or dive into detailed reviews. See which questions you got right or wrong, and learn from your mistakes.',
        },
        {
            icon: <BrainIcon className="w-6 h-6 text-purple-500" />,
            title: 'AI Explanation & Elsa',
            description: 'Elsa, your AI assistant, provides instant explanations for any question. Ask Elsa for follow-up help to understand concepts and improve your learning.',
            footer: (
                <div className="mt-auto pt-4 flex justify-center">
                  <div className="inline-flex items-center justify-center gap-2 text-xs p-2 rounded-full bg-secondary">
                    <ElsaAvatarIcon className="w-5 h-5 rounded-full" />
                    <span>Powered by Elsa</span>
                  </div>
                </div>
            )
        },
        {
            icon: <GradeFlowIcon className="w-6 h-6 text-red-500" />,
            title: 'GradeFlow: AI Score Checker',
            description: 'Upload your response sheet and answer key PDFs to instantly calculate your score. Get a question-wise review and ask Elsa about any question for deeper insights.',
        },
    ];

    const FeatureCard: React.FC<{ feature: typeof features[0], className?: string }> = ({ feature, className }) => (
        <div className={cn("bg-card border border-border p-6 rounded-lg shadow-lg flex flex-col h-full", className)}>
            <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 bg-primary/5 p-2 rounded-lg">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed flex-grow">{feature.description}</p>
            {feature.footer && <div className="mt-4">{feature.footer}</div>}
        </div>
    );

    return (
        <div className="p-4 sm:p-8 space-y-8">
            <div className="flex flex-col items-center text-center">
                
                <h2 className="text-3xl font-bold text-foreground">Know the App</h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                    Your all-in-one platform for AI-powered test creation, grading, and review. Explore the features below to get the most out of TestGenius!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        feature={feature}
                        className={cn(index === features.length - 1 && features.length % 2 !== 0 && 'md:col-span-2')}
                    />
                ))}
            </div>
        </div>
    );
};

const SavedTestsView: React.FC<{ 
  savedTests: SavedTestState[];
  onResumeSavedTest: (test: SavedTestState) => void;
  savedTests: SavedTestState[];
  onDeleteSavedTest: (id: string) => void;
}> = ({ savedTests, onResumeSavedTest, onDeleteSavedTest }) => {

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this saved test?')) {
      onDeleteSavedTest(id);
    }
  };

  if (savedTests.length === 0) {
    return <div className="p-8 text-center text-muted-foreground h-full flex items-center justify-center">No saved tests found.</div>;
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Saved Tests</h2>
      <div className="space-y-4 flex-1 overflow-y-auto">
        {savedTests.map(test => (
          <div key={test.id} className="p-4 border border-border rounded-lg bg-background shadow flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold text-lg text-foreground">{test.currentSetupConfig.testName || 'Untitled Test'}</div>
              <div className="text-sm text-muted-foreground mt-1">
                <span>Progress: {test.questions.filter(q => q.status === 'attempted').length} / {test.questions.length} attempted</span> |{' '}
                <span>Mode: {test.currentSetupConfig.timeSettings.type === 'timed' ? 'Timed' : 'Untimed'}</span> |{' '}
                <span>Saved: {new Date(test.savedAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3 sm:mt-0">
              <button className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary/90 font-semibold" onClick={() => onResumeSavedTest(test)}>Resume</button>
              <button className="bg-destructive text-white px-4 py-2 rounded shadow hover:bg-destructive/90 font-semibold" onClick={() => handleDelete(test.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-2">This feature is coming soon!</p>
    </div>
);


interface ProfilePageProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onSignOut: () => void;
    darkMode: boolean;
    toggleDarkMode: (event: React.MouseEvent) => void;
    onNavigateHome: () => void;
    history: TestHistoryEntry[];
    onRetakeTest: (entry: TestHistoryEntry) => void;
    onViewDetails: (entry: TestHistoryEntry) => void;
    onViewScore: (entry: TestHistoryEntry) => void;
    onDeleteEntry: (id: string) => void;
    onClearHistory: () => void;
    currentUserRank: number | null;
    currentUserFinalScore: number | null;
    onResumeSavedTest: (test: SavedTestState) => void;
}
export const ProfilePage: React.FC<ProfilePageProps> = ({ 
    user, onUpdateUser, onSignOut, darkMode, toggleDarkMode, onNavigateHome, history, 
    onRetakeTest, onViewDetails, onViewScore, onDeleteEntry, onClearHistory, currentUserRank,
    currentUserFinalScore, onResumeSavedTest, savedTests
}) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>(ProfileTab.PROFILE);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleTabChange = (tab: ProfileTab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    const renderContent = () => {
        switch (activeTab) {
            case ProfileTab.PROFILE:
                return <ProfileView user={user} onUpdateUser={onUpdateUser} history={history} currentUserRank={currentUserRank} currentUserFinalScore={currentUserFinalScore} />;
            case ProfileTab.TEST_HISTORY:
                 return <HistoryView 
                    history={history}
                    onRetakeTest={onRetakeTest}
                    onViewDetails={onViewDetails}
                    onViewScore={onViewScore}
                    onDeleteEntry={onDeleteEntry}
                    onClearHistory={onClearHistory}
                    onBackToHome={onNavigateHome}
                    isEmbedded={true}
                />;
            case ProfileTab.SAVED_TESTS:
                return <SavedTestsView 
                    savedTests={savedTests}
                    onResumeSavedTest={onResumeSavedTest} 
                    onDeleteSavedTest={(id) => {
                        // This will be handled in App.tsx through the database service
                    }}
                />;
            case ProfileTab.SETTINGS:
                return <SettingsView user={user} onSignOut={onSignOut} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
            case ProfileTab.FEEDBACK:
                return <FeedbackView />;
            case ProfileTab.ANSWER_KEY_CHECK:
                return <PlaceholderView title="Answer Key Check"/>;
            case ProfileTab.KNOW_THE_APP:
                return <KnowTheAppView />;
            default:
                return <ProfileView user={user} onUpdateUser={onUpdateUser} history={history} currentUserRank={currentUserRank} currentUserFinalScore={currentUserFinalScore} />;
        }
    };

    return (
        <div className="w-full h-screen bg-secondary p-4 sm:p-6 md:p-8 flex md:items-center justify-center">
            <div className="w-full max-w-6xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col h-full">
                <header className="p-4 sm:p-5 border-b border-border bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-black/80 flex items-center gap-4 flex-shrink-0">
                    <Button onClick={onNavigateHome} variant="outline" size="sm" leftIcon={<ChevronLeftIcon className="w-4 h-4"/>}>
                        Home
                    </Button>
                    <h1 className="text-xl font-bold text-foreground">Profile</h1>
                    <div className="ml-auto md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
                            <MenuIcon className="w-6 h-6" />
                        </Button>
                    </div>
                </header>
                <div className="flex flex-col md:flex-row flex-1 min-h-0 relative">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block">
                        <ProfileSidebar activeTab={activeTab} onTabChange={handleTabChange} />
                    </div>

                    {/* Mobile Sidebar (Slide-out) */}
                    {isMobileMenuOpen && (
                        <div 
                            className="absolute inset-0 bg-black/60 z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-hidden="true"
                        ></div>
                    )}
                    <div className={`absolute top-0 right-0 h-full w-72 bg-card z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col
                        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mobile-profile-menu-title"
                    >
                        <div className="p-4 flex justify-between items-center border-b border-border">
                            <h2 id="mobile-profile-menu-title" className="font-semibold text-lg">Menu</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                                <XIcon className="w-6 h-6"/>
                            </Button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <ProfileSidebar activeTab={activeTab} onTabChange={handleTabChange} />
                        </div>
                    </div>
                    
                    <main className="flex-1 overflow-y-auto bg-secondary/50">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};