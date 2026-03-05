"use client";

import { useEffect, useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from "@/lib/api";
import { Analytics } from "@/types";
import { Loader2 } from "lucide-react";

export default function AnalyticsPage() {
    const [data, setData] = useState<Analytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get("/analytics");
                setData(response.data);
            } catch (error) {
                console.error("Error loading analytics", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const PIE_COLORS = ["#3b82f6", "#f97316", "#ef4444", "#10b981"];

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Performance Analytics</h2>
                <p className="text-muted-foreground">
                    Deep dive into your productivity patterns and task distribution.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Daily Completion Trend</CardTitle>
                        <CardDescription>Tasks completed over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.daily_completions || []}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelFormatter={(val) => new Date(val).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Priority Distribution</CardTitle>
                        <CardDescription>Task breakdown by priority level</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.priority_distribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="priority"
                                >
                                    {(data?.priority_distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-2 pr-8">
                            {data?.priority_distribution.map((item, idx) => (
                                <div key={item.priority} className="flex items-center gap-2 text-xs">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                    <span className="font-medium">{item.priority}: {item.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Avg. Completion Time</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {data?.average_completion_time_hours ? `${data.average_completion_time_hours}h` : 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Success Rate</p>
                            <p className="text-3xl font-bold text-emerald-600">{data?.completion_percentage}%</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Activity Streak</p>
                            <p className="text-3xl font-bold text-orange-500">{data?.tasks_completed_this_week} <span className="text-lg font-normal">this week</span></p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
