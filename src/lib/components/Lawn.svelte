<script lang="ts">
  import { weeks } from "#lib/lawn.ts";
  import { message } from "#lib/message.ts";
</script>

<div class="w-full overflow-x-auto rounded-md border border-border">
  <div class="font-sans text-xs font-normal text-text">
    <div
      class="
      grid w-max grid-flow-col
      grid-cols-[auto_var(--week-columns)]
      grid-rows-[auto_repeat(7,10px)_auto]
      place-items-center gap-0.75 p-4
      "
      style:--week-columns={weeks
        .map((_, i) => (i === weeks.length - 1 ? "minmax(10px,max-content)" : "10px"))
        .join(" ")}
    >
      <div class="mr-0.5 justify-self-start"></div>
      <div class="mr-0.5 justify-self-start"></div>
      <div class="mr-0.5 justify-self-start">{message.lawn.monday}</div>
      <div class="mr-0.5 justify-self-start"></div>
      <div class="mr-0.5 justify-self-start">{message.lawn.wednesday}</div>
      <div class="mr-0.5 justify-self-start"></div>
      <div class="mr-0.5 justify-self-start">{message.lawn.friday}</div>
      <div class="mr-0.5 justify-self-start"></div>
      <div class="mr-0.5 justify-self-start"></div>

      {#each weeks as week (week.days[0]!.date)}
        <div class="justify-self-start">{week.month}</div>
        {#each week.days as day (day.date)}
          <!-- eslint-disable svelte/no-navigation-without-resolve -->
          <a
            class="
            block size-2.5 justify-self-start rounded-xs
            data-[level=0]:bg-grass-0
            data-[level=1]:bg-grass-1
            data-[level=2]:bg-grass-2
            data-[level=3]:bg-grass-3
            data-[level=4]:bg-grass-4
            "
            href={day.href}
            target="_blank"
            rel="noopener noreferrer"
            title={day.date}
            data-level={day.level}
          ></a>
          <!-- eslint-enable svelte/no-navigation-without-resolve -->
        {/each}
        <div class="justify-self-start">{week.year}</div>
      {/each}
    </div>
  </div>
</div>
