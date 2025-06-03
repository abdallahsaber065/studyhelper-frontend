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
import { BookOpen, Brain, TrendingUp, ListChecks } from 'lucide-react'

interface WelcomeDialogProps {
    id: string
    title?: string
    subtitle?: string
}

export function WelcomeDialog({
    id,
    title = "Welcome to Quizzes",
    subtitle = "Test your knowledge and learn more effectively"
}: WelcomeDialogProps) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Check if we should show the welcome dialog
        const welcomeSeen = localStorage.getItem(`welcome-seen-${id}`)
        if (!welcomeSeen) {
            setIsOpen(true)
        }
    }, [id])

    const handleClose = () => {
        setIsOpen(false)
        localStorage.setItem(`welcome-seen-${id}`, 'true')
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{title}</DialogTitle>
                    <DialogDescription className="text-base">
                        {subtitle}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Quick Guide</h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
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

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
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

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30">
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

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
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

                <DialogFooter>
                    <Button onClick={handleClose} className="w-full">
                        Get Started
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 