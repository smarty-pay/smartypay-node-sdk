const esbuild = require('esbuild');


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
  await esbuild.build({
    logLevel: 'info',
    entryPoints: ['src/cli.ts'],
    bundle: true,
    minify: true,
    sourcemap: 'external',
    platform: 'node',
    outfile: `dist/esbuild/smartypay-cli-${VERSION}.js`,
  });

}


build().catch(() => process.exit(1));

