import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import LoadingSpinner from '../../components/ui/loading-spinner';
import {
  Search,
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  GraduationCap,
  User,
  MapPin,
  Phone,
  Calendar
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AlunosPage = () => {
  const { toast } = useToast();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const response = await axios.get(`${API}/alunos`);
      setAlunos(response.data);
    } catch (error) {
      console.error('Error fetching alunos:', error);
      toast.error('Erro', 'Não foi possível carregar os alunos');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlunos = alunos.filter(aluno => {
    const matchesSearch = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aluno.ra.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurno = !selectedTurno || aluno.turno === selectedTurno;
    const matchesStatus = !selectedStatus || aluno.status === selectedStatus;
    
    return matchesSearch && matchesTurno && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      ativo: { variant: 'default', color: 'text-green-600 bg-green-50 border-green-200' },
      inativo: { variant: 'secondary', color: 'text-red-600 bg-red-50 border-red-200' },
      pendente: { variant: 'outline', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    };
    
    const config = statusMap[status] || statusMap.ativo;
    
    return (
      <Badge className={config.color}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
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

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    
    return age;
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
            <GraduationCap className="w-8 h-8 text-primary" />
            Gestão de Alunos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie informações dos alunos e seus responsáveis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                <DialogDescription>
                  Preencha as informações do aluno e seus responsáveis
                </DialogDescription>
              </DialogHeader>
              {/* Form content would go here */}
              <div className="p-4 text-center text-muted-foreground">
                Formulário de cadastro será implementado aqui
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Alunos</p>
                <p className="text-2xl font-bold">{alunos.length}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alunos Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {alunos.filter(a => a.status === 'ativo').length}
                </p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Acompanhante</p>
                <p className="text-2xl font-bold text-orange-600">
                  {alunos.filter(a => a.tem_acompanhante).length}
                </p>
              </div>
              <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <User className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Necessidades Especiais</p>
                <p className="text-2xl font-bold text-purple-600">
                  {alunos.filter(a => a.tem_necessidades_especiais).length}
                </p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou RA..."
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
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            {filteredAlunos.length} aluno(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Aluno</TableHead>
                  <TableHead>RA</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Série/Ano</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlunos.map((aluno) => (
                  <TableRow key={aluno.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{aluno.nome}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {aluno.tem_acompanhante && (
                              <Badge variant="outline" className="text-xs">
                                Acompanhante
                              </Badge>
                            )}
                            {aluno.tem_necessidades_especiais && (
                              <Badge variant="secondary" className="text-xs">
                                Necessidades Especiais
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{aluno.ra}</TableCell>
                    <TableCell>{calculateAge(aluno.data_nascimento)} anos</TableCell>
                    <TableCell>{aluno.serie_ano}</TableCell>
                    <TableCell>{getTurnoBadge(aluno.turno)}</TableCell>
                    <TableCell>
                      {aluno.rota_id ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Rota {aluno.rota_id}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não atribuída</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {aluno.responsaveis && aluno.responsaveis.length > 0 ? (
                        <div>
                          <p className="font-medium text-sm">{aluno.responsaveis[0].nome}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {aluno.responsaveis[0].celular}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(aluno.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredAlunos.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">Nenhum aluno encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os filtros ou cadastre um novo aluno
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlunosPage;