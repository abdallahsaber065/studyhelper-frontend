"use client"

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookOpen, Brain, TrendingUp, ListChecks, X, Sparkles, Zap } from 'lucide-react'

interface WelcomeDialogProps {
    id: string
    title?: string
    subtitle?: string
    showAnimatedBackground?: boolean
    neverShowAgain?: boolean
}

export function WelcomeDialog({
    id,
    title = "Welcome to Quizzes",
    subtitle = "Test your knowledge and learn more effectively",
    showAnimatedBackground = false,
    neverShowAgain = false
}: WelcomeDialogProps) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Check if we should show the welcome dialog
        const welcomeSeen = localStorage.getItem(`welcome-seen-${id}`)
        if (!welcomeSeen) {
            setIsOpen(true)
        }
    }, [id])

    const handleClose = (neverShow: boolean = false) => {
        setIsOpen(false)
        localStorage.setItem(`welcome-seen-${id}`, neverShow ? 'permanent' : 'true')
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => handleClose(false)}>
            <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden">
                {showAnimatedBackground && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-900/30 dark:to-purple-900/30 -z-10" />
                )}
                <div className="absolute top-4 right-4">
                    <Button variant="ghost" size="icon" onClick={() => handleClose(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <DialogHeader className="px-6 pt-6 pb-0 text-center sm:text-left">
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent pb-1 flex items-center justify-center sm:justify-start gap-3">
                        <Zap className="h-8 w-8 text-amber-500" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        {subtitle}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 px-6">
                    <h3 className="font-medium mb-4 text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <span>Quick Guide</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 hover:shadow-md transition-shadow">
                            <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-800 dark:text-blue-300">Take Quizzes</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    Browse and take quizzes to test your knowledge on various topics.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 hover:shadow-md transition-shadow">
                            <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/30">
                                <ListChecks className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-green-800 dark:text-green-300">Create Quizzes</h4>
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    Make your own quizzes by adding custom questions and answers.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 hover:shadow-md transition-shadow">
                            <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900/30">
                                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-purple-800 dark:text-purple-300">AI Generation</h4>
                                <p className="text-sm text-purple-700 dark:text-purple-400">
                                    Use our AI to automatically generate quiz questions from your study materials.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 hover:shadow-md transition-shadow">
                            <div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900/30">
                                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-amber-800 dark:text-amber-300">Track Progress</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Monitor your performance and see how you improve over time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex-col sm:flex-row gap-3 sm:gap-2">
                    {neverShowAgain && (
                        <Button variant="ghost" size="sm" onClick={() => handleClose(true)} className="order-2 sm:order-1">
                            Don't show again
                        </Button>
                    )}
                    <Button onClick={() => handleClose(false)} className="w-full sm:w-auto order-1 sm:order-2">
                        Get Started
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 