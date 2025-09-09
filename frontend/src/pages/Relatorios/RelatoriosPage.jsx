import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import {
  BarChart3,
  FileText,
  Download,
  Calendar as CalendarIcon,
  Users,
  Bus,
  TrendingUp,
  PieChart,
  Activity,
  Clock,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RelatoriosPage = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 0, 1),
    to: new Date()
  });

  const relatoriosDisponiveis = [
    {
      id: 'frequencia',
      title: 'Relatório de Frequência',
      description: 'Análise detalhada da presença dos alunos por período',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      stats: { total: '1,247', percentage: '87.5%' },
      tags: ['Mensal', 'Semanal', 'Diário']
    },
    {
      id: 'rotas',
      title: 'Eficiência de Rotas',
      description: 'Performance e otimização das rotas de transporte',
      icon: MapPin,
      color: 'text-green-600 bg-green-50 border-green-200',
      stats: { total: '23', percentage: '94.2%' },
      tags: ['Otimização', 'Tempo', 'Combustível']
    },
    {
      id: 'veiculos',
      title: 'Gestão de Frota',
      description: 'Status, manutenção e utilização dos veículos',
      icon: Bus,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      stats: { total: '45', percentage: '78.2%' },
      tags: ['Manutenção', 'Utilização', 'Custos']
    },
    {
      id: 'ocorrencias',
      title: 'Análise de Ocorrências',
      description: 'Incidentes, resolução e estatísticas de problemas',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50 border-red-200',
      stats: { total: '12', percentage: '8.3%' },
      tags: ['Incidentes', 'Resolução', 'Prevenção']
    },
    {
      id: 'dashboard',
      title: 'Dashboard Executivo',
      description: 'Visão geral completa com KPIs e métricas principais',
      icon: BarChart3,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      stats: { total: 'Multi', percentage: '100%' },
      tags: ['KPIs', 'Métricas', 'Visão Geral']
    },
    {
      id: 'performance',
      title: 'Performance do Sistema',
      description: 'Análise de desempenho e tempo de resposta',
      icon: Activity,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      stats: { total: '99.9%', percentage: 'Uptime' },
      tags: ['Performance', 'Uptime', 'Latência']
    }
  ];

  const relatoriosRapidos = [
    {
      title: 'Frequência Hoje',
      description: 'Resumo da frequência do dia atual',
      icon: Users,
      color: 'bg-blue-500',
      action: 'Gerar PDF'
    },
    {
      title: 'Rotas Ativas',
      description: 'Lista de todas as rotas em operação',
      icon: MapPin,
      color: 'bg-green-500',
      action: 'Exportar Excel'
    },
    {
      title: 'Manutenções Pendentes',
      description: 'Veículos que precisam de manutenção',
      icon: Bus,
      color: 'bg-orange-500',
      action: 'Gerar Lista'
    },
    {
      title: 'Ocorrências Abertas',
      description: 'Incidentes que precisam de resolução',
      icon: AlertTriangle,
      color: 'bg-red-500',
      action: 'Ver Detalhes'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Relatórios e Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Gere relatórios detalhados e análises do sistema de transporte
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Período
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Quick Reports */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Relatórios Rápidos
          </CardTitle>
          <CardDescription>
            Gere relatórios instantâneos com dados atualizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatoriosRapidos.map((relatorio, index) => {
              const Icon = relatorio.icon;
              return (
                <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${relatorio.color} rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{relatorio.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {relatorio.description}
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Download className="w-3 h-3 mr-2" />
                    {relatorio.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatoriosDisponiveis.map((relatorio) => {
          const Icon = relatorio.icon;
          return (
            <Card key={relatorio.id} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${relatorio.color}`}>
                      <Icon className="w-6 h-6 text-current" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{relatorio.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {relatorio.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{relatorio.stats.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Taxa</p>
                    <p className="text-2xl font-bold text-primary">{relatorio.stats.percentage}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {relatorio.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar PDF
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendências do Mês
            </CardTitle>
            <CardDescription>
              Principais métricas e variações mensais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Taxa de Frequência</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">+2.3%</p>
                  <p className="text-xs text-muted-foreground">87.5% média</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Eficiência de Rotas</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">+1.8%</p>
                  <p className="text-xs text-muted-foreground">94.2% média</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Ocorrências</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">-15%</p>
                  <p className="text-xs text-muted-foreground">8.3% do total</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium">Utilização da Frota</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-600">+0.5%</p>
                  <p className="text-xs text-muted-foreground">78.2% média</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Distribuição por Categoria
            </CardTitle>
            <CardDescription>
              Breakdown dos principais indicadores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Alunos por Turno</span>
                  <span className="text-sm text-muted-foreground">1,247 total</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">45%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">35%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">20%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Manhã</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Tarde</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Noite</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Status das Rotas</span>
                  <span className="text-sm text-muted-foreground">23 total</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">87%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '9%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">9%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '4%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">4%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Ativas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Manutenção</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Inativas</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosPage;