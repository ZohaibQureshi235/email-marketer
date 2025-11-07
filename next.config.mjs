/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true
	},

	// Disable type checking during build
	typescript: {
		ignoreBuildErrors: true
	},

	// Disable ESLint during build
	eslint: {
		ignoreDuringBuilds: true
	},

	// Disable static optimization for pages that use hooks
	// This can help with client-side only code
	trailingSlash: true,

	// Ensure the build completes even with warnings
	onDemandEntries: {
		// period (in ms) where the server will keep pages in the buffer
		maxInactiveAge: 25 * 1000,
		// number of pages that should be kept simultaneously without being disposed
		pagesBufferLength: 2
	}
}

export default nextConfig
