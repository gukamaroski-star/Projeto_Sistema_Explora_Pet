import os

filepath = "c:\\Users\\g.kamaroski\\Documents\Explora\\Projeto_Sistema_Explora_Pet\\public\\app.js"
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "checkUserPermissions" in line:
        print(f"Linha {idx + 1}: {line.strip()}")
