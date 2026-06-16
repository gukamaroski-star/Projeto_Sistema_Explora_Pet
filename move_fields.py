import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_marker = '<!-- Coluna Direita: 2 linhas de campos -->'
end_marker = '<!-- ROW 3: Raça | Cor | Porte | Peso (Kg) -->'

start_idx = html.find(start_marker)
end_idx = html.find(end_marker)

if start_idx != -1 and end_idx != -1:
    section = html[start_idx:end_idx]
    
    # We will just replace the `</div>\n                                    <!-- Linha 2...` boundary
    # Wait, the best way is to match all `form-group`s
    groups = re.findall(r'(<div class="form-group">.*?</div>\s*</div>\s*<input type="hidden" id="pet-tutor">\s*</div>|<div class="form-group">.*?</div>(?=\s*<div class="form-group"|\s*</div>\s*<!--|\s*</div>\s*<div class="form-row)|\s*</div>\s*</div>\s*</div>)', section, flags=re.DOTALL)
    
    # Since parsing HTML with regex is fragile, let's do simple string replacements
    
    # Remove the end of row 1 and start of row 2
    # Row 1 ends with `</div>` then `<!-- Linha 2: Data de Nascimento | Sexo | Grupo -->`
    # then `<div class="form-row" style="grid-template-columns: 1fr 1fr 1fr; margin-top: 0;">`
    
    pattern = r'</div>\s*<!-- Linha 2: Data de Nascimento \| Sexo \| Grupo -->\s*<div class="form-row" style="grid-template-columns: 1fr 1fr 1fr; margin-top: 0;">'
    new_section = re.sub(pattern, '', section)
    
    # Also we need to change Linha 1's grid-template-columns
    new_section = new_section.replace('grid-template-columns: 1fr 1fr 1fr 1fr;', 'grid-template-columns: 1fr 1fr 1fr; gap: 16px;')
    
    # Now there's one extra `</div>` at the end because we removed the start of row 2 but not the end of row 2
    # Wait, the structure was:
    # <div flex column>
    #   <div form-row> ... </div>
    #   <div form-row> ... </div>
    # </div>
    # By removing the `</div>` of row 1 and `<div form-row>` of row 2, it becomes a single `<div form-row>` containing all 7 items, and one `</div>` to close it, then one `</div>` to close the flex column.
    # Exactly what we want!
    
    html = html[:start_idx] + new_section + html[end_idx:]
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("HTML modified")
else:
    print("Markers not found")
