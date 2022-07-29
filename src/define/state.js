const state = {
  setState(name, value, callback) {
    const oldValue = this[name];
    const dataChange = { name, value, oldValue };
    switch (typeof value) {
      case "object":
        if (value && oldValue) {
          if (callback && value.length && value.length !== oldValue.length) {
            callback(dataChange);
          }
        } else if (value && !oldValue && callback) {
          callback(dataChange);
        }
        break;
      case "function":
        if (value && oldValue) {
          if (callback && value.name !== oldValue.name) callback(dataChange);
        } else if (value && !oldValue && callback) {
          callback(dataChange);
        }
        break;
      case "number":
      case "string":
      case "undefined":
      case "bigint":
      case "boolean":
      case "symbol":
      default:
        if (callback && oldValue !== value) callback(dataChange);
        break;
    }
    this[name] = value;
  },
};

export default state;
