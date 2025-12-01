// 部署到 Cloudflare Pages 根目录的 _worker.js
export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url)

		// 1. 静态资源缓存策略
		if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
			const response = await fetch(request)

			// 克隆响应以添加缓存头
			const newResponse = new Response(response.body, response)

			// 设置缓存（Cloudflare 边缘缓存）
			newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
			newResponse.headers.set('CDN-Cache-Control', 'public, max-age=31536000')

			return newResponse
		}

		// 2. 路由请求返回 index.html
		const response = await fetch(request)
		if (response.status === 404) {
			// SPA 路由回退
			return new Response(response.body, {
				status: 200,
				headers: { 'Content-Type': 'text/html' }
			})
		}

		return response
	}
}
