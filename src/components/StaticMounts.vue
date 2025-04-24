<template>
  <div>
    <select v-model="selectedExpansion">
      <option value="Heavensward">Heavensward</option>
      <option value="Stormblood">Stormblood</option>
      <option value="Endwalker">Endwalker</option>
      <option value="Dawntrail">Dawntrail</option>
    </select>

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
        <tr v-for="player in dataFiles" :key="player.name">
          <td class="nopadding">
            <img
              :src="`/ffxiv/job-icons/${player.job}.png`"
              width="35px"
              :alt="player.job"
            />
          </td>
          <td class="left">
            <a :href="player.profileUrl" target="_blank"
              >{{ player.player }}@{{ player.homeWorld }}</a
            >
          </td>
          <td v-for="header in headers" :key="header">
            <!-- Check if the player's content includes the current header and display a checkmark if it does -->
            <span
              v-if="
                player.data.some(
                  (item) =>
                    (item.Content === header) &
                    (item.Expansion === selectedExpansion)
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
</template>

<script>
import etrigan from "@/assets/data/static/Etrigan_Elric_found_mounts.json";
import adrinne from "@/assets/data/static/Adri__39_nne_Wyntesol_found_mounts.json";
import rurumei from "@/assets/data/static/Rurumei_Wyntesol_found_mounts.json";
import zhoesaph from "@/assets/data/static/Zhoesaph_Edeline_found_mounts.json";
import basileus from "@/assets/data/static/Basileus_Sloth_found_mounts.json";
import aerosa from "@/assets/data/static/Aerosa_Auditore_found_mounts.json";
import galdia from "@/assets/data/static/Galdia_Everfallen_found_mounts.json";
import ismaie from "@/assets/data/static/Ismaie_Veiled_found_mounts.json";

// Import all other files similarly

export default {
  data() {
    return {
      selectedExpansion: "Dawntrail",
      dataFiles: {
        etrigan: {
          data: etrigan.Mounts,
          player: etrigan.name,
          job: etrigan.job,
          homeWorld: etrigan.homeWorld,
          profileUrl: etrigan.ProfileUrl,
        },
        adrinne: {
          data: adrinne.Mounts,
          player: adrinne.name,
          job: adrinne.job,
          homeWorld: adrinne.homeWorld,
          profileUrl: adrinne.ProfileUrl,
        },
        rurumei: {
          data: rurumei.Mounts,
          player: rurumei.name,
          job: rurumei.job,
          homeWorld: rurumei.homeWorld,
          profileUrl: rurumei.ProfileUrl,
        },
        zhoesaph: {
          data: zhoesaph.Mounts,
          player: zhoesaph.name,
          job: zhoesaph.job,
          homeWorld: zhoesaph.homeWorld,
          profileUrl: zhoesaph.ProfileUrl,
        },
        basileus: {
          data: basileus.Mounts,
          player: basileus.name,
          job: basileus.job,
          homeWorld: basileus.homeWorld,
          profileUrl: basileus.ProfileUrl,
        },
        aerosa: {
          data: aerosa.Mounts,
          player: aerosa.name,
          job: aerosa.job,
          homeWorld: aerosa.homeWorld,
          profileUrl: aerosa.ProfileUrl,
        },
        galdia: {
          data: galdia.Mounts,
          player: galdia.name,
          job: galdia.job,
          homeWorld: galdia.homeWorld,
          profileUrl: galdia.ProfileUrl,
        },
        ismaie: {
          data: ismaie.Mounts,
          player: ismaie.name,
          job: ismaie.job,
          homeWorld: ismaie.homeWorld,
          profileUrl: ismaie.ProfileUrl,
        },
      },
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
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
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

.left {
  text-align: left;
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
</style>
