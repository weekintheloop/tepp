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
  School,
  MapPin,
  Phone,
  Mail,
  Users,
  Clock,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EscolasPage = () => {
  const { toast } = useToast();
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEscolas();
  }, []);

  const fetchEscolas = async () => {
    try {
      const response = await axios.get(`${API}/escolas`);
      setEscolas(response.data);
    } catch (error) {
      console.error('Error fetching escolas:', error);
      toast.error('Erro', 'Não foi possível carregar as escolas');
    } finally {
      setLoading(false);
    }
  };

  const filteredEscolas = escolas.filter(escola =>
    escola.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    escola.bairro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTurnoBadges = (turnos) => {
    const turnoMap = {
      manha: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Manhã' },
      tarde: { color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'Tarde' },
      noite: { color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Noite' }
    };

    return turnos?.map(turno => {
      const config = turnoMap[turno] || turnoMap.manha;
      return (
        <Badge key={turno} variant="outline" className={`${config.color} text-xs`}>
          {config.label}
        </Badge>
      );
    });
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
            <School className="w-8 h-8 text-primary" />
            Gestão de Escolas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie informações das escolas atendidas pelo sistema
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nova Escola
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Escolas</p>
                <p className="text-2xl font-bold">{escolas.length}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <School className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capacidade Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {escolas.reduce((acc, escola) => acc + (escola.capacidade_total || 0), 0)}
                </p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bairros Atendidos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(escolas.map(e => e.bairro)).size}
                </p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
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
              placeholder="Buscar por nome da escola ou bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEscolas.map((escola) => (
          <Card key={escola.id} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <School className="w-5 h-5 text-primary" />
                    {escola.nome}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {escola.bairro}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Endereço */}
              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-sm font-medium mb-1">Endereço</p>
                <p className="text-sm text-muted-foreground">{escola.endereco}</p>
                <p className="text-sm text-muted-foreground">CEP: {escola.cep}</p>
              </div>

              {/* Informações */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Capacidade</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {escola.capacidade_total || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Diretor</p>
                  <p className="font-semibold">{escola.diretor || 'Não informado'}</p>
                </div>
              </div>

              {/* Turnos */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Turnos de Funcionamento</p>
                <div className="flex flex-wrap gap-1">
                  {getTurnoBadges(escola.turno)}
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-2">
                {escola.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{escola.telefone}</span>
                  </div>
                )}
                {escola.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{escola.email}</span>
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
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEscolas.length === 0 && (
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">Nenhuma escola encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar a busca ou cadastre uma nova escola
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EscolasPage;