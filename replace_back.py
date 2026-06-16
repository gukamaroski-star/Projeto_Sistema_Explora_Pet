import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_idx = html.find('<input type="text" id="pet-raca"')
end_idx = html.find('</datalist>', start_idx) + len('</datalist>')

if start_idx != -1 and end_idx != -1:
    block = html[start_idx:end_idx]
    
    options = re.findall(r'<option value="(.*?)"></option>', block)
    
    new_select = ['<select id="pet-raca">', '                                        <option value="">Selecione</option>']
    for opt in options:
        new_select.append(f'                                        <option value="{opt}">{opt}</option>')
    new_select.append('                                    </select>')
    
    new_html = html[:start_idx] + '\n'.join(new_select) + html[end_idx:]
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print('Convertido para select com sucesso!')
else:
    print('Bloco não encontrado')
