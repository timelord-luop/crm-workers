// 放在项目根目录的 _worker.js
export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// 1. 静态资源直接返回（不修改）
		if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map|json)$/)) {
			return fetch(request);
		}

		// 2. 所有其他请求返回 index.html（SPA 支持）
		// 获取 index.html
		const response = await fetch(request);

		// 如果返回 404，说明是前端路由，返回 index.html
		if (response.status === 404) {
			// 重新请求 index.html
			const indexUrl = new URL(request.url);
			indexUrl.pathname = '/index.html';
			return fetch(indexUrl);
		}

		return response;
	}
}
