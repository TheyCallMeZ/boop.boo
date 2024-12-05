<script>
import friday_call_links from "@/assets/data/friday-call-links.json";

export default {
  data() {
    return {
      selectedOption: "buy",
      dataFiles: {
        files: friday_call_links.stls,
        buy: friday_call_links.buy_links,
      },
    };
  },
  computed: {
    selectedLinks: function () {
      return this.dataFiles[this.selectedOption];
    },
  },
};
</script>

<template>
  Here Be Links for things brought up at ye olde Friday Calls
  <br /><br />
  <select v-model="selectedOption">
    <option value="files">STL Files</option>
    <option value="buy">Buy Links</option>
  </select>

  <table cellpadding="10" cellspacing="5">
    <thead>
      <tr>
        <th>What is it?</th>
        <th>Link</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(link, index) in selectedLinks" :key="index">
        <td>{{ link.text }}</td>
        <td>
          <a :href="link.url">{{ link.link_text }}</a>
        </td>
        <td>{{ link.description }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
