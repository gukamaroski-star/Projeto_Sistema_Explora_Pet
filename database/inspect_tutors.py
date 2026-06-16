import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from database.connection import engine
from database.schemas import Tutor

with Session(engine) as session:
    tutors = session.exec(select(Tutor)).all()
    print(f"Total de tutores: {len(tutors)}")
    for t in tutors:
        print(f"ID: {t.id}, Nome: {t.nome}, Status: {t.status}")
