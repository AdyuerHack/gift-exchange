// ===== ESTADO DE LA APLICACIÓN =====
// Miembros hardcodeados
const HARDCODED_MEMBERS = [
    'El_adyuer',
    'Motita_de_algodon',
    'mirelis_maria',
    'Johelis_la_durmiente'
];

let appData = {
    members: HARDCODED_MEMBERS,
    assignments: {},
    revealed: [],
    isGenerated: false,
    adminPassword: '150304' // Contraseña predeterminada
};

let currentUser = null; // 'admin' o nombre del miembro
let isLoggedIn = false;

// ===== REFERENCIAS DOM =====
// Login View
const loginView = document.getElementById('loginView');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const memberLoginBtn = document.getElementById('memberLoginBtn');
const adminPasswordSection = document.getElementById('adminPasswordSection');
const memberNameSection = document.getElementById('memberNameSection');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const loginMemberSelect = document.getElementById('loginMemberSelect');
const memberLoginSubmitBtn = document.getElementById('memberLoginSubmitBtn');
const logoutSection = document.getElementById('logoutSection');
const logoutBtn = document.getElementById('logoutBtn');

// Admin View
const adminView = document.getElementById('adminView');
const memberInput = document.getElementById('memberInput');
const addButton = document.getElementById('addButton');
const membersList = document.getElementById('membersList');
const actionSection = document.getElementById('actionSection');
const statusSection = document.getElementById('statusSection');
const generateButton = document.getElementById('generateButton');
const resetButton = document.getElementById('resetButton');
const revealStatus = document.getElementById('revealStatus');
const passwordChangeSection = document.getElementById('passwordChangeSection');
const newPasswordInput = document.getElementById('newPasswordInput');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const viewAssignmentsBtn = document.getElementById('viewAssignmentsBtn');
const hideAssignmentsBtn = document.getElementById('hideAssignmentsBtn');
const assignmentsListSection = document.getElementById('assignmentsListSection');
const assignmentsList = document.getElementById('assignmentsList');

// Member View
const memberView = document.getElementById('memberView');
const memberSelect = document.getElementById('memberSelect');
const revealButton = document.getElementById('revealButton');
const assignmentSection = document.getElementById('assignmentSection');
const alreadyRevealedSection = document.getElementById('alreadyRevealedSection');
const giverName = document.getElementById('giverName');
const receiverName = document.getElementById('receiverName');
const pastGiver = document.getElementById('pastGiver');
const pastReceiver = document.getElementById('pastReceiver');

// ===== EVENT LISTENERS =====
// Login
adminLoginBtn.addEventListener('click', showAdminLogin);
memberLoginBtn.addEventListener('click', showMemberLogin);
loginSubmitBtn.addEventListener('click', submitAdminLogin);
adminPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAdminLogin();
});
loginMemberSelect.addEventListener('change', onLoginMemberSelect);
memberLoginSubmitBtn.addEventListener('click', submitMemberLogin);
logoutBtn.addEventListener('click', logout);

// Admin
addButton.addEventListener('click', addMember);
memberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addMember();
});
generateButton.addEventListener('click', generateSecretAssignments);
resetButton.addEventListener('click', resetAll);
changePasswordBtn.addEventListener('click', changePassword);
viewAssignmentsBtn.addEventListener('click', showAssignments);
hideAssignmentsBtn.addEventListener('click', hideAssignments);

// Member
memberSelect.addEventListener('change', onMemberSelect);
revealButton.addEventListener('click', revealAssignment);

// ===== INICIALIZACIÓN =====
loadFromStorage();
initializeApp();
showLoginView();

// ===== FUNCIONES DE AUTENTICACIÓN =====
function showAdminLogin() {
    adminPasswordSection.style.display = 'block';
    memberNameSection.style.display = 'none';
    adminPasswordInput.value = '';
    adminPasswordInput.focus();
}

function showMemberLogin() {
    adminPasswordSection.style.display = 'none';
    memberNameSection.style.display = 'block';

    // Poblar selector de miembros
    loginMemberSelect.innerHTML = '<option value="">-- Selecciona tu nombre --</option>';
    appData.members.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        loginMemberSelect.appendChild(option);
    });
}

function onLoginMemberSelect() {
    memberLoginSubmitBtn.disabled = loginMemberSelect.value === '';
}

