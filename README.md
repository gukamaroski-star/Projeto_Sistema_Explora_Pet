# EnterpriseDB | Dashboard & Gestão de Dados (FastAPI + Supabase/PostgreSQL)

> 🚀 **Deploy automático ativo** — qualquer `git push` para a branch `main` aciona o deploy no Render automaticamente.

Este é um projeto completo de banco de dados empresarial que combina o poder e alto desempenho do **Python (FastAPI)** com a escalabilidade robusta do **PostgreSQL (Supabase)**, acompanhado de uma interface web administrativa ultra-premium, responsiva e com modo escuro nativo.

---

## ⚡ Diferenciais do Sistema

* **Arquitetura Híbrida/Flexível:** Configurado para rodar localmente com **SQLite** (sem precisar configurar servidores adicionais) e pronto para migrar instantaneamente para o **PostgreSQL** na nuvem apenas mudando a URL no arquivo `.env`.
* **FastAPI Backend:** API de alta performance com processamento assíncrono.
* **Painel Visual Premium:** Dashboard financeiro com gráficos dinâmicos (faturamento diário, estoque e categorias), CRUD visual completo de clientes, produtos e vendas.
* **Terminal SQL Nativo:** Um playground interativo para você digitar comandos SQL diretos (ex: `SELECT * FROM clientes`) e ver os resultados retornados em tabelas instantâneas.

---

## 🛠️ Instalação e Execução Local

Siga o passo a passo abaixo para rodar o projeto na sua máquina:

### 1. Pré-requisitos
* Certifique-se de ter o **Python 3.8+** instalado.

### 2. Instalar Dependências
Abra o seu terminal (Prompt de Comando ou PowerShell) na pasta do projeto e instale as dependências:
```bash
pip install -r requirements.txt
```

### 3. Inicializar e Popular o Banco de Dados
Para criar o arquivo do banco de dados local (`empresa.db`) e preenchê-lo com dados iniciais realistas (Clientes, Produtos e Vendas de exemplo):
```bash
python create_db.py
```

### 4. Rodar o Servidor (Desenvolvimento Web e Mobile)
Você pode rodar o servidor de duas maneiras:

* **Para desenvolvimento apenas Web (Loopback padrão):**
  ```bash
  uvicorn main:app --reload
  ```
  Acesse no seu navegador: **`http://localhost:8000`** 🚀

* **Para desenvolvimento Híbrido (Web e Mobile - Android/iOS):**
  Para permitir que seu aplicativo de celular se conecte à API do computador, execute o script de inicialização inteligente que configura a escuta em todas as interfaces de rede (`0.0.0.0`) e detecta seu IP local automaticamente:
  ```bash
  python run_server.py
  ```
  O console imprimirá o endereço IP de rede local exato (por exemplo, `http://192.168.15.25:8000`) para você inserir nas configurações da aplicação móvel.

---

## ☁️ Conectando ao Supabase (PostgreSQL Online)

Quando estiver pronto para colocar o banco online e garantir escalabilidade infinita, siga estas etapas:

1. **Crie uma conta gratuita** no [Supabase](https://supabase.com).
2. **Crie um novo projeto** no painel do Supabase.
3. Vá em **Project Settings** -> **Database** -> localize a seção **Connection String** e clique na aba **URI**.
4. Copie a linha de conexão, que será parecida com esta:
   `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`
5. Abra o arquivo **`.env`** na raiz do projeto e substitua a URL existente pela do Supabase:
   ```env
   DATABASE_URL=postgresql://postgres:SuaSenhaSegura@db.xxxx.supabase.co:5432/postgres
   ```
6. Execute o script de criação de tabelas novamente para estruturar e popular o banco no Supabase:
   ```bash
   python create_db.py
   ```
7. Pronto! Rode `uvicorn main:app --reload`. Todo o seu sistema agora salvará e lerá os dados diretamente do PostgreSQL em nuvem do Supabase!

---

## 📂 Estrutura de Arquivos

* `main.py`: Servidor API e rotas de negócios.
* `models.py`: Modelos estruturados de dados (SQLModel).
* `database.py`: Utilitário de conexão híbrida de banco de dados.
* `create_db.py`: Script para popular e gerar dados fictícios.
* `public/`:
  * `index.html`: Estrutura do dashboard e painéis.
  * `style.css`: Design premium com variáveis CSS e Glassmorphism.
  * `app.js`: Comunicação AJAX/Fetch com o backend.
