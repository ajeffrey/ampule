<script>
  import { Distortion } from 'tone';

  let level = 0.8;
  const effect = new Distortion(0.8);
  
  export const ports = [
    { dir: 'input', name: 'input', type: 'audio', sink: effect },
    { dir: 'output', name: 'output', type: 'audio', source: effect },
  ];

  $: {
    if(level >= 0 && level <= 1) {
      effect.distortion = level;
    }
  }
</script>
<div class="options">
  <input
    type="number"
    class="distortion"
    inputmode="decimal"
    min={0}
    max={1}
    bind:value={level}
  />
</div>

<style lang="scss">
  .options {
    display: flex;
    flex-direction: row;
  }
  .distortion {
    border: none;
    border-radius: 0;
    border-right: none;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
    height: 26px;
    line-height: 24px;
    flex-grow: 1;
    padding: 0;
    min-width: 0px;
    text-indent: 5px;
  }
</style>
