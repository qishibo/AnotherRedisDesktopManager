<template>
  <div class="title-bar">
    <div class="drag-region"></div>
    <div class="button" @click="minimizeApp">
      <svg width="20px" height="20px" viewBox="0 0 12 12">
        <path
          opacity="0.5"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2 5.7C2 5.3134 2.35817 5 2.8 5H9.2C9.64183 5 10 5.3134 10 5.7C10 6.0866 9.64183 6.4 9.2 6.4H2.8C2.35817 6.4 2 6.0866 2 5.7Z"
          fill="black"
        />
      </svg>
    </div>
    <div class="button" @click="maximizeApp">
      <svg width="20px" height="20px" viewBox="0 0 12 12">
        <g opacity="0.5">
          <path
            d="M7.90909 3L3 7.90909V4C3 3.44772 3.44772 3 4 3H7.90909Z"
            fill="black"
          />
          <path
            d="M4.09091 9L9 4.09091L9 8C9 8.55228 8.55228 9 8 9L4.09091 9Z"
            fill="black"
          />
        </g>
      </svg>
    </div>
    <div class="button close" @click="closeApp">
      <svg width="20px" height="20px" viewBox="0 0 12 12">
        <path
          opacity="0.5"
          d="M6.70432 5.99957L8.85224 3.85634C8.9463 3.76227 8.99915 3.63467 8.99915 3.50163C8.99915 3.36859 8.9463 3.241 8.85224 3.14692C8.75818 3.05285 8.63061 3 8.49759 3C8.36456 3 8.23699 3.05285 8.14293 3.14692L6 5.29515L3.85707 3.14692C3.76301 3.05285 3.63544 3 3.50241 3C3.36939 3 3.24182 3.05285 3.14776 3.14692C3.0537 3.241 3.00085 3.36859 3.00085 3.50163C3.00085 3.63467 3.0537 3.76227 3.14776 3.85634L5.29568 5.99957L3.14776 8.14281C3.10094 8.18925 3.06378 8.24451 3.03842 8.30538C3.01306 8.36626 3 8.43156 3 8.49752C3 8.56347 3.01306 8.62877 3.03842 8.68965C3.06378 8.75052 3.10094 8.80578 3.14776 8.85222C3.19419 8.89905 3.24944 8.93622 3.31031 8.96158C3.37118 8.98694 3.43647 9 3.50241 9C3.56836 9 3.63365 8.98694 3.69452 8.96158C3.75539 8.93622 3.81063 8.89905 3.85707 8.85222L6 6.70399L8.14293 8.85222C8.18937 8.89905 8.24461 8.93622 8.30548 8.96158C8.36635 8.98694 8.43164 9 8.49759 9C8.56353 9 8.62882 8.98694 8.68969 8.96158C8.75056 8.93622 8.80581 8.89905 8.85224 8.85222C8.89906 8.80578 8.93622 8.75052 8.96158 8.68965C8.98694 8.62877 9 8.56347 9 8.49752C9 8.43156 8.98694 8.36626 8.96158 8.30538C8.93622 8.24451 8.89906 8.18925 8.85224 8.14281L6.70432 5.99957Z"
          fill="black"
        />
      </svg>
    </div>
  </div>
</template>
<script>
import { ipcRenderer } from 'electron';

export default {
  methods: {
    closeApp() {
      ipcRenderer.send('closeApp');
    },
    minimizeApp() {
      ipcRenderer.send('minimizeWindow');
    },
    maximizeApp() {
      ipcRenderer.send('toggleMaximize');
    },
  },
};
</script>
<style type="text/css">
.title-bar {
  display: flex;
  -webkit-user-select: none;
}

.title-bar div.drag-region {
  -webkit-app-region: drag;
  width: 100%;
}

.title-bar div.button {
  cursor: default;
  width: 50px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  -webkit-app-region: no-drag;
  transition: background-color linear 200ms;
}

.title-bar div.button:hover {
  background-color: #e9e9e9;
}

.title-bar div.button:active {
  background-color: #eaedf3;
}

.dark-mode .title-bar div.button:hover {
  background-color: #505456;
}

.dark-mode .title-bar div.button:active {
  background-color: #4d4d50;
}

.title-bar div.button.close {
  width: 55px;
}

.title-bar div.button.close:hover {
  background-color: #e81123;
}

.title-bar div.button.close:active {
  background-color: #9b0b17;
}

.dark-mode .title-bar svg path {
  fill: #e9e9e9;
}
</style>
