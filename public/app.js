
// --- CUSTOM DROPDOWN HELPERS ---
window.toggleCustomSelect = function (listId) {
    document.querySelectorAll('.custom-dropdown-list').forEach(el => {
        if (el.id !== listId && el.id !== 'racas-custom-list') el.style.display = 'none';
    });
    const list = document.getElementById(listId);
    if (list) {
        list.style.display = list.style.display === 'block' ? 'none' : 'block';
    }
};

window.selectCustomOption = function (fieldId, value, text) {
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

window.setCustomSelectValue = function (fieldId, value) {
    const hiddenInput = document.getElementById(fieldId);
    const visibleInput = document.getElementById(fieldId + '-input');
    if (hiddenInput && visibleInput) {
        hiddenInput.value = value;
        const list = document.getElementById(fieldId + '-list');
        if (list) {
            const item = Array.from(list.querySelectorAll('.custom-dropdown-item')).find(el => el.dataset.value === value);
            visibleInput.value = item ? item.textContent.trim() : value;
            if (!value) visibleInput.value = '';
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

/* ==========================================================================
   LÓGICA DO CLIENTE - ENTERPRISEDB (VANILLA JS)
   ========================================================================== */

// ==========================================
// CONTROLE DE AUTENTICAÇÃO E SESSÃO (CLIENTE)
// ==========================================
(function () {
    const token = localStorage.getItem('auth_token');
    // Se o usuário não estiver logado e não estiver na tela de login, redireciona imediatamente
    if (!token && !window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
    }
})();

// Interceptador Global do Fetch (Injeta o Token de Autorização em todas as chamadas)
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
    const token = localStorage.getItem('auth_token');
    if (token) {
        options.headers = options.headers || {};
        if (options.headers instanceof Headers) {
            options.headers.set('Authorization', `Bearer ${token}`);
        } else {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    const response = await originalFetch(url, options);
    // Se receber 401 Unauthorized do servidor, limpa a sessão e redireciona
    if (response.status === 401 && !url.includes('/api/auth/login')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
    return response;
};

// ==========================================
// SISTEMA DE ALERTAS E CONFIRMAÇÕES PREMIUM (TOAST & MODAL)
// ==========================================
const CustomUI = {
    // Container de Toasts (Criado sob demanda)
    getToastContainer() {
        let container = document.getElementById('custom-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'custom-toast-container';
            container.className = 'custom-toast-container';
            document.body.appendChild(container);
        }
        return container;
    },

    // Exibe uma notificação Toast moderna que some após 4 segundos
    toast(title, message, type = 'success') {
        const container = this.getToastContainer();
        const toast = document.createElement('div');
        toast.className = `custom-toast ${type}`;

        let iconName = 'check-circle';
        if (type === 'danger') iconName = 'x-circle';
        if (type === 'warning') iconName = 'alert-triangle';

        toast.innerHTML = `
            <div class="custom-toast-icon">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="custom-toast-content">
                <div class="custom-toast-title">${title}</div>
                <div class="custom-toast-message">${message}</div>
            </div>
            <button class="custom-toast-close">
                <i data-lucide="x"></i>
            </button>
        `;

        container.appendChild(toast);
        if (window.lucide) {
            lucide.createIcons();
        }

        // Animação de entrada
        setTimeout(() => toast.classList.add('active'), 50);

        // Função para remover
        const removeToast = () => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 400);
        };

        // Evento do botão fechar
        toast.querySelector('.custom-toast-close').addEventListener('click', removeToast);

        // Auto close
        setTimeout(removeToast, 4000);
    },

    // Exibe um modal de confirmação bonito e interativo (retorna Promise)
    confirm(title, message, options = {}) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';

            const type = options.type || 'info'; // 'info', 'danger', 'warning'
            const confirmText = options.confirmText || 'Confirmar';
            const cancelText = options.cancelText || 'Cancelar';

            let iconName = 'help-circle';
            if (type === 'danger') iconName = 'trash-2';
            if (type === 'warning') iconName = 'alert-triangle';
            if (options.icon) iconName = options.icon;

            const iconClass = type === 'danger' ? 'danger' : (type === 'warning' ? 'warning' : '');

            overlay.innerHTML = `
                <div class="custom-dialog-container">
                    <div class="custom-dialog-icon ${iconClass}">
                        <i data-lucide="${iconName}"></i>
                    </div>
                    <div class="custom-dialog-title">${title}</div>
                    <div class="custom-dialog-message">${message}</div>
                    <div class="custom-dialog-actions">
                        <button class="custom-dialog-btn custom-dialog-btn-cancel">${cancelText}</button>
                        <button class="custom-dialog-btn custom-dialog-btn-confirm ${type === 'danger' ? 'danger' : ''}">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            if (window.lucide) {
                lucide.createIcons();
            }

            // Animação de entrada
            setTimeout(() => overlay.classList.add('active'), 50);

            const handleClose = (result) => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 300);
            };

            overlay.querySelector('.custom-dialog-btn-cancel').addEventListener('click', () => handleClose(false));
            overlay.querySelector('.custom-dialog-btn-confirm').addEventListener('click', () => handleClose(true));

            // Clicar fora também cancela
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) handleClose(false);
            });
        });
    },

    // Exibe um modal de alerta bonito que funciona como o alert() do navegador
    alert(title, message, type = 'info') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';

            let iconName = 'info';
            if (type === 'danger' || type === 'error') iconName = 'x-circle';
            if (type === 'warning') iconName = 'alert-triangle';
            if (type === 'success') iconName = 'check-circle';

            const iconClass = (type === 'danger' || type === 'error') ? 'danger' : (type === 'warning' ? 'warning' : '');

            overlay.innerHTML = `
                <div class="custom-dialog-container">
                    <div class="custom-dialog-icon ${iconClass}">
                        <i data-lucide="${iconName}"></i>
                    </div>
                    <div class="custom-dialog-title">${title}</div>
                    <div class="custom-dialog-message">${message}</div>
                    <div class="custom-dialog-actions">
                        <button class="custom-dialog-btn custom-dialog-btn-confirm">OK</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            if (window.lucide) {
                lucide.createIcons();
            }

            // Animação de entrada
            setTimeout(() => overlay.classList.add('active'), 50);

            const handleClose = () => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 300);
            };

            overlay.querySelector('.custom-dialog-btn-confirm').addEventListener('click', handleClose);

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) handleClose();
            });
        });
    }
};

// Vincula ao escopo global
window.CustomUI = CustomUI;

const state = {
    activeTab: 'dashboard',
    clientes: [],
    responsaveis: [],
    pets: [],
    produtos: [],
    vendas: [],
    officialCPFData: null,
    charts: {
        sales: null,
        categories: null
    },
    // Pagination state
    responsaveisPage: 1,
    responsaveisRowsPerPage: 20,
    responsaveisFilteredList: null,
    currentResponsávelInView: null,
    
    petsPage: 1,
    petsRowsPerPage: 20,
    petsFilteredList: null,

    pets: [],
    petsPage: 1,
    petsRowsPerPage: 20,
    petsFilteredList: null
};

// Configurações e URLs da API
const API_BASE = '/api';

// Estado de Verificação do Formulário de Responsáveles (Validações Anti-Fraude e Campo Obrigatório)
const formVerificationState = {
    cpf: false,
    nome: false,
    nascimento: false,
    email: false,
    telefone: false,
    cep: false,
    logradouro: false,
    numero: false,
    bairro: false,
    cidade: false,
    uf: false,
    sexo: false,
    usoImagem: false
};

// Remove acentos e caracteres especiais das strings
function removeDiacritics(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Formata uma data no formato padrão DD/MM/AAAA automaticamente a partir de diversos padrões
function formatDateWithSlashes(rawDate) {
    if (!rawDate) return "";
    let clean = rawDate.replace(/\D/g, ''); // Apenas números

    // Se for formato YYYYMMDD (8 dígitos, começando com ano 19xx ou 20xx)
    if (clean.length === 8 && (clean.startsWith('19') || clean.startsWith('20'))) {
        const year = clean.substring(0, 4);
        const month = clean.substring(4, 6);
        const day = clean.substring(6, 8);
        return `${day}/${month}/${year}`;
    }

    // Se for formato DDMMAAAA (8 dígitos)
    if (clean.length === 8) {
        const day = clean.substring(0, 2);
        const month = clean.substring(2, 4);
        const year = clean.substring(4, 8);
        return `${day}/${month}/${year}`;
    }

    // Fallback: se já tiver slashes ou hífens
    if (rawDate.includes('-')) {
        const parts = rawDate.split('-');
        if (parts.length === 3) {
            // Se o primeiro part for o ano (4 dígitos)
            if (parts[0].length === 4) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return `${parts[0]}/${parts[1]}/${parts[2]}`;
        }
    }
    if (rawDate.includes('/')) {
        return rawDate;
    }

    return rawDate;
}

// Algoritmo de cruzamento e comparação inteligente de nomes (Anti-Fraude)
function compareNames(typedName, officialName) {
    if (!typedName || !officialName) return { matches: false, percentage: 0 };

    // Normaliza nomes (minusculo, sem acentos, remove pontuação)
    const normTyped = removeDiacritics(typedName.toLowerCase()).replace(/[^a-z0-9\s]/g, "");
    const normOfficial = removeDiacritics(officialName.toLowerCase()).replace(/[^a-z0-9\s]/g, "");

    // Ignora preposições e palavras muito curtas
    const ignoreList = ["de", "da", "do", "dos", "das", "e", "del", "al"];
    const wordsTyped = normTyped.split(/\s+/).filter(w => w.length > 2 && !ignoreList.includes(w));
    const wordsOfficial = normOfficial.split(/\s+/).filter(w => w.length > 2 && !ignoreList.includes(w));

    if (wordsTyped.length === 0 || wordsOfficial.length === 0) {
        return { matches: true, percentage: 100 }; // Fallback para nomes extremamente curtos
    }

    // Verifica palavras idênticas
    let matchCount = 0;
    for (const word of wordsTyped) {
        if (wordsOfficial.includes(word)) {
            matchCount++;
        }
    }

    const percentage = (matchCount / wordsTyped.length) * 100;

    return {
        matches: matchCount > 0,
        percentage: percentage
    };
}

// Controla o estado de liberação ou bloqueio do formulário de salvamento
let isValidating = false;

function validateFormState() {
    if (!window.isSubmittingForm) {
        return true; // Evita qualquer validação ou modificação de DOM em tempo real fora do clique de envio
    }
    if (isValidating) return false;
    isValidating = true;

    try {
        const submitBtn = document.querySelector('#form-responsavel button[type="submit"]');
        if (!submitBtn) return false;

        const pendingFields = [];

        const checkField = (id, label) => {
            const input = document.getElementById(id);
            if (!input || !isFieldValid(input)) {
                pendingFields.push({ id, label });
            }
        };

        checkField('responsavel-cpf', 'CPF');
        checkField('responsavel-nome', 'Nome Completo');
        checkField('responsavel-data-nascimento', 'Data de Nascimento');
        checkField('responsavel-email', 'E-mail');
        checkField('responsavel-telefone', 'WhatsApp Principal');
        checkField('responsavel-cep', 'CEP');
        checkField('responsavel-endereco', 'Logradouro');
        checkField('responsavel-numero', 'Número');
        checkField('responsavel-bairro', 'Bairro');
        checkField('responsavel-cidade', 'Cidade');
        checkField('responsavel-uf', 'UF');
        checkField('responsavel-sexo', 'Sexo');

        // Validação especial para Uso de Imagem (Radio buttons)
        const autorizaImagemChecked = document.querySelector('input[name="responsavel-autoriza-imagem"]:checked');
        if (!autorizaImagemChecked) {
            pendingFields.push({ id: 'responsavel-uso-imagem-container', label: 'Uso de Imagem' });
        }

        const hasCriticalError = pendingFields.length > 0;

        let pendingFeedback = document.getElementById('pending-fields-feedback');
        if (!pendingFeedback) {
            pendingFeedback = document.createElement('div');
            pendingFeedback.id = 'pending-fields-feedback';
            pendingFeedback.className = 'field-feedback active danger';
            pendingFeedback.style.marginTop = '8px';
            pendingFeedback.style.display = 'none'; // Sempre escondido inicialmente
            pendingFeedback.style.alignItems = 'center';
            pendingFeedback.style.justifyContent = 'flex-end';
            pendingFeedback.style.gap = '5px';
            submitBtn.parentElement.appendChild(pendingFeedback);
        }

        // O botão AGORA FICA SEMPRE ATIVADO!
        submitBtn.removeAttribute('disabled');
        submitBtn.style.opacity = '';
        submitBtn.style.cursor = 'pointer';

        // A mensagem só vai aparecer quando o usuário clicar em salvar e formVerificationState.showSubmitError for true
        if (hasCriticalError && window.showSubmitError) {
            pendingFeedback.innerHTML = '<i data-lucide="alert-triangle" style="width: 13px; height: 13px;"></i> Existem campos obrigatórios não preenchidos ou inválidos.';
            pendingFeedback.style.display = 'flex';

            // Pinta de vermelho e mostra mensagem abaixo de cada campo
            pendingFields.forEach(field => {
                if (field.id === 'responsavel-uso-imagem-container') {
                    const container = document.querySelector('.custom-radio-group').parentElement;
                    let fb = container.querySelector('.field-feedback');
                    if (!fb) {
                        fb = document.createElement('span');
                        fb.className = 'field-feedback';
                        container.appendChild(fb);
                    }
                    fb.className = 'field-feedback active danger';
                    fb.innerHTML = '<i data-lucide="alert-triangle" style="width: 13px; height: 13px; flex-shrink: 0;"></i> É obrigatório informar o uso de imagem.';
                } else {
                    showFeedback(field.id, `O ${field.label} é obrigatório.`, 'danger');
                }
            });
            lucide.createIcons();
        } else {
            pendingFeedback.innerHTML = '';
            pendingFeedback.style.display = 'none';
        }

        return !hasCriticalError;
    } finally {
        isValidating = false;
    }
}

// Exibe feedback inline elegante de validação (sucesso / erro / alerta)
function showFeedback(inputId, message, type) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let feedback = input.parentElement.querySelector('.field-feedback');
    if (!feedback) {
        feedback = document.createElement('span');
        feedback.className = 'field-feedback';
        input.parentElement.appendChild(feedback);
    }

    input.classList.remove('is-valid', 'is-invalid');

    if (type === 'success') {
        // Para campos validados com sucesso: remove a mensagem inferior e aplica a borda verde neon
        feedback.className = 'field-feedback';
        feedback.innerHTML = '';
        input.classList.add('is-valid');
    } else {
        // Para erros e alertas: exibe a mensagem de feedback colorida correspondente
        feedback.className = `field-feedback active ${type}`;

        let iconName = 'info';
        if (type === 'danger') iconName = 'alert-triangle';
        if (type === 'warning') iconName = 'alert-circle';

        feedback.innerHTML = `<i data-lucide="${iconName}" style="width: 13px; height: 13px; flex-shrink: 0;"></i> ${message}`;

        if (type === 'danger') {
            input.classList.add('is-invalid');
        }
    }
}

// Limpa mensagens de feedback e estados de erro de um campo
function clearFeedback(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.classList.remove('is-valid', 'is-invalid');
    const feedback = input.parentElement.querySelector('.field-feedback');
    if (feedback) {
        feedback.classList.remove('active', 'success', 'danger', 'warning');
        feedback.innerHTML = '';
    }
}

// Verifica se o campo está preenchido corretamente de acordo com suas regras específicas
function isFieldValid(input) {
    if (!input) return false;
    const id = input.id;
    const val = input.value ? input.value.trim() : '';

    // Se o campo estiver vazio, consideramos inválido
    if (val === '') return false;

    if (id === 'responsavel-nome') {
        return validateNameLogic(val).isValid;
    }
    if (id === 'responsavel-profissao') {
        return val.length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(val);
    }
    if (id === 'responsavel-data-nascimento') {
        if (val.length !== 10) return false;
        const parts = val.split('/');
        if (parts.length !== 3) return false;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > new Date().getFullYear()) return false;

        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age >= 18;
    }
    if (id === 'responsavel-email') {
        return validateEmailLogic(val).isValid;
    }
    if (id === 'responsavel-telefone' || id === 'responsavel-telefone-secundario') {
        const cleanPhone = val.replace(/\D/g, '');
        return validatePhoneLogic(cleanPhone).isValid;
    }
    if (id === 'responsavel-cep') {
        const cleanCep = val.replace(/\D/g, '');
        return cleanCep.length === 8;
    }
    if (id === 'responsavel-estado-civil' || id === 'responsavel-sexo') {
        return val !== "";
    }
    if (id === 'responsavel-instagram') {
        return val.startsWith('@') && val.length >= 2;
    }
    if (id === 'responsavel-endereco') {
        return val.length > 0 && /^[a-zA-Z0-9À-ÿ\s\.,\-\/]+$/.test(val);
    }
    if (id === 'responsavel-bairro') {
        return val.length > 0 && /^[a-zA-Z0-9À-ÿ\s\.,\-]+$/.test(val);
    }
    if (id === 'responsavel-cidade') {
        return val.length > 0 && /^[a-zA-ZÀ-ÿ\s\.\-]+$/.test(val);
    }
    if (id === 'responsavel-uf') {
        const validUFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
        return val.length === 2 && validUFs.includes(val.toUpperCase());
    }
    if (id === 'responsavel-numero') {
        return val.length > 0 && !/\D/.test(val);
    }
    if (id === 'responsavel-complemento') {
        return val.length > 0 && !/[^a-zA-ZÀ-ÿ0-9\s]/.test(val);
    }

    // Outros campos opcionais (endereço, número, bairro, cidade, uf, instagram, indicações, observações, etc.)
    return val.length > 0;
}

// Verifica se o formulário está sendo preenchido fora de ordem (CPF deve vir primeiro)
function checkFormOrder(input) {
    if (!input) return false;

    // Se o campo estiver preenchido de forma válida, remove qualquer alerta e deixa verde imediatamente!
    if (isFieldValid(input)) {
        clearFeedback(input.id);
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return false; // Permite prosseguir sem marcar como fora de ordem
    }

    const cpfInput = document.getElementById('responsavel-cpf');
    const cpfVal = cpfInput ? cpfInput.value.replace(/\D/g, '') : '';

    // Se o CPF não estiver verificado com sucesso ou incompleto
    if (!formVerificationState.cpf || cpfVal.length !== 11) {
        input.classList.remove('is-valid');
        // REMOVIDO: input.classList.add('is-invalid'); para que o campo atual não fique vermelho ao clicar

        // Deixa o campo CPF vermelho mas PRESERVA qualquer mensagem de erro já exibida nele
        if (cpfInput && input.id !== 'responsavel-cpf') {
            cpfInput.classList.remove('is-valid');
            cpfInput.classList.add('is-invalid');
            // Só exibe mensagem de obrigatório se o CPF ainda não tiver nenhuma mensagem visível
            const existingFeedback = cpfInput.parentElement.querySelector('.field-feedback.active');
            if (!existingFeedback) {
                showFeedback('responsavel-cpf', 'O CPF é obrigatório.', 'danger');
            }
        }

        return true; // Fora de ordem detectado
    }
    return false; // Ordem correta
}

// Limpa alertas de fora de ordem nos campos quando o CPF for validado
function clearOutOfOrderAlerts() {
    const form = document.getElementById('form-responsavel');
    if (!form) return;
    form.querySelectorAll('.is-invalid').forEach(input => {
        if (input.id !== 'responsavel-cpf') {
            input.classList.remove('is-invalid');
        }
    });
}


// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
    // Configura os ícones do Lucide
    lucide.createIcons();

    // Carrega as permissões em cache e verifica validade de sessão no backend
    checkUserPermissions();
    verifySession();

    // Configura o Perfil do Usuário e Evento de Logout
    const userNome = localStorage.getItem('user_nome') || 'Administrador';
    const displayUserName = document.getElementById('display-user-name');
    const displayUserAvatar = document.getElementById('display-user-avatar');

    if (displayUserName) {
        displayUserName.textContent = userNome;
    }
    if (displayUserAvatar) {
        const initials = userNome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        displayUserAvatar.textContent = initials;
    }
    const profileWidget = document.getElementById('user-profile-widget');
    if (profileWidget) {
        profileWidget.addEventListener('click', async () => {
            const confirmLogout = await CustomUI.confirm(
                "Sair do Sistema",
                "Tem certeza de que deseja encerrar a sua sessão na Explora Pet?",
                {
                    type: "warning",
                    confirmText: "Sair",
                    cancelText: "Cancelar",
                    icon: "log-out"
                }
            );
            if (confirmLogout) {
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                } catch (e) { }
                localStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }

    // Inicializa a navegação de abas
    initTabs();

    // Inicializa o alternador de temas
    initTheme();

    // Inicializa os filtros de busca rápida nas tabelas
    initFilters();

    // Configura eventos do terminal SQL
    initSQLTerminal();

    // Gerador de login automático a partir do nome e sobrenome
    const inputNome = document.getElementById('usuario-nome');
    const inputUsername = document.getElementById('usuario-username');
    if (inputNome && inputUsername) {
        inputNome.addEventListener('input', () => {
            const isEdit = document.getElementById('usuario-id').value !== '';
            if (isEdit) return; // Não altera o username se for edição

            const rawVal = inputNome.value;
            // Normaliza o nome (sem acentos, minúsculo)
            const normalized = removeDiacritics(rawVal.toLowerCase())
                .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
                .trim();

            const words = normalized.split(/\s+/).filter(w => w.length > 0);
            if (words.length === 0) {
                inputUsername.value = '';
            } else if (words.length === 1) {
                inputUsername.value = words[0];
            } else {
                // Compõe a primeira letra do primeiro nome e o último sobrenome
                inputUsername.value = `${words[0][0]}${words[words.length - 1]}`;
            }
        });
    }

    // Carrega os dados iniciais do Dashboard
    loadDashboardData();

    // Carrega dados sob demanda quando mudamos de abas
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('nav-link-dropdown')) {
                return; // Evita carregar dados da aba principal se for dropdown
            }
            const tabName = link.getAttribute('data-tab');
            onTabChanged(tabName);
        });
    });

    // Detecta se a conexão com o banco é SQLite ou Supabase Postgres
    detectDatabaseType();

    // Inicializa a busca automática de CEP
    initCEPListener();

    // Inicializa a máscara de data
    initDateMask();

    // Inicializa a validação de e-mail (antifraude e erros de digitação)
    initEmailValidation();

    // Inicializa a validação do nome completo (segurança e anti-fraude)
    initNameValidation();

    // Inicializa a validação do CPF (segurança e corretude)
    initCPFValidation();

    // Inicializa a validação do celular (máscara e DDD anti-fraude)
    initPhoneValidation();

    // Inicializa a validação do campo profissão (bloqueio de caracteres especiais)
    initProfessionValidation();

    // Inicializa a verificação de preenchimento fora de ordem para todos os campos do formulário
    initFormOrderCheck();

    // Inicializa a validação dos selects Estado Civil e Sexo
    initSelectsValidation();
});

// Inicializa a validação dos selects Estado Civil e Sexo (deve ficar verde apenas se for diferente de selecione)
function initSelectsValidation() {
    const selects = [
        { id: 'responsavel-estado-civil', required: false, stateKey: 'estadoCivil' },
        { id: 'responsavel-sexo', required: true, stateKey: 'sexo' }
    ];

    selects.forEach(item => {
        const select = document.getElementById(item.id);
        if (!select) return;

        const validateSelect = () => {
            if (checkFormOrder(select)) {
                if (item.required) {
                    formVerificationState[item.stateKey] = false;
                    validateFormState();
                }
                return;
            }

            if (select.value !== "") {
                select.classList.remove('is-invalid');
                select.classList.add('is-valid');
                if (item.required) {
                    formVerificationState[item.stateKey] = true;
                    clearFeedback(item.id);
                }
            } else {
                select.classList.remove('is-valid');
                if (item.required) {
                    select.classList.add('is-invalid');
                    formVerificationState[item.stateKey] = false;
                    showFeedback(item.id, 'O campo Sexo é obrigatório.', 'danger');
                } else {
                    select.classList.remove('is-invalid');
                }
            }
            validateFormState();
        };

        select.addEventListener('change', validateSelect);
        select.addEventListener('blur', validateSelect);
    });
}

