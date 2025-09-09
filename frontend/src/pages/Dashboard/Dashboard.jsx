import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import LoadingSpinner from '../../components/ui/loading-spinner';
import AnalyticsService from '../../services/analyticsService';
import {
  FrequencyTrendChart,
  RouteEfficiencyPieChart,
  RiskDistributionChart,
  MetricsSummary
} from '../../components/Charts/AdvancedCharts';
import {
  Users,
  GraduationCap,
  School,
  Bus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  BarChart3,
  Activity,
  Zap,
  Target,
  Shield
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchDashboardData(true);
      }
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await AnalyticsService.getDashboardAnalytics();
      
      if (result.success) {
        setDashboardData(result.data);
        if (isRefresh) {
          toast.success('Dashboard atualizado', 'Dados atualizados com sucesso');
        }
      } else {
        toast.error('Erro', result.error || 'Não foi possível carregar os dados');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro', 'Erro inesperado ao carregar dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Alunos',
      value: stats?.total_alunos || 0,
      description: 'Alunos ativos no sistema',
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      trend: '+5.2%'
    },
    {
      title: 'Rotas Ativas',
      value: stats?.total_rotas_ativas || 0,
      description: 'Rotas em operação',
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      trend: '+2.1%'
    },
    {
      title: 'Veículos',
      value: stats?.total_veiculos || 0,
      description: 'Veículos disponíveis',
      icon: Bus,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      trend: '0%'
    },
    {
      title: 'Escolas',
      value: stats?.total_escolas || 0,
      description: 'Escolas atendidas',
      icon: School,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      trend: '+1.5%'
    },
    {
      title: 'Taxa de Frequência',
      value: `${stats?.taxa_frequencia_media?.toFixed(1) || 0}%`,
      description: 'Média de presença hoje',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      trend: '+0.8%'
    },
    {
      title: 'Alunos Transportados',
      value: stats?.alunos_transportados_hoje || 0,
      description: 'Alunos transportados hoje',
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
      trend: '+12.3%'
    },
    {
      title: 'Rotas em Operação',
      value: stats?.rotas_em_operacao || 0,
      description: 'Rotas ativas hoje',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      trend: '+3.2%'
    },
    {
      title: 'Ocorrências Abertas',
      value: stats?.ocorrencias_abertas || 0,
      description: 'Pendências para resolver',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      trend: '-15%'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bem-vindo, {user?.nome?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está um resumo do seu sistema de transporte escolar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-success border-success/20 bg-success/5">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sistema Online
          </Badge>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Atualizado há 2 min
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover border-0 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          stat.trend.startsWith('+') 
                            ? 'text-success bg-success/10 border-success/20' 
                            : stat.trend.startsWith('-')
                            ? 'text-destructive bg-destructive/10 border-destructive/20'
                            : 'text-muted-foreground bg-muted'
                        }`}
                      >
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Frequência registrada</p>
                <p className="text-xs text-muted-foreground">Rota Centro - 45 alunos presentes</p>
              </div>
              <span className="text-xs text-muted-foreground">5 min</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Novo aluno cadastrado</p>
                <p className="text-xs text-muted-foreground">Maria Silva - Escola Central</p>
              </div>
              <span className="text-xs text-muted-foreground">12 min</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Manutenção agendada</p>
                <p className="text-xs text-muted-foreground">Veículo ABC-1234 - 15/01/2024</p>
              </div>
              <span className="text-xs text-muted-foreground">1 hora</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Rota otimizada</p>
                <p className="text-xs text-muted-foreground">Rota Periferia - tempo reduzido em 5 min</p>
              </div>
              <span className="text-xs text-muted-foreground">2 horas</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start h-12" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Registrar Frequência
            </Button>
            
            <Button className="w-full justify-start h-12" variant="outline">
              <GraduationCap className="w-4 h-4 mr-2" />
              Cadastrar Aluno
            </Button>
            
            <Button className="w-full justify-start h-12" variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reportar Ocorrência
            </Button>
            
            <Button className="w-full justify-start h-12" variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>
            Monitoramento em tempo real dos serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="font-medium">API do Sistema</p>
                <p className="text-sm text-muted-foreground">Operacional</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="font-medium">Base de Dados</p>
                <p className="text-sm text-muted-foreground">Conectado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="font-medium">Sincronização</p>
                <p className="text-sm text-muted-foreground">Atualizado</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;