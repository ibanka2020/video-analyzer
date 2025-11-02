(function() {
  'use strict';

  chrome.storage.local.get("promptToInject", (data) => {
    if (!data || !data.promptToInject) {
      return; 
    }

    const info = data.promptToInject;
    
    // 检查URL是否匹配
    if (window.location.href.startsWith(info.targetUrl)) {
      
      let attempts = 0;
      const maxAttempts = 10; // 尝试10次（总共5秒）
      const interval = setInterval(() => {
        attempts++;
        let inputElement = null;
        
        try {
          // 1. 查找输入框
          inputElement = document.querySelector(info.selector);
        } catch (e) {
          console.error('AI 分析：输入框CSS选择器无效', info.selector, e);
          clearInterval(interval);
          chrome.storage.local.remove("promptToInject"); 
          return;
        }
        
        // 2. 找到输入框后...
        if (inputElement) {
          clearInterval(interval);
          console.log('AI 分析：找到输入框，正在注入提示词...');
          
          inputElement.value = info.prompt; 
          inputElement.focus(); 
          
          // 模拟输入事件，让网站框架 (React/Vue) 知道内容已更改
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));
          
          // 3. 【新逻辑】模拟 "Enter" 键发送
          console.log('AI 分析：等待 1 秒钟后模拟 "Enter" 键...');
          
          setTimeout(() => {
            try {
              console.log('AI 分析：正在模拟 "Enter" 键发送...');
              
              // 创建一个 "Enter" 键的 Keydown 事件
              const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
              });
              
              // 在输入框 (textarea) 上触发这个事件
              inputElement.dispatchEvent(enterEvent);

            } catch (e) {
              console.error('AI 分析：模拟 "Enter" 键失败', e);
            }
          }, 1000); // 延迟1秒，等待AI框架处理输入
          
          // 4. 清理存储
          chrome.storage.local.remove("promptToInject");

        } else if (attempts >= maxAttempts) {
          // 5. 超时
          clearInterval(interval);
          console.error('AI 分析：超时，找不到输入框，选择器：', info.selector);
          chrome.storage.local.remove("promptToInject");
        }
      }, 500); // 每500毫秒尝试一次
    }
  });
})();