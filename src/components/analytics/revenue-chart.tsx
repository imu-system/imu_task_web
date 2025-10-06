'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RevenueData } from '@/lib/analytics/dashboard-analytics';

interface RevenueChartProps {
    data: RevenueData[];
    title?: string;
    type?: 'line' | 'area';
    showCount?: boolean;
}

export function RevenueChart({ 
    data, 
    title = 'Revenue Over Time',
    type = 'area',
    showCount = false 
}: RevenueChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    };

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Aucune donnée disponible
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    {type === 'area' ? (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={formatDate}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                                tickFormatter={(value) => `${value}€`}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                                formatter={(value: number, name: string) => {
                                    if (name === 'amount') return [formatCurrency(value), 'Montant'];
                                    if (name === 'count') return [value, 'Nombre'];
                                    return [value, name];
                                }}
                                labelFormatter={formatDate}
                            />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#8884d8" 
                                fillOpacity={1} 
                                fill="url(#colorAmount)"
                                name="Montant"
                            />
                            {showCount && (
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#82ca9d" 
                                    fillOpacity={0.6} 
                                    fill="#82ca9d"
                                    name="Nombre"
                                />
                            )}
                        </AreaChart>
                    ) : (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={formatDate}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                                tickFormatter={(value) => `${value}€`}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                                formatter={(value: number, name: string) => {
                                    if (name === 'amount') return [formatCurrency(value), 'Montant'];
                                    if (name === 'count') return [value, 'Nombre'];
                                    return [value, name];
                                }}
                                labelFormatter={formatDate}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#8884d8" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="Montant"
                            />
                            {showCount && (
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#82ca9d" 
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    name="Nombre"
                                />
                            )}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
