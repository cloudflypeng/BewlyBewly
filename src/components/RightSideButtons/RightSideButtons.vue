<script setup lang="ts">
import type { Ref } from 'vue'
import type { HoveringDockItem } from './types'
import { settings } from '~/logic'

const emit = defineEmits(['settings-visibility-change'])

const mainAppRef = inject('mainAppRef') as Ref<HTMLDivElement>

const hoveringDockItem = reactive<HoveringDockItem>({
  themeMode: false,
  settings: false,
})

const currentAppColorScheme = computed((): 'dark' | 'light' => {
  if (settings.value.theme !== 'auto')
    return settings.value.theme
  else
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
})

function toggleDark(e: MouseEvent) {
  const isAppearanceTransition = typeof document !== 'undefined'
  // @ts-expect-error: Transition API
    && document.startViewTransition
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!isAppearanceTransition) {
    if (currentAppColorScheme.value === 'light')
      settings.value.theme = 'dark'
    else
      settings.value.theme = 'light'
  }
  else {
    const x = e.clientX
    const y = e.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )
    // https://github.com/vueuse/vueuse/pull/3129
    const style = document.createElement('style')
    const styleString = `
    *, *::before, *::after
    {-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
    style.appendChild(document.createTextNode(styleString))
    document.head.appendChild(style)

    // Since normal dom style cannot be applied in shadow dom style
    // We need to add this style again to the shadow dom
    const shadowDomStyle = document.createElement('style')
    const shadowDomStyleString = `
    *, *::before, *::after
    {-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
    shadowDomStyle.appendChild(document.createTextNode(shadowDomStyleString))
    mainAppRef.value.appendChild(shadowDomStyle)

    // @ts-expect-error: Transition API
    const transition = document.startViewTransition(async () => {
      if (currentAppColorScheme.value === 'light')
        settings.value.theme = 'dark'
      else
        settings.value.theme = 'light'
      await nextTick()
    })

    transition.ready.then(() => {
      const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      const animation = document.documentElement.animate(
        {
          clipPath: currentAppColorScheme.value === 'dark'
            ? [...clipPath].reverse()
            : clipPath,
        },
        {
          duration: 300,
          easing: 'ease-in-out',
          pseudoElement: currentAppColorScheme.value === 'dark'
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
      animation.addEventListener('finish', () => {
        document.head.removeChild(style!)
        mainAppRef.value.removeChild(shadowDomStyle!)
      }, { once: true })
    })
  }
}
</script>

<template>
  <div
    pos="fixed top-0 right-6px" h-full flex items-center z-10
    pointer-events-none
  >
    <div flex="~ gap-2 col" pointer-events-auto>
      <Tooltip :content="currentAppColorScheme === 'dark' ? $t('dock.dark_mode') : $t('dock.light_mode')" placement="left">
        <Button
          class="ctrl-btn" center size="small" round backdrop-glass
          @click="toggleDark"
          @mouseenter="hoveringDockItem.themeMode = true"
          @mouseleave="hoveringDockItem.themeMode = false"
        >
          <Transition name="fade">
            <div v-show="hoveringDockItem.themeMode" absolute>
              <line-md:sunny-outline-to-moon-loop-transition v-if="currentAppColorScheme === 'dark'" />
              <line-md:moon-alt-to-sunny-outline-loop-transition v-else />
            </div>
          </Transition>
          <Transition name="fade">
            <div v-show="!hoveringDockItem.themeMode" absolute>
              <line-md:sunny-outline-to-moon-transition v-if="currentAppColorScheme === 'dark'" />
              <line-md:moon-to-sunny-outline-transition v-else />
            </div>
          </Transition>
        </Button>
      </Tooltip>
      <Tooltip :content="$t('dock.settings')" placement="left">
        <Button
          class="ctrl-btn" center size="small" round backdrop-glass
          @click="emit('settings-visibility-change')"
        >
          <mingcute:settings-3-line />
        </Button>
      </Tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ctrl-btn {
  --b-button-width: 40px;
  --b-button-height: 40px;
  --b-button-border-width: 1px;
  --b-button-color: var(--bew-elevated-1);
  --b-button-color-hover: var(--bew-elevated-1-hover);
  --b-button-shadow: var(--bew-shadow-1);
  --b-button-shadow-hover: var(--bew-shadow-2);
  --b-button-shadow-active: var(--bew-shadow-1);

  svg {
    --at-apply: w-20px h-20px shrink-0;
  }
}
</style>
