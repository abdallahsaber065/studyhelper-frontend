import AccountActivation from '@/components/auth/AccountActivation';

export const metadata = {
  title: 'Activate Account | Study Helper',
  description: 'Activate your Study Helper account',
};

export default function AccountActivationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <AccountActivation />
    </div>
  );
} 