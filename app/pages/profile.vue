<script setup lang="ts">
import { deleteAvatar, editUser, getUser, uploadAvatar } from '~/api/users'
import type { User } from '~~/shared/types'

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

const { errors, resetErrors, handleError, setError } = useFormErrors(['name', 'email'] as const, 'save')
const { toastApiError } = useApiError()

async function loadUser () {
  loading.value = true
  try {
    const result = await getUser()
    if (result.user) {
      user.value = result.user
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

  resetErrors()
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
  } catch (error: any) {
    handleError(error)

    if (error?.data?.data?.code === 'USER.EMAIL_TAKEN') {
      setError('email', 'errors.USER.EMAIL_TAKEN')
    } else if (!errors.name && !errors.email) {
      toastApiError(error, $t('common.save_failed'))
    }
  } finally {
    saving.value = false
  }
}

watch(() => isEditing.value, () => {
  resetErrors()
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
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-dimmed">{{ user.email }}</h1>
              <ULink
                v-if="user.emailVerified === false"
                to="/settings">
                <UBadge
                  color="warning"
                  variant="subtle"
                  size="sm"
                  icon="lucide:mail-warning">
                  {{ $t('email_verification.not_verified') }}
                </UBadge>
              </ULink>
            </div>
          </template>
          <template v-else>
            <div class="border-b border-accented flex">
              <input
                v-model="userForm.name"
                :aria-label="$t('profile.name')"
                :placeholder="$t('profile.name')"
                class="font-bold text-xl w-full outline-0">
              <UIcon
                name="lucide:pencil"
                class="opacity-70"
              />
            </div>
            <p
              v-if="errors.name"
              class="text-sm text-error">{{ errors.name }}</p>
            <div class="border-b border-accented flex mt-2">
              <input
                v-model="userForm.email"
                :aria-label="$t('profile.email')"
                :placeholder="$t('profile.email')"
                class="w-full outline-0">
              <UIcon
                name="lucide:pencil"
                class="opacity-70"
              />
            </div>
            <p
              v-if="errors.email"
              class="text-sm text-error">{{ errors.email }}</p>
          </template>
        </div>
        <UButton
          v-if="canEdit"
          icon="lucide:edit"
          variant="ghost"
          :aria-label="$t('profile.edit')"
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
        >{{ $t('common.save') }}</UButton>
      </template>
    </div>
  </UContainer>
</template>