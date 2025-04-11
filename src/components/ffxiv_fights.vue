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
  mounted() {
    document.title = "Extreme Trial Guides";
  },
};
</script>

<template>
  <select v-model="selectedTrial">
    <option value="stormblood">Stormblood</option>
    <option value="endwalker">Endwalker</option>
    <option value="dawntrail">Dawntrail</option>
  </select>
  <p />
  <div class="center">
    <table>
      <thead>
        <tr>
          <th>Fight Name/Image</th>
          <th>Boss Name</th>
          <th>Guide Links (YT / Raidplan / etc)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(trial, index) in selectedTrialData.extreme" :key="index">
          <td>
            {{ trial.fightName }}<br />
            <a :href="trial.wikiLink" target="_blank">
              <img
                :src="trial.imgPath"
                alt="{{ trial.fightName }}"
                style="width: 376px"
              />
            </a>
          </td>
          <td>{{ trial.bossName }}</td>

          <td>
            <ul class="left-aligned-list">
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
  </div>
</template>

<style scoped>
.center {
  display: flex;
  align-content: center;
  justify-content: center;
}
.left-aligned-list {
  margin: 0; /* Remove default margin */
  padding: 0; /* Remove default padding */
  list-style-position: inside; /* Align bullets with the text */
}
</style>
