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
  Bus,
  User,
  Phone,
  Calendar,
  Wrench,
  Edit,
  Trash2,
  Eye,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VeiculosPage = () => {
  const { toast } = useToast();
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    try {
      const response = await axios.get(`${API}/veiculos`);
      setVeiculos(response.data);
    } catch (error) {
      console.error('Error fetching veiculos:', error);
      toast.error('Erro', 'Não foi possível carregar os veículos');
    } finally {
      setLoading(false);
    }
  };

  const filteredVeiculos = veiculos.filter(veiculo =>
    veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.motorista.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusMap = {
      ativo: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Ativo' },
      inativo: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Inativo' },
      manutencao: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Manutenção' }
    };
    
    const config = statusMap[status] || statusMap.ativo;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const needsMaintenance = (veiculo) => {
    if (!veiculo.proxima_manutencao) return false;
    const today = new Date();
    const maintenanceDate = new Date(veiculo.proxima_manutencao);
    const daysRemaining = Math.ceil((maintenanceDate - today) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 7;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
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
            <Bus className="w-8 h-8 text-primary" />
            Gestão de Veículos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a frota de veículos e cronograma de manutenção
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Novo Veículo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Veículos</p>
                <p className="text-2xl font-bold">{veiculos.length}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Veículos Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {veiculos.filter(v => v.status === 'ativo').length}
                </p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <Bus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Manutenção</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {veiculos.filter(v => v.status === 'manutencao').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <Wrench className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capacidade Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {veiculos.reduce((acc, v) => acc + (v.capacidade || 0), 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, modelo ou motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVeiculos.map((veiculo) => (
          <Card key={veiculo.id} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm card-hover relative">
            {/* Maintenance Alert */}
            {needsMaintenance(veiculo) && (
              <div className="absolute top-3 right-3">
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Manutenção Próxima
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bus className="w-5 h-5 text-primary" />
                {veiculo.placa}
              </CardTitle>
              <CardDescription>
                {veiculo.marca} {veiculo.modelo} ({veiculo.ano})
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex justify-between items-center">
                {getStatusBadge(veiculo.status)}
                <span className="text-sm text-muted-foreground">
                  Capacidade: {veiculo.capacidade} passageiros
                </span>
              </div>

              {/* Motorista */}
              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Motorista
                </p>
                <p className="font-semibold">{veiculo.motorista}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Phone className="w-3 h-3" />
                  {veiculo.celular_motorista}
                </div>
              </div>

              {/* Manutenção */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Última Manutenção</span>
                  <span className="font-medium">
                    {formatDate(veiculo.ultima_manutencao)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Próxima Manutenção</span>
                  <span className={`font-medium ${needsMaintenance(veiculo) ? 'text-red-600' : ''}`}>
                    {formatDate(veiculo.proxima_manutencao)}
                  </span>
                </div>
                {veiculo.km_atual && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">KM Atual</span>
                    <span className="font-medium">{veiculo.km_atual.toLocaleString()} km</span>
                  </div>
                )}
              </div>

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
                  <Button variant="ghost" size="sm">
                    <Wrench className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVeiculos.length === 0 && (
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <Bus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">Nenhum veículo encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar a busca ou cadastre um novo veículo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VeiculosPage;