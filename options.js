//
// 默认配置
// -----------------------------------------------------------------------------

const defaultAIList = [
  // 更新：Kimi 和 通义 已按你的要求恢复
  { 
    id: 'doubao', 
    name: '豆包', 
    url: 'https://www.doubao.com/chat/', 
    inputSelector: 'textarea[placeholder*="输入"]', 
    sendButtonSelector: 'button[data-e2e="send-button"]' 
  },
  { 
    id: 'kimi', 
    name: 'Kimi', 
    url: 'https://www.kimi.com/', // 你的 URL
    inputSelector: '#app > div > div > div.main > div > div > div.layout-content-main > div > div.chat-editor > div.chat-input > div > div.chat-input-editor', // 你的选择器 (已修正)
    sendButtonSelector: 'button[data-e2e="send-button"]'
  },
  { 
    id: 'tongyi', 
    name: '通义千问', 
    url: 'https://www.tongyi.com/', // 你的 URL
    inputSelector: '#tongyi-content-wrapper > div > div.sc-bAehkN.hiJtDh.pageContentWrap--SGDbV8At > div > div.guideComp--ZHUICfas > div > div.tongyiDI-view-container.text-area-slot-container > div > div > div.chatInput--ir6GwLFI > div > div > textarea', // 你的选择器
    sendButtonSelector: 'button[class*="chat-sender-button"]' 
  }
];

const defaultPromptList = [
  { 
    id: 'analyze', 
    name: '深度分析', 
    content: `请深度分析这个{platform}视频：\n\n视频链接：{url}\n视频标题：{title}\n\n请帮我：\n1. 总结视频的主要内容和核心观点\n2. 提炼关键信息和亮点\n3. 分析视频的价值和适用场景\n4. 如果是教程类视频，请整理步骤要点\n\n请用简洁清晰的方式呈现。` 
  },
  { 
    id: 'summary', 
    name: '快速总结', 
    content: `请快速总结这个{platform}视频的核心内容：\n\n视频链接：{url}\n视频标题：{title}\n\n请用3-5句话概括视频的主要内容和关键信息。` 
  },
  {
    id: 'takeaways',
    name: '关键要点与受众',
    content: `请分析这个{platform}视频 ({title})：\n\n视频链接：{url}\n\n1. 视频的核心目标受众是谁？\n2. 观众看完后应该记住的3个最关键的要点(Key Takeaways)是什么？\n3. 视频中是否包含任何号召性用语 (Call to Action)？`
  },
  {
    id: 'topics',
    name: '主题章节提取',
    content: `请将这个{platform}视频 ({title}) 的内容分解为几个主要的主题或部分：\n\n视频链接：{url}\n\n- 主题1：[简要说明]\n- 主题2：[简要说明]\n- 主题3：[简要说明]\n（以此类推）`
  },
  {
    id: 'sentiment',
    name: '情感与基调分析',
    content: `请分析这个{platform}视频 ({title}) 的情感和基调：\n\n视频链接：{url}\n\n1. 视频的整体情绪是正面的、负面的还是中立的？\n2. 创作者的语气是怎样的（例如：幽默、严肃、教学、批判）？\n3. 视频传达的核心观点是什么？`
  }
];

const defaultSiteList = [
  { id: 'bilibili', name: 'B站', domain: 'bilibili.com', titleSelectors: 'h1.video-title,.video-title,h1' },
  { id: 'douyin', name: '抖音', domain: 'douyin.com', titleSelectors: '#slideCoverInfoBox h1,[data-e2e="video-title"],.title' },
  { id: 'xigua', name: '西瓜视频', domain: 'ixigua.com', titleSelectors: '.videoTitle,.video-title,h1' }
];

//
// 全局状态
// -----------------------------------------------------------------------------
let currentAIList = [];
let currentPromptList = [];
let currentSiteList = [];
let selectedAIIndex = 0;
let selectedPromptIndex = 0;
let selectedSiteIndex = 0;

