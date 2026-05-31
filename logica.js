import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // Carregar Moradores para o Select
    const { data: moradores } = await supabase.from('moradores').select('id, nome');
    const select = document.getElementById('select-morador');
    if (moradores) {
        moradores.forEach(m => {
            select.innerHTML += `<option value="${m.id}">${m.nome}</option>`;
        });
    }

    // Carregar Tabela
    async function carregarEncomendas() {
        const { data } = await supabase.from('encomendas').select('*, moradores(nome)').eq('status', 'pendente');
        const corpo = document.getElementById('tabelaEncomendas');
        if (corpo && data) {
            corpo.innerHTML = data.map(item => `
                <tr class="text-xs">
                    <td class="py-3"><img src="${item.foto_url || ''}" class="w-10 h-10 rounded-full object-cover"></td>
                    <td class="py-3 font-bold">${item.moradores?.nome || 'N/A'}</td>
                    <td class="py-3 text-yellow-400">${item.empresa}</td>
                    <td class="py-3">${item.codigo}</td>
                    <td class="py-3"><button data-id="${item.id}" class="btn-entregar bg-green-600 px-3 py-1 rounded-lg">Entregar</button></td>
                </tr>
            `).join('');
        }
    }

    // Salvar Encomenda com Foto (Simulado)
    document.getElementById('btnSalvarEncomenda').addEventListener('click', async () => {
        const moradorId = document.getElementById('select-morador').value;
        const emp = document.getElementById('in-emp').value;
        const cod = document.getElementById('in-cod').value;

        await supabase.from('encomendas').insert([{ 
            morador_id: moradorId, empresa: emp, codigo: cod, status: 'pendente' 
        }]);

        document.getElementById('modalEncomenda').classList.add('hidden');
        carregarEncomendas();
    });

    carregarEncomendas();
});