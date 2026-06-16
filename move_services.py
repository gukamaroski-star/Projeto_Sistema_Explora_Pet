import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove the previously added section
html = re.sub(r'<!-- ROW SERVIÇOS -->.*?<!-- ROW 5 -->', '<!-- ROW 5 -->', html, flags=re.DOTALL)

# 2. Insert into Linha 1
linha_1_search = '<div class="form-row" style="grid-template-columns: 1fr 1fr 1fr;">'
if linha_1_search in html:
    new_linha_1 = '<div class="form-row" style="grid-template-columns: 1fr 1fr 1fr 1fr;">\n'
    new_linha_1 += '''                                        <div class="form-group">
                                            <label for="pet-servicos">Serviço(s)</label>
                                            <select id="pet-servicos">
                                                <option value="">Selecione...</option>
                                                <option value="Adestramento">Adestramento</option>
                                                <option value="Cuidado Domiciliar">Cuidado Domiciliar</option>
                                                <option value="Hospedagem">Hospedagem</option>
                                                <option value="Passeios">Passeios</option>
                                            </select>
                                        </div>'''
    html = html.replace(linha_1_search, new_linha_1)
    
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('HTML modified.')
else:
    print('Linha 1 não encontrada')
