import { supabase } from './supabase-client.js';

let encomendaIdAtual = null;

async function uploadFoto(file, bucket) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl.publicUrl;
}

async function carregarEncomendas() {
    const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'pendente');
    if (error) { console.error("Erro ao carregar:", error); return; }
    
    const corpo = document.getElementById('tabelaEncomendas');
    corpo.innerHTML = data.map(item => `
        <tr class="text-xs border-b border-white/10">
            <td class="py-3">
                ${item.foto_url ? `<button onclick="window.open('${item.foto_url}')" class="text-blue-400 font-bold hover:underline">📷 Ver</button>` : '—'}
            </td>
            <td class="py-3 font-bold">${item.unidade || 'N/A'}</td>
            <td class="py-3">${item.logradouro || 'N/A'}</td>
            <td class="py-3">${item.empresa || 'N/A'}</td>
            <td class="py-3">${item.tipo || 'N/A'}</td>
            <td class="py-3"><button onclick="prepararEntrega('${item.id}')" class="bg-green-600 px-3 py-1 rounded font-bold text-white hover:bg-green-700 transition">Entregar</button></td>
        </tr>
    `).join('');
}

window.prepararEntrega = (id) => { 
    encomendaIdAtual = id; 
    document.getElementById('modalEntrega').classList.remove('hidden'); 
};

window.carregarHistorico = async () => {
    document.getElementById('areaHistorico').classList.remove('hidden');
    const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'entregue').order('created_at', { ascending: false }).limit(10);
    
    if (error) { console.error(error); return; }
    const corpoHist = document.getElementById('tabelaHistoricoCorpo');
    
    corpoHist.innerHTML = data.length > 0 ? data.map(item => `
        <tr class="border-b border-white/10">
            <td class="py-2">
                ${item.foto_url ? `<button onclick="window.open('${item.foto_url}')" class="text-blue-300 font-bold hover:underline">📷 Ver</button>` : '—'}
            </td>
            <td class="py-2">${item.unidade} - ${item.logradouro}</td>
            <td class="py-2">${item.empresa || 'N/A'} (${item.tipo || 'Normal'})</td>
            <td class="py-2 text-yellow-300 font-bold">${item.recebedor || 'Portaria'}</td>
        </tr>
    `).join('') : '<tr><td colspan="4" class="py-2">Nenhuma entrega encontrada.</td></tr>';
};

document.getElementById('btnSalvarEncomenda').addEventListener('click', async () => {
    const file = document.getElementById('in-foto')?.files[0];
    let fotoUrl = "";
    if (file) fotoUrl = await uploadFoto(file, 'encomendas');

    const dados = {
        unidade: document.getElementById('in-morador-nome')?.value || "0",
        logradouro: document.getElementById('in-endereco')?.value || "S/E",
        empresa: document.getElementById('in-empresa')?.value || "N/A",
        codigo: document.getElementById('in-cod')?.value || "0",
        tipo: document.getElementById('in-tipo')?.value || "Normal",
        foto_url: fotoUrl,
        status: 'pendente'
    };

    const { error } = await supabase.from('encomendas').insert([dados]);
    if (!error) { 
        document.getElementById('modalEncomenda').classList.add('hidden'); 
        carregarEncomendas(); 
    } else { alert("Erro ao salvar: " + error.message); }
});

document.getElementById('btnConfirmarEntrega').addEventListener('click', async () => {
    const nomeRecebedor = document.getElementById('in-recebedor')?.value || "Portaria";
    const { error } = await supabase.from('encomendas').update({ status: 'entregue', recebedor: nomeRecebedor }).eq('id', encomendaIdAtual);
    if (!error) {
        document.getElementById('modalEntrega').classList.add('hidden');
        carregarEncomendas();
        if(!document.getElementById('areaHistorico').classList.contains('hidden')) carregarHistorico();
    }
});

window.mudarCor = (tipo) => {
    const body = document.getElementById('pageBody');
    if (tipo === 'foto') {
        body.style.backgroundImage = "url('ubatuba.jpg')";
        body.style.backgroundColor = "transparent";
    } else {
        body.style.backgroundImage = "none";
        if (tipo === 'cinza') body.style.backgroundColor = "#1f2937";
        if (tipo === 'marrom') body.style.backgroundColor = "#A04000";
        if (tipo === 'azul') body.style.backgroundColor = "#1e3a8a";
    }
};

window.togglePlay = () => { 
    const audio = document.getElementById('audioPlayer');
    const icon = document.getElementById('playIcon'); 
    if (audio.paused) { audio.play(); icon.innerText = '⏸'; } 
    else { audio.pause(); icon.innerText = '▶'; }
};

carregarEncomendas();