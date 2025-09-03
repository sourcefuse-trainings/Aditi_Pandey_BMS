// src/logger.ts

export class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private colorize(message: string, color: string): [string, string] {
    const css = `color: ${color}; font-weight: bold;`;
    const plainText = `[${this.getTimestamp()}] ${message}`;
    return [plainText, css];
  }

  public info(message: string): void {
    const [plainText, css] = this.colorize(`INFO: ${message}`, 'deepskyblue');
    console.log(`%c${plainText}`, css);
  }

  public success(message: string): void {
    const [plainText, css] = this.colorize(`SUCCESS: ${message}`, 'mediumseagreen');
    console.log(`%c${plainText}`, css);
  }

  public error(message: string, errorObj?: any): void {
    const errorMessage = errorObj ? `${message} - ${errorObj.message}` : message;
    const [plainText, css] = this.colorize(`ERROR: ${errorMessage}`, 'crimson');
    console.error(`%c${plainText}`, css);
  }
}