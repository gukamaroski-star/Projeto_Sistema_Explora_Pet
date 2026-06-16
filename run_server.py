import os
import sys
import uvicorn
import socket

def obter_ip_local():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Tenta se conectar a um IP externo fictício para obter a interface de rede ativa
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    ip_local = obter_ip_local()
    
    print("\n" + "="*80)
    print(" ENTERPRISEDB - PREPARANDO AMBIENTE DE REDE PARA MOBILE")
    print("="*80)
    print(f" 🖥️  IP local do seu computador:  {ip_local}")
    print(f" 🌐 Iniciando servidor no host:   0.0.0.0 (Aceita conexões do celular)")
    print(f" 🔌 Porta:                        9001")
    print(f" 📱 URL para o App Mobile:        http://{ip_local}:9001")
    print("="*80)
    print(" 🔔 IMPORTANTE:")
    print("    1. Garanta que o seu celular está no mesmo Wi-Fi que este computador.")
    print("    2. Caso use emulador de Android/iOS no próprio PC, você também pode")
    print(f"       usar 'http://{ip_local}:9001' ou 'http://10.0.2.2:9001' (Android).")
    print("="*80 + "\n")
    
    # Inicia o servidor uvicorn habilitando conexões externas de outros dispositivos na rede local
    uvicorn.run("main:app", host="0.0.0.0", port=9001, reload=True)
