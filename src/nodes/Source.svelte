<script>
  import { UserMedia } from 'tone';
  const source = new UserMedia();
  let open = false;

  const output = { dir: 'output', name: 'audio', type: 'audio', source };
  export const ports = [output];

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();

    if(open) {
      source.close();
      open = false;

    } else {
      source.open();
      open = true;
    }
  }
</script>
{#if open}
<button on:click={toggle}>stop</button>
{:else}
<button on:click={toggle}>play</button>
{/if}