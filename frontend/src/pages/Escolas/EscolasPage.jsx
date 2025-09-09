import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  School, 
  Search, 
  Plus, 
  MapPin,
  Phone,
  Mail,
  Users
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/loading-spinner';

const EscolasPage = () => {
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchEscolas();
  }, []);

  const fetchEscolas = async () => {
    try {
      setLoading(true);
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEscolas = [
        {
          id: '1',
          nome: 'Escola Municipal João da Silva',
          endereco: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'Brasília',
          cep: '70000-000',
          telefone: '(61) 3333-1111',
          email: 'joao.silva@edu.df.gov.br',
          diretor: 'Maria Santos',
          capacidadeTotal: 500,
          turno: ['manha', 'tarde']
        }
      ];
      
      setEscolas(mockEscolas);
      success('Dados carregados', 'Lista de escolas atualizada');
    } catch (err) {
      console.error('Error fetching escolas:', err);
      error('Erro', 'Não foi possível carregar as escolas');
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
            <School className="w-8 h-8 text-green-600" />
            Gestão de Escolas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as escolas atendidas pelo transporte escolar
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Escola
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, bairro ou diretor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {escolas.map((escola) => (
          <Card key={escola.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{escola.nome}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {escola.endereco}, {escola.bairro}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {escola.telefone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {escola.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Capacidade: {escola.capacidadeTotal} alunos
                    </div>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Diretor:</span> {escola.diretor}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    Detalhes
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

export default EscolasPage;