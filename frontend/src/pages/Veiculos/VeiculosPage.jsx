import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Bus, 
  Search, 
  Plus, 
  Wrench,
  Calendar,
  User,
  Phone
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/loading-spinner';

const VeiculosPage = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    try {
      setLoading(true);
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockVeiculos = [
        {
          id: '1',
          placa: 'ABC-1234',
          modelo: 'Mercedes-Benz Sprinter',
          marca: 'Mercedes-Benz',
          ano: 2022,
          capacidade: 20,
          motorista: 'João Silva',
          celularMotorista: '(61) 99999-1111',
          status: 'ativo',
          ultimaManutencao: '2024-01-15',
          proximaManutencao: '2024-04-15',
          kmAtual: 45000
        }
      ];
      
      setVeiculos(mockVeiculos);
      success('Dados carregados', 'Lista de veículos atualizada');
    } catch (err) {
      console.error('Error fetching veiculos:', err);
      error('Erro', 'Não foi possível carregar os veículos');
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
            <Bus className="w-8 h-8 text-orange-600" />
            Gestão de Veículos
          </h1>
          <p className="text-muted-foreground">
            Gerencie a frota de veículos do transporte escolar
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Veículo
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
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

      <div className="grid gap-4">
        {veiculos.map((veiculo) => (
          <Card key={veiculo.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{veiculo.placa}</h3>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {veiculo.marca} {veiculo.modelo} ({veiculo.ano})
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {veiculo.motorista}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {veiculo.celularMotorista}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Wrench className="w-4 h-4" />
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

export default VeiculosPage;