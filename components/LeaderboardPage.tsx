
import React from 'react';
import { User, TestHistoryEntry } from '../types';
import Button, { cn } from './Button';
import { TrophyIcon, ChevronLeftIcon } from './Icons';

interface RankedUser {
  rank: number;
  user: User;
  testsCompleted: number;
  avgScore: number;
  questionsAttempted: number;
  finalScore: number;
}

interface LeaderboardPageProps {
  rankedUsers: RankedUser[];
  currentUser: User | null;
  onBackToHome: () => void;
}

const PodiumCard: React.FC<{ rankedUser: RankedUser, isCurrentUser: boolean }> = ({ rankedUser, isCurrentUser }) => {
    const podiumStyles = {
        1: { bar: 'h-40 bg-gradient-to-t from-yellow-400 to-yellow-300', text: '1st', avatarSize: 'w-24 h-24 text-4xl', ring: 'ring-yellow-400' },
        2: { bar: 'h-32 bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-500 dark:to-slate-400', text: '2nd', avatarSize: 'w-20 h-20 text-3xl', ring: 'ring-slate-400' },
        3: { bar: 'h-24 bg-gradient-to-t from-amber-500 to-amber-400', text: '3rd', avatarSize: 'w-20 h-20 text-3xl', ring: 'ring-amber-500' }
    };
    
    const style = podiumStyles[rankedUser.rank] || podiumStyles[3];

    return (
        <div className="flex flex-col items-center">
            <div className={cn("flex items-center justify-center rounded-full mb-2 bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold", style.avatarSize, isCurrentUser && `ring-4 ring-offset-2 ring-offset-card ${style.ring}`)}>
                {rankedUser.user.initials}
            </div>
            <p className="font-bold text-foreground text-sm truncate">{rankedUser.user.name}</p>
            <p className="text-muted-foreground text-xs">{(rankedUser.finalScore * 100).toFixed(1)}%</p>
            <div className={cn("w-24 sm:w-32 mt-2 rounded-t-lg flex items-center justify-center text-2xl font-bold text-white/80", style.bar)}>
                {style.text}
            </div>
        </div>
    );
};


const RankTrophy: React.FC<{ rank: number }> = ({ rank }) => {
    const rankStyles = {
        1: 'text-yellow-400',
        2: 'text-slate-400',
        3: 'text-amber-600'
    };

    if (rank > 3) {
        return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
    }

    return (
        <TrophyIcon className={cn("w-6 h-6", rankStyles[rank])} />
    );
};

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ rankedUsers, currentUser, onBackToHome }) => {
    
    const first = rankedUsers.find(u => u.rank === 1);
    const second = rankedUsers.find(u => u.rank === 2);
    const third = rankedUsers.find(u => u.rank === 3);
    const podiumUsers = [second, first, third].filter(Boolean) as RankedUser[];
    
    const currentUserRankData = currentUser ? rankedUsers.find(u => u.user.email === currentUser.email) : null;

    return (
        <div className="min-h-full bg-secondary">
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
            <div className="bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-xl w-full">
                <header className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800/50 dark:to-purple-900/30">
                     <Button onClick={onBackToHome} variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                        <ChevronLeftIcon className="w-5 h-5" />
                     </Button>
                     <div className="flex-grow">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Leaderboard</h2>
                        <p className="text-sm text-muted-foreground">Top performers on TestGenius</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-primary h-10 w-10">
                        <TrophyIcon className="w-7 h-7" />
                    </Button>
                </header>
                
                {currentUserRankData && (
                    <div className="text-center mb-8">
                        <p className="text-sm uppercase font-semibold text-muted-foreground">Your Rank</p>
                        <p className="text-5xl font-bold text-primary">#{currentUserRankData.rank}</p>
                    </div>
                )}
                
                {podiumUsers.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-xl font-bold text-center mb-6 text-foreground">Top 3 Champions</h3>
                        <div className="flex justify-center items-end gap-2 sm:gap-4">
                            {podiumUsers.map(u => (
                                <PodiumCard key={u.user.email} rankedUser={u} isCurrentUser={currentUser?.email === u.user.email} />
                            ))}
                        </div>
                    </div>
                )}
                
                {rankedUsers.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-xl text-muted-foreground">The leaderboard is empty.</p>
                        <p className="text-sm text-muted-foreground/80 mt-2">Complete a test to get on the board!</p>
                    </div>
                )}

                {rankedUsers.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                                <tr>
                                    <th className="px-4 py-3 text-center">Rank</th>
                                    <th className="px-4 py-3 min-w-[200px]">User</th>
                                    <th className="px-4 py-3 text-center">Tests</th>
                                    <th className="px-4 py-3 text-center">Avg Score</th>
                                    <th className="px-4 py-3 text-center">Questions</th>
                                    <th className="px-4 py-3 text-center">Final Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankedUsers.slice(0, 20).map(u => (
                                    <tr key={u.user.email} className={cn("border-b border-border/50", currentUser?.email === u.user.email && 'bg-primary/10')}>
                                        <td className="px-4 py-4 text-center">
                                            <RankTrophy rank={u.rank} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-xs">
                                                    {u.user.initials}
                                                </div>
                                                <div className="font-medium text-foreground truncate">{u.user.name}</div>
                                                 {currentUser?.email === u.user.email && (
                                                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500 text-white rounded-full">You</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-foreground">{u.testsCompleted}</td>
                                        <td className="px-4 py-4 text-center text-foreground">{u.avgScore.toFixed(1)}%</td>
                                        <td className="px-4 py-4 text-center text-foreground">{u.questionsAttempted}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span
                                                className="font-bold px-3 py-1.5 rounded-full text-xs text-[hsl(var(--score-hue),80%,30%)] dark:text-white"
                                                style={{
                                                    '--score-hue': u.finalScore * 120,
                                                    backgroundColor: `hsla(${u.finalScore * 120}, 70%, 50%, 0.15)`,
                                                } as React.CSSProperties}
                                            >
                                                {(u.finalScore * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-10 p-4 bg-secondary rounded-lg border border-border">
                     <h4 className="font-bold text-foreground mb-2">How Rankings Are Calculated</h4>
                     <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li><strong>Average Score:</strong> 50% weight</li>
                        <li><strong>Tests Completed:</strong> 30% weight</li>
                        <li><strong>Questions Attempted:</strong> 20% weight</li>
                     </ul>
                     <p className="text-xs text-muted-foreground/80 italic mt-2">All factors are normalized and combined to create the final score.</p>
                </div>
            </div>
        </div>
        </div>
    );
};
