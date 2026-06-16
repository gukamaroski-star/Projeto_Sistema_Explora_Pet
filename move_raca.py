import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Extract the pet-raca block
raca_pattern = r'(\s*<div class="form-group">\s*<label for="pet-raca">Raça</label>.*?</select>\s*</div>\s*</div>\s*<input type="hidden" id="pet-raca">\s*</div>)'
# wait, raca is an input text with dropdown, not a select.
raca_pattern = r'(\s*<div class="form-group">\s*<label for="pet-raca">Raça</label>.*?(?:</div>\s*</div>\s*<input type="hidden" id="pet-raca">\s*</div>))'

match = re.search(raca_pattern, html, flags=re.DOTALL)
if match:
    raca_html = match.group(1)
    
    # Remove it from its original place
    html = html.replace(raca_html, '')
    
    # 2. Find where to insert it (after pet-especie)
    especie_pattern = r'(<div class="form-group">\s*<label for="pet-especie">Seu pet pertence a qual grupo\?</label>\s*<select id="pet-especie">\s*<option value="">Selecione</option>\s*<option value="Canino">Canino</option>\s*<option value="Felino">Felino</option>\s*</select>\s*</div>)'
    
    match_especie = re.search(especie_pattern, html)
    if match_especie:
        html = html.replace(match_especie.group(1), match_especie.group(1) + raca_html)
        
        # 3. Update ROW 3 grid
        html = html.replace('<!-- ROW 3: Raça | Cor | Porte | Peso (Kg) -->', '<!-- ROW 3: Cor | Porte | Peso (Kg) -->')
        
        # Wait, if I replace ROW 3 grid-template, it might be safer with regex
        html = re.sub(
            r'(<!-- ROW 3: Cor \| Porte \| Peso \(Kg\) -->\s*<div class="form-row" style="grid-template-columns:) 1fr 1fr 1fr 1fr;', 
            r'\1 1fr 1fr 1fr;', 
            html
        )
        
        with open('public/index.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("Raça field moved successfully!")
    else:
        print("Especie block not found!")
else:
    print("Raca block not found!")
