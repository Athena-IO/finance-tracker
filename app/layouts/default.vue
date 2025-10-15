<template>
  <div class="container mx-auto max-w-4xl">
    <AppHeader />

    <main class="my-10">
      <slot />
    </main>
  </div>
</template>

<script setup>
// Link to Google Fonts

useHead({
  link: [
    {
      rel: "preconnect",

      href: "https://fonts.googleapis.com",
    },

    {
      rel: "stylesheet",

      href: "https://fonts.googleapis.com/css2?family=Inter&display=swap",

      crossorigin: "",
    },
  ],
});
</script>

<style>
@reference "tailwindcss";
/* Set the font family for the entire site */

body {
  font-family: "Inter";
}
body {
  @apply bg-white dark:bg-gray-900 text-gray-900 dark:text-white;
}

/* Set the background color for the entire site */
</style>
