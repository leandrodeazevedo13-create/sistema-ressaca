# 📱 Guia do Leitor de Código de Barras

## Como Usar

### Método 1: Scanner Físico (USB/Bluetooth)
1. Conecte o leitor ao computador
2. Abra o modal "Nova Encomenda"
3. Clique no botão **📱** (roxo, ao lado do campo "Código")
4. O campo ficará com borda **VERDE BRILHANTE** = scanner ativo
5. Aponte o leitor para o código de barras
6. Pressione `Enter` para confirmar
7. O cursor automaticamente move para o próximo campo

**Leitores Compatíveis:**
- Motorola DS-3678
- Honeywell Voyager
- Zebra DS3678
- Symbol DS6707
- Intermec CK70/CK75
- **Qualquer leitor que emule teclado USB**

---

### Método 2: Teclado Manual (Simulador)
1. Clique no botão **📱** para ativar scanner
2. Digite o código manualmente
3. Pressione `Enter` para confirmar

---

### Método 3: Câmera (Futuro)

Para ativar reconhecimento de código de barras via câmera, adicione esta biblioteca ao `painel.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.js"></script>
```

Depois use esta função no `logica.js`:

```javascript
async function iniciarCameraScanner() {
    const codeReader = new ZXing.BrowserMultiFormatReader();
    try {
        const result = await codeReader.decodeOnceFromVideoDevice(undefined, 'video');
        document.getElementById('in-cod').value = result.text;
        document.getElementById('in-morador-nome').focus();
    } catch (err) {
        alert('Erro ao ler código: ' + err);
    }
}
```

---

## Indicadores Visuais

### Ativo 🟢
```
Borda: Verde brilhante
Sombra: Glow verde
Placeholder: "📱 Escaneador ativo - aponte o leitor..."
```

### Inativo ⚪
```
Borda: Branco/cinza
Sombra: Normal
Placeholder: "Código"
```

---

## Troubleshooting

### Problema: Scanner não está funcionando
**Solução 1**: Verifique se o leitor está conectado
```powershell
# Windows PowerShell
Get-PnpDevice | Where-Object {$_.Name -like "*barcode*"}
```

**Solução 2**: Teste com um Notepad
- Abra Notepad
- Aponte o scanner
- Se não funcionar, problema é no hardware

**Solução 3**: Verifique drivers
- Alguns leitores precisam de drivers
- Visite o site do fabricante

### Problema: Enter não funciona
- O scanner deve terminar com Enter (a maioria faz)
- Verifique as configurações do scanner (manual)

### Problema: Código aparece, mas não move para próximo campo
- Certifique-se de pressionar Enter **após** o código
- O scanner deve enviar Enter automaticamente
- Se não, configure no menu do scanner

---

## Configurações Recomendadas do Scanner

### Motorola DS3678 (Exemplo)
1. Digitalize o código de sufixo abaixo:
```
Sufixo: Tab (move para próximo campo)
Ou: Enter (confirma e continua)
```

### Configuração Genérica
- **Sufixo**: Deve enviar `Enter` ou `Tab`
- **Tipo**: Code128 ou Code39
- **Comprimento**: Ilimitado

---

## Teste Rápido

Abra o console do navegador (F12) e execute:

```javascript
// Simular scanner
document.getElementById('in-cod').value = 'ML-123456789';
document.getElementById('in-cod').dispatchEvent(new Event('keydown', {key: 'Enter'}));
```

---

## Próximas Melhorias

- [ ] Suporte a câmera (ZXing.js)
- [ ] Validação de checksum de código de barras
- [ ] Histórico de códigos escaneados
- [ ] Busca automática de dados pelo código
- [ ] Avisos visuais/sonoros ao escanear
- [ ] Multi-scan em sequência

---

**Versão**: 1.0  
**Compatibilidade**: Chrome, Firefox, Safari, Edge  
**Suporte**: Bluetooth, USB, Serial
