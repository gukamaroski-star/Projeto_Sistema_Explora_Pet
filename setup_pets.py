import re

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace import line
content = content.replace('from database import engine, get_session, create_db_and_tables, Cliente, Produto, Venda, Tutor, Usuario', 'from database import engine, get_session, create_db_and_tables, Cliente, Produto, Venda, Tutor, Usuario, Pet')

pets_endpoints = '''
# ==========================================
# ROTAS DE PETS
# ==========================================

class PetCreate(BaseModel):
    nome: str
    especie: str
    raca: Optional[str] = None
    data_nascimento: Optional[str] = None
    observacoes: Optional[str] = None
    tutor_id: int

@app.post("/api/pets")
def create_pet(pet: PetCreate, db: Session = Depends(get_session)):
    tutor = db.get(Tutor, pet.tutor_id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Responsável não encontrado")
    db_pet = Pet(
        nome=pet.nome,
        especie=pet.especie,
        raca=pet.raca,
        data_nascimento=pet.data_nascimento,
        observacoes=pet.observacoes,
        tutor_id=pet.tutor_id
    )
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

@app.get("/api/pets")
def read_pets(tutor_id: Optional[int] = None, db: Session = Depends(get_session)):
    query = select(Pet)
    if tutor_id:
        query = query.where(Pet.tutor_id == tutor_id)
    pets = db.exec(query).all()
    return pets

@app.get("/api/pets/{pet_id}")
def read_pet(pet_id: int, db: Session = Depends(get_session)):
    pet = db.get(Pet, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    return pet

@app.put("/api/pets/{pet_id}")
def update_pet(pet_id: int, pet: PetCreate, db: Session = Depends(get_session)):
    db_pet = db.get(Pet, pet_id)
    if not db_pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
        
    db_pet.nome = pet.nome
    db_pet.especie = pet.especie
    db_pet.raca = pet.raca
    db_pet.data_nascimento = pet.data_nascimento
    db_pet.observacoes = pet.observacoes
    db_pet.tutor_id = pet.tutor_id
    
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

@app.delete("/api/pets/{pet_id}")
def delete_pet(pet_id: int, db: Session = Depends(get_session)):
    pet = db.get(Pet, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    db.delete(pet)
    db.commit()
    return {"ok": True}
'''

content = content.replace('# Servindo Arquivos Estáticos', pets_endpoints + '\n\n# Servindo Arquivos Estáticos')

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
