export default {
  data: {},
  get(name) {
    if (this.data[name]) {
      return this.data[name];
    }

    return null;
  },
  set(name, value) {
    this.data[name] = value;
  },
};