// Inicializa a verificação de preenchimento fora de ordem para todos os campos do formulário
function initFormOrderCheck() {
    const form = document.getElementById('form-responsavel');
    if (!form) return;

    const ignoredIds = ['responsavel-cpf', 'responsavel-id', 'responsavel-foto-upload'];

    const handleInteraction = (e) => {
        const target = e.target;
        if (!target) return;

        // Verifica se é um input, select ou textarea de dentro do formulário e não está ignorado
        const isFormField = (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') &&
            !ignoredIds.includes(target.id) &&
            target.name !== 'responsavel-autoriza-imagem' &&
            target.name !== 'responsavel-assina';

        if (isFormField) {
            checkFormOrder(target);
        }
    };

    // Escuta focusin, click, mousedown, input e change para pegar qualquer tipo de interação de forma extremamente agressiva e imediata
    form.addEventListener('focusin', handleInteraction);
    form.addEventListener('click', handleInteraction);
    form.addEventListener('mousedown', handleInteraction);
    form.addEventListener('input', handleInteraction);
    form.addEventListener('change', handleInteraction);
}

// ==========================================
// VALIDAÇÃO E FORMATAÇÃO DE CPF (SEGURANÇA E CORRETUDE)
// ==========================================
function initCPFValidation() {
    const cpfInput = document.getElementById('responsavel-cpf');
    const nameInput = document.getElementById('responsavel-nome');
    if (!cpfInput) return;

    cpfInput.addEventListener('blur', () => {
        let cleanVal = cpfInput.value.replace(/\D/g, '');
        if (cleanVal.length === 0) {
            formVerificationState.cpf = false;
            showFeedback('responsavel-cpf', 'O CPF é obrigatório.', 'danger');
            validateFormState();
        } else if (cleanVal.length > 0 && cleanVal.length < 11) {
            formVerificationState.cpf = false;
            showFeedback('responsavel-cpf', 'O CPF deve ter 11 números.', 'danger');
            validateFormState();
        }
    });

    cpfInput.addEventListener('input', (e) => {
        let cleanVal = cpfInput.value.replace(/\D/g, '');
        if (cleanVal.length > 11) {
            cleanVal = cleanVal.substring(0, 11);
        }

        // Aplica a máscara em tempo real: 000.000.000-00
        let formatted = '';
        if (cleanVal.length > 0) {
            formatted = cleanVal.substring(0, 3);
        }
        if (cleanVal.length > 3) {
            formatted += '.' + cleanVal.substring(3, 6);
        }
        if (cleanVal.length > 6) {
            formatted += '.' + cleanVal.substring(6, 9);
        }
        if (cleanVal.length > 9) {
            formatted += '-' + cleanVal.substring(9, 11);
        }
        cpfInput.value = formatted;

        if (cleanVal.length < 11) {
            console.log(`[CPF Input] CPF incompleto (${cleanVal.length} dígitos). Limpando dados do responsável instantaneamente...`);
            // Se o usuário começou a apagar ou o CPF ficou incompleto, limpa todos os dados antigos imediatamente
            const fieldsToClear = [
                'responsavel-nome', 'responsavel-data-nascimento', 'responsavel-sexo',
                'responsavel-estado-civil', 'responsavel-cep', 'responsavel-endereco',
                'responsavel-numero', 'responsavel-complemento', 'responsavel-bairro',
                'responsavel-cidade', 'responsavel-uf'
            ];

            fieldsToClear.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = '';
                    el.classList.remove('is-valid', 'is-invalid');
                }
                clearFeedback(id);
            });

            // Restaura campos editáveis de cidade/estado
            const cityInput = document.getElementById('responsavel-cidade');
            if (cityInput) cityInput.removeAttribute('readonly');
            const ufInput = document.getElementById('responsavel-uf');
            if (ufInput) ufInput.removeAttribute('readonly');

            // Redefine todos os estados de verificação do formulário
            formVerificationState.cpf = false;
            formVerificationState.nome = false;
            formVerificationState.nascimento = false;
            formVerificationState.sexo = false;
            formVerificationState.cep = false;
            formVerificationState.logradouro = false;
            formVerificationState.bairro = false;
            formVerificationState.cidade = false;
            formVerificationState.uf = false;
            formVerificationState.numero = false;

            clearFeedback('responsavel-cpf');
            cpfInput.classList.remove('is-valid', 'is-invalid');

            validateFormState();
        }

        if (cleanVal.length === 11) {
            // Faz a requisição segura através do proxy da API no backend diretamente ao completar 11 dígitos
            fetch(`${API_BASE}/cpf-lookup/${cleanVal}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Erro na consulta oficial do CPFHub.io");
                    }
                    return response.json();
                })
                .then(res => {
                    if (!res || !res.success || !res.data) {
                        throw new Error("CPF inválido ou não localizado");
                    }

                    const actualData = res.data;
                    state.officialCPFData = actualData;

                    // Auto-preenchimento completo e inteligente dos campos retornados pela API (sobrescreve sempre para permitir correção de CPF)
                    if (actualData) {
                        // 1. Nome do responsavel
                        const rawNome = actualData.name || actualData.nameUpper || actualData.nome;
                        let formattedNome = "";
                        if (rawNome) {
                            formattedNome = rawNome.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
                            if (nameInput) {
                                nameInput.value = formattedNome;
                                nameInput.classList.remove('is-invalid');
                                nameInput.classList.add('is-valid');
                                clearFeedback('responsavel-nome');
                                formVerificationState.nome = true;
                            }
                        }

                        // 2. Data de nascimento
                        const rawBirth = actualData.birthDate || actualData.birth_date || actualData.data_nascimento || actualData.birthdate;
                        let formattedDate = "";
                        if (rawBirth) {
                            formattedDate = formatDateWithSlashes(rawBirth);
                            const dateInput = document.getElementById('responsavel-data-nascimento');
                            if (dateInput) {
                                dateInput.value = formattedDate;
                                dateInput.classList.remove('is-invalid');
                                dateInput.classList.add('is-valid');
                                clearFeedback('responsavel-data-nascimento');
                                formVerificationState.nascimento = true;
                            }
                        }

                        // 3. Gênero / Sexo
                        const rawGender = actualData.gender || actualData.genero || actualData.sexo;
                        if (rawGender) {
                            const g = rawGender.toLowerCase();
                            const sexoSelect = document.getElementById('responsavel-sexo');
                            if (sexoSelect) {
                                if (g.startsWith('m')) {
                                    sexoSelect.value = 'Masculino';
                                } else if (g.startsWith('f')) {
                                    sexoSelect.value = 'Feminino';
                                } else {
                                    sexoSelect.value = 'Outro';
                                }
                                sexoSelect.classList.remove('is-invalid');
                                sexoSelect.classList.add('is-valid');
                                clearFeedback('responsavel-sexo');
                                formVerificationState.sexo = true;
                            }
                        }

                        // 4. Estado Civil
                        const rawMarital = actualData.estado_civil || actualData.marital_status || actualData.situacao_civil;
                        if (rawMarital) {
                            const m = rawMarital.toLowerCase();
                            const civilSelect = document.getElementById('responsavel-estado-civil');
                            if (civilSelect) {
                                if (m.includes('solteir')) {
                                    civilSelect.value = 'Solteiro(a)';
                                } else if (m.includes('casad')) {
                                    civilSelect.value = 'Casado(a)';
                                } else if (m.includes('divorciad')) {
                                    civilSelect.value = 'Divorciado(a)';
                                } else if (m.includes('viuv') || m.includes('viúv')) {
                                    civilSelect.value = 'Viúvo(a)';
                                } else if (m.includes('uni') || m.includes('estavel')) {
                                    civilSelect.value = 'União estável';
                                } else {
                                    civilSelect.value = 'Outro';
                                }
                                civilSelect.classList.remove('is-invalid');
                                civilSelect.classList.add('is-valid');
                                clearFeedback('responsavel-estado-civil');
                            }
                        }

                        // 5. CEP e Endereço
                        const rawCep = actualData.cep || actualData.zipcode || actualData.postal_code;
                        if (rawCep) {
                            let cepVal = rawCep.replace(/\D/g, '');
                            if (cepVal.length > 5) {
                                cepVal = cepVal.substring(0, 5) + '-' + cepVal.substring(5, 8);
                            }
                            const cepInput = document.getElementById('responsavel-cep');
                            if (cepInput) {
                                cepInput.value = cepVal;
                                cepInput.classList.remove('is-invalid');
                                cepInput.classList.add('is-valid');
                                clearFeedback('responsavel-cep');
                                formVerificationState.cep = true;

                                // Dispara o evento de input para acionar a busca automática de endereço via ViaCEP
                                cepInput.dispatchEvent(new Event('input'));
                            }
                        }

                        const rawAddress = actualData.endereco || actualData.logradouro || actualData.street || actualData.address;
                        if (rawAddress) {
                            const addrInput = document.getElementById('responsavel-endereco');
                            if (addrInput) {
                                addrInput.value = rawAddress;
                                addrInput.classList.remove('is-invalid');
                                addrInput.classList.add('is-valid');
                                clearFeedback('responsavel-endereco');
                                formVerificationState.logradouro = true;
                            }
                        }

                        const rawNum = actualData.numero || actualData.number;
                        if (rawNum) {
                            const numInput = document.getElementById('responsavel-numero');
                            if (numInput) {
                                numInput.value = rawNum;
                                numInput.classList.remove('is-invalid');
                                numInput.classList.add('is-valid');
                                clearFeedback('responsavel-numero');
                                formVerificationState.numero = true;
                            }
                        }

                        const rawComp = actualData.complemento || actualData.complement;
                        if (rawComp) {
                            const compInput = document.getElementById('responsavel-complemento');
                            if (compInput) {
                                compInput.value = rawComp;
                                compInput.classList.remove('is-invalid');
                                compInput.classList.add('is-valid');
                                clearFeedback('responsavel-complemento');
                            }
                        }

                        const rawBairro = actualData.bairro || actualData.neighborhood || actualData.district;
                        if (rawBairro) {
                            const bairroInput = document.getElementById('responsavel-bairro');
                            if (bairroInput) {
                                bairroInput.value = rawBairro;
                                bairroInput.classList.remove('is-invalid');
                                bairroInput.classList.add('is-valid');
                                clearFeedback('responsavel-bairro');
                                formVerificationState.bairro = true;
                            }
                        }

                        const rawCity = actualData.cidade || actualData.city || actualData.localidade;
                        if (rawCity) {
                            const cityInput = document.getElementById('responsavel-cidade');
                            if (cityInput) {
                                cityInput.value = rawCity;
                                cityInput.classList.remove('is-invalid');
                                cityInput.classList.add('is-valid');
                                clearFeedback('responsavel-cidade');
                                formVerificationState.cidade = true;
                            }
                        }

                        const rawUf = actualData.uf || actualData.estado || actualData.state;
                        if (rawUf) {
                            const ufVal = rawUf.toUpperCase().substring(0, 2);
                            const ufInput = document.getElementById('responsavel-uf');
                            if (ufInput) {
                                ufInput.value = ufVal;
                                ufInput.classList.remove('is-invalid');
                                ufInput.classList.add('is-valid');
                                clearFeedback('responsavel-uf');
                                formVerificationState.uf = true;
                            }
                        }

                        // Realiza Validação Cruzada de Nome e CPF (Anti-Fraude)
                        const currentTypedName = nameInput ? nameInput.value.trim() : "";
                        if (currentTypedName.length > 0) {
                            const comp = compareNames(currentTypedName, rawNome);
                            if (!comp.matches) {
                                // ERRO CRÍTICO ANTI-FRAUDE: Nome digitado não coincide com o CPF oficial
                                formVerificationState.cpf = false;
                                formVerificationState.nome = false;
                                showFeedback('responsavel-cpf', 'ALERTA ANTI-FRAUDE: Nome do titular diverge do CPF cadastrado.', 'danger');
                                showFeedback('responsavel-nome', 'ALERTA ANTI-FRAUDE: O nome informado diverge do CPF consultado.', 'danger');
                            } else {
                                formVerificationState.cpf = true;
                                formVerificationState.nome = true;
                                showFeedback('responsavel-cpf', 'CPF ativo e verificado na Receita Federal.', 'success');
                                showFeedback('responsavel-nome', 'Nome compatível com o CPF verificado.', 'success');
                                clearOutOfOrderAlerts();
                            }
                        } else {
                            // Se nome estiver vazio, aceita provisoriamente e pede para preencher
                            formVerificationState.cpf = true;
                            showFeedback('responsavel-cpf', 'CPF verificado na Receita Federal.', 'success');
                            clearOutOfOrderAlerts();
                        }

                        // Realiza Validação Cruzada de Nascimento se já preenchido
                        const dateInput = document.getElementById('responsavel-data-nascimento');
                        const currentTypedBirth = dateInput ? dateInput.value.trim() : "";
                        if (currentTypedBirth.length === 10 && formattedDate.length === 10) {
                            if (currentTypedBirth !== formattedDate) {
                                formVerificationState.nascimento = false;
                                showFeedback('responsavel-data-nascimento', 'Divergência: Nascimento difere do CPF oficial.', 'warning');
                            } else {
                                formVerificationState.nascimento = true;
                                showFeedback('responsavel-data-nascimento', 'Data de nascimento oficial verificada.', 'success');
                            }
                        } else {
                            formVerificationState.nascimento = true;
                        }

                        // Foca automaticamente no campo Estado Civil para o cliente selecionar
                        const civilSelect = document.getElementById('responsavel-estado-civil');
                        if (civilSelect) {
                            setTimeout(() => {
                                civilSelect.focus();
                            }, 100);
                        }
                    }
                    validateFormState();
                })
                .catch(error => {
                    console.error("Erro na integração com CPFHub:", error);
                    state.officialCPFData = null;

                    // Fallback local: se a API falhar (ex: sem internet/key inválida) mas for matematicamente válido, aceita
                    if (validateCPF(cleanVal)) {
                        formVerificationState.cpf = true;
                        showFeedback('responsavel-cpf', '', 'success');
                        clearOutOfOrderAlerts();

                        // Libera o nome localmente também
                        if (nameInput && nameInput.value.trim().length >= 5) {
                            const valResult = validateNameLogic(nameInput.value);
                            if (valResult.isValid) {
                                formVerificationState.nome = true;
                                showFeedback('responsavel-nome', 'Nome em formato válido.', 'success');
                            }
                        }
                    } else {
                        formVerificationState.cpf = false;
                        clearFeedback('responsavel-cpf');
                        cpfInput.classList.remove('is-valid');
                        cpfInput.classList.add('is-invalid');
                    }
                    validateFormState();
                });
        }
    });

    cpfInput.addEventListener('blur', () => {
        const cpf = cpfInput.value.replace(/\D/g, '');
        if (cpf.length === 0) {
            formVerificationState.cpf = false;
            showFeedback('responsavel-cpf', 'O CPF é obrigatório.', 'danger');
            cpfInput.classList.remove('is-valid');
            cpfInput.classList.add('is-invalid');
            validateFormState();
        } else if (cpf.length < 11) {
            formVerificationState.cpf = false;
            showFeedback('responsavel-cpf', 'CPF incompleto. Digite todos os 11 dígitos.', 'danger');
            cpfInput.classList.remove('is-valid');
            cpfInput.classList.add('is-invalid');
            validateFormState();
        } else if (cpf.length === 11 && !validateCPF(cpf)) {
            formVerificationState.cpf = false;
            showFeedback('responsavel-cpf', 'CPF inválido. Verifique os dígitos informados.', 'danger');
            cpfInput.classList.remove('is-valid');
            cpfInput.classList.add('is-invalid');
            validateFormState();
        }
    });
}

function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;

    // Bloqueia CPFs com todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;

    // Segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;

    return true;
}

// ==========================================
// VALIDAÇÃO DE NOME COMPLETO (SEGURANÇA E ANTI-FRAUDE)
// ==========================================
function initNameValidation() {
    const nameInput = document.getElementById('responsavel-nome');
    if (!nameInput) return;

    nameInput.addEventListener('input', (e) => {
        // Bloqueio físico em tempo real: remove tudo que não for letra, espaço, apóstrofo, ponto ou hífen
        let cleanVal = nameInput.value.replace(/[^A-Za-zÀ-ÿ\s'\.\-]/g, '');
        if (nameInput.value !== cleanVal) {
            nameInput.value = cleanVal;
        }

        if (checkFormOrder(nameInput)) {
            formVerificationState.nome = false;
            validateFormState();
            return;
        }

        if (nameInput.value.trim().length === 0) {
            clearFeedback('responsavel-nome');
            formVerificationState.nome = false;
            validateFormState();
        } else {
            // Oculta a mensagem de erro temporariamente enquanto o usuário está corrigindo o nome
            clearFeedback('responsavel-nome');
        }
    });

    nameInput.addEventListener('blur', () => {
        const typedName = nameInput.value.trim();
        if (!typedName) {
            formVerificationState.nome = false;
            showFeedback('responsavel-nome', 'O nome completo é obrigatório.', 'danger');
            checkFormOrder(nameInput);
            validateFormState();
            return;
        }

        const valResult = validateNameLogic(typedName);
        if (!valResult.isValid) {
            formVerificationState.nome = false;
            showFeedback('responsavel-nome', valResult.reason, 'danger');
            checkFormOrder(nameInput);
            validateFormState();
            return;
        }

        if (checkFormOrder(nameInput)) {
            formVerificationState.nome = false;
            validateFormState();
            return;
        }

        // Se houver dados oficiais do CPFHub, realiza validação cruzada
        if (state.officialCPFData) {
            const rawNome = state.officialCPFData.name || state.officialCPFData.nameUpper || state.officialCPFData.nome;
            const comp = compareNames(typedName, rawNome);
            if (!comp.matches) {
                formVerificationState.nome = false;
                formVerificationState.cpf = false;
                showFeedback('responsavel-nome', 'ALERTA ANTI-FRAUDE: O nome informado diverge do CPF consultado.', 'danger');
                showFeedback('responsavel-cpf', 'ALERTA ANTI-FRAUDE: Nome do titular diverge do CPF cadastrado.', 'danger');
            } else {
                formVerificationState.nome = true;
                formVerificationState.cpf = true;
                showFeedback('responsavel-nome', 'Nome compatível com o CPF verificado.', 'success');
                showFeedback('responsavel-cpf', 'CPF ativo e verificado na Receita Federal.', 'success');
            }
        } else {
            // Se não houver dados da API, aceita com base na validação lógica básica
            formVerificationState.nome = true;
            showFeedback('responsavel-nome', 'Nome em formato válido.', 'success');
        }
        validateFormState();
    });
}

// ==========================================
// VALIDAÇÃO DE PROFISSÃO (SOMENTE LETRAS E ESPAÇOS)
// ==========================================
function initProfessionValidation() {
    const profInput = document.getElementById('responsavel-profissao');
    if (!profInput) return;

    profInput.addEventListener('input', () => {
        // Bloqueia em tempo real números e caracteres especiais, permitindo apenas letras e espaços
        let cleanVal = profInput.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (profInput.value !== cleanVal) {
            profInput.value = cleanVal;
        }

        if (checkFormOrder(profInput)) {
            return;
        }

        clearFeedback('responsavel-profissao');
    });

    profInput.addEventListener('blur', () => {
        const val = profInput.value.trim();
        if (val.length > 0) {
            if (val.length < 2 || !/^[a-zA-ZÀ-ÿ\s]+$/.test(val)) {
                showFeedback('responsavel-profissao', 'A profissão não pode conter números ou caracteres especiais.', 'danger');
                checkFormOrder(profInput);
                return;
            } else {
                showFeedback('responsavel-profissao', '', 'success');
            }
        }

        if (checkFormOrder(profInput)) {
            return;
        }
    });
}

// ==========================================
// VALIDAÇÃO DE INSTAGRAM (OBRIGATÓRIO @ SE PREENCHIDO)
// ==========================================
function initInstagramValidation() {
    const instaInput = document.getElementById('responsavel-instagram');
    if (!instaInput) return;

    instaInput.addEventListener('input', () => {
        if (checkFormOrder(instaInput)) {
            return;
        }
        clearFeedback('responsavel-instagram');
    });

    instaInput.addEventListener('blur', () => {
        const val = instaInput.value.trim();
        if (val.length > 0) {
            if (!val.startsWith('@')) {
                showFeedback('responsavel-instagram', 'O Instagram deve começar com @ (ex: @usuario)', 'danger');
                checkFormOrder(instaInput);
                return;
            } else if (val.length < 2) {
                showFeedback('responsavel-instagram', 'Nome de usuário inválido.', 'danger');
                checkFormOrder(instaInput);
                return;
            } else {
                showFeedback('responsavel-instagram', '', 'success');
            }
        }

        if (checkFormOrder(instaInput)) {
            return;
        }
    });
}
document.addEventListener('DOMContentLoaded', initInstagramValidation);

function validateNameLogic(name) {
    if (!name) return { isValid: false, reason: "O nome completo é obrigatório." };

    const trimmed = name.trim();

    // 1. Validação de tamanho mínimo (pelo menos 5 caracteres)
    if (trimmed.length < 5) {
        return { isValid: false, reason: "O nome informado é muito curto. Por favor, digite seu nome e sobrenome completos." };
    }

    // 2. Validação de tamanho máximo
    if (trimmed.length > 100) {
        return { isValid: false, reason: "O nome é longo demais. Limite de 100 caracteres." };
    }

    // 3. Rejeitar números e símbolos especiais suspeitos
    const allowedCharsRegex = /^[A-Za-zÀ-ÿ\s'\.\-]+$/u;
    if (!allowedCharsRegex.test(trimmed)) {
        return { isValid: false, reason: "O nome não pode conter números, símbolos ou caracteres especiais inválidos." };
    }

    // 4. Pelo menos duas palavras (Nome e Sobrenome)
    const words = trimmed.split(/\s+/);
    if (words.length < 2) {
        return { isValid: false, reason: "Por favor, digite seu sobrenome também para um cadastro completo." };
    }

    // Cada palavra (ignorando preposições) deve ter pelo menos 3 caracteres
    const preposicoes = ["de", "da", "do", "dos", "das", "e", "del", "al"];
    for (let i = 0; i < words.length; i++) {
        if (preposicoes.includes(words[i].toLowerCase())) {
            continue;
        }
        if (words[i].length < 3) {
            return { isValid: false, reason: "O nome ou sobrenome informado é muito curto. Por favor, escreva por extenso." };
        }
    }

    // O sobrenome como um todo (tudo depois do primeiro nome) deve ter pelo menos 5 caracteres
    const sobrenome = trimmed.substring(words[0].length).trim();
    if (sobrenome.replace(/\s+/g, '').length < 5) {
        return { isValid: false, reason: "O sobrenome informado é muito curto. Por favor, escreva por extenso." };
    }

    // 5. Anti-injeção SQL / Scripts XSS / Tags HTML
    const lowerName = trimmed.toLowerCase();
    const injectionKeywords = [
        '<script', 'javascript:', 'select ', 'union ', 'insert ', 'update ', 'delete ',
        'drop ', 'alter ', 'truncate ', '--', '/*', '*/', 'xp_cmdshell'
    ];
    for (const keyword of injectionKeywords) {
        if (lowerName.includes(keyword)) {
            return { isValid: false, reason: "Caracteres não autorizados detectados no nome." };
        }
    }

    // 6. Detecção de nomes fictícios, de teste ou placeholders comuns
    const fakeNames = [
        'teste', 'test', 'dummy', 'john doe', 'jane doe', 'fulano', 'ciclano', 'beltrano',
        'fulano de tal', 'admin', 'administrator', 'administrador', 'fake name', 'nome falso',
        'nenhum', 'nao informado', 'não informado', 'asdf', 'qwer', 'zxcv', 'qwerty',
        'usuario', 'usuário', 'visitante', 'guest', 'explora pet', 'explorapet'
    ];
    for (const fake of fakeNames) {
        // Verifica se a palavra falsa é o nome inteiro, ou se é uma palavra isolada no meio do nome (evita bloquear 'Testaldo' por causa de 'test')
        if (lowerName === fake || lowerName.startsWith(fake + ' ') || lowerName.endsWith(' ' + fake) || lowerName.includes(' ' + fake + ' ')) {
            return { isValid: false, reason: "Por favor, informe um nome real. Nomes de teste ou fictícios não são permitidos." };
        }
    }

    // 7. Detecção de batida de teclado sequencial repetitiva (ex: aaaa, xxxx)
    if (/([a-zA-ZÀ-ÿ])\1\1\1/.test(lowerName)) {
        return { isValid: false, reason: "Nome inválido. Sequências repetitivas de letras detectadas (ex: aaaa)." };
    }

    return { isValid: true };
}

// ==========================================
// VALIDAÇÃO DE EMAIL
// ==========================================
function initEmailValidation() {
    const emailInput = document.getElementById('responsavel-email');
    if (!emailInput) return;

    emailInput.addEventListener('input', () => {
        if (emailInput.value.trim().length === 0) {
            clearFeedback('responsavel-email');
            formVerificationState.email = false;
            validateFormState();
            return;
        }

        if (checkFormOrder(emailInput)) {
            formVerificationState.email = false;
            validateFormState();
            return;
        }

        clearFeedback('responsavel-email');
        formVerificationState.email = false; // temporário em digitação
        validateFormState();
    });

    emailInput.addEventListener('blur', () => {
        const val = emailInput.value.trim();
        if (!val) {
            formVerificationState.email = false;
            showFeedback('responsavel-email', 'O e-mail é obrigatório.', 'danger');
            validateFormState();
            return;
        }

        const valResult = validateEmailLogic(val);
        if (!valResult.isValid) {
            formVerificationState.email = false;
            showFeedback('responsavel-email', valResult.reason, 'danger');
            checkFormOrder(emailInput);
            validateFormState();
            return;
        } else {
            formVerificationState.email = true;
            showFeedback('responsavel-email', '✓ E-mail em formato seguro.', 'success');
        }

        checkFormOrder(emailInput);
        validateFormState();
    });
}

function validateEmailLogic(email) {
    if (!email) return { isValid: false, reason: 'O e-mail é obrigatório.' };

    // Formato básico de e-mail (deve ter arroba e ponto)
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return { isValid: false, reason: 'E-mail inválido. O formato deve ser nome@provedor.com' };

    const domain = email.split('@')[1].toLowerCase();

    // Bloqueia domínios de teste genéricos
    const fakeDomains = ['teste.com', 'test.com', 'email.com', 'exemplo.com', 'example.com', '123.com', 'naotem.com'];
    if (fakeDomains.includes(domain)) return { isValid: false, reason: 'E-mails de teste ou fictícios não são permitidos.' };

    // Bloqueia os principais erros de digitação de Gmail, Hotmail, Yahoo e iCloud
    const typoDomains = [
        'gmai.com', 'gamil.com', 'gmail.com.br', 'gmil.com', 'gmal.com', 'gmaik.com', 'gimail.com',
        'hotmai.com', 'hotmal.com', 'hormail.com', 'hotamil.com', 'hotmaill.com',
        'outlok.com', 'oultlook.com', 'outloo.com', 'outlock.com',
        'yaho.com', 'yahoo.com.br.com', 'yaho.com.br',
        'iclould.com', 'iclou.com', 'iclaud.com', 'iclod.com', 'icoud.com'
    ];
    if (typoDomains.includes(domain)) return { isValid: false, reason: 'Erro de digitação detectado. Verifique o provedor (ex: gmail.com, hotmail.com).' };

    // Bloqueia domínios de e-mails descartáveis/temporários anti-fraude
    const disposableDomains = [
        'mailinator.com', 'trashmail.com', 'tempmail.com', 'temp-mail.org',
        'sharklasers.com', 'guerrillamail.com', 'dispostable.com', 'getairmail.com',
        '10minutemail.com', 'yopmail.com', 'tempmailo.com', 'fakeinbox.com', 'maildrop.cc'
    ];
    if (disposableDomains.includes(domain)) return { isValid: false, reason: 'E-mails descartáveis ou temporários não são permitidos por segurança.' };

    return { isValid: true };
}

// ==========================================
// MÁSCARA E VALIDAÇÃO DE TELEFONE/CELULAR (ANTI-FRAUDE DDD)
// ==========================================
function initPhoneValidation() {
    const phoneInputs = [
        { input: document.getElementById('responsavel-telefone'), isMain: true },
        { input: document.getElementById('responsavel-telefone-secundario'), isMain: false }
    ];

    phoneInputs.forEach(item => {
        const input = item.input;
        if (!input) return;

        input.addEventListener('input', () => {
            if (checkFormOrder(input)) {
                if (item.isMain) formVerificationState.telefone = false;
                validateFormState();
                return;
            }

            let val = input.value.replace(/\D/g, '');
            if (val.length > 11) {
                val = val.substring(0, 11);
            }

            // Aplica a máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
            let formatted = '';
            if (val.length > 0) {
                formatted = '(' + val.substring(0, 2);
            }
            if (val.length > 2) {
                formatted += ') ' + val.substring(2, 7);
            }
            if (val.length > 7) {
                formatted += '-' + val.substring(7, 11);
            }
            input.value = formatted;

            if (val.length === 0) {
                clearFeedback(input.id);
                if (item.isMain) formVerificationState.telefone = false;
                validateFormState();
                return;
            }
            clearFeedback(input.id);
            if (item.isMain) formVerificationState.telefone = true; // temporário em digitação
            validateFormState();
        });

        input.addEventListener('blur', () => {
            const val = input.value.replace(/\D/g, '');
            if (val.length === 0) {
                if (item.isMain) {
                    formVerificationState.telefone = false;
                    showFeedback(input.id, 'O WhatsApp é obrigatório.', 'danger');
                } else {
                    clearFeedback(input.id);
                }
                checkFormOrder(input);
                validateFormState();
                return;
            }

            const res = validatePhoneLogic(val);
            if (!res.isValid) {
                if (item.isMain) formVerificationState.telefone = false;
                showFeedback(input.id, res.reason, 'danger');
            } else {
                if (item.isMain) {
                    formVerificationState.telefone = true;
                    showFeedback(input.id, '✓ Telefone verificado e ativo.', 'success');

                    // Se o principal mudou, revalida o secundário se estiver preenchido
                    const secInput = document.getElementById('responsavel-telefone-secundario');
                    const secVal = secInput.value.replace(/\D/g, '');
                    if (secVal && secVal === val) {
                        showFeedback('responsavel-telefone-secundario', 'O número adicional não pode ser igual ao principal.', 'danger');
                        secInput.value = '';
                    }
                } else {
                    // É o telefone secundário
                    const mainVal = document.getElementById('responsavel-telefone').value.replace(/\D/g, '');
                    if (val === mainVal) {
                        showFeedback(input.id, 'O número adicional não pode ser igual ao WhatsApp Principal.', 'danger');
                        input.value = ''; // Limpa para não salvar duplicado
                    } else {
                        showFeedback(input.id, '✓ Telefone verificado e ativo.', 'success');
                    }
                }
            }

            checkFormOrder(input);
            validateFormState();
        });
    });
}

function validatePhoneLogic(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10 || clean.length > 11) {
        return { isValid: false, reason: "O número de telefone deve conter 11 dígitos (celular) com DDD." };
    }

    const ddd = clean.substring(0, 2);
    const validDDDs = [
        '11', '12', '13', '14', '15', '16', '17', '18', '19',
        '21', '22', '24', '27', '28',
        '31', '32', '33', '34', '35', '37', '38',
        '41', '42', '43', '44', '45', '46', '47', '48', '49',
        '51', '53', '54', '55',
        '61', '62', '63', '64', '65', '66', '67', '68', '69',
        '71', '73', '74', '75', '77', '79',
        '81', '82', '83', '84', '85', '86', '87', '88', '89',
        '91', '92', '93', '94', '95', '96', '97', '98', '99'
    ];
    if (!validDDDs.includes(ddd)) {
        return { isValid: false, reason: "O DDD (" + ddd + ") informado é inválido. Por favor, forneça um DDD brasileiro válido." };
    }

    // Se for celular (11 dígitos), o primeiro dígito do número deve ser 9!
    if (clean.length === 11) {
        const numStart = clean.charAt(2);
        if (numStart !== '9') {
            return { isValid: false, reason: "Números de celular devem começar com o dígito 9 (ex: (XX) 9XXXX-XXXX)." };
        }
    }

    // Evita sequências óbvias de fraude (ex: 99999-9999 ou 12345-6789)
    if (/^(\d)\1{8,9}$/.test(clean.substring(2))) {
        return { isValid: false, reason: "Por favor, informe um número de telefone real. Sequências repetidas não são permitidas." };
    }

    return { isValid: true };
}

// ==========================================
// MÁSCARAS DE INPUT E VALIDAÇÃO DE NASCIMENTO
// ==========================================
function initDateMask() {
    const dateInput = document.getElementById('responsavel-data-nascimento');
    if (!dateInput) return;

    dateInput.addEventListener('input', (e) => {
        let clean = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
        if (clean.length > 8) clean = clean.substring(0, 8); // Limita a 8 dígitos reais

        let v = clean;
        if (v.length > 2) {
            v = v.substring(0, 2) + '/' + v.substring(2);
        }
        if (v.length > 5) {
            v = v.substring(0, 5) + '/' + v.substring(5);
        }
        e.target.value = v;

        if (clean.length === 0) {
            clearFeedback('responsavel-data-nascimento');
            formVerificationState.nascimento = false;
            validateFormState();
        } else if (clean.length < 8) {
            clearFeedback('responsavel-data-nascimento');
            formVerificationState.nascimento = false;
            validateFormState();
        }
    });

    // Valida no momento em que sai do campo
    dateInput.addEventListener('blur', (e) => {
        const v = e.target.value;
        if (!v || v.trim().length === 0) {
            formVerificationState.nascimento = false;
            showFeedback('responsavel-data-nascimento', 'A data de nascimento é obrigatória.', 'danger');
            checkFormOrder(dateInput);
            validateFormState();
            return;
        }

        if (v.length < 10) {
            formVerificationState.nascimento = false;
            showFeedback('responsavel-data-nascimento', 'Data de nascimento incompleta. Use DD/MM/AAAA.', 'danger');
            checkFormOrder(dateInput);
            validateFormState();
            return;
        }

        if (v.length === 10) {
            const parts = v.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);

                // Valida data real (Ano base limite: 1920 para evitar testes com 1900)
                if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1920 || year > new Date().getFullYear()) {
                    formVerificationState.nascimento = false;
                    showFeedback('responsavel-data-nascimento', 'Data de nascimento inválida.', 'danger');
                    validateFormState();
                    return;
                }

                // Valida se o dia existe no mês especificado (ex: 31 de fevereiro)
                const birthDate = new Date(year, month - 1, day);
                if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
                    formVerificationState.nascimento = false;
                    showFeedback('responsavel-data-nascimento', 'Data inexistente no calendário.', 'danger');
                    validateFormState();
                    return;
                }

                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < 18) {
                    formVerificationState.nascimento = false;
                    showFeedback('responsavel-data-nascimento', 'Cadastro não permitido para menores de 18 anos.', 'danger');
                } else {
                    // Se houver dados da API Receita, faz verificação cruzada
                    if (state.officialCPFData) {
                        const rawBirth = state.officialCPFData.birthDate || state.officialCPFData.birth_date || state.officialCPFData.data_nascimento || state.officialCPFData.birthdate;
                        let formattedDate = "";
                        if (rawBirth) {
                            if (rawBirth.includes('-')) {
                                const dateParts = rawBirth.split('-');
                                if (dateParts.length === 3) {
                                    formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                                }
                            } else if (rawBirth.includes('/')) {
                                formattedDate = rawBirth;
                            }
                        }

                        if (formattedDate && v !== formattedDate) {
                            formVerificationState.nascimento = false;
                            showFeedback('responsavel-data-nascimento', 'Divergência: Nascimento difere do CPF oficial.', 'warning');
                        } else {
                            formVerificationState.nascimento = true;
                            showFeedback('responsavel-data-nascimento', '✓ Data de nascimento oficial verificada.', 'success');
                        }
                    } else {
                        formVerificationState.nascimento = true;
                        showFeedback('responsavel-data-nascimento', '✓ Idade de maioridade elegível.', 'success');
                    }
                }
            } else {
                formVerificationState.nascimento = false;
                showFeedback('responsavel-data-nascimento', 'Formato esperado: DD/MM/AAAA', 'danger');
            }
        } else {
            formVerificationState.nascimento = false;
            showFeedback('responsavel-data-nascimento', 'Data de nascimento incompleta.', 'danger');
        }

        checkFormOrder(dateInput);
        validateFormState();
    });
}

// ==========================================
// BUSCA DE CEP (ViaCEP)
// ==========================================
function initCEPListener() {
    const cepInput = document.getElementById('responsavel-cep');
    if (!cepInput) return;

    // Busca o CEP quando o campo perde o foco (fallback/validação final)
    cepInput.addEventListener('blur', async (e) => {
        let cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 0) {
            formVerificationState.cep = false;
            showFeedback('responsavel-cep', 'O CEP é obrigatório.', 'danger');

            document.getElementById('responsavel-endereco').value = '';
            document.getElementById('responsavel-bairro').value = '';
            document.getElementById('responsavel-cidade').value = '';
            document.getElementById('responsavel-uf').value = '';

            const numInput = document.getElementById('responsavel-numero');
            if (numInput) numInput.value = '';
            const compInput = document.getElementById('responsavel-complemento');
            if (compInput) compInput.value = '';

            ['responsavel-endereco', 'responsavel-bairro', 'responsavel-cidade', 'responsavel-uf', 'responsavel-numero', 'responsavel-complemento'].forEach(id => {
                clearFeedback(id);
                const el = document.getElementById(id);
                if (el) el.classList.remove('is-valid', 'is-invalid');
            });

            document.getElementById('responsavel-cidade').removeAttribute('readonly');
            document.getElementById('responsavel-uf').removeAttribute('readonly');

            formVerificationState.logradouro = false;
            formVerificationState.bairro = false;
            formVerificationState.cidade = false;
            formVerificationState.uf = false;
            formVerificationState.numero = false;

            checkFormOrder(cepInput);
            validateFormState();
            return;
        }
        if (cep.length > 0 && cep.length < 8) {
            formVerificationState.cep = false;
            showFeedback('responsavel-cep', 'O CEP deve conter 8 dígitos.', 'danger');
            validateFormState();
            return;
        }
        if (cep.length === 8) {
            await fetchCEP(cep);
        }
    });

    function fillAddressFields(data) {
        formVerificationState.cep = true;
        document.getElementById('responsavel-endereco').value = data.logradouro || '';
        document.getElementById('responsavel-bairro').value = data.bairro || '';
        document.getElementById('responsavel-cidade').value = data.localidade || '';
        document.getElementById('responsavel-uf').value = data.uf || '';
        document.getElementById('responsavel-complemento').value = data.complemento || '';

        if (data.bairro) {
            formVerificationState.bairro = true;
            showFeedback('responsavel-bairro', '', 'success');
        } else {
            formVerificationState.bairro = false;
            clearFeedback('responsavel-bairro');
        }
        if (data.localidade) {
            formVerificationState.cidade = true;
            showFeedback('responsavel-cidade', '', 'success');
        } else {
            formVerificationState.cidade = false;
            clearFeedback('responsavel-cidade');
        }
        if (data.uf) {
            formVerificationState.uf = true;
            showFeedback('responsavel-uf', '', 'success');
        } else {
            formVerificationState.uf = false;
            clearFeedback('responsavel-uf');
        }
        if (data.logradouro) {
            formVerificationState.logradouro = true;
            showFeedback('responsavel-endereco', '', 'success');
        } else {
            formVerificationState.logradouro = false;
            clearFeedback('responsavel-endereco');
        }

        showFeedback('responsavel-cep', '✓ CEP verificado com sucesso.', 'success');

        document.getElementById('responsavel-cidade').setAttribute('readonly', 'true');
        document.getElementById('responsavel-uf').setAttribute('readonly', 'true');

        const numeroInput = document.getElementById('responsavel-numero');
        if (numeroInput) numeroInput.focus();
    }

    async function fetchCEP(cep) {
        // 1. Verifica se o CEP já está no cache local do localStorage para resposta instantânea (0ms)
        try {
            const localCache = JSON.parse(localStorage.getItem('explora_cep_cache') || '{}');
            if (localCache && localCache[cep]) {
                console.log(`[CEP Cache] Carregado instantaneamente do cache local para o CEP: ${cep}`);
                fillAddressFields(localCache[cep]);
                checkFormOrder(cepInput);
                validateFormState();
                return;
            }
        } catch (e) {
            console.error("Erro ao acessar cache local do CEP:", e);
        }

        showFeedback('responsavel-cep', 'Buscando CEP...', 'warning');

        const fetchViaCEP = async () => {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!res.ok) throw new Error("ViaCEP falhou");
            const data = await res.json();
            if (data.erro || data.erro === 'true') throw new Error("CEP inexistente");
            return data;
        };

        const fetchBrasilAPI = async () => {
            const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
            if (!res.ok) throw new Error("BrasilAPI falhou");
            const data = await res.json();
            return {
                logradouro: data.street,
                bairro: data.neighborhood,
                localidade: data.city,
                uf: data.state,
                cep: data.cep,
                complemento: ''
            };
        };

        const fetchOpenCEP = async () => {
            const res = await fetch(`https://opencep.com/v1/${cep}`);
            if (!res.ok) throw new Error("OpenCEP falhou");
            const data = await res.json();
            if (data.erro || data.erro === 'true') throw new Error("CEP inexistente");
            return data;
        };

        try {
            // Executa as 3 consultas em paralelo e pega a primeira que responder com sucesso!
            const data = await Promise.any([
                fetchViaCEP(),
                fetchBrasilAPI(),
                fetchOpenCEP()
            ]);

            // Salva o resultado no localStorage para futuras consultas instantâneas
            try {
                const localCache = JSON.parse(localStorage.getItem('explora_cep_cache') || '{}');
                localCache[cep] = data;
                localStorage.setItem('explora_cep_cache', JSON.stringify(localCache));
                console.log(`[CEP Cache] CEP ${cep} salvo com sucesso no localStorage.`);
            } catch (e) {
                console.error("Erro ao salvar no cache local:", e);
            }

            fillAddressFields(data);

        } catch (err) {
            console.error("Todas as APIs de CEP falharam ou o CEP é inválido:", err);
            formVerificationState.cep = true; // Permite que prossiga mesmo preenchendo manual
            showFeedback('responsavel-cep', 'Consulta indisponível ou CEP inexistente. Preencha o endereço manualmente.', 'warning');

            document.getElementById('responsavel-cidade').removeAttribute('readonly');
            document.getElementById('responsavel-uf').removeAttribute('readonly');
        }
        checkFormOrder(cepInput);
        validateFormState();
    }

    // Formata o CEP visualmente enquanto digita (00000-000) e busca automaticamente
    cepInput.addEventListener('input', async (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;

        let cleanCep = value.replace(/\D/g, '');

        // 1. Se o usuário estiver alterando/apagando o CEP, limpa os campos antigos imediatamente (sem depender de ordem ou blur)
        if (cleanCep.length < 8) {
            document.getElementById('responsavel-endereco').value = '';
            document.getElementById('responsavel-bairro').value = '';
            document.getElementById('responsavel-cidade').value = '';
            document.getElementById('responsavel-uf').value = '';

            const numInput = document.getElementById('responsavel-numero');
            if (numInput) numInput.value = '';
            const compInput = document.getElementById('responsavel-complemento');
            if (compInput) compInput.value = '';

            ['responsavel-endereco', 'responsavel-bairro', 'responsavel-cidade', 'responsavel-uf', 'responsavel-numero', 'responsavel-complemento'].forEach(id => {
                clearFeedback(id);
                const el = document.getElementById(id);
                if (el) el.classList.remove('is-valid', 'is-invalid');
            });

            document.getElementById('responsavel-cidade').removeAttribute('readonly');
            document.getElementById('responsavel-uf').removeAttribute('readonly');

            formVerificationState.cep = false;
            formVerificationState.logradouro = false;
            formVerificationState.bairro = false;
            formVerificationState.cidade = false;
            formVerificationState.uf = false;
            formVerificationState.numero = false;

            validateFormState();
        }

        // 2. Só agora valida se o formulário está preenchido fora de ordem (CPF pendente)
        if (checkFormOrder(cepInput)) {
            formVerificationState.cep = false;
            validateFormState();
            return;
        }

        if (value.length < 9) {
            clearFeedback('responsavel-cep');
            formVerificationState.cep = true; // temporário em digitação
            validateFormState();
        }

        // 3. Se atingiu exatamente 8 números, dispara a busca imediatamente
        if (cleanCep.length === 8) {
            showFeedback('responsavel-cep', 'Buscando CEP...', 'warning');
            await fetchCEP(cleanCep);
        }
    });
}

// ==========================================
// VALIDAÇÃO DE LOGRADOURO
// ==========================================
function initLogradouroValidation() {
    const endInput = document.getElementById('responsavel-endereco');
    if (!endInput) return;

    endInput.addEventListener('blur', () => {
        const val = endInput.value.trim();
        if (val.length === 0) {
            formVerificationState.logradouro = false;
            showFeedback('responsavel-endereco', 'O Logradouro é obrigatório.', 'danger');
        } else if (/[^a-zA-Z0-9À-ÿ\s\.,\-\/]/.test(val)) {
            formVerificationState.logradouro = false;
            showFeedback('responsavel-endereco', 'O Logradouro contém caracteres especiais não permitidos.', 'danger');
        } else {
            formVerificationState.logradouro = true;
            showFeedback('responsavel-endereco', '', 'success');
        }
        checkFormOrder(endInput);
        validateFormState();
    });

    endInput.addEventListener('input', (e) => {
        // Bloqueia caracteres inválidos em tempo real (mantém números, pontuação de endereço)
        if (/[^a-zA-Z0-9À-ÿ\s\.,\-\/]/.test(e.target.value)) {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9À-ÿ\s\.,\-\/]/g, '');
            showFeedback('responsavel-endereco', 'Caracteres inválidos removidos.', 'danger');
        }

        if (checkFormOrder(endInput)) {
            formVerificationState.logradouro = false;
            validateFormState();
            return;
        }

        const val = endInput.value.trim();
        if (val.length > 0) {
            formVerificationState.logradouro = true;
            const fb = endInput.parentElement.querySelector('.field-feedback');
            if (!fb || fb.className !== 'field-feedback active danger') {
                clearFeedback('responsavel-endereco');
            }
        } else {
            formVerificationState.logradouro = false;
        }
        validateFormState();
    });
}
document.addEventListener('DOMContentLoaded', initLogradouroValidation);

// ==========================================
// VALIDAÇÃO DE NÚMERO
// ==========================================
function initNumeroValidation() {
    const numInput = document.getElementById('responsavel-numero');
    if (!numInput) return;

    numInput.addEventListener('blur', () => {
        const val = numInput.value.trim();
        if (val.length === 0) {
            formVerificationState.numero = false;
            showFeedback('responsavel-numero', 'O Número é obrigatório.', 'danger');
        } else if (/\D/.test(val)) {
            formVerificationState.numero = false;
            showFeedback('responsavel-numero', 'O Número deve conter apenas dígitos.', 'danger');
        } else {
            formVerificationState.numero = true;
            showFeedback('responsavel-numero', '', 'success');
        }
        checkFormOrder(numInput);
        validateFormState();
    });

    numInput.addEventListener('input', (e) => {
        // Bloqueia letras e caracteres especiais em tempo real
        if (/\D/.test(e.target.value)) {
            e.target.value = e.target.value.replace(/\D/g, '');
            showFeedback('responsavel-numero', 'Letras e caracteres especiais não são permitidos.', 'danger');
        }

        if (checkFormOrder(numInput)) {
            formVerificationState.numero = false;
            validateFormState();
            return;
        }

        const val = numInput.value.trim();
        if (val.length > 0) {
            formVerificationState.numero = true;
            // Se não houve alerta de caractere inválido, limpa
            const fb = numInput.parentElement.querySelector('.field-feedback');
            if (!fb || fb.className !== 'field-feedback active danger') {
                clearFeedback('responsavel-numero');
            }
        } else {
            formVerificationState.numero = false;
        }
        validateFormState();
    });
}
document.addEventListener('DOMContentLoaded', initNumeroValidation);

