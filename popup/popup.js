// Kapatma butonu
document.getElementById('close-popup')?.addEventListener('click', () => {
  window.close();
});

// Tema uygula
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  
  // Butonları güncelle
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.getAttribute('data-theme') === theme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Storage'a kaydet
  chrome.storage.local.set({ theme });
}

// Tema butonları
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.getAttribute('data-theme');
    applyTheme(theme);
  });
});

// Sayfa yüklenince temayı yükle ve aktif provider'ı göster
chrome.storage.local.get('theme').then(result => {
  const theme = result.theme || 'light';
  applyTheme(theme);
});

// Aktif provider bilgisini güncelle
async function updateActiveProviderDisplay() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROVIDER' });
    if (response.success) {
      const providerDisplay = document.getElementById('active-provider-display');
      if (providerDisplay) {
        const providerName = getProviderDisplayName(response.activeProvider);
        providerDisplay.textContent = `Aktif: ${providerName}`;
      }
    }
  } catch (error) {
    //console.error('Aktif provider güncelleme hatası:', error);
  }
}

// Provider display name helper
function getProviderDisplayName(provider) {
  if (!provider) return 'Varsayılan AI (Pollinations)';
  
  const names = {
    'groq': 'Groq (Llama 3.3 70B)',
    'openai': 'OpenAI (GPT)',
    'claude': 'Claude (Anthropic)',
    'gemini': 'Google Gemini',
    'cohere': 'Cohere',
    'custom': 'Özel API'
  };
  return names[provider] || provider;
}

// Sayfa yüklendiğinde seçili sağlayıcıyı ve aktif durumu yükle
(async function initProviderSelection() {
  try {
    // Kullanıcı tercihini al
    const sel = await chrome.runtime.sendMessage({ type: 'GET_SELECTED_PROVIDER' });
    const selectEl = document.getElementById('api-provider');
    if (sel.success && sel.selectedProvider && selectEl) {
      selectEl.value = sel.selectedProvider;
    }
  } catch (_) {}
  updateActiveProviderDisplay();
})();

// Sekme değiştirme
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    if (tabName === 'history') {
      loadHistory();
    }
  });
});

// Custom endpoint gösterme/gizleme + Maskeli anahtar yükleme
document.getElementById('api-provider').addEventListener('change', async (e) => {
  const provider = e.target.value;
  const customContainer = document.getElementById('custom-endpoint-container');
  const apiKeyInput = document.getElementById('api-key');
  
  if (provider === 'custom') {
    customContainer.style.display = 'block';
  } else {
    customContainer.style.display = 'none';
  }
  
  // Eğer varsayılan seçiliyse, kutuyu boşalt
  if (!provider || provider === '') {
    apiKeyInput.value = '';
    apiKeyInput.placeholder = 'API Anahtarı';
    return;
  }
  
  // Seçilen provider'ın kayıtlı anahtarını göster (maskeli)
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_MASKED_API_KEY',
      data: { provider }
    });
    
    if (response.success && response.maskedKey) {
      apiKeyInput.value = response.maskedKey;
      apiKeyInput.placeholder = 'Kayıtlı anahtar: ' + response.maskedKey;
    } else {
      apiKeyInput.value = '';
      apiKeyInput.placeholder = 'API Anahtarı';
    }
  } catch (error) {
    //console.error('Maskeli anahtar yükleme hatası:', error);
    apiKeyInput.value = '';
  }

  // Kullanıcı tercihini güncelle (eğer anahtar yoksa, arka plan otomatik temizler)
  try {
    await chrome.runtime.sendMessage({ type: 'SET_SELECTED_PROVIDER', data: { provider: provider || null } });
  } catch (_) {}
});

// API anahtarı göster/gizle
document.getElementById('toggle-api-key').addEventListener('click', () => {
  const apiKeyInput = document.getElementById('api-key');
  const toggleBtn = document.getElementById('toggle-api-key');
  
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    toggleBtn.textContent = '🙈'; // Görünmez maymun emojisi
  } else {
    apiKeyInput.type = 'password';
    toggleBtn.textContent = '👁️'; // Göz emojisi
  }
});