function submitAdminLogin() {
    const password = adminPasswordInput.value;

    if (password === appData.adminPassword) {
        currentUser = 'admin';
        isLoggedIn = true;
        showAdminView();
        showNotification('Bienvenido, Administrador', 'success');
    } else {
        showNotification('Contraseña incorrecta', 'error');
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
    }
}

function submitMemberLogin() {
    const selectedName = loginMemberSelect.value;

    if (!selectedName) {
        showNotification('Selecciona tu nombre', 'error');
        return;
    }

    currentUser = selectedName;
    isLoggedIn = true;
    showMemberViewDirect();

    // Auto-revelar si no lo ha hecho
    if (!appData.revealed.includes(selectedName)) {
        setTimeout(() => {
            giverName.textContent = selectedName;
            receiverName.textContent = appData.assignments[selectedName];
            assignmentSection.style.display = 'block';

            // Marcar como revelado
            appData.revealed.push(selectedName);
            saveToStorage();

            showNotification('¡Esta es tu asignación!', 'success');
        }, 500);
    } else {
        // Ya reveló su asignación
        alreadyRevealedSection.style.display = 'block';
        pastGiver.textContent = selectedName;
        pastReceiver.textContent = appData.assignments[selectedName];
    }
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    showLoginView();
    showNotification('Sesión cerrada', 'info');
}

function showLoginView() {
    loginView.style.display = 'block';
    adminView.style.display = 'none';
    memberView.style.display = 'none';
    logoutSection.style.display = 'none';

    // Reset login sections
    adminPasswordSection.style.display = 'none';
    memberNameSection.style.display = 'none';
    adminPasswordInput.value = '';
    loginMemberSelect.value = '';
}

function showAdminView() {
    loginView.style.display = 'none';
    adminView.style.display = 'block';
    memberView.style.display = 'none';
    logoutSection.style.display = 'block';

    renderAdminView();
}

function showMemberViewDirect() {
    loginView.style.display = 'none';
    adminView.style.display = 'none';
    memberView.style.display = 'block';
    logoutSection.style.display = 'block';

    // Hide member selection (ya seleccionó en login)
    memberView.querySelector('.select-group').style.display = 'none';
    revealButton.style.display = 'none';

    // Reset sections
    assignmentSection.style.display = 'none';
    alreadyRevealedSection.style.display = 'none';
}

function changePassword() {
    const newPassword = newPasswordInput.value.trim();

    if (newPassword === '') {
        showNotification('Ingresa una nueva contraseña', 'error');
        return;
    }

    if (newPassword.length < 4) {
        showNotification('La contraseña debe tener al menos 4 caracteres', 'error');
        return;
    }

    appData.adminPassword = newPassword;
    saveToStorage();
    newPasswordInput.value = '';

    showNotification('Contraseña actualizada correctamente', 'success');
}

// ===== FUNCIONES ADMIN =====
function addMember() {
    const name = memberInput.value.trim();

    if (name === '') {
        showNotification('Por favor ingresa un nombre', 'error');
        return;
    }

    if (appData.members.includes(name)) {
        showNotification('Este nombre ya está en la lista', 'error');
        return;
    }

    appData.members.push(name);
    memberInput.value = '';
    memberInput.focus();

    saveToStorage();
    renderAdminView();
    showNotification(`${name} agregado correctamente`, 'success');
}

function removeMember(index) {
    const removedName = appData.members[index];
    appData.members.splice(index, 1);

    // Si ya había asignaciones generadas, marcarlas como no generadas
    if (appData.isGenerated) {
        appData.isGenerated = false;
        appData.assignments = {};
        appData.revealed = [];
        showNotification(`${removedName} eliminado. Debes generar nuevas asignaciones.`, 'info');
    } else {
        showNotification(`${removedName} eliminado de la lista`, 'info');
    }

    saveToStorage();
    renderAdminView();
    showNotification(`${removedName} eliminado de la lista`, 'info');
}

