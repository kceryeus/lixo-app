// Configuração global
const config = {
  apiUrl: 'https://api.lixoapp.com', // Simulado
  version: '1.0.0'
};

// Gerenciamento de estado
const state = {
  user: null,
  notifications: [],
  loading: false
};

// Variáveis globais para o mapa
let map = null;
let markers = [];
let currentRoute = null;
let drawingMode = false;

// Limites da área de Matola
const MATOLA_BOUNDS = [
    [-25.9622, 32.4589], // Sudoeste
    [-25.9222, 32.4989]  // Nordeste
];

// Pontos de referência
const LANDMARKS = {
    'Mozal': [-25.9422, 32.4689],
    'Novare Mall': [-25.9322, 32.4789],
    'Mussumbuluco': [-25.9522, 32.4589]
};

// Navegação e login
function login(tipo) {
  showLoading();
  // Simulação de autenticação
  setTimeout(() => {
    state.user = { tipo, id: Math.floor(Math.random() * 1000) };
    window.location.hash = tipo;
    hideLoading();
    showNotification(`Bem-vindo ao LixoApp como ${tipo}!`, 'success');
  }, 1000);
}

// Gerenciamento de notificações
function showNotification(message, type = 'info') {
  const notification = {
    id: Date.now(),
    message,
    type
  };
  
  state.notifications.push(notification);
  renderNotification(notification);
  
  setTimeout(() => {
    removeNotification(notification.id);
  }, 5000);
}

