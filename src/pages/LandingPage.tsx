import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Brain, Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Link to="/" className="flex items-center gap-2 font-semibold">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <span className="text-lg">StudyAssistant</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost">
                            <Link to="/login">Login</Link>
                        </Button>
                        <Button asChild>
                            <Link to="/register">Sign Up</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container px-4 py-24">
                <div className="mx-auto max-w-4xl text-center space-y-8">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                        Transform Your Study Materials with{' '}
                        <span className="text-primary">AI-Powered</span> Learning
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Upload your documents, generate intelligent summaries, and create custom quizzes
                        to enhance your learning experience with the power of artificial intelligence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="gap-2">
                            <Link to="/register">
                                Get Started Free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link to="/login">Sign In</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container px-4 py-16">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Everything you need to study smarter
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Our AI-powered platform helps you understand and retain information better
                            with intelligent summaries and personalized quizzes.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <Upload className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Easy File Upload</CardTitle>
                                <CardDescription>
                                    Upload PDFs, Word documents, and text files instantly.
                                    Our platform supports multiple file formats for your convenience.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <FileText className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>AI Summaries</CardTitle>
                                <CardDescription>
                                    Get intelligent, concise summaries of your documents powered by
                                    advanced AI models that understand context and key concepts.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Brain className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Smart Quizzes</CardTitle>
                                <CardDescription>
                                    Generate personalized quizzes from your materials to test
                                    your understanding and reinforce learning.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container px-4 py-16">
                <div className="mx-auto max-w-2xl text-center space-y-8">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Ready to revolutionize your learning?
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Join thousands of students who are already using StudyAssistant
                        to improve their study efficiency and academic performance.
                    </p>
                    <Button asChild size="lg" className="gap-2">
                        <Link to="/register">
                            Start Learning Today
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-muted/50">
                <div className="container px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span className="font-semibold">StudyAssistant</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2025 StudyAssistant. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