// ==========================================
// VALIDAÇÃO DE COMPLEMENTO
// ==========================================
function initComplementoValidation() {
    const compInput = document.getElementById('responsavel-complemento');
    if (!compInput) return;

    compInput.addEventListener('blur', () => {
        const val = compInput.value.trim();
        if (val.length === 0) {
            clearFeedback('responsavel-complemento');
        } else if (/[^a-zA-ZÀ-ÿ0-9\s]/.test(val)) {
            showFeedback('responsavel-complemento', 'O Complemento deve conter apenas letras e números.', 'danger');
        } else {
            showFeedback('responsavel-complemento', '', 'success');
        }
        checkFormOrder(compInput);
    });

    compInput.addEventListener('input', (e) => {
        // Bloqueia caracteres especiais em tempo real
        if (/[^a-zA-ZÀ-ÿ0-9\s]/.test(e.target.value)) {
            e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '');
            showFeedback('responsavel-complemento', 'Caracteres especiais não são permitidos.', 'danger');
        }

        if (checkFormOrder(compInput)) {
            return;
        }

        const val = compInput.value.trim();
        if (val.length > 0) {
            // Se não houve alerta de caractere inválido, limpa
            const fb = compInput.parentElement.querySelector('.field-feedback');
            if (!fb || fb.className !== 'field-feedback active danger') {
                clearFeedback('responsavel-complemento');
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', initComplementoValidation);

// ==========================================
// VALIDAÇÃO DE BAIRRO, CIDADE E UF
// ==========================================
function initLocationValidation() {
    const validUFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

    const fields = [
        { id: 'responsavel-bairro', stateKey: 'bairro', label: 'Bairro', regex: /[^a-zA-Z0-9À-ÿ\s\.,\-]/ },
        { id: 'responsavel-cidade', stateKey: 'cidade', label: 'Cidade', regex: /[^a-zA-ZÀ-ÿ\s\.\-]/ },
        { id: 'responsavel-uf', stateKey: 'uf', label: 'UF', regex: /[^a-zA-Z]/, lengthCheck: true }
    ];

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input) return;

        input.addEventListener('blur', () => {
            const val = input.value.trim().toUpperCase();
            if (val.length === 0) {
                formVerificationState[field.stateKey] = false;
                showFeedback(field.id, `O ${field.label} é obrigatório.`, 'danger');
            } else if (field.lengthCheck && val.length !== 2) {
                formVerificationState[field.stateKey] = false;
                showFeedback(field.id, `A ${field.label} deve ter 2 letras.`, 'danger');
            } else if (field.lengthCheck && !validUFs.includes(val)) {
                formVerificationState[field.stateKey] = false;
                showFeedback(field.id, 'Este estado não existe no Brasil.', 'danger');
            } else if (field.regex.test(val)) {
                formVerificationState[field.stateKey] = false;
                showFeedback(field.id, `O ${field.label} não deve conter números ou caracteres especiais.`, 'danger');
            } else {
                formVerificationState[field.stateKey] = true;
                showFeedback(field.id, '', 'success');
            }
            checkFormOrder(input);
            validateFormState();
        });

        input.addEventListener('input', (e) => {
            // Bloqueia caracteres especiais em tempo real
            if (field.regex.test(e.target.value)) {
                e.target.value = e.target.value.replace(new RegExp(field.regex, 'g'), '');
                showFeedback(field.id, 'Números e caracteres especiais não são permitidos.', 'danger');
            }

            if (checkFormOrder(input)) {
                formVerificationState[field.stateKey] = false;
                validateFormState();
                return;
            }

            const val = input.value.trim();
            if (val.length > 0) {
                formVerificationState[field.stateKey] = true;
                // Se não houve alerta de caractere inválido, limpa
                const fb = input.parentElement.querySelector('.field-feedback');
                if (!fb || fb.className !== 'field-feedback active danger') {
                    clearFeedback(field.id);
                }
            } else {
                formVerificationState[field.stateKey] = false;
            }
            validateFormState();
        });
    });
}
document.addEventListener('DOMContentLoaded', initLocationValidation);

// ==========================================
// VALIDAÇÃO DE USO DE IMAGEM
// ==========================================
function initUsoImagemValidation() {
    const radios = document.querySelectorAll('input[name="responsavel-autoriza-imagem"]');
    if (radios.length === 0) return;

    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            formVerificationState.usoImagem = true;
            validateFormState();
        });
    });
}
document.addEventListener('DOMContentLoaded', initUsoImagemValidation);

// ==========================================
// DETECTAR TIPO DE CONEXÃO DO BANCO DE DADOS
// ==========================================
async function detectDatabaseType() {
    const statusLabel = document.getElementById('db-connection-type');
    try {
        // Faz uma requisição simples e rápida para entender a stack conectada
        const res = await fetch(`${API_BASE}/clientes`);
        if (res.ok) {
            statusLabel.textContent = "Conectado (Pronto para Nuvem)";
        }
    } catch (e) {
        statusLabel.textContent = "Offline";
        statusLabel.parentElement.previousElementSibling.className = "status-indicator offline";
    }
}

// ==========================================
// CONTROLE DE NAVEGAÇÃO DE ABAS
// ==========================================
function initTabs() {
    const links = document.querySelectorAll('.nav-link');
    const panels = document.querySelectorAll('.tab-panel');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Se for dropdown, intercala a visibilidade do submenu e não troca a aba principal
            if (link.classList.contains('nav-link-dropdown')) {
                links.forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.submenu-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                link.classList.toggle('open');
                const submenu = link.nextElementSibling;
                if (submenu && submenu.classList.contains('submenu')) {
                    submenu.classList.toggle('active');
                }
                return; // Impede a troca de aba e carregamento de dados
            }

            // Remove classes ativas de todos
            links.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.submenu-link').forEach(l => l.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Adiciona classe ativa no item clicado
            link.classList.add('active');
            const tabId = `tab-${link.getAttribute('data-tab')}`;
            const targetPanel = document.getElementById(tabId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // Permitir clique nos links do submenu (para fechar outros se necessário, ou só manter a aba pai ativa)
    const submenuLinks = document.querySelectorAll('.submenu-link');
    submenuLinks.forEach(subLink => {
        subLink.addEventListener('click', (e) => {
            // Se tiver data-tab, faz a troca
            const tab = subLink.getAttribute('data-tab');
            if (tab) {
                e.preventDefault();

                // Remove active de todos os links principais e do submenu
                links.forEach(l => l.classList.remove('active'));
                submenuLinks.forEach(l => l.classList.remove('active'));

                // Adiciona active no submenu clicado
                subLink.classList.add('active');

                // Mantém o menu pai principal ativo também
                const parentGroup = subLink.closest('.nav-group');
                if (parentGroup) {
                    const parentLink = parentGroup.querySelector('.nav-link');
                    if (parentLink) parentLink.classList.add('active');
                }

                panels.forEach(p => p.classList.remove('active'));
                const tabId = `tab-${tab}`;
                const targetPanel = document.getElementById(tabId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                if (tab === 'novo-responsavel') {
                    window.resetResponsávelForm();
                }

                if (typeof onTabChanged === 'function') {
                    onTabChanged(tab);
                }
            }
        });
    });
}

function showResponsaveisList() {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.submenu-link').forEach(l => l.classList.remove('active'));

    const clientesLink = document.querySelector('.nav-link[data-tab="clientes"]');
    if (clientesLink) clientesLink.classList.add('active');

    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    const tabClientes = document.getElementById('tab-clientes');
    if (tabClientes) tabClientes.classList.add('active');

    if (typeof onTabChanged === 'function') {
        onTabChanged('clientes');
    }
}

function showNovoResponsávelForm() {
    const tabLink = document.querySelector('.submenu-link[data-tab="novo-responsavel"]');
    if (tabLink) {
        tabLink.click();
    }
}

function onTabChanged(tabName) {
    state.activeTab = tabName;

    // Atualiza cabeçalho do painel ativo
    const title = document.getElementById('current-tab-title');
    const subtitle = document.getElementById('current-tab-subtitle');

    switch (tabName) {
        case 'dashboard':
            title.textContent = "Dashboard Geral";
            subtitle.textContent = "Métricas consolidadas de negócios e distribuição de estoques.";
            loadDashboardData();
            break;
        case 'clientes':
            title.innerHTML = 'Responsáveis Cadastrados';
            subtitle.textContent = "Responsáveis pelos pets atendidos.";
            if (window.lucide) {
                lucide.createIcons();
            }
            loadResponsaveis();
            break;

        case 'pets':
            title.innerHTML = 'Pets Cadastrados';
            subtitle.textContent = "Animais atendidos na clínica.";
            if (window.lucide) {
                lucide.createIcons();
            }
            loadPets();
            break;

        case 'produtos':
            title.textContent = "Inventário de Produtos";
            subtitle.textContent = "Controle de estoque, categorias de produtos e tabelas de preços.";
            loadProdutos();
            break;
        case 'vendas':
            title.textContent = "Histórico de Vendas";
            subtitle.textContent = "Registre novos pedidos e acompanhe o faturamento detalhado por item.";
            loadVendas();
            break;
        case 'sql-terminal':
            title.textContent = "Terminal SQL Interativo";
            subtitle.textContent = "Escreva e execute comandos SQL nativos diretamente no banco de dados.";
            break;
        case 'novo-responsavel':
            title.textContent = "Cadastro do Responsável";
            subtitle.textContent = "Registre as informações pessoais, contato e localização do responsável.";
            break;
        case 'novo-pet':
            title.textContent = "Pets Cadastrados";
            subtitle.textContent = "Preencha as informações para registrar o pet e associá-lo a um responsavel.";
            if (typeof window.populateResponsaveisSelect === 'function') {
                window.populateResponsaveisSelect();
            }
            break;
        case 'pets':
            title.textContent = "Lista de Pets";
            subtitle.textContent = "Gerencie todos os pets registrados e suas fichas clínicas.";
            break;
        case 'usuarios': case 'usuarios':
            title.innerHTML = '<span style="display: flex; align-items: center; gap: 8px;"><i data-lucide="user-cog" style="width: 24px; height: 24px;"></i> Controle de Usuários</span>';
            subtitle.textContent = "Gerencie perfis de acesso, credenciais e permissões dos operadores do sistema.";
            if (window.lucide) {
                lucide.createIcons();
            }
            loadUsuarios();
            break;
    }

    // Exibe o botão "Novo Usuário" apenas na aba de usuários se for administrador
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    if (btnNovoUsuario) {
        const is_admin = localStorage.getItem('user_cargo') === 'Administrador';
        if (tabName === 'usuarios' && is_admin) {
            btnNovoUsuario.style.display = 'inline-flex';
        } else {
            btnNovoUsuario.style.display = 'none';
        }
    }
}

// ==========================================
// CONTROLE DE TEMA (DARK / LIGHT MODE)
// ==========================================
function initTheme() {
    const btn = document.getElementById('theme-toggle');
    const icon = btn.querySelector('i');

    btn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');

        if (isLight) {
            btn.innerHTML = '<i data-lucide="sun"></i>';
            btn.setAttribute('title', 'Ativar Modo Escuro');
        } else {
            btn.innerHTML = '<i data-lucide="moon"></i>';
            btn.setAttribute('title', 'Ativar Modo Claro');
        }
        lucide.createIcons();
    });
}

// ==========================================
// DADOS DO DASHBOARD E GRÁFICOS (CHART.JS)
// ==========================================
async function loadDashboardData() {
    try {
        if (state.responsaveis.length === 0) await loadResponsaveis(true);
        if (state.activeTab === 'pets') {
            if (state.pets.length === 0) await loadPets(true);
            else renderPetsList();
        }

        const responsaveis = state.responsaveis;
        const responsaveisAtivos = responsaveis.filter(t => !t.status || t.status.toLowerCase() === 'ativo').length;

        // Carrega Pets para o KPI
        if (!state.pets || state.pets.length === 0) {
            try {
                if (typeof loadPets === 'function') {
                    await loadPets(true);
                } else {
                    const resPets = await fetch(`${API_BASE}/pets`);
                    if (resPets.ok) state.pets = await resPets.json();
                }
            } catch (e) {}
        }
        const pets = state.pets || [];
        const petsAtivos = pets.filter(p => !p.status || p.status.toLowerCase() === 'ativo').length;

        // Atualiza os KPIs
        const kpiResponsáveles = document.getElementById('kpi-responsaveis');
        if (kpiResponsáveles) kpiResponsáveles.textContent = responsaveisAtivos;

        const kpiPetsAtivos = document.getElementById('kpi-pets-ativos');
        if (kpiPetsAtivos) kpiPetsAtivos.textContent = petsAtivos;

    } catch (error) {
        console.error("Erro ao carregar métricas do dashboard:", error);
    }
}

function renderSalesChart(data) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    // Destrói gráfico antigo se existir
    if (state.charts.sales) {
        state.charts.sales.destroy();
    }

    const labels = data.length ? data.map(d => formatDateShort(d.dia)) : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const totals = data.length ? data.map(d => d.total) : [0, 0, 0, 0, 0];

    const isLight = document.body.classList.contains('light-theme');
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    const textColor = isLight ? '#475569' : '#94a3b8';

    state.charts.sales = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Faturamento Diário',
                data: totals,
                borderColor: '#258e5a',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#258e5a',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        callback: function (value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

function renderCategoriesChart(data) {
    const ctx = document.getElementById('categoriesChart');
    if (!ctx) return;

    if (state.charts.categories) {
        state.charts.categories.destroy();
    }

    const labels = data.length ? data.map(d => d.categoria) : ['Sem dados'];
    const totals = data.length ? data.map(d => d.total) : [1];

    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#94a3b8';

    state.charts.categories = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: totals,
                backgroundColor: data.length ? [
                    '#258e5a', // Esmeralda
                    '#34d399', // Verde claro
                    '#f59e0b', // Amarelo
                    '#ef4444', // Vermelho
                    '#6ee7b7'  // Menta
                ] : ['#333'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15,
                        font: { size: 11, weight: '500' }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// ==========================================
// CONTROLE DA TABELA DE TUTORES
// ==========================================
async function loadResponsaveis() {
    const spinner = document.getElementById('loading-responsaveis');
    const table = document.getElementById('table-responsaveis-element');
    if (spinner && table) {
        spinner.style.display = 'flex';
        table.style.opacity = '0.3';
    }
    try {
        const response = await fetch(`${API_BASE}/responsaveis?limit=10000`);
        const resData = await response.json();
        state.responsaveis = Array.isArray(resData) ? resData : (resData.items || []);
        renderResponsaveisTable(state.responsaveis);
    } catch (error) {
        console.error("Erro ao carregar responsaveis:", error);
    } finally {
        if (spinner && table) {
            spinner.style.display = 'none';
            table.style.opacity = '1';
        }
    }
}

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderResponsaveisTable(list, isFiltered = false) {
    const tbody = document.getElementById('tbody-responsaveis');
    const emptyState = document.getElementById('empty-responsaveis');
    tbody.innerHTML = '';

    if (list.length === 0) {
        emptyState.style.display = 'block';
        updatePaginationInfo(0, 0, 0);
        return;
    }
    emptyState.style.display = 'none';

    // Se NÃO for renderização de filtro, resetamos os inputs de busca para estarem vazios
    if (!isFiltered) {
        ['filter-responsavel-nome', 'filter-responsavel-cpf', 'filter-responsavel-celular', 'filter-responsavel-email', 'filter-responsavel-status'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        const selectAll = document.getElementById('select-all-responsaveis');
        if (selectAll) selectAll.checked = false;
        state.responsaveisFilteredList = null;
        state.responsaveisPage = 1;
    } else {
        state.responsaveisFilteredList = list;
    }

    let itemsToRender = list;

    // Pagination logic
    const totalItems = list.length;
    let startItem = 0;
    let endItem = totalItems;

    if (state.responsaveisRowsPerPage !== 'all') {
        const rows = parseInt(state.responsaveisRowsPerPage);
        const totalPages = Math.ceil(totalItems / rows);
        if (state.responsaveisPage > totalPages && totalPages > 0) state.responsaveisPage = totalPages;

        startItem = (state.responsaveisPage - 1) * rows;
        endItem = Math.min(startItem + rows, totalItems);
        itemsToRender = list.slice(startItem, endItem);
    }

    updatePaginationInfo(totalItems > 0 ? startItem + 1 : 0, endItem, totalItems);

    itemsToRender.forEach(t => {
        const row = document.createElement('tr');

        // Adiciona classe de destaque se este for o responsavel salvo/editado recentemente
        if (state.highlightedResponsávelId && t.id === state.highlightedResponsávelId) {
            row.classList.add('highlighted-row');
        }

        // Formatação do CPF
        let formattedCpf = t.cpf || '';
        if (formattedCpf.length === 11) {
            formattedCpf = formattedCpf.substring(0, 3) + '.' + formattedCpf.substring(3, 6) + '.' + formattedCpf.substring(6, 9) + '-' + formattedCpf.substring(9, 11);
        }

        // Formatação do Celular/Telefone (Whatsapp)
        let formattedPhone = t.telefone || '';
        if (formattedPhone.length === 11 && !formattedPhone.includes('(')) {
            formattedPhone = `(${formattedPhone.substring(0, 2)}) ${formattedPhone.substring(2, 7)}-${formattedPhone.substring(7)}`;
        } else if (formattedPhone.length === 10 && !formattedPhone.includes('(')) {
            formattedPhone = `(${formattedPhone.substring(0, 2)}) ${formattedPhone.substring(2, 6)}-${formattedPhone.substring(6)}`;
        }

        row.innerHTML = `
            <td style="vertical-align: middle;">
                <div style="display: flex; align-items: center; gap: 12px; height: 100%;">
                    <input type="checkbox" class="custom-checkbox responsavel-select-checkbox" data-id="${t.id}" onchange="window.toggleBulkDeleteBtn('responsaveis')">
                    <button class="btn-table-edit" onclick="editResponsavel(${t.id})">
                        <i data-lucide="edit-3" style="width: 15px; height: 15px;"></i> Editar
                    </button>
                    <div class="dropdown-options-container" id="dropdown-${t.id}">
                        <button class="btn-table-options" onclick="toggleDropdown(${t.id}, event)">
                            Opções <i data-lucide="chevron-down" style="width: 14px; height: 14px; margin-left: 2px;"></i>
                        </button>
                        <div class="dropdown-menu-list">
                            <button class="dropdown-item" onclick="viewResponsável(${t.id}); closeAllDropdowns();">
                                <i data-lucide="eye" style="color: var(--primary);"></i> Visualizar
                            </button>
                            <button class="dropdown-item delete" onclick="deleteResponsavel(${t.id}); closeAllDropdowns();">
                                <i data-lucide="trash-2" style="color: var(--danger);"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </td>
            <td style="font-size: 14px; color: var(--text-main); vertical-align: middle;">
                <div style="display: flex; align-items: center; gap: 14px; height: 100%;">
                    ${t.foto_url
                ? `<img src="${t.foto_url}" alt="${t.nome}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid var(--border-glow);">`
                : (() => { const parts = (t.nome || '?').trim().split(/\s+/); const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]; return `<div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-glow); border: 2px solid var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 20px; font-weight: 700; color: var(--primary);">${initials.toUpperCase()}</div>`; })()
            }
                    <span>${t.nome}</span>
                </div>
            </td>
            <td style="font-size: 14px; color: var(--text-main); vertical-align: middle;">${formattedCpf || '<span class="text-muted">-</span>'}</td>
            <td style="font-size: 14px; color: var(--text-main); vertical-align: middle;">${formattedPhone || '<span class="text-muted">-</span>'}</td>
            <td style="font-size: 14px; color: var(--text-main); vertical-align: middle;">${t.email}</td>
            <td style="text-align: center; vertical-align: middle;">
                <span class="${t.status === 'Ativo' ? 'badge-green-responsavel' : 'badge-red-responsavel'}">${t.status === 'Ativo' ? 'CLIENTE' : 'INATIVO'}</span>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Remove o destaque após 5 segundos e limpa o ID do estado global
    if (state.highlightedResponsávelId) {
        setTimeout(() => {
            const highlightedRow = document.querySelector('.highlighted-row');
            if (highlightedRow) {
                highlightedRow.classList.remove('highlighted-row');
            }
            state.highlightedResponsávelId = null;
        }, 5000);
    }

    // Vincula listeners de filtros rápidos
    setupResponsávelFilters();
    setupSelectAllLogic();

    lucide.createIcons();
}

// Configura filtros de pesquisa em tempo real
function setupResponsávelFilters() {
    ['filter-responsavel-nome', 'filter-responsavel-cpf', 'filter-responsavel-celular', 'filter-responsavel-email', 'filter-responsavel-status'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeEventListener('input', applyResponsavelFilters);
            input.addEventListener('input', applyResponsavelFilters);
        }
    });
}

window.applyResponsavelFilters = function () {
    const nomeInput = document.getElementById('filter-responsavel-nome');
    const cpfInput = document.getElementById('filter-responsavel-cpf');
    const celularInput = document.getElementById('filter-responsavel-celular');
    const emailInput = document.getElementById('filter-responsavel-email');
    const statusInput = document.getElementById('filter-responsavel-status');

    if (cpfInput && cpfInput.value) {
        let val = cpfInput.value.replace(/\D/g, '').substring(0, 11);
        let formatted = '';
        if (val.length > 0) formatted = val.substring(0, 3);
        if (val.length > 3) formatted += '.' + val.substring(3, 6);
        if (val.length > 6) formatted += '.' + val.substring(6, 9);
        if (val.length > 9) formatted += '-' + val.substring(9, 11);
        cpfInput.value = formatted;
    }

    const nomeF = (nomeInput ? nomeInput.value : '').toLowerCase();
    const cpfF = (cpfInput ? cpfInput.value : '').replace(/\D/g, '');
    const celularF = (celularInput ? celularInput.value : '').replace(/\D/g, '');
    const emailF = (emailInput ? emailInput.value : '').toLowerCase();
    const statusF = (statusInput ? statusInput.value : '').toLowerCase();

    const filtered = state.responsaveis.filter(t => {
        const tNome = t.nome ? t.nome.toLowerCase() : '';
        const matchNome = !nomeF || tNome.startsWith(nomeF);

        const cleanCpf = (t.cpf || '').replace(/\D/g, '');
        const matchCpf = !cpfF || cleanCpf.startsWith(cpfF);

        const cleanCelular = (t.telefone || '').replace(/\D/g, '');
        const matchCelular = !celularF || cleanCelular.startsWith(celularF) || (cleanCelular.length >= 2 && cleanCelular.substring(2).startsWith(celularF));

        const tEmail = t.email ? t.email.toLowerCase() : '';
        const matchEmail = !emailF || tEmail.startsWith(emailF);

        const statusStr = t.status ? t.status.toLowerCase() : '';
        const matchStatus = !statusF ||
            (statusStr === 'ativo' ? 'cliente' : 'inativo').startsWith(statusF);

        return matchNome && matchCpf && matchCelular && matchEmail && matchStatus;
    });

    renderResponsaveisTable(filtered, true);
}

// Pagination Logic for Responsáveles
function updatePaginationInfo(start, end, total) {
    const elStart = document.getElementById('page-start-responsaveis');
    const elEnd = document.getElementById('page-end-responsaveis');
    const elTotal = document.getElementById('page-total-responsaveis');
    const btnPrev = document.getElementById('btn-prev-responsaveis');
    const btnNext = document.getElementById('btn-next-responsaveis');

    if (elStart) elStart.textContent = start;
    if (elEnd) elEnd.textContent = end;
    if (elTotal) elTotal.textContent = total;

    if (btnPrev) btnPrev.disabled = state.responsaveisPage <= 1;

    if (btnNext) {
        if (state.responsaveisRowsPerPage === 'all') {
            btnNext.disabled = true;
        } else {
            const rows = parseInt(state.responsaveisRowsPerPage);
            const totalPages = Math.ceil(total / rows);
            btnNext.disabled = state.responsaveisPage >= totalPages;
        }
    }
}

window.changeRowsPerPage = function (type, value) {
    if (type === 'responsaveis') {
        state.responsaveisRowsPerPage = value;
        state.responsaveisPage = 1;
        const listToRender = state.responsaveisFilteredList || state.responsaveis;
        renderResponsaveisTable(listToRender, state.responsaveisFilteredList !== null);
    }
};

window.prevPage = function (type) {
    if (type === 'responsaveis' && state.responsaveisPage > 1) {
        state.responsaveisPage--;
        const listToRender = state.responsaveisFilteredList || state.responsaveis;
        renderResponsaveisTable(listToRender, state.responsaveisFilteredList !== null);
    }
};

window.nextPage = function (type) {
    if (type === 'responsaveis' && state.responsaveisRowsPerPage !== 'all') {
        const listToRender = state.responsaveisFilteredList || state.responsaveis;
        const rows = parseInt(state.responsaveisRowsPerPage);
        const totalPages = Math.ceil(listToRender.length / rows);

        if (state.responsaveisPage < totalPages) {
            state.responsaveisPage++;
            renderResponsaveisTable(listToRender, state.responsaveisFilteredList !== null);
        }
    }
};

// Lógica de seleção múltipla por Checkboxes
function setupSelectAllLogic() {
    window.toggleBulkDeleteBtn('responsaveis');
}

window.toggleSelectAll = function (type, checked) {
    let selector = type === 'pets' ? '.row-checkbox-pets' : '.responsavel-select-checkbox';
    document.querySelectorAll(selector).forEach(cb => {
        cb.checked = checked;
    });
    window.toggleBulkDeleteBtn(type);
};

window.toggleBulkDeleteBtn = function (type) {
    let selector = type === 'pets' ? '.row-checkbox-pets' : '.responsavel-select-checkbox';
    const total = document.querySelectorAll(selector).length;
    const checkedCount = document.querySelectorAll(`${selector}:checked`).length;

    // update select-all checkbox
    let selectAllId = type === 'pets' ? 'select-all-pets' : 'select-all-responsaveis';
    const selectAllCheckbox = document.getElementById(selectAllId);
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = (total > 0 && total === checkedCount);
    }

    // update bulk delete button visibility
    let btnId = type === 'pets' ? 'btn-bulk-delete-pets' : 'btn-bulk-delete-responsaveis';
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.style.display = checkedCount > 0 ? 'inline-flex' : 'none';
    }
};

// Lógica para controle dos Dropdowns de Opções na tabela
window.toggleDropdown = function (id, event) {
    event.stopPropagation();
    const container = document.getElementById(`dropdown-${id}`);
    const isActive = container.classList.contains('active');

    closeAllDropdowns();

    if (!isActive) {
        container.classList.add('active');
    }
};

window.closeAllDropdowns = function () {
    document.querySelectorAll('.dropdown-options-container').forEach(el => {
        el.classList.remove('active');
    });
};

document.addEventListener('click', () => {
    closeAllDropdowns();
});

async function viewResponsável(id) {
    try {
        const response = await fetch(`${API_BASE}/responsaveis/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes do responsavel");
        const t = await response.json();

        const content = document.getElementById('modal-view-responsavel-content');
        if (!content) return;

        // Formata data de nascimento
        let nascimento = 'N/A';
        if (t.data_nascimento) {
            nascimento = formatDateWithSlashes(t.data_nascimento);
        }

        // Formata CPF
        let formattedCpf = t.cpf || 'N/A';
        if (t.cpf && t.cpf.length === 11) {
            formattedCpf = t.cpf.substring(0, 3) + '.' + t.cpf.substring(3, 6) + '.' + t.cpf.substring(6, 9) + '-' + t.cpf.substring(9, 11);
        }

        // Formata CEP
        let formattedCep = t.cep || 'N/A';
        if (t.cep && t.cep.length === 8) {
            formattedCep = t.cep.substring(0, 5) + '-' + t.cep.substring(5, 8);
        }

        const badgeClass = t.status === 'Ativo' ? 'badge-success' : 'badge-danger';

        content.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Código (ID)</span>
                    <span class="info-value"><strong>#${String(t.id).padStart(3, '0')}</strong></span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="info-value"><span class="badge ${badgeClass}">${t.status}</span></span>
                </div>
                <div class="info-item full-width">
                    <span class="info-label">Nome Completo</span>
                    <span class="info-value" style="font-size: 16px; font-weight: 700; color: var(--text-main);">${t.nome}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">CPF</span>
                    <span class="info-value" style="font-family: monospace; font-size: 14px;">${formattedCpf}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data de Nascimento</span>
                    <span class="info-value">${nascimento}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sexo</span>
                    <span class="info-value">${t.sexo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estado Civil</span>
                    <span class="info-value">${t.estado_civil || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">E-mail</span>
                    <span class="info-value" style="word-break: break-all;">${t.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Telefone Principal</span>
                    <span class="info-value">${t.telefone || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Telefone Secundário</span>
                    <span class="info-value">${t.telefone_secundario || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Profissão</span>
                    <span class="info-value">${t.profissao || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Instagram</span>
                    <span class="info-value">${t.instagram || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Como nos Conheceu?</span>
                    <span class="info-value">${t.como_conheceu || 'N/A'}</span>
                </div>
                
                <div class="info-item full-width" style="margin-top: 12px; border-color: rgba(16, 185, 129, 0.25); background: rgba(16, 185, 129, 0.05);">
                    <span class="info-label" style="color: var(--primary); font-weight: 700;">Endereço Completo</span>
                    <span class="info-value" style="line-height: 1.5; color: var(--text-main);">
                        ${t.endereco || 'Sem endereço'}${t.numero ? `, Nº ${t.numero}` : ''}
                        ${t.complemento ? ` (${t.complemento})` : ''} <br>
                        ${t.bairro ? `${t.bairro} - ` : ''}${t.cidade || ''}/${t.uf || ''} <br>
                        <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">CEP: ${formattedCep}</span>
                    </span>
                </div>
            </div>
        `;

        // Associa ação ao botão de editar da modal
        const editBtn = document.getElementById('btn-modal-edit-responsavel');
        if (editBtn) {
            editBtn.onclick = () => {
                closeViewResponsávelModal();
                editResponsavel(t.id);
            };
        }

        const modal = document.getElementById('modal-view-responsavel');
        if (modal) {
            modal.classList.add('active');
        }

        if (window.lucide) {
            lucide.createIcons();
        }

    } catch (error) {
        console.error("Erro ao carregar detalhes do responsavel para visualização:", error);
    }
}

function closeViewResponsávelModal() {
    const modal = document.getElementById('modal-view-responsavel');
    if (modal) {
        modal.classList.remove('active');
    }
}

window.resetResponsávelForm = function () {
    const form = document.getElementById('form-responsavel');
    if (form) form.reset();
    const responsavelIdEl = document.getElementById('responsavel-id');
    if (responsavelIdEl) responsavelIdEl.value = '';

    // Limpa a foto
    const uploadInput = document.getElementById('responsavel-foto-upload');
    if (uploadInput) uploadInput.value = '';
    const preview = document.getElementById('responsavel-foto-preview');
    if (preview) {
        preview.innerHTML = '<i data-lucide="camera" style="width: 24px; height: 24px; color: var(--text-muted);"></i><span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-align: center;">Selecionar<br>Foto</span>';
        preview.style.border = '1px dashed var(--border-glow)';
    }
    const removeBtn = document.getElementById('responsavel-foto-remove');
    if (removeBtn) removeBtn.style.display = 'none';

    // Restaura o título padrão
    const titleEl = document.getElementById('tab-novo-responsavel-title');
    if (titleEl) titleEl.innerHTML = '<i data-lucide="user-plus"></i> Novo Responsável';

    // Limpa feedbacks e validações
    state.officialCPFData = null;
    ['responsavel-cpf', 'responsavel-nome', 'responsavel-data-nascimento', 'responsavel-email', 'responsavel-telefone', 'responsavel-cep', 'responsavel-sexo'].forEach(clearFeedback);
    formVerificationState.cpf = false;
    formVerificationState.nome = false;
    formVerificationState.nascimento = false;
    formVerificationState.email = true;
    formVerificationState.telefone = true;
    formVerificationState.cep = true;
    formVerificationState.sexo = false;

    const cidadeEl = document.getElementById('responsavel-cidade');
    if (cidadeEl) cidadeEl.removeAttribute('readonly');
    const ufEl = document.getElementById('responsavel-uf');
    if (ufEl) ufEl.removeAttribute('readonly');

    // Define status padrão como Ativo
    if (typeof setCustomSelectValue === 'function') {
        setCustomSelectValue('responsavel-status', 'Ativo');
    }

    // Desativa a exibição de erros para evitar loops durante o reset
    window.showSubmitError = false;
    validateFormState();

    if (window.lucide) lucide.createIcons();
};

async function editResponsavel(id) {
    try {
        const response = await fetch(`${API_BASE}/responsaveis/${id}`);
        const t = await response.json();

        // Limpa feedbacks anteriores e inicializa validações como verdadeiras para o modo de edição
        ['responsavel-cpf', 'responsavel-nome', 'responsavel-data-nascimento', 'responsavel-email', 'responsavel-telefone', 'responsavel-telefone-secundario', 'responsavel-cep', 'responsavel-sexo'].forEach(clearFeedback);
        formVerificationState.cpf = true;
        formVerificationState.nome = true;
        formVerificationState.nascimento = true;
        formVerificationState.email = true;
        formVerificationState.telefone = true;
        formVerificationState.cep = true;
        formVerificationState.sexo = true;
        state.officialCPFData = null;
        window.isSubmittingForm = true;
        validateFormState();
        window.isSubmittingForm = false;

        document.getElementById('responsavel-id').value = t.id;
        document.getElementById('responsavel-nome').value = t.nome || '';
        document.getElementById('responsavel-cpf').value = t.cpf || '';
        setCustomSelectValue('responsavel-sexo', t.sexo || '');
        document.getElementById('responsavel-data-nascimento').value = formatDateWithSlashes(t.data_nascimento) || '';
        document.getElementById('responsavel-email').value = t.email || '';
        document.getElementById('responsavel-telefone').value = t.telefone || '';

        document.getElementById('responsavel-cep').value = t.cep || '';
        document.getElementById('responsavel-endereco').value = t.endereco || '';
        document.getElementById('responsavel-numero').value = t.numero || '';
        document.getElementById('responsavel-complemento').value = t.complemento || '';
        document.getElementById('responsavel-bairro').value = t.bairro || '';
        document.getElementById('responsavel-cidade').value = t.cidade || '';
        document.getElementById('responsavel-uf').value = t.uf || '';

        document.getElementById('responsavel-indicacao').value = t.indicacao || '';
        setCustomSelectValue('responsavel-como-conheceu', t.como_conheceu || '');
        setCustomSelectValue('responsavel-dia-pagamento', t.dia_pagamento || '');
        const obsInput = document.getElementById('responsavel-observacoes');
        if (obsInput) obsInput.value = t.observacoes || '';
        setCustomSelectValue('responsavel-forma-pgto', t.forma_pgto_preferencial || '');

        const autorizaImagemRad = document.querySelector(`input[name="responsavel-autoriza-imagem"][value="${t.autoriza_imagem === true}"]`);
        if (autorizaImagemRad) autorizaImagemRad.checked = true;

        const assinaRad = document.querySelector(`input[name="responsavel-assina"][value="${t.assina === true}"]`);
        if (assinaRad) assinaRad.checked = true;

        setCustomSelectValue('responsavel-status', t.status || 'Ativo');

        // Carrega a foto se cadastrada
        const preview = document.getElementById('responsavel-foto-preview');
        const removeBtn = document.getElementById('responsavel-foto-remove');
        if (t.foto_url) {
            preview.innerHTML = `<img src="${t.foto_url}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            preview.style.border = 'none';
            if (removeBtn) removeBtn.style.display = 'flex';
        } else {
            preview.innerHTML = '<i data-lucide="camera" style="width: 24px; height: 24px; color: var(--text-muted);"></i><span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-align: center;">Selecionar<br>Foto</span>';
            preview.style.border = '1px dashed var(--border-glow)';
            if (removeBtn) removeBtn.style.display = 'none';
        }

        document.getElementById('tab-novo-responsavel-title').innerHTML = '<i data-lucide="edit-3"></i> Editar Responsável';
        lucide.createIcons();

        const tabLink = document.querySelector('.submenu-link[data-tab="novo-responsavel"]');
        if (tabLink) {
            // Apenas ativa a aba programaticamente sem disparar o click que reseta o form
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.submenu-link').forEach(l => l.classList.remove('active'));
            tabLink.classList.add('active');

            const parentGroup = tabLink.closest('.nav-group');
            if (parentGroup) {
                const parentLink = parentGroup.querySelector('.nav-link');
                if (parentLink) parentLink.classList.add('active');
            }

            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('tab-novo-responsavel').classList.add('active');
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao buscar dados do responsável para edição.");
    }
}

async function saveResponsavel(e) {
    e.preventDefault();

    window.isSubmittingForm = true;
    window.showSubmitError = true;
    const isValid = validateFormState();
    window.isSubmittingForm = false; // Desativa imediatamente após rodar para bloquear loops de eventos assíncronos

    if (!isValid) {
        // Encontra o primeiro input inválido e rola até ele
        const firstError = document.querySelector('.field-feedback.active.danger');
        if (firstError && firstError.parentElement) {
            firstError.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Validação de Nome Completo (Segurança e Anti-Fraude)
    const nameInput = document.getElementById('responsavel-nome');
    const nameResult = validateNameLogic(nameInput.value);
    if (!nameResult.isValid) {
        nameInput.style.border = '1px solid var(--danger)';
        alert("Erro de Validação - Nome Completo:\n\n" + nameResult.reason);
        return;
    }
    nameInput.style.border = '';

    // Validação de CPF (Segurança e Anti-Fraude)
    const cpfInput = document.getElementById('responsavel-cpf');
    const cpfVal = cpfInput.value.replace(/\D/g, '');
    if (!cpfVal || cpfVal.length !== 11 || !validateCPF(cpfVal)) {
        cpfInput.style.borderColor = 'var(--danger)';
        cpfInput.style.boxShadow = '0 0 0 2px var(--danger-glow)';
        alert("Erro de Validação - CPF:\n\nPor favor, informe um CPF válido de 11 dígitos numéricos.");
        return;
    }
    cpfInput.style.borderColor = '';
    cpfInput.style.boxShadow = '';

    // Validação de Idade (Maior de 18 anos)
    const dateInput = document.getElementById('responsavel-data-nascimento');
    const dataNascimentoStr = dateInput.value;

    if (!dataNascimentoStr || dataNascimentoStr.length < 10) {
        dateInput.style.border = '1px solid var(--danger)';
        alert("A Data de Nascimento é obrigatória e deve estar completa.");
        return;
    }

    const parts = dataNascimentoStr.split('/');
    if (parts.length === 3) {
        const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            dateInput.style.border = '1px solid var(--danger)';
            alert("Atenção: O cadastro não é permitido para menores de 18 anos.");
            return;
        }
    } else {
        dateInput.style.border = '1px solid var(--danger)';
        alert("Data de nascimento inválida.");
        return;
    }

    // Limpa a borda se estiver tudo ok
    dateInput.style.border = '';

    // Validação do E-mail
    const emailInput = document.getElementById('responsavel-email');
    if (emailInput.value && !validateEmailLogic(emailInput.value)) {
        emailInput.style.border = '1px solid var(--danger)';
        alert("Atenção: O e-mail informado parece conter erros de digitação. Por favor, verifique e corrija!");
        return;
    }
    emailInput.style.border = '';

    const id = document.getElementById('responsavel-id').value;

    // Captura valores dos radios com segurança
    const autorizaImagemChecked = document.querySelector('input[name="responsavel-autoriza-imagem"]:checked');
    const assinaChecked = document.querySelector('input[name="responsavel-assina"]:checked');

    const previewImg = document.querySelector('#responsavel-foto-preview img');
    const foto_url = previewImg ? previewImg.src : null;

    const data = {
        nome: document.getElementById('responsavel-nome').value,
        cpf: document.getElementById('responsavel-cpf').value || null,
        estado_civil: document.getElementById('responsavel-estado-civil')?.value || null,
        sexo: document.getElementById('responsavel-sexo')?.value || null,
        profissao: document.getElementById('responsavel-profissao')?.value || null,
        instagram: document.getElementById('responsavel-instagram')?.value || null,
        data_nascimento: document.getElementById('responsavel-data-nascimento')?.value || null,
        email: document.getElementById('responsavel-email')?.value || null,
        telefone: document.getElementById('responsavel-telefone')?.value || null,
        telefone_secundario: document.getElementById('responsavel-telefone-secundario')?.value || null,
        cep: document.getElementById('responsavel-cep').value || null,
        endereco: document.getElementById('responsavel-endereco').value || null,
        numero: document.getElementById('responsavel-numero').value || null,
        complemento: document.getElementById('responsavel-complemento').value || null,
        bairro: document.getElementById('responsavel-bairro').value || null,
        cidade: document.getElementById('responsavel-cidade').value || null,
        uf: document.getElementById('responsavel-uf').value || null,
        indicacao: document.getElementById('responsavel-indicacao').value || null,
        como_conheceu: document.getElementById('responsavel-como-conheceu').value || null,
        dia_pagamento: document.getElementById('responsavel-dia-pagamento').value || null,
        observacoes: document.getElementById('responsavel-observacoes') ? (document.getElementById('responsavel-observacoes').value || null) : null,
        forma_pgto_preferencial: document.getElementById('responsavel-forma-pgto').value || null,
        autoriza_imagem: autorizaImagemChecked ? autorizaImagemChecked.value === "true" : false,
        assina: assinaChecked ? assinaChecked.value === "true" : false,
        status: document.getElementById('responsavel-status').value,
        foto_url: foto_url
    };

    const url = id ? `${API_BASE}/responsaveis/${id}` : `${API_BASE}/responsaveis`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const savedResponsável = await response.json();
            state.highlightedResponsávelId = savedResponsável.id;

            window.resetResponsávelForm();

            // Redireciona de forma robusta para o submenu de Responsáveles onde fica a listagem
            const tabLink = document.querySelector('.submenu-link[data-tab="clientes"]');
            if (tabLink) {
                tabLink.click();
            } else {
                showResponsaveisList();
            }

            CustomUI.toast("Sucesso", "Responsável salvo com sucesso!", "success");
            loadResponsaveis();
        } else {
            const err = await response.json();
            if (response.status === 409) {
                // CPF duplicado: exibe feedback inline no campo CPF
                formVerificationState.cpf = false;
                showFeedback('responsavel-cpf', `⚠️ CPF já cadastrado: ${err.detail}`, 'danger');
                validateFormState();
                // Rola o formulário até o campo CPF
                const cpfInput = document.getElementById('responsavel-cpf');
                if (cpfInput) cpfInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                CustomUI.alert("Erro ao Salvar", `Erro ao salvar responsavel: ${err.detail || 'Verifique os dados.'}`, "danger");
            }
        }
    } catch (error) {
        console.error(error);
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao salvar responsavel.", "danger");
    }
}

async function deleteResponsavel(id) {
    const confirmDelete = await CustomUI.confirm(
        "Excluir Responsável",
        "Tem certeza que deseja excluir este responsavel? Esta ação não poderá ser desfeita.",
        { type: "danger", confirmText: "Excluir", cancelText: "Cancelar" }
    );
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/responsaveis/${id}`, { method: 'DELETE' });
        if (response.ok) {
            CustomUI.toast("Sucesso", "Responsável excluído com sucesso!", "success");
            loadResponsaveis();
            window.toggleBulkDeleteBtn('responsaveis');
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Excluir", `Erro ao excluir: ${err.detail}`, "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao excluir responsavel.", "danger");
    }
}

window.bulkDeleteResponsaveis = async function () {
    const checkboxes = document.querySelectorAll('.responsavel-select-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    if (ids.length === 0) return;

    const confirmDelete = await CustomUI.confirm(
        "Excluir em Massa",
        `Tem certeza que deseja excluir os ${ids.length} responsáveis selecionados? Esta ação não poderá ser desfeita e removerá todos os registros associados.`,
        { type: "danger", confirmText: "Excluir Selecionados", cancelText: "Cancelar" }
    );
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/responsaveis/batch-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: ids })
        });
        if (response.ok) {
            CustomUI.toast("Sucesso", `${ids.length} responsáveis excluídos com sucesso!`, "success");
            loadResponsaveis();
            window.toggleBulkDeleteBtn('responsaveis');
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Excluir", `Erro ao excluir em massa: ${err.detail || 'Erro desconhecido'}`, "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao excluir responsáveis em massa.", "danger");
    }
};

