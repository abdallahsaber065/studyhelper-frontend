// Landing and authentication pages
export { LandingPage } from './LandingPage';
export { LoginPage } from './LoginPage';
export { RegisterPage } from './RegisterPage';
export { ForgotPasswordPage } from './ForgotPasswordPage';
export { ResetPasswordPage } from './ResetPasswordPage';
export { EmailVerificationPage } from './EmailVerificationPage';

// Main application pages  
export { DashboardPage } from './DashboardPage';
export { FilesPage } from './FilesPage';
export { SummariesPage } from './SummariesPage';
export { QuizzesPage } from './QuizzesPage';

// Placeholder pages for navigation
export const AnalyticsPage = () => (
    <div className="space-y-4">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Analytics and insights coming soon...</p>
    </div>
);

export const HelpPage = () => (
    <div className="space-y-4">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Help center and documentation coming soon...</p>
    </div>
);

export const SettingsPage = () => (
    <div className="space-y-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Account settings and preferences coming soon...</p>
    </div>
);
