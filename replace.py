with open('tmp_breeds.txt', 'r', encoding='utf-8') as f:
    datalist_content = f.read()

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_idx = html.find('<select id="pet-raca">')
if start_idx != -1:
    end_idx = html.find('</select>', start_idx) + len('</select>')
    new_html = html[:start_idx] + datalist_content + html[end_idx:]
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print('Substituição concluída com sucesso!')
else:
    print('Não encontrou o bloco.')