//
// 初始化
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupTabListeners();
  setupAddButtonListeners();
});

function loadSettings() {
  chrome.storage.sync.get(['aiList', 'promptList', 'siteList'], (data) => {
    currentAIList = data.aiList || defaultAIList;
    currentPromptList = data.promptList || defaultPromptList;
    currentSiteList = data.siteList || defaultSiteList;
    
    // 默认选中第一个
    selectedAIIndex = 0;
    selectedPromptIndex = 0;
    selectedSiteIndex = 0;

    // 渲染所有UI
    renderAll();
  });
}

function renderAll() {
  renderAIListSidebar();
  renderPromptListSidebar();
  renderSiteListSidebar();
  
  showAIDetails(selectedAIIndex);
  showPromptDetails(selectedPromptIndex);
  showSiteDetails(selectedSiteIndex);
}

function setupTabListeners() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`tab-${tabName}`).classList.add('active');
    });
  });
}

function setupAddButtonListeners() {
  document.getElementById('addAIBtn').addEventListener('click', addAI);
  document.getElementById('addPromptBtn').addEventListener('click', addPrompt);
  document.getElementById('addSiteBtn').addEventListener('click', addSite);
}

//
// AI 平台管理
// -----------------------------------------------------------------------------

function renderAIListSidebar() {
  const sidebar = document.getElementById('ai-list-sidebar');
  sidebar.innerHTML = '';
  if (currentAIList.length === 0) return;
  
  currentAIList.forEach((ai, index) => {
    const item = document.createElement('li');
    item.className = 'sidebar-list-item';
    item.textContent = ai.name;
    if (index === selectedAIIndex) {
      item.classList.add('selected');
    }
    item.addEventListener('click', () => {
      selectedAIIndex = index;
      renderAIListSidebar(); // 重绘以更新 'selected' 状态
      showAIDetails(index);
    });
    sidebar.appendChild(item);
  });
}

function showAIDetails(index) {
  const container = document.getElementById('ai-form-container');
  if (currentAIList.length === 0) {
    container.innerHTML = `<div class="form-placeholder">请点击 "添加新AI" 来创建第一个配置</div>`;
    return;
  }
  
  const ai = currentAIList[index];
  container.innerHTML = `
    <div class="hint">
      <strong>💡 提示：</strong> 自动填充功能依赖CSS选择器。如果AI网站更新导致失效，请使用浏览器 "检查" (F12) 功能找到新的选择器并在此更新。
    </div>
    <div class="form-group">
      <label for="ai-name">AI名称</label>
      <input type="text" id="ai-name" value="${ai.name}">
    </div>
    <div class="form-group">
      <label for="ai-url">对话URL</label>
      <input type="text" id="ai-url" value="${ai.url}">
    </div>
    <div class="form-group">
      <label for="ai-input-selector">输入框CSS选择器</label>
      <input type="text" id="ai-input-selector" value="${ai.inputSelector || ''}">
    </div>
    <div class="form-group">
      <label for="ai-send-selector">发送按钮CSS选择器 (可选, Enter键优先)</label>
      <input type="text" id="ai-send-selector" value="${ai.sendButtonSelector || ''}">
    </div>
    <div class="form-actions">
      <button class="btn btn-delete" id="deleteAIBtn">删除</button>
      <button class="btn btn-save" id="saveAIBtn">保存此AI</button>
    </div>
  `;
  
  document.getElementById('saveAIBtn').addEventListener('click', saveAI);
  document.getElementById('deleteAIBtn').addEventListener('click', deleteAI);
}

function addAI() {
  const newAI = {
    id: 'custom_' + Date.now(),
    name: '新AI平台',
    url: 'https://example.com/chat/',
    inputSelector: 'textarea',
    sendButtonSelector: 'button[type="submit"]'
  };
  currentAIList.push(newAI);
  selectedAIIndex = currentAIList.length - 1; // 选中新添加的
  renderAIListSidebar();
  showAIDetails(selectedAIIndex);
}

