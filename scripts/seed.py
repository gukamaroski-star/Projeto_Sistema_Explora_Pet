import os
import sys
# Comentário de teste 4 para forçar o commit e deploy automático

# Garante que o diretório raiz esteja no sys.path para permitir imports absolutos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from database.connection import engine, create_db_and_tables
from database.schemas import Usuario, Responsavel
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
        if session.exec(select(Responsavel)).first() is not None:
            print("O banco de dados já possui dados cadastrados. Pulando o seed de responsáveis.")
            return

        print("Populando dados fictícios (Seed) para testes...")
        # Aqui podemos adicionar dados de Responsáveis e Pets futuramente.
        
        print("Banco de dados populado com sucesso!")

if __name__ == "__main__":
    seed_database()
