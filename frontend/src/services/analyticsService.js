import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * Serviço avançado de analytics para o SIG-TE
 * Integra com os endpoints avançados do backend
 */
class AnalyticsService {
  
  /**
   * Obtém dados completos do dashboard executivo
   */
  static async getDashboardAnalytics() {
    try {
      const response = await axios.get(`${API}/analytics/dashboard`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter analytics do dashboard:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro ao carregar analytics'
      };
    }
  }

  /**
   * Obtém tendências de frequência
   */
  static async getFrequencyTrends(days = 7) {
    try {
      const response = await axios.get(`${API}/analytics/frequency-trends?days=${days}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter tendências de frequência:', error);
      return {
        success: false,
        data: { labels: [], values: [], studentCounts: [] }
      };
    }
  }

  /**
   * Obtém análise de eficiência das rotas
   */
  static async getRouteEfficiency() {
    try {
      const response = await axios.get(`${API}/analytics/route-efficiency`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter eficiência das rotas:', error);
      return {
        success: false,
        data: { labels: [], values: [], colors: [], total_routes: 0 }
      };
    }
  }

  /**
   * Obtém lista de alunos em risco
   */
  static async getRiskStudents(limit = 20) {
    try {
      const response = await axios.get(`${API}/analytics/risk-students?limit=${limit}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter alunos em risco:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  /**
   * Obtém alertas de manutenção
   */
  static async getMaintenanceAlerts() {
    try {
      const response = await axios.get(`${API}/analytics/maintenance-alerts`);
      return {
        success: true,  
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter alertas de manutenção:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  /**
   * Análise de risco para um aluno específico
   */
  static async analyzeStudentRisk(studentId, comprehensive = false) {
    try {
      const response = await axios.get(`${API}/analytics/student-risk/${studentId}?comprehensive=${comprehensive}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro na análise de risco do aluno:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro na análise de risco'
      };
    }
  }

  /**
   * Análise de risco para todos os alunos
   */
  static async analyzeAllStudentsRisk(comprehensive = false) {
    try {
      const response = await axios.get(`${API}/analytics/student-risk?comprehensive=${comprehensive}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro na análise de risco geral:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro na análise de risco'
      };
    }
  }

  /**
   * Análise de padrões de ausência
   */
  static async analyzeAbsencePatterns(studentId = null, days = 30) {
    try {
      const params = new URLSearchParams({ days: days.toString() });
      if (studentId) {
        params.append('student_id', studentId);
      }
      
      const response = await axios.post(`${API}/analytics/absence-patterns?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro na análise de padrões de ausência:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro na análise de padrões'
      };
    }
  }

  /**
   * Executa workflow de intervenção
   */
  static async runInterventionWorkflow(studentIds = null) {
    try {
      const response = await axios.post(`${API}/interventions/workflow`, {
        student_ids: studentIds
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro no workflow de intervenção:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro no workflow de intervenção'
      };
    }
  }

  /**
   * Obtém métricas de performance do sistema
   */
  static async getSystemMetrics() {
    try {
      const response = await axios.get(`${API}/system/metrics`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter métricas do sistema:', error);
      return {
        success: false,
        data: {}
      };
    }
  }

  /**
   * Verifica saúde do sistema
   */
  static async checkSystemHealth() {
    try {
      const response = await axios.get(`${API}/system/health`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao verificar saúde do sistema:', error);
      return {
        success: false,
        data: {
          status: 'unhealthy',
          error: error.message
        }
      };
    }
  }

  /**
   * Formata dados para gráficos
   */
  static formatChartData(data, type = 'line') {
    if (!data || !data.labels || !data.values) {
      return { labels: [], datasets: [] };
    }

    switch (type) {
      case 'line':
        return {
          labels: data.labels,
          datasets: [{
            label: 'Taxa de Frequência (%)',
            data: data.values,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        };

      case 'pie':
        return {
          labels: data.labels,
          datasets: [{
            data: data.values,
            backgroundColor: data.colors || [
              '#10b981',
              '#3b82f6',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        };

      case 'bar':
        return {
          labels: data.labels,
          datasets: [{
            label: 'Quantidade',
            data: data.values,
            backgroundColor: data.colors || '#3b82f6',
            borderColor: data.colors || '#1d4ed8',
            borderWidth: 1
          }]
        };

      default:
        return { labels: data.labels, datasets: [{ data: data.values }] };
    }
  }

  /**
   * Calcula estatísticas básicas
   */
  static calculateStats(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return { mean: 0, median: 0, max: 0, min: 0 };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      max: Math.max(...data),
      min: Math.min(...data),
      count: data.length
    };
  }

  /**
   * Determina cor baseada no nível de risco
   */
  static getRiskColor(riskLevel) {
    const colors = {
      'CRITICAL': '#dc2626',
      'HIGH': '#ea580c',
      'MEDIUM': '#d97706',
      'LOW': '#65a30d',
      'MINIMAL': '#16a34a'
    };
    return colors[riskLevel] || '#6b7280';
  }

  /**
   * Formata percentual
   */
  static formatPercentage(value, decimals = 1) {
    if (typeof value !== 'number') return '0%';
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Formata número com separadores
   */
  static formatNumber(value) {
    if (typeof value !== 'number') return '0';
    return value.toLocaleString('pt-BR');
  }

  /**
   * Gera relatório de tendências
   */
  static generateTrendReport(currentData, previousData) {
    if (!currentData || !previousData) {
      return { trend: 'stable', change: 0, message: 'Dados insuficientes' };
    }

    const change = ((currentData - previousData) / previousData) * 100;
    let trend = 'stable';
    let message = 'Estável';

    if (Math.abs(change) < 2) {
      trend = 'stable';
      message = 'Estável';
    } else if (change > 0) {
      trend = 'up';
      message = `+${change.toFixed(1)}%`;
    } else {
      trend = 'down';
      message = `${change.toFixed(1)}%`;
    }

    return { trend, change: Math.abs(change), message };
  }

  /**
   * Valida dados de entrada
   */
  static validateData(data, requiredFields = []) {
    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Dados inválidos'] };
    }

    const errors = [];
    requiredFields.forEach(field => {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        errors.push(`Campo obrigatório: ${field}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default AnalyticsService;