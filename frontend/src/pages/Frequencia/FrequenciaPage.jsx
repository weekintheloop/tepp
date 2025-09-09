import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  Search, 
  Plus, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/loading-spinner';

const FrequenciaPage = () => {
  const [frequencias, setFrequencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchFrequencias();
  }, []);

  const fetchFrequencias = async () => {
    try {
      setLoading(true);
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockFrequencias = [
        {
          id: '1',
          rota: 'Rota Centro-Norte',
          data: '2024-01-15',
          turno: 'manha',
          totalAlunos: 15,
          totalPresentes: 13,
          totalAusentes: 2,
          monitor: 'Ana Silva',
          status: 'concluida'
        }
      ];
      
      setFrequencias(mockFrequencias);
      success('Dados carregados', 'Lista de frequências atualizada');
    } catch (err) {
      console.error('Error fetching frequencias:', err);
      error('Erro', 'Não foi possível carregar as frequências');
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
            <Users className="w-8 h-8 text-blue-600" />
            Controle de Frequência
          </h1>
          <p className="text-muted-foreground">
            Gerencie a frequência dos alunos no transporte escolar
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Frequência
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por rota, data ou monitor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {frequencias.map((freq) => (
          <Card key={freq.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{freq.rota}</h3>
                    <Badge variant="default">Concluída</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(freq.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Turno: {freq.turno}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Presentes: {freq.totalPresentes}
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Ausentes: {freq.totalAusentes}
                    </div>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Monitor:</span> {freq.monitor}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
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

export default FrequenciaPage;