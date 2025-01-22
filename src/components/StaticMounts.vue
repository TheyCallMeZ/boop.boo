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
          <td class="left">{{ player.player }}</td>
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
import aenaenon from "@/assets/data/static/Aenaenon_Falconrider_found_mounts.json";
import adrinne from "@/assets/data/static/Adri__39_nne_Wyntesol_found_mounts.json";
import rurumei from "@/assets/data/static/Rurumei_Wyntesol_found_mounts.json";
import zhoesaph from "@/assets/data/static/Zhoesaph_Edeline_found_mounts.json";
import minerva from "@/assets/data/static/Miss_Minerva_found_mounts.json";
import anthra from "@/assets/data/static/Anthra_Aetherium_found_mounts.json";
import carbear from "@/assets/data/static/Carbear_Dragonheart_found_mounts.json";
import rixia from "@/assets/data/static/Rixia_Koha_found_mounts.json";

// Import all other files similarly

export default {
  data() {
    return {
      selectedExpansion: "Dawntrail",
      dataFiles: {
        etrigan: { data: etrigan, player: "Etrigan Elric" },
        aenaenon: { data: aenaenon, player: "Aenaenon Falconrider" },
        adrinne: { data: adrinne, player: "Adri'nne Wyntesol" },
        rurumei: { data: rurumei, player: "Rurumei Wyntesol" },
        zhoesaph: { data: zhoesaph, player: "Zhoesaph Edeline" },
        minerva: { data: minerva, player: "Miss Minerva" },
        anthra: { data: anthra, player: "Anthra Aetherium" },
        claire: { data: carbear, player: "Carbear Dragonheart" },
        rixia: { data: rixia, player: "Rixia Koha" },
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
  padding: 8px;
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
}
</style>
