// Sistema de Chamada de Senhas - Clínica ULTRAVIDA
// Versão Futurista

class PasswordSystem {
    constructor() {
        this.currentPassword = 0;
        this.offices = [
            { number: 1, name: "Cardiologia", doctor: "Dr. João Silva", color: "#007bff", queue: [], currentPatient: null },
            { number: 2, name: "Pediatria", doctor: "Dra. Maria Santos", color: "#28a745", queue: [], currentPatient: null },
            { number: 3, name: "Ortopedia", doctor: "Dr. Carlos Lima", color: "#fd7e14", queue: [], currentPatient: null },
            { number: 4, name: "Dermatologia", doctor: "Dra. Ana Costa", color: "#6f42c1", queue: [], currentPatient: null },
            { number: 5, name: "Clínica Geral", doctor: "Dr. Pedro Oliveira", color: "#17a2b8", queue: [], currentPatient: null }
        ];
        this.recentCalls = [];
        this.currentUser = null;
        this.isLoggedIn = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateClock();
        this.renderOffices();
        this.updateDisplay();
        this.loadClinicInfo(); // Carregar informações da clínica
        
        // Atualizar relógio a cada segundo
        setInterval(() => this.updateClock(), 1000);
        
        // Carregar dados salvos
        this.loadData();
    }

    // Salvar informações da clínica
    saveClinicInfo() {
        const clinicInfo = {
            name: document.getElementById("clinicName").value,
            city: document.getElementById("clinicCity").value,
            phone: document.getElementById("clinicPhone").value,
            address: document.getElementById("clinicAddress").value,
            slogan: document.getElementById("clinicSlogan").value
        };
        localStorage.setItem("clinicInfo", JSON.stringify(clinicInfo));
        this.loadClinicInfo();
        this.showNotification("Informações da clínica salvas com sucesso!", "success");
    }

    // Carregar informações da clínica
    loadClinicInfo() {
        const clinicInfo = JSON.parse(localStorage.getItem("clinicInfo"));
        if (clinicInfo) {
            document.getElementById("clinicName").value = clinicInfo.name || "CLÍNICA ULTRAVIDA";
            document.getElementById("clinicCity").value = clinicInfo.city || "Piracuruca";
            document.getElementById("clinicPhone").value = clinicInfo.phone || "(86) 99985-2080";
            document.getElementById("clinicAddress").value = clinicInfo.address || "Rua Senador Gervásio, Centro";
            document.getElementById("clinicSlogan").value = clinicInfo.slogan || "";

            // Atualizar informações no header
            document.querySelector(".clinic-title").textContent = clinicInfo.name;
            document.querySelector(".clinic-location").textContent = `${clinicInfo.city} • ${clinicInfo.phone} • ${clinicInfo.address}`;
        }
    }

    // Alterar senha
    changePassword() {
        const currentPass = document.getElementById("currentPassword").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmPassword").value;

        // Por simplicidade, a senha atual é fixa para demonstração
        if (currentPass !== "Gilvane1*") {
            this.showNotification("Senha atual incorreta!", "error");
            return;
        }

        if (newPass.length < 6) {
            this.showNotification("A nova senha deve ter pelo menos 6 caracteres!", "error");
            return;
        }

        if (newPass !== confirmPass) {
            this.showNotification("A nova senha e a confirmação não coincidem!", "error");
            return;
        }

        // Atualizar a senha (em um sistema real, isso seria feito no backend)
        // Para esta demonstração, apenas notificamos o sucesso
        this.showNotification("Senha alterada com sucesso! (Funcionalidade de demonstração)", "success");
        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";
    }

    // Resetar sistema
    resetSystem() {
        this.showConfirmModal("Tem certeza que deseja RESETAR o sistema? Todos os dados serão perdidos!", () => {
            localStorage.clear();
            location.reload();
        });
    }

