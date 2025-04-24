<template>
  <div>
    <div class="center">
      <select v-model="selectedExpansion">
        <option value="Heavensward">Heavensward</option>
        <option value="Stormblood">Stormblood</option>
        <option value="Shadowbringers">Shadowbringers</option>
        <option value="Endwalker">Endwalker</option>
        <option value="Dawntrail">Dawntrail</option>
      </select>
    </div>
    <table>
      <thead>
        <tr>
          <th class="nopadding"></th>
          <th>Player</th>
          <th class="center">EX1</th>
          <th class="center">EX2</th>
          <th class="center">EX3</th>
          <th class="center">EX4</th>
          <th class="center">EX5</th>
          <th class="center">EX6</th>
          <th class="center">EX7</th>
          <th class="center">Savage 1</th>
          <th class="center">Savage 2</th>
          <th class="center">Savage 3</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in dataFiles" :key="player?.player">
          <td class="nopadding">
            <img
              :src="`/ffxiv/job-icons/${player.job}.png`"
              width="35px"
              :alt="player.job"
            />
          </td>
          <td class="left">
            <a :href="player.profileUrl" target="_blank"
              >{{ player.player }}@{{ player.homeWorld
              }}{{ player.status === "pt" ? "*" : "" }}
            </a>
          </td>
          <td v-for="header in headers" :key="header">
            <!-- Check if the player's content includes the current header and display a checkmark if it does -->
            <span
              v-if="
                player.data.some(
                  (item) =>
                    item.Content === header &&
                    item.Expansion === selectedExpansion
                )
              "
              ><img
                class="smol"
                src="/ffxiv/choco_thumbs_up.webp"
                alt="Wark Wark!"
              />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <span class="left"> * = Substitute Member </span>
</template>

<script>
import { getDataFiles } from "@/utils/staticLoader";

export default {
  data() {
    return {
      selectedExpansion: "Dawntrail",
      dataFiles: getDataFiles(),
      headers: [
        "EX1",
        "EX2",
        "EX3",
        "EX4",
        "EX5",
        "EX6",
        "EX7",
        "Savage 1",
        "Savage 2",
        "Savage 3",
      ],
      images: {
        choco_thumbs_up: "./ffxiv/choco_thumbs_up.webp",
      },
    };
  },
  computed: {
    filteredData() {
      return Object.values(this.dataFiles).flatMap((file) =>
        file.data
          .filter((record) => record.expansion === this.selectedExpansion)
          .map((record) => ({
            player: file.player,
            content: record.Content || [],
          }))
      );
    },
  },
  mounted() {
    document.title = "Blue Mages Anonymous Static Member Mounts";
  },
  // created() {
  //   //This is used for debugging issues with dynamically loading the data
  //   try {
  //     this.dataFiles = getDataFiles();
  //     console.log("Loaded data files:", this.dataFiles);
  //   } catch (error) {
  //     console.error("Error loading data files:", error);
  //   }
  // },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

th,
td {
  border: 1px solid #ddd;
  padding: 5px;
  vertical-align: middle;
}

th {
  background-color: #f2f2f2;
  text-align: left;
}

.center {
  text-align: center;
}

.left,
td.left,
td.left span,
td.left a {
  text-align: left !important;
  vertical-align: middle;
}

.emoji {
  filter: hue-rotate(175deg) saturate(7);
}

.nopadding {
  padding: 0;
}

a {
  color: black;
  text-decoration: none;
}

a:visited {
  color: black;
}

a:hover {
  color: black;
}

a:active {
  color: black;
}

.smol {
  width: 35px;
}
td > * {
  text-align: left !important;
}
</style>
