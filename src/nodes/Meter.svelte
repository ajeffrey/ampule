<script>
  import { Meter } from 'tone';

  const meter = new Meter({ smoothing: 0.1, normalRange: true });
  let values = [];
  let highestSeen = 0;
  
  export const ports = [
    { dir: 'input', name: 'output', type: 'audio', sink: meter }
  ];

  setInterval(() => {
    const value = meter.getValue();
    highestSeen = value > highestSeen ? value : highestSeen;
    values.push(value);
    values = values.slice(-50);
  }, 250);

</script>
<div class="columns">
  <div class="highest">{highestSeen.toFixed(3)}</div>
    {#each values as value}
      <div class="column" style={`height: ${value * 100}%`} />
    {/each}
</div>
<style>
  .columns {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    background: white;
    height: 100px;
    position: relative;
  }
  .highest {
    position: absolute;
    left: 2px;
    top: 2px;
    color: black;
    font-size: 12px;
  }
  .column {
    flex-grow: 1;
    background: black;
    margin: 0 1px;
  }
</style>