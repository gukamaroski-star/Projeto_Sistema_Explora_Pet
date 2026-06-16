import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_idx = html.find('<!-- ABA 2: CLIENTES -->')
end_idx = html.find('</section>', start_idx) + 10
clientes_tab = html[start_idx:end_idx]

pets_tab = clientes_tab.replace('ABA 2: CLIENTES', 'ABA 10: PETS')
pets_tab = pets_tab.replace('id="tab-clientes"', 'id="tab-pets"')
pets_tab = pets_tab.replace('id="table-tutores-element"', 'id="table-pets-element"')
pets_tab = pets_tab.replace('select-all-tutores', 'select-all-pets')
pets_tab = pets_tab.replace('btn-bulk-delete-tutores', 'btn-bulk-delete-pets')
pets_tab = pets_tab.replace('bulkDeleteTutores', 'bulkDeletePets')
pets_tab = pets_tab.replace('filter-tutor-nome', 'filter-pet-nome')
pets_tab = pets_tab.replace('filter-tutor-cpf', 'filter-pet-tutor')
pets_tab = pets_tab.replace('filter-tutor-wpp', 'filter-pet-raca')
pets_tab = pets_tab.replace('filter-tutor-email', 'filter-pet-especie')
pets_tab = pets_tab.replace('filter-tutor-status', 'filter-pet-status')
pets_tab = pets_tab.replace('applyTutorFilters', 'applyPetFilters')

pets_tab = pets_tab.replace('<th>CPF</th>', '<th>Responsável</th>')
pets_tab = pets_tab.replace('<th>Whatsapp</th>', '<th>Raça</th>')
pets_tab = pets_tab.replace('<th>E-mail</th>', '<th>Espécie</th>')
pets_tab = pets_tab.replace('placeholder="Pesquisar CPF"', 'placeholder="Responsável"')
pets_tab = pets_tab.replace('placeholder="Pesquisar Whatsapp"', 'placeholder="Raça"')
pets_tab = pets_tab.replace('placeholder="Pesquisar E-mail"', 'placeholder="Espécie"')

pets_tab = pets_tab.replace('tbody-tutores', 'tbody-pets')
pets_tab = pets_tab.replace('loading-tutores', 'loading-pets')
pets_tab = pets_tab.replace('empty-tutores', 'empty-pets')
pets_tab = pets_tab.replace('Nenhum tutor encontrado.', 'Nenhum pet encontrado.')
pets_tab = pets_tab.replace('Tente ajustar os filtros ou cadastre um novo tutor.', 'Tente ajustar os filtros ou cadastre um novo pet.')
pets_tab = pets_tab.replace('pagination-tutores', 'pagination-pets')
pets_tab = pets_tab.replace('rows-per-page-tutores', 'rows-per-page-pets')
pets_tab = pets_tab.replace("changeRowsPerPage('tutores'", "changeRowsPerPage('pets'")
pets_tab = pets_tab.replace('page-start-tutores', 'page-start-pets')
pets_tab = pets_tab.replace('page-end-tutores', 'page-end-pets')
pets_tab = pets_tab.replace('page-total-tutores', 'page-total-pets')
pets_tab = pets_tab.replace('btn-prev-tutores', 'btn-prev-pets')
pets_tab = pets_tab.replace('btn-next-tutores', 'btn-next-pets')
pets_tab = pets_tab.replace("prevPage('tutores'", "prevPage('pets'")
pets_tab = pets_tab.replace("nextPage('tutores'", "nextPage('pets'")

html = html[:end_idx] + '\n\n' + pets_tab + html[end_idx:]

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