function generateSecretAssignments() {
    if (appData.members.length < 2) {
        showNotification('Necesitas al menos 2 miembros para generar asignaciones', 'error');
        return;
    }

    // Generar asignaciones
    let attempts = 0;
    const maxAttempts = 1000;
    let validAssignments = null;

    while (attempts < maxAttempts) {
        const assignments = {};
        const receivers = [...appData.members];
        let valid = true;

        for (let i = 0; i < appData.members.length; i++) {
            const giver = appData.members[i];

            // Filtrar receptores disponibles (no puede ser el mismo)
            const availableReceivers = receivers.filter(r => r !== giver);

            if (availableReceivers.length === 0) {
                valid = false;
                break;
            }

            // Seleccionar un receptor aleatorio
            const randomIndex = Math.floor(Math.random() * availableReceivers.length);
            const receiver = availableReceivers[randomIndex];

            assignments[giver] = receiver;

            // Remover el receptor de la lista
            const receiverIndex = receivers.indexOf(receiver);
            receivers.splice(receiverIndex, 1);
        }

        if (valid) {
            validAssignments = assignments;
            break;
        }

        attempts++;
    }

    if (!validAssignments) {
        showNotification('No se pudo generar una asignación válida. Intenta de nuevo.', 'error');
        return;
    }

    // Guardar asignaciones
    appData.assignments = validAssignments;
    appData.isGenerated = true;
    appData.revealed = [];

    saveToStorage();
    renderAdminView();
    showNotification('¡Asignaciones generadas exitosamente!', 'success');
}

function resetAll() {
    if (!confirm('¿Estás seguro de que quieres reiniciar todo? Se perderán todas las asignaciones.')) {
        return;
    }

    const currentPassword = appData.adminPassword;

    appData = {
        members: [],
        assignments: {},
        revealed: [],
        isGenerated: false,
        adminPassword: currentPassword // Mantener la contraseña actual
    };

    saveToStorage();
    renderAdminView();
    showNotification('Todo ha sido reiniciado', 'info');
}

function renderAdminView() {
    // Renderizar lista de miembros
    if (appData.members.length === 0) {
        membersList.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No hay miembros agregados aún</p>';
    } else {
        membersList.innerHTML = appData.members.map((name, index) => `
            <div class="member-item">
                <span class="member-name">${name}</span>
                <button class="remove-btn" onclick="removeMember(${index})">
                    ❌ Eliminar
                </button>
            </div>
        `).join('');
    }

    // Mostrar/ocultar secciones según el estado
    if (!appData.isGenerated) {
        actionSection.style.display = appData.members.length >= 2 ? 'block' : 'none';
        statusSection.style.display = 'none';
    } else {
        actionSection.style.display = 'none';
        statusSection.style.display = 'block';

        // Actualizar estado de revelaciones
        const totalMembers = appData.members.length;
        const revealedCount = appData.revealed.length;

        revealStatus.innerHTML = `
            <p><strong>${revealedCount}</strong> de <strong>${totalMembers}</strong> miembros han visto su asignación</p>
            ${appData.revealed.length > 0 ? `
                <p style="margin-top: 10px; font-size: 0.9rem;">
                    Han visto: ${appData.revealed.join(', ')}
                </p>
            ` : ''}
        `;
    }
}

// ===== FUNCIONES DE VISUALIZACIÓN DE ASIGNACIONES =====
function showAssignments() {
    // Renderizar lista de asignaciones
    assignmentsList.innerHTML = Object.entries(appData.assignments).map(([giver, receiver]) => `
        <div class="assignment-item">
            <span class="assignment-giver">${giver}</span>
            <span class="assignment-arrow">→</span>
            <span class="assignment-receiver">${receiver}</span>
        </div>
    `).join('');

    assignmentsListSection.style.display = 'block';
    viewAssignmentsBtn.style.display = 'none';
}

function hideAssignments() {
    assignmentsListSection.style.display = 'none';
    viewAssignmentsBtn.style.display = 'block';
}

// ===== FUNCIONES MIEMBRO (versión original, mantenida por compatibilidad) =====
function onMemberSelect() {
    const selectedName = memberSelect.value;

    assignmentSection.style.display = 'none';
    alreadyRevealedSection.style.display = 'none';

    if (selectedName === '') {
        revealButton.disabled = true;
        return;
    }

    // Verificar si ya reveló
    if (appData.revealed.includes(selectedName)) {
        alreadyRevealedSection.style.display = 'block';
        pastGiver.textContent = selectedName;
        pastReceiver.textContent = appData.assignments[selectedName];
        revealButton.disabled = true;
    } else {
        revealButton.disabled = false;
    }
}

