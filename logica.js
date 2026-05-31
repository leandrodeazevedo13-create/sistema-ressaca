import { supabase } from './supabase-client.js';

let encomendaIdAtual = null;

async function carregarEncomendas() {
    const { data, error } = await supabase
        .from('encomendas')
        .select('*')
        .eq('status', 'pendente');

    if (error) { console.error("Erro ao carregar:", error); return; }

    const corpo = document.getElementById('tabelaEncomendas');
    if (!corpo) return;
    
    corpo.innerHTML = data.map(item => `
        <tr class="text-xs border-b border-white/10">
            <td class="py-3"><img src="${item.foto_url || ''}" class="w-8 h-8 rounded-full object-cover"></td>
            <td class="py-3 font-bold">${item.unidade || 'N/A'}</td>
            <td class="py-3">${item.logradouro || 'N/A'}</td>
            <td class="py-3">${item.empresa || 'N/A'}</td>
            <td class="py-3">${item.tipo || 'N/A'}</td>
            <td class="py-3">
                <button onclick="prepararEntrega('${item.id}')" class="bg-green-600 px-3 py-1 rounded">Entregar</button>
            </td>
        </tr>
    `).join('');
}

// Função para carregar o Histórico
window.carregarHistorico = async () => {
    const area = document.getElementById('areaHistorico');
    area.classList.remove('hidden'); // Mostra a área

    const { data, error } = await supabase
        .from('encomendas')
        .select('*')
        .eq('status', 'entregue')
        .order('created_at', { ascending: false })
        .limit(10); // Mostra as últimas 10

    if (error) { console.error(error); return; }

    const tabela = document.getElementById('tabelaHistorico');
    tabela.innerHTML = data.length > 0 ? data.map(item => `
        <div class="border-b border-white/10 py-2 flex justify-between">
            <span>${item.unidade} - ${item.logradouro}</span>
            <span class="text-green-400">Entregue para: ${item.recebedor || 'Portaria'}</span>
        </div>
    `).join('') : '<p>Nenhuma entrega encontrada.</p>';
};
// Abre o modal de confirmação de entrega
window.prepararEntrega = (id) => {
    encomendaIdAtual = id;
    document.getElementById('modalEntrega').classList.remove('hidden');
};

// Lógica do botão Salvar (Nova Encomenda)
document.getElementById('btnSalvarEncomenda').addEventListener('click', async () => {
    const dados = {
        unidade: document.getElementById('in-morador-nome')?.value || "0",
        logradouro: document.getElementById('in-endereco')?.value || "S/E",
        empresa: document.getElementById('in-empresa')?.value || "N/A",
        codigo: document.getElementById('in-cod')?.value || "0",
        tipo: document.getElementById('in-tipo')?.value || "Normal",
        status: 'pendente'
    };

    const { error } = await supabase.from('encomendas').insert([dados]);
    if (error) { alert("Erro ao salvar: " + error.message); } 
    else { 
        document.getElementById('modalEncomenda').classList.add('hidden'); 
        carregarEncomendas(); 
    }
});

// Lógica do botão Confirmar (Modal de Entrega)
document.getElementById('btnConfirmarEntrega')?.addEventListener('click', async () => {
    const nomeRecebedor = document.getElementById('in-recebedor')?.value || "Portaria";
    
    const { error } = await supabase
        .from('encomendas')
        .update({ 
            status: 'entregue',
            recebedor: nomeRecebedor 
        })
        .eq('id', encomendaIdAtual);

    if (error) {
        alert("Erro ao entregar: " + error.message);
    } else {
        alert("Entrega confirmada!");
        document.getElementById('modalEntrega').classList.add('hidden');
        carregarEncomendas();
    }
});

// Funções globais de layout
window.mudarCor = (c) => document.getElementById('pageBody').style.backgroundColor = c;
window.togglePlay = () => {
    const icon = document.getElementById('playIcon');
    icon.innerText = (icon.innerText === '▶' ? '⏸' : '▶');
};

carregarEncomendas();