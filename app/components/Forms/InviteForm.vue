<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { alterMemberRole, inviteMember } from '~/api/organization'
import type { Membership, Role } from '~~/shared/types'
import { hasMinimumRole } from '~~/shared/utils/roles.ts'

const props = defineProps<{
  orgId: string
  currentUserRole: Role
  member?: Membership
}>()

const canInvite = computed(() => hasMinimumRole(props.currentUserRole, 'MANAGER'))

const ROLES: Role[] = ['EMPLOYEE', 'MANAGER', 'ADMIN']

const EMAIL_ERRORS: Record<string, string> = {
  'USER.NOT_FOUND': 'member.invite.user_not_found',
  'MEMBERSHIP.ALREADY_EXISTS': 'errors.MEMBERSHIP.ALREADY_EXISTS'
}

const roleItems = computed<SelectItem[]>(() => ROLES
  .filter(role => hasMinimumRole(props.currentUserRole, role))
  .map(role => ({ label: $t(`role.${role}`), value: role })))

const { errors, resetErrors, handleError, setError } = useFormErrors([
  'email',
  'role',
] as const, 'save')
const { toastApiError } = useApiError()

const loading = ref(false)
const emit = defineEmits(['close'])

const email = ref('')
const role = ref<Role>(props.member?.role ?? 'EMPLOYEE')

async function save () {
  resetErrors()

  loading.value = true
  try {
    if (props.member) {
      await alterMemberRole(props.orgId, { user_id: props.member.user_id, role: role.value })
    } else {
      await inviteMember(props.orgId, { email: email.value.trim(), role: role.value })
    }
    emit('close', true)
  } catch (error: any) {
    handleError(error)

    const emailError = EMAIL_ERRORS[error?.data?.data?.code]
    if (emailError) {
      setError('email', emailError)
    } else if (!errors.email && !errors.role) {
      toastApiError(error, $t('common.save_failed'))
    }
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <UModal
    :title="member ? $t('member.invite.edit_title') : $t('member.invite.title')"
    :ui="{
      content: 'max-w-3xl'
    }"
    :dismissible="false"
  >
    <template #body>
      <div
        v-if="canInvite"
        class="flex flex-col gap-6">
        <UFormField
          v-if="member"
          :label="$t('member.invite.user')">
          <div class="flex h-14.5 w-full min-w-0 items-center gap-3 rounded border border-accented p-2">
            <AvatarFrame
              v-if="member.user"
              :text="member.user.name"
              :image-url="member.user.avatarUrl"
              class="size-10 shrink-0"
            />
            <div class="flex min-w-0 flex-1 flex-col">
              <span class="truncate font-bold">{{ member.user?.name ?? member.user_id }}</span>
              <span
                v-if="member.user?.email"
                class="flex min-w-0 items-center gap-1 text-xs text-dimmed">
                <UIcon
                  name="lucide:mail"
                  class="size-3.5 shrink-0"/>
                <span class="truncate">{{ member.user.email }}</span>
              </span>
            </div>
          </div>
        </UFormField>
        <UFormField
          v-else
          :label="$t('member.invite.email')"
          :help="$t('member.invite.email_help')"
          :error="errors.email">
          <UInput
            v-model="email"
            type="email"
            autocomplete="off"
            icon="lucide:mail"
            :placeholder="$t('member.invite.email_placeholder')"
            class="w-full"
            :ui="{ base: 'h-[58px]' }"
            @keydown.enter="save"
          />
        </UFormField>
        <UFormField
          :label="$t('member.invite.role')"
          :error="errors.role">
          <USelect
            v-model="role"
            :items="roleItems"
            :placeholder="$t('member.invite.role')"
            class="w-full"
            :ui="{ base: 'h-[58px]' }"
          />
        </UFormField>
      </div>
      <p
        v-else
        class="text-sm text-dimmed">
        {{ $t('member.invite.not_allowed') }}
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          v-if="canInvite"
          :loading
          @click="save">
          {{ member ? $t('member.invite.save_role') : $t('member.invite.save') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
