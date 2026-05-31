import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {

    // Relógio
    setInterval(() => {
        const relogio = document.getElementById('relogio');
        const data = document.getElementById('data');
        if (relogio && data) {
            const agora = new Date();
            relogio.innerText = agora.toLocaleTimeString();
            data.innerText = agora.toLocaleDateString();
        }
    }, 1000);

    // Carregar Tabela
    async function carregarEncomendas() {
        const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'pendente');
        const corpo = document.getElementById('tabelaEncomendas');
        if (corpo && data) {
            corpo.innerHTML = data.map(item => `
                <tr class="text-xs">
                    <td class="py-3 font-bold">${item.unidade}</td>
                    <td class="py-3">${item.logradouro}</td>
                    <td class="py-3 text-yellow-400">${item.empresa}</td>
                    <td class="py-3"><button data-id="${item.id}" class="btn-entregar bg-green-600 px-3 py-1 rounded-lg">Entregar</button></td>
                </tr>
            `).join('');
        }
    }

    // Ações de Botões
    window.abrirModal = (id) => document.getElementById(id).classList.remove('hidden');
    
    document.getElementById('btnSalvar').addEventListener('click', async () => {
        await supabase.from('encomendas').insert([{
            unidade: document.getElementById('in-unid').value,
            logradouro: document.getElementById('in-log').value,
            empresa: document.getElementById('in-emp').value,
            status: 'pendente'
        }]);
        document.getElementById('modalEncomenda').classList.add('hidden');
        carregarEncomendas();
    });

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-entregar')) {
            await supabase.from('encomendas').update({ status: 'entregue' }).eq('id', e.target.dataset.id);
            carregarEncomendas();
        }
    });

    // Funções Globais (Cores/Play)
    window.mudarCor = (c) => document.getElementById('pageBody').style.backgroundColor = c;
    window.togglePlay = () => {
        const icon = document.getElementById('playIcon');
        icon.innerText = (icon.innerText === '▶' ? '⏸' : '▶');
    };

    carregarEncomendas();
});