function renderNotification(notification) {
  const notificationElement = document.createElement('div');
  notificationElement.className = `notification notification-${notification.type}`;
  notificationElement.setAttribute('data-id', notification.id);
  notificationElement.innerHTML = `
    <i class="fas ${getNotificationIcon(notification.type)}"></i>
    <span>${notification.message}</span>
    <button class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  document.body.appendChild(notificationElement);
  setTimeout(() => notificationElement.classList.add('show'), 100);
}

function removeNotification(id) {
  const notification = document.querySelector(`.notification[data-id="${id}"]`);
  if (notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }
  state.notifications = state.notifications.filter(n => n.id !== id);
}

function getNotificationIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  return icons[type] || icons.info;
}

// Loading
function showLoading() {
  state.loading = true;
  const loading = document.createElement('div');
  loading.className = 'loading-overlay';
  loading.innerHTML = '<div class="loading-spinner"></div>';
  document.body.appendChild(loading);
}

function hideLoading() {
  state.loading = false;
  const loading = document.querySelector('.loading-overlay');
  if (loading) {
    loading.remove();
  }
}

// Navegação
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'provedor' || hash === 'cliente') {
        carregarView(`views/${hash}.html`);
    } else {
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
            document.querySelector('main').innerHTML = loginSection.outerHTML;
        }
    }
    setupEventListeners();
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'provedor' || hash === 'cliente') {
        carregarView(`views/${hash}.html`);
    } else {
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
            document.querySelector('main').innerHTML = loginSection.outerHTML;
        }
    }
});

function carregarView(viewPath) {
    showLoading();
    fetch(viewPath)
        .then(r => r.text())
        .then(html => {
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.innerHTML = html;
                if (window.location.hash === '#provedor') {
                    if (typeof initProvedor === 'function') {
                        initProvedor();
                    } else {
                        console.error('Função initProvedor não encontrada');
                    }
                }
                if (window.location.hash === '#cliente') {
                    if (typeof initCliente === 'function') {
                        initCliente();
                    } else {
                        console.error('Função initCliente não encontrada');
                    }
                }
            }
            hideLoading();
        })
        .catch(error => {
            console.error('Erro ao carregar view:', error);
            showNotification('Erro ao carregar página', 'error');
            hideLoading();
        });
}

function navegar(secao) {
    const sections = ['dashboard', 'clientes', 'rotas', 'veiculos'];
    sections.forEach(s => {
        const element = document.getElementById(s);
        if (element) {
            element.style.display = s === secao ? 'block' : 'none';
        }
    });

    // Atualiza botões de navegação
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.toggle('active', button.textContent.trim().toLowerCase().includes(secao));
    });

    // Atualiza as listas
    if (secao === 'clientes') {
        atualizarListaClientes();
    } else if (secao === 'rotas') {
        atualizarListaRotas();
    } else if (secao === 'veiculos') {
        atualizarListaVeiculos();
    }
}

function logout() {
    state.user = null;
    window.location.hash = '';
    showNotification('Logout realizado com sucesso', 'info');
}

// Event Listeners
function setupEventListeners() {
  // Logout
  document.addEventListener('click', (e) => {
    if (e.target.matches('.logout-button') || e.target.closest('.logout-button')) {
      state.user = null;
      window.location.hash = '';
      showNotification('Logout realizado com sucesso', 'info');
    }
  });

  // Notificações
  document.addEventListener('click', (e) => {
    if (e.target.matches('.notification-close') || e.target.closest('.notification-close')) {
      const notification = e.target.closest('.notification');
      if (notification) {
        removeNotification(notification.dataset.id);
      }
    }
  });
}

// Funções do Provedor
function initProvedor() {
  const provedorId = 1; // Simulado
  const stats = getEstatisticasProvedor(provedorId);
  
  // Atualizar estatísticas
  document.getElementById('total-clientes').textContent = stats.totalClientes;
  document.getElementById('clientes-ativos').textContent = stats.clientesAtivos;
  document.getElementById('total-receita').textContent = formatCurrency(stats.totalReceita);
  document.getElementById('avaliacao').textContent = stats.mediaAvaliacao.toFixed(1);

  // Carregar veículos
  const provedor = getProvedorById(provedorId);
  const veiculosList = document.getElementById('veiculos-list');
  if (veiculosList) {
    veiculosList.innerHTML = provedor.veiculos.map(v => `
      <div class="veiculo-item">
        <div class="veiculo-info">
          <span class="placa">${v.placa}</span>
          <span class="tipo">${v.tipo}</span>
          <span class="capacidade">${v.capacidade}</span>
        </div>
        <span class="status-badge status-${v.status}">${v.status}</span>
      </div>
    `).join('');
  }

  // Carregar rotas
  const rotasList = document.getElementById('rotas-list');
  if (rotasList) {
    rotasList.innerHTML = provedor.rotas.map(r => `
      <div class="rota-item">
        <div class="rota-info">
          <h4>${r.nome}</h4>
          <p>Horário: ${r.horario}</p>
          <p>Clientes: ${r.clientes.length}</p>
        </div>
        <span class="status-badge status-${r.status}">${r.status}</span>
      </div>
    `).join('');
  }

  // Carregar clientes
  const clientes = getClientesByProvedor(provedorId);
  const clientesList = document.getElementById('clientes-list');
  if (clientesList) {
    clientesList.innerHTML = clientes.map(c => `
      <div class="cliente-item">
        <div class="cliente-info">
          <h4>${c.nome}</h4>
          <p>${c.endereco}</p>
          <p>Frequência: ${c.frequencia}</p>
        </div>
        <span class="status-badge status-${c.status}">${c.status}</span>
      </div>
    `).join('');
  }

  // Carregar próximas coletas
  const proximasColetas = document.getElementById('proximas-coletas');
  if (proximasColetas) {
    const coletas = clientes.flatMap(c => c.historicoColetas)
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5);
    
    proximasColetas.innerHTML = coletas.map(c => `
      <div class="coleta-item">
        <div class="coleta-info">
          <h4>${formatDate(c.data)}</h4>
          <p>${c.observacao}</p>
        </div>
        <span class="status-badge status-${c.status}">${c.status}</span>
      </div>
    `).join('');
  }

  // Carregar pagamentos pendentes
  const pagamentosPendentes = document.getElementById('pagamentos-pendentes');
  if (pagamentosPendentes) {
    const pendentes = clientes.flatMap(c => c.pagamentos)
      .filter(p => p.status === 'pendente');
    
    pagamentosPendentes.innerHTML = pendentes.map(p => `
      <div class="pagamento-item">
        <div class="pagamento-info">
          <h4>${p.mes}</h4>
          <p>Vencimento: ${formatDate(p.dataVencimento)}</p>
        </div>
        <span class="valor">${formatCurrency(p.valor)}</span>
      </div>
    `).join('');
  }

  // Configurar busca de clientes
  const searchInput = document.getElementById('cliente-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredClientes = clientes.filter(c => 
        c.nome.toLowerCase().includes(searchTerm) ||
        c.endereco.toLowerCase().includes(searchTerm)
      );
      
      if (clientesList) {
        clientesList.innerHTML = filteredClientes.map(c => `
          <div class="cliente-item">
            <div class="cliente-info">
              <h4>${c.nome}</h4>
              <p>${c.endereco}</p>
              <p>Frequência: ${c.frequencia}</p>
            </div>
            <span class="status-badge status-${c.status}">${c.status}</span>
          </div>
        `).join('');
      }
    });
  }
}

function adicionarVeiculo() {
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

function adicionarRota() {
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

// Funções do Cliente
function initCliente() {
  const clienteId = 1; // Simulado
  const cliente = getClienteById(clienteId);
  const stats = getEstatisticasCliente(clienteId);
  
  // Atualizar nome do cliente
  const clienteNome = document.getElementById('cliente-nome');
  if (clienteNome) {
    clienteNome.textContent = cliente.nome;
  }
  
  // Atualizar informações do cliente
  const clienteInfo = document.getElementById('cliente-info');
  if (clienteInfo) {
    clienteInfo.innerHTML = `
      <div class="info-grid">
        <div class="info-item">
          <i class="fas fa-phone"></i>
          <span>${cliente.telefone}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-envelope"></i>
          <span>${cliente.email}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${cliente.endereco}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-trash"></i>
          <span>${cliente.tipoResiduo.join(', ')}</span>
        </div>
      </div>
    `;
  }

  // Atualizar informações do serviço
  const servicoInfo = document.getElementById('servico-info');
  if (servicoInfo) {
    servicoInfo.innerHTML = `
      <div class="servico-grid">
        <div class="servico-item">
          <span class="label">Status</span>
          <span class="status-badge status-${cliente.status}">${cliente.status}</span>
        </div>
        <div class="servico-item">
          <span class="label">Frequência</span>
          <span>${cliente.frequencia}</span>
        </div>
        <div class="servico-item">
          <span class="label">Volume</span>
          <span>${cliente.volume}</span>
        </div>
        <div class="servico-item">
          <span class="label">Provedor</span>
          <span>${stats.provedor.nome}</span>
        </div>
      </div>
    `;
  }

  // Atualizar próxima coleta
  const proximaColeta = document.getElementById('proxima-coleta');
  if (proximaColeta) {
    const ultimaColeta = stats.ultimaColeta;
    proximaColeta.innerHTML = `
      <div class="coleta-info">
        <div class="coleta-header">
          <i class="fas fa-truck"></i>
          <h4>Última Coleta</h4>
        </div>
        <p>Data: ${formatDate(ultimaColeta.data)}</p>
        <p>Status: <span class="status-badge status-${ultimaColeta.status}">${ultimaColeta.status}</span></p>
        <p>Observação: ${ultimaColeta.observacao}</p>
      </div>
    `;
  }

  // Atualizar histórico de coletas
  const historicoColetas = document.getElementById('historico-coletas');
  if (historicoColetas) {
    historicoColetas.innerHTML = cliente.historicoColetas
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .map(c => `
        <div class="historico-item">
          <div class="historico-info">
            <h4>${formatDate(c.data)}</h4>
            <p>${c.observacao}</p>
          </div>
          <span class="status-badge status-${c.status}">${c.status}</span>
        </div>
      `).join('');
  }

  // Atualizar informações de pagamento
  const pagamentosInfo = document.getElementById('pagamentos-info');
  if (pagamentosInfo) {
    pagamentosInfo.innerHTML = `
      <div class="pagamentos-grid">
        ${cliente.pagamentos.map(p => `
          <div class="pagamento-item">
            <div class="pagamento-info">
              <h4>${p.mes}</h4>
              <p>Valor: ${formatCurrency(p.valor)}</p>
              <p>Status: <span class="status-badge status-${p.status}">${p.status}</span></p>
              ${p.dataPagamento ? `<p>Pago em: ${formatDate(p.dataPagamento)}</p>` : ''}
              ${p.dataVencimento ? `<p>Vencimento: ${formatDate(p.dataVencimento)}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Configurar avaliação
  const stars = document.querySelectorAll('.rating .fa-star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = star.dataset.rating;
      stars.forEach(s => {
        s.classList.toggle('active', s.dataset.rating <= rating);
      });
    });
  });
}

