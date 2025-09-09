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
  GraduationCap,
  MapPin,
  Phone,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/loading-spinner';

const AlunosPage = () => {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockAlunos = [
        {
          id: '1',
          nome: 'Ana Silva Santos',
          ra: '2024001',
          escola: 'Escola Municipal João da Silva',
          rota: 'Rota Centro-Norte',
          turno: 'manha',
          serie: '5º Ano',
          responsavel: 'Maria Santos',
          telefone: '(61) 99999-1111',
          status: 'ativo',
          necessidadesEspeciais: false
        },
        {
          id: '2',
          nome: 'Carlos Eduardo Lima',
          ra: '2024002',
          escola: 'Escola Municipal Maria Oliveira',
          rota: 'Rota Sul-Leste',
          turno: 'tarde',
          serie: '3º Ano',
          responsavel: 'João Lima',
          telefone: '(61) 99999-2222',
          status: 'ativo',
          necessidadesEspeciais: true
        }
      ];
      
      setAlunos(mockAlunos);
      success('Dados carregados', 'Lista de alunos atualizada com sucesso');
    } catch (err) {
      console.error('Error fetching alunos:', err);
      error('Erro', 'Não foi possível carregar os alunos');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlunos = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.ra.includes(searchTerm) ||
    aluno.escola.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const variants = {
      ativo: 'default',
      inativo: 'secondary',
      pendente: 'outline'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTurnoBadge = (turno) => {
    const colors = {
      manha: 'bg-blue-100 text-blue-800',
      tarde: 'bg-orange-100 text-orange-800',
      noite: 'bg-purple-100 text-purple-800'
    };
    return (
      <Badge className={colors[turno] || 'bg-gray-100 text-gray-800'}>
        {turno.charAt(0).toUpperCase() + turno.slice(1)}
      </Badge>
    );
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Gestão de Alunos
          </h1>
          <p className="text-muted-foreground">
            Gerencie informações dos alunos do transporte escolar
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Aluno
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, RA ou escola..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Alunos</p>
                <p className="text-2xl font-bold">{alunos.length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alunos Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {alunos.filter(a => a.status === 'ativo').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Necessidades Especiais</p>
                <p className="text-2xl font-bold text-orange-600">
                  {alunos.filter(a => a.necessidadesEspeciais).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Turno Manhã</p>
                <p className="text-2xl font-bold text-blue-600">
                  {alunos.filter(a => a.turno === 'manha').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alunos List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            {filteredAlunos.length} aluno(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlunos.map((aluno) => (
              <div
                key={aluno.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{aluno.nome}</h3>
                    {getStatusBadge(aluno.status)}
                    {getTurnoBadge(aluno.turno)}
                    {aluno.necessidadesEspeciais && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Necessidades Especiais
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      RA: {aluno.ra} - {aluno.serie}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {aluno.escola}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {aluno.responsavel} - {aluno.telefone}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Rota:</span> {aluno.rota}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}

            {filteredAlunos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum aluno encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlunosPage;