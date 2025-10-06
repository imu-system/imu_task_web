'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TaskStatistics } from '@/lib/analytics/dashboard-analytics';

interface TaskStatsChartProps {
    stats: TaskStatistics;
    type?: 'category' | 'status';
}

const CATEGORY_COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c',
    '#d0ed57', '#83a6ed', '#8dd1e1', '#82ca9d', '#ffc658'
];

const STATUS_COLORS: Record<string, string> = {
    'open': '#3b82f6',
    'assigned': '#f59e0b',
    'in-progress': '#8b5cf6',
    'completed': '#10b981',
    'cancelled': '#ef4444',
};

export function TaskStatsChart({ stats, type = 'category' }: TaskStatsChartProps) {
    const data = type === 'category' 
        ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value, fill: undefined }))
        : Object.entries(stats.byStatus).map(([name, value]) => ({ 
            name: name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
            value,
            fill: STATUS_COLORS[name] || '#64748b'
        }));

    const colors = type === 'category' ? CATEGORY_COLORS : Object.values(STATUS_COLORS);

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        {type === 'category' ? 'Répartition par Catégorie' : 'Répartition par Statut'}
                    </CardTitle>
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
                <CardTitle>
                    {type === 'category' ? 'Répartition par Catégorie' : 'Répartition par Statut'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    {type === 'category' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Nombre de tâches">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill || colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
