# 新标签页

## 1. 替换新标签页
```json
"chrome_url_overrides": {
    "newtab": "newtab.html"
  }
```

## 2. 修改新标签页
```json
"content_scripts": [
    {
      "matches": ["chrome://newtab/*"],
      "css": ["newtab.css"],
      "js": ["newtab.js"]
    }
  ],
```