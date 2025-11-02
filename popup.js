// 默认配置
const defaultAIList = [
  { id: 'doubao', name: '豆包', url: 'https://www.doubao.com/chat/?content=' },
  { id: 'kimi', name: 'Kimi', url: 'https://kimi.moonshot.cn/?content=' },
  { id: 'tongyi', name: '通义千问', url: 'https://tongyi.aliyun.com/qianwen/chat/?prompt=' }
];

// 修复：更新为完整的5个提示词，与 options.js 同步
const defaultPromptList = [
  { 
    id: 'analyze', 
    name: '深度分析'
  },
  { 
    id: 'summary', 
    name: '快速总结'
  },
  {
    id: 'takeaways',
    name: '关键要点与受众'
  },
  {
    id: 'topics',
    name: '主题章节提取'
  },
  {
    id: 'sentiment',
    name: '情感与基调分析'
  }
];

const defaultSiteList = [
  { id: 'douyin', name: '抖音', domain: 'douyin.com' },
  { id: 'xigua', name: '西瓜视频', domain: 'ixigua.com' },
  { id: 'bilibili', name: 'B站', domain: 'bilibili.com' }
];

// 加载配置
chrome.storage.sync.get(['defaultAI', 'defaultPrompt', 'aiList', 'promptList', 'siteList'], (data) => {
  // 注意：这里我们使用 options.js/content.js 里的完整 promptList 来获取名称
  const aiList = data.aiList || defaultAIList;
  const promptList = data.promptList || defaultPromptList;
  const siteList = data.siteList || defaultSiteList;
  const defaultAI = data.defaultAI || 'doubao';
  const defaultPrompt = data.defaultPrompt || 'analyze';

  // 填充AI选择器
  const aiSelect = document.getElementById('aiSelect');
  aiList.forEach(ai => {
    const option = document.createElement('option');
    option.value = ai.id;
    option.textContent = ai.name;
    if (ai.id === defaultAI) option.selected = true;
    aiSelect.appendChild(option);
  });

  // 填充提示词选择器 (使用从存储中读取的、最新的列表)
  const promptSelect = document.getElementById('promptSelect');
  promptList.forEach(prompt => {
    const option = document.createElement('option');
    option.value = prompt.id;
    option.textContent = prompt.name; // 使用完整的 name
    if (prompt.id === defaultPrompt) option.selected = true;
    promptSelect.appendChild(option);
  });
});

// 分析按钮
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const aiId = document.getElementById('aiSelect').value;
  const promptId = document.getElementById('promptSelect').value;

  // 保存当前选择
  chrome.storage.sync.set({ defaultAI: aiId, defaultPrompt: promptId });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 检查是否在支持的网站
  chrome.storage.sync.get(['siteList'], (data) => {
    const siteList = data.siteList || defaultSiteList;
    const isSupported = siteList.some(site => tab.url.includes(site.domain));
    
    if (!isSupported) {
      alert('当前网站不支持分析。\n\n支持的网站：' + siteList.map(s => s.name).join('、'));
      return;
    }

    // 这里不再需要发送消息，因为 content.js 会自己从存储中读取 defaultAI 和 defaultPrompt
    // 我们只需要触发 content.js 中的按钮点击事件即可
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: triggerAnalysis
    });

    window.close();
  });
});

// 设置按钮
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// 这个函数在B站页面执行，它会点击我们注入的 "AI分析" 按钮
function triggerAnalysis() {
  const btn = document.getElementById('video-analyze-btn');
  if (btn) btn.click();
}