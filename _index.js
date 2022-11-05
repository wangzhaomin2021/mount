export default async function mount(prefix, app) {
		if (typeof prefix !== 'string') {
			app = prefix
			prefix = '/'
		}

		const downstream = app.middleware ? compose(app.middleware) : app
		
		if (prefix === '/') return downstream
		
		return async function(ctx, upstream) {
			const prev = ctx.path
			const tailGan = prefix.slice(-1) === '/'
			const newPath = math(prev)
			// match
			if (newPath) {
				ctx.mountPath = prefix
				ctx.path = newPath
				// 执行挂载中间件
				await downstream(ctx, async () => {
					ctx.path = prev
					await upstream()
					ctx.path = newPath
				})
				ctx.path = prev
			} else { // not match
				return await upstream()
			}
		}
		
		function match(path) {
			if (!path.startsWith(path)) return false
			
			const newPath = path.replace(prefix, '') || '/'
			if (tailGan) return newPath
			if (newPath[0] !== '/') return false
			return newPath
		}
		
}
