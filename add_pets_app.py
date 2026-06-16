import re

with open('public/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update state object
state_replacement = """    tutores: [],
    pets: [],
    produtos: [],
    vendas: [],
    officialCPFData: null,
    charts: {
        sales: null,
        categories: null
    },
    // Pagination state
    tutoresPage: 1,
    tutoresRowsPerPage: 20,
    tutoresFilteredList: null,
    currentTutorInView: null,
    
    petsPage: 1,
    petsRowsPerPage: 20,
    petsFilteredList: null"""
js = js.replace('    tutores: [],\n    produtos: [],\n    vendas: [],\n    officialCPFData: null,\n    charts: {\n        sales: null,\n        categories: null\n    },\n    // Pagination state\n    tutoresPage: 1,\n    tutoresRowsPerPage: 20,\n    tutoresFilteredList: null,\n    currentTutorInView: null', state_replacement)

# 2. Add to switchTab logic
js = js.replace("if (state.tutores.length === 0) await loadTutores(true);", "if (state.tutores.length === 0) await loadTutores(true);\n        if (tabId === 'pets') {\n            if (state.pets.length === 0) await loadPets(true);\n            else renderPetsList();\n        }")

# 3. Read Tutores logic to adapt for Pets
start_tutores = js.find('async function loadTutores')
end_tutores = js.find('// ==========================================\n// UTILITÁRIOS DA TABELA E FILTROS', start_tutores)
tutores_logic = js[start_tutores:end_tutores]

pets_logic = tutores_logic.replace('Tutores', 'Pets').replace('tutores', 'pets').replace('Tutor', 'Pet').replace('tutor', 'pet').replace('TUTOR', 'PET')

# Fix specific endpoints and properties in pets_logic
pets_logic = pets_logic.replace('/api/petses', '/api/pets')
pets_logic = pets_logic.replace('pet.cpf', 'pet.tutor_id') # roughly
pets_logic = pets_logic.replace('pet.telefone', 'pet.raca')
pets_logic = pets_logic.replace('pet.email', 'pet.especie')

# Need a custom renderPetsList
pets_render = """
function renderPetsList() {
    const tbody = document.getElementById('tbody-pets');
    const emptyState = document.getElementById('empty-pets');
    
    if (!tbody) return;
    
    const listToRender = state.petsFilteredList || state.pets;
    
    // Pagination logic
    const totalItems = listToRender.length;
    let itemsPerPage = state.petsRowsPerPage;
    
    if (itemsPerPage === 'all') {
        itemsPerPage = totalItems;
        state.petsPage = 1;
    }
    
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (state.petsPage > totalPages) state.petsPage = totalPages;
    
    const startIndex = (state.petsPage - 1) * itemsPerPage;
    const endIndex = itemsPerPage === totalItems ? totalItems : Math.min(startIndex + itemsPerPage, totalItems);
    
    const pageItems = listToRender.slice(startIndex, endIndex);
    
    document.getElementById('page-start-pets').textContent = totalItems === 0 ? 0 : startIndex + 1;
    document.getElementById('page-end-pets').textContent = endIndex;
    document.getElementById('page-total-pets').textContent = totalItems;
    
    document.getElementById('btn-prev-pets').disabled = state.petsPage === 1;
    document.getElementById('btn-next-pets').disabled = state.petsPage === totalPages;
    
    tbody.innerHTML = '';
    
    if (pageItems.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        
        pageItems.forEach(pet => {
            const tr = document.createElement('tr');
            
            // Buscar nome do tutor correspondente
            const tutor = state.tutores.find(t => t.id === pet.tutor_id);
            const tutorNome = tutor ? tutor.nome : 'Desconhecido';
            
            tr.innerHTML = `
                <td>
                    <div style="display: flex; gap: 4px;">
                        <input type="checkbox" class="row-checkbox-pets custom-checkbox" data-id="${pet.id}" onchange="toggleBulkDeleteBtn('pets')">
                        <button class="btn btn-secondary btn-icon" onclick="editPet(${pet.id})" title="Editar Pet" style="padding: 4px; margin-left: 4px;">
                            <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="btn btn-secondary btn-icon" onclick="deletePet(${pet.id})" title="Excluir Pet" style="padding: 4px; color: var(--danger);">
                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                </td>
                <td style="font-weight: 500;">${pet.nome || '-'}</td>
                <td>${tutorNome}</td>
                <td>${pet.especie || '-'}</td>
                <td>${pet.raca || '-'}</td>
                <td style="text-align: center;">
                    <span class="badge ${pet.status === 'Ativo' ? 'badge-success' : 'badge-warning'}">${pet.status || 'Ativo'}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}

function applyPetFilters() {
    const searchNome = document.getElementById('filter-pet-nome').value.toLowerCase();
    const searchTutor = document.getElementById('filter-pet-tutor').value.toLowerCase();
    const searchEspecie = document.getElementById('filter-pet-especie').value.toLowerCase();
    const searchRaca = document.getElementById('filter-pet-raca').value.toLowerCase();
    const searchStatus = document.getElementById('filter-pet-status').value.toLowerCase();
    
    if (!searchNome && !searchTutor && !searchEspecie && !searchRaca && !searchStatus) {
        state.petsFilteredList = null;
    } else {
        state.petsFilteredList = state.pets.filter(pet => {
            const tutor = state.tutores.find(t => t.id === pet.tutor_id);
            const tutorNome = tutor ? tutor.nome.toLowerCase() : '';
            
            const matchNome = !searchNome || (pet.nome && pet.nome.toLowerCase().includes(searchNome));
            const matchTutor = !searchTutor || tutorNome.includes(searchTutor);
            const matchEspecie = !searchEspecie || (pet.especie && pet.especie.toLowerCase().includes(searchEspecie));
            const matchRaca = !searchRaca || (pet.raca && pet.raca.toLowerCase().includes(searchRaca));
            const matchStatus = !searchStatus || (pet.status && pet.status.toLowerCase().includes(searchStatus));
            
            return matchNome && matchTutor && matchEspecie && matchRaca && matchStatus;
        });
    }
    
    state.petsPage = 1;
    renderPetsList();
}
"""

js = js + "\n\n// ==========================================\n// ROTAS E LÓGICA DE PETS\n\n" + pets_logic.split("function renderPetsList")[0] + pets_render

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
