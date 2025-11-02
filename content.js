(function() {
  'use strict';

  // 默认配置（作为备用）
  function getDefaultSiteList() {
    return [
      { id: 'douyin', name: '抖音', domain: 'douyin.com', titleSelectors: '#slideCoverInfoBox h1,[data-e2e="video-title"],.title' },
      { id: 'xigua', name: '西瓜视频', domain: 'ixigua.com', titleSelectors: '.videoTitle,.video-title,h1' },
      { id: 'bilibili', name: 'B站', domain: 'bilibili.com', titleSelectors: 'h1.video-title,.video-title,h1' }
    ];
  }

  function getDefaultAIList() {
    return [
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
  }

  function getDefaultPromptList() {
    return [
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
  }

  // 获取视频URL
  function getVideoUrl() {
    return window.location.href;
  }

  // 获取视频标题（使用传入的正确site配置）
  function getVideoTitle(site) {
    if (!site || !site.titleSelectors) return '';
    
    const selectors = site.titleSelectors.split(',');
    for (let selector of selectors) {
      const titleEl = document.querySelector(selector.trim());
      if (titleEl) {
        return titleEl.textContent.trim();
      }
    }
    return '';
  }

  // 创建分析按钮
  function createAnalyzeButton() {
    chrome.storage.sync.get(['siteList'], (data) => {
      const siteList = data.siteList || getDefaultSiteList();
      const currentSite = siteList.find(s => window.location.hostname.includes(s.domain));
      
      if (!currentSite) return;
      if (document.getElementById('video-analyze-btn')) return;

      const button = document.createElement('button');
      button.id = 'video-analyze-btn';
      button.innerHTML = '🤖 AI分析';
      button.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        z-index: 99999;
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
      `;
      button.onmouseover = () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
      };
      button.onmouseout = () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
      };
      button.onclick = () => {
        analyzeVideo(currentSite);
      };
      document.body.appendChild(button);
    });
  }

  // 分析视频
  function analyzeVideo(currentSite) {
    const videoUrl = getVideoUrl();
    const videoTitle = getVideoTitle(currentSite);
    
    chrome.storage.sync.get(['defaultAI', 'defaultPrompt', 'aiList', 'promptList'], (data) => {
      const aiList = data.aiList || getDefaultAIList();
      const promptList = data.promptList || getDefaultPromptList();
      const defaultAI = data.defaultAI || 'doubao';
      const defaultPrompt = data.defaultPrompt || 'analyze';
      
      const selectedAI = aiList.find(ai => ai.id === defaultAI);
      const selectedPrompt = promptList.find(p => p.id === defaultPrompt);
      
      if (!selectedAI || !selectedPrompt) {
        showNotification('配置错误，请检查设置');
        return;
      }

      const encodedVideoUrl = encodeURIComponent(videoUrl);

      let prompt = selectedPrompt.content
        .replace(/\{platform\}/g, currentSite.name)
        .replace(/\{url\}/g, encodedVideoUrl) 
        .replace(/\{title\}/g, videoTitle || '无标题');

      const injectionData = {
        targetUrl: selectedAI.url, 
        prompt: prompt,            
        selector: selectedAI.inputSelector || 'textarea', 
        sendSelector: selectedAI.sendButtonSelector || null 
      };

      chrome.storage.local.set({ "promptToInject": injectionData }, () => {
        console.log('AI 分析：提示词已存储，准备跳转...');
        
        window.open(selectedAI.url, '_blank');
        showNotification(`正在跳转到 ${selectedAI.name} 并自动填入...`);
      });
    });
  }

  // 显示通知
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      padding: 15px 25px;
      background: #10b981;
      color: white;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // 动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // 初始化
  function init() {
    createAnalyzeButton();
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(createAnalyzeButton, 1000);
      }
    }).observe(document.body, { subtree: true, childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();