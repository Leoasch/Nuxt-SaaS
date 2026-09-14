<script lang="ts" setup>
import { ROLE_STYLES } from '~/common'
import type { Organization } from '~~/shared/types'

const { organizations, selectedOrganizationId } = useOrganization()

const search_query = ref('')
const open = ref(false)

const selectedOrganization = computed(() => {
  const organization = organizations.value.find(org => org.id === selectedOrganizationId.value)
  return organization?.is_member ? organization : null
})

const selectableOrganizations = computed(() => organizations.value.filter(org => org.is_member))

const displayedOrganizations = computed(() => {
  const query = search_query.value.trim().toLowerCase()
  if (!query) {
    return selectableOrganizations.value
  }
  return selectableOrganizations.value.filter(org => org.name.toLowerCase().includes(query))
})

function select (organization: Organization) {
  selectedOrganizationId.value = organization.id
  search_query.value = ''
  open.value = false
}

function clearSelection () {
  selectedOrganizationId.value = null
}
</script>

<template>
  <div class="relative">
    <div
      class="flex h-11 w-full min-w-0 items-center gap-2 rounded border border-accented px-2 focus-within:ring-2 focus-within:ring-primary/50">
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
      <input
        v-else
        v-model="search_query"
        type="text"
        class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-dimmed"
        :placeholder="$t('organization.select.placeholder')"
        @focus="open = true"
        @blur="open = false"
      >

      <UButton
        v-if="selectedOrganization"
        icon="lucide:x"
        color="neutral"
        variant="ghost"
        size="xs"
        class="shrink-0 cursor-pointer"
        :aria-label="$t('organization.selector.clear')"
        @click="clearSelection"
      />
    </div>

    <div
      v-if="open && !selectedOrganization"
      class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border border-accented bg-default shadow-lg">
      <button
        v-for="organization in displayedOrganizations"
        :key="organization.id"
        type="button"
        class="flex w-full min-w-0 cursor-pointer items-center gap-2 p-2 text-left hover:bg-accented/40"
        @mousedown.prevent="select(organization)">
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
        v-if="displayedOrganizations.length === 0"
        class="p-2 text-sm text-dimmed">
        {{ $t('organization.search.empty') }}
      </p>
    </div>
  </div>
</template>
