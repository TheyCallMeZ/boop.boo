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
            <img :src="`/ffxiv/job-icons/${player.job}.png`" width="35px" />
          </td>
          <td class="left">
            {{ player.player }}
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
              class="emoji"
              >✔️</span
            >
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
import minerva from "@/assets/data/static/Miss_Minerva_found_mounts.json";
import anthra from "@/assets/data/static/Anthra_Aetherium_found_mounts.json";
import carbear from "@/assets/data/static/Carbear_Dragonheart_found_mounts.json";
import rixia from "@/assets/data/static/Rixia_Koha_found_mounts.json";
import aerosa from "@/assets/data/static/Aerosa_Auditore_found_mounts.json";
import galdia from "@/assets/data/static/Galdia_Everfallen_found_mounts.json";
import ismaie from "@/assets/data/static/Ismaie_Veiled_found_mounts.json";

// Import all other files similarly

export default {
  data() {
    return {
      selectedExpansion: "Dawntrail",
      dataFiles: {
        etrigan: { data: etrigan, player: "Etrigan Elric", job: "RedMage" },
        adrinne: { data: adrinne, player: "Adri'nne Wyntesol", job: "Sage" },
        rurumei: {
          data: rurumei,
          player: "Rurumei Wyntesol",
          job: "Machinist",
        },
        zhoesaph: { data: zhoesaph, player: "Zhoesaph Edeline", job: "Monk" },
        minerva: { data: minerva, player: "Miss Minerva", job: "WhiteMage" },
        anthra: { data: anthra, player: "Anthra Aetherium", job: "Paladin" },
        carbear: { data: carbear, player: "Carbear Dragonheart", job: "Viper" },
        rixia: { data: rixia, player: "Rixia Koha", job: "DarkKnight" },
        aerosa: { data: aerosa, player: "Aerosa Auditore", job: "Warrior" },
        galdia: { data: galdia, player: "Galdia Everfallen", job: "Warrior" },
        ismaie: { data: ismaie, player: "Ismaie Veiled", job: "WhiteMage" },
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
</style>
