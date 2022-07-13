const state = {
  setSate: function (name, value, callback) {
    const oldValue = this[name];
    const dataChange = { name, value, oldValue };
    switch (typeof value) {
      case "object":
        if (value && oldValue) {
          if (value.length !== oldValue.length) callback(dataChange);
        } else {
          callback(dataChange);
        }
        break;
      case "function":
        if (value && oldValue) {
          if (oldValue.name !== value.name) callback(dataChange);
        } else {
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
        if (oldValue !== value) callback(dataChange);
        break;
    }
    this[name] = value;
  },
};

export default state;