    setupEventListeners() {
        // Login
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });

        // Formulários
        document.getElementById('officeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOffice();
        });

        document.getElementById('patientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPatient();
        });

        // Modal de confirmação
        document.getElementById('btnConfirm').addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
                this.closeConfirmModal();
            }
        });

        document.getElementById('btnCancel').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        // Volume slider
        const volumeSlider = document.getElementById('soundVolume');
        const volumeValue = document.getElementById('volumeValue');
        
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', (e) => {
                volumeValue.textContent = e.target.value + '%';
            });
        }
    }

    // Autenticação
    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Credenciais simples para demonstração
        if (username === 'Gilvane' && password === 'Gilvane1*') {
            this.currentUser = username;
            this.isLoggedIn = true;
            this.showMainSystem();
            this.showNotification('Login realizado com sucesso!', 'success');
        } else {
            this.showNotification('Usuário ou senha incorretos!', 'error');
        }
    }

    logout() {
        this.showConfirmModal('Tem certeza que deseja sair do sistema?', () => {
            this.currentUser = null;
            this.isLoggedIn = false;
            this.showLoginScreen();
            this.showNotification('Logout realizado com sucesso!', 'success');
        });
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainSystem').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    showMainSystem() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainSystem').style.display = 'block';
        this.updateDisplay();
    }

    // Gerenciamento de Consultórios
    saveOffice() {
        const number = parseInt(document.getElementById('officeNumber').value);
        const name = document.getElementById('officeName').value;
        const doctor = document.getElementById('officeDoctor').value;
        const color = document.getElementById('officeColor').value;

        if (!number || !name || !doctor) {
            this.showNotification('Preencha todos os campos obrigatórios!', 'error');
            return;
        }

        const existingOffice = this.offices.find(o => o.number === number);
        
        if (existingOffice) {
            existingOffice.name = name;
            existingOffice.doctor = doctor;
            existingOffice.color = color;
            this.showNotification('Consultório atualizado com sucesso!', 'success');
        } else {
            this.offices.push({
                number: number,
                name: name,
                doctor: doctor,
                color: color,
                queue: [],
                currentPatient: null
            });
            this.showNotification('Consultório adicionado com sucesso!', 'success');
        }

        this.renderOffices();
        this.updatePatientOfficeSelect();
        this.clearOfficeForm();
        this.saveData();
    }

    // Editar consultório
    editOffice(officeNumber) {
        const office = this.offices.find(o => o.number === officeNumber);
        if (!office) {
            this.showNotification('Consultório não encontrado!', 'error');
            return;
        }

        // Preencher formulário com dados do consultório
        document.getElementById('officeNumber').value = office.number;
        document.getElementById('officeName').value = office.name;
        document.getElementById('officeDoctor').value = office.doctor;
        document.getElementById('officeColor').value = office.color;

        // Abrir modal de configuração na aba de consultórios
        this.openConfigPanel();
        this.switchTab('offices');
        
        this.showNotification('Dados do consultório carregados para edição!', 'info');
    }

    // Excluir consultório
    deleteOffice(officeNumber) {
        const office = this.offices.find(o => o.number === officeNumber);
        if (!office) {
            this.showNotification('Consultório não encontrado!', 'error');
            return;
        }

        if (office.queue.length > 0) {
            this.showNotification('Não é possível excluir consultório com pacientes na fila!', 'error');
            return;
        }

        this.showConfirmModal(`Tem certeza que deseja excluir o consultório ${office.number} - ${office.name}?`, () => {
            this.offices = this.offices.filter(o => o.number !== officeNumber);
            this.renderOffices();
            this.updateDisplay();
            this.saveData();
            this.showNotification('Consultório excluído com sucesso!', 'success');
        });
    }

    // Editar paciente
    editPatient(patientId, officeNumber) {
        const office = this.offices.find(o => o.number === officeNumber);
        if (!office) {
            this.showNotification('Consultório não encontrado!', 'error');
            return;
        }

        const patient = office.queue.find(p => p.id === patientId);
        if (!patient) {
            this.showNotification('Paciente não encontrado!', 'error');
            return;
        }

        // Preencher formulário com dados do paciente
        document.getElementById('patientName').value = patient.name;
        document.getElementById('patientOffice').value = officeNumber;
        document.getElementById('patientPriority').value = patient.priority;

        // Remover paciente da fila temporariamente
        office.queue = office.queue.filter(p => p.id !== patientId);

        // Abrir modal de configuração na aba de pacientes
        this.openConfigPanel();
        this.switchTab('patients');
        
        this.showNotification('Dados do paciente carregados para edição!', 'info');
        this.updateDisplay();
    }

    // Excluir paciente
    deletePatient(patientId, officeNumber) {
        const office = this.offices.find(o => o.number === officeNumber);
        if (!office) {
            this.showNotification('Consultório não encontrado!', 'error');
            return;
        }

        const patient = office.queue.find(p => p.id === patientId);
        if (!patient) {
            this.showNotification('Paciente não encontrado!', 'error');
            return;
        }

        this.showConfirmModal(`Tem certeza que deseja remover ${patient.name} da fila?`, () => {
            office.queue = office.queue.filter(p => p.id !== patientId);
            this.renderOffices();
            this.updatePatientsQueue();
            this.saveData();
            this.showNotification(`${patient.name} removido da fila!`, 'success');
        });
    }

    // Gerenciamento de Pacientes
    addPatient() {
        const name = document.getElementById('patientName').value.trim();
        const officeNumber = parseInt(document.getElementById('patientOffice').value);
        const priority = document.getElementById('patientPriority').value;

        if (!name || !officeNumber) {
            this.showNotification('Preencha todos os campos obrigatórios!', 'error');
            return;
        }

        const office = this.offices.find(o => o.number === officeNumber);
        if (!office) {
            this.showNotification('Consultório não encontrado!', 'error');
            return;
        }

        const patient = {
            id: Date.now(),
            name: name,
            priority: priority,
            timestamp: new Date()
        };

        // Inserir baseado na prioridade
        if (priority === 'urgent') {
            office.queue.unshift(patient);
        } else if (priority === 'priority') {
            const urgentCount = office.queue.filter(p => p.priority === 'urgent').length;
            office.queue.splice(urgentCount, 0, patient);
        } else {
            office.queue.push(patient);
        }

        this.showNotification(`Paciente ${name} adicionado à fila do ${office.name}!`, 'success');
        this.renderOffices();
        this.updatePatientsQueue();
        this.clearPatientForm();
        this.saveData();
    }

    clearPatientForm() {
        document.getElementById('patientName').value = '';
        document.getElementById('patientOffice').value = '';
        document.getElementById('patientPriority').value = 'normal';
    }

    // Chamar o mesmo paciente novamente
    callSamePatientAgain(officeNumber) {
        const office = this.offices.find(o => o.number === parseInt(officeNumber));
        
        if (!office || !office.currentPatient) {
            this.showNotification('Nenhum paciente foi chamado anteriormente para este consultório!', 'warning');
            return;
        }

        const patient = office.currentPatient;
        
        // Adicionar às chamadas recentes
        this.recentCalls.unshift({
            password: this.currentPassword,
            patient: patient.name.toUpperCase(),
            office: office.name,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });

        // Manter apenas as últimas 10 chamadas
        if (this.recentCalls.length > 10) {
            this.recentCalls = this.recentCalls.slice(0, 10);
        }

        this.updateDisplay();
        this.playNotificationSound();
        this.saveData();

        this.showNotification(`${patient.name.toUpperCase()} chamado novamente para ${office.name}!`, 'success');
    }
    callNextPatient(officeNumber) {
        const office = this.offices.find(o => o.number === parseInt(officeNumber));
        
        if (!office) {
            this.showNotification('Consultório não encontrado!', 'error');
            return;
        }

        if (office.queue.length === 0) {
            this.showNotification(`Não há pacientes na fila do ${office.name}!`, 'warning');
            return;
        }

        this.currentPassword++;
        const patient = office.queue.shift();
        office.currentPatient = patient;

        // Atualizar exibição principal
        document.getElementById('currentProfessional').textContent = office.doctor || '---';
        document.getElementById('currentOffice').textContent = office.name;
        document.getElementById("currentPatient").textContent = patient.name.toUpperCase();

        // Adicionar às chamadas recentes
        this.recentCalls.unshift({
            password: this.currentPassword,
            patient: patient.name.toUpperCase(),
            office: office.name,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });

        // Manter apenas as últimas 10 chamadas
        if (this.recentCalls.length > 10) {
            this.recentCalls = this.recentCalls.slice(0, 10);
        }

        this.updateDisplay();
        this.renderOffices();
        this.updatePatientsQueue();
        this.playNotificationSound();
        this.saveData();

        this.showNotification(`Senha ${String(this.currentPassword).padStart(3, '0')} - ${patient.name.toUpperCase()} chamado para ${office.name}!`, 'success');
    }

    // Interface
    renderOffices() {
        const container = document.getElementById('officesContainer');
        if (!container) return;

        container.innerHTML = '';

        this.offices.forEach(office => {
            const card = document.createElement('div');
            card.className = 'office-card';
            card.style.setProperty('--office-color', office.color);
            
            card.innerHTML = `
                <div class="office-header">
                    <div class="office-number">${office.number}</div>
                    <div class="queue-badge">${office.queue.length} na fila</div>
                </div>
                <div class="office-name">${office.name}</div>
                <div class="office-doctor">${office.doctor}</div>
                ${office.currentPatient ? `<button class="recall-btn" onclick="passwordSystem.callSamePatientAgain(${office.number})">🔄 Chamar Novamente</button>` : ''}
            `;

            card.addEventListener('click', () => this.callNextPatient(parseInt(office.number)));
            container.appendChild(card);
        });
    }

    updateDisplay() {
        this.updateRecentCalls();
        this.updateOfficesList();
        this.updatePatientOfficeSelect();
        this.updatePatientsQueue();
    }

    updateRecentCalls() {
        const container = document.getElementById('recentCalls');
        if (!container) return;

        if (this.recentCalls.length === 0) {
            container.innerHTML = '<div class="no-calls">Nenhuma chamada realizada ainda</div>';
            return;
        }

        container.innerHTML = '';
        this.recentCalls.forEach(call => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            item.innerHTML = `
                <div class="history-number">#${String(call.password).padStart(3, '0')}</div>
                <div class="history-patient">${call.patient}</div>
                <div class="history-office">${call.office}</div>
                <div class="history-time">${call.time}</div>
            `;
            
            container.appendChild(item);
        });
    }

    updateOfficesList() {
        const container = document.getElementById('officesList');
        if (!container) return;

        container.innerHTML = '';
        this.offices.forEach(office => {
            const item = document.createElement('div');
            item.className = 'office-list-item';
            item.innerHTML = `
                <div class="office-info">
                    <strong>${office.number} - ${office.name}</strong>
                    <div>${office.doctor}</div>
                    <div>Pacientes na fila: ${office.queue.length}</div>
                </div>
                <div class="office-actions">
                    <button onclick="passwordSystem.editOffice(${office.number})" class="btn-edit">✏️ Editar</button>
                    <button onclick="passwordSystem.deleteOffice(${office.number})" class="btn-delete">🗑️ Excluir</button>
                </div>
            `;
            container.appendChild(item);
        });
    }fice-actions">
                    <button onclick="passwordSystem.editOffice(${office.number})" class="btn-secondary">Editar</button>
                    <button onclick="passwordSystem.deleteOffice(${office.number})" class="btn-danger">Excluir</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    updatePatientOfficeSelect() {
        const select = document.getElementById('patientOffice');
        if (!select) return;

        select.innerHTML = '<option value="">Selecione um consultório</option>';
        this.offices.forEach(office => {
            const option = document.createElement('option');
            option.value = office.number;
            option.textContent = `${office.number} - ${office.name}`;
            select.appendChild(option);
        });
      updatePatientsQueue() {
        const container = document.getElementById('patientsQueue');
        if (!container) return;

        container.innerHTML = '';
        
        this.offices.forEach(office => {
            if (office.queue.length > 0) {
                const section = document.createElement('div');
                section.className = 'queue-section';
                section.innerHTML = `
                    <h5>${office.name} (${office.queue.length} pacientes)</h5>
                    <div class="patients-list">
                        ${office.queue.map((patient, index) => `
                            <div class="patient-item">
                                <span class="patient-position">${index + 1}º</span>
                                <span class="patient-name">${patient.name}</span>
                                <span class="queue-priority priority-${patient.priority}">${this.getPriorityLabel(patient.priority)}</span>
                                <div class="patient-actions">
                                    <button onclick="passwordSystem.editPatient(${patient.id}, ${office.number})" class="btn-edit">✏️</button>
                                    <button onclick="passwordSystem.deletePatient(${patient.id}, ${office.number})" class="btn-delete">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                container.appendChild(section);
            }
        });

        if (container.innerHTML === '') {
            container.innerHTML = '<div class="no-patients">Nenhum paciente na fila</div>';
        }
    }  getPriorityLabel(priority) {
        const labels = {
            'normal': 'Normal',
            'priority': 'Prioritário',
            'urgent': 'Urgente'
        };
        return labels[priority] || 'Normal';
    }

    removePatient(officeNumber, patientId) {
        const office = this.offices.find(o => o.number === officeNumber);
        if (office) {
            office.queue = office.queue.filter(p => p.id !== patientId);
            this.updateDisplay();
            this.renderOffices();
            this.saveData();
            this.showNotification('Paciente removido da fila!', 'success');
        }
    }

    editOffice(officeNumber) {
        const office = this.offices.find(o => o.number === officeNumber);
        if (office) {
            document.getElementById('officeNumber').value = office.number;
            document.getElementById('officeName').value = office.name;
            document.getElementById('officeDoctor').value = office.doctor;
            document.getElementById('officeColor').value = office.color;
            
            this.switchTab('offices');
        }
    }

    deleteOffice(officeNumber) {
        this.showConfirmModal('Tem certeza que deseja excluir este consultório?', () => {
            this.offices = this.offices.filter(o => o.number !== officeNumber);
            this.updateDisplay();
            this.renderOffices();
            this.saveData();
            this.showNotification('Consultório excluído com sucesso!', 'success');
        });
    }

    // Modais
    openConfigPanel() {
        const modal = document.getElementById('configModal');
        modal.classList.add('active');
        this.updateDisplay();
    }

    closeConfigPanel() {
        const modal = document.getElementById('configModal');
        modal.classList.remove('active');
    }

    switchTab(tabName) {
        // Remover classe active de todas as abas
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Ativar aba selecionada
        document.querySelector(`[onclick="passwordSystem.switchTab('${tabName}')"]`).classList.add('active');
        document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
    }

    showConfirmModal(message, callback) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').classList.add('active');
        this.confirmCallback = callback;
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('active');
        this.confirmCallback = null;
    }

    // Utilitários
    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR');
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            clockElement.textContent = timeString;
        }
    }

    playNotificationSound() {
        const enableSound = document.getElementById('enableSound');
        if (enableSound && enableSound.checked) {
            // Criar um beep simples usando Web Audio API
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                const volume = document.getElementById('soundVolume').value / 100;
                gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (error) {
                console.log('Áudio não suportado:', error);
            }
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notificationMessage');
        
        messageElement.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Persistência de dados
    saveData() {
        const data = {
            currentPassword: this.currentPassword,
            offices: this.offices,
            recentCalls: this.recentCalls
        };
        localStorage.setItem('clinicaUltravidaData', JSON.stringify(data));
    }

    loadData() {
        try {
            const data = localStorage.getItem('clinicaUltravidaData');
            if (data) {
                const parsed = JSON.parse(data);
                this.currentPassword = parsed.currentPassword || 0;
                this.offices = parsed.offices || this.offices;
                this.recentCalls = parsed.recentCalls || [];
                this.updateDisplay();
                this.renderOffices();
            }
        } catch (error) {
            console.log('Erro ao carregar dados:', error);
        }
    }

    resetSystem() {
        this.showConfirmModal('Tem certeza que deseja resetar todo o sistema? Esta ação não pode ser desfeita.', () => {
            this.currentPassword = 0;
            this.offices.forEach(office => {
                office.queue = [];
                office.currentPatient = null;
            });
            this.recentCalls = [];
            
            document.getElementById('currentPatient').textContent = '---';
            document.getElementById('currentProfessional').textContent = '---';
            document.getElementById('currentOffice').textContent = '---';
            
            this.updateDisplay();
            this.renderOffices();
            this.saveData();
            this.showNotification('Sistema resetado com sucesso!', 'success');
        });
    }
}

// Funções globais para compatibilidade
function login() {
    passwordSystem.login();
}

function logout() {
    passwordSystem.logout();
}

function openConfigPanel() {
    passwordSystem.openConfigPanel();
}

function closeConfigPanel() {
    passwordSystem.closeConfigPanel();
}

function switchTab(tabName) {
    passwordSystem.switchTab(tabName);
}

function clearOfficeForm() {
    passwordSystem.clearOfficeForm();
}

// Inicializar sistema
let passwordSystem;

document.addEventListener('DOMContentLoaded', () => {
    passwordSystem = new PasswordSystem();
});

// Prevenir fechamento acidental
window.addEventListener('beforeunload', (e) => {
    if (passwordSystem && passwordSystem.isLoggedIn) {
        e.preventDefault();
        e.returnValue = '';
    }
});

