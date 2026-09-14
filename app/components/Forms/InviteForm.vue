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

const roleItems = computed<SelectItem[]>(() => ROLES
  .filter(role => hasMinimumRole(props.currentUserRole, role))
  .map(role => ({ label: $t(`role.${role}`), value: role })))

const { errors, resetErrors, handleError } = useFormErrors([
  'user_id',
  'role',
] as const, 'save')

const loading = ref(false)
const emit = defineEmits(['close'])

const user_id = ref<string | null>(props.member?.user_id ?? null)
const role = ref<Role>(props.member?.role ?? 'EMPLOYEE')

async function save () {
  resetErrors()

  if (!user_id.value) {
    return
  }

  loading.value = true
  try {
    if (props.member) {
      await alterMemberRole(props.orgId, { user_id: user_id.value, role: role.value })
    } else {
      await inviteMember(props.orgId, { user_id: user_id.value, role: role.value })
    }
    emit('close', true)
  } catch (error: any) {

    handleError(error)
    if (errors.save) {
      useToast().add({
        description: `${ $t('save.error') }: ${$t(errors.save)}`,
        color: 'error'
      })
    }

  } finally {
    loading.value = false
  }
}

</script>

<template>
  <UModal
    :title="$t('member.invite.title')"
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
          :label="$t('member.invite.user')"
          :error="errors.user_id">
          <UserSelector 
            v-model="user_id"
            :locked="!!member"
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
          @click="save">
          {{ $t('member.invite.save') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
