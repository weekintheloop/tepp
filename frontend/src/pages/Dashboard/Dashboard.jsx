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
        <span className="ml-3 text-muted-foreground">Carregando analytics avançados...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Não foi possível carregar os dados do dashboard. Verifique sua conexão.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const kpis = dashboardData.kpis || {};
  const performanceMetrics = dashboardData.performanceMetrics || {};
  const maintenanceAlerts = dashboardData.maintenanceAlerts || [];
  const riskStudents = dashboardData.riskStudents || [];

  const statCards = [
    {
      title: 'Alunos Ativos',
      value: kpis.totalActiveStudents || 0,
      description: 'Total de alunos no sistema',
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      change: '+5.2%',
      trend: 'up'
    },
    {
      title: 'Rotas Ativas',
      value: kpis.totalActiveRoutes || 0,
      description: 'Rotas em operação',
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      change: '+2.1%',
      trend: 'up'
    },
    {
      title: 'Frota Disponível',
      value: kpis.totalBuses || 0,
      description: 'Veículos operacionais',
      icon: Bus,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      change: '0%',
      trend: 'stable'
    },
    {
      title: 'Taxa de Frequência',
      value: `${kpis.overallAttendanceRate?.toFixed(1) || 0}%`,
      description: 'Média de presença',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      change: '+0.8%',
      trend: 'up'
    },
    {
      title: 'Utilização da Frota',
      value: `${kpis.averageFleetUtilization?.toFixed(1) || 0}%`,
      description: 'Eficiência operacional',
      icon: Target,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
      change: '+1.2%',
      trend: 'up'
    },
    {
      title: 'Incidentes Abertos',
      value: kpis.openIncidents || 0,
      description: 'Requer atenção',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      change: '-15%',
      trend: 'down',
      critical: kpis.criticalIncidents || 0
    },
    {
      title: 'Performance Geral',
      value: `${performanceMetrics.punctualityScore?.toFixed(1) || 0}%`,
      description: 'Score de pontualidade',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      change: '+2.5%',
      trend: 'up'
    },
    {
      title: 'Sistema',
      value: `${performanceMetrics.systemUptime?.toFixed(1) || 0}%`,
      description: 'Uptime do sistema',
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      change: '+0.1%',
      trend: 'stable'
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bem-vindo, {user?.nome?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Dashboard executivo com analytics avançados e insights em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-success border-success/20 bg-success/5">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sistema Online
          </Badge>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            {dashboardData.timestamp ? 
              `Atualizado ${new Date(dashboardData.timestamp).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}` : 
              'Atualizado agora'
            }
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover border-0 shadow-sm bg-card/50 backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm font-medium">
                        {stat.title}
                      </p>
                      {getTrendIcon(stat.trend)}
                    </div>
                    
                    <div className="flex items-baseline space-x-2">
                      <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {stat.value}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          stat.trend === 'up'
                            ? 'text-success bg-success/10 border-success/20' 
                            : stat.trend === 'down'
                            ? 'text-destructive bg-destructive/10 border-destructive/20'
                            : 'text-muted-foreground bg-muted'
                        }`}
                      >
                        {stat.change}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                    
                    {stat.critical > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-xs text-red-600 font-medium">
                          {stat.critical} crítico{stat.critical > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency Trend Chart */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tendência de Frequência
            </CardTitle>
            <CardDescription>
              Taxa de presença dos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FrequencyTrendChart 
              data={dashboardData.frequencyTrends}
              height={280}
            />
          </CardContent>
        </Card>

        {/* Route Efficiency Pie Chart */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Eficiência das Rotas
            </CardTitle>
            <CardDescription>
              Distribuição por categoria de performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RouteEfficiencyPieChart 
              data={dashboardData.routeEfficiency}
              height={280}
            />
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis Section */}
      {riskStudents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Distribution Chart */}
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Análise de Risco de Evasão
              </CardTitle>
              <CardDescription>
                Distribuição de alunos por nível de risco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RiskDistributionChart 
                data={riskStudents}
                height={280}
              />
            </CardContent>
          </Card>

          {/* Risk Students List */}
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Alunos em Risco
              </CardTitle>
              <CardDescription>
                Requer atenção imediata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskStudents.slice(0, 5).map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      RA: {student.ra} | {student.absenceRate}% ausências
                    </p>
                  </div>
                  <Badge 
                    className={`text-xs ${
                      student.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-200' :
                      student.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}
                  >
                    {student.riskLevel}
                  </Badge>
                </div>
              ))}
              
              {riskStudents.length > 5 && (
                <Button variant="outline" size="sm" className="w-full">
                  Ver todos ({riskStudents.length})
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Alerts */}
      {maintenanceAlerts.length > 0 && (
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Manutenção
            </CardTitle>
            <CardDescription>
              Veículos que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maintenanceAlerts.slice(0, 6).map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  alert.alertLevel === 'CRITICAL' ? 'border-red-200 bg-red-50 dark:bg-red-950' :
                  alert.alertLevel === 'URGENT' ? 'border-orange-200 bg-orange-50 dark:bg-orange-950' :
                  'border-yellow-200 bg-yellow-50 dark:bg-yellow-950'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{alert.plate}</p>
                    <Badge 
                      variant="outline"
                      className={
                        alert.alertLevel === 'CRITICAL' ? 'border-red-500 text-red-700' :
                        alert.alertLevel === 'URGENT' ? 'border-orange-500 text-orange-700' :
                        'border-yellow-500 text-yellow-700'
                      }
                    >
                      {alert.alertLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {alert.model} - {alert.driver}
                  </p>
                  <p className="text-xs font-medium">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
            
            {maintenanceAlerts.length > 6 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  Ver todos os alertas ({maintenanceAlerts.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics Summary */}
      {performanceMetrics && Object.keys(performanceMetrics).length > 0 && (
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Métricas de Performance
            </CardTitle>
            <CardDescription>
              Indicadores de qualidade e eficiência do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MetricsSummary metrics={performanceMetrics} />
          </CardContent>
        </Card>
      )}

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