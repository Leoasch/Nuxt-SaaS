<script setup lang="ts">
import { editOrganization, postOrganization } from '~/api/organization'
import type { Organization } from '~~/shared/types'

const props = defineProps<{
  organization?: Organization
}>()

const { errors, resetErrors, handleError } = useFormErrors(['name', 'document'] as const, 'save')
const { toastApiError } = useApiError()
const { loadOrganizations } = useOrganization()

const iconInputUi = { base: 'py-2 ps-10 pe-4', leading: 'ps-3' }

const type = computed(() => props.organization ? 'edit' : 'create')
const loading = ref(false)
const emit = defineEmits(['close'])

const form = ref({
  id: props.organization?.id,
  document: props.organization?.document ?? '',
  name: props.organization?.name ?? '',
})

async function save () {
  resetErrors()
  loading.value = true
  try {
    const body = nullifyEmpty(form.value)

    let result
    if (body.id) {
      result = await editOrganization(body)
    } else {
      result = await postOrganization(body)
    }
    if (result.organization) {
      await loadOrganizations()
      emit('close', true)
    }    
  } catch (error: any) {
    handleError(error)
    toastApiError(error, $t('common.save_failed'))
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <UModal
    :title="$t(`organization.title.${type}`)"
    :ui="{
      content: 'max-w-3xl'
    }"
    :dismissible="false"
  >
    <template #body>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <UFormField
          :label="$t('organization.name')"
          :error="errors.name"
          class="sm:col-span-3">
          <UInput
            v-model="form.name"
            icon="lucide:building-2"
            :placeholder="$t('organization.name')"
            class="w-full"
            :ui="iconInputUi"
          />
        </UFormField>
        <UFormField
          :label="$t('organization.document')"
          :error="errors.document"
          class="sm:col-span-2">
          <UInput
            v-model="form.document"
            icon="lucide:id-card"
            :placeholder="$t('organization.document')"
            class="w-full"
            :ui="iconInputUi"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          :loading
          @click="save">
          {{ $t(`organization.save.${type}`) }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>