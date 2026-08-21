<script setup lang="ts">
import { editOrganization, postOrganization } from '~/api/organization'
import type { Organization } from '~~/shared/types'

const props = defineProps<{
  organization?: Organization
}>()

const { errors, resetErrors, handleError } = useFormErrors(['name', 'document'] as const, 'save')
const { loadOrganizations } = useOrganization()

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
      emit('close')
    }    
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
    :title="$t(`organization.title.${type}`)"
    :ui="{
      content: 'max-w-3xl'
    }">
    <template #body>
      <div class="grid grid-cols-5 gap-6">
        <UFormField
          :label="$t('organization.name')"
          :error="errors.name"
          class="col-span-3">
          <UInput
            v-model="form.name"
            :placeholder="$t('organization.name')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
        <UFormField
          :label="$t('organization.document')"
          :error="errors.document"
          class="col-span-2">
          <UInput
            v-model="form.document"
            :placeholder="$t('organization.document')"
            class="w-full"
            :ui="{
              base: 'py-2 px-4'
            }"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton @click="save">
          {{ $t(`organization.save.${type}`) }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>