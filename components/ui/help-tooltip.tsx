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
}

export function HelpTooltip({
    text,
    side = "right",
    align = "center",
    className = "",
    iconSize = 4
}: HelpTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 p-0 ${className}`}
                    >
                        <HelpCircle className={`h-${iconSize} w-${iconSize} text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400`} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side={side} align={align} className="max-w-xs">
                    <p className="text-sm">{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
} 