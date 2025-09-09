import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/ui/loading-spinner';
import {
  Search,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Bus,
  User,
  Eye,
  Edit,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OcorrenciasPage = () => {
  const { success, error } = useToast();
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPrioridade, setSelectedPrioridade] = useState('');

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  const fetchOcorrencias = async () => {
    try {
      const response = await axios.get(`${API}/ocorrencias`);
      setOcorrencias(response.data);
    } catch (error) {
      console.error('Error fetching ocorrencias:', error);
      error('Erro', 'Não foi possível carregar as ocorrências');
    } finally {
      setLoading(false);
    }
  };

  const filteredOcorrencias = ocorrencias.filter(ocorr => {
    const matchesSearch = ocorr.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ocorr.rota_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || ocorr.status_resolucao === selectedStatus;
    const matchesPrioridade = !selectedPrioridade || ocorr.prioridade === selectedPrioridade;
    
    return matchesSearch && matchesStatus && matchesPrioridade;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      aberto: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Aberto', icon: XCircle },
      em_andamento: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Em Andamento', icon: Clock },
      resolvido: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Resolvido', icon: CheckCircle }
    };
    
    const config = statusMap[status] || statusMap.aberto;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPrioridadeBadge = (prioridade) => {
    const prioridadeMap = {
      baixa: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Baixa' },
      media: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Média' },
      alta: { color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'Alta' },
      critica: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Crítica' }
    };
    
    const config = prioridadeMap[prioridade] || prioridadeMap.media;
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTipoLabel = (tipo) => {
    const tipoMap = {
      atraso: 'Atraso',
      quebra_veiculo: 'Quebra de Veículo',
      acidente: 'Acidente',
      ausencia_monitor: 'Ausência de Monitor',
      ausencia_motorista: 'Ausência de Motorista',
      problema_rota: 'Problema na Rota',
      outros: 'Outros'
    };
    
    return tipoMap[tipo] || tipo;
  };

  const handleResolverOcorrencia = async (ocorrenciaId) => {
    try {
      await axios.put(`${API}/ocorrencias/${ocorrenciaId}/resolver`, {
        observacoes: 'Resolvido via interface web'
      });
      success('Sucesso', 'Ocorrência marcada como resolvida');
      fetchOcorrencias();
    } catch (error) {
      console.error('Error resolving ocorrencia:', error);
      error('Erro', 'Não foi possível resolver a ocorrência');
    }
  };

  const stats = {
    total: ocorrencias.length,
    abertas: ocorrencias.filter(o => o.status_resolucao === 'aberto').length,
    em_andamento: ocorrencias.filter(o => o.status_resolucao === 'em_andamento').length,
    resolvidas: ocorrencias.filter(o => o.status_resolucao === 'resolvido').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-primary" />
            Gestão de Ocorrências
          </h1>
          <p className="text-muted-foreground mt-1">
            Registre e acompanhe incidentes no transporte escolar
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nova Ocorrência
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abertas</p>
                <p className="text-2xl font-bold text-red-600">{stats.abertas}</p>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.em_andamento}</p>
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolvidas</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvidas}</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição ou rota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="">Todos os status</option>
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="resolvido">Resolvido</option>
            </select>
            
            <select
              value={selectedPrioridade}
              onChange={(e) => setSelectedPrioridade(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="">Todas as prioridades</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Occurrences List */}
      <div className="space-y-4">
        {filteredOcorrencias.map((ocorrencia) => (
          <Card key={ocorrencia.id} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{getTipoLabel(ocorrencia.tipo)}</CardTitle>
                    {getPrioridadeBadge(ocorrencia.prioridade)}
                  </div>
                  <CardDescription className="text-base">
                    {ocorrencia.descricao}
                  </CardDescription>
                </div>
                {getStatusBadge(ocorrencia.status_resolucao)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Rota</p>
                    <p className="font-semibold">{ocorrencia.rota_id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Data/Hora</p>
                    <p className="font-semibold">
                      {format(new Date(ocorrencia.data_ocorrencia), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                {ocorrencia.local && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Local</p>
                      <p className="font-semibold">{ocorrencia.local}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Info */}
              {ocorrencia.veiculo_id && (
                <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                  <Bus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Veículo: {ocorrencia.veiculo_id}</span>
                </div>
              )}

              {/* Resolution Info */}
              {ocorrencia.status_resolucao === 'resolvido' && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Resolvido</span>
                  </div>
                  {ocorrencia.data_resolucao && (
                    <p className="text-sm text-muted-foreground">
                      Resolvido em: {format(new Date(ocorrencia.data_resolucao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  )}
                  {ocorrencia.observacoes_resolucao && (
                    <p className="text-sm mt-1">{ocorrencia.observacoes_resolucao}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
                <div className="flex items-center gap-2">
                  {ocorrencia.status_resolucao !== 'resolvido' && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResolverOcorrencia(ocorrencia.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Resolver
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOcorrencias.length === 0 && (
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              Nenhuma ocorrência encontrada
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar os filtros ou registre uma nova ocorrência
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OcorrenciasPage;