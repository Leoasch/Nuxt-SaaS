<template>
  <UContainer class="size-full flex flex-col gap-4">
    <PageSection :title="$t('theme')">
      <ThemeSelector class="p-4"/>
    </PageSection>
    <PageSection :title="$t('security')">
      <div class="p-4">
        <h1 class="text-2xl font-bold mb-1">{{ $t('security.password') }}</h1>
        <PasswordChanger class="p-2"/>
      </div>
      <div class="p-4">
        <h1 class="text-2xl font-bold mb-1">{{ $t('security.account') }}</h1>
        <div class="p-2">
          <AccountDelete/>
        </div>
      </div>
    </PageSection>
  </UContainer>
</template>
