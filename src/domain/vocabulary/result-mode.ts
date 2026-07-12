export class ResultMode {
  static readonly replace = "replace";
  static readonly refresh = "refresh";
  static readonly navigate = "navigate";
  static readonly monitor = "monitor";
  static readonly none = "none";
  static readonly values = Object.freeze([
    ResultMode.replace,
    ResultMode.refresh,
    ResultMode.navigate,
    ResultMode.monitor,
    ResultMode.none,
  ]);
}
