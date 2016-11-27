export class Handle {
  name: string;
  type: string;
  // TODO make type an enum
  // TODO subtype, e.g. active/vintage/inactive
  // TODO priority

  static comparator(a: Handle, b: Handle) {
    // TODO use comparators npm module
    let nameA = a.name.toUpperCase();
    let nameB = b.name.toUpperCase();
    if (nameA === nameB) {
      if (a.type === b.type) {
        return 0;
      }
      return a.type < b.type ? -1 : 1;
    }
    return nameA < nameB ? -1 : 1;
  }
}
