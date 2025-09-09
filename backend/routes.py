from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import date, datetime
from .server import (
    api_router, get_current_user, create_entity, get_entities, 
    get_entity_by_id, update_entity, delete_entity, db
)
from .server import (
    Escola, EscolaCreate, Veiculo, VeiculoCreate, Rota, RotaCreate,
    Aluno, AlunoCreate, Frequencia, FrequenciaCreate, Ocorrencia, OcorrenciaCreate,
    StatusEnum, TurnoEnum
)

# Escola Routes
@api_router.post("/escolas", response_model=Escola)
async def create_escola(escola_data: EscolaCreate, current_user: dict = Depends(get_current_user)):
    escola = Escola(**escola_data.dict())
    return await create_entity("escolas", escola.dict())

@api_router.get("/escolas", response_model=List[Escola])
async def get_escolas(
    limit: int = Query(100, le=1000),
    current_user: dict = Depends(get_current_user)
):
    escolas = await get_entities("escolas", limit=limit)
    return [Escola(**escola) for escola in escolas]

@api_router.get("/escolas/{escola_id}", response_model=Escola)
async def get_escola(escola_id: str, current_user: dict = Depends(get_current_user)):
    escola = await get_entity_by_id("escolas", escola_id)
    if not escola:
        raise HTTPException(status_code=404, detail="Escola não encontrada")
    return Escola(**escola)

@api_router.put("/escolas/{escola_id}", response_model=Escola)
async def update_escola(
    escola_id: str, 
    escola_data: EscolaCreate, 
    current_user: dict = Depends(get_current_user)
):
    success = await update_entity("escolas", escola_id, escola_data.dict())
    if not success:
        raise HTTPException(status_code=404, detail="Escola não encontrada")
    
    updated_escola = await get_entity_by_id("escolas", escola_id)
    return Escola(**updated_escola)

@api_router.delete("/escolas/{escola_id}")
async def delete_escola(escola_id: str, current_user: dict = Depends(get_current_user)):
    success = await delete_entity("escolas", escola_id)
    if not success:
        raise HTTPException(status_code=404, detail="Escola não encontrada")
    return {"message": "Escola excluída com sucesso"}

# Veiculo Routes
@api_router.post("/veiculos", response_model=Veiculo)
async def create_veiculo(veiculo_data: VeiculoCreate, current_user: dict = Depends(get_current_user)):
    veiculo = Veiculo(**veiculo_data.dict())
    return await create_entity("veiculos", veiculo.dict())

@api_router.get("/veiculos", response_model=List[Veiculo])
async def get_veiculos(
    status: Optional[StatusEnum] = None,
    limit: int = Query(100, le=1000),
    current_user: dict = Depends(get_current_user)
):
    filters = {"status": status} if status else {}
    veiculos = await get_entities("veiculos", filters=filters, limit=limit)
    return [Veiculo(**veiculo) for veiculo in veiculos]

@api_router.get("/veiculos/{veiculo_id}", response_model=Veiculo)
async def get_veiculo(veiculo_id: str, current_user: dict = Depends(get_current_user)):
    veiculo = await get_entity_by_id("veiculos", veiculo_id)
    if not veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return Veiculo(**veiculo)

@api_router.put("/veiculos/{veiculo_id}", response_model=Veiculo)
async def update_veiculo(
    veiculo_id: str, 
    veiculo_data: VeiculoCreate, 
    current_user: dict = Depends(get_current_user)
):
    success = await update_entity("veiculos", veiculo_id, veiculo_data.dict())
    if not success:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    updated_veiculo = await get_entity_by_id("veiculos", veiculo_id)
    return Veiculo(**updated_veiculo)

