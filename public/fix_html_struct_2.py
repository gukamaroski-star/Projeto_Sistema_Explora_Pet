import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target_selects = [
    'tutor-sexo', 'tutor-como-conheceu', 'tutor-forma-pgto', 
    'tutor-dia-pagamento', 'tutor-status', 'pet-sexo', 
    'pet-especie', 'pet-porte', 'pet-pelagem', 'cliente-status', 'usuario-cargo'
]

for sel_id in target_selects:
    # Match the entire messed up block starting from <div class="custom-select-wrapper" onclick="toggleCustomSelect('ID-list')"
    # up to the final </div> that closes the list or the wrapper.
    # Since we know the next element is likely </div> or another form-group, we can be greedy up to a point, or just use regex to find all options.
    
    # Let's find all options for this sel_id
    options_pattern = r'<div class="custom-dropdown-item raca-item" data-value="(.*?)" onclick="selectCustomOption\(\'' + sel_id + r'\', \'.*?\', \'(.*?)\'\)".*?>.*?</div>'
    options = re.findall(options_pattern, html)
    
    if not options:
        continue
        
    # Find the start of the wrapper
    start_pattern = r'<div class="custom-select-wrapper" onclick="toggleCustomSelect\(\'' + sel_id + r'\-list\'\)"(.*?)(<div class="form-group"|</div>\s*</div>\s*</div>|<hr|<!--)'
    
    # Instead of complex regex, let's just find the start of the wrapper and the end of its options
    # The block starts at <div class="custom-select-wrapper" onclick="toggleCustomSelect('sel_id-list')"
    start_idx = html.find(f'<div class="custom-select-wrapper" onclick="toggleCustomSelect(\'{sel_id}-list\')"')
    if start_idx == -1:
        continue
        
    # The block ends after the LAST option for this sel_id, plus the closing </div>s
    last_opt_str = f"selectCustomOption('{sel_id}'"
    # Find the last occurrence of this string in the HTML after start_idx
    
    # Actually, we can just extract the 'required' attribute by looking at the hidden input
    req_match = re.search(r'<input type="hidden" id="' + sel_id + r'"( required)?>', html[start_idx:start_idx+1000])
    is_req = ' required' if (req_match and req_match.group(1)) else ''
    
    new_html = f'''<div class="custom-select-wrapper" onclick="toggleCustomSelect('{sel_id}-list')" style="position: relative; width: 100%;">
        <input type="text" id="{sel_id}-input" placeholder="Selecione" readonly style="cursor: pointer; width: 100%;" class="{is_req.strip()}">
        <i data-lucide="chevron-down" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); width: 18px; height: 18px;"></i>
        <input type="hidden" id="{sel_id}"{is_req}>
        <div id="{sel_id}-list" class="custom-dropdown-list" style="display: none; position: absolute; width: 100%; background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 6px; z-index: 9999; max-height: 200px; overflow-y: auto; top: calc(100% + 5px); left: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">'''
        
    for val, text in options:
        new_html += f'\n            <div class="custom-dropdown-item raca-item" data-value="{val}" onclick="selectCustomOption(\'{sel_id}\', \'{val}\', \'{text}\')" style="padding: 10px 14px; cursor: pointer; color: var(--text-main); font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.05);">{text}</div>'
        
    new_html += '\n        </div>\n    </div>'
    
    # We need to replace the old block. Let's find the exact bounds.
    # The old block starts at start_idx.
    # It ends at the </div> following the last option.
    # Let's find the last option's index
    last_opt_match = list(re.finditer(options_pattern, html[start_idx:start_idx+3000]))[-1]
    end_of_last_opt = start_idx + last_opt_match.end()
    
    # After the last option, there should be one or two </div>. 
    # In the broken HTML, it looks like:
    # <div class="custom-dropdown-item ...>TEXT</div>
    # </div>
    # So we find the first </div> after the last option.
    first_div_close = html.find('</div>', end_of_last_opt)
    
    # Sometimes there might be a second </div> if it was properly closed, but in our broken HTML, the wrapper's </div> is before the second option!
    # Let's just replace from start_idx to first_div_close + 6
    
    old_block = html[start_idx:first_div_close + 6]
    html = html.replace(old_block, new_html)

html = html.replace('app.js?v=93', 'app.js?v=94').replace('style.css?v=5', 'style.css?v=6')

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
