import * as esbuild from 'esbuild'
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from 'svelte-preprocess';

const config = {
  entryPoints: [
    { in: 'src/index.js', out: 'app' },
  ],
  bundle: true,
  outdir: 'public/build',
  plugins: [sveltePlugin({
    compilerOptions: {
      css: true
    },
    preprocess: sveltePreprocess(),
  })],
};

if(process.argv.includes('--watch')) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  const { host, port } = await ctx.serve({
    servedir: 'public',
  })
  console.log(`Serving on ${host}:${port}`);

} else {
  await esbuild.build(config);
}
