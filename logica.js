import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Relógio
    setInterval(() => {
        document.getElementById('relogio').innerText = new Date().toLocaleTimeString();
    }, 1000);

    // Carregar Tabela (Corrigido para mapear campos do banco)
    async function carregarEncomendas() {
        const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'pendente');
        if (error) { console.error(error); return; }
        
        const corpo = document.getElementById('tabelaEncomendas');
        corpo.innerHTML = data.map(item => `
            <tr class="text-xs">
                <td class="py-3"><img src="${item.foto_url || ''}" class="w-8 h-8 rounded-full object-cover"></td>
                <td class="py-3 font-bold">${item.morador_nome || 'N/A'}</td>
                <td class="py-3">${item.endereco || 'N/A'}</td>
                <td class="py-3">${item.empresa || 'N/A'}</td>
                <td class="py-3">${item.tipo || 'N/A'}</td>
                <td class="py-3">${item.created_at ? new Date(item.created_at).toLocaleDateString() : '--/--'}</td>
                <td class="py-3"><button data-id="${item.id}" class="btn-entregar bg-green-600 px-2 py-1 rounded">Entregar</button></td>
            </tr>
        `).join('');
    }

    // Salvar Encomenda
    document.getElementById('btnSalvarEncomenda').addEventListener('click', async () => {
        const payload = {
            morador_nome: document.getElementById('in-morador-nome').value,
            endereco: document.getElementById('in-endereco').value,
            empresa: document.getElementById('in-empresa').value,
            tipo: document.getElementById('in-tipo').value,
            status: 'pendente'
        };

        const { error } = await supabase.from('encomendas').insert([payload]);
        if (error) { alert("Erro ao salvar: " + error.message); }
        else {
            document.getElementById('modalEncomenda').classList.add('hidden');
            carregarEncomendas();
        }
    });

    // Funções de Layout mantidas
    window.mudarCor = (c) => document.getElementById('pageBody').style.backgroundColor = c;
    window.togglePlay = () => {
        const icon = document.getElementById('playIcon');
        icon.innerText = (icon.innerText === '▶' ? '⏸' : '▶');
    };

    carregarEncomendas();
});