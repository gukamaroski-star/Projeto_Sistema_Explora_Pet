import sqlite3
import re

data = """
Agatha Queiroz de Almeida|086.210.569-25|gaga13queiroz@gmail.com|(41) 99233-1433|Cliente|
Ana Paula Nunes Marques|161.328.537-07|explorapetoficial@gmail.com|(41) 99276-2603|Cliente|Bárbara, Rodolpho & Alonso
Ancelmo Mickus|030.780.429-10|ancelmomks@gmail.com|(41) 99922-2857|Cliente|Dr. Baltasar | Rellum Pet
Bárbara Caetano Quintino|058.692.339-09|barbaracquintino@gmail.com|(41) 99890-2440|Cliente|Matheus, Eloisa, Simba & Luna
Bruna Daniela de Souza|852.977.182-60|explorapetoficial@gmail.com|(43) 99607-7697|Cliente|Membro da Família
Bruna Paola|073.096.469-83|explorapetoficial@gmail.com|(41) 99514-2852|Cliente|Membro da Família
Camila Weingartner|699.672.470-88|explorapetoficial@gmail.com|(41) 99943-2522|Cliente|Isabela & Lua
Carla Andressa Kamaroski|052.099.649-65|carlaandressakamaroski@gmail.com|(41) 99758-2559|Cliente|Membro da Família
Dariana|049.236.249-14|darianascorreia@gmail.com|(41) 99738-9510|Prospecto|
Dayane Wolf|074.877.689-37|dayanewdvi@hotmail.com|(41) 99834-5692|Cliente|Ana, Kovú & Hakan
Eduarda Natyelle Gomes Alves|182.632.517-45|eduarda.natyelle@gmail.com|(41) 99552-9588|Cliente|Letícia Pet Fantasy
Eloisa Moreira da Silva Thieme|108.364.879-90|eloisamoreirasilva@hotmail.com|(41) 98872-5531|Cliente|Fabíula, Nicolas e Pingo
Emilly Alves da Silva Assunção|033.398.172-35|emilly2assuncao@gmail.com|(41) 98737-0553|Cliente|
Erica Fabiana Rosa|307.461.668-77|erica1981fabi@gmail.com|(41) 98784-8004|Cliente|
Fabio Junio da Fonseca|050.936.586-85|fabio050905@gmail.com|(37) 99817-4668|Cliente|@thatybarbosamakeup
Fabíula Jungles|850.646.674-18|explorapetoficial@gmail.com|(41) 99637-3844|Cliente|
Gabryelly Figura|123.100.139-94|gabryellyfigura1@gmail.com|(41) 99923-5766|Cliente|
Gian Eduardo|081.785.559-99|explorapetoficial@gmail.com|(41) 99928-3474|Cliente|Membro da Família
Gisele Fernanda Fila Simioni|106.357.629-60|giseleffila@hotmail.com|(41) 99723-5831|Cliente|Matheus, Eloisa, Simba & Luna
Guilherme Anderson Kamaroski|086.900.339-98|guilherneekamaroski@gmail.com|(41) 9911-2732|Cliente|Ceo
Halline Nicolack Crisan|054.345.699-46|halinenicolack@gmail.com|(41) 98524-0002|Cliente|Thaísa, Jimmy & Neneca
Isabella Adão Ribas Camargo|105.761.159-08|isabella.ad_ribas@icloud.com|(41) 99654-9477|Cliente|
Jessica Luiza Fink|077.687.409-80|jessicaluiza07@hotmail.com|(41) 98902-2826|Cliente|
Kaio Marcílio da Costa|569.036.531-98|explorapetoficial@gmail.com|(41) 99966-0779|Cliente|Amigo
Leonardo Pereira Moares|070.791.379-93|leonardopmoraes@outlook.com|(41) 9695-4632|Cliente|Amigo
Lucas Coelho|662.381.820-08|explorapetoficial@gmail.com|(41) 99919-6942|Cliente|Primeiro Contato
Marco Antônio Affonso Ferreira|096.873.839-76|marco_affonso@hotmail.com|(41) 99880-7842|Cliente|Thayná, Lucas & Maia
Mari|383.051.746-70|explorapetoficial@gmail.com|(41) 99803-2815|Cliente|Membro da família
Maria Silvia Martins Mango|073.171.696-50|silmango@gmail.com|(41) 99909-6802|Cliente|
Matheus Pegas Thieme|094.035.929-40|explorapetoficial@gmail.com|(41) 98754-7067|Cliente|Fabíula, Nicolas e Pingo
Patricia de Lima Paiva Porto|051.059.269-43|patipporto@gmail.com|(41) 99141-8139|Cliente|Halline & Koka
Paulo Roberto Alves|018.532.029-59|robertomariner@hotmail.com|(41) 99713-4459|Cliente|Letícia Pet Fantasy
Rafaela Ribeiro Alves|111.773.919-88|rafaelaribeiro2101@outlook.com|(41) 99209-0204|Cliente|Isabella & Lua
Ricardo Rosa|931.766.510-15|ricardorosa@ricardorosa.com.br|(41) 99995-4416|Cliente|
Robson Slonkowskyj|063.753.749-10|robsonslonkowskyj@gmail.com|(41) 99280-0305|Cliente|Felipi, Elizandro & Milka
Rodolpho Quintino de Oliveira|054.600.279-00|explorapetoficial@gmail.com|(41) 99685-2230|Cliente|Matheus, Eloisa, Simba & Luna
Rose|794.865.654-57|explorapetoficial@gmail.com|(41) 99914-6318|Cliente|Membro da Família
Sabrina|117.117.539-63|sf5503482@gmail.com|(41) 99745-9817|Cliente|
teste nat|059.428.727-83|natalia@petattend.com.br|(34) 99676-0166|Prospecto|
Thayná Taborda Coelho|313.878.281-77|thaystcamarco@gmail.com|(41) 99582-9915|Cliente|Primeiro contato
Vanessa Ziaresk|041.313.179-31|vanessa.ziareski@gmail.com|(41) 99647-0478|Cliente|Dr. Baltasar | Rellum Pet
Volnir Crisan|043.846.309-99|volnircrisan@gmail.com|(41) 9804-1768|Cliente|Thaísa, Jimmy & Neneca
"""

def clean_status(s):
    if s.lower().strip() == 'prospecto':
        return 'Prospecto'
    return 'Ativo'

conn = sqlite3.connect('c:/Users/g.kamaroski/Documents/Explora/Projeto_Sistema_Explora_Pet/database/explorapet.db')
cursor = conn.cursor()

from datetime import datetime

for line in data.strip().split('\n'):
    parts = line.split('|')
    if len(parts) >= 6:
        nome = parts[0].strip()
        cpf = parts[1].strip()
        email = parts[2].strip()
        telefone = parts[3].strip()
        status_raw = parts[4].strip()
        indicacao = parts[5].strip()
        
        status = clean_status(status_raw)
        
        # Insert into tutores
        # Check if already exists only by CPF (if not empty)
        cpf_limpo = cpf.replace(".", "").replace("-", "")
        
        exists = False
        if cpf_limpo:
            cursor.execute("SELECT id FROM tutores WHERE REPLACE(REPLACE(cpf, '.', ''), '-', '') = ?", (cpf_limpo,))
            if cursor.fetchone():
                exists = True
                
        if not exists:
            cursor.execute(
                "INSERT INTO tutores (nome, cpf, email, telefone, indicacao, status, data_cadastro) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (nome, cpf, email, telefone, indicacao, status, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            )

conn.commit()
conn.close()
print("Imported successfully!")
