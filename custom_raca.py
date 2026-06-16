import re

with open('public/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

with open('tmp_breeds.txt', 'r', encoding='utf-8') as f:
    tmp = f.read()
options = re.findall(r'<option value="(.*?)"></option>', tmp)
options = [o for o in options if o.strip()]

breeds_array = 'window.allRacas = ' + str(options) + ';\n'

js_code = f'''
{breeds_array}

window.openRacaDropdown = function() {{
    const listDiv = document.getElementById('racas-custom-list');
    if (listDiv) {{
        listDiv.style.display = 'block';
        window.renderRacaDropdown(window.allRacas);
    }}
}};

window.renderRacaDropdown = function(racas) {{
    const listDiv = document.getElementById('racas-custom-list');
    listDiv.innerHTML = '';
    if(racas.length === 0) {{
        listDiv.innerHTML = '<div style="padding: 8px 12px; color: var(--text-muted); font-size: 14px;">Nenhuma raça encontrada</div>';
        return;
    }}
    racas.forEach(r => {{
        const div = document.createElement('div');
        div.textContent = r;
        div.style.padding = '8px 12px';
        div.style.cursor = 'pointer';
        div.style.fontSize = '14px';
        div.style.color = '#fff';
        div.onmouseover = () => div.style.backgroundColor = 'var(--primary)';
        div.onmouseout = () => div.style.backgroundColor = 'transparent';
        div.onclick = function(e) {{
            e.stopPropagation();
            document.getElementById('pet-raca-input').value = r;
            document.getElementById('pet-raca').value = r;
            listDiv.style.display = 'none';
        }};
        listDiv.appendChild(div);
    }});
}};

window.filterRacaDropdown = function(text) {{
    if(!text) {{
        window.renderRacaDropdown(window.allRacas);
        document.getElementById('pet-raca').value = '';
        return;
    }}
    document.getElementById('pet-raca').value = text;
    const filtered = window.allRacas.filter(r => r.toLowerCase().includes(text.toLowerCase()));
    window.renderRacaDropdown(filtered);
}};

document.addEventListener('click', function(e) {{
    const input = document.getElementById('pet-raca-input');
    const list = document.getElementById('racas-custom-list');
    if (input && list) {{
        if (!input.contains(e.target) && !list.contains(e.target)) {{
            list.style.display = 'none';
            if(input.value) {{
                document.getElementById('pet-raca').value = input.value;
            }}
        }}
    }}
}});
'''

if 'window.openRacaDropdown' not in app_js:
    with open('public/app.js', 'a', encoding='utf-8') as f:
        f.write('\n\n' + js_code)
    print('JS appended.')

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_idx = html.find('<select id="pet-raca">')
if start_idx != -1:
    end_idx = html.find('</select>', start_idx) + len('</select>')
    new_html = '''<div style="position: relative; width: 100%;">
                                        <input type="text" id="pet-raca-input" required placeholder="Selecione ou digite..." autocomplete="off" style="background-image: url('data:image/svg+xml;utf8,<svg fill=%22%23ffffff%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>'); background-repeat: no-repeat; background-position: right 10px center; padding-right: 32px; cursor: text;" onfocus="window.openRacaDropdown()" oninput="window.filterRacaDropdown(this.value)">
                                        <div id="racas-custom-list" style="display: none; position: absolute; top: calc(100% - 1px); left: 0; right: 0; background: #2b2b2b; border: 1px solid #555; border-top: 1px solid #444; border-radius: 0 0 4px 4px; max-height: 250px; overflow-y: auto; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.5); padding: 4px 0;">
                                        </div>
                                    </div>
                                    <input type="hidden" id="pet-raca">'''
    html = html[:start_idx] + new_html + html[end_idx:]
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('HTML modified.')
else:
    print('Select não encontrado')
