import { supabase } from './supabase-client.js';

let encomendaIdAtual = null;

// Função Auxiliar de Upload para o Supabase Storage
async function uploadFoto(file, bucket) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl.publicUrl;
}

// Carrega a lista de encomendas pendentes
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
            <td class="py-3"><button onclick="prepararEntrega('${item.id}')" class="bg-green-600 px-3 py-1 rounded">Entregar</button></td>
        </tr>
    `).join('');
}

// Abre o modal de entrega
window.prepararEntrega = (id) => { 
    encomendaIdAtual = id; 
    document.getElementById('modalEntrega').classList.remove('hidden'); 
};

// Carrega o histórico (Área agora é Marrom pelo CSS no HTML)
window.carregarHistorico = async () => {
    document.getElementById('areaHistorico').classList.remove('hidden');
    const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'entregue').order('created_at', { ascending: false }).limit(10);
    
    if (error) { console.error(error); return; }
    document.getElementById('tabelaHistorico').innerHTML = data.length > 0 ? data.map(item => `
        <div class="border-b border-white/10 py-2 flex justify-between">
            <span>${item.unidade} - ${item.logradouro}</span>
            <span class="text-white">Recebedor: ${item.recebedor || 'Portaria'}</span>
        </div>
    `).join('') : '<p>Nenhuma entrega encontrada.</p>';
};

// Salvar Nova Encomenda
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
    } else {
        alert("Erro ao salvar: " + error.message);
    }
});

// Confirmar Entrega
document.getElementById('btnConfirmarEntrega').addEventListener('click', async () => {
    const nomeRecebedor = document.getElementById('in-recebedor')?.value || "Portaria";
    
    const { error } = await supabase.from('encomendas')
        .update({ status: 'entregue', recebedor: nomeRecebedor })
        .eq('id', encomendaIdAtual);
    
    if (!error) {
        document.getElementById('modalEntrega').classList.add('hidden');
        carregarEncomendas();
        if(!document.getElementById('areaHistorico').classList.contains('hidden')) {
            carregarHistorico();
        }
    }
});

// Funções de Layout
window.mudarCor = (c) => document.getElementById('pageBody').style.backgroundColor = c;
window.togglePlay = () => { 
    const audio = document.getElementById('audioPlayer');
    const icon = document.getElementById('playIcon'); 
    
    if (audio.paused) {
        audio.play();
        icon.innerText = '⏸';
    } else {
        audio.pause();
        icon.innerText = '▶';
    }
};

carregarEncomendas();