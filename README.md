# 个人网站

这是一个零依赖的静态个人网站，可以写文章、放照片，也可以部署到 GitHub Pages、Netlify、Vercel 或任何静态托管服务。

## 本地预览

在这个文件夹里运行：

```bash
python3 -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

## 修改内容

主要内容都在 `site-data.json`：

- `name`：网站名字
- `email`：联系邮箱
- `hero`：首页大图和标题
- `about`：关于我
- `categories`：目录分类
- `articles`：文章
- `photos`：照片墙

新增文章时，在 `articles` 数组里复制一段对象并修改标题、日期、封面图和正文。

新增照片时，在 `photos` 数组里增加：

```js
{
  title: "照片标题",
  location: "地点或分类",
  src: "./photos/my-photo.jpg",
}
```

如果使用自己的照片，可以把图片放进 `uploads` 文件夹，然后把图片路径填到照片或文章封面里。

## 后台上传

网站发布后，可以打开：

```text
https://wangronghao297.github.io/admin/
```

后台可以编辑首页文字、关于我、文章和照片，也可以上传图片。第一次登录时需要用 GitHub 授权当前仓库。

文章和照片都有 `category` 字段，需要填写 `categories` 里的 `slug`，这样它们会出现在对应目录里。

## 让别人看到

最简单的方式是把这个文件夹上传到 GitHub，然后开启 GitHub Pages。也可以直接拖到 Netlify 或 Vercel 创建静态网站。
