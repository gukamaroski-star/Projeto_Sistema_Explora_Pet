import os
import sys
# Comentário de teste 4 para forçar o commit e deploy automático

# Garante que o diretório raiz esteja no sys.path para permitir imports absolutos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session
from database.connection import engine, create_db_and_tables
from database.schemas import Cliente, Produto, Venda, Usuario
from datetime import datetime, timedelta

def seed_database():
    print("Iniciando a criação do banco de dados e das tabelas...")
    create_db_and_tables()
    print("Tabelas criadas com sucesso!")

    # Usa uma sessão para inserir dados iniciais
    with Session(engine) as session:
        # 0. Cadastro do usuário Administrador padrão para login
        if session.query(Usuario).first() is None:
            print("Cadastrando administrador padrão (admin)...")
            import hashlib
            import secrets
            salt = secrets.token_hex(16)
            hash_bytes = hashlib.pbkdf2_hmac('sha256', b"admin123", salt.encode(), 100000)
            hashed_pw = f"{salt}${hash_bytes.hex()}"
            
            admin = Usuario(
                username="admin",
                hashed_password=hashed_pw,
                nome="Administrador",
                email="admin@explorapet.com",
                cargo="Administrador"
            )
            session.add(admin)
            session.commit()
            print("Administrador padrão criado com sucesso (Usuário: admin | Senha: admin123)")

        # Verifica se já existem dados para evitar duplicar
        if session.query(Cliente).first() is not None:
            print("O banco de dados já possui dados cadastrados. Pulando o seed.")
            return

        print("Populando dados fictícios (Seed) para testes...")

        # 1. Cadastro de Clientes
        clientes = [
            Cliente(nome="João Silva", email="joao.silva@email.com", telefone="(11) 98765-4321", status="Ativo", data_cadastro=(datetime.now() - timedelta(days=20)).strftime("%Y-%m-%d %H:%M:%S")),
            Cliente(nome="Maria Oliveira", email="maria.oliveira@email.com", telefone="(21) 99876-5432", status="Ativo", data_cadastro=(datetime.now() - timedelta(days=15)).strftime("%Y-%m-%d %H:%M:%S")),
            Cliente(nome="Pedro Souza", email="pedro.souza@email.com", telefone="(31) 97654-3210", status="Ativo", data_cadastro=(datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d %H:%M:%S")),
            Cliente(nome="Ana Santos", email="ana.santos@email.com", telefone="(11) 96543-2109", status="Inativo", data_cadastro=(datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S")),
            Cliente(nome="Lucas Costa", email="lucas.costa@email.com", telefone="(51) 95432-1098", status="Ativo", data_cadastro=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        ]
        
        for c in clientes:
            session.add(c)
        session.commit()
        
        # Recarrega para obter os IDs gerados
        for c in clientes:
            session.refresh(c)

        # 2. Cadastro de Produtos
        produtos = [
            Produto(nome="Brinquedo Mordedor KONG", categoria="Brinquedos", preco=89.90, estoque=30, status="Disponível"),
            Produto(nome="Bola Ultra Resistente M", categoria="Brinquedos", preco=29.90, estoque=50, status="Disponível"),
            Produto(nome="Petisco Orgânico Calming", categoria="Alimentação", preco=34.90, estoque=40, status="Disponível"),
            Produto(nome="Ração Super Premium Cães 10kg", categoria="Alimentação", preco=249.90, estoque=15, status="Disponível"),
            Produto(nome="Guia de Treino Longa (5m)", categoria="Acessórios", preco=59.90, estoque=20, status="Disponível"),
            Produto(nome="Peitoral Antipuxão Confort", categoria="Acessórios", preco=119.90, estoque=0, status="Sem Estoque"),
            Produto(nome="Consultoria de Comportamento Canino", categoria="Serviços", preco=180.00, estoque=10, status="Disponível"),
            Produto(nome="Curso Online: Adestramento Passo a Passo", categoria="Serviços", preco=350.00, estoque=100, status="Disponível")
        ]
        
        for p in produtos:
            session.add(p)
        session.commit()
 
        for p in produtos:
            session.refresh(p)
 
        # 3. Registro de Vendas Realistas
        vendas = [
            Venda(cliente_id=clientes[0].id, produto_id=produtos[6].id, quantidade=1, valor_total=180.00, data_venda=(datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S")),
            Venda(cliente_id=clientes[1].id, produto_id=produtos[2].id, quantidade=3, valor_total=104.70, data_venda=(datetime.now() - timedelta(days=4)).strftime("%Y-%m-%d %H:%M:%S")),
            Venda(cliente_id=clientes[1].id, produto_id=produtos[0].id, quantidade=1, valor_total=89.90, data_venda=(datetime.now() - timedelta(days=4)).strftime("%Y-%m-%d %H:%M:%S")),
            Venda(cliente_id=clientes[2].id, produto_id=produtos[3].id, quantidade=1, valor_total=249.90, data_venda=(datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")),
            Venda(cliente_id=clientes[4].id, produto_id=produtos[4].id, quantidade=2, valor_total=119.80, data_venda=(datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")),
            Venda(cliente_id=clientes[0].id, produto_id=produtos[1].id, quantidade=1, valor_total=29.90, data_venda=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        ]
        
        for v in vendas:
            session.add(v)
        session.commit()

        print("Banco de dados populado com sucesso!")

if __name__ == "__main__":
    seed_database()
