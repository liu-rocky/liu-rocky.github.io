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

页面配图和学校、公司 logo 均使用项目内的本地文件，不再依赖外部图片地址。AnySkill、VeM 的图片已从原始来源下载，弹窗使用原尺寸的无损 WebP，列表使用较小的缩略图：

- VeM 配图：`images/papers/vem.webp`；缩略图：`images/thumbs/vem.webp`。
- AnySkill 配图：`images/papers/anyskill.webp`；缩略图：`images/thumbs/anyskill.webp`。
- Delta 公司 logo：`images/logos/delta.png`。

部署时请同步这些图片文件以及 `index.html`。YouTube 演示和外部论文、项目页面仍需要联网。
