import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

apelido_pattern = r'<div class="form-group">\s*<label for="pet-apelido">Apelido</label>\s*<input type="text" id="pet-apelido" placeholder="Ex: Rexzinho" autocomplete="off">\s*</div>'

html = re.sub(apelido_pattern, '', html, flags=re.DOTALL)

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Apelido removed")
