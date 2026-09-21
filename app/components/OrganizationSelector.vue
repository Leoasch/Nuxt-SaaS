<script lang="ts" setup>
import { searchOrganizations } from '~/api/organization'
import { ROLE_STYLES } from '~/common'
import type { Organization } from '~~/shared/types'

const DEBOUNCE_MS = 300

const { selectedOrganization, selectedOrganizationId } = useOrganization()

const search_query = ref('')
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

const searchedOrganizations = ref<Organization[]>([])
const loading = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

async function search () {
  const currentRequest = ++requestId
  loading.value = true

  try {
    const result = await searchOrganizations(search_query.value)

    if (currentRequest === requestId) {
      searchedOrganizations.value = result.organizations
    }
  } catch {
    if (currentRequest === requestId) {
      searchedOrganizations.value = []
    }
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
    }
  }
}

watch(search_query, () => {
  clearTimeout(debounceTimer)

  if (open.value) {
    debounceTimer = setTimeout(search, DEBOUNCE_MS)
  }
})

function select (organization: Organization) {
  selectedOrganization.value = organization
  selectedOrganizationId.value = organization.id
  close()
}

function close () {
  clearTimeout(debounceTimer)
  open.value = false
  search_query.value = ''
}

function toggleOpen () {
  if (open.value) {
    close()
    return
  }

  open.value = true
  search()
  nextTick(() => searchInput.value?.focus())
}

function onClickOutside (event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => {
  clearTimeout(debounceTimer)
  document.removeEventListener('mousedown', onClickOutside)
})
</script>

<template>
  <div
    ref="root"
    class="relative">
    <button
      type="button"
      class="flex h-11 w-full min-w-0 cursor-pointer items-center gap-2 rounded border border-accented px-2 text-left focus-within:ring-2 focus-within:ring-primary/50"
      @click="toggleOpen">
      <NameInitialsImage
        v-if="selectedOrganization"
        :name="selectedOrganization.name"
        class="size-7 shrink-0"
      />
      <div
        v-else
        class="flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed border-accented/50 text-dimmed">
        <UIcon
          name="lucide:search"
          class="size-3.5"
        />
      </div>

      <span
        v-if="selectedOrganization"
        class="min-w-0 flex-1 truncate text-sm font-bold">{{ selectedOrganization.name }}</span>
      <span
        v-else
        class="min-w-0 flex-1 truncate text-sm text-dimmed">{{ $t('organization.select.placeholder') }}</span>

      <UIcon
        name="lucide:chevron-down"
        class="size-4 shrink-0 text-dimmed transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <div
      v-if="open"
      class="absolute z-10 mt-1 w-full overflow-hidden rounded border border-accented bg-default shadow-lg">
      <div class="flex items-center gap-2 border-b border-accented p-2">
        <input
          ref="searchInput"
          v-model="search_query"
          type="text"
          autocomplete="off"
          class="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-dimmed"
          :placeholder="$t('organization.select.placeholder')"
        >
        <UIcon
          v-if="loading"
          name="lucide:loader-circle"
          class="size-4 shrink-0 animate-spin text-dimmed"
        />
      </div>
      <div class="max-h-60 overflow-y-auto">
        <button
          v-for="organization in searchedOrganizations"
          :key="organization.id"
          type="button"
          class="flex w-full min-w-0 cursor-pointer items-center gap-2 p-2 text-left hover:bg-accented/40"
          @click="select(organization)">
          <NameInitialsImage
            :name="organization.name"
            class="size-8 shrink-0"
          />
          <div class="ml-1 flex min-w-0 flex-col">
            <span class="truncate text-sm font-bold">{{ organization.name }}</span>
            <UBadge
              :color="ROLE_STYLES[organization.role].color"
              :icon="ROLE_STYLES[organization.role].icon"
              variant="subtle"
              class="shrink-0 mr-auto">
              {{ $t(ROLE_STYLES[organization.role].label) }}
            </UBadge>
          </div>
        </button>

        <p
          v-if="!loading && searchedOrganizations.length === 0"
          class="p-2 text-sm text-dimmed">
          {{ $t('organization.search.empty') }}
        </p>
      </div>
    </div>
  </div>
</template>
