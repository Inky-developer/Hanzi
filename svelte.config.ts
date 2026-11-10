import adapter from '@sveltejs/adapter-static';
import { type Config } from '@sveltejs/kit';

const config: Config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		paths: {
			base: process.argv.includes('dev') ? '' : (process.env.BASE_PATH as `/${string}`)
		},
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			// Building for github pages, which uses 404 for unknown urls
			// Svelte then handles these
			fallback: '404.html',
			precompress: true,
			strict: true
		})
	}
};

export default config;
