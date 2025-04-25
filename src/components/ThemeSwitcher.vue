<template>
  <button @click="toggleTheme" class="theme-switcher">
    {{ currentTheme === "dark" ? "☀️" : "🌙" }}
  </button>
</template>

<script>
import { ref, onMounted } from "vue";
import { Theme, getInitialTheme, setTheme } from "../utils/themeUtils";

export default {
  name: "ThemeSwitcher",
  setup() {
    const currentTheme = ref(Theme.LIGHT);

    const toggleTheme = () => {
      currentTheme.value =
        currentTheme.value === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      setTheme(currentTheme.value);
    };

    onMounted(() => {
      currentTheme.value = getInitialTheme();
      setTheme(currentTheme.value);
    });

    return {
      currentTheme,
      toggleTheme,
    };
  },
};
</script>

<style>
.theme-switcher {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.5rem;
}
</style>
