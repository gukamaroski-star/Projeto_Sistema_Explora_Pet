import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target_selects = [
    'tutor-sexo', 'tutor-como-conheceu', 'tutor-forma-pgto', 
    'tutor-dia-pagamento', 'tutor-status', 'pet-sexo', 
    'pet-especie', 'pet-porte', 'pet-pelagem', 'cliente-status', 'usuario-cargo'
]

for sel_id in target_selects:
    pattern = r'<select id="' + sel_id + r'"[^>]*>(.*?)</select>'
    match = re.search(pattern, html, flags=re.DOTALL)
    if not match:
        continue
    
    full_select = match.group(0)
    options_html = match.group(1)
    
    options = re.findall(r'<option value="(.*?)"[^>]*>(.*?)</option>', options_html)
    
    is_required = 'required' in full_select
    req_attr = 'required' if is_required else ''
    
    new_html = f'''<div class="custom-select-wrapper" onclick="toggleCustomSelect('{sel_id}-list')" style="position: relative; width: 100%;">
        <input type="text" id="{sel_id}-input" placeholder="Selecione" readonly style="cursor: pointer; width: 100%;" class="{req_attr}">
        <i data-lucide="chevron-down" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); width: 18px; height: 18px;"></i>
    </div>
    <input type="hidden" id="{sel_id}" {req_attr}>
    <div id="{sel_id}-list" class="custom-dropdown-list" style="display: none; position: absolute; width: 100%; background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 6px; z-index: 9999; max-height: 200px; overflow-y: auto; top: calc(100% + 5px); left: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">'''
    
    for val, text in options:
        if not text.strip() or text.strip() == 'Selecione' or text.strip() == 'Selecione um status': continue
        new_html += f'\n        <div class="custom-dropdown-item raca-item" data-value="{val}" onclick="selectCustomOption(\'{sel_id}\', \'{val}\', \'{text}\')" style="padding: 10px 14px; cursor: pointer; color: var(--text-main); font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.05);">{text}</div>'
    
    new_html += '\n    </div>'
    
    html = html.replace(full_select, new_html)

html = html.replace('app.js?v=91', 'app.js?v=92').replace('style.css?v=3', 'style.css?v=4')

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
