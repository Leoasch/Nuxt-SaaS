<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'
import { logout } from '~/api/auth'
import { THEME_PRESETS } from '~/utils/themeColors'

const open = ref(false)
const colorMode = useColorMode()
const { isPresetActive, applyPreset } = useTheme()
const { clear } = useUserSession()
const { user: sessionUser } = useUserSession()
const user = ref({
  name: sessionUser.value?.name,
})

const route = useRoute()

const isSettingsRoute = computed(() => route.name === 'settings')

const accountItems = computed<DropdownMenuItem[]>(() => [
  {
    label: $t('profile'),
    icon: 'i-lucide-user',
    to: `/user/${sessionUser.value?.id}`
  },
  {
    label: $t('settings'),
    icon: 'i-lucide-settings',
    onSelect: () => navigateTo('/settings'),
    class: 'cursor-pointer',
    active: isSettingsRoute.value
  }
])

const themeGroup = computed<DropdownMenuItem[]>(() => [
  {
    label: $t('theme'),
    icon: 'i-lucide-sun-moon',
    children: [
      THEME_PRESETS.map(preset => ({
        label: $t(preset.label),
        type: 'checkbox' as const,
        checked: isPresetActive(preset.colors),
        onUpdateChecked (checked: boolean) {
          if (checked) {
            applyPreset(preset.colors)
          }
        },
        onSelect (e: Event) {
          e.preventDefault()
        }
      })),
      [
        {
          label: $t('theme.mode.light'),
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onUpdateChecked (checked: boolean) {
            if (checked) {
              colorMode.preference = 'light'
            }
          },
          onSelect (e: Event) {
            e.preventDefault()
          }
        },
        {
          label: $t('theme.mode.dark'),
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onUpdateChecked (checked: boolean) {
            if (checked) {
              colorMode.preference = 'dark'
            }
          },
          onSelect (e: Event) {
            e.preventDefault()
          }
        }
      ]
    ]
  }
])

const miscItems = computed<DropdownMenuItem[]>(() => [
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    to: 'https://github.com/Leoasch/Nuxt-SaaS',
    target: '_blank'
  },
  {
    label: $t('logout'),
    icon: 'i-lucide-log-out',
    onSelect: handleLogout
  }
])

const userItems = computed<DropdownMenuItem[][]>(() => [
  accountItems.value,
  themeGroup.value,
  miscItems.value
])

function getItems () {
  return [
    {
      label: $t('dashboard'),
      icon: 'i-lucide-layout-dashboard',
      to: '/'
    },
    {
      label: $t('my_organizations'),
      icon: 'i-lucide-building-2',
      to: '/organizations'
    },
    {
      label: $t('products'),
      icon: 'i-lucide-package',
      to: '/products'
    },
    {
      label: $t('customers'),
      icon: 'i-lucide-users',
      to: '/customers'
    },
    {
      label: $t('sales'),
      icon: 'i-lucide-shopping-cart',
      to: '/sales'
    },
    {
      label: $t('stock'),
      icon: 'i-lucide-warehouse',
      to: '/stock'
    },
  ] satisfies NavigationMenuItem[]
}

async function handleLogout () {
  await logout()

  await clear()

  await navigateTo('/auth/login')
}
</script>

<template>
  <div class="flex flex-1 size-full">
    <USidebar
      v-model:open="open"
      collapsible="icon"
      rail
      :ui="{
        container: 'h-full',
        inner: 'bg-elevated/25 divide-transparent',
        body: 'py-0'
      }"
    >
      <template #header="{ close }">
        <Logo v-if="open"/>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="ml-auto lg:hidden"
          aria-label="Close sidebar"
          @click="close"
        />
      </template>

      <template #default="{ state }">
        <UNavigationMenu
          :key="state"
          :items="getItems()"
          orientation="vertical"
          :ui="{ link: 'p-1.5 overflow-hidden' }"
        />
      </template>

      <template #footer>
        <UDropdownMenu
          :items="userItems"
          :content="{ align: 'center', collisionPadding: 12 }"
          :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-48' }"
        >
          <UButton
            v-bind="user"
            :label="user?.name"
            trailing-icon="i-lucide-chevrons-up-down"
            color="neutral"
            variant="ghost"
            square
            class="w-full data-[state=open]:bg-elevated overflow-hidden"
            :ui="{
              trailingIcon: 'text-dimmed ms-auto'
            }"
          >
            <template #leading>
              <AvatarFrame
                v-if="sessionUser"
                :text="sessionUser.name"
                :image-url="sessionUser.avatarUrl"
                class="size-5 shrink-0"/>
            </template>
          </UButton>
        </UDropdownMenu>
      </template>
    </USidebar>

    <div class="flex-1 min-w-0 flex flex-col size-full">
      <div class="h-(--ui-header-height) shrink-0 flex items-center px-4 border-b border-default">
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          @click="open = !open"
        />
        <OrganizationSelector class="mr-4 ml-auto w-60"/>
      </div>

      <div class="flex-1 p-4 overflow-auto">
        <slot/>
      </div>
    </div>
  </div>
</template>
