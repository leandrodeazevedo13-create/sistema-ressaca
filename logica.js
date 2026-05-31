import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- BLOCO: Relógio ---
    setInterval(() => {
        const relogio = document.getElementById('relogio');
        const data = document.getElementById('data');
        if (relogio && data) {
            const agora = new Date();
            relogio.innerText = agora.toLocaleTimeString();
            data.innerText = agora.toLocaleDateString();
        }
    }, 1000);

    // --- BLOCO: Tabela ---
    async function carregarEncomendas() {
        const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'pendente');
        if (error) { console.error(error); return; }
        
        const corpo = document.getElementById('tabelaEncomendas');
        if (corpo) {
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
    }

    // --- BLOCO: Ações ---
    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async () => {
            await supabase.from('encomendas').insert([{
                unidade: document.getElementById('in-unid').value,
                logradouro: document.getElementById('in-log').value,
                empresa: document.getElementById('in-emp').value,
                codigo: document.getElementById('in-cod').value,
                status: 'pendente'
            }]);
            document.getElementById('modal').classList.add('hidden');
            carregarEncomendas();
        });
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
});
// Ação para Abrir Modais
window.abrirModal = (id) => document.getElementById(id).classList.remove('hidden');

// Ação de Salvar Encomenda com Foto (Supabase Storage)
document.getElementById('btnSalvar').addEventListener('click', async () => {
    const file = document.getElementById('in-foto').files[0];
    let fotoUrl = '';

    if (file) {
        const { data, error } = await supabase.storage.from('encomendas-fotos').upload(`${Date.now()}.png`, file);
        if (!error) fotoUrl = data.path;
    }

    await supabase.from('encomendas').insert([{
        unidade: document.getElementById('in-unid').value,
        logradouro: document.getElementById('in-log').value,
        empresa: document.getElementById('in-emp').value,
        foto_url: fotoUrl,
        status: 'pendente'
    }]);
    document.getElementById('modalEncomenda').classList.add('hidden');
    carregarEncomendas();
});

// Ação de Salvar Usuário
document.getElementById('btnSalvarUsuario').addEventListener('click', async () => {
    const nome = document.getElementById('in-nome').value;
    const senha = document.getElementById('in-senha').value;
    // Lógica para salvar usuário no Supabase Auth ou tabela de usuários
    alert(`Usuário ${nome} pronto para ser cadastrado!`);
    document.getElementById('modalUsuario').classList.add('hidden');
});