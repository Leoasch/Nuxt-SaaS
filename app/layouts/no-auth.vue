<template>
  <div
    class="flex size-full bg-cover bg-center bg-no-repeat"
    :style="{
      backgroundImage: `url('/images/auth-background.png')`,
    }">
    <div
      class="hidden flex-1 md:block"
    />

    <div class="relative size-full flex flex-col items-center bg-default/80 backdrop-blur-md lg:w-200 p-4">
      <LanguageMenu class="absolute top-4 right-4"/>
      <Logo class="mt-10"/>
      <div class="size-full flex">
        <slot/>
      </div>
    </div>
  </div>
</template>