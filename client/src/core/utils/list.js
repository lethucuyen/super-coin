import { addSpaceCamelCase } from "@@/core/utils/string";

export function convertSelectList(target) {
  const result = [];

  for (const k in target) {
    result.push({
      text: addSpaceCamelCase(k),
      value: target[k]
    });
  }

  return result;
}

export function groupByKey(list, key) {
  if (!list) {
    return [];
  }

  return list.reduce(function(r, a) {
    r[a[key]] = r[a[key]] || [];
    r[a[key]].push(a);

    return r;
  }, {});
}

export function groupBy(list, ev) {
  if (!list) {
    return [];
  }

  return list.reduce(function(r, a) {
    const key = ev(a);
    r[key] = r[key] || [];
    r[key].push(a);

    return r;
  }, {});
}
