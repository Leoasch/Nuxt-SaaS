<script setup lang="ts">
import { deleteAvatar, editUser, getUser, uploadAvatar } from '~/api/users'
import type { User } from '~~/shared/types'


const route = useRoute()
const user_id = route.params.id as string
const user = ref<User | null>(null)
const loading = ref<boolean>(false)
const saving = ref<boolean>(false)
const { user: sessionUser, fetch: refreshSession } = useUserSession()
const canEdit = computed(() => user.value?.id === sessionUser.value?.id)
const isEditing = ref(false)

const userForm = ref({
  name: '',
  email: ''
})

const pendingAvatarFile = ref<File | null>(null)
const avatarCleared = ref(false)

async function loadUser () {
  loading.value = true
  try {
    if (user_id) {
      const result = await getUser(user_id)
      if (result.user) {
        user.value = result.user
      }
    }
  } finally {
    loading.value = false
  }
}

function onAvatarSelect (file: File) {
  pendingAvatarFile.value = file
  avatarCleared.value = false
}

function onAvatarClear () {
  pendingAvatarFile.value = null
  avatarCleared.value = true
}

async function handleSave () {
  if (!user.value) {
    return
  }

  saving.value = true
  try {
    const result = await editUser(user.value.id, userForm.value)
    user.value = result.user

    if (pendingAvatarFile.value) {
      const avatarResult = await uploadAvatar(user.value.id, pendingAvatarFile.value)
      user.value.avatarUrl = avatarResult.avatarUrl
    } else if (avatarCleared.value) {
      await deleteAvatar(user.value.id)
      user.value.avatarUrl = null
    }

    pendingAvatarFile.value = null
    avatarCleared.value = false

    if (canEdit.value) {
      await refreshSession()
    }

    isEditing.value = false
  } finally {
    saving.value = false
  }
}

watch(() => isEditing.value, () => {
  userForm.value.name = user.value?.name ?? ''
  userForm.value.email = user.value?.email ?? ''
  pendingAvatarFile.value = null
  avatarCleared.value = false
})

onMounted(() => {
  loadUser()
})

</script>

<template>
  <UContainer class="size-full flex flex-col">
    <div class="w-full bg-accented/20 p-2 rounded flex flex-col md:flex-row items-center relative">
      <template v-if="user">
        <AvatarInput
          :text="user.name"
          :image="user.avatarUrl ?? undefined"
          :can-edit="canEdit && isEditing"
          class="size-25 min-w-25 min-h-25"
          @select="onAvatarSelect"
          @clear="onAvatarClear"/>
        <div class="flex flex-col p-4 h-full">
          <template v-if="!isEditing">
            <h1 class="font-bold text-xl">{{ user.name }}</h1>
            <h1 class="text-dimmed">{{ user.email }}</h1>
          </template>
          <template v-else>
            <div class="border-b border-accented flex mb-2">
              <input
                v-model="userForm.name"
                class="font-bold text-xl w-full outline-0">
              <UIcon 
                name="lucide:pencil"
                class="opacity-70"
              />
            </div>
            <div class="border-b border-accented flex">
              <input
                v-model="userForm.email"
                class="w-full outline-0">
              <UIcon 
                name="lucide:pencil"
                class="opacity-70"
              />
            </div>
          </template>
        </div>
        <UButton
          v-if="canEdit"
          icon="lucide:edit"
          variant="ghost"
          :disabled="saving"
          class="cursor-pointer absolute top-2 right-2"
          color="neutral"
          @click="isEditing = !isEditing"
        />
        <UButton
          v-if="canEdit && isEditing"
          icon="lucide:save"
          :loading="saving"
          :disabled="saving"
          class="cursor-pointer absolute bottom-2 right-2"
          color="success"
          @click="handleSave"
        >{{ $t('save') }}</UButton>
      </template>
    </div>
  </UContainer>
</template>