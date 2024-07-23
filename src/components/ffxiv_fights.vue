<script setup>
import trials from "@/assets/data/endwalker-extreme-fights.json";
console.log(trials);
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Fight Name/Image</th>
        <th>Boss Name</th>
        <th>YouTube Guides</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(trial, index) in trials.extreme" :key="index">
        <td>
          {{ trial.fightName }}<br />
          <img :src="trial.imgPath" alt="{{ trial.fightName }}" />
        </td>
        <td>{{ trial.bossName }}</td>

        <td>
          <ul>
            <li
              v-for="(link, linkIndex) in trial.youTubeLinks"
              :key="linkIndex"
            >
              <a :href="link.url">{{ link.name }}</a>
            </li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
