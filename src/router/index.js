import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
  {
    path: "/github",
    name: "My GitHub page",
    beforeEnter() {
      window.location.href = "https://github.com/TheyCallMeZ";
    },
  },
  {
    path: "/ct",
    name: "Chaos Theory Discord",
    beforeEnter() {
      window.location.href = "https://discord.gg/neezmXmvU8";
    },
  },
  {
    path: "/bma",
    name: "Blue Mages Anonymous Discord",
    beforeEnter() {
      window.location.href = "https://discord.gg/K36EMh67SH";
    },
  },
  {
    path: "/ffxiv",
    name: "Final Fantasy XIV Extreme Links",
    component: () => import("@/components/ffxiv_fights.vue"),
  },
  {
    path: "/friday",
    name: "Friday Call Links",
    component: () => import("@/components/FridayCallLinks.vue"),
  },
  {
    path: "/static",
    name: "FFXIV Static Mount Checklist",
    component: () => import("@/components/StaticMounts.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
