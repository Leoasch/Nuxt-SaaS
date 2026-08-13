<template>
  <div
    class="flex size-full bg-cover bg-center bg-no-repeat"
    :style="{
      backgroundImage: `url('/images/auth-background.png')`,
    }">
    <div
      class="hidden flex-1 md:block"
    />

    <div class="size-full flex flex-col items-center bg-default/80 backdrop-blur-md lg:w-200 p-4">
      <Logo class="mt-10"/>
      <div class="size-full flex items-center pb-60">
        <slot/>
      </div>
    </div>
  </div>
</template>