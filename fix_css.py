with open('public/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('input[value="true"]', 'input[value="Sim"]')
css = css.replace('input[value="false"]', 'input[value="Não"]')

with open('public/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('CSS updated for Sim/Não')
