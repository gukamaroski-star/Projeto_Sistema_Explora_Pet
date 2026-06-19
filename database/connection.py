import os
from dotenv import load_dotenv
from sqlmodel import create_engine, SQLModel, Session, text
from sqlalchemy import event

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

# Obtém a URL de conexão do banco de dados e garante que aponte de forma absoluta para a pasta database/
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Obtém o diretório do projeto (um nível acima deste arquivo)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'database', 'explorapet.db')}"

# Configurações adicionais para o SQLite (necessário por conta de threads no FastAPI)
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Cria a engine de conexão do SQLModel (echo=False para melhor performance)
engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=-5000")
        cursor.execute("PRAGMA temp_store=MEMORY")
        cursor.close()

# Função para criar o banco de dados e as tabelas definidas em models.py
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    
    # Auto-migração: adiciona as colunas 'cargo' e 'telas_liberadas' se estiverem faltando
    with Session(engine) as session:
        try:
            if engine.dialect.name == "sqlite":
                columns_info = session.execute(text("PRAGMA table_info(usuarios)")).all()
                columns = [col[1] for col in columns_info]
            else:
                columns_info = session.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios'")).all()
                columns = [col[0] for col in columns_info]

            if "cargo" not in columns:
                print("Alterando tabela 'usuarios' para adicionar coluna 'cargo'...")
                session.execute(text("ALTER TABLE usuarios ADD COLUMN cargo VARCHAR DEFAULT 'Colaborador'"))
                session.execute(text("UPDATE usuarios SET cargo = 'Administrador' WHERE username = 'admin'"))
                session.commit()
                print("Coluna 'cargo' migrada com sucesso!")
                
            if "telas_liberadas" not in columns:
                print("Alterando tabela 'usuarios' para adicionar coluna 'telas_liberadas'...")
                session.execute(text("ALTER TABLE usuarios ADD COLUMN telas_liberadas VARCHAR DEFAULT 'dashboard,clientes,pets'"))
                session.execute(text("UPDATE usuarios SET telas_liberadas = 'dashboard,clientes,pets,usuarios,sql-terminal' WHERE cargo = 'Administrador'"))
                session.commit()
                print("Coluna 'telas_liberadas' migrada com sucesso!")
            
            # Migração para a tabela 'pets'
            if engine.dialect.name == "sqlite":
                columns_info_pets = session.execute(text("PRAGMA table_info(pets)")).all()
                columns_pets = [col[1] for col in columns_info_pets]
            else:
                columns_info_pets = session.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'pets'")).all()
                columns_pets = [col[0] for col in columns_info_pets]

            if "responsavel_id" not in columns_pets:
                print("Alterando tabela 'pets' para adicionar coluna 'responsavel_id'...")
                session.execute(text("ALTER TABLE pets ADD COLUMN responsavel_id INTEGER"))
                session.commit()
                print("Coluna 'responsavel_id' migrada com sucesso!")

            # Criação de índices para otimização de consultas
            session.execute(text("CREATE INDEX IF NOT EXISTS ix_responsaveis_nome ON responsaveis (nome)"))
            session.execute(text("CREATE INDEX IF NOT EXISTS ix_responsaveis_cpf ON responsaveis (cpf)"))
            session.execute(text("CREATE INDEX IF NOT EXISTS ix_responsaveis_status ON responsaveis (status)"))
            session.execute(text("CREATE INDEX IF NOT EXISTS ix_pets_nome ON pets (nome)"))
            session.execute(text("CREATE INDEX IF NOT EXISTS ix_pets_responsavel_id ON pets (responsavel_id)"))
            session.commit()
            
        except Exception as e:
            print(f"Erro na migração automática/criação de índices: {e}")

# Dependency generator para obter sessões do banco de dados nas rotas do FastAPI
def get_session():
    with Session(engine) as session:
        yield session
