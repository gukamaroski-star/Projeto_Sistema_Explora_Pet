import re

with open('public/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace Sim block to include true
old_sim_block = r'\.custom-radio-check input\[value="Sim"\]:checked \+ \.box-success \{'
new_sim_block = r'.custom-radio-check input[value="Sim"]:checked + .box-success,\n.custom-radio-check input[value="true"]:checked + .box-success {'
css = re.sub(old_sim_block, new_sim_block, css)

old_sim_label = r'\.custom-radio-check input\[value="Sim"\]:checked ~ \.radio-label \{'
new_sim_label = r'.custom-radio-check input[value="Sim"]:checked ~ .radio-label,\n.custom-radio-check input[value="true"]:checked ~ .radio-label {'
css = re.sub(old_sim_label, new_sim_label, css)

# Replace Não block to include false
old_nao_block = r'\.custom-radio-check input\[value="Não"\]:checked \+ \.box-danger \{'
new_nao_block = r'.custom-radio-check input[value="Não"]:checked + .box-danger,\n.custom-radio-check input[value="false"]:checked + .box-danger {'
css = re.sub(old_nao_block, new_nao_block, css)

old_nao_label = r'\.custom-radio-check input\[value="Não"\]:checked ~ \.radio-label \{'
new_nao_label = r'.custom-radio-check input[value="Não"]:checked ~ .radio-label,\n.custom-radio-check input[value="false"]:checked ~ .radio-label {'
css = re.sub(old_nao_label, new_nao_label, css)

with open('public/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('CSS updated to support both Sim/Não and true/false')