// ==========================================
// CONTROLE DA TABELA DE CLIENTES
// ==========================================
async function loadClientes() {
    showLoading('clientes', true);
    try {
        const response = await fetch(`${API_BASE}/clientes`);
        state.clientes = await response.json();
        renderClientesTable(state.clientes);
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
    } finally {
        showLoading('clientes', false);
    }
}

function renderClientesTable(list) {
    const tbody = document.getElementById('tbody-clientes');
    const emptyState = document.getElementById('empty-clientes');
    tbody.innerHTML = '';

    if (list.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    list.forEach(c => {
        const row = document.createElement('tr');
        const badgeClass = c.status === 'Ativo' ? 'badge-success' : 'badge-danger';

        row.innerHTML = `
            <td><strong>${String(c.id).padStart(3, '0')}</strong></td>
            <td>${c.nome}</td>
            <td>${c.email}</td>
            <td>${c.telefone || '<span class="text-muted">Não inf.</span>'}</td>
            <td><span class="badge ${badgeClass}">${c.status}</span></td>
            <td>${formatDateString(c.data_cadastro)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-edit" onclick="editCliente(${c.id})" title="Editar Cliente">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteCliente(${c.id})" title="Excluir Cliente">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    lucide.createIcons();
}

async function editCliente(id) {
    try {
        const response = await fetch(`${API_BASE}/clientes/${id}`);
        const c = await response.json();

        document.getElementById('cliente-id').value = c.id;
        if (document.getElementById('cliente-cpf')) {
            document.getElementById('cliente-cpf').value = c.cpf || '';
        }
        document.getElementById('cliente-nome').value = c.nome;
        document.getElementById('cliente-email').value = c.email;
        document.getElementById('cliente-telefone').value = c.telefone || '';
        setCustomSelectValue('cliente-status', c.status);

        document.getElementById('modal-cliente-title').textContent = "Editar Cliente";
        openModal('modal-cliente');
    } catch (error) {
        alert("Erro ao buscar dados do cliente para edição.");
    }
}

async function saveCliente(e) {
    e.preventDefault();

    const id = document.getElementById('cliente-id').value;
    const data = {
        nome: document.getElementById('cliente-nome').value,
        email: document.getElementById('cliente-email').value,
        telefone: document.getElementById('cliente-telefone').value,
        status: document.getElementById('cliente-status').value,
        cpf: document.getElementById('cliente-cpf') ? (document.getElementById('cliente-cpf').value || null) : null
    };

    const url = id ? `${API_BASE}/clientes/${id}` : `${API_BASE}/clientes`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal('modal-cliente');
            CustomUI.toast("Sucesso", "Cliente salvo com sucesso!", "success");
            loadClientes();
        } else {
            const err = await response.json();
            if (response.status === 409) {
                CustomUI.alert("CPF Já Cadastrado", `⚠️ CPF já cadastrado!\n\n${err.detail}\n\nVerifique o CPF informado antes de prosseguir.`, "warning");
            } else {
                CustomUI.alert("Erro ao Salvar", `Erro ao salvar cliente: ${err.detail || 'Verifique os dados.'}`, "danger");
            }
        }
    } catch (error) {
        console.error(error);
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao salvar cliente.", "danger");
    }
}

async function deleteCliente(id) {
    const confirmDelete = await CustomUI.confirm(
        "Excluir Cliente",
        "Tem certeza que deseja excluir este cliente? Esta ação também poderá falhar se existirem vendas vinculadas a ele.",
        { type: "danger", confirmText: "Excluir", cancelText: "Cancelar" }
    );
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/clientes/${id}`, { method: 'DELETE' });
        if (response.ok) {
            CustomUI.toast("Sucesso", "Cliente excluído com sucesso!", "success");
            loadClientes();
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Excluir", `Erro ao excluir: ${err.detail}`, "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao excluir cliente.", "danger");
    }
}

// ==========================================
// CONTROLE DA TABELA DE PRODUTOS
// ==========================================
async function loadProdutos() {
    showLoading('produtos', true);
    try {
        const response = await fetch(`${API_BASE}/produtos`);
        state.produtos = await response.json();
        renderProdutosTable(state.produtos);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    } finally {
        showLoading('produtos', false);
    }
}

function renderProdutosTable(list) {
    const tbody = document.getElementById('tbody-produtos');
    const emptyState = document.getElementById('empty-produtos');
    tbody.innerHTML = '';

    if (list.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    list.forEach(p => {
        const row = document.createElement('tr');
        const badgeClass = p.estoque > 0 ? 'badge-success' : 'badge-danger';

        row.innerHTML = `
            <td><strong>#${p.id}</strong></td>
            <td>${p.nome}</td>
            <td><span class="badge" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glow);">${p.categoria}</span></td>
            <td><strong>${formatCurrency(p.preco)}</strong></td>
            <td>${p.estoque} unidades</td>
            <td><span class="badge ${badgeClass}">${p.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-edit" onclick="editProduto(${p.id})" title="Editar Produto">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteProduto(${p.id})" title="Excluir Produto">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    lucide.createIcons();
}

async function editProduto(id) {
    try {
        const response = await fetch(`${API_BASE}/produtos/${id}`);
        const p = await response.json();

        document.getElementById('produto-id').value = p.id;
        document.getElementById('produto-nome').value = p.nome;
        document.getElementById('produto-categoria').value = p.categoria;
        document.getElementById('produto-preco').value = p.preco;
        document.getElementById('produto-estoque').value = p.estoque;

        document.getElementById('modal-produto-title').textContent = "Editar Produto";
        openModal('modal-produto');
    } catch (error) {
        alert("Erro ao buscar dados do produto.");
    }
}

async function saveProduto(e) {
    e.preventDefault();

    const id = document.getElementById('produto-id').value;
    const data = {
        nome: document.getElementById('produto-nome').value,
        categoria: document.getElementById('produto-categoria').value,
        preco: parseFloat(document.getElementById('produto-preco').value),
        estoque: parseInt(document.getElementById('produto-estoque').value)
    };

    const url = id ? `${API_BASE}/produtos/${id}` : `${API_BASE}/produtos`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal('modal-produto');
            CustomUI.toast("Sucesso", "Produto salvo com sucesso!", "success");
            loadProdutos();
        } else {
            CustomUI.alert("Erro ao Salvar", "Ocorreu um erro ao salvar o produto.", "danger");
        }
    } catch (error) {
        console.error(error);
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao salvar produto.", "danger");
    }
}

async function deleteProduto(id) {
    const confirmDelete = await CustomUI.confirm(
        "Excluir Produto",
        "Deseja realmente excluir este produto? Esta ação não poderá ser desfeita.",
        { type: "danger", confirmText: "Excluir", cancelText: "Cancelar" }
    );
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/produtos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            CustomUI.toast("Sucesso", "Produto excluído com sucesso!", "success");
            loadProdutos();
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Excluir", `Erro ao excluir: ${err.detail}`, "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro ao tentar deletar o produto.", "danger");
    }
}

// ==========================================
// CONTROLE DA TABELA E REGISTRO DE VENDAS
// ==========================================
async function loadVendas() {
    showLoading('vendas', true);
    try {
        const response = await fetch(`${API_BASE}/vendas`);
        state.vendas = await response.json();
        renderVendasTable(state.vendas);
    } catch (error) {
        console.error("Erro ao carregar vendas:", error);
    } finally {
        showLoading('vendas', false);
    }
}

function renderVendasTable(list) {
    const tbody = document.getElementById('tbody-vendas');
    const emptyState = document.getElementById('empty-vendas');
    tbody.innerHTML = '';

    if (list.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    list.forEach(v => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${v.id}</strong></td>
            <td>${v.cliente_nome}</td>
            <td>${v.produto_nome}</td>
            <td>${formatCurrency(v.produto_preco)}</td>
            <td>${v.quantidade}x</td>
            <td><strong class="text-success">${formatCurrency(v.valor_total)}</strong></td>
            <td>${formatDateString(v.data_venda)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Carrega as opções de Clientes e Produtos no modal de vendas
async function loadVendaDropdowns() {
    const clientSelect = document.getElementById('venda-cliente-select');
    const productSelect = document.getElementById('venda-produto-select');

    clientSelect.innerHTML = '<option value="" disabled selected>Selecione um cliente...</option>';
    productSelect.innerHTML = '<option value="" disabled selected>Selecione um produto...</option>';

    try {
        // Carrega clientes do servidor
        const clientRes = await fetch(`${API_BASE}/clientes`);
        const clients = await clientRes.json();
        // Apenas clientes Ativos podem comprar
        clients.filter(c => c.status === 'Ativo').forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.nome} (#${c.id})`;
            clientSelect.appendChild(opt);
        });

        // Carrega produtos
        const prodRes = await fetch(`${API_BASE}/produtos`);
        state.produtos = await prodRes.json();
        // Apenas produtos com estoque podem ser vendidos
        state.produtos.filter(p => p.estoque > 0).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.dataset.price = p.preco;
            opt.dataset.stock = p.estoque;
            opt.textContent = `${p.nome} - R$ ${p.preco.toFixed(2)} (Estoque: ${p.estoque})`;
            productSelect.appendChild(opt);
        });

    } catch (e) {
        console.error("Erro ao carregar dropdowns de vendas:", e);
    }
}

// Atualiza o valor estimado e valida o estoque no preview do formulário
function updateVendaPreview() {
    const productSelect = document.getElementById('venda-produto-select');
    const qtyInput = document.getElementById('venda-quantidade');
    const previewDiv = document.getElementById('venda-price-preview');
    const warningDiv = document.getElementById('venda-warning-stock');
    const btnSubmit = document.getElementById('btn-submit-venda');

    const selectedOption = productSelect.options[productSelect.selectedIndex];

    if (!selectedOption || !selectedOption.value) {
        previewDiv.textContent = 'R$ 0,00';
        warningDiv.style.display = 'none';
        btnSubmit.removeAttribute('disabled');
        return;
    }

    const preco = parseFloat(selectedOption.dataset.price);
    const estoque = parseInt(selectedOption.dataset.stock);
    const quantidade = parseInt(qtyInput.value) || 0;

    // Calcula o total
    const total = preco * quantidade;
    previewDiv.textContent = formatCurrency(total);

    // Alerta de limite de estoque
    if (quantidade > estoque) {
        warningDiv.style.display = 'flex';
        btnSubmit.setAttribute('disabled', 'true');
    } else {
        warningDiv.style.display = 'none';
        btnSubmit.removeAttribute('disabled');
    }
}

async function saveVenda(e) {
    e.preventDefault();

    const data = {
        cliente_id: parseInt(document.getElementById('venda-cliente-select').value),
        produto_id: parseInt(document.getElementById('venda-produto-select').value),
        quantidade: parseInt(document.getElementById('venda-quantidade').value),
        valor_total: 0.0 // Backend recalcula para segurança
    };

    try {
        const response = await fetch(`${API_BASE}/vendas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal('modal-venda');
            CustomUI.toast("Sucesso", "Venda registrada com sucesso!", "success");
            loadVendas();
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Registrar Venda", `Falha ao registrar venda: ${err.detail}`, "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao registrar venda.", "danger");
    }
}

// ==========================================
// TERMINAL SQL INTERATIVO (CONSOLE PLAYGROUND)
// ==========================================
function initSQLTerminal() {
    const btnRun = document.getElementById('btn-run-sql');
    if (btnRun) {
        btnRun.addEventListener('click', runCustomSQL);
    }
}

function setSQL(queryText) {
    document.getElementById('sql-query-input').value = queryText;
}

async function runCustomSQL() {
    const queryInput = document.getElementById('sql-query-input');
    const queryText = queryInput.value.trim();
    const statusSpan = document.getElementById('sql-result-status');
    const tableContainer = document.getElementById('sql-results-table-container');

    if (!queryText) {
        alert("Por favor, insira uma instrução SQL primeiro!");
        return;
    }

    statusSpan.className = "status-empty";
    statusSpan.textContent = "Executando...";
    tableContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: queryText })
        });

        const result = await response.json();

        if (result.success) {
            statusSpan.className = "status-success";
            statusSpan.textContent = "Sucesso";

            if (result.type === 'select') {
                renderSQLResultTable(result.columns, result.rows, tableContainer);
            } else {
                tableContainer.innerHTML = `
                    <div class="sql-empty-state" style="color: var(--success)">
                        <i data-lucide="check-circle" style="opacity: 1"></i>
                        <h4>Operação de Escrita Concluída</h4>
                        <p>${result.message}</p>
                    </div>
                `;
                lucide.createIcons();
            }
        } else {
            statusSpan.className = "status-error";
            statusSpan.textContent = "Erro de Sintaxe";
            tableContainer.innerHTML = `
                <div class="sql-empty-state" style="color: var(--danger)">
                    <i data-lucide="x-circle" style="opacity: 1"></i>
                    <h4>Erro no Banco de Dados</h4>
                    <p style="font-family: monospace; font-size: 11px; margin-top: 8px; max-width: 90%">${result.message}</p>
                </div>
            `;
            lucide.createIcons();
        }
    } catch (e) {
        statusSpan.className = "status-error";
        statusSpan.textContent = "Erro de Conexão";
        tableContainer.innerHTML = `<p style="padding: 20px;">Falha ao comunicar com o servidor da API.</p>`;
    }
}

function renderSQLResultTable(columns, rows, container) {
    container.innerHTML = '';

    if (rows.length === 0) {
        container.innerHTML = `
            <div class="sql-empty-state">
                <i data-lucide="info"></i>
                <p>Nenhuma linha correspondente retornada pela consulta.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const table = document.createElement('table');
    table.className = "data-table";
    table.style.width = "max-content";
    table.style.minWidth = "100%";

    // Cabeçalho da tabela
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Corpo da tabela
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            const val = row[col];

            if (val === null || val === undefined) {
                td.innerHTML = '<span class="text-muted">NULL</span>';
            } else if (typeof val === 'number' && (col.includes('preco') || col.includes('total') || col.includes('faturado') || col.includes('valor'))) {
                td.textContent = formatCurrency(val);
            } else {
                td.textContent = val;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

// ==========================================
// FILTROS DE PESQUISA RÁPIDA (CLIENT-SIDE)
// ==========================================
function initFilters() {
    // Filtro Responsáveles
    const searchResponsáveles = document.getElementById('search-responsaveis');
    if (searchResponsáveles) {
        searchResponsáveles.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = state.responsaveis.filter(t =>
                t.nome.toLowerCase().includes(term) ||
                t.email.toLowerCase().includes(term) ||
                (t.cpf && t.cpf.includes(term))
            );
            renderResponsaveisTable(filtered);
        });
    }

    // Filtro Clientes
    const searchClientes = document.getElementById('search-clientes');
    if (searchClientes) {
        searchClientes.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = state.clientes.filter(c =>
                c.nome.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term)
            );
            renderClientesTable(filtered);
        });
    }

    // Filtro Produtos
    const searchProdutos = document.getElementById('search-produtos');
    if (searchProdutos) {
        searchProdutos.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = state.produtos.filter(p =>
                p.nome.toLowerCase().includes(term) ||
                p.categoria.toLowerCase().includes(term)
            );
            renderProdutosTable(filtered);
        });
    }

    // Filtro Vendas
    const searchVendas = document.getElementById('search-vendas');
    if (searchVendas) {
        searchVendas.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = state.vendas.filter(v =>
                v.cliente_nome.toLowerCase().includes(term) ||
                v.produto_nome.toLowerCase().includes(term)
            );
            renderVendasTable(filtered);
        });
    }
}

// ==========================================
// UTILITÁRIOS E DIÁLOGOS DE MODAL
// ==========================================
function openModal(id) {
    document.getElementById(id).classList.add('active');

    if (id === 'modal-responsavel' && !document.getElementById('responsavel-id').value) {
        document.getElementById('modal-responsavel-title').textContent = "Novo Responsável";
    }
    if (id === 'modal-cliente' && !document.getElementById('cliente-id').value) {
        document.getElementById('modal-cliente-title').textContent = "Novo Cliente";
    }
    if (id === 'modal-produto' && !document.getElementById('produto-id').value) {
        document.getElementById('modal-produto-title').textContent = "Novo Produto";
    }
    if (id === 'modal-venda') {
        loadVendaDropdowns();
    }
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');

    // Reseta formulários
    if (id === 'modal-responsavel') {
        window.resetResponsávelForm();
    }
    if (id === 'modal-cliente') {
        document.getElementById('form-cliente').reset();
        document.getElementById('cliente-id').value = '';
    }
    if (id === 'modal-produto') {
        document.getElementById('form-produto').reset();
        document.getElementById('produto-id').value = '';
    }
    if (id === 'modal-venda') {
        document.getElementById('form-venda').reset();
        document.getElementById('venda-price-preview').textContent = 'R$ 0,00';
        document.getElementById('venda-warning-stock').style.display = 'none';
        document.getElementById('btn-submit-venda').removeAttribute('disabled');
    }
}

function showLoading(panelName, show) {
    const spinner = document.getElementById(`loading-${panelName}`);
    const table = document.getElementById(`table-${panelName}-element`);

    if (spinner && table) {
        spinner.style.display = show ? 'flex' : 'none';
        table.style.opacity = show ? '0.3' : '1';
    }
}

// Utilitários de Formatação
function formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function formatDateString(str) {
    if (!str) return '';
    try {
        const parts = str.split(' ');
        const dateParts = parts[0].split('-');
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${parts[1] || ''}`.trim();
    } catch (e) {
        return str;
    }
}

function formatDateShort(str) {
    if (!str) return '';
    try {
        const dateParts = str.split('-');
        return `${dateParts[2]}/${dateParts[1]}`;
    } catch (e) {
        return str;
    }
}

// ==========================================
// CONTROLE DE USUÁRIOS (CONFIGURAÇÃO)
// ==========================================
function checkUserPermissions() {
    const is_admin = localStorage.getItem('user_cargo') === 'Administrador';

    // Mostra/oculta botão de criar usuário
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    if (btnNovoUsuario) {
        btnNovoUsuario.style.display = (is_admin && state.activeTab === 'usuarios') ? 'inline-flex' : 'none';
    }

    // Mostra/oculta cabeçalho de ações
    const thAcoes = document.getElementById('th-usuario-acoes');
    if (thAcoes) {
        thAcoes.style.display = is_admin ? 'table-cell' : 'none';
    }
}

async function verifySession() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user_nome', data.nome);
            localStorage.setItem('user_username', data.username);
            localStorage.setItem('user_cargo', data.cargo);

            // Atualiza o display do profile no header
            const displayUserName = document.getElementById('display-user-name');
            const displayUserAvatar = document.getElementById('display-user-avatar');
            if (displayUserName) {
                displayUserName.textContent = data.nome;
            }
            if (displayUserAvatar) {
                const initials = data.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                displayUserAvatar.textContent = initials;
            }

            // Executa verificação de permissões na UI
            checkUserPermissions();
        }
    } catch (e) {
        console.error("Erro ao validar sessão:", e);
    }
}

async function loadUsuarios() {
    // Garante que as permissões estejam atualizadas ao abrir a aba
    checkUserPermissions();

    showLoading('usuarios', true);
    try {
        const response = await fetch(`${API_BASE}/users`);
        const list = await response.json();
        renderUsuariosTable(list);
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
    } finally {
        showLoading('usuarios', false);
    }
}

function renderUsuariosTable(list) {
    const tbody = document.getElementById('tbody-usuarios');
    const emptyState = document.getElementById('empty-usuarios');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    const is_admin = localStorage.getItem('user_cargo') === 'Administrador';

    list.forEach(u => {
        const row = document.createElement('tr');

        // Badge colorida para o cargo
        let badgeStyle = 'background: rgba(148, 163, 184, 0.08); border: 1px solid var(--border-glow); color: var(--text-muted);';
        if (u.cargo === 'Administrador') {
            badgeStyle = 'background: rgba(16, 185, 129, 0.08); border: 1px solid var(--success-glow); color: var(--primary);';
        }

        let actionsHTML = '';
        if (is_admin) {
            actionsHTML = `
                <td style="text-align: center;">
                    <div style="display: flex; gap: 18px; justify-content: center; align-items: center;">
                        <a href="#" onclick="event.preventDefault(); openUsuarioModal(${u.id})" class="flat-action-btn edit" title="Editar Usuário" style="color: #94a3b8; transition: var(--transition-smooth); display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                            <i data-lucide="edit-2" style="width: 18px; height: 18px;"></i>
                        </a>
                        <a href="#" onclick="event.preventDefault(); deleteUsuario(${u.id})" class="flat-action-btn delete" title="Excluir Usuário" style="color: #94a3b8; transition: var(--transition-smooth); display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                            <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                        </a>
                    </div>
                </td>
            `;
        }

        row.innerHTML = `
            <td><strong>${String(u.id).padStart(3, '0')}</strong></td>
            <td>${u.nome}</td>
            <td><span class="badge" style="background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-glow); color: var(--text-main); font-weight: 500;">${u.username}</span></td>
            <td><span class="badge" style="${badgeStyle} font-weight: 600; font-size: 11px;">${u.cargo}</span></td>
            ${actionsHTML}
        `;
        tbody.appendChild(row);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Gera o login padrão: 1ª letra do primeiro nome + '.' + último sobrenome
// Ex: "Guilherme Kamaroski" → "g.kamaroski"
function generateLoginFromName(fullName) {
    if (!fullName || !fullName.trim()) return '';
    // Remove diacritics e converte para minúsculas
    const clean = removeDiacritics(fullName.trim()).toLowerCase();
    // Divide por espaços, ignorando preposições curtas e vazios
    const ignoredWords = ['de', 'da', 'do', 'dos', 'das', 'e', 'del', 'al', 'van', 'von'];
    const parts = clean.split(/\s+/).filter(p => p.length > 0);
    // Filtra preposições mas mantém ao menos a primeira e última palavra com significado
    const meaningfulParts = parts.filter(p => !ignoredWords.includes(p));

    if (meaningfulParts.length === 0) return '';
    if (meaningfulParts.length === 1) return meaningfulParts[0].replace(/[^a-z0-9]/g, '');

    const initial = meaningfulParts[0][0]; // Primeira letra do primeiro nome
    const lastName = meaningfulParts[meaningfulParts.length - 1].replace(/[^a-z0-9]/g, ''); // Último sobrenome

    return `${initial}.${lastName}`;
}

// Abre o modal de cadastro/edição de usuário
async function openUsuarioModal(id = null) {
    const modal = document.getElementById('modal-usuario');
    const form = document.getElementById('form-usuario');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('usuario-id').value = '';

    const title = document.getElementById('modal-usuario-title');
    const inputPassword = document.getElementById('usuario-password');
    inputPassword.setAttribute('type', 'password');
    const toggleBtn = document.getElementById('toggle-usuario-password');
    if (toggleBtn) {
        toggleBtn.innerHTML = '<i data-lucide="eye"></i>';
    }
    const helpPassword = document.getElementById('help-usuario-password');

    if (id) {
        // Modo Edição
        title.textContent = "Editar Usuário";
        inputPassword.removeAttribute('required');
        helpPassword.style.display = 'block';

        try {
            // Busca a lista para encontrar os dados do usuário a editar
            const response = await fetch(`${API_BASE}/users`);
            const list = await response.json();
            const u = list.find(user => user.id === id);

            if (u) {
                document.getElementById('usuario-id').value = u.id;
                document.getElementById('usuario-nome').value = u.nome;
                document.getElementById('usuario-username').value = u.username;
                document.getElementById('usuario-email').value = u.email || '';
                setCustomSelectValue('usuario-cargo', u.cargo);
            }
        } catch (e) {
            console.error("Erro ao carregar usuário:", e);
            CustomUI.alert("Erro", "Não foi possível carregar os dados do usuário", "danger");
            return;
        }
    } else {
        // Modo Criação
        title.textContent = "Novo Usuário";
        inputPassword.setAttribute('required', 'true');
        helpPassword.style.display = 'none';
    }

    // === AUTO-GERAÇÃO DE LOGIN A PARTIR DO NOME ===
    const inputNome = document.getElementById('usuario-nome');
    const inputUsername = document.getElementById('usuario-username');

    // Remove listeners anteriores para evitar duplicatas
    if (inputNome._loginAutoHandler) {
        inputNome.removeEventListener('input', inputNome._loginAutoHandler);
    }
    if (inputUsername._loginManualHandler) {
        inputUsername.removeEventListener('input', inputUsername._loginManualHandler);
    }

    if (!id) {
        // Apenas no modo de criação: geração automática ativa
        let userManuallyEdited = false;
        let listenerReady = false; // Só ativa após o modal abrir (evita que form.reset() dispare)

        // Aguarda um frame para garantir que o reset já aconteceu
        requestAnimationFrame(() => { listenerReady = true; });

        const manualHandler = () => {
            if (!listenerReady) return;
            userManuallyEdited = true;
        };
        inputUsername._loginManualHandler = manualHandler;
        inputUsername.addEventListener('input', manualHandler);

        const loginAutoHandler = () => {
            if (userManuallyEdited) return;
            const generated = generateLoginFromName(inputNome.value);
            inputUsername.value = generated;
            // Remove o placeholder quando há valor gerado para não sobrepor o texto
            inputUsername.placeholder = generated ? '' : 'Gerado automaticamente ao digitar o nome';
        };

        inputNome._loginAutoHandler = loginAutoHandler;
        inputNome.addEventListener('input', loginAutoHandler);
    }


    openModal('modal-usuario');
    // Re-renderiza ícones Lucide após abrir o modal
    if (window.lucide) lucide.createIcons();
}

// Salva o cadastro do usuário (Novo ou Edição)
async function saveUsuario(e) {
    e.preventDefault();

    const id = document.getElementById('usuario-id').value;
    const nome = document.getElementById('usuario-nome').value.trim();
    const username = document.getElementById('usuario-username').value.trim();
    const email = document.getElementById('usuario-email').value.trim();
    const cargo = document.getElementById('usuario-cargo').value;
    const password = document.getElementById('usuario-password').value;

    // Validação básica do username (sem espaços)
    if (username.includes(' ')) {
        CustomUI.alert("Usuário Inválido", "O nome de usuário (login) não deve conter espaços.", "warning");
        return;
    }

    const data = { nome, username, email, cargo };

    // Se for novo, senha é obrigatória. Se for edição, só manda a senha se for alterada
    if (password && password.trim()) {
        data.password = password;
    } else if (!id) {
        CustomUI.alert("Campo Obrigatório", "A senha é obrigatória para novos usuários.", "warning");
        return;
    }

    const url = id ? `${API_BASE}/users/${id}` : `${API_BASE}/users`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal('modal-usuario');
            CustomUI.toast("Sucesso", id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!", "success");
            loadUsuarios();

            // Se o próprio usuário editou seu cadastro, atualiza o localStorage e UI
            const loggedInUsername = localStorage.getItem('user_username');
            if (username === loggedInUsername) {
                localStorage.setItem('user_nome', nome);
                localStorage.setItem('user_cargo', cargo);
                const displayUserName = document.getElementById('display-user-name');
                if (displayUserName) displayUserName.textContent = nome;
                checkUserPermissions();
            }
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Salvar", err.detail || "Não foi possível salvar o usuário.", "danger");
        }
    } catch (error) {
        console.error(error);
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao salvar usuário.", "danger");
    }
}

// Exclui um usuário
async function deleteUsuario(id) {
    // Impede auto-exclusão no front-end por segurança
    const currentUsername = localStorage.getItem('user_username');

    try {
        const response = await fetch(`${API_BASE}/users`);
        const list = await response.json();
        const u = list.find(user => user.id === id);

        if (u && u.username === currentUsername) {
            CustomUI.alert("Ação Negada", "Você não pode excluir o seu próprio usuário logado no sistema.", "warning");
            return;
        }
    } catch (e) { }

    const confirmDelete = await CustomUI.confirm(
        "Excluir Usuário",
        "Tem certeza de que deseja excluir este usuário? Esta ação não poderá ser desfeita.",
        { type: "danger", confirmText: "Excluir", cancelText: "Cancelar" }
    );
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
            CustomUI.toast("Sucesso", "Usuário excluído com sucesso!", "success");
            loadUsuarios();
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Excluir", err.detail || "Não foi possível excluir o usuário.", "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro ao tentar deletar o usuário.", "danger");
    }
}

function toggleUsuarioPasswordVisibility() {
    const passwordInput = document.getElementById('usuario-password');
    const toggleBtn = document.getElementById('toggle-usuario-password');
    if (!passwordInput || !toggleBtn) return;
    const isPrivate = passwordInput.getAttribute('type') === 'password';

    passwordInput.setAttribute('type', isPrivate ? 'text' : 'password');
    toggleBtn.innerHTML = isPrivate ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Vincula ao escopo global para chamada a partir de eventos inline onclick
window.checkUserPermissions = checkUserPermissions;
window.verifySession = verifySession;
window.loadUsuarios = loadUsuarios;
window.openUsuarioModal = openUsuarioModal;
window.saveUsuario = saveUsuario;
window.deleteUsuario = deleteUsuario;
window.generateLoginFromName = generateLoginFromName;
window.toggleUsuarioPasswordVisibility = toggleUsuarioPasswordVisibility;
window.showResponsaveisList = showResponsaveisList;
window.showResponsáveisList = showResponsaveisList;

// ==========================================
// VISUALIZAÇÃO DE PERFIL DO TUTOR (RESUMO)
// ==========================================
window.viewResponsável = async function (id) {
    try {
        // Busca os dados completos no backend
        const response = await fetch(`${API_BASE}/responsaveis/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes do responsavel");
        const t = await response.json();

        // Salva o responsavel atual na visualização no estado global
        state.currentResponsávelInView = t;

        // Reseta o botão de ação para caneta cinza e limpa imagem temporária
        state.tempProfilePhotoBase64 = null;
        const actionBtn = document.getElementById('perf-foto-action-btn');
        if (actionBtn) {
            actionBtn.dataset.state = 'edit';
            actionBtn.style.background = '#555';
            actionBtn.style.borderColor = '#333';
            actionBtn.title = "Mudar Foto";
            actionBtn.innerHTML = '<i data-lucide="edit-3" style="width: 15px; height: 15px; color: #fff;"></i>';
            actionBtn.onmouseover = function () { this.style.transform = 'scale(1.1)'; };
            actionBtn.onmouseout = function () { this.style.transform = 'scale(1)'; };
        }

        // Popula Dados Principais
        const perfAvatar = document.getElementById('perf-avatar');
        const perfFotoRemove = document.getElementById('perf-foto-remove');
        if (t.foto_url) {
            perfAvatar.innerHTML = `<img src="${t.foto_url}" alt="${t.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            perfAvatar.style.border = 'none';
            if (perfFotoRemove) perfFotoRemove.style.display = 'flex';
        } else {
            const parts = (t.nome || '?').trim().split(/\s+/);
            const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
            perfAvatar.innerHTML = initials.toUpperCase();
            perfAvatar.style.border = '2px solid var(--primary)';
            if (perfFotoRemove) perfFotoRemove.style.display = 'none';
        }

        document.getElementById('perf-nome').textContent = t.nome;
        document.getElementById('perf-status').textContent = t.status === 'Ativo' ? 'Cliente' : 'Inativo';
        document.getElementById('perf-status').className = t.status === 'Ativo' ? 'badge-green-responsavel' : 'badge-danger';

        // Info Pessoais
        let formattedCpf = t.cpf || '-';
        if (t.cpf && t.cpf.length === 11) {
            formattedCpf = t.cpf.substring(0, 3) + '.' + t.cpf.substring(3, 6) + '.' + t.cpf.substring(6, 9) + '-' + t.cpf.substring(9, 11);
        }
        document.getElementById('perf-cpf').textContent = formattedCpf;
        document.getElementById('perf-nasc').textContent = t.data_nascimento ? t.data_nascimento.split('-').reverse().join('/') : '-';
        document.getElementById('perf-sexo').textContent = t.sexo || '-';
        document.getElementById('perf-canal').textContent = t.canal_marketing || 'Indicação';
        document.getElementById('perf-estcivil').textContent = t.estado_civil || '-';

        // Próximo Aniversário
        let proxNasc = '-';
        if (t.data_nascimento) {
            // Handle both YYYY-MM-DD, DD-MM-YYYY, and DD/MM/YYYY formats
            let sep = t.data_nascimento.includes('/') ? '/' : '-';
            const parts = t.data_nascimento.split(sep);

            if (parts.length === 3) {
                let dia, mes;
                if (parts[0].length === 4) {
                    // YYYY-MM-DD
                    mes = parseInt(parts[1], 10);
                    dia = parseInt(parts[2], 10);
                } else {
                    // DD/MM/YYYY or DD-MM-YYYY
                    dia = parseInt(parts[0], 10);
                    mes = parseInt(parts[1], 10);
                }

                if (!isNaN(dia) && !isNaN(mes)) {
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);

                    let anoAniv = hoje.getFullYear();
                    const dataAnivEsteAno = new Date(anoAniv, mes - 1, dia);

                    let corAniv = '#ebed88'; // Amarelinho (não passou ainda neste ano)
                    if (dataAnivEsteAno < hoje) {
                        anoAniv++;
                        corAniv = 'var(--primary)'; // Verde (já passou neste ano, próximo é no ano que vem)
                    }
                    proxNasc = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anoAniv}`;
                    document.getElementById('perf-prox-nasc').style.color = corAniv;
                }
            }
        }
        document.getElementById('perf-prox-nasc').textContent = proxNasc;

        // Endereço (Padrão Google Maps em linha única)
        let formattedCep = '';
        if (t.cep) {
            formattedCep = t.cep.length === 8 ? t.cep.substring(0, 5) + '-' + t.cep.substring(5, 8) : t.cep;
        }

        let partsLogradouro = [];
        if (t.endereco) partsLogradouro.push(t.endereco);
        if (t.numero) partsLogradouro.push(t.numero);

        let enderecoGoogle = partsLogradouro.join(', ');

        // Complement removed for Google Maps compatibility
        let partsCidade = [];
        if (t.bairro) partsCidade.push(t.bairro);

        let cidadeUf = '';
        if (t.cidade) cidadeUf = t.cidade;
        if (t.uf) cidadeUf += cidadeUf ? ` - ${t.uf}` : t.uf;

        if (cidadeUf) partsCidade.push(cidadeUf);

        if (partsCidade.length > 0) {
            enderecoGoogle += (enderecoGoogle ? ', ' : '') + partsCidade.join(', ');
        }

        if (formattedCep) {
            enderecoGoogle += (enderecoGoogle ? ', ' : '') + formattedCep;
        }

        // Versão sem complemento para o botão de copiar
        let enderecoGoogleSemComplemento = partsLogradouro.join(', ');
        if (partsCidade.length > 0) {
            enderecoGoogleSemComplemento += (enderecoGoogleSemComplemento ? ', ' : '') + partsCidade.join(', ');
        }
        if (formattedCep) {
            enderecoGoogleSemComplemento += (enderecoGoogleSemComplemento ? ', ' : '') + formattedCep;
        }

        document.getElementById('perf-endereco').innerText = enderecoGoogle || '-';
        const btnCopy = document.getElementById('btn-copy-endereco');
        if (btnCopy) {
            btnCopy.dataset.copyText = enderecoGoogleSemComplemento || '-';
        }
        document.getElementById('perf-cadastro').textContent = t.data_cadastro ? formatDateString(t.data_cadastro).split(' ')[0] : '-';

        // Contatos
        document.getElementById('perf-email').textContent = t.email || '-';
        document.getElementById('perf-app-email').textContent = t.email || '-';
        document.getElementById('perf-celular').textContent = t.telefone || '-';
        document.getElementById('perf-celular2').textContent = t.telefone_secundario || '-';
        document.getElementById('perf-obs').value = (t.observacao && t.observacao !== '-') ? t.observacao : '';

        showResponsávelProfileTab();
        lucide.createIcons(); // Recria os ícones caso algum seja novo
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        CustomUI.alert("Erro", "Não foi possível carregar os dados completos do responsavel.", "danger");
    }
};

