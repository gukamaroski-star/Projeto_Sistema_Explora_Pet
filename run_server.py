import os
import sys
import socket
import uvicorn

# ------------------------------------------------------------
# Configurações do Servidor
# ------------------------------------------------------------
HOST      = "0.0.0.0"
PORT      = 9001
APP_NAME  = "Explora Pet"
APP_MODULE = "main:app"
RELOAD    = True


def obter_ip_local() -> str:
    """Retorna o IP local da máquina na rede Wi-Fi ativa."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


def exibir_banner(ip_local: str) -> None:
    """Exibe as informações de inicialização do servidor."""
    linha = "=" * 70
    print(f"\n{linha}")
    print(f"  🐾 {APP_NAME} — Servidor Iniciado")
    print(linha)
    print(f"  🖥️  IP Local:        {ip_local}")
    print(f"  🌐 Host:            {HOST}  (aceita conexões externas)")
    print(f"  🔌 Porta:           {PORT}")
    print(f"  📱 URL Mobile:      http://{ip_local}:{PORT}")
    print(f"  📝 Swagger Docs:    http://localhost:{PORT}/docs")
    print(linha)
    print("  🔔 IMPORTANTE:")
    print("     • Celular e computador devem estar no mesmo Wi-Fi.")
    print(f"    • Emulador Android: http://10.0.2.2:{PORT}")
    print(f"{linha}\n")


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    # Garante que o uvicorn encontra o main.py na raiz do projeto (infra/dev/ → raiz)
    raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.chdir(raiz)
    sys.path.insert(0, raiz)

    ip_local = obter_ip_local()
    exibir_banner(ip_local)

    uvicorn.run(APP_MODULE, host=HOST, port=PORT, reload=RELOAD)
