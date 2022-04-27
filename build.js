const esbuild = require('esbuild');
const fs = require('fs');

const VERSION = '1.0';

async function build(){

  // lib
  await esbuild.build({
    logLevel: 'info',
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: 'external',
    platform: 'node',
    outfile: `dist/esbuild/smartypay-node-sdk-${VERSION}.js`,
  });


  // cli
  const cliDest = `dist/esbuild/smartypay-cli-${VERSION}.js`;
  await esbuild.build({
    logLevel: 'info',
    entryPoints: ['src/cli.ts'],
    bundle: true,
    minify: true,
    sourcemap: 'external',
    platform: 'node',
    outfile: cliDest,
  });

  fs.copyFileSync(cliDest, 'dist/esbuild/smartypay-cli.js');

}


build().catch(() => process.exit(1));

