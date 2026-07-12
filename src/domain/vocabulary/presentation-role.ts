export class PresentationRole {
  static readonly detail = "detail";
  static readonly summary = "summary";
  static readonly collection = "collection";
  static readonly dashboard = "dashboard";
  static readonly document = "document";
  static readonly tree = "tree";
  static readonly form = "form";
  static readonly values = Object.freeze([
    PresentationRole.detail,
    PresentationRole.summary,
    PresentationRole.collection,
    PresentationRole.dashboard,
    PresentationRole.document,
    PresentationRole.tree,
    PresentationRole.form,
  ]);
}
