import re

# 1. main.py
with open('main.py', 'r', encoding='utf-8') as f:
    main_content = f.read()

main_content = main_content.replace(', Pet', '')
# Remove endpoints block
main_content = re.sub(r'# ==========================================\n# ROTAS DE PETS.*?# Servindo Arquivos Estáticos', '# Servindo Arquivos Estáticos', main_content, flags=re.DOTALL)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(main_content)

# 2. database/__init__.py
with open('database/__init__.py', 'r', encoding='utf-8') as f:
    init_content = f.read()
init_content = init_content.replace(', Pet', '')
with open('database/__init__.py', 'w', encoding='utf-8') as f:
    f.write(init_content)

# 3. database/schemas.py
with open('database/schemas.py', 'r', encoding='utf-8') as f:
    schemas_content = f.read()
schemas_content = re.sub(r'\n# Modelo para a tabela de Pets\nclass Pet\(SQLModel, table=True\):.*?(?=$)', '', schemas_content, flags=re.DOTALL)
with open('database/schemas.py', 'w', encoding='utf-8') as f:
    f.write(schemas_content)

# 4. public/index.html
with open('public/index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()
html_content = re.sub(r'\s*<a href=\"#\" class=\"submenu-link\" data-tab=\"novo-pet\">.*?</a>', '', html_content, flags=re.DOTALL)
html_content = re.sub(r'\s*<!-- ABA: NOVO PET -->.*?</section>', '', html_content, flags=re.DOTALL)
with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

# 5. public/app.js
with open('public/app.js', 'r', encoding='utf-8') as f:
    js_content = f.read()
js_content = re.sub(r'\s*case \'novo-pet\':.*?(?=case \'usuarios\':)', '\n        case \'usuarios\':', js_content, flags=re.DOTALL)
js_content = re.sub(r'async function loadTutoresParaSelect\(\) \{.*', '', js_content, flags=re.DOTALL)
with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
