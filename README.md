# 原神导出抽卡记录 JS 版

通过游戏唤起浏览器获取`authkey`的方式已失效：原神把祈愿的 authkey 和其它 authkey 分开了，现在游戏唤起浏览器 URL 里的 authkey 已经不能用于获取祈愿记录了  

## 一、保存浏览器书签

1. 书签标题: 原神抽卡导出。  
2. 书签内容:
```
javascript:(function(){const s=document.createElement("script");s.src='https://genshin.lhjmmc.cn/export.min.js?v=1';document.body.append(s)})();
```

## 二、使用方法

1. 首先把上面的内容保存为浏览器书签
2. 通过抓包工具获取到抽卡记录的 URL，如：`https://hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog?authkey_key=xxx`
3. 复制该 URL 在浏览器打开
4. 在打开的页面上打开书签（PC可以 F12 打开控制台，把代码粘贴到控制台回车运行）


PS: 若无法导出，请尝试更换浏览器，实在不行建议用 PC 上的 Chrome 浏览器打开，或者试试 [NodeJS 版](https://github.com/hjmmc/genshin-gacha-export-nodejs/releases)
