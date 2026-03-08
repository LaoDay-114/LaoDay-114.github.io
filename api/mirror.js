// api/mirror.js
export default async function handler(req, res) {
  const targetUrl = req.query.url || 'https://www.example.com';

  try {
    // 服务器端发起请求 (类似 PHP 的 file_get_contents)
    const response = await fetch(targetUrl, {
      headers: {
        // 伪装成浏览器，防止被某些简单的反爬虫拦截
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: '无法获取目标网站内容' });
    }

    const html = await response.text();

    // 【关键步骤】简单处理 HTML，修复相对路径资源 (CSS/JS/图片)
    // 否则镜像站的图片会加载失败，因为它们指向的是原网站的相对路径
    const baseUrl = new URL(targetUrl).origin;
    let processedHtml = html.replace(/(href|src)=["']\/([^"'])/g, `$1="${baseUrl}/$2`);
    
    // 设置响应头，告诉浏览器这是 HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(processedHtml);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
