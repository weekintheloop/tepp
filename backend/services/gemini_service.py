import os
import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, date

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Serviço avançado para integração com Google Gemini 2.5 Flash
    Implementa chatbot e geração de relatórios inteligentes
    """
    
    def __init__(self):
        self.api_key = "AIzaSyB82LDa8_GSbbMtrBM-wg70DumBl1ESXhU"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model = "gemini-2.0-flash-exp"
        self.headers = {
            "Content-Type": "application/json"
        }
        
    async def _make_request(self, endpoint: str, payload: Dict) -> Dict:
        """Faz requisição para a API do Gemini"""
        try:
            url = f"{self.base_url}/{endpoint}?key={self.api_key}"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=self.headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {"success": True, "data": result}
                    else:
                        error_text = await response.text()
                        logger.error(f"Gemini API error: {response.status} - {error_text}")
                        return {"success": False, "error": f"API Error: {response.status}"}
                        
        except Exception as e:
            logger.error(f"Error making Gemini request: {e}")
            return {"success": False, "error": str(e)}
    
    async def chat_completion(self, message: str, context: Optional[Dict] = None) -> Dict:
        """
        Chatbot principal do SIG-TE
        """
        try:
            system_prompt = self._get_system_prompt()
            
            # Preparar contexto se fornecido
            context_text = ""
            if context:
                context_text = f"\n\nContexto atual do sistema:\n{json.dumps(context, indent=2, ensure_ascii=False)}"
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": f"{system_prompt}\n\nUsuário: {message}{context_text}"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 2048,
                }
            }
            
            result = await self._make_request(f"{self.model}:generateContent", payload)
            
            if result["success"]:
                response_text = result["data"]["candidates"][0]["content"]["parts"][0]["text"]
                return {
                    "success": True,
                    "response": response_text,
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                return result
                
        except Exception as e:
            logger.error(f"Error in chat completion: {e}")
            return {"success": False, "error": str(e)}
    
    def _get_system_prompt(self) -> str:
        """Prompt do sistema para o chatbot SIG-TE"""
        return """Você é o assistente virtual do SIG-TE (Sistema de Gestão de Transporte Escolar).

        SUAS FUNÇÕES:
        - Ajudar usuários a navegar e usar o sistema
        - Responder dúvidas sobre transporte escolar
        - Auxiliar com análise de dados e relatórios
        - Fornecer insights sobre frequência, rotas e gestão
        - Explicar funcionalidades do sistema
        
        CONTEXTO DO SISTEMA:
        - Sistema de gestão de transporte escolar
        - Controla alunos, rotas, veículos, frequência
        - Monitora ocorrências e manutenção
        - Gera relatórios e analytics
        
        DIRETRIZES:
        - Seja prestativo e profissional
        - Use linguagem clara e objetiva
        - Forneça informações práticas
        - Quando possível, sugira ações específicas
        - Mantenha foco no contexto educacional
        - Responda sempre em português brasileiro
        
        LIMITAÇÕES:
        - Não execute ações diretamente no sistema
        - Não forneça informações pessoais de alunos
        - Sempre priorize a segurança e privacidade"""
    
    async def generate_intelligent_report(self, report_type: str, data: Dict, options: Dict = None) -> Dict:
        """
        Gera relatórios inteligentes usando IA
        """
        try:
            report_prompts = {
                "frequency_analysis": self._get_frequency_analysis_prompt(),
                "route_efficiency": self._get_route_efficiency_prompt(), 
                "risk_students": self._get_risk_students_prompt(),
                "maintenance_prediction": self._get_maintenance_prompt(),
                "executive_summary": self._get_executive_summary_prompt(),
                "attendance_insights": self._get_attendance_insights_prompt(),
                "operational_report": self._get_operational_report_prompt()
            }
            
            if report_type not in report_prompts:
                return {"success": False, "error": "Tipo de relatório não suportado"}
            
            prompt = report_prompts[report_type]
            data_json = json.dumps(data, indent=2, ensure_ascii=False, default=str)
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": f"{prompt}\n\nDados para análise:\n{data_json}\n\nOpções: {json.dumps(options or {}, ensure_ascii=False)}"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "topK": 20,
                    "topP": 0.8,
                    "maxOutputTokens": 4096,
                }
            }
            
            result = await self._make_request(f"{self.model}:generateContent", payload)
            
            if result["success"]:
                analysis = result["data"]["candidates"][0]["content"]["parts"][0]["text"]
                
                return {
                    "success": True,
                    "report": {
                        "type": report_type,
                        "generated_at": datetime.utcnow().isoformat(),
                        "analysis": analysis,
                        "data_points": len(str(data)),
                        "options": options or {}
                    }
                }
            else:
                return result
                
        except Exception as e:
            logger.error(f"Error generating intelligent report: {e}")
            return {"success": False, "error": str(e)}
    
    def _get_frequency_analysis_prompt(self) -> str:
        return """Analise os dados de frequência escolar fornecidos e gere um relatório detalhado.

        ANÁLISE REQUERIDA:
        1. **Padrões de Frequência**:
           - Tendências gerais de presença/ausência
           - Variações por dia da semana
           - Sazonalidade (se dados suficientes)
           
        2. **Identificação de Riscos**:
           - Alunos com baixa frequência
           - Rotas com problemas recorrentes
           - Padrões preocupantes
           
        3. **Insights Acionáveis**:
           - Recomendações específicas
           - Ações preventivas
           - Melhorias sugeridas
           
        4. **Métricas Chave**:
           - Taxa de frequência geral
           - Comparativos por período
           - Indicadores de qualidade
        
        Formate a resposta em seções claras com dados quantitativos e qualitativos."""
    
    def _get_route_efficiency_prompt(self) -> str:
        return """Analise a eficiência das rotas de transporte escolar baseado nos dados fornecidos.

        ANÁLISE REQUERIDA:
        1. **Eficiência Operacional**:
           - Taxa de ocupação por rota
           - Tempo médio de trajeto
           - Pontualidade e atrasos
           
        2. **Otimização de Recursos**:
           - Rotas subutilizadas ou superlotadas
           - Oportunidades de consolidação
           - Redistribuição de alunos
           
        3. **Qualidade do Serviço**:
           - Satisfação inferida dos dados
           - Problemas recorrentes
           - Pontos de melhoria
           
        4. **Recomendações Estratégicas**:
           - Ajustes de rota sugeridos
           - Realocação de recursos
           - Melhorias operacionais
        
        Inclua análise quantitativa com percentuais e métricas específicas."""
    
    def _get_risk_students_prompt(self) -> str:
        return """Analise o risco de evasão escolar baseado nos padrões de frequência e dados comportamentais.

        ANÁLISE REQUERIDA:
        1. **Classificação de Risco**:
           - Alunos em risco crítico, alto, médio e baixo
           - Fatores contribuintes para cada caso
           - Padrões comportamentais identificados
           
        2. **Análise Preditiva**:
           - Probabilidade de evasão
           - Tendências preocupantes
           - Sinais de alerta antecipados
           
        3. **Perfil de Risco**:
           - Características comuns dos alunos em risco
           - Fatores socioeconômicos observáveis
           - Padrões de ausência
           
        4. **Plano de Intervenção**:
           - Ações imediatas recomendadas
           - Estratégias de acompanhamento
           - Recursos necessários
        
        Priorize estudantes que necessitam intervenção urgente."""
    
    def _get_maintenance_prompt(self) -> str:
        return """Analise os dados de manutenção de veículos e prediga necessidades futuras.

        ANÁLISE REQUERIDA:
        1. **Estado Atual da Frota**:
           - Condição geral dos veículos
           - Veículos com manutenção em atraso
           - Custos de manutenção por veículo
           
        2. **Previsão de Manutenção**:
           - Próximas manutenções programadas
           - Estimativa de custos futuros
           - Veículos com risco de quebra
           
        3. **Otimização de Custos**:
           - Oportunidades de economia
           - Substituição vs. reparo
           - Programação otimizada
           
        4. **Planejamento Estratégico**:
           - Necessidade de novos veículos
           - Orçamento recomendado
           - Cronograma de renovação
        
        Foque em aspectos financeiros e operacionais práticos."""
    
    def _get_executive_summary_prompt(self) -> str:
        return """Gere um resumo executivo completo do sistema de transporte escolar.

        RESUMO EXECUTIVO DEVE INCLUIR:
        1. **Visão Geral**:
           - Status geral do sistema
           - Principais métricas de performance
           - Situação atual vs metas
           
        2. **Indicadores Chave**:
           - KPIs principais com tendências
           - Comparativos mensais/anuais
           - Benchmarks de qualidade
           
        3. **Destaques e Conquistas**:
           - Sucessos do período
           - Melhorias implementadas
           - Reconhecimentos obtidos
           
        4. **Desafios e Oportunidades**:
           - Principais obstáculos
           - Áreas de melhoria identificadas
           - Oportunidades de crescimento
           
        5. **Recomendações Estratégicas**:
           - Prioridades para próximo período
           - Investimentos recomendados
           - Ações estratégicas
        
        Mantenha linguagem executiva, objetiva e focada em resultados."""
    
    def _get_attendance_insights_prompt(self) -> str:
        return """Analise padrões de frequência escolar e gere insights acionáveis.

        INSIGHTS REQUERIDOS:
        1. **Padrões Temporais**:
           - Variações por dia da semana
           - Sazonalidade e eventos especiais
           - Impacto de feriados e férias
           
        2. **Análise Geográfica**:
           - Frequência por região/rota
           - Correlação com distância escola-casa
           - Fatores socioeconômicos regionais
           
        3. **Fatores Influenciadores**:
           - Clima e condições meteorológicas
           - Eventos escolares e comunitários
           - Problemas de transporte
           
        4. **Segmentação de Alunos**:
           - Perfis de frequência
           - Características dos grupos
           - Necessidades específicas
           
        5. **Ações Recomendadas**:
           - Intervenções preventivas
           - Melhorias no sistema
           - Engajamento de famílias
        
        Forneça dados estatísticos e recomendações práticas."""
    
    def _get_operational_report_prompt(self) -> str:
        return """Gere relatório operacional completo do transporte escolar.

        RELATÓRIO OPERACIONAL:
        1. **Performance Operacional**:
           - Eficiência das rotas
           - Pontualidade dos serviços
           - Utilização da frota
           
        2. **Qualidade do Serviço**:
           - Indicadores de satisfação
           - Tempo de viagem médio
           - Conforto e segurança
           
        3. **Gestão de Recursos**:
           - Utilização de motoristas
           - Custos operacionais
           - Manutenção preventiva
           
        4. **Incidentes e Melhorias**:
           - Ocorrências registradas
           - Ações corretivas tomadas
           - Melhorias implementadas
           
        5. **Projeções e Planejamento**:
           - Tendências futuras
           - Necessidades de expansão
           - Investimentos planejados
        
        Inclua gráficos conceituais e dados quantitativos detalhados."""
    
    async def generate_smart_insights(self, data: Dict, context: str = "general") -> Dict:
        """
        Gera insights inteligentes baseados nos dados do sistema
        """
        try:
            prompt = f"""Como especialista em transporte escolar e análise de dados, analise as informações fornecidas e gere insights valiosos.

            CONTEXTO: {context}
            
            INSIGHTS SOLICITADOS:
            1. **Descobertas Principais**: O que os dados revelam de mais importante?
            2. **Tendências Identificadas**: Quais padrões emergem dos dados?
            3. **Oportunidades**: Onde existem chances de melhoria?
            4. **Riscos**: Que problemas potenciais são identificáveis?
            5. **Recomendações**: Que ações específicas você sugere?
            
            Formate a resposta de forma estruturada e acionável."""
            
            data_json = json.dumps(data, indent=2, ensure_ascii=False, default=str)
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": f"{prompt}\n\nDados:\n{data_json}"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.6,
                    "topK": 30,
                    "topP": 0.9,
                    "maxOutputTokens": 3072,
                }
            }
            
            result = await self._make_request(f"{self.model}:generateContent", payload)
            
            if result["success"]:
                insights = result["data"]["candidates"][0]["content"]["parts"][0]["text"]
                
                return {
                    "success": True,
                    "insights": insights,
                    "context": context,
                    "generated_at": datetime.utcnow().isoformat(),
                    "data_points_analyzed": len(str(data))
                }
            else:
                return result
                
        except Exception as e:
            logger.error(f"Error generating smart insights: {e}")
            return {"success": False, "error": str(e)}
    
    async def analyze_conversation_intent(self, message: str) -> Dict:
        """
        Analisa a intenção da conversa para direcionamento inteligente
        """
        try:
            prompt = """Analise a mensagem do usuário e identifique:

            1. INTENÇÃO PRINCIPAL (uma das seguintes):
               - help_navigation (ajuda para navegar no sistema)
               - data_query (consulta sobre dados específicos)
               - report_request (solicitação de relatório)
               - problem_solving (resolução de problemas)
               - feature_explanation (explicação de funcionalidade)
               - general_question (pergunta geral)
            
            2. ENTIDADES MENCIONADAS:
               - alunos, rotas, veículos, frequência, etc.
            
            3. AÇÃO SUGERIDA:
               - Que ação específica o sistema deveria tomar?
            
            4. PRIORIDADE:
               - baixa, media, alta, urgente
            
            Responda apenas em formato JSON válido."""
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": f"{prompt}\n\nMensagem do usuário: {message}"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.1,
                    "topK": 10,
                    "topP": 0.5,
                    "maxOutputTokens": 512,
                }
            }
            
            result = await self._make_request(f"{self.model}:generateContent", payload)
            
            if result["success"]:
                response_text = result["data"]["candidates"][0]["content"]["parts"][0]["text"]
                # Tentar extrair JSON da resposta
                try:
                    import re
                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                    if json_match:
                        intent_data = json.loads(json_match.group())
                        return {"success": True, "intent": intent_data}
                    else:
                        # Fallback para análise simples
                        return {
                            "success": True,
                            "intent": {
                                "main_intent": "general_question",
                                "entities": [],
                                "suggested_action": "provide_general_help",
                                "priority": "media"
                            }
                        }
                except json.JSONDecodeError:
                    return {"success": False, "error": "Invalid JSON response from AI"}
            else:
                return result
                
        except Exception as e:
            logger.error(f"Error analyzing conversation intent: {e}")
            return {"success": False, "error": str(e)}