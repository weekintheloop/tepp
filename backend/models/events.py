from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import date, datetime, time
from enum import Enum
import uuid

class EventType(str, Enum):
    DIA_MOVEL = "dia_movel"
    REPOSICAO_AULA = "reposicao_aula" 
    ATIVIDADE_EXTRACURRICULAR = "atividade_extracurricular"
    FERIADO = "feriado"
    SUSPENSAO_AULAS = "suspensao_aulas"
    EVENTO_ESPECIAL = "evento_especial"

class EventStatus(str, Enum):
    PLANEJADO = "planejado"
    CONFIRMADO = "confirmado"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"

class EventPriority(str, Enum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"

class BaseEvent(BaseModel):
    """Modelo base para eventos do sistema"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    titulo: str = Field(..., min_length=3, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    tipo: EventType
    data_inicio: date
    data_fim: Optional[date] = None
    horario_inicio: Optional[time] = None
    horario_fim: Optional[time] = None
    status: EventStatus = EventStatus.PLANEJADO
    prioridade: EventPriority = EventPriority.MEDIA
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    escolas_afetadas: List[str] = []
    rotas_afetadas: List[str] = []
    observacoes: Optional[str] = None
    metadata: Dict[str, Any] = {}

    @validator('data_fim')
    def validate_data_fim(cls, v, values):
        if v and 'data_inicio' in values and v < values['data_inicio']:
            raise ValueError('Data fim deve ser maior ou igual à data início')
        return v

    @validator('horario_fim') 
    def validate_horario_fim(cls, v, values):
        if v and 'horario_inicio' in values and 'data_fim' not in values:
            # Se é o mesmo dia, horário fim deve ser maior que início
            if v <= values['horario_inicio']:
                raise ValueError('Horário fim deve ser maior que horário início')
        return v

class DiaMovel(BaseEvent):
    """Evento de dia móvel - transferência de feriado"""
    tipo: EventType = Field(default=EventType.DIA_MOVEL, const=True)
    feriado_original: date = Field(..., description="Data do feriado que está sendo transferido")
    data_funcionamento: date = Field(..., description="Data em que haverá aulas normalmente")
    justificativa: str = Field(..., min_length=10, description="Justificativa para o dia móvel")
    decreto_numero: Optional[str] = Field(None, description="Número do decreto oficial")
    impacto_transporte: str = Field(default="normal", description="Impacto no transporte escolar")
    
    @validator('data_funcionamento')
    def validate_data_funcionamento(cls, v, values):
        if 'feriado_original' in values and v == values['feriado_original']:
            raise ValueError('Data de funcionamento deve ser diferente do feriado original')
        return v

class ReposicaoAula(BaseEvent):
    """Evento de reposição de aula"""
    tipo: EventType = Field(default=EventType.REPOSICAO_AULA, const=True)
    data_original: date = Field(..., description="Data original que foi perdida")
    motivo_perda: str = Field(..., description="Motivo da perda da aula original")
    disciplinas_afetadas: List[str] = []
    professores_envolvidos: List[str] = []
    salas_necessarias: List[str] = []
    recursos_especiais: List[str] = []
    carga_horaria: int = Field(default=4, ge=1, le=12, description="Carga horária em horas")
    
    @validator('data_inicio')
    def validate_data_reposicao(cls, v, values):
        if 'data_original' in values and v <= values['data_original']:
            raise ValueError('Data de reposição deve ser posterior à data original')
        return v

class AtividadeExtracurricular(BaseEvent):
    """Evento de atividade extracurricular"""
    tipo: EventType = Field(default=EventType.ATIVIDADE_EXTRACURRICULAR, const=True)
    categoria: str = Field(..., description="Categoria da atividade (esporte, arte, ciência, etc.)")
    publico_alvo: List[str] = Field(..., description="Anos/séries participantes")
    local_atividade: str = Field(..., description="Local onde será realizada")
    coordenador_responsavel: str = Field(..., description="Nome do coordenador")
    numero_participantes_esperado: int = Field(default=0, ge=0)
    numero_participantes_confirmado: int = Field(default=0, ge=0)
    recursos_necessarios: List[str] = []
    transporte_especial: bool = Field(default=False)
    detalhes_transporte: Optional[str] = None
    custo_estimado: float = Field(default=0.0, ge=0)
    patrocinadores: List[str] = []
    
    @validator('numero_participantes_confirmado')
    def validate_participantes(cls, v, values):
        if 'numero_participantes_esperado' in values and v > values['numero_participantes_esperado']:
            raise ValueError('Participantes confirmados não pode exceder o esperado')
        return v

class EventoEspecial(BaseEvent):
    """Evento especial genérico"""
    tipo: EventType = Field(default=EventType.EVENTO_ESPECIAL, const=True)
    categoria_especial: str = Field(..., description="Categoria específica do evento")
    organizador: str = Field(..., description="Organizador responsável")
    publico_estimado: int = Field(default=0, ge=0)
    necessita_autorizacao: bool = Field(default=False)
    autorizacao_obtida: bool = Field(default=False)
    documentos_anexos: List[str] = []
    contatos_emergencia: List[Dict[str, str]] = []

# Modelos para requisições da API
class EventCreate(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    tipo: EventType
    data_inicio: date
    data_fim: Optional[date] = None
    horario_inicio: Optional[time] = None
    horario_fim: Optional[time] = None
    prioridade: EventPriority = EventPriority.MEDIA
    escolas_afetadas: List[str] = []
    rotas_afetadas: List[str] = []
    observacoes: Optional[str] = None
    metadata: Dict[str, Any] = {}

class DiaMovelCreate(EventCreate):
    tipo: EventType = Field(default=EventType.DIA_MOVEL, const=True)
    feriado_original: date
    data_funcionamento: date
    justificativa: str = Field(..., min_length=10)
    decreto_numero: Optional[str] = None
    impacto_transporte: str = "normal"

class ReposicaoAulaCreate(EventCreate):
    tipo: EventType = Field(default=EventType.REPOSICAO_AULA, const=True)
    data_original: date
    motivo_perda: str
    disciplinas_afetadas: List[str] = []
    professores_envolvidos: List[str] = []
    salas_necessarias: List[str] = []
    recursos_especiais: List[str] = []
    carga_horaria: int = Field(default=4, ge=1, le=12)

class AtividadeExtracurricularCreate(EventCreate):
    tipo: EventType = Field(default=EventType.ATIVIDADE_EXTRACURRICULAR, const=True)
    categoria: str
    publico_alvo: List[str]
    local_atividade: str
    coordenador_responsavel: str
    numero_participantes_esperado: int = Field(default=0, ge=0)
    recursos_necessarios: List[str] = []
    transporte_especial: bool = False
    detalhes_transporte: Optional[str] = None
    custo_estimado: float = Field(default=0.0, ge=0)
    patrocinadores: List[str] = []

# Modelos de resposta
class EventResponse(BaseModel):
    id: str
    titulo: str
    descricao: Optional[str]
    tipo: EventType
    data_inicio: date
    data_fim: Optional[date]
    horario_inicio: Optional[time]
    horario_fim: Optional[time]
    status: EventStatus
    prioridade: EventPriority
    created_at: datetime
    updated_at: datetime
    created_by: str
    escolas_afetadas: List[str]
    rotas_afetadas: List[str]
    observacoes: Optional[str]

class EventCalendarResponse(BaseModel):
    """Resposta otimizada para calendário"""
    id: str
    title: str
    start: str  # ISO datetime
    end: Optional[str]  # ISO datetime
    type: EventType
    status: EventStatus
    priority: EventPriority
    schools_count: int
    routes_count: int
    color: str  # Cor para o calendário
    
class EventSummary(BaseModel):
    """Resumo de eventos por período"""
    period_start: date
    period_end: date
    total_events: int
    events_by_type: Dict[EventType, int]
    events_by_status: Dict[EventStatus, int]
    schools_affected: int
    routes_affected: int
    high_priority_events: int

# Utilitários para eventos
class EventUtils:
    @staticmethod
    def get_event_color(event_type: EventType, status: EventStatus) -> str:
        """Retorna cor para o calendário baseada no tipo e status"""
        colors = {
            EventType.DIA_MOVEL: {
                EventStatus.PLANEJADO: "#fbbf24",
                EventStatus.CONFIRMADO: "#f59e0b", 
                EventStatus.EM_ANDAMENTO: "#d97706",
                EventStatus.CONCLUIDO: "#92400e",
                EventStatus.CANCELADO: "#6b7280"
            },
            EventType.REPOSICAO_AULA: {
                EventStatus.PLANEJADO: "#60a5fa",
                EventStatus.CONFIRMADO: "#3b82f6",
                EventStatus.EM_ANDAMENTO: "#2563eb", 
                EventStatus.CONCLUIDO: "#1d4ed8",
                EventStatus.CANCELADO: "#6b7280"
            },
            EventType.ATIVIDADE_EXTRACURRICULAR: {
                EventStatus.PLANEJADO: "#a78bfa",
                EventStatus.CONFIRMADO: "#8b5cf6",
                EventStatus.EM_ANDAMENTO: "#7c3aed",
                EventStatus.CONCLUIDO: "#6d28d9", 
                EventStatus.CANCELADO: "#6b7280"
            }
        }
        
        return colors.get(event_type, {}).get(status, "#6b7280")
    
    @staticmethod
    def validate_event_conflicts(event: BaseEvent, existing_events: List[BaseEvent]) -> List[str]:
        """Valida conflitos com eventos existentes"""
        conflicts = []
        
        for existing in existing_events:
            if existing.id == event.id:
                continue
                
            # Verificar conflito de datas
            if EventUtils._dates_overlap(event, existing):
                # Verificar se afeta as mesmas escolas ou rotas
                schools_overlap = bool(set(event.escolas_afetadas) & set(existing.escolas_afetadas))
                routes_overlap = bool(set(event.rotas_afetadas) & set(existing.rotas_afetadas))
                
                if schools_overlap or routes_overlap:
                    conflicts.append(f"Conflito com evento '{existing.titulo}' em {existing.data_inicio}")
        
        return conflicts
    
    @staticmethod
    def _dates_overlap(event1: BaseEvent, event2: BaseEvent) -> bool:
        """Verifica se duas datas se sobrepõem"""
        start1 = event1.data_inicio
        end1 = event1.data_fim or event1.data_inicio
        
        start2 = event2.data_inicio  
        end2 = event2.data_fim or event2.data_inicio
        
        return start1 <= end2 and start2 <= end1