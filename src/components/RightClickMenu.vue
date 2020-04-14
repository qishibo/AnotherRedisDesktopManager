<template>
  <div @contextmenu.prevent.stop="show($event)">
    <!-- default slot -->
    <slot name="default"></slot>
    <!-- right menu -->
    <div class="qii404-vue-right-menu" ref="menu">
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
      triggerEvent: null,
    };
  },
  props: ['items', 'clickValue'],
  methods: {
    show($event) {
      this.triggerEvent = $event;
      this.showMenus($event.clientX, $event.clientY);
      document.addEventListener("click",this.removeMenus);
    },
    showMenus(x, y) {
      this.hideAllMenus();

      const menu = this.$refs.menu;

      menu.style.left = x + 'px';
      menu.style.top = (y - 5) + 'px';
      menu.style.display = 'block';
    },
    clickItem($event, item) {
      if (item.click) {
        item.click(this.clickValue, this.triggerEvent, $event);
      }

      this.removeMenus();
      this.triggerEvent = null;
    },
    removeMenus() {
      document.removeEventListener("click",this.removeMenus);
      this.hideAllMenus();
    },
    hideAllMenus() {
      let menus = document.querySelectorAll('.qii404-vue-right-menu');

      if (menus.length === 0) {
        return;
      }

      for (const menu of menus) {
        menu.style.display='none';
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
    padding: 0px;
    z-index: 99999;
    overflow: hidden;
    border-radius: 3px;
    border: 2px solid lightgrey;
    background: #fafafa;
  }
  .dark-mode .qii404-vue-right-menu {
    background: #263238;
  }

  .qii404-vue-right-menu ul {
    list-style: none;
    padding: 0px;
  }
  .qii404-vue-right-menu ul li:not(:last-child) {
    border-bottom: 1px solid lightgrey;
  }

  .qii404-vue-right-menu ul li {
    font-size: 13.4px;
    padding: 6px 10px;
    cursor: pointer;
    color: #263238;
  }
  .dark-mode .qii404-vue-right-menu ul li {
    color: #fff;
  }

  .qii404-vue-right-menu ul li:hover {
    background: #e4e2e2;
  }
  .dark-mode .qii404-vue-right-menu ul li:hover {
    background: #344A4E;
  }
</style>
