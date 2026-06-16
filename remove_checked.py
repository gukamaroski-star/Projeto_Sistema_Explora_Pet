import re
with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the 'checked' attribute from the inputs inside custom-radio-group
# Only specifically those for pet-castrado and pet-treinado, but also maybe tutor-autoriza-imagem?
html = re.sub(r'<input type="radio" name="(pet-castrado|pet-treinado|tutor-autoriza-imagem)" value="(Não|false)" checked>', r'<input type="radio" name="\1" value="\2">', html)

# Let's also make sure 'Sim' doesn't have checked, just in case
html = re.sub(r'<input type="radio" name="(pet-castrado|pet-treinado|tutor-autoriza-imagem)" value="(Sim|true)" checked>', r'<input type="radio" name="\1" value="\2">', html)

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Removed checked attributes')
