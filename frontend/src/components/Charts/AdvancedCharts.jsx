import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';

/**
 * Componentes de gráficos avançados para o SIG-TE
 */

// Gráfico de linha para tendências de frequência
export const FrequencyTrendChart = ({ data, height = 300 }) => {
  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  const chartData = data.labels.map((label, index) => ({
    date: new Date(label).toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric' 
    }),
    attendance: data.values[index] || 0,
    students: data.studentCounts?.[index] || 0
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          domain={[0, 100]}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value, name) => [
            name === 'attendance' ? `${value.toFixed(1)}%` : value,
            name === 'attendance' ? 'Taxa de Frequência' : 'Alunos'
          ]}
        />
        <Area
          type="monotone"
          dataKey="attendance"
          stroke="#3b82f6"
          strokeWidth={3}
          fill="url(#attendanceGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Gráfico de pizza para eficiência das rotas
export const RouteEfficiencyPieChart = ({ data, height = 300 }) => {
  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index] || 0,
    color: data.colors[index] || '#6b7280'
  }));

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [value, 'Rotas']}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Gráfico de barras para distribuição de alunos em risco
export const RiskDistributionChart = ({ data, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  const riskLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MINIMAL'];
  const riskColors = {
    'CRITICAL': '#dc2626',
    'HIGH': '#ea580c', 
    'MEDIUM': '#d97706',
    'LOW': '#65a30d',
    'MINIMAL': '#16a34a'
  };

  const chartData = riskLevels.map(level => {
    const count = data.filter(student => student.riskLevel === level).length;
    return {
      level: level,
      count: count,
      color: riskColors[level]
    };
  }).filter(item => item.count > 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="level" 
          stroke="#64748b"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip 
          formatter={(value) => [value, 'Alunos']}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Gráfico radial para KPIs
export const KPIRadialChart = ({ data, title, height = 200 }) => {
  if (!data || typeof data.value !== 'number') {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Dados indisponíveis
      </div>
    );
  }

  const chartData = [{
    name: title,
    value: data.value,
    fill: data.color || '#3b82f6'
  }];

  return (
    <div className="text-center">
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          barSize={20}
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            minAngle={15}
            label={{ position: 'insideStart', fill: '#fff' }}
            background
            clockWise
            dataKey="value"
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-2xl font-bold">
            {`${data.value}${data.unit || ''}`}
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
      <p className="text-sm text-muted-foreground mt-2">{title}</p>
    </div>
  );
};

// Gráfico de linha múltipla para comparações
export const MultiLineChart = ({ data, height = 300 }) => {
  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data.chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Legend />
        {data.datasets.map((dataset, index) => (
          <Line
            key={dataset.key}
            type="monotone"
            dataKey={dataset.key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={dataset.label}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Componente de métricas resumidas
export const MetricsSummary = ({ metrics }) => {
  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Métricas não disponíveis
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(metrics).map(([key, value]) => (
        <div key={key} className="text-center p-4 bg-muted/20 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </div>
          <div className="text-sm text-muted-foreground capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default {
  FrequencyTrendChart,
  RouteEfficiencyPieChart,
  RiskDistributionChart,
  KPIRadialChart,
  MultiLineChart,
  MetricsSummary
};