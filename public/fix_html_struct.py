import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target_selects = [
    'tutor-sexo', 'tutor-como-conheceu', 'tutor-forma-pgto', 
    'tutor-dia-pagamento', 'tutor-status', 'pet-sexo', 
    'pet-especie', 'pet-porte', 'pet-pelagem', 'cliente-status', 'usuario-cargo'
]

for sel_id in target_selects:
    pattern = r'(<div class="custom-select-wrapper" onclick="toggleCustomSelect\(\'' + sel_id + r'\-list\'\)"[^>]*>.*?</div>)\s*(<input type="hidden" id="' + sel_id + r'"[^>]*>)\s*(<div id="' + sel_id + r'\-list".*?</div>)'
    
    match = re.search(pattern, html, flags=re.DOTALL)
    if match:
        wrapper = match.group(1)
        hidden = match.group(2)
        list_div = match.group(3)
        
        wrapper_open_content = wrapper[:-6]
        new_struct = wrapper_open_content + '\n    ' + hidden + '\n    ' + list_div + '\n</div>'
        html = html.replace(match.group(0), new_struct)

html = html.replace('app.js?v=92', 'app.js?v=93').replace('style.css?v=4', 'style.css?v=5')

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
