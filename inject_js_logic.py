js_logic = """
// --- DYNAMIC FIELDS LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const servicosSelect = document.getElementById('pet-servicos');
    if (servicosSelect) {
        servicosSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const container = document.getElementById('dynamic-fields-container');
            const allSections = document.querySelectorAll('.service-fields');
            
            // Esconde todas as sessões primeiro
            allSections.forEach(sec => sec.style.display = 'none');
            
            if (!val) {
                // Nenhum serviço selecionado
                container.style.display = 'none';
            } else {
                // Mostra container geral
                container.style.display = 'block';
                
                // Mostra seção específica baseada no valor selecionado
                if (val === 'Adestramento') {
                    document.getElementById('fields-adestramento').style.display = 'block';
                } else if (val === 'Hospedagem') {
                    document.getElementById('fields-hospedagem').style.display = 'block';
                } else if (val === 'Passeios') {
                    document.getElementById('fields-passeios').style.display = 'block';
                } else if (val === 'Cuidado Domiciliar') {
                    document.getElementById('fields-cuidado').style.display = 'block';
                }
            }
        });
    }
});
"""

with open('public/app.js', 'a', encoding='utf-8') as f:
    f.write(js_logic)

print("JS appended")
