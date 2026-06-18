import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlmodel import Session, select
from database.connection import engine
from database.schemas import Usuario

with Session(engine) as session:
    users = session.exec(select(Usuario)).all()
    print(f"Total de usuarios: {len(users)}")
    for u in users:
        print(f"ID: {u.id}, Nome: {u.nome}, Username: {u.username}, Cargo: {u.cargo}")
