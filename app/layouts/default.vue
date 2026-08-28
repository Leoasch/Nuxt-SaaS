<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)
const colorMode = useColorMode()
const { clear } = useUserSession()
const { user: sessionUser } = useUserSession()
const user = ref({
  name: sessionUser.value?.name,
})

const userItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user'
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      to: '/settings'
    }
  ],
  [
    {
      label: 'Appearance',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Light',
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
          label: 'Dark',
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
    }
  ],
  [
    {
      label: 'GitHub',
      icon: 'i-simple-icons-github',
      to: 'https://github.com/Leoasch/Nuxt-SaaS',
      target: '_blank'
    },
    {
      label: 'Log out',
      icon: 'i-lucide-log-out',
      onSelect: logout
    }
  ]
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

async function logout () {
  await $fetch('/api/auth/logout', {
    method: 'POST',
  })

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
              <NameInitialsImage
                v-if="user.name"
                :name="user.name"
                :limit="1"
                class="size-5 max-w-full"/>
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
