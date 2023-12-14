import { crx, defineManifest } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { author, description, version as version_name } from './package.json';
import archive from './plugins/vite-plugin-archive';

const version = version_name.replace(/[^\d.-]+/g, '').replace('-', '.');
const manifest = defineManifest(({ mode }) => ({
	manifest_version: 3,
	name: 'Web Extension Base',
	author,
	description,
	version,
	version_name: `${version_name}${mode !== 'production' ? ` (${mode})` : ''}`,
	icons: {
		'16': 'icons/icon16.png',
		'32': 'icons/icon32.png',
		'48': 'icons/icon48.png',
		'128': 'icons/icon128.png',
	},
	action: { default_popup: 'index.html' },
}));

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), crx({ manifest }), archive()],
	build: {
		minify: false, // chromeの審査に通りやすく
		rollupOptions: {
			// assetsフォルダ配下の生成物のファイル名からハッシュ値を削除する
			output: {
				entryFileNames: `assets/[name].js`,
				chunkFileNames: `assets/[name].js`,
				assetFileNames: `assets/[name].[ext]`,
			},
		},
	},
});