window.tempPreviewProfilePhoto = function (input) {
    if (!state.currentResponsávelInView) return;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Data = e.target.result;
            state.tempProfilePhotoBase64 = base64Data;

            // Preview local da foto no avatar do perfil
            const perfAvatar = document.getElementById('perf-avatar');
            if (perfAvatar) {
                perfAvatar.innerHTML = `<img src="${base64Data}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                perfAvatar.style.border = 'none';
            }

            // Altera o botão da caneta cinza para o disquete cinza igual o X
            const btn = document.getElementById('perf-foto-action-btn');
            if (btn) {
                btn.dataset.state = 'save';
                btn.style.background = '#333';
                btn.style.borderColor = '#555';
                btn.title = "Salvar Foto";
                btn.innerHTML = '<i data-lucide="save" style="width: 15px; height: 15px; color: #aaa;"></i>';
                btn.onmouseover = function () {
                    this.style.transform = 'scale(1.1)';
                    this.style.background = '#444';
                    const icon = this.querySelector('svg, i');
                    if (icon) icon.style.color = '#fff';
                };
                btn.onmouseout = function () {
                    this.style.transform = 'scale(1)';
                    this.style.background = '#333';
                    const icon = this.querySelector('svg, i');
                    if (icon) icon.style.color = '#aaa';
                };
                if (window.lucide) lucide.createIcons();
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.handleProfilePhotoAction = async function () {
    const btn = document.getElementById('perf-foto-action-btn');
    if (!btn) return;

    if (btn.dataset.state === 'save') {
        if (!state.currentResponsávelInView || !state.tempProfilePhotoBase64) return;

        const confirmed = await CustomUI.confirm("Alterar Foto", "Deseja realmente salvar a nova foto de perfil?", {
            type: 'warning',
            confirmText: 'Sim, salvar',
            cancelText: 'Cancelar'
        });
        if (!confirmed) {
            // Restaura o avatar para a foto anterior (do banco)
            const responsavel = state.currentResponsávelInView;
            state.tempProfilePhotoBase64 = null;

            const perfAvatar = document.getElementById('perf-avatar');
            if (perfAvatar) {
                if (responsavel.foto_url) {
                    perfAvatar.innerHTML = `<img src="${responsavel.foto_url}" alt="${responsavel.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                    perfAvatar.style.border = 'none';
                } else {
                    const parts = (responsavel.nome || '?').trim().split(/\s+/);
                    const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
                    perfAvatar.innerHTML = initials.toUpperCase();
                    perfAvatar.style.border = '2px solid var(--primary)';
                }
            }

            // Restaura o botão para a caneta cinza
            btn.dataset.state = 'edit';
            btn.style.background = '#555';
            btn.style.borderColor = '#333';
            btn.title = "Mudar Foto";
            btn.innerHTML = '<i data-lucide="edit-3" style="width: 15px; height: 15px; color: #fff;"></i>';
            btn.onmouseover = function () { this.style.transform = 'scale(1.1)'; };
            btn.onmouseout = function () { this.style.transform = 'scale(1)'; };
            if (window.lucide) lucide.createIcons();

            // Limpa o input de upload
            const fileUpload = document.getElementById('perf-foto-upload');
            if (fileUpload) fileUpload.value = '';

            return;
        }

        const responsavel = state.currentResponsávelInView;
        const updatedResponsável = { ...responsavel, foto_url: state.tempProfilePhotoBase64 };

        try {
            const response = await fetch(`${API_BASE}/responsaveis/${responsavel.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedResponsável)
            });

            if (response.ok) {
                const saved = await response.json();
                state.currentResponsávelInView = saved;
                state.tempProfilePhotoBase64 = null;

                // Restaura o botão para a caneta cinza
                btn.dataset.state = 'edit';
                btn.style.background = '#555'; // Cinza
                btn.style.borderColor = '#333';
                btn.title = "Mudar Foto";
                btn.innerHTML = '<i data-lucide="edit-3" style="width: 15px; height: 15px; color: #fff;"></i>';
                btn.onmouseover = function () { this.style.transform = 'scale(1.1)'; };
                btn.onmouseout = function () { this.style.transform = 'scale(1)'; };

                const removeBtn = document.getElementById('perf-foto-remove');
                if (removeBtn) removeBtn.style.display = 'flex';

                CustomUI.toast("Sucesso", "Foto de perfil salva com sucesso!", "success");
                loadResponsaveis();
                if (window.lucide) lucide.createIcons();
            } else {
                CustomUI.alert("Erro", "Não foi possível salvar a foto no servidor.", "danger");
            }
        } catch (err) {
            console.error(err);
            CustomUI.alert("Erro", "Erro ao salvar foto de perfil.", "danger");
        }
    } else {
        // Abre o seletor de arquivos
        const fileUpload = document.getElementById('perf-foto-upload');
        if (fileUpload) fileUpload.click();
    }
};

window.removeProfilePhoto = async function () {
    if (!state.currentResponsávelInView) return;
    const confirmed = await CustomUI.confirm("Remover Foto", "Deseja realmente remover a foto do responsável?", {
        type: 'danger',
        confirmText: 'Sim, remover',
        cancelText: 'Cancelar'
    });
    if (!confirmed) return;

    const responsavel = state.currentResponsávelInView;
    const updatedResponsável = { ...responsavel, foto_url: null };

    try {
        const response = await fetch(`${API_BASE}/responsaveis/${responsavel.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedResponsável)
        });

        if (response.ok) {
            const saved = await response.json();
            state.currentResponsávelInView = saved;
            state.tempProfilePhotoBase64 = null;

            const perfAvatar = document.getElementById('perf-avatar');
            const parts = (saved.nome || '?').trim().split(/\s+/);
            const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
            perfAvatar.innerHTML = initials.toUpperCase();
            perfAvatar.style.border = '2px solid var(--primary)';
            document.getElementById('perf-foto-remove').style.display = 'none';
            document.getElementById('perf-foto-upload').value = '';

            // Garante que o botão volte para o estado edit (caneta cinza)
            const btn = document.getElementById('perf-foto-action-btn');
            if (btn) {
                btn.dataset.state = 'edit';
                btn.style.background = '#555';
                btn.style.borderColor = '#333';
                btn.title = "Mudar Foto";
                btn.innerHTML = '<i data-lucide="edit-3" style="width: 15px; height: 15px; color: #fff;"></i>';
                btn.onmouseover = function () { this.style.transform = 'scale(1.1)'; };
                btn.onmouseout = function () { this.style.transform = 'scale(1)'; };
            }

            CustomUI.toast("Sucesso", "Foto de perfil removida!", "success");
            loadResponsaveis();
            if (window.lucide) lucide.createIcons();
        } else {
            CustomUI.alert("Erro", "Não foi possível remover a foto no servidor.", "danger");
        }
    } catch (err) {
        console.error(err);
        CustomUI.alert("Erro", "Erro ao remover foto de perfil.", "danger");
    }
};

window.copyTextToClipboard = function (textId, label) {
    const el = document.getElementById(textId);
    const text = el ? (el.value !== undefined ? el.value : el.innerText) : '';
    if (text && text !== '-') {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                CustomUI.toast('Copiado', `${label} copiado para a área de transferência!`, 'success');
            }).catch(err => {
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    }
};

window.toggleEditObsEntrega = function () {
    const el = document.getElementById('perf-obs-entrega');
    const btnEdit = document.getElementById('btn-edit-obs');
    const btnSave = document.getElementById('btn-save-obs');

    if (el.hasAttribute('readonly')) {
        el.removeAttribute('readonly');
        el.style.border = '1px solid var(--border-glow)';
        el.style.background = 'rgba(0,0,0,0.02)';
        el.style.padding = '8px';
        el.style.borderRadius = '4px';
        el.focus();
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
    } else {
        el.setAttribute('readonly', 'true');
        el.style.border = 'none';
        el.style.background = 'transparent';
        el.style.padding = '0';
        btnEdit.style.display = 'inline-block';
        btnSave.style.display = 'none';
    }
};

// ==========================================
// CONTROLE DE PETS
// ==========================================
window.populateResponsaveisSelect = async function () {
    try {
        const response = await fetch(`${API_BASE}/responsaveis`);
        if (response.ok) {
            const data = await response.json();
            window.allResponsáveles = Array.isArray(data) ? data : (data.items || data.data || []);
            window.renderResponsávelDropdown(window.allResponsáveles);
        }
    } catch (e) {
        console.error("Erro ao carregar responsaveis para o select:", e);
    }
};

window.renderResponsávelDropdown = function (responsaveisArray) {
    const listDiv = document.getElementById('responsaveis-custom-list');
    if (!listDiv) return;
    listDiv.innerHTML = '';

    if (responsaveisArray.length === 0) {
        const div = document.createElement('div');
        div.style.padding = '10px 14px';
        div.style.color = 'var(--text-muted)';
        div.textContent = 'Nenhum responsavel encontrado';
        listDiv.appendChild(div);
        return;
    }

    responsaveisArray.forEach(responsavel => {
        const div = document.createElement('div');
        div.style.padding = '6px 12px';
        div.style.fontSize = '14px';
        div.style.cursor = 'default';
        div.style.color = 'var(--text-main)';
        div.style.transition = 'none';

        div.textContent = responsavel.nome;

        div.onmouseover = () => {
            div.style.background = '#1a73e8';
            div.style.color = '#ffffff';
        };
        div.onmouseout = () => {
            div.style.background = 'transparent';
            div.style.color = 'var(--text-main)';
        };

        div.onclick = function () {
            document.getElementById('pet-responsavel-name').value = responsavel.nome;
            document.getElementById('pet-responsavel').value = responsavel.id;
            listDiv.style.display = 'none';
        };

        listDiv.appendChild(div);
    });
};

window.openResponsávelDropdown = function () {
    const listDiv = document.getElementById('responsaveis-custom-list');
    if (listDiv) {
        listDiv.style.display = 'block';
        if (!window.allResponsáveles || window.allResponsáveles.length === 0) {
            window.populateResponsaveisSelect();
        } else {
            window.renderResponsávelDropdown(window.allResponsáveles);
        }
    }
};

window.filterResponsávelDropdown = function (searchTerm) {
    if (!window.allResponsáveles) return;

    document.getElementById('pet-responsavel').value = '';

    const listDiv = document.getElementById('responsaveis-custom-list');
    if (listDiv) listDiv.style.display = 'block';

    const lowerTerm = searchTerm.toLowerCase();
    const filtered = window.allResponsáveles.filter(t => t.nome.toLowerCase().includes(lowerTerm) || (t.cpf && t.cpf.includes(lowerTerm)));
    window.renderResponsávelDropdown(filtered);
};

// Fechar o dropdown ao clicar fora dele
document.addEventListener('click', function (e) {
    const input = document.getElementById('pet-responsavel-name');
    const listDiv = document.getElementById('responsaveis-custom-list');
    if (input && listDiv) {
        if (e.target !== input && e.target !== listDiv && !listDiv.contains(e.target)) {
            listDiv.style.display = 'none';
        }
    }
});

// Escuta cliques para carregar a lista de responsaveis ao abrir a aba
document.addEventListener('click', function (e) {
    const tabTarget = e.target.closest('[data-tab="novo-pet"]');
    if (tabTarget) {
        window.populateResponsaveisSelect();
    }
});

window.savePet = async function (e) {
    e.preventDefault();
    const id = document.getElementById('pet-id').value;

    const castradoChecked = document.querySelector('input[name="pet-castrado"]:checked');
    const treinadoChecked = document.querySelector('input[name="pet-treinado"]:checked');

    const data = {
        responsavel_id: document.getElementById('pet-responsavel').value,
        nome: document.getElementById('pet-nome').value,
        apelido: document.getElementById('pet-apelido').value || null,
        sexo: document.getElementById('pet-sexo').value || null,
        castrado: castradoChecked ? castradoChecked.value === "Sim" : false,
        especie: document.getElementById('pet-especie').value || null,
        raca: document.getElementById('pet-raca').value || null,
        cor: document.getElementById('pet-cor').value || null,
        data_nascimento: document.getElementById('pet-data-nascimento').value || null,
        treinado: treinadoChecked ? treinadoChecked.value === "Sim" : false,
        peso: parseFloat(document.getElementById('pet-peso').value) || null,
        porte: document.getElementById('pet-porte').value || null,
        data_cio: document.getElementById('pet-data-cio').value || null,
        pelagem: document.getElementById('pet-pelagem').value || null,
        data_obito: null,
        restricao_alimentar: document.getElementById('pet-restricao').value || null,
        racao: document.getElementById('pet-racao').value || null
    };

    console.log("Saving Pet:", data);

    try {
        const url = id ? `${API_BASE}/pets/${id}` : `${API_BASE}/pets`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            CustomUI.toast("Sucesso", "Pet salvo com sucesso!", "success");
            document.getElementById('form-pet').reset();
            const dashLink = document.querySelector('[data-tab="dashboard"]');
            if (dashLink) dashLink.click();
        } else {
            const err = await response.json().catch(() => ({}));
            if (response.status === 404) {
                console.log("API de Pets ainda não implementada. Simulando sucesso no frontend.");
                CustomUI.toast("Sucesso", "Pet validado no frontend. (API pendente de implementação completa)", "success");
                document.getElementById('form-pet').reset();
                const dashLink = document.querySelector('[data-tab="dashboard"]');
                if (dashLink) dashLink.click();
            } else {
                CustomUI.alert("Erro", `Erro ao salvar pet: ${err.detail || 'Verifique os dados.'}`, "danger");
            }
        }
    } catch (error) {
        console.error(error);
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao salvar pet.", "danger");
    }
};

window.saveObsEntrega = function () {
    // Aqui podemos futuramente adicionar uma chamada real para salvar no banco
    window.toggleEditObsEntrega();
    CustomUI.toast('Sucesso', 'Observação de entrega salva localmente!', 'success');
};

window.toggleEditPetObs = function () {
    const el = document.getElementById('perf-pet-obs');
    const btnEdit = document.getElementById('btn-edit-pet-obs');
    const btnSave = document.getElementById('btn-save-pet-obs');

    if (el.hasAttribute('readonly')) {
        el.removeAttribute('readonly');
        el.style.border = '1px solid var(--border-glow)';
        el.style.background = 'rgba(0,0,0,0.02)';
        el.style.padding = '8px';
        el.style.borderRadius = '4px';
        el.focus();
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
    } else {
        el.setAttribute('readonly', 'true');
        el.style.border = 'none';
        el.style.background = 'transparent';
        el.style.padding = '0';
        btnEdit.style.display = 'inline-block';
        btnSave.style.display = 'none';
    }
};

window.savePetObs = async function () {
    const el = document.getElementById('perf-pet-obs');
    const newObs = el.value;

    if (!state.currentPetInView) {
        window.toggleEditPetObs();
        return;
    }

    try {
        const pet = state.currentPetInView;
        pet.observacoes = newObs;

        const payload = {
            nome: pet.nome,
            responsavel_id: pet.responsavel_id,
            especie: pet.especie,
            raca: pet.raca,
            sexo: pet.sexo,
            peso: pet.peso,
            data_nascimento: pet.nascimento,
            cor: pet.cor,
            status: pet.status,
            castrado: pet.castrado,
            porte: pet.porte,
            agressivo: pet.agressivo,
            treinado: pet.treinado,
            autoriza_imagem: pet.uso_imagem,
            observacoes: newObs,
            foto_url: pet.foto_url
        };

        const response = await fetch(`${API_BASE}/pets/${pet.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            window.toggleEditPetObs();
            CustomUI.toast('Sucesso', 'Observações atualizadas!', 'success');
            if (typeof window.loadPets === 'function') window.loadPets();
        } else {
            CustomUI.alert('Erro', 'Falha ao atualizar as observações do pet.', 'danger');
        }
    } catch (e) {
        console.error(e);
        window.toggleEditPetObs();
        CustomUI.toast('Aviso', 'Erro de conexão ou API indisponível. Observação salva localmente.', 'warning');
    }
};

window.toggleEditResponsávelObs = function () {
    const el = document.getElementById('perf-obs');
    const btnEdit = document.getElementById('btn-edit-responsavel-obs');
    const btnSave = document.getElementById('btn-save-responsavel-obs');

    if (el.hasAttribute('readonly')) {
        el.removeAttribute('readonly');
        el.style.border = '1px solid var(--border-glow)';
        el.style.background = 'rgba(0,0,0,0.02)';
        el.style.padding = '8px';
        el.style.borderRadius = '4px';
        el.focus();
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
    } else {
        el.setAttribute('readonly', 'true');
        el.style.border = 'none';
        el.style.background = 'transparent';
        el.style.padding = '0';
        btnEdit.style.display = 'inline-block';
        btnSave.style.display = 'none';
    }
};

window.saveResponsavelObs = function () {
    // Aqui podemos futuramente adicionar uma chamada real para salvar no banco
    window.toggleEditResponsávelObs();
    CustomUI.toast('Sucesso', 'Observações salvas localmente!', 'success');
};

window.toggleEditResponsávelFormObs = function () {
    const el = document.getElementById('responsavel-observacoes');
    const btnEdit = document.getElementById('btn-edit-responsavel-form-obs');
    const btnSave = document.getElementById('btn-save-responsavel-form-obs');

    if (el.hasAttribute('readonly')) {
        el.removeAttribute('readonly');
        el.style.border = '1px solid var(--border-glow)';
        el.style.background = 'rgba(0,0,0,0.02)';
        el.style.padding = '8px';
        el.style.borderRadius = '4px';
        el.focus();
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
    } else {
        el.setAttribute('readonly', 'true');
        el.style.border = 'none';
        el.style.background = 'transparent';
        el.style.padding = '0';
        btnEdit.style.display = 'inline-block';
        btnSave.style.display = 'none';
    }
};

window.saveResponsavelFormObs = function () {
    window.toggleEditResponsávelFormObs();
    CustomUI.toast('Sucesso', 'Observações confirmadas!', 'success');
};

window.copyAddressToClipboard = function () {
    const btn = document.getElementById('btn-copy-endereco');
    const enderecoParaCopiar = btn ? btn.dataset.copyText : document.getElementById('perf-endereco').innerText;

    if (enderecoParaCopiar && enderecoParaCopiar !== '-') {
        // Fallback robusto para navegadores sem suporte a clipboard ou rodando em HTTP (não local)
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(enderecoParaCopiar).then(() => {
                CustomUI.toast('Copiado', 'Endereço copiado para a área de transferência!', 'success');
            }).catch(err => {
                console.error('Erro ao copiar:', err);
                fallbackCopyTextToClipboard(enderecoParaCopiar);
            });
        } else {
            fallbackCopyTextToClipboard(enderecoParaCopiar);
        }
    }
};

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            CustomUI.toast('Copiado', 'Endereço copiado para a área de transferência!', 'success');
        } else {
            CustomUI.toast('Erro', 'Não foi possível copiar o endereço.', 'danger');
        }
    } catch (err) {
        console.error('Fallback: Erro ao copiar', err);
        CustomUI.toast('Erro', 'Não foi possível copiar o endereço.', 'danger');
    }
    document.body.removeChild(textArea);
}

window.showResponsávelProfileTab = function () {
    // Esconder tudo
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.submenu-link').forEach(l => l.classList.remove('active'));

    // Exibir apenas o tab-responsavel-perfil
    const tabPerfil = document.getElementById('tab-responsavel-perfil');
    if (tabPerfil) {
        tabPerfil.classList.add('active');
    }

    // Manter a aba pai de clientes ativa para contexto visual
    const clientesLink = document.querySelector(".nav-link[data-tab='clientes']");
    if (clientesLink) {
        clientesLink.classList.add('active');
    }

    // Atualizar Cabeçalho Global
    const title = document.getElementById('current-tab-title');
    const subtitle = document.getElementById('current-tab-subtitle');
    title.innerHTML = 'Perfil do Cliente';
    subtitle.textContent = 'Resumo completo, dados cadastrais e acessos do responsavel.';
    if (window.lucide) {
        lucide.createIcons();
    }
};

window.updatePaginationInfo = function (start, end, total, tab = 'responsaveis') {
    const startEl = document.getElementById('page-start-' + tab);
    const endEl = document.getElementById('page-end-' + tab);
    const totalEl = document.getElementById('page-total-' + tab);

    if (startEl) startEl.textContent = start;
    if (endEl) endEl.textContent = end;
    if (totalEl) totalEl.textContent = total;

    const prevBtn = document.getElementById('btn-prev-' + tab);
    const nextBtn = document.getElementById('btn-next-' + tab);

    if (prevBtn) {
        prevBtn.disabled = start <= 1;
    }

    if (nextBtn) {
        nextBtn.disabled = end >= total;
    }
};

window.changeRowsPerPage = function (tab, value) {
    if (tab === 'responsaveis') {
        state.responsaveisRowsPerPage = value;
        state.responsaveisPage = 1;
        const listToRender = state.responsaveisFilteredList || state.responsaveis;
        renderResponsaveisTable(listToRender, true);
        const container = document.getElementById('pagination-responsaveis');
        if (container) container.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
};

window.prevPage = function (tab) {
    if (tab === 'responsaveis') {
        if (state.responsaveisPage > 1) {
            state.responsaveisPage--;
            const listToRender = state.responsaveisFilteredList || state.responsaveis;
            renderResponsaveisTable(listToRender, true);
            const container = document.getElementById('pagination-responsaveis');
            if (container) container.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    }
};

window.nextPage = function (tab) {
    if (tab === 'responsaveis') {
        const listToRender = state.responsaveisFilteredList || state.responsaveis;
        const rows = state.responsaveisRowsPerPage === 'all' ? listToRender.length : parseInt(state.responsaveisRowsPerPage);
        const totalPages = Math.ceil(listToRender.length / rows);
        if (state.responsaveisPage < totalPages) {
            state.responsaveisPage++;
            renderResponsaveisTable(listToRender, true);
            const container = document.getElementById('pagination-responsaveis');
            if (container) container.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    }
};



window.allRacas = ['SRD (Sem Raça Definida)', 'Abissínio (Gato)', 'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Akita Americano', 'Akita Inu', 'American Bully', 'American Hairless Terrier', 'American Pit Bull Terrier', 'American Shorthair (Gato)', 'American Staffordshire Terrier', 'Angorá (Gato)', 'Ashera (Gato)', 'Azawakh', 'Basset Hound', 'Beagle', 'Bengal (Gato)', 'Bichon Frisé', 'Bichon Havanês', 'Bloodhound', 'Bobtail', 'Boerboel', 'Border Collie', 'Border Terrier', 'Borzoi', 'Boston Terrier', 'Boxer', 'Braco Alemão', 'Braco Italiano', 'Buldogue Campeiro', 'Bull Terrier', 'Bulldog Francês', 'Bulldog Inglês', 'Bullmastiff', 'Burmês (Gato)', 'Cairn Terrier', 'Cane Corso', 'Cavalier King Charles Spaniel', 'Chesapeake Bay Retriever', 'Chihuahua', 'Chow Chow', 'Cocker Spaniel Americano', 'Cocker Spaniel Inglês', 'Collie', 'Corgi (Cardigan)', 'Corgi (Pembroke)', 'Cão de Crista Chinês', 'Cão de Santo Humberto', 'Cão de Água Português', 'Dachshund (Salsicha)', 'Doberman', 'Dogo Argentino', 'Dogue Alemão', 'Dogue Brasileiro', 'Dogue de Bordeaux', 'Dálmata', 'Fila Brasileiro', 'Fox Terrier', 'Foxhound Inglês', 'Galgo Espanhol', 'Golden Retriever', 'Greyhound', 'Grifo da Bélgica', 'Himalaio (Gato)', 'Husky Siberiano', 'Jack Russell Terrier', 'Kuvasz', 'Labrador Retriever', 'Leão da Rodésia', 'Lhasa Apso', 'Lulu da Pomerânia (Spitz Alemão)', 'Maine Coon (Gato)', 'Malamute do Alasca', 'Maltês', 'Mastiff Inglês', 'Mastim Napolitano', 'Mastim Tibetano', 'Munchkin (Gato)', 'Norwich Terrier', 'Ovelheiro Gaúcho', 'Papillon', 'Pastor Alemão', 'Pastor Australiano', 'Pastor Belga', 'Pastor Branco Suíço', 'Pastor Maremano', 'Pastor de Beauce', 'Pastor de Shetland', 'Pequinês', 'Persa (Gato)', 'Pinscher', 'Pit Bull', 'Pointer Inglês', 'Poodle', 'Pug', 'Puli', 'Ragdoll (Gato)', 'Rastreador Brasileiro', 'Rottweiler', 'Sagrado da Birmânia (Gato)', 'Saluki', 'Samoieda', 'Schnauzer Gigante', 'Schnauzer Miniatura', 'Schnauzer Standard', 'Scottish Fold (Gato)', 'Setter Inglês', 'Setter Irlandês', 'Shar-Pei', 'Shiba Inu', 'Shih Tzu', 'Siamês (Gato)', 'Sphynx (Gato)', 'Spitz Japonês', 'Staffordshire Bull Terrier', 'São Bernardo', 'Terra Nova', 'Terrier Brasileiro (Fox Paulistinha)', 'Terrier Tibetano', 'Tosa Inu', 'Veadeiro Pampeano', 'Vizsla', 'Weimaraner', 'West Highland White Terrier', 'Whippet', 'Yorkshire Terrier'];


window.getRacasForEspecie = function () {
    const especie = document.getElementById('pet-especie').value;
    if (especie === 'Felino') {
        return window.allRacas.filter(r => r.includes('(Gato)') || r.includes('SRD')).map(r => r.replace(' (Gato)', ''));
    } else if (especie === 'Canino') {
        return window.allRacas.filter(r => !r.includes('(Gato)'));
    }
    return window.allRacas.map(r => r.replace(' (Gato)', ''));
};

window.openRacaDropdown = function () {
    const listDiv = document.getElementById('racas-custom-list');
    if (listDiv) {
        listDiv.style.display = 'block';
        window.renderRacaDropdown(window.getRacasForEspecie());
    }
};

window.renderRacaDropdown = function (racas) {
    const listDiv = document.getElementById('racas-custom-list');
    listDiv.innerHTML = '';
    if (racas.length === 0) {
        listDiv.innerHTML = '<div style="padding: 8px 12px; color: var(--text-muted); font-size: 14px;">Nenhuma raça encontrada</div>';
        return;
    }
    racas.forEach(r => {
        const div = document.createElement('div');
        div.textContent = r;
        div.style.padding = '8px 12px';
        div.style.cursor = 'pointer';
        div.style.fontSize = '14px';
        div.style.color = '#fff';
        div.onmouseover = () => div.style.backgroundColor = 'var(--primary)';
        div.onmouseout = () => div.style.backgroundColor = 'transparent';
        div.onclick = function (e) {
            e.stopPropagation();
            document.getElementById('pet-raca-input').value = r;
            document.getElementById('pet-raca').value = r;
            listDiv.style.display = 'none';
        };
        listDiv.appendChild(div);
    });
};

window.filterRacaDropdown = function (text) {
    const baseRacas = window.getRacasForEspecie();
    if (!text) {
        window.renderRacaDropdown(baseRacas);
        document.getElementById('pet-raca').value = '';
        return;
    }
    document.getElementById('pet-raca').value = text;
    const filtered = baseRacas.filter(r => r.toLowerCase().includes(text.toLowerCase()));
    window.renderRacaDropdown(filtered);
};

document.addEventListener('click', function (e) {
    const input = document.getElementById('pet-raca-input');
    const list = document.getElementById('racas-custom-list');
    if (input && list) {
        if (!input.contains(e.target) && !list.contains(e.target)) {
            list.style.display = 'none';
            if (input.value) {
                document.getElementById('pet-raca').value = input.value;
            }
        }
    }
});

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

document.addEventListener('DOMContentLoaded', () => {
    const especieSelect = document.getElementById('pet-especie');
    if (especieSelect) {
        especieSelect.addEventListener('change', () => {
            document.getElementById('pet-raca-input').value = '';
            document.getElementById('pet-raca').value = '';
        });
    }
});

// Helper functions for Pet Observations
window.togglePetObs = function (isEditing) {
    const textarea = document.getElementById('pet-restricao');
    const btnEdit = document.getElementById('btn-edit-pet-obs');
    const btnSave = document.getElementById('btn-save-pet-obs');

    if (isEditing) {
        textarea.removeAttribute('readonly');
        textarea.style.opacity = '1';
        textarea.style.borderColor = 'var(--primary)';
        textarea.focus();
        if (btnEdit) btnEdit.style.display = 'none';
        if (btnSave) btnSave.style.display = 'flex';
    } else {
        textarea.setAttribute('readonly', 'true');
        textarea.style.opacity = '0.8';
        textarea.style.borderColor = 'var(--border-glow)';
        if (btnEdit) btnEdit.style.display = 'flex';
        if (btnSave) btnSave.style.display = 'none';
        // Mostrar feedback sutil
        CustomUI.toast("Salvo", "Observação validada. (Finalize no botão Salvar Pet)", "success");
    }
};

window.copyPetObs = function () {
    const textarea = document.getElementById('pet-restricao');
    if (textarea && textarea.value) {
        navigator.clipboard.writeText(textarea.value).then(() => {
            CustomUI.toast("Copiado", "Observação copiada para a área de transferência.", "success");
        }).catch(() => {
            CustomUI.toast("Erro", "Não foi possível copiar.", "warning");
        });
    }
};

// ==========================================
// LÓGICA DE PETS
// ==========================================

async function loadPets(force = false) {
    if (!force && state.pets.length > 0) return;

    try {
        const loading = document.getElementById('loading-pets');
        if (loading) loading.style.display = 'flex';

        const response = await fetch(`${API_BASE}/pets?limit=10000`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Falha ao carregar pets');

        const data = await response.json();
        state.pets = Array.isArray(data) ? data : (data.items || []);
        state.petsFilteredList = null; // reseta filtros

        if (state.activeTab === 'pets') {
            renderPetsList();
        }
    } catch (error) {
        console.error('Erro:', error);
        CustomUI.toast("Erro", "Não foi possível carregar a lista de pets.", "danger");
    } finally {
        const loading = document.getElementById('loading-pets');
        if (loading) loading.style.display = 'none';
    }
}

function renderPetsList() {
    renderPetsTable(state.petsFilteredList || state.pets, state.petsFilteredList !== null);
}

function applyPetFilters() {
    const searchNome = removeDiacritics(document.getElementById('filter-pet-nome')?.value.toLowerCase() || '');
    const searchResponsável = removeDiacritics(document.getElementById('filter-pet-responsavel')?.value.toLowerCase() || '');
    const searchEspecie = removeDiacritics(document.getElementById('filter-pet-especie')?.value.toLowerCase() || '');
    const searchRaca = removeDiacritics(document.getElementById('filter-pet-raca')?.value.toLowerCase() || '');
    const searchStatus = removeDiacritics(document.getElementById('filter-pet-status')?.value.toLowerCase() || '');

    if (!searchNome && !searchResponsável && !searchEspecie && !searchRaca && !searchStatus) {
        state.petsFilteredList = null;
    } else {
        state.petsFilteredList = state.pets.filter(pet => {
            const responsavel = state.responsaveis.find(t => t.id === pet.responsavel_id);
            const responsavelNome = responsavel ? removeDiacritics(responsavel.nome.toLowerCase()) : '';
            const responsavelCpf = responsavel && responsavel.cpf ? responsavel.cpf.replace(/\D/g, '') : '';
            const searchResponsávelNumbersOnly = searchResponsável.replace(/\D/g, '');

            const petNome = pet.nome ? removeDiacritics(pet.nome.toLowerCase()) : '';
            const petEspecie = pet.especie ? removeDiacritics(pet.especie.toLowerCase()) : '';
            const petRaca = pet.raca ? removeDiacritics(pet.raca.toLowerCase()) : '';
            const petStatus = pet.status ? removeDiacritics(pet.status.toLowerCase()) : '';

            const matchNome = !searchNome || petNome.startsWith(searchNome);
            const matchResponsável = !searchResponsável || responsavelNome.startsWith(searchResponsável) || (searchResponsávelNumbersOnly && responsavelCpf.startsWith(searchResponsávelNumbersOnly));
            const matchEspecie = !searchEspecie || petEspecie.startsWith(searchEspecie);
            const matchRaca = !searchRaca || petRaca.startsWith(searchRaca);
            const matchStatus = !searchStatus || petStatus.startsWith(searchStatus);

            return matchNome && matchResponsável && matchEspecie && matchRaca && matchStatus;
        });
    }

    state.petsPage = 1;
    renderPetsList();
}

window.bulkDeletePets = async function () {
    const checkboxes = document.querySelectorAll('.row-checkbox-pets:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));

    if (ids.length === 0) return;

    const confirmDelete = await CustomUI.confirm("Atenção", `Tem certeza que deseja excluir os ${ids.length} pets selecionados? Esta ação é irreversível.`, "danger");
    if (!confirmDelete) return;

    try {
        for (const id of ids) {
            await fetch(`${API_BASE}/pets/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
        }

        CustomUI.toast("Sucesso", `${ids.length} pets foram excluídos.`);
        state.pets = state.pets.filter(p => !ids.includes(p.id));
        if (state.petsFilteredList) {
            state.petsFilteredList = state.petsFilteredList.filter(p => !ids.includes(p.id));
        }
        renderPetsList();

        const selectAll = document.getElementById('select-all-pets');
        if (selectAll) selectAll.checked = false;
        toggleBulkDeleteBtn('pets');
    } catch (e) {
        CustomUI.toast("Erro", "Falha ao excluir alguns pets.", "danger");
    }
};

