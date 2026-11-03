<script lang="ts">
  import { weeks } from "#lib/lawn.ts";
  import { message } from "#lib/message.ts";
</script>

<div class="w-full rounded-md border border-border">
  <div class="font-sans text-xs font-normal text-text">
    <div class="space-y-px p-4">
      <div class="overflow-x-auto">
        <div
          class="
          grid w-max grid-flow-col
          grid-cols-[auto_var(--week-columns)]
          grid-rows-[auto_repeat(7,10px)_auto]
          place-items-center gap-0.75
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
                title={day.date +
                  (day.level !== 0 ? ` / ${day.level}` : "") +
                  (day.size !== undefined ? `(${day.size})` : "")}
                data-level={day.level}
              ></a>
              <!-- eslint-enable svelte/no-navigation-without-resolve -->
            {/each}
            <div class="justify-self-start">{week.year}</div>
          {/each}
        </div>
      </div>
      <div class="font-sans text-xs leading-normal font-normal text-text-secondary">
        <div class="flex items-center justify-end gap-1 px-0">
          <div>{message.lawn.less}</div>
          <div class="size-2.5 rounded-xs bg-grass-0"></div>
          <div class="size-2.5 rounded-xs bg-grass-1"></div>
          <div class="size-2.5 rounded-xs bg-grass-2"></div>
          <div class="size-2.5 rounded-xs bg-grass-3"></div>
          <div class="size-2.5 rounded-xs bg-grass-4"></div>
          <div>{message.lawn.more}</div>
        </div>
      </div>
    </div>
  </div>
</div>
