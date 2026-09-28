package com.auctionhub.util;

/** Escape a Java string as a JavaScript string literal (double-quoted). */
public final class JsString {
  private JsString() {}

  public static String escape(String s) {
    if (s == null) {
      return "\"\"";
    }
    StringBuilder b = new StringBuilder("\"");
    for (int i = 0; i < s.length(); i++) {
      char c = s.charAt(i);
      switch (c) {
        case '\\':
          b.append("\\\\");
          break;
        case '"':
          b.append("\\\"");
          break;
        case '\n':
          b.append("\\n");
          break;
        case '\r':
          b.append("\\r");
          break;
        case '\t':
          b.append("\\t");
          break;
        default:
          b.append(c);
      }
    }
    b.append('"');
    return b.toString();
  }
}
