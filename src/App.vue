<template>
  <div class="top-right-component">
    <ThemeSwitcher />
  </div>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/ffxiv">Extreme Trial Guides</router-link> |
    <router-link to="/static">FFXIV Static Mounts</router-link>
  </nav>
  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

nav {
  padding: 30px;
  text-align: center;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

:root[data-theme="light"] {
  --background-color: #ffffff;
  --text-color: #42b983;
  --primary-color: #4a90e2;
  --secondary-color: #f5f5f5;
  --link-color: #42b983;
  --link-hover-color: #4a90e2;
  --table-header-bg: #f2f2f2;
  --table-header-text: #333333;
  --table-border: #ddd;
}

:root[data-theme="dark"] {
  --background-color: #1a1a1a;
  --text-color: #42b983;
  --primary-color: #64b5f6;
  --secondary-color: #333333;
  --link-color: #64b5f6;
  --link-hover-color: #42b983;
  --table-header-bg: #2d2d2d;
  --table-header-text: #ffffff;
  --table-border: #444;
}

a {
  color: var(--link-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:visited {
  color: var(--link-color);
}

a:hover {
  color: var(--link-hover-color);
}

a:active {
  color: var(--link-color);
}

nav a {
  font-weight: bold;
  color: var(--link-color);
}

nav a.router-link-exact-active {
  color: var(--link-hover-color);
}

table th {
  background-color: var(--table-header-bg);
  color: var(--table-header-text);
  border-color: var(--table-border);
}

table td {
  border-color: var(--table-border);
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

:root {
  --background-color: #ffffff;
  --text-color: #333333;
  --primary-color: #4a90e2;
  --secondary-color: #f5f5f5;
  --link-color: var(--text-color);
  --link-hover-color: var(--primary-color);
}

.top-right-component {
  position: fixed;
  top: 10px; /* Adjust this value for desired distance from top */
  right: 10px; /* Adjust this value for desired distance from right */
  z-index: 1000; /* Ensures it stays on top of other elements */
}

.center {
  text-align: center;
}
</style>

<script setup>
import ThemeSwitcher from "./components/ThemeSwitcher.vue";
</script>