// API kaydet
document.getElementById('save-api').addEventListener('click', async () => {
  const provider = document.getElementById('api-provider').value;
  const apiKey = document.getElementById('api-key').value;
  const saveBtn = document.getElementById('save-api');
  
  if (!provider || !apiKey) {
    showStatus('Lütfen sağlayıcı ve API anahtarı girin', 'error');
    return;
  }
  
  // Loading durumu
  const originalText = saveBtn.textContent;
  saveBtn.textContent = 'Kaydediliyor...';
  saveBtn.disabled = true;
  
  try {
    const data = { provider, apiKey };
    
    // Custom endpoint için ek bilgiler
    if (provider === 'custom') {
      const endpoint = document.getElementById('custom-endpoint').value;
      const model = document.getElementById('custom-model').value;
      
      if (!endpoint) {
        showStatus('Lütfen API endpoint URL girin', 'error');
        return;
      }
      
      data.customEndpoint = endpoint;
      data.customModel = model || '';
    }
    
    // API anahtarını kaydet
    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_API_KEY',
      data
    });
    
    if (response.success) {
      showStatus('✓ API anahtarı kaydedildi', 'success');
      
      // Kayıtlı anahtarı maskeli olarak göster
      const maskedResponse = await chrome.runtime.sendMessage({
        type: 'GET_MASKED_API_KEY',
        data: { provider }
      });
      
      const apiKeyInput = document.getElementById('api-key');
      if (maskedResponse.success && maskedResponse.maskedKey) {
        apiKeyInput.value = maskedResponse.maskedKey;
        apiKeyInput.placeholder = 'Kayıtlı anahtar: ' + maskedResponse.maskedKey;
      }
      
      // Custom endpoint alanlarını temizle (custom ise)
      if (provider === 'custom') {
        document.getElementById('custom-endpoint').value = '';
        document.getElementById('custom-model').value = '';
      }
      
      // Aktif provider göstergesini güncelle
      updateActiveProviderDisplay();
    } else {
      showStatus('Hata: ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('Hata: ' + error.message, 'error');
  } finally {
    // Loading durumunu kaldır
    saveBtn.textContent = originalText;
    saveBtn.disabled = false;
  }
});

// API sil
document.getElementById('delete-api').addEventListener('click', async () => {
  const provider = document.getElementById('api-provider').value;
  
  if (!provider) {
    showStatus('Lütfen bir sağlayıcı seçin', 'error');
    return;
  }
  
  // Silme işlemi
  const response = await chrome.runtime.sendMessage({
    type: 'DELETE_API_KEY',
    data: { provider }
  });
  
  if (response.success) {
    showStatus('✓ API anahtarı silindi', 'success');
    
    // Dropdown'ı varsayılana döndür
    const providerSelect = document.getElementById('api-provider');
    providerSelect.value = '';
    
    // API key kutusunu temizle
    const apiKeyInput = document.getElementById('api-key');
    apiKeyInput.value = '';
    apiKeyInput.placeholder = 'API Anahtarı';
    
    // Custom endpoint container'ı gizle
    document.getElementById('custom-endpoint-container').style.display = 'none';
    
    // Aktif provider göstergesini güncelle
    updateActiveProviderDisplay();
  } else {
    showStatus('Hata: ' + response.error, 'error');
  }
});

