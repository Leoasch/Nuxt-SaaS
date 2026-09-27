<template>
  <div class="flex size-full bg-default">
    <div class="relative hidden flex-1 overflow-hidden bg-neutral-800 lg:block">
      <img
        src="/images/auth-showcase.webp"
        alt=""
        width="1920"
        height="1440"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 size-full object-cover object-[25%_50%]">
      <div class="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-black/60 to-transparent"/>
      <div class="relative max-w-md p-12">
        <h2 class="text-3xl font-bold text-white">{{ $t('auth.showcase.title') }}</h2>
        <p class="mt-3 text-white/70">{{ $t('auth.showcase.subtitle') }}</p>
      </div>
    </div>

    <div class="relative flex size-full flex-col items-center bg-default p-4 lg:w-xl lg:shrink-0">
      <LanguageMenu class="absolute top-4 right-4"/>
      <Logo class="mt-10"/>
      <div class="size-full flex">
        <slot/>
      </div>
    </div>
  </div>
</template>
