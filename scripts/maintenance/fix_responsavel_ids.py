import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlmodel import Session, select, text
from database.connection import engine
from database.schemas import Responsavel

with Session(engine) as session:
    # 1. Verifica se o responsável Guilherme (ID 1) existe e o deleta
    responsavel_1 = session.get(Responsavel, 1)
    if responsavel_1:
        print(f"Deletando responsável de teste: ID 1 - {responsavel_1.nome}")
        session.delete(responsavel_1)
        session.commit()
    else:
        print("Responsável ID 1 não encontrado.")

    # 2. Altera o ID da Agatha (ID 2) para ID 1
    responsavel_2 = session.get(Responsavel, 2)
    if responsavel_2:
        print(f"Alterando ID de {responsavel_2.nome} de 2 para 1...")
        # Como o ID é chave primária, precisamos fazer via SQL direto ou recriando para evitar restrições
        session.execute(text("UPDATE responsaveis SET id = 1 WHERE id = 2"))
        session.commit()
        print("ID alterado com sucesso!")
    else:
        print("Responsável ID 2 não encontrado.")

    # 3. Ajusta a tabela sqlite_sequence se ela existir para que o próximo ID seja 2
    try:
        session.execute(text("UPDATE sqlite_sequence SET seq = 1 WHERE name = 'responsaveis'"))
        session.commit()
        print("Auto-incremento de 'responsaveis' ajustado para começar do 2.")
    except Exception as e:
        print(f"Não foi possível ajustar sqlite_sequence (talvez chaves não usem AUTOINCREMENT explícito): {e}")

with Session(engine) as session:
    responsaveis = session.exec(select(Responsavel)).all()
    print("\nEstado atual dos responsáveis no banco:")
    for r in responsaveis:
        print(f"ID: {r.id}, Nome: {r.nome}, Status: {r.status}")
