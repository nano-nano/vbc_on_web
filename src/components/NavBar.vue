<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-dark bg-dark">
    <span class="navbar-brand mb-0 h1">vbc on Web</span>

    <div class="collapse navbar-collapse">
      <ul class="navbar-nav">
        <li class="nav-item" :class="{ active: props.page == 'Home' }">
          <router-link class="nav-link" to="/" >Home</router-link>
        </li>
        <li class="nav-item" :class="{ active: props.page == 'About' }">
          <router-link class="nav-link" to="/about" >About</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

type Props = {
  page: string;
};

export default defineComponent({
  props: {
    page: {
      type: String,
      default: "Home"
    }
  },
  setup(props: Props) {
    return {
      props
    }
  }
})
</script>