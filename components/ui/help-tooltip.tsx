"use client"

import React from 'react'
import { HelpCircle } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

interface HelpTooltipProps {
    text: string
    side?: "top" | "right" | "bottom" | "left"
    align?: "start" | "center" | "end"
    className?: string
    iconSize?: number
    variant?: "default" | "subtle" | "info"
}

export function HelpTooltip({
    text,
    side = "right",
    align = "center",
    className = "",
    iconSize = 4,
    variant = "default"
}: HelpTooltipProps) {
    let iconClass = "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400";
    let buttonClass = "";

    if (variant === "subtle") {
        iconClass = "text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-500";
        buttonClass = "opacity-70 hover:opacity-100";
    } else if (variant === "info") {
        iconClass = "text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400";
        buttonClass = "animate-pulse-subtle";
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 p-0 transition-all duration-200 ease-in-out ${buttonClass} ${className}`}
                    >
                        <HelpCircle className={`h-${iconSize} w-${iconSize} ${iconClass} transition-colors duration-200`} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    className="max-w-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg border border-gray-100 dark:border-gray-700 rounded-md px-4 py-2"
                >
                    <p className="text-sm">{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
} 