// Geçmişi yükle
async function loadHistory() {
  const response = await chrome.runtime.sendMessage({
    type: 'GET_HISTORY'
  });
  
  const historyList = document.getElementById('history-list');
  
  if (response.success && response.data.length > 0) {
    // Her öğeyi ayrı ayrı oluştur
    historyList.innerHTML = '';
    
    response.data.forEach((item, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.setAttribute('data-index', index);
      
      // Üst başlık: Tarih ve Sil butonu
      const headerDiv = document.createElement('div');
      headerDiv.style.display = 'flex';
      headerDiv.style.justifyContent = 'space-between';
      headerDiv.style.alignItems = 'center';
      headerDiv.style.marginBottom = '8px';
      
      const dateDiv = document.createElement('div');
      dateDiv.className = 'history-date';
      dateDiv.textContent = new Date(item.timestamp).toLocaleString('tr-TR');
      headerDiv.appendChild(dateDiv);
      
      // Sil butonu (sağ üstte)
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'expand-btn';
      deleteBtn.textContent = '❌ Sil';
      deleteBtn.style.background = '#dc3545';
      deleteBtn.style.color = 'white';
      deleteBtn.style.padding = '4px 8px';
      deleteBtn.style.fontSize = '11px';
      deleteBtn.onclick = async () => {
        if (confirm('Bu işlem kaydını silmek istediğinize emin misiniz?')) {
          const response = await chrome.runtime.sendMessage({
            type: 'DELETE_HISTORY_ITEM',
            data: { index }
          });
          
          if (response.success) {
            loadHistory(); // Listeyi yenile
          }
        }
      };
      headerDiv.appendChild(deleteBtn);
      
      historyItem.appendChild(headerDiv);
      
      // İşlem tipi
      const actionDiv = document.createElement('div');
      actionDiv.className = 'history-action';
      let actionText = '🔧 Metin İyileştirme';
      if (item.mainAction === 'toPrompt') {
        actionText = '🎯 Prompt Oluşturma';
      } else if (item.mainAction === 'summarize') {
        actionText = '📝 Metin Özeti';
      }
      const styleText = item.processingStyle === 'faithful' ? 'Sadık Kal' : 'AI Geliştir';
      actionDiv.textContent = `${actionText} (${styleText})`;
      historyItem.appendChild(actionDiv);
      
      // Metin
      const textDiv = document.createElement('div');
      textDiv.className = 'history-text';
      const shortText = item.selectedText.length > 100 ? item.selectedText.substring(0, 100) + '...' : item.selectedText;
      
      const textHeader = document.createElement('div');
      textHeader.style.display = 'flex';
      textHeader.style.justifyContent = 'space-between';
      textHeader.style.alignItems = 'center';
      textHeader.style.marginBottom = '4px';
      
      const textLabel = document.createElement('strong');
      textLabel.textContent = 'Metin:';
      textHeader.appendChild(textLabel);
      
      const textButtonsDiv = document.createElement('div');
      textButtonsDiv.style.display = 'flex';
      textButtonsDiv.style.gap = '4px';
      
      if (item.selectedText.length > 100) {
        const expandBtn = document.createElement('button');
        expandBtn.className = 'expand-btn';
        expandBtn.textContent = 'Tamamını Gör';
        expandBtn.onclick = function() {
          const textPreview = this.parentElement.parentElement.nextElementSibling;
          toggleText(textPreview, item.selectedText, this);
        };
        textButtonsDiv.appendChild(expandBtn);
      }
      
      const copyTextBtn = document.createElement('button');
      copyTextBtn.className = 'expand-btn';
      copyTextBtn.textContent = '📋';
      copyTextBtn.title = 'Metni Kopyala';
      copyTextBtn.onclick = () => copyResult(item.selectedText, copyTextBtn);
      textButtonsDiv.appendChild(copyTextBtn);
      
      textHeader.appendChild(textButtonsDiv);
      textDiv.appendChild(textHeader);
      
      const textPreview = document.createElement('span');
      textPreview.className = 'text-preview';
      textPreview.textContent = shortText;
      textDiv.appendChild(textPreview);
      
      historyItem.appendChild(textDiv);
      
      // Sonuç
      const resultDiv = document.createElement('div');
      resultDiv.className = 'history-result';
      const shortResult = item.result.length > 200 ? item.result.substring(0, 200) + '...' : item.result;
      
      const resultHeader = document.createElement('div');
      resultHeader.style.display = 'flex';
      resultHeader.style.justifyContent = 'space-between';
      resultHeader.style.alignItems = 'center';
      resultHeader.style.marginBottom = '4px';
      
      const resultLabel = document.createElement('strong');
      resultLabel.textContent = 'Sonuç:';
      resultHeader.appendChild(resultLabel);
      
      const resultButtonsDiv = document.createElement('div');
      resultButtonsDiv.style.display = 'flex';
      resultButtonsDiv.style.gap = '4px';
      
      if (item.result.length > 200) {
        const expandBtn = document.createElement('button');
        expandBtn.className = 'expand-btn';
        expandBtn.textContent = 'Tamamını Gör';
        expandBtn.onclick = function() {
          const resultPreview = this.parentElement.parentElement.nextElementSibling;
          toggleText(resultPreview, item.result, this);
        };
        resultButtonsDiv.appendChild(expandBtn);
      }
      
      const copyResultBtn = document.createElement('button');
      copyResultBtn.className = 'expand-btn';
      copyResultBtn.textContent = '📋';
      copyResultBtn.title = 'Sonuç Kopyala';
      copyResultBtn.onclick = () => copyResult(item.result, copyResultBtn);
      resultButtonsDiv.appendChild(copyResultBtn);
      
      resultHeader.appendChild(resultButtonsDiv);
      resultDiv.appendChild(resultHeader);
      
      const resultPreview = document.createElement('span');
      resultPreview.className = 'text-preview';
      resultPreview.textContent = shortResult;
      resultDiv.appendChild(resultPreview);
      
      historyItem.appendChild(resultDiv);
      
      // Provider (alt kısım)
      const providerDiv = document.createElement('div');
      providerDiv.className = 'history-provider';
      providerDiv.textContent = `AI: ${item.provider}`;
      providerDiv.style.marginTop = '8px';
      historyItem.appendChild(providerDiv);
      
      historyList.appendChild(historyItem);
    });
  } else {
    historyList.innerHTML = '<p class="empty">Henüz işlem geçmişi yok</p>';
  }
}