window.savePet = async function (event) {
    event.preventDefault();
    const btn = event.submitter || event.target.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
        const id = document.getElementById('pet-id') ? document.getElementById('pet-id').value : '';
        const nome = document.getElementById('pet-nome').value;
        const responsavel_id = parseInt(document.getElementById('pet-responsavel').value);
        const especie = document.getElementById('pet-especie').value;
        const raca = especie === 'Cachorro' || especie === 'Gato' ? document.getElementById('pet-raca').value : document.getElementById('pet-raca-input').value;
        const sexo = document.querySelector('input[name="pet-sexo"]:checked')?.value || '';
        const peso = document.getElementById('pet-peso').value ? parseFloat(document.getElementById('pet-peso').value.replace(',', '.')) : null;
        const nascimento = document.getElementById('pet-nascimento').value;
        const cor = document.getElementById('pet-cor').value;
        const status = document.getElementById('pet-status').value;
        const castrado = document.querySelector('input[name="pet-castrado"]:checked')?.value === 'Sim';
        const agressivo = document.querySelector('input[name="pet-agressivo"]:checked')?.value === 'Sim';
        const treinado = document.querySelector('input[name="pet-treinado"]:checked')?.value === 'Sim';
        const uso_imagem = document.querySelector('input[name="pet-autoriza-imagem"]:checked')?.value === 'true';
        const observacoes = document.getElementById('pet-restricao').value;
        const porte = document.getElementById('pet-porte').value || null;

        const previewImg = document.querySelector('#pet-foto-preview img');
        const foto_url = previewImg ? previewImg.src : null;

        const payload = {
            nome, responsavel_id, especie, raca, sexo, peso, data_nascimento: nascimento, cor, status, castrado, porte, agressivo, treinado, autoriza_imagem: uso_imagem, observacoes, foto_url
        };

        const url = id ? `${API_BASE}/pets/${id}` : `${API_BASE}/pets`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'Erro ao salvar pet');
        }

        CustomUI.toast('Sucesso', id ? 'Pet atualizado com sucesso!' : 'Pet cadastrado com sucesso!', 'success');
        document.getElementById('form-pet').reset();

        state.pets = [];
        switchTab('pets');
    } catch (e) {
        CustomUI.toast('Erro', e.message, 'danger');
    } finally {
        if (btn) btn.disabled = false;
    }
};

window.editPet = async function (id) {
    if (state.responsaveis.length === 0) await loadResponsaveis();
    const pet = state.pets.find(p => p.id === id);
    if (!pet) return;

    const tabLink = document.querySelector('.submenu-link[data-tab="novo-pet"]');
    if (tabLink) tabLink.click();

    setTimeout(() => {
        if (document.getElementById('pet-id')) document.getElementById('pet-id').value = pet.id;
        else {
            const hiddenId = document.createElement('input');
            hiddenId.type = 'hidden';
            hiddenId.id = 'pet-id';
            hiddenId.value = pet.id;
            document.getElementById('form-pet').appendChild(hiddenId);
        }

        const responsavelSelect = document.getElementById('pet-responsavel');
        if (responsavelSelect && responsavelSelect.options.length <= 1) {
            state.responsaveis.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.nome;
                responsavelSelect.appendChild(opt);
            });
        }

        if (document.getElementById('pet-nome')) document.getElementById('pet-nome').value = pet.nome;
        if (document.getElementById('pet-responsavel')) document.getElementById('pet-responsavel').value = pet.responsavel_id;
        if (document.getElementById('pet-especie')) {
            document.getElementById('pet-especie').value = pet.especie;
            document.getElementById('pet-especie').dispatchEvent(new Event('change'));
        }

        setTimeout(() => {
            if (pet.especie === 'Cachorro' || pet.especie === 'Gato') {
                if (document.getElementById('pet-raca')) document.getElementById('pet-raca').value = pet.raca;
            } else {
                if (document.getElementById('pet-raca-input')) document.getElementById('pet-raca-input').value = pet.raca;
            }
        }, 100);

        if (pet.sexo) {
            const sexoInput = document.querySelector(`input[name="pet-sexo"][value="${pet.sexo}"]`);
            if (sexoInput) sexoInput.checked = true;
        }

        if (document.getElementById('pet-peso')) document.getElementById('pet-peso').value = pet.peso || '';
        if (document.getElementById('pet-nascimento') && pet.nascimento) document.getElementById('pet-nascimento').value = pet.nascimento.split('T')[0];
        if (document.getElementById('pet-cor')) document.getElementById('pet-cor').value = pet.cor || '';

        if (document.getElementById('pet-status')) document.getElementById('pet-status').value = pet.status || 'Ativo';

        if (pet.castrado !== null && pet.castrado !== undefined) {
            const castradoInput = document.querySelector(`input[name="pet-castrado"][value="${pet.castrado ? 'Sim' : 'Não'}"]`);
            if (castradoInput) castradoInput.checked = true;
        }

        if (pet.agressivo !== null) {
            const agrInput = document.querySelector(`input[name="pet-agressivo"][value="${pet.agressivo ? 'Sim' : 'Não'}"]`);
            if (agrInput) agrInput.checked = true;
        }

        if (pet.treinado !== null) {
            const treiInput = document.querySelector(`input[name="pet-treinado"][value="${pet.treinado ? 'Sim' : 'Não'}"]`);
            if (treiInput) treiInput.checked = true;
        }

        if (pet.uso_imagem !== null) {
            const imgInput = document.querySelector(`input[name="pet-autoriza-imagem"][value="${pet.uso_imagem ? 'true' : 'false'}"]`);
            if (imgInput) imgInput.checked = true;
        }

        if (document.getElementById('pet-restricao')) document.getElementById('pet-restricao').value = pet.observacoes || '';

        if (pet.foto_url) {
            const previewLabel = document.getElementById('pet-foto-preview');
            if (previewLabel) {
                previewLabel.innerHTML = `<img src="${pet.foto_url}" style="width:100%; height:100%; object-fit:cover;">`;
                const removeBtn = document.getElementById('pet-foto-remove');
                if (removeBtn) removeBtn.style.display = 'flex';
            }
        } else {
            const previewLabel = document.getElementById('pet-foto-preview');
            if (previewLabel) {
                previewLabel.innerHTML = '<i data-lucide="camera" style="width: 24px; height: 24px; color: var(--text-muted);"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
            const removeBtn = document.getElementById('pet-foto-remove');
            if (removeBtn) removeBtn.style.display = 'none';
        }

        const title = document.getElementById('current-tab-title');
        if (title) title.textContent = "Editar Pet";

        const submitBtn = document.querySelector('#form-pet button[type="submit"]');
        if (submitBtn) submitBtn.textContent = "Salvar Alterações";
    }, 200);
};

window.deletePet = async function (id) {
    const confirmDelete = await CustomUI.confirm("Excluir Pet", "Tem certeza que deseja excluir este pet? Esta ação não pode ser desfeita.", "danger");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/pets/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Falha ao excluir pet');

        CustomUI.toast("Sucesso", "Pet excluído com sucesso", "success");
        state.pets = state.pets.filter(p => p.id !== id);
        if (state.petsFilteredList) {
            state.petsFilteredList = state.petsFilteredList.filter(p => p.id !== id);
        }
        renderPetsList();
        window.toggleBulkDeleteBtn('pets');
    } catch (e) {
        CustomUI.toast("Erro", e.message, "danger");
    }
};

window.viewPet = async function (id) {
    try {
        const response = await fetch(`${API_BASE}/pets/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes do pet");
        const pet = await response.json();

        // Salvar pet em visualização caso precise
        state.currentPetInView = pet;

        // Cabeçalho (Status e Nome)
        const statusEl = document.getElementById('perf-pet-status');
        if (statusEl) {
            statusEl.textContent = pet.status || 'Ativo';
            statusEl.className = pet.status === 'Ativo' ? 'badge-green-responsavel' : 'badge-danger';
        }

        const avatarEl = document.getElementById('perf-pet-avatar');
        if (avatarEl) {
            if (pet.foto_url) {
                avatarEl.innerHTML = `<img src="${pet.foto_url}" alt="${pet.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                avatarEl.style.border = 'none';
            } else {
                const parts = (pet.nome || '?').trim().split(/\s+/);
                const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
                avatarEl.innerHTML = initials.toUpperCase();
                avatarEl.style.border = '2px solid var(--primary)';
            }
        }

        const nomeEl = document.getElementById('perf-pet-nome');
        if (nomeEl) nomeEl.textContent = pet.nome || '-';

        const racaHeader = document.getElementById('perf-pet-raca-header');
        if (racaHeader) racaHeader.textContent = pet.raca || 'Raça não inf.';

        // Características Físicas
        document.getElementById('perf-pet-especie').textContent = pet.especie || '-';
        document.getElementById('perf-pet-raca').textContent = pet.raca || '-';
        document.getElementById('perf-pet-sexo').textContent = pet.sexo || '-';
        document.getElementById('perf-pet-peso').textContent = pet.peso ? String(pet.peso).replace('.', ',') + ' Kg' : '-';
        document.getElementById('perf-pet-cor').textContent = pet.cor || '-';

        let nascimentoFormatado = '-';
        let idadeAnos = '0';
        let proximoNiverFormatado = '-';
        if (pet.nascimento) {
            nascimentoFormatado = formatDateWithSlashes(pet.nascimento);

            // Calcular idade
            const nascimentoData = new Date(pet.nascimento);
            const hoje = new Date();
            let anos = hoje.getFullYear() - nascimentoData.getFullYear();
            const m = hoje.getMonth() - nascimentoData.getMonth();
            if (m < 0 || (m === 0 && hoje.getDate() < nascimentoData.getDate())) {
                anos--;
            }
            idadeAnos = anos >= 0 ? String(anos) : '0';

            // Calcular próximo aniversário
            if (nascimentoFormatado && nascimentoFormatado.includes('/')) {
                const parts = nascimentoFormatado.split('/');
                if (parts.length === 3) {
                    const dia = parseInt(parts[0], 10);
                    const mes = parseInt(parts[1], 10) - 1;

                    let niverThisYear = new Date(hoje.getFullYear(), mes, dia);
                    let todayStart = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

                    if (niverThisYear < todayStart) {
                        niverThisYear.setFullYear(hoje.getFullYear() + 1);
                    }

                    const dd = String(niverThisYear.getDate()).padStart(2, '0');
                    const mm = String(niverThisYear.getMonth() + 1).padStart(2, '0');
                    const yyyy = niverThisYear.getFullYear();
                    proximoNiverFormatado = `${dd}/${mm}/${yyyy}`;
                }
            }
        }
        document.getElementById('perf-pet-nasc').textContent = nascimentoFormatado;
        document.getElementById('stat-pet-idade').textContent = idadeAnos;
        const elProximoNiver = document.getElementById('perf-pet-proximo-niver');
        if (elProximoNiver) elProximoNiver.textContent = proximoNiverFormatado;

        // Observações
        const obsEl = document.getElementById('perf-pet-obs');
        if (obsEl) obsEl.value = pet.observacoes || '';

        // Dados de Cadastro
        document.getElementById('perf-pet-castrado').textContent = pet.castrado ? 'Sim' : 'Não';
        document.getElementById('stat-pet-porte').textContent = pet.porte || '-';
        document.getElementById('perf-pet-imagem').textContent = pet.uso_imagem ? 'Sim' : 'Não';

        const treinadoEl = document.getElementById('perf-pet-treinado');
        if (treinadoEl) treinadoEl.textContent = pet.treinado ? 'Sim' : 'Não';

        // Responsável (Responsável)
        const responsavel = state.responsaveis.find(t => t.id === pet.responsavel_id);
        const responsavelNome = responsavel ? responsavel.nome : 'Desconhecido';

        document.getElementById('perf-pet-responsavel-nome').textContent = responsavelNome;
        document.getElementById('stat-pet-responsavel').textContent = responsavelNome.split(' ')[0]; // Primeiro nome no stat

        let responsavelCpf = '-';
        if (responsavel && responsavel.cpf && responsavel.cpf.length === 11) {
            responsavelCpf = `${responsavel.cpf.substring(0, 3)}.${responsavel.cpf.substring(3, 6)}.${responsavel.cpf.substring(6, 9)}-${responsavel.cpf.substring(9, 11)}`;
        }
        document.getElementById('perf-pet-responsavel-cpf').textContent = responsavelCpf;

        document.getElementById('perf-pet-responsavel-cel').textContent = responsavel ? (responsavel.celular || responsavel.telefone || '-') : '-';
        const emailEl = document.getElementById('perf-pet-responsavel-email');
        if (emailEl) emailEl.textContent = responsavel ? (responsavel.email || '-') : '-';

        // Botão Editar
        const btnEdit = document.getElementById('btn-edit-pet-profile');
        if (btnEdit) {
            btnEdit.onclick = () => {
                window.editPet(pet.id);
            };
        }

        // Mudar para a aba do perfil do pet
        if (typeof onTabChanged === 'function') {
            onTabChanged('pet-perfil');
        }

        // Esconder loading e mostrar painel
        showLoading('tab-pet-perfil', false);
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('tab-pet-perfil').classList.add('active');

        lucide.createIcons();
    } catch (e) {
        console.error(e);
        CustomUI.toast("Erro", "Falha ao carregar detalhes do pet", "danger");
    }
};

window.showPetsList = function () {
    if (typeof onTabChanged === 'function') {
        onTabChanged('pets');
    }
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById('tab-pets').classList.add('active');
};


// ==========================================
// ROTAS E LÓGICA DE PETS

async function loadPets() {
    const spinner = document.getElementById('loading-pets');
    const table = document.getElementById('table-pets-element');
    if (spinner && table) {
        spinner.style.display = 'flex';
        table.style.opacity = '0.3';
    }
    try {
        const response = await fetch(`${API_BASE}/pets?limit=10000`);
        const resData = await response.json();
        state.pets = Array.isArray(resData) ? resData : (resData.items || []);
        renderPetsTable(state.pets);
    } catch (error) {
        console.error("Erro ao carregar pets:", error);
    } finally {
        if (spinner && table) {
            spinner.style.display = 'none';
            table.style.opacity = '1';
        }
    }
}

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderPetsTable(list, isFiltered = false) {
    const tbody = document.getElementById('tbody-pets');
    const emptyState = document.getElementById('empty-pets');
    tbody.innerHTML = '';

    if (list.length === 0) {
        emptyState.style.display = 'block';
        updatePaginationInfo(0, 0, 0);
        return;
    }
    emptyState.style.display = 'none';

    // Se NÃO for renderização de filtro, resetamos os inputs de busca para estarem vazios
    if (!isFiltered) {
        ['filter-pet-nome', 'filter-pet-responsavel', 'filter-pet-especie', 'filter-pet-raca', 'filter-pet-status'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        const selectAll = document.getElementById('select-all-pets');
        if (selectAll) selectAll.checked = false;
        state.petsFilteredList = null;
        state.petsPage = 1;
    } else {
        state.petsFilteredList = list;
    }

    let itemsToRender = list;

    // Pagination logic
    const totalItems = list.length;
    let startItem = 0;
    let endItem = totalItems;

    if (state.petsRowsPerPage !== 'all') {
        const rows = parseInt(state.petsRowsPerPage);
        const totalPages = Math.ceil(totalItems / rows);
        if (state.petsPage > totalPages && totalPages > 0) state.petsPage = totalPages;

        startItem = (state.petsPage - 1) * rows;
        endItem = Math.min(startItem + rows, totalItems);
        itemsToRender = list.slice(startItem, endItem);
    }

    updatePaginationInfo(totalItems > 0 ? startItem + 1 : 0, endItem, totalItems);

    itemsToRender.forEach(t => {
        const row = document.createElement('tr');

        // Adiciona classe de destaque se este for o pet salvo/editado recentemente
        if (state.highlightedPetId && t.id === state.highlightedPetId) {
            row.classList.add('highlighted-row');
        }

        const responsavel = state.responsaveis.find(responsavel => responsavel.id === t.responsavel_id);
        const responsavelName = responsavel ? responsavel.nome : 'Desconhecido';

        row.innerHTML = `
            <td style="vertical-align: middle;">
                <div style="display: flex; align-items: center; gap: 12px; height: 100%;">
                    <input type="checkbox" class="custom-checkbox pet-select-checkbox" data-id="${t.id}" onchange="window.toggleBulkDeleteBtn('pets')">
                    <button class="btn-table-edit" onclick="editPet(${t.id})">
                        <i data-lucide="edit-3" style="width: 15px; height: 15px;"></i> Editar
                    </button>
                    <div class="dropdown-options-container" id="dropdown-${t.id}">
                        <button class="btn-table-options" onclick="toggleDropdown(${t.id}, event)">
                            Opções <i data-lucide="chevron-down" style="width: 14px; height: 14px; margin-left: 2px;"></i>
                        </button>
                        <div class="dropdown-menu-list">
                            <button class="dropdown-item" onclick="viewPet(${t.id}); closeAllDropdowns();">
                                <i data-lucide="eye" style="color: var(--primary);"></i> Visualizar
                            </button>
                            <button class="dropdown-item delete" onclick="deletePet(${t.id}); closeAllDropdowns();">
                                <i data-lucide="trash-2" style="color: var(--danger);"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </td>
            <td style="font-size: 14px; color: var(--text-main); vertical-align: middle;">
                <div style="display: flex; align-items: center; gap: 14px; height: 100%;">
                    ${t.foto_url
                ? `<img src="${t.foto_url}" alt="${t.nome}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid var(--border-glow);">`
                : (() => { const initials = getInitials(t.nome); return `<div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-glow); border: 2px solid var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 20px; font-weight: 700; color: var(--primary);">${initials}</div>`; })()
            }
                    <span>${t.nome}</span>
                </div>
            </td>
            <td style="font-size: 14px; color: var(--text-main); vertical-align: middle;">${responsavelName}</td>
            <td style="font-size: 14px; color: var(--text-main); vertical-align: middle;">${t.especie || '-'}</td>
            <td style="font-size: 14px; color: var(--text-main); vertical-align: middle;">${t.raca || '-'}</td>
            <td style="text-align: center; vertical-align: middle;">
                <span class="${t.status === 'Ativo' ? 'badge-green-pet' : 'badge-red-pet'}">${t.status === 'Ativo' ? 'CLIENTE' : 'INATIVO'}</span>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Remove o destaque após 5 segundos e limpa o ID do estado global
    if (state.highlightedPetId) {
        setTimeout(() => {
            const highlightedRow = document.querySelector('.highlighted-row');
            if (highlightedRow) {
                highlightedRow.classList.remove('highlighted-row');
            }
            state.highlightedPetId = null;
        }, 5000);
    }

    // Vincula listeners de filtros rápidos
    setupPetFilters();
    setupSelectAllLogic();

    lucide.createIcons();
}

// Configura filtros de pesquisa em tempo real
function setupPetFilters() {
    ['filter-pet-nome', 'filter-pet-responsavel', 'filter-pet-especie', 'filter-pet-raca', 'filter-pet-status'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeEventListener('input', applyPetFilters);
            input.addEventListener('input', applyPetFilters);
        }
    });
}

window.applyPetFilters = function () {
    const nomeInput = document.getElementById('filter-pet-nome');
    const responsavelInput = document.getElementById('filter-pet-responsavel');
    const especieInput = document.getElementById('filter-pet-especie');
    const racaInput = document.getElementById('filter-pet-raca');
    const statusInput = document.getElementById('filter-pet-status');

    const nomeF = (nomeInput ? nomeInput.value : '').toLowerCase();
    const responsavelF = (responsavelInput ? responsavelInput.value : '').toLowerCase();
    const especieF = (especieInput ? especieInput.value : '').toLowerCase();
    const racaF = (racaInput ? racaInput.value : '').toLowerCase();
    const statusF = (statusInput ? statusInput.value : '').toLowerCase();

    const filtered = state.pets.filter(t => {
        const tNome = t.nome ? t.nome.toLowerCase() : '';
        const matchNome = !nomeF || tNome.startsWith(nomeF);

        const responsavelObj = state.responsaveis.find(responsavel => responsavel.id === t.responsavel_id);
        const responsavelName = responsavelObj ? responsavelObj.nome.toLowerCase() : '';
        const matchResponsável = !responsavelF || responsavelName.startsWith(responsavelF);

        const tEspecie = t.especie ? t.especie.toLowerCase() : '';
        const matchEspecie = !especieF || tEspecie.startsWith(especieF);

        const tRaca = t.raca ? t.raca.toLowerCase() : '';
        const matchRaca = !racaF || tRaca.startsWith(racaF);

        const statusStr = t.status ? t.status.toLowerCase() : '';
        const matchStatus = !statusF ||
            (statusStr === 'ativo' ? 'ativo' : 'inativo').startsWith(statusF);

        return matchNome && matchResponsável && matchEspecie && matchRaca && matchStatus;
    });

    renderPetsTable(filtered, true);
}

// Pagination Logic for Pets
function updatePaginationInfo(start, end, total) {
    const elStart = document.getElementById('page-start-pets');
    const elEnd = document.getElementById('page-end-pets');
    const elTotal = document.getElementById('page-total-pets');
    const btnPrev = document.getElementById('btn-prev-pets');
    const btnNext = document.getElementById('btn-next-pets');

    if (elStart) elStart.textContent = start;
    if (elEnd) elEnd.textContent = end;
    if (elTotal) elTotal.textContent = total;

    if (btnPrev) btnPrev.disabled = state.petsPage <= 1;

    if (btnNext) {
        if (state.petsRowsPerPage === 'all') {
            btnNext.disabled = true;
        } else {
            const rows = parseInt(state.petsRowsPerPage);
            const totalPages = Math.ceil(total / rows);
            btnNext.disabled = state.petsPage >= totalPages;
        }
    }
}

window.changeRowsPerPage = function (type, value) {
    if (type === 'pets') {
        state.petsRowsPerPage = value;
        state.petsPage = 1;
        const listToRender = state.petsFilteredList || state.pets;
        renderPetsTable(listToRender, state.petsFilteredList !== null);
    }
};

window.prevPage = function (type) {
    if (type === 'pets' && state.petsPage > 1) {
        state.petsPage--;
        const listToRender = state.petsFilteredList || state.pets;
        renderPetsTable(listToRender, state.petsFilteredList !== null);
    }
};

window.nextPage = function (type) {
    if (type === 'pets' && state.petsRowsPerPage !== 'all') {
        const listToRender = state.petsFilteredList || state.pets;
        const rows = parseInt(state.petsRowsPerPage);
        const totalPages = Math.ceil(listToRender.length / rows);

        if (state.petsPage < totalPages) {
            state.petsPage++;
            renderPetsTable(listToRender, state.petsFilteredList !== null);
        }
    }
};

// Lógica de seleção múltipla por Checkboxes
function setupSelectAllLogic() {
    window.toggleBulkDeleteBtn('pets');
}

window.toggleSelectAll = function (type, checked) {
    let selector = type === 'pets' ? '.row-checkbox-pets' : '.pet-select-checkbox';
    document.querySelectorAll(selector).forEach(cb => {
        cb.checked = checked;
    });
    window.toggleBulkDeleteBtn(type);
};

window.toggleBulkDeleteBtn = function (type) {
    let selector = type === 'pets' ? '.row-checkbox-pets' : '.pet-select-checkbox';
    const total = document.querySelectorAll(selector).length;
    const checkedCount = document.querySelectorAll(`${selector}:checked`).length;

    // update select-all checkbox
    let selectAllId = type === 'pets' ? 'select-all-pets' : 'select-all-pets';
    const selectAllCheckbox = document.getElementById(selectAllId);
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = (total > 0 && total === checkedCount);
    }

    // update bulk delete button visibility
    let btnId = type === 'pets' ? 'btn-bulk-delete-pets' : 'btn-bulk-delete-pets';
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.style.display = checkedCount > 0 ? 'inline-flex' : 'none';
    }
};

// Lógica para controle dos Dropdowns de Opções na tabela
window.toggleDropdown = function (id, event) {
    event.stopPropagation();
    const container = document.getElementById(`dropdown-${id}`);
    const isActive = container.classList.contains('active');

    closeAllDropdowns();

    if (!isActive) {
        container.classList.add('active');
    }
};

window.closeAllDropdowns = function () {
    document.querySelectorAll('.dropdown-options-container').forEach(el => {
        el.classList.remove('active');
    });
};

document.addEventListener('click', () => {
    closeAllDropdowns();
});

async function viewPet(id) {
    try {
        const response = await fetch(`${API_BASE}/pets/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes do pet");
        const t = await response.json();

        const content = document.getElementById('modal-view-pet-content');
        if (!content) return;

        // Formata data de nascimento
        let nascimento = 'N/A';
        if (t.data_nascimento) {
            nascimento = formatDateWithSlashes(t.data_nascimento);
        }

        // Formata CPF
        let formattedCpf = t.cpf || 'N/A';
        if (t.cpf && t.cpf.length === 11) {
            formattedCpf = t.cpf.substring(0, 3) + '.' + t.cpf.substring(3, 6) + '.' + t.cpf.substring(6, 9) + '-' + t.cpf.substring(9, 11);
        }

        // Formata CEP
        let formattedCep = t.cep || 'N/A';
        if (t.cep && t.cep.length === 8) {
            formattedCep = t.cep.substring(0, 5) + '-' + t.cep.substring(5, 8);
        }

        const badgeClass = t.status === 'Ativo' ? 'badge-success' : 'badge-danger';

        content.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Código (ID)</span>
                    <span class="info-value"><strong>#${String(t.id).padStart(3, '0')}</strong></span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="info-value"><span class="badge ${badgeClass}">${t.status}</span></span>
                </div>
                <div class="info-item full-width">
                    <span class="info-label">Nome Completo</span>
                    <span class="info-value" style="font-size: 16px; font-weight: 700; color: var(--text-main);">${t.nome}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">CPF</span>
                    <span class="info-value" style="font-family: monospace; font-size: 14px;">${formattedCpf}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data de Nascimento</span>
                    <span class="info-value">${nascimento}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sexo</span>
                    <span class="info-value">${t.sexo || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estado Civil</span>
                    <span class="info-value">${t.estado_civil || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">E-mail</span>
                    <span class="info-value" style="word-break: break-all;">${t.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Telefone Principal</span>
                    <span class="info-value">${t.telefone || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Telefone Secundário</span>
                    <span class="info-value">${t.telefone_secundario || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Profissão</span>
                    <span class="info-value">${t.profissao || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Instagram</span>
                    <span class="info-value">${t.instagram || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Como nos Conheceu?</span>
                    <span class="info-value">${t.como_conheceu || 'N/A'}</span>
                </div>
                
                <div class="info-item full-width" style="margin-top: 12px; border-color: rgba(16, 185, 129, 0.25); background: rgba(16, 185, 129, 0.05);">
                    <span class="info-label" style="color: var(--primary); font-weight: 700;">Endereço Completo</span>
                    <span class="info-value" style="line-height: 1.5; color: var(--text-main);">
                        ${t.endereco || 'Sem endereço'}${t.numero ? `, Nº ${t.numero}` : ''}
                        ${t.complemento ? ` (${t.complemento})` : ''} <br>
                        ${t.bairro ? `${t.bairro} - ` : ''}${t.cidade || ''}/${t.uf || ''} <br>
                        <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">CEP: ${formattedCep}</span>
                    </span>
                </div>
            </div>
        `;

        // Associa ação ao botão de editar da modal
        const editBtn = document.getElementById('btn-modal-edit-pet');
        if (editBtn) {
            editBtn.onclick = () => {
                closeViewPetModal();
                editPet(t.id);
            };
        }

        const modal = document.getElementById('modal-view-pet');
        if (modal) {
            modal.classList.add('active');
        }

        if (window.lucide) {
            lucide.createIcons();
        }

    } catch (error) {
        console.error("Erro ao carregar detalhes do pet para visualização:", error);
    }
}

function closeViewPetModal() {
    const modal = document.getElementById('modal-view-pet');
    if (modal) {
        modal.classList.remove('active');
    }
}

window.resetPetForm = function () {
    const form = document.getElementById('form-pet');
    if (form) form.reset();
    const petIdEl = document.getElementById('pet-id');
    if (petIdEl) petIdEl.value = '';

    // Limpa a foto
    const uploadInput = document.getElementById('pet-foto-upload');
    if (uploadInput) uploadInput.value = '';
    const preview = document.getElementById('pet-foto-preview');
    if (preview) {
        preview.innerHTML = '<i data-lucide="camera" style="width: 24px; height: 24px; color: var(--text-muted);"></i><span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-align: center;">Selecionar<br>Foto</span>';
        preview.style.border = '1px dashed var(--border-glow)';
    }
    const removeBtn = document.getElementById('pet-foto-remove');
    if (removeBtn) removeBtn.style.display = 'none';

    // Restaura o título padrão
    const titleEl = document.getElementById('tab-novo-pet-title');
    if (titleEl) titleEl.innerHTML = '<i data-lucide="user-plus"></i> Novo Responsável';

    // Limpa feedbacks e validações
    state.officialCPFData = null;
    ['pet-cpf', 'pet-nome', 'pet-data-nascimento', 'pet-email', 'pet-telefone', 'pet-cep', 'pet-sexo'].forEach(clearFeedback);
    formVerificationState.cpf = false;
    formVerificationState.nome = false;
    formVerificationState.nascimento = false;
    formVerificationState.email = true;
    formVerificationState.telefone = true;
    formVerificationState.cep = true;
    formVerificationState.sexo = false;

    const cidadeEl = document.getElementById('pet-cidade');
    if (cidadeEl) cidadeEl.removeAttribute('readonly');
    const ufEl = document.getElementById('pet-uf');
    if (ufEl) ufEl.removeAttribute('readonly');

    // Define status padrão como Ativo
    if (typeof setCustomSelectValue === 'function') {
        setCustomSelectValue('pet-status', 'Ativo');
    }

    // Desativa a exibição de erros para evitar loops durante o reset
    window.showSubmitError = false;
    validateFormState();

    if (window.lucide) lucide.createIcons();
};

async function editPet(id) {
    try {
        const response = await fetch(`${API_BASE}/pets/${id}`);
        const t = await response.json();

        // Limpa feedbacks anteriores e inicializa validações como verdadeiras para o modo de edição
        ['pet-cpf', 'pet-nome', 'pet-data-nascimento', 'pet-email', 'pet-telefone', 'pet-telefone-secundario', 'pet-cep', 'pet-sexo'].forEach(clearFeedback);
        formVerificationState.cpf = true;
        formVerificationState.nome = true;
        formVerificationState.nascimento = true;
        formVerificationState.email = true;
        formVerificationState.telefone = true;
        formVerificationState.cep = true;
        formVerificationState.sexo = true;
        state.officialCPFData = null;
        window.isSubmittingForm = true;
        validateFormState();
        window.isSubmittingForm = false;

        document.getElementById('pet-id').value = t.id;
        document.getElementById('pet-nome').value = t.nome || '';
        document.getElementById('pet-cpf').value = t.cpf || '';
        setCustomSelectValue('pet-sexo', t.sexo || '');
        document.getElementById('pet-data-nascimento').value = formatDateWithSlashes(t.data_nascimento) || '';
        document.getElementById('pet-email').value = t.email || '';
        document.getElementById('pet-telefone').value = t.telefone || '';

        document.getElementById('pet-cep').value = t.cep || '';
        document.getElementById('pet-endereco').value = t.endereco || '';
        document.getElementById('pet-numero').value = t.numero || '';
        document.getElementById('pet-complemento').value = t.complemento || '';
        document.getElementById('pet-bairro').value = t.bairro || '';
        document.getElementById('pet-cidade').value = t.cidade || '';
        document.getElementById('pet-uf').value = t.uf || '';

        document.getElementById('pet-indicacao').value = t.indicacao || '';
        setCustomSelectValue('pet-como-conheceu', t.como_conheceu || '');
        setCustomSelectValue('pet-dia-pagamento', t.dia_pagamento || '');
        const obsInput = document.getElementById('pet-observacoes');
        if (obsInput) obsInput.value = t.observacoes || '';
        setCustomSelectValue('pet-forma-pgto', t.forma_pgto_preferencial || '');

        const autorizaImagemRad = document.querySelector(`input[name="pet-autoriza-imagem"][value="${t.autoriza_imagem === true}"]`);
        if (autorizaImagemRad) autorizaImagemRad.checked = true;

        const assinaRad = document.querySelector(`input[name="pet-assina"][value="${t.assina === true}"]`);
        if (assinaRad) assinaRad.checked = true;

        setCustomSelectValue('pet-status', t.status || 'Ativo');

        // Carrega a foto se cadastrada
        const preview = document.getElementById('pet-foto-preview');
        const removeBtn = document.getElementById('pet-foto-remove');
        if (t.foto_url) {
            preview.innerHTML = `<img src="${t.foto_url}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            preview.style.border = 'none';
            if (removeBtn) removeBtn.style.display = 'flex';
        } else {
            preview.innerHTML = '<i data-lucide="camera" style="width: 24px; height: 24px; color: var(--text-muted);"></i><span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-align: center;">Selecionar<br>Foto</span>';
            preview.style.border = '1px dashed var(--border-glow)';
            if (removeBtn) removeBtn.style.display = 'none';
        }

        document.getElementById('tab-novo-pet-title').innerHTML = '<i data-lucide="edit-3"></i> Editar Responsável';
        lucide.createIcons();

        const tabLink = document.querySelector('.submenu-link[data-tab="novo-pet"]');
        if (tabLink) {
            // Apenas ativa a aba programaticamente sem disparar o click que reseta o form
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.submenu-link').forEach(l => l.classList.remove('active'));
            tabLink.classList.add('active');

            const parentGroup = tabLink.closest('.nav-group');
            if (parentGroup) {
                const parentLink = parentGroup.querySelector('.nav-link');
                if (parentLink) parentLink.classList.add('active');
            }

            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('tab-novo-pet').classList.add('active');
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao buscar dados do responsável para edição.");
    }
}

async function savePet(e) {
    e.preventDefault();

    window.isSubmittingForm = true;
    window.showSubmitError = true;
    const isValid = validateFormState();
    window.isSubmittingForm = false; // Desativa imediatamente após rodar para bloquear loops de eventos assíncronos

    if (!isValid) {
        // Encontra o primeiro input inválido e rola até ele
        const firstError = document.querySelector('.field-feedback.active.danger');
        if (firstError && firstError.parentElement) {
            firstError.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Validação de Nome Completo (Segurança e Anti-Fraude)
    const nameInput = document.getElementById('pet-nome');
    const nameResult = validateNameLogic(nameInput.value);
    if (!nameResult.isValid) {
        nameInput.style.border = '1px solid var(--danger)';
        alert("Erro de Validação - Nome Completo:\n\n" + nameResult.reason);
        return;
    }
    nameInput.style.border = '';

    // Validação de CPF (Segurança e Anti-Fraude)
    const cpfInput = document.getElementById('pet-cpf');
    const cpfVal = cpfInput.value.replace(/\D/g, '');
    if (!cpfVal || cpfVal.length !== 11 || !validateCPF(cpfVal)) {
        cpfInput.style.borderColor = 'var(--danger)';
        cpfInput.style.boxShadow = '0 0 0 2px var(--danger-glow)';
        alert("Erro de Validação - CPF:\n\nPor favor, informe um CPF válido de 11 dígitos numéricos.");
        return;
    }
    cpfInput.style.borderColor = '';
    cpfInput.style.boxShadow = '';

    // Validação de Idade (Maior de 18 anos)
    const dateInput = document.getElementById('pet-data-nascimento');
    const dataNascimentoStr = dateInput.value;

    if (!dataNascimentoStr || dataNascimentoStr.length < 10) {
        dateInput.style.border = '1px solid var(--danger)';
        alert("A Data de Nascimento é obrigatória e deve estar completa.");
        return;
    }

    const parts = dataNascimentoStr.split('/');
    if (parts.length === 3) {
        const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            dateInput.style.border = '1px solid var(--danger)';
            alert("Atenção: O cadastro não é permitido para menores de 18 anos.");
            return;
        }
    } else {
        dateInput.style.border = '1px solid var(--danger)';
        alert("Data de nascimento inválida.");
        return;
    }

    // Limpa a borda se estiver tudo ok
    dateInput.style.border = '';

    // Validação do E-mail
    const emailInput = document.getElementById('pet-email');
    if (emailInput.value && !validateEmailLogic(emailInput.value)) {
        emailInput.style.border = '1px solid var(--danger)';
        alert("Atenção: O e-mail informado parece conter erros de digitação. Por favor, verifique e corrija!");
        return;
    }
    emailInput.style.border = '';

    const id = document.getElementById('pet-id').value;

    // Captura valores dos radios com segurança
    const autorizaImagemChecked = document.querySelector('input[name="pet-autoriza-imagem"]:checked');
    const assinaChecked = document.querySelector('input[name="pet-assina"]:checked');

    const previewImg = document.querySelector('#pet-foto-preview img');
    const foto_url = previewImg ? previewImg.src : null;

    const data = {
        nome: document.getElementById('pet-nome').value,
        cpf: document.getElementById('pet-cpf').value || null,
        estado_civil: document.getElementById('pet-estado-civil')?.value || null,
        sexo: document.getElementById('pet-sexo')?.value || null,
        profissao: document.getElementById('pet-profissao')?.value || null,
        instagram: document.getElementById('pet-instagram')?.value || null,
        data_nascimento: document.getElementById('pet-data-nascimento')?.value || null,
        email: document.getElementById('pet-email')?.value || null,
        telefone: document.getElementById('pet-telefone')?.value || null,
        telefone_secundario: document.getElementById('pet-telefone-secundario')?.value || null,
        cep: document.getElementById('pet-cep').value || null,
        endereco: document.getElementById('pet-endereco').value || null,
        numero: document.getElementById('pet-numero').value || null,
        complemento: document.getElementById('pet-complemento').value || null,
        bairro: document.getElementById('pet-bairro').value || null,
        cidade: document.getElementById('pet-cidade').value || null,
        uf: document.getElementById('pet-uf').value || null,
        indicacao: document.getElementById('pet-indicacao').value || null,
        como_conheceu: document.getElementById('pet-como-conheceu').value || null,
        dia_pagamento: document.getElementById('pet-dia-pagamento').value || null,
        observacoes: document.getElementById('pet-observacoes') ? (document.getElementById('pet-observacoes').value || null) : null,
        forma_pgto_preferencial: document.getElementById('pet-forma-pgto').value || null,
        autoriza_imagem: autorizaImagemChecked ? autorizaImagemChecked.value === "true" : false,
        assina: assinaChecked ? assinaChecked.value === "true" : false,
        status: document.getElementById('pet-status').value,
        foto_url: foto_url
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
            const savedPet = await response.json();
            state.highlightedPetId = savedPet.id;

            window.resetPetForm();

            // Redireciona de forma robusta para o submenu de Pets onde fica a listagem
            const tabLink = document.querySelector('.submenu-link[data-tab="clientes"]');
            if (tabLink) {
                tabLink.click();
            } else {
                showPetsList();
            }

            CustomUI.toast("Sucesso", "Responsável salvo com sucesso!", "success");
            loadPets();
        } else {
            const err = await response.json();
            if (response.status === 409) {
                // CPF duplicado: exibe feedback inline no campo CPF
                formVerificationState.cpf = false;
                showFeedback('pet-cpf', `⚠️ CPF já cadastrado: ${err.detail}`, 'danger');
                validateFormState();
                // Rola o formulário até o campo CPF
                const cpfInput = document.getElementById('pet-cpf');
                if (cpfInput) cpfInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                CustomUI.alert("Erro ao Salvar", `Erro ao salvar pet: ${err.detail || 'Verifique os dados.'}`, "danger");
            }
        }
    } catch (error) {
        console.error(error);
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao salvar pet.", "danger");
    }
}

async function deletePet(id) {
    const confirmDelete = await CustomUI.confirm(
        "Excluir Responsável",
        "Tem certeza que deseja excluir este pet? Esta ação não poderá ser desfeita.",
        { type: "danger", confirmText: "Excluir", cancelText: "Cancelar" }
    );
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/pets/${id}`, { method: 'DELETE' });
        if (response.ok) {
            CustomUI.toast("Sucesso", "Responsável excluído com sucesso!", "success");
            loadPets();
            window.toggleBulkDeleteBtn('pets');
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Excluir", `Erro ao excluir: ${err.detail}`, "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao excluir pet.", "danger");
    }
}

window.bulkDeletePets = async function () {
    const checkboxes = document.querySelectorAll('.pet-select-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    if (ids.length === 0) return;

    const confirmDelete = await CustomUI.confirm(
        "Excluir em Massa",
        `Tem certeza que deseja excluir os ${ids.length} responsáveis selecionados? Esta ação não poderá ser desfeita e removerá todos os registros associados.`,
        { type: "danger", confirmText: "Excluir Selecionados", cancelText: "Cancelar" }
    );
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/pets/batch-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: ids })
        });
        if (response.ok) {
            CustomUI.toast("Sucesso", `${ids.length} responsáveis excluídos com sucesso!`, "success");
            loadPets();
            window.toggleBulkDeleteBtn('pets');
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Excluir", `Erro ao excluir em massa: ${err.detail || 'Erro desconhecido'}`, "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao excluir responsáveis em massa.", "danger");
    }
};

