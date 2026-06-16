import re

# Remove from app.js
with open('public/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js_to_remove = r'// --- DYNAMIC FIELDS LOGIC ---.*?\}\);\s*\}\);\s*'
new_js = re.sub(js_to_remove, '', js, flags=re.DOTALL)

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(new_js)

# Remove from index.html
with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove the DYNAMIC FIELDS block
html = re.sub(r'<!-- DYNAMIC FIELDS PER SERVICE -->.*?</div>\s*<!-- ROW 5 -->', '<!-- ROW 5 -->', html, flags=re.DOTALL)

# Also wait, the block was inserted BEFORE modal-footer, so it might not have <!-- ROW 5 --> right after it.
# It was inserted with: html_sections + '\n' + modal_footer
html = re.sub(r'<!-- DYNAMIC FIELDS PER SERVICE -->.*?</div>\s*</div>\s*(?=<div class="modal-footer")', '', html, flags=re.DOTALL)

# 2. Remove the pet-servicos select block
#                                         <div class="form-group">
#                                             <label for="pet-servicos">Serviço(s)</label>
#                                             <select id="pet-servicos">
#                                                 <option value="">Selecione...</option>
#                                                 <option value="Adestramento">Adestramento</option>
#                                                 <option value="Cuidado Domiciliar">Cuidado Domiciliar</option>
#                                                 <option value="Hospedagem">Hospedagem</option>
#                                                 <option value="Passeios">Passeios</option>
#                                             </select>
#                                         </div>
service_field_pattern = r'<div class="form-group">\s*<label for="pet-servicos">Serviço\(s\)</label>\s*<select id="pet-servicos">.*?</select>\s*</div>\s*'
html = re.sub(service_field_pattern, '', html, flags=re.DOTALL)

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Removed service fields and logic")
