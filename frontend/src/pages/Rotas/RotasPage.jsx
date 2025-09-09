import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  MapPin, 
  Search, 
  Plus, 
  Bus,
  Clock,
  Users,
  Route
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/loading-spinner';

const RotasPage = () => {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchRotas();
  }, []);

  const fetchRotas = async () => {
    try {
      setLoading(true);
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRotas = [
        {
          id: '1',
          nome: 'Rota Centro-Norte',
          escola: 'Escola Municipal João da Silva',
          monitor: 'Ana Silva',
          veiculo: 'ABC-1234',
          turno: 'manha',
          horarioSaida: '06:30',
          horarioChegada: '07:30',
          capacidadeMaxima: 20,
          vagasOcupadas: 15,
          status: 'ativo',
          distanciaKm: 12.5,
          tempoEstimado: 60
        }
      ];
      
      setRotas(mockRotas);
      success('Dados carregados', 'Lista de rotas atualizada');
    } catch (err) {
      console.error('Error fetching rotas:', err);
      error('Erro', 'Não foi possível carregar as rotas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="w-8 h-8 text-green-600" />
            Gestão de Rotas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as rotas do transporte escolar
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Rota
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, escola ou monitor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {rotas.map((rota) => (
          <Card key={rota.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{rota.nome}</h3>
                    <Badge variant="default">Ativa</Badge>
                  </div>
                  <p className="text-muted-foreground">{rota.escola}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {rota.horarioSaida} - {rota.horarioChegada}
                    </div>
                    <div className="flex items-center gap-1">
                      <Bus className="w-4 h-4" />
                      Veículo: {rota.veiculo}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {rota.vagasOcupadas}/{rota.capacidadeMaxima} alunos
                    </div>
                    <div className="flex items-center gap-1">
                      <Route className="w-4 h-4" />
                      {rota.distanciaKm} km - {rota.tempoEstimado} min
                    </div>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Monitor:</span> {rota.monitor}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Ver Mapa
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RotasPage;