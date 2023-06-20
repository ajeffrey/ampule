<script>
  import { Delay } from 'tone';

  let delay = 0.8;
  const effect = new Delay(0.25);
  
  export const ports = [
    { dir: 'input', name: 'input', type: 'audio', sink: effect },
    { dir: 'output', name: 'output', type: 'audio', source: effect },
  ];

  $: {
    if(delay >= 0) {
      effect.delay = delay;
    }
  }
</script>
<div class="options">
  <input
    type="number"
    class="delay"
    inputmode="decimal"
    min={0}
    bind:value={delay}
  />
</div>

<style lang="scss">
  .options {
    display: flex;
    flex-direction: row;
  }
  .delay {
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
