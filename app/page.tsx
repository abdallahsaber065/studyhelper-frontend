import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Users, Zap, FileText, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Study Helper
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Transform Your
              <span className="text-primary"> Learning Journey</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Harness the power of AI to organize your study materials, generate intelligent summaries, 
              create custom quizzes, and collaborate with your study community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-4">
                <Link href="/auth/register">
                  Start Learning Today
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-4">
                <Link href="/demo">
                  View Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive tools designed to enhance your learning experience and boost your academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Summaries */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Summaries
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Transform lengthy documents into concise, intelligent summaries that capture key concepts and insights.
              </p>
            </div>

            {/* Smart File Management */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Smart File Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload, organize, and share your study materials with intelligent categorization and easy access.
              </p>
            </div>

            {/* Interactive Quizzes */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Interactive Quizzes
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate custom MCQ quizzes from your materials and track your progress with detailed analytics.
              </p>
            </div>

            {/* Study Communities */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Study Communities
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Join study groups, collaborate with peers, and share knowledge in subject-specific communities.
              </p>
            </div>

            {/* Real-time Collaboration */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-6 rounded-xl border border-teal-200 dark:border-teal-700">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant feedback, performance analytics, and personalized recommendations for improvement.
              </p>
            </div>

            {/* Learning Analytics */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Learning Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your learning progress with comprehensive analytics and visual progress indicators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Revolutionize Your Study Experience?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students who are already using Study Helper to achieve better results 
            and make learning more engaging and effective.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-4">
            <Link href="/auth/register">
              Get Started for Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Study Helper. Empowering learners with AI-driven education tools.</p>
            <div className="mt-2 flex justify-center space-x-4">
              <Link href="/demo" className="hover:text-primary">Demo</Link>
              <Link href="/auth/login" className="hover:text-primary">Sign In</Link>
              <Link href="/auth/register" className="hover:text-primary">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 