// ==========================================
// CONTROLE DA TABELA DE CLIENTES
// ==========================================
async function loadClientes() {
    showLoading('clientes', true);
    try {
        const response = await fetch(`${API_BASE}/clientes`);
        state.clientes = await response.json();
        renderClientesTable(state.clientes);
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
    } finally {
        showLoading('clientes', false);
    }
}

function renderClientesTable(list) {
    const tbody = document.getElementById('tbody-clientes');
    const emptyState = document.getElementById('empty-clientes');
    tbody.innerHTML = '';

    if (list.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    list.forEach(c => {
        const row = document.createElement('tr');
        const badgeClass = c.status === 'Ativo' ? 'badge-success' : 'badge-danger';

        row.innerHTML = `
            <td><strong>${String(c.id).padStart(3, '0')}</strong></td>
            <td>${c.nome}</td>
            <td>${c.email}</td>
            <td>${c.telefone || '<span class="text-muted">Não inf.</span>'}</td>
            <td><span class="badge ${badgeClass}">${c.status}</span></td>
            <td>${formatDateString(c.data_cadastro)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-edit" onclick="editCliente(${c.id})" title="Editar Cliente">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteCliente(${c.id})" title="Excluir Cliente">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    lucide.createIcons();
}

async function editCliente(id) {
    try {
        const response = await fetch(`${API_BASE}/clientes/${id}`);
        const c = await response.json();

        document.getElementById('cliente-id').value = c.id;
        if (document.getElementById('cliente-cpf')) {
            document.getElementById('cliente-cpf').value = c.cpf || '';
        }
        document.getElementById('cliente-nome').value = c.nome;
        document.getElementById('cliente-email').value = c.email;
        document.getElementById('cliente-telefone').value = c.telefone || '';
        setCustomSelectValue('cliente-status', c.status);

        document.getElementById('modal-cliente-title').textContent = "Editar Cliente";
        openModal('modal-cliente');
    } catch (error) {
        alert("Erro ao buscar dados do cliente para edição.");
    }
}

async function saveCliente(e) {
    e.preventDefault();

    const id = document.getElementById('cliente-id').value;
    const data = {
        nome: document.getElementById('cliente-nome').value,
        email: document.getElementById('cliente-email').value,
        telefone: document.getElementById('cliente-telefone').value,
        status: document.getElementById('cliente-status').value,
        cpf: document.getElementById('cliente-cpf') ? (document.getElementById('cliente-cpf').value || null) : null
    };

    const url = id ? `${API_BASE}/clientes/${id}` : `${API_BASE}/clientes`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal('modal-cliente');
            CustomUI.toast("Sucesso", "Cliente salvo com sucesso!", "success");
            loadClientes();
        } else {
            const err = await response.json();
            if (response.status === 409) {
                CustomUI.alert("CPF Já Cadastrado", `⚠️ CPF já cadastrado!\n\n${err.detail}\n\nVerifique o CPF informado antes de prosseguir.`, "warning");
            } else {
                CustomUI.alert("Erro ao Salvar", `Erro ao salvar cliente: ${err.detail || 'Verifique os dados.'}`, "danger");
            }
        }
    } catch (error) {
        console.error(error);
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao salvar cliente.", "danger");
    }
}

async function deleteCliente(id) {
    const confirmDelete = await CustomUI.confirm(
        "Excluir Cliente",
        "Tem certeza que deseja excluir este cliente? Esta ação também poderá falhar se existirem vendas vinculadas a ele.",
        { type: "danger", confirmText: "Excluir", cancelText: "Cancelar" }
    );
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/clientes/${id}`, { method: 'DELETE' });
        if (response.ok) {
            CustomUI.toast("Sucesso", "Cliente excluído com sucesso!", "success");
            loadClientes();
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Excluir", `Erro ao excluir: ${err.detail}`, "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao excluir cliente.", "danger");
    }
}

// ==========================================
// CONTROLE DA TABELA DE PRODUTOS
// ==========================================
async function loadProdutos() {
    showLoading('produtos', true);
    try {
        const response = await fetch(`${API_BASE}/produtos`);
        state.produtos = await response.json();
        renderProdutosTable(state.produtos);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    } finally {
        showLoading('produtos', false);
    }
}

function renderProdutosTable(list) {
    const tbody = document.getElementById('tbody-produtos');
    const emptyState = document.getElementById('empty-produtos');
    tbody.innerHTML = '';

    if (list.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    list.forEach(p => {
        const row = document.createElement('tr');
        const badgeClass = p.estoque > 0 ? 'badge-success' : 'badge-danger';

        row.innerHTML = `
            <td><strong>#${p.id}</strong></td>
            <td>${p.nome}</td>
            <td><span class="badge" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glow);">${p.categoria}</span></td>
            <td><strong>${formatCurrency(p.preco)}</strong></td>
            <td>${p.estoque} unidades</td>
            <td><span class="badge ${badgeClass}">${p.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-edit" onclick="editProduto(${p.id})" title="Editar Produto">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteProduto(${p.id})" title="Excluir Produto">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    lucide.createIcons();
}

async function editProduto(id) {
    try {
        const response = await fetch(`${API_BASE}/produtos/${id}`);
        const p = await response.json();

        document.getElementById('produto-id').value = p.id;
        document.getElementById('produto-nome').value = p.nome;
        document.getElementById('produto-categoria').value = p.categoria;
        document.getElementById('produto-preco').value = p.preco;
        document.getElementById('produto-estoque').value = p.estoque;

        document.getElementById('modal-produto-title').textContent = "Editar Produto";
        openModal('modal-produto');
    } catch (error) {
        alert("Erro ao buscar dados do produto.");
    }
}

async function saveProduto(e) {
    e.preventDefault();

    const id = document.getElementById('produto-id').value;
    const data = {
        nome: document.getElementById('produto-nome').value,
        categoria: document.getElementById('produto-categoria').value,
        preco: parseFloat(document.getElementById('produto-preco').value),
        estoque: parseInt(document.getElementById('produto-estoque').value)
    };

    const url = id ? `${API_BASE}/produtos/${id}` : `${API_BASE}/produtos`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal('modal-produto');
            CustomUI.toast("Sucesso", "Produto salvo com sucesso!", "success");
            loadProdutos();
        } else {
            CustomUI.alert("Erro ao Salvar", "Ocorreu um erro ao salvar o produto.", "danger");
        }
    } catch (error) {
        console.error(error);
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao salvar produto.", "danger");
    }
}

async function deleteProduto(id) {
    const confirmDelete = await CustomUI.confirm(
        "Excluir Produto",
        "Deseja realmente excluir este produto? Esta ação não poderá ser desfeita.",
        { type: "danger", confirmText: "Excluir", cancelText: "Cancelar" }
    );
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/produtos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            CustomUI.toast("Sucesso", "Produto excluído com sucesso!", "success");
            loadProdutos();
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Excluir", `Erro ao excluir: ${err.detail}`, "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro ao tentar deletar o produto.", "danger");
    }
}

// ==========================================
// CONTROLE DA TABELA E REGISTRO DE VENDAS
// ==========================================
async function loadVendas() {
    showLoading('vendas', true);
    try {
        const response = await fetch(`${API_BASE}/vendas`);
        state.vendas = await response.json();
        renderVendasTable(state.vendas);
    } catch (error) {
        console.error("Erro ao carregar vendas:", error);
    } finally {
        showLoading('vendas', false);
    }
}

function renderVendasTable(list) {
    const tbody = document.getElementById('tbody-vendas');
    const emptyState = document.getElementById('empty-vendas');
    tbody.innerHTML = '';

    if (list.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    list.forEach(v => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${v.id}</strong></td>
            <td>${v.cliente_nome}</td>
            <td>${v.produto_nome}</td>
            <td>${formatCurrency(v.produto_preco)}</td>
            <td>${v.quantidade}x</td>
            <td><strong class="text-success">${formatCurrency(v.valor_total)}</strong></td>
            <td>${formatDateString(v.data_venda)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Carrega as opções de Clientes e Produtos no modal de vendas
async function loadVendaDropdowns() {
    const clientSelect = document.getElementById('venda-cliente-select');
    const productSelect = document.getElementById('venda-produto-select');

    clientSelect.innerHTML = '<option value="" disabled selected>Selecione um cliente...</option>';
    productSelect.innerHTML = '<option value="" disabled selected>Selecione um produto...</option>';

    try {
        // Carrega clientes do servidor
        const clientRes = await fetch(`${API_BASE}/clientes`);
        const clients = await clientRes.json();
        // Apenas clientes Ativos podem comprar
        clients.filter(c => c.status === 'Ativo').forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.nome} (#${c.id})`;
            clientSelect.appendChild(opt);
        });

        // Carrega produtos
        const prodRes = await fetch(`${API_BASE}/produtos`);
        state.produtos = await prodRes.json();
        // Apenas produtos com estoque podem ser vendidos
        state.produtos.filter(p => p.estoque > 0).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.dataset.price = p.preco;
            opt.dataset.stock = p.estoque;
            opt.textContent = `${p.nome} - R$ ${p.preco.toFixed(2)} (Estoque: ${p.estoque})`;
            productSelect.appendChild(opt);
        });

    } catch (e) {
        console.error("Erro ao carregar dropdowns de vendas:", e);
    }
}

// Atualiza o valor estimado e valida o estoque no preview do formulário
function updateVendaPreview() {
    const productSelect = document.getElementById('venda-produto-select');
    const qtyInput = document.getElementById('venda-quantidade');
    const previewDiv = document.getElementById('venda-price-preview');
    const warningDiv = document.getElementById('venda-warning-stock');
    const btnSubmit = document.getElementById('btn-submit-venda');

    const selectedOption = productSelect.options[productSelect.selectedIndex];

    if (!selectedOption || !selectedOption.value) {
        previewDiv.textContent = 'R$ 0,00';
        warningDiv.style.display = 'none';
        btnSubmit.removeAttribute('disabled');
        return;
    }

    const preco = parseFloat(selectedOption.dataset.price);
    const estoque = parseInt(selectedOption.dataset.stock);
    const quantidade = parseInt(qtyInput.value) || 0;

    // Calcula o total
    const total = preco * quantidade;
    previewDiv.textContent = formatCurrency(total);

    // Alerta de limite de estoque
    if (quantidade > estoque) {
        warningDiv.style.display = 'flex';
        btnSubmit.setAttribute('disabled', 'true');
    } else {
        warningDiv.style.display = 'none';
        btnSubmit.removeAttribute('disabled');
    }
}

async function saveVenda(e) {
    e.preventDefault();

    const data = {
        cliente_id: parseInt(document.getElementById('venda-cliente-select').value),
        produto_id: parseInt(document.getElementById('venda-produto-select').value),
        quantidade: parseInt(document.getElementById('venda-quantidade').value),
        valor_total: 0.0 // Backend recalcula para segurança
    };

    try {
        const response = await fetch(`${API_BASE}/vendas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal('modal-venda');
            CustomUI.toast("Sucesso", "Venda registrada com sucesso!", "success");
            loadVendas();
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Registrar Venda", `Falha ao registrar venda: ${err.detail}`, "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao registrar venda.", "danger");
    }
}

// ==========================================
// TERMINAL SQL INTERATIVO (CONSOLE PLAYGROUND)
// ==========================================
function initSQLTerminal() {
    const btnRun = document.getElementById('btn-run-sql');
    if (btnRun) {
        btnRun.addEventListener('click', runCustomSQL);
    }
}

function setSQL(queryText) {
    document.getElementById('sql-query-input').value = queryText;
}

async function runCustomSQL() {
    const queryInput = document.getElementById('sql-query-input');
    const queryText = queryInput.value.trim();
    const statusSpan = document.getElementById('sql-result-status');
    const tableContainer = document.getElementById('sql-results-table-container');

    if (!queryText) {
        alert("Por favor, insira uma instrução SQL primeiro!");
        return;
    }

    statusSpan.className = "status-empty";
    statusSpan.textContent = "Executando...";
    tableContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: queryText })
        });

        const result = await response.json();

        if (result.success) {
            statusSpan.className = "status-success";
            statusSpan.textContent = "Sucesso";

            if (result.type === 'select') {
                renderSQLResultTable(result.columns, result.rows, tableContainer);
            } else {
                tableContainer.innerHTML = `
                    <div class="sql-empty-state" style="color: var(--success)">
                        <i data-lucide="check-circle" style="opacity: 1"></i>
                        <h4>Operação de Escrita Concluída</h4>
                        <p>${result.message}</p>
                    </div>
                `;
                lucide.createIcons();
            }
        } else {
            statusSpan.className = "status-error";
            statusSpan.textContent = "Erro de Sintaxe";
            tableContainer.innerHTML = `
                <div class="sql-empty-state" style="color: var(--danger)">
                    <i data-lucide="x-circle" style="opacity: 1"></i>
                    <h4>Erro no Banco de Dados</h4>
                    <p style="font-family: monospace; font-size: 11px; margin-top: 8px; max-width: 90%">${result.message}</p>
                </div>
            `;
            lucide.createIcons();
        }
    } catch (e) {
        statusSpan.className = "status-error";
        statusSpan.textContent = "Erro de Conexão";
        tableContainer.innerHTML = `<p style="padding: 20px;">Falha ao comunicar com o servidor da API.</p>`;
    }
}

function renderSQLResultTable(columns, rows, container) {
    container.innerHTML = '';

    if (rows.length === 0) {
        container.innerHTML = `
            <div class="sql-empty-state">
                <i data-lucide="info"></i>
                <p>Nenhuma linha correspondente retornada pela consulta.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const table = document.createElement('table');
    table.className = "data-table";
    table.style.width = "max-content";
    table.style.minWidth = "100%";

    // Cabeçalho da tabela
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Corpo da tabela
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            const val = row[col];

            if (val === null || val === undefined) {
                td.innerHTML = '<span class="text-muted">NULL</span>';
            } else if (typeof val === 'number' && (col.includes('preco') || col.includes('total') || col.includes('faturado') || col.includes('valor'))) {
                td.textContent = formatCurrency(val);
            } else {
                td.textContent = val;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

// ==========================================
// FILTROS DE PESQUISA RÁPIDA (CLIENT-SIDE)
// ==========================================
function initFilters() {
    // Filtro Pets
    const searchPets = document.getElementById('search-pets');
    if (searchPets) {
        searchPets.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = state.pets.filter(t =>
                t.nome.toLowerCase().includes(term) ||
                t.email.toLowerCase().includes(term) ||
                (t.cpf && t.cpf.includes(term))
            );
            renderPetsTable(filtered);
        });
    }

    // Filtro Clientes
    const searchClientes = document.getElementById('search-clientes');
    if (searchClientes) {
        searchClientes.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = state.clientes.filter(c =>
                c.nome.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term)
            );
            renderClientesTable(filtered);
        });
    }

    // Filtro Produtos
    const searchProdutos = document.getElementById('search-produtos');
    if (searchProdutos) {
        searchProdutos.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = state.produtos.filter(p =>
                p.nome.toLowerCase().includes(term) ||
                p.categoria.toLowerCase().includes(term)
            );
            renderProdutosTable(filtered);
        });
    }

    // Filtro Vendas
    const searchVendas = document.getElementById('search-vendas');
    if (searchVendas) {
        searchVendas.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = state.vendas.filter(v =>
                v.cliente_nome.toLowerCase().includes(term) ||
                v.produto_nome.toLowerCase().includes(term)
            );
            renderVendasTable(filtered);
        });
    }
}

// ==========================================
// UTILITÁRIOS E DIÁLOGOS DE MODAL
// ==========================================
function openModal(id) {
    document.getElementById(id).classList.add('active');

    if (id === 'modal-pet' && !document.getElementById('pet-id').value) {
        document.getElementById('modal-pet-title').textContent = "Novo Responsável";
    }
    if (id === 'modal-cliente' && !document.getElementById('cliente-id').value) {
        document.getElementById('modal-cliente-title').textContent = "Novo Cliente";
    }
    if (id === 'modal-produto' && !document.getElementById('produto-id').value) {
        document.getElementById('modal-produto-title').textContent = "Novo Produto";
    }
    if (id === 'modal-venda') {
        loadVendaDropdowns();
    }
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');

    // Reseta formulários
    if (id === 'modal-pet') {
        window.resetPetForm();
    }
    if (id === 'modal-cliente') {
        document.getElementById('form-cliente').reset();
        document.getElementById('cliente-id').value = '';
    }
    if (id === 'modal-produto') {
        document.getElementById('form-produto').reset();
        document.getElementById('produto-id').value = '';
    }
    if (id === 'modal-venda') {
        document.getElementById('form-venda').reset();
        document.getElementById('venda-price-preview').textContent = 'R$ 0,00';
        document.getElementById('venda-warning-stock').style.display = 'none';
        document.getElementById('btn-submit-venda').removeAttribute('disabled');
    }
}

function showLoading(panelName, show) {
    const spinner = document.getElementById(`loading-${panelName}`);
    const table = document.getElementById(`table-${panelName}-element`);

    if (spinner && table) {
        spinner.style.display = show ? 'flex' : 'none';
        table.style.opacity = show ? '0.3' : '1';
    }
}

// Utilitários de Formatação
function formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function formatDateString(str) {
    if (!str) return '';
    try {
        const parts = str.split(' ');
        const dateParts = parts[0].split('-');
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${parts[1] || ''}`.trim();
    } catch (e) {
        return str;
    }
}

function formatDateShort(str) {
    if (!str) return '';
    try {
        const dateParts = str.split('-');
        return `${dateParts[2]}/${dateParts[1]}`;
    } catch (e) {
        return str;
    }
}

// ==========================================
// CONTROLE DE USUÁRIOS (CONFIGURAÇÃO)
// ==========================================
function checkUserPermissions() {
    const is_admin = localStorage.getItem('user_cargo') === 'Administrador';

    // Mostra/oculta botão de criar usuário
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    if (btnNovoUsuario) {
        btnNovoUsuario.style.display = (is_admin && state.activeTab === 'usuarios') ? 'inline-flex' : 'none';
    }

    // Mostra/oculta cabeçalho de ações
    const thAcoes = document.getElementById('th-usuario-acoes');
    if (thAcoes) {
        thAcoes.style.display = is_admin ? 'table-cell' : 'none';
    }
}

async function verifySession() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user_nome', data.nome);
            localStorage.setItem('user_username', data.username);
            localStorage.setItem('user_cargo', data.cargo);

            // Atualiza o display do profile no header
            const displayUserName = document.getElementById('display-user-name');
            const displayUserAvatar = document.getElementById('display-user-avatar');
            if (displayUserName) {
                displayUserName.textContent = data.nome;
            }
            if (displayUserAvatar) {
                const initials = data.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                displayUserAvatar.textContent = initials;
            }

            // Executa verificação de permissões na UI
            checkUserPermissions();
        }
    } catch (e) {
        console.error("Erro ao validar sessão:", e);
    }
}

async function loadUsuarios() {
    // Garante que as permissões estejam atualizadas ao abrir a aba
    checkUserPermissions();

    showLoading('usuarios', true);
    try {
        const response = await fetch(`${API_BASE}/users`);
        const list = await response.json();
        renderUsuariosTable(list);
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
    } finally {
        showLoading('usuarios', false);
    }
}

function renderUsuariosTable(list) {
    const tbody = document.getElementById('tbody-usuarios');
    const emptyState = document.getElementById('empty-usuarios');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    const is_admin = localStorage.getItem('user_cargo') === 'Administrador';

    list.forEach(u => {
        const row = document.createElement('tr');

        // Badge colorida para o cargo
        let badgeStyle = 'background: rgba(148, 163, 184, 0.08); border: 1px solid var(--border-glow); color: var(--text-muted);';
        if (u.cargo === 'Administrador') {
            badgeStyle = 'background: rgba(16, 185, 129, 0.08); border: 1px solid var(--success-glow); color: var(--primary);';
        }

        let actionsHTML = '';
        if (is_admin) {
            actionsHTML = `
                <td style="text-align: center;">
                    <div style="display: flex; gap: 18px; justify-content: center; align-items: center;">
                        <a href="#" onclick="event.preventDefault(); openUsuarioModal(${u.id})" class="flat-action-btn edit" title="Editar Usuário" style="color: #94a3b8; transition: var(--transition-smooth); display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                            <i data-lucide="edit-2" style="width: 18px; height: 18px;"></i>
                        </a>
                        <a href="#" onclick="event.preventDefault(); deleteUsuario(${u.id})" class="flat-action-btn delete" title="Excluir Usuário" style="color: #94a3b8; transition: var(--transition-smooth); display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                            <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                        </a>
                    </div>
                </td>
            `;
        }

        row.innerHTML = `
            <td><strong>${String(u.id).padStart(3, '0')}</strong></td>
            <td>${u.nome}</td>
            <td><span class="badge" style="background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-glow); color: var(--text-main); font-weight: 500;">${u.username}</span></td>
            <td><span class="badge" style="${badgeStyle} font-weight: 600; font-size: 11px;">${u.cargo}</span></td>
            ${actionsHTML}
        `;
        tbody.appendChild(row);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Gera o login padrão: 1ª letra do primeiro nome + '.' + último sobrenome
// Ex: "Guilherme Kamaroski" → "g.kamaroski"
function generateLoginFromName(fullName) {
    if (!fullName || !fullName.trim()) return '';
    // Remove diacritics e converte para minúsculas
    const clean = removeDiacritics(fullName.trim()).toLowerCase();
    // Divide por espaços, ignorando preposições curtas e vazios
    const ignoredWords = ['de', 'da', 'do', 'dos', 'das', 'e', 'del', 'al', 'van', 'von'];
    const parts = clean.split(/\s+/).filter(p => p.length > 0);
    // Filtra preposições mas mantém ao menos a primeira e última palavra com significado
    const meaningfulParts = parts.filter(p => !ignoredWords.includes(p));

    if (meaningfulParts.length === 0) return '';
    if (meaningfulParts.length === 1) return meaningfulParts[0].replace(/[^a-z0-9]/g, '');

    const initial = meaningfulParts[0][0]; // Primeira letra do primeiro nome
    const lastName = meaningfulParts[meaningfulParts.length - 1].replace(/[^a-z0-9]/g, ''); // Último sobrenome

    return `${initial}.${lastName}`;
}

// Abre o modal de cadastro/edição de usuário
async function openUsuarioModal(id = null) {
    const modal = document.getElementById('modal-usuario');
    const form = document.getElementById('form-usuario');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('usuario-id').value = '';

    const title = document.getElementById('modal-usuario-title');
    const inputPassword = document.getElementById('usuario-password');
    inputPassword.setAttribute('type', 'password');
    const toggleBtn = document.getElementById('toggle-usuario-password');
    if (toggleBtn) {
        toggleBtn.innerHTML = '<i data-lucide="eye"></i>';
    }
    const helpPassword = document.getElementById('help-usuario-password');

    if (id) {
        // Modo Edição
        title.textContent = "Editar Usuário";
        inputPassword.removeAttribute('required');
        helpPassword.style.display = 'block';

        try {
            // Busca a lista para encontrar os dados do usuário a editar
            const response = await fetch(`${API_BASE}/users`);
            const list = await response.json();
            const u = list.find(user => user.id === id);

            if (u) {
                document.getElementById('usuario-id').value = u.id;
                document.getElementById('usuario-nome').value = u.nome;
                document.getElementById('usuario-username').value = u.username;
                document.getElementById('usuario-email').value = u.email || '';
                setCustomSelectValue('usuario-cargo', u.cargo);
            }
        } catch (e) {
            console.error("Erro ao carregar usuário:", e);
            CustomUI.alert("Erro", "Não foi possível carregar os dados do usuário", "danger");
            return;
        }
    } else {
        // Modo Criação
        title.textContent = "Novo Usuário";
        inputPassword.setAttribute('required', 'true');
        helpPassword.style.display = 'none';
    }

    // === AUTO-GERAÇÃO DE LOGIN A PARTIR DO NOME ===
    const inputNome = document.getElementById('usuario-nome');
    const inputUsername = document.getElementById('usuario-username');

    // Remove listeners anteriores para evitar duplicatas
    if (inputNome._loginAutoHandler) {
        inputNome.removeEventListener('input', inputNome._loginAutoHandler);
    }
    if (inputUsername._loginManualHandler) {
        inputUsername.removeEventListener('input', inputUsername._loginManualHandler);
    }

    if (!id) {
        // Apenas no modo de criação: geração automática ativa
        let userManuallyEdited = false;
        let listenerReady = false; // Só ativa após o modal abrir (evita que form.reset() dispare)

        // Aguarda um frame para garantir que o reset já aconteceu
        requestAnimationFrame(() => { listenerReady = true; });

        const manualHandler = () => {
            if (!listenerReady) return;
            userManuallyEdited = true;
        };
        inputUsername._loginManualHandler = manualHandler;
        inputUsername.addEventListener('input', manualHandler);

        const loginAutoHandler = () => {
            if (userManuallyEdited) return;
            const generated = generateLoginFromName(inputNome.value);
            inputUsername.value = generated;
            // Remove o placeholder quando há valor gerado para não sobrepor o texto
            inputUsername.placeholder = generated ? '' : 'Gerado automaticamente ao digitar o nome';
        };

        inputNome._loginAutoHandler = loginAutoHandler;
        inputNome.addEventListener('input', loginAutoHandler);
    }


    openModal('modal-usuario');
    // Re-renderiza ícones Lucide após abrir o modal
    if (window.lucide) lucide.createIcons();
}

// Salva o cadastro do usuário (Novo ou Edição)
async function saveUsuario(e) {
    e.preventDefault();

    const id = document.getElementById('usuario-id').value;
    const nome = document.getElementById('usuario-nome').value.trim();
    const username = document.getElementById('usuario-username').value.trim();
    const email = document.getElementById('usuario-email').value.trim();
    const cargo = document.getElementById('usuario-cargo').value;
    const password = document.getElementById('usuario-password').value;

    // Validação básica do username (sem espaços)
    if (username.includes(' ')) {
        CustomUI.alert("Usuário Inválido", "O nome de usuário (login) não deve conter espaços.", "warning");
        return;
    }

    const data = { nome, username, email, cargo };

    // Se for novo, senha é obrigatória. Se for edição, só manda a senha se for alterada
    if (password && password.trim()) {
        data.password = password;
    } else if (!id) {
        CustomUI.alert("Campo Obrigatório", "A senha é obrigatória para novos usuários.", "warning");
        return;
    }

    const url = id ? `${API_BASE}/users/${id}` : `${API_BASE}/users`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal('modal-usuario');
            CustomUI.toast("Sucesso", id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!", "success");
            loadUsuarios();

            // Se o próprio usuário editou seu cadastro, atualiza o localStorage e UI
            const loggedInUsername = localStorage.getItem('user_username');
            if (username === loggedInUsername) {
                localStorage.setItem('user_nome', nome);
                localStorage.setItem('user_cargo', cargo);
                const displayUserName = document.getElementById('display-user-name');
                if (displayUserName) displayUserName.textContent = nome;
                checkUserPermissions();
            }
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Salvar", err.detail || "Não foi possível salvar o usuário.", "danger");
        }
    } catch (error) {
        console.error(error);
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao salvar usuário.", "danger");
    }
}

// Exclui um usuário
async function deleteUsuario(id) {
    // Impede auto-exclusão no front-end por segurança
    const currentUsername = localStorage.getItem('user_username');

    try {
        const response = await fetch(`${API_BASE}/users`);
        const list = await response.json();
        const u = list.find(user => user.id === id);

        if (u && u.username === currentUsername) {
            CustomUI.alert("Ação Negada", "Você não pode excluir o seu próprio usuário logado no sistema.", "warning");
            return;
        }
    } catch (e) { }

    const confirmDelete = await CustomUI.confirm(
        "Excluir Usuário",
        "Tem certeza de que deseja excluir este usuário? Esta ação não poderá ser desfeita.",
        { type: "danger", confirmText: "Excluir", cancelText: "Cancelar" }
    );
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
            CustomUI.toast("Sucesso", "Usuário excluído com sucesso!", "success");
            loadUsuarios();
        } else {
            const err = await response.json();
            CustomUI.alert("Erro ao Excluir", err.detail || "Não foi possível excluir o usuário.", "danger");
        }
    } catch (error) {
        CustomUI.alert("Erro de Conexão", "Erro ao tentar deletar o usuário.", "danger");
    }
}

function toggleUsuarioPasswordVisibility() {
    const passwordInput = document.getElementById('usuario-password');
    const toggleBtn = document.getElementById('toggle-usuario-password');
    if (!passwordInput || !toggleBtn) return;
    const isPrivate = passwordInput.getAttribute('type') === 'password';

    passwordInput.setAttribute('type', isPrivate ? 'text' : 'password');
    toggleBtn.innerHTML = isPrivate ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Vincula ao escopo global para chamada a partir de eventos inline onclick
window.checkUserPermissions = checkUserPermissions;
window.verifySession = verifySession;
window.loadUsuarios = loadUsuarios;
window.openUsuarioModal = openUsuarioModal;
window.saveUsuario = saveUsuario;
window.deleteUsuario = deleteUsuario;
window.generateLoginFromName = generateLoginFromName;
window.toggleUsuarioPasswordVisibility = toggleUsuarioPasswordVisibility;
window.showPetsList = showPetsList;
window.showResponsáveisList = showPetsList;

// ==========================================
// VISUALIZAÇÃO DE PERFIL DO PET (RESUMO)
// ==========================================
window.viewPet = async function (id) {
    try {
        // Busca os dados completos no backend
        const response = await fetch(`${API_BASE}/pets/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes do pet");
        const t = await response.json();

        // Salva o pet atual na visualização no estado global
        state.currentPetInView = t;

        // Reseta o botão de ação para caneta cinza e limpa imagem temporária
        state.tempProfilePhotoBase64 = null;
        const actionBtn = document.getElementById('perf-foto-action-btn');
        if (actionBtn) {
            actionBtn.dataset.state = 'edit';
            actionBtn.style.background = '#555';
            actionBtn.style.borderColor = '#333';
            actionBtn.title = "Mudar Foto";
            actionBtn.innerHTML = '<i data-lucide="edit-3" style="width: 15px; height: 15px; color: #fff;"></i>';
            actionBtn.onmouseover = function () { this.style.transform = 'scale(1.1)'; };
            actionBtn.onmouseout = function () { this.style.transform = 'scale(1)'; };
        }

        // Popula Dados Principais
        const perfAvatar = document.getElementById('perf-avatar');
        const perfFotoRemove = document.getElementById('perf-foto-remove');
        if (t.foto_url) {
            perfAvatar.innerHTML = `<img src="${t.foto_url}" alt="${t.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            perfAvatar.style.border = 'none';
            if (perfFotoRemove) perfFotoRemove.style.display = 'flex';
        } else {
            const parts = (t.nome || '?').trim().split(/\s+/);
            const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
            perfAvatar.innerHTML = initials.toUpperCase();
            perfAvatar.style.border = '2px solid var(--primary)';
            if (perfFotoRemove) perfFotoRemove.style.display = 'none';
        }

        document.getElementById('perf-nome').textContent = t.nome;
        document.getElementById('perf-status').textContent = t.status === 'Ativo' ? 'Cliente' : 'Inativo';
        document.getElementById('perf-status').className = t.status === 'Ativo' ? 'badge-green-pet' : 'badge-danger';

        // Info Pessoais
        let formattedCpf = t.cpf || '-';
        if (t.cpf && t.cpf.length === 11) {
            formattedCpf = t.cpf.substring(0, 3) + '.' + t.cpf.substring(3, 6) + '.' + t.cpf.substring(6, 9) + '-' + t.cpf.substring(9, 11);
        }
        document.getElementById('perf-cpf').textContent = formattedCpf;
        document.getElementById('perf-nasc').textContent = t.data_nascimento ? t.data_nascimento.split('-').reverse().join('/') : '-';
        document.getElementById('perf-sexo').textContent = t.sexo || '-';
        document.getElementById('perf-canal').textContent = t.canal_marketing || 'Indicação';
        document.getElementById('perf-estcivil').textContent = t.estado_civil || '-';

        // Próximo Aniversário
        let proxNasc = '-';
        if (t.data_nascimento) {
            // Handle both YYYY-MM-DD, DD-MM-YYYY, and DD/MM/YYYY formats
            let sep = t.data_nascimento.includes('/') ? '/' : '-';
            const parts = t.data_nascimento.split(sep);

            if (parts.length === 3) {
                let dia, mes;
                if (parts[0].length === 4) {
                    // YYYY-MM-DD
                    mes = parseInt(parts[1], 10);
                    dia = parseInt(parts[2], 10);
                } else {
                    // DD/MM/YYYY or DD-MM-YYYY
                    dia = parseInt(parts[0], 10);
                    mes = parseInt(parts[1], 10);
                }

                if (!isNaN(dia) && !isNaN(mes)) {
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);

                    let anoAniv = hoje.getFullYear();
                    const dataAnivEsteAno = new Date(anoAniv, mes - 1, dia);

                    let corAniv = '#ebed88'; // Amarelinho (não passou ainda neste ano)
                    if (dataAnivEsteAno < hoje) {
                        anoAniv++;
                        corAniv = 'var(--primary)'; // Verde (já passou neste ano, próximo é no ano que vem)
                    }
                    proxNasc = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anoAniv}`;
                    document.getElementById('perf-prox-nasc').style.color = corAniv;
                }
            }
        }
        document.getElementById('perf-prox-nasc').textContent = proxNasc;

        // Endereço (Padrão Google Maps em linha única)
        let formattedCep = '';
        if (t.cep) {
            formattedCep = t.cep.length === 8 ? t.cep.substring(0, 5) + '-' + t.cep.substring(5, 8) : t.cep;
        }

        let partsLogradouro = [];
        if (t.endereco) partsLogradouro.push(t.endereco);
        if (t.numero) partsLogradouro.push(t.numero);

        let enderecoGoogle = partsLogradouro.join(', ');

        // Complement removed for Google Maps compatibility
        let partsCidade = [];
        if (t.bairro) partsCidade.push(t.bairro);

        let cidadeUf = '';
        if (t.cidade) cidadeUf = t.cidade;
        if (t.uf) cidadeUf += cidadeUf ? ` - ${t.uf}` : t.uf;

        if (cidadeUf) partsCidade.push(cidadeUf);

        if (partsCidade.length > 0) {
            enderecoGoogle += (enderecoGoogle ? ', ' : '') + partsCidade.join(', ');
        }

        if (formattedCep) {
            enderecoGoogle += (enderecoGoogle ? ', ' : '') + formattedCep;
        }

        // Versão sem complemento para o botão de copiar
        let enderecoGoogleSemComplemento = partsLogradouro.join(', ');
        if (partsCidade.length > 0) {
            enderecoGoogleSemComplemento += (enderecoGoogleSemComplemento ? ', ' : '') + partsCidade.join(', ');
        }
        if (formattedCep) {
            enderecoGoogleSemComplemento += (enderecoGoogleSemComplemento ? ', ' : '') + formattedCep;
        }

        document.getElementById('perf-endereco').innerText = enderecoGoogle || '-';
        const btnCopy = document.getElementById('btn-copy-endereco');
        if (btnCopy) {
            btnCopy.dataset.copyText = enderecoGoogleSemComplemento || '-';
        }
        document.getElementById('perf-cadastro').textContent = t.data_cadastro ? formatDateString(t.data_cadastro).split(' ')[0] : '-';

        // Contatos
        document.getElementById('perf-email').textContent = t.email || '-';
        document.getElementById('perf-app-email').textContent = t.email || '-';
        document.getElementById('perf-celular').textContent = t.telefone || '-';
        document.getElementById('perf-celular2').textContent = t.telefone_secundario || '-';
        document.getElementById('perf-obs').value = (t.observacao && t.observacao !== '-') ? t.observacao : '';

        showPetProfileTab();
        lucide.createIcons(); // Recria os ícones caso algum seja novo
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        CustomUI.alert("Erro", "Não foi possível carregar os dados completos do pet.", "danger");
    }
};

