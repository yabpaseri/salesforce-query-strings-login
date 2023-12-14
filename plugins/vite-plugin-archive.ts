import archiver from 'archiver';
import { createWriteStream, mkdirSync, statSync } from 'fs';
import path from 'path';
import { Plugin, ResolvedConfig, normalizePath } from 'vite';
import { constants as z_constants } from 'zlib';
import { name, version } from '../package.json';

/**
 * archiverを使用して、生成物をzip化する。 \
 * ただし、modeがproductionの時のみ。
 */
const archive = (): Plugin => {
	let config: ResolvedConfig;
	return {
		name: 'archive',
		apply(_, { mode }) {
			// production build 限定
			return mode === 'production';
		},
		configResolved(c) {
			config = c;
		},
		async closeBundle() {
			const resource = normalizePath(config.build.outDir);
			const filename = `${name}_${version}.zip`;
			const outdir = path.resolve(resource, '..', 'archive');
			const outpath = path.resolve(outdir, filename);

			if (!statSync(outdir, { throwIfNoEntry: false })?.isDirectory()) {
				mkdirSync(outdir);
			}

			const archive = archiver.create('zip', { zlib: { level: z_constants.Z_BEST_COMPRESSION } });
			const output = archive.pipe(createWriteStream(outpath));
			output.on('close', () => {
				console.log(`[vite-plugin-archive] created ${outpath} (size: ${archive.pointer()}bytes)`);
			});
			output.on('error', () => {
				throw output.errored;
			});
			await archive.directory(resource, false).finalize();
		},
	};
};
export default archive;
