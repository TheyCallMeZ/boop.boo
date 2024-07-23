<script>
import stormblood from "@/assets/data/stormblood-extreme-fights.json";
import endwalker from "@/assets/data/endwalker-extreme-fights.json";
import dawntrail from "@/assets/data/dawntrail-extreme-fights.json";
export default {
  data() {
    return {
      selectedTrial: "dawntrail",
      dataFiles: {
        stormblood: stormblood,
        endwalker: endwalker,
        dawntrail: dawntrail,
      },
    };
  },
  computed: {
    selectedTrialData: function () {
      return this.dataFiles[this.selectedTrial];
    },
  },
};
</script>

<template>
  <select v-model="selectedTrial">
    <option value="stormblood">Stormblood</option>
    <option value="endwalker">Endwalker</option>
    <option value="dawntrail">Dawntrail</option>
  </select>
  <table>
    <thead>
      <tr>
        <th>Fight Name/Image</th>
        <th>Boss Name</th>
        <th>YouTube Guides</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(trial, index) in selectedTrialData.extreme" :key="index">
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
