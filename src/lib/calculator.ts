// پارسر و محاسبه‌گر امن عبارات ریاضی — بدون استفاده از eval()

export class CalcError extends Error {}

type TokenType = "number" | "op" | "lparen" | "rparen" | "percent";
interface Token {
  type: TokenType;
  value: string;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const normalized = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");

  while (i < normalized.length) {
    const ch = normalized[i];
    if (ch === " ") {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < normalized.length && /[0-9.]/.test(normalized[i])) {
        num += normalized[i];
        i += 1;
      }
      tokens.push({ type: "number", value: num });
      continue;
    }
    if ("+-*/".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }
    if (ch === "%") {
      tokens.push({ type: "percent", value: ch });
      i += 1;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen", value: ch });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen", value: ch });
      i += 1;
      continue;
    }
    throw new CalcError("مقدار واردشده صحیح نیست.");
  }
  return tokens;
}

class Parser {
  tokens: Token[];
  pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  next(): Token | undefined {
    return this.tokens[this.pos++];
  }

  parseExpression(): number {
    let value = this.parseTerm();
    while (this.peek() && this.peek()!.type === "op" && (this.peek()!.value === "+" || this.peek()!.value === "-")) {
      const op = this.next()!.value;
      const rhs = this.parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  parseTerm(): number {
    let value = this.parseFactor();
    while (this.peek() && this.peek()!.type === "op" && (this.peek()!.value === "*" || this.peek()!.value === "/")) {
      const op = this.next()!.value;
      const rhs = this.parseFactor();
      if (op === "/") {
        if (rhs === 0) throw new CalcError("امکان تقسیم بر صفر وجود ندارد.");
        value = value / rhs;
      } else {
        value = value * rhs;
      }
    }
    return value;
  }

  parseFactor(): number {
    let value = this.parseUnary();
    while (this.peek() && this.peek()!.type === "percent") {
      this.next();
      value = value / 100;
    }
    return value;
  }

  parseUnary(): number {
    if (this.peek() && this.peek()!.type === "op" && this.peek()!.value === "-") {
      this.next();
      return -this.parseUnary();
    }
    if (this.peek() && this.peek()!.type === "op" && this.peek()!.value === "+") {
      this.next();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  parsePrimary(): number {
    const tok = this.peek();
    if (!tok) throw new CalcError("مقدار واردشده صحیح نیست.");

    if (tok.type === "number") {
      this.next();
      const num = Number(tok.value);
      if (isNaN(num)) throw new CalcError("مقدار واردشده صحیح نیست.");
      return num;
    }
    if (tok.type === "lparen") {
      this.next();
      const value = this.parseExpression();
      if (!this.peek() || this.peek()!.type !== "rparen") {
        throw new CalcError("مقدار واردشده صحیح نیست.");
      }
      this.next();
      return value;
    }
    throw new CalcError("مقدار واردشده صحیح نیست.");
  }
}

export function evaluateExpression(expr: string): number {
  if (!expr || !expr.trim()) throw new CalcError("لطفاً مقدار معتبر وارد کنید.");
  const tokens = tokenize(expr);
  if (tokens.length === 0) throw new CalcError("لطفاً مقدار معتبر وارد کنید.");
  const parser = new Parser(tokens);
  const result = parser.parseExpression();
  if (parser.pos !== tokens.length) throw new CalcError("مقدار واردشده صحیح نیست.");
  if (!isFinite(result)) throw new CalcError("این مقدار قابل محاسبه نیست.");
  return result;
}
