const esbuild = require('esbuild');
const { dtsPlugin } = require('esbuild-plugin-d.ts');

const libDest = 'dist/esbuild/smartypay-node-sdk.js';
const cliDest = 'dist/esbuild/smartypay-cli.js';

async function build() {
  // lib
  await esbuild.build({
    logLevel: 'info',
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: 'external',
    platform: 'node',
    outfile: libDest,
    plugins: [dtsPlugin()],
  });

  // cli
  await esbuild.build({
    logLevel: 'info',
    entryPoints: ['src/cli.ts'],
    bundle: true,
    minify: true,
    sourcemap: 'external',
    platform: 'node',
    outfile: cliDest,
  });
}

build().catch((e) => {
  console.error('build error', e);
  process.exit(1);
});
