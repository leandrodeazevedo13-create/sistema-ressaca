import { supabase } from './supabase-client.js';

// Função para carregar as encomendas
async function carregarEncomendas() {
    const { data, error } = await supabase
        .from('encomendas')
        .select('*') // Seleciona tudo para garantir que não falte campo
        .eq('status', 'pendente');

    if (error) {
        console.error("Erro ao carregar:", error);
        return;
    }

    const corpo = document.getElementById('tabelaEncomendas');
    if (!corpo) return;

    corpo.innerHTML = data.map(item => `
        <tr class="text-xs border-b border-white/10">
            <td class="py-3"><img src="${item.foto_url || ''}" class="w-8 h-8 rounded-full object-cover"></td>
            <td class="py-3 font-bold">${item.unidade || 'N/A'}</td>
            <td class="py-3">${item.logradouro || 'N/A'}</td>
            <td class="py-3">${item.empresa || 'N/A'}</td>
            <td class="py-3">${item.codigo || 'N/A'}</td>
            <td class="py-3"><button data-id="${item.id}" class="btn-entregar bg-green-600 px-2 py-1 rounded">Entregar</button></td>
        </tr>
    `).join('');
}

// Lógica de Salvar corrigida para os nomes das colunas que você tem no banco
document.getElementById('btnSalvarEncomenda').addEventListener('click', async () => {
    // Esses nomes (unidade, logradouro, empresa, codigo) devem bater com o seu Schema
    const dados = {
        unidade: document.getElementById('in-morador-nome')?.value || "0",
        logradouro: document.getElementById('in-endereco')?.value || "S/E",
        empresa: document.getElementById('in-empresa')?.value || "N/A",
        codigo: document.getElementById('in-cod')?.value || "0",
        tipo: document.getElementById('in-tipo')?.value || "Normal",
        status: 'pendente'
    };

    const { error } = await supabase.from('encomendas').insert([dados]);

    if (error) {
        console.error("Detalhe do erro:", error);
        alert("Erro ao salvar no banco: " + error.message);
    } else {
        alert("Salvo com sucesso!");
        document.getElementById('modalEncomenda').classList.add('hidden');
        carregarEncomendas();
    }
});

// Inicialização
carregarEncomendas();

// Funções globais de layout (mantenha essas)
window.mudarCor = (c) => document.getElementById('pageBody').style.backgroundColor = c;
window.togglePlay = () => {
    const icon = document.getElementById('playIcon');
    icon.innerText = (icon.innerText === '▶' ? '⏸' : '▶');
};