function showStatus(message, type) {
  const status = document.getElementById('api-status');
  status.textContent = message;
  status.className = type;
  
  // Hata mesajını 5 saniye sonra tamamen temizle
  setTimeout(() => {
    status.textContent = '';
    status.className = '';
    status.removeAttribute('class'); // Tüm class'ları kaldır
  }, 5000);
}
// Tüm geçmişi temizle butonu
document.getElementById('clear-history').addEventListener('click', async () => {
  if (confirm('Tüm işlem geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
    const response = await chrome.runtime.sendMessage({
      type: 'CLEAR_HISTORY'
    });
    
    if (response.success) {
      loadHistory(); // Listeyi yenile
    }
  }
});

// Ayarları yükle
chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }).then(response => {
  if (response.success) {
    document.getElementById('use-page-title').checked = response.data.usePageTitle;
  }
});

// Ayar değişikliklerini kaydet
document.getElementById('use-page-title').addEventListener('change', (e) => {
  chrome.runtime.sendMessage({
    type: 'SAVE_SETTINGS',
    data: { usePageTitle: e.target.checked }
  });
});

// ============================================================================
// PROMPT DÜZENLEME
// ============================================================================

const DEFAULT_TEMPLATES = {
  template1: `SEN BİR METİN DÜZENLEYİCİSİN. GÖREVİN, AŞAĞIDA VERİLEN "{Seçilen_Metin}" İÇERİSİNDEKİ CÜMLELERİ, ANLAMINI KESİNLİKLE DEĞİŞTİRMEDEN YENİDEN DÜZENLEMEKTİR. Sayfa Bağlamı: "{Sayfa_Başlığı}".

KESİN KURALLAR:
İnisiyatif Alma: Metne dışarıdan HİÇBİR BİLGİ, YORUM veya KELİME ekleme.
Sadık Kal: Sadece mevcut cümlelerin yapısını değiştir, kelimeleri eş anlamlarıyla değiştirerek akıcılığı artır ve dilbilgisi hatalarını düzelt.
Özü Koru: Orijinal metnin ana mesajı ve tonu %100 korunmalıdır.

Ek Talimatlar: "{Ek_Talimatlar}"
Çıktı Dili: "{Hedef_Dil}"

Orijinal Metin:
"{Seçilen_Metin}"`,
  
  template2: `SEN BİR İÇERİK GELİŞTİRİCİSİN. GÖREVİN, AŞAĞIDA VERİLEN "{Seçilen_Metin}"'İ, "{Sayfa_Başlığı}" BAĞLAMINI KULLANARAK ANALİZ ETMEK VE DAHA ANLAŞILIR, KAPSAMLI VE İKNA EDİCİ HALE GETİRMEKTİR.

YÖNERGELER:
Temel İyileştirme: İlk olarak metindeki dilbilgisi hatalarını düzelt ve akıcılığı artır.
Mantıksal Genişletme: Metindeki olası mantıksal boşlukları veya eksik bırakılmış argümanları tespit et. Bu boşlukları, metnin ana fikrini destekleyecek şekilde kısa ve öz bilgilerle doldur.
Sınırları Koru: Yaptığın eklemeler KESİNLİKLE orijinal metnin konusuyla doğrudan ilgili olmalıdır. Konu dışına çıkma veya ilgisiz örnekler verme.

Ek Talimatlar: "{Ek_Talimatlar}"
Çıktı Dili: "{Hedef_Dil}"

Orijinal Metin:
"{Seçilen_Metin}"`,
  
  template3: `SEN BİR PROMPT YARDIMCISISIN. GÖREVİN, AŞAĞIDAKİ "{Seçilen_Metin}" İÇERİSİNDE YER ALAN BİLGİLERİ KULLANARAK BİR YAPAY ZEKA MODELİ İÇİN YAPILANDIRILMIŞ BİR PROMPT OLUŞTURMAKTIR. Sayfa Bağlamı: "{Sayfa_Başlığı}".

KESİN KURALLAR:
Sadece Mevcut Bilgi: Prompt'u oluştururken SADECE VE SADECE "{Seçilen_Metin}" içinde verilen bilgileri kullan. Metinde olmayan hiçbir detayı (hedef kitle, format, ton vb.) varsayma veya ekleme.
Yapılandır: Mevcut bilgileri "Görev:", "Konu:", "Anahtar Noktalar:" gibi başlıklar altında organize et.

Ek Talimatlar: "{Ek_Talimatlar}"

Orijinal Metin:
"{Seçilen_Metin}"`,
  
  template4: `SEN BİR UZMAN PROMPT MÜHENDİSİSİN. GÖREVİN, AŞAĞIDAKİ "{Seçilen_Metin}"'DE VERİLEN FİKRİ, "{Sayfa_Başlığı}" BAĞLAMINI DA GÖZ ÖNÜNDE BULUNDURARAK ANALİZ ETMEK VE BİR YAPAY ZEKA MODELİNDEN EN İYİ SONUCU ALMAK İÇİN GEREKEN TÜM DETAYLARI İÇEREN KAPSAMLI BİR PROMPT OLUŞTURMAKTIR.

YÖNERGELER:
Eksikleri Belirle: Orijinal metni ve sayfa bağlamını oku ve etkili bir prompt için eksik olan bileşenleri (örneğin; Rol Tanımı, Hedef Kitle, Ton, Format, Kısıtlamalar, Örnekler) tespit et.
Mantıklı Tamamlama: Bu eksik bileşenleri, orijinal fikrin bağlamına en uygun şekilde mantık yürüterek sen doldur.
Yapısal Çıktı: Prompt'u, bir yapay zekanın kolayca anlayabileceği şekilde, "Rol:", "Görev:", "Bağlam:", "Hedef Kitle:", "Ton ve Stil:", "Format:", "Kısıtlamalar:" gibi net başlıklar altında sun.

Ek Talimatlar: "{Ek_Talimatlar}"

Orijinal Metin:
"{Seçilen_Metin}"`
,
  
  template5: `SEN BİR METİN ÖZETLEYİCİSİN. GÖREVİN, AŞAĞIDA VERİLEN "{Seçilen_Metin}" İÇERİSİNDEKİ ANA FİKRİ VE ÖNEMLİ NOKTALARINI BELİRLEYEREK KISA VE NET BİR ÖZET OLUŞTURMAKTIR. Sayfa Bağlamı: "{Sayfa_Başlığı}".

KESİN KURALLAR:
İnisiyatif Alma: Metne dışarıdan HİÇBİR BİLGİ, YORUM veya KELİME ekleme.
Sadık Kal: Sadece metinde var olan bilgileri kullan.
Özü Koru: Orijinal metnin ana mesajı ve tonu %100 korunmalıdır.
Kısa ve Net: Özet, metnin esasını kısa ve anlaşılır şekilde yansıtmalıdır.

Ek Talimatlar: "{Ek_Talimatlar}"
Çıktı Dili: "{Hedef_Dil}"

Orijinal Metin:
"{Seçilen_Metin}"`
,
  
  template6: `SEN BİR İÇERİK ANALİZCİSİSİN. GÖREVİN, AŞAĞIDA VERİLEN "{Seçilen_Metin}"’İ, "{Sayfa_Başlığı}" BAĞLAMINI KULLANARAK ANALİZ ETMEK VE DAHA DETAYLI, KAPSAMLI BİR ÖZET OLUŞTURMAKTIR.

YÖNERGELER:
Temel Özetleme: İlk olarak metnin ana fikri ve önemli noktalarını tespit et.
Mantıksal Genişletme: Metindeki olası mantıksal boşlukları veya eksik bırakılmış bağlamları tespit et. Bu boşlukları, metnin ana fikrini destekleyecek şekilde kısa ve öz bilgilerle zenginleştir.
Sınırları Koru: Yaptığın eklemeler KESİNLİKLE orijinal metnin konusuyla doğrudan ilişkili olmalıdır. Konu dışına çıkma veya ilgisiz örnekler verme.
Detay ve Anlaşılırlık: Özet hem detaylı hem de kolay anlaşılır olmalıdır.

Ek Talimatlar: "{Ek_Talimatlar}"
Çıktı Dili: "{Hedef_Dil}"

Orijinal Metin:
"{Seçilen_Metin}"`
};

