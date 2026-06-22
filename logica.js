import { supabase } from './supabase-client.js';

let encomendaIdAtual = null;
let scannerAtivo = false;

// ===== FUNÇÕES DE UTILIDADE =====
function escaparHTML(texto) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return texto.replace(/[&<>"']/g, m => map[m]);
}

function validarDados(dados) {
    const erros = [];
    if (!dados.unidade || dados.unidade.trim() === '') erros.push('Nome do morador obrigatório');
    if (!dados.logradouro || dados.logradouro.trim() === '') erros.push('Endereço obrigatório');
    if (!dados.empresa || dados.empresa.trim() === '') erros.push('Empresa obrigatória');
    if (!dados.codigo || dados.codigo.trim() === '') erros.push('Código obrigatório');
    return erros;
}

async function uploadFoto(file, bucket) {
    try {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
        if (error) throw error;
        const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return publicUrl.publicUrl;
    } catch (erro) {
        console.error('Erro ao fazer upload:', erro);
        alert('Erro ao fazer upload da foto: ' + erro.message);
        return null;
    }
}

async function carregarEncomendas() {
    try {
        const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'pendente').order('created_at', { ascending: false });
        if (error) throw error;
        
        const corpo = document.getElementById('tabelaEncomendas');
        if (!corpo) return;
        
        if (data.length === 0) {
            corpo.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-gray-400">Nenhuma encomenda pendente</td></tr>';
            return;
        }
        
        corpo.innerHTML = data.map(item => `
            <tr class="text-xs border-b border-white/10 hover:bg-white/5 transition">
                <td class="py-3">
                    ${item.foto_url ? `<button onclick="window.open('${escaparHTML(item.foto_url)}')" class="text-blue-400 font-bold hover:underline">📷 Ver</button>` : '—'}
                </td>
                <td class="py-3 font-bold">${escaparHTML(item.unidade || 'N/A')}</td>
                <td class="py-3">${escaparHTML(item.logradouro || 'N/A')}</td>
                <td class="py-3">${escaparHTML(item.empresa || 'N/A')}</td>
                <td class="py-3">${escaparHTML(item.tipo || 'Normal')}</td>
                <td class="py-3"><button onclick="prepararEntrega('${item.id}')" class="bg-green-600 px-3 py-1 rounded font-bold text-white hover:bg-green-700 transition">Entregar</button></td>
            </tr>
        `).join('');
    } catch (erro) {
        console.error('Erro ao carregar encomendas:', erro);
        alert('Erro ao carregar encomendas: ' + erro.message);
    }
}

// ===== LEITOR DE CÓDIGO DE BARRAS =====
function iniciarLeitorCodigoBarras() {
    scannerAtivo = !scannerAtivo;
    const campo = document.getElementById('in-cod');
    if (!campo) return;
    
    if (scannerAtivo) {
        campo.placeholder = '📱 Escaneador ativo - aponte o leitor de código...';
        campo.style.borderColor = '#00ff00';
        campo.style.boxShadow = '0 0 10px rgba(0,255,0,0.3)';
        campo.focus();
    } else {
        campo.placeholder = 'Código';
        campo.style.borderColor = '';
        campo.style.boxShadow = '';
    }
}

// Listener para campo de código de barras (simula scanner)
document.addEventListener('DOMContentLoaded', () => {
    const campoCode = document.getElementById('in-cod');
    if (campoCode) {
        campoCode.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && scannerAtivo) {
                e.preventDefault();
                preencherCodigoBarras();
            }
        });
    }
});

function preencherCodigoBarras() {
    const codigo = document.getElementById('in-cod')?.value;
    if (codigo && codigo.trim() !== '') {
        console.log('Código escaneado:', codigo);
        // Aqui você pode adicionar lógica para buscar dados do código
        // Por exemplo: buscar no banco se o código já existe
        document.getElementById('in-morador-nome')?.focus();
    }
}

// ===== FUNÇÕES PRINCIPAIS =====

// ===== FUNÇÕES PRINCIPAIS =====
window.prepararEntrega = (id) => { 
    encomendaIdAtual = id; 
    const modal = document.getElementById('modalEntrega');
    if (modal) modal.classList.remove('hidden'); 
};

window.carregarHistorico = async () => {
    try {
        const areaHist = document.getElementById('areaHistorico');
        if (areaHist) areaHist.classList.remove('hidden');
        
        const { data, error } = await supabase.from('encomendas').select('*').eq('status', 'entregue').order('created_at', { ascending: false }).limit(10);
        if (error) throw error;
        
        const corpoHist = document.getElementById('tabelaHistoricoCorpo');
        if (!corpoHist) return;
        
        corpoHist.innerHTML = data.length > 0 ? data.map(item => `
            <tr class="border-b border-white/10 hover:bg-white/5 transition">
                <td class="py-2">
                    ${item.foto_url ? `<button onclick="window.open('${escaparHTML(item.foto_url)}')" class="text-blue-300 font-bold hover:underline">📷 Ver</button>` : '—'}
                </td>
                <td class="py-2">${escaparHTML(item.unidade)} - ${escaparHTML(item.logradouro)}</td>
                <td class="py-2">${escaparHTML(item.empresa || 'N/A')} (${escaparHTML(item.tipo || 'Normal')})</td>
                <td class="py-2 text-yellow-300 font-bold">${escaparHTML(item.recebedor || 'Portaria')}</td>
            </tr>
        `).join('') : '<tr><td colspan="4" class="py-2 text-center text-gray-400">Nenhuma entrega encontrada.</td></tr>';
    } catch (erro) {
        console.error('Erro ao carregar histórico:', erro);
        alert('Erro ao carregar histórico: ' + erro.message);
    }
};

