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
import { Lightbulb, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react'

interface TourStep {
    title: string
    description: string
    image?: string
}

interface FeatureTourProps {
    tourId: string
    steps: TourStep[]
    onComplete?: () => void
    triggerButton?: React.ReactNode
    showBadge?: boolean
    animate?: boolean
}

export function FeatureTour({
    tourId,
    steps,
    onComplete,
    triggerButton,
    showBadge = false,
    animate = true
}: FeatureTourProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [hasSeenTour, setHasSeenTour] = useState(false)
    const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next')

    // Check if user has seen this tour before
    useEffect(() => {
        const seenTours = localStorage.getItem('seen-tours')
        if (seenTours) {
            const toursArray = JSON.parse(seenTours)
            if (toursArray.includes(tourId)) {
                setHasSeenTour(true)
            }
        }
    }, [tourId])

    const handleOpen = () => {
        setIsOpen(true)
        setCurrentStep(0)
    }

    const handleClose = () => {
        setIsOpen(false)
        if (!hasSeenTour) {
            // Mark this tour as seen
            const seenTours = localStorage.getItem('seen-tours')
            let toursArray = seenTours ? JSON.parse(seenTours) : []
            toursArray.push(tourId)
            localStorage.setItem('seen-tours', JSON.stringify(toursArray))
            setHasSeenTour(true)
        }
        if (onComplete) {
            onComplete()
        }
    }

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setAnimationDirection('next')
            setCurrentStep(currentStep + 1)
        } else {
            handleClose()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setAnimationDirection('prev')
            setCurrentStep(currentStep - 1)
        }
    }

    const goToStep = (index: number) => {
        setAnimationDirection(index > currentStep ? 'next' : 'prev')
        setCurrentStep(index)
    }

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault()
                if (currentStep < steps.length - 1) nextStep()
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault()
                if (currentStep > 0) prevStep()
            } else if (e.key === 'Escape') {
                handleClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, currentStep, steps.length])

    return (
        <>
            {triggerButton ? (
                <div onClick={handleOpen} className="cursor-pointer">
                    {triggerButton}
                    {!hasSeenTour && showBadge && (
                        <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                            <span className="flex h-3 w-3">
                                <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                        </span>
                    )}
                </div>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 group ${animate && !hasSeenTour ? 'animate-pulse-subtle' : ''}`}
                    onClick={handleOpen}
                >
                    <Lightbulb className="h-4 w-4 text-amber-500 group-hover:text-amber-600 transition-colors" />
                    <span>Tour Features</span>
                    {!hasSeenTour && showBadge && (
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                    )}
                </Button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-gray-800 shadow-xl">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle className={`text-2xl transition-all duration-300 ${animate ? animationDirection === 'next' ? 'animate-slide-right' : 'animate-slide-left' : ''}`}>
                            {steps[currentStep]?.title}
                        </DialogTitle>
                        <DialogDescription className={`text-base transition-all duration-300 ${animate ? animationDirection === 'next' ? 'animate-slide-right' : 'animate-slide-left' : ''}`}>
                            {steps[currentStep]?.description}
                        </DialogDescription>
                    </DialogHeader>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="absolute right-4 top-4 opacity-70 hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    {steps[currentStep]?.image && (
                        <div className={`relative overflow-hidden border-y border-gray-200 dark:border-gray-700 ${animate ? animationDirection === 'next' ? 'animate-fade-in' : 'animate-fade-in' : ''}`}>
                            <img
                                src={steps[currentStep].image}
                                alt={steps[currentStep].title}
                                className="w-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6">
                        {/* Progress Dots */}
                        <div className="flex justify-center space-x-2 mb-6">
                            {steps.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all duration-200 ${currentStep === idx
                                        ? 'bg-blue-500 w-4'
                                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'}`}
                                    onClick={() => goToStep(idx)}
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                                Step {currentStep + 1} of {steps.length}
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                {currentStep < steps.length - 1 ? (
                                    <Button size="sm" onClick={nextStep}>
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                ) : (
                                    <Button size="sm" onClick={handleClose}>
                                        Finish
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
} 