let currentTemplate = 'template1';

// Prompt şablon seçici
document.getElementById('prompt-template-select').addEventListener('change', async (e) => {
  currentTemplate = e.target.value;
  await loadPromptTemplate();
});

// Prompt yükleme
async function loadPromptTemplate() {
  try {
    const result = await chrome.storage.local.get('custom_prompts');
    const customPrompts = result.custom_prompts || {};
    
    const editor = document.getElementById('prompt-editor');
    editor.value = customPrompts[currentTemplate] || DEFAULT_TEMPLATES[currentTemplate];
  } catch (error) {
    //console.error('Prompt yükleme hatası:', error);
  }
}

// Prompt kaydetme
document.getElementById('save-prompt').addEventListener('click', async () => {
  try {
    const editor = document.getElementById('prompt-editor');
    const result = await chrome.storage.local.get('custom_prompts');
    const customPrompts = result.custom_prompts || {};
    
    customPrompts[currentTemplate] = editor.value;
    await chrome.storage.local.set({ custom_prompts: customPrompts });
    
    showPromptStatus('✓ Prompt kaydedildi', 'success');
  } catch (error) {
    showPromptStatus('Hata: ' + error.message, 'error');
  }
});

// Varsayılana dönüş
document.getElementById('reset-prompt').addEventListener('click', async () => {
  if (confirm('Şablonu varsayılan haline döndürmek istediğinizden emin misiniz?')) {
    try {
      const result = await chrome.storage.local.get('custom_prompts');
      const customPrompts = result.custom_prompts || {};
      
      delete customPrompts[currentTemplate];
      await chrome.storage.local.set({ custom_prompts: customPrompts });
      
      await loadPromptTemplate();
      showPromptStatus('✓ Varsayılan şablon geri yüklendi', 'success');
    } catch (error) {
      showPromptStatus('Hata: ' + error.message, 'error');
    }
  }
});

