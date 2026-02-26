import ResendActivationForm from '@/components/auth/ResendActivationForm';

export const metadata = {
  title: 'Resend Activation Email | Study Helper',
  description: 'Request a new activation email for your Study Helper account',
};

export default function ResendActivationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <ResendActivationForm />
    </div>
  );
} 