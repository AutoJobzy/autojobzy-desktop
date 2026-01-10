/**
 * ======================== PLANS API ========================
 * Frontend API service for fetching subscription plans
 */

// Desktop app ALWAYS uses localhost backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface PlanFeature {
    id: string;
    key: string;
    value: string;
    label: string;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    priceFormatted: string;
    durationDays: number;
    duration: string;
    isPopular: boolean;
    features: PlanFeature[];
    sortOrder: number;
}

export interface PlansResponse {
    success: boolean;
    data?: Plan[];
    error?: string;
}

export interface PlanResponse {
    success: boolean;
    data?: Plan;
    error?: string;
}

/**
 * Fetch all active plans from the API
 * @returns Promise<PlansResponse>
 */
export async function getPlans(): Promise<PlansResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/plans`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch plans');
        }

        return data;
    } catch (error: any) {
        console.error('Get plans error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch plans',
        };
    }
}

/**
 * Fetch a single plan by ID
 * @param planId - Plan ID
 * @returns Promise<PlanResponse>
 */
export async function getPlanById(planId: string): Promise<PlanResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/plans/${planId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch plan');
        }

        return data;
    } catch (error: any) {
        console.error('Get plan error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch plan',
        };
    }
}

/**
 * Custom React hook for fetching plans
 */
export function usePlans() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        setError(null);

        const result = await getPlans();

        if (result.success && result.data) {
            setPlans(result.data);
        } else {
            setError(result.error || 'Failed to load plans');
        }

        setLoading(false);
    };

    return { plans, loading, error, refetch: loadPlans };
}

// Import React hooks if using the custom hook
import { useState, useEffect } from 'react';