window.salvarNovaEncomenda = async () => {
    try {
        const dados = {
            unidade: document.getElementById('in-morador-nome')?.value || "",
            logradouro: document.getElementById('in-endereco')?.value || "",
            empresa: document.getElementById('in-empresa')?.value || "",
            codigo: document.getElementById('in-cod')?.value || "",
            tipo: document.getElementById('in-tipo')?.value || "Normal",
            foto_url: "",
            status: 'pendente'
        };

        // Validar dados
        const erros = validarDados(dados);
        if (erros.length > 0) {
            alert('❌ Erros na validação:\n' + erros.join('\n'));
            return;
        }

        // Upload de foto se existir
        const file = document.getElementById('in-foto')?.files[0];
        if (file) {
            dados.foto_url = await uploadFoto(file, 'encomendas');
        }

        // Inserir no banco
        const { error } = await supabase.from('encomendas').insert([dados]);
        if (error) throw error;
        
        alert('✅ Encomenda salva com sucesso!');
        document.getElementById('modalEncomenda')?.classList.add('hidden');
        // Limpar formulário
        document.getElementById('in-cod').value = '';
        document.getElementById('in-morador-nome').value = '';
        document.getElementById('in-endereco').value = '';
        document.getElementById('in-empresa').value = '';
        document.getElementById('in-tipo').value = 'Normal';
        document.getElementById('in-foto').value = '';
        carregarEncomendas();
    } catch (erro) {
        console.error('Erro ao salvar encomenda:', erro);
        alert('❌ Erro ao salvar: ' + erro.message);
    }
};

window.confirmarEntrega = async () => {
    try {
        if (!encomendaIdAtual) {
            alert('❌ Erro: ID da encomenda não definido');
            return;
        }

        const nomeRecebedor = document.getElementById('in-recebedor')?.value || "Portaria";
        if (nomeRecebedor.trim() === '') {
            alert('❌ Digite o nome do recebedor');
            return;
        }

        const { error } = await supabase.from('encomendas').update({ 
            status: 'entregue', 
            recebedor: escaparHTML(nomeRecebedor) 
        }).eq('id', encomendaIdAtual);
        
        if (error) throw error;
        
        alert('✅ Entrega confirmada!');
        document.getElementById('modalEntrega')?.classList.add('hidden');
        carregarEncomendas();
        
        const areaHist = document.getElementById('areaHistorico');
        if (areaHist && !areaHist.classList.contains('hidden')) {
            carregarHistorico();
        }
    } catch (erro) {
        console.error('Erro ao confirmar entrega:', erro);
        alert('❌ Erro: ' + erro.message);
    }
};

window.mudarCor = (tipo) => {
    try {
        const body = document.getElementById('pageBody');
        if (!body) return;
        
        if (tipo === 'foto') {
            body.style.backgroundImage = "url('ubatuba.jpg')";
            body.style.backgroundColor = "transparent";
        } else {
            body.style.backgroundImage = "none";
            if (tipo === 'cinza') body.style.backgroundColor = "#1f2937";
            if (tipo === 'marrom') body.style.backgroundColor = "#A04000";
            if (tipo === 'azul') body.style.backgroundColor = "#1e3a8a";
        }
        localStorage.setItem('tema', tipo);
    } catch (erro) {
        console.error('Erro ao mudar cor:', erro);
    }
};

window.togglePlay = () => {
    try {
        const audio = document.getElementById('audioPlayer');
        const icon = document.getElementById('playIcon');
        if (!audio) return;

        if (audio.paused) {
            audio.play().catch(e => {
                console.error('Erro ao reproduzir áudio:', e);
                alert('Não foi possível reproduzir a transmissão ao vivo');
            });
            if (icon) icon.textContent = '⏸';
        } else {
            audio.pause();
            if (icon) icon.textContent = '▶';
        }
    } catch (erro) {
        console.error('Erro ao toggle play:', erro);
    }
};

// ===== INICIALIZAÇÃO NA CARGA DA PÁGINA =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('📱 Página carregada, inicializando...');
        
        // Carregar encomendas pendentes
        await carregarEncomendas();
        
        // Restaurar tema salvo
        const temasSalvo = localStorage.getItem('tema') || 'foto';
        mudarCor(temasSalvo);
        
        // Event listeners para botões
        const btnSalvar = document.getElementById('btnSalvarEncomenda');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', window.salvarNovaEncomenda);
        }
        
        const btnConfirmar = document.getElementById('btnConfirmarEntrega');
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', window.confirmarEntrega);
        }
        
        // Botão para ativar leitor de código de barras
        const btnScanner = document.getElementById('btnAtivarScanner');
        if (btnScanner) {
            btnScanner.addEventListener('click', iniciarLeitorCodigoBarras);
        }
        
        // Auto-foco no campo de código
        const campoCode = document.getElementById('in-cod');
        if (campoCode) {
            campoCode.addEventListener('focus', () => {
                if (scannerAtivo) {
                    campoCode.style.borderColor = '#00ff00';
                    campoCode.style.boxShadow = '0 0 10px rgba(0,255,0,0.3)';
                }
            });
        }
        
        console.log('✅ Inicialização concluída!');
    } catch (erro) {
        console.error('Erro na inicialização:', erro);
        alert('Erro ao inicializar a página: ' + erro.message);
    }
});

// Recarregar dados a cada 30 segundos
setInterval(() => {
    const modalAberta = !document.getElementById('modalEncomenda')?.classList.contains('hidden') || 
                        !document.getElementById('modalEntrega')?.classList.contains('hidden');
    if (!modalAberta) {
        carregarEncomendas();
    }
}, 30000);