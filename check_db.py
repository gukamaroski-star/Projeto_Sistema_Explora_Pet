from database.connection import engine, Session
from database.schemas import Produto, Cliente, Venda, Tutor
from sqlmodel import select

def clean_database():
    with Session(engine) as session:
        produtos = session.exec(select(Produto)).all()
        for p in produtos:
            print(f"ID: {p.id} | Nome: {p.nome} | Categoria: {p.categoria}")

        print("---")
        clientes = session.exec(select(Cliente)).all()
        print(f"Total Clientes: {len(clientes)}")

        vendas = session.exec(select(Venda)).all()
        print(f"Total Vendas: {len(vendas)}")

if __name__ == "__main__":
    clean_database()
