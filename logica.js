import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {

    // Relógio
    setInterval(() => {
        const agora = new Date();
        document.getElementById('relogio').innerText = agora.toLocaleTimeString();
        document.getElementById('data').innerText = agora.toLocaleDateString();
    }, 1000);

    // Carregar Tabela
    async function carregarEncomendas() {
        const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'pendente');
        if (error) console.error("Erro ao carregar:", error);
        
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

    // Salvar Encomenda
    document.getElementById('btnSalvarEncomenda').addEventListener('click', async () => {
        const unid = document.getElementById('in-unid').value;
        const log = document.getElementById('in-log').value;
        const emp = document.getElementById('in-emp').value;

        const { error } = await supabase.from('encomendas').insert([
            { unidade: unid, logradouro: log, empresa: emp, status: 'pendente' }
        ]);

        if (error) {
            alert("Erro ao salvar: " + error.message);
        } else {
            document.getElementById('modalEncomenda').classList.add('hidden');
            carregarEncomendas();
        }
    });

    // Entregar (Delegação de Eventos)
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-entregar')) {
            const id = e.target.dataset.id;
            await supabase.from('encomendas').update({ status: 'entregue' }).eq('id', id);
            carregarEncomendas();
        }
    });

    // Funções Globais
    window.mudarCor = (c) => document.getElementById('pageBody').style.backgroundColor = c;
    window.togglePlay = () => {
        const icon = document.getElementById('playIcon');
        icon.innerText = (icon.innerText === '▶' ? '⏸' : '▶');
    };

    carregarEncomendas();
});