function saveAI() {
  const ai = currentAIList[selectedAIIndex];
  ai.name = document.getElementById('ai-name').value;
  ai.url = document.getElementById('ai-url').value;
  ai.inputSelector = document.getElementById('ai-input-selector').value;
  ai.sendButtonSelector = document.getElementById('ai-send-selector').value;
  
  chrome.storage.sync.set({ aiList: currentAIList }, () => {
    showSuccessMessage();
    renderAIListSidebar(); // 更新侧边栏名称
  });
}

function deleteAI() {
  if (currentAIList.length === 0) return;
  if (confirm(`确定要删除 "${currentAIList[selectedAIIndex].name}" 吗？`)) {
    currentAIList.splice(selectedAIIndex, 1);
    selectedAIIndex = 0; // 重置到第一个
    chrome.storage.sync.set({ aiList: currentAIList }, () => {
      showSuccessMessage("删除成功");
      renderAIListSidebar();
      showAIDetails(selectedAIIndex);
    });
  }
}

//
// 提示词管理 (逻辑同上)
// -----------------------------------------------------------------------------

function renderPromptListSidebar() {
  const sidebar = document.getElementById('prompt-list-sidebar');
  sidebar.innerHTML = '';
  if (currentPromptList.length === 0) return;

  currentPromptList.forEach((prompt, index) => {
    const item = document.createElement('li');
    item.className = 'sidebar-list-item';
    item.textContent = prompt.name;
    if (index === selectedPromptIndex) {
      item.classList.add('selected');
    }
    item.addEventListener('click', () => {
      selectedPromptIndex = index;
      renderPromptListSidebar();
      showPromptDetails(index);
    });
    sidebar.appendChild(item);
  });
}

function showPromptDetails(index) {
  const container = document.getElementById('prompt-form-container');
  if (currentPromptList.length === 0) {
    container.innerHTML = `<div class="form-placeholder">请点击 "添加新提示词"</div>`;
    return;
  }
  
  const prompt = currentPromptList[index];
  container.innerHTML = `
    <div class="hint">
      <strong>💡 可用变量：</strong> <code>{platform}</code> <code>{url}</code> <code>{title}</code>
    </div>
    <div class="form-group">
      <label for="prompt-name">提示词名称</label>
      <input type="text" id="prompt-name" value="${prompt.name}">
    </div>
    <div class="form-group">
      <label for="prompt-content">提示词内容</label>
      <textarea id="prompt-content">${prompt.content}</textarea>
    </div>
    <div class="form-actions">
      <button class="btn btn-delete" id="deletePromptBtn">删除</button>
      <button class="btn btn-save" id="savePromptBtn">保存此提示词</button>
    </div>
  `;
  
  document.getElementById('savePromptBtn').addEventListener('click', savePrompt);
  document.getElementById('deletePromptBtn').addEventListener('click', deletePrompt);
}

function addPrompt() {
  const newPrompt = {
    id: 'custom_' + Date.now(),
    name: '新提示词',
    content: '请分析这个{platform}视频：\n\n视频链接：{url}\n视频标题：{title}\n\n'
  };
  currentPromptList.push(newPrompt);
  selectedPromptIndex = currentPromptList.length - 1;
  renderPromptListSidebar();
  showPromptDetails(selectedPromptIndex);
}

function savePrompt() {
  const prompt = currentPromptList[selectedPromptIndex];
  prompt.name = document.getElementById('prompt-name').value;
  prompt.content = document.getElementById('prompt-content').value;
  
  chrome.storage.sync.set({ promptList: currentPromptList }, () => {
    showSuccessMessage();
    renderPromptListSidebar();
  });
}

