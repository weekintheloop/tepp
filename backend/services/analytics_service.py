from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional
from motor.motor_asyncio import AsyncIOMotorCollection
import logging
from bson import ObjectId

logger = logging.getLogger(__name__)

class AnalyticsService:
    """
    Serviço avançado de analytics para o SIG-TE
    Baseado nos padrões do arquivo TE-PP.txt
    """
    
    def __init__(self, db):
        self.db = db
        self.alunos: AsyncIOMotorCollection = db.alunos
        self.rotas: AsyncIOMotorCollection = db.rotas
        self.veiculos: AsyncIOMotorCollection = db.veiculos
        self.escolas: AsyncIOMotorCollection = db.escolas
        self.frequencias: AsyncIOMotorCollection = db.frequencias
        self.ocorrencias: AsyncIOMotorCollection = db.ocorrencias
        self.users: AsyncIOMotorCollection = db.users

    async def get_dashboard_analytics(self) -> Dict[str, Any]:
        """
        Analytics principal do dashboard executivo
        """
        try:
            # KPIs principais
            total_active_students = await self.alunos.count_documents({"status": "ativo"})
            total_active_routes = await self.rotas.count_documents({"status": "ativo"})
            total_buses = await self.veiculos.count_documents({"status": {"$in": ["ativo", "manutencao"]}})
            total_schools = await self.escolas.count_documents({})
            
            # Taxa de frequência geral
            attendance_data = await self.calculate_attendance_rate()
            
            # Utilização da frota
            fleet_utilization = await self.calculate_fleet_utilization()
            
            # Ocorrências abertas
            open_incidents = await self.ocorrencias.count_documents({
                "status_resolucao": {"$in": ["aberto", "em_andamento"]}
            })
            
            # Tendências de frequência (últimos 7 dias)
            frequency_trends = await self.get_frequency_trends(7)
            
            # Eficiência das rotas
            route_efficiency = await self.get_route_efficiency()
            
            # Alunos em risco
            risk_students = await self.get_risk_students()
            
            # Alertas de manutenção
            maintenance_alerts = await self.get_maintenance_alerts()
            
            # Métricas de performance
            performance_metrics = await self.get_performance_metrics()
            
            return {
                "kpis": {
                    "totalActiveStudents": total_active_students,
                    "totalActiveRoutes": total_active_routes,
                    "totalBuses": total_buses,
                    "totalSchools": total_schools,
                    "overallAttendanceRate": round(attendance_data["rate"], 1),
                    "averageFleetUtilization": round(fleet_utilization, 1),
                    "openIncidents": open_incidents,
                    "criticalIncidents": await self.ocorrencias.count_documents({
                        "status_resolucao": "aberto",
                        "prioridade": "critica"
                    })
                },
                "frequencyTrends": frequency_trends,
                "routeEfficiency": route_efficiency,
                "riskStudents": risk_students,
                "maintenanceAlerts": maintenance_alerts,
                "performanceMetrics": performance_metrics,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao calcular analytics do dashboard: {e}")
            raise

    async def calculate_attendance_rate(self, days: int = 30) -> Dict[str, Any]:
        """
        Calcula taxa de frequência dos últimos N dias
        """
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
            
            pipeline = [
                {
                    "$match": {
                        "data": {
                            "$gte": start_date.isoformat(),
                            "$lte": end_date.isoformat()
                        }
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "total_alunos": {"$sum": "$total_alunos"},
                        "total_presentes": {"$sum": "$total_presentes"},
                        "total_ausentes": {"$sum": "$total_ausentes"}
                    }
                }
            ]
            
            result = await self.frequencias.aggregate(pipeline).to_list(length=1)
            
            if result:
                data = result[0]
                rate = (data["total_presentes"] / data["total_alunos"] * 100) if data["total_alunos"] > 0 else 0
                return {
                    "rate": rate,
                    "total_records": data["total_alunos"],
                    "present_count": data["total_presentes"],
                    "absent_count": data["total_ausentes"]
                }
            
            return {"rate": 0, "total_records": 0, "present_count": 0, "absent_count": 0}
            
        except Exception as e:
            logger.error(f"Erro ao calcular taxa de frequência: {e}")
            return {"rate": 0, "total_records": 0, "present_count": 0, "absent_count": 0}

    async def calculate_fleet_utilization(self) -> float:
        """
        Calcula utilização média da frota
        """
        try:
            pipeline = [
                {
                    "$match": {"status": "ativo"}
                },
                {
                    "$group": {
                        "_id": None,
                        "total_capacity": {"$sum": "$capacidade_maxima"},
                        "total_occupied": {"$sum": "$vagas_ocupadas"}
                    }
                }
            ]
            
            result = await self.rotas.aggregate(pipeline).to_list(length=1)
            
            if result and result[0]["total_capacity"] > 0:
                return (result[0]["total_occupied"] / result[0]["total_capacity"]) * 100
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Erro ao calcular utilização da frota: {e}")
            return 0.0

    async def get_frequency_trends(self, days: int = 7) -> Dict[str, List]:
        """
        Tendências de frequência dos últimos N dias
        """
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
            
            pipeline = [
                {
                    "$match": {
                        "data": {
                            "$gte": start_date.isoformat(),
                            "$lte": end_date.isoformat()
                        }
                    }
                },
                {
                    "$group": {
                        "_id": "$data",
                        "attendance_rate": {
                            "$avg": {
                                "$cond": [
                                    {"$gt": ["$total_alunos", 0]},
                                    {"$multiply": [{"$divide": ["$total_presentes", "$total_alunos"]}, 100]},
                                    0
                                ]
                            }
                        },
                        "total_students": {"$sum": "$total_alunos"},
                        "total_present": {"$sum": "$total_presentes"}
                    }
                },
                {"$sort": {"_id": 1}}
            ]
            
            results = await self.frequencias.aggregate(pipeline).to_list(length=days)
            
            labels = []
            values = []
            student_counts = []
            
            for result in results:
                labels.append(result["_id"])
                values.append(round(result["attendance_rate"], 1))
                student_counts.append(result["total_students"])
            
            return {
                "labels": labels,
                "values": values,
                "studentCounts": student_counts
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter tendências de frequência: {e}")
            return {"labels": [], "values": [], "studentCounts": []}

    async def get_route_efficiency(self) -> Dict[str, Any]:
        """
        Análise de eficiência das rotas
        """
        try:
            pipeline = [
                {
                    "$match": {"status": "ativo"}
                },
                {
                    "$addFields": {
                        "utilization_rate": {
                            "$cond": [
                                {"$gt": ["$capacidade_maxima", 0]},
                                {"$multiply": [{"$divide": ["$vagas_ocupadas", "$capacidade_maxima"]}, 100]},
                                0
                            ]
                        }
                    }
                },
                {
                    "$addFields": {
                        "efficiency_category": {
                            "$switch": {
                                "branches": [
                                    {"case": {"$gte": ["$utilization_rate", 90]}, "then": "Excelente"},
                                    {"case": {"$gte": ["$utilization_rate", 70]}, "then": "Boa"},
                                    {"case": {"$gte": ["$utilization_rate", 50]}, "then": "Regular"},
                                    {"case": {"$lt": ["$utilization_rate", 50]}, "then": "Baixa"}
                                ],
                                "default": "Indefinida"
                            }
                        }
                    }
                },
                {
                    "$group": {
                        "_id": "$efficiency_category",
                        "count": {"$sum": 1},
                        "avg_utilization": {"$avg": "$utilization_rate"}
                    }
                }
            ]
            
            results = await self.rotas.aggregate(pipeline).to_list(length=10)
            
            labels = []
            values = []
            colors = {
                "Excelente": "#10b981",
                "Boa": "#3b82f6", 
                "Regular": "#f59e0b",
                "Baixa": "#ef4444"
            }
            
            for result in results:
                labels.append(result["_id"])
                values.append(result["count"])
            
            return {
                "labels": labels,
                "values": values,
                "colors": [colors.get(label, "#6b7280") for label in labels],
                "total_routes": sum(values)
            }
            
        except Exception as e:
            logger.error(f"Erro ao calcular eficiência das rotas: {e}")
            return {"labels": [], "values": [], "colors": [], "total_routes": 0}

    async def get_risk_students(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Identifica alunos em risco de evasão baseado em padrões de ausência
        """
        try:
            # Calcular taxa de ausência por aluno nos últimos 30 dias
            end_date = date.today()
            start_date = end_date - timedelta(days=30)
            
            pipeline = [
                {
                    "$match": {
                        "data": {
                            "$gte": start_date.isoformat(),
                            "$lte": end_date.isoformat()
                        }
                    }
                },
                {"$unwind": "$registros"},
                {
                    "$group": {
                        "_id": "$registros.aluno_id",
                        "total_records": {"$sum": 1},
                        "absent_records": {
                            "$sum": {
                                "$cond": [{"$eq": ["$registros.presente", False]}, 1, 0]
                            }
                        }
                    }
                },
                {
                    "$addFields": {
                        "absence_rate": {
                            "$multiply": [
                                {"$divide": ["$absent_records", "$total_records"]}, 
                                100
                            ]
                        }
                    }
                },
                {"$match": {"absence_rate": {"$gte": 25}}},
                {"$sort": {"absence_rate": -1}},
                {"$limit": limit}
            ]
            
            results = await self.frequencias.aggregate(pipeline).to_list(length=limit)
            
            risk_students = []
            for result in results:
                # Buscar dados do aluno
                aluno = await self.alunos.find_one({"id": result["_id"]})
                if aluno:
                    risk_level = "HIGH" if result["absence_rate"] >= 50 else "MEDIUM" if result["absence_rate"] >= 35 else "LOW"
                    
                    risk_students.append({
                        "id": aluno["id"],
                        "name": aluno["nome"],
                        "ra": aluno.get("ra", "N/A"),
                        "school": aluno.get("escola_id", "N/A"),
                        "route": aluno.get("rota_id", "N/A"),
                        "riskLevel": risk_level,
                        "absenceRate": round(result["absence_rate"], 1),
                        "totalRecords": result["total_records"],
                        "absentRecords": result["absent_records"]
                    })
            
            return risk_students
            
        except Exception as e:
            logger.error(f"Erro ao identificar alunos em risco: {e}")
            return []

    async def get_maintenance_alerts(self) -> List[Dict[str, Any]]:
        """
        Alertas de manutenção de veículos
        """
        try:
            today = date.today()
            warning_date = today + timedelta(days=7)  # Alertar 7 dias antes
            
            pipeline = [
                {
                    "$match": {
                        "$or": [
                            {"proxima_manutencao": {"$lte": warning_date.isoformat()}},
                            {"status": "manutencao"}
                        ]
                    }
                },
                {
                    "$addFields": {
                        "days_until_maintenance": {
                            "$cond": [
                                {"$ne": ["$proxima_manutencao", None]},
                                {
                                    "$divide": [
                                        {"$subtract": [
                                            {"$dateFromString": {"dateString": "$proxima_manutencao"}},
                                            {"$dateFromString": {"dateString": today.isoformat()}}
                                        ]},
                                        86400000  # ms in a day
                                    ]
                                },
                                999
                            ]
                        }
                    }
                },
                {
                    "$addFields": {
                        "alert_level": {
                            "$switch": {
                                "branches": [
                                    {"case": {"$eq": ["$status", "manutencao"]}, "then": "CRITICAL"},
                                    {"case": {"$lte": ["$days_until_maintenance", 0]}, "then": "OVERDUE"},
                                    {"case": {"$lte": ["$days_until_maintenance", 3]}, "then": "URGENT"},
                                    {"case": {"$lte": ["$days_until_maintenance", 7]}, "then": "WARNING"}
                                ],
                                "default": "INFO"
                            }
                        }
                    }
                },
                {"$sort": {"days_until_maintenance": 1}}
            ]
            
            results = await self.veiculos.aggregate(pipeline).to_list(length=50)
            
            alerts = []
            for result in results:
                alerts.append({
                    "vehicleId": result["id"],
                    "plate": result["placa"],
                    "model": f"{result['marca']} {result['modelo']}",
                    "driver": result.get("motorista", "N/A"),
                    "alertLevel": result["alert_level"],
                    "daysUntilMaintenance": int(result.get("days_until_maintenance", 0)),
                    "nextMaintenance": result.get("proxima_manutencao"),
                    "status": result["status"],
                    "message": self._generate_maintenance_message(result)
                })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Erro ao obter alertas de manutenção: {e}")
            return []

    def _generate_maintenance_message(self, vehicle: Dict) -> str:
        """
        Gera mensagem personalizada do alerta de manutenção
        """
        if vehicle["status"] == "manutencao":
            return f"Veículo {vehicle['placa']} está em manutenção"
        
        days = int(vehicle.get("days_until_maintenance", 0))
        if days < 0:
            return f"Manutenção atrasada há {abs(days)} dias"
        elif days == 0:
            return f"Manutenção vence hoje"
        elif days <= 3:
            return f"Manutenção vence em {days} dias - URGENTE"
        else:
            return f"Manutenção vence em {days} dias"

    async def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Métricas de performance do sistema
        """
        try:
            # Estatísticas dos últimos 30 dias
            end_date = date.today()
            start_date = end_date - timedelta(days=30)
            
            # Pontualidade das rotas (simulado - seria baseado em dados GPS reais)
            punctuality_score = 87.5  # Placeholder
            
            # Resolução de ocorrências
            total_incidents = await self.ocorrencias.count_documents({
                "data_ocorrencia": {
                    "$gte": start_date.isoformat(),
                    "$lte": end_date.isoformat()
                }
            })
            
            resolved_incidents = await self.ocorrencias.count_documents({
                "data_ocorrencia": {
                    "$gte": start_date.isoformat(),
                    "$lte": end_date.isoformat()
                },
                "status_resolucao": "resolvido"
            })
            
            resolution_rate = (resolved_incidents / total_incidents * 100) if total_incidents > 0 else 0
            
            # Tempo médio de resolução (simulado)
            avg_resolution_time = 4.2  # horas - Placeholder
            
            # Satisfação geral (simulado)
            satisfaction_score = 4.3  # de 5 - Placeholder
            
            return {
                "punctualityScore": punctuality_score,
                "incidentResolutionRate": round(resolution_rate, 1),
                "avgResolutionTimeHours": avg_resolution_time,
                "satisfactionScore": satisfaction_score,
                "totalIncidentsMonth": total_incidents,
                "resolvedIncidentsMonth": resolved_incidents,
                "systemUptime": 99.8,  # Placeholder
                "dataQualityScore": 95.2  # Placeholder
            }
            
        except Exception as e:
            logger.error(f"Erro ao calcular métricas de performance: {e}")
            return {}

    async def analyze_absence_patterns(self, student_id: str = None, days: int = 30) -> Dict[str, Any]:
        """
        Análise avançada de padrões de ausência
        Baseado no AbsenceAnalysisService do TE-PP.txt
        """
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
            
            match_stage = {
                "data": {
                    "$gte": start_date.isoformat(),
                    "$lte": end_date.isoformat()
                }
            }
            
            if student_id:
                match_stage["registros.aluno_id"] = student_id
            
            pipeline = [
                {"$match": match_stage},
                {"$unwind": "$registros"},
                {
                    "$group": {
                        "_id": {
                            "aluno_id": "$registros.aluno_id",
                            "day_of_week": {"$dayOfWeek": {"$dateFromString": {"dateString": "$data"}}}
                        },
                        "total_records": {"$sum": 1},
                        "absent_records": {
                            "$sum": {"$cond": [{"$eq": ["$registros.presente", False]}, 1, 0]}
                        }
                    }
                },
                {
                    "$group": {
                        "_id": "$_id.aluno_id",
                        "patterns": {
                            "$push": {
                                "day_of_week": "$_id.day_of_week",
                                "absence_rate": {
                                    "$multiply": [
                                        {"$divide": ["$absent_records", "$total_records"]},
                                        100
                                    ]
                                }
                            }
                        },
                        "total_days": {"$sum": "$total_records"},
                        "total_absences": {"$sum": "$absent_records"}
                    }
                },
                {
                    "$addFields": {
                        "overall_absence_rate": {
                            "$multiply": [
                                {"$divide": ["$total_absences", "$total_days"]},
                                100
                            ]
                        }
                    }
                }
            ]
            
            results = await self.frequencias.aggregate(pipeline).to_list(length=1000)
            
            analysis = {
                "analyzed_students": len(results),
                "patterns": [],
                "risk_indicators": [],
                "recommendations": []
            }
            
            for result in results:
                student_analysis = {
                    "student_id": result["_id"],
                    "overall_absence_rate": round(result["overall_absence_rate"], 1),
                    "total_days": result["total_days"],
                    "total_absences": result["total_absences"],
                    "weekly_patterns": result["patterns"],
                    "risk_level": self._calculate_risk_level(result["overall_absence_rate"])
                }
                
                analysis["patterns"].append(student_analysis)
                
                # Identificar indicadores de risco
                if result["overall_absence_rate"] >= 50:
                    analysis["risk_indicators"].append({
                        "student_id": result["_id"],
                        "type": "HIGH_ABSENCE_RATE",
                        "value": result["overall_absence_rate"],
                        "severity": "CRITICAL"
                    })
                elif result["overall_absence_rate"] >= 25:
                    analysis["risk_indicators"].append({
                        "student_id": result["_id"],
                        "type": "MODERATE_ABSENCE_RATE", 
                        "value": result["overall_absence_rate"],
                        "severity": "WARNING"
                    })
            
            # Gerar recomendações
            analysis["recommendations"] = self._generate_absence_recommendations(analysis)
            
            return {
                "success": True,
                "analysis": analysis,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro na análise de padrões de ausência: {e}")
            return {
                "success": False,
                "error": str(e),
                "analysis": {}
            }

    def _calculate_risk_level(self, absence_rate: float) -> str:
        """
        Calcula nível de risco baseado na taxa de ausência
        """
        if absence_rate >= 50:
            return "CRITICAL"
        elif absence_rate >= 35:
            return "HIGH"
        elif absence_rate >= 25:
            return "MEDIUM"
        elif absence_rate >= 15:
            return "LOW"
        else:
            return "MINIMAL"

    def _generate_absence_recommendations(self, analysis: Dict) -> List[Dict[str, str]]:
        """
        Gera recomendações baseadas na análise de ausências
        """
        recommendations = []
        
        critical_students = len([p for p in analysis["patterns"] if p["risk_level"] == "CRITICAL"])
        high_risk_students = len([p for p in analysis["patterns"] if p["risk_level"] == "HIGH"])
        
        if critical_students > 0:
            recommendations.append({
                "type": "IMMEDIATE_ACTION",
                "message": f"{critical_students} aluno(s) com risco crítico precisam de intervenção imediata",
                "priority": "HIGH"
            })
        
        if high_risk_students > 0:
            recommendations.append({
                "type": "MONITORING_REQUIRED",
                "message": f"{high_risk_students} aluno(s) precisam de monitoramento próximo",
                "priority": "MEDIUM"
            })
        
        recommendations.append({
            "type": "GENERAL",
            "message": "Implementar programa de incentivo à frequência escolar",
            "priority": "LOW"
        })
        
        return recommendations

    async def run_intervention_workflow(self, student_ids: List[str] = None) -> Dict[str, Any]:
        """
        Executa workflow de intervenção para alunos em risco
        Baseado no runInterventionWorkflow do TE-PP.txt
        """
        try:
            if not student_ids:
                # Identificar automaticamente alunos em risco
                risk_students = await self.get_risk_students(limit=50)
                student_ids = [student["id"] for student in risk_students if student["riskLevel"] in ["HIGH", "CRITICAL"]]
            
            interventions = []
            
            for student_id in student_ids:
                # Buscar dados do aluno
                student = await self.alunos.find_one({"id": student_id})
                if not student:
                    continue
                
                # Analisar padrão de ausência específico
                absence_analysis = await self.analyze_absence_patterns(student_id)
                
                if absence_analysis["success"]:
                    pattern = absence_analysis["analysis"]["patterns"][0] if absence_analysis["analysis"]["patterns"] else None
                    
                    if pattern:
                        intervention = {
                            "student_id": student_id,
                            "student_name": student["nome"],
                            "risk_level": pattern["risk_level"],
                            "absence_rate": pattern["overall_absence_rate"],
                            "intervention_type": self._determine_intervention_type(pattern["risk_level"]),
                            "recommended_actions": self._get_recommended_actions(pattern["risk_level"]),
                            "assigned_to": "coordenacao_pedagogica",
                            "status": "pending",
                            "created_at": datetime.utcnow().isoformat(),
                            "expected_completion": (datetime.utcnow() + timedelta(days=7)).isoformat()
                        }
                        
                        interventions.append(intervention)
                        
                        # Salvar intervenção no banco (assumindo uma coleção de intervenções)
                        await self.db.intervencoes.insert_one(intervention)
            
            return {
                "success": True,
                "message": f"{len(interventions)} intervenções criadas com sucesso",
                "interventions_created": len(interventions),
                "interventions": interventions
            }
            
        except Exception as e:
            logger.error(f"Erro no workflow de intervenção: {e}")
            return {
                "success": False,
                "error": str(e),
                "interventions_created": 0
            }

    def _determine_intervention_type(self, risk_level: str) -> str:
        """
        Determina tipo de intervenção baseado no nível de risco
        """
        intervention_types = {
            "CRITICAL": "EMERGENCY_CONTACT",
            "HIGH": "FAMILY_MEETING",
            "MEDIUM": "COUNSELING",
            "LOW": "MONITORING"
        }
        return intervention_types.get(risk_level, "MONITORING")

    def _get_recommended_actions(self, risk_level: str) -> List[str]:
        """
        Retorna ações recomendadas baseadas no nível de risco
        """
        actions = {
            "CRITICAL": [
                "Contato imediato com responsáveis",
                "Visita domiciliar",
                "Encaminhamento para assistência social",
                "Plano de recuperação personalizado"
            ],
            "HIGH": [
                "Reunião com família",
                "Acompanhamento semanal",
                "Apoio pedagógico especializado",
                "Verificação de questões socioeconômicas"
            ],
            "MEDIUM": [
                "Conversa com responsáveis",
                "Acompanhamento quinzenal",
                "Orientação sobre importância da frequência",
                "Apoio educacional"
            ],
            "LOW": [
                "Monitoramento mensal",
                "Comunicação preventiva",
                "Atividades de engajamento"
            ]
        }
        return actions.get(risk_level, ["Monitoramento padrão"])