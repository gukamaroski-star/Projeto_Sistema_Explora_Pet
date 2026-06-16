import re

# Update index.html
with open('public/index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# 1. Add menu item under Clientes
menu_item = '''                        <a href="#" class="submenu-link" data-tab="clientes">
                            <i data-lucide="user"></i>
                            <span>Responsáveis</span>
                        </a>
                        <a href="#" class="submenu-link" data-tab="novo-pet">
                            <i data-lucide="plus"></i>
                            <span>Pet</span>
                        </a>'''
html_content = html_content.replace('''                        <a href="#" class="submenu-link" data-tab="clientes">
                            <i data-lucide="user"></i>
                            <span>Responsáveis</span>
                        </a>''', menu_item)

# 2. Add Tab Panel for Novo Pet
novo_pet_tab = '''
                <!-- ABA: NOVO PET -->
                <section class="tab-panel" id="tab-novo-pet">
                    <div class="section-header-row" style="display: none;">
                        <div>
                            <h3 class="section-label" id="tab-novo-pet-title"><i data-lucide="plus"></i> Novo Pet</h3>
                            <p class="section-desc">Cadastre ou edite as informações de um Pet e vincule-o a um Responsável.</p>
                        </div>
                    </div>
                    <div class="table-container" style="padding: 24px;">
                        <form id="form-pet" onsubmit="savePet(event)">
                            <input type="hidden" id="pet-id">

                            <!-- ROW 1: Responsável -->
                            <div class="form-row" style="grid-template-columns: 1fr;">
                                <div class="form-group">
                                    <label for="pet-tutor-id">Responsável *</label>
                                    <select id="pet-tutor-id" required>
                                        <option value="">Carregando responsáveis...</option>
                                    </select>
                                </div>
                            </div>
                            
                            <hr style="border: 0; border-top: 1px solid var(--border-glow); margin: 20px 0;">

                            <!-- ROW 2: Nome e Espécie -->
                            <div class="form-row" style="grid-template-columns: 2fr 1fr;">
                                <div class="form-group">
                                    <label for="pet-nome">Nome do Pet *</label>
                                    <input type="text" id="pet-nome" required placeholder="Ex: Rex" autocomplete="off">
                                </div>
                                <div class="form-group">
                                    <label for="pet-especie">Espécie *</label>
                                    <select id="pet-especie" required>
                                        <option value="">Selecione</option>
                                        <option value="Cão">Cão</option>
                                        <option value="Gato">Gato</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                            </div>

                            <!-- ROW 3: Raça e Data -->
                            <div class="form-row" style="grid-template-columns: 1fr 1fr;">
                                <div class="form-group">
                                    <label for="pet-raca">Raça</label>
                                    <input type="text" id="pet-raca" placeholder="Ex: Poodle" autocomplete="off">
                                </div>
                                <div class="form-group">
                                    <label for="pet-data-nascimento">Data de Nascimento (aprox.)</label>
                                    <input type="text" id="pet-data-nascimento" placeholder="DD/MM/AAAA" maxlength="10" autocomplete="off">
                                </div>
                            </div>

                            <hr style="border: 0; border-top: 1px solid var(--border-glow); margin: 20px 0;">

                            <!-- ROW 4: Observações -->
                            <div class="form-row" style="grid-template-columns: 1fr;">
                                <div class="form-group">
                                    <label for="pet-observacoes">Observações (Comportamento, saúde, alergias, etc)</label>
                                    <textarea id="pet-observacoes" placeholder="Digite informações adicionais sobre o pet..." rows="4" style="resize: vertical;"></textarea>
                                </div>
                            </div>

                            <div class="modal-footer" style="margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border-glow);">
                                <button type="button" class="btn btn-secondary" onclick="document.getElementById('form-pet').reset(); document.querySelector('[data-tab=\'dashboard\']').click();">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Salvar Pet</button>
                            </div>
                        </form>
                    </div>
                </section>
'''

html_content = html_content.replace('<!-- ABA 7: USUÁRIOS -->', novo_pet_tab + '\\n                <!-- ABA 7: USUÁRIOS -->')

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)


# Update app.js
with open('public/app.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Add to onTabChanged
tab_case = '''        case 'novo-pet':
            title.textContent = "Cadastro de Pet";
            subtitle.textContent = "Registre as informações de um Pet e vincule-o ao seu respectivo Responsável.";
            loadTutoresParaSelect();
            break;
        case 'usuarios':'''
js_content = js_content.replace("        case 'usuarios':", tab_case)

# Add loadTutoresParaSelect and savePet functions
pets_js = '''

async function loadTutoresParaSelect() {
    try {
        const response = await fetch(`${API_BASE}/tutores`);
        const tutores = await response.json();
        const select = document.getElementById('pet-tutor-id');
        select.innerHTML = '<option value="">Selecione o Responsável</option>';
        tutores.forEach(t => {
            select.innerHTML += `<option value="${t.id}">${t.nome} (CPF: ${t.cpf || 'N/A'})</option>`;
        });
    } catch (e) {
        console.error(e);
        const select = document.getElementById('pet-tutor-id');
        select.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

async function savePet(e) {
    e.preventDefault();
    const id = document.getElementById('pet-id').value;
    
    const data = {
        nome: document.getElementById('pet-nome').value,
        especie: document.getElementById('pet-especie').value,
        raca: document.getElementById('pet-raca').value || null,
        data_nascimento: document.getElementById('pet-data-nascimento').value || null,
        observacoes: document.getElementById('pet-observacoes').value || null,
        tutor_id: parseInt(document.getElementById('pet-tutor-id').value)
    };

    const url = id ? `${API_BASE}/pets/${id}` : `${API_BASE}/pets`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('form-pet').reset();
            document.getElementById('pet-id').value = '';
            alert("Pet salvo com sucesso!");
            // Redireciona para o painel de clientes ou permanece
            document.querySelector('[data-tab="clientes"]').click();
        } else {
            const err = await response.json();
            alert("Erro ao salvar o Pet: " + (err.detail || "Verifique os campos."));
        }
    } catch (error) {
        console.error(error);
        alert("Erro de conexão ao salvar Pet.");
    }
}
'''
js_content += pets_js

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