function editarDados() {
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

function solicitarColeta() {
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

function realizarPagamento() {
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

function enviarAvaliacao() {
  const rating = document.querySelectorAll('.rating .fa-star.active').length;
  const comentario = document.getElementById('avaliacao-comentario').value;
  
  if (rating === 0) {
    showNotification('Por favor, selecione uma avaliação', 'warning');
    return;
  }
  
  showNotification('Avaliação enviada com sucesso!', 'success');
  document.querySelectorAll('.rating .fa-star').forEach(s => s.classList.remove('active'));
  document.getElementById('avaliacao-comentario').value = '';
}

// Utilitários
function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Inicializa o mapa
function initMap() {
    if (map) return; // Evita múltiplas inicializações

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Container do mapa não encontrado');
        return;
    }

    // Garante que o container está visível
    mapContainer.style.display = 'block';
    
    // Força um redimensionamento do container
    mapContainer.style.height = '400px';
    mapContainer.style.width = '100%';

    // Cria o mapa
    map = L.map('map').setView([-25.9422, 32.4689], 14);

    // Adiciona o tile layer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Adiciona os limites da área
    const bounds = L.latLngBounds(MATOLA_BOUNDS);
    map.setMaxBounds(bounds);
    map.setMinZoom(12);
    map.setMaxZoom(18);

    // Adiciona os pontos de referência
    Object.entries(LANDMARKS).forEach(([name, coords]) => {
        L.marker(coords)
            .bindPopup(name)
            .addTo(map);
    });

    // Adiciona evento de clique no mapa
    map.on('click', (e) => {
        if (drawingMode) {
            addPointToRoute(e.latlng);
        }
    });

    // Força um redimensionamento do mapa após a inicialização
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

// Adiciona um ponto à rota atual
function addPointToRoute(latlng) {
    if (!currentRoute) {
        currentRoute = L.polyline([], { color: 'blue', weight: 3 }).addTo(map);
    }
    
    const points = currentRoute.getLatLngs();
    points.push(latlng);
    currentRoute.setLatLngs(points);

    // Adiciona marcador
    const marker = L.marker(latlng).addTo(map);
    markers.push(marker);
}

// Inicia uma nova rota
function iniciarNovaRota() {
    if (map) {
        limparRota();
        drawingMode = true;
        showNotification('Clique no mapa para adicionar pontos à rota', 'info');
    }
}

// Limpa a rota atual
function limparRota() {
    if (currentRoute) {
        map.removeLayer(currentRoute);
        currentRoute = null;
    }
    
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    drawingMode = false;
}

// Salva a rota atual
function salvarRota() {
    if (!currentRoute) {
        showNotification('Nenhuma rota para salvar', 'error');
        return;
    }

    const pontos = currentRoute.getLatLngs();
    if (pontos.length < 2) {
        showNotification('A rota precisa ter pelo menos 2 pontos', 'error');
        return;
    }

    const rotas = JSON.parse(localStorage.getItem('rotas') || '[]');
    const novaRota = {
        id: Date.now(),
        pontos: pontos.map(p => [p.lat, p.lng]),
        data: new Date().toISOString()
    };

    rotas.push(novaRota);
    localStorage.setItem('rotas', JSON.stringify(rotas));

    showNotification('Rota salva com sucesso!', 'success');
    atualizarListaRotas();
    limparRota();
}

// Atualiza a lista de rotas salvas
function atualizarListaRotas() {
    const rotasList = document.getElementById('rotas-list');
    if (!rotasList) return;

    const rotas = JSON.parse(localStorage.getItem('rotas') || '[]');
    
    rotasList.innerHTML = rotas.map(rota => `
        <div class="list-item">
            <div class="list-item-content">
                <h4>Rota ${new Date(rota.data).toLocaleDateString()}</h4>
                <p>${rota.pontos.length} pontos</p>
            </div>
            <div class="list-item-actions">
                <button class="secondary-button" onclick="visualizarRota(${rota.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="danger-button" onclick="excluirRota(${rota.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Visualiza uma rota salva
function visualizarRota(id) {
    const rotas = JSON.parse(localStorage.getItem('rotas') || '[]');
    const rota = rotas.find(r => r.id === id);
    
    if (!rota) {
        showNotification('Rota não encontrada', 'error');
        return;
    }

    limparRota();
    const pontos = rota.pontos.map(p => L.latLng(p[0], p[1]));
    currentRoute = L.polyline(pontos, { color: 'blue', weight: 3 }).addTo(map);
    
    // Adiciona marcadores
    pontos.forEach(ponto => {
        const marker = L.marker(ponto).addTo(map);
        markers.push(marker);
    });

    // Centraliza o mapa na rota
    map.fitBounds(currentRoute.getBounds());
}

// Exclui uma rota
function excluirRota(id) {
    if (!confirm('Tem certeza que deseja excluir esta rota?')) return;

    const rotas = JSON.parse(localStorage.getItem('rotas') || '[]');
    const novasRotas = rotas.filter(r => r.id !== id);
    
    localStorage.setItem('rotas', JSON.stringify(novasRotas));
    showNotification('Rota excluída com sucesso!', 'success');
    atualizarListaRotas();
}

// Gestão de Clientes
function mostrarFormCliente(cliente = null) {
    const form = document.getElementById('cliente-form');
    if (!form) return;

    form.style.display = 'block';
    
    if (cliente) {
        document.getElementById('cliente-id').value = cliente.id;
        document.getElementById('cliente-nome').value = cliente.nome;
        document.getElementById('cliente-telefone').value = cliente.telefone;
        document.getElementById('cliente-email').value = cliente.email;
        document.getElementById('cliente-endereco').value = cliente.endereco;
        document.getElementById('cliente-frequencia').value = cliente.frequencia;
        document.getElementById('cliente-volume').value = cliente.volume;
    } else {
        document.getElementById('form-cliente').reset();
        document.getElementById('cliente-id').value = '';
    }
}

function cancelarFormCliente() {
    const form = document.getElementById('cliente-form');
    if (form) {
        form.style.display = 'none';
        form.reset();
    }
}

function salvarCliente(event) {
    event.preventDefault();

    const cliente = {
        id: document.getElementById('cliente-id').value || Date.now(),
        nome: document.getElementById('cliente-nome').value,
        telefone: document.getElementById('cliente-telefone').value,
        email: document.getElementById('cliente-email').value,
        endereco: document.getElementById('cliente-endereco').value,
        frequencia: document.getElementById('cliente-frequencia').value,
        volume: document.getElementById('cliente-volume').value,
        status: 'ativo',
        dataCadastro: new Date().toISOString()
    };

    // Salvar cliente (simulado)
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const index = clientes.findIndex(c => c.id === cliente.id);
    
    if (index >= 0) {
        clientes[index] = cliente;
    } else {
        clientes.push(cliente);
    }

    localStorage.setItem('clientes', JSON.stringify(clientes));
    showNotification('Cliente salvo com sucesso!', 'success');
    cancelarFormCliente();
    atualizarListaClientes();
}

function atualizarListaClientes() {
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const clientesList = document.getElementById('clientes-list');
    const filter = document.getElementById('cliente-filter').value;
    
    if (clientesList) {
        let filteredClientes = clientes;
        if (filter !== 'todos') {
            filteredClientes = clientes.filter(c => c.status === filter);
        }

        clientesList.innerHTML = filteredClientes.map(cliente => `
            <div class="cliente-item">
                <div class="cliente-info">
                    <h4>${cliente.nome}</h4>
                    <p>${cliente.endereco}</p>
                    <p>Frequência: ${cliente.frequencia}</p>
                    <p>Volume: ${cliente.volume}</p>
                </div>
                <div class="cliente-actions">
                    <button class="secondary-button" onclick="editarCliente(${cliente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="danger-button" onclick="toggleClienteStatus(${cliente.id})">
                        <i class="fas fa-${cliente.status === 'ativo' ? 'ban' : 'check'}"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function editarCliente(id) {
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
        mostrarFormCliente(cliente);
    }
}

function toggleClienteStatus(id) {
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const index = clientes.findIndex(c => c.id === id);
    
    if (index >= 0) {
        clientes[index].status = clientes[index].status === 'ativo' ? 'inativo' : 'ativo';
        localStorage.setItem('clientes', JSON.stringify(clientes));
        atualizarListaClientes();
        showNotification(`Cliente ${clientes[index].status === 'ativo' ? 'ativado' : 'inativado'} com sucesso!`, 'success');
    }
}

// Gestão de Veículos
function mostrarFormVeiculo(veiculo = null) {
    const form = document.getElementById('veiculo-form');
    const idInput = document.getElementById('veiculo-id');
    const placaInput = document.getElementById('veiculo-placa');
    const tipoInput = document.getElementById('veiculo-tipo');
    const capacidadeInput = document.getElementById('veiculo-capacidade');

    if (veiculo) {
        idInput.value = veiculo.id;
        placaInput.value = veiculo.placa;
        tipoInput.value = veiculo.tipo;
        capacidadeInput.value = veiculo.capacidade;
    } else {
        idInput.value = '';
        placaInput.value = '';
        tipoInput.value = 'caminhao';
        capacidadeInput.value = '';
    }

    form.style.display = 'block';
}

function cancelarFormVeiculo() {
    const form = document.getElementById('veiculo-form');
    form.style.display = 'none';
}

function salvarVeiculo(event) {
    event.preventDefault();

    const id = document.getElementById('veiculo-id').value;
    const placa = document.getElementById('veiculo-placa').value;
    const tipo = document.getElementById('veiculo-tipo').value;
    const capacidade = document.getElementById('veiculo-capacidade').value;

    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    
    if (id) {
        // Editar veículo existente
        const index = veiculos.findIndex(v => v.id === parseInt(id));
        if (index !== -1) {
            veiculos[index] = { ...veiculos[index], placa, tipo, capacidade };
        }
    } else {
        // Adicionar novo veículo
        const novoVeiculo = {
            id: Date.now(),
            placa,
            tipo,
            capacidade,
            status: 'disponivel',
            dataCadastro: new Date().toISOString()
        };
        veiculos.push(novoVeiculo);
    }

    localStorage.setItem('veiculos', JSON.stringify(veiculos));
    showNotification('Veículo salvo com sucesso!', 'success');
    cancelarFormVeiculo();
    atualizarListaVeiculos();
}

function atualizarListaVeiculos() {
    const veiculosList = document.getElementById('veiculos-list');
    if (!veiculosList) return;

    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    
    veiculosList.innerHTML = veiculos.map(veiculo => `
        <div class="list-item">
            <div class="list-item-content">
                <h4>${veiculo.placa}</h4>
                <p>Tipo: ${veiculo.tipo}</p>
                <p>Capacidade: ${veiculo.capacidade}</p>
                <span class="status-badge ${veiculo.status}">${veiculo.status}</span>
            </div>
            <div class="list-item-actions">
                <button class="secondary-button" onclick="mostrarFormVeiculo(${JSON.stringify(veiculo)})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="danger-button" onclick="excluirVeiculo(${veiculo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function excluirVeiculo(id) {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;

    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    const novosVeiculos = veiculos.filter(v => v.id !== id);
    
    localStorage.setItem('veiculos', JSON.stringify(novosVeiculos));
    showNotification('Veículo excluído com sucesso!', 'success');
    atualizarListaVeiculos();
}

// --- NOVA LÓGICA DE ROTAS SEM MAPA ---

function mostrarFormRota(rota = null) {
    const form = document.getElementById('rota-form');
    if (!form) return;
    form.style.display = 'block';
    document.getElementById('form-rota').reset();
    document.getElementById('pontos-intermediarios').innerHTML = '';
    if (rota) {
        document.getElementById('rota-inicio').value = rota.inicio;
        document.getElementById('rota-fim').value = rota.fim;
        rota.pontos.forEach(p => adicionarPontoIntermediario(p));
    }
}

function cancelarFormRota() {
    const form = document.getElementById('rota-form');
    if (form) {
        form.style.display = 'none';
        document.getElementById('form-rota').reset();
        document.getElementById('pontos-intermediarios').innerHTML = '';
    }
}

function adicionarPontoIntermediario(valor = '') {
    const container = document.getElementById('pontos-intermediarios');
    const div = document.createElement('div');
    div.className = 'ponto-item';
    div.innerHTML = `
        <input type="text" class="ponto-intermediario" value="${valor}" required>
        <button type="button" class="danger-button" onclick="this.parentNode.remove()"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(div);
}

function salvarRota(event) {
    if (event) event.preventDefault();
    const inicio = document.getElementById('rota-inicio').value;
    const fim = document.getElementById('rota-fim').value;
    const pontos = Array.from(document.querySelectorAll('.ponto-intermediario')).map(input => input.value);
    if (!inicio || !fim) {
        showNotification('Preencha início e fim da rota', 'warning');
        return;
    }
    const rotas = JSON.parse(localStorage.getItem('rotas') || '[]');
    const novaRota = {
        id: Date.now(),
        inicio,
        pontos,
        fim,
        data: new Date().toISOString()
    };
    rotas.push(novaRota);
    localStorage.setItem('rotas', JSON.stringify(rotas));
    showNotification('Rota salva com sucesso!', 'success');
    cancelarFormRota();
    atualizarListaRotas();
}

function atualizarListaRotas() {
    const rotasList = document.getElementById('rotas-list');
    if (!rotasList) return;
    const rotas = JSON.parse(localStorage.getItem('rotas') || '[]');
    rotasList.innerHTML = rotas.map(rota => `
        <div class="list-item">
            <div class="list-item-content">
                <h4>Rota ${new Date(rota.data).toLocaleDateString()}</h4>
                <p><b>Início:</b> ${rota.inicio}</p>
                <p><b>Pontos:</b> ${rota.pontos.length > 0 ? rota.pontos.join(' → ') : 'Nenhum'}</p>
                <p><b>Fim:</b> ${rota.fim}</p>
            </div>
            <div class="list-item-actions">
                <button class="danger-button" onclick="excluirRota(${rota.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function excluirRota(id) {
    if (!confirm('Tem certeza que deseja excluir esta rota?')) return;
    const rotas = JSON.parse(localStorage.getItem('rotas') || '[]');
    const novasRotas = rotas.filter(r => r.id !== id);
    localStorage.setItem('rotas', JSON.stringify(novasRotas));
    showNotification('Rota excluída com sucesso!', 'success');
    atualizarListaRotas();
}

// Exportar funções necessárias
window.login = login;
window.removeNotification = removeNotification;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.initProvedor = initProvedor;
window.initCliente = initCliente;
window.adicionarVeiculo = adicionarVeiculo;
window.adicionarRota = adicionarRota;
window.editarDados = editarDados;
window.solicitarColeta = solicitarColeta;
window.realizarPagamento = realizarPagamento;
window.enviarAvaliacao = enviarAvaliacao;
window.mostrarFormCliente = mostrarFormCliente;
window.cancelarFormCliente = cancelarFormCliente;
window.salvarCliente = salvarCliente;
window.editarCliente = editarCliente;
window.toggleClienteStatus = toggleClienteStatus;
window.mostrarFormVeiculo = mostrarFormVeiculo;
window.cancelarFormVeiculo = cancelarFormVeiculo;
window.salvarVeiculo = salvarVeiculo;
window.atualizarListaVeiculos = atualizarListaVeiculos;
window.navegar = navegar;
window.mostrarFormRota = mostrarFormRota;
window.cancelarFormRota = cancelarFormRota;
window.adicionarPontoIntermediario = adicionarPontoIntermediario;
window.salvarRota = salvarRota;
window.atualizarListaRotas = atualizarListaRotas;
window.excluirRota = excluirRota;

// Hamburger dropdown menu logic
const hamburger = document.getElementById('hamburger-menu');
const dropdownMenu = document.getElementById('top-dropdown-menu');

if (hamburger && dropdownMenu) {
  hamburger.addEventListener('click', () => {
    dropdownMenu.classList.toggle('open');
  });
  // Fecha o menu ao clicar em qualquer link ou botão do menu
  dropdownMenu.querySelectorAll('.menu-link, .logout-btn').forEach(item => {
    item.addEventListener('click', () => {
      dropdownMenu.classList.remove('open');
    });
  });
  // SPA navigation for menu links
  const menuMap = {
    'Dashboard': 'dashboard',
    'Clientes': 'clientes',
    'Rotas': 'rotas',
    'Veículos': 'veiculos'
  };
  dropdownMenu.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const text = link.textContent.trim();
      if (menuMap[text]) {
        navegar(menuMap[text]);
      }
    });
  });
  const logoutBtn = dropdownMenu.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof logout === 'function') logout();
    });
  }
} 