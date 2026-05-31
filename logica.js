import { supabase } from './supabase-client.js';

let encomendaIdAtual = null;

async function uploadFoto(file, bucket) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl.publicUrl;
}

async function carregarEncomendas() {
    const { data } = await supabase.from('encomendas').select('*').eq('status', 'pendente');
    const corpo = document.getElementById('tabelaEncomendas');
    corpo.innerHTML = data.map(item => `
        <tr class="text-xs border-b border-white/10">
            <td class="py-3">
                ${item.foto_url ? `<button onclick="window.open('${item.foto_url}')" class="text-blue-400 font-bold">📷 Ver</button>` : '—'}
            </td>
            <td class="py-3 font-bold">${item.unidade || 'N/A'}</td>
            <td class="py-3">${item.logradouro || 'N/A'}</td>
            <td class="py-3">${item.empresa || 'N/A'}</td>
            <td class="py-3">${item.tipo || 'N/A'}</td>
            <td class="py-3"><button onclick="prepararEntrega('${item.id}')" class="bg-green-600 px-3 py-1 rounded">Entregar</button></td>
        </tr>
    `).join('');
}

window.prepararEntrega = (id) => { encomendaIdAtual = id; document.getElementById('modalEntrega').classList.remove('hidden'); };

window.carregarHistorico = async () => {
    document.getElementById('areaHistorico').classList.remove('hidden');
    const { data } = await supabase.from('encomendas').select('*').eq('status', 'entregue').order('created_at', { ascending: false }).limit(10);
    document.getElementById('tabelaHistorico').innerHTML = data.length > 0 ? data.map(item => `
        <div class="border-b border-white/10 py-2 flex justify-between">
            <span>${item.unidade} - ${item.logradouro}</span>
            <span class="text-white">Recebedor: ${item.recebedor || 'Portaria'}</span>
        </div>
    `).join('') : '<p>Nenhuma entrega encontrada.</p>';
};

document.getElementById('btnSalvarEncomenda').addEventListener('click', async () => {
    const file = document.getElementById('in-foto').files[0];
    let fotoUrl = "";
    if (file) fotoUrl = await uploadFoto(file, 'encomendas');

    const dados = {
        unidade: document.getElementById('in-morador-nome')?.value,
        logradouro: document.getElementById('in-endereco')?.value,
        empresa: document.getElementById('in-empresa')?.value,
        codigo: document.getElementById('in-cod')?.value || "0",
        tipo: document.getElementById('in-tipo')?.value,
        foto_url: fotoUrl,
        status: 'pendente'
    };
    await supabase.from('encomendas').insert([dados]);
    document.getElementById('modalEncomenda').classList.add('hidden');
    carregarEncomendas();
});

document.getElementById('btnConfirmarEntrega').addEventListener('click', async () => {
    const nomeRecebedor = document.getElementById('in-recebedor')?.value || "Portaria";
    await supabase.from('encomendas').update({ status: 'entregue', recebedor: nomeRecebedor }).eq('id', encomendaIdAtual);
    document.getElementById('modalEntrega').classList.add('hidden');
    carregarHistorico();
    carregarEncomendas();
});

window.mudarCor = (c) => document.getElementById('pageBody').style.backgroundColor = c;
window.togglePlay = () => { const icon = document.getElementById('playIcon'); icon.innerText = (icon.innerText === '▶' ? '⏸' : '▶'); };

carregarEncomendas();