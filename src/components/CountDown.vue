<script>
export default {
  data() {
    return {
      events: [
        {
          name: "Fly Like an Eagle",
          date: "2025-09-11T06:15:00",
        },
        {
          name: "Wheels Down",
          date: "2025-09-11T11:45:00",
        },
        {
          name: "Flight of Shame",
          date: "2025-09-15T13:15:00",
        },
        {
          name: "The Long Haul",
          date: "2025-09-25T06:00:00",
        },
      ],
      now: new Date(),
      timer: null,
    };
  },
  computed: {
    eventCountdowns() {
      return this.events.map((event) => {
        const target = new Date(event.date);
        const diff = target - this.now;

        if (diff <= 0) {
          return { ...event, timeUntil: "Event has passed" };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return {
          ...event,
          timeUntil: `${days}d ${hours}h ${minutes}m ${seconds}s`,
        };
      });
    },
  },
  mounted() {
    this.timer = setInterval(() => {
      this.now = new Date();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
};
</script>

<template>
  <div>
    <h2>Anxiety Timers</h2>
    <table cellpadding="10" cellspacing="5">
      <thead>
        <tr>
          <th>Event</th>
          <th>Date</th>
          <th>Time Until</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(event, index) in eventCountdowns" :key="index">
          <td>{{ event.name }}</td>
          <td>{{ new Date(event.date).toLocaleString() }}</td>
          <td>{{ event.timeUntil }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ccc;
  padding: 8px;
}
</style>
