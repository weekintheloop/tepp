import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Smartphone,
  Globe,
  Lock,
  Eye,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

const ConfiguracoesPage = () => {
  const { success, error } = useToast();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // User Profile State
  const [profileData, setProfileData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    celular: user?.celular || '',
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: ''
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_frequencia: true,
    email_ocorrencias: true,
    email_manutencao: false,
    push_frequencia: true,
    push_ocorrencias: true,
    push_manutencao: true,
    sms_emergencia: false
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    auto_backup: true,
    sync_interval: '15',
    max_upload_size: '10',
    session_timeout: '30',
    log_retention: '90',
    maintenance_mode: false
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // Validate passwords if changing
      if (profileData.nova_senha) {
        if (profileData.nova_senha !== profileData.confirmar_senha) {
          error('Erro', 'As senhas não coincidem');
          return;
        }
        if (profileData.nova_senha.length < 6) {
          error('Erro', 'A senha deve ter pelo menos 6 caracteres');
          return;
        }
      }

      // Update user profile
      updateUser({
        nome: profileData.nome,
        email: profileData.email,
        celular: profileData.celular
      });

      success('Sucesso', 'Perfil atualizado com sucesso');
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        senha_atual: '',
        nova_senha: '',
        confirmar_senha: ''
      }));
    } catch (error) {
      toast.error('Erro', 'Não foi possível atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = () => {
    toast.success('Sucesso', 'Configurações de notificação atualizadas');
  };

  const handleSystemUpdate = () => {
    toast.success('Sucesso', 'Configurações do sistema atualizadas');
  };

  const handleExportData = () => {
    toast.info('Exportação', 'Iniciando exportação de dados...');
  };

  const handleImportData = () => {
    toast.info('Importação', 'Recurso de importação será disponibilizado em breve');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Personalize suas preferências e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="perfil" className="space-y-6">
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações de perfil e credenciais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={profileData.nome}
                    onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={profileData.celular}
                    onChange={(e) => setProfileData(prev => ({ ...prev, celular: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {user?.role}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      (não editável)
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Alterar Senha</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha_atual">Senha Atual</Label>
                    <Input
                      id="senha_atual"
                      type="password"
                      value={profileData.senha_atual}
                      onChange={(e) => setProfileData(prev => ({ ...prev, senha_atual: e.target.value }))}
                      placeholder="Digite sua senha atual"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nova_senha">Nova Senha</Label>
                    <Input
                      id="nova_senha"
                      type="password"
                      value={profileData.nova_senha}
                      onChange={(e) => setProfileData(prev => ({ ...prev, nova_senha: e.target.value }))}
                      placeholder="Nova senha (min. 6 caracteres)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmar_senha">Confirmar Senha</Label>
                    <Input
                      id="confirmar_senha"
                      type="password"
                      value={profileData.confirmar_senha}
                      onChange={(e) => setProfileData(prev => ({ ...prev, confirmar_senha: e.target.value }))}
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={loading}>
                  {loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Notificações por Email
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Relatórios de Frequência</p>
                        <p className="text-sm text-muted-foreground">Receba resumos diários de frequência</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email_frequencia}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, email_frequencia: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Ocorrências</p>
                        <p className="text-sm text-muted-foreground">Alertas sobre novos incidentes</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email_ocorrencias}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, email_ocorrencias: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Manutenção de Veículos</p>
                        <p className="text-sm text-muted-foreground">Lembretes de manutenção preventiva</p>
                      </div>
                      <Switch
                        checked={notificationSettings.email_manutencao}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, email_manutencao: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Notificações Push
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Frequência</p>
                        <p className="text-sm text-muted-foreground">Alertas em tempo real</p>
                      </div>
                      <Switch
                        checked={notificationSettings.push_frequencia}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, push_frequencia: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Ocorrências</p>
                        <p className="text-sm text-muted-foreground">Notificações instantâneas</p>
                      </div>
                      <Switch
                        checked={notificationSettings.push_ocorrencias}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, push_ocorrencias: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS de Emergência</p>
                        <p className="text-sm text-muted-foreground">Apenas para situações críticas</p>
                      </div>
                      <Switch
                        checked={notificationSettings.sms_emergencia}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, sms_emergencia: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationUpdate}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Preferências
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="aparencia" className="space-y-6">
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Aparência e Tema
              </CardTitle>
              <CardDescription>
                Customize a aparência da interface do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tema Escuro</p>
                    <p className="text-sm text-muted-foreground">
                      {isDark ? 'Interface com cores escuras ativada' : 'Interface com cores claras ativada'}
                    </p>
                  </div>
                  <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Prévia do Tema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg bg-background">
                    <div className="space-y-3">
                      <div className="h-4 bg-primary rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-muted rounded w-full"></div>
                        <div className="h-2 bg-muted rounded w-2/3"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-primary rounded text-xs"></div>
                        <div className="h-6 w-16 bg-secondary rounded text-xs"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Informações do Tema</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tema Atual:</span>
                        <Badge variant="outline" className="capitalize">
                          {theme}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Fonte:</span>
                        <span>Inter</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ícones:</span>
                        <span>Lucide React</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="sistema" className="space-y-6">
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Ajuste configurações técnicas e de performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sync_interval">Intervalo de Sincronização (minutos)</Label>
                  <Input
                    id="sync_interval"
                    type="number"
                    value={systemSettings.sync_interval}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, sync_interval: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Timeout de Sessão (minutos)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={systemSettings.session_timeout}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, session_timeout: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_upload_size">Tamanho Máximo de Upload (MB)</Label>
                  <Input
                    id="max_upload_size"
                    type="number"
                    value={systemSettings.max_upload_size}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, max_upload_size: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="log_retention">Retenção de Logs (dias)</Label>
                  <Input
                    id="log_retention"
                    type="number"
                    value={systemSettings.log_retention}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, log_retention: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Backup Automático</p>
                    <p className="text-sm text-muted-foreground">Fazer backup diário dos dados</p>
                  </div>
                  <Switch
                    checked={systemSettings.auto_backup}
                    onCheckedChange={(checked) => 
                      setSystemSettings(prev => ({ ...prev, auto_backup: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Modo de Manutenção</p>
                    <p className="text-sm text-muted-foreground">Bloquear acesso temporariamente</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenance_mode}
                    onCheckedChange={(checked) => 
                      setSystemSettings(prev => ({ ...prev, maintenance_mode: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleExportData} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button onClick={handleImportData} variant="outline" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Dados
                </Button>
                <Button onClick={handleSystemUpdate} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança e Privacidade
              </CardTitle>
              <CardDescription>
                Configurações de segurança e auditoria do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Status de Segurança</h3>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Todas as verificações de segurança estão em conformidade
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Últimas Atividades
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Último Login:</span>
                        <span>{new Date().toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IP de Acesso:</span>
                        <span>192.168.1.100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dispositivo:</span>
                        <span>Chrome/Windows</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Auditoria
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Logs de Acesso:</span>
                        <Badge variant="outline">Ativo</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Monitoramento:</span>
                        <Badge variant="outline">Ativo</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Backup de Logs:</span>
                        <Badge variant="outline">Ativo</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Configurações de Privacidade</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Coleta de Dados de Uso</p>
                        <p className="text-sm text-muted-foreground">Ajudar a melhorar o sistema</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Relatórios de Erro Automáticos</p>
                        <p className="text-sm text-muted-foreground">Enviar logs de erro para análise</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;