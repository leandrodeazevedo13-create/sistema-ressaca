import { supabase } from './supabase-client.js';

async function carregarEncomendas() {
    // Buscamos exatamente as colunas que estão no seu banco
    const { data, error } = await supabase
        .from('encomendas')
        .select('id, unidade, logradouro, empresa, codigo, status, foto_url, morador_nome, endereco, tipo')
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
            <td class="py-3 font-bold">${item.morador_nome || item.logradouro || 'N/A'}</td>
            <td class="py-3">${item.endereco || 'N/A'}</td>
            <td class="py-3">${item.empresa || 'N/A'}</td>
            <td class="py-3">${item.tipo || 'N/A'}</td>
            <td class="py-3">${new Date(item.created_at || Date.now()).toLocaleDateString()}</td>
            <td class="py-3"><button data-id="${item.id}" class="btn-entregar bg-green-600 px-2 py-1 rounded">Entregar</button></td>
        </tr>
    `).join('');
}

// Lógica de Salvar (Ajustada para os nomes reais do seu banco)
document.getElementById('btnSalvarEncomenda').addEventListener('click', async () => {
    const dados = {
        morador_nome: document.getElementById('in-morador-nome')?.value,
        endereco: document.getElementById('in-endereco')?.value,
        empresa: document.getElementById('in-empresa')?.value,
        tipo: document.getElementById('in-tipo')?.value,
        codigo: document.getElementById('in-cod')?.value || "0", // O banco exige 'codigo'
        status: 'pendente'
    };

    const { error } = await supabase.from('encomendas').insert([dados]);

    if (error) {
        alert("Erro ao salvar: " + error.message);
    } else {
        alert("Sucesso!");
        document.getElementById('modalEncomenda').classList.add('hidden');
        carregarEncomendas();
    }
});

carregarEncomendas();