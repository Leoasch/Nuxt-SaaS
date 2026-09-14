<script setup lang="ts">
import { getOrganizationInvites } from '~/api/organization'
import type { Membership } from '~~/shared/types'
import WidgetBox from './WidgetBox.vue'
import InviteNotification from '../Notifications/InviteNotification.vue'


const invites = ref<Membership[]>([])
const loading = ref<boolean>(false)

async function loadInvites () {
  loading.value = true
  try {
    const result = await getOrganizationInvites()
    if (result.invites) {
      invites.value = result.invites
    }
  } finally {
    loading.value = false
  }
}

onMounted( async () => {
  await loadInvites()
})

</script>

<template>
  <WidgetBox class="p-2">
    <div class="size-full flex flex-col gap-1 overflow-auto p-1">
      <div class="flex justify-end">
        <UButton
          icon="lucide:refresh-cw"
          color="neutral"
          variant="ghost"
          class="cursor-pointer"
          :ui="{
            leadingIcon: 'hover:rotate-90 transition-transform duration-300'
          }"
          @click="loadInvites"
        />
      </div>
      <USeparator/>
      <Loadable
        :loading
        class="size-full flex flex-col"
      >
        <template v-if="invites.length">
          <InviteNotification 
            v-for="(invite, idx) in invites" 
            :key="idx"
            :invite
            class="hover:scale-101 transition-transform duration-200"
            @remove="invites.splice(idx, 1)"
          />
        </template>
        <template v-else>
          <span class="text-dimmed w-full text-center">{{ $t('notifications_none') }}</span>
        </template>
      </Loadable>
    </div>
  </WidgetBox>
</template>