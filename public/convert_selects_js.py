import re

with open('public/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

target_selects = [
    'tutor-sexo', 'tutor-como-conheceu', 'tutor-forma-pgto', 
    'tutor-dia-pagamento', 'tutor-status', 'pet-sexo', 
    'pet-especie', 'pet-porte', 'pet-pelagem', 'cliente-status', 'usuario-cargo'
]

# Add the helper functions at the top of app.js
helpers = '''
// --- CUSTOM DROPDOWN HELPERS ---
window.toggleCustomSelect = function(listId) {
    document.querySelectorAll('.custom-dropdown-list').forEach(el => {
        if (el.id !== listId && el.id !== 'racas-custom-list') el.style.display = 'none';
    });
    const list = document.getElementById(listId);
    if (list) {
        list.style.display = list.style.display === 'block' ? 'none' : 'block';
    }
};

window.selectCustomOption = function(fieldId, value, text) {
    const visibleInput = document.getElementById(fieldId + '-input');
    const hiddenInput = document.getElementById(fieldId);
    if (visibleInput && hiddenInput) {
        visibleInput.value = text || value;
        hiddenInput.value = value;
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const list = document.getElementById(fieldId + '-list');
    if (list) list.style.display = 'none';
};

window.setCustomSelectValue = function(fieldId, value) {
    const hiddenInput = document.getElementById(fieldId);
    const visibleInput = document.getElementById(fieldId + '-input');
    if (hiddenInput && visibleInput) {
        hiddenInput.value = value;
        const list = document.getElementById(fieldId + '-list');
        if (list) {
            const item = Array.from(list.querySelectorAll('.custom-dropdown-item')).find(el => el.dataset.value === value);
            visibleInput.value = item ? item.textContent : value;
            if(!value) visibleInput.value = '';
        }
    }
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper') && !e.target.closest('.custom-dropdown-list') && !e.target.closest('#pet-raca-input')) {
        document.querySelectorAll('.custom-dropdown-list').forEach(el => {
            el.style.display = 'none';
        });
    }
});
// ------------------------------
'''

if '// --- CUSTOM DROPDOWN HELPERS ---' not in js:
    js = helpers + '\n' + js

# Replace value assignments
for sel_id in target_selects:
    # Match: document.getElementById('sel_id').value = value;
    # Regex handles optional spaces
    pattern = r"document\.getElementById\(['\"]" + sel_id + r"['\"]\)\.value\s*=\s*(.+?);"
    def replacer(m):
        val_expr = m.group(1)
        return f"setCustomSelectValue('{sel_id}', {val_expr});"
    
    js = re.sub(pattern, replacer, js)

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
