import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlmodel import Session, select
from database.connection import engine
from database.schemas import Responsavel

with Session(engine) as session:
    responsaveis = session.exec(select(Responsavel)).all()
    print(f"Total de responsáveis: {len(responsaveis)}")
    for r in responsaveis:
        print(f"ID: {r.id}, Nome: {r.nome}, Status: {r.status}")
