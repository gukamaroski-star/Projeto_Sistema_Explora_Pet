import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select, text
from database.connection import engine
from database.schemas import Tutor

with Session(engine) as session:
    # 1. Verifica se o tutor Guilherme (ID 1) existe e o deleta
    tutor_1 = session.get(Tutor, 1)
    if tutor_1:
        print(f"Deletando tutor de teste: ID 1 - {tutor_1.nome}")
        session.delete(tutor_1)
        session.commit()
    else:
        print("Tutor ID 1 não encontrado.")

    # 2. Altera o ID da Agatha (ID 2) para ID 1
    tutor_2 = session.get(Tutor, 2)
    if tutor_2:
        print(f"Alterando ID de {tutor_2.nome} de 2 para 1...")
        # Como o ID é chave primária, precisamos fazer via SQL direto ou recriando para evitar restrições
        session.execute(text("UPDATE tutores SET id = 1 WHERE id = 2"))
        session.commit()
        print("ID alterado com sucesso!")
    else:
        print("Tutor ID 2 não encontrado.")

    # 3. Ajusta a tabela sqlite_sequence se ela existir para que o próximo ID seja 2
    try:
        session.execute(text("UPDATE sqlite_sequence SET seq = 1 WHERE name = 'tutores'"))
        session.commit()
        print("Auto-incremento de 'tutores' ajustado para começar do 2.")
    except Exception as e:
        print(f"Não foi possível ajustar sqlite_sequence (talvez chaves não usem AUTOINCREMENT explícito): {e}")

with Session(engine) as session:
    tutors = session.exec(select(Tutor)).all()
    print("\nEstado atual dos tutores no banco:")
    for t in tutors:
        print(f"ID: {t.id}, Nome: {t.nome}, Status: {t.status}")
