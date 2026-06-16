import json
from sqlmodel import Session, select
from database.connection import engine
from database.schemas import Tutor, Pet

pets_data = [
    {"nome": "Amora", "raca": "Golden Retriever", "sexo": "Fêmea", "tutor": "Gabryelly Figura", "obs": "Seguir rotina, no whatsapp tem a lista de horários de comer e não deixar ela com outros cães."},
    {"nome": "Amora", "raca": "Spitz Alemão", "sexo": "Fêmea", "tutor": "Patricia de Lima Paiva Porto", "obs": ""},
    {"nome": "Amora", "raca": "SRD", "sexo": "Fêmea", "tutor": "Rafaela Ribeiro Alves", "obs": ""},
    {"nome": "Aslan", "raca": "Golden Retriever", "sexo": "Macho", "tutor": "Fabio Junio da Fonseca", "obs": ""},
    {"nome": "Athena", "raca": "Pastor Alemão", "sexo": "Fêmea", "tutor": "Ancelmo Mickus", "obs": ""},
    {"nome": "Athom", "raca": "Jack Russell Terrier", "sexo": "Macho", "tutor": "Robson Slonkowskyj", "obs": "Contato da clínica veterinária de emergência Clínica Siglia Vet: (41) 9 9613 0413 Dra. Siglia: (41) 9 9993 4516 Contato do veterinário da família Dr. Mário Tadeu: (41) 9 9982 3293"},
    {"nome": "Axel", "raca": "Jack Russell Terrier", "sexo": "Macho", "tutor": "Robson Slonkowskyj", "obs": "Contato da clínica veterinária de emergência Clínica Siglia Vet: (41) 9 9613 0413 Dra. Siglia: (41) 9 9993 4516 Contato do veterinário da família Dr. Mário Tadeu: (41) 9 9982 3293"},
    {"nome": "Banguela", "raca": "Labrador", "sexo": "Macho", "tutor": "Kaio Marcílio da Costa", "obs": ""},
    {"nome": "Bento", "raca": "Shih-Tzu", "sexo": "Macho", "tutor": "Emilly Alves da Silva Assunção", "obs": ""},
    {"nome": "Bento", "raca": "Pug", "sexo": "Macho", "tutor": "Marco Antônio Affonso Ferreira", "obs": ""},
    {"nome": "Beterraba", "raca": "Lhasa Apso", "sexo": "Fêmea", "tutor": "Bruna Daniela de Souza", "obs": ""},
    {"nome": "Brownie", "raca": "Shih-Tzu", "sexo": "Macho", "tutor": "Bruna Paola", "obs": ""},
    {"nome": "Candy", "raca": "SRD", "sexo": "Fêmea", "tutor": "Sabrina", "obs": ""},
    {"nome": "Charlotte", "raca": "SRD", "sexo": "", "tutor": "Camila Weingartner", "obs": ""},
    {"nome": "Chico", "raca": "Pug", "sexo": "Macho", "tutor": "Leonardo Pereira Moares", "obs": "Plano Pet Vetter"},
    {"nome": "Dom", "raca": "Buldogue Francês", "sexo": "Macho", "tutor": "Mari", "obs": ""},
    {"nome": "Evee", "raca": "Jack Russell Terrier", "sexo": "Fêmea", "tutor": "Robson Slonkowskyj", "obs": "Contato da clínica veterinária de emergência Clínica Siglia Vet: (41) 9 9613 0413 Dra. Siglia: (41) 9 9993 4516 Contato do veterinário da família Dr. Mário Tadeu: (41) 9 9982 3293"},
    {"nome": "Fernando Alonso", "raca": "SRD", "sexo": "Macho", "tutor": "Bárbara Caetano Quintino", "obs": "Contato da clínica veterinária de emergênciaClinicão: (41) 9 9963 0233"},
    {"nome": "Hana", "raca": "Shih-Tzu", "sexo": "Fêmea", "tutor": "Bruna Daniela de Souza", "obs": ""},
    {"nome": "Jade", "raca": "Husky Siberiano", "sexo": "Fêmea", "tutor": "Jessica Luiza Fink", "obs": ""},
    {"nome": "Jaike", "raca": "Shih-Tzu", "sexo": "Macho", "tutor": "Carla Andressa Kamaroski", "obs": ""},
    {"nome": "Klaus Almeida Kamaroski", "raca": "Spitz Alemão", "sexo": "Macho", "tutor": "Agatha Queiroz de Almeida", "obs": "Plano Pet Vetter"},
    {"nome": "Knae", "raca": "Border Collie", "sexo": "Macho", "tutor": "Ricardo Rosa", "obs": ""},
    {"nome": "Koka", "raca": "Border Collie", "sexo": "Fêmea", "tutor": "Halline Nicolack Crisan", "obs": ""},
    {"nome": "Kovú", "raca": "Yorkshire Terrier", "sexo": "Macho", "tutor": "Ana Paula Nunes Marques", "obs": ""},
    {"nome": "Lua", "raca": "Shih-Tzu", "sexo": "Fêmea", "tutor": "Isabella Adão Ribas Camargo", "obs": ""},
    {"nome": "Luna", "raca": "Dachshund Teckel - Pelo Curto", "sexo": "Fêmea", "tutor": "Eloisa Moreira da Silva Thieme", "obs": ""},
    {"nome": "Madalena", "raca": "SRD", "sexo": "Fêmea", "tutor": "Dayane Wolf", "obs": ""},
    {"nome": "Maia", "raca": "Lhasa Apso", "sexo": "Fêmea", "tutor": "Thayná Taborda Coelho", "obs": ""},
    {"nome": "Mel", "raca": "Shih-Tzu", "sexo": "Fêmea", "tutor": "Gisele Fernanda Fila Simioni", "obs": "Plano Pet Vetter"},
    {"nome": "Paçoca", "raca": "SRD", "sexo": "Macho", "tutor": "Rose", "obs": ""},
    {"nome": "Pingo", "raca": "SRD", "sexo": "", "tutor": "Fabíula Jungles", "obs": ""},
    {"nome": "Polaca Susanita", "raca": "Bulldog", "sexo": "Fêmea", "tutor": "Maria Silvia Martins Mango", "obs": ""},
    {"nome": "Rakan", "raca": "Maltês", "sexo": "Macho", "tutor": "Ana Paula Nunes Marques", "obs": ""},
    {"nome": "Rarú", "raca": "Buldogue Francês", "sexo": "Macho", "tutor": "Mari", "obs": ""},
    {"nome": "Romeo", "raca": "Shih-Tzu", "sexo": "Macho", "tutor": "Erica Fabiana Rosa", "obs": ""},
    {"nome": "Romeo", "raca": "Shih-Tzu", "sexo": "Macho", "tutor": "Emilly Alves da Silva Assunção", "obs": ""},
    {"nome": "Romeu", "raca": "Buldogue Francês", "sexo": "Macho", "tutor": "Marco Antônio Affonso Ferreira", "obs": ""},
    {"nome": "Rox", "raca": "Darpol Russell Terrier", "sexo": "Fêmea", "tutor": "Robson Slonkowskyj", "obs": "Contato da clínica veterinária de emergência Clínica Siglia Vet: (41) 9 9613 0413 Dra. Siglia: (41) 9 9993 4516 Contato do veterinário da família Dr. Mário Tadeu: (41) 9 9982 3293"},
    {"nome": "Safira", "raca": "Husky Siberiano", "sexo": "Fêmea", "tutor": "Paulo Roberto Alves", "obs": ""},
    {"nome": "Simba", "raca": "Shih-Tzu", "sexo": "Macho", "tutor": "Eloisa Moreira da Silva Thieme", "obs": ""},
    {"nome": "Totó", "raca": "Akita Inu", "sexo": "Macho", "tutor": "teste nat", "obs": ""},
    {"nome": "Xixo", "raca": "Dachshund Teckel - Pelo Curto", "sexo": "Macho", "tutor": "Dariana", "obs": ""},
    {"nome": "Zoe", "raca": "Poodle Médio", "sexo": "Fêmea", "tutor": "Sabrina", "obs": ""}
]

with Session(engine) as session:
    for data in pets_data:
        # Check if tutor exists
        tutor = session.exec(select(Tutor).where(Tutor.nome == data["tutor"])).first()
        if not tutor:
            tutor = Tutor(nome=data["tutor"])
            session.add(tutor)
            session.commit()
            session.refresh(tutor)
            
        # Determine especie based on raca usually, but let's leave it empty or guess it
        especie = "Cachorro"
        if data["raca"] == "SRD" and data["nome"] == "Amora":
            especie = "Cachorro" # default to cachorro
            
        # Create Pet
        pet = Pet(
            nome=data["nome"],
            raca=data["raca"],
            sexo=data["sexo"] if data["sexo"] else "",
            tutor_id=tutor.id,
            observacoes=data["obs"],
            especie=especie,
            cor="",
            data_nascimento="",
            peso=0.0,
            porte="",
            pelagem=""
        )
        session.add(pet)
        
    session.commit()
    print("Pets cadastrados com sucesso!")