function showPromptStatus(message, type) {
  const status = document.getElementById('prompt-status');
  status.textContent = message;
  status.className = type;
  setTimeout(() => status.textContent = '', 3000);
}

// Sayfa yüklenince ilk template'ı yükle
loadPromptTemplate();

// Sayfa yüklenince aktif provider'ın maskeli anahtarını yükle
async function loadInitialMaskedKey() {
  try {
    // Aktif provider'ı bul
    const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROVIDER' });
    if (response.success && response.activeProvider) {
      const provider = response.activeProvider;
      
      // Dropdown'ı seç
      const providerSelect = document.getElementById('api-provider');
      providerSelect.value = provider;
      
      // Custom endpoint varsa göster
      if (provider === 'custom') {
        document.getElementById('custom-endpoint-container').style.display = 'block';
      }
      
      // Maskeli anahtarı yükle
      const maskedResponse = await chrome.runtime.sendMessage({
        type: 'GET_MASKED_API_KEY',
        data: { provider }
      });
      
      if (maskedResponse.success && maskedResponse.maskedKey) {
        const apiKeyInput = document.getElementById('api-key');
        apiKeyInput.value = maskedResponse.maskedKey;
        apiKeyInput.placeholder = 'Kayıtlı anahtar: ' + maskedResponse.maskedKey;
      }
    }
  } catch (error) {
    //console.error('Maskeli anahtar yükleme hatası:', error);
  }
}

// Sayfa yüklenince maskeli anahtarı yükle
loadInitialMaskedKey();

// Storage değişikliklerini dinle (content script'ten gelen güncellemeler için)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.custom_prompts) {
    // Prompt değişti, eğer Promptlar sekmesi açıksa yeniden yükle
    const promptTab = document.getElementById('prompts-tab');
    if (promptTab && promptTab.classList.contains('active')) {
      loadPromptTemplate();
    }
  }
});

// Runtime mesajlarını dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROMPT_UPDATED' || message.type === 'PROMPT_RESET') {
    // Promptlar sekmesi açıksa yeniden yükle
    const promptTab = document.getElementById('prompts-tab');
    if (promptTab && promptTab.classList.contains('active')) {
      loadPromptTemplate();
    }
  }
  
  // Aktif sağlayıcı değişti -> göstergeleri yenile
  if (message.type === 'PROVIDER_CHANGED') {
    updateActiveProviderDisplay();
    // Eğer API sekmesindeysek maskeli anahtarı da güncelle
    const providerSelect = document.getElementById('api-provider');
    if (providerSelect && providerSelect.value) {
      chrome.runtime.sendMessage({
        type: 'GET_MASKED_API_KEY',
        data: { provider: providerSelect.value }
      }).then(resp => {
        const apiKeyInput = document.getElementById('api-key');
        if (resp.success && resp.maskedKey) {
          apiKeyInput.value = resp.maskedKey;
          apiKeyInput.placeholder = 'Kayıtlı anahtar: ' + resp.maskedKey;
        } else {
          apiKeyInput.value = '';
          apiKeyInput.placeholder = 'API Anahtarı';
        }
      }).catch(() => {});
    }
  }
});

// ============================================================================
// GEÇMİŞ FONKSİYONLARI
// ============================================================================

// Metin genişletme/daraltma
function toggleText(previewElement, fullText, button) {
  if (button.textContent === 'Tamamını Gör') {
    previewElement.textContent = fullText;
    previewElement.style.whiteSpace = 'pre-wrap';
    button.textContent = 'Küçült';
  } else {
    const maxLength = fullText.length > 1000 ? 200 : 100;
    const shortText = fullText.length > maxLength ? fullText.substring(0, maxLength) + '...' : fullText;
    previewElement.textContent = shortText;
    previewElement.style.whiteSpace = 'normal';
    button.textContent = 'Tamamını Gör';
  }
}

// Sonuç kopyala
function copyResult(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = '✓ Kopyalandı!';
    button.style.background = '#218838';
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 2000);
  });
}
