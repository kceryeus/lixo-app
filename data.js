// Dados simulados para LixoApp
const provedores = [
  {
    id: 1,
    nome: 'EcoLixo',
    telefone: '11999999999',
    email: 'contato@ecolixo.com',
    localizacao: 'Centro',
    clientes: [1, 2],
    veiculos: [
      { id: 1, placa: 'ABC1234', tipo: 'Caminhão', capacidade: '5 ton', status: 'ativo' },
      { id: 2, placa: 'DEF5678', tipo: 'Van', capacidade: '2 ton', status: 'manutenção' }
    ],
    rotas: [
      { id: 1, nome: 'Rota Centro', clientes: [1, 2], horario: '08:00', status: 'ativa' },
      { id: 2, nome: 'Rota Sul', clientes: [3], horario: '10:00', status: 'ativa' }
    ],
    avaliacao: 4.5,
    totalColetas: 1250
  },
  {
    id: 2,
    nome: 'LimpaFácil',
    telefone: '11888888888',
    email: 'contato@limpafacil.com',
    localizacao: 'Zona Sul',
    clientes: [3],
    veiculos: [
      { id: 3, placa: 'GHI9012', tipo: 'Caminhão', capacidade: '3 ton', status: 'ativo' }
    ],
    rotas: [
      { id: 3, nome: 'Rota Sul', clientes: [3], horario: '09:00', status: 'ativa' }
    ],
    avaliacao: 4.2,
    totalColetas: 850
  }
];

const clientes = [
  {
    id: 1,
    nome: 'João Silva',
    telefone: '11911111111',
    email: 'joao.silva@email.com',
    localizacao: 'Centro',
    endereco: 'Rua das Flores, 123',
    status: 'ativo',
    provedorId: 1,
    tipoResiduo: ['orgânico', 'reciclável'],
    frequencia: 'semanal',
    volume: '100L',
    pagamentos: [
      { mes: '2024-05', valor: 150.00, status: 'pago', dataPagamento: '2024-05-01' },
      { mes: '2024-06', valor: 150.00, status: 'pendente', dataVencimento: '2024-06-01' }
    ],
    historicoColetas: [
      { data: '2024-05-15', status: 'realizada', observacao: 'Coleta normal' },
      { data: '2024-05-22', status: 'realizada', observacao: 'Volume acima do normal' }
    ]
  },
  {
    id: 2,
    nome: 'Maria Souza',
    telefone: '11922222222',
    email: 'maria.souza@email.com',
    localizacao: 'Centro',
    endereco: 'Av. Principal, 456',
    status: 'inativo',
    provedorId: 1,
    tipoResiduo: ['reciclável'],
    frequencia: 'quinzenal',
    volume: '50L',
    pagamentos: [
      { mes: '2024-05', valor: 100.00, status: 'pago', dataPagamento: '2024-05-02' },
      { mes: '2024-06', valor: 100.00, status: 'pago', dataPagamento: '2024-06-01' }
    ],
    historicoColetas: [
      { data: '2024-05-10', status: 'realizada', observacao: 'Coleta normal' },
      { data: '2024-05-24', status: 'realizada', observacao: 'Coleta normal' }
    ]
  },
  {
    id: 3,
    nome: 'Carlos Lima',
    telefone: '11933333333',
    email: 'carlos.lima@email.com',
    localizacao: 'Zona Sul',
    endereco: 'Rua dos Pinheiros, 789',
    status: 'ativo',
    provedorId: 2,
    tipoResiduo: ['orgânico', 'reciclável', 'perigoso'],
    frequencia: 'semanal',
    volume: '200L',
    pagamentos: [
      { mes: '2024-05', valor: 200.00, status: 'pago', dataPagamento: '2024-05-03' },
      { mes: '2024-06', valor: 200.00, status: 'pendente', dataVencimento: '2024-06-03' }
    ],
    historicoColetas: [
      { data: '2024-05-12', status: 'realizada', observacao: 'Coleta normal' },
      { data: '2024-05-19', status: 'realizada', observacao: 'Coleta normal' }
    ]
  }
];

// Funções de busca
function getProvedorById(id) {
  return provedores.find(p => p.id === id);
}

function getClienteById(id) {
  return clientes.find(c => c.id === id);
}

function getClientesByProvedor(provedorId) {
  return clientes.filter(c => c.provedorId === provedorId);
}

function getProvedorByCliente(clienteId) {
  const cliente = getClienteById(clienteId);
  return cliente ? getProvedorById(cliente.provedorId) : null;
}

// Funções de estatísticas
function getEstatisticasProvedor(provedorId) {
  const provedor = getProvedorById(provedorId);
  const clientesProvedor = getClientesByProvedor(provedorId);
  
  return {
    totalClientes: clientesProvedor.length,
    clientesAtivos: clientesProvedor.filter(c => c.status === 'ativo').length,
    totalReceita: clientesProvedor.reduce((acc, c) => {
      return acc + c.pagamentos.reduce((sum, p) => sum + (p.status === 'pago' ? p.valor : 0), 0);
    }, 0),
    mediaAvaliacao: provedor.avaliacao,
    totalColetas: provedor.totalColetas
  };
}

function getEstatisticasCliente(clienteId) {
  const cliente = getClienteById(clienteId);
  const provedor = getProvedorByCliente(clienteId);
  
  return {
    status: cliente.status,
    tipoResiduo: cliente.tipoResiduo,
    frequencia: cliente.frequencia,
    volume: cliente.volume,
    provedor: provedor ? {
      nome: provedor.nome,
      avaliacao: provedor.avaliacao
    } : null,
    ultimaColeta: cliente.historicoColetas[cliente.historicoColetas.length - 1],
    proximoPagamento: cliente.pagamentos.find(p => p.status === 'pendente')
  };
}

// Exportar funções
window.getProvedorById = getProvedorById;
window.getClienteById = getClienteById;
window.getClientesByProvedor = getClientesByProvedor;
window.getProvedorByCliente = getProvedorByCliente;
window.getEstatisticasProvedor = getEstatisticasProvedor;
window.getEstatisticasCliente = getEstatisticasCliente; 