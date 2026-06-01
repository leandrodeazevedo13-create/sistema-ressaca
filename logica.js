import { supabase } from './supabase-client.js';

let encomendaIdAtual = null;

// Função de Upload para o Supabase Storage
async function uploadFoto(file, bucket) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl.publicUrl;
}

// Carrega a lista de encomendas pendentes com todas as colunas
async function carregarEncomendas() {
    const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'pendente');
    if (error) { console.error("Erro ao carregar encomendas:", error); return; }
    
    const corpo = document.getElementById('tabelaEncomendas');
    corpo.innerHTML = data.map(item => `
        <tr class="text-xs border-b border-white/10 hover:bg-white/5 transition-colors">
            <td class="py-3">
                ${item.foto_url ? `<button onclick="window.open('${item.foto_url}')" class="text-blue-400 font-bold hover:underline flex items-center gap-1">📷 Ver</button>` : '—'}
            </td>
            <td class="py-3 font-bold text-white">${item.unidade || 'N/A'}</td>
            <td class="py-3 text-gray-300">${item.logradouro || 'N/A'}</td>
            <td class="py-3 text-gray-300">${item.empresa || 'N/A'}</td>
            <td class="py-3 text-gray-400 font-mono">${item.tipo || 'N/A'}</td>
            <td class="py-3">
                <button onclick="prepararEntrega('${item.id}')" class="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 rounded shadow transition">Entregar</button>
            </td>
        </tr>
    `).join('');
}

// Abre o modal de confirmação de entrega
window.prepararEntrega = (id) => { 
    encomendaIdAtual = id; 
    document.getElementById('modalEntrega').classList.remove('hidden'); 
    document.getElementById('in-recebedor').focus();
};

// Carrega o histórico trazendo a FOTO também
window.carregarHistorico = async () => {
    document.getElementById('areaHistorico').classList.remove('hidden');
    const { data, error } = await supabase.from('encomendas')
        .select('*')
        .eq('status', 'entregue')
        .order('created_at', { ascending: false })
        .limit(10);
        
    if (error) { console.error("Erro ao carregar histórico:", error); return; }
    
    const tabelaCorpo = document.getElementById('tabelaHistoricoCorpo');
    
    if (data.length > 0) {
        tabelaCorpo.innerHTML = data.map(item => `
            <tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td class="py-2">
                    ${item.foto_url ? `<button onclick="window.open('${item.foto_url}')" class="text-blue-200 font-bold hover:underline flex items-center gap-1">📷 Ver</button>` : '—'}
                </td>
                <td class="py-2 text-white font-semibold">${item.unidade} - ${item.logradouro}</td>
                <td class="py-2 text-white/80">${item.empresa || 'N/A'} (${item.tipo || 'Normal'})</td>
                <td class="py-2 text-yellow-300 font-bold">👤 ${item.recebedor || 'Portaria'}</td>
            </tr>
        `).join('');
    } else {
        tabelaCorpo.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-white/70">Nenhuma entrega no histórico recente.</td></tr>`;
    }
};

// Salvar Nova Encomenda vinda do Modal
document.getElementById('btnSalvarEncomenda').addEventListener('click', async () => {
    const file = document.getElementById('in-foto')?.files[0];
    let fotoUrl = "";
    
    try {
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
            // Limpa os campos para o próximo uso
            document.getElementById('in-morador-nome').value = '';
            document.getElementById('in-endereco').value = '';
            document.getElementById('in-empresa').value = '';
            document.getElementById('in-cod').value = '';
            document.getElementById('in-tipo').value = '';
            document.getElementById('in-foto').value = '';
            
            carregarEncomendas(); 
        } else { 
            alert("Erro ao salvar dados no banco: " + error.message); 
        }
    } catch (err) {
        console.error(err);
        alert("Erro no upload da foto. Verifique as permissões de Storage Policies do seu painel Supabase.");
    }
});

// Confirmar Entrega Realizada
document.getElementById('btnConfirmarEntrega').addEventListener('click', async () => {
    const nomeRecebedor = document.getElementById('in-recebedor')?.value || "Portaria";
    
    const { error } = await supabase.from('encomendas')
        .update({ status: 'entregue', recebedor: nomeRecebedor })
        .eq('id', encomendaIdAtual);
        
    if (!error) {
        document.getElementById('modalEntrega').classList.add('hidden');
        document.getElementById('in-recebedor').value = '';
        carregarEncomendas();
        if(!document.getElementById('areaHistorico').classList.contains('hidden')) {
            carregarHistorico();
        }
    } else {
        alert("Erro ao atualizar entrega: " + error.message);
    }
});

// Sistema Inteligente de Troca de Fundo (Cores ou Imagem)
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

// Player da Rádio Eldorado
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

// Inicialização Automática ao abrir a tela
carregarEncomendas();