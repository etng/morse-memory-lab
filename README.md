# Morse Memory Lab

一个静态的摩斯密码记忆工具台，支持英文短句转码、整句播放、单字母试听、主题切换和中英文界面。

## 本地预览

直接打开 `index.html` 即可使用；如果浏览器限制本地视频播放，也可以在目录中启动任意静态文件服务器后访问。

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/`。

## GitHub Pages

仓库使用 GitHub Pages 从 `main` 分支根目录发布。

## 参考素材

`reference/morse-playground/` 保留了制作当前页面时参考过的原始素材目录，包括源视频、完整抽帧、O/Z 字母拆帧和 contact 图。当前页面实际引用的是 `reference/source.mp4` 与 `reference/video-contact.jpg`，这两个文件分别与 `reference/morse-playground/source.mp4` 和 `reference/morse-playground/contact.jpg` 内容一致。
