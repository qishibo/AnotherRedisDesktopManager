<template>
  <div @contextmenu.prevent.stop="show($event)">
      <slot name="default"></slot>

      <div class="qii404-vue-right-menu" :class="themeClass" ref="menu">
        <ul>
          <li v-for="item of items" @click.stop="clickItem($event, item)">{{ item.name }}</li>
        </ul>
      </div>
  </div>
</template>

<script type="text/javascript">
export default {
  data() {
    return {
      themes: { light: 'light', dark: 'dark' },
      triggerEvent: null,
    };
  },
  props: ['items', 'clickValue', 'theme'],
  computed: {
    themeClass() {
      const themeClass = this.themes[this.theme];
      return themeClass || 'light';
    },
  },
  methods: {
    show($event) {
      this.triggerEvent = $event;
      this.showMenus($event.clientX, $event.clientY);
      document.addEventListener('click', this.removeMenus);
    },
    clickItem($event, item) {
      if (item.click) {
        item.click(this.clickValue, this.triggerEvent, $event);
      }

      this.removeMenus();
      this.triggerEvent = null;
    },
    removeMenus() {
      document.removeEventListener('click', this.removeMenus);
      this.hideAllMenus();
    },
    showMenus(x, y) {
      this.hideAllMenus();

      const { menu } = this.$refs;

      menu.style.left = `${x}px`;
      menu.style.top = `${y - 5}px`;
      menu.style.display = 'block';
    },
    hideAllMenus() {
      const menus = document.querySelectorAll('.qii404-vue-right-menu');

      if (menus.length === 0) {
        return;
      }

      for (const menu of menus) {
        menu.style.display = 'none';
      }
    },
  },
};
</script>

<style type="text/css">
  .qii404-vue-right-menu {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    padding: 5px 0px;
    z-index: 99999;
  }
  .qii404-vue-right-menu.light {
    border: 1px solid lightgrey;
    background: #fafafa;
  }
  .qii404-vue-right-menu.dark {
    border: 1px solid lightgrey;
    background: #263238;
  }

  .qii404-vue-right-menu ul {
    list-style: none;
    padding: 0px;
  }

  .qii404-vue-right-menu ul li {
    font-size: 90%;
    padding: 3px 10px;
    cursor: pointer;
  }
  .qii404-vue-right-menu.light ul li {
    color: #263238;
  }
  .qii404-vue-right-menu.dark ul li {
    color: #fff;
  }

  .qii404-vue-right-menu.light ul li:hover {
    background: #e4e2e2;
  }
  .qii404-vue-right-menu.dark ul li:hover {
    background: #344A4E;
  }
</style>
