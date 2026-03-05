"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Clock,
    ListTodo,
    TrendingUp,
    Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { Analytics } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get("/analytics");
                setAnalytics(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-[250px]" />
                    <Skeleton className="h-4 w-[400px]" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    const metrics = [
        {
            title: "Total Tasks",
            value: analytics?.total_tasks || 0,
            icon: ListTodo,
            color: "text-blue-500",
        },
        {
            title: "Completed",
            value: analytics?.completed_tasks || 0,
            icon: CheckCircle2,
            color: "text-emerald-500",
        },
        {
            title: "On-time Rate",
            value: `${analytics?.completion_percentage || 0}%`,
            icon: TrendingUp,
            color: "text-orange-500",
        },
        {
            title: "Completed Today",
            value: analytics?.tasks_completed_today || 0,
            icon: Clock,
            color: "text-purple-500",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">
                    Welcome back! Here&apos;s your current productivity snapshot.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                    <Card key={metric.title} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                            <metric.icon className={`h-4 w-4 ${metric.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metric.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-600" />
                            Productivity Engine
                        </CardTitle>
                        <CardDescription>
                            How we calculate your focus and efficiency
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="relative flex items-center justify-center">
                                <svg className="h-32 w-32 translate-x-1 translate-y-1">
                                    <circle
                                        className="text-slate-200 dark:text-slate-800"
                                        strokeWidth="10"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="58"
                                        cx="60"
                                        cy="60"
                                    />
                                    <circle
                                        className="text-blue-600 transition-all duration-1000 ease-in-out"
                                        strokeWidth="10"
                                        strokeDasharray={364.4}
                                        strokeDashoffset={364.4 - (364.4 * (analytics?.productivity_score || 0)) / 100}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="58"
                                        cx="60"
                                        cy="60"
                                    />
                                </svg>
                                <span className="absolute text-3xl font-bold">
                                    {analytics?.productivity_score}%
                                </span>
                            </div>
                            <p className="mt-6 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {analytics?.productivity_score_explanation}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Completed Weeks</span>
                                <span className="font-semibold">{analytics?.tasks_completed_this_week}</span>
                            </div>
                            <Progress value={(analytics?.tasks_completed_this_week || 0) * 10} className="h-1" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Monthly Progress</span>
                                <span className="font-semibold">{analytics?.tasks_completed_this_month}</span>
                            </div>
                            <Progress value={(analytics?.tasks_completed_this_month || 0) * 5} className="h-1" />
                        </div>
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Top Perform Day</span>
                                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded dark:bg-blue-900/40 dark:text-blue-300 font-bold uppercase text-[10px]">
                                    {analytics?.most_productive_day || "None"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
