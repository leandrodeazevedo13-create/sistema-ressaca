import { supabase } from './supabase-client.js';

// --- BLOCO: Relógio ---
setInterval(() => {
    const agora = new Date();
    document.getElementById('relogio').innerText = agora.toLocaleTimeString();
    document.getElementById('data').innerText = agora.toLocaleDateString();
}, 1000);

// --- BLOCO: Tabela ---
export async function carregarEncomendas() {
    const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'pendente');
    if (error) { console.error(error); return; }
    const corpo = document.getElementById('tabelaEncomendas');
    corpo.innerHTML = '';
    if(data) {
        data.forEach(item => {
            corpo.innerHTML += `<tr class="text-xs">
                <td class="py-3 font-bold">${item.unidade}</td>
                <td class="py-3">${item.logradouro}</td>
                <td class="py-3 text-yellow-400">📦 ${item.empresa}</td>
                <td class="py-3 font-mono">${item.codigo}</td>
                <td class="py-3"><button data-id="${item.id}" class="btn-entregar bg-green-600 px-3 py-1 rounded-lg">Entregar</button></td>
            </tr>`;
        });
    }
}

// --- BLOCO: Ações ---
export async function salvarEncomenda() {
    await supabase.from('encomendas').insert([{
        unidade: document.getElementById('in-unid').value,
        logradouro: document.getElementById('in-log').value,
        empresa: document.getElementById('in-emp').value,
        codigo: document.getElementById('in-cod').value,
        status: 'pendente'
    }]);
    document.getElementById('modal').classList.add('hidden');
    carregarEncomendas();
}

document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-entregar')) {
        await supabase.from('encomendas').update({ status: 'entregue' }).eq('id', e.target.dataset.id);
        carregarEncomendas();
    }
});

window.mudarCor = (c) => document.getElementById('pageBody').style.backgroundColor = c;
window.togglePlay = () => {
    const icon = document.getElementById('playIcon');
    icon.innerText = (icon.innerText === '▶' ? '⏸' : '▶');
};

carregarEncomendas();