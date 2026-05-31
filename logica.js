import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Relógio
    setInterval(() => {
        document.getElementById('relogio').innerText = new Date().toLocaleTimeString();
    }, 1000);

    // Lógica do Select (Mostrar campo nome se "novo")
    document.getElementById('select-morador').addEventListener('change', (e) => {
        document.getElementById('in-novo-morador').classList.toggle('hidden', e.target.value !== 'novo');
    });

    // Carregar Tabela
    async function carregarEncomendas() {
        const { data } = await supabase.from('encomendas').select('*').eq('status', 'pendente');
        const corpo = document.getElementById('tabelaEncomendas');
        if (corpo && data) {
            corpo.innerHTML = data.map(item => `
                <tr class="text-xs">
                    <td class="py-3"><img src="${item.foto_url || ''}" class="w-8 h-8 rounded-full"></td>
                    <td class="py-3 font-bold">${item.morador_nome}</td>
                    <td class="py-3">${item.endereco}</td>
                    <td class="py-3">${item.empresa}</td>
                    <td class="py-3">${item.tipo}</td>
                    <td class="py-3">${new Date(item.created_at).toLocaleDateString()}</td>
                    <td class="py-3"><button data-id="${item.id}" class="btn-entregar bg-green-600 px-2 py-1 rounded">Entregar</button></td>
                </tr>
            `).join('');
        }
    }

    // Salvar
    document.getElementById('btnSalvarEncomenda').addEventListener('click', async () => {
        const morador = document.getElementById('select-morador').value === 'novo' ? 
                        document.getElementById('in-novo-morador').value : document.getElementById('select-morador').value;
        
        await supabase.from('encomendas').insert([{
            morador_nome: morador,
            endereco: document.getElementById('in-endereco').value,
            empresa: document.getElementById('in-empresa').value,
            tipo: document.getElementById('in-tipo').value,
            status: 'pendente'
        }]);
        document.getElementById('modalEncomenda').classList.add('hidden');
        carregarEncomendas();
    });

    window.mudarCor = (c) => document.getElementById('pageBody').style.backgroundColor = c;
    window.togglePlay = () => {
        const icon = document.getElementById('playIcon');
        icon.innerText = (icon.innerText === '▶' ? '⏸' : '▶');
    };

    carregarEncomendas();
});