function revealAssignment() {
    const selectedName = memberSelect.value;

    if (selectedName === '' || !appData.assignments[selectedName]) {
        showNotification('Selecciona un nombre válido', 'error');
        return;
    }

    if (appData.revealed.includes(selectedName)) {
        showNotification('Ya revelaste esta asignación', 'error');
        return;
    }

    // Mostrar asignación
    giverName.textContent = selectedName;
    receiverName.textContent = appData.assignments[selectedName];
    assignmentSection.style.display = 'block';

    // Marcar como revelado
    appData.revealed.push(selectedName);
    saveToStorage();

    // Deshabilitar botón
    revealButton.disabled = true;

    showNotification('¡Asignación revelada!', 'success');
}

// ===== PERSISTENCIA =====
function saveToStorage() {
    try {
        localStorage.setItem('giftExchangeData', JSON.stringify(appData));
    } catch (e) {
        console.error('Error al guardar en localStorage:', e);
        showNotification('Error al guardar datos', 'error');
    }
}

function loadFromStorage() {
    try {
        const saved = localStorage.getItem('giftExchangeData');
        if (saved) {
            const loadedData = JSON.parse(saved);
            // Asegurar que adminPassword existe y siempre usar miembros hardcodeados
            appData = {
                ...loadedData,
                members: HARDCODED_MEMBERS, // Siempre usar miembros hardcodeados
                adminPassword: loadedData.adminPassword || '150304'
            };
        } else {
            // Si no hay datos guardados, usar los valores por defecto
            appData.members = HARDCODED_MEMBERS;
        }
    } catch (e) {
        console.error('Error al cargar de localStorage:', e);
        showNotification('Error al cargar datos guardados', 'error');
    }
}

// Generador de números aleatorios con semilla (para asignaciones determinísticas)
function seededRandom(seed) {
    let state = seed;
    return function () {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

// Inicializar la aplicación y generar asignaciones si no existen
function initializeApp() {
    // Si no hay asignaciones generadas, generarlas automáticamente
    if (!appData.isGenerated || Object.keys(appData.assignments).length === 0) {
        generateSecretAssignmentsAuto();
    }
}

// Generar asignaciones automáticamente (sin notificación)
// Usa una semilla fija para que todos los dispositivos generen las mismas asignaciones
function generateSecretAssignmentsAuto() {
    if (appData.members.length < 2) {
        return;
    }

    // Semilla fija para generar las mismas asignaciones en todos los dispositivos
    // Cambiar esta semilla regenerará diferentes asignaciones
    const SEED = 20251218; // Fecha: 2025-12-18
    const random = seededRandom(SEED);

    // Generar asignaciones
    let attempts = 0;
    const maxAttempts = 1000;
    let validAssignments = null;

    while (attempts < maxAttempts) {
        const assignments = {};
        const receivers = [...appData.members];
        let valid = true;

        for (let i = 0; i < appData.members.length; i++) {
            const giver = appData.members[i];

            // Filtrar receptores disponibles (no puede ser el mismo)
            const availableReceivers = receivers.filter(r => r !== giver);

            if (availableReceivers.length === 0) {
                valid = false;
                break;
            }

            // Seleccionar un receptor usando el generador con semilla
            const randomIndex = Math.floor(random() * availableReceivers.length);
            const receiver = availableReceivers[randomIndex];

            assignments[giver] = receiver;

            // Remover el receptor de la lista
            const receiverIndex = receivers.indexOf(receiver);
            receivers.splice(receiverIndex, 1);
        }

        if (valid) {
            validAssignments = assignments;
            break;
        }

        attempts++;
    }

    if (validAssignments) {
        // Guardar asignaciones
        appData.assignments = validAssignments;
        appData.isGenerated = true;
        // No resetear revealed, mantener el historial
        saveToStorage();
    }
}

// ===== NOTIFICACIONES =====
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        max-width: 400px;
    `;

    const colors = {
        success: 'linear-gradient(135deg, #0f7c3f 0%, #0a5c2f 100%)',
        error: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        info: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)'
    };

    notification.style.background = colors[type] || colors.info;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Agregar animaciones CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
