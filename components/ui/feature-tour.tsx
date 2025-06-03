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
import { Lightbulb, ChevronLeft, ChevronRight, X } from 'lucide-react'

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
}

export function FeatureTour({
    tourId,
    steps,
    onComplete,
    triggerButton
}: FeatureTourProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [hasSeenTour, setHasSeenTour] = useState(false)

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
            setCurrentStep(currentStep + 1)
        } else {
            handleClose()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <>
            {triggerButton ? (
                <div onClick={handleOpen}>
                    {triggerButton}
                </div>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleOpen}
                >
                    <Lightbulb className="h-4 w-4" />
                    <span>Tour Features</span>
                </Button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{steps[currentStep]?.title}</DialogTitle>
                        <DialogDescription>
                            {steps[currentStep]?.description}
                        </DialogDescription>
                    </DialogHeader>

                    {steps[currentStep]?.image && (
                        <div className="relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 my-4">
                            <img
                                src={steps[currentStep].image}
                                alt={steps[currentStep].title}
                                className="w-full object-cover"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
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
                </DialogContent>
            </Dialog>
        </>
    )
} 