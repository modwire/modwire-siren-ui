export class LabelResolver {
  resolve(identity: string, label: string, message: string): string {
    if (label.trim() !== "") return label;
    if (message.trim() !== "") return message;
    return identity
      .replaceAll(/[-_.]+/g, " ")
      .replaceAll(/\s+/g, " ")
      .trim()
      .replace(/^./, (character) => character.toUpperCase());
  }
}