@api_router.delete("/veiculos/{veiculo_id}")
async def delete_veiculo(veiculo_id: str, current_user: dict = Depends(get_current_user)):
    success = await delete_entity("veiculos", veiculo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return {"message": "Veículo excluído com sucesso"}

# Rota Routes
@api_router.post("/rotas", response_model=Rota)
async def create_rota(rota_data: RotaCreate, current_user: dict = Depends(get_current_user)):
    rota = Rota(**rota_data.dict())
    return await create_entity("rotas", rota.dict())

@api_router.get("/rotas", response_model=List[Rota])
async def get_rotas(
    escola_id: Optional[str] = None,
    turno: Optional[TurnoEnum] = None,
    status: Optional[StatusEnum] = None,
    limit: int = Query(100, le=1000),
    current_user: dict = Depends(get_current_user)
):
    filters = {}
    if escola_id:
        filters["escola_id"] = escola_id
    if turno:
        filters["turno"] = turno
    if status:
        filters["status"] = status
    
    rotas = await get_entities("rotas", filters=filters, limit=limit)
    return [Rota(**rota) for rota in rotas]

@api_router.get("/rotas/{rota_id}", response_model=Rota)
async def get_rota(rota_id: str, current_user: dict = Depends(get_current_user)):
    rota = await get_entity_by_id("rotas", rota_id)
    if not rota:
        raise HTTPException(status_code=404, detail="Rota não encontrada")
    return Rota(**rota)

@api_router.put("/rotas/{rota_id}", response_model=Rota)
async def update_rota(
    rota_id: str, 
    rota_data: RotaCreate, 
    current_user: dict = Depends(get_current_user)
):
    success = await update_entity("rotas", rota_id, rota_data.dict())
    if not success:
        raise HTTPException(status_code=404, detail="Rota não encontrada")
    
    updated_rota = await get_entity_by_id("rotas", rota_id)
    return Rota(**updated_rota)

@api_router.delete("/rotas/{rota_id}")
async def delete_rota(rota_id: str, current_user: dict = Depends(get_current_user)):
    success = await delete_entity("rotas", rota_id)
    if not success:
        raise HTTPException(status_code=404, detail="Rota não encontrada")
    return {"message": "Rota excluída com sucesso"}

# Aluno Routes
@api_router.post("/alunos", response_model=Aluno)
async def create_aluno(aluno_data: AlunoCreate, current_user: dict = Depends(get_current_user)):
    # Check if RA already exists
    existing_aluno = await db.alunos.find_one({"ra": aluno_data.ra})
    if existing_aluno:
        raise HTTPException(status_code=400, detail="RA já cadastrado")
    
    aluno = Aluno(**aluno_data.dict())
    
    # Update rota vagas_ocupadas if assigned
    if aluno.rota_id:
        rota = await get_entity_by_id("rotas", aluno.rota_id)
        if rota:
            vagas_necessarias = 2 if aluno.tem_acompanhante else 1
            if rota["vagas_ocupadas"] + vagas_necessarias <= rota["capacidade_maxima"]:
                await update_entity("rotas", aluno.rota_id, {
                    "vagas_ocupadas": rota["vagas_ocupadas"] + vagas_necessarias
                })
            else:
                raise HTTPException(status_code=400, detail="Rota não possui vagas suficientes")
    
    return await create_entity("alunos", aluno.dict())

@api_router.get("/alunos", response_model=List[Aluno])
async def get_alunos(
    escola_id: Optional[str] = None,
    rota_id: Optional[str] = None,
    turno: Optional[TurnoEnum] = None,
    status: Optional[StatusEnum] = None,
    limit: int = Query(100, le=1000),
    current_user: dict = Depends(get_current_user)
):
    filters = {}
    if escola_id:
        filters["escola_id"] = escola_id
    if rota_id:
        filters["rota_id"] = rota_id
    if turno:
        filters["turno"] = turno
    if status:
        filters["status"] = status
    
    alunos = await get_entities("alunos", filters=filters, limit=limit)
    return [Aluno(**aluno) for aluno in alunos]

@api_router.get("/alunos/{aluno_id}", response_model=Aluno)
async def get_aluno(aluno_id: str, current_user: dict = Depends(get_current_user)):
    aluno = await get_entity_by_id("alunos", aluno_id)
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    return Aluno(**aluno)

@api_router.put("/alunos/{aluno_id}", response_model=Aluno)
async def update_aluno(
    aluno_id: str, 
    aluno_data: AlunoCreate, 
    current_user: dict = Depends(get_current_user)
):
    current_aluno = await get_entity_by_id("alunos", aluno_id)
    if not current_aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    # Handle rota change
    old_rota_id = current_aluno.get("rota_id")
    new_rota_id = aluno_data.rota_id
    
    if old_rota_id != new_rota_id:
        # Remove from old rota
        if old_rota_id:
            old_rota = await get_entity_by_id("rotas", old_rota_id)
            if old_rota:
                vagas_liberadas = 2 if current_aluno.get("tem_acompanhante") else 1
                await update_entity("rotas", old_rota_id, {
                    "vagas_ocupadas": max(0, old_rota["vagas_ocupadas"] - vagas_liberadas)
                })
        
        # Add to new rota
        if new_rota_id:
            new_rota = await get_entity_by_id("rotas", new_rota_id)
            if new_rota:
                vagas_necessarias = 2 if aluno_data.tem_acompanhante else 1
                if new_rota["vagas_ocupadas"] + vagas_necessarias <= new_rota["capacidade_maxima"]:
                    await update_entity("rotas", new_rota_id, {
                        "vagas_ocupadas": new_rota["vagas_ocupadas"] + vagas_necessarias
                    })
                else:
                    raise HTTPException(status_code=400, detail="Nova rota não possui vagas suficientes")
    
    success = await update_entity("alunos", aluno_id, aluno_data.dict())
    if not success:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    updated_aluno = await get_entity_by_id("alunos", aluno_id)
    return Aluno(**updated_aluno)

@api_router.delete("/alunos/{aluno_id}")
async def delete_aluno(aluno_id: str, current_user: dict = Depends(get_current_user)):
    aluno = await get_entity_by_id("alunos", aluno_id)
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    # Free rota slots
    if aluno.get("rota_id"):
        rota = await get_entity_by_id("rotas", aluno["rota_id"])
        if rota:
            vagas_liberadas = 2 if aluno.get("tem_acompanhante") else 1
            await update_entity("rotas", aluno["rota_id"], {
                "vagas_ocupadas": max(0, rota["vagas_ocupadas"] - vagas_liberadas)
            })
    
    success = await delete_entity("alunos", aluno_id)
    if not success:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    return {"message": "Aluno excluído com sucesso"}

# Frequencia Routes
@api_router.post("/frequencias", response_model=Frequencia)
async def create_frequencia(
    frequencia_data: FrequenciaCreate, 
    current_user: dict = Depends(get_current_user)
):
    # Calculate totals
    total_alunos = len(frequencia_data.registros)
    total_presentes = sum(1 for r in frequencia_data.registros if r.presente)
    total_ausentes = total_alunos - total_presentes
    
    frequencia = Frequencia(
        monitor_id=current_user["id"],
        total_alunos=total_alunos,
        total_presentes=total_presentes,
        total_ausentes=total_ausentes,
        **frequencia_data.dict()
    )
    
    return await create_entity("frequencias", frequencia.dict())

@api_router.get("/frequencias", response_model=List[Frequencia])
async def get_frequencias(
    rota_id: Optional[str] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    limit: int = Query(100, le=1000),
    current_user: dict = Depends(get_current_user)
):
    filters = {}
    if rota_id:
        filters["rota_id"] = rota_id
    if data_inicio:
        filters["data"] = {"$gte": data_inicio.isoformat()}
    if data_fim:
        if "data" in filters:
            filters["data"]["$lte"] = data_fim.isoformat()
        else:
            filters["data"] = {"$lte": data_fim.isoformat()}
    
    frequencias = await get_entities("frequencias", filters=filters, limit=limit)
    return [Frequencia(**freq) for freq in frequencias]

# Ocorrencia Routes
@api_router.post("/ocorrencias", response_model=Ocorrencia)
async def create_ocorrencia(
    ocorrencia_data: OcorrenciaCreate, 
    current_user: dict = Depends(get_current_user)
):
    ocorrencia = Ocorrencia(
        monitor_id=current_user["id"],
        **ocorrencia_data.dict()
    )
    return await create_entity("ocorrencias", ocorrencia.dict())

@api_router.get("/ocorrencias", response_model=List[Ocorrencia])
async def get_ocorrencias(
    rota_id: Optional[str] = None,
    status_resolucao: Optional[str] = None,
    prioridade: Optional[str] = None,
    limit: int = Query(100, le=1000),
    current_user: dict = Depends(get_current_user)
):
    filters = {}
    if rota_id:
        filters["rota_id"] = rota_id
    if status_resolucao:
        filters["status_resolucao"] = status_resolucao
    if prioridade:
        filters["prioridade"] = prioridade
    
    ocorrencias = await get_entities("ocorrencias", filters=filters, limit=limit)
    return [Ocorrencia(**ocorr) for ocorr in ocorrencias]

@api_router.put("/ocorrencias/{ocorrencia_id}/resolver")
async def resolver_ocorrencia(
    ocorrencia_id: str,
    observacoes: str,
    current_user: dict = Depends(get_current_user)
):
    success = await update_entity("ocorrencias", ocorrencia_id, {
        "status_resolucao": "resolvido",
        "responsavel_resolucao": current_user["id"],
        "data_resolucao": datetime.utcnow(),
        "observacoes_resolucao": observacoes
    })
    
    if not success:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    
    return {"message": "Ocorrência resolvida com sucesso"}