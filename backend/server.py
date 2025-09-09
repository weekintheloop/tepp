from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, date
from enum import Enum
import jwt
from passlib.context import CryptContext
import re

# Import advanced services
from services.analytics_service import AnalyticsService
from services.student_risk_service import StudentRiskAnalysisService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# Create the main app
app = FastAPI(
    title="SIG-TE - Sistema de Gestão de Transporte Escolar",
    description="Sistema completo para gestão de transporte escolar com analytics avançados e análise de risco",
    version="2.0.0"
)

# Initialize advanced services
analytics_service = None
risk_service = None

@app.on_event("startup")
async def startup_event():
    global analytics_service, risk_service
    analytics_service = AnalyticsService(db)
    risk_service = StudentRiskAnalysisService(db)

# Create API router
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    SECRETARIO = "secretario"
    MONITOR = "monitor"
    DIRETOR = "diretor"

class StatusEnum(str, Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"
    PENDENTE = "pendente"

class TurnoEnum(str, Enum):
    MANHA = "manha"
    TARDE = "tarde"
    NOITE = "noite"

# Base Models
class BaseEntity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# User Models
class User(BaseEntity):
    nome: str
    email: EmailStr
    celular: str
    role: UserRole
    status: StatusEnum = StatusEnum.ATIVO
    senha_hash: Optional[str] = None
    ultimo_acesso: Optional[datetime] = None

class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    celular: str
    role: UserRole
    senha: str

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class UserResponse(BaseModel):
    id: str
    nome: str
    email: EmailStr
    celular: str
    role: UserRole
    status: StatusEnum
    ultimo_acesso: Optional[datetime] = None

# Escola Models
class Escola(BaseEntity):
    nome: str
    endereco: str
    bairro: str
    cidade: str = "Brasília"
    cep: str
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    diretor: Optional[str] = None
    capacidade_total: int
    turno: List[TurnoEnum]
    coordenadas: Optional[Dict[str, float]] = None  # lat, lng

class EscolaCreate(BaseModel):
    nome: str
    endereco: str
    bairro: str
    cep: str
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    diretor: Optional[str] = None
    capacidade_total: int
    turno: List[TurnoEnum]

# Veiculo Models
class Veiculo(BaseEntity):
    placa: str
    modelo: str
    marca: str
    ano: int
    capacidade: int
    motorista: str
    celular_motorista: str
    status: StatusEnum = StatusEnum.ATIVO
    ultima_manutencao: Optional[date] = None
    proxima_manutencao: Optional[date] = None
    km_atual: Optional[int] = None

class VeiculoCreate(BaseModel):
    placa: str
    modelo: str
    marca: str
    ano: int
    capacidade: int
    motorista: str
    celular_motorista: str
    ultima_manutencao: Optional[date] = None
    proxima_manutencao: Optional[date] = None
    km_atual: Optional[int] = None

# Rota Models
class PontoParada(BaseModel):
    nome: str
    endereco: str
    coordenadas: Dict[str, float]  # lat, lng
    ordem: int
    tempo_estimado: int  # minutos desde o início da rota

class Rota(BaseEntity):
    nome: str
    escola_id: str
    monitor_id: Optional[str] = None
    veiculo_id: Optional[str] = None
    turno: TurnoEnum
    horario_saida: str  # HH:MM
    horario_chegada_escola: str  # HH:MM
    pontos_parada: List[PontoParada] = []
    distancia_km: Optional[float] = None
    tempo_estimado_minutos: Optional[int] = None
    capacidade_maxima: int
    vagas_ocupadas: int = 0
    status: StatusEnum = StatusEnum.ATIVO
    observacoes: Optional[str] = None

class RotaCreate(BaseModel):
    nome: str
    escola_id: str
    monitor_id: Optional[str] = None
    veiculo_id: Optional[str] = None
    turno: TurnoEnum
    horario_saida: str
    horario_chegada_escola: str
    pontos_parada: List[PontoParada] = []
    capacidade_maxima: int
    observacoes: Optional[str] = None

# Aluno Models
class ResponsavelInfo(BaseModel):
    nome: str
    celular: str
    email: Optional[EmailStr] = None
    parentesco: str  # pai, mãe, avô, etc.

class Aluno(BaseEntity):
    nome: str
    data_nascimento: date
    ra: str  # Registro do Aluno
    cpf: Optional[str] = None
    escola_id: str
    rota_id: Optional[str] = None
    ponto_embarque: Optional[str] = None
    turno: TurnoEnum
    serie_ano: str
    turma: Optional[str] = None
    responsaveis: List[ResponsavelInfo]
    tem_necessidades_especiais: bool = False
    necessidades_especiais: Optional[str] = None
    tem_acompanhante: bool = False
    observacoes_medicas: Optional[str] = None
    status: StatusEnum = StatusEnum.ATIVO
    foto_url: Optional[str] = None

class AlunoCreate(BaseModel):
    nome: str
    data_nascimento: date
    ra: str
    cpf: Optional[str] = None
    escola_id: str
    rota_id: Optional[str] = None
    ponto_embarque: Optional[str] = None
    turno: TurnoEnum
    serie_ano: str
    turma: Optional[str] = None
    responsaveis: List[ResponsavelInfo]
    tem_necessidades_especiais: bool = False
    necessidades_especiais: Optional[str] = None
    tem_acompanhante: bool = False
    observacoes_medicas: Optional[str] = None

# Frequencia Models
class RegistroFrequencia(BaseModel):
    aluno_id: str
    presente: bool
    observacao: Optional[str] = None
    horario_registro: datetime = Field(default_factory=datetime.utcnow)

class Frequencia(BaseEntity):
    rota_id: str
    monitor_id: str
    data: date
    turno: TurnoEnum
    registros: List[RegistroFrequencia]
    total_alunos: int
    total_presentes: int
    total_ausentes: int
    observacoes_gerais: Optional[str] = None
    coordenadas_registro: Optional[Dict[str, float]] = None

class FrequenciaCreate(BaseModel):
    rota_id: str
    data: date
    turno: TurnoEnum
    registros: List[RegistroFrequencia]
    observacoes_gerais: Optional[str] = None
    coordenadas_registro: Optional[Dict[str, float]] = None

# Ocorrencia Models
class TipoOcorrencia(str, Enum):
    ATRASO = "atraso"
    BREAKDOWN = "quebra_veiculo"
    ACIDENTE = "acidente"
    AUSENCIA_MONITOR = "ausencia_monitor"
    AUSENCIA_MOTORISTA = "ausencia_motorista"
    PROBLEMA_ROTA = "problema_rota"
    OUTROS = "outros"

class Ocorrencia(BaseEntity):
    rota_id: str
    veiculo_id: Optional[str] = None
    monitor_id: Optional[str] = None
    tipo: TipoOcorrencia
    descricao: str
    data_ocorrencia: datetime
    local: Optional[str] = None
    coordenadas: Optional[Dict[str, float]] = None
    prioridade: str = "media"  # baixa, media, alta, critica
    status_resolucao: str = "aberto"  # aberto, em_andamento, resolvido
    responsavel_resolucao: Optional[str] = None
    data_resolucao: Optional[datetime] = None
    observacoes_resolucao: Optional[str] = None

class OcorrenciaCreate(BaseModel):
    rota_id: str
    veiculo_id: Optional[str] = None
    tipo: TipoOcorrencia
    descricao: str
    data_ocorrencia: datetime
    local: Optional[str] = None
    coordenadas: Optional[Dict[str, float]] = None
    prioridade: str = "media"

# Analytics Models
class DashboardStats(BaseModel):
    total_alunos: int
    total_rotas_ativas: int
    total_veiculos: int
    total_escolas: int
    taxa_frequencia_media: float
    ocorrencias_abertas: int
    alunos_transportados_hoje: int
    rotas_em_operacao: int

class RelatorioFrequencia(BaseModel):
    periodo_inicio: date
    periodo_fim: date
    rota_id: Optional[str] = None
    dados_frequencia: List[Dict[str, Any]]
    estatisticas: Dict[str, float]

# Utility functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow().timestamp() + 86400})  # 24 hours
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Auth Routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Create user
    user = User(
        nome=user_data.nome,
        email=user_data.email,
        celular=user_data.celular,
        role=user_data.role,
        senha_hash=hash_password(user_data.senha)
    )
    
    await db.users.insert_one(user.dict())
    return UserResponse(**user.dict())

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.senha, user["senha_hash"]):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    if user["status"] != StatusEnum.ATIVO:
        raise HTTPException(status_code=401, detail="Usuário inativo")
    
    # Update last access
    await db.users.update_one(
        {"id": user["id"]}, 
        {"$set": {"ultimo_acesso": datetime.utcnow()}}
    )
    
    token = create_access_token({"user_id": user["id"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse(**user)
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# Dashboard Routes - Advanced Analytics
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    """
    Advanced dashboard analytics with comprehensive KPIs and insights
    """
    if current_user["role"] not in ["admin", "secretario", "diretor"]:
        raise HTTPException(status_code=403, detail="Acesso negado para este endpoint")
    
    try:
        if analytics_service:
            return await analytics_service.get_dashboard_analytics()
        else:
            raise HTTPException(status_code=500, detail="Serviço de analytics indisponível")
    except Exception as e:
        logging.error(f"Erro no dashboard analytics: {e}")
        raise HTTPException(status_code=500, detail="Erro interno no servidor")

@api_router.get("/dashboard/stats", response_model=DashboardStats) 
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """
    Legacy dashboard stats endpoint for backward compatibility
    """
    # Count statistics
    total_alunos = await db.alunos.count_documents({"status": StatusEnum.ATIVO})
    total_rotas_ativas = await db.rotas.count_documents({"status": StatusEnum.ATIVO})
    total_veiculos = await db.veiculos.count_documents({"status": StatusEnum.ATIVO})
    total_escolas = await db.escolas.count_documents({})
    ocorrencias_abertas = await db.ocorrencias.count_documents({"status_resolucao": "aberto"})
    
    # Calculate frequency rate (simplified)
    hoje = date.today()
    frequencias_hoje = await db.frequencias.find({"data": hoje.isoformat()}).to_list(None)
    if frequencias_hoje:
        total_presentes = sum(f["total_presentes"] for f in frequencias_hoje)
        total_registros = sum(f["total_alunos"] for f in frequencias_hoje)
        taxa_frequencia_media = (total_presentes / total_registros * 100) if total_registros > 0 else 0
        alunos_transportados_hoje = total_presentes
        rotas_em_operacao = len(frequencias_hoje)
    else:
        taxa_frequencia_media = 0
        alunos_transportados_hoje = 0
        rotas_em_operacao = 0
    
    return DashboardStats(
        total_alunos=total_alunos,
        total_rotas_ativas=total_rotas_ativas,
        total_veiculos=total_veiculos,
        total_escolas=total_escolas,
        taxa_frequencia_media=taxa_frequencia_media,
        ocorrencias_abertas=ocorrencias_abertas,
        alunos_transportados_hoje=alunos_transportados_hoje,
        rotas_em_operacao=rotas_em_operacao
    )

# Generic CRUD operations
async def create_entity(collection_name: str, entity_data: dict):
    result = await db[collection_name].insert_one(entity_data)
    return entity_data

async def get_entities(collection_name: str, filters: dict = None, limit: int = 100):
    if filters is None:
        filters = {}
    cursor = db[collection_name].find(filters).limit(limit)
    return await cursor.to_list(length=limit)

async def get_entity_by_id(collection_name: str, entity_id: str):
    return await db[collection_name].find_one({"id": entity_id})

async def update_entity(collection_name: str, entity_id: str, update_data: dict):
    update_data["updated_at"] = datetime.utcnow()
    result = await db[collection_name].update_one(
        {"id": entity_id}, 
        {"$set": update_data}
    )
    return result.modified_count > 0

async def delete_entity(collection_name: str, entity_id: str):
    result = await db[collection_name].delete_one({"id": entity_id})
    return result.deleted_count > 0

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Root endpoint
# Advanced Analytics Routes
@api_router.get("/analytics/frequency-trends")
async def get_frequency_trends(
    days: int = Query(7, ge=1, le=90),
    current_user: dict = Depends(get_current_user)
):
    """
    Get frequency trends for specified number of days
    """
    if analytics_service:
        return await analytics_service.get_frequency_trends(days)
    return {"labels": [], "values": [], "studentCounts": []}

@api_router.get("/analytics/route-efficiency")
async def get_route_efficiency(current_user: dict = Depends(get_current_user)):
    """
    Get route efficiency analysis
    """
    if analytics_service:
        return await analytics_service.get_route_efficiency()
    return {"labels": [], "values": [], "colors": [], "total_routes": 0}

@api_router.get("/analytics/risk-students")
async def get_risk_students(
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    Get students at risk of dropping out
    """
    if current_user["role"] not in ["admin", "secretario", "diretor"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    if analytics_service:
        return await analytics_service.get_risk_students(limit)
    return []

@api_router.get("/analytics/maintenance-alerts")
async def get_maintenance_alerts(current_user: dict = Depends(get_current_user)):
    """
    Get vehicle maintenance alerts
    """
    if analytics_service:
        return await analytics_service.get_maintenance_alerts()
    return []

# Student Risk Analysis Routes
@api_router.get("/analytics/student-risk/{student_id}")
async def analyze_student_risk(
    student_id: str,
    comprehensive: bool = Query(False),
    current_user: dict = Depends(get_current_user)
):
    """
    Comprehensive risk analysis for a specific student
    """
    if current_user["role"] not in ["admin", "secretario", "diretor"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    if risk_service:
        return await risk_service.analyze_student_risk(student_id, comprehensive)
    return {"success": False, "error": "Serviço de análise de risco indisponível"}

@api_router.get("/analytics/student-risk")
async def analyze_all_students_risk(
    comprehensive: bool = Query(False),
    current_user: dict = Depends(get_current_user)
):
    """
    Risk analysis for all active students
    """
    if current_user["role"] not in ["admin", "secretario"]:
        raise HTTPException(status_code=403, detail="Acesso negado - apenas admin e secretario")
    
    if risk_service:
        return await risk_service.analyze_student_risk(None, comprehensive)
    return {"success": False, "error": "Serviço de análise de risco indisponível"}

@api_router.post("/analytics/absence-patterns")
async def analyze_absence_patterns(
    student_id: Optional[str] = None,
    days: int = Query(30, ge=7, le=180),
    current_user: dict = Depends(get_current_user)
):
    """
    Advanced absence pattern analysis
    """
    if current_user["role"] not in ["admin", "secretario", "diretor"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    if analytics_service:
        return await analytics_service.analyze_absence_patterns(student_id, days)
    return {"success": False, "error": "Serviço de analytics indisponível"}

@api_router.post("/interventions/workflow")
async def run_intervention_workflow(
    student_ids: Optional[List[str]] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Execute intervention workflow for at-risk students
    """
    if current_user["role"] not in ["admin", "secretario"]:
        raise HTTPException(status_code=403, detail="Acesso negado - apenas admin e secretario")
    
    if analytics_service:
        return await analytics_service.run_intervention_workflow(student_ids)
    return {"success": False, "error": "Serviço de analytics indisponível"}

# System Performance Routes
@api_router.get("/system/health")
async def system_health_check():
    """
    Comprehensive system health check
    """
    try:
        # Test database connection
        await db.command("ping")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Test services
    analytics_status = "healthy" if analytics_service else "unavailable"
    risk_analysis_status = "healthy" if risk_service else "unavailable"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "components": {
            "database": db_status,
            "analytics_service": analytics_status,
            "risk_analysis_service": risk_analysis_status
        },
        "uptime": "N/A",  # Would be calculated in production
        "memory_usage": "N/A",  # Would be calculated in production
        "active_connections": "N/A"  # Would be calculated in production
    }

@api_router.get("/system/metrics")
async def get_system_metrics(current_user: dict = Depends(get_current_user)):
    """
    System performance metrics
    """
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado - apenas admin")
    
    if analytics_service:
        return await analytics_service.get_performance_metrics()
    return {}

# Root endpoint
@api_router.get("/")
async def root():
    return {
        "message": "SIG-TE API - Sistema de Gestão de Transporte Escolar",
        "version": "2.0.0",
        "status": "active",
        "features": [
            "Advanced Analytics",
            "Student Risk Analysis", 
            "Absence Pattern Detection",
            "Automatic Interventions",
            "Real-time Dashboard",
            "Maintenance Alerts"
        ]
    }