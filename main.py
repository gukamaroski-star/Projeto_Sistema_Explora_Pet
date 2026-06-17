# Deploy: 2026-06-17 - Explora Pet Sistema
from fastapi import FastAPI, Depends, HTTPException, Query, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select, text
from typing import List, Optional
from pydantic import BaseModel
import os
import socket
import urllib.request
import urllib.error
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

from database import engine, get_session, create_db_and_tables, Cliente, Produto, Venda, Tutor, Usuario, Pet
from fastapi.security import OAuth2PasswordBearer
import hashlib
import secrets

# Configuração do esquema de segurança OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

# Dicionário em memória para sessões ativas (token -> {username, nome, email})
SESSOES_ATIVAS = {}

# Dicionário em memória para recuperar senhas (token -> {username, expira_em})
TOKENS_RECUPERACAO = {}

# Utilitários de Hash de Senha (Seguro PBKDF2-SHA256)
def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    hash_bytes = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${hash_bytes.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, hash_hex = hashed_password.split('$')
        hash_bytes = hashlib.pbkdf2_hmac('sha256', plain_password.encode(), salt.encode(), 100000)
        return hash_bytes.hex() == hash_hex
    except Exception:
        return False

# Pydantic models para login e autenticação
class LoginRequest(BaseModel):
    username: str
    password: str
    ficar_conectado: Optional[bool] = False

class ForgotPasswordRequest(BaseModel):
    username: str

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

# Pydantic schemas para Criação e Atualização de Usuários
class UsuarioCreate(BaseModel):
    username: str
    password: str
    nome: str
    email: str
    cargo: str = "Colaborador"

class UsuarioUpdate(BaseModel):
    username: str
    nome: str
    email: str
    cargo: str = "Colaborador"
    password: Optional[str] = None

# Dependência para obter e validar o usuário atual logado
def obter_usuario_atual(token: Optional[str] = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> Usuario:
    if not token:
        raise HTTPException(status_code=401, detail="Sessão não autorizada ou expirada")
    
    if token in SESSOES_ATIVAS:
        info = SESSOES_ATIVAS[token]
        # Validação segura da expiração da sessão (no lado do servidor)
        expira_em = info.get("expira_em")
        if expira_em and datetime.now() > expira_em:
            del SESSOES_ATIVAS[token]
            raise HTTPException(status_code=401, detail="Sessão expirou. Por favor faça login novamente")
            
        username = info["username"]
        usuario = session.exec(select(Usuario).where(Usuario.username == username)).first()
        if usuario:
            return usuario
            
    raise HTTPException(status_code=401, detail="Token inválido ou sessão encerrada")

# Inicializa o app FastAPI
app = FastAPI(
    title="Sistema de Banco de Dados Empresarial API",
    description="API robusta em Python para gerenciar clientes, produtos, vendas e consultas SQL.",
    version="1.0.0"
)

# Configura o CORS para permitir conexões de qualquer origem (útil para desenvolvimento local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de Segurança para bloquear acesso não autorizado a qualquer rota /api
@app.middleware("http")
async def autenticacao_api_middleware(request: Request, call_next):
    path = request.url.path
    
    # Protege qualquer rota de API (/api/...) exceto os endpoints públicos de autenticação
    rotas_publicas = ["/api/auth/login", "/api/auth/forgot-password", "/api/auth/reset-password"]
    if path.startswith("/api") and path not in rotas_publicas:
        auth_header = request.headers.get("Authorization")
        token = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
        if not token or token not in SESSOES_ATIVAS:
            return JSONResponse(
                status_code=401,
                content={"detail": "Sessão não autorizada ou expirada"}
            )
            
    response = await call_next(request)
    return response

# Modelo de entrada para o console SQL
class SQLQuery(BaseModel):
    query: str

def obter_ip_local():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Não precisa ser alcançável, serve apenas para determinar a interface de rede ativa
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

# Evento de inicialização do app - cria as tabelas caso não existam
@app.on_event("startup")
def on_startup():
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    create_db_and_tables()
    
    # Auto-migração: adiciona a coluna 'cargo' se estiver faltando no SQLite
    with Session(engine) as session:
        try:
            columns_info = session.execute(text("PRAGMA table_info(usuarios)")).all()
            columns = [col[1] for col in columns_info]
            if "cargo" not in columns:
                print("Alterando tabela 'usuarios' para adicionar coluna 'cargo'...")
                session.execute(text("ALTER TABLE usuarios ADD COLUMN cargo VARCHAR DEFAULT 'Colaborador'"))
                session.execute(text("UPDATE usuarios SET cargo = 'Administrador' WHERE username = 'admin'"))
                session.commit()
                print("Coluna 'cargo' migrada com sucesso!")
            if "email" not in columns:
                print("Alterando tabela 'usuarios' para adicionar coluna 'email'...")
                session.execute(text("ALTER TABLE usuarios ADD COLUMN email VARCHAR DEFAULT 'explorapetoficial@gmail.com'"))
                session.commit()
                print("Coluna 'email' migrada com sucesso!")
        except Exception as e:
            print(f"Erro na migração automática: {e}")
    
    ip_local = obter_ip_local()
    print("\n" + "="*80)
    print(" 🚀 ENTERPRISEDB - SERVER INICIALIZADO COM SUCESSO!")
    print("="*80)
    print(f" 🌐 API Local:          http://localhost:8000")
    print(f" 📱 Conexão Mobile (Wi-Fi):  http://{ip_local}:8000")
    print(f" 📝 Swagger Docs:      http://localhost:8000/docs")
    print("-"*80)
    print(" 💡 DICA MOBILE: Certifique-se de que o seu celular (Android/iOS) e o")
    print("    computador estão conectados na MESMA REDE WI-FI.")
    print("    Para rodar o uvicorn aceitando conexões externas, execute:")
    print("    uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
    print("="*80 + "\n")

# ==========================================
# ROTA DE CONSULTA DE CPF (PROXY SEGURO)
# ==========================================

@app.get("/api/cpf-lookup/{cpf_number}")
def lookup_cpf(cpf_number: str):
    api_key = os.getenv("CPFHUB_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="CPFHub API key não configurada no servidor")
    
    # Remove formatação do CPF (pontos e traço)
    cpf_clean = cpf_number.replace(".", "").replace("-", "")
    
    url = f"https://api.cpfhub.io/cpf/{cpf_clean}"
    req = urllib.request.Request(url, headers={"x-api-key": api_key})
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            return data
    except urllib.error.HTTPError as e:
        try:
            error_body = json.loads(e.read().decode())
        except Exception:
            error_body = {"message": str(e)}
        raise HTTPException(status_code=e.code, detail=error_body)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# ROTAS DE AUTENTICAÇÃO (LOGIN / LOGOUT / ME)
# ==========================================

@app.post("/api/auth/login")
def login(request: LoginRequest, session: Session = Depends(get_session)):
    usuario = session.exec(select(Usuario).where(Usuario.username == request.username)).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Login ou senha incorretos")
    
    if not verify_password(request.password, usuario.hashed_password):
        raise HTTPException(status_code=401, detail="Login ou senha incorretos")
    
    token = secrets.token_hex(32)
    
    # Define a expiração com base no checkbox "Ficar conectado"
    if request.ficar_conectado:
        # Ficar conectado: expira em 30 dias (permanece ativa sem deslogar após 24h)
        expira_em = datetime.now() + timedelta(days=30)
    else:
        # Não marcado: expira em apenas 1 hora
        expira_em = datetime.now() + timedelta(hours=1)
        
    SESSOES_ATIVAS[token] = {
        "username": usuario.username,
        "nome": usuario.nome,
        "email": usuario.email,
        "cargo": usuario.cargo,
        "expira_em": expira_em
    }
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "nome": usuario.nome,
        "username": usuario.username,
        "cargo": usuario.cargo
    }

@app.post("/api/auth/logout")
def logout(token: str = Depends(oauth2_scheme)):
    if token in SESSOES_ATIVAS:
        del SESSOES_ATIVAS[token]
    return {"detail": "Sessão encerrada com sucesso"}

@app.get("/api/auth/me")
def get_me(usuario: Usuario = Depends(obter_usuario_atual)):
    return {
        "id": usuario.id,
        "username": usuario.username,
        "nome": usuario.nome,
        "email": usuario.email,
        "cargo": usuario.cargo
    }

def limpar_emails_enviados_antigos():
    import os
    import imaplib
    from dotenv import load_dotenv
    from email.utils import parsedate_to_datetime
    from datetime import datetime, timedelta, timezone

    load_dotenv(override=True)
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    # Fallback inteligente se estiver usando valores genéricos no .env
    if not smtp_user or smtp_user == "seu-email@gmail.com" or not smtp_password or smtp_password == "sua-senha-de-app":
        smtp_user = "explorapetoficial@gmail.com"
        smtp_password = "wwrbcjvyrtoiifee"

    # Se estiver explicitamente em modo simulação, não faz limpeza
    if smtp_user == "simular":
        return

    try:
        # Conecta no IMAP do Gmail
        mail = imaplib.IMAP4_SSL("imap.gmail.com", 993, timeout=15)
        mail.login(smtp_user, smtp_password)
        
        # Obtém a lista de pastas para encontrar a de Enviados (\Sent) e Lixeira (\Trash) de forma multilíngue
        status, folder_list = mail.list()
        sent_folder = '"[Gmail]/Sent Mail"'
        trash_folder = '"[Gmail]/Trash"'
        
        if status == 'OK':
            for folder_info in folder_list:
                info_str = folder_info.decode('utf-8')
                if '\\Sent' in info_str:
                    parts = info_str.split(' "/" ')
                    if len(parts) > 1:
                        sent_folder = parts[1]
                elif '\\Trash' in info_str:
                    parts = info_str.split(' "/" ')
                    if len(parts) > 1:
                        trash_folder = parts[1]

        # -------------------------------------------------------------
        # PARTE 1: Mover e-mails de Enviados > 1h para a Lixeira
        # -------------------------------------------------------------
        import email
        mail.select(sent_folder)
        status, data = mail.search(None, 'SUBJECT "Explora Pet"')
        
        if status == 'OK':
            email_ids = data[0].split()
            agora = datetime.now(timezone.utc)
            limite_1h = agora - timedelta(hours=1)
            
            deletados_count = 0
            for e_id in email_ids:
                status, msg_data = mail.fetch(e_id, '(BODY[HEADER.FIELDS (DATE SUBJECT)])')
                if status == 'OK' and msg_data[0]:
                    header_content = msg_data[0][1].decode('utf-8')
                    msg = email.message_from_string(header_content)
                    subject = msg.get('Subject', '')
                    date_str = msg.get('Date', '')
                    
                    # Decodifica o assunto de forma robusta
                    decoded_subject_parts = email.header.decode_header(subject)
                    decoded_subject = ""
                    for part, encoding in decoded_subject_parts:
                        if isinstance(part, bytes):
                            decoded_subject += part.decode(encoding or 'utf-8', errors='ignore')
                        else:
                            decoded_subject += part
                    
                    subj_lower = decoded_subject.lower()
                    # Verifica se realmente é um e-mail de recuperação de senha
                    if "recupera" in subj_lower and "senha" in subj_lower and "explora pet" in subj_lower:
                        try:
                            date_dt = parsedate_to_datetime(date_str)
                            if date_dt.tzinfo is None:
                                date_dt = date_dt.replace(tzinfo=timezone.utc)
                            
                            # Se enviado há mais de 1 hora, move para a lixeira e marca para apagar dos enviados
                            if date_dt < limite_1h:
                                # 1. Copia para a Lixeira
                                mail.copy(e_id, trash_folder)
                                # 2. Marca como deletado da pasta Enviados
                                mail.store(e_id, '+FLAGS', '\\Deleted')
                                deletados_count += 1
                        except Exception as parse_err:
                            print(f"[IMAP] Erro ao processar data nos enviados para id {e_id}: {parse_err}")
            
            if deletados_count > 0:
                mail.expunge()
                print(f"[IMAP] {deletados_count} e-mails de recuperação antigos (>1h) foram movidos para a Lixeira ({trash_folder}).")

        # -------------------------------------------------------------
        # PARTE 2: Limpar permanentemente e-mails da Lixeira > 24 horas
        # -------------------------------------------------------------
        mail.select(trash_folder)
        status, data = mail.search(None, 'SUBJECT "Explora Pet"')
        
        if status == 'OK':
            email_ids = data[0].split()
            agora = datetime.now(timezone.utc)
            limite_24h = agora - timedelta(hours=24)
            
            limpos_count = 0
            for e_id in email_ids:
                status, msg_data = mail.fetch(e_id, '(BODY[HEADER.FIELDS (DATE SUBJECT)])')
                if status == 'OK' and msg_data[0]:
                    header_content = msg_data[0][1].decode('utf-8')
                    msg = email.message_from_string(header_content)
                    subject = msg.get('Subject', '')
                    date_str = msg.get('Date', '')
                    
                    # Decodifica o assunto de forma robusta
                    decoded_subject_parts = email.header.decode_header(subject)
                    decoded_subject = ""
                    for part, encoding in decoded_subject_parts:
                        if isinstance(part, bytes):
                            decoded_subject += part.decode(encoding or 'utf-8', errors='ignore')
                        else:
                            decoded_subject += part
                    
                    subj_lower = decoded_subject.lower()
                    # Verifica se realmente é um e-mail de recuperação de senha
                    if "recupera" in subj_lower and "senha" in subj_lower and "explora pet" in subj_lower:
                        try:
                            date_dt = parsedate_to_datetime(date_str)
                            if date_dt.tzinfo is None:
                                date_dt = date_dt.replace(tzinfo=timezone.utc)
                            
                            # Se estiver na lixeira há mais de 24 horas, deleta permanentemente
                            if date_dt < limite_24h:
                                mail.store(e_id, '+FLAGS', '\\Deleted')
                                limpos_count += 1
                        except Exception as parse_err:
                            print(f"[IMAP] Erro ao processar data na lixeira para id {e_id}: {parse_err}")
            
            if limpos_count > 0:
                mail.expunge()
                print(f"[IMAP] {limpos_count} e-mails de recuperação antigos (>24h) foram excluídos permanentemente da Lixeira.")
        
        mail.close()
        mail.logout()
    except Exception as imap_err:
        print(f"[IMAP ERROR] Falha ao mover/limpar e-mails antigos: {imap_err}")

def enviar_email_recuperacao(email_destino: str, link_redefinicao: str, app_url: str = "http://localhost:8000"):
    from dotenv import load_dotenv
    load_dotenv(override=True)
    
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    # Se o usuário definir explicitamente como "simular", entra em modo simulação pura
    if smtp_user == "simular":
        print("\n" + "!"*80)
        print(" [SIMULACAO] MODO SIMULACAO ATIVADO EXPLICITAMENTE")
        print(f" [LINK] LINK DE RECUPERACAO GERADO: {link_redefinicao}")
        print("!"*80 + "\n")
        return False

    usando_fallback = False
    # Fallback inteligente: se no .env estiver com os valores fictícios padrões ou vazios,
    # usamos as credenciais reais do Explora Pet para que funcione de verdade.
    if not smtp_user or smtp_user == "seu-email@gmail.com" or not smtp_password or smtp_password == "sua-senha-de-app":
        smtp_user = "explorapetoficial@gmail.com"
        smtp_password = "wwrbcjvyrtoiifee"
        smtp_server = "smtp.gmail.com"
        smtp_port = 465
        usando_fallback = True
        print("\n" + "="*80)
        print(" [INFO] MODO DUMMY DETECTADO NO .env: Usando credenciais reais de fallback cadastradas no backend.")
        print(f" [LINK] LINK DE RECUPERACAO GERADO: {link_redefinicao}")
        print("="*80 + "\n")

    if not usando_fallback:
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        try:
            # Para o Gmail (smtp.gmail.com), usamos a porta 465 (SSL) por padrão, pois a porta 587 (TLS)
            # costuma sofrer interferência ou bloqueio de provedores de internet residenciais brasileiros.
            porta_padrao = "465" if smtp_server == "smtp.gmail.com" else "587"
            smtp_port = int(os.getenv("SMTP_PORT", porta_padrao))
        except ValueError:
            smtp_port = 465 if smtp_server == "smtp.gmail.com" else 587

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = email_destino
    msg['Subject'] = "Recuperação de Senha - Explora Pet"

    corpo = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px; margin: 0; -webkit-font-smoothing: antialiased;">
        <!-- Preheader oculto para o snippet do email -->
        <div style="display: none; max-height: 0px; overflow: hidden;">
            Olá, Identificamos um pedido para redefinir a senha da sua conta na Explora Pet.
            &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f3f4f6;">
            <tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; margin: 0 auto; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border-top: 6px solid #10b981;">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 30px 30px; text-align: center; background-color: #0f172a;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -0.5px;">Explora <span style="color: #10b981;">Pet</span></h1>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px 30px; text-align: left;">
                                <h2 style="color: #0f172a; margin: 0 0 24px; font-size: 24px; font-weight: 700; text-align: center; letter-spacing: -0.2px;">Recuperação de Senha</h2>
                                <p style="color: #0f172a; margin: 0 0 16px; font-size: 18px; font-weight: 700; line-height: 1.6;">Olá! 👋</p>
                                <p style="color: #475569; margin: 0 0 16px; font-size: 16px; line-height: 1.6;">Identificamos um pedido para redefinir a senha da sua conta na <strong>Explora Pet</strong>. Estamos aqui para ajudar você a recuperar seu acesso de forma rápida e segura!</p>
                                <p style="color: #475569; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">Clique no botão abaixo para escolher uma nova senha e voltar a usar o sistema:</p>
                                
                                <!-- Button -->
                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                        <td align="center" style="padding: 0 0 40px;">
                                            <a href="{link_redefinicao}" style="background-color: #10b981; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.15); text-transform: uppercase; letter-spacing: 0.5px;">Redefinir Minha Senha</a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px;">
                                    <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.5;">
                                        <strong style="color: #0f172a;">Atenção:</strong> Este link é seguro e <strong>válido por apenas 1 hora</strong>.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px; background-color: #ffffff; text-align: center; border-top: 1px solid #f1f5f9; border-radius: 0 0 16px 16px;">
                                <p style="color: #64748b; margin: 0 0 20px; font-size: 13px; line-height: 1.5;">Caso esta redefinição não tenha sido solicitada por você, desconsidere esta mensagem. Nenhuma alteração será efetuada em sua conta.</p>
                                <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">&copy; {datetime.now().year} Explora Pet. Todos os direitos reservados.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    msg.attach(MIMEText(corpo, 'html'))

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_user, email_destino, msg.as_string())
        else:
            with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_user, email_destino, msg.as_string())
    except Exception as primary_error:
        # Fallback de segurança: se a porta padrão 587 falhar (bloqueio comum de provedores), tenta a porta 465 com SSL
        if smtp_port != 465:
            print(f"\n[SMTP WARNING] Falha na porta {smtp_port} ({primary_error}). Tentando porta alternativa 465 (SMTP_SSL)...")
            try:
                with smtplib.SMTP_SSL(smtp_server, 465, timeout=10) as server:
                    server.login(smtp_user, smtp_password)
                    server.sendmail(smtp_user, email_destino, msg.as_string())
                print("[SMTP SUCCESS] E-mail enviado com sucesso usando porta alternativa 465!\n")
                return True
            except Exception as fallback_error:
                print(f"[SMTP ERROR] Falha também na porta alternativa 465: {fallback_error}\n")
                raise primary_error
        else:
            raise primary_error
    return True

@app.post("/api/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    query = request.username.strip()
    
    # 1. Busca por username ou email na tabela de Usuarios
    usuario = session.exec(
        select(Usuario).where((Usuario.username == query) | (Usuario.email == query))
    ).first()

    if usuario:
        if not usuario.email:
            raise HTTPException(status_code=400, detail="Este usuário não possui e-mail cadastrado no sistema.")

        token = secrets.token_hex(32)
        expiracao = datetime.now() + timedelta(hours=1)
        TOKENS_RECUPERACAO[token] = {
            "username": usuario.username,
            "expira_em": expiracao
        }

        app_url = os.getenv("APP_URL", "http://localhost:8000").rstrip("/")
        link = f"{app_url}/reset-password.html?token={token}"

        try:
            enviado = enviar_email_recuperacao(usuario.email, link, app_url)
            if not enviado:
                return {
                    "success": True, 
                    "message": f"Modo Simulação (SMTP pendente). O link de redefinição foi gerado com sucesso.",
                    "debug_link": link
                }
        except Exception as e:
            print(f"[ERROR] Falha ao enviar e-mail: {e}")
            raise HTTPException(status_code=500, detail=f"Falha no envio do e-mail de recuperação: {str(e)}")

        # Agenda a limpeza em segundo plano
        background_tasks.add_task(limpar_emails_enviados_antigos)

        return {"success": True, "message": f"E-mail de recuperação enviado com sucesso para {usuario.email}"}

    # 2. Se não achou na tabela de Usuários, verifica se é um e-mail ou nome de um Tutor (cliente)
    tutor = session.exec(
        select(Tutor).where((Tutor.email == query) | (Tutor.nome == query))
    ).first()

    if tutor:
        raise HTTPException(
            status_code=403,
            detail="Este e-mail/nome pertence a um Responsável. O painel administrativo é exclusivo para administradores e colaboradores. Se precisar de acesso, solicite a criação de um Usuário nas Configurações do sistema."
        )

    # 3. Caso não seja encontrado em nenhuma tabela
    raise HTTPException(
        status_code=404,
        detail="Nenhum usuário ou responsável encontrado com o login ou e-mail digitado."
    )

@app.post("/api/auth/reset-password")
def reset_password(request: ResetPasswordRequest, session: Session = Depends(get_session)):
    token = request.token.strip()
    nova_senha = request.password
    
    if not token or token not in TOKENS_RECUPERACAO:
        raise HTTPException(status_code=400, detail="Token de redefinição inválido ou já utilizado.")

    info = TOKENS_RECUPERACAO[token]
    
    if datetime.now() > info["expira_em"]:
        del TOKENS_RECUPERACAO[token]
        raise HTTPException(status_code=400, detail="O link de redefinição expirou. Solicite novamente.")

    usuario = session.exec(select(Usuario).where(Usuario.username == info["username"])).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário associado ao token não encontrado.")

    usuario.hashed_password = get_password_hash(nova_senha)
    session.add(usuario)
    session.commit()

    # Remove o token
    del TOKENS_RECUPERACAO[token]

    return {"success": True, "message": "Senha atualizada com sucesso!"}

# ==========================================
# ROTAS DE CLIENTES
# ==========================================

@app.get("/api/clientes", response_model=List[Cliente])
def listar_clientes(session: Session = Depends(get_session)):
    return session.exec(select(Cliente)).all()

@app.get("/api/clientes/{cliente_id}", response_model=Cliente)
def obter_cliente(cliente_id: int, session: Session = Depends(get_session)):
    cliente = session.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente

@app.post("/api/clientes", response_model=Cliente)
def criar_cliente(cliente: Cliente, session: Session = Depends(get_session)):
    # Verifica CPF duplicado
    if cliente.cpf:
        cpf_limpo = cliente.cpf.replace(".", "").replace("-", "")
        existente = session.exec(select(Cliente).where(Cliente.cpf == cpf_limpo)).first()
        if not existente:
            existente = session.exec(select(Cliente).where(Cliente.cpf == cliente.cpf)).first()
        if existente:
            raise HTTPException(status_code=409, detail=f"CPF já cadastrado para o cliente ID {existente.id} ({existente.nome}).")
        cliente.cpf = cpf_limpo
    # Remove o ID se fornecido para autoincremento
    cliente.id = None
    session.add(cliente)
    session.commit()
    session.refresh(cliente)
    return cliente

@app.put("/api/clientes/{cliente_id}", response_model=Cliente)
def atualizar_cliente(cliente_id: int, cliente_data: Cliente, session: Session = Depends(get_session)):
    db_cliente = session.get(Cliente, cliente_id)
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Verifica CPF duplicado (exclui o próprio registro)
    if cliente_data.cpf:
        cpf_limpo = cliente_data.cpf.replace(".", "").replace("-", "")
        existente = session.exec(
            select(Cliente).where(Cliente.cpf == cpf_limpo, Cliente.id != cliente_id)
        ).first()
        if not existente:
            existente = session.exec(
                select(Cliente).where(Cliente.cpf == cliente_data.cpf, Cliente.id != cliente_id)
            ).first()
        if existente:
            raise HTTPException(status_code=409, detail=f"CPF já cadastrado para o cliente ID {existente.id} ({existente.nome}).")
        cliente_data.cpf = cpf_limpo
    
    # Atualiza campos
    db_cliente.cpf = cliente_data.cpf
    db_cliente.nome = cliente_data.nome
    db_cliente.email = cliente_data.email
    db_cliente.telefone = cliente_data.telefone
    db_cliente.status = cliente_data.status
    
    session.add(db_cliente)
    session.commit()
    session.refresh(db_cliente)
    return db_cliente

@app.delete("/api/clientes/{cliente_id}")
def deletar_cliente(cliente_id: int, session: Session = Depends(get_session)):
    cliente = session.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    session.delete(cliente)
    session.commit()
    return {"detail": f"Cliente {cliente_id} excluído com sucesso"}


# ==========================================
# ROTAS DE TUTORES
# ==========================================

@app.get("/api/tutores", response_model=List[Tutor])
def listar_tutores(session: Session = Depends(get_session)):
    return session.exec(select(Tutor)).all()

@app.get("/api/tutores/{tutor_id}", response_model=Tutor)
def obter_tutor(tutor_id: int, session: Session = Depends(get_session)):
    tutor = session.get(Tutor, tutor_id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor não encontrado")
    return tutor

@app.post("/api/tutores", response_model=Tutor)
def criar_tutor(tutor: Tutor, session: Session = Depends(get_session)):
    # Verifica CPF duplicado
    if tutor.cpf:
        cpf_limpo = tutor.cpf.replace(".", "").replace("-", "")
        existente = session.exec(select(Tutor).where(Tutor.cpf == cpf_limpo)).first()
        if not existente:
            existente = session.exec(select(Tutor).where(Tutor.cpf == tutor.cpf)).first()
        if existente:
            raise HTTPException(status_code=409, detail=f"CPF já cadastrado para o tutor ID {existente.id} ({existente.nome}).")
        tutor.cpf = cpf_limpo
    tutor.id = None
    session.add(tutor)
    session.commit()
    session.refresh(tutor)
    return tutor

@app.put("/api/tutores/{tutor_id}", response_model=Tutor)
def atualizar_tutor(tutor_id: int, tutor_data: Tutor, session: Session = Depends(get_session)):
    db_tutor = session.get(Tutor, tutor_id)
    if not db_tutor:
        raise HTTPException(status_code=404, detail="Tutor não encontrado")
    
    # Verifica CPF duplicado (exclui o próprio registro)
    if tutor_data.cpf:
        cpf_limpo = tutor_data.cpf.replace(".", "").replace("-", "")
        existente = session.exec(
            select(Tutor).where(Tutor.cpf == cpf_limpo, Tutor.id != tutor_id)
        ).first()
        if not existente:
            existente = session.exec(
                select(Tutor).where(Tutor.cpf == tutor_data.cpf, Tutor.id != tutor_id)
            ).first()
        if existente:
            raise HTTPException(status_code=409, detail=f"CPF já cadastrado para o tutor ID {existente.id} ({existente.nome}).")
        tutor_data.cpf = cpf_limpo
    
    # Atualiza todos os campos de tutor_data em db_tutor
    for key, value in tutor_data.dict(exclude={"id", "data_cadastro"}).items():
        setattr(db_tutor, key, value)
        
    session.add(db_tutor)
    session.commit()
    session.refresh(db_tutor)
    return db_tutor

@app.delete("/api/tutores/{tutor_id}")
def deletar_tutor(tutor_id: int, session: Session = Depends(get_session)):
    tutor = session.get(Tutor, tutor_id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor não encontrado")
    
    session.delete(tutor)
    session.commit()
    return {"detail": f"Tutor {tutor_id} excluído com sucesso"}


class BatchDeleteRequest(BaseModel):
    ids: List[int]


@app.post("/api/tutores/batch-delete")
def deletar_tutores_em_massa(req: BatchDeleteRequest, session: Session = Depends(get_session)):
    deleted_count = 0
    for tutor_id in req.ids:
        tutor = session.get(Tutor, tutor_id)
        if tutor:
            session.delete(tutor)
            deleted_count += 1
    session.commit()
    return {"detail": f"{deleted_count} responsáveis excluídos com sucesso"}


# ==========================================
# ROTAS DE PETS
# ==========================================

@app.get("/api/pets", response_model=List[Pet])
def listar_pets(session: Session = Depends(get_session)):
    return session.exec(select(Pet)).all()

@app.get("/api/pets/{pet_id}", response_model=Pet)
def obter_pet(pet_id: int, session: Session = Depends(get_session)):
    pet = session.get(Pet, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    return pet

@app.post("/api/pets", response_model=Pet)
def criar_pet(pet: Pet, session: Session = Depends(get_session)):
    pet.id = None
    session.add(pet)
    session.commit()
    session.refresh(pet)
    return pet

@app.put("/api/pets/{pet_id}", response_model=Pet)
def atualizar_pet(pet_id: int, pet_data: Pet, session: Session = Depends(get_session)):
    db_pet = session.get(Pet, pet_id)
    if not db_pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    
    pet_data_dict = pet_data.dict(exclude_unset=True)
    for key, value in pet_data_dict.items():
        if key != "id":
            setattr(db_pet, key, value)
            
    session.add(db_pet)
    session.commit()
    session.refresh(db_pet)
    return db_pet

@app.delete("/api/pets/{pet_id}")
def deletar_pet(pet_id: int, session: Session = Depends(get_session)):
    pet = session.get(Pet, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    
    session.delete(pet)
    session.commit()
    return {"detail": f"Pet {pet_id} excluído com sucesso"}

# ==========================================
# ROTAS DE PRODUTOS
# ==========================================

@app.get("/api/produtos", response_model=List[Produto])
def listar_produtos(session: Session = Depends(get_session)):
    return session.exec(select(Produto)).all()

@app.get("/api/produtos/{produto_id}", response_model=Produto)
def obter_produto(produto_id: int, session: Session = Depends(get_session)):
    produto = session.get(Produto, produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@app.post("/api/produtos", response_model=Produto)
def criar_produto(produto: Produto, session: Session = Depends(get_session)):
    produto.id = None
    session.add(produto)
    session.commit()
    session.refresh(produto)
    return produto

@app.put("/api/produtos/{produto_id}", response_model=Produto)
def atualizar_produto(produto_id: int, produto_data: Produto, session: Session = Depends(get_session)):
    db_produto = session.get(Produto, produto_id)
    if not db_produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    db_produto.nome = produto_data.nome
    db_produto.categoria = produto_data.categoria
    db_produto.preco = produto_data.preco
    db_produto.estoque = produto_data.estoque
    db_produto.status = "Disponível" if produto_data.estoque > 0 else "Sem Estoque"
    
    session.add(db_produto)
    session.commit()
    session.refresh(db_produto)
    return db_produto

@app.delete("/api/produtos/{produto_id}")
def deletar_produto(produto_id: int, session: Session = Depends(get_session)):
    produto = session.get(Produto, produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    session.delete(produto)
    session.commit()
    return {"detail": f"Produto {produto_id} excluído com sucesso"}


# ==========================================
# ROTAS DE VENDAS
# ==========================================

@app.get("/api/vendas")
def listar_vendas(session: Session = Depends(get_session)):
    # Faz um join para retornar informações enriquecidas de clientes e produtos
    query = select(
        Venda.id,
        Venda.quantidade,
        Venda.valor_total,
        Venda.data_venda,
        Cliente.nome.label("cliente_nome"),
        Produto.nome.label("produto_nome"),
        Produto.preco.label("produto_preco")
    ).join(Cliente, Venda.cliente_id == Cliente.id).join(Produto, Venda.produto_id == Produto.id)
    
    results = session.exec(query).all()
    return [
        {
            "id": r[0],
            "quantidade": r[1],
            "valor_total": r[2],
            "data_venda": r[3],
            "cliente_nome": r[4],
            "produto_nome": r[5],
            "produto_preco": r[6]
        }
        for r in results
    ]

@app.post("/api/vendas")
def registrar_venda(venda: Venda, session: Session = Depends(get_session)):
    # Validações básicas
    cliente = session.get(Cliente, venda.cliente_id)
    produto = session.get(Produto, venda.produto_id)
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    if produto.estoque < venda.quantidade:
        raise HTTPException(status_code=400, detail=f"Estoque insuficiente. Disponível: {produto.estoque}")
    
    # Deduz do estoque
    produto.estoque -= venda.quantidade
    if produto.estoque == 0:
        produto.status = "Sem Estoque"
        
    # Calcula valor total
    venda.valor_total = produto.preco * venda.quantidade
    venda.id = None
    
    session.add(venda)
    session.add(produto)
    session.commit()
    session.refresh(venda)
    return venda


# ==========================================
# ROTA DE INFORMAÇÕES DO DASHBOARD (STATS)
# ==========================================

@app.get("/api/dashboard/stats")
def obter_metricas(session: Session = Depends(get_session)):
    # 1. Total faturado
    faturamento_total = session.exec(select(text("SUM(valor_total) from vendas"))).first() or 0.0
    if isinstance(faturamento_total, tuple):
        faturamento_total = faturamento_total[0] or 0.0

    # 2. Total de clientes ativos
    clientes_ativos = session.exec(select(text("COUNT(id) from clientes WHERE status = 'Ativo'"))).first() or 0
    if isinstance(clientes_ativos, tuple):
        clientes_ativos = clientes_ativos[0] or 0

    # 3. Total de vendas realizadas
    vendas_realizadas = session.exec(select(text("COUNT(id) from vendas"))).first() or 0
    if isinstance(vendas_realizadas, tuple):
        vendas_realizadas = vendas_realizadas[0] or 0

    # 4. Alerta de estoque baixo (produtos com estoque < 5)
    estoque_baixo = session.exec(select(text("COUNT(id) from produtos WHERE estoque < 5"))).first() or 0
    if isinstance(estoque_baixo, tuple):
        estoque_baixo = estoque_baixo[0] or 0

    # 5. Vendas por dia para o gráfico
    # Selecionamos a data formatada e a soma do faturamento
    vendas_dia_query = text(
        "SELECT substr(data_venda, 1, 10) as dia, SUM(valor_total) as total "
        "FROM vendas GROUP BY dia ORDER BY dia DESC LIMIT 7"
    )
    vendas_dia_results = session.execute(vendas_dia_query).all()
    vendas_grafico = [
        {"dia": r[0], "total": r[1]} for r in reversed(vendas_dia_results)
    ]

    # 6. Distribuição de categorias de produtos
    categorias_query = text(
        "SELECT categoria, COUNT(id) as total FROM produtos GROUP BY categoria"
    )
    categorias_results = session.execute(categorias_query).all()
    categorias_grafico = [
        {"categoria": r[0], "total": r[1]} for r in categorias_results
    ]

    return {
        "faturamento_total": float(faturamento_total),
        "clientes_ativos": int(clientes_ativos),
        "vendas_realizadas": int(vendas_realizadas),
        "estoque_baixo": int(estoque_baixo),
        "vendas_grafico": vendas_grafico,
        "categorias_grafico": categorias_grafico
    }


# ==========================================
# ROTA DO TERMINAL SQL INTERATIVO
# ==========================================

@app.post("/api/query")
def executar_query(sql_query: SQLQuery, session: Session = Depends(get_session)):
    query_str = sql_query.query.strip()
    
    # Validação básica de segurança (evitar que limpem o banco por engano num clique se quiserem apenas ler)
    # permitimos todos os comandos, mas alertamos caso ocorram erros
    is_select = query_str.lower().startswith("select")
    
    try:
        result = session.execute(text(query_str))
        
        # Se for um comando SELECT, retornamos colunas e linhas
        if is_select:
            columns = list(result.keys())
            rows = [dict(zip(columns, row)) for row in result.all()]
            return {
                "success": True,
                "type": "select",
                "columns": columns,
                "rows": rows,
                "row_count": len(rows),
                "message": f"Consulta executada com sucesso. {len(rows)} linhas retornadas."
            }
        else:
            session.commit()
            return {
                "success": True,
                "type": "mutation",
                "row_count": result.rowcount,
                "message": f"Comando executado com sucesso. Linhas afetadas: {result.rowcount}."
            }
            
    except Exception as e:
        session.rollback()
        return {
            "success": False,
            "message": f"Erro de banco de dados: {str(e)}"
        }

# ==========================================
# ROTAS DE USUÁRIOS
# ==========================================

@app.get("/api/users")
def listar_usuarios(session: Session = Depends(get_session)):
    usuarios = session.exec(select(Usuario)).all()
    # Exclui hashed_password por segurança
    return [{
        "id": u.id,
        "username": u.username,
        "nome": u.nome,
        "email": u.email,
        "cargo": u.cargo
    } for u in usuarios]

@app.post("/api/users")
def criar_usuario(
    dados: UsuarioCreate,
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    session: Session = Depends(get_session)
):
    if usuario_atual.cargo != "Administrador":
        raise HTTPException(status_code=403, detail="Apenas administradores podem criar novos usuários")
        
    # Verifica se já existe um usuário com o mesmo username
    existente = session.exec(select(Usuario).where(Usuario.username == dados.username)).first()
    if existente:
        raise HTTPException(status_code=400, detail="Este nome de usuário já está cadastrado")
        
    hashed_pw = get_password_hash(dados.password)
    novo_usuario = Usuario(
        username=dados.username,
        hashed_password=hashed_pw,
        nome=dados.nome,
        email=dados.email,
        cargo=dados.cargo
    )
    
    try:
        session.add(novo_usuario)
        session.commit()
        session.refresh(novo_usuario)
        return {
            "id": novo_usuario.id,
            "username": novo_usuario.username,
            "nome": novo_usuario.nome,
            "email": novo_usuario.email,
            "cargo": novo_usuario.cargo
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar usuário: {str(e)}")

@app.put("/api/users/{id}")
def atualizar_usuario(
    id: int,
    dados: UsuarioUpdate,
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    session: Session = Depends(get_session)
):
    if usuario_atual.cargo != "Administrador":
        raise HTTPException(status_code=403, detail="Apenas administradores podem editar usuários")
        
    usuario = session.get(Usuario, id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
    # Verifica duplicidade de username se alterado
    if dados.username != usuario.username:
        existente = session.exec(select(Usuario).where(Usuario.username == dados.username)).first()
        if existente:
            raise HTTPException(status_code=400, detail="Este nome de usuário já está em uso")
            
    usuario.username = dados.username
    usuario.nome = dados.nome
    usuario.email = dados.email
    usuario.cargo = dados.cargo
    
    # Se senha foi enviada, faz o hash e atualiza
    if dados.password and dados.password.strip():
        usuario.hashed_password = get_password_hash(dados.password)
        
    try:
        session.add(usuario)
        session.commit()
        session.refresh(usuario)
        return {
            "id": usuario.id,
            "username": usuario.username,
            "nome": usuario.nome,
            "email": usuario.email,
            "cargo": usuario.cargo
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar usuário: {str(e)}")

@app.delete("/api/users/{id}")
def deletar_usuario(
    id: int,
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    session: Session = Depends(get_session)
):
    if usuario_atual.cargo != "Administrador":
        raise HTTPException(status_code=403, detail="Apenas administradores podem excluir usuários")
        
    usuario = session.get(Usuario, id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
    # Impede auto-exclusão
    if usuario.id == usuario_atual.id:
        raise HTTPException(status_code=400, detail="Você não pode excluir a si mesmo")
        
    # Impede a exclusão do último administrador
    total_admins = session.exec(select(Usuario).where(Usuario.cargo == "Administrador")).all()
    if usuario.cargo == "Administrador" and len(total_admins) <= 1:
        raise HTTPException(status_code=400, detail="Não é possível excluir o único administrador do sistema")
        
    try:
        session.delete(usuario)
        session.commit()
        return {"success": True, "message": "Usuário excluído com sucesso!"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir usuário: {str(e)}")


# ==========================================
# ARQUIVOS ESTÁTICOS
# ==========================================

# Cria a pasta public se não existir para o FastAPI não dar erro ao iniciar
os.makedirs("public", exist_ok=True)

# Monta a pasta public na raiz do site para servir o index.html e assets
app.mount("/", StaticFiles(directory="public", html=True), name="public")
