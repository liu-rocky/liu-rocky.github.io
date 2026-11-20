# 部署主页

直接使用当前项目根目录作为网站目录，入口为 `index.html`。网站资源在 `css/`、`js/`、`images/`、`fonts/` 和 `papers/` 中，无需打包或生成其他发布目录。

这是静态网站，服务器直接提供这些文件即可，不需要 Node.js、npm 或后端服务。使用正常的 HTTP/HTTPS 地址访问；浏览器直接打开本地 `index.html`（`file://`）可能导致 YouTube 嵌入播放报错。

## 本地预览与后续更新

在本目录执行：

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

然后访问 `http://127.0.0.1:8000`。停止预览按 Ctrl+C。

后续直接编辑项目中的 `index.html`、`css/style.css` 或相关资源，将修改同步到服务器即可，没有额外构建步骤。

## 文件与备份

- `backups/homepage-before-publish-20261120-171550.tar.gz`：此次整理前的完整网站源码与原图备份。此前备份也保留在 `backups/` 中；如需恢复，先解压到另一个目录核对。
- `maintenance/`：图片来源、压缩记录及清理记录。
- `backups/` 和 `maintenance/` 已加入 `.gitignore`，仅用于本地维护，不随 Git 提交上传。本说明属于维护资料，网站运行不依赖它。

## 外部资源与上线检查

Delta 配图已使用你提供的本地图片。以下三张既有图片仍使用外链，需要访问对应站点；本次环境无法下载它们的原始文件：

- VeM 配图：`https://arxiv.org/html/2511.09585v4/figures/1_task_illustration.png`
- AnySkill 配图：`https://raw.githubusercontent.com/jiemingcui/anyskill/main/assets/teaser.png`
- Delta 公司 logo：`https://deltai.com/media/brand/delta-icon.png`

YouTube 演示和外部论文、项目页面也需要联网。已完成本地资源引用、图片解码、动画时长及脚本语法检查；当前环境无法启动浏览器或 HTTP 预览服务，因此上线后请打开主页，确认上述外链图片、YouTube 演示及图片弹窗正常显示。
