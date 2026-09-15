<script lang="ts" setup>
import type { User } from '#auth-utils'
import { getUser, searchUsers } from '~/api/users'

defineProps<{
  locked?: boolean
}>()

const DEBOUNCE_MS = 300

const search_query = ref('')
const user_id = defineModel<string | null>({ default: null })
const emit = defineEmits<{ select: [user: User | null] }>()

const searchedUsers = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const loading = ref(false)
const open = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

watch(user_id, async (value) => {
  if (!value) {
    selectedUser.value = null
    return
  }

  if (selectedUser.value?.id === value) {
    return
  }

  loading.value = true
  try {
    const result = await getUser(value)
    selectedUser.value = result.user
  } finally {
    loading.value = false
  }
}, { immediate: true })

async function search () {
  const currentRequest = ++requestId
  loading.value = true

  try {
    const result = await searchUsers(search_query.value)

    if (currentRequest === requestId) {
      searchedUsers.value = result.users
    }
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
    }
  }
}

watch(search_query, (value) => {
  clearTimeout(debounceTimer)

  if (!value.trim()) {
    searchedUsers.value = []
    loading.value = false
    return
  }

  debounceTimer = setTimeout(search, DEBOUNCE_MS)
})

function select (user: User) {
  user_id.value = user.id
  selectedUser.value = user
  search_query.value = ''
  searchedUsers.value = []
  open.value = false
  emit('select', user)
}

function clearSelection () {
  user_id.value = null
  selectedUser.value = null
  emit('select', null)
}

onUnmounted(() => clearTimeout(debounceTimer))
</script>

<template>
  <div class="relative">
    <div
      class="flex h-14.5 w-full min-w-0 items-center gap-3 rounded border border-accented p-2 focus-within:ring-2 focus-within:ring-primary/50">
      <AvatarFrame
        v-if="selectedUser"
        :text="selectedUser.name"
        :image-url="selectedUser.avatarUrl"
        class="size-10"
      />
      <div
        v-else
        class="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-accented/50 text-dimmed">
        <UIcon
          :name="loading ? 'lucide:loader-circle' : 'lucide:search'"
          class="size-4"
          :class="loading ? 'animate-spin' : ''"
        />
      </div>

      <div
        v-if="selectedUser"
        class="flex min-w-0 flex-1 flex-col">
        <span class="truncate font-bold">{{ selectedUser.name }}</span>
        <span class="flex min-w-0 items-center gap-1 text-xs text-dimmed">
          <UIcon
            name="lucide:mail"
            class="size-3.5 shrink-0"/>
          <span class="truncate">{{ selectedUser.email }}</span>
        </span>
      </div>
      <input
        v-else
        v-model="search_query"
        autocomplete="off"
        type="text"
        class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-dimmed"
        :placeholder="$t('user.select.placeholder')"
        @focus="open = true"
        @blur="open = false"
      >

      <UButton
        v-if="selectedUser && !locked"
        icon="lucide:x"
        color="neutral"
        variant="ghost"
        size="sm"
        class="shrink-0 cursor-pointer"
        :aria-label="$t('user.selector.clear')"
        @click="clearSelection"
      />
    </div>

    <div
      v-if="open && !selectedUser && search_query.trim()"
      class="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border border-accented bg-default shadow-lg">
      <button
        v-for="user in searchedUsers"
        :key="user.id"
        type="button"
        class="flex w-full min-w-0 cursor-pointer items-center gap-0.5 p-2 text-left hover:bg-accented/40"
        @mousedown.prevent="select(user)">
        <AvatarFrame
          :text="user.name"
          :image-url="user.avatarUrl"
          class="size-10 shrink-0"
        />
        <div class="ml-3 flex min-w-0 flex-col">
          <span class="truncate font-bold">{{ user.name }}</span>
          <span class="flex min-w-0 items-center gap-1 text-xs text-dimmed">
            <UIcon
              name="lucide:mail"
              class="size-3.5 shrink-0"/>
            <span class="truncate">{{ user.email }}</span>
          </span>
        </div>
      </button>

      <p
        v-if="!loading && searchedUsers.length === 0"
        class="p-2 text-sm text-dimmed">
        {{ $t('user.search.empty') }}
      </p>
    </div>
  </div>
</template>
