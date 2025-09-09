import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import LoadingSpinner from '../../components/ui/loading-spinner';
import {
  Search,
  Plus,
  MapPin,
  Clock,
  Users,
  Bus,
  Navigation,
  Edit,
  Trash2,
  Eye,
  Route
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RotasPage = () => {
  const { toast } = useToast();
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');

  useEffect(() => {
    fetchRotas();
  }, []);

  const fetchRotas = async () => {
    try {
      const response = await axios.get(`${API}/rotas`);
      setRotas(response.data);
    } catch (error) {
      console.error('Error fetching rotas:', error);
      toast.error('Erro', 'Não foi possível carregar as rotas');
    } finally {
      setLoading(false);
    }
  };

  const filteredRotas = rotas.filter(rota => {
    const matchesSearch = rota.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurno = !selectedTurno || rota.turno === selectedTurno;
    return matchesSearch && matchesTurno;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      ativo: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Ativa' },
      inativo: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Inativa' },
      pendente: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Pendente' }
    };
    
    const config = statusMap[status] || statusMap.ativo;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTurnoBadge = (turno) => {
    const turnoMap = {
      manha: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Manhã' },
      tarde: { color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'Tarde' },
      noite: { color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Noite' }
    };
    
    const config = turnoMap[turno] || turnoMap.manha;
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getOccupancyColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
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
            <Route className="w-8 h-8 text-primary" />
            Gestão de Rotas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie rotas de transporte escolar e otimize trajetos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Navigation className="w-4 h-4 mr-2" />
            Otimizar Rotas
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Rota
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Rotas</p>
                <p className="text-2xl font-bold">{rotas.length}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Route className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rotas Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {rotas.filter(r => r.status === 'ativo').length}
                </p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ocupação Média</p>
                <p className="text-2xl font-bold text-orange-600">
                  {rotas.length > 0 
                    ? Math.round(rotas.reduce((acc, r) => acc + (r.vagas_ocupadas / r.capacidade_maxima * 100), 0) / rotas.length)
                    : 0}%
                </p>
              </div>
              <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Distância Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {rotas.reduce((acc, r) => acc + (r.distancia_km || 0), 0).toFixed(1)} km
                </p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Navigation className="w-6 h-6 text-purple-600" />
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
                placeholder="Buscar por nome da rota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedTurno}
              onChange={(e) => setSelectedTurno(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="">Todos os turnos</option>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRotas.map((rota) => {
          const occupancyPercentage = Math.round((rota.vagas_ocupadas / rota.capacidade_maxima) * 100);
          
          return (
            <Card key={rota.id} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {rota.nome}
                  </CardTitle>
                  {getStatusBadge(rota.status)}
                </div>
                <CardDescription className="flex items-center gap-4">
                  {getTurnoBadge(rota.turno)}
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4" />
                    {rota.horario_saida} - {rota.horario_chegada_escola}
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Ocupação */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Ocupação</span>
                    <span className={`text-sm font-semibold ${getOccupancyColor(occupancyPercentage)}`}>
                      {rota.vagas_ocupadas}/{rota.capacidade_maxima} ({occupancyPercentage}%)
                    </span>
                  </div>
                  <Progress value={occupancyPercentage} className="h-2" />
                </div>

                {/* Informações da Rota */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Distância</p>
                    <p className="font-semibold">
                      {rota.distancia_km ? `${rota.distancia_km} km` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tempo Estimado</p>
                    <p className="font-semibold">
                      {rota.tempo_estimado_minutos ? `${rota.tempo_estimado_minutos} min` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Paradas</p>
                    <p className="font-semibold">{rota.pontos_parada?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monitor</p>
                    <p className="font-semibold">
                      {rota.monitor_id ? 'Atribuído' : 'Não atribuído'}
                    </p>
                  </div>
                </div>

                {/* Veículo */}
                {rota.veiculo_id && (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <Bus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Veículo: {rota.veiculo_id}</span>
                  </div>
                )}

                {/* Observações */}
                {rota.observacoes && (
                  <div className="p-2 bg-muted/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Observações:</p>
                    <p className="text-sm">{rota.observacoes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRotas.length === 0 && (
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">Nenhuma rota encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar os filtros ou cadastre uma nova rota
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RotasPage;