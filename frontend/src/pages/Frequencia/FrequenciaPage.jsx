import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import LoadingSpinner from '../../components/ui/loading-spinner';
import {
  Search,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  UserCheck,
  UserX,
  Download,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FrequenciaPage = () => {
  const { toast } = useToast();
  const [frequencias, setFrequencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFrequencias();
  }, [selectedDate]);

  const fetchFrequencias = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await axios.get(`${API}/frequencias?data_inicio=${dateStr}&data_fim=${dateStr}`);
      setFrequencias(response.data);
    } catch (error) {
      console.error('Error fetching frequencias:', error);
      toast.error('Erro', 'Não foi possível carregar as frequências');
    } finally {
      setLoading(false);
    }
  };

  const filteredFrequencias = frequencias.filter(freq =>
    freq.rota_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getAttendanceRate = (freq) => {
    if (freq.total_alunos === 0) return 0;
    return Math.round((freq.total_presentes / freq.total_alunos) * 100);
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalStats = filteredFrequencias.reduce((acc, freq) => ({
    total_alunos: acc.total_alunos + freq.total_alunos,
    total_presentes: acc.total_presentes + freq.total_presentes,
    total_ausentes: acc.total_ausentes + freq.total_ausentes
  }), { total_alunos: 0, total_presentes: 0, total_ausentes: 0 });

  const globalAttendanceRate = totalStats.total_alunos > 0 
    ? Math.round((totalStats.total_presentes / totalStats.total_alunos) * 100)
    : 0;

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
            <Users className="w-8 h-8 text-primary" />
            Controle de Frequência
          </h1>
          <p className="text-muted-foreground mt-1">
            Registre e monitore a presença dos alunos nas rotas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Frequência
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Alunos</p>
                <p className="text-2xl font-bold">{totalStats.total_alunos}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Presentes</p>
                <p className="text-2xl font-bold text-green-600">{totalStats.total_presentes}</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ausentes</p>
                <p className="text-2xl font-bold text-red-600">{totalStats.total_ausentes}</p>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Presença</p>
                <p className={`text-2xl font-bold ${getAttendanceColor(globalAttendanceRate)}`}>
                  {globalAttendanceRate}%
                </p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
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
                placeholder="Buscar por rota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFrequencias.map((freq) => {
          const attendanceRate = getAttendanceRate(freq);
          
          return (
            <Card key={freq.id} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Rota {freq.rota_id}
                  </CardTitle>
                  {getTurnoBadge(freq.turno)}
                </div>
                <CardDescription className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(new Date(freq.data), 'dd/MM/yyyy', { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Attendance Summary */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{freq.total_alunos}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{freq.total_presentes}</p>
                    <p className="text-xs text-muted-foreground">Presentes</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{freq.total_ausentes}</p>
                    <p className="text-xs text-muted-foreground">Ausentes</p>
                  </div>
                </div>

                {/* Attendance Rate */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Taxa de Presença</p>
                  <p className={`text-3xl font-bold ${getAttendanceColor(attendanceRate)}`}>
                    {attendanceRate}%
                  </p>
                </div>

                {/* Monitor Info */}
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="text-sm font-medium mb-1">Monitor Responsável</p>
                  <p className="text-sm text-muted-foreground">ID: {freq.monitor_id}</p>
                </div>

                {/* Observations */}
                {freq.observacoes_gerais && (
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm font-medium mb-1">Observações</p>
                    <p className="text-sm text-muted-foreground">{freq.observacoes_gerais}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={attendanceRate >= 90 ? 'text-green-600 border-green-200' : 
                                attendanceRate >= 70 ? 'text-yellow-600 border-yellow-200' : 
                                'text-red-600 border-red-200'}
                    >
                      {attendanceRate >= 90 ? 'Excelente' : 
                       attendanceRate >= 70 ? 'Boa' : 'Baixa'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFrequencias.length === 0 && (
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              Nenhuma frequência encontrada
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Não há registros de frequência para a data selecionada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FrequenciaPage;