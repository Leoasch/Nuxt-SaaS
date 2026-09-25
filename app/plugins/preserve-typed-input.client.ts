type TextField = HTMLInputElement | HTMLTextAreaElement

const TEXT_INPUT_TYPES = new Set(['text', 'email', 'password', 'search', 'tel', 'url', 'number'])

function isTextField (target: EventTarget | null): target is TextField {
  return target instanceof HTMLTextAreaElement
    || (target instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(target.type))
}

export default defineNuxtPlugin({
  name: 'preserve-typed-input',
  enforce: 'pre',
  setup (nuxtApp) {
    if (!nuxtApp.isHydrating) {
      return
    }

    const typed = new Map<TextField, string>()

    for (const field of document.querySelectorAll('input, textarea')) {
      if (isTextField(field) && field.value !== field.defaultValue) {
        typed.set(field, field.value)
      }
    }

    const capture = (event: Event) => {
      if (isTextField(event.target)) {
        typed.set(event.target, event.target.value)
      }
    }

    document.addEventListener('input', capture, true)

    nuxtApp.hooks.hookOnce('app:suspense:resolve', async () => {
      document.removeEventListener('input', capture, true)
      await nextTick()

      for (const [field, value] of typed) {
        if (field.isConnected && field.value !== value) {
          field.value = value
          field.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }
    })
  }
})