function deletePrompt() {
  if (currentPromptList.length === 0) return;
  if (confirm(`确定要删除 "${currentPromptList[selectedPromptIndex].name}" 吗？`)) {
    currentPromptList.splice(selectedPromptIndex, 1);
    selectedPromptIndex = 0;
    chrome.storage.sync.set({ promptList: currentPromptList }, () => {
      showSuccessMessage("删除成功");
      renderPromptListSidebar();
      showPromptDetails(selectedPromptIndex);
    });
  }
}

//
// 网站管理 (逻辑同上)
// -----------------------------------------------------------------------------

function renderSiteListSidebar() {
  const sidebar = document.getElementById('site-list-sidebar');
  sidebar.innerHTML = '';
  if (currentSiteList.length === 0) return;

  currentSiteList.forEach((site, index) => {
    const item = document.createElement('li');
    item.className = 'sidebar-list-item';
    item.textContent = site.name;
    if (index === selectedSiteIndex) {
      item.classList.add('selected');
    }
    item.addEventListener('click', () => {
      selectedSiteIndex = index;
      renderSiteListSidebar();
      showSiteDetails(index);
    });
    sidebar.appendChild(item);
  });
}

function showSiteDetails(index) {
  const container = document.getElementById('site-form-container');
  if (currentSiteList.length === 0) {
    container.innerHTML = `<div class="form-placeholder">请点击 "添加新网站"</div>`;
    return;
  }
  
  const site = currentSiteList[index];
  container.innerHTML = `
    <div class="hint">
      <strong>💡 提示：</strong> 用于从视频网站抓取标题。同样需要使用CSS选择器。
    </div>
    <div class="form-group">
      <label for="site-name">网站名称 (例如: B站)</label>
      <input type="text" id="site-name" value="${site.name}">
    </div>
    <div class="form-group">
      <label for="site-domain">匹配域名 (例如: bilibili.com)</label>
      <input type="text" id="site-domain" value="${site.domain}">
    </div>
    <div class="form-group">
      <label for="site-selectors">标题CSS选择器 (多个用逗号 , 分隔)</label>
      <input type="text" id="site-selectors" value="${site.titleSelectors}">
    </div>
    <div class="form-actions">
      <button class="btn btn-delete" id="deleteSiteBtn">删除</button>
      <button class="btn btn-save" id="saveSiteBtn">保存此网站</button>
    </div>
  `;
  
  document.getElementById('saveSiteBtn').addEventListener('click', saveSite);
  document.getElementById('deleteSiteBtn').addEventListener('click', deleteSite);
}

function addSite() {
  const newSite = {
    id: 'custom_' + Date.now(),
    name: '新网站',
    domain: 'example.com',
    titleSelectors: 'h1,.title'
  };
  currentSiteList.push(newSite);
  selectedSiteIndex = currentSiteList.length - 1;
  renderSiteListSidebar();
  showSiteDetails(selectedSiteIndex);
}

function saveSite() {
  const site = currentSiteList[selectedSiteIndex];
  site.name = document.getElementById('site-name').value;
  site.domain = document.getElementById('site-domain').value;
  site.titleSelectors = document.getElementById('site-selectors').value;
  
  chrome.storage.sync.set({ siteList: currentSiteList }, () => {
    showSuccessMessage();
    renderSiteListSidebar();
  });
}

function deleteSite() {
  if (currentSiteList.length === 0) return;
  if (confirm(`确定要删除 "${currentSiteList[selectedSiteIndex].name}" 吗？`)) {
    currentSiteList.splice(selectedSiteIndex, 1);
    selectedSiteIndex = 0;
    chrome.storage.sync.set({ siteList: currentSiteList }, () => {
      showSuccessMessage("删除成功");
      renderSiteListSidebar();
      showSiteDetails(selectedSiteIndex);
    });
  }
}

//
// 通用工具
// -----------------------------------------------------------------------------

function showSuccessMessage(message = "✓ 保存成功！") {
  const el = document.getElementById('successMessage');
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => {
    el.style.display = 'none';
  }, 2000);
}