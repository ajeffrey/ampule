<script>
  import { FFT } from 'tone';

  const fft = new FFT({ size: 64, smoothing: 0.1, normalRange: true });

  let values = fft.getValue();
  
  export const ports = [
    { dir: 'input', name: 'output', type: 'audio', sink: fft }
  ];

  setInterval(() => {
    values = fft.getValue();
  }, 250);

</script>
<div class="columns">
  {#each values as val}
  <div class="column" style={`height: ${val * 100}%`} />
  {/each}
</div>
<style>
  .columns {
    width: 100%;
    display: flex;
    flex-direction: row;
    background: white;
    height: 100px;
  }
  .column {
    flex-grow: 1;
    background: black;
    margin: 0 1px;
  }
</style>