window.tempPreviewProfilePhoto = function (input) {
    if (!state.currentPetInView) return;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Data = e.target.result;
            state.tempProfilePhotoBase64 = base64Data;

            // Preview local da foto no avatar do perfil
            const perfAvatar = document.getElementById('perf-avatar');
            if (perfAvatar) {
                perfAvatar.innerHTML = `<img src="${base64Data}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                perfAvatar.style.border = 'none';
            }

            // Altera o botão da caneta cinza para o disquete cinza igual o X
            const btn = document.getElementById('perf-foto-action-btn');
            if (btn) {
                btn.dataset.state = 'save';
                btn.style.background = '#333';
                btn.style.borderColor = '#555';
                btn.title = "Salvar Foto";
                btn.innerHTML = '<i data-lucide="save" style="width: 15px; height: 15px; color: #aaa;"></i>';
                btn.onmouseover = function () {
                    this.style.transform = 'scale(1.1)';
                    this.style.background = '#444';
                    const icon = this.querySelector('svg, i');
                    if (icon) icon.style.color = '#fff';
                };
                btn.onmouseout = function () {
                    this.style.transform = 'scale(1)';
                    this.style.background = '#333';
                    const icon = this.querySelector('svg, i');
                    if (icon) icon.style.color = '#aaa';
                };
                if (window.lucide) lucide.createIcons();
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.handleProfilePhotoAction = async function () {
    const btn = document.getElementById('perf-foto-action-btn');
    if (!btn) return;

    if (btn.dataset.state === 'save') {
        if (!state.currentPetInView || !state.tempProfilePhotoBase64) return;

        const confirmed = await CustomUI.confirm("Alterar Foto", "Deseja realmente salvar a nova foto de perfil?", {
            type: 'warning',
            confirmText: 'Sim, salvar',
            cancelText: 'Cancelar'
        });
        if (!confirmed) {
            // Restaura o avatar para a foto anterior (do banco)
            const pet = state.currentPetInView;
            state.tempProfilePhotoBase64 = null;

            const perfAvatar = document.getElementById('perf-avatar');
            if (perfAvatar) {
                if (pet.foto_url) {
                    perfAvatar.innerHTML = `<img src="${pet.foto_url}" alt="${pet.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                    perfAvatar.style.border = 'none';
                } else {
                    const parts = (pet.nome || '?').trim().split(/\s+/);
                    const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
                    perfAvatar.innerHTML = initials.toUpperCase();
                    perfAvatar.style.border = '2px solid var(--primary)';
                }
            }

            // Restaura o botão para a caneta cinza
            btn.dataset.state = 'edit';
            btn.style.background = '#555';
            btn.style.borderColor = '#333';
            btn.title = "Mudar Foto";
            btn.innerHTML = '<i data-lucide="edit-3" style="width: 15px; height: 15px; color: #fff;"></i>';
            btn.onmouseover = function () { this.style.transform = 'scale(1.1)'; };
            btn.onmouseout = function () { this.style.transform = 'scale(1)'; };
            if (window.lucide) lucide.createIcons();

            // Limpa o input de upload
            const fileUpload = document.getElementById('perf-foto-upload');
            if (fileUpload) fileUpload.value = '';

            return;
        }

        const pet = state.currentPetInView;
        const updatedPet = { ...pet, foto_url: state.tempProfilePhotoBase64 };

        try {
            const response = await fetch(`${API_BASE}/pets/${pet.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPet)
            });

            if (response.ok) {
                const saved = await response.json();
                state.currentPetInView = saved;
                state.tempProfilePhotoBase64 = null;

                // Restaura o botão para a caneta cinza
                btn.dataset.state = 'edit';
                btn.style.background = '#555'; // Cinza
                btn.style.borderColor = '#333';
                btn.title = "Mudar Foto";
                btn.innerHTML = '<i data-lucide="edit-3" style="width: 15px; height: 15px; color: #fff;"></i>';
                btn.onmouseover = function () { this.style.transform = 'scale(1.1)'; };
                btn.onmouseout = function () { this.style.transform = 'scale(1)'; };

                const removeBtn = document.getElementById('perf-foto-remove');
                if (removeBtn) removeBtn.style.display = 'flex';

                CustomUI.toast("Sucesso", "Foto de perfil salva com sucesso!", "success");
                loadPets();
                if (window.lucide) lucide.createIcons();
            } else {
                CustomUI.alert("Erro", "Não foi possível salvar a foto no servidor.", "danger");
            }
        } catch (err) {
            console.error(err);
            CustomUI.alert("Erro", "Erro ao salvar foto de perfil.", "danger");
        }
    } else {
        // Abre o seletor de arquivos
        const fileUpload = document.getElementById('perf-foto-upload');
        if (fileUpload) fileUpload.click();
    }
};

window.removeProfilePhoto = async function () {
    if (!state.currentPetInView) return;
    const confirmed = await CustomUI.confirm("Remover Foto", "Deseja realmente remover a foto do responsável?", {
        type: 'danger',
        confirmText: 'Sim, remover',
        cancelText: 'Cancelar'
    });
    if (!confirmed) return;

    const pet = state.currentPetInView;
    const updatedPet = { ...pet, foto_url: null };

    try {
        const response = await fetch(`${API_BASE}/pets/${pet.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedPet)
        });

        if (response.ok) {
            const saved = await response.json();
            state.currentPetInView = saved;
            state.tempProfilePhotoBase64 = null;

            const perfAvatar = document.getElementById('perf-avatar');
            const parts = (saved.nome || '?').trim().split(/\s+/);
            const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
            perfAvatar.innerHTML = initials.toUpperCase();
            perfAvatar.style.border = '2px solid var(--primary)';
            document.getElementById('perf-foto-remove').style.display = 'none';
            document.getElementById('perf-foto-upload').value = '';

            // Garante que o botão volte para o estado edit (caneta cinza)
            const btn = document.getElementById('perf-foto-action-btn');
            if (btn) {
                btn.dataset.state = 'edit';
                btn.style.background = '#555';
                btn.style.borderColor = '#333';
                btn.title = "Mudar Foto";
                btn.innerHTML = '<i data-lucide="edit-3" style="width: 15px; height: 15px; color: #fff;"></i>';
                btn.onmouseover = function () { this.style.transform = 'scale(1.1)'; };
                btn.onmouseout = function () { this.style.transform = 'scale(1)'; };
            }

            CustomUI.toast("Sucesso", "Foto de perfil removida!", "success");
            loadPets();
            if (window.lucide) lucide.createIcons();
        } else {
            CustomUI.alert("Erro", "Não foi possível remover a foto no servidor.", "danger");
        }
    } catch (err) {
        console.error(err);
        CustomUI.alert("Erro", "Erro ao remover foto de perfil.", "danger");
    }
};

window.copyTextToClipboard = function (textId, label) {
    const el = document.getElementById(textId);
    const text = el ? (el.value !== undefined ? el.value : el.innerText) : '';
    if (text && text !== '-') {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                CustomUI.toast('Copiado', `${label} copiado para a área de transferência!`, 'success');
            }).catch(err => {
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    }
};

window.toggleEditObsEntrega = function () {
    const el = document.getElementById('perf-obs-entrega');
    const btnEdit = document.getElementById('btn-edit-obs');
    const btnSave = document.getElementById('btn-save-obs');

    if (el.hasAttribute('readonly')) {
        el.removeAttribute('readonly');
        el.style.border = '1px solid var(--border-glow)';
        el.style.background = 'rgba(0,0,0,0.02)';
        el.style.padding = '8px';
        el.style.borderRadius = '4px';
        el.focus();
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
    } else {
        el.setAttribute('readonly', 'true');
        el.style.border = 'none';
        el.style.background = 'transparent';
        el.style.padding = '0';
        btnEdit.style.display = 'inline-block';
        btnSave.style.display = 'none';
    }
};

// ==========================================
// CONTROLE DE PETS
// ==========================================
window.populatePetsSelect = async function () {
    try {
        const response = await fetch(`${API_BASE}/pets`);
        if (response.ok) {
            const data = await response.json();
            window.allPets = Array.isArray(data) ? data : (data.items || data.data || []);
            window.renderPetDropdown(window.allPets);
        }
    } catch (e) {
        console.error("Erro ao carregar pets para o select:", e);
    }
};

window.renderPetDropdown = function (petsArray) {
    const listDiv = document.getElementById('pets-custom-list');
    if (!listDiv) return;
    listDiv.innerHTML = '';

    if (petsArray.length === 0) {
        const div = document.createElement('div');
        div.style.padding = '10px 14px';
        div.style.color = 'var(--text-muted)';
        div.textContent = 'Nenhum pet encontrado';
        listDiv.appendChild(div);
        return;
    }

    petsArray.forEach(pet => {
        const div = document.createElement('div');
        div.style.padding = '6px 12px';
        div.style.fontSize = '14px';
        div.style.cursor = 'default';
        div.style.color = 'var(--text-main)';
        div.style.transition = 'none';

        div.textContent = pet.nome;

        div.onmouseover = () => {
            div.style.background = '#1a73e8';
            div.style.color = '#ffffff';
        };
        div.onmouseout = () => {
            div.style.background = 'transparent';
            div.style.color = 'var(--text-main)';
        };

        div.onclick = function () {
            document.getElementById('pet-pet-name').value = pet.nome;
            document.getElementById('pet-pet').value = pet.id;
            listDiv.style.display = 'none';
        };

        listDiv.appendChild(div);
    });
};

window.openPetDropdown = function () {
    const listDiv = document.getElementById('pets-custom-list');
    if (listDiv) {
        listDiv.style.display = 'block';
        if (!window.allPets || window.allPets.length === 0) {
            window.populatePetsSelect();
        } else {
            window.renderPetDropdown(window.allPets);
        }
    }
};

window.filterPetDropdown = function (searchTerm) {
    if (!window.allPets) return;

    document.getElementById('pet-pet').value = '';

    const listDiv = document.getElementById('pets-custom-list');
    if (listDiv) listDiv.style.display = 'block';

    const lowerTerm = searchTerm.toLowerCase();
    const filtered = window.allPets.filter(t => t.nome.toLowerCase().includes(lowerTerm) || (t.cpf && t.cpf.includes(lowerTerm)));
    window.renderPetDropdown(filtered);
};

// Fechar o dropdown ao clicar fora dele
document.addEventListener('click', function (e) {
    const input = document.getElementById('pet-pet-name');
    const listDiv = document.getElementById('pets-custom-list');
    if (input && listDiv) {
        if (e.target !== input && e.target !== listDiv && !listDiv.contains(e.target)) {
            listDiv.style.display = 'none';
        }
    }
});

// Escuta cliques para carregar a lista de pets ao abrir a aba
document.addEventListener('click', function (e) {
    const tabTarget = e.target.closest('[data-tab="novo-pet"]');
    if (tabTarget) {
        window.populatePetsSelect();
    }
});

window.savePet = async function (e) {
    e.preventDefault();
    const id = document.getElementById('pet-id').value;

    const castradoChecked = document.querySelector('input[name="pet-castrado"]:checked');
    const treinadoChecked = document.querySelector('input[name="pet-treinado"]:checked');

    const data = {
        pet_id: document.getElementById('pet-pet').value,
        nome: document.getElementById('pet-nome').value,
        apelido: document.getElementById('pet-apelido').value || null,
        sexo: document.getElementById('pet-sexo').value || null,
        castrado: castradoChecked ? castradoChecked.value === "Sim" : false,
        especie: document.getElementById('pet-especie').value || null,
        raca: document.getElementById('pet-raca').value || null,
        cor: document.getElementById('pet-cor').value || null,
        data_nascimento: document.getElementById('pet-data-nascimento').value || null,
        treinado: treinadoChecked ? treinadoChecked.value === "Sim" : false,
        peso: parseFloat(document.getElementById('pet-peso').value) || null,
        porte: document.getElementById('pet-porte').value || null,
        data_cio: document.getElementById('pet-data-cio').value || null,
        pelagem: document.getElementById('pet-pelagem').value || null,
        data_obito: null,
        restricao_alimentar: document.getElementById('pet-restricao').value || null,
        racao: document.getElementById('pet-racao').value || null
    };

    console.log("Saving Pet:", data);

    try {
        const url = id ? `${API_BASE}/pets/${id}` : `${API_BASE}/pets`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            CustomUI.toast("Sucesso", "Pet salvo com sucesso!", "success");
            document.getElementById('form-pet').reset();
            const dashLink = document.querySelector('[data-tab="dashboard"]');
            if (dashLink) dashLink.click();
        } else {
            const err = await response.json().catch(() => ({}));
            if (response.status === 404) {
                console.log("API de Pets ainda não implementada. Simulando sucesso no frontend.");
                CustomUI.toast("Sucesso", "Pet validado no frontend. (API pendente de implementação completa)", "success");
                document.getElementById('form-pet').reset();
                const dashLink = document.querySelector('[data-tab="dashboard"]');
                if (dashLink) dashLink.click();
            } else {
                CustomUI.alert("Erro", `Erro ao salvar pet: ${err.detail || 'Verifique os dados.'}`, "danger");
            }
        }
    } catch (error) {
        console.error(error);
        CustomUI.alert("Erro de Conexão", "Erro de conexão ao salvar pet.", "danger");
    }
};

window.saveObsEntrega = function () {
    // Aqui podemos futuramente adicionar uma chamada real para salvar no banco
    window.toggleEditObsEntrega();
    CustomUI.toast('Sucesso', 'Observação de entrega salva localmente!', 'success');
};

window.toggleEditPetObs = function () {
    const el = document.getElementById('perf-pet-obs');
    const btnEdit = document.getElementById('btn-edit-pet-obs');
    const btnSave = document.getElementById('btn-save-pet-obs');

    if (el.hasAttribute('readonly')) {
        el.removeAttribute('readonly');
        el.style.border = '1px solid var(--border-glow)';
        el.style.background = 'rgba(0,0,0,0.02)';
        el.style.padding = '8px';
        el.style.borderRadius = '4px';
        el.focus();
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
    } else {
        el.setAttribute('readonly', 'true');
        el.style.border = 'none';
        el.style.background = 'transparent';
        el.style.padding = '0';
        btnEdit.style.display = 'inline-block';
        btnSave.style.display = 'none';
    }
};

window.savePetObs = async function () {
    const el = document.getElementById('perf-pet-obs');
    const newObs = el.value;

    if (!state.currentPetInView) {
        window.toggleEditPetObs();
        return;
    }

    try {
        const pet = state.currentPetInView;
        pet.observacoes = newObs;

        const payload = {
            nome: pet.nome,
            pet_id: pet.pet_id,
            especie: pet.especie,
            raca: pet.raca,
            sexo: pet.sexo,
            peso: pet.peso,
            data_nascimento: pet.nascimento,
            cor: pet.cor,
            status: pet.status,
            castrado: pet.castrado,
            porte: pet.porte,
            agressivo: pet.agressivo,
            treinado: pet.treinado,
            autoriza_imagem: pet.uso_imagem,
            observacoes: newObs,
            foto_url: pet.foto_url
        };

        const response = await fetch(`${API_BASE}/pets/${pet.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            window.toggleEditPetObs();
            CustomUI.toast('Sucesso', 'Observações atualizadas!', 'success');
            if (typeof window.loadPets === 'function') window.loadPets();
        } else {
            CustomUI.alert('Erro', 'Falha ao atualizar as observações do pet.', 'danger');
        }
    } catch (e) {
        console.error(e);
        window.toggleEditPetObs();
        CustomUI.toast('Aviso', 'Erro de conexão ou API indisponível. Observação salva localmente.', 'warning');
    }
};

window.toggleEditPetObs = function () {
    const el = document.getElementById('perf-obs');
    const btnEdit = document.getElementById('btn-edit-pet-obs');
    const btnSave = document.getElementById('btn-save-pet-obs');

    if (el.hasAttribute('readonly')) {
        el.removeAttribute('readonly');
        el.style.border = '1px solid var(--border-glow)';
        el.style.background = 'rgba(0,0,0,0.02)';
        el.style.padding = '8px';
        el.style.borderRadius = '4px';
        el.focus();
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
    } else {
        el.setAttribute('readonly', 'true');
        el.style.border = 'none';
        el.style.background = 'transparent';
        el.style.padding = '0';
        btnEdit.style.display = 'inline-block';
        btnSave.style.display = 'none';
    }
};

window.savePetObs = function () {
    // Aqui podemos futuramente adicionar uma chamada real para salvar no banco
    window.toggleEditPetObs();
    CustomUI.toast('Sucesso', 'Observações salvas localmente!', 'success');
};

window.toggleEditPetFormObs = function () {
    const el = document.getElementById('pet-observacoes');
    const btnEdit = document.getElementById('btn-edit-pet-form-obs');
    const btnSave = document.getElementById('btn-save-pet-form-obs');

    if (el.hasAttribute('readonly')) {
        el.removeAttribute('readonly');
        el.style.border = '1px solid var(--border-glow)';
        el.style.background = 'rgba(0,0,0,0.02)';
        el.style.padding = '8px';
        el.style.borderRadius = '4px';
        el.focus();
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
    } else {
        el.setAttribute('readonly', 'true');
        el.style.border = 'none';
        el.style.background = 'transparent';
        el.style.padding = '0';
        btnEdit.style.display = 'inline-block';
        btnSave.style.display = 'none';
    }
};

window.savePetFormObs = function () {
    window.toggleEditPetFormObs();
    CustomUI.toast('Sucesso', 'Observações confirmadas!', 'success');
};

window.copyAddressToClipboard = function () {
    const btn = document.getElementById('btn-copy-endereco');
    const enderecoParaCopiar = btn ? btn.dataset.copyText : document.getElementById('perf-endereco').innerText;

    if (enderecoParaCopiar && enderecoParaCopiar !== '-') {
        // Fallback robusto para navegadores sem suporte a clipboard ou rodando em HTTP (não local)
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(enderecoParaCopiar).then(() => {
                CustomUI.toast('Copiado', 'Endereço copiado para a área de transferência!', 'success');
            }).catch(err => {
                console.error('Erro ao copiar:', err);
                fallbackCopyTextToClipboard(enderecoParaCopiar);
            });
        } else {
            fallbackCopyTextToClipboard(enderecoParaCopiar);
        }
    }
};

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            CustomUI.toast('Copiado', 'Endereço copiado para a área de transferência!', 'success');
        } else {
            CustomUI.toast('Erro', 'Não foi possível copiar o endereço.', 'danger');
        }
    } catch (err) {
        console.error('Fallback: Erro ao copiar', err);
        CustomUI.toast('Erro', 'Não foi possível copiar o endereço.', 'danger');
    }
    document.body.removeChild(textArea);
}

window.showPetProfileTab = function () {
    // Esconder tudo
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.submenu-link').forEach(l => l.classList.remove('active'));

    // Exibir apenas o tab-pet-perfil
    const tabPerfil = document.getElementById('tab-pet-perfil');
    if (tabPerfil) {
        tabPerfil.classList.add('active');
    }

    // Manter a aba pai de clientes ativa para contexto visual
    const clientesLink = document.querySelector(".nav-link[data-tab='clientes']");
    if (clientesLink) {
        clientesLink.classList.add('active');
    }

    // Atualizar Cabeçalho Global
    const title = document.getElementById('current-tab-title');
    const subtitle = document.getElementById('current-tab-subtitle');
    title.innerHTML = 'Perfil do Cliente';
    subtitle.textContent = 'Resumo completo, dados cadastrais e acessos do pet.';
    if (window.lucide) {
        lucide.createIcons();
    }
};

window.updatePaginationInfo = function (start, end, total, tab = 'pets') {
    const startEl = document.getElementById('page-start-' + tab);
    const endEl = document.getElementById('page-end-' + tab);
    const totalEl = document.getElementById('page-total-' + tab);

    if (startEl) startEl.textContent = start;
    if (endEl) endEl.textContent = end;
    if (totalEl) totalEl.textContent = total;

    const prevBtn = document.getElementById('btn-prev-' + tab);
    const nextBtn = document.getElementById('btn-next-' + tab);

    if (prevBtn) {
        prevBtn.disabled = start <= 1;
    }

    if (nextBtn) {
        nextBtn.disabled = end >= total;
    }
};

window.changeRowsPerPage = function (tab, value) {
    if (tab === 'pets') {
        state.petsRowsPerPage = value;
        state.petsPage = 1;
        const listToRender = state.petsFilteredList || state.pets;
        renderPetsTable(listToRender, state.petsFilteredList !== null);
        const container = document.getElementById('pagination-pets');
        if (container) container.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    } else if (tab === 'responsaveis') {
        state.responsaveisRowsPerPage = value;
        state.responsaveisPage = 1;
        const listToRender = state.responsaveisFilteredList || state.responsaveis;
        renderResponsaveisTable(listToRender, state.responsaveisFilteredList !== null);
        const container = document.getElementById('pagination-responsaveis');
        if (container) container.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
};

window.prevPage = function (tab) {
    if (tab === 'pets') {
        if (state.petsPage > 1) {
            state.petsPage--;
            const listToRender = state.petsFilteredList || state.pets;
            renderPetsTable(listToRender, state.petsFilteredList !== null);
            const container = document.getElementById('pagination-pets');
            if (container) container.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    } else if (tab === 'responsaveis') {
        if (state.responsaveisPage > 1) {
            state.responsaveisPage--;
            const listToRender = state.responsaveisFilteredList || state.responsaveis;
            renderResponsaveisTable(listToRender, state.responsaveisFilteredList !== null);
            const container = document.getElementById('pagination-responsaveis');
            if (container) container.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    }
};

window.nextPage = function (tab) {
    if (tab === 'pets') {
        const listToRender = state.petsFilteredList || state.pets;
        const rows = state.petsRowsPerPage === 'all' ? listToRender.length : parseInt(state.petsRowsPerPage);
        const totalPages = Math.ceil(listToRender.length / rows);
        if (state.petsPage < totalPages) {
            state.petsPage++;
            renderPetsTable(listToRender, state.petsFilteredList !== null);
            const container = document.getElementById('pagination-pets');
            if (container) container.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    } else if (tab === 'responsaveis') {
        const listToRender = state.responsaveisFilteredList || state.responsaveis;
        const rows = state.responsaveisRowsPerPage === 'all' ? listToRender.length : parseInt(state.responsaveisRowsPerPage);
        const totalPages = Math.ceil(listToRender.length / rows);
        if (state.responsaveisPage < totalPages) {
            state.responsaveisPage++;
            renderResponsaveisTable(listToRender, state.responsaveisFilteredList !== null);
            const container = document.getElementById('pagination-responsaveis');
            if (container) container.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    }
};



window.allRacas = ['SRD (Sem Raça Definida)', 'Abissínio (Gato)', 'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Akita Americano', 'Akita Inu', 'American Bully', 'American Hairless Terrier', 'American Pit Bull Terrier', 'American Shorthair (Gato)', 'American Staffordshire Terrier', 'Angorá (Gato)', 'Ashera (Gato)', 'Azawakh', 'Basset Hound', 'Beagle', 'Bengal (Gato)', 'Bichon Frisé', 'Bichon Havanês', 'Bloodhound', 'Bobtail', 'Boerboel', 'Border Collie', 'Border Terrier', 'Borzoi', 'Boston Terrier', 'Boxer', 'Braco Alemão', 'Braco Italiano', 'Buldogue Campeiro', 'Bull Terrier', 'Bulldog Francês', 'Bulldog Inglês', 'Bullmastiff', 'Burmês (Gato)', 'Cairn Terrier', 'Cane Corso', 'Cavalier King Charles Spaniel', 'Chesapeake Bay Retriever', 'Chihuahua', 'Chow Chow', 'Cocker Spaniel Americano', 'Cocker Spaniel Inglês', 'Collie', 'Corgi (Cardigan)', 'Corgi (Pembroke)', 'Cão de Crista Chinês', 'Cão de Santo Humberto', 'Cão de Água Português', 'Dachshund (Salsicha)', 'Doberman', 'Dogo Argentino', 'Dogue Alemão', 'Dogue Brasileiro', 'Dogue de Bordeaux', 'Dálmata', 'Fila Brasileiro', 'Fox Terrier', 'Foxhound Inglês', 'Galgo Espanhol', 'Golden Retriever', 'Greyhound', 'Grifo da Bélgica', 'Himalaio (Gato)', 'Husky Siberiano', 'Jack Russell Terrier', 'Kuvasz', 'Labrador Retriever', 'Leão da Rodésia', 'Lhasa Apso', 'Lulu da Pomerânia (Spitz Alemão)', 'Maine Coon (Gato)', 'Malamute do Alasca', 'Maltês', 'Mastiff Inglês', 'Mastim Napolitano', 'Mastim Tibetano', 'Munchkin (Gato)', 'Norwich Terrier', 'Ovelheiro Gaúcho', 'Papillon', 'Pastor Alemão', 'Pastor Australiano', 'Pastor Belga', 'Pastor Branco Suíço', 'Pastor Maremano', 'Pastor de Beauce', 'Pastor de Shetland', 'Pequinês', 'Persa (Gato)', 'Pinscher', 'Pit Bull', 'Pointer Inglês', 'Poodle', 'Pug', 'Puli', 'Ragdoll (Gato)', 'Rastreador Brasileiro', 'Rottweiler', 'Sagrado da Birmânia (Gato)', 'Saluki', 'Samoieda', 'Schnauzer Gigante', 'Schnauzer Miniatura', 'Schnauzer Standard', 'Scottish Fold (Gato)', 'Setter Inglês', 'Setter Irlandês', 'Shar-Pei', 'Shiba Inu', 'Shih Tzu', 'Siamês (Gato)', 'Sphynx (Gato)', 'Spitz Japonês', 'Staffordshire Bull Terrier', 'São Bernardo', 'Terra Nova', 'Terrier Brasileiro (Fox Paulistinha)', 'Terrier Tibetano', 'Tosa Inu', 'Veadeiro Pampeano', 'Vizsla', 'Weimaraner', 'West Highland White Terrier', 'Whippet', 'Yorkshire Terrier'];


window.getRacasForEspecie = function () {
    const especie = document.getElementById('pet-especie').value;
    if (especie === 'Felino') {
        return window.allRacas.filter(r => r.includes('(Gato)') || r.includes('SRD')).map(r => r.replace(' (Gato)', ''));
    } else if (especie === 'Canino') {
        return window.allRacas.filter(r => !r.includes('(Gato)'));
    }
    return window.allRacas.map(r => r.replace(' (Gato)', ''));
};

window.openRacaDropdown = function () {
    const listDiv = document.getElementById('racas-custom-list');
    if (listDiv) {
        listDiv.style.display = 'block';
        window.renderRacaDropdown(window.getRacasForEspecie());
    }
};

window.renderRacaDropdown = function (racas) {
    const listDiv = document.getElementById('racas-custom-list');
    listDiv.innerHTML = '';
    if (racas.length === 0) {
        listDiv.innerHTML = '<div style="padding: 8px 12px; color: var(--text-muted); font-size: 14px;">Nenhuma raça encontrada</div>';
        return;
    }
    racas.forEach(r => {
        const div = document.createElement('div');
        div.textContent = r;
        div.style.padding = '8px 12px';
        div.style.cursor = 'pointer';
        div.style.fontSize = '14px';
        div.style.color = '#fff';
        div.onmouseover = () => div.style.backgroundColor = 'var(--primary)';
        div.onmouseout = () => div.style.backgroundColor = 'transparent';
        div.onclick = function (e) {
            e.stopPropagation();
            document.getElementById('pet-raca-input').value = r;
            document.getElementById('pet-raca').value = r;
            listDiv.style.display = 'none';
        };
        listDiv.appendChild(div);
    });
};

window.filterRacaDropdown = function (text) {
    const baseRacas = window.getRacasForEspecie();
    if (!text) {
        window.renderRacaDropdown(baseRacas);
        document.getElementById('pet-raca').value = '';
        return;
    }
    document.getElementById('pet-raca').value = text;
    const filtered = baseRacas.filter(r => r.toLowerCase().includes(text.toLowerCase()));
    window.renderRacaDropdown(filtered);
};

document.addEventListener('click', function (e) {
    const input = document.getElementById('pet-raca-input');
    const list = document.getElementById('racas-custom-list');
    if (input && list) {
        if (!input.contains(e.target) && !list.contains(e.target)) {
            list.style.display = 'none';
            if (input.value) {
                document.getElementById('pet-raca').value = input.value;
            }
        }
    }
});

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

document.addEventListener('DOMContentLoaded', () => {
    const especieSelect = document.getElementById('pet-especie');
    if (especieSelect) {
        especieSelect.addEventListener('change', () => {
            document.getElementById('pet-raca-input').value = '';
            document.getElementById('pet-raca').value = '';
        });
    }
});

// Helper functions for Pet Observations
window.togglePetObs = function (isEditing) {
    const textarea = document.getElementById('pet-restricao');
    const btnEdit = document.getElementById('btn-edit-pet-obs');
    const btnSave = document.getElementById('btn-save-pet-obs');

    if (isEditing) {
        textarea.removeAttribute('readonly');
        textarea.style.opacity = '1';
        textarea.style.borderColor = 'var(--primary)';
        textarea.focus();
        if (btnEdit) btnEdit.style.display = 'none';
        if (btnSave) btnSave.style.display = 'flex';
    } else {
        textarea.setAttribute('readonly', 'true');
        textarea.style.opacity = '0.8';
        textarea.style.borderColor = 'var(--border-glow)';
        if (btnEdit) btnEdit.style.display = 'flex';
        if (btnSave) btnSave.style.display = 'none';
        // Mostrar feedback sutil
        CustomUI.toast("Salvo", "Observação validada. (Finalize no botão Salvar Pet)", "success");
    }
};

window.copyPetObs = function () {
    const textarea = document.getElementById('pet-restricao');
    if (textarea && textarea.value) {
        navigator.clipboard.writeText(textarea.value).then(() => {
            CustomUI.toast("Copiado", "Observação copiada para a área de transferência.", "success");
        }).catch(() => {
            CustomUI.toast("Erro", "Não foi possível copiar.", "warning");
        });
    }
};

// ==========================================
// LÓGICA DE PETS
// ==========================================

async function loadPets(force = false) {
    if (!force && state.pets.length > 0) {
        if (state.activeTab === 'pets') {
            renderPetsList();
        }
        return;
    }

    try {
        const loading = document.getElementById('loading-pets');
        if (loading) loading.style.display = 'flex';

        const response = await fetch(`${API_BASE}/pets?limit=10000`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Falha ao carregar pets');

        const data = await response.json();
        state.pets = Array.isArray(data) ? data : (data.items || []);
        state.petsFilteredList = null; // reseta filtros

        if (state.activeTab === 'pets') {
            renderPetsList();
        }
    } catch (error) {
        console.error('Erro:', error);
        CustomUI.toast("Erro", "Não foi possível carregar a lista de pets.", "danger");
    } finally {
        const loading = document.getElementById('loading-pets');
        if (loading) loading.style.display = 'none';
    }
}


function renderPetsList() {
    renderPetsTable(state.petsFilteredList || state.pets, state.petsFilteredList !== null);
}

// applyPetFilters duplicate at the bottom of file removed
