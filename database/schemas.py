from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

# Modelo para a tabela de Clientes
class Cliente(SQLModel, table=True):
    __tablename__ = "clientes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    cpf: Optional[str] = Field(default=None)
    nome: str
    email: str
    telefone: Optional[str] = Field(default=None)
    status: str = Field(default="Ativo")  # Ativo, Inativo
    data_cadastro: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

# Modelo para a tabela de Tutores
class Tutor(SQLModel, table=True):
    __tablename__ = "tutores"
    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str
    cpf: Optional[str] = Field(default=None)
    estado_civil: Optional[str] = None
    sexo: Optional[str] = None
    email: str
    profissao: Optional[str] = None
    instagram: Optional[str] = None
    data_nascimento: Optional[str] = None
    telefone: Optional[str] = None
    telefone_secundario: Optional[str] = None
    recebedor: Optional[bool] = Field(default=False)
    criador: Optional[bool] = Field(default=False)
    fornecedor: Optional[bool] = Field(default=False)
    forma_pgto_preferencial: Optional[str] = None
    assina: Optional[bool] = Field(default=False)
    autoriza_imagem: Optional[bool] = Field(default=False)
    cep: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    indicacao: Optional[str] = None
    como_conheceu: Optional[str] = None
    dia_pagamento: Optional[str] = None
    observacoes: Optional[str] = None
    status: str = Field(default="Ativo")
    foto_url: Optional[str] = None
    data_cadastro: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

# Modelo para a tabela de Produtos
class Produto(SQLModel, table=True):
    __tablename__ = "produtos"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str
    categoria: str
    preco: float
    estoque: int
    status: str = Field(default="Disponível")  # Disponível, Sem Estoque

# Modelo para a tabela de Vendas
class Venda(SQLModel, table=True):
    __tablename__ = "vendas"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    cliente_id: int = Field(foreign_key="clientes.id")
    produto_id: int = Field(foreign_key="produtos.id")
    quantidade: int
    valor_total: float
    data_venda: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

# Modelo para a tabela de Usuários (Autenticação)
class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    nome: str
    email: str
    cargo: str = Field(default="Colaborador")

# Modelo para a tabela de Pets
class Pet(SQLModel, table=True):
    __tablename__ = "pets"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    tutor_id: int = Field(foreign_key="tutores.id")
    nome: str
    apelido: Optional[str] = None
    sexo: str
    especie: str
    raca: str
    cor: str
    data_nascimento: str
    peso: float
    porte: str
    data_cio: Optional[str] = None
    pelagem: str
    castrado: bool = Field(default=False)
    treinado: bool = Field(default=False)
    data_obito: Optional[str] = None
    restricao_alimentar: Optional[str] = None
    racao: Optional[str] = None
    autoriza_imagem: bool = Field(default=False)
    foto_url: Optional[str] = None
    status: str = Field(default="Ativo")
    data_cadastro: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))


