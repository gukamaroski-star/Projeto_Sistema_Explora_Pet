import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select, text
from database.connection import engine
from database.schemas import Usuario

with Session(engine) as session:
    # 1. Verifica se o usuário com ID 2 existe
    user_2 = session.get(Usuario, 2)
    if user_2:
        print(f"Alterando ID de {user_2.nome} ({user_2.username}) de 2 para 1...")
        # Como o ID é chave primária, fazemos via SQL direto
        session.execute(text("UPDATE usuarios SET id = 1 WHERE id = 2"))
        session.commit()
        print("ID de usuário alterado com sucesso!")
    else:
        print("Usuário ID 2 não encontrado.")

with Session(engine) as session:
    users = session.exec(select(Usuario)).all()
    print("\nEstado atual dos usuários no banco:")
    for u in users:
        print(f"ID: {u.id}, Nome: {u.nome}, Username: {u.username}, Cargo: {u.cargo}")
