// --- CONFIGURAÇÃO DO SUPABASE ---
const { createClient } = supabase;
const supabaseUrl = 'https://oreltmkohfzptelcqmau.supabase.co';
const supabaseKey = 'sb_publishable_IwPZ6Y8Mr6RnwQLE24oY1Q_EiIpxUEQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- FUNÇÃO PARA CARREGAR DADOS ---
async function carregarEncomendas() {
    const corpo = document.getElementById('tabelaEncomendas');
    corpo.innerHTML = '<tr><td colspan="6" class="text-center py-4">Carregando...</td></tr>';

    const { data, error } = await supabase
        .from('encomendas')
        .select('*')
        .eq('status', 'pendente'); // Busca apenas as que não foram entregues

    if (error) {
        console.error('Erro ao buscar:', error);
        return;
    }

    corpo.innerHTML = '';
    data.forEach(item => {
        corpo.innerHTML += `
            <tr class="text-xs">
                <td class="py-3 font-bold">${item.unidade}</td>
                <td class="py-3">${item.logradouro}</td>
                <td class="py-3">${new Date(item.data_chegada).toLocaleDateString()}</td>
                <td class="py-3 font-bold text-yellow-400">📦 ${item.empresa}</td>
                <td class="py-3 font-mono">${item.codigo}</td>
                <td class="py-3">
                    <button onclick="entregarEncomenda('${item.id}')" class="bg-green-600 px-3 py-1 rounded-lg hover:bg-green-700">Entregar</button>
                </td>
            </tr>`;
    });
}

// --- FUNÇÃO PARA ATUALIZAR STATUS ---
async function entregarEncomenda(id) {
    const { error } = await supabase
        .from('encomendas')
        .update({ status: 'entregue' })
        .eq('id', id);

    if (!error) {
        carregarEncomendas(); // Recarrega a tabela após entregar
    }
}

// Inicializa a tabela ao carregar a página
carregarEncomendas();

// Relógio e outras funções existentes...
setInterval(() => {
    const agora = new Date();
    document.getElementById('relogio').innerText = agora.toLocaleTimeString();
    document.getElementById('data').innerText = agora.toLocaleDateString();
}, 1000);

function mudarCor(c) { document.getElementById('pageBody').style.backgroundColor = c; }
function togglePlay() { const icon = document.getElementById('playIcon'); icon.innerText = (icon.innerText === '▶' ? '⏸' : '▶'); }