import urllib.request
import json
try:
    req = urllib.request.urlopen('https://dog.ceo/api/breeds/list/all')
    res = json.loads(req.read())
    breeds = []
    for breed, sub_breeds in res['message'].items():
        if not sub_breeds:
            breeds.append(breed.title())
        else:
            for sub in sub_breeds:
                breeds.append(f'{sub.title()} {breed.title()}')
    
    extras = [
        'SRD (Sem Raça Definida)', 'Fila Brasileiro', 'Rastreador Brasileiro', 'Terrier Brasileiro (Fox Paulistinha)',
        'Ovelheiro Gaúcho', 'Dogue Brasileiro', 'Buldogue Campeiro', 'Veadeiro Pampeano',
        'Abissínio (Gato)', 'Angorá (Gato)', 'Ashera (Gato)', 'Bengal (Gato)', 'Burmês (Gato)',
        'Himalaio (Gato)', 'Maine Coon (Gato)', 'Munchkin (Gato)', 'Persa (Gato)', 'Ragdoll (Gato)',
        'Sagrado da Birmânia (Gato)', 'Scottish Fold (Gato)', 'Siamês (Gato)', 'Sphynx (Gato)'
    ]
    breeds.extend(extras)
    breeds = list(set(breeds))
    breeds.sort()
    
    if 'SRD (Sem Raça Definida)' in breeds:
        breeds.remove('SRD (Sem Raça Definida)')
        breeds.insert(0, 'SRD (Sem Raça Definida)')
    
    with open('tmp_breeds.txt', 'w', encoding='utf-8') as f:
        f.write('<input type="text" id="pet-raca" list="lista-racas" placeholder="Selecione ou digite a raça..." autocomplete="off">\n')
        f.write('<datalist id="lista-racas">\n')
        for b in breeds:
            f.write(f'    <option value="{b}"></option>\n')
        f.write('</datalist>')
    print('Sucesso. Gerado ' + str(len(breeds)) + ' raças.')
except Exception as e:
    print('